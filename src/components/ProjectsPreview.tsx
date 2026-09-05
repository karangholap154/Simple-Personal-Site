import { ArrowUpRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectItem } from "@/pages/Projects";
import { slugify } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const projectVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const ProjectsPreview = () => {
  const { data: featuredProjects, isLoading, error } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("featured", true)
        .order("order", { ascending: true });
      if (error) throw error;
      return data as ProjectItem[];
    },
  });

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-semibold">Featured Projects</h2>
        <Link
          to="/projects"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 border border-border bg-secondary/20 rounded-lg space-y-2.5">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-1.5">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-14" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm">Failed to load featured projects</h3>
            <p className="text-xs opacity-90 mt-0.5">Please try again later.</p>
          </div>
        </div>
      ) : featuredProjects?.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg border-border">
          <p className="text-sm text-muted-foreground">No featured projects found.</p>
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featuredProjects?.map((project) => (
            <motion.div key={project.title} variants={projectVariants}>
              <Link
                to={`/projects?project=${slugify(project.title)}`}
                className="block p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
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
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default ProjectsPreview;
