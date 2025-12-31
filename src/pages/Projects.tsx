import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ArrowUpRight } from "lucide-react";

const projects = [
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

const Projects = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />

          <section className="py-8">
            <h1 className="text-2xl font-semibold mb-4">Projects</h1>
            <p className="text-muted-foreground mb-8">
              A collection of projects I've built, from productivity tools to
              full-stack applications.
            </p>

            <div className="space-y-6">
              {projects.map((project) => (
                <div
                  key={project.title}
                  className="p-5 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-semibold text-foreground">
                      {project.title}
                    </h2>
                    <div className="flex gap-3">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Live Demo"
                        >
                          <ArrowUpRight size={18} />
                        </a>
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

          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Projects;
