import { type LucideIcon } from "lucide-react";
import { 
  Atom, Globe, FileCode, Palette, Component,
  Server, Zap, FlaskConical,
  DatabaseZap, Leaf, CloudCog,
  GitBranch, Github, Figma, Ticket, Cloud, Rocket, Terminal, Send, PenTool
} from "lucide-react";

export interface SkillItem {
  name: string;
  category: "Frontend" | "Backend" | "Database" | "Tools";
  icon: LucideIcon;
}

export const ALL_SKILLS: SkillItem[] = [
  // Frontend
  { name: "React.js", category: "Frontend", icon: Atom },
  { name: "Next.js", category: "Frontend", icon: Globe },
  { name: "TypeScript", category: "Frontend", icon: FileCode },
  { name: "JavaScript", category: "Frontend", icon: FileCode },
  { name: "Tailwind CSS", category: "Frontend", icon: Palette },
  { name: "HTML5", category: "Frontend", icon: FileCode },
  { name: "CSS3", category: "Frontend", icon: Palette },
  { name: "Bootstrap", category: "Frontend", icon: Palette },
  { name: "Shadcn UI", category: "Frontend", icon: Component },

  // Backend
  { name: "Node.js", category: "Backend", icon: Server },
  { name: "Express.js", category: "Backend", icon: Zap },
  { name: "Python", category: "Backend", icon: FileCode },
  { name: "Flask", category: "Backend", icon: FlaskConical },

  // Database
  { name: "PostgreSQL", category: "Database", icon: DatabaseZap },
  { name: "MySQL", category: "Database", icon: DatabaseZap },
  { name: "MongoDB", category: "Database", icon: Leaf },
  { name: "Supabase", category: "Database", icon: CloudCog },

  // Tools & Platforms
  { name: "Git", category: "Tools", icon: GitBranch },
  { name: "GitHub", category: "Tools", icon: Github },
  { name: "AWS", category: "Tools", icon: Cloud },
  { name: "Vercel", category: "Tools", icon: Rocket },
  { name: "Netlify", category: "Tools", icon: Rocket },
  { name: "Docker/JIRA", category: "Tools", icon: Ticket },
  { name: "Figma", category: "Tools", icon: Figma },
  { name: "Postman", category: "Tools", icon: Send },
  { name: "VS Code", category: "Tools", icon: Terminal },
  { name: "WordPress", category: "Tools", icon: PenTool },
];
