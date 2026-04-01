'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResponsiveImageCarouselProps {
  slides: string[];
}

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg==';

export default function ResponsiveImageCarousel({ slides }: ResponsiveImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });

  const onUpdate = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onUpdate();
    emblaApi.on('select', onUpdate);
    emblaApi.on('reInit', onUpdate);
    return () => {
      emblaApi.off('select', onUpdate);
      emblaApi.off('reInit', onUpdate);
    };
  }, [emblaApi, onUpdate]);

  if (!slides || slides.length === 0) return null;

  const showArrows = canScrollPrev || canScrollNext;

  return (
    <div className='relative w-full'>
      <div className='overflow-hidden rounded' ref={emblaRef}>
        <div className='flex gap-2'>
          {slides.map((src, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-full ${slides.length >= 2 ? 'md:w-1/2' : ''} ${slides.length > 2 ? 'xl:w-1/3' : ''}`}
            >
              <div className='relative w-full aspect-[4/3] md:aspect-auto md:h-[380px] overflow-hidden border rounded bg-black'>
                {/* 모바일: cover */}
                <Image
                  src={src}
                  alt={`${index + 1}번째 이미지`}
                  fill
                  priority={index < 3}
                  sizes='100vw'
                  style={{ objectFit: 'cover' }}
                  className={slides.length === 1 ? 'md:hidden' : ''}
                  placeholder='blur'
                  blurDataURL={BLUR_DATA_URL}
                />
                {/* md+, 이미지 1개: blur backdrop + contain */}
                {slides.length === 1 && (
                  <>
                    <Image
                      src={src}
                      alt=''
                      aria-hidden
                      fill
                      sizes='100vw'
                      className='hidden md:block'
                      style={{
                        objectFit: 'cover',
                        filter: 'blur(24px)',
                        transform: 'scale(1.1)',
                        opacity: 0.5,
                      }}
                    />
                    <Image
                      src={src}
                      alt='1번째 이미지'
                      fill
                      priority
                      sizes='100vw'
                      className='hidden md:block'
                      style={{ objectFit: 'contain' }}
                      placeholder='blur'
                      blurDataURL={BLUR_DATA_URL}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <span className='absolute top-3 right-3 z-10 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm'>
          {selectedIndex + 1} / {slides.length}
        </span>
      )}

      {showArrows && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className='hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-white border shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
            aria-label='이전 이미지'
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className='hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-2 rounded-full bg-white border shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
            aria-label='다음 이미지'
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
}
