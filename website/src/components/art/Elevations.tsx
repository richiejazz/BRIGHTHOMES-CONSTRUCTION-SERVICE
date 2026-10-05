// Line-drawn architectural elevations used wherever real photography is not yet available.
// They are deliberately drawings, not photographs, so they can never be mistaken for actual
// BRIGHTHOMES projects. Replace with API images as real project photography is supplied.

type Tone = 'dark' | 'light'

const palette: Record<Tone, { bg: string; line: string; faint: string; accent: string }> = {
  dark: { bg: '#1d1c1a', line: '#c9a46a', faint: 'rgba(201,164,106,0.18)', accent: '#e2dcd1' },
  light: { bg: '#ece7de', line: '#7a5a2c', faint: 'rgba(122,90,44,0.16)', accent: '#3a3835' },
}

function windows(x: number, y: number, cols: number, rows: number, w: number, h: number, gx: number, gy: number) {
  const cells: string[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(`M${x + c * (w + gx)} ${y + r * (h + gy)}h${w}v${h}h${-w}z`)
  return cells.join('')
}

function DimensionLine({ x1, x2, y, label, color }: { x1: number; x2: number; y: number; label: string; color: string }) {
  return (
    <g stroke={color} strokeWidth="1" fill="none">
      <path d={`M${x1} ${y}H${x2}M${x1} ${y - 6}v12M${x2} ${y - 6}v12M${x1 - 5} ${y + 5}l10 -10M${x2 - 5} ${y + 5}l10 -10`} />
      <text x={(x1 + x2) / 2} y={y - 8} fill={color} stroke="none" fontSize="13" fontFamily="Manrope, sans-serif" letterSpacing="2" textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

const variants = [
  // Two-storey villa with cantilevered roof slab.
  (c: (typeof palette)['dark']) => (
    <g>
      <path d="M150 470V300h330v170M120 300h400M430 300v-30h-200v30M480 380h120v90" stroke={c.line} strokeWidth="2" fill="none" />
      <path d={windows(180, 330, 3, 1, 70, 50, 25, 0) + windows(180, 400, 2, 1, 70, 70, 25, 0) + 'M375 400h60v70h-60z' + windows(510, 400, 2, 1, 30, 40, 20, 0)} stroke={c.line} strokeWidth="1.2" fill="none" />
      <DimensionLine x1={150} x2={600} y={530} label="ELEVATION A" color={c.accent} />
    </g>
  ),
  // Pitched-roof family home.
  (c: (typeof palette)['dark']) => (
    <g>
      <path d="M190 470V290l170-120 170 120v180M160 310l200-140 200 140M440 230v-50h40v85" stroke={c.line} strokeWidth="2" fill="none" />
      <path d={windows(225, 320, 3, 1, 60, 55, 45, 0) + 'M330 400h60v70h-60z' + windows(225, 400, 1, 1, 70, 50, 0, 0) + windows(425, 400, 1, 1, 70, 50, 0, 0) + 'M345 230a15 15 0 1 0 30 0a15 15 0 1 0 -30 0'} stroke={c.line} strokeWidth="1.2" fill="none" />
      <DimensionLine x1={190} x2={530} y={530} label="FRONT ELEVATION" color={c.accent} />
    </g>
  ),
  // Multi-storey commercial block.
  (c: (typeof palette)['dark']) => (
    <g>
      <path d="M260 470V110h280v360M240 110h320M260 430h280" stroke={c.line} strokeWidth="2" fill="none" />
      <path d={windows(285, 135, 4, 6, 45, 30, 15, 20) + 'M370 430h60v40h-60z'} stroke={c.line} strokeWidth="1.2" fill="none" />
      <path d="M200 470V250h60M540 300h70v170" stroke={c.line} strokeWidth="1.5" fill="none" />
      <DimensionLine x1={200} x2={610} y={530} label="SECTION B-B" color={c.accent} />
    </g>
  ),
  // Terrace of three units.
  (c: (typeof palette)['dark']) => (
    <g>
      <path d="M110 470V280h580v190M110 280l60-60h460l60 60M303 280v190M496 280v190" stroke={c.line} strokeWidth="2" fill="none" />
      <path d={[0, 1, 2].map((i) => windows(135 + i * 193, 310, 2, 1, 55, 45, 30, 0) + `M${180 + i * 193} 400h50v70h-50z`).join('')} stroke={c.line} strokeWidth="1.2" fill="none" />
      <DimensionLine x1={110} x2={690} y={530} label="STREET ELEVATION" color={c.accent} />
    </g>
  ),
]

/** 4:3 elevation drawing used as a stand-in image for projects without photography. */
export function ElevationPlaceholder({ seed = 0, tone = 'dark', className = '' }: { seed?: number; tone?: Tone; className?: string }) {
  const c = palette[tone]
  const Variant = variants[Math.abs(seed) % variants.length]
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <rect width="800" height="600" fill={c.bg} />
      <path d={Array.from({ length: 16 }, (_, i) => `M${i * 50} 0V600`).join('') + Array.from({ length: 12 }, (_, i) => `M0 ${i * 50}H800`).join('')} stroke={c.faint} strokeWidth="1" />
      <path d="M60 470H740" stroke={c.line} strokeWidth="2" />
      <path d="M60 476H740" stroke={c.faint} strokeWidth="6" />
      {Variant(c)}
    </svg>
  )
}

/** Wide hero drawing: a gridded elevation with structural grid markers and levels. */
export function HeroElevation({ className = '' }: { className?: string }) {
  const c = palette.dark
  const gridX = [700, 880, 1060, 1240, 1420]
  const levels = [
    { y: 760, label: '+0.00' },
    { y: 620, label: '+3.40' },
    { y: 480, label: '+6.80' },
    { y: 340, label: '+10.20' },
  ]
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMaxYMid slice" className={className} aria-hidden="true" focusable="false">
      <g fill="none">
        {gridX.map((x, i) => (
          <g key={x} stroke={c.faint} strokeWidth="1">
            <path d={`M${x} 150V820`} strokeDasharray="10 8" />
            <circle cx={x} cy={120} r={18} stroke={c.line} />
            <text x={x} y={125} fill={c.line} stroke="none" fontSize="15" fontFamily="Manrope, sans-serif" textAnchor="middle">
              {String.fromCharCode(65 + i)}
            </text>
          </g>
        ))}
        {levels.map((level) => (
          <g key={level.y}>
            <path d={`M640 ${level.y}H1480`} stroke={c.faint} strokeWidth="1" />
            <path d={`M1490 ${level.y}l10 -10h70`} stroke={c.line} strokeWidth="1" />
            <text x={1505} y={level.y - 16} fill={c.accent} fontSize="14" fontFamily="Manrope, sans-serif" letterSpacing="1.5">
              {level.label}
            </text>
          </g>
        ))}
        <path d="M700 760V340h720v420M680 340h760M700 330h720M1060 340v420" stroke={c.line} strokeWidth="2.2" />
        <path d={windows(730, 370, 3, 3, 90, 80, 30, 60) + windows(1090, 370, 2, 3, 140, 80, 30, 60) + 'M920 680h100v80H920z'} stroke={c.line} strokeWidth="1.3" />
        <path d="M600 760V560h100M560 760H1520" stroke={c.line} strokeWidth="2.2" />
        <path d="M1240 340V260h180v80M1260 285h140" stroke={c.line} strokeWidth="1.5" />
        <DimensionLine x1={700} x2={1420} y={830} label="ELEVATION — ILLUSTRATIVE" color={c.accent} />
      </g>
    </svg>
  )
}
