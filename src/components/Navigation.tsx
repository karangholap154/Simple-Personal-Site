import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Resume", href: "/resume" },
    { label: "Contact", href: "/contact" },
    { label: "Gallery", href: "/gallery" },
  ];

  return (
    <nav className="relative py-8">
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
        <ThemeToggle />
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && isMobile && (
        <div className="md:hidden mt-4 flex flex-col gap-3 border border-border rounded-lg p-4 bg-background/95 backdrop-blur-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === "/"}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              activeClassName="text-foreground font-medium"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
