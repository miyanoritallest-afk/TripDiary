'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

type Props = {
  photoUrls: string[];
  onPhotoChange: (index: number) => void;
};

export default function PhotoSwiper({ photoUrls, onPhotoChange }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handlePhotoChange = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      onPhotoChange(index);
    },
    [onPhotoChange]
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              handlePhotoChange(index);
            }
          });
        },
        { threshold: 0.5, root: containerRef.current }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [photoUrls, handlePhotoChange]);

  const scrollTo = (index: number) => {
    itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  if (photoUrls.length === 0) return null;

  return (
    <div className="relative w-full bg-black">
      {/* スワイプコンテナ */}
      <div
        ref={containerRef}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photoUrls.map((url, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="flex-none w-full snap-start flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`写真 ${i + 1}`}
              className="w-full h-auto block"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* 左右矢印ボタン */}
      {currentIndex > 0 && (
        <button
          onClick={() => scrollTo(currentIndex - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center text-white"
          aria-label="前の写真"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      {currentIndex < photoUrls.length - 1 && (
        <button
          onClick={() => scrollTo(currentIndex + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center text-white"
          aria-label="次の写真"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* ページドット */}
      {photoUrls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {photoUrls.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`写真 ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
