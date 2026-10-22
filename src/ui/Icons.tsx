// THE LAYER ICONS — small line drawings, one per layer.
//
// Drawn on a 48×48 grid with a single stroke in the current text colour, so
// they take on whatever colour the tile is. Hand-made rather than from an icon
// set, so they feel like the studio's own marks. To add one: add its id to
// `IconId` in data/layers.ts and a case here.
import type { IconId } from '../data/layers.ts';

const paths: Record<IconId, React.ReactNode> = {
  birds: (
    <>
      <path d="M8 20c3-3 6-3 8 0 2-3 5-3 8 0" />
      <path d="M26 12c2-2 4-2 5.5 0 1.5-2 3.5-2 5.5 0" />
      <path d="M14 38c4-1 7-4 9-8l4-2-3-1c-2-1-4 0-5 2l-1 4c-2 2-3 3-4 5z" />
      <path d="M27 28l3 0.5" />
    </>
  ),
  crickets: (
    <>
      <path d="M33 8a8 8 0 1 0 7 11 6.5 6.5 0 0 1-7-11z" />
      <path d="M6 42c2-6 3-10 3-16M12 42c0-5 2-9 4-12M20 42c-1-6 0-11 2-15M27 42c1-4 3-7 6-9M35 42c0-3 1-6 3-8" />
    </>
  ),
  ocean: (
    <>
      <path d="M4 20c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4 4-4 8-4" />
      <path d="M4 28c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4 4-4 8-4" />
      <path d="M4 36c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4 4-4 8-4" />
    </>
  ),
  river: (
    <>
      <path d="M14 4c-4 8 8 10 4 18s-10 10-6 22" />
      <path d="M30 4c-4 8 8 10 4 18s-10 10-6 22" />
      <circle cx="22" cy="14" r="1" />
      <circle cx="25" cy="30" r="1" />
    </>
  ),
  storm: (
    <>
      <path d="M14 18a8 8 0 0 1 15-4 6 6 0 1 1 3 11H15a5 5 0 0 1-1-7z" />
      <path d="M24 27l-3 6h5l-3 7" />
      <path d="M15 31l-2 5M33 31l-2 5M17 39l-1.5 4" />
    </>
  ),
  shruti: (
    <>
      <rect x="8" y="14" width="32" height="22" rx="2" />
      <path d="M8 20h32M12 14v-3h24v3" />
      <path d="M12 25l3 6 3-6 3 6 3-6 3 6 3-6 3 6 3-6" />
    </>
  ),
  keys: (
    <>
      <circle cx="24" cy="24" r="4" />
      <circle cx="24" cy="24" r="11" />
      <circle cx="24" cy="24" r="18" />
    </>
  ),
  upload: (
    <>
      <path d="M24 32V10M16 18l8-8 8 8" />
      <path d="M8 30v8h32v-8" />
    </>
  ),
};

export function LayerIcon({ id, size = 40 }: { id: IconId; size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[id]}
    </svg>
  );
}

/** Headphones, for the "put your headphones on" prompt. */
export function HeadphonesIcon({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
      <path d="M8 30v-6a16 16 0 0 1 32 0v6" />
      <rect x="6" y="28" width="8" height="12" rx="3" />
      <rect x="34" y="28" width="8" height="12" rx="3" />
    </svg>
  );
}
