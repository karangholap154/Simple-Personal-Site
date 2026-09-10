import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Coffee, Heart, Code2, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const Support = () => {
  usePageMeta({
    title: "Support My Work",
    description:
      "Support Karan Gholap's independent web development and educational engineering work through Buy Me a Coffee.",
    path: "/support",
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />

          <main className="py-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Coffee size={20} />
              </span>
              <h1 className="text-2xl font-serif font-semibold">Support My Work</h1>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              I design and build web applications, technical tools, and educational resources for engineering students. If any of my projects have helped you, saved you time, or supported your journey, your encouragement is deeply appreciated.
            </p>

            {/* Impact Highlights */}
            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 flex items-start gap-3">
                <Code2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold">Projects & Developer Tools</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Maintaining full-stack web applications, CLI utilities, and software tools built with clean engineering.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold">Student Education at Scale</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Powering study guides, solved exam papers, and engineering notes across Mumbai University branches via Private Academy.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 flex items-start gap-3">
                <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold">Continuous Development</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Directly supporting platform improvements, domain infrastructure, and late-night shipping sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* Buy Me a Coffee Action Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
                <Coffee className="h-6 w-6 stroke-[2]" />
              </div>
              <h2 className="text-lg font-semibold">Fuel the next project</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                No subscription required. A one-time coffee donation makes an immediate direct impact.
              </p>
              <div className="pt-2">
                <a
                  href="https://buymeacoffee.com/karangholap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-semibold px-6 py-3 rounded-xl shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <Coffee className="h-5 w-5 stroke-[2.2] shrink-0" />
                  <span>Buy Me a Coffee</span>
                </a>
              </div>
            </div>

            {/* Alternative Connect CTA */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Looking to collaborate instead?</span>
              <Link to="/contact" className="text-foreground hover:underline inline-flex items-center gap-1">
                <span>Send a message</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Support;
