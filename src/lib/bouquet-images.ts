import bouquet1 from "@/assets/bouquet-1.jpg";
import bouquet2 from "@/assets/bouquet-2.jpg";
import bouquet3 from "@/assets/bouquet-3.jpg";
import bouquet4 from "@/assets/bouquet-4.jpg";

const map: Record<string, string> = {
  "bouquet-1.jpg": bouquet1,
  "bouquet-2.jpg": bouquet2,
  "bouquet-3.jpg": bouquet3,
  "bouquet-4.jpg": bouquet4,
};

export function resolveBouquetImage(src: string | null | undefined): string {
  if (!src) return bouquet1;
  if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) return src;
  const name = src.split("/").pop() ?? "";
  return map[name] ?? bouquet1;
}

export const fallbackBouquets = [bouquet1, bouquet2, bouquet3, bouquet4];
