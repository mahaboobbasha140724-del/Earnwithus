import React from 'react';

export default function Logo({ size = 32 }) {
  const width = size * 1.4;
  const height = size;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        display: 'block',
        filter: 'drop-shadow(0px 2px 8px rgba(16, 185, 129, 0.15))'
      }}
    >
      <defs>
        <linearGradient id="logoNavy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0b1e36" />
          <stop offset="100%" stopColor="#1a365d" />
        </linearGradient>
        <linearGradient id="logoGreen" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Bull Horns Background (Navy Blue) */}
      <path 
        d="M 68 28 C 63 36, 65 48, 73 54 C 82 60, 92 56, 96 46 C 99 38, 102 28, 104 31 C 105 32, 103 36, 98 44 C 93 52, 82 58, 72 52 C 64 46, 61 36, 63 28 C 64 25, 69 22, 68 28 Z" 
        fill="url(#logoNavy)" 
      />

      {/* E Letter (Navy Blue) */}
      <path 
        d="M 15 35 H 48 V 44 H 28 V 50 H 42 V 59 H 28 V 65 H 48 V 74 H 15 V 35 Z" 
        fill="url(#logoNavy)" 
      />

      {/* First leg of W (down, navy) */}
      <path 
        d="M 43 44 L 51 74 H 58 L 50 44 H 43 Z" 
        fill="url(#logoNavy)" 
      />

      {/* Second leg of W (up, navy) */}
      <path 
        d="M 50 74 L 57 44 H 64 L 57 74 H 50 Z" 
        fill="url(#logoNavy)" 
      />

      {/* Third leg of W (down, green) */}
      <path 
        d="M 57 44 L 64 74 H 71 L 64 44 H 57 Z" 
        fill="url(#logoGreen)" 
      />

      {/* Upward Arrow Segment of W (Green) */}
      <path 
        d="M 64 74 L 88 20 L 83 17 H 98 V 32 L 94 28 L 71 74 H 64 Z" 
        fill="url(#logoGreen)" 
      />
    </svg>
  );
}
