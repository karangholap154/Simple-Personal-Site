import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";

const GRID_W = 20;
const GRID_H = 12;
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
interface Pos { x: number; y: number; }

const renderSnakeGrid = (snake: Pos[], food: Pos, score: number, gameOver: boolean): string[] => {
  const grid: string[][] = [];
  for (let y = 0; y < GRID_H; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_W; x++) grid[y][x] = "·";
  }
  snake.forEach((s, i) => {
    if (s.y >= 0 && s.y < GRID_H && s.x >= 0 && s.x < GRID_W)
      grid[s.y][s.x] = i === 0 ? "█" : "▓";
  });
  if (food.y >= 0 && food.y < GRID_H && food.x >= 0 && food.x < GRID_W)
    grid[food.y][food.x] = "●";
  const border = "  +" + "─".repeat(GRID_W * 2) + "+";
  const lines = [
    "",
    "  🐍 SNAKE GAME — Arrow keys to move, Q/Esc to quit",
    "",
    `  Score: ${score}`,
    "",
    border,
  ];
  for (let y = 0; y < GRID_H; y++)
    lines.push("  |" + grid[y].map(c => c + " ").join("") + "|");
  lines.push(border);
  if (gameOver) lines.push("", "  💀 GAME OVER! Press Enter to restart or Q to quit.", "");
  return lines;
};

const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
  "A SQL query walks into a bar, sees two tables, and asks... 'Can I JOIN you?'",
  "!false — It's funny because it's true.",
  "There are only 10 types of people: those who understand binary and those who don't.",
  "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
  "What's a programmer's favorite hangout place? Foo Bar.",
  "Algorithm: a word used by programmers when they don't want to explain what they did.",
  "It works on my machine ¯\\_(ツ)_/¯",
];

const matrixChars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234789";

const generateMatrixLines = (): string[] => {
  const lines: string[] = ["", "  ⚡ Entering the Matrix... ⚡", ""];
  for (let i = 0; i < 6; i++) {
    let line = "  ";
    for (let j = 0; j < 40; j++)
      line += matrixChars[Math.floor(Math.random() * matrixChars.length)];
    lines.push(line);
  }
  lines.push("", "  Wake up, Karan... The Matrix has you.", "");
  return lines;
};

const flipTable = [
  "",
  "  (╯°□°)╯︵ ┻━┻",
  "",
  "  Table flipped successfully.",
  "  ...wait let me fix that.",
  "",
  "  ┬─┬ ノ( ゜-゜ノ)",
  "",
  "  There, all better. 😌",
];

const ASCII_NAME = `
██╗  ██╗ █████╗ ██████╗  █████╗ ███╗   ██╗
██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗████╗  ██║
█████╔╝ ███████║██████╔╝███████║██╔██╗ ██║
██╔═██╗ ██╔══██║██╔══██╗██╔══██║██║╚██╗██║
██║  ██╗██║  ██║██║  ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
`;

const helpList = [
  "Available commands:",
  "",
  "  about                  - Learn about me",
  "  skills                 - View my technical skills",
  "  skills search [term]   - Search for a specific skill",
  "  projects               - See my featured projects",
  "  projects filter [type] - Filter projects by 'web' or 'mobile'",
  "  contact                - Get my contact info",
  "  social                 - View my social links",
  "  resume                 - Download / open resume page",
  "  cat resume             - Print resume text in terminal",
  "  fetch / neofetch       - Display portfolio system info",
  "  ls / dir               - List virtual directories & files",
  "  cd [page]              - Navigate to page (e.g. cd projects)",
  "  history                - Show command history",
  "  banner                 - Show ASCII art banner",
  "  theme [light|dark]     - Check or change website theme",
  "  matrix                 - Enter the Matrix",
  "  joke                   - Random dev joke",
  "  flip                   - Flip a table",
  "  whoami                 - Who are you?",
  "  date                   - Current date & time",
  "  echo [msg]             - Echo a message back",
  "  snake                  - Play Snake! 🐍",
  "  send / msg             - Send a message directly to Karan via CLI",
  "  sudo / login           - Admin login flow",
  "  logout                 - Sign out from admin session",
  "  sudo messages          - View recent contact submissions (admin)",
  "  clear                  - Clear the terminal",
  "  help                   - Show this help message",
  "",
  "  💡 Tip: Press [Tab] or [→] for zsh-style ghost auto-complete!",
];

const commands: Record<string, string | string[]> = {
  help: helpList,
  "?": helpList,
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
    "  Frontend   → React.js, Next.js, TypeScript, Tailwind CSS",
    "  Backend    → Node.js, Express.js, Python, REST APIs",
    "  Database   → MongoDB, PostgreSQL, MySQL",
    "  DevOps     → Git, Docker, AWS, Vercel",
    "  Tools      → VS Code, Figma, Postman",
  ],
  projects: [
    "Featured Projects:",
    "",
    "  1. Private Academy Engineering",
    "     → Educational platform for engineering students",
    "",
    "  2. PrivMate - AI Study Companion",
    "     → AI-powered study companion",
    "",
    "  3. Bilix - Invoice Generator",
    "     → Sleek invoice generator with customizable templates",
    "",
    "Type 'open projects' to view all projects",
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
  resume: ["Resume:", "", "  Opening resume page...", "  Or visit: /resume"],
  "open projects": "Navigating to projects page...",
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
  isMinimizedGlobally,
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

  type SendState = "idle" | "awaiting_name" | "awaiting_email" | "awaiting_subject" | "awaiting_message" | "submitting";
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendForm, setSendForm] = useState({ name: "", email: "", subject: "", message: "" });

  const [authState, setAuthState] = useState<"idle" | "awaiting_email" | "awaiting_password" | "authenticating">("idle");
  const [authEmail, setAuthEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();

  const availableCommands = [
    "about", "skills", "skills search", "projects", "projects filter",
    "contact", "social", "resume", "cat resume", "fetch", "neofetch",
    "ls", "dir", "cd", "history", "banner", "theme", "matrix", "joke",
    "flip", "whoami", "date", "echo", "snake", "send", "msg", "contact send",
    "sudo", "login", "logout", "messages", "clear", "help"
  ];

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

  const [snakeActive, setSnakeActive] = useState(false);
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 6 }]);
  const [food, setFood] = useState<Pos>({ x: 15, y: 6 });
  const [snakeDir, setSnakeDir] = useState<Dir>("RIGHT");
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const snakeDirRef = useRef<Dir>("RIGHT");
  const snakeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnFood = useCallback((currentSnake: Pos[]): Pos => {
    let pos: Pos;
    do {
      pos = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) };
    } while (currentSnake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const startSnake = useCallback(() => {
    const initial = [{ x: 10, y: 6 }];
    setSnake(initial);
    setFood(spawnFood(initial));
    setSnakeDir("RIGHT");
    snakeDirRef.current = "RIGHT";
    setSnakeScore(0);
    setSnakeGameOver(false);
    setSnakeActive(true);
  }, [spawnFood]);

  const stopSnake = useCallback(() => {
    setSnakeActive(false);
    if (snakeTimerRef.current) clearInterval(snakeTimerRef.current);
    snakeTimerRef.current = null;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (!snakeActive || snakeGameOver) {
      if (snakeTimerRef.current) clearInterval(snakeTimerRef.current);
      return;
    }
    snakeTimerRef.current = setInterval(() => {
      setSnake(prev => {
        const head = { ...prev[0] };
        const dir = snakeDirRef.current;
        if (dir === "UP") head.y--;
        else if (dir === "DOWN") head.y++;
        else if (dir === "LEFT") head.x--;
        else head.x++;

        if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H || prev.some(s => s.x === head.x && s.y === head.y)) {
          setSnakeGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        setFood(f => {
          if (head.x === f.x && head.y === f.y) {
            setSnakeScore(s => s + 1);
            const spawned = spawnFood(newSnake);
            setTimeout(() => setFood(spawned), 0);
            return f;
          }
          newSnake.pop();
          return f;
        });
        return newSnake;
      });
    }, 150);
    return () => { if (snakeTimerRef.current) clearInterval(snakeTimerRef.current); };
  }, [snakeActive, snakeGameOver, spawnFood]);

  useEffect(() => {
    if (!snakeActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "Escape") { e.preventDefault(); stopSnake(); return; }
      if (snakeGameOver && e.key === "Enter") { e.preventDefault(); startSnake(); return; }
      const cur = snakeDirRef.current;
      if (e.key === "ArrowUp" && cur !== "DOWN") { e.preventDefault(); snakeDirRef.current = "UP"; setSnakeDir("UP"); }
      else if (e.key === "ArrowDown" && cur !== "UP") { e.preventDefault(); snakeDirRef.current = "DOWN"; setSnakeDir("DOWN"); }
      else if (e.key === "ArrowLeft" && cur !== "RIGHT") { e.preventDefault(); snakeDirRef.current = "LEFT"; setSnakeDir("LEFT"); }
      else if (e.key === "ArrowRight" && cur !== "LEFT") { e.preventDefault(); snakeDirRef.current = "RIGHT"; setSnakeDir("RIGHT"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [snakeActive, snakeGameOver, stopSnake, startSnake]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, snake]);

  useEffect(() => {
    if (open) {
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

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
              `  Thank you, ${finalPayload.name}! Your message has been stored.`,
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

    if (trimmedCmd === "snake") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  Starting Snake... Use arrow keys to move! 🐍", ""] }]);
      startSnake();
      return;
    }

    if (trimmedCmd === "resume" || trimmedCmd === "open resume") {
      window.location.href = "/resume";
      return;
    }

    if (trimmedCmd === "open projects") {
      window.location.href = "/projects";
      return;
    }

    if (trimmedCmd === "matrix") {
      setHistory((prev) => [...prev, { command: cmd, output: generateMatrixLines() }]);
      return;
    }
    if (trimmedCmd === "joke") {
      const j = jokes[Math.floor(Math.random() * jokes.length)];
      setHistory((prev) => [...prev, { command: cmd, output: ["", `  ${j}`, ""] }]);
      return;
    }
    if (trimmedCmd === "flip") {
      setHistory((prev) => [...prev, { command: cmd, output: flipTable }]);
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
    if (trimmedCmd === "date") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", `  ${new Date().toLocaleString()}`, ""] }]);
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
        "  Shell    → portfolio-cli v1.0",
        "  Role     → Software Developer @ CandorWorks",
        "  Founder  → Private Academy Engineering",
        "  Location → Pune, India (UTC +5:30) 📍",
        "  Stack    → React, Node.js, TypeScript, Tailwind, Supabase",
        "  Theme    → Custom Dark / Light Mode",
        "",
      ];
      setHistory((prev) => [...prev, { command: cmd, output: fetchOutput }]);
      return;
    }
    if (trimmedCmd === "cat resume") {
      const resumeOutput = [
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
        "  Type 'resume' or visit /resume to view/download full PDF.",
        "",
      ];
      setHistory((prev) => [...prev, { command: cmd, output: resumeOutput }]);
      return;
    }
    if (trimmedCmd.startsWith("echo ")) {
      const msg = cmd.trim().slice(5);
      setHistory((prev) => [...prev, { command: cmd, output: [msg || ""] }]);
      return;
    }

    // New Interactive Commands
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
        "  💡 Tip: Type 'cd [directory]' to navigate or 'cat resume' to view.",
        "",
      ];
      setHistory((prev) => [...prev, { command: cmd, output: lsOutput }]);
      return;
    }

    if (trimmedCmd.startsWith("cd")) {
      const targetDir = trimmedCmd.slice(2).trim().replace(/^\/+|\/+$/g, "");
      const validRoutes: Record<string, string> = {
        home: "/",
        index: "/",
        projects: "/projects",
        resume: "/resume",
        contact: "/contact",
        gallery: "/gallery",
        "private-academy": "/private-academy",
        support: "/support",
      };
      if (targetDir === "" || targetDir === "~" || targetDir === "home") {
        window.location.href = "/";
        return;
      }
      if (validRoutes[targetDir]) {
        window.location.href = validRoutes[targetDir];
        return;
      }
      setHistory((prev) => [...prev, { command: cmd, output: ["", `  cd: no such directory: ${targetDir}`, ""] }]);
      return;
    }

    if (trimmedCmd === "history") {
      if (commandHistory.length === 0) {
        setHistory((prev) => [...prev, { command: cmd, output: ["", "  No command history recorded yet.", ""] }]);
      } else {
        const histLines = ["", "  --- COMMAND HISTORY ---", ""];
        commandHistory.forEach((c, idx) => {
          histLines.push(`  ${(idx + 1).toString().padStart(3, " ")}  ${c}`);
        });
        histLines.push("");
        setHistory((prev) => [...prev, { command: cmd, output: histLines }]);
      }
      return;
    }

    if (trimmedCmd === "banner") {
      setHistory((prev) => [...prev, { command: cmd, output: [ASCII_NAME] }]);
      return;
    }

    if (trimmedCmd.startsWith("theme")) {
      const targetTheme = trimmedCmd.slice(5).trim();
      if (targetTheme === "light" || targetTheme === "dark") {
        setTheme(targetTheme);
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  Theme changed to ${targetTheme} ⚡`, ""] }]);
      } else {
        setHistory((prev) => [...prev, { command: cmd, output: ["", `  Current theme: ${theme || "dark"}. Usage: theme [light|dark]`, ""] }]);
      }
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

    const output = commands[trimmedCmd];
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

  const handleRestore = () => {
    setIsMinimized(false);
    onMinimizeChange?.(false);
    setTimeout(() => inputRef.current?.focus(), 100);
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
            {/* ASCII Art */}
            <motion.pre
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-[0.5rem] sm:text-xs md:text-sm leading-tight mb-3 sm:mb-4 overflow-x-auto whitespace-pre"
            >
              <span className="text-[hsl(175,100%,50%)]">{ASCII_NAME}</span>
            </motion.pre>

            {/* Welcome Message */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
              <p className="text-[hsl(0,0%,70%)] mb-1 text-xs sm:text-sm">
                Welcome to my portfolio CLI! <span className="inline-block">👋</span>
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.4 }}>
              <p className="text-[hsl(0,0%,70%)] mb-3 sm:mb-4 text-xs sm:text-sm">
                Type '<span className="text-[hsl(0,0%,95%)]">help</span>' or '
                <span className="text-[hsl(0,0%,95%)]">?</span>' to see available commands.
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
                          transition={{ delay: lineIndex * 0.05, duration: 0.2 }}
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

            {/* Snake Game Area */}
            {snakeActive && (
              <div className="mb-2 sm:mb-3 text-[hsl(142,70%,55%)]">
                {renderSnakeGrid(snake, food, snakeScore, snakeGameOver).map((line, i) => (
                  <div key={i} className="whitespace-pre overflow-x-auto leading-tight text-[0.65rem] sm:text-xs">
                    {line || "\u00A0"}
                  </div>
                ))}
              </div>
            )}

            {/* Current Input Line */}
            {!snakeActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
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