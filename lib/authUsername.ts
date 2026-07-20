const AUTH_USERNAME_DOMAIN = "guitarhub47.netlify.app";

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function normalizeUsername(value: string) {
  return value
    .trim()
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join("")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/[._-]{2,}/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "");
}

export function usernameToAuthEmail(username: string) {
  const normalized = normalizeUsername(username);
  if (!normalized || normalized.length < 3) return "";
  return `${normalized}@${AUTH_USERNAME_DOMAIN}`;
}
