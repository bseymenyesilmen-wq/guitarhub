"use client";

const CHORD_TOKEN = /^[A-G](?:#|b)?(?:m|min|maj|dim|aug|sus)?(?:2|4|5|6|7|9|11|13)?(?:add9|maj7|m7|sus2|sus4|dim|aug)?(?:\/[A-G](?:#|b)?)?$/;

type RenderLine =
  | { type: "text"; key: string; line: string; chordLine: false }
  | { type: "text"; key: string; line: string; chordLine: true }
  | { type: "space"; key: string };

function isChordLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  return tokens.length > 0 && tokens.every((token) => CHORD_TOKEN.test(token));
}

function splitKeepingSpaces(line: string) {
  return line.split(/(\s+)/).filter((part) => part.length > 0);
}

function buildLines(text: string): RenderLine[] {
  const lines = text ? text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n") : [];

  return lines.map((line, index) => {
    if (!line.trim()) {
      return { type: "space", key: `space-${index}` };
    }

    return {
      type: "text",
      key: `line-${index}`,
      line,
      chordLine: isChordLine(line),
    };
  });
}

type Props = {
  text: string;
  emptyText?: string;
  onChordClick?: (chord: string) => void;
  size?: "normal" | "compact";
};

export function ChordTextViewer({ text, emptyText = "Akor eklenmemiş.", onChordClick, size = "normal" }: Props) {
  const lines = buildLines(text);
  const textSizeClass =
    size === "compact"
      ? "text-[14px] leading-[1.45] sm:text-[15px] sm:leading-[1.5]"
      : "text-[24px] leading-[1.45] sm:text-[26px] sm:leading-[1.5]";

  return (
    <div className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 sm:p-5">
      <div
        className={`min-w-max tracking-normal text-zinc-100 ${textSizeClass}`}
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {lines.length === 0 && <pre className="m-0 whitespace-pre text-zinc-500">{emptyText}</pre>}

        {lines.map((item) => {
          if (item.type === "space") {
            return <div key={item.key} className={size === "compact" ? "h-3 sm:h-4" : "h-5 sm:h-6"} />;
          }

          if (!item.chordLine) {
            return (
              <pre key={item.key} className="m-0 whitespace-pre text-zinc-100" style={{ fontFamily: "inherit" }}>
                {item.line}
              </pre>
            );
          }

          return (
            <pre key={item.key} className="m-0 whitespace-pre font-bold text-red-400" style={{ fontFamily: "inherit" }}>
              {splitKeepingSpaces(item.line).map((part, index) => {
                if (/^\s+$/.test(part)) {
                  return <span key={`${item.key}-space-${index}`}>{part}</span>;
                }

                return (
                  <button
                    key={`${item.key}-${part}-${index}`}
                    type="button"
                    onClick={() => onChordClick?.(part)}
                    className="align-baseline font-bold text-red-400 underline-offset-4 hover:text-red-200 hover:underline"
                    style={{ fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit" }}
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
