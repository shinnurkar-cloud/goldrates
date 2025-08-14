'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type ImageCarouselProps = {
  initialImages: string[];
};

export function ImageCarousel({ initialImages }: ImageCarouselProps) {
  const [images, setImages] = useState(initialImages);

  useEffect(() => {
    // This is a placeholder for potential real-time updates via polling or websockets
    // For now, it just sets the initial state. A real app might fetch updated images here.
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((src, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video relative">
                  <Image
                    src={src}
                    alt={`Carousel image ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                    data-ai-hint="advertisement product"
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
