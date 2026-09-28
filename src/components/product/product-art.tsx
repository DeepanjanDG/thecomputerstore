import { cn } from "@/lib/utils";

/**
 * Category-specific vector renders used when a product has no uploaded photo.
 * They inherit theme tokens, so they look right in light, dark and "stage" sections.
 */

const KIND_BY_CATEGORY: Record<string, Kind> = {
  processors: "cpu", "graphics-cards": "gpu", motherboards: "motherboard", "cpu-coolers": "cooler",
  ram: "ram", ssd: "ssd", hdd: "hdd", "power-supplies": "psu", cabinets: "case", "case-fans": "fan",
  monitors: "monitor", keyboards: "keyboard", mouse: "mouse", headsets: "headset", speakers: "speakers",
  laptops: "laptop", "gaming-laptops": "laptop", "desktop-pcs": "desktop", "custom-pcs": "case", tablets: "tablet",
  printers: "printer", networking: "router", cctv: "camera", ups: "ups", software: "software", accessories: "accessory",
};

type Kind =
  | "cpu" | "gpu" | "motherboard" | "cooler" | "ram" | "ssd" | "hdd" | "psu" | "case" | "fan" | "monitor" | "keyboard"
  | "mouse" | "headset" | "speakers" | "laptop" | "desktop" | "tablet" | "printer" | "router" | "camera" | "ups" | "software" | "accessory";

const BRAND_HUES: Record<string, string> = {
  AMD: "#ef4444", Intel: "#3b82f6", NVIDIA: "#76b900", ASUS: "#3d8bff", MSI: "#ef4444", Gigabyte: "#f59e0b",
  ZOTAC: "#f5b301", Sapphire: "#3d8bff", PowerColor: "#ef4444", Corsair: "#facc15", "G.Skill": "#a855f7",
  Kingston: "#ef4444", XPG: "#ef4444", Samsung: "#3d8bff", "Western Digital": "#3d8bff", Crucial: "#22d3ee",
  "Lian Li": "#a78bfa", NZXT: "#a78bfa", Deepcool: "#22d3ee", "Cooler Master": "#a855f7", Noctua: "#c08457",
  Arctic: "#22d3ee", Thermalright: "#22d3ee", Montech: "#3d8bff", "Fractal Design": "#94a3b8",
};

function hueFor(brand?: string, specs?: Record<string, unknown>) {
  const chipset = String(specs?.gpuBrand ?? "");
  if (chipset === "NVIDIA") return "#76b900";
  if (chipset === "AMD") return "#ef4444";
  if (brand && BRAND_HUES[brand]) return BRAND_HUES[brand];
  return "var(--accent)";
}

export function ProductArt({
  category, brand, specs, className, label,
}: { category: string; brand?: string; specs?: Record<string, unknown>; className?: string; label?: string }) {
  const kind = KIND_BY_CATEGORY[category] ?? "accessory";
  const hue = hueFor(brand, specs);
  // Gradients are keyed by kind + colour, so identical ids always describe identical gradients.
  const uid = `${kind}-${hue.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={label ?? `${brand ?? ""} ${kind}`.trim()}
      style={{ ["--hue" as string]: hue }}
    >
      <defs>
        <radialGradient id={`g-${uid}`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={hue} stopOpacity="0.28" />
          <stop offset="100%" stopColor={hue} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="98" rx="90" ry="80" fill={`url(#g-${uid})`} />
      <ellipse cx="100" cy="176" rx="64" ry="6" fill="var(--ink)" opacity="0.08" />
      {ART[kind](brand, uid)}
    </svg>
  );
}

const edge = "var(--line-strong)";
const hue = "var(--hue)";

function Fan({ cx, cy, r, spin = false }: { cx: number; cy: number; r: number; spin?: boolean }) {
  const blades = [0, 72, 144, 216, 288];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0b0d10" stroke={hue} strokeOpacity="0.8" strokeWidth="1.5" />
      <g className={spin ? "origin-center animate-spin-slow [transform-box:fill-box]" : undefined}>
        {blades.map((a) => (
          <path
            key={a}
            d={`M ${cx} ${cy} q ${r * 0.55} ${-r * 0.2} ${r * 0.82} ${r * 0.18} q ${-r * 0.35} ${r * 0.1} ${-r * 0.82} ${-r * 0.18}`}
            fill="#2a313b"
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r * 0.22} fill="#161b21" stroke={hue} strokeOpacity="0.5" />
    </g>
  );
}

const ART: Record<Kind, (brand: string | undefined, uid: string) => React.ReactNode> = {
  cpu: (brand, uid) => (
    <g>
      <rect x="40" y="40" width="120" height="120" rx="10" fill="#1a7a3c" opacity="0.9" />
      {Array.from({ length: 11 }).map((_, i) => (
        <g key={i} fill="#d4a93a">
          <rect x={48 + i * 10} y="44" width="3" height="5" rx="1" />
          <rect x={48 + i * 10} y="151" width="3" height="5" rx="1" />
          <rect x="44" y={48 + i * 10} width="5" height="3" rx="1" />
          <rect x="151" y={48 + i * 10} width="5" height="3" rx="1" />
        </g>
      ))}
      <rect x="54" y="54" width="92" height="92" rx="9" fill="#c9ced6" stroke="#aab1bc" />
      <rect x="54" y="54" width="92" height="92" rx="9" fill={`url(#cpu-sheen-${uid})`} />
      <defs>
        <linearGradient id={`cpu-sheen-${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <text x="100" y="98" textAnchor="middle" fontSize="15" fontWeight="800" fill="#3b4250" letterSpacing="1">
        {(brand ?? "CPU").toUpperCase()}
      </text>
      <rect x="76" y="108" width="48" height="4" rx="2" fill={hue} />
      <rect x="84" y="117" width="32" height="3" rx="1.5" fill="#8b95a3" />
    </g>
  ),
  gpu: (_b, uid) => (
    <g>
      <rect x="18" y="62" width="168" height="76" rx="10" fill="#161b21" stroke="#2f3843" />
      <rect x="18" y="62" width="168" height="10" rx="5" fill="#222932" />
      <path d="M 18 128 H 186" stroke={hue} strokeWidth="2" opacity="0.9" />
      <Fan cx={58} cy={100} r={27} spin />
      <Fan cx={122} cy={100} r={27} spin />
      <rect x="156" y="78" width="22" height="44" rx="4" fill="#222932" />
      <rect x="160" y="84" width="14" height="3" rx="1.5" fill={hue} />
      <rect x="40" y="138" width="92" height="8" fill="#d4a93a" />
      {Array.from({ length: 18 }).map((_, i) => <rect key={i} x={42 + i * 5} y="139" width="1.5" height="6" fill="#a88327" />)}
      <rect x="10" y="60" width="8" height="84" rx="2" fill="#8b95a3" />
    </g>
  ),
  motherboard: (_b, uid) => (
    <g>
      <rect x="32" y="26" width="136" height="150" rx="6" fill="#1b2128" stroke="#2f3843" />
      <rect x="40" y="34" width="34" height="40" rx="4" fill="#2a313b" />
      <rect x="84" y="46" width="44" height="44" rx="4" fill="#c9ced6" />
      <rect x="92" y="54" width="28" height="28" rx="3" fill="#aab1bc" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={138 + i * 6} y="36" width="3.5" height="64" rx="1" fill={i % 2 ? "#3b4250" : hue} opacity={i % 2 ? 1 : 0.85} />)}
      <rect x="40" y="104" width="118" height="7" rx="2" fill="#3b4250" />
      <rect x="40" y="104" width="30" height="7" rx="2" fill={hue} opacity="0.8" />
      <rect x="40" y="128" width="118" height="5" rx="2" fill="#3b4250" />
      <rect x="40" y="146" width="60" height="14" rx="3" fill="#2a313b" />
      <rect x="110" y="140" width="48" height="26" rx="4" fill="#2a313b" />
      <circle cx="134" cy="153" r="6" fill={hue} opacity="0.5" />
    </g>
  ),
  cooler: (_b, uid) => (
    <g>
      {Array.from({ length: 16 }).map((_, i) => <rect key={i} x="62" y={34 + i * 7} width="92" height="3" rx="1" fill="#c9ced6" />)}
      <rect x="92" y="148" width="32" height="14" rx="3" fill="#aab1bc" />
      {[0, 1, 2].map((i) => <rect key={i} x={98 + i * 8} y="30" width="4" height="120" rx="2" fill="#c08457" />)}
      <rect x="34" y="40" width="30" height="104" rx="6" fill="#0b0d10" />
      <Fan cx={49} cy={92} r={13} />
      <rect x="34" y="52" width="4" height="80" rx="2" fill={hue} opacity="0.9" />
    </g>
  ),
  ram: (_b, uid) => (
    <g transform="rotate(-8 100 100)">
      <rect x="22" y="70" width="156" height="60" rx="5" fill="#161b21" stroke="#2f3843" />
      <rect x="22" y="62" width="156" height="12" rx="4" fill={hue} opacity="0.85" />
      <rect x="22" y="62" width="156" height="12" rx="4" fill={`url(#ram-glow-${uid})`} />
      <defs>
        <linearGradient id={`ram-glow-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="1" stopColor="#3d8bff" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path d="M 34 86 L 90 86 L 100 100 L 166 100" stroke="#3b4250" strokeWidth="3" fill="none" />
      <rect x="22" y="130" width="156" height="8" fill="#d4a93a" />
      <rect x="96" y="130" width="4" height="8" fill="var(--surface)" />
    </g>
  ),
  ssd: (_b, uid) => (
    <g transform="rotate(-10 100 100)">
      <rect x="18" y="80" width="164" height="40" rx="4" fill="#0f5132" />
      <rect x="30" y="86" width="42" height="28" rx="2" fill="#161b21" />
      <rect x="80" y="86" width="42" height="28" rx="2" fill="#161b21" />
      <rect x="130" y="88" width="24" height="24" rx="2" fill="#222932" />
      <rect x="28" y="84" width="96" height="32" rx="3" fill="#0b0d10" opacity="0.85" />
      <rect x="36" y="95" width="40" height="4" rx="2" fill={hue} />
      <rect x="36" y="103" width="60" height="3" rx="1.5" fill="#5b6472" />
      <rect x="182" y="86" width="8" height="28" fill="#d4a93a" />
      <circle cx="18" cy="100" r="5" fill="var(--surface)" stroke="#0f5132" strokeWidth="3" />
    </g>
  ),
  hdd: (_b, uid) => (
    <g>
      <rect x="44" y="30" width="112" height="140" rx="8" fill="#aab1bc" stroke="#8b95a3" />
      <circle cx="100" cy="88" r="42" fill="#c9ced6" stroke="#8b95a3" />
      <circle cx="100" cy="88" r="8" fill="#8b95a3" />
      <path d="M 138 140 L 104 92" stroke="#3b4250" strokeWidth="5" strokeLinecap="round" />
      <rect x="60" y="146" width="56" height="12" rx="2" fill="#0b0d10" />
      <rect x="66" y="150" width="24" height="4" rx="2" fill={hue} />
    </g>
  ),
  psu: (_b, uid) => (
    <g>
      <rect x="30" y="50" width="140" height="100" rx="8" fill="#161b21" stroke="#2f3843" />
      <circle cx="96" cy="100" r="38" fill="#0b0d10" stroke="#2f3843" />
      {[12, 20, 28, 36].map((r) => <circle key={r} cx="96" cy="100" r={r} fill="none" stroke="#2f3843" strokeWidth="2" />)}
      <path d="M 58 100 H 134 M 96 62 V 138" stroke="#2f3843" strokeWidth="2" />
      <rect x="144" y="64" width="16" height="72" rx="3" fill="#222932" />
      <rect x="148" y="70" width="8" height="18" rx="2" fill={hue} />
      <rect x="30" y="140" width="140" height="4" fill={hue} opacity="0.7" />
    </g>
  ),
  case: (_b, uid) => (
    <g>
      <rect x="46" y="18" width="108" height="160" rx="8" fill="#0b0d10" stroke="#2f3843" />
      <rect x="54" y="26" width="72" height="144" rx="4" fill="#161b21" stroke={hue} strokeOpacity="0.35" />
      <rect x="54" y="26" width="72" height="144" rx="4" fill={`url(#case-glass-${uid})`} />
      <defs>
        <linearGradient id={`case-glass-${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`case-rgb-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={hue} stopOpacity="0.55" />
          <stop offset="1" stopColor={hue} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="90" cy="80" r="40" fill={`url(#case-rgb-${uid})`} className="animate-[glow-breathe_4s_ease-in-out_infinite]" />
      <rect x="62" y="98" width="56" height="14" rx="2" fill="#2a313b" />
      <rect x="62" y="110" width="56" height="2" fill={hue} />
      <rect x="80" y="50" width="22" height="22" rx="3" fill="#3b4250" />
      <rect x="62" y="140" width="56" height="24" rx="3" fill="#222932" />
      <g>
        <Fan cx={140} cy={48} r={9} />
        <Fan cx={140} cy={72} r={9} />
        <Fan cx={140} cy={96} r={9} />
      </g>
      <rect x="132" y="150" width="16" height="3" rx="1.5" fill={hue} />
    </g>
  ),
  fan: (_b, uid) => (
    <g>
      <rect x="40" y="40" width="120" height="120" rx="18" fill="#161b21" stroke="#2f3843" />
      <circle cx="100" cy="100" r="52" fill="none" stroke={hue} strokeWidth="3" opacity="0.9" />
      <Fan cx={100} cy={100} r={48} spin />
      {[[50, 50], [150, 50], [50, 150], [150, 150]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#2f3843" />)}
    </g>
  ),
  monitor: (_b, uid) => (
    <g>
      <rect x="18" y="34" width="164" height="100" rx="8" fill="#0b0d10" stroke="#2f3843" />
      <rect x="24" y="40" width="152" height="86" rx="4" fill={`url(#mon-screen-${uid})`} />
      <defs>
        <linearGradient id={`mon-screen-${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={hue} stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#0b0d10" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path d="M 24 110 Q 70 80 110 96 T 176 76" stroke="#fff" strokeOpacity="0.25" fill="none" strokeWidth="2" />
      <rect x="92" y="134" width="16" height="26" fill="#3b4250" />
      <rect x="64" y="158" width="72" height="8" rx="4" fill="#3b4250" />
    </g>
  ),
  keyboard: (_b, uid) => (
    <g transform="rotate(-6 100 100)">
      <rect x="14" y="70" width="172" height="64" rx="8" fill="#161b21" stroke="#2f3843" />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 13 }).map((_, c) => (
          <rect key={`${r}-${c}`} x={21 + c * 12.4} y={77 + r * 13} width="10" height="10" rx="2" fill={r === 0 && c < 1 ? hue : "#2a313b"} />
        )),
      )}
      <rect x="52" y="128" width="96" height="0" />
      <rect x="14" y="132" width="172" height="3" rx="1.5" fill={hue} opacity="0.6" />
    </g>
  ),
  mouse: (_b, uid) => (
    <g>
      <path d="M 100 34 C 140 34 146 74 146 110 C 146 150 126 168 100 168 C 74 168 54 150 54 110 C 54 74 60 34 100 34 Z" fill="#161b21" stroke="#2f3843" />
      <path d="M 100 34 V 88" stroke="#2f3843" strokeWidth="2" />
      <rect x="95" y="52" width="10" height="20" rx="5" fill="#3b4250" />
      <path d="M 64 140 Q 100 160 136 140" stroke={hue} strokeWidth="3" fill="none" />
    </g>
  ),
  headset: (_b, uid) => (
    <g>
      <path d="M 44 116 C 44 58 70 34 100 34 C 130 34 156 58 156 116" stroke="#2a313b" strokeWidth="12" fill="none" strokeLinecap="round" />
      <rect x="30" y="100" width="36" height="62" rx="16" fill="#161b21" stroke="#2f3843" />
      <rect x="134" y="100" width="36" height="62" rx="16" fill="#161b21" stroke="#2f3843" />
      <rect x="38" y="114" width="4" height="34" rx="2" fill={hue} />
      <rect x="158" y="114" width="4" height="34" rx="2" fill={hue} />
    </g>
  ),
  speakers: (_b, uid) => (
    <g>
      {[40, 116].map((x) => (
        <g key={x}>
          <rect x={x} y="44" width="46" height="120" rx="8" fill="#161b21" stroke="#2f3843" />
          <circle cx={x + 23} cy="76" r="12" fill="#0b0d10" stroke="#3b4250" />
          <circle cx={x + 23} cy="124" r="18" fill="#0b0d10" stroke="#3b4250" />
          <circle cx={x + 23} cy="124" r="6" fill={hue} opacity="0.7" />
        </g>
      ))}
    </g>
  ),
  laptop: (_b, uid) => (
    <g>
      <path d="M 44 42 H 156 A 6 6 0 0 1 162 48 V 128 H 38 V 48 A 6 6 0 0 1 44 42 Z" fill="#161b21" stroke="#2f3843" />
      <rect x="46" y="50" width="108" height="70" rx="3" fill={`url(#lap-screen-${uid})`} />
      <defs>
        <linearGradient id={`lap-screen-${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={hue} stopOpacity="0.6" />
          <stop offset="1" stopColor="#0b0d10" />
        </linearGradient>
      </defs>
      <path d="M 22 128 H 178 L 170 146 H 30 Z" fill="#2a313b" stroke="#3b4250" />
      <rect x="86" y="130" width="28" height="4" rx="2" fill="#3b4250" />
    </g>
  ),
  desktop: (_b, uid) => (
    <g>
      <rect x="16" y="40" width="120" height="80" rx="6" fill="#0b0d10" stroke="#2f3843" />
      <rect x="22" y="46" width="108" height="66" rx="3" fill={hue} opacity="0.35" />
      <rect x="66" y="120" width="20" height="20" fill="#3b4250" />
      <rect x="46" y="140" width="60" height="6" rx="3" fill="#3b4250" />
      <rect x="146" y="56" width="40" height="96" rx="5" fill="#161b21" stroke="#2f3843" />
      <circle cx="166" cy="70" r="3" fill={hue} />
      <rect x="152" y="84" width="28" height="3" rx="1.5" fill="#2f3843" />
    </g>
  ),
  tablet: (_b, uid) => (
    <g>
      <rect x="40" y="26" width="120" height="152" rx="12" fill="#0b0d10" stroke="#2f3843" />
      <rect x="48" y="36" width="104" height="132" rx="4" fill={`url(#tab-screen-${uid})`} />
      <defs>
        <linearGradient id={`tab-screen-${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={hue} stopOpacity="0.55" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </g>
  ),
  printer: (_b, uid) => (
    <g>
      <rect x="54" y="34" width="92" height="40" rx="3" fill="var(--surface)" stroke={edge} />
      <rect x="28" y="70" width="144" height="72" rx="10" fill="#2a313b" stroke="#3b4250" />
      <rect x="28" y="70" width="144" height="16" rx="8" fill="#3b4250" />
      <rect x="54" y="128" width="92" height="36" rx="2" fill="var(--surface)" stroke={edge} />
      <rect x="62" y="138" width="60" height="3" rx="1.5" fill={edge} />
      <rect x="62" y="146" width="44" height="3" rx="1.5" fill={edge} />
      <circle cx="150" cy="100" r="5" fill={hue} />
    </g>
  ),
  router: (_b, uid) => (
    <g>
      {[60, 100, 140].map((x) => <rect key={x} x={x - 3} y="30" width="6" height="70" rx="3" fill="#2a313b" />)}
      <rect x="26" y="96" width="148" height="50" rx="12" fill="#161b21" stroke="#2f3843" />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={52 + i * 14} cy="121" r="3" fill={i < 3 ? hue : "#3b4250"} />)}
      <rect x="130" y="114" width="28" height="14" rx="3" fill="#0b0d10" />
    </g>
  ),
  camera: (_b, uid) => (
    <g>
      <path d="M 40 80 Q 100 40 160 80 L 160 96 Q 100 150 40 96 Z" fill="var(--surface)" stroke={edge} />
      <circle cx="100" cy="98" r="30" fill="#0b0d10" />
      <circle cx="100" cy="98" r="16" fill="#161b21" stroke={hue} strokeWidth="2" />
      <circle cx="94" cy="92" r="4" fill="#fff" opacity="0.4" />
      <rect x="84" y="140" width="32" height="30" rx="4" fill={edge} />
    </g>
  ),
  ups: (_b, uid) => (
    <g>
      <rect x="58" y="30" width="84" height="140" rx="10" fill="#161b21" stroke="#2f3843" />
      <rect x="70" y="44" width="60" height="30" rx="4" fill="#0b0d10" />
      <rect x="76" y="54" width="30" height="10" rx="2" fill={hue} opacity="0.8" />
      <circle cx="100" cy="100" r="10" fill="none" stroke={hue} strokeWidth="3" />
      <path d="M 100 88 V 100" stroke={hue} strokeWidth="3" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x="70" y={122 + i * 7} width="60" height="3" rx="1.5" fill="#2a313b" />)}
    </g>
  ),
  software: (brand, uid) => (
    <g>
      <rect x="50" y="30" width="100" height="140" rx="8" fill="#0b0d10" stroke="#2f3843" />
      <rect x="50" y="30" width="100" height="140" rx="8" fill={`url(#sw-g-${uid})`} />
      <defs>
        <linearGradient id={`sw-g-${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={hue} stopOpacity="0.7" />
          <stop offset="1" stopColor="#0b0d10" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(78 62)">
        <rect width="20" height="20" fill="#fff" opacity="0.9" />
        <rect x="24" width="20" height="20" fill="#fff" opacity="0.7" />
        <rect y="24" width="20" height="20" fill="#fff" opacity="0.7" />
        <rect x="24" y="24" width="20" height="20" fill="#fff" opacity="0.5" />
      </g>
      <text x="100" y="140" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" opacity="0.8">
        {(brand ?? "").toUpperCase().slice(0, 12)}
      </text>
    </g>
  ),
  accessory: (_b, uid) => (
    <g>
      <rect x="54" y="54" width="92" height="92" rx="20" fill="#161b21" stroke="#2f3843" />
      <path d="M 78 100 H 122 M 100 78 V 122" stroke={hue} strokeWidth="6" strokeLinecap="round" />
      <path d="M 146 100 C 170 100 170 150 190 150" stroke="#3b4250" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  ),
};
