import { Mail, Github, Linkedin, Instagram, Coffee } from "lucide-react";
import { Link } from "react-router-dom";
import signatureImage from "@/assets/signature.png";

const Footer = () => {
  return (
    <footer className="py-8 border-t border-border">
      <div className="flex items-center justify-between">
        <img 
          src={signatureImage} 
          alt="Karan Signature" 
          className="h-10 opacity-80"
        />
        <div className="flex gap-6">
        <a
          href="mailto:karangholap@zohomail.in"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Email"
        >
          <Mail size={20} />
        </a>
        <a
          href="https://github.com/karangholap154"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="GitHub"
        >
          <Github size={20} />
        </a>
        <a
          href="https://x.com/TheKaranGholap"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="X (Twitter)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href="https://linkedin.com/in/karangholap"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="LinkedIn"
        >
          <Linkedin size={20} />
        </a>
        <a
          href="https://www.instagram.com/thekarangholap"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Instagram"
        >
          <Instagram size={20} />
        </a>
        <Link
          to="/support"
          className="text-muted-foreground coffee-glow"
          aria-label="Support"
        >
          <Coffee size={20} />
        </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
