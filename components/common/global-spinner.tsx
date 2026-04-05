'use client';

import React from 'react';

interface DotSpinnerProps {
  width?: string;
  height?: string;
  dotColor?: string;
  label?: string;
  fixed?: boolean;
}

export default function GlobalSpinner({
  width = '1.5rem',
  height = '1.5rem',
  dotColor = '#114784',
  label,
  fixed = false,
}: DotSpinnerProps) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 flex flex-col items-center justify-center z-50 bg-white/80 backdrop-blur-sm`}
      onClick={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      style={{ cursor: 'not-allowed' }}
    >
      <div className='flex space-x-2'>
        <div
          className='rounded-full animate-bounce'
          style={{
            width,
            height,
            backgroundColor: dotColor,
            animationDelay: '-0.32s',
          }}
        ></div>
        <div
          className='rounded-full animate-bounce'
          style={{
            width,
            height,
            backgroundColor: dotColor,
            animationDelay: '-0.16s',
          }}
        ></div>
        <div
          className='rounded-full animate-bounce'
          style={{
            width,
            height,
            backgroundColor: dotColor,
          }}
        ></div>
      </div>
      {label && (
        <p className='mt-4 text-sm font-bold' style={{ color: dotColor }}>
          {label}
        </p>
      )}
    </div>
  );
}
