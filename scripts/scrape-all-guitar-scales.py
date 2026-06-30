#!/usr/bin/env python3
import json
import re
from pathlib import Path

import requests

APP_JS = "https://www.all-guitar-chords.com/js/app.js?id=ab12bd16c90fba1cf43d"
CATEGORY = {0: "Common", 1: "Rare", 2: "Exotic"}


def slugify(name: str) -> str:
    slug = name.lower()
    slug = slug.replace("#", "sharp")
    slug = slug.replace("&", "and")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def main():
    js = requests.get(APP_JS, timeout=30, headers={"User-Agent": "Mozilla/5.0"}).text
    pattern = re.compile(
        r'\{id:(\d+),name:"((?:\\.|[^"\\])*)",interval:"((?:\\.|[^"\\])*)",steps:\[([^\]]*)\],category:(\d+)\}'
    )
    items = []
    for match in pattern.finditer(js):
        scale_id = int(match.group(1))
        raw_name = match.group(2).encode().decode("unicode_escape")
        raw_interval = match.group(3).encode().decode("unicode_escape")
        steps = [int(part.strip()) for part in match.group(4).split(",") if part.strip()]
        category_id = int(match.group(5))
        if category_id not in CATEGORY:
            continue
        category = CATEGORY[category_id]
        formula = [part.strip() for part in raw_interval.split(",")]
        items.append({
            "sourceId": scale_id,
            "id": slugify(raw_name),
            "scaleSlug": slugify(raw_name),
            "name": raw_name,
            "category": category,
            "formula": formula,
            "steps": steps,
            "character": f"All-Guitar-Chords {category} gamı.",
            "genres": [category],
            "scrapedFrom": "all-guitar-chords.com/scales",
        })

    # The app JS also contains other objects; keep the unique scale source ids in site order.
    unique = []
    seen = set()
    for item in items:
        if item["sourceId"] in seen:
            continue
        seen.add(item["sourceId"])
        unique.append(item)

    if len(unique) < 90:
        raise SystemExit(f"Only found {len(unique)} scale definitions")

    lines = [
        "import type { ScaleDefinition } from \"@/lib/music-theory\";",
        "",
        "export type AllGuitarScaleDefinition = ScaleDefinition & {",
        "  sourceId: number;",
        "  steps: number[];",
        "  scrapedFrom: \"all-guitar-chords.com/scales\";",
        "};",
        "",
        "export const ALL_GUITAR_SCALES = [",
    ]
    for item in unique:
        lines.append("  {")
        lines.append(f"    sourceId: {item['sourceId']},")
        lines.append(f"    id: {ts_string(item['id'])},")
        lines.append(f"    scaleSlug: {ts_string(item['scaleSlug'])},")
        lines.append(f"    name: {ts_string(item['name'])},")
        lines.append(f"    category: {ts_string(item['category'])},")
        lines.append(f"    formula: {json.dumps(item['formula'], ensure_ascii=False)},")
        lines.append(f"    steps: {json.dumps(item['steps'])},")
        lines.append(f"    character: {ts_string(item['character'])},")
        lines.append(f"    genres: {json.dumps(item['genres'], ensure_ascii=False)},")
        lines.append(f"    scrapedFrom: {ts_string(item['scrapedFrom'])},")
        lines.append("  },")
    lines.append("] satisfies AllGuitarScaleDefinition[];")
    lines.append("")

    out = Path("lib/all-guitar-scales-data.ts")
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {out} with {len(unique)} scales")
    print("first", unique[0]["name"], "last", unique[-1]["name"])


if __name__ == "__main__":
    main()
