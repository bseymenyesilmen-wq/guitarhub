"use client";

const CHORD_TOKEN = /^[A-G](?:#|b)?(?:m|min|maj|dim|aug|sus)?(?:2|4|5|6|7|9|11|13)?(?:add9|maj7|m7|sus2|sus4|dim|aug)?(?:\/[A-G](?:#|b)?)?$/;

function isChordLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  return tokens.length > 0 && tokens.every((token) => CHORD_TOKEN.test(token));
}

function splitKeepingSpaces(line: string) {
  return line.split(/(\s+)/).filter((part) => part.length > 0);
}

type Props = {
  text: string;
  emptyText?: string;
  onChordClick?: (chord: string) => void;
};

export function ChordTextViewer({ text, emptyText = "Akor eklenmemiş.", onChordClick }: Props) {
  const lines = text ? text.replace(/\r\n/g, "\n").split("\n") : [];

  return (
    <div className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 sm:p-5">
      <div className="min-w-max font-mono text-[14px] leading-7 tracking-normal sm:text-[15px] sm:leading-8">
        {lines.length === 0 && <pre className="m-0 whitespace-pre text-zinc-500">{emptyText}</pre>}

        {lines.map((line, lineIndex) => {
          if (!line.trim()) {
            return <div key={lineIndex} className="h-4" />;
          }

          if (!isChordLine(line)) {
            return (
              <pre key={lineIndex} className="m-0 whitespace-pre text-zinc-200">
                {line}
              </pre>
            );
          }

          return (
            <pre key={lineIndex} className="m-0 whitespace-pre text-red-400">
              {splitKeepingSpaces(line).map((part, partIndex) => {
                if (/^\s+$/.test(part)) {
                  return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
                }

                return (
                  <button
                    key={`${lineIndex}-${partIndex}`}
                    type="button"
                    onClick={() => onChordClick?.(part)}
                    className="font-mono text-red-400 underline-offset-4 hover:text-red-200 hover:underline"
                    aria-label={`${part} akorunu göster`}
                  >
                    {part}
                  </button>
                );
              })}
            </pre>
          );
        })}
      </div>
    </div>
  );
}
