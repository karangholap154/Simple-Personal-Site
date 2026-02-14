import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import LazyImage from "@/components/LazyImage";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, X, ChevronLeft, ChevronRight, Share2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Dynamically import all images from the gallery folder
const galleryImages = import.meta.glob<{ default: string }>(
  "@/assets/gallery/*.(jpg|jpeg|png|webp|gif)",
  { eager: true }
);

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const images = Object.entries(galleryImages).map(([path, module]) => ({
    src: module.default,
    name: path.split("/").pop()?.split(".")[0] || "Photo",
  }));

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setSearchParams({ photo: images[index].name });
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    setSearchParams({});
  };

  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null) {
      const newIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSearchParams({ photo: images[newIndex].name });
    }
  }, [selectedIndex, images, setSearchParams]);

  const goToNext = useCallback(() => {
    if (selectedIndex !== null) {
      const newIndex = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSearchParams({ photo: images[newIndex].name });
    }
  }, [selectedIndex, images, setSearchParams]);

  // Deep-link: auto-open lightbox from ?photo= param
  useEffect(() => {
    const photoParam = searchParams.get("photo");
    if (photoParam && images.length > 0) {
      const index = images.findIndex((img) => img.name === photoParam);
      if (index !== -1 && selectedIndex !== index) {
        setSelectedIndex(index);
      }
    }
    // Only run on mount / param change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, images.length]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;

    const url = `${window.location.origin}/gallery?photo=${images[selectedIndex].name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photo: ${images[selectedIndex].name}`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Photo link has been copied to your clipboard.",
      });
    }
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, goToPrevious, goToNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6">
          <Navigation />

          <main className="py-12">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-4">Casual Photography</h1>
              <p className="text-muted-foreground leading-relaxed">
                When I’m not developing, I enjoy capturing casual photography
                with my <strong>Nothing Phone 3a</strong>, there’s something
                uniquely rewarding about slowing down and preserving everyday
                moments.
              </p>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <LazyImage
                    key={index}
                    src={image.src}
                    alt={image.name}
                    containerClassName="aspect-square rounded-lg bg-muted cursor-pointer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onClick={() => openLightbox(index)}
                  />
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

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top-right buttons: Share + Close */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <a
                href={images[selectedIndex].src}
                download={`${images[selectedIndex].name}.jpg`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Download photo"
              >
                <Download className="h-6 w-6" />
              </a>
              <button
                onClick={handleShare}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Share photo"
              >
                <Share2 className="h-6 w-6" />
              </button>
              <button
                onClick={closeLightbox}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Close lightbox"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="h-10 w-10" />
            </button>

            {/* Image */}
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={images[selectedIndex].src}
              alt={images[selectedIndex].name}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Gallery;