import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    title: "Private Academy Engineering – Smart Study Platform",
    description: "A centralized platform providing structured study materials and exam resources.",
    tech: [
      "React.js",
      "Tailwind CSS",
      "Framer Motion",
      "TypeScript",
      "Supabase",
    ],
    link: "https://www.privateacademy.in/",
  },
  {
    title: "PrivMate - AI Study Companion",
    description: "AI-powered study companion with instant, accurate answers",
    tech: [
      "React.js",
      "Tailwind CSS",
      "ShadCn/ui",
      "TypeScript",
      "Supabase",
      "Gemini API",
    ],
    link: "https://chat.privateacademy.in/",
  },
  {
    title: "Bilix - Invoice Generator",
    description: "Sleek invoice generator with customizable templates and PDF export",
    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "ShadCn/ui",
      "jsPDF",
      "Supabase",
    ],
    link: "https://bilix.vercel.app/",
  },
];

const ProjectsPreview = () => {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Featured Projects</h2>
        <Link
          to="/projects"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {projects.map((project) => (
          <a
            key={project.title}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-foreground group-hover:text-foreground/80 flex items-center gap-2">
                  {project.title}
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                <div className="flex gap-2 mt-3">
                  {project.tech.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-background rounded text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ProjectsPreview;
