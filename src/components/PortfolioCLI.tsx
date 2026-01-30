import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const ASCII_NAME = `
██╗  ██╗ █████╗ ██████╗  █████╗ ███╗   ██╗
██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗████╗  ██║
█████╔╝ ███████║██████╔╝███████║██╔██╗ ██║
██╔═██╗ ██╔══██║██╔══██╗██╔══██║██║╚██╗██║
██║  ██╗██║  ██║██║  ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
`;

const commands: Record<string, string | string[]> = {
  help: [
    "Available commands:",
    "",
    "  about      - Learn about me",
    "  skills     - View my technical skills",
    "  projects   - See my featured projects",
    "  contact    - Get my contact info",
    "  social     - View my social links",
    "  resume     - Download my resume",
    "  clear      - Clear the terminal",
    "  help       - Show this help message",
  ],
  "?": [
    "Available commands:",
    "",
    "  about      - Learn about me",
    "  skills     - View my technical skills",
    "  projects   - See my featured projects",
    "  contact    - Get my contact info",
    "  social     - View my social links",
    "  resume     - Download my resume",
    "  clear      - Clear the terminal",
    "  help       - Show this help message",
  ],
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

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    if (!trimmedCmd) return;

    setCommandHistory((prev) => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    if (trimmedCmd === "clear") {
      setHistory([]);
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

    const output = commands[trimmedCmd];
    if (output) {
      setHistory((prev) => [
        ...prev,
        {
          command: cmd,
          output: Array.isArray(output) ? output : [output],
        },
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        {
          command: cmd,
          output: [
            `Command not found: ${cmd}`,
            "Type 'help' to see available commands.",
          ],
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex < commandHistory.length - 1
            ? historyIndex + 1
            : historyIndex;
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

  const focusInput = () => {
    inputRef.current?.focus();
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

  const handleRestore = () => {
    setIsMinimized(false);
    onMinimizeChange?.(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogContentRef}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
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
          transition={{
            duration: 0.4,
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
          className={`w-full overflow-hidden border border-border shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(175,100%,50%,0.1)] transition-shadow duration-300 ${
            isFullscreen ? "rounded-none" : "rounded-xl"
          }`}
          style={{
            fontFamily:
              "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
          }}
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
                <X
                  size={8}
                  className="absolute inset-0 m-auto text-[hsl(0,30%,20%)] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.button>
              <motion.button
                onClick={handleMinimize}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(45,90%,55%)] hover:bg-[hsl(45,90%,45%)] transition-colors group relative"
                aria-label="Minimize terminal"
                title="Minimize"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[hsl(45,50%,20%)] opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold">
                  −
                </span>
              </motion.button>
              <motion.button
                onClick={handleFullscreen}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,35%)] transition-colors group relative"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
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
              <span className="text-xs sm:text-sm text-[hsl(0,0%,60%)]">
                karan@portfolio:~
              </span>
            </motion.div>
          </div>

          {/* Terminal Body */}
          <motion.div
            ref={terminalRef}
            onClick={focusInput}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className={`bg-[hsl(0,0%,6%)] p-3 sm:p-4 overflow-y-auto cursor-text text-xs sm:text-sm ${
              isFullscreen
                ? "h-[calc(100vh-48px)]"
                : "h-[75vh] sm:h-[75vh] md:h-[60vh] lg:h-[500px]"
            }`}
          >
            {/* ASCII Art Name */}
            <motion.pre
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-[0.5rem] sm:text-xs md:text-sm leading-tight mb-3 sm:mb-4 overflow-x-auto whitespace-pre"
            >
              <span className="text-[hsl(175,100%,50%)]">{ASCII_NAME}</span>
            </motion.pre>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <p className="text-[hsl(0,0%,70%)] mb-1 text-xs sm:text-sm">
                Welcome to my portfolio CLI!{" "}
                <span className="inline-block">👋</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <p className="text-[hsl(0,0%,70%)] mb-3 sm:mb-4 text-xs sm:text-sm">
                Type '<span className="text-[hsl(0,0%,95%)]">help</span>' or '
                <span className="text-[hsl(0,0%,95%)]">?</span>' to see
                available commands.
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
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
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
                          transition={{
                            delay: lineIndex * 0.05,
                            duration: 0.2,
                          }}
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
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
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
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// Fixed Terminal Button - Bottom Right
export const FixedTerminalButton = () => {
  const [open, setOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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
          bottom: "24px",
          right: "24px",
          fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
        }}
        title={
          isMinimized ? "Restore Terminal" : "Open Terminal (Portfolio CLI)"
        }
        aria-label={isMinimized ? "Restore Terminal" : "Open Terminal"}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Terminal size={20} className="text-[hsl(175,100%,50%)]" />
        </motion.div>
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
