import React from 'react';

export default function Logo({ size = 32 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        display: 'block',
        filter: 'drop-shadow(0px 2px 8px rgba(16, 185, 129, 0.3))'
      }}
    >
      <defs>
        <linearGradient id="ewuLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* Outer Squircle with Brand Gradient */}
      <rect width="32" height="32" rx="9" fill="url(#ewuLogoGrad)" />
      
      {/* Subtly transparent background grid lines for financial context */}
      <path 
        d="M6 16H26M16 6V26" 
        stroke="white" 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeOpacity="0.15" 
      />
      
      {/* Sleek, dynamic upward financial trend line */}
      <path 
        d="M8 22L14 15L18 18.5L24 10.5" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Sharp Arrowhead pointing up-right */}
      <path 
        d="M20 10.5H24V14.5" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Highlighting target dot representing maximum earnings */}
      <circle cx="24" cy="10.5" r="1.5" fill="#34d399" />
    </svg>
  );
}
