#!/usr/bin/env python3
import html
import json
import re
import time
from pathlib import Path
from urllib.parse import quote

import requests

ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
QUALITIES = {
    "major": "",
    "minor": "m",
    "7": "7",
    "5": "5",
    "dim": "dim",
    "aug": "aug",
    "sus2": "sus2",
    "sus4": "sus4",
    "maj7": "maj7",
    "m7": "m7",
    "add9": "add9",
    "6": "6",
    "9": "9",
    "11": "11",
    "13": "13",
}
BASE_URL = "https://www.all-guitar-chords.com/chords/index"
OUT = Path("lib/all-guitar-chords-data.ts")
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (compatible; GuitarHub chord data sync)"})


def chord_name(root: str, quality: str) -> str:
    return f"{root}{QUALITIES[quality]}"


def string_value(cell: list[dict]) -> tuple[int | str, int]:
    item = cell[0] if cell else {"fretNo": 0, "symbol": None}
    if item.get("isMuted"):
        return "x", 0
    fret = int(item.get("fretNo", 0))
    symbol = item.get("symbol")
    finger = int(symbol) if isinstance(symbol, str) and symbol.isdigit() else 0
    return fret, finger


def barre_value(strings_high_to_low: list[list[dict]]) -> str:
    by_fret: dict[int, list[int]] = {}
    for high_index, cell in enumerate(strings_high_to_low):
        item = cell[0] if cell else {}
        if item.get("isMuted"):
            continue
        fret = item.get("fretNo")
        if not isinstance(fret, int) or fret <= 0:
            continue
        if item.get("barre") is True or isinstance(item.get("barre"), int):
            string_number = high_index + 1  # high e = 1, low E = 6
            by_fret.setdefault(fret, []).append(string_number)
    for fret, strings in by_fret.items():
        if len(strings) >= 2:
            return f", barre: {{ fret: {fret}, fromString: {min(strings)}, toString: {max(strings)}, finger: 1 }}"
    return ""


def difficulty(base_fret: int, has_barre: bool) -> str:
    if base_fret <= 1 and not has_barre:
        return "beginner"
    if base_fret <= 5:
        return "intermediate"
    return "advanced"


def fetch_positions(root: str, quality: str) -> list[dict]:
    root_path = quote(root.lower(), safe="")
    url = f"{BASE_URL}/{root_path}/{quality}"
    response = SESSION.get(url, timeout=25)
    response.raise_for_status()
    matches = re.findall(r":string-data='([^']+)'", response.text)
    positions = []
    for index, raw in enumerate(matches, start=1):
        data = json.loads(html.unescape(raw))
        strings_high_to_low = data["strings"]
        pairs_high_to_low = [string_value(cell) for cell in strings_high_to_low]
        frets = [pair[0] for pair in reversed(pairs_high_to_low)]
        fingers = [pair[1] for pair in reversed(pairs_high_to_low)]
        barre = barre_value(strings_high_to_low)
        base_fret = int(data.get("firstFret") or 1)
        frets_label = " ".join(str(item) for item in frets)
        positions.append({
            "id": f"agc-{root.lower().replace('#', 'sharp')}-{quality}-{index}",
            "name": f"All-Guitar-Chords Varyasyon {index}",
            "frets": frets,
            "fingers": fingers,
            "baseFret": base_fret,
            "barre": barre,
            "difficulty": difficulty(base_fret, bool(barre)),
            "hint": f"All-Guitar-Chords verisi. Çal: {frets_label}. X olan telleri çalma.",
        })
    if not positions:
        raise RuntimeError(f"No positions found for {root} {quality} at {url}")
    return positions


def ts_value(value):
    if value == "x":
        return '"x"'
    return str(value)


def emit_positions(positions: list[dict]) -> str:
    chunks = []
    for pos in positions:
        frets = ", ".join(ts_value(item) for item in pos["frets"])
        fingers = ", ".join(str(item) for item in pos["fingers"])
        chunks.append(
            "    { "
            f"id: {json.dumps(pos['id'], ensure_ascii=False)}, "
            f"name: {json.dumps(pos['name'], ensure_ascii=False)}, "
            f"frets: [{frets}], "
            f"fingers: [{fingers}], "
            f"baseFret: {pos['baseFret']}, "
            f"difficulty: {json.dumps(pos['difficulty'], ensure_ascii=False)}, "
            f"hint: {json.dumps(pos['hint'], ensure_ascii=False)}"
            f"{pos['barre']} "
            "},"
        )
    return "\n".join(chunks)


def main():
    data: dict[str, list[dict]] = {}
    for root in ROOTS:
        for quality in QUALITIES:
            name = chord_name(root, quality)
            print(f"fetch {name}")
            data[name] = fetch_positions(root, quality)
            time.sleep(0.08)

    lines = [
        "// Generated from https://www.all-guitar-chords.com by scripts/scrape-all-guitar-chords.py",
        "// Do not edit individual positions by hand; rerun the scraper instead.",
        'import type { ChordPosition } from "@/lib/music-theory";',
        "",
        "export const ALL_GUITAR_CHORD_POSITIONS: Record<string, ChordPosition[]> = {",
    ]
    for name, positions in data.items():
        lines.append(f"  {json.dumps(name)}: [")
        lines.append(emit_positions(positions))
        lines.append("  ],")
    lines.append("};")
    lines.append("")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {OUT} with {len(data)} chords")


if __name__ == "__main__":
    main()
