import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Camera } from "lucide-react";

// Dynamically import all images from the gallery folder
const galleryImages = import.meta.glob<{ default: string }>(
  "@/assets/gallery/*.(jpg|jpeg|png|webp|gif)",
  { eager: true }
);

const Gallery = () => {
  const images = Object.entries(galleryImages).map(([path, module]) => ({
    src: module.default,
    name: path.split("/").pop()?.split(".")[0] || "Photo",
  }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6">
          <Navigation />

          <main className="py-12">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-4">Casual Photography</h1>
              <p className="text-muted-foreground leading-relaxed">
                When I’m not developing, I enjoy capturing casual photography, there’s something uniquely rewarding about slowing down and preserving everyday moments.
              </p>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Camera className="h-12 w-12 mb-4 opacity-50" />
                <p>No photos yet. Add images to the gallery folder.</p>
              </div>
            )}
          </main>

          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Gallery;
