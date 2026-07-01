"use client";

type Props = {
  text: string;
  emptyText?: string;
  onChordClick?: (chord: string) => void;
  size?: "normal" | "compact";
};

const CHORD_TOKEN_PATTERN = /^[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:maj|min|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?$/;

function isChordToken(token: string) {
  return CHORD_TOKEN_PATTERN.test(token.replace(/[()[\],.;:]+$/g, ""));
}

function renderChordLine(line: string, onChordClick?: (chord: string) => void) {
  const parts = line.split(/(\s+)/);
  return parts.map((part, index) => {
    if (!part || /^\s+$/.test(part)) return part;
    const token = part.replace(/[()[\],.;:]+$/g, "");
    if (!onChordClick || !isChordToken(token)) return part;
    const suffix = part.slice(token.length);
    return (
      <span key={`${token}-${index}`}>
        <button
          type="button"
          onClick={() => onChordClick?.(token)}
          aria-label={`Akor ${token}`}
          className="rounded font-bold text-red-200 underline decoration-red-500/60 underline-offset-2 hover:bg-red-600/30 hover:text-white"
          style={{ font: "inherit" }}
        >
          {token}
        </button>
        {suffix}
      </span>
    );
  });
}

export function ChordTextViewer({ text, emptyText = "Akor eklenmemiş.", onChordClick, size = "normal" }: Props) {
  const normalizedText = text ? text.replace(/\\t/g, "    ").replace(/\\(?= {4})/g, "").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n") : "";
  const textSizeClass = size === "compact" ? "text-[13px] leading-[1.55] sm:text-[14px]" : "text-[15px] leading-[1.6] sm:text-[16px]";
  const lines = normalizedText.split("\n");

  return (
    <div className="overflow-x-auto rounded-2xl bg-zinc-950 p-3 sm:p-5" data-tab-viewer>
      <pre
        className={`m-0 min-w-max whitespace-pre text-zinc-100 ${textSizeClass}`}
        style={{
          whiteSpace: "pre",
          fontFamily: "Arial, Helvetica, sans-serif",
          tabSize: 4,
        }}
      >
        {normalizedText
          ? lines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {renderChordLine(line, onChordClick)}
                {index < lines.length - 1 ? "\n" : ""}
              </span>
            ))
          : emptyText}
      </pre>
    </div>
  );
}
