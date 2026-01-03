import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
}

const LazyImage = ({ src, alt, className, containerClassName, onClick }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", containerClassName)} onClick={onClick}>
      {/* Skeleton loader */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Blur placeholder - shown while loading */}
      {isInView && !isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{
            backdropFilter: "blur(20px)",
          }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-all duration-500",
            isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-105",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
