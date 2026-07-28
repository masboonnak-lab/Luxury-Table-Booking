/**
 * Decorative photography for the mockup, served from the Unsplash CDN.
 * Every URL below was fetched and visually checked before being added — swap
 * these for the venue's own shots before this goes anywhere near production.
 */
function unsplash(id: string, width: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=70`;
}

/**
 * A structural type, not `typeof PHOTOS[keyof typeof PHOTOS]`: that inferred a
 * union of the exact alt strings below, so nothing outside this file could
 * ever supply an image.
 */
export interface Photo {
  src: string;
  alt: string;
}

export const PHOTOS = {
  /** Warm bar interior, edison bulbs — landscape. */
  interiorWide: {
    src: unsplash("1572116469696-31de0f17cc34", 1600),
    alt: "บรรยากาศภายในบาร์ ไฟเอดิสันเหนือเคาน์เตอร์",
  },
  /** Same room, portrait crop. */
  interiorTall: {
    src: unsplash("1543007630-9710e4a00a20", 900),
    alt: "เคาน์เตอร์บาร์และชั้นวางขวดเหล้า",
  },
  /** Bartender pouring under coloured light. */
  bartender: {
    src: unsplash("1566417713940-fe7c737a9ef2", 900),
    alt: "บาร์เทนเดอร์กำลังริน ค็อกเทล",
  },
  smokedCocktail: {
    src: unsplash("1514362545857-3bc16c4c7d1b", 800),
    alt: "ค็อกเทลรมควันพร้อมการ์นิชสมุนไพร",
  },
  whiskyPour: {
    src: unsplash("1470337458703-46ad1756a187", 800),
    alt: "รินวิสกี้ลงแก้วที่มีก้อนน้ำแข็งใหญ่",
  },
  herbHighball: {
    src: unsplash("1517620430776-0ec904756579", 800),
    alt: "ไฮบอลสมุนไพรบนโต๊ะไม้",
  },
} as const satisfies Record<string, Photo>;
