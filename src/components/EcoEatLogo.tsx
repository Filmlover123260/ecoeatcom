import React from 'react';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
  // Dimensions helper
  const getDimensionClass = () => {
    if (typeof size === 'number') {
      return `w-[${size}px] h-[${Math.round(size * 1.16)}px]`;
    }
    switch (size) {
      case 'xs':
        return 'w-5 h-6';
      case 'sm':
        return 'w-7 h-8';
      case 'md':
        return 'w-9 h-11';
      case 'lg':
        return 'w-14 h-16';
      case 'xl':
        return 'w-20 h-24';
      case '2xl':
        return 'w-28 h-32';
      default:
        return 'w-9 h-11';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center ${getDimensionClass()}`}>
        <svg
          viewBox="0 0 500 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200 hover:scale-105"
          aria-label={t('ecoeat_school_crest_logo', 'EcoEat BBS School Crest Logo')}
        >
          {/* Inner Shield Clipping Boundary */}
          <defs>
            <clipPath id="crestShieldInner">
              <path d="M 40 24 L 460 24 L 460 330 C 460 430 355 498 250 532 C 145 498 40 430 40 330 Z" />
            </clipPath>
          </defs>

          {/* Outer Teal Shield Rim */}
          <path
            d="M 18 10 L 482 10 L 482 340 C 482 455 370 530 250 568 C 130 530 18 455 18 340 Z"
            fill="#0da19c"
          />

          {/* Inner Crest Graphic Area with Exact Quadrants */}
          <g clipPath="url(#crestShieldInner)">
            {/* Base Teal Fill (Provides Top-Left & Bottom-Right Teal Quadrants) */}
            <rect x="0" y="0" width="500" height="580" fill="#0da19c" />

            {/* Top-Right Quadrant: Crisp White */}
            <rect x="302" y="24" width="160" height="142" fill="#ffffff" />

            {/* Bottom-Left Quadrant: Crisp White */}
            <rect x="40" y="258" width="160" height="280" fill="#ffffff" />

            {/* Dark Navy Cross: Horizontal Bar */}
            <rect x="40" y="164" width="420" height="96" fill="#0b2444" />

            {/* Dark Navy Cross: Vertical Bar ending in pointed tip */}
            <path
              d="M 198 24 L 302 24 L 302 516 L 250 534 L 198 516 Z"
              fill="#0b2444"
            />

            {/* Open Book In Upper/Middle Section */}
            <g id="crest-open-book">
              {/* Dark Navy Cover Underlay */}
              <path d="M 246 112 L 118 94 L 118 296 L 246 318 Z" fill="#08182b" />
              <path d="M 254 112 L 382 94 L 382 296 L 254 318 Z" fill="#08182b" />
              <path d="M 244 316 L 250 326 L 256 316 Z" fill="#08182b" />

              {/* Left Page (White with dark navy border) */}
              <path
                d="M 246 122 L 128 104 L 128 286 L 246 308 Z"
                fill="#ffffff"
                stroke="#0b2444"
                strokeWidth="11"
                strokeLinejoin="round"
              />

              {/* Right Page (White with dark navy border) */}
              <path
                d="M 254 122 L 372 104 L 372 286 L 254 308 Z"
                fill="#ffffff"
                stroke="#0b2444"
                strokeWidth="11"
                strokeLinejoin="round"
              />

              {/* Book Spine */}
              <line
                x1="250"
                y1="114"
                x2="250"
                y2="314"
                stroke="#0b2444"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Chinese Characters: 培 (Pei) & 民 (Min) */}
              <text
                x="187"
                y="210"
                fontFamily="'Noto Serif SC', 'Songti SC', 'Source Han Serif SC', 'SimSun', serif"
                fontSize="62"
                fontWeight="900"
                fill="#0b2444"
                textAnchor="middle"
                dominantBaseline="central"
              >
                培
              </text>

              <text
                x="313"
                y="210"
                fontFamily="'Noto Serif SC', 'Songti SC', 'Source Han Serif SC', 'SimSun', serif"
                fontSize="62"
                fontWeight="900"
                fill="#0b2444"
                textAnchor="middle"
                dominantBaseline="central"
              >
                民
              </text>
            </g>

            {/* BBS Typography Across Lower Half */}
            {/* First 'B' (Dark Navy on White Bottom-Left Quadrant) */}
            <text
              x="142"
              y="445"
              fontFamily="'Times New Roman', 'Playfair Display', 'Georgia', serif"
              fontSize="124"
              fontWeight="900"
              fill="#0b2444"
              textAnchor="middle"
            >
              B
            </text>

            {/* Middle 'B' (Crisp White on Dark Navy Vertical Crossbar) */}
            <text
              x="250"
              y="445"
              fontFamily="'Times New Roman', 'Playfair Display', 'Georgia', serif"
              fontSize="124"
              fontWeight="900"
              fill="#ffffff"
              textAnchor="middle"
            >
              B
            </text>

            {/* 'S' (Dark Navy on Teal Bottom-Right Quadrant) */}
            <text
              x="358"
              y="445"
              fontFamily="'Times New Roman', 'Playfair Display', 'Georgia', serif"
              fontSize="124"
              fontWeight="900"
              fill="#0b2444"
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
            {t('campus_dining_sustainability', 'Campus Dining Sustainability')}
          </span>
        </div>
      )}
    </div>
  );
};
