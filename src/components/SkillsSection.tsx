import { 
  Layout, Code2, Database, Wrench,
  Atom, Globe, FileCode, Palette, Component,
  Server, Zap, FlaskConical,
  DatabaseZap, Leaf, CloudCog,
  GitBranch, Github, Figma, Ticket, Cloud, Rocket, Terminal, Send, PenTool
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type SkillItem = {
  name: string;
  icon: LucideIcon;
};

type SkillCategory = {
  title: string;
  icon: LucideIcon;
  skills: SkillItem[];
};

const skillCategories: SkillCategory[] = [
  {
    title: "Frontend",
    icon: Layout,
    skills: [
      { name: "React.js", icon: Atom },
      { name: "Next.js", icon: Globe },
      { name: "HTML5", icon: FileCode },
      { name: "CSS3", icon: Palette },
      { name: "JavaScript", icon: FileCode },
      { name: "TypeScript", icon: FileCode },
      { name: "Tailwind CSS", icon: Palette },
      { name: "Bootstrap", icon: Palette },
      { name: "Shadcn UI", icon: Component },
    ],
  },
  {
    title: "Backend",
    icon: Code2,
    skills: [
      { name: "Node.js", icon: Server },
      { name: "Express.js", icon: Zap },
      { name: "Python", icon: FileCode },
      { name: "Flask", icon: FlaskConical },
    ],
  },
  {
    title: "Database",
    icon: Database,
    skills: [
      { name: "PostgreSQL", icon: DatabaseZap },
      { name: "MySQL", icon: DatabaseZap },
      { name: "MongoDB", icon: Leaf },
      { name: "Supabase", icon: CloudCog },
    ],
  },
  {
    title: "Tools & Platforms",
    icon: Wrench,
    skills: [
      { name: "Git", icon: GitBranch },
      { name: "GitHub", icon: Github },
      { name: "Figma", icon: Figma },
      { name: "JIRA", icon: Ticket },
      { name: "AWS", icon: Cloud },
      { name: "Vercel", icon: Rocket },
      { name: "Netlify", icon: Rocket },
      { name: "VS Code", icon: Terminal },
      { name: "Postman", icon: Send },
      { name: "WordPress", icon: PenTool },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05,
    },
  },
};

const skillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

const SkillsSection = () => {
  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-6">Skills & Technologies</h2>
      <motion.div
        className="flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {skillCategories.map((category) => (
          <motion.div
            key={category.title}
            className="p-4 rounded-lg bg-secondary/30 border border-border/50"
            variants={categoryVariants}
          >
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <category.icon size={16} className="text-primary" />
              {category.title}
            </h3>
            <motion.div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <motion.span
                  key={skill.name}
                  className="px-3 py-1.5 bg-background border border-border text-foreground text-sm rounded-md flex items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  variants={skillVariants}
                >
                  <skill.icon size={14} className="text-muted-foreground" />
                  {skill.name}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default SkillsSection;
