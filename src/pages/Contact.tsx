import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Mail, Github, Linkedin, ExternalLink } from "lucide-react";

const socialLinks = [
  { name: "GitHub", url: "https://github.com/karangholap154", icon: Github },
  { name: "LinkedIn", url: "https://linkedin.com/in/karangholap", icon: Linkedin },
  { name: "Email", url: "mailto:karangholap@zohomail.in", icon: Mail },
];

const otherLinks = [
  { name: "Peerlist", url: "https://peerlist.io/karangholap" },
  { name: "X (Twitter)", url: "https://x.com/TheKaranGholap" },
  { name: "LeetCode", url: "https://leetcode.com/u/karangholap/" },
  { name: "Behance", url: "https://www.behance.net/karangholap" },
  { name: "Product Hunt", url: "https://www.producthunt.com/@karangholap" },
  { name: "Medium", url: "https://medium.com/@karan_gholap" },
  { name: "Hashnode", url: "https://hashnode.com/@karangholap" },
];

const Contact = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />
        
        <section className="py-8">
          <h1 className="text-2xl font-semibold mb-4">Contact</h1>
          <p className="text-muted-foreground mb-8">
            I'm always open to discussing new opportunities, collaborations, or just having a chat about tech. Feel free to reach out!
          </p>
          
          {/* Primary Contact */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target={link.url.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
                >
                  <link.icon size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="flex-1">{link.name}</span>
                  <ExternalLink size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Other Platforms */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Find Me Elsewhere</h2>
            <div className="grid grid-cols-2 gap-3">
              {otherLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-sm group"
                >
                  <span>{link.name}</span>
                  <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Location */}
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              📍 Based in Pune, India (UTC +5:30)
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Open to remote opportunities across different time zones.
            </p>
          </div>
        </section>
        
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;
