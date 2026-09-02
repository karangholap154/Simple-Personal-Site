import { ProjectItem } from "@/pages/Projects";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Share2, Globe, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

interface ProjectDrawerProps {
  project: ProjectItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectDrawer = ({
  project,
  open,
  onOpenChange,
}: ProjectDrawerProps) => {
  const { toast } = useToast();

  if (!project) return null;

  const projectSlug = slugify(project.title);
  const shareUrl = `${window.location.origin}/projects?project=${projectSlug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Project: ${project.title}`,
          text: project.description,
          url: shareUrl,
        });
      } catch {
        // User cancelled share dialog
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: `Project case study link copied to clipboard.`,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl p-6 overflow-y-auto bg-background/98 backdrop-blur-md border-l border-border flex flex-col justify-between"
      >
        <div className="space-y-6">
          {/* Header */}
          <SheetHeader className="text-left space-y-3 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="flex items-center gap-1.5 text-xs py-1 px-2.5">
                {project.type === "web" ? (
                  <>
                    <Globe size={12} className="text-primary" /> Web Application
                  </>
                ) : (
                  <>
                    <Smartphone size={12} className="text-primary" /> Mobile App
                  </>
                )}
              </Badge>

              {project.featured && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs py-1 px-2.5">
                  Featured Project
                </Badge>
              )}
            </div>

            <SheetTitle className="text-2xl font-bold text-foreground">
              {project.title}
            </SheetTitle>

            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <span>Role:</span>
              <span className="text-foreground">{project.role}</span>
            </p>
          </SheetHeader>

          <hr className="border-border" />

          {/* Overview */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Project Overview
            </h3>
            <SheetDescription className="text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </SheetDescription>
          </div>

          {/* Outcomes & Impact */}
          {project.outcomes && project.outcomes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Key Outcomes & Deliverables
              </h3>
              <div className="space-y-2.5">
                {project.outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/30 border border-border/60">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90 leading-normal">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technology Stack */}
          {project.tech && project.tech.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Technologies & Architecture
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-medium px-3 py-1 bg-secondary text-secondary-foreground rounded-md border border-border/50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-border space-y-3">
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {project.link ? (
              <Button asChild className="flex-1 flex items-center gap-2">
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  <span>Visit Live Project</span>
                </a>
              </Button>
            ) : (
              <Button variant="secondary" disabled className="flex-1">
                Coming Soon
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
              title="Share project link"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          <Button asChild variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground justify-between">
            <Link to="/contact">
              <span>Have a project in mind? Let's talk</span>
              <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
