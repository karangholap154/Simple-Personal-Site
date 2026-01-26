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
    "and Founder of Private Academy Engineering.",
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
  resume: [
    "Resume:",
    "",
    "  Opening resume page...",
    "  Or visit: /resume",
  ],
  "open projects": "Navigating to projects page...",
};

interface HistoryItem {
  command: string;
  output: string[];
}

interface PortfolioCLIProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PortfolioCLI = ({ open, onOpenChange }: PortfolioCLIProps) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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
          output: [`Command not found: ${cmd}`, "Type 'help' to see available commands."],
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

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setIsFullscreen(false);
    setIsMinimized(false);
    onOpenChange(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`p-0 gap-0 overflow-hidden border-0 bg-transparent [&>button]:hidden transition-all duration-300 ${
          isFullscreen 
            ? 'max-w-[100vw] w-[100vw] h-[100vh] rounded-none' 
            : 'max-w-4xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw]'
        }`}
      >
        <VisuallyHidden>
          <DialogTitle>Portfolio CLI Terminal</DialogTitle>
        </VisuallyHidden>
        
        {/* Minimized State - Dock Bar */}
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
            }}
          >
            <button
              onClick={handleRestore}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-[hsl(0,0%,12%)] rounded-lg border border-border shadow-xl hover:bg-[hsl(0,0%,18%)] transition-colors"
              style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace" }}
            >
              <Terminal size={16} className="text-[hsl(175,100%,50%)]" />
              <span className="text-xs text-[hsl(0,0%,70%)] hidden sm:inline">karan@portfolio — zsh</span>
              <span className="text-xs text-[hsl(0,0%,70%)] sm:hidden">Terminal</span>
            </button>
          </motion.div>
        )}

        {/* Main Terminal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: isMinimized ? 0 : 1, 
            scale: isMinimized ? 0.5 : 1,
            y: isMinimized ? 100 : 0
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`w-full overflow-hidden border border-border shadow-2xl ${
            isFullscreen ? 'rounded-none' : 'rounded-xl'
          } ${isMinimized ? 'pointer-events-none' : ''}`}
          style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace" }}
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-[hsl(0,0%,12%)] border-b border-border">
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={handleClose}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(0,70%,55%)] hover:bg-[hsl(0,70%,45%)] transition-colors group relative"
                aria-label="Close terminal"
                title="Close"
              >
                <X size={8} className="absolute inset-0 m-auto text-[hsl(0,30%,20%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={handleMinimize}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(45,90%,55%)] hover:bg-[hsl(45,90%,45%)] transition-colors group relative"
                aria-label="Minimize terminal"
                title="Minimize"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[hsl(45,50%,20%)] opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold">−</span>
              </button>
              <button
                onClick={handleFullscreen}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,35%)] transition-colors group relative"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[hsl(142,50%,15%)] opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold">
                  {isFullscreen ? '↙' : '↗'}
                </span>
              </button>
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs sm:text-sm text-[hsl(0,0%,60%)]">karan@portfolio — zsh</span>
            </div>
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalRef}
            onClick={focusInput}
            className={`bg-[hsl(0,0%,6%)] p-3 sm:p-4 overflow-y-auto cursor-text text-xs sm:text-sm ${
              isFullscreen 
                ? 'h-[calc(100vh-48px)]' 
                : 'h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[500px]'
            }`}
          >
            {/* ASCII Art Name */}
            <pre className="text-[0.5rem] sm:text-xs md:text-sm leading-tight mb-3 sm:mb-4 overflow-x-auto whitespace-pre">
              <span className="text-[hsl(175,100%,50%)]">{ASCII_NAME}</span>
            </pre>

            {/* Welcome Message */}
            <p className="text-[hsl(0,0%,70%)] mb-1 text-xs sm:text-sm">
              Welcome to my portfolio CLI! <span className="inline-block">👋</span>
            </p>
            <p className="text-[hsl(0,0%,70%)] mb-3 sm:mb-4 text-xs sm:text-sm">
              Type '<span className="text-[hsl(0,0%,95%)]">help</span>' or '<span className="text-[hsl(0,0%,95%)]">?</span>' to see available commands.
            </p>

            {/* Command History */}
            <AnimatePresence>
              {history.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2 sm:mb-3"
                >
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <span className="text-[hsl(142,70%,55%)]">karan@portfolio</span>
                    <span className="text-[hsl(0,0%,50%)]">~</span>
                    <span className="text-[hsl(0,0%,50%)]">$</span>
                    <span className="text-[hsl(0,0%,95%)]">{item.command}</span>
                  </div>
                  <div className="mt-1 text-[hsl(0,0%,70%)]">
                    {item.output.map((line, lineIndex) => (
                      <div key={lineIndex} className="whitespace-pre overflow-x-auto">
                        {line || "\u00A0"}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Current Input Line */}
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="text-[hsl(142,70%,55%)]">karan@portfolio</span>
              <span className="text-[hsl(0,0%,50%)]">~</span>
              <span className="text-[hsl(0,0%,50%)]">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[100px] bg-transparent outline-none text-[hsl(0,0%,95%)] caret-[hsl(0,0%,95%)]"
                spellCheck={false}
                autoComplete="off"
              />
              <span className="w-2 h-4 sm:h-5 bg-[hsl(0,0%,95%)] animate-pulse" />
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// Terminal trigger button component
export const TerminalTrigger = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
      title="Open Terminal (Portfolio CLI)"
      aria-label="Open Terminal"
    >
      <Terminal size={18} />
    </button>
  );
};

export default PortfolioCLI;
