import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ArrowUpRight, Globe, Smartphone, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDrawer, slugify } from "@/components/ProjectDrawer";

export type ProjectItem = {
  id?: string;
  title: string;
  description: string;
  role: string;
  outcomes: string[];
  tech: string[];
  link?: string;
  type: 'web' | 'mobile';
  featured: boolean;
  order: number;
};

type ProjectsSectionProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  projects: ProjectItem[];
  isLoading?: boolean;
  onSelectProject: (project: ProjectItem) => void;
};

const ProjectsSection = ({
  title,
  description,
  icon,
  projects,
  isLoading,
  onSelectProject,
}: ProjectsSectionProps) => {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-5 border border-border bg-secondary/20 rounded-lg space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg border-border">
          <p className="text-sm text-muted-foreground">No projects found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
          <div
            key={project.title}
            onClick={() => onSelectProject(project)}
            className="p-5 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                {project.title}
                <span className="text-xs font-normal text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  (View case study)
                </span>
              </h3>
              <div className="flex gap-3">
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={`Open live demo for ${project.title}`}
                    title="Open live link"
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
      )}
    </section>
  );
};

const Projects = () => {
  const [activeView, setActiveView] = useState<"web" | "mobile">("web");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  usePageMeta({
    title: "Projects",
    description:
      "Selected web and mobile projects by Karan Gholap, with stack details, project outcomes, and live demos.",
    path: "/projects",
  });

  const { data: allProjects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data as ProjectItem[];
    },
  });

  useEffect(() => {
    if (!allProjects) return;
    try {
      const itemList = allProjects.map((p, i) => ({
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
  }, [allProjects]);

  const handleSelectProject = useCallback((project: ProjectItem) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
    setSearchParams({ project: slugify(project.title) });
  }, [setSearchParams]);

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) {
      setSearchParams({});
    }
  };

  useEffect(() => {
    if (!allProjects || allProjects.length === 0) return;
    const projectParam = searchParams.get("project");
    if (projectParam) {
      const matched = allProjects.find(
        (p) => slugify(p.title) === projectParam.toLowerCase().trim()
      );
      if (matched) {
        setSelectedProject(matched);
        setIsDrawerOpen(true);
        if (matched.type !== activeView) {
          setActiveView(matched.type);
        }
      }
    }
  }, [allProjects, searchParams, activeView]);

  const webProjects = allProjects?.filter((p) => p.type === "web") || [];
  const mobileApps = allProjects?.filter((p) => p.type === "mobile") || [];

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

            {error ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive mb-8">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Failed to load projects</h3>
                  <p className="text-xs opacity-90 mt-0.5">Please check your network connection or try again later.</p>
                </div>
              </div>
            ) : (
              <ProjectsSection
                title={currentSection.title}
                description={currentSection.description}
                icon={currentSection.icon}
                projects={currentSection.projects}
                isLoading={isLoading}
                onSelectProject={handleSelectProject}
              />
            )}

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

        <ProjectDrawer
          project={selectedProject}
          open={isDrawerOpen}
          onOpenChange={handleDrawerOpenChange}
        />
      </div>
    </PageTransition>
  );
};

export default Projects;
