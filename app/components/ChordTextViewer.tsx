"use client";

const CHORD_TOKEN = /^[A-G](?:#|b)?(?:m|min|maj|dim|aug|sus)?(?:2|4|5|6|7|9|11|13)?(?:add9|maj7|m7|sus2|sus4|dim|aug)?(?:\/[A-G](?:#|b)?)?$/;

type ChordToken = {
  chord: string;
  column: number;
};

function blockWidth(line: string, chords: ChordToken[]) {
  const chordEnd = chords.reduce((max, token) => Math.max(max, token.column + token.chord.length), 0);
  return Math.max(line.length, chordEnd, 1);
}

type RenderBlock =
  | { type: "pair"; key: string; chordLine: string; lyricLine: string; chords: ChordToken[] }
  | { type: "chords"; key: string; chordLine: string; chords: ChordToken[] }
  | { type: "text"; key: string; line: string }
  | { type: "space"; key: string };

function isChordLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  return tokens.length > 0 && tokens.every((token) => CHORD_TOKEN.test(token));
}

function extractChordTokens(line: string): ChordToken[] {
  const tokens: ChordToken[] = [];
  const matcher = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(line))) {
    const chord = match[0];
    if (CHORD_TOKEN.test(chord)) {
      tokens.push({ chord, column: match.index });
    }
  }

  return tokens;
}

function buildBlocks(text: string): RenderBlock[] {
  const lines = text ? text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n") : [];
  const blocks: RenderBlock[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";

    if (!line.trim()) {
      blocks.push({ type: "space", key: `space-${index}` });
      continue;
    }

    if (isChordLine(line)) {
      const nextLine = lines[index + 1] ?? "";
      const chords = extractChordTokens(line);

      if (nextLine.trim() && !isChordLine(nextLine)) {
        blocks.push({
          type: "pair",
          key: `pair-${index}`,
          chordLine: line,
          lyricLine: nextLine,
          chords,
        });
        index += 1;
        continue;
      }

      blocks.push({ type: "chords", key: `chords-${index}`, chordLine: line, chords });
      continue;
    }

    blocks.push({ type: "text", key: `text-${index}`, line });
  }

  return blocks;
}

function ChordLayer({
  chords,
  widthCh,
  onChordClick,
}: {
  chords: ChordToken[];
  widthCh: number;
  onChordClick?: (chord: string) => void;
}) {
  return (
    <div className="relative h-7 whitespace-pre text-red-400 sm:h-8" style={{ width: `${widthCh}ch` }}>
      {chords.map((token, index) => (
        <button
          key={`${token.chord}-${token.column}-${index}`}
          type="button"
          onClick={() => onChordClick?.(token.chord)}
          className="absolute top-0 font-mono font-black text-red-400 underline-offset-4 hover:text-red-200 hover:underline"
          style={{ left: `${token.column}ch` }}
          aria-label={`${token.chord} akorunu göster`}
        >
          {token.chord}
        </button>
      ))}
    </div>
  );
}

type Props = {
  text: string;
  emptyText?: string;
  onChordClick?: (chord: string) => void;
};

export function ChordTextViewer({ text, emptyText = "Akor eklenmemiş.", onChordClick }: Props) {
  const blocks = buildBlocks(text);

  return (
    <div className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 sm:p-5">
      <div className="min-w-max font-mono text-[15px] leading-7 tracking-normal sm:text-[16px] sm:leading-8">
        {blocks.length === 0 && <pre className="m-0 whitespace-pre text-zinc-500">{emptyText}</pre>}

        {blocks.map((block) => {
          if (block.type === "space") {
            return <div key={block.key} className="h-5 sm:h-6" />;
          }

          if (block.type === "text") {
            return (
              <pre key={block.key} className="m-0 whitespace-pre text-zinc-100">
                {block.line}
              </pre>
            );
          }

          if (block.type === "chords") {
            return (
              <ChordLayer
                key={block.key}
                chords={block.chords}
                widthCh={blockWidth(block.chordLine, block.chords)}
                onChordClick={onChordClick}
              />
            );
          }

          const widthCh = blockWidth(block.lyricLine, block.chords);

          return (
            <div key={block.key} className="mb-2 sm:mb-3" style={{ width: `${widthCh}ch` }}>
              <ChordLayer chords={block.chords} widthCh={widthCh} onChordClick={onChordClick} />
              <pre className="m-0 whitespace-pre text-zinc-100" style={{ width: `${widthCh}ch` }}>{block.lyricLine}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
