import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import {
  loadVFS,
  saveVFS,
  loadTheme,
  saveTheme,
  resolvePath,
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
  themes,
  VFSNode,
} from "@/utils/virtualOS";

const helpList = [
  "Available Commands (grouped by category):",
  "",
  "  🖥️ SERVER & SSH EMULATION",
  "    ssh [user@host]        - SSH into server (e.g. ssh guest@karan-server)",
  "    exit / logout          - Close active SSH session or exit monitor",
  "    top / htop             - Interactive real-time process monitor (Press 'q' to exit)",
  "    ping [host]            - Send ICMP echo requests to host",
  "    df / df -h             - Display disk filesystem usage",
  "    free / free -m         - Display memory allocation stats",
  "    netstat                - Display active server network ports",
  "",
  "  📁 VIRTUAL FILESYSTEM (POSIX COMMANDS)",
  "    pwd                    - Print current working directory",
  "    ls [-la] [dir]         - List files with detailed permissions & info",
  "    cd [path]              - Change directory (e.g. cd projects, cd /var/log, cd ..)",
  "    mkdir [dir]            - Create a new directory in virtual storage",
  "    touch [file]           - Create or update a file in virtual storage",
  "    rm [-r] [path]         - Remove a file or directory",
  "    cat [file]             - Display file contents",
  "    echo [text] > [file]   - Write text content to a file",
  "    tree                   - Display full virtual filesystem tree",
  "",
  "  👤 PORTFOLIO INFO (DATABASE DRIVEN)",
  "    projects               - Fetch all featured projects from database",
  "    projects filter [type] - Filter projects by 'web' or 'mobile'",
  "    experience / work      - Fetch work experience & career timeline",
  "    education              - Fetch education history & degrees",
  "    certs / certifications - Fetch professional certifications",
  "    search [term]          - Global multi-table database search",
  "    skills                 - View technical skills overview",
  "    skills search [term]   - Search for specific skills",
  "    about                  - Learn about Karan Gholap",
  "    contact                - Get contact details",
  "    social                 - View social media links",
  "    fetch / neofetch       - Display portfolio system info",
  "    download               - Download resume PDF",
  "",
  "  ⚡ UTILITIES & CUSTOMIZATION",
  "    theme set [name]       - Change theme (matrix, dracula, cyberpunk, ubuntu, default)",
  "    send                   - Launch interactive message wizard to contact Karan",
  "    time / tz              - Display Pune, India timezone & local time",
  "    calc [expr]            - Calculate a math expression (e.g. calc 25 * 4)",
  "    shortcuts              - View CLI keybindings & hotkeys",
  "    whoami                 - Check current session role (Guest / Admin / SSH)",
  "    echo [msg]             - Echo text back",
  "    clear                  - Clear terminal output",
  "    help                   - Show this help menu",
  "",
  "  🔐 ADMIN / AUTHENTICATION",
  "    sudo / login           - Admin authentication flow",
  "    logout                 - Sign out from admin session",
  "    sudo messages          - View contact form submissions (Admin)",
  "",
  "  💡 Tip: Press [Tab] or [→] for zsh-style ghost auto-complete!",
];

const availableCommands = [
  "about", "skills", "skills search", "projects", "projects filter",
  "experience", "work", "education", "certs", "certifications", "search",
  "contact", "social", "resume", "cat", "cat README.md", "cat resume", "fetch", "neofetch",
  "ls", "ls -la", "ls -l", "ls -a", "pwd", "cd", "mkdir", "touch", "rm", "rm -r", "tree", "open", "download",
  "ssh", "ssh guest@karan-server", "exit", "top", "htop", "ping", "df", "df -h", "free", "free -m", "netstat",
  "theme", "theme set matrix", "theme set dracula", "theme set cyberpunk", "theme set ubuntu", "theme set default",
  "time", "tz", "calc", "shortcuts", "whoami", "echo", "send", "sudo", "login", "logout", "messages", "sudo messages", "clear", "help"
];

const treeOutput = [
  "",
  "  / (VFS Root)",
  "  ├── 📁 home/",
  "  │   ├── 📁 karan/",
  "  │   │   ├── 📄 README.md",
  "  │   │   ├── 📄 resume.pdf",
  "  │   │   ├── 📄 notes.txt",
  "  │   │   └── 📁 projects/",
  "  │   │       ├── 📄 private-academy.md",
  "  │   │       └── 📄 bursana.md",
  "  │   └── 📁 guest/",
  "  │       └── 📄 welcome.txt",
  "  ├── 📁 var/",
  "  │   └── 📁 log/",
  "  │       ├── 📄 syslog",
  "  │       └── 📄 auth.log",
  "  ├── 📁 etc/",
  "  │   ├── 📄 hostname",
  "  │   └── 📄 os-release",
  "  └── 📁 tmp/",
  "",
  "  💡 Tip: Use 'cd [path]' to navigate directories and 'cat [file]' to view files.",
  "",
];

const readmeOutput = [
  "",
  "  =======================================================",
  "  📄 README.md — Karan Gholap Portfolio System",
  "  =======================================================",
  "",
  "  👋 Hello! I'm Karan Gholap",
  "  Software Developer based in Pune, India 🇮🇳",
  "",
  "  💻 Specialties: React.js, Next.js, Node.js, TypeScript & PostgreSQL",
  "  🚀 Role       : Trainee Developer @ CandorWorks",
  "  🎓 Education  : B.E. Computer Engineering (Univ. of Mumbai)",
  "  🌟 Founder    : Private Academy Engineering",
  "",
  "  Useful database commands:",
  "    • Type 'experience' to view career history",
  "    • Type 'projects' to fetch all projects from DB",
  "    • Type 'education' to view degree details",
  "    • Type 'search [term]' for global search",
  "    • Type 'send' to drop a direct message",
  "    • Type 'download' to save my resume",
  "    • Type 'ssh guest@karan-server' for server mode",
  "",
];

const resumeTextOutput = [
  "",
  "  📄 Karan Gholap — Resume Overview",
  "  =======================================================",
  "",
  "  🎓 EDUCATION:",
  "    • Bachelor of Engineering (Computer Engineering)",
  "      University of Mumbai",
  "",
  "  💼 EXPERIENCE:",
  "    • Trainee Developer @ CandorWorks",
  "      - Full-stack web development & real-world projects.",
  "    • Founder & Software Developer @ Private Academy Engineering",
  "      - Designed and deployed EdTech platform for Mumbai Univ. students.",
  "    • Tech & Business Efficiency Associate @ BURSANA Fashion Tech",
  "",
  "  🛠️ CORE SKILLS:",
  "    • Frontend : React.js, Next.js, TypeScript, Tailwind CSS",
  "    • Backend  : Node.js, Express.js, Python, REST APIs",
  "    • Database : PostgreSQL, MongoDB, Supabase",
  "",
  "  Type 'download' to download PDF or 'open resume' to visit page.",
  "",
];

const shortcutsOutput = [
  "",
  "  ⌨️ TERMINAL KEYBINDINGS & SHORTCUTS",
  "  =======================================================",
  "    Tab / →     : Autocomplete command / ghost suggestion",
  "    ↑ / ↓       : Cycle through input command history",
  "    Esc         : Cancel active contact/login wizard or exit top monitor",
  "    q           : Exit live 'top' / 'htop' process monitor",
  "    Ctrl + K    : Open global site-wide Command Palette",
  "    clear       : Clear all output text",
  "",
];

const evaluateMath = (expr: string): string => {
  try {
    const cleanExpr = expr.replace(/\^/g, "**").trim();
    if (!/^[0-9+\-*/%.()\s**]+$/.test(cleanExpr)) {
      return "  Error: Invalid math expression. Use standard arithmetic (e.g. calc 25 * 4 + 10).";
    }
    const result = new Function(`"use strict"; return (${cleanExpr})`)();
    if (typeof result === "number" && !isNaN(result)) {
      return `  Result: ${result}`;
    }
    return "  Error: Could not calculate result.";
  } catch {
    return "  Error: Invalid syntax in math expression.";
  }
};

const getTimezoneOutput = (): string[] => {
  const now = new Date();
  const puneTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  }).format(now);

  const localTime = new Intl.DateTimeFormat("default", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(now);

  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return [
    "",
    "  🌍 TIME & TIMEZONE INFORMATION",
    "  =======================================================",
    `  📍 Karan (Pune, India - IST / UTC+5:30) : ${puneTime}`,
    `  💻 Your Local Time (${userTz})          : ${localTime}`,
    "",
  ];
};

const commandsInfo: Record<string, string | string[]> = {
  about: [
    "Hi! I'm Karan Gholap 👋",
    "",
    "A Software Developer from Pune, India.",
    "I specialize in building responsive, user-friendly applications",
    "using React.js, Node.js, and various database systems.",
    "",
    "Currently working as a Trainee Developer at CandorWorks",
    "and Founder and Software Developer of Private Academy Engineering.",
  ],
  skills: [
    "Technical Skills:",
    "",
    "  Frontend   → React.js, Next.js, TypeScript, Tailwind CSS, Bootstrap",
    "  Backend    → Node.js, Express.js, Python, Flask, REST APIs",
    "  Database   → MongoDB, PostgreSQL, MySQL, Supabase",
    "  DevOps     → Git, Docker, AWS, Vercel, Netlify",
    "  Tools      → VS Code, Figma, Postman, JIRA",
  ],
  contact: [
    "Contact Information:",
    "",
    "  📧 Email    → karangholap@zohomail.in",
    "  💼 LinkedIn → linkedin.com/in/karangholap",
    "  🐙 GitHub   → github.com/karangholap154",
    "  📸 Instagram→ instagram.com/thekarangholap",
  ],
  social: [
    "Social Links:",
    "",
    "  GitHub     → https://github.com/karangholap154",
    "  LinkedIn   → https://linkedin.com/in/karangholap",
    "  X/Twitter  → https://x.com/TheKaranGholap",
    "  Instagram  → https://instagram.com/thekarangholap",
    "  Medium     → https://medium.com/@karan_gholap",
  ],
};

interface HistoryItem {
  command: string;
  output: string[];
  cwd?: string;
  userPrompt?: string;
}

interface PortfolioCLIProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMinimizedGlobally?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
}

const PortfolioCLI = ({
  open,
  onOpenChange,
  onMinimizeChange,
}: PortfolioCLIProps) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("portfolio_cli_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Virtual OS & SSH State
  const [vfs, setVfs] = useState<VFSNode>(loadVFS);
  const [currentDir, setCurrentDir] = useState<string>("/home/karan");
  const [sshSession, setSshSession] = useState<{ isConnected: boolean; host: string; user: string } | null>(null);
  const [activeView, setActiveView] = useState<"terminal" | "top">("terminal");
  const [themeName, setThemeName] = useState<string>(loadTheme);
  const [topTick, setTopTick] = useState(0);

  const theme = themes[themeName] || themes.default;

  const [sessionStartTime] = useState(() => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "full",
      timeStyle: "medium",
    }).format(new Date());
  });

  type SendState = "idle" | "awaiting_name" | "awaiting_email" | "awaiting_subject" | "awaiting_message" | "submitting";
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendForm, setSendForm] = useState({ name: "", email: "", subject: "", message: "" });

  const [authState, setAuthState] = useState<"idle" | "awaiting_email" | "awaiting_password" | "authenticating">("idle");
  const [authEmail, setAuthEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const ghostSuggestion = (() => {
    if (authState !== "idle" || sendState !== "idle" || activeView !== "terminal" || !input.trim()) return "";
    const q = input.toLowerCase();
    const match = availableCommands.find((c) => c.toLowerCase().startsWith(q) && c.toLowerCase() !== q);
    if (!match) return "";
    return match.slice(q.length);
  })();

  // Sync command history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("portfolio_cli_history", JSON.stringify(commandHistory.slice(-50)));
    } catch {
      // ignore
    }
  }, [commandHistory]);

  // Supabase auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Interval for top live update
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeView === "top") {
      timer = setInterval(() => {
        setTopTick((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeView]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, activeView]);

  useEffect(() => {
    if (open) {
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const triggerResumeDownload = async () => {
    setHistory((prev) => [...prev, { command: "download", output: ["", "  📥 Preparing resume download...", ""] }]);
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
      setHistory((prev) => [...prev, { command: "", output: ["  🟢 Download started successfully!", ""] }]);
    } catch {
      window.open("/resume.pdf", "_blank");
    }
  };

  const handleOpenOrCd = (targetStr: string, isCd: boolean) => {
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
      setHistory((prev) => [...prev, { command: `${isCd ? "cd" : "open"} ${targetStr}`, output: ["", `  Navigated web page to ${routes[lowerTarget]}`, ""] }]);
      return;
    }

    if (externalLinks[lowerTarget]) {
      window.open(externalLinks[lowerTarget], "_blank", "noopener,noreferrer");
      setHistory((prev) => [...prev, { command: `open ${targetStr}`, output: ["", `  Opening external link: ${externalLinks[lowerTarget]}`, ""] }]);
      return;
    }

    if (target.startsWith("http://") || target.startsWith("https://")) {
      window.open(target, "_blank", "noopener,noreferrer");
      setHistory((prev) => [...prev, { command: `open ${targetStr}`, output: ["", `  Opening URL: ${target}`, ""] }]);
      return;
    }

    // Try VFS Directory navigation
    if (isCd) {
      const newPath = resolvePath(currentDir, targetStr);
      const outputLines = formatLsOutput(vfs, currentDir, targetStr);
      if (outputLines.length > 0 && outputLines[0].includes("No such file")) {
        setHistory((prev) => [...prev, { command: `cd ${targetStr}`, output: ["", `  cd: ${targetStr}: No such file or directory`, ""] }]);
      } else {
        setCurrentDir(newPath);
        setHistory((prev) => [...prev, { command: `cd ${targetStr}`, output: [] }]);
      }
      return;
    }

    setHistory((prev) => [
      ...prev,
      { command: `${isCd ? "cd" : "open"} ${targetStr}`, output: ["", `  Error: target '${targetStr}' not found. Type 'ls' or 'help' to see valid targets.`, ""] }
    ]);
  };

  const handleCommand = async (cmd: string) => {
    const trimmedInput = cmd.trim();

    if (activeView === "top") {
      if (trimmedInput.toLowerCase() === "q" || trimmedInput.toLowerCase() === "exit") {
        setActiveView("terminal");
      }
      return;
    }

    if (sendState === "awaiting_name") {
      if (!trimmedInput) return;
      setSendForm((prev) => ({ ...prev, name: trimmedInput }));
      setHistory((prev) => [...prev, { command: "Name: " + trimmedInput, output: ["", "  Step 2/4: Enter your email address:", ""] }]);
      setSendState("awaiting_email");
      return;
    }

    if (sendState === "awaiting_email") {
      if (!trimmedInput) return;
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
      if (!isEmailValid) {
        setHistory((prev) => [...prev, { command: "Email: " + trimmedInput, output: ["", "  🔴 Invalid email format. Please enter a valid email address (e.g. alex@example.com):", ""] }]);
        return;
      }
      setSendForm((prev) => ({ ...prev, email: trimmedInput }));
      setHistory((prev) => [...prev, { command: "Email: " + trimmedInput, output: ["", "  Step 3/4: Subject / Topic?", ""] }]);
      setSendState("awaiting_subject");
      return;
    }

    if (sendState === "awaiting_subject") {
      if (!trimmedInput) return;
      setSendForm((prev) => ({ ...prev, subject: trimmedInput }));
      setHistory((prev) => [...prev, { command: "Subject: " + trimmedInput, output: ["", "  Step 4/4: Type your message body:", ""] }]);
      setSendState("awaiting_message");
      return;
    }

    if (sendState === "awaiting_message") {
      if (!trimmedInput) return;
      const finalPayload = { ...sendForm, message: trimmedInput };
      setHistory((prev) => [...prev, { command: "Message: " + trimmedInput, output: ["", "  Connecting to database & delivering message..."] }]);
      setSendState("submitting");

      try {
        const { error } = await supabase.from("contact_messages").insert([
          { name: finalPayload.name, email: finalPayload.email, subject: finalPayload.subject, message: finalPayload.message },
        ]);
        if (error) throw error;
        setHistory((prev) => [
          ...prev,
          {
            command: "",
            output: [
              "",
              "  🟢 Message Sent Successfully!",
              `  Thank you, ${finalPayload.name}! Your message has been delivered.`,
              `  Karan will review it and get back to you at ${finalPayload.email}.`,
              "",
            ],
          },
        ]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error sending message: ${msg}`, "  Please try again or email karangholap@zohomail.in directly.", ""] }]);
      } finally {
        setSendState("idle");
        setSendForm({ name: "", email: "", subject: "", message: "" });
      }
      return;
    }

    if (authState === "awaiting_email") {
      if (!trimmedInput) return;
      setAuthEmail(trimmedInput);
      setHistory((prev) => [...prev, { command: "Email: " + trimmedInput, output: [] }]);
      setAuthState("awaiting_password");
      return;
    }

    if (authState === "awaiting_password") {
      setHistory((prev) => [...prev, { command: "Password: " + "•".repeat(trimmedInput.length), output: ["Connecting to Supabase auth..."] }]);
      setAuthState("authenticating");
      try {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: trimmedInput });
        if (error) throw error;
        setHistory((prev) => [...prev, { command: "", output: ["", "  🟢 Authentication Successful!", "  Welcome, admin. You are now logged in.", ""] }]);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Access Denied: ${errorMsg}`, ""] }]);
      } finally {
        setAuthState("idle");
        setAuthEmail("");
      }
      return;
    }

    const trimmedCmd = trimmedInput.toLowerCase();
    if (!trimmedCmd) return;

    setCommandHistory((prev) => [...prev, trimmedInput]);
    setHistoryIndex(-1);

    const currentUserPrompt = sshSession
      ? `${sshSession.user}@${sshSession.host}`
      : currentUser
      ? "admin@karan"
      : "dev@karan";

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
      setHistory((prev) => [...prev, { command: cmd, output: bannerLines, cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd === "exit" || trimmedCmd === "logout") {
      if (sshSession) {
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output: ["", `  Connection to ${sshSession.host} closed by remote host.`, "  Returned to local terminal session.", ""],
            cwd: currentDir,
            userPrompt: currentUserPrompt,
          },
        ]);
        setSshSession(null);
        return;
      }
    }

    // Process Monitor
    if (trimmedCmd === "top" || trimmedCmd === "htop") {
      setActiveView("top");
      setHistory((prev) => [...prev, { command: cmd, output: ["  Launching live process monitor 'top'... (Press 'q' or Esc to exit)"], cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    // Network & Diagnostics
    if (trimmedCmd.startsWith("ping ")) {
      const host = trimmedInput.slice(5).trim();
      const pingOutput = executePing(host);
      setHistory((prev) => [...prev, { command: cmd, output: pingOutput, cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd === "df" || trimmedCmd === "df -h") {
      setHistory((prev) => [...prev, { command: cmd, output: executeDf(), cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd === "free" || trimmedCmd === "free -m") {
      setHistory((prev) => [...prev, { command: cmd, output: executeFree(), cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd === "netstat" || trimmedCmd === "netstat -tuln") {
      setHistory((prev) => [...prev, { command: cmd, output: executeNetstat(), cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    // Themes
    if (trimmedCmd.startsWith("theme")) {
      const sub = trimmedCmd.slice(5).trim();
      if (!sub || sub === "list") {
        setHistory((prev) => [
          ...prev,
          {
            command: cmd,
            output: [
              "",
              "  🎨 AVAILABLE TERMINAL THEMES:",
              "    • default   - Dark sleek theme",
              "    • matrix    - Classic green matrix glow",
              "    • dracula   - Vibrant purple Dracula palette",
              "    • cyberpunk - High contrast cyan & neon yellow",
              "    • ubuntu    - Classic Ubuntu terminal aubergine",
              "",
              "  Usage: theme set [name] (e.g. theme set dracula)",
              "",
            ],
            cwd: currentDir,
            userPrompt: currentUserPrompt,
          },
        ]);
        return;
      }

      if (sub.startsWith("set ")) {
        const tName = sub.slice(4).trim().toLowerCase();
        if (themes[tName]) {
          setThemeName(tName);
          saveTheme(tName);
          setHistory((prev) => [...prev, { command: cmd, output: ["", `  🎨 Theme switched to '${tName}'!`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        } else {
          setHistory((prev) => [...prev, { command: cmd, output: ["", `  Error: Theme '${tName}' not found. Type 'theme' to view options.`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        }
        return;
      }
    }

    // VFS Commands
    if (trimmedCmd === "pwd") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", `  ${currentDir}`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
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

      const lines = formatLsOutput(vfs, currentDir, targetPath, showAll, showLong);
      setHistory((prev) => [...prev, { command: cmd, output: ["", ...lines, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd.startsWith("mkdir ")) {
      const dirName = trimmedInput.slice(6).trim();
      const res = executeMkdir(vfs, currentDir, dirName, sshSession ? sshSession.user : "karan");
      if (res.updatedRoot) setVfs(res.updatedRoot);
      setHistory((prev) => [...prev, { command: cmd, output: ["", res.message, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd.startsWith("touch ")) {
      const fileName = trimmedInput.slice(6).trim();
      const res = executeTouch(vfs, currentDir, fileName, sshSession ? sshSession.user : "karan");
      if (res.updatedRoot) setVfs(res.updatedRoot);
      setHistory((prev) => [...prev, { command: cmd, output: ["", res.message, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd.startsWith("rm ")) {
      const rest = trimmedCmd.slice(3).trim();
      const isRecursive = rest.startsWith("-r ") || rest.startsWith("-rf ");
      const targetName = isRecursive ? rest.replace(/^-r[f]?\s+/, "") : rest;

      const res = executeRm(vfs, currentDir, targetName, isRecursive);
      if (res.updatedRoot) setVfs(res.updatedRoot);
      setHistory((prev) => [...prev, { command: cmd, output: ["", res.message, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd.startsWith("cat ")) {
      const fileName = trimmedInput.slice(4).trim();
      if (fileName.toLowerCase() === "readme.md" || fileName.toLowerCase() === "readme") {
        setHistory((prev) => [...prev, { command: cmd, output: readmeOutput, cwd: currentDir, userPrompt: currentUserPrompt }]);
      } else if (fileName.toLowerCase() === "resume" || fileName.toLowerCase() === "resume.pdf") {
        setHistory((prev) => [...prev, { command: cmd, output: resumeTextOutput, cwd: currentDir, userPrompt: currentUserPrompt }]);
      } else {
        const lines = executeCat(vfs, currentDir, fileName);
        setHistory((prev) => [...prev, { command: cmd, output: ["", ...lines, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      }
      return;
    }

    // Redirect writing: echo "text" > file or echo "text" >> file
    if (trimmedCmd.includes(">")) {
      const isAppend = trimmedCmd.includes(">>");
      const parts = trimmedInput.split(isAppend ? ">>" : ">");
      let rawText = parts[0].trim();
      if (rawText.toLowerCase().startsWith("echo ")) rawText = rawText.slice(5).trim();
      rawText = rawText.replace(/^["']|["']$/g, "");
      const filePath = parts[1].trim();

      if (filePath) {
        const res = executeWriteFile(vfs, currentDir, filePath, rawText, isAppend, sshSession ? sshSession.user : "karan");
        if (res.updatedRoot) setVfs(res.updatedRoot);
        setHistory((prev) => [...prev, { command: cmd, output: ["", res.message, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        return;
      }
    }

    if (trimmedCmd === "clear") { setHistory([]); return; }
    if (trimmedCmd === "help" || trimmedCmd === "?") {
      setHistory((prev) => [...prev, { command: cmd, output: helpList, cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd === "tree") {
      setHistory((prev) => [...prev, { command: cmd, output: treeOutput, cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd === "shortcuts" || trimmedCmd === "keys") {
      setHistory((prev) => [...prev, { command: cmd, output: shortcutsOutput, cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd === "time" || trimmedCmd === "tz") {
      setHistory((prev) => [...prev, { command: cmd, output: getTimezoneOutput(), cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd === "download" || trimmedCmd === "download resume") {
      triggerResumeDownload();
      return;
    }

    if (trimmedCmd === "experience" || trimmedCmd === "work") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Fetching work experience from database..."], cwd: currentDir, userPrompt: currentUserPrompt }]);
      try {
        const { data, error } = await supabase
          .from("experience")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  No work experience records found in database.", ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        } else {
          const lines = ["", "  💼 WORK EXPERIENCE (from Supabase DB)", "  ==========================================="];
          data.forEach((item, idx) => {
            lines.push(
              `  [${idx + 1}] ${item.role} @ ${item.company}`,
              `      Duration : ${item.duration}`
            );
            if (Array.isArray(item.highlights) && item.highlights.length > 0) {
              item.highlights.forEach((h: string) => lines.push(`      • ${h}`));
            }
            lines.push("");
          });
          setHistory((prev) => [...prev, { command: "", output: lines, cwd: currentDir, userPrompt: currentUserPrompt }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error fetching experience: ${msg}`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      }
      return;
    }

    if (trimmedCmd === "education") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Fetching education details from database..."], cwd: currentDir, userPrompt: currentUserPrompt }]);
      try {
        const { data, error } = await supabase
          .from("education")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  No education records found in database.", ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        } else {
          const lines = ["", "  🎓 EDUCATION HISTORY (from Supabase DB)", "  ==========================================="];
          data.forEach((item, idx) => {
            lines.push(
              `  [${idx + 1}] ${item.degree}`,
              `      Institution : ${item.institution}`,
              `      Duration    : ${item.duration}`,
              ""
            );
          });
          setHistory((prev) => [...prev, { command: "", output: lines, cwd: currentDir, userPrompt: currentUserPrompt }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error fetching education: ${msg}`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      }
      return;
    }

    if (trimmedCmd === "certifications" || trimmedCmd === "certs") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Fetching certifications from database..."], cwd: currentDir, userPrompt: currentUserPrompt }]);
      try {
        const { data, error } = await supabase
          .from("certifications")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  No certification records found in database.", ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        } else {
          const lines = ["", "  📜 CERTIFICATIONS (from Supabase DB)", "  ==========================================="];
          data.forEach((item) => lines.push(`    🏆 ${item.name}`));
          lines.push("");
          setHistory((prev) => [...prev, { command: "", output: lines, cwd: currentDir, userPrompt: currentUserPrompt }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error fetching certifications: ${msg}`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      }
      return;
    }

    if (trimmedCmd === "projects") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Fetching all projects from database..."], cwd: currentDir, userPrompt: currentUserPrompt }]);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  No projects found in database.", ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        } else {
          const lines = ["", "  🚀 FEATURED PROJECTS (from Supabase DB)", "  ==========================================="];
          data.forEach((p, idx) => {
            lines.push(
              `  [${idx + 1}] ${p.title} (${(p.type || "WEB").toUpperCase()})`,
              `      Role : ${p.role}`,
              `      Desc : ${p.description}`
            );
            if (p.tech_stack && Array.isArray(p.tech_stack) && p.tech_stack.length > 0) {
              lines.push(`      Tech : ${p.tech_stack.join(", ")}`);
            }
            lines.push("");
          });
          lines.push("  💡 Tip: Type 'open projects' to open projects page in browser.");
          lines.push("");
          setHistory((prev) => [...prev, { command: "", output: lines, cwd: currentDir, userPrompt: currentUserPrompt }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error fetching projects: ${msg}`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      }
      return;
    }

    if (trimmedCmd.startsWith("search ")) {
      const queryTerm = cmd.slice(7).trim();
      if (!queryTerm) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", "  Usage: search [term] (e.g. search React, search Engineering)", ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        return;
      }
      setHistory((prev) => [...prev, { command: cmd, output: ["", `  Searching database for "${queryTerm}"...`], cwd: currentDir, userPrompt: currentUserPrompt }]);
      try {
        const [projRes, expRes, eduRes, certRes] = await Promise.all([
          supabase.from("projects").select("*").or(`title.ilike.%${queryTerm}%,description.ilike.%${queryTerm}%,role.ilike.%${queryTerm}%`),
          supabase.from("experience").select("*").or(`role.ilike.%${queryTerm}%,company.ilike.%${queryTerm}%`),
          supabase.from("education").select("*").or(`degree.ilike.%${queryTerm}%,institution.ilike.%${queryTerm}%`),
          supabase.from("certifications").select("*").ilike("name", `%${queryTerm}%`)
        ]);

        const results: string[] = ["", `  🔍 SEARCH RESULTS FOR "${queryTerm}"`, "  ==========================================="];
        let count = 0;

        if (projRes.data && projRes.data.length > 0) {
          results.push("  🚀 Projects:");
          projRes.data.forEach((p) => {
            results.push(`     • ${p.title} (${p.role}) - ${p.description}`);
            count++;
          });
          results.push("");
        }

        if (expRes.data && expRes.data.length > 0) {
          results.push("  💼 Work Experience:");
          expRes.data.forEach((e) => {
            results.push(`     • ${e.role} @ ${e.company} (${e.duration})`);
            count++;
          });
          results.push("");
        }

        if (eduRes.data && eduRes.data.length > 0) {
          results.push("  🎓 Education:");
          eduRes.data.forEach((ed) => {
            results.push(`     • ${ed.degree} @ ${ed.institution}`);
            count++;
          });
          results.push("");
        }

        if (certRes.data && certRes.data.length > 0) {
          results.push("  📜 Certifications:");
          certRes.data.forEach((c) => {
            results.push(`     • ${c.name}`);
            count++;
          });
          results.push("");
        }

        if (count === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", `  No matching records found across database for "${queryTerm}".`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        } else {
          setHistory((prev) => [...prev, { command: "", output: results, cwd: currentDir, userPrompt: currentUserPrompt }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error searching database: ${msg}`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      }
      return;
    }

    if (trimmedCmd.startsWith("calc ")) {
      const expr = cmd.slice(5);
      const res = evaluateMath(expr);
      setHistory((prev) => [...prev, { command: cmd, output: ["", res, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
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
      if (sshSession) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  User: ${sshSession.user}`, `  Host: ${sshSession.host}`, `  Session: SSH Remote Session`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      } else if (currentUser) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  User: admin`, `  Email: ${currentUser.email}`, `  Role: authenticated`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      } else {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  User: guest`, `  Role: anonymous`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      }
      return;
    }

    if (trimmedCmd === "fetch" || trimmedCmd === "neofetch") {
      const fetchOutput = [
        "",
        `  ⚡ karan@${sshSession ? sshSession.host : "portfolio-os"} ⚡`,
        "  -----------------------",
        "  OS       → PortfolioOS v2.5 (Virtual Linux Kernel)",
        "  Host     → karangholap.com",
        "  Kernel   → React 18 + Vite 5 + Virtual OS Engine",
        "  Uptime   → 24/7 (Vercel CDN)",
        "  Shell    → portfolio-cli v2.5 (VFS + SSH + POSIX)",
        "  Role     → Software Developer @ CandorWorks",
        "  Founder  → Private Academy Engineering",
        "  Location → Pune, India (UTC +5:30) 📍",
        "  Stack    → React, Node.js, TypeScript, Tailwind, Supabase",
        "",
      ];
      setHistory((prev) => [...prev, { command: cmd, output: fetchOutput, cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    if (trimmedCmd.startsWith("echo ")) {
      const msg = cmd.slice(5);
      setHistory((prev) => [...prev, { command: cmd, output: [msg || ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      return;
    }

    // Contact interactive wizard
    if (trimmedCmd === "send" || trimmedCmd === "msg" || trimmedCmd === "contact send") {
      setHistory((prev) => [
        ...prev,
        {
          command: cmd,
          output: [
            "",
            "  📨 Interactive Contact Wizard",
            "  ===========================================",
            "  Step 1/4: What is your name?",
            "  (Press Escape at any time to cancel)",
            "",
          ],
          cwd: currentDir,
          userPrompt: currentUserPrompt,
        },
      ]);
      setSendState("awaiting_name");
      return;
    }

    if (trimmedCmd === "sudo" || trimmedCmd === "login" || trimmedCmd === "admin") {
      if (currentUser) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  Already authenticated as: ${currentUser.email}`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        return;
      }
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Starting Admin Authentication Flow...", "  Press Escape at any time to cancel.", ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      setAuthState("awaiting_email");
      return;
    }

    if (trimmedCmd === "sudo messages" || trimmedCmd === "messages") {
      if (!currentUser) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", "  Permission Denied: You must be logged in as admin to view messages.", "  Type 'sudo' or 'login' to authenticate.", ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        return;
      }

      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Reading contact messages from database..."], cwd: currentDir, userPrompt: currentUserPrompt }]);

      try {
        const { data, error } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  Inbox is empty.", ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
        } else {
          const lines = ["", "  --- RECENT SUBMISSIONS (Last 5) ---", ""];
          data.forEach((msg, idx) => {
            lines.push(
              `  [${idx + 1}] FROM: ${msg.name} <${msg.email}>`,
              `      SUBJ: ${msg.subject}`,
              `      DATE: ${new Date(msg.created_at).toLocaleString()}`,
              `      BODY: "${msg.message.length > 60 ? msg.message.slice(0, 57) + '...' : msg.message}"`,
              ""
            );
          });
          setHistory((prev) => [...prev, { command: "", output: lines, cwd: currentDir, userPrompt: currentUserPrompt }]);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  Error reading messages: ${errorMsg}`, ""], cwd: currentDir, userPrompt: currentUserPrompt }]);
      }
      return;
    }

    const output = commandsInfo[trimmedCmd];
    if (output) {
      setHistory((prev) => [...prev, { command: cmd, output: Array.isArray(output) ? output : [output], cwd: currentDir, userPrompt: currentUserPrompt }]);
    } else {
      setHistory((prev) => [...prev, { command: cmd, output: [`Command not found: ${cmd}`, "Type 'help' to see available commands."], cwd: currentDir, userPrompt: currentUserPrompt }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (activeView === "top") {
      if (e.key === "q" || e.key === "Escape") {
        e.preventDefault();
        setActiveView("terminal");
      }
      return;
    }

    if (e.key === "Tab" || (e.key === "ArrowRight" && ghostSuggestion && inputRef.current?.selectionStart === input.length)) {
      e.preventDefault();
      if (authState !== "idle" || !input.trim()) return;

      const query = input.toLowerCase().trim();
      const matches = availableCommands.filter((c) => c.toLowerCase().startsWith(query));

      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        let commonPrefix = matches[0];
        for (let i = 1; i < matches.length; i++) {
          while (!matches[i].toLowerCase().startsWith(commonPrefix.toLowerCase())) {
            commonPrefix = commonPrefix.slice(0, -1);
          }
        }
        if (commonPrefix.length > query.length) {
          setInput(commonPrefix);
        } else {
          setHistory((prev) => [...prev, { command: input, output: ["Matches: " + matches.join("  |  ")] }]);
        }
      }
      return;
    }

    if (e.key === "Escape") {
      if (sendState !== "idle") {
        e.preventDefault();
        setSendState("idle");
        setSendForm({ name: "", email: "", subject: "", message: "" });
        setInput("");
        setHistory((prev) => [...prev, { command: "Cancelled.", output: ["", "  Contact submission cancelled.", ""] }]);
        return;
      }
      if (authState !== "idle") {
        e.preventDefault();
        setAuthState("idle");
        setAuthEmail("");
        setInput("");
        setHistory((prev) => [...prev, { command: "Cancelled.", output: [""] }]);
        return;
      }
    }

    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (authState !== "idle") return;
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (authState !== "idle") return;
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const focusInput = () => inputRef.current?.focus();

  const handleClose = () => {
    setIsFullscreen(false);
    setIsMinimized(false);
    onMinimizeChange?.(false);
    onOpenChange(false);
  };

  const handleMinimize = () => {
    setIsMinimized(false);
    onMinimizeChange?.(true);
    onOpenChange(false);
  };

  const handleFullscreen = () => setIsFullscreen(!isFullscreen);

  const topData = generateTopData(topTick);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogContentRef}
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
          className={`w-full overflow-hidden border shadow-2xl transition-all duration-300 ${
            isFullscreen ? "rounded-none" : "rounded-xl"
          }`}
          style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace" }}
        >
          {/* Terminal Header */}
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b ${theme.header}`}>
            <div className="flex gap-1.5 sm:gap-2">
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
              <span className={`text-xs sm:text-sm font-semibold ${theme.text}`}>
                {sshSession
                  ? `${sshSession.user}@${sshSession.host}:${currentDir}`
                  : `karan@portfolio:${currentDir}`}
              </span>
            </motion.div>
          </div>

          {/* Terminal Body */}
          <motion.div
            ref={terminalRef}
            onClick={focusInput}
            onPointerDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className={`${theme.bg} ${theme.text} p-3 sm:p-4 overflow-y-auto cursor-text text-xs sm:text-sm ${
              isFullscreen
                ? "h-[calc(100vh-48px)]"
                : "h-[75vh] sm:h-[75vh] md:h-[60vh] lg:h-[500px]"
            }`}
          >
            {activeView === "top" ? (
              /* Dynamic Live TOP / HTOP Process Monitor Screen */
              <div className="font-mono text-xs select-none">
                <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
                  <span className="font-bold text-amber-400">top - {topData.uptimeStr}</span>
                  <span className="text-emerald-400 animate-pulse">● LIVE (Press 'q' or Esc to exit)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div>
                    <p>Tasks: <span className="font-bold text-white">{topData.tasksCount}</span> total, <span className="text-emerald-400">{topData.runningCount}</span> running, <span className="text-white/70">{topData.sleepingCount}</span> sleeping</p>
                    <p>%Cpu(s): <span className="text-cyan-400 font-bold">{topData.cpuVal}%</span> us, 2.1% sy, 0.0% ni, 85.5% id</p>
                  </div>
                  <div>
                    <p>MiB Mem : <span className="text-purple-400 font-bold">{topData.memVal}%</span> used (3840.2 / 16284.0 MB)</p>
                    <p>Load Avg: <span className="text-yellow-300">{topData.loadAvg}</span></p>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs">CPU:</span>
                    <div className="flex-1 bg-white/10 h-3 rounded overflow-hidden">
                      <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${topData.cpuVal}%` }}></div>
                    </div>
                    <span className="w-12 text-right">{topData.cpuVal}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs">MEM:</span>
                    <div className="flex-1 bg-white/10 h-3 rounded overflow-hidden">
                      <div className="bg-purple-400 h-full transition-all duration-300" style={{ width: `${topData.memVal}%` }}></div>
                    </div>
                    <span className="w-12 text-right">{topData.memVal}%</span>
                  </div>
                </div>

                {/* Process Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/10 text-emerald-400 border-b border-white/20">
                        <th className="py-1 px-2">PID</th>
                        <th className="py-1 px-2">USER</th>
                        <th className="py-1 px-2">PR</th>
                        <th className="py-1 px-2">NI</th>
                        <th className="py-1 px-2">VIRT</th>
                        <th className="py-1 px-2">RES</th>
                        <th className="py-1 px-2">%CPU</th>
                        <th className="py-1 px-2">%MEM</th>
                        <th className="py-1 px-2">TIME+</th>
                        <th className="py-1 px-2">COMMAND</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topData.processes.map((proc) => (
                        <tr key={proc.pid} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-1 px-2 text-cyan-300">{proc.pid}</td>
                          <td className="py-1 px-2">{proc.user}</td>
                          <td className="py-1 px-2">{proc.pr}</td>
                          <td className="py-1 px-2">{proc.ni}</td>
                          <td className="py-1 px-2">{proc.virt}</td>
                          <td className="py-1 px-2">{proc.res}</td>
                          <td className="py-1 px-2 font-bold text-amber-300">{proc.cpu.toFixed(1)}</td>
                          <td className="py-1 px-2 text-purple-300">{proc.mem.toFixed(1)}</td>
                          <td className="py-1 px-2">{proc.time}</td>
                          <td className="py-1 px-2 font-semibold">{proc.command}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Standard Terminal Shell Output */
              <>
                {/* Welcome Message & Session Date/Time */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                  <p className="font-semibold mb-1 text-xs sm:text-sm flex items-center gap-2">
                    <span>Welcome to Portfolio CLI v2.5 (Virtual OS & SSH Engine)</span>
                    <span className={theme.accent}>⚡</span>
                  </p>
                  <p className="opacity-60 mb-3 text-xs">
                    Session started: {sessionStartTime}
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                  <p className="opacity-80 mb-3 sm:mb-4 text-xs sm:text-sm">
                    Type '<span className="font-bold underline">help</span>' for available server commands or '
                    <span className="font-bold underline">ssh guest@karan-server</span>' to test remote SSH mode.
                  </p>
                </motion.div>

                {/* Command History */}
                <AnimatePresence mode="popLayout">
                  {history.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="mb-2 sm:mb-3 overflow-hidden"
                    >
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className={theme.prompt}>
                          {item.userPrompt || (currentUser ? "admin@karan" : "dev@karan")}
                        </span>
                        <span className="opacity-50">{item.cwd || "~"}</span>
                        <span className="opacity-50">$</span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="font-bold"
                        >
                          {item.command}
                        </motion.span>
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="mt-1 opacity-90"
                      >
                        <AnimatePresence>
                          {item.output.map((line, lineIndex) => (
                            <motion.div
                              key={lineIndex}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -5 }}
                              transition={{ delay: lineIndex * 0.02, duration: 0.2 }}
                              className="whitespace-pre overflow-x-auto"
                            >
                              {line || "\u00A0"}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Current Input Line */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="flex items-center gap-1 sm:gap-2 flex-wrap w-full mt-2"
                >
                  {sendState === "awaiting_name" ? (
                    <span className={`${theme.accent} font-medium`}>Step 1/4 (Your Name):</span>
                  ) : sendState === "awaiting_email" ? (
                    <span className={`${theme.accent} font-medium`}>Step 2/4 (Your Email):</span>
                  ) : sendState === "awaiting_subject" ? (
                    <span className={`${theme.accent} font-medium`}>Step 3/4 (Subject):</span>
                  ) : sendState === "awaiting_message" ? (
                    <span className={`${theme.accent} font-medium`}>Step 4/4 (Message):</span>
                  ) : sendState === "submitting" ? (
                    <span className="opacity-60 animate-pulse">Delivering message...</span>
                  ) : authState === "awaiting_email" ? (
                    <span className="text-cyan-400">Enter Email:</span>
                  ) : authState === "awaiting_password" ? (
                    <span className="text-cyan-400">Enter Password:</span>
                  ) : authState === "authenticating" ? (
                    <span className="opacity-60 animate-pulse">Authenticating...</span>
                  ) : (
                    <>
                      <span className={theme.prompt}>
                        {sshSession
                          ? `${sshSession.user}@${sshSession.host}`
                          : currentUser
                          ? "admin@karan"
                          : "dev@karan"}
                      </span>
                      <span className="opacity-50">{currentDir}</span>
                      <span className="opacity-50">
                        {sshSession?.user === "root" || currentUser ? "#" : "$"}
                      </span>
                    </>
                  )}

                  {authState !== "authenticating" && sendState !== "submitting" && (
                    <div className="relative flex-1 min-w-[150px] flex items-center">
                      <input
                        ref={inputRef}
                        type={authState === "awaiting_password" ? "password" : "text"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-full bg-transparent outline-none caret-current transition-all z-10 font-mono"
                        spellCheck={false}
                        autoComplete="off"
                      />
                      {ghostSuggestion && (
                        <span className="absolute left-0 pointer-events-none opacity-40 whitespace-pre select-none z-0 font-mono">
                          <span className="opacity-0">{input}</span>
                          {ghostSuggestion}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export const FixedTerminalButton = () => {
  const [open, setOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setIsAtBottom(scrollTop + windowHeight >= documentHeight - 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.15, rotateZ: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`fixed z-50 bg-[hsl(0,0%,12%)] border border-border shadow-xl hover:bg-[hsl(0,0%,18%)] transition-all overflow-hidden hidden md:flex ${
          isMinimized
            ? "px-3 py-2 rounded-lg items-center gap-2"
            : "p-3 rounded-full justify-center items-center"
        }`}
        style={{
          bottom: isAtBottom ? "84px" : "20px",
          right: "20px",
          fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
          transition: "bottom 0.3s ease-out",
        }}
        title={isMinimized ? "Restore Terminal" : "Open Terminal (Portfolio CLI)"}
        aria-label={isMinimized ? "Restore Terminal" : "Open Terminal"}
      >
        <div>
          <Terminal size={20} className="text-[hsl(175,100%,50%)]" />
        </div>
        {isMinimized && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="text-xs text-[hsl(0,0%,70%)] whitespace-nowrap"
          >
            dev@karan
          </motion.span>
        )}
      </motion.button>

      <PortfolioCLI
        open={open}
        onOpenChange={setOpen}
        onMinimizeChange={setIsMinimized}
      />
    </>
  );
};

export default PortfolioCLI;