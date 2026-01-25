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
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (open) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden border-0 bg-transparent">
        <VisuallyHidden>
          <DialogTitle>Portfolio CLI Terminal</DialogTitle>
        </VisuallyHidden>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full rounded-xl overflow-hidden border border-border shadow-2xl"
          style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace" }}
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[hsl(0,0%,12%)] border-b border-border">
            <div className="flex gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)] hover:bg-[hsl(0,70%,45%)] transition-colors"
              />
              <div className="w-3 h-3 rounded-full bg-[hsl(45,90%,55%)]" />
              <div className="w-3 h-3 rounded-full bg-[hsl(142,70%,45%)]" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-sm text-[hsl(0,0%,60%)]">karan@portfolio — zsh</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,80%)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalRef}
            onClick={focusInput}
            className="bg-[hsl(0,0%,6%)] p-4 h-[400px] overflow-y-auto cursor-text text-sm"
          >
            {/* ASCII Art Name */}
            <pre className="text-xs sm:text-sm leading-tight mb-4 overflow-x-auto whitespace-pre">
              <span className="text-[hsl(175,100%,50%)]">{ASCII_NAME}</span>
            </pre>

            {/* Welcome Message */}
            <p className="text-[hsl(0,0%,70%)] mb-1">
              Welcome to my portfolio CLI! <span className="inline-block">👋</span>
            </p>
            <p className="text-[hsl(0,0%,70%)] mb-4">
              Type '<span className="text-[hsl(0,0%,95%)]">help</span>' or '<span className="text-[hsl(0,0%,95%)]">?</span>' to see available commands.
            </p>

            {/* Command History */}
            <AnimatePresence>
              {history.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(142,70%,55%)]">karan@portfolio</span>
                    <span className="text-[hsl(0,0%,50%)]">~</span>
                    <span className="text-[hsl(0,0%,50%)]">$</span>
                    <span className="text-[hsl(0,0%,95%)]">{item.command}</span>
                  </div>
                  <div className="mt-1 text-[hsl(0,0%,70%)]">
                    {item.output.map((line, lineIndex) => (
                      <div key={lineIndex} className="whitespace-pre">
                        {line || "\u00A0"}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Current Input Line */}
            <div className="flex items-center gap-2">
              <span className="text-[hsl(142,70%,55%)]">karan@portfolio</span>
              <span className="text-[hsl(0,0%,50%)]">~</span>
              <span className="text-[hsl(0,0%,50%)]">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-[hsl(0,0%,95%)] caret-[hsl(0,0%,95%)]"
                spellCheck={false}
                autoComplete="off"
              />
              <span className="w-2 h-5 bg-[hsl(0,0%,95%)] animate-pulse" />
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
