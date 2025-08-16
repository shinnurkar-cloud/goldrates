'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

type ImageCarouselProps = {
  initialImages: string[];
};

export function ImageCarousel({ initialImages }: ImageCarouselProps) {
  const [images, setImages] = useState(initialImages);
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        // Simple check to see if arrays are different
        if (JSON.stringify(data.images) !== JSON.stringify(images)) {
          setImages(data.images);
        }
      }
    } catch (error) {
      console.error('Failed to fetch images', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchImages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [images]);

  return (
    <Card>
      <CardContent className="p-4">
        <Carousel 
          className="w-full"
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {images.map((src, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video relative">
                  <Image
                    src={src}
                    alt={`Carousel image ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                    data-ai-hint="gold bars"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
