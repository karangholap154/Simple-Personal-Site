import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const helpList = [
  "Available Commands (grouped by category):",
  "",
  "  📁 NAVIGATION & DISCOVERY",
  "    ls                     - List virtual directories & files",
  "    tree                   - Display directory structure tree",
  "    cd [page]              - Navigate to page (e.g. cd projects, cd resume)",
  "    open [target]          - Open page or social link (e.g. open github, open resume)",
  "    cat [file]             - View file contents (e.g. cat README.md, cat resume)",
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
  "  ⚡ INTERACTIVE & UTILITIES",
  "    send                   - Launch interactive message wizard to contact Karan",
  "    time / tz              - Display Pune, India timezone & local time",
  "    calc [expr]            - Calculate a math expression (e.g. calc 25 * 4)",
  "    shortcuts              - View CLI keybindings & hotkeys",
  "    whoami                 - Check current session role (Guest / Admin)",
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
  "contact", "social", "resume", "cat", "cat readme.md", "cat resume", "fetch", "neofetch",
  "ls", "tree", "cd", "open", "download", "time", "tz", "calc", "shortcuts", "whoami",
  "echo", "send", "sudo", "login", "logout", "messages", "sudo messages", "clear", "help"
];

const treeOutput = [
  "",
  "  portfolio-root/",
  "  ├── 📁 home/",
  "  ├── 📁 projects/",
  "  ├── 📁 resume/",
  "  ├── 📁 contact/",
  "  ├── 📁 gallery/",
  "  ├── 📁 private-academy/",
  "  ├── 📁 support/",
  "  ├── 📄 README.md",
  "  └── 📄 resume.pdf",
  "",
  "  💡 Tip: Type 'cd [directory]' or 'open [target]' to explore.",
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
  "    Esc         : Cancel active contact/login wizard",
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
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    if (authState !== "idle" || sendState !== "idle" || !input.trim()) return "";
    const q = input.toLowerCase();
    const match = availableCommands.find((c) => c.startsWith(q) && c !== q);
    if (!match) return "";
    return match.slice(q.length);
  })();

  // Listen to Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

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
    const target = targetStr.trim().toLowerCase().replace(/^\/+|\/+$/g, "");

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

    if (!target || target === "~" || target === "home") {
      navigate("/");
      setHistory((prev) => [...prev, { command: `${isCd ? "cd" : "open"} ${targetStr}`, output: ["", "  Navigated to Home page (/)", ""] }]);
      return;
    }

    if (routes[target]) {
      navigate(routes[target]);
      setHistory((prev) => [...prev, { command: `${isCd ? "cd" : "open"} ${targetStr}`, output: ["", `  Navigated to ${routes[target]}`, ""] }]);
      return;
    }

    if (externalLinks[target]) {
      window.open(externalLinks[target], "_blank", "noopener,noreferrer");
      setHistory((prev) => [...prev, { command: `open ${targetStr}`, output: ["", `  Opening external link: ${externalLinks[target]}`, ""] }]);
      return;
    }

    if (target.startsWith("http://") || target.startsWith("https://")) {
      window.open(target, "_blank", "noopener,noreferrer");
      setHistory((prev) => [...prev, { command: `open ${targetStr}`, output: ["", `  Opening URL: ${target}`, ""] }]);
      return;
    }

    setHistory((prev) => [
      ...prev,
      { command: `${isCd ? "cd" : "open"} ${targetStr}`, output: ["", `  Error: target '${targetStr}' not found. Type 'ls' or 'help' to see valid targets.`, ""] }
    ]);
  };

  const handleCommand = async (cmd: string) => {
    const trimmedInput = cmd.trim();

    if (sendState === "awaiting_name") {
      if (!trimmedInput) return;
      setSendForm((prev) => ({ ...prev, name: trimmedInput }));
      setHistory((prev) => [
        ...prev,
        { command: "Name: " + trimmedInput, output: ["", "  Step 2/4: Enter your email address:", ""] }
      ]);
      setSendState("awaiting_email");
      return;
    }

    if (sendState === "awaiting_email") {
      if (!trimmedInput) return;
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
      if (!isEmailValid) {
        setHistory((prev) => [
          ...prev,
          { command: "Email: " + trimmedInput, output: ["", "  🔴 Invalid email format. Please enter a valid email address (e.g. alex@example.com):", ""] }
        ]);
        return;
      }
      setSendForm((prev) => ({ ...prev, email: trimmedInput }));
      setHistory((prev) => [
        ...prev,
        { command: "Email: " + trimmedInput, output: ["", "  Step 3/4: Subject / Topic?", ""] }
      ]);
      setSendState("awaiting_subject");
      return;
    }

    if (sendState === "awaiting_subject") {
      if (!trimmedInput) return;
      setSendForm((prev) => ({ ...prev, subject: trimmedInput }));
      setHistory((prev) => [
        ...prev,
        { command: "Subject: " + trimmedInput, output: ["", "  Step 4/4: Type your message body:", ""] }
      ]);
      setSendState("awaiting_message");
      return;
    }

    if (sendState === "awaiting_message") {
      if (!trimmedInput) return;
      const finalPayload = { ...sendForm, message: trimmedInput };
      setHistory((prev) => [
        ...prev,
        { command: "Message: " + trimmedInput, output: ["", "  Connecting to database & delivering message..."] }
      ]);
      setSendState("submitting");

      try {
        const { error } = await supabase.from("contact_messages").insert([
          {
            name: finalPayload.name,
            email: finalPayload.email,
            subject: finalPayload.subject,
            message: finalPayload.message,
          },
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
        setHistory((prev) => [
          ...prev,
          {
            command: "",
            output: [
              "",
              `  🔴 Error sending message: ${msg}`,
              "  Please try again or email karangholap@zohomail.in directly.",
              "",
            ],
          },
        ]);
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
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: trimmedInput
        });
        if (error) throw error;
        setHistory((prev) => [
          ...prev,
          {
            command: "",
            output: ["", "  🟢 Authentication Successful!", "  Welcome, admin. You are now logged in.", ""]
          }
        ]);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [
          ...prev,
          {
            command: "",
            output: ["", `  🔴 Access Denied: ${errorMsg}`, ""]
          }
        ]);
      } finally {
        setAuthState("idle");
        setAuthEmail("");
      }
      return;
    }

    const trimmedCmd = trimmedInput.toLowerCase();
    if (!trimmedCmd) return;

    setCommandHistory((prev) => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    if (trimmedCmd === "clear") { setHistory([]); return; }
    if (trimmedCmd === "help" || trimmedCmd === "?") {
      setHistory((prev) => [...prev, { command: cmd, output: helpList }]);
      return;
    }

    if (trimmedCmd === "tree") {
      setHistory((prev) => [...prev, { command: cmd, output: treeOutput }]);
      return;
    }

    if (trimmedCmd === "shortcuts" || trimmedCmd === "keys") {
      setHistory((prev) => [...prev, { command: cmd, output: shortcutsOutput }]);
      return;
    }

    if (trimmedCmd === "time" || trimmedCmd === "tz") {
      setHistory((prev) => [...prev, { command: cmd, output: getTimezoneOutput() }]);
      return;
    }

    if (trimmedCmd === "download" || trimmedCmd === "download resume") {
      triggerResumeDownload();
      return;
    }

    if (trimmedCmd === "experience" || trimmedCmd === "work") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Fetching work experience from database..."] }]);
      try {
        const { data, error } = await supabase
          .from("experience")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  No work experience records found in database.", ""] }]);
        } else {
          const lines = ["", "  💼 WORK EXPERIENCE (from Supabase DB)", "  ==========================================="];
          data.forEach((item, idx) => {
            lines.push(
              `  [${idx + 1}] ${item.role} @ ${item.company}`,
              `      Duration : ${item.duration}`
            );
            if (Array.isArray(item.highlights) && item.highlights.length > 0) {
              item.highlights.forEach((h: string) => {
                lines.push(`      • ${h}`);
              });
            }
            lines.push("");
          });
          setHistory((prev) => [...prev, { command: "", output: lines }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error fetching experience: ${msg}`, ""] }]);
      }
      return;
    }

    if (trimmedCmd === "education") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Fetching education details from database..."] }]);
      try {
        const { data, error } = await supabase
          .from("education")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  No education records found in database.", ""] }]);
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
          setHistory((prev) => [...prev, { command: "", output: lines }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error fetching education: ${msg}`, ""] }]);
      }
      return;
    }

    if (trimmedCmd === "certifications" || trimmedCmd === "certs") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Fetching certifications from database..."] }]);
      try {
        const { data, error } = await supabase
          .from("certifications")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  No certification records found in database.", ""] }]);
        } else {
          const lines = ["", "  📜 CERTIFICATIONS (from Supabase DB)", "  ==========================================="];
          data.forEach((item) => {
            lines.push(`    🏆 ${item.name}`);
          });
          lines.push("");
          setHistory((prev) => [...prev, { command: "", output: lines }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error fetching certifications: ${msg}`, ""] }]);
      }
      return;
    }

    if (trimmedCmd === "projects") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Fetching all projects from database..."] }]);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  No projects found in database.", ""] }]);
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
          setHistory((prev) => [...prev, { command: "", output: lines }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error fetching projects: ${msg}`, ""] }]);
      }
      return;
    }

    if (trimmedCmd.startsWith("search ")) {
      const queryTerm = cmd.slice(7).trim();
      if (!queryTerm) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", "  Usage: search [term] (e.g. search React, search Engineering)", ""] }]);
        return;
      }
      setHistory((prev) => [...prev, { command: cmd, output: ["", `  Searching database for "${queryTerm}"...`] }]);
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
          setHistory((prev) => [...prev, { command: "", output: ["", `  No matching records found across database for "${queryTerm}".`, ""] }]);
        } else {
          setHistory((prev) => [...prev, { command: "", output: results }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  🔴 Error searching database: ${msg}`, ""] }]);
      }
      return;
    }

    if (trimmedCmd.startsWith("calc ")) {
      const expr = cmd.slice(5);
      const res = evaluateMath(expr);
      setHistory((prev) => [...prev, { command: cmd, output: ["", res, ""] }]);
      return;
    }

    if (trimmedCmd.startsWith("cat ")) {
      const filename = trimmedCmd.slice(4).trim().toLowerCase();
      if (filename === "readme.md" || filename === "readme" || filename === "bio") {
        setHistory((prev) => [...prev, { command: cmd, output: readmeOutput }]);
      } else if (filename === "resume" || filename === "resume.pdf") {
        setHistory((prev) => [...prev, { command: cmd, output: resumeTextOutput }]);
      } else if (filename === "contact") {
        setHistory((prev) => [...prev, { command: cmd, output: commandsInfo.contact as string[] }]);
      } else if (filename === "skills") {
        setHistory((prev) => [...prev, { command: cmd, output: commandsInfo.skills as string[] }]);
      } else {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  cat: ${filename}: No such file. Try 'cat README.md' or 'cat resume'`, ""] }]);
      }
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

    if (trimmedCmd.startsWith("cd")) {
      const target = cmd.slice(2);
      handleOpenOrCd(target, true);
      return;
    }

    if (trimmedCmd === "whoami" || trimmedCmd === "sudo whoami") {
      if (currentUser) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  User: admin`, `  Email: ${currentUser.email}`, `  Role: authenticated`, ""] }]);
      } else {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  User: guest`, `  Role: anonymous`, ""] }]);
      }
      return;
    }

    if (trimmedCmd === "fetch" || trimmedCmd === "neofetch") {
      const fetchOutput = [
        "",
        "  ⚡ karan@portfolio-os ⚡",
        "  -----------------------",
        "  OS       → PortfolioOS v2.0 (Web/Linux)",
        "  Host     → karangholap.com",
        "  Kernel   → React 18 + Vite 5 + TypeScript",
        "  Uptime   → 24/7 (Vercel CDN)",
        "  Shell    → portfolio-cli v2.0",
        "  Role     → Software Developer @ CandorWorks",
        "  Founder  → Private Academy Engineering",
        "  Location → Pune, India (UTC +5:30) 📍",
        "  Stack    → React, Node.js, TypeScript, Tailwind, Supabase",
        "",
      ];
      setHistory((prev) => [...prev, { command: cmd, output: fetchOutput }]);
      return;
    }

    if (trimmedCmd.startsWith("echo ")) {
      const msg = cmd.slice(5);
      setHistory((prev) => [...prev, { command: cmd, output: [msg || ""] }]);
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
        },
      ]);
      setSendState("awaiting_name");
      return;
    }

    if (trimmedCmd === "sudo" || trimmedCmd === "login" || trimmedCmd === "admin") {
      if (currentUser) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  Already authenticated as: ${currentUser.email}`, ""] }]);
        return;
      }
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Starting Admin Authentication Flow...", "  Press Escape at any time to cancel.", ""] }]);
      setAuthState("awaiting_email");
      return;
    }

    if (trimmedCmd === "logout") {
      if (!currentUser) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", "  Already logged out.", ""] }]);
        return;
      }
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Logging out..."] }]);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setHistory((prev) => [...prev, { command: "", output: ["", "  Logged out successfully. Goodbye!", ""] }]);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  Error during signout: ${errorMsg}`, ""] }]);
      }
      return;
    }

    if (trimmedCmd === "sudo messages" || trimmedCmd === "messages") {
      if (!currentUser) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", "  Permission Denied: You must be logged in as admin to view messages.", "  Type 'sudo' or 'login' to authenticate.", ""] }]);
        return;
      }

      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Reading contact messages from database..."] }]);

      try {
        const { data, error } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", "  Inbox is empty.", ""] }]);
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
          setHistory((prev) => [...prev, { command: "", output: lines }]);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  Error reading messages: ${errorMsg}`, ""] }]);
      }
      return;
    }

    if (trimmedCmd === "ls" || trimmedCmd === "dir") {
      const lsOutput = [
        "",
        "  drwxr-xr-x  2 karan staff  256 Sep  2 00:59 home/",
        "  drwxr-xr-x  2 karan staff  256 Sep  2 00:59 projects/",
        "  drwxr-xr-x  2 karan staff  256 Sep  2 00:59 resume/",
        "  drwxr-xr-x  2 karan staff  256 Sep  2 00:59 contact/",
        "  drwxr-xr-x  2 karan staff  256 Sep  2 00:59 gallery/",
        "  drwxr-xr-x  2 karan staff  256 Sep  2 00:59 private-academy/",
        "  -rw-r--r--  1 karan staff 2555 Sep  2 00:59 README.md",
        "  -rw-r--r--  1 karan staff  408 Sep  2 00:59 resume.pdf",
        "",
        "  💡 Tip: Type 'cd [directory]' to navigate or 'cat README.md' to view.",
        "",
      ];
      setHistory((prev) => [...prev, { command: cmd, output: lsOutput }]);
      return;
    }

    if (trimmedCmd.startsWith("skills search ")) {
      const term = trimmedCmd.slice(14).trim();
      if (!term) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", "  Usage: skills search [term]", ""] }]);
        return;
      }
      const skillsList = [
        "React.js", "Next.js", "HTML5", "CSS3", "JavaScript", "TypeScript", "Tailwind CSS", "Bootstrap", "Shadcn UI",
        "Node.js", "Express.js", "Python", "Flask", "PostgreSQL", "MySQL", "MongoDB", "Supabase",
        "Git", "GitHub", "Figma", "JIRA", "AWS", "Vercel", "Netlify", "VS Code", "Postman", "WordPress"
      ];
      const matches = skillsList.filter(s => s.toLowerCase().includes(term));
      if (matches.length > 0) {
        setHistory((prev) => [...prev, { 
          command: cmd, 
          output: ["", `  Found matching skills for "${term}":`, "", ...matches.map(m => `    • ${m}`), ""] 
        }]);
      } else {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  No matching skills found for "${term}"`, ""] }]);
      }
      return;
    }

    if (trimmedCmd.startsWith("projects filter ")) {
      const type = trimmedCmd.slice(16).trim();
      if (type !== "web" && type !== "mobile") {
        setHistory((prev) => [...prev, { command: cmd, output: ["", "  Usage: projects filter [web|mobile]", ""] }]);
        return;
      }

      setHistory((prev) => [...prev, { command: cmd, output: ["", `  Fetching ${type} projects from database...`] }]);

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("type", type)
          .order("order", { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          setHistory((prev) => [...prev, { command: "", output: ["", `  No ${type} projects found.`, ""] }]);
        } else {
          setHistory((prev) => [...prev, { 
            command: "", 
            output: [
              "",
              ...data.map((p, idx) => `  ${idx + 1}. ${p.title} (${p.role})\n     → ${p.description}`),
              ""
            ] 
          }]);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [...prev, { command: "", output: ["", `  Error fetching projects: ${errorMsg}`, ""] }]);
      }
      return;
    }

    const output = commandsInfo[trimmedCmd];
    if (output) {
      setHistory((prev) => [...prev, { command: cmd, output: Array.isArray(output) ? output : [output] }]);
    } else {
      setHistory((prev) => [...prev, { command: cmd, output: [`Command not found: ${cmd}`, "Type 'help' to see available commands."] }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" || (e.key === "ArrowRight" && ghostSuggestion && inputRef.current?.selectionStart === input.length)) {
      e.preventDefault();
      if (authState !== "idle" || !input.trim()) return;

      const query = input.toLowerCase().trim();
      const matches = availableCommands.filter((c) => c.startsWith(query));

      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        let commonPrefix = matches[0];
        for (let i = 1; i < matches.length; i++) {
          while (!matches[i].startsWith(commonPrefix)) {
            commonPrefix = commonPrefix.slice(0, -1);
          }
        }
        if (commonPrefix.length > query.length) {
          setInput(commonPrefix);
        } else {
          setHistory((prev) => [
            ...prev,
            { command: input, output: ["Matches: " + matches.join("  |  ")] }
          ]);
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
          className={`w-full overflow-hidden border border-border shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(175,100%,50%,0.1)] transition-shadow duration-300 ${
            isFullscreen ? "rounded-none" : "rounded-xl"
          }`}
          style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace" }}
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-[hsl(0,0%,12%)] border-b border-border">
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
              <span className="text-xs sm:text-sm text-[hsl(0,0%,60%)]">karan@portfolio:~</span>
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
            className={`bg-[hsl(0,0%,6%)] p-3 sm:p-4 overflow-y-auto cursor-text text-xs sm:text-sm ${
              isFullscreen
                ? "h-[calc(100vh-48px)]"
                : "h-[75vh] sm:h-[75vh] md:h-[60vh] lg:h-[500px]"
            }`}
          >
            {/* Welcome Message & Session Date/Time */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <p className="text-[hsl(0,0%,90%)] font-semibold mb-1 text-xs sm:text-sm flex items-center gap-2">
                <span>Welcome to Portfolio CLI v2.0</span>
                <span className="text-[hsl(175,100%,50%)]">⚡</span>
              </p>
              <p className="text-[hsl(0,0%,50%)] mb-3 text-xs">
                Session started: {sessionStartTime}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
              <p className="text-[hsl(0,0%,70%)] mb-3 sm:mb-4 text-xs sm:text-sm">
                Type '<span className="text-[hsl(0,0%,95%)]">help</span>' or '
                <span className="text-[hsl(0,0%,95%)]">?</span>' to list all commands.
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
                    <span className="text-[hsl(142,70%,55%)]">dev@karan</span>
                    <span className="text-[hsl(0,0%,50%)]">~</span>
                    <span className="text-[hsl(0,0%,50%)]">$</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-[hsl(0,0%,95%)]"
                    >
                      {item.command}
                    </motion.span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="mt-1 text-[hsl(0,0%,70%)]"
                  >
                    <AnimatePresence>
                      {item.output.map((line, lineIndex) => (
                        <motion.div
                          key={lineIndex}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          transition={{ delay: lineIndex * 0.03, duration: 0.2 }}
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
              className="flex items-center gap-1 sm:gap-2 flex-wrap w-full"
            >
              {sendState === "awaiting_name" ? (
                <span className="text-[hsl(175,100%,50%)] font-medium">Step 1/4 (Your Name):</span>
              ) : sendState === "awaiting_email" ? (
                <span className="text-[hsl(175,100%,50%)] font-medium">Step 2/4 (Your Email):</span>
              ) : sendState === "awaiting_subject" ? (
                <span className="text-[hsl(175,100%,50%)] font-medium">Step 3/4 (Subject):</span>
              ) : sendState === "awaiting_message" ? (
                <span className="text-[hsl(175,100%,50%)] font-medium">Step 4/4 (Message):</span>
              ) : sendState === "submitting" ? (
                <span className="text-muted-foreground animate-pulse">Delivering message...</span>
              ) : authState === "awaiting_email" ? (
                <span className="text-[hsl(200,80%,60%)]">Enter Email:</span>
              ) : authState === "awaiting_password" ? (
                <span className="text-[hsl(200,80%,60%)]">Enter Password:</span>
              ) : authState === "authenticating" ? (
                <span className="text-muted-foreground animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <span className="text-[hsl(142,70%,55%)]">
                    {currentUser ? "admin@karan" : "dev@karan"}
                  </span>
                  <span className="text-[hsl(0,0%,50%)]">~</span>
                  <span className="text-[hsl(0,0%,50%)]">{currentUser ? "#" : "$"}</span>
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
                    className="w-full bg-transparent outline-none text-[hsl(0,0%,95%)] caret-[hsl(0,0%,95%)] transition-all z-10 font-mono"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {ghostSuggestion && (
                    <span className="absolute left-0 pointer-events-none text-[hsl(0,0%,45%)] whitespace-pre select-none z-0 font-mono">
                      <span className="opacity-0">{input}</span>
                      {ghostSuggestion}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
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