import React, { useState, useEffect, useCallback } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

type ThumbnailCarouselProps = {
  slides: string[] | undefined;
  options?: EmblaOptionsType;
};

const ThumbnailCarousel: React.FC<ThumbnailCarouselProps> = (props) => {
  const { slides, options } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on('select', onSelect).on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="overflow-hidden" ref={emblaMainRef}>
        <div className="flex -ml-4">
          {slides &&
            slides.map((imageUrl, index) => (
              <div key={index} className="flex-shrink-0 w-full min-w-0 pl-4">
                <div className="relative w-full aspect-[16/9] mb-4  border-[2px] rounded">
                  <Image
                    src={slides.length !== 0 ? imageUrl : '/svg/logo.svg'}
                    className="rounded"
                    alt={`image ${index}`}
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaThumbsRef}>
        <div className="flex gap-2">
          {slides &&
            slides.map((imageUrl, index) => (
              <div
                key={index}
                className={`relative w-48 h-32 mb-4 flex border-[2px] rounded px-20 py-10 cursor-pointer ${
                  index === selectedIndex ? 'border-[#4C71C0] ' : ''
                }`}
                onClick={() => onThumbClick(index)}
              >
                <Image
                  src={slides.length !== 0 ? imageUrl : '/svg/logo.svg'}
                  className="rounded"
                  alt={`image ${index}`}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailCarousel;
