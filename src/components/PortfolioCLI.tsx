import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon, X, Volume2, VolumeX } from "lucide-react";
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
import {
  loadSoundSetting,
  saveSoundSetting,
  playKeySound,
} from "@/utils/audioUtils";

const helpList = [
  "\x1b[1mAvailable Commands (grouped by category):\x1b[0m",
  "",
  "  \x1b[1;36m🖥️ SERVER & SSH EMULATION\x1b[0m",
  "    \x1b[32mssh [user@host]\x1b[0m        - SSH into server (e.g. ssh guest@karan-server)",
  "    \x1b[32mexit / logout\x1b[0m          - Close active SSH session or exit monitor",
  "    \x1b[32mtop / htop\x1b[0m             - Interactive real-time process monitor (Press 'q' to exit)",
  "    \x1b[32mping [host]\x1b[0m            - Send ICMP echo requests to host",
  "    \x1b[32mdf / df -h\x1b[0m             - Display disk filesystem usage",
  "    \x1b[32mfree / free -m\x1b[0m         - Display memory allocation stats",
  "    \x1b[32mnetstat\x1b[0m                - Display active server network ports",
  "",
  "  \x1b[1;36m📁 VIRTUAL FILESYSTEM (POSIX COMMANDS)\x1b[0m",
  "    \x1b[32mpwd\x1b[0m                    - Print current working directory",
  "    \x1b[32mls [-la] [dir]\x1b[0m         - List files with detailed permissions & info",
  "    \x1b[32mcd [path]\x1b[0m              - Change directory (e.g. cd projects, cd /var/log, cd ..)",
  "    \x1b[32mmkdir [dir]\x1b[0m            - Create a new directory in virtual storage",
  "    \x1b[32mtouch [file]\x1b[0m           - Create or update a file in virtual storage",
  "    \x1b[32mrm [-r] [path]\x1b[0m         - Remove a file or directory",
  "    \x1b[32mcat [file]\x1b[0m             - Display file contents",
  "    \x1b[32mecho [text] > [file]\x1b[0m   - Write text content to a file",
  "    \x1b[32mtree\x1b[0m                   - Display full virtual filesystem tree",
  "",
  "  \x1b[1;36m🔊 AUDIO & CUSTOMIZATION\x1b[0m",
  "    \x1b[32msound [on|off|toggle]\x1b[0m  - Toggle retro mechanical keypress audio",
  "    \x1b[32mtheme set [name]\x1b[0m       - Change theme (matrix, dracula, cyberpunk, ubuntu, default)",
  "",
  "  \x1b[1;36m👤 PORTFOLIO INFO (DATABASE DRIVEN)\x1b[0m",
  "    \x1b[32mprojects\x1b[0m               - Fetch all featured projects from database",
  "    \x1b[32mprojects filter [type]\x1b[0m - Filter projects by 'web' or 'mobile'",
  "    \x1b[32mexperience / work\x1b[0m      - Fetch work experience & career timeline",
  "    \x1b[32meducation\x1b[0m              - Fetch education history & degrees",
  "    \x1b[32mcerts / certifications\x1b[0m - Fetch professional certifications",
  "    \x1b[32msearch [term]\x1b[0m          - Global multi-table database search",
  "    \x1b[32mskills\x1b[0m                 - View technical skills overview",
  "    \x1b[32mskills search [term]\x1b[0m   - Search for specific skills",
  "    \x1b[32mabout\x1b[0m                  - Learn about Karan Gholap",
  "    \x1b[32mcontact\x1b[0m                - Get contact details",
  "    \x1b[32msocial\x1b[0m                 - View social media links",
  "    \x1b[32mfetch / neofetch\x1b[0m       - Display portfolio system info",
  "    \x1b[32mdownload\x1b[0m               - Download resume PDF",
  "",
  "  \x1b[1;36m⚡ UTILITIES & HELPERS\x1b[0m",
  "    \x1b[32msend\x1b[0m                   - Launch interactive message wizard to contact Karan",
  "    \x1b[32mtime / tz\x1b[0m              - Display Pune, India timezone & local time",
  "    \x1b[32mcalc [expr]\x1b[0m            - Calculate a math expression (e.g. calc 25 * 4)",
  "    \x1b[32mshortcuts\x1b[0m              - View CLI keybindings & hotkeys",
  "    \x1b[32mwhoami\x1b[0m                 - Check current session role (Guest / Admin / SSH)",
  "    \x1b[32mecho [msg]\x1b[0m             - Echo text back",
  "    \x1b[32mclear\x1b[0m                  - Clear terminal output",
  "    \x1b[32mhelp\x1b[0m                   - Show this help menu",
  "",
  "  \x1b[1;36m🔐 ADMIN / AUTHENTICATION\x1b[0m",
  "    \x1b[32msudo / login\x1b[0m           - Admin authentication flow",
  "    \x1b[32mlogout\x1b[0m                 - Sign out from admin session",
  "    \x1b[32msudo messages\x1b[0m          - View contact form submissions (Admin)",
  "",
  "  \x1b[90m💡 Tip: Press [Tab] or [→] for ghost autocomplete, [Ctrl+L] to clear, [Ctrl+C] to cancel.\x1b[0m",
];

const availableCommands = [
  "about", "skills", "skills search", "projects", "projects filter",
  "experience", "work", "education", "certs", "certifications", "search",
  "contact", "social", "resume", "cat", "cat README.md", "cat resume", "fetch", "neofetch",
  "ls", "ls -la", "ls -l", "ls -a", "pwd", "cd", "mkdir", "touch", "rm", "rm -r", "tree", "open", "download",
  "ssh", "ssh guest@karan-server", "exit", "top", "htop", "ping", "df", "df -h", "free", "free -m", "netstat",
  "sound", "sound on", "sound off", "sound toggle",
  "theme", "theme set matrix", "theme set dracula", "theme set cyberpunk", "theme set ubuntu", "theme set default",
  "time", "tz", "calc", "shortcuts", "whoami", "echo", "send", "sudo", "login", "logout", "messages", "sudo messages", "clear", "help"
];

const treeOutput = [
  "",
  "  \x1b[1;34m/ (VFS Root)\x1b[0m",
  "  ├── \x1b[1;34mhome/\x1b[0m",
  "  │   ├── \x1b[1;34mkaran/\x1b[0m",
  "  │   │   ├── README.md",
  "  │   │   ├── resume.pdf",
  "  │   │   ├── notes.txt",
  "  │   │   └── \x1b[1;34mprojects/\x1b[0m",
  "  │   │       ├── private-academy.md",
  "  │   │       └── bursana.md",
  "  │   └── \x1b[1;34mguest/\x1b[0m",
  "  │       └── welcome.txt",
  "  ├── \x1b[1;34mvar/\x1b[0m",
  "  │   └── \x1b[1;34mlog/\x1b[0m",
  "  │       ├── syslog",
  "  │       └── auth.log",
  "  ├── \x1b[1;34metc/\x1b[0m",
  "  │   ├── hostname",
  "  │   └── os-release",
  "  └── \x1b[1;34mtmp/\x1b[0m",
  "",
  "  \x1b[90m💡 Tip: Use 'cd [path]' to navigate directories and 'cat [file]' to view files.\x1b[0m",
  "",
];

const readmeOutput = [
  "",
  "  \x1b[1;36m=======================================================\x1b[0m",
  "  \x1b[1m📄 README.md — Karan Gholap Portfolio System\x1b[0m",
  "  \x1b[1;36m=======================================================\x1b[0m",
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
  "    • Type '\x1b[32mexperience\x1b[0m' to view career history",
  "    • Type '\x1b[32mprojects\x1b[0m' to fetch all projects from DB",
  "    • Type '\x1b[32meducation\x1b[0m' to view degree details",
  "    • Type '\x1b[32msearch [term]\x1b[0m' for global search",
  "    • Type '\x1b[32msend\x1b[0m' to drop a direct message",
  "    • Type '\x1b[32mdownload\x1b[0m' to save my resume",
  "    • Type '\x1b[32mssh guest@karan-server\x1b[0m' for server mode",
  "    • Type '\x1b[32msound on\x1b[0m' for mechanical key audio",
  "",
];

const resumeTextOutput = [
  "",
  "  \x1b[1m📄 Karan Gholap — Resume Overview\x1b[0m",
  "  \x1b[1;36m=======================================================\x1b[0m",
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
  "  \x1b[1m⌨️ TERMINAL KEYBINDINGS & SHORTCUTS\x1b[0m",
  "  \x1b[1;36m=======================================================\x1b[0m",
  "    Tab / →     : Autocomplete command / ghost suggestion",
  "    ↑ / ↓       : Cycle through input command history",
  "    Esc         : Cancel active wizard or exit top monitor",
  "    q           : Exit live 'top' / 'htop' process monitor",
  "    Ctrl + C    : Cancel current input line",
  "    Ctrl + L    : Clear terminal screen",
  "    clear       : Clear all output text",
  "",
];

const evaluateMath = (expr: string): string => {
  try {
    const cleanExpr = expr.replace(/\^/g, "**").trim();
    if (!/^[0-9+\-*/%.()\s**]+$/.test(cleanExpr)) {
      return "  \x1b[31mError: Invalid math expression. Use standard arithmetic (e.g. calc 25 * 4 + 10).\x1b[0m";
    }
    const result = new Function(`"use strict"; return (${cleanExpr})`)();
    if (typeof result === "number" && !isNaN(result)) {
      return `  \x1b[1;32mResult: ${result}\x1b[0m`;
    }
    return "  \x1b[31mError: Could not calculate result.\x1b[0m";
  } catch {
    return "  \x1b[31mError: Invalid syntax in math expression.\x1b[0m";
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
    "  \x1b[1m🌍 TIME & TIMEZONE INFORMATION\x1b[0m",
    "  \x1b[1;36m=======================================================\x1b[0m",
    `  📍 Karan (Pune, India - IST / UTC+5:30) : \x1b[33m${puneTime}\x1b[0m`,
    `  💻 Your Local Time (${userTz})          : \x1b[36m${localTime}\x1b[0m`,
    "",
  ];
};

const commandsInfo: Record<string, string | string[]> = {
  about: [
    "\x1b[1mHi! I'm Karan Gholap 👋\x1b[0m",
    "",
    "A Software Developer from Pune, India.",
    "I specialize in building responsive, user-friendly applications",
    "using React.js, Node.js, and various database systems.",
    "",
    "Currently working as a Trainee Developer at CandorWorks",
    "and Founder and Software Developer of Private Academy Engineering.",
  ],
  skills: [
    "\x1b[1mTechnical Skills:\x1b[0m",
    "",
    "  Frontend   → React.js, Next.js, TypeScript, Tailwind CSS, Bootstrap",
    "  Backend    → Node.js, Express.js, Python, Flask, REST APIs",
    "  Database   → MongoDB, PostgreSQL, MySQL, Supabase",
    "  DevOps     → Git, Docker, AWS, Vercel, Netlify",
    "  Tools      → VS Code, Figma, Postman, JIRA",
  ],
  contact: [
    "\x1b[1mContact Information:\x1b[0m",
    "",
    "  📧 Email    → \x1b[36mkarangholap@zohomail.in\x1b[0m",
    "  💼 LinkedIn → \x1b[36mlinkedin.com/in/karangholap\x1b[0m",
    "  🐙 GitHub   → \x1b[36mgithub.com/karangholap154\x1b[0m",
    "  📸 Instagram→ \x1b[36minstagram.com/thekarangholap\x1b[0m",
  ],
  social: [
    "\x1b[1mSocial Links:\x1b[0m",
    "",
    "  GitHub     → https://github.com/karangholap154",
    "  LinkedIn   → https://linkedin.com/in/karangholap",
    "  X/Twitter  → https://x.com/TheKaranGholap",
    "  Instagram  → https://instagram.com/thekarangholap",
    "  Medium     → https://medium.com/@karan_gholap",
  ],
};

interface PortfolioCLIProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMinimizedGlobally?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
}

const xtermThemeMap: Record<string, { background: string; foreground: string; cursor: string; selectionBackground: string }> = {
  default: { background: "#0f0f0f", foreground: "#f0f0f0", cursor: "#00ffcc", selectionBackground: "#ffffff33" },
  matrix: { background: "#050B05", foreground: "#00FF66", cursor: "#00FF66", selectionBackground: "#00FF6644" },
  dracula: { background: "#282a36", foreground: "#f8f8f2", cursor: "#50fa7b", selectionBackground: "#44475a88" },
  cyberpunk: { background: "#0d0221", foreground: "#00f0ff", cursor: "#ff0055", selectionBackground: "#ff005544" },
  ubuntu: { background: "#300a24", foreground: "#ffffff", cursor: "#e95420", selectionBackground: "#e9542044" },
};

const PortfolioCLI = ({
  open,
  onOpenChange,
  onMinimizeChange,
}: PortfolioCLIProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  // State
  const [vfs, setVfs] = useState<VFSNode>(loadVFS);
  const [currentDir, setCurrentDir] = useState<string>("/home/karan");
  const [sshSession, setSshSession] = useState<{ isConnected: boolean; host: string; user: string } | null>(null);
  const [activeView, setActiveView] = useState<"terminal" | "top">("terminal");
  const [themeName, setThemeName] = useState<string>(loadTheme);
  const [topTick, setTopTick] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundSetting);

  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("portfolio_cli_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState(-1);

  type SendState = "idle" | "awaiting_name" | "awaiting_email" | "awaiting_subject" | "awaiting_message" | "submitting";
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendForm, setSendForm] = useState({ name: "", email: "", subject: "", message: "" });
  const sendFormRef = useRef(sendForm);
  sendFormRef.current = sendForm;

  const [authState, setAuthState] = useState<"idle" | "awaiting_email" | "awaiting_password" | "authenticating">("idle");
  const [authEmail, setAuthEmail] = useState("");
  const authEmailRef = useRef(authEmail);
  authEmailRef.current = authEmail;

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const currentThemeObj = xtermThemeMap[themeName] || xtermThemeMap.default;

  // Sync refs for event listeners
  const currentDirRef = useRef(currentDir);
  currentDirRef.current = currentDir;

  const sshSessionRef = useRef(sshSession);
  sshSessionRef.current = sshSession;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const sendStateRef = useRef(sendState);
  sendStateRef.current = sendState;

  const authStateRef = useRef(authState);
  authStateRef.current = authState;

  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;

  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;

  const commandHistoryRef = useRef(commandHistory);
  commandHistoryRef.current = commandHistory;

  const vfsRef = useRef(vfs);
  vfsRef.current = vfs;

  // Prompt generator
  const getPromptString = useCallback(() => {
    if (sendStateRef.current === "awaiting_name") return "\x1b[36mStep 1/4 (Your Name):\x1b[0m ";
    if (sendStateRef.current === "awaiting_email") return "\x1b[36mStep 2/4 (Your Email):\x1b[0m ";
    if (sendStateRef.current === "awaiting_subject") return "\x1b[36mStep 3/4 (Subject):\x1b[0m ";
    if (sendStateRef.current === "awaiting_message") return "\x1b[36mStep 4/4 (Message):\x1b[0m ";
    if (authStateRef.current === "awaiting_email") return "\x1b[36mEnter Admin Email:\x1b[0m ";
    if (authStateRef.current === "awaiting_password") return "\x1b[36mEnter Password:\x1b[0m ";

    const userStr = sshSessionRef.current
      ? `\x1b[1;32m${sshSessionRef.current.user}@${sshSessionRef.current.host}\x1b[0m`
      : currentUserRef.current
      ? `\x1b[1;31madmin@karan\x1b[0m`
      : `\x1b[1;32mdev@karan\x1b[0m`;
    const symbol = sshSessionRef.current?.user === "root" || currentUserRef.current ? "#" : "$";
    return `${userStr}:\x1b[1;34m${currentDirRef.current}\x1b[0m${symbol} `;
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

  // Top screen refresh interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeView === "top" && xtermRef.current) {
      let currentTick = 0;
      timer = setInterval(() => {
        currentTick += 1;
        setTopTick(currentTick);
        const topData = generateTopData(currentTick);
        const term = xtermRef.current;
        if (!term) return;

        term.write("\x1b[H\x1b[2J"); // Clear screen
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
  }, [activeView]);

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
      const newPath = resolvePath(currentDirRef.current, targetStr);
      const outputLines = formatLsOutput(vfsRef.current, currentDirRef.current, targetStr);
      if (outputLines.length > 0 && outputLines[0].includes("No such file")) {
        playKeySound("bell", soundEnabledRef.current);
        term.writeln(`\r\n  \x1b[31mcd: ${targetStr}: No such file or directory\x1b[0m`);
      } else {
        setCurrentDir(newPath);
      }
      return;
    }

    playKeySound("bell", soundEnabledRef.current);
    term.writeln(`\r\n  \x1b[31mError: target '${targetStr}' not found. Type 'ls' or 'help' to see valid targets.\x1b[0m`);
  };

  const handleCommand = async (cmd: string) => {
    const term = xtermRef.current;
    if (!term) return;
    const trimmedInput = cmd.trim();

    if (activeViewRef.current === "top") {
      if (trimmedInput.toLowerCase() === "q" || trimmedInput.toLowerCase() === "exit") {
        setActiveView("terminal");
        term.write("\x1b[H\x1b[2J");
      }
      return;
    }

    if (sendStateRef.current === "awaiting_name") {
      if (!trimmedInput) return;
      sendFormRef.current = { ...sendFormRef.current, name: trimmedInput };
      setSendForm((prev) => ({ ...prev, name: trimmedInput }));
      term.writeln("\r\n  \x1b[36mStep 2/4: Enter your email address:\x1b[0m");
      setSendState("awaiting_email");
      return;
    }

    if (sendStateRef.current === "awaiting_email") {
      if (!trimmedInput) return;
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
      if (!isEmailValid) {
        playKeySound("bell", soundEnabledRef.current);
        term.writeln("\r\n  \x1b[31m🔴 Invalid email format. Please enter a valid email address (e.g. alex@example.com):\x1b[0m");
        return;
      }
      sendFormRef.current = { ...sendFormRef.current, email: trimmedInput };
      setSendForm((prev) => ({ ...prev, email: trimmedInput }));
      term.writeln("\r\n  \x1b[36mStep 3/4: Subject / Topic?\x1b[0m");
      setSendState("awaiting_subject");
      return;
    }

    if (sendStateRef.current === "awaiting_subject") {
      if (!trimmedInput) return;
      sendFormRef.current = { ...sendFormRef.current, subject: trimmedInput };
      setSendForm((prev) => ({ ...prev, subject: trimmedInput }));
      term.writeln("\r\n  \x1b[36mStep 4/4: Type your message body:\x1b[0m");
      setSendState("awaiting_message");
      return;
    }

    if (sendStateRef.current === "awaiting_message") {
      if (!trimmedInput) return;
      const finalPayload = { ...sendFormRef.current, message: trimmedInput };
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
        playKeySound("bell", soundEnabledRef.current);
        const msg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Error sending message: ${msg}\x1b[0m`);
      } finally {
        setSendState("idle");
        setSendForm({ name: "", email: "", subject: "", message: "" });
        sendFormRef.current = { name: "", email: "", subject: "", message: "" };
      }
      return;
    }

    if (authStateRef.current === "awaiting_email") {
      if (!trimmedInput) return;
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
      if (!isEmailValid) {
        playKeySound("bell", soundEnabledRef.current);
        term.writeln("\r\n  \x1b[31m🔴 Invalid email format. Please enter a valid admin email:\x1b[0m");
        return;
      }
      authEmailRef.current = trimmedInput;
      setAuthEmail(trimmedInput);
      term.writeln("\r\n  \x1b[36mEnter Password:\x1b[0m");
      setAuthState("awaiting_password");
      return;
    }

    if (authStateRef.current === "awaiting_password") {
      const emailToAuthenticate = authEmailRef.current;
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
        playKeySound("bell", soundEnabledRef.current);
        const errorMsg = err instanceof Error ? err.message : String(err);
        term.writeln(`  \x1b[31m🔴 Access Denied: ${errorMsg}\x1b[0m`);
      } finally {
        setAuthState("idle");
        setAuthEmail("");
        authEmailRef.current = "";
      }
      return;
    }

    const trimmedCmd = trimmedInput.toLowerCase();
    if (!trimmedCmd) return;

    setCommandHistory((prev) => [...prev, trimmedInput]);
    setHistoryIndex(-1);

    // Audio Commands
    if (trimmedCmd === "sound" || trimmedCmd === "sound status") {
      term.writeln(`\r\n  🔊 Retro Mechanical Audio Feedback: \x1b[1m${soundEnabledRef.current ? "ENABLED (ON)" : "DISABLED (OFF)"}\x1b[0m`);
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
      const nextState = !soundEnabledRef.current;
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

    // Exit / Logout Handler (SSH & Admin Session)
    if (trimmedCmd === "exit" || trimmedCmd === "logout") {
      if (sshSessionRef.current) {
        term.writeln(`\r\n  Connection to ${sshSessionRef.current.host} closed by remote host.`);
        term.writeln("  Returned to local terminal session.");
        setSshSession(null);
        return;
      }

      if (currentUserRef.current) {
        term.writeln("\r\n  Signing out from admin session...");
        try {
          await supabase.auth.signOut();
          setCurrentUser(null);
          currentUserRef.current = null;
          term.writeln("  \x1b[32m🟢 Admin session ended. Logged out successfully.\x1b[0m");
        } catch (err: unknown) {
          playKeySound("bell", soundEnabledRef.current);
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
      const pingOutput = executePing(host);
      pingOutput.forEach((line) => term.writeln(line));
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
        if (themes[tName] && xtermRef.current) {
          setThemeName(tName);
          saveTheme(tName);
          const xTheme = xtermThemeMap[tName] || xtermThemeMap.default;
          xtermRef.current.options.theme = xTheme;
          term.writeln(`\r\n  \x1b[32m🎨 Theme switched to '${tName}'!\x1b[0m`);
        } else {
          playKeySound("bell", soundEnabledRef.current);
          term.writeln(`\r\n  \x1b[31mError: Theme '${tName}' not found. Type 'theme' to view options.\x1b[0m`);
        }
        return;
      }
    }

    // VFS Commands
    if (trimmedCmd === "pwd") {
      term.writeln(`\r\n  ${currentDirRef.current}`);
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

      const lines = formatLsOutput(vfsRef.current, currentDirRef.current, targetPath, showAll, showLong);
      term.writeln("");
      lines.forEach((l) => term.writeln(l));
      return;
    }

    if (trimmedCmd.startsWith("mkdir ")) {
      const dirName = trimmedInput.slice(6).trim();
      const res = executeMkdir(vfsRef.current, currentDirRef.current, dirName, sshSessionRef.current ? sshSessionRef.current.user : "karan");
      if (res.updatedRoot) setVfs(res.updatedRoot);
      if (!res.success) playKeySound("bell", soundEnabledRef.current);
      term.writeln(`\r\n  ${res.message}`);
      return;
    }

    if (trimmedCmd.startsWith("touch ")) {
      const fileName = trimmedInput.slice(6).trim();
      const res = executeTouch(vfsRef.current, currentDirRef.current, fileName, sshSessionRef.current ? sshSessionRef.current.user : "karan");
      if (res.updatedRoot) setVfs(res.updatedRoot);
      if (!res.success) playKeySound("bell", soundEnabledRef.current);
      term.writeln(`\r\n  ${res.message}`);
      return;
    }

    if (trimmedCmd.startsWith("rm ")) {
      const rest = trimmedCmd.slice(3).trim();
      const isRecursive = rest.startsWith("-r ") || rest.startsWith("-rf ");
      const targetName = isRecursive ? rest.replace(/^-r[f]?\s+/, "") : rest;

      const res = executeRm(vfsRef.current, currentDirRef.current, targetName, isRecursive);
      if (res.updatedRoot) setVfs(res.updatedRoot);
      if (!res.success) playKeySound("bell", soundEnabledRef.current);
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
        const lines = executeCat(vfsRef.current, currentDirRef.current, fileName);
        if (lines.length > 0 && lines[0].includes("No such file")) playKeySound("bell", soundEnabledRef.current);
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
        const res = executeWriteFile(vfsRef.current, currentDirRef.current, filePath, rawText, isAppend, sshSessionRef.current ? sshSessionRef.current.user : "karan");
        if (res.updatedRoot) setVfs(res.updatedRoot);
        if (!res.success) playKeySound("bell", soundEnabledRef.current);
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
      treeOutput.forEach((l) => term.writeln(l));
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
      const matches = skillsList.filter((s) => s.toLowerCase().includes(termQuery));
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
        playKeySound("bell", soundEnabledRef.current);
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
        playKeySound("bell", soundEnabledRef.current);
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
        playKeySound("bell", soundEnabledRef.current);
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
        playKeySound("bell", soundEnabledRef.current);
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
        playKeySound("bell", soundEnabledRef.current);
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
          supabase.from("certifications").select("*").ilike("name", `%${queryTerm}%`)
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
        playKeySound("bell", soundEnabledRef.current);
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
      if (sshSessionRef.current) {
        term.writeln(`\r\n  User: ${sshSessionRef.current.user} | Host: ${sshSessionRef.current.host} (SSH)`);
      } else if (currentUserRef.current) {
        term.writeln(`\r\n  User: admin | Email: ${currentUserRef.current.email} | Role: authenticated`);
      } else {
        term.writeln("\r\n  User: guest | Role: anonymous");
      }
      return;
    }

    if (trimmedCmd === "fetch" || trimmedCmd === "neofetch") {
      const hostStr = sshSessionRef.current ? sshSessionRef.current.host : "portfolio-os";
      term.writeln(`\r\n  \x1b[1;36m⚡ karan@${hostStr} ⚡\x1b[0m`);
      term.writeln("  -----------------------");
      term.writeln("  OS       → PortfolioOS v3.0 (xterm.js VT100 Engine)");
      term.writeln("  Host     → karangholap.com");
      term.writeln("  Kernel   → React 18 + Vite 5 + Canvas Terminal Engine");
      term.writeln(`  Audio    → Mechanical Audio Synthesizer (${soundEnabledRef.current ? "ON" : "OFF"})`);
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
      if (currentUserRef.current) {
        term.writeln(`\r\n  Already authenticated as: ${currentUserRef.current.email}`);
        return;
      }
      term.writeln("\r\n  Starting Admin Authentication Flow... (Press Esc to cancel)");
      term.writeln("  Enter Admin Email:");
      setAuthState("awaiting_email");
      return;
    }

    if (trimmedCmd === "sudo messages" || trimmedCmd === "messages") {
      if (!currentUserRef.current) {
        playKeySound("bell", soundEnabledRef.current);
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
        playKeySound("bell", soundEnabledRef.current);
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
      playKeySound("bell", soundEnabledRef.current);
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
            const currentNode = getNodeAtPath(vfsRef.current, currentDirRef.current);
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
        const displayLine = authStateRef.current === "awaiting_password" ? "*".repeat(line.length) : line;
        
        const ghost = (pos === line.length && authStateRef.current !== "awaiting_password") ? getGhostSuggestion(line) : "";
        const ghostAnsi = ghost ? `\x1b[90m${ghost}\x1b[0m` : "";

        xtermRef.current.write(`\r${promptStr}${displayLine}${ghostAnsi}\x1b[K`);
        const moveBack = (displayLine.length + ghost.length) - pos;
        if (moveBack > 0) {
          xtermRef.current.write(`\x1b[${moveBack}D`);
        }
      };

      term.onData((data) => {
        // Audio keypress
        if (data === "\r") {
          playKeySound("enter", soundEnabledRef.current);
        } else if (data === " ") {
          playKeySound("space", soundEnabledRef.current);
        } else if (data === "\x7f" || data === "\b") {
          playKeySound("backspace", soundEnabledRef.current);
        } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
          playKeySound("key", soundEnabledRef.current);
        }

        // Enter
        if (data === "\r") {
          term.write("\r\n");
          const fullCmd = currentLine;
          currentLine = "";
          cursorPos = 0;
          syncHistoryIdx = -1;
          setHistoryIndex(-1);

          handleCommand(fullCmd).then(() => {
            if (activeViewRef.current !== "top") {
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
          setHistoryIndex(-1);
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
          const history = commandHistoryRef.current;
          if (history.length > 0) {
            if (syncHistoryIdx < history.length - 1) {
              syncHistoryIdx++;
              setHistoryIndex(syncHistoryIdx);
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
          const history = commandHistoryRef.current;
          if (syncHistoryIdx > 0) {
            syncHistoryIdx--;
            setHistoryIndex(syncHistoryIdx);
            const targetCmd = history[history.length - 1 - syncHistoryIdx] || "";
            currentLine = targetCmd;
            cursorPos = targetCmd.length;
            redrawLine(currentLine, cursorPos);
          } else if (syncHistoryIdx === 0) {
            syncHistoryIdx = -1;
            setHistoryIndex(-1);
            currentLine = "";
            cursorPos = 0;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // Home key (\x1b[H or \x1b[1~ or \x1b[7~)
        if (data === "\x1b[H" || data === "\x1b[1~" || data === "\x1b[7~") {
          if (cursorPos > 0) {
            cursorPos = 0;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // End key (\x1b[F or \x1b[4~ or \x1b[8~)
        if (data === "\x1b[F" || data === "\x1b[4~" || data === "\x1b[8~") {
          if (cursorPos < currentLine.length) {
            cursorPos = currentLine.length;
            redrawLine(currentLine, cursorPos);
          }
          return;
        }

        // Delete key (\x1b[3~)
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
              playKeySound("bell", soundEnabledRef.current);
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

  // Window Resize Listener
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fit on Fullscreen toggle
  useEffect(() => {
    setTimeout(() => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
          xtermRef.current?.focus();
        } catch {
          // ignore
        }
      }
    }, 200);
  }, [isFullscreen]);

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
          <TerminalIcon size={20} className="text-[hsl(175,100%,50%)]" />
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