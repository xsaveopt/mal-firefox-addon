export type MalType = "anime" | "manga";

export function getIdFromUrl(url: string, type: string): string | null {
  const match = url.match(new RegExp(`/${type}/(\\d+)`));
  return match ? match[1] : null;
}

export function listTypeFromUrl(url: string): MalType | null {
  if (url.includes("/mangalist/")) return "manga";
  if (url.includes("/animelist/")) return "anime";
  return null;
}

export function typeSearchOrder(listType: MalType | null): MalType[] {
  if (listType === "manga") return ["manga", "anime"];
  return ["anime", "manga"];
}

export function deleteUrl(type: MalType, id: string): string {
  return `https://myanimelist.net/ownlist/${type}/${id}/delete`;
}
