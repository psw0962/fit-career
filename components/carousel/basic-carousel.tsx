import React, { useState, useEffect, useCallback } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

type ThumbnailCarouselProps = {
  slides: string[] | undefined;
  options?: EmblaOptionsType;
};

const BasicCarousel: React.FC<ThumbnailCarouselProps> = (props) => {
  const { slides, options } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options);

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return;
    const currentIndex = emblaMainApi.selectedScrollSnap();
    setSelectedIndex(currentIndex);
  }, [emblaMainApi]);

  useEffect(() => {
    if (!emblaMainApi) return;

    onSelect();
    emblaMainApi.on('select', onSelect);

    return () => {
      emblaMainApi.off('select', onSelect);
    };
  }, [emblaMainApi, onSelect]);

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="relative rounded overflow-hidden">
        <div className="overflow-hidden" ref={emblaMainRef}>
          <div className="flex">
            {slides &&
              slides.map((imageUrl, index) => (
                <div key={index} className="flex-shrink-0 w-full">
                  <div className="relative w-full h-[40vh] overflow-hidden">
                    <Image
                      src={slides.length !== 0 ? imageUrl : '/svg/logo.svg'}
                      className="rounded"
                      alt={`image ${index}`}
                      fill
                      priority
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
          {selectedIndex + 1} / {slides?.length}
        </div>
      </div>
    </div>
  );
};

export default BasicCarousel;
