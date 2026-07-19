'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface ImageProp {
  _id?: string;
  url: string;
  caption?: string;
}

interface AdaptiveGalleryProps {
  images: ImageProp[];
  clickable?: boolean;
  onDelete?: (id: string) => void;
}

interface LoadedImage extends ImageProp {
  aspectRatio: number;
}

export function AdaptiveGallery({ images, clickable = false, onDelete }: AdaptiveGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<LoadedImage[]>([]);

  useEffect(() => {
    let active = true;

    const computeRatios = async () => {
      const promises = images.map((img) => {
        return new Promise<LoadedImage>((resolve) => {
          const i = new Image();
          i.src = img.url;
          i.onload = () => {
            resolve({
              ...img,
              aspectRatio: i.naturalWidth / i.naturalHeight || 1,
            });
          };
          i.onerror = () => {
            resolve({
              ...img,
              aspectRatio: 1,
            });
          };
        });
      });

      const results = await Promise.all(promises);
      if (active) {
        setLoadedImages(results);
      }
    };

    computeRatios();
    return () => {
      active = false;
    };
  }, [images]);

  return (
    <div className="flex flex-wrap gap-4 w-full">
      {loadedImages.map((image) => {
        // Base target width for columns on desktop sizes
        const baseWidth = 340; 
        // Scales the width dynamically based on the aspect ratio weight
        const dynamicWidth = baseWidth * image.aspectRatio;

        return (
          <div
            key={image._id || image.url}
            className="relative rounded-2xl overflow-hidden group border border-white/5 bg-neutral-900/40 transition-all duration-300 hover:border-white/20"
            style={{
              // flex-grow handles the horizontal expansion to achieve the full-width bento look
              flexGrow: image.aspectRatio,
              flexShrink: 1,
              flexBasis: `${dynamicWidth}px`,
            }}
          >
            {/* 
              This absolute aspect-ratio CSS rule dictates the card geometry.
              By letting the height be "auto", the browser calculates the height natively 
              from the true image boundaries—zero layout cropping possible.
            */}
            <div 
              style={{ aspectRatio: `${image.aspectRatio}` }} 
              className="w-full h-auto relative"
            >
              <img
                src={image.url}
                alt={image.caption || 'Gallery Image'}
                // object-contain guarantees the absolute full image is presented unaltered
                className="w-full h-full object-contain display-block transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              
              {image.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                  <p className="text-white text-xs font-medium tracking-wide translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {image.caption}
                  </p>
                </div>
              )}

              {onDelete && image._id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image._id!);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-red-500/80 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 shadow-lg cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Structural layout stabilizer for trailing odd rows */}
      <div className="flex-grow-[999] min-w-[300px] h-0 pointer-events-none" />
    </div>
  );
}