import React from 'react';

interface EcoEatLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export const EcoEatLogo: React.FC<EcoEatLogoProps> = ({
  size = 'md',
  className = '',
  showWordmark = false,
  wordmarkClassName = '',
}) => {
  // Dimensions helper
  const getDimensionClass = () => {
    if (typeof size === 'number') {
      return `w-[${size}px] h-[${size}px]`;
    }
    switch (size) {
      case 'xs':
        return 'w-5 h-6';
      case 'sm':
        return 'w-7 h-8';
      case 'md':
        return 'w-9 h-10';
      case 'lg':
        return 'w-12 h-14';
      case 'xl':
        return 'w-16 h-20';
      case '2xl':
        return 'w-24 h-28';
      default:
        return 'w-9 h-10';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center ${getDimensionClass()}`}>
        <svg
          viewBox="0 0 500 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain drop-shadow-sm transition-transform"
          aria-label="EcoEat BBS School Crest Logo"
        >
          {/* Inner Shield Clipping Boundary */}
          <defs>
            <clipPath id="crestShieldInner">
              <path d="M 40 20 L 460 20 L 460 360 C 460 450 360 515 250 545 C 140 515 40 450 40 360 Z" />
            </clipPath>
          </defs>

          {/* Outer Teal / Turquoise Shield Rim */}
          <path
            d="M 20 10 L 480 10 L 480 365 C 480 470 370 545 250 575 C 130 545 20 470 20 365 Z"
            fill="#009ca6"
          />

          {/* Inner Crest Graphic Area */}
          <g clipPath="url(#crestShieldInner)">
            {/* White Field */}
            <rect x="0" y="0" width="500" height="580" fill="#ffffff" />

            {/* Dark Navy Cross Horizontal Bar */}
            <rect x="0" y="170" width="500" height="105" fill="#0c2540" />

            {/* Dark Navy Cross Vertical Bar */}
            <path
              d="M 195 0 L 305 0 L 305 570 L 250 580 L 195 570 Z"
              fill="#0c2540"
            />

            {/* Open Book In Upper Section */}
            <g transform="translate(250, 245)">
              {/* Left Page (White with navy border) */}
              <path
                d="M -8 -125 L -125 -85 C -128 -84 -130 -80 -130 -75 L -130 40 C -130 46 -125 50 -118 48 L -8 10 Z"
                fill="#ffffff"
                stroke="#0c2540"
                strokeWidth="12"
                strokeLinejoin="round"
              />

              {/* Right Page (White with navy border) */}
              <path
                d="M 8 -125 L 125 -85 C 128 -84 130 -80 130 -75 L 130 40 C 130 46 125 50 118 48 L 8 10 Z"
                fill="#ffffff"
                stroke="#0c2540"
                strokeWidth="12"
                strokeLinejoin="round"
              />

              {/* Book Spine */}
              <path
                d="M 0 -125 L 0 18"
                stroke="#0c2540"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Chinese Characters: 培 (Pei) & 民 (Min) */}
              <text
                x="-68"
                y="-12"
                fontFamily="'Noto Serif SC', 'Songti SC', 'Source Han Serif SC', 'SimSun', serif"
                fontSize="64"
                fontWeight="900"
                fill="#0c2540"
                textAnchor="middle"
                dominantBaseline="central"
              >
                培
              </text>

              <text
                x="68"
                y="-12"
                fontFamily="'Noto Serif SC', 'Songti SC', 'Source Han Serif SC', 'SimSun', serif"
                fontSize="64"
                fontWeight="900"
                fill="#0c2540"
                textAnchor="middle"
                dominantBaseline="central"
              >
                民
              </text>
            </g>

            {/* BBS Typography Across Lower Half */}
            {/* First 'B' (Navy on White) */}
            <text
              x="145"
              y="475"
              fontFamily="'Times New Roman', 'Georgia', 'Playfair Display', serif"
              fontSize="128"
              fontWeight="900"
              fill="#0c2540"
              textAnchor="middle"
            >
              B
            </text>

            {/* Middle 'B' (Crisp White on Dark Navy Cross) */}
            <text
              x="250"
              y="475"
              fontFamily="'Times New Roman', 'Georgia', 'Playfair Display', serif"
              fontSize="128"
              fontWeight="900"
              fill="#ffffff"
              textAnchor="middle"
            >
              B
            </text>

            {/* 'S' (Navy on White) */}
            <text
              x="355"
              y="475"
              fontFamily="'Times New Roman', 'Georgia', 'Playfair Display', serif"
              fontSize="128"
              fontWeight="900"
              fill="#0c2540"
              textAnchor="middle"
            >
              S
            </text>
          </g>
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-black tracking-tight text-theme-main ${wordmarkClassName}`}>
              EcoEat
            </span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-theme-primary-bg text-theme-primary border border-theme-primary-border">
              BBS PIK
            </span>
          </div>
          <span className="text-[11px] text-theme-muted font-medium">
            Campus Dining Sustainability
          </span>
        </div>
      )}
    </div>
  );
};
