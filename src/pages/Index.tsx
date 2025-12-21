import Navigation from "@/components/Navigation";
import CompanyBadge from "@/components/CompanyBadge";
import GitHubContributions from "@/components/GitHubContributions";
import Footer from "@/components/Footer";
import SkillsSection from "@/components/SkillsSection";
import ProjectsPreview from "@/components/ProjectsPreview";
import PageTransition from "@/components/PageTransition";
import profileImage from "@/assets/profile.png";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-8">
          <img 
            src={profileImage} 
            alt="Karan Gholap" 
            className="w-16 h-16 rounded-full object-cover mb-4 transition-transform duration-300 hover:scale-105"
          />
          <h1 className="text-2xl font-semibold mb-4">
            Hey, I'm Karan Gholap <span className="inline-block">👋</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I'm a Software Developer from Pune, India, passionate about building responsive, user-friendly applications and making the web a better place.
          </p>
        </section>
        
        <hr className="border-border my-8" />
        
        {/* About Section */}
        <section className="py-8">
          <h2 className="text-xl font-semibold mb-6">About Me</h2>
          <p className="text-muted-foreground leading-relaxed">
            I recently completed my Bachelor's in Computer Engineering from the University of Mumbai. I specialize in building full-stack solutions using React.js, Node.js, and various database systems. With hands-on experience creating healthcare booking systems to e-commerce platforms, I focus on writing clean, maintainable code and delivering exceptional user experiences.
          </p>
        </section>
        
        <hr className="border-border my-8" />
        
        {/* Professional Work Section */}
        <section className="py-8">
          <h2 className="text-xl font-semibold mb-6">Professional Work</h2>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              I'm currently working as a <span className="text-foreground font-medium">Trainee Developer</span> at{" "}
              <CompanyBadge name="CandorWorks" icon="💼" />, where I'm gaining hands-on experience in full-stack development and contributing to real-world projects.
            </p>
            
            <p>
              I'm also the <span className="text-foreground font-medium">Founder and Software Developer</span> of{" "}
              <a href="/private-academy" className="inline-block">
                <CompanyBadge name="Private Academy Engineering" icon="📚" />
              </a>, an educational technology platform for engineering students where I develop and deploy full-stack web applications and manage platform growth.{" "}
              <a href="/private-academy" className="text-foreground link-underline">Learn more →</a>
            </p>
            
            <p>
              Previously, I worked as a <span className="text-foreground font-medium">Technology & Business Efficiency Associate</span> at{" "}
              <CompanyBadge name="BURSANA Fashion Tech" icon="👔" />, where I collaborated on technology solutions to improve business efficiency and contributed to cross-functional projects bridging technology and business needs. For more details about my experience, check out my{" "}
              <a href="/resume" className="text-foreground link-underline">resume</a>.
            </p>
          </div>
        </section>
        
        <hr className="border-border my-8" />
        
        {/* Skills Section */}
        <SkillsSection />
        
        <hr className="border-border my-8" />
        
        {/* Projects Preview */}
        <ProjectsPreview />
        
        <hr className="border-border my-8" />
        
        {/* GitHub Contributions */}
        <section className="py-8">
          <GitHubContributions />
        </section>
        
        <hr className="border-border my-8" />
        
        {/* Writing Section */}
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
        
        <hr className="border-border my-8" />
        
        {/* Follow Me Section */}
        <section className="py-6 space-y-3">
          <a
            href="https://x.com/TheKaranGholap"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <span className="text-lg">↗</span>
            <span>Follow me</span>
          </a>
          <a
            href="mailto:karangholap@zohomail.in"
            className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <span className="text-lg">📧</span>
            <span>karangholap@zohomail.in</span>
          </a>
        </section>
        
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;
