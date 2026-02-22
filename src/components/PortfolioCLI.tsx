import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  "  about      - Learn about me",
  "  skills     - View my technical skills",
  "  projects   - See my featured projects",
  "  contact    - Get my contact info",
  "  social     - View my social links",
  "  resume     - Download my resume",
  "  matrix     - Enter the Matrix",
  "  joke       - Random dev joke",
  "  flip       - Flip a table",
  "  whoami     - Who are you?",
  "  date       - Current date & time",
  "  echo [msg] - Echo a message back",
  "  snake      - Play Snake! 🐍",
  "  clear      - Clear the terminal",
  "  help       - Show this help message",
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

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
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
    if (trimmedCmd === "whoami") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", "  You are a visitor on Karan's portfolio. Welcome! 🎉", ""] }]);
      return;
    }
    if (trimmedCmd === "date") {
      setHistory((prev) => [...prev, { command: cmd, output: ["", `  ${new Date().toLocaleString()}`, ""] }]);
      return;
    }
    if (trimmedCmd.startsWith("echo ")) {
      const msg = cmd.trim().slice(5);
      setHistory((prev) => [...prev, { command: cmd, output: [msg || ""] }]);
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
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
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
                className="flex items-center gap-1 sm:gap-2 flex-wrap"
              >
                <span className="text-[hsl(142,70%,55%)]">dev@karan:</span>
                <span className="text-[hsl(0,0%,50%)]">~</span>
                <span className="text-[hsl(0,0%,50%)]">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex-1 min-w-[100px] bg-transparent outline-none text-[hsl(0,0%,95%)] caret-[hsl(0,0%,95%)] transition-all"
                  spellCheck={false}
                  autoComplete="off"
                />
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 sm:h-5 bg-[hsl(0,0%,95%)]"
                />
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
        className={`fixed z-50 bg-[hsl(0,0%,12%)] border border-border shadow-xl hover:bg-[hsl(0,0%,18%)] transition-all overflow-hidden ${
          isMinimized
            ? "px-3 py-2 rounded-lg flex items-center gap-2"
            : "p-3 rounded-full"
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