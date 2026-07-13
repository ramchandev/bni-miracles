"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const IMAGES = [1, 2, 3, 4, 5, 6];

export default function BvdGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Close on Escape & Navigate with arrow keys
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === null || prev === IMAGES.length - 1 ? 0 : prev + 1));
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === null || prev === 0 ? IMAGES.length - 1 : prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  return (
    <section className="py-20 px-6 bg-slate-50/50 border-b border-gray-100">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-red-100 bg-red-50 text-red-600">
            Glimpse
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            See a glimpse of our last BVD
          </h3>
          <p className="text-sm max-w-sm mx-auto mt-2 text-slate-400 font-medium">
            Click any photo to view in full size and browse our previous Big Visitor Day.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {IMAGES.map((i, index) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group text-left relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={`/bvd-gallery/${i}.jpg`}
                  alt={`BVD Event Glimpse ${i}`}
                  fill
                  sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                
                {/* Hover overlay indicator */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal Overlay */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setActiveIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(null);
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Left Arrow */}
          <button
            type="button"
            className="absolute left-4 md:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-200 cursor-pointer focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev === null || prev === 0 ? IMAGES.length - 1 : prev - 1));
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Active Image */}
          <div
            className="relative max-w-[90vw] max-h-[80vh] md:max-w-[85vw] md:max-h-[85vh] aspect-[4/3] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={`/bvd-gallery/${IMAGES[activeIndex]}.jpg`}
              alt={`Detailed Glimpse ${IMAGES[activeIndex]}`}
              fill
              className="object-contain select-none"
              unoptimized
            />
            
            {/* Index counter */}
            <div className="absolute bottom-[-32px] left-1/2 transform -translate-x-1/2 text-white/60 font-semibold text-sm">
              {activeIndex + 1} / {IMAGES.length}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            className="absolute right-4 md:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-200 cursor-pointer focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev === null || prev === IMAGES.length - 1 ? 0 : prev + 1));
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
