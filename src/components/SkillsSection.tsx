import { Layout, Code2, Database, Wrench } from "lucide-react";

const skillCategories = [
  {
    title: "Frontend",
    icon: Layout,
    skills: ["React.js", "Next.js", "HTML5", "CSS3", "JavaScript", "TypeScript", "Tailwind CSS", "Bootstrap", "Shadcn UI"],
  },
  {
    title: "Backend",
    icon: Code2,
    skills: ["Node.js", "Express.js", "Python", "Flask"],
  },
  {
    title: "Database",
    icon: Database,
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Supabase"],
  },
  {
    title: "Tools & Platforms",
    icon: Wrench,
    skills: ["Git", "GitHub", "Figma", "JIRA", "AWS", "Vercel", "Netlify", "VS Code", "Postman", "WordPress"],
  },
];

const SkillsSection = () => {
  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-6">Skills & Technologies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((category) => (
          <div key={category.title}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <category.icon size={14} />
              {category.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;
