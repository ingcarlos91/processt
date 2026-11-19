// Ilustraciones de seguridad y salud en el trabajo para los estados vacíos.
// SVG propios, en los colores del isotipo de PROCESST. Sin dependencias externas.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const C = {
  cyan: "#17B1D6", azul: "#1679AE", naranja: "#E9541E", verde: "#8CC043", verdeOsc: "#4F8A35",
  navy: "#1E2A4A", amarillo: "#F5BE2E", gris: "#EDF2F6", grisM: "#C8D3DD", grisO: "#93A3B3", blanco: "#FFFFFF",
};

type P = { x: number; y: number; s?: number };
const T = ({ x, y, s = 1, children }: P & { children: ReactNode }) => <g transform={`translate(${x} ${y}) scale(${s})`}>{children}</g>;

/** Fondo común: círculo suave, sombra en el piso y destellos. */
function Escena({ children, tono = C.cyan }: { children: ReactNode; tono?: string }) {
  return (
    <>
      <circle cx="100" cy="78" r="64" fill={tono} opacity=".09" />
      <circle cx="100" cy="78" r="46" fill={tono} opacity=".07" />
      <ellipse cx="100" cy="142" rx="66" ry="6" fill={C.navy} opacity=".08" />
      <Destello x={34} y={34} s={1} c={C.amarillo} />
      <Destello x={168} y={50} s={0.7} c={C.cyan} />
      <Destello x={160} y={118} s={0.55} c={C.verde} />
      <circle cx="44" cy="112" r="2.5" fill={C.naranja} opacity=".6" />
      <circle cx="152" cy="28" r="2" fill={C.verde} opacity=".7" />
      {children}
    </>
  );
}
function Destello({ x, y, s, c }: P & { c: string }) {
  return <T x={x} y={y} s={s}><path d="M0 -8 C1 -2 2 -1 8 0 C2 1 1 2 0 8 C-1 2 -2 1 -8 0 C-2 -1 -1 -2 0 -8Z" fill={c} /></T>;
}

/** Casco de seguridad. (x, y) = centro del ala. */
export function Casco({ x, y, s = 1, color = C.amarillo }: P & { color?: string }) {
  return (
    <T x={x} y={y} s={s}>
      <path d="M-30 0 C-30 -25 -16 -37 0 -37 C16 -37 30 -25 30 0 Z" fill={color} />
      <path d="M-5 -37 C-5 -37 -4 -2 -4 0 L4 0 C4 -2 5 -37 5 -37 C2 -37.6 -2 -37.6 -5 -37Z" fill={C.blanco} opacity=".35" />
      <path d="M-21 -12 C-19 -24 -11 -30 -3 -31.5" stroke={C.blanco} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".55" />
      <rect x="-40" y="-3" width="80" height="8.5" rx="4.25" fill={color} />
      <rect x="-40" y="-3" width="80" height="8.5" rx="4.25" fill={C.navy} opacity=".14" />
    </T>
  );
}

/** Chaleco reflectivo. (x, y) = centro del cuello. */
export function Chaleco({ x, y, s = 1, color = C.naranja }: P & { color?: string }) {
  return (
    <T x={x} y={y} s={s}>
      <path d="M-27 0 L-10 0 L0 19 L10 0 L27 0 L32 11 L32 57 Q32 62 27 62 L-27 62 Q-32 62 -32 57 L-32 11 Z" fill={color} />
      <path d="M0 19 V62" stroke={C.navy} strokeWidth="1.5" opacity=".2" />
      <rect x="-32" y="31" width="64" height="6.5" fill={C.gris} />
      <rect x="-32" y="45" width="64" height="6.5" fill={C.gris} />
      <rect x="-32" y="31" width="64" height="6.5" fill={C.blanco} opacity=".5" />
      <path d="M-27 0 L-10 0 L-13 6 L-30 8 Z" fill={C.navy} opacity=".1" />
      <rect x="14" y="14" width="10" height="8" rx="1.5" fill={C.navy} opacity=".18" />
    </T>
  );
}

/** Gafas de seguridad. */
export function Gafas({ x, y, s = 1 }: P) {
  return (
    <T x={x} y={y} s={s}>
      <path d="M-26 -6 Q-26 -10 -22 -10 L22 -10 Q26 -10 26 -6 L26 2 Q26 9 18 9 L8 9 Q3 9 1 3 Q0 1 -1 3 Q-3 9 -8 9 L-18 9 Q-26 9 -26 2 Z" fill={C.cyan} opacity=".85" />
      <path d="M-26 -6 Q-26 -10 -22 -10 L22 -10 Q26 -10 26 -6" stroke={C.navy} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M-18 -4 L-10 4" stroke={C.blanco} strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
      <path d="M10 -4 L16 2" stroke={C.blanco} strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
    </T>
  );
}

/** Guante de trabajo. (x, y) = centro de la palma. */
export function Guante({ x, y, s = 1, color = C.verde }: P & { color?: string }) {
  return (
    <T x={x} y={y} s={s}>
      <path d="M-12 18 L-12 -6 Q-12 -22 -6 -22 Q-2 -22 -2 -14 L-2 -24 Q-2 -30 3 -30 Q8 -30 8 -24 L8 -12 Q8 -26 13 -26 Q18 -26 18 -18 L18 4 Q18 10 24 4 Q28 0 30 4 Q31 8 26 14 Q20 22 12 24 L-12 24 Z" fill={color} />
      <rect x="-14" y="22" width="30" height="9" rx="3" fill={C.navy} opacity=".25" />
    </T>
  );
}

/** Botiquín de primeros auxilios. */
export function Botiquin({ x, y, s = 1 }: P) {
  return (
    <T x={x} y={y} s={s}>
      <path d="M-9 -20 V-25 Q-9 -29 -5 -29 H5 Q9 -29 9 -25 V-20" stroke={C.navy} strokeWidth="3.5" fill="none" opacity=".75" />
      <rect x="-28" y="-20" width="56" height="40" rx="7" fill={C.blanco} stroke={C.verdeOsc} strokeWidth="3" />
      <rect x="-5.5" y="-12" width="11" height="24" rx="2" fill={C.verde} />
      <rect x="-12" y="-5.5" width="24" height="11" rx="2" fill={C.verde} />
    </T>
  );
}

/** Señal de advertencia. (x, y) = centro. */
export function Senal({ x, y, s = 1 }: P) {
  return (
    <T x={x} y={y} s={s}>
      <path d="M0 -30 L31 24 L-31 24 Z" fill={C.amarillo} stroke={C.amarillo} strokeWidth="10" strokeLinejoin="round" />
      <path d="M0 -24 L25 20 L-25 20 Z" fill="none" stroke={C.navy} strokeWidth="2.5" strokeLinejoin="round" opacity=".85" />
      <rect x="-3.5" y="-10" width="7" height="19" rx="3.5" fill={C.navy} />
      <circle cx="0" cy="15" r="3.8" fill={C.navy} />
    </T>
  );
}

/** Escudo con chulo (protección). */
export function Escudo({ x, y, s = 1, color = C.verde }: P & { color?: string }) {
  return (
    <T x={x} y={y} s={s}>
      <path d="M0 -38 C14 -31 26 -31 35 -33 V0 C35 23 18 35 0 43 C-18 35 -35 23 -35 0 V-33 C-26 -31 -14 -31 0 -38Z" fill={color} />
      <path d="M0 -38 C-14 -31 -26 -31 -35 -33 V0 C-35 23 -18 35 0 43 Z" fill={C.blanco} opacity=".14" />
      <path d="M-14 2 L-4 12 L16 -10" stroke={C.blanco} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </T>
  );
}

/** Documento con renglones. (x, y) = esquina superior izquierda. */
function Hoja({ x, y, w = 56, h = 72, rot = 0, lineas = 5, titulo = C.cyan }: P & { w?: number; h?: number; rot?: number; lineas?: number; titulo?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect width={w} height={h} rx="5" fill={C.blanco} stroke={C.grisM} strokeWidth="2" />
      <rect x="8" y="9" width={w * 0.5} height="5" rx="2.5" fill={titulo} />
      {Array.from({ length: lineas }, (_, i) => <rect key={i} x="8" y={22 + i * 8.5} width={i % 3 === 2 ? w * 0.45 : w - 16} height="3.2" rx="1.6" fill={C.grisM} opacity=".8" />)}
    </g>
  );
}

function Persona({ x, y, s = 1, color }: P & { color: string }) {
  return (
    <T x={x} y={y} s={s}>
      <circle cx="0" cy="-38" r="9.5" fill={color} />
      <path d="M-17 0 C-17 -19 -10 -26 0 -26 C10 -26 17 -19 17 0 Z" fill={color} />
    </T>
  );
}

function Cono({ x, y, s = 1 }: P) {
  return (
    <T x={x} y={y} s={s}>
      <rect x="-15" y="-3" width="30" height="5" rx="2" fill={C.naranja} />
      <path d="M-11 -3 L-4 -34 Q0 -37 4 -34 L11 -3 Z" fill={C.naranja} />
      <path d="M-8.2 -15 L8.2 -15 L6.8 -21 L-6.8 -21 Z" fill={C.blanco} />
    </T>
  );
}

const ESCENAS = {
  empresas: (
    <Escena>
      <rect x="62" y="44" width="62" height="96" rx="4" fill={C.azul} />
      <rect x="62" y="44" width="62" height="10" rx="4" fill={C.navy} opacity=".25" />
      {[0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={71 + c * 17} y={60 + r * 14} width="10" height="8" rx="1.5" fill={C.blanco} opacity={(r + c) % 3 === 0 ? 0.95 : 0.45} />))}
      <rect x="86" y="126" width="14" height="14" rx="1.5" fill={C.navy} opacity=".55" />
      <rect x="124" y="84" width="34" height="56" rx="3" fill={C.cyan} />
      {[0, 1, 2].map((r) => <rect key={r} x="131" y={92 + r * 13} width="20" height="7" rx="1.5" fill={C.blanco} opacity=".6" />)}
      <Cono x={160} y={140} s={0.9} />
      <Casco x={58} y={140} s={0.72} />
    </Escena>
  ),
  documentos: (
    <Escena>
      <Hoja x={58} y={38} rot={-9} titulo={C.verde} />
      <Hoja x={86} y={30} rot={7} titulo={C.naranja} />
      <Hoja x={70} y={40} w={60} h={80} lineas={6} />
      <circle cx="128" cy="114" r="15" fill={C.verde} />
      <path d="M121 114 L126 119 L136 108" stroke={C.blanco} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Casco x={56} y={140} s={0.55} />
    </Escena>
  ),
  plan: (
    <Escena>
      <rect x="52" y="40" width="96" height="88" rx="9" fill={C.blanco} stroke={C.grisM} strokeWidth="2" />
      <path d="M52 49 Q52 40 61 40 H139 Q148 40 148 49 V60 H52 Z" fill={C.naranja} />
      {[72, 100, 128].map((x) => <rect key={x} x={x - 3} y="32" width="6" height="16" rx="3" fill={C.navy} />)}
      {[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3, 4].map((c) => <rect key={`${r}${c}`} x={62 + c * 16.5} y={68 + r * 14} width="11" height="9" rx="2" fill={C.gris} />))}
      <path d="M79 82 L82 85 L88 78" stroke={C.verde} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M112 96 L115 99 L121 92" stroke={C.verde} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="128" y="105" width="11" height="9" rx="2" fill={C.cyan} />
      <Casco x={150} y={140} s={0.6} color={C.naranja} />
    </Escena>
  ),
  sinAccidentes: (
    <Escena tono={C.verde}>
      <Escudo x={100} y={84} s={1.15} />
      <Botiquin x={48} y={124} s={0.62} />
      <Casco x={154} y={140} s={0.62} />
    </Escena>
  ),
  comites: (
    <Escena>
      <ellipse cx="100" cy="128" rx="58" ry="11" fill={C.azul} opacity=".9" />
      <Persona x={56} y={122} s={0.95} color={C.verde} />
      <Persona x={100} y={114} s={1.05} color={C.cyan} />
      <Persona x={144} y={122} s={0.95} color={C.naranja} />
      <Casco x={100} y={68} s={0.42} />
      <path d="M118 30 H160 Q166 30 166 36 V54 Q166 60 160 60 H136 L128 68 L129 60 H118 Q112 60 112 54 V36 Q112 30 118 30Z" fill={C.blanco} stroke={C.grisM} strokeWidth="2" />
      {[0, 1].map((i) => <rect key={i} x="120" y={39 + i * 9} width={i ? 22 : 36} height="3.5" rx="1.75" fill={C.grisM} />)}
    </Escena>
  ),
  evaluacion: (
    <Escena>
      <rect x="62" y="34" width="76" height="102" rx="8" fill={C.azul} />
      <rect x="70" y="44" width="60" height="86" rx="4" fill={C.blanco} />
      <rect x="84" y="28" width="32" height="14" rx="5" fill={C.navy} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="77" y={56 + i * 18} width="11" height="11" rx="2.5" fill={i < 2 ? C.verde : C.gris} stroke={i < 2 ? "none" : C.grisM} strokeWidth="1.5" />
          {i < 2 && <path d={`M79.5 ${61.5 + i * 18} L82 ${64 + i * 18} L86 ${59 + i * 18}`} stroke={C.blanco} strokeWidth="2" fill="none" strokeLinecap="round" />}
          <rect x="94" y={59 + i * 18} width={i === 3 ? 18 : 28} height="4" rx="2" fill={C.grisM} />
        </g>
      ))}
      <g transform="translate(146 100) rotate(32)"><rect x="-4" y="-30" width="8" height="44" rx="2" fill={C.naranja} /><path d="M-4 14 L0 22 L4 14 Z" fill={C.navy} /></g>
    </Escena>
  ),
  evidencias: (
    <Escena>
      <Hoja x={98} y={38} w={54} h={70} rot={8} titulo={C.verde} />
      <g transform="translate(46 50) rotate(-6)">
        <rect width="70" height="58" rx="6" fill={C.blanco} stroke={C.grisM} strokeWidth="2" />
        <rect x="6" y="6" width="58" height="38" rx="3" fill={C.cyan} opacity=".25" />
        <path d="M6 44 L26 24 L38 34 L46 26 L64 44 Z" fill={C.verde} />
        <circle cx="50" cy="16" r="5" fill={C.amarillo} />
      </g>
      <path d="M118 32 L118 70 Q118 80 109 80 Q100 80 100 70 L100 40 Q100 34 105 34 Q110 34 110 40 L110 66" stroke={C.navy} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity=".75" />
      <Casco x={150} y={140} s={0.55} />
    </Escena>
  ),
  matriz: (
    <Escena tono={C.amarillo}>
      <Senal x={100} y={78} s={1.1} />
      <g>
        <rect x="40" y="124" width="120" height="12" rx="3" fill={C.amarillo} />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${48 + i * 15} 136 L${56 + i * 15} 124 L${62 + i * 15} 124 L${54 + i * 15} 136 Z`} fill={C.navy} opacity=".85" />)}
      </g>
      <Casco x={46} y={118} s={0.5} />
      <Cono x={160} y={122} s={0.7} />
    </Escena>
  ),
  epp: (
    <Escena>
      <Chaleco x={100} y={58} s={1} />
      <Casco x={100} y={56} s={0.82} />
      <Gafas x={52} y={98} s={0.8} />
      <Guante x={152} y={108} s={0.85} />
      <Botiquin x={52} y={130} s={0.42} />
    </Escena>
  ),
  busqueda: (
    <Escena>
      <Hoja x={64} y={36} w={58} h={76} />
      <circle cx="118" cy="96" r="22" fill={C.blanco} fillOpacity=".55" stroke={C.azul} strokeWidth="7" />
      <path d="M134 112 L152 130" stroke={C.azul} strokeWidth="9" strokeLinecap="round" />
      <path d="M108 88 Q112 82 118 82" stroke={C.blanco} strokeWidth="3" fill="none" strokeLinecap="round" />
    </Escena>
  ),
  usuarios: (
    <Escena>
      <rect x="44" y="56" width="68" height="78" rx="8" fill={C.blanco} stroke={C.grisM} strokeWidth="2" />
      <Persona x={78} y={110} s={0.85} color={C.cyan} />
      <rect x="58" y="118" width="40" height="4" rx="2" fill={C.grisM} />
      <rect x="92" y="44" width="68" height="78" rx="8" fill={C.blanco} stroke={C.grisM} strokeWidth="2" />
      <Persona x={126} y={98} s={0.85} color={C.verde} />
      <rect x="106" y="106" width="40" height="4" rx="2" fill={C.grisM} />
      <Casco x={126} y={60} s={0.38} />
    </Escena>
  ),
} as const;

export type NombreIlustracion = keyof typeof ESCENAS;

/** Ilustración SST para estados vacíos. */
export function Ilustracion({ nombre, className }: { nombre: NombreIlustracion; className?: string }) {
  return (
    <svg viewBox="0 0 200 160" role="img" aria-hidden className={cn("h-auto w-44", className)} xmlns="http://www.w3.org/2000/svg">
      {ESCENAS[nombre]}
    </svg>
  );
}

/** Estado vacío con ilustración SST (sobre los componentes Empty de shadcn). */
export function EstadoVacio({ ilustracion, titulo, descripcion, children, className, compacto }: {
  ilustracion: NombreIlustracion; titulo: ReactNode; descripcion?: ReactNode; children?: ReactNode; className?: string; compacto?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-background px-6 text-center", compacto ? "py-6" : "py-10", className)}>
      <Ilustracion nombre={ilustracion} className={compacto ? "w-32" : "w-48"} />
      <div className="max-w-md space-y-1.5">
        <div className={cn("font-semibold tracking-tight", compacto ? "text-sm" : "text-base")}>{titulo}</div>
        {descripcion && <div className="text-sm text-muted-foreground text-balance">{descripcion}</div>}
      </div>
      {children && <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
