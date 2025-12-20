import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ExternalLink } from "lucide-react";

const blogPlatforms = [
  {
    name: "Medium",
    description: "In-depth articles on web development and technology",
    url: "https://medium.com/@karan_gholap",
  },
  {
    name: "Hashnode",
    description: "Technical tutorials and coding insights",
    url: "https://hashnode.com/@karangholap",
  },
];

const Blog = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />
        
        <section className="py-8">
          <h1 className="text-2xl font-semibold mb-4">Blog</h1>
          <p className="text-muted-foreground mb-8">
            I share my knowledge and experiences to help others improve their engineering skills. Check out my writing on these platforms:
          </p>
          
          <div className="space-y-4">
            {blogPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      {platform.name}
                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{platform.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          <div className="mt-10 p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              🚀 More content coming soon! I'm working on articles about React, Node.js, and building full-stack applications.
            </p>
          </div>
        </section>
        
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Blog;
