/*
  Line drawings shown in empty photo slots, one per build step.
  Drawn on a 64×64 grid with the same stroke as the main drone drawing.
*/

const glyphs = {
  box: (
    <>
      <path d="M12 24l20-9 20 9v22l-20 9-20-9z" />
      <path d="M12 24l20 9 20-9M32 33v22" />
      <path d="M12 24l-5 8 20 9 5-8M52 24l5 8-20 9-5-8" />
    </>
  ),
  radio: (
    <>
      <rect x="8" y="22" width="48" height="30" rx="6" />
      <circle cx="21" cy="37" r="6" />
      <circle cx="43" cy="37" r="6" />
      <circle cx="21" cy="37" r="1.5" fill="currentColor" />
      <circle cx="43" cy="37" r="1.5" fill="currentColor" />
      <path d="M32 22V8M28 30h8" />
    </>
  ),
  arm: (
    <>
      <path d="M6 36h38" />
      <path d="M6 30h38v12H6z" />
      <circle cx="48" cy="36" r="10" />
      <circle cx="48" cy="36" r="3.5" />
      <path d="M18 33h12v6H18z" />
    </>
  ),
  cube: (
    <>
      <rect x="10" y="16" width="44" height="34" rx="2" />
      <rect x="20" y="20" width="24" height="24" rx="2" className="glyph-accent" />
      <path d="M32 38V26M27 31l5-5 5 5" />
      <path d="M14 50v5M22 50v5M42 50v5M50 50v5" />
    </>
  ),
  gps: (
    <>
      <circle cx="32" cy="22" r="13" />
      <path d="M32 29V15M27 20l5-5 5 5" />
      <path d="M32 35v18M22 56h20" />
    </>
  ),
  calibrate: (
    <>
      <circle cx="32" cy="34" r="9" />
      <circle cx="32" cy="34" r="3" />
      <path d="M14 34a18 18 0 0 1 31-12.5" />
      <path d="M46 14v8h-8" />
      <path d="M50 34a18 18 0 0 1-31 12.5" />
      <path d="M18 54v-8h8" />
    </>
  ),
  flight: (
    <>
      <path d="M17 17l30 30M47 17L17 47" />
      <circle cx="17" cy="17" r="8" />
      <circle cx="47" cy="17" r="8" />
      <circle cx="17" cy="47" r="8" />
      <circle cx="47" cy="47" r="8" />
      <rect x="26" y="26" width="12" height="12" rx="2" className="glyph-accent" />
    </>
  ),
  log: (
    <>
      <path d="M10 10v44h46" />
      <path d="M16 46l9-14 8 6 9-18 10 10" />
      <path d="M16 40h36" strokeDasharray="3 4" />
    </>
  ),
  person: (
    <>
      <circle cx="32" cy="24" r="10" />
      <path d="M12 56c2-11 10-17 20-17s18 6 20 17" />
    </>
  ),
};

export function Glyph({ name, size = 64 }) {
  return (
    <svg
      className="glyph"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyphs[name] ?? glyphs.box}
    </svg>
  );
}
