import React from 'react';

type DotSpinnerProps = {
  width?: string;
  height?: string;
  dotColor?: string;
};

const GlobalSpinner: React.FC<DotSpinnerProps> = ({
  width = '1.5rem',
  height = '1.5rem',
  dotColor = '#114784',
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="flex space-x-2">
        <div
          className="rounded-full animate-bounce"
          style={{
            width,
            height,
            backgroundColor: dotColor,
            animationDelay: '-0.32s',
          }}
        ></div>
        <div
          className="rounded-full animate-bounce"
          style={{
            width,
            height,
            backgroundColor: dotColor,
            animationDelay: '-0.16s',
          }}
        ></div>
        <div
          className="rounded-full animate-bounce"
          style={{
            width,
            height,
            backgroundColor: dotColor,
          }}
        ></div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
