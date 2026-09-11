// Garment factory illustration (SVG artwork) shown on the blue login panel
export default function AuthArt() {
  return (
    <svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Garment factory illustration">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b2a5b" />
          <stop offset="1" stopColor="#164b9e" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="640" height="420" fill="url(#sky)" />

      {/* Sun glow */}
      <circle cx="530" cy="70" r="46" fill="#ffffff" opacity="0.10" />
      <circle cx="530" cy="70" r="30" fill="#ffffff" opacity="0.16" />

      {/* Background factory building */}
      <rect x="40" y="180" width="560" height="150" rx="6" fill="#0d3268" opacity="0.55" />
      <rect x="40" y="180" width="560" height="150" rx="6" fill="none" stroke="#3d8bf3" strokeWidth="2" opacity="0.4" />
      {/* windows */}
      {[90, 150, 210, 270, 330, 390, 450, 510].map((x) => (
        <g key={x}>
          <rect x={x} y="205" width="22" height="28" rx="3" fill="#0b2a5b" opacity="0.9" />
          <rect x={x} y="205" width="22" height="12" rx="3" fill="#5ea0ff" opacity="0.7" />
          <rect x={x} y="250" width="22" height="28" rx="3" fill="#0b2a5b" opacity="0.9" />
          <rect x={x} y="250" width="22" height="12" rx="3" fill="#5ea0ff" opacity="0.6" />
          <rect x={x} y="295" width="22" height="20" rx="3" fill="#0b2a5b" opacity="0.9" />
          <rect x={x} y="295" width="22" height="8" rx="3" fill="#5ea0ff" opacity="0.5" />
        </g>
      ))}
      {/* factory door */}
      <rect x="290" y="258" width="60" height="72" rx="4" fill="#0b2a5b" />
      <rect x="290" y="258" width="60" height="72" rx="4" fill="none" stroke="#3d8bf3" strokeWidth="2" />
      <circle cx="336" cy="298" r="3" fill="#3d8bf3" />

      {/* Factory roof */}
      <rect x="20" y="168" width="600" height="18" rx="4" fill="#1e6fe0" opacity="0.85" />
      <rect x="20" y="164" width="600" height="8" rx="4" fill="#3d8bf3" opacity="0.6" />

      {/* Chimney */}
      <rect x="120" y="110" width="26" height="58" fill="#0d3268" />
      <rect x="120" y="104" width="26" height="10" rx="3" fill="#1e6fe0" opacity="0.5" />

      {/* Fabric rolls (left) */}
      <g>
        <rect x="48" y="300" width="34" height="66" rx="6" fill="#d81f39" />
        <rect x="48" y="300" width="34" height="12" rx="6" fill="#f24a64" />
        <ellipse cx="65" cy="366" rx="17" ry="5" fill="none" stroke="#8f1125" strokeWidth="3" />
        <rect x="92" y="318" width="34" height="48" rx="6" fill="#f39c12" />
        <rect x="92" y="318" width="34" height="10" rx="6" fill="#f7c76b" />
        <rect x="60" y="372" width="110" height="8" rx="4" fill="#5ea0ff" opacity="0.55" />
      </g>

      {/* Spools / thread cones (right) */}
      <g>
        <path d="M500 360 L500 306 Q500 296 512 296 L516 296 Q528 296 528 306 L528 360 Z" fill="#d81f39" />
        <path d="M498 360 L530 360 L530 368 L498 368 Z" fill="#0d3268" />
        <path d="M538 360 L538 318 Q538 310 548 310 L551 310 Q561 310 561 318 L561 360 Z" fill="#f39c12" />
        <path d="M536 360 L563 360 L563 368 L536 368 Z" fill="#0d3268" />
        <path d="M470 368 L595 368" stroke="#5ea0ff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M468 358 Q470 358 470 356 M472 358 Q474 358 474 356" stroke="#d81f39" strokeWidth="2" opacity="0.7" />
      </g>

      {/* Sewing machine (center foreground) */}
      <g>
        <rect x="250" y="330" width="140" height="26" rx="6" fill="#0d3268" />
        <rect x="255" y="356" width="12" height="22" rx="3" fill="#164b9e" />
        <rect x="372" y="356" width="12" height="22" rx="3" fill="#164b9e" />
        <path d="M282 330 Q282 296 316 296 L340 296 Q372 296 372 330 Z" fill="#164b9e" />
        <path d="M316 296 L316 270 L336 270 L336 296 Z" fill="#1e6fe0" />
        <rect x="312" y="262" width="28" height="12" rx="4" fill="#3d8bf3" />
        <path d="M345 330 Q360 306 382 306" fill="none" stroke="#1e6fe0" strokeWidth="6" strokeLinecap="round" />
        <path d="M352 330 L358 318 L352 306 L346 318 Z" fill="#f24a64" />
      </g>

      {/* Scissors & measuring tape near sewing machine */}
      <g>
        <circle cx="216" cy="308" r="5" fill="#e6eefc" />
        <circle cx="216" cy="312" r="5" fill="#e6eefc" />
        <path d="M217 314 L240 334 M215 314 L238 334" stroke="#c9d8ee" strokeWidth="3" strokeLinecap="round" />
        <path d="M180 338 Q240 322 300 338" fill="none" stroke="#f7c76b" strokeWidth="5" strokeLinecap="round" />
        <path d="M178 336 L302 336" stroke="#164b9e" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
      </g>

      {/* Polo shirt on hanger (left top) */}
      <g transform="translate(470, 150)" opacity="0.95">
        <path d="M30 0 L24 14 L14 8 L14 18 L30 26 L46 18 L46 8 L36 14 Z" fill="#ffffff" />
        <path d="M14 8 L22 34 L38 34 L46 8" fill="none" stroke="#ffffff" strokeWidth="2" />
        <path d="M22 34 L26 44 L34 44 L38 34" fill="none" stroke="#ffffff" strokeWidth="2" />
        <path d="M8 18 L6 20" stroke="#1e6fe0" strokeWidth="3" strokeLinecap="round" />
        <circle cx="11" cy="15" r="2.4" fill="#1e6fe0" />
        <path d="M30 0 L30 -16" stroke="#e6eefc" strokeWidth="3" />
        <path d="M18 -16 L42 -16" stroke="#e6eefc" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Grass / floor */}
      <rect y="372" width="640" height="48" fill="#0b2a5b" opacity="0.5" />
      <rect y="372" width="640" height="5" fill="#3d8bf3" opacity="0.5" />

      {/* Floating thread curves */}
      <path d="M60 90 Q140 40 240 90 T420 90 T610 60" fill="none" stroke="#5ea0ff" strokeWidth="2" opacity="0.4" strokeDasharray="7 6" />
      <path d="M40 120 Q150 70 260 120 T480 110 T600 95" fill="none" stroke="#f24a64" strokeWidth="1.6" opacity="0.3" strokeDasharray="5 7" />
    </svg>
  );
}