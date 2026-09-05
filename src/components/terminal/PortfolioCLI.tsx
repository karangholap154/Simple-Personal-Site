import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Volume2, VolumeX } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

import {
  loadVFS,
  loadTheme,
  saveTheme,
  resolvePath,
  getNodeAtPath,
  formatLsOutput,
  executeMkdir,
  executeTouch,
  executeRm,
  executeCat,
  executeWriteFile,
  getSSHBanner,
  generateTopData,
  executePing,
  executeDf,
  executeFree,
  executeNetstat,
  VFSNode,
} from "@/utils/virtualOS";
import {
  loadSoundSetting,
  saveSoundSetting,
  playKeySound,
} from "@/utils/audioUtils";
import {
  xtermThemeMap,
  helpList,
  availableCommands,
  readmeOutput,
  resumeTextOutput,
  shortcutsOutput,
  commandsInfo,
  evaluateMath,
  getTimezoneOutput,
  formatTreeOutput,
} from "./cliConstants";

export interface PortfolioCLIProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMinimizeChange?: (minimized: boolean) => void;
}

type SendState =
  | "idle"
  | "awaiting_name"
  | "awaiting_email"
  | "awaiting_subject"
  | "awaiting_message"
  | "submitting";

type AuthState = "idle" | "awaiting_email" | "awaiting_password" | "authenticating";

export const PortfolioCLI = ({
  open,
  onOpenChange,
  onMinimizeChange,
}: PortfolioCLIProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  // State
  const [vfs, setVfs] = useState<VFSNode>(loadVFS);
  const [currentDir, setCurrentDir] = useState<string>("/home/karan");
  const [sshSession, setSshSession] = useState<{
    isConnected: boolean;
    host: string;
    user: string;
  } | null>(null);
  const [activeView, setActiveView] = useState<"terminal" | "top">("terminal");
  const [themeName, setThemeName] = useState<string>(loadTheme);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundSetting);

  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("portfolio_cli_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendForm, setSendForm] = useState({ name: "", email: "", subject: "", message: "" });

  const [authState, setAuthState] = useState<AuthState>("idle");
  const [authEmail, setAuthEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const currentThemeObj = xtermThemeMap[themeName] || xtermThemeMap.default;

  // Single unified state ref for xterm event callbacks
  const stateRef = useRef({
    currentDir,
    vfs,
    sshSession,
    currentUser,
    soundEnabled,
    sendState,
    sendForm,
    authState,
    authEmail,
    activeView,
    commandHistory,
    themeName,
  });

  stateRef.current = {
    currentDir,
    vfs,
    sshSession,
    currentUser,
    soundEnabled,
    sendState,
    sendForm,
    authState,
    authEmail,
    activeView,
    commandHistory,
    themeName,
  };

  // Prompt generator
  const getPromptString = useCallback(() => {
    const s = stateRef.current;
    if (s.sendState === "awaiting_name") return "\x1b[36mStep 1/4 (Your Name):\x1b[0m ";
    if (s.sendState === "awaiting_email") return "\x1b[36mStep 2/4 (Your Email):\x1b[0m ";
    if (s.sendState === "awaiting_subject") return "\x1b[36mStep 3/4 (Subject):\x1b[0m ";
    if (s.sendState === "awaiting_message") return "\x1b[36mStep 4/4 (Message):\x1b[0m ";
    if (s.authState === "awaiting_email") return "\x1b[36mEnter Admin Email:\x1b[0m ";
    if (s.authState === "awaiting_password") return "\x1b[36mEnter Password:\x1b[0m ";

    const userStr = s.sshSession
      ? `\x1b[1;32m${s.sshSession.user}@${s.sshSession.host}\x1b[0m`
      : s.currentUser
      ? `\x1b[1;31madmin@karan\x1b[0m`
      : `\x1b[1;32mdev@karan\x1b[0m`;
    const symbol = s.sshSession?.user === "root" || s.currentUser ? "#" : "$";
    return `${userStr}:\x1b[1;34m${s.currentDir}\x1b[0m${symbol} `;
  }, []);

  const writePrompt = useCallback(() => {
    if (!xtermRef.current) return;
    xtermRef.current.write(`\r\n${getPromptString()}`);
  }, [getPromptString]);

  // Sync command history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("portfolio_cli_history", JSON.stringify(commandHistory.slice(-50)));
    } catch {
      // ignore quota error
    }
  }, [commandHistory]);

  // Supabase auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Top screen refresh interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeView === "top" && open && xtermRef.current) {
      let currentTick = 0;
      timer = setInterval(() => {
        currentTick += 1;
        const topData = generateTopData(currentTick);
        const term = xtermRef.current;
        if (!term) return;

        term.write("\x1b[H\x1b[2J");
        term.writeln(`\x1b[1;33mtop - ${topData.uptimeStr}\x1b[0m  \x1b[1;32m● LIVE\x1b[0m (Press 'q' or Esc to exit)`);
        term.writeln(`Tasks: \x1b[1m${topData.tasksCount}\x1b[0m total, \x1b[32m${topData.runningCount}\x1b[0m running, \x1b[90m${topData.sleepingCount}\x1b[0m sleeping`);
        term.writeln(`%Cpu(s): \x1b[1;36m${topData.cpuVal}%\x1b[0m us, 2.1% sy | MiB Mem: \x1b[1;35m${topData.memVal}%\x1b[0m used`);
        term.writeln(`Load Avg: \x1b[33m${topData.loadAvg}\x1b[0m`);
        term.writeln("");
        term.writeln("\x1b[7m  PID  USER     PR  NI  VIRT   RES   %CPU  %MEM  TIME+    COMMAND                \x1b[0m");

        topData.processes.forEach((proc) => {
          const pid = String(proc.pid).padStart(5);
          const user = proc.user.padEnd(8);
          const pr = proc.pr.padStart(3);
          const ni = String(proc.ni).padStart(3);
          const virt = proc.virt.padStart(6);
          const res = proc.res.padStart(6);
          const cpu = proc.cpu.toFixed(1).padStart(5);
          const mem = proc.mem.toFixed(1).padStart(5);
          const time = proc.time.padStart(8);
          term.writeln(`${pid} ${user} ${pr} ${ni} ${virt} ${res} \x1b[33m${cpu}\x1b[0m \x1b[35m${mem}\x1b[0m ${time} \x1b[1m${proc.command}\x1b[0m`);
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeView, open]);

  const triggerResumeDownload = async () => {
    if (!xtermRef.current) return;
    xtermRef.current.writeln("\r\n  \x1b[36m📥 Preparing resume download...\x1b[0m");
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "resume_pdf_url")
        .maybeSingle();
      const url = data?.value || "/resume.pdf";
      const a = document.createElement("a");
      a.href = url;
      a.download = "Karan_Gholap_Resume.pdf";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      xtermRef.current.writeln("  \x1b[32m🟢 Download started successfully!\x1b[0m");
    } catch {
      window.open("/resume.pdf", "_blank");
    }
  };

  const handleOpenOrCd = (targetStr: string, isCd: boolean) => {
    const term = xtermRef.current;
    if (!term) return;
    const target = targetStr.trim().replace(/^\/+|\/+$/g, "");
    const lowerTarget = target.toLowerCase();

    const routes: Record<string, string> = {
      home: "/",
      index: "/",
      projects: "/projects",
      resume: "/resume",
      contact: "/contact",
      gallery: "/gallery",
      "private-academy": "/private-academy",
      academy: "/private-academy",
      support: "/support",
      admin: "/admin",
    };

    const externalLinks: Record<string, string> = {
      github: "https://github.com/karangholap154",
      linkedin: "https://linkedin.com/in/karangholap",
      twitter: "https://x.com/TheKaranGholap",
      x: "https://x.com/TheKaranGholap",
      instagram: "https://instagram.com/thekarangholap",
      medium: "https://medium.com/@karan_gholap",
      email: "mailto:karangholap@zohomail.in",
      mail: "mailto:karangholap@zohomail.in",
    };

    if (routes[lowerTarget]) {
      navigate(routes[lowerTarget]);
      term.writeln(`\r\n  \x1b[32mNavigated web page to ${routes[lowerTarget]}\x1b[0m`);
      return;
    }

    if (externalLinks[lowerTarget]) {
      window.open(externalLinks[lowerTarget], "_blank", "noopener,noreferrer");
      term.writeln(`\r\n  \x1b[36mOpening external link: ${externalLinks[lowerTarget]}\x1b[0m`);
      return;
    }

    if (target.startsWith("http://") || target.startsWith("https://")) {
      window.open(target, "_blank", "noopener,noreferrer");
      term.writeln(`\r\n  \x1b[36mOpening URL: ${target}\x1b[0m`);
      return;
    }

    if (isCd) {
      const newPath = resolvePath(stateRef.current.currentDir, targetStr);
      const outputLines = formatLsOutput(stateRef.current.vfs, stateRef.current.currentDir, targetStr);
      if (outputLines.length > 0 && outputLines[0].includes("No such file")) {
        playKeySound("bell", stateRef.current.soundEnabled);
        term.writeln(`\r\n  \x1b[31mcd: ${targetStr}: No such file or directory\x1b[0m`);
      } else {
        setCurrentDir(newPath);
      }
      return;
    }

    playKeySound("bell", stateRef.current.soundEnabled);
    term.writeln(`\r\n  \x1b[31mError: target '${targetStr}' not found. Type 'ls' or 'help' to see valid targets.\x1b[0m`);
  };

  const handleCommand = async (cmd: string) => {
    const term = xtermRef.current;
    if (!term) return;
    const trimmedInput = cmd.trim();
    const s = stateRef.current;

    if (s.activeView === "top") {
      if (trimmedInput.toLowerCase() === "q" || trimmedInput.toLowerCase() === "exit") {
        setActiveView("terminal");
        term.write("\x1b[H\x1b[2J");
      }
      return;
    }

    // Wizard Step 1
    if (s.sendState === "awaiting_name") {
      if (!trimmedInput) return;
      setSendForm((prev) => ({ ...prev, name: trimmedInput }));
      term.writeln("\r\n  \x1b[36mStep 2/4: Enter your email address:\x1b[0m");
      setSendState("awaiting_email");
      return;
    }

    // Wizard Step 2
    if (s.sendState === "awaiting_email") {
      if (!trimmedInput) return;
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
      if (!isEmailValid) {
        playKeySound("bell", s.soundEnabled);
        term.writeln("\r\n  \x1b[31m🔴 Invalid email format. Please enter a valid email address (e.g. alex@example.com):\x1b[0m");
        return;
      }
      setSendForm((prev) => ({ ...prev, email: trimmedInput }));
      term.writeln("\r\n  \x1b[36mStep 3/4: Subject / Topic?\x1b[0m");
      setSendState("awaiting_subject");
      return;
    }

    // Wizard Step 3
    if (s.sendState === "awaiting_subject") {
      if (!trimmedInput) return;
      setSendForm((prev) => ({ ...prev, subject: trimmedInput }));
      term.writeln("\r\n  \x1b[36mStep 4/4: Type your message body:\x1b[0m");
      setSendState("awaiting_message");
      return;
    }

    // Wizard Step 4
    if (s.sendState === "awaiting_message") {
      if (!trimmedInput) return;
      const finalPayload = { ...s.sendForm, message: trimmedInput };
      term.writeln("\r\n  Connecting to database & delivering message...");
      setSendState("submitting");

      try {
        const { error } = await supabase.from("contact_messages").insert([
          { name: finalPayload.name, email: finalPayload.email, subject: finalPayload.subject, message: finalPayload.message },
        ]);
        if (error) throw error;
        term.writeln("  \x1b[32m🟢 Message Sent Successfully!\x1b[0m");
        term.writeln(`  Thank you, ${finalPayload.name}! Your message has been delivered.`);
        term.writeln(`  Karan will review it and get back to you at ${finalPayload.email}.`);
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Error sending message: ${msg}\x1b[0m`);
      } finally {
        setSendState("idle");
        setSendForm({ name: "", email: "", subject: "", message: "" });
      }
      return;
    }

    // Auth Step 1
    if (s.authState === "awaiting_email") {
      if (!trimmedInput) return;
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
      if (!isEmailValid) {
        playKeySound("bell", s.soundEnabled);
        term.writeln("\r\n  \x1b[31m🔴 Invalid email format. Please enter a valid admin email:\x1b[0m");
        return;
      }
      setAuthEmail(trimmedInput);
      term.writeln("\r\n  \x1b[36mEnter Password:\x1b[0m");
      setAuthState("awaiting_password");
      return;
    }

    // Auth Step 2
    if (s.authState === "awaiting_password") {
      const emailToAuthenticate = s.authEmail;
      term.writeln(`\r\n  Connecting to Supabase auth as \x1b[1;36m${emailToAuthenticate}\x1b[0m...`);
      setAuthState("authenticating");
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailToAuthenticate,
          password: trimmedInput,
        });
        if (error) throw error;
        term.writeln("  \x1b[32m🟢 Authentication Successful!\x1b[0m");
        term.writeln(`  Welcome, admin (${emailToAuthenticate}). You are now logged in.`);
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const errorMsg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Access Denied: ${errorMsg}\x1b[0m`);
      } finally {
        setAuthState("idle");
        setAuthEmail("");
      }
      return;
    }

    const trimmedCmd = trimmedInput.toLowerCase();
    if (!trimmedCmd) return;

    setCommandHistory((prev) => [...prev, trimmedInput]);

    // Audio Commands
    if (trimmedCmd === "sound" || trimmedCmd === "sound status") {
      term.writeln(`\r\n  🔊 Retro Mechanical Audio Feedback: \x1b[1m${s.soundEnabled ? "ENABLED (ON)" : "DISABLED (OFF)"}\x1b[0m`);
      term.writeln("  Usage: sound on | sound off | sound toggle");
      return;
    }

    if (trimmedCmd === "sound on") {
      setSoundEnabled(true);
      saveSoundSetting(true);
      playKeySound("enter", true);
      term.writeln("\r\n  \x1b[32m🔊 Retro Mechanical Audio Feedback ENABLED!\x1b[0m");
      return;
    }

    if (trimmedCmd === "sound off") {
      setSoundEnabled(false);
      saveSoundSetting(false);
      term.writeln("\r\n  \x1b[90m🔇 Retro Mechanical Audio Feedback MUTED.\x1b[0m");
      return;
    }

    if (trimmedCmd === "sound toggle") {
      const nextState = !s.soundEnabled;
      setSoundEnabled(nextState);
      saveSoundSetting(nextState);
      if (nextState) playKeySound("enter", true);
      term.writeln(`\r\n  \x1b[36m🔊 Audio Feedback toggled ${nextState ? "ON" : "OFF"}.\x1b[0m`);
      return;
    }

    // SSH Execution
    if (trimmedCmd.startsWith("ssh ")) {
      const targetStr = trimmedInput.slice(4).trim();
      let user = "guest";
      let host = targetStr;

      if (targetStr.includes("@")) {
        const parts = targetStr.split("@");
        user = parts[0] || "guest";
        host = parts[1] || "karan-server";
      }

      setSshSession({ isConnected: true, host, user });
      const bannerLines = getSSHBanner(host, user);
      bannerLines.forEach((line) => term.writeln(line));
      return;
    }

    // Exit / Logout Handler
    if (trimmedCmd === "exit" || trimmedCmd === "logout") {
      if (s.sshSession) {
        term.writeln(`\r\n  Connection to ${s.sshSession.host} closed by remote host.`);
        term.writeln("  Returned to local terminal session.");
        setSshSession(null);
        return;
      }

      if (s.currentUser) {
        term.writeln("\r\n  Signing out from admin session...");
        try {
          await supabase.auth.signOut();
          setCurrentUser(null);
          term.writeln("  \x1b[32m🟢 Admin session ended. Logged out successfully.\x1b[0m");
        } catch (err: unknown) {
          playKeySound("bell", s.soundEnabled);
          const errorMsg = err instanceof Error ? err.message : String(err);
          term.writeln(`  \x1b[31m🔴 Error logging out: ${errorMsg}\x1b[0m`);
        }
        return;
      }

      term.writeln("\r\n  No active SSH or admin session to log out from.");
      return;
    }

    // Process Monitor
    if (trimmedCmd === "top" || trimmedCmd === "htop") {
      setActiveView("top");
      return;
    }

    // Network & Diagnostics
    if (trimmedCmd.startsWith("ping ")) {
      const host = trimmedInput.slice(5).trim();
      executePing(host).forEach((line) => term.writeln(line));
      return;
    }

    if (trimmedCmd === "df" || trimmedCmd === "df -h") {
      executeDf().forEach((line) => term.writeln(line));
      return;
    }

    if (trimmedCmd === "free" || trimmedCmd === "free -m") {
      executeFree().forEach((line) => term.writeln(line));
      return;
    }

    if (trimmedCmd === "netstat" || trimmedCmd === "netstat -tuln") {
      executeNetstat().forEach((line) => term.writeln(line));
      return;
    }

    // Themes
    if (trimmedCmd.startsWith("theme")) {
      const sub = trimmedCmd.slice(5).trim();
      if (!sub || sub === "list") {
        term.writeln("\r\n  \x1b[1m🎨 AVAILABLE TERMINAL THEMES:\x1b[0m");
        term.writeln("    • \x1b[36mdefault\x1b[0m   - Dark sleek theme");
        term.writeln("    • \x1b[32mmatrix\x1b[0m    - Classic green matrix glow");
        term.writeln("    • \x1b[35mdracula\x1b[0m   - Vibrant purple Dracula palette");
        term.writeln("    • \x1b[33mcyberpunk\x1b[0m - High contrast cyan & neon yellow");
        term.writeln("    • \x1b[31mubuntu\x1b[0m    - Classic Ubuntu terminal aubergine");
        term.writeln("\r\n  Usage: theme set [name] (e.g. theme set dracula)");
        return;
      }

      if (sub.startsWith("set ")) {
        const tName = sub.slice(4).trim().toLowerCase();
        if (xtermThemeMap[tName] && xtermRef.current) {
          setThemeName(tName);
          saveTheme(tName);
          const xTheme = xtermThemeMap[tName] || xtermThemeMap.default;
          xtermRef.current.options.theme = xTheme;
          term.writeln(`\r\n  \x1b[32m🎨 Theme switched to '${tName}'!\x1b[0m`);
        } else {
          playKeySound("bell", s.soundEnabled);
          term.writeln(`\r\n  \x1b[31mError: Theme '${tName}' not found. Type 'theme' to view options.\x1b[0m`);
        }
        return;
      }
    }

    // VFS Commands
    if (trimmedCmd === "pwd") {
      term.writeln(`\r\n  ${s.currentDir}`);
      return;
    }

    if (trimmedCmd === "ls" || trimmedCmd.startsWith("ls ")) {
      const args = trimmedCmd.split(/\s+/).slice(1);
      let showAll = false;
      let showLong = false;
      let targetPath = "";

      for (const arg of args) {
        if (arg.startsWith("-")) {
          if (arg.includes("a")) showAll = true;
          if (arg.includes("l")) showLong = true;
        } else {
          targetPath = arg;
        }
      }

      const lines = formatLsOutput(s.vfs, s.currentDir, targetPath, showAll, showLong);
      term.writeln("");
      lines.forEach((l) => term.writeln(l));
      return;
    }

    if (trimmedCmd.startsWith("mkdir ")) {
      const dirName = trimmedInput.slice(6).trim();
      const res = executeMkdir(s.vfs, s.currentDir, dirName, s.sshSession ? s.sshSession.user : "karan");
      if (res.updatedRoot) setVfs(res.updatedRoot);
      if (!res.success) playKeySound("bell", s.soundEnabled);
      term.writeln(`\r\n  ${res.message}`);
      return;
    }

    if (trimmedCmd.startsWith("touch ")) {
      const fileName = trimmedInput.slice(6).trim();
      const res = executeTouch(s.vfs, s.currentDir, fileName, s.sshSession ? s.sshSession.user : "karan");
      if (res.updatedRoot) setVfs(res.updatedRoot);
      if (!res.success) playKeySound("bell", s.soundEnabled);
      term.writeln(`\r\n  ${res.message}`);
      return;
    }

    if (trimmedCmd.startsWith("rm ")) {
      const rest = trimmedCmd.slice(3).trim();
      const isRecursive = rest.startsWith("-r ") || rest.startsWith("-rf ");
      const targetName = isRecursive ? rest.replace(/^-r[f]?\s+/, "") : rest;

      const res = executeRm(s.vfs, s.currentDir, targetName, isRecursive);
      if (res.updatedRoot) setVfs(res.updatedRoot);
      if (!res.success) playKeySound("bell", s.soundEnabled);
      term.writeln(`\r\n  ${res.message}`);
      return;
    }

    if (trimmedCmd.startsWith("cat ")) {
      const fileName = trimmedInput.slice(4).trim();
      if (fileName.toLowerCase() === "readme.md" || fileName.toLowerCase() === "readme") {
        readmeOutput.forEach((l) => term.writeln(l));
      } else if (fileName.toLowerCase() === "resume" || fileName.toLowerCase() === "resume.pdf") {
        resumeTextOutput.forEach((l) => term.writeln(l));
      } else {
        const lines = executeCat(s.vfs, s.currentDir, fileName);
        if (lines.length > 0 && lines[0].includes("No such file")) playKeySound("bell", s.soundEnabled);
        term.writeln("");
        lines.forEach((l) => term.writeln(l));
      }
      return;
    }

    // Echo & Redirection
    if (trimmedCmd.includes(">")) {
      const isAppend = trimmedCmd.includes(">>");
      const parts = trimmedInput.split(isAppend ? ">>" : ">");
      let rawText = parts[0].trim();
      if (rawText.toLowerCase().startsWith("echo ")) rawText = rawText.slice(5).trim();
      rawText = rawText.replace(/^["']|["']$/g, "");
      const filePath = parts[1].trim();

      if (filePath) {
        const res = executeWriteFile(s.vfs, s.currentDir, filePath, rawText, isAppend, s.sshSession ? s.sshSession.user : "karan");
        if (res.updatedRoot) setVfs(res.updatedRoot);
        if (!res.success) playKeySound("bell", s.soundEnabled);
        term.writeln(`\r\n  ${res.message}`);
        return;
      }
    }

    if (trimmedCmd === "clear") {
      term.write("\x1b[H\x1b[2J");
      return;
    }

    if (trimmedCmd === "help" || trimmedCmd === "?") {
      term.writeln("");
      helpList.forEach((l) => term.writeln(l));
      return;
    }

    if (trimmedCmd === "tree") {
      formatTreeOutput(s.vfs).forEach((l) => term.writeln(l));
      return;
    }

    if (trimmedCmd === "shortcuts" || trimmedCmd === "keys") {
      shortcutsOutput.forEach((l) => term.writeln(l));
      return;
    }

    if (trimmedCmd === "time" || trimmedCmd === "tz") {
      getTimezoneOutput().forEach((l) => term.writeln(l));
      return;
    }

    if (trimmedCmd === "download" || trimmedCmd === "download resume") {
      triggerResumeDownload();
      return;
    }

    if (trimmedCmd.startsWith("skills search ")) {
      const termQuery = trimmedCmd.slice(14).trim().toLowerCase();
      const skillsList = [
        "React.js", "Next.js", "HTML5", "CSS3", "JavaScript", "TypeScript", "Tailwind CSS", "Bootstrap", "Shadcn UI",
        "Node.js", "Express.js", "Python", "Flask", "PostgreSQL", "MySQL", "MongoDB", "Supabase",
        "Git", "GitHub", "Figma", "JIRA", "AWS", "Vercel", "Netlify", "VS Code", "Postman", "WordPress"
      ];
      const matches = skillsList.filter((sk) => sk.toLowerCase().includes(termQuery));
      term.writeln(`\r\n  Found matching skills for "${termQuery}":`);
      if (matches.length > 0) {
        matches.forEach((m) => term.writeln(`    • \x1b[32m${m}\x1b[0m`));
      } else {
        term.writeln(`    \x1b[31mNo matching skills found for "${termQuery}"\x1b[0m`);
      }
      return;
    }

    if (trimmedCmd.startsWith("projects filter")) {
      const type = trimmedCmd.replace(/^projects filter\s*/, "").trim().toLowerCase();
      if (type !== "web" && type !== "mobile") {
        term.writeln("\r\n  Usage: projects filter [web|mobile]");
        return;
      }
      term.writeln(`\r\n  Fetching ${type} projects from database...`);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("type", type)
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          term.writeln(`  No ${type} projects found in database.`);
        } else {
          term.writeln(`\r\n  \x1b[1;36m🚀 ${type.toUpperCase()} PROJECTS\x1b[0m`);
          data.forEach((p, idx) => {
            term.writeln(`  [${idx + 1}] \x1b[1m${p.title}\x1b[0m (${p.role})`);
            term.writeln(`      Desc: ${p.description}\n`);
          });
        }
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31mError fetching projects: ${msg}\x1b[0m`);
      }
      return;
    }

    if (trimmedCmd === "experience" || trimmedCmd === "work") {
      term.writeln("\r\n  Fetching work experience from database...");
      try {
        const { data, error } = await supabase
          .from("experience")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          term.writeln("  No work experience records found in database.");
        } else {
          term.writeln("\r\n  \x1b[1;36m💼 WORK EXPERIENCE (from Supabase DB)\x1b[0m");
          term.writeln("  ===========================================");
          data.forEach((item, idx) => {
            term.writeln(`  [${idx + 1}] \x1b[1m${item.role} @ ${item.company}\x1b[0m`);
            term.writeln(`      Duration : ${item.duration}`);
            if (Array.isArray(item.highlights) && item.highlights.length > 0) {
              item.highlights.forEach((h: string) => term.writeln(`      • ${h}`));
            }
            term.writeln("");
          });
        }
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Error fetching experience: ${msg}\x1b[0m`);
      }
      return;
    }

    if (trimmedCmd === "education") {
      term.writeln("\r\n  Fetching education details from database...");
      try {
        const { data, error } = await supabase
          .from("education")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          term.writeln("  No education records found in database.");
        } else {
          term.writeln("\r\n  \x1b[1;36m🎓 EDUCATION HISTORY (from Supabase DB)\x1b[0m");
          term.writeln("  ===========================================");
          data.forEach((item, idx) => {
            term.writeln(`  [${idx + 1}] \x1b[1m${item.degree}\x1b[0m`);
            term.writeln(`      Institution : ${item.institution}`);
            term.writeln(`      Duration    : ${item.duration}\n`);
          });
        }
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Error fetching education: ${msg}\x1b[0m`);
      }
      return;
    }

    if (trimmedCmd === "certifications" || trimmedCmd === "certs") {
      term.writeln("\r\n  Fetching certifications from database...");
      try {
        const { data, error } = await supabase
          .from("certifications")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          term.writeln("  No certification records found in database.");
        } else {
          term.writeln("\r\n  \x1b[1;36m📜 CERTIFICATIONS (from Supabase DB)\x1b[0m");
          term.writeln("  ===========================================");
          data.forEach((item) => term.writeln(`    🏆 ${item.name}`));
          term.writeln("");
        }
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Error fetching certifications: ${msg}\x1b[0m`);
      }
      return;
    }

    if (trimmedCmd === "projects") {
      term.writeln("\r\n  Fetching all projects from database...");
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          term.writeln("  No projects found in database.");
        } else {
          term.writeln("\r\n  \x1b[1;36m🚀 FEATURED PROJECTS (from Supabase DB)\x1b[0m");
          term.writeln("  ===========================================");
          data.forEach((p, idx) => {
            term.writeln(`  [${idx + 1}] \x1b[1m${p.title}\x1b[0m (${(p.type || "WEB").toUpperCase()})`);
            term.writeln(`      Role : ${p.role}`);
            term.writeln(`      Desc : ${p.description}`);
            if (p.tech_stack && Array.isArray(p.tech_stack) && p.tech_stack.length > 0) {
              term.writeln(`      Tech : ${p.tech_stack.join(", ")}`);
            }
            term.writeln("");
          });
        }
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Error fetching projects: ${msg}\x1b[0m`);
      }
      return;
    }

    if (trimmedCmd.startsWith("search ")) {
      const queryTerm = cmd.slice(7).trim();
      if (!queryTerm) {
        term.writeln("\r\n  Usage: search [term] (e.g. search React, search Engineering)");
        return;
      }
      term.writeln(`\r\n  Searching database for "${queryTerm}"...`);
      try {
        const [projRes, expRes, eduRes, certRes] = await Promise.all([
          supabase.from("projects").select("*").or(`title.ilike.%${queryTerm}%,description.ilike.%${queryTerm}%,role.ilike.%${queryTerm}%`),
          supabase.from("experience").select("*").or(`role.ilike.%${queryTerm}%,company.ilike.%${queryTerm}%`),
          supabase.from("education").select("*").or(`degree.ilike.%${queryTerm}%,institution.ilike.%${queryTerm}%`),
          supabase.from("certifications").select("*").ilike("name", `%${queryTerm}%`),
        ]);

        term.writeln(`\r\n  \x1b[1;36m🔍 SEARCH RESULTS FOR "${queryTerm}"\x1b[0m`);
        term.writeln("  ===========================================");
        let count = 0;

        if (projRes.data && projRes.data.length > 0) {
          term.writeln("  🚀 Projects:");
          projRes.data.forEach((p) => {
            term.writeln(`     • ${p.title} (${p.role}) - ${p.description}`);
            count++;
          });
        }

        if (expRes.data && expRes.data.length > 0) {
          term.writeln("  💼 Work Experience:");
          expRes.data.forEach((e) => {
            term.writeln(`     • ${e.role} @ ${e.company} (${e.duration})`);
            count++;
          });
        }

        if (eduRes.data && eduRes.data.length > 0) {
          term.writeln("  🎓 Education:");
          eduRes.data.forEach((ed) => {
            term.writeln(`     • ${ed.degree} @ ${ed.institution}`);
            count++;
          });
        }

        if (certRes.data && certRes.data.length > 0) {
          term.writeln("  📜 Certifications:");
          certRes.data.forEach((c) => {
            term.writeln(`     • ${c.name}`);
            count++;
          });
        }

        if (count === 0) {
          term.writeln(`  No matching records found across database for "${queryTerm}".`);
        }
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Error searching database: ${msg}\x1b[0m`);
      }
      return;
    }

    if (trimmedCmd.startsWith("calc ")) {
      const expr = cmd.slice(5);
      const res = evaluateMath(expr);
      term.writeln(`\r\n${res}`);
      return;
    }

    if (trimmedCmd === "resume") {
      handleOpenOrCd("resume", false);
      return;
    }

    if (trimmedCmd.startsWith("open ")) {
      const target = cmd.slice(5);
      handleOpenOrCd(target, false);
      return;
    }

    if (trimmedCmd.startsWith("cd ")) {
      const target = cmd.slice(3);
      handleOpenOrCd(target, true);
      return;
    }

    if (trimmedCmd === "whoami" || trimmedCmd === "sudo whoami") {
      if (s.sshSession) {
        term.writeln(`\r\n  User: ${s.sshSession.user} | Host: ${s.sshSession.host} (SSH)`);
      } else if (s.currentUser) {
        term.writeln(`\r\n  User: admin | Email: ${s.currentUser.email} | Role: authenticated`);
      } else {
        term.writeln("\r\n  User: guest | Role: anonymous");
      }
      return;
    }

    if (trimmedCmd === "fetch" || trimmedCmd === "neofetch") {
      const hostStr = s.sshSession ? s.sshSession.host : "portfolio-os";
      term.writeln(`\r\n  \x1b[1;36m⚡ karan@${hostStr} ⚡\x1b[0m`);
      term.writeln("  -----------------------");
      term.writeln("  OS       → PortfolioOS v3.0 (xterm.js VT100 Engine)");
      term.writeln("  Host     → karangholap.com");
      term.writeln("  Kernel   → React 18 + Vite 5 + Canvas Terminal Engine");
      term.writeln(`  Audio    → Mechanical Audio Synthesizer (${s.soundEnabled ? "ON" : "OFF"})`);
      term.writeln("  Uptime   → 24/7 (Vercel CDN)");
      term.writeln("  Shell    → portfolio-cli v3.0 (VT100 + VFS + SSH + POSIX)");
      term.writeln("  Role     → Software Developer @ CandorWorks");
      term.writeln("  Founder  → Private Academy Engineering");
      term.writeln("  Location → Pune, India (UTC +5:30) 📍");
      term.writeln("  Stack    → React, Node.js, TypeScript, Tailwind, Supabase");
      term.writeln("");
      return;
    }

    if (trimmedCmd.startsWith("echo ")) {
      const msg = cmd.slice(5);
      term.writeln(`\r\n  ${msg || ""}`);
      return;
    }

    if (trimmedCmd === "send" || trimmedCmd === "msg" || trimmedCmd === "contact send") {
      term.writeln("\r\n  \x1b[1;36m📨 Interactive Contact Wizard\x1b[0m");
      term.writeln("  ===========================================");
      term.writeln("  Step 1/4: What is your name? (Press Esc to cancel)");
      setSendState("awaiting_name");
      return;
    }

    if (trimmedCmd === "sudo" || trimmedCmd === "login" || trimmedCmd === "admin") {
      if (s.currentUser) {
        term.writeln(`\r\n  Already authenticated as: ${s.currentUser.email}`);
        return;
      }
      term.writeln("\r\n  Starting Admin Authentication Flow... (Press Esc to cancel)");
      term.writeln("  Enter Admin Email:");
      setAuthState("awaiting_email");
      return;
    }

    if (trimmedCmd === "sudo messages" || trimmedCmd === "messages") {
      if (!s.currentUser) {
        playKeySound("bell", s.soundEnabled);
        term.writeln("\r\n  \x1b[31mPermission Denied: You must be logged in as admin to view messages.\x1b[0m");
        term.writeln("  Type 'sudo' or 'login' to authenticate.");
        return;
      }

      term.writeln("\r\n  Reading contact messages from database...");
      try {
        const { data, error } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        if (!data || data.length === 0) {
          term.writeln("  Inbox is empty.");
        } else {
          term.writeln("\r\n  --- RECENT SUBMISSIONS (Last 5) ---");
          data.forEach((msg, idx) => {
            term.writeln(`  [${idx + 1}] FROM: ${msg.name} <${msg.email}>`);
            term.writeln(`      SUBJ: ${msg.subject}`);
            term.writeln(`      DATE: ${new Date(msg.created_at).toLocaleString()}`);
            term.writeln(`      BODY: "${msg.message.length > 60 ? msg.message.slice(0, 57) + '...' : msg.message}"\n`);
          });
        }
      } catch (err: unknown) {
        playKeySound("bell", s.soundEnabled);
        const errorMsg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31mError reading messages: ${errorMsg}\x1b[0m`);
      }
      return;
    }

    const output = commandsInfo[trimmedCmd];
    if (output) {
      term.writeln("");
      if (Array.isArray(output)) {
        output.forEach((l) => term.writeln(l));
      } else {
        term.writeln(output);
      }
    } else {
      playKeySound("bell", s.soundEnabled);
      term.writeln(`\r\n  \x1b[31mCommand not found: ${cmd}\x1b[0m`);
      term.writeln("  Type 'help' to see available commands.");
    }
  };

  // Mount xterm.js Canvas safely after Modal Animation
  useEffect(() => {
    if (!open) {
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
      }
      return;
    }

    const initTimer = setTimeout(() => {
      if (!containerRef.current || xtermRef.current) return;

      const currentThemeName = loadTheme();
      const xTheme = xtermThemeMap[currentThemeName] || xtermThemeMap.default;

      const term = new XTerm({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
        theme: xTheme,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);

      try {
        fitAddon.fit();
      } catch {
        // ignore
      }

      term.focus();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Terminal Welcome Message
      term.writeln("\x1b[1mWelcome to Portfolio CLI v3.0 (xterm.js VT100 Engine)\x1b[0m \x1b[1;36m⚡\x1b[0m");
      term.writeln("\x1b[90mSession started: " + new Date().toUTCString() + "\x1b[0m");
      term.writeln("Type '\x1b[1mhelp\x1b[0m' for commands or '\x1b[1mssh guest@karan-server\x1b[0m' for server mode.");
      term.write(`\r\n${getPromptString()}`);

      let currentLine = "";
      let cursorPos = 0;
      let syncHistoryIdx = -1;

      const getGhostSuggestion = (line: string): string => {
        if (!line || line.trim() === "") return "";
        const lowerLine = line.toLowerCase();

        const match = availableCommands.find((cmd) => cmd.toLowerCase().startsWith(lowerLine));
        if (match && match.length > line.length) {
          return match.slice(line.length);
        }

        const parts = line.split(/\s+/);
        if (parts.length > 1) {
          const cmdName = parts[0].toLowerCase();
          const arg = parts.slice(1).join(" ").toLowerCase();
          if (["cat", "cd", "open", "rm", "touch"].includes(cmdName)) {
            const currentNode = getNodeAtPath(stateRef.current.vfs, stateRef.current.currentDir);
            if (currentNode && currentNode.children) {
              const fileNames = Object.keys(currentNode.children);
              const fileMatch = fileNames.find((f) => f.toLowerCase().startsWith(arg));
              if (fileMatch && fileMatch.length > arg.length) {
                return fileMatch.slice(arg.length);
              }
            }
          }
        }

        return "";
      };

      const redrawLine = (line: string, pos: number) => {
        if (!xtermRef.current) return;
        const promptStr = getPromptString();
        const displayLine = stateRef.current.authState === "awaiting_password" ? "*".repeat(line.length) : line;

        const ghost =
          pos === line.length && stateRef.current.authState !== "awaiting_password"
            ? getGhostSuggestion(line)
            : "";
        const ghostAnsi = ghost ? `\x1b[90m${ghost}\x1b[0m` : "";

        xtermRef.current.write(`\r${promptStr}${displayLine}${ghostAnsi}\x1b[K`);
        const moveBack = displayLine.length + ghost.length - pos;
        if (moveBack > 0) {
          xtermRef.current.write(`\x1b[${moveBack}D`);
        }
      };

      term.onData((data) => {
        const s = stateRef.current;
        // Audio keypress
        if (data === "\r") {
          playKeySound("enter", s.soundEnabled);
        } else if (data === " ") {
          playKeySound("space", s.soundEnabled);
        } else if (data === "\x7f" || data === "\b") {
          playKeySound("backspace", s.soundEnabled);
        } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
          playKeySound("key", s.soundEnabled);
        }

        // Enter
        if (data === "\r") {
          term.write("\r\n");
          const fullCmd = currentLine;
          currentLine = "";
          cursorPos = 0;
          syncHistoryIdx = -1;

          handleCommand(fullCmd).then(() => {
            if (stateRef.current.activeView !== "top") {
              writePrompt();
            }
          });
          return;
        }

        // Backspace
        if (data === "\x7f" || data === "\b") {
          if (cursorPos > 0) {
            currentLine = currentLine.slice(0, cursorPos - 1) + currentLine.slice(cursorPos);
            cursorPos--;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // Ctrl + C
        if (data === "\x03") {
          term.write("^C\r\n");
          currentLine = "";
          cursorPos = 0;
          syncHistoryIdx = -1;
          writePrompt();
          return;
        }

        // Ctrl + L
        if (data === "\x0c") {
          term.write("\x1b[H\x1b[2J");
          writePrompt();
          redrawLine(currentLine, cursorPos);
          return;
        }

        // Left Arrow (\x1b[D)
        if (data === "\x1b[D") {
          if (cursorPos > 0) {
            cursorPos--;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // Right Arrow (\x1b[C)
        if (data === "\x1b[C") {
          if (cursorPos === currentLine.length) {
            const ghost = getGhostSuggestion(currentLine);
            if (ghost) {
              currentLine += ghost;
              cursorPos = currentLine.length;
              redrawLine(currentLine, cursorPos);
              return;
            }
          } else if (cursorPos < currentLine.length) {
            cursorPos++;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // Up Arrow (\x1b[A)
        if (data === "\x1b[A") {
          const history = stateRef.current.commandHistory;
          if (history.length > 0) {
            if (syncHistoryIdx < history.length - 1) {
              syncHistoryIdx++;
              const targetCmd = history[history.length - 1 - syncHistoryIdx] || "";
              currentLine = targetCmd;
              cursorPos = targetCmd.length;
              redrawLine(currentLine, cursorPos);
            }
          }
          return;
        }

        // Down Arrow (\x1b[B)
        if (data === "\x1b[B") {
          const history = stateRef.current.commandHistory;
          if (syncHistoryIdx > 0) {
            syncHistoryIdx--;
            const targetCmd = history[history.length - 1 - syncHistoryIdx] || "";
            currentLine = targetCmd;
            cursorPos = targetCmd.length;
            redrawLine(currentLine, cursorPos);
          } else if (syncHistoryIdx === 0) {
            syncHistoryIdx = -1;
            currentLine = "";
            cursorPos = 0;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // Home key
        if (data === "\x1b[H" || data === "\x1b[1~" || data === "\x1b[7~") {
          if (cursorPos > 0) {
            cursorPos = 0;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // End key
        if (data === "\x1b[F" || data === "\x1b[4~" || data === "\x1b[8~") {
          if (cursorPos < currentLine.length) {
            cursorPos = currentLine.length;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // Delete key
        if (data === "\x1b[3~") {
          if (cursorPos < currentLine.length) {
            currentLine = currentLine.slice(0, cursorPos) + currentLine.slice(cursorPos + 1);
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // Tab completion
        if (data === "\t") {
          const ghost = getGhostSuggestion(currentLine);
          if (ghost) {
            currentLine += ghost;
            cursorPos = currentLine.length;
            redrawLine(currentLine, cursorPos);
            return;
          }
          if (currentLine.trim()) {
            const q = currentLine.toLowerCase().trim();
            const matches = availableCommands.filter((c) => c.toLowerCase().startsWith(q));
            if (matches.length > 1) {
              term.write(`\r\n\x1b[90mMatches: ${matches.join("  |  ")}\x1b[0m`);
              writePrompt();
              redrawLine(currentLine, cursorPos);
            } else {
              playKeySound("bell", s.soundEnabled);
            }
          }
          return;
        }

        // Normal printable text
        if (data.length === 1 && data.charCodeAt(0) >= 32) {
          currentLine = currentLine.slice(0, cursorPos) + data + currentLine.slice(cursorPos);
          cursorPos++;
          redrawLine(currentLine, cursorPos);
        }
      });
    }, 150);

    return () => {
      clearTimeout(initTimer);
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
      }
    };
  }, [open, writePrompt, getPromptString]);

  // Dynamic Resize Observer for seamless canvas fit
  useEffect(() => {
    if (!open || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch {
          // ignore fit error when hidden
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [open, isFullscreen]);

  const toggleAudio = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    saveSoundSetting(nextState);
    if (nextState) {
      playKeySound("key", true);
    }
  };

  const handleClose = () => {
    setIsFullscreen(false);
    onMinimizeChange?.(false);
    onOpenChange(false);
  };

  const handleMinimize = () => {
    onMinimizeChange?.(true);
    onOpenChange(false);
  };

  const handleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={`p-0 gap-0 overflow-hidden border-0 bg-transparent [&>button]:hidden transition-all duration-300 ${
          isFullscreen
            ? "max-w-[100vw] w-[100vw] h-[100vh] rounded-none"
            : "max-w-4xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw]"
        }`}
      >
        <VisuallyHidden>
          <DialogTitle>Portfolio CLI Terminal</DialogTitle>
        </VisuallyHidden>

        {/* Main Terminal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            borderRadius: isFullscreen ? "0px" : "12px",
          }}
          transition={{ duration: 0.4, type: "spring", damping: 25, stiffness: 300 }}
          className={`w-full overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 ${
            isFullscreen ? "rounded-none" : "rounded-xl"
          }`}
          style={{
            fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
            backgroundColor: currentThemeObj.background,
          }}
        >
          {/* Terminal Header */}
          <div
            className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10 text-white transition-colors duration-300"
            style={{ backgroundColor: currentThemeObj.background }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(0,70%,55%)] hover:bg-[hsl(0,70%,45%)] transition-colors group relative"
                aria-label="Close terminal"
                title="Close"
              >
                <X size={8} className="absolute inset-0 m-auto text-[hsl(0,30%,20%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
              <motion.button
                onClick={handleMinimize}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(45,90%,55%)] hover:bg-[hsl(45,90%,45%)] transition-colors group relative"
                aria-label="Minimize terminal"
                title="Minimize"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[hsl(45,50%,20%)] opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold">−</span>
              </motion.button>
              <motion.button
                onClick={handleFullscreen}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,35%)] transition-colors group relative"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[hsl(142,50%,15%)] opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold">
                  {isFullscreen ? "↙" : "↗"}
                </span>
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex-1 text-center"
            >
              <span className="text-xs sm:text-sm font-semibold opacity-80">
                {sshSession
                  ? `${sshSession.user}@${sshSession.host}:${currentDir}`
                  : `karan@portfolio:${currentDir}`}
              </span>
            </motion.div>

            {/* Sound Toggle Button */}
            <motion.button
              onClick={toggleAudio}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded hover:bg-white/10 transition-colors opacity-75 hover:opacity-100"
              title={soundEnabled ? "Mute Mechanical Audio (sound off)" : "Enable Mechanical Audio (sound on)"}
              aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? (
                <Volume2 size={14} className="text-emerald-400" />
              ) : (
                <VolumeX size={14} className="opacity-50" />
              )}
            </motion.button>
          </div>

          {/* xterm.js Canvas Body Container */}
          <div
            ref={containerRef}
            onClick={() => xtermRef.current?.focus()}
            className={`w-full p-0 overflow-hidden cursor-text transition-colors duration-300 ${
              isFullscreen
                ? "h-[calc(100vh-48px)]"
                : "h-[75vh] sm:h-[75vh] md:h-[60vh] lg:h-[500px]"
            }`}
            style={{ backgroundColor: currentThemeObj.background }}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioCLI;
