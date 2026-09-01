import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type EducationItem = {
  id: string;
  degree: string;
  institution: string;
  duration: string;
  order: number;
};

type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  duration: string;
  highlights: string[];
  order: number;
};

type CertificationItem = {
  id: string;
  name: string;
  order: number;
};

const Resume = () => {
  usePageMeta({
    title: "Resume",
    description:
      "Resume of Karan Gholap, covering education, technical experience, and certifications in full-stack software development.",
    path: "/resume",
  });

  useEffect(() => {
    const ld = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Karan Gholap",
      url: `${window.location.origin}/resume`,
      jobTitle: "Software Developer",
      worksFor: { "@type": "Organization", name: "CandorWorks" },
      sameAs: [
        "https://x.com/TheKaranGholap",
        "https://github.com/karangholap154",
        "https://linkedin.com/in/karangholap",
      ],
      description:
        "Resume of Karan Gholap, software developer experienced in React, Node.js, and TypeScript.",
    };

    const id = "ld-json-resume";
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
  }, []);

  const { data: education, isLoading: isLoadingEdu, error: errorEdu } = useQuery({
    queryKey: ["education"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data as EducationItem[];
    },
  });

  const { data: experience, isLoading: isLoadingExp, error: errorExp } = useQuery({
    queryKey: ["experience"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data as ExperienceItem[];
    },
  });

  const { data: certifications, isLoading: isLoadingCert, error: errorCert } = useQuery({
    queryKey: ["certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data as CertificationItem[];
    },
  });

  const { data: resumePdfUrl } = useQuery({
    queryKey: ["resume-pdf-url"],
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "resume_pdf_url")
          .maybeSingle();
        return data?.value || "/resume.pdf";
      } catch {
        return "/resume.pdf";
      }
    },
  });

  const hasError = errorEdu || errorExp || errorCert;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />
        
          <section className="py-8">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h1 className="text-2xl font-semibold">Resume</h1>
              {resumePdfUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-border hover:bg-secondary transition-colors"
                >
                  <a href={resumePdfUrl} target="_blank" rel="noopener noreferrer" download="Karan_Gholap_Resume.pdf">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span>Download PDF</span>
                  </a>
                </Button>
              )}
            </div>

            {hasError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive mb-8">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Failed to load resume details</h3>
                  <p className="text-xs opacity-90 mt-0.5">Please check your network connection or try again later.</p>
                </div>
              </div>
            )}
            
            {/* Education */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Education</h2>
              {isLoadingEdu ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="p-4 bg-secondary/20 border border-border rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {education?.map((item) => (
                    <div key={item.id} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{item.degree}</h3>
                        <span className="text-sm text-muted-foreground">{item.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.institution}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Experience */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Experience</h2>
              {isLoadingExp ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="p-4 bg-secondary/20 border border-border rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-1/4" />
                      <div className="space-y-1.5 pt-1.5">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {experience?.map((item) => (
                    <div key={item.id} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{item.role}</h3>
                        <span className="text-sm text-muted-foreground">{item.duration}</span>
                      </div>
                      <p className="text-sm text-foreground/80 mb-2">{item.company}</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        {item.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Certifications */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Certifications</h2>
              {isLoadingCert ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <Skeleton key={n} className="h-11 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {certifications?.map((cert) => (
                    <div key={cert.id} className="p-3 bg-secondary/50 rounded-lg text-sm flex items-center">
                      {cert.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
          
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Resume;
