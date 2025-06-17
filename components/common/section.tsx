'use client';

import type { WheelEvent as ReactWheelEvent } from 'react';
import { useEffect, useState } from 'react';

export default function SectionComp(): React.ReactElement {
  const [currentSection, setCurrentSection] = useState(0);
  const [isThrottled, setIsThrottled] = useState(false);
  const sections = ['Section 1', 'Section 2', 'Section 3', 'Section 4'];

  const handleScroll = (event: ReactWheelEvent) => {
    if (isThrottled) return;

    const deltaY = event.deltaY;

    if (deltaY > 0 && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else if (deltaY < 0 && currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }

    setIsThrottled(true);
    setTimeout(() => setIsThrottled(false), 500);
  };

  useEffect(() => {
    const handleWheel = (event: Event) => {
      if (event instanceof WheelEvent) {
        handleScroll(event as unknown as ReactWheelEvent);
      }
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentSection, isThrottled]);

  return (
    <div className='relative w-screen h-screen overflow-hidden'>
      <div
        className='relative w-screen h-[400vh]'
        style={{
          transform: `translateY(-${currentSection * 100}vh)`,
          transition: 'transform 0.5s ease-in-out',
        }}
      >
        {sections.map((section, index) => (
          <div
            key={index}
            className={`w-screen h-screen flex justify-center items-center text-[10rem] text-white ${
              index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-600'
            }`}
          >
            {section}
          </div>
        ))}
      </div>
    </div>
  );
}
