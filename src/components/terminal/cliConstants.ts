import { VFSNode } from "@/utils/virtualOS";

export const xtermThemeMap: Record<
  string,
  { background: string; foreground: string; cursor: string; selectionBackground: string }
> = {
  default: { background: "#0f0f0f", foreground: "#f0f0f0", cursor: "#00ffcc", selectionBackground: "#ffffff33" },
  matrix: { background: "#050B05", foreground: "#00FF66", cursor: "#00FF66", selectionBackground: "#00FF6644" },
  dracula: { background: "#282a36", foreground: "#f8f8f2", cursor: "#50fa7b", selectionBackground: "#44475a88" },
  cyberpunk: { background: "#0d0221", foreground: "#00f0ff", cursor: "#ff0055", selectionBackground: "#ff005544" },
  ubuntu: { background: "#300a24", foreground: "#ffffff", cursor: "#e95420", selectionBackground: "#e9542044" },
};

export const helpList = [
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

export const availableCommands = [
  "about", "skills", "skills search", "projects", "projects filter",
  "experience", "work", "education", "certs", "certifications", "search",
  "contact", "social", "resume", "cat", "cat README.md", "cat resume", "fetch", "neofetch",
  "ls", "ls -la", "ls -l", "ls -a", "pwd", "cd", "mkdir", "touch", "rm", "rm -r", "tree", "open", "download",
  "ssh", "ssh guest@karan-server", "exit", "top", "htop", "ping", "df", "df -h", "free", "free -m", "netstat",
  "sound", "sound on", "sound off", "sound toggle",
  "theme", "theme set matrix", "theme set dracula", "theme set cyberpunk", "theme set ubuntu", "theme set default",
  "time", "tz", "calc", "shortcuts", "whoami", "echo", "send", "sudo", "login", "logout", "messages", "sudo messages", "clear", "help"
];

export const readmeOutput = [
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

export const resumeTextOutput = [
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

export const shortcutsOutput = [
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

export const commandsInfo: Record<string, string | string[]> = {
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

export const evaluateMath = (expr: string): string => {
  try {
    const cleanExpr = expr.replace(/\^/g, "**").trim();
    if (!/^[0-9+\-*/%.()\s**]+$/.test(cleanExpr)) {
      return "  \x1b[31mError: Invalid math expression. Use standard arithmetic (e.g. calc 25 * 4 + 10).\x1b[0m";
    }
    const safeCalc = new Function(`"use strict"; return (${cleanExpr})`);
    const result = safeCalc();
    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return `  \x1b[1;32mResult: ${result}\x1b[0m`;
    }
    return "  \x1b[31mError: Could not calculate result.\x1b[0m";
  } catch {
    return "  \x1b[31mError: Invalid syntax in math expression.\x1b[0m";
  }
};

export const getTimezoneOutput = (): string[] => {
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

export const formatTreeOutput = (root: VFSNode): string[] => {
  const lines: string[] = ["", "  \x1b[1;34m/ (VFS Root)\x1b[0m"];

  const buildTree = (node: VFSNode, prefix: string) => {
    if (!node.children) return;
    const keys = Object.keys(node.children);
    keys.forEach((key, index) => {
      const child = node.children![key];
      const isLast = index === keys.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = prefix + (isLast ? "    " : "│   ");

      if (child.type === "dir") {
        lines.push(`  ${prefix}${connector}\x1b[1;34m${child.name}/\x1b[0m`);
        buildTree(child, childPrefix);
      } else {
        lines.push(`  ${prefix}${connector}${child.name}`);
      }
    });
  };

  buildTree(root, "");
  lines.push(
    "",
    "  \x1b[90m💡 Tip: Use 'cd [path]' to navigate directories and 'cat [file]' to view files.\x1b[0m",
    ""
  );
  return lines;
};
