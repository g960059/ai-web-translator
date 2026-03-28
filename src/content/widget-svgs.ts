import type { WidgetState } from '../shared/types';

function svg(id: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 200 200" class="mascot-svg mascot-${id}">${body}</svg>`;
}

// Shared squircle path
const SQ = 'M 40 10 C 10 10 10 40 10 70 v 60 c 0 30 0 60 30 60 h 120 c 30 0 30 -30 30 -60 v -60 c 0 -30 0 -60 -30 -60 z';
const OUTLINE = 'stroke="#c08b1a" stroke-width="3"';

// ── off: thinking, muted beige, eyes upper-right, hand on chin (fix-B) ──
const off = svg(
  'off',
  `<g stroke-linecap="round">
    <path d="${SQ}" fill="#efd98f" ${OUTLINE}/>
    <circle cx="75" cy="85" r="30" fill="#fff"/>
    <circle cx="125" cy="85" r="30" fill="#fff"/>
    <circle cx="87" cy="73" r="15" fill="#3d2e1a"/>
    <circle cx="137" cy="73" r="15" fill="#3d2e1a"/>
    <path d="M 95 138 h 10" stroke="#3d2e1a" stroke-width="6"/>
    <path d="M 125 150 c 10 0 15 -10 15 -15 c 0 -5 -5 -15 -15 -15" fill="none" stroke="#c08b1a" stroke-width="8"/>
  </g>`,
);

// ── working: focused, pencil in right hand (viewer's left), sweat drop (fix-C without border) ──
const working = svg(
  'working',
  `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="${SQ}" fill="#f6c649" ${OUTLINE}/>
    <circle cx="75" cy="85" r="30" fill="#fff"/>
    <circle cx="125" cy="85" r="30" fill="#fff"/>
    <circle cx="75" cy="95" r="15" fill="#3d2e1a"/>
    <circle cx="125" cy="95" r="15" fill="#3d2e1a"/>
    <path d="M 85 140 h 30" stroke="#3d2e1a" stroke-width="4"/>
    <path d="M 160 45 C 170 50, 168 62, 158 58 Z" fill="#c08b1a"/>
    <g transform="rotate(-45 40 135)">
      <rect x="15" y="130" width="50" height="10" rx="2" fill="#8b6914"/>
      <path d="M 15 130 L 5 135 L 15 140 Z" fill="#c08b1a"/>
    </g>
  </g>`,
);

// ── resting: closed happy eyes, smile, tea cup with steam (gemini-1) ──
const resting = svg(
  'resting',
  `<path d="${SQ}" fill="#f6c649" ${OUTLINE}/>
   <path d="M 60 90 q 15 -20 30 0" stroke="#c08b1a" stroke-width="8" fill="none" stroke-linecap="round"/>
   <path d="M 110 90 q 15 -20 30 0" stroke="#c08b1a" stroke-width="8" fill="none" stroke-linecap="round"/>
   <path d="M 80 128 q 20 15 40 0" stroke="#c08b1a" stroke-width="8" fill="none" stroke-linecap="round"/>
   <g>
     <path d="M 125 135 C 125 125 155 125 155 135 S 145 155 130 155 S 125 145 125 135 Z" fill="#8b6914"/>
     <path d="M 155 138 a 8 8 0 0 1 0 14" fill="none" stroke="#8b6914" stroke-width="7" stroke-linecap="round"/>
     <path d="M 133 125 q 3 -8 0 -16" stroke="#c08b1a" stroke-width="5" fill="none" stroke-linecap="round" class="steam1"/>
     <path d="M 143 130 q 3 -8 0 -16" stroke="#c08b1a" stroke-width="5" fill="none" stroke-linecap="round" class="steam2"/>
   </g>`,
);

// ── retrying: worried brows, eyes looking up, wavy mouth, sweat (gemini-1) ──
const retrying = svg(
  'retrying',
  `<path d="${SQ}" fill="#f6c649" ${OUTLINE}/>
   <circle cx="75" cy="90" r="30" fill="#fff"/>
   <circle cx="125" cy="90" r="30" fill="#fff"/>
   <circle cx="75" cy="78" r="15" fill="#3d2e1a"/>
   <circle cx="125" cy="78" r="15" fill="#3d2e1a"/>
   <path d="M 60 65 l 20 -15" stroke="#c08b1a" stroke-width="8" stroke-linecap="round"/>
   <path d="M 140 65 l -20 -15" stroke="#c08b1a" stroke-width="8" stroke-linecap="round"/>
   <path d="M 80 140 q 10 -10 20 0 t 20 0" stroke="#c08b1a" stroke-width="8" fill="none" stroke-linecap="round"/>
   <path d="M 160 75 C 160 65 150 60 150 70 C 150 80 160 85 160 75 Z" fill="#c08b1a"/>`,
);

// ── error: troubled brows, sad eyes, frown, multiple sweat drops (gemini-1) ──
const error = svg(
  'error',
  `<path d="${SQ}" fill="#f6c649" ${OUTLINE}/>
   <circle cx="75" cy="95" r="30" fill="#fff"/>
   <circle cx="125" cy="95" r="30" fill="#fff"/>
   <circle cx="80" cy="107" r="15" fill="#3d2e1a"/>
   <circle cx="120" cy="107" r="15" fill="#3d2e1a"/>
   <path d="M 60 70 l 25 -20" stroke="#c08b1a" stroke-width="8" stroke-linecap="round"/>
   <path d="M 140 70 l -25 -20" stroke="#c08b1a" stroke-width="8" stroke-linecap="round"/>
   <path d="M 80 145 q 20 -20 40 0" stroke="#c08b1a" stroke-width="8" fill="none" stroke-linecap="round"/>
   <path d="M 160 70 C 160 60 150 55 150 65 C 150 75 160 80 160 70 Z" fill="#c08b1a"/>
   <path d="M 40 80 C 40 70 30 65 30 75 C 30 85 40 90 40 80 Z" fill="#c08b1a" transform="rotate(10)"/>`,
);

// ── done: calm forward eyes, content smile (gemini-1) ──
const done = svg(
  'done',
  `<path d="${SQ}" fill="#f6c649" ${OUTLINE}/>
   <circle cx="75" cy="85" r="30" fill="#fff"/>
   <circle cx="125" cy="85" r="30" fill="#fff"/>
   <circle cx="75" cy="85" r="15" fill="#3d2e1a"/>
   <circle cx="125" cy="85" r="15" fill="#3d2e1a"/>
   <path d="M 75 130 q 25 25 50 0" stroke="#c08b1a" stroke-width="8" fill="none" stroke-linecap="round"/>`,
);

export const WIDGET_SVGS: Record<WidgetState, string> = {
  off,
  working,
  resting,
  retrying,
  error,
  done,
};
