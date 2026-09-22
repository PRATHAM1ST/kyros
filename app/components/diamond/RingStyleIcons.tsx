import React from 'react';
import type {SettingStyle} from '~/types/diamond';

interface RingStyleIconProps {
  style: SettingStyle;
  className?: string;
  size?: number;
}

export function RingStyleIcon({
  style,
  className = 'w-8 h-8',
  size = 32,
}: RingStyleIconProps) {
  switch (style) {
    case 'solitaire':
      // Classic 4-prong solitaire with elevated center head
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Ring shank */}
          <path d="M6 21 C6 26.5 10.5 29 16 29 C21.5 29 26 26.5 26 21 C26 15 20.5 13 19 12.5" />
          <path d="M6 21 C6 15 11.5 13 13 12.5" />
          {/* Prongs */}
          <path d="M12 12 L10 5" />
          <path d="M20 12 L22 5" />
          <path d="M14 12 L14 5.5" />
          <path d="M18 12 L18 5.5" />
          {/* Diamond top table */}
          <polygon points="16,3 22,6 16,9 10,6" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );

    case 'halo':
      // Center stone encircled by micro-pavé halo ring
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Shank */}
          <path d="M7 21 C7 26 11 29 16 29 C21 29 25 26 25 21 C25 16 20 14 18 13.5" />
          <path d="M7 21 C7 16 12 14 14 13.5" />
          {/* Outer halo oval */}
          <ellipse cx="16" cy="8.5" rx="8" ry="5.5" strokeDasharray="1.5 1.5" />
          {/* Center diamond */}
          <polygon points="16,5 19.5,8.5 16,12 12.5,8.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'hidden-halo':
      // Diamond elevated with a secret collar under the girdle
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Shank */}
          <path d="M6 21 C6 26.5 10.5 29 16 29 C21.5 29 26 26.5 26 21 C26 15 20.5 13 19 12.5" />
          <path d="M6 21 C6 15 11.5 13 13 12.5" />
          {/* Basket gallery & hidden halo band */}
          <path d="M11 11.5 L21 11.5" strokeDasharray="1.5 1.5" strokeWidth="2" />
          <path d="M12 12.5 L10 5" />
          <path d="M20 12.5 L22 5" />
          {/* Center diamond */}
          <polygon points="16,3 21,6.5 16,10 11,6.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'pave':
      // French Pavé encrusted diamond band
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Shank with pavé notches */}
          <path d="M6 21 C6 26 10.5 29 16 29 C21.5 29 26 26 26 21" />
          {/* Pavé stone beads */}
          <circle cx="8" cy="18" r="1" fill="currentColor" />
          <circle cx="9.5" cy="15" r="1" fill="currentColor" />
          <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
          <circle cx="24" cy="18" r="1" fill="currentColor" />
          <circle cx="22.5" cy="15" r="1" fill="currentColor" />
          <circle cx="20.5" cy="12.5" r="1" fill="currentColor" />
          {/* Center head */}
          <path d="M13 11 L11 4.5" />
          <path d="M19 11 L21 4.5" />
          <polygon points="16,3 20.5,6.5 16,9.5 11.5,6.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'three-stone':
      // Center stone flanked by two side stones
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Shank */}
          <path d="M7 21 C7 26 11 29 16 29 C21 29 25 26 25 21 C25 17 23 15 22 14" />
          <path d="M7 21 C7 17 9 15 10 14" />
          {/* Left stone */}
          <polygon points="10,9 13,11 10,13 7,11" fill="currentColor" fillOpacity="0.15" />
          {/* Right stone */}
          <polygon points="22,9 25,11 22,13 19,11" fill="currentColor" fillOpacity="0.15" />
          {/* Main center stone */}
          <polygon points="16,4 20,8 16,12 12,8" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );

    case 'bezel':
      // Encircling clean metal rim
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Shank */}
          <path d="M6 21 C6 26.5 10.5 29 16 29 C21.5 29 26 26.5 26 21 C26 15 21 13 19 12" />
          <path d="M6 21 C6 15 11 13 13 12" />
          {/* Bezel collar */}
          <ellipse cx="16" cy="7.5" rx="6.5" ry="4.5" strokeWidth="2" />
          <polygon points="16,5 19,7.5 16,10 13,7.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'vintage':
      // Antique milgrain filigree detailing
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Shank with milgrain dots */}
          <path d="M6 21 C6 26.5 10.5 29 16 29 C21.5 29 26 26.5 26 21" />
          <circle cx="9" cy="15" r="0.75" fill="currentColor" />
          <circle cx="11" cy="13" r="0.75" fill="currentColor" />
          <circle cx="23" cy="15" r="0.75" fill="currentColor" />
          <circle cx="21" cy="13" r="0.75" fill="currentColor" />
          {/* Filigree scrolls under head */}
          <path d="M12 12 C13 14 15 13 16 11.5 C17 13 19 14 20 12" />
          {/* Center stone with petal basket */}
          <polygon points="16,3 21,7 16,10.5 11,7" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'cathedral':
      // High sweeping architectural arches
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Shank base */}
          <path d="M6 21 C6 26.5 10.5 29 16 29 C21.5 29 26 26.5 26 21" />
          {/* Sweeping cathedral arches rising high */}
          <path d="M6 21 C7 15 10 9 12 7" />
          <path d="M26 21 C25 15 22 9 20 7" />
          {/* Floating bridge under arch */}
          <line x1="12" y1="12" x2="20" y2="12" />
          {/* Elevated head */}
          <polygon points="16,2.5 20,6 16,9.5 12,6" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'toi-et-moi':
      // Twin interlocking romantic gemstones
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Bypass shank wrapping around */}
          <path d="M7 23 C7 27 11 29 16 29 C21 29 25 27 25 23 C25 18 21 14 18 10" />
          <path d="M7 23 C7 18 11 14 14 10" />
          {/* First gemstone (e.g. Pear) */}
          <path
            d="M12.5,4 C12.5,4 15.5,7 15.5,9.5 C15.5,11.2 14.2,12.5 12.5,12.5 C10.8,12.5 9.5,11.2 9.5,9.5 C9.5,7 12.5,4 12.5,4 Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Second gemstone (e.g. Emerald/Oval) */}
          <rect
            x="16"
            y="6"
            width="6"
            height="7.5"
            rx="1.5"
            transform="rotate(15 19 9.5)"
            fill="currentColor"
            fillOpacity="0.25"
          />
        </svg>
      );

    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
        >
          <circle cx="16" cy="20" r="8" />
          <polygon points="16,4 20,8 16,12 12,8" />
        </svg>
      );
  }
}
