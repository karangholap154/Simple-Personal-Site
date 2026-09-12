import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CompanyBadge from "@/components/CompanyBadge";
import GitHubContributions from "@/components/GitHubContributions";
import Footer from "@/components/Footer";
import SkillsSection from "@/components/SkillsSection";
import ProjectsPreview from "@/components/ProjectsPreview";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Check, 
  ArrowUpRight, 
  FileText, 
  MapPin, 
  Clock, 
  Github, 
  Linkedin, 
  Mail 
} from "lucide-react";
import profileImage from "@/assets/profile.png";

import NowSection from "@/components/NowSection";
import SkillsMarquee from "@/components/SkillsMarquee";

const Index = () => {
  const { toast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [puneTime, setPuneTime] = useState<string>("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeString = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
        setPuneTime(timeString);
      } catch {
        setPuneTime("IST");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await navigator.clipboard.writeText("karangholap@zohomail.in");
      setCopiedEmail(true);
      toast({
        title: "Email copied to clipboard!",
        description: "karangholap@zohomail.in",
      });
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy karangholap@zohomail.in manually.",
        variant: "destructive",
      });
    }
  };

  usePageMeta({
    title: "Software Developer Portfolio",
    description:
      "Software developer portfolio of Karan Gholap featuring full-stack projects, engineering experience, and contact details.",
    path: "/",
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />

          {/* Hero Section */}
          <ScrollReveal>
            <section className="pt-2 pb-8 space-y-5">
              {/* Avatar */}
              <img
                src={profileImage}
                alt="Karan Gholap"
                className="w-16 h-16 rounded-full object-cover transition-transform duration-300 hover:scale-105"
              />

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground tracking-tight">
                  Hey, I'm Karan Gholap <span className="inline-block animate-pulse">👋</span>
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  I'm a Software Developer specializing in building responsive, production-ready web applications, developer tools, and scalable software with React, TypeScript, and modern backend systems.
                </p>
              </div>

              {/* Moving Skills Bar (Left to Right) */}
              <div className="pt-1">
                <SkillsMarquee speedSeconds={36} />
              </div>

              {/* Hero Action Buttons & Socials */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button asChild size="sm" className="gap-2 shadow-xs font-medium">
                  <Link to="/projects">
                    <span>Explore Projects</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link to="/resume">
                    <FileText size={15} />
                    <span>View Resume</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="gap-2 text-muted-foreground hover:text-foreground text-xs"
                  title={copiedEmail ? "Copied to clipboard!" : "Copy email address"}
                >
                  {copiedEmail ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  <span>{copiedEmail ? "Copied!" : "karangholap@zohomail.in"}</span>
                </Button>

                {/* Direct quick socials & interactive location chip */}
                <div className="flex items-center gap-1 text-muted-foreground sm:ml-auto">
                  {/* Interactive Location Chip (Hidden on mobile, opens to the left on sm+ screens) */}
                  <div
                    className="relative hidden sm:flex items-center group cursor-pointer"
                    onMouseEnter={() => setIsLocationOpen(true)}
                    onMouseLeave={() => setIsLocationOpen(false)}
                    onClick={() => setIsLocationOpen((prev) => !prev)}
                  >
                    {/* The Single Unified Pill enclosing both text and icon */}
                    <div
                      className={`flex items-center transition-all duration-300 ease-out rounded-full border border-border/60 bg-secondary/50 text-xs text-muted-foreground select-none overflow-hidden h-8 sm:h-9 ${
                        isLocationOpen
                          ? "shadow-xs border-primary/30 bg-secondary/70"
                          : "hover:bg-secondary/70 hover:text-foreground hover:border-border"
                      }`}
                    >
                      {/* Expanding text smoothly revealing to the left */}
                      <div
                        className={`flex items-center overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${
                          isLocationOpen
                            ? "max-w-[220px] opacity-100 pl-3 pr-1.5"
                            : "max-w-0 opacity-0 px-0 pointer-events-none"
                        }`}
                      >
                        <span className="font-medium text-foreground">Pune, India</span>
                        {puneTime && (
                          <>
                            <span className="mx-1.5 text-border">•</span>
                            <Clock size={11} className="text-primary/70 shrink-0 mr-1" />
                            <span>{puneTime} IST</span>
                          </>
                        )}
                      </div>

                      {/* Location Icon inside the chip, anchored at the right side */}
                      <div className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center shrink-0">
                        <MapPin
                          size={15}
                          className={`transition-all duration-200 ${
                            isLocationOpen ? "text-primary scale-105" : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://github.com/karangholap154"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                    aria-label="GitHub Profile"
                    title="GitHub"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href="https://linkedin.com/in/karangholap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                    aria-label="LinkedIn Profile"
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a
                    href="https://x.com/TheKaranGholap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                    aria-label="X (Twitter) Profile"
                    title="X (Twitter)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <Link
                    to="/contact"
                    className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                    aria-label="Contact Karan"
                    title="Contact"
                  >
                    <Mail size={16} />
                  </Link>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Now Section */}
          <ScrollReveal delay={0.05}>
            <NowSection />
          </ScrollReveal>

          <hr className="border-border my-6" />

          {/* About Section */}
          <ScrollReveal delay={0.1}>
            <section className="py-8">
              <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">About Me</h2>
              <p className="text-muted-foreground leading-relaxed">
                I completed my Bachelor’s degree in Computer Engineering from
                the University of Mumbai. I specialize in building full-stack
                solutions using React.js, Node.js, and various database systems.
                With hands-on experience creating healthcare booking systems to
                e-commerce platforms, I focus on writing clean, maintainable
                code and delivering exceptional user experiences.
              </p>
            </section>
          </ScrollReveal>

          <hr className="border-border my-8" />

          {/* Professional Work Section */}
          <ScrollReveal delay={0.1}>
            <section className="py-8">
              <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">Professional Work</h2>

              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  I'm currently working as a{" "}
                  <span className="text-foreground font-medium">
                    Trainee Developer
                  </span>{" "}
                  at <CompanyBadge name="CandorWorks" icon="💼" />, where I'm
                  gaining hands-on experience in full-stack development and
                  contributing to real-world projects.
                </p>

                <p>
                  I'm also the{" "}
                  <span className="text-foreground font-medium">
                    Founder and Software Developer
                  </span>{" "}
                  of{" "}
                  <Link to="/private-academy" className="inline-block">
                    <CompanyBadge
                      name="Private Academy Engineering"
                      icon="📚"
                    />
                  </Link>
                  , an educational technology platform for engineering students
                  where I develop and deploy full-stack web applications and
                  manage platform growth.{" "}
                  <Link
                    to="/private-academy"
                    className="text-foreground link-underline"
                  >
                    Learn more →
                  </Link>
                </p>

                <p>
                  Previously, I worked as a{" "}
                  <span className="text-foreground font-medium">
                    Technology & Business Efficiency Associate
                  </span>{" "}
                  at <CompanyBadge name="BURSANA Fashion Tech" icon="👔" />,
                  where I collaborated on technology solutions to improve
                  business efficiency and contributed to cross-functional
                  projects bridging technology and business needs. For more
                  details about my experience, check out my{" "}
                  <Link to="/resume" className="text-foreground link-underline">
                    resume
                  </Link>
                  .
                </p>
              </div>
            </section>
          </ScrollReveal>

          <hr className="border-border my-8" />

          {/* Skills Section */}
          <ScrollReveal delay={0.1}>
            <SkillsSection />
          </ScrollReveal>

          <hr className="border-border my-8" />

          {/* Projects Preview */}
          <ScrollReveal delay={0.1}>
            <ProjectsPreview />
          </ScrollReveal>

          <hr className="border-border my-8" />

          {/* GitHub Contributions */}
          <ScrollReveal delay={0.1}>
            <section className="py-8">
              <GitHubContributions />
            </section>
          </ScrollReveal>

          <hr className="border-border my-8" />

          {/* Writing Section */}
          {/* <ScrollReveal delay={0.1}>
          <section className="py-8">
            <h2 className="text-xl font-semibold mb-6">Writing</h2>
            <p className="text-muted-foreground leading-relaxed">
              I share my knowledge and experiences on{" "}
              <a href="https://medium.com/@karan_gholap" target="_blank" rel="noopener noreferrer" className="text-foreground link-underline">Medium</a>{" "}
              and{" "}
              <a href="https://hashnode.com/@karangholap" target="_blank" rel="noopener noreferrer" className="text-foreground link-underline">Hashnode</a>{" "}
              to help others improve their engineering skills. Stay tuned for more content!
            </p>
          </section>
        </ScrollReveal>
        
        <hr className="border-border my-8" /> */}

          {/* Follow Me Section */}
          <ScrollReveal delay={0.1}>
            <section className="py-6 space-y-3">
              <a
                href="https://x.com/TheKaranGholap"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
              >
                <span className="text-lg">↗</span>
                <span>Follow me on</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <a
                  href="mailto:karangholap@zohomail.in"
                  className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors text-sm sm:text-base"
                >
                  <span className="text-lg">📧</span>
                  <span>karangholap@zohomail.in</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary rounded border border-border transition-colors flex items-center justify-center"
                  title={copiedEmail ? "Copied to clipboard!" : "Copy email to clipboard"}
                  aria-label="Copy email to clipboard"
                >
                  {copiedEmail ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm py-1.5 px-3 rounded-lg border border-border/70 bg-secondary/40 hover:bg-secondary transition-all cursor-pointer group"
                  aria-label="Open Command Palette"
                >
                  <span className="hidden sm:inline">Press</span>
                  <span className="sm:hidden">Tap or press</span>
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded text-foreground group-hover:border-primary/50 transition-colors">
                    ⌘K
                  </kbd>
                  <span>to navigate quickly</span>
                </button>
              </div>
            </section>
          </ScrollReveal>

          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;
