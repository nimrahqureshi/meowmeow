"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import SmartImage from "@/components/SmartImage";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  // Reset selection when a different product's images arrive (adjust-state-
  // during-render pattern from the React docs — no effect, no extra pass).
  const [prevImages, setPrevImages] = useState(images);
  if (images !== prevImages) {
    setPrevImages(images);
    setActive(0);
    setZoomed(false);
  }

  return (
    <div className="grid grid-cols-[64px_1fr] gap-3 md:grid-cols-[80px_1fr]">
      {/* Thumbs */}
      <div className="flex flex-col gap-2.5">
        {images.slice(0, 5).map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn("relative rounded-xl overflow-hidden aspect-square border-2 transition", active === i ? "border-brand" : "border-transparent opacity-70 hover:opacity-100")}
            aria-label={`View image ${i + 1}`}
          >
            <SmartImage src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main */}
      <div
        className="relative rounded-3xl overflow-hidden bg-soft aspect-[4/5] select-none cursor-zoom-in"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
        }}
      >
        <SmartImage
          src={images[active]}
          alt={name}
          loading="eager"
          fetchPriority="high"
          className={cn("absolute inset-0 w-full h-full object-cover transition-transform duration-300", zoomed && "scale-[1.9]")}
        />
        <span className="absolute bottom-3 right-3 glass rounded-full px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 pointer-events-none">
          <ZoomIn size={12} /> Hover to zoom
        </span>
      </div>
    </div>
  );
}