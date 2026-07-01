"use client";

type Props = {
  text: string;
  emptyText?: string;
  onChordClick?: (chord: string) => void;
  size?: "normal" | "compact";
};

export function ChordTextViewer({ text, emptyText = "Akor eklenmemiş.", size = "normal" }: Props) {
  const normalizedText = text ? text.replace(/\r\n/g, "\n").replace(/\r/g, "\n") : "";
  const textSizeClass = size === "compact" ? "text-[13px] leading-[1.55] sm:text-[14px]" : "text-[15px] leading-[1.6] sm:text-[16px]";

  return (
    <div className="overflow-x-auto rounded-2xl bg-zinc-950 p-3 sm:p-5" data-tab-viewer>
      <pre
        className={`m-0 min-w-max whitespace-pre text-zinc-100 ${textSizeClass}`}
        style={{
          whiteSpace: "pre",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          tabSize: 4,
        }}
      >
        {normalizedText || emptyText}
      </pre>
    </div>
  );
}
