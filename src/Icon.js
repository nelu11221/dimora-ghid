import React from 'react';

// Lucide-style stroke icons. Single source of truth for all UI icons.
const PATHS = {
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </>
  ),
  car: (
    <>
      <path d="M5 17h14M5 17a2 2 0 01-2-2v-3l2-5h14l2 5v3a2 2 0 01-2 2M5 17v2M19 17v2" />
      <circle cx="7.5" cy="14.5" r="1.5" />
      <circle cx="16.5" cy="14.5" r="1.5" />
    </>
  ),
  snowflake: (
    <>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M9 5l3 3 3-3M9 19l3-3 3 3" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M5 9l3 3-3 3M19 9l-3 3 3 3" />
      <path d="M5 5l14 14M19 5L5 19" />
    </>
  ),
  utensils: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 002-2V2M5 11v11" />
      <path d="M14 7c0-3 2-5 5-5v20M14 7v4c0 1.1.9 2 2 2h3" />
    </>
  ),
  washer: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="13" r="5" />
      <circle cx="8" cy="6" r="0.5" fill="currentColor" />
      <circle cx="11" cy="6" r="0.5" fill="currentColor" />
    </>
  ),
  bed: (
    <>
      <path d="M2 8v12M22 12v8" />
      <path d="M2 12h20M2 17h20" />
      <path d="M6 12V9a2 2 0 012-2h10a2 2 0 012 2v3" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  ),
  wine: (
    <>
      <path d="M8 22h8M12 15v7" />
      <path d="M17 2H7l1 9a4 4 0 008 0l1-9z" />
      <path d="M7.5 7h9" />
    </>
  ),
  wheat: (
    <>
      <path d="M12 22V8" />
      <path d="M12 8c0-3 2-5 5-5-1 3-3 5-5 5z" />
      <path d="M12 8c0-3-2-5-5-5 1 3 3 5 5 5z" />
      <path d="M12 14c0-3 2-5 5-5-1 3-3 5-5 5z" />
      <path d="M12 14c0-3-2-5-5-5 1 3 3 5 5 5z" />
      <path d="M12 20c0-3 2-5 5-5-1 3-3 5-5 5z" />
      <path d="M12 20c0-3-2-5-5-5 1 3 3 5 5 5z" />
    </>
  ),
  waves: (
    <>
      <path d="M2 6c2 0 2-1.5 4-1.5S8 6 10 6s2-1.5 4-1.5S16 6 18 6s2-1.5 4-1.5" />
      <path d="M2 12c2 0 2-1.5 4-1.5S8 12 10 12s2-1.5 4-1.5S16 12 18 12s2-1.5 4-1.5" />
      <path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5S16 18 18 18s2-1.5 4-1.5" />
    </>
  ),
  sunset: (
    <>
      <path d="M12 10V2M4.93 10.93l1.41 1.41M2 18h2M20 18h2M17.66 12.34l1.41-1.41" />
      <path d="M22 22H2" />
      <path d="M16 18a4 4 0 00-8 0" />
      <path d="M16 5l-4 4-4-4" />
    </>
  ),
  croissant: (
    <>
      <path d="M4.6 13.11l5.79-3.21c1.89-1.05 4.79 1.78 3.71 3.71l-3.22 5.81C8.8 23 2.79 19 4.6 13.11z" />
      <path d="M4.6 13.11C2.79 14 1 11 2 9c1.4-2.84 4.42-2.85 6.5-1" />
      <path d="M10.5 19.5C9 22 6 22 4 22M19.5 10.5C22 9 22 6 22 4M15 4c-2 2-3 4-3 6M20 9c-2 2-4 3-6 3" />
    </>
  ),
  moon: (
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  ),
  coffee: (
    <>
      <path d="M17 8h1a4 4 0 010 8h-1" />
      <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </>
  ),
  volumeOff: (
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </>
  ),
  bug: (
    <>
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="M19 7l-3 2M5 7l3 2M19 13h-3M5 13h3M19 19l-3-2M5 19l3-2M12 6V3M9 3h6" />
    </>
  ),
  baby: (
    <>
      <path d="M9 12h.01M15 12h.01" />
      <path d="M10 16s.5 2 2 2 2-2 2-2" />
      <circle cx="12" cy="12" r="10" />
      <path d="M8 4c0 2 4 2 4 0M16 4c0 2-4 2-4 0" />
    </>
  ),
  flame: (
    <path d="M8.5 14.5A2.5 2.5 0 0011 17c1.5 0 3-1.2 3-2.5 0-2-1.5-2.5-2-4 1-1 2-2 2-4a4 4 0 00-8 0c0 4 4.5 5.5 2.5 8z" />
  ),
  sparkles: (
    <>
      <path d="M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6L12 3z" />
      <path d="M19 17l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" />
      <path d="M5 17l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" />
    </>
  ),
  paw: (
    <>
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="6" cy="16" r="2" />
      <path d="M8 22c1-3 2-5 4-5s3 2 4 5-3 1-4 1-5 2-4-1z" />
    </>
  ),
  noSmoking: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <rect x="6" y="10" width="12" height="4" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </>
  ),
  zap: (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  ),
  utensilsCrossed: (
    <>
      <path d="M16 2l-3 6 3 3-7 7-2-2 7-7 3-3-6 3-2 2L4 5" />
      <path d="M14 14l7 7" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6" />
    </>
  ),
  pill: (
    <>
      <path d="M10.5 20.5L3.5 13.5a5 5 0 117.07-7.07l7 7a5 5 0 11-7.07 7.07z" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
    </>
  ),
  landmark: (
    <>
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </>
  ),
  mapPin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  chevronDown: (
    <path d="M5 8l5 5 5-5" />
  ),
  arrowDown: (
    <path d="M10 4v12m0 0l-6-6m6 6l6-6" />
  ),
};

function Icon({ name, size = 24, strokeWidth = 1.6, className = '' }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export default Icon;
