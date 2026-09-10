import { useState, useEffect, useRef } from "react";
import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import { Menu, X, Search, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Resume", href: "/resume" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ];

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const handleOpenCommandPalette = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <nav className="relative py-8" ref={menuRef}>
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-center gap-6">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            end={item.href === "/"}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-foreground font-medium"
          >
            {item.label}
          </NavLink>
        ))}
        <ThemeToggle />
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleOpenCommandPalette}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/60 flex items-center gap-1.5 text-xs"
            aria-label="Open Command Palette"
            title="Search & Commands"
          >
            <Search size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/60"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden mt-3 flex flex-col gap-1 border border-border rounded-xl p-3 bg-background/95 backdrop-blur-md shadow-xl z-50 relative"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                end={item.href === "/"}
                className="text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg px-3 py-2.5 transition-colors flex items-center"
                activeClassName="text-foreground font-medium bg-secondary/70"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <div className="border-t border-border/60 my-1 pt-1">
              <button
                type="button"
                onClick={handleOpenCommandPalette}
                className="w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg px-3 py-2.5 transition-colors flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  <span>Search & Commands</span>
                </span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted/60 border border-border rounded">
                  ⌘K
                </kbd>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
