import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";

const Navigation = () => {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Resume", href: "/resume" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <nav className="flex items-center justify-center gap-6 py-8">
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
    </nav>
  );
};

export default Navigation;
