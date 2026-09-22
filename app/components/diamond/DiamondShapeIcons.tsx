import React from 'react';
import type {DiamondShape} from '~/types/diamond';

interface ShapeIconProps {
  shape: DiamondShape;
  className?: string;
  size?: number;
}

export function DiamondShapeIcon({
  shape,
  className = 'w-6 h-6',
  size = 24,
}: ShapeIconProps) {
  switch (shape) {
    case 'Round':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="9" />
          <polygon points="12,5 17,9 15,16 9,16 7,9" />
          <line x1="12" y1="3" x2="12" y2="5" />
          <line x1="19.5" y1="7.5" x2="17" y2="9" />
          <line x1="19.5" y1="16.5" x2="15" y2="16" />
          <line x1="12" y1="21" x2="12" y2="19" />
          <line x1="4.5" y1="16.5" x2="9" y2="16" />
          <line x1="4.5" y1="7.5" x2="7" y2="9" />
        </svg>
      );

    case 'Oval':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <ellipse cx="12" cy="12" rx="7" ry="9.5" />
          <polygon points="12,4.5 16,8.5 15,16 9,16 8,8.5" />
          <line x1="12" y1="2.5" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="21.5" />
          <line x1="6.5" y1="8" x2="8" y2="8.5" />
          <line x1="17.5" y1="8" x2="16" y2="8.5" />
          <line x1="6" y1="16" x2="9" y2="16" />
          <line x1="18" y1="16" x2="15" y2="16" />
        </svg>
      );

    case 'Emerald':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <polygon points="6,3 18,3 21,7 21,17 18,21 6,21 3,17 3,7" />
          <polygon points="8,6 16,6 18,9 18,15 16,18 8,18 6,15 6,9" />
          <line x1="6" y1="3" x2="8" y2="6" />
          <line x1="18" y1="3" x2="16" y2="6" />
          <line x1="21" y1="7" x2="18" y2="9" />
          <line x1="21" y1="17" x2="18" y2="15" />
          <line x1="18" y1="21" x2="16" y2="18" />
          <line x1="6" y1="21" x2="8" y2="18" />
          <line x1="3" y1="17" x2="6" y2="15" />
          <line x1="3" y1="7" x2="6" y2="9" />
        </svg>
      );

    case 'Radiant':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <polygon points="6,4 18,4 20,7 20,17 18,20 6,20 4,17 4,7" />
          <polygon points="8,7 16,7 17,9 17,15 16,17 8,17 7,15 7,9" />
          <line x1="12" y1="4" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="20" />
          <line x1="4" y1="12" x2="7" y2="12" />
          <line x1="17" y1="12" x2="20" y2="12" />
          <line x1="8" y1="7" x2="16" y2="17" />
          <line x1="16" y1="7" x2="8" y2="17" />
        </svg>
      );

    case 'Cushion':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <rect x="6.5" y="6.5" width="11" height="11" rx="3" />
          <line x1="3.5" y1="3.5" x2="6.5" y2="6.5" />
          <line x1="20.5" y1="3.5" x2="17.5" y2="6.5" />
          <line x1="20.5" y1="20.5" x2="17.5" y2="17.5" />
          <line x1="3.5" y1="20.5" x2="6.5" y2="17.5" />
          <line x1="12" y1="3.5" x2="12" y2="6.5" />
          <line x1="12" y1="17.5" x2="12" y2="20.5" />
          <line x1="3.5" y1="12" x2="6.5" y2="12" />
          <line x1="17.5" y1="12" x2="20.5" y2="12" />
        </svg>
      );

    case 'Pear':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12,2 C12,2 19,10 19,15 C19,18.8 15.9,22 12,22 C8.1,22 5,18.8 5,15 C5,10 12,2 12,2 Z" />
          <polygon points="12,7 15.5,12 14,17 10,17 8.5,12" />
          <line x1="12" y1="2" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="22" />
          <line x1="5.5" y1="13" x2="8.5" y2="12" />
          <line x1="18.5" y1="13" x2="15.5" y2="12" />
        </svg>
      );

    case 'Princess':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect x="3.5" y="3.5" width="17" height="17" />
          <polygon points="3.5,3.5 12,9 20.5,3.5 15,12 20.5,20.5 12,15 3.5,20.5 9,12" />
          <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" />
          <line x1="20.5" y1="3.5" x2="3.5" y2="20.5" />
        </svg>
      );

    case 'Asscher':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <polygon points="6,3 18,3 21,6 21,18 18,21 6,21 3,18 3,6" />
          <polygon points="8,6 16,6 18,8 18,16 16,18 8,18 6,16 6,8" />
          <rect x="9.5" y="9.5" width="5" height="5" />
          <line x1="6" y1="3" x2="9.5" y2="9.5" />
          <line x1="18" y1="3" x2="14.5" y2="9.5" />
          <line x1="21" y1="18" x2="14.5" y2="14.5" />
          <line x1="3" y1="18" x2="9.5" y2="14.5" />
        </svg>
      );

    case 'Marquise':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12,2 C17,6 21,12 21,12 C21,12 17,18 12,22 C7,18 3,12 3,12 C3,12 7,6 12,2 Z" />
          <polygon points="12,6 17,12 12,18 7,12" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="3" y1="12" x2="7" y2="12" />
          <line x1="17" y1="12" x2="21" y2="12" />
        </svg>
      );

    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
