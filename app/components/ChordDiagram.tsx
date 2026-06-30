import type { ChordPosition } from "@/lib/music-theory";

type Props = {
  position: ChordPosition;
  title?: string;
};

const stringX = [28, 58, 88, 118, 148, 178];
const fretY = [36, 74, 112, 150, 188];

function fretToY(fret: number, baseFret: number) {
  const relative = fret - baseFret + 1;
  return fretY[Math.max(0, Math.min(relative - 1, fretY.length - 1))] + 18;
}

export function ChordDiagram({ position, title }: Props) {
  const visibleFrets = Array.from({ length: 5 }, (_, index) => position.baseFret + index);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      {title && <p className="mb-3 text-center text-sm font-bold text-zinc-300">{title}</p>}
      <svg viewBox="0 0 206 244" role="img" aria-label={`${title ?? position.name} akor diyagramı`} className="mx-auto w-full max-w-[260px]">
        {position.baseFret > 1 && (
          <text x="4" y="60" className="fill-zinc-400 text-[10px] font-bold">
            {position.baseFret}. perde
          </text>
        )}

        {stringX.map((x) => (
          <line key={`s-${x}`} x1={x} x2={x} y1="28" y2="208" stroke="#71717a" strokeWidth="2" />
        ))}

        {fretY.map((y, index) => (
          <line key={`f-${y}`} x1="28" x2="178" y1={y} y2={y} stroke={index === 0 && position.baseFret === 1 ? "#f4f4f5" : "#52525b"} strokeWidth={index === 0 && position.baseFret === 1 ? "5" : "2"} />
        ))}

        {visibleFrets.map((fret, index) => (
          <text key={fret} x="188" y={fretY[index] + 23} className="fill-zinc-500 text-[10px]">
            {fret}
          </text>
        ))}

        {position.barre && (
          <rect
            x={stringX[6 - position.barre.toString] - 13}
            y={fretToY(position.barre.fret, position.baseFret) - 13}
            width={stringX[6 - position.barre.fromString] - stringX[6 - position.barre.toString] + 26}
            height="26"
            rx="13"
            fill="#dc2626"
            opacity="0.85"
          />
        )}

        {position.frets.map((fret, index) => {
          const x = stringX[index];
          if (fret === "x") {
            return (
              <text key={`${index}-x`} x={x - 5} y="20" className="fill-red-400 text-[15px] font-black">
                ×
              </text>
            );
          }
          if (fret === 0) {
            return (
              <circle key={`${index}-open`} cx={x} cy="14" r="6" fill="none" stroke="#e4e4e7" strokeWidth="2" />
            );
          }

          const y = fretToY(fret, position.baseFret);
          const finger = position.fingers[index];
          return (
            <g key={`${index}-${fret}`}>
              <circle cx={x} cy={y} r="13" fill="#ef4444" />
              {finger > 0 && (
                <text x={x - 4} y={y + 5} className="fill-white text-[12px] font-black">
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {position.hint && <p className="mt-3 text-center text-xs text-zinc-400">{position.hint}</p>}
    </div>
  );
}
