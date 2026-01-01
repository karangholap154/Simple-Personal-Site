import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Coffee } from "lucide-react";

const Support = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />

          <main className="py-12">
            <h1 className="text-2xl font-bold mb-8">Support My Work</h1>

            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                If you find my work helpful or valuable, consider supporting me by buying me a coffee. 
                Your support helps me continue creating content, building projects, and sharing knowledge with the community.
              </p>

              <a
                href="https://buymeacoffee.com/karangholap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <Coffee className="h-5 w-5" />
                Buy Me a Coffee
              </a>

              <p className="text-sm text-muted-foreground">
                Every coffee counts and motivates me to keep going. Thank you for your support! ☕
              </p>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Support;
