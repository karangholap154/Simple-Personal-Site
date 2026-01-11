import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Home,
  FolderKanban,
  FileText,
  Mail,
  Image,
  GraduationCap,
  Coffee,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const pages = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Projects", icon: FolderKanban, href: "/projects" },
    { name: "Resume", icon: FileText, href: "/resume" },
    { name: "Contact", icon: Mail, href: "/contact" },
    { name: "Gallery", icon: Image, href: "/gallery" },
    { name: "Private Academy", icon: GraduationCap, href: "/private-academy" },
    { name: "Support", icon: Coffee, href: "/support" },
  ];

  const externalLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/karangholap154" },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/in/karangholap",
    },
    { name: "Twitter", icon: Twitter, href: "https://x.com/TheKaranGholap" },
    {
      name: "Buy Me a Coffee",
      icon: Coffee,
      href: "https://buymeacoffee.com/karangholap",
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              onSelect={() => runCommand(() => navigate(page.href))}
              className="cursor-pointer"
            >
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Links">
          {externalLinks.map((link) => (
            <CommandItem
              key={link.href}
              onSelect={() =>
                runCommand(() => window.open(link.href, "_blank"))
              }
              className="cursor-pointer"
            >
              <link.icon className="mr-2 h-4 w-4" />
              <span>{link.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
