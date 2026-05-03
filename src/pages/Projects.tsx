import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ArrowUpRight, Globe, Smartphone } from "lucide-react";
import { useState } from "react";

const webProjects = [
  {
    title: "Private Academy Engineering – Smart Study Platform",
    description:
      "A centralized platform providing structured study materials and exam resources to help engineering students learn efficiently.",
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
    title: "PrivMate – AI powered study companion",
    description:
      "Get instant, accurate answers to any study question. Our AI understands context and provides detailed explanations.",
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
    title: "Submit Private Academy – Student Notes Sharing Platform",
    description:
      "A collaborative platform where students can securely upload, discover, and filter authentic, student-made academic notes.",
    tech: [
      "React.js",
      "Tailwind CSS",
      "ShadCn/ui",
      "TypeScript",
      "Supabase",
      "Gemini API",
    ],
    link: "https://submit.privateacademy.in/",
  },
  {
    title: "Bilix – Invoice Generator",
    description:
      "A sleek and user-friendly invoice generator with customizable templates and PDF export functionality.",
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
  {
    title: "Custom Free QR Code Generator",
    description:
      "A privacy-first, free tool for creating unlimited, customizable QR codes with logos, colors, and high-quality exports.",
    tech: [
      "React.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "ShadCn/ui",
      "Framer Motion",
    ],
    link: "https://runqr.vercel.app/",
  },
  {
    title: "SmartTools Hub – Utility Tools Platform",
    description:
      "A comprehensive collection of web-based productivity tools built with modern technologies and responsive design.",
    tech: [
      "React.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "Vite",
      "Framer Motion",
    ],
    link: "https://smarttoolshub.vercel.app",
  },
  {
    title: "JSON Schema Builder",
    description:
      "A dynamic tool to create and manage JSON schemas with nested fields and real-time preview.",
    tech: [
      "React.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "ShadCn/ui",
      "JSON Schema",
    ],
    link: "https://add-json-schema.vercel.app/",
  },
  {
    title: "Healthcare Appointment Booking",
    description:
      "Easy-to-use healthcare appointment booking system with real-time availability and patient management.",
    tech: [
      "React",
      "TypeScript",
      "Context API",
      "Tailwind CSS",
      "Lucide Icons",
    ],
    link: "https://easyhealthbooking.vercel.app",
  },
  {
    title: "CryptoDash - Cryptocurrency Dashboard",
    description:
      "A modern cryptocurrency dashboard with live data from the CoinGecko API with comprehensive market insights.",
    tech: ["React.js", "TypeScript", "Tailwind CSS", "CoinGecko API", "Axios"],
    link: "https://cryptocurrency-dashboard-lyart.vercel.app/",
  },
];

const mobileApps = [
  {
    title: "Private Academy Mobile App - Study Material Provider",
    description:
      "A mobile app that provides engineering students with structured study materials and exam resources for efficient learning on the go.",
    tech: ["React Native", "Expo", "TypeScript", "Supabase"],
    link: "https://app.privateacademy.in/",
  },
];

type ProjectItem = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
};

type ProjectsSectionProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  projects: ProjectItem[];
};

const ProjectsSection = ({
  title,
  description,
  icon,
  projects,
}: ProjectsSectionProps) => {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>

      <div className="space-y-6">
        {projects.map((project) => (
          <div
            key={project.title}
            className="p-5 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground">{project.title}</h3>
              <div className="flex gap-3">
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Live Demo"
                  >
                    <ArrowUpRight size={18} />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    Coming soon
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 bg-background rounded text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Projects = () => {
  const [activeView, setActiveView] = useState<"web" | "mobile">("web");

  const sectionConfig = {
    web: {
      title: "Websites & Web Applications",
      description: "All your current live projects are listed here as requested.",
      icon: <Globe size={18} />,
      projects: webProjects,
    },
    mobile: {
      title: "Mobile Applications",
      description:
        "A dedicated section for mobile apps with a starter placeholder project.",
      icon: <Smartphone size={18} />,
      projects: mobileApps,
    },
  };

  const currentSection = sectionConfig[activeView];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />

          <section className="py-8">
            <h1 className="text-2xl font-semibold mb-4">Projects</h1>
            <p className="text-muted-foreground mb-8">
              A categorized collection of my work across web and mobile
              development.
            </p>

            <div className="inline-flex rounded-lg bg-secondary/60 p-1 mb-8">
              <button
                type="button"
                onClick={() => setActiveView("web")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                  activeView === "web"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={activeView === "web"}
              >
                <Globe size={16} />
                Websites
              </button>
              <button
                type="button"
                onClick={() => setActiveView("mobile")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                  activeView === "mobile"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={activeView === "mobile"}
              >
                <Smartphone size={16} />
                Mobile Apps
              </button>
            </div>

            <ProjectsSection
              title={currentSection.title}
              description={currentSection.description}
              icon={currentSection.icon}
              projects={currentSection.projects}
            />
          </section>

          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Projects;
