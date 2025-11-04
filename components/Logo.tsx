
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 70"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TARHGET Logo"
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>
      <g fill="#8c2d2d" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        {/* Circle with T */}
        <g transform="translate(100, 25)" filter="url(#shadow)">
          <circle cx="0" cy="0" r="22" fill="none" stroke="#8c2d2d" strokeWidth="3" />
          <text
            x="0"
            y="7"
            fontSize="30"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
          >
            T
          </text>
        </g>
        {/* Text */}
        <text
          x="100"
          y="60"
          fontSize="18"
          textAnchor="middle"
          letterSpacing="2"
          filter="url(#shadow)"
        >
          TARHGET
        </text>
      </g>
    </svg>
  );
};

export default Logo;
   