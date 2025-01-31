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
    <div className="w-full max-w-[720px] mx-auto">
      <div className="relative rounded overflow-hidden">
        <div className="overflow-hidden" ref={emblaMainRef}>
          <div className="flex">
            {slides &&
              slides.map((imageUrl, index) => (
                <div key={index} className="flex-shrink-0 w-full">
                  <div className="relative w-full h-[400px] overflow-hidden border rounded">
                    <div
                      className="absolute inset-0 rounded"
                      style={{
                        backgroundImage: `url(${slides.length !== 0 ? imageUrl : '/svg/logo.svg'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="absolute inset-0 bg-black/70" />
                    <Image
                      src={slides.length !== 0 ? imageUrl : '/svg/logo.svg'}
                      className="rounded py-6 px-6"
                      alt={`image ${index}`}
                      fill
                      priority
                      style={{ objectFit: 'contain' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                      quality={75}
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
