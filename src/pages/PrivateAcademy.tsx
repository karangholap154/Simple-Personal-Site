import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ExternalLink, Youtube, Instagram, Mail, BookOpen, Users, Code, GraduationCap, Target, Rocket, Linkedin, Twitter } from "lucide-react";

const PrivateAcademy = () => {
  const branches = [
    "Computer Engineering",
    "Information Technology",
    "AIML",
    "Mechanical Engineering",
    "Chemical Engineering",
  ];

  const features = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Study Materials",
      description: "Comprehensive semester-wise notes aligned with Mumbai University curriculum"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Important Questions",
      description: "Curated question banks focused on high-probability exam topics"
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      title: "Video Tutorials",
      description: "Detailed walkthroughs and exam strategy videos on YouTube"
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      title: "Previous Papers",
      description: "Organized question papers from multiple years for pattern analysis"
    },
  ];

  const contributions = [
    {
      icon: <Code className="w-5 h-5" />,
      title: "Technical Development",
      description: "Built and maintain the full-stack web platform using React.js, Node.js, and modern web technologies"
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      title: "Platform Architecture",
      description: "Designed scalable infrastructure with custom CMS for efficient content management"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Growth",
      description: "Contributing to platform strategy and multi-channel content distribution"
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />

          {/* Hero Section */}
          <section className="py-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📚</span>
              <h1 className="text-2xl font-semibold">Private Academy Engineering</h1>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              An EdTech platform empowering Mumbai University engineering students with comprehensive study resources, exam preparation materials, and practical learning tools.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href="https://www.privateacademy.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Platform
              </a>
              <a
                href="https://www.youtube.com/@pvtacademy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </a>
              <a
                href="https://instagram.com/privateacademy.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/company/privateacademy/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
              <a
                href="https://x.com/PVTAcademyEdu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Twitter className="w-4 h-4" />
                X (Twitter)
              </a>
              <a
                href="https://peerlist.io/company/privateacademy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Peerlist
              </a>
            </div>
          </section>

          <hr className="border-border my-8" />

          {/* My Role Section */}
          <section className="py-8">
            <h2 className="text-xl font-semibold mb-6">My Role & Contributions</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              As the <span className="text-foreground font-medium">Founder and Software Developer</span> of Private Academy, I handle the complete technical development and infrastructure of the platform. I've built the platform from the ground up to serve thousands of engineering students.
            </p>
            <div className="space-y-4">
              {contributions.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="text-primary mt-0.5">{item.icon}</div>
                  <div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-border my-8" />

          {/* Platform Overview */}
          <section className="py-8">
            <h2 className="text-xl font-semibold mb-6">Platform Overview</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Private Academy serves as a comprehensive study resource hub specifically designed for Mumbai University engineering students. The platform provides exam-oriented materials across multiple branches, helping students prepare effectively and build practical understanding.
            </p>
            
            <h3 className="font-medium mb-4">Branches Covered</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {branches.map((branch) => (
                <span
                  key={branch}
                  className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full"
                >
                  {branch}
                </span>
              ))}
            </div>
          </section>

          <hr className="border-border my-8" />

          {/* Features Section */}
          <section className="py-8">
            <h2 className="text-xl font-semibold mb-6">Key Features</h2>
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="text-primary mt-0.5">{feature.icon}</div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-border my-8" />

          {/* Impact Section */}
          <section className="py-8">
            <h2 className="text-xl font-semibold mb-6">Impact & Reach</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-semibold text-primary">5+</p>
                <p className="text-sm text-muted-foreground">Engineering Branches</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-semibold text-primary">8+</p>
                <p className="text-sm text-muted-foreground">Semesters Covered</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-semibold text-primary">100+</p>
                <p className="text-sm text-muted-foreground">Important Questions</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-semibold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Video Tutorials</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The platform maintains an active presence across YouTube and Instagram, engaging with students through regular content updates, quick tips, and exam strategies.
            </p>
          </section>

          <hr className="border-border my-8" />

          {/* Tech Stack */}
          <section className="py-8">
            <h2 className="text-xl font-semibold mb-6">Technology Stack</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Built with modern web technologies to ensure fast, reliable, and scalable performance:
            </p>
            <div className="flex flex-wrap gap-2">
              {["React.js", "Node.js", "MongoDB", "Express.js", "Tailwind CSS", "REST APIs", "Custom CMS"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <hr className="border-border my-8" />

          {/* Contact Section */}
          <section className="py-8">
            <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Interested in collaborating or have questions about the platform?
            </p>
            <a
              href="mailto:privateacademy.in@gmail.com"
              className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              privateacademy.in@gmail.com
            </a>
          </section>

          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivateAcademy;
