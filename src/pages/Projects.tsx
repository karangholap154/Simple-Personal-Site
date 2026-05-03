import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ArrowUpRight, Globe, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const webProjects = [
  {
    title: "Private Academy Engineering – Smart Study Platform",
    description:
      "A centralized platform providing structured study materials and exam resources to help engineering students learn efficiently.",
    role: "Founder and Full-Stack Developer",
    outcomes: [
      "Built a focused learning workflow for semester-wise preparation.",
      "Shipped a responsive product experience used across student devices.",
    ],
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
    role: "Product and Frontend Developer",
    outcomes: [
      "Converted study questions into guided AI-assisted explanations.",
      "Delivered a lightweight UI optimized for fast question-answer flow.",
    ],
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
    role: "Full-Stack Developer",
    outcomes: [
      "Created a structured submission and discovery experience for notes.",
      "Improved discoverability with filtering-first information architecture.",
    ],
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
    role: "Frontend Engineer",
    outcomes: [
      "Reduced manual invoicing effort with fast template-driven workflows.",
      "Enabled high-quality downloadable invoices for immediate sharing.",
    ],
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
    role: "Frontend Developer",
    outcomes: [
      "Made QR customization accessible with clear, visual controls.",
      "Maintained client-side generation for privacy-focused usage.",
    ],
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
    role: "Frontend Engineer",
    outcomes: [
      "Consolidated multiple utilities into one unified product hub.",
      "Delivered a responsive, reusable UI system across tool pages.",
    ],
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
    role: "Frontend Developer",
    outcomes: [
      "Simplified nested schema authoring with intuitive form controls.",
      "Added real-time preview for faster validation and iteration.",
    ],
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
    role: "Frontend Developer",
    outcomes: [
      "Streamlined appointment booking from search to confirmation.",
      "Improved scheduling clarity with real-time availability indicators.",
    ],
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
    role: "Frontend Developer",
    outcomes: [
      "Built live market visualizations for quick portfolio scanning.",
      "Translated API data into readable, actionable dashboard views.",
    ],
    tech: ["React.js", "TypeScript", "Tailwind CSS", "CoinGecko API", "Axios"],
    link: "https://cryptocurrency-dashboard-lyart.vercel.app/",
  },
];

const mobileApps = [
  {
    title: "Private Academy Mobile App - Study Material Provider",
    description:
      "A mobile app that provides engineering students with structured study materials and exam resources for efficient learning on the go.",
    role: "React Native Developer",
    outcomes: [
      "Extended the study experience from web to mobile-first workflows.",
      "Enabled quick access to resources during commute and revision.",
    ],
    tech: ["React Native", "Expo", "TypeScript", "Supabase"],
    link: "https://app.privateacademy.in/",
  },
];

type ProjectItem = {
  title: string;
  description: string;
  role: string;
  outcomes: string[];
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
                    aria-label={`Open live demo for ${project.title}`}
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
            <p className="text-xs text-foreground/80 mb-3">
              Role: <span className="text-foreground font-medium">{project.role}</span>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
              {project.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
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

  usePageMeta({
    title: "Projects",
    description:
      "Selected web and mobile projects by Karan Gholap, with stack details, project outcomes, and live demos.",
    path: "/projects",
  });

  useEffect(() => {
    try {
      const projects = [...webProjects, ...mobileApps];
      const itemList = projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: p.link || `${window.location.origin}/projects`,
        item: {
          "@type": "CreativeWork",
          name: p.title,
          description: p.description,
        },
      }));

      const ld = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Projects | Karan Gholap",
        description:
          "Selected web and mobile projects by Karan Gholap, with stack details and outcomes.",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: itemList,
        },
      };

      const id = "ld-json-projects";
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = id;
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(ld);

      return () => {
        const s = document.getElementById(id);
        if (s) s.remove();
      };
    } catch (err) {
      // ignore structured data injection errors
    }
  }, []);

  const sectionConfig = {
    web: {
      title: "Websites & Web Applications",
      description:
        "Production-style builds focused on usability, performance, and clear product outcomes.",
      icon: <Globe size={18} />,
      projects: webProjects,
    },
    mobile: {
      title: "Mobile Applications",
      description:
        "Mobile-first experiences designed for reliable daily usage and fast navigation.",
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
              A categorized collection of web and mobile products I have built,
              with delivery context and outcomes.
            </p>

            <div className="rounded-xl border border-border bg-secondary/30 p-5 mb-8">
              <h2 className="text-base font-semibold mb-2">
                Need a product-focused developer?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                I help teams ship polished React and TypeScript experiences,
                from MVP builds to production-ready features.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm"
                >
                  Discuss a project
                  <ArrowUpRight size={14} />
                </Link>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
                >
                  View resume
                </Link>
              </div>
            </div>

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

            <div className="rounded-xl border border-border bg-secondary/20 p-5 mt-8">
              <h2 className="text-base font-semibold mb-2">
                Looking for similar outcomes?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                I can contribute across frontend architecture, API integration,
                performance optimization, and shipping user-centric product
                features.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground transition-colors"
              >
                Start a conversation
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Projects;
