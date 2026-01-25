import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import PortfolioCLI, { TerminalTrigger } from "@/components/PortfolioCLI";

const Navigation = () => {
  const [cliOpen, setCliOpen] = useState(false);
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Resume", href: "/resume" },
    { label: "Contact", href: "/contact" },
    { label: "Gallery", href: "/gallery" },
  ];

  return (
    <>
      <nav className="flex items-center justify-center gap-4 py-8">
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
        <TerminalTrigger onClick={() => setCliOpen(true)} />
        <ThemeToggle />
      </nav>
      <PortfolioCLI open={cliOpen} onOpenChange={setCliOpen} />
    </>
  );
};

export default Navigation;
