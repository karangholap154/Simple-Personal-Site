import { Mail, Github, Linkedin, Instagram, Coffee } from "lucide-react";
import { Link } from "react-router-dom";
import signatureImage from "@/assets/signature.png";

const Footer = () => {
  return (
    <footer className="py-8 border-t border-border mt-8 space-y-5">
      {/* Secondary Quick Links */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            to="/expenses"
            className="hover:text-foreground transition-colors"
          >
            Daily Expense Tracker
          </Link>
          <span className="text-border">•</span>
          <Link
            to="/private-academy"
            className="hover:text-foreground transition-colors"
          >
            Private Academy
          </Link>
          <span className="text-border">•</span>
          <Link
            to="/support"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <span>Support</span>
            <Coffee size={12} className="text-amber-500" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted/50 border border-border rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Main footer line */}
      <div className="flex items-center justify-between pt-2">
        <img 
          src={signatureImage} 
          alt="Karan Signature" 
          className="h-9 opacity-80 dark:invert-0"
        />
        <div className="flex items-center gap-5">
          <a
            href="mailto:karangholap@zohomail.in"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
          <a
            href="https://github.com/karangholap154"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href="https://x.com/TheKaranGholap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="X (Twitter)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/karangholap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
          <a
            href="https://www.instagram.com/thekarangholap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
