import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Resume = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6">
          <Navigation />
        
        <section className="py-8">
          <h1 className="text-2xl font-semibold mb-8">Resume</h1>
          
          {/* Education */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Education</h2>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">Bachelor's in Computer Engineering</h3>
                  <span className="text-sm text-muted-foreground">2022 – 2025</span>
                </div>
                <p className="text-sm text-muted-foreground">University of Mumbai</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">Diploma in Computer Engineering</h3>
                  <span className="text-sm text-muted-foreground">2019 – 2022</span>
                </div>
                <p className="text-sm text-muted-foreground">Rasiklal M. Dhariwal Institute of Technology</p>
              </div>
            </div>
          </div>
          
          {/* Experience */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Experience</h2>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">Trainee Developer</h3>
                  <span className="text-sm text-muted-foreground">Dec 2025 - Present</span>
                </div>
                <p className="text-sm text-foreground/80 mb-2">CandorWorks · Full-Time</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Working as a full-time Trainee Developer gaining hands-on experience</li>
                  <li>Contributing to real-world development projects</li>
                  <li>Learning and applying best practices in software development</li>
                </ul>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">Founder & Software Developer</h3>
                  <span className="text-sm text-muted-foreground">Feb 2023 - Present</span>
                </div>
                <p className="text-sm text-foreground/80 mb-2">Private Academy Engineering · Full-Time</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Founded and leading an educational technology platform for engineering students</li>
                  <li>Developed and deployed full-stack web applications using modern technologies</li>
                  <li>Created comprehensive study materials and resources for students</li>
                  <li>Managing platform growth, user engagement, and content strategy</li>
                </ul>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">Technology & Business Efficiency Associate</h3>
                  <span className="text-sm text-muted-foreground">Aug 2025 - Oct 2025</span>
                </div>
                <p className="text-sm text-foreground/80 mb-2">BURSANA Fashion Tech · Internship</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Collaborated on technology solutions to improve business efficiency</li>
                  <li>Assisted in streamlining operational processes using tech-driven approaches</li>
                  <li>Contributed to cross-functional projects bridging technology and business needs</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Certifications */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Certifications</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Programming Foundations with Python",
                "JavaScript Essentials",
                "React.js",
                "Node.js",
                "Postman API Student Expert",
                "MERN Stack Web Developer (NxtWave)",
              ].map((cert) => (
                <div key={cert} className="p-3 bg-secondary/50 rounded-lg text-sm">
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </section>
        
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Resume;
