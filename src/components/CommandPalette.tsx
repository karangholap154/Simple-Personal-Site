import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  FolderKanban,
  FileText,
  Mail,
  Image,
  GraduationCap,
  Coffee,
  Wallet,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Copy,
  Download,
  Moon,
  Sun,
  Terminal,
} from "lucide-react";

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("karangholap@zohomail.in");
      toast({
        title: "Email copied!",
        description: "karangholap@zohomail.in copied to clipboard.",
      });
    } catch {
      toast({
        title: "karangholap@zohomail.in",
        description: "Copy manually if clipboard access is blocked.",
      });
    }
  };

  const navPages = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Projects", icon: FolderKanban, href: "/projects" },
    { name: "Resume", icon: FileText, href: "/resume" },
    { name: "Gallery", icon: Image, href: "/gallery" },
    { name: "Contact", icon: Mail, href: "/contact" },
  ];

  const appProjects = [
    { name: "Daily Expense Tracker", icon: Wallet, href: "/expenses", badge: "Live Web App" },
    { name: "Private Academy Engineering", icon: GraduationCap, href: "/private-academy", badge: "EdTech Platform" },
  ];

  const externalLinks = [
    { name: "GitHub (@karangholap154)", icon: Github, href: "https://github.com/karangholap154" },
    { name: "LinkedIn (in/karangholap)", icon: Linkedin, href: "https://linkedin.com/in/karangholap" },
    { name: "X / Twitter (@TheKaranGholap)", icon: Twitter, href: "https://x.com/TheKaranGholap" },
    { name: "Instagram (@thekarangholap)", icon: Instagram, href: "https://www.instagram.com/thekarangholap" },
    { name: "Buy Me a Coffee", icon: Coffee, href: "https://buymeacoffee.com/karangholap" },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="max-h-[50vh] sm:max-h-[340px] overflow-y-auto overflow-x-hidden">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {navPages.map((page) => (
            <CommandItem
              key={page.href}
              onSelect={() => runCommand(() => navigate(page.href))}
              className="cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="flex items-center min-w-0">
                <page.icon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{page.name}</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono shrink-0">
                {page.href}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Apps & Interactive Projects */}
        <CommandGroup heading="Apps & Featured Projects">
          {appProjects.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => navigate(item.href))}
              className="cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="flex items-center min-w-0">
                <item.icon className="mr-2 h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/50 shrink-0">
                {item.badge}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
            }
            className="cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="flex items-center min-w-0">
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="mr-2 h-4 w-4 text-blue-400 shrink-0" />
              )}
              <span className="truncate">Toggle Theme</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono shrink-0">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(handleCopyEmail)}
            className="cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="flex items-center min-w-0">
              <Copy className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">Copy Email Address</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono shrink-0 hidden sm:inline">
              karangholap@zohomail.in
            </span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate("/resume"))}
            className="cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="flex items-center min-w-0">
              <Download className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">View & Download Resume</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/50 shrink-0">
              PDF
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* External Links */}
        <CommandGroup heading="Connect & Links">
          {externalLinks.map((link) => (
            <CommandItem
              key={link.href}
              onSelect={() => runCommand(() => window.open(link.href, "_blank"))}
              className="cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="flex items-center min-w-0">
                <link.icon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{link.name}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">↗</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      {/* Responsive helper footer */}
      <div className="border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground flex items-center justify-between bg-muted/20 shrink-0">
        <span className="truncate">Tip: Tap an item or press Esc to close</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-muted/60 border border-border rounded">
          ESC
        </kbd>
      </div>
    </CommandDialog>
  );
};

export default CommandPalette;
