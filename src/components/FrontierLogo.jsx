/**
 * Frontier Knitters logo — mirrored red "F" + three black chevrons.
 * Pure SVG so it stays crisp at any size and needs no image asset.
 *
 * Usage:  <FrontierLogo height={24} />            // bare logo
 *         <span className="logo-plate"><FrontierLogo height={22} /></span>  // on dark backgrounds
 */
const LOGO_PINK = '#E4004F';
const LOGO_DARK = '#141414';

export default function FrontierLogo({ height = 24, className = '', title = 'Frontier Knitters' }) {
  const w = Math.round(height * 3);

  return (
    <svg
      className={className}
      viewBox="0 0 300 100"
      width={w}
      height={height}
      role="img"
      aria-label={title}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <title>{title}</title>

      {/* Mirrored "F" (stem on the right, no bottom bar) */}
      <rect x="2" y="0" width="88" height="30" fill={LOGO_PINK} />
      <rect x="2" y="46" width="88" height="25" fill={LOGO_PINK} />
      <rect x="59" y="0" width="31" height="100" fill={LOGO_PINK} />

      {/* Three left-pointing chevrons */}
      <g fill="none" stroke={LOGO_DARK} strokeWidth="24" strokeLinejoin="miter" strokeMiterlimit="6">
        <path d="M162 14 L122 50 L162 86" />
        <path d="M216 14 L176 50 L216 86" />
        <path d="M270 14 L230 50 L270 86" />
      </g>
    </svg>
  );
}
