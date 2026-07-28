/**
 * The gig board — who is playing, when, and what it costs.
 *
 * WHO THESE ARE: invented acts. Naming real Thai artists here would be a
 * public claim that they are booked at this venue, which is a statement about
 * real people that nobody has agreed to. Replace this array with the venue's
 * actual bookings before it goes live.
 *
 * ARTWORK: `photo` is deliberately optional and empty. A gig board runs on the
 * artist's own press shot, which the venue receives with the booking — stock
 * photographs of unrelated musicians would misrepresent who is on stage. Until
 * a real image is supplied, each act is drawn as a poster from its genre.
 */

export type Genre = "band" | "dj" | "solo" | "jazz" | "special";

export interface Act {
  id: string;
  name: string;
  /** Sub-line: line-up, origin, or what the night is. */
  detail: string;
  genre: Genre;
  /** ISO date, yyyy-MM-dd. */
  date: string;
  doorsAt: string;
  showAt: string;
  /** 0 means no cover charge. */
  cover: number;
  /** Long-form description shown when the act is opened. */
  about: string;
  /** Press shot supplied by the artist. Empty until one exists. */
  photo?: string;
  soldOut?: boolean;
}

export const GENRE_LABEL: Record<Genre, string> = {
  band: "วงดนตรีสด",
  dj: "ดีเจ",
  solo: "ศิลปินเดี่ยว",
  jazz: "แจ๊ส",
  special: "อีเวนต์พิเศษ",
};

/** Poster palette per genre — two stops and an accent, in bare HSL channels. */
export const GENRE_ART: Record<Genre, { from: string; to: string; accent: string }> = {
  band: { from: "14 62% 26%", to: "30 12% 8%", accent: "24 78% 58%" },
  dj: { from: "268 48% 26%", to: "30 12% 8%", accent: "280 72% 68%" },
  solo: { from: "340 44% 26%", to: "30 12% 8%", accent: "344 74% 66%" },
  jazz: { from: "38 48% 24%", to: "30 12% 8%", accent: "38 72% 62%" },
  special: { from: "190 44% 22%", to: "30 12% 8%", accent: "184 70% 58%" },
};

export const LINEUP: ReadonlyArray<Act> = [
  {
    id: "act-neon-soul",
    name: "NEON SOUL",
    detail: "ฟูลแบนด์ 7 ชิ้น · โซล/ฟังก์",
    genre: "band",
    date: "2026-08-08",
    doorsAt: "20:00",
    showAt: "21:30",
    cover: 1200,
    about:
      "วงโซลฟูลแบนด์ที่เล่นประจำย่านทองหล่อมากว่าสามปี ชุดนี้เล่นเพลงจากอัลบั้มใหม่เต็มชุด พร้อมเครื่องเป่าสามชิ้น เซ็ตยาวสองรอบ พักครึ่งชั่วโมง",
  },
  {
    id: "act-midnight-tokyo",
    name: "MIDNIGHT IN TOKYO",
    detail: "ดีเจรับเชิญ · ดีพเฮาส์",
    genre: "dj",
    date: "2026-08-15",
    doorsAt: "21:00",
    showAt: "22:00",
    cover: 900,
    soldOut: true,
    about:
      "คืนดีพเฮาส์ยาวถึงตีสอง เซ็ตต่อเนื่องไม่มีพัก ระบบเสียงเสริมเฉพาะคืนนี้ บัตรจำหน่ายหมดแล้ว",
  },
  {
    id: "act-lamphu",
    name: "ลำพูควอเต็ต",
    detail: "แจ๊สสี่ชิ้น · เปียโน กลอง เบส แซกโซโฟน",
    genre: "jazz",
    date: "2026-08-11",
    doorsAt: "19:00",
    showAt: "20:00",
    cover: 0,
    about:
      "คืนแจ๊สประจำวันอังคาร ไม่มีค่าเข้า เล่นสแตนดาร์ดสลับเพลงไทยเรียบเรียงใหม่ เหมาะกับคนที่อยากคุยงานไปฟังไป",
  },
  {
    id: "act-praewa",
    name: "แพรวา",
    detail: "ศิลปินเดี่ยว · อะคูสติก",
    genre: "solo",
    date: "2026-08-13",
    doorsAt: "19:30",
    showAt: "20:30",
    cover: 500,
    about:
      "เซ็ตอะคูสติกกีตาร์กับเสียงร้อง เพลงของตัวเองสลับเพลงคัฟเวอร์ยุค 90 บรรยากาศเงียบ เหมาะกับโซนโซฟา",
  },
  {
    id: "act-rooftop-fest",
    name: "ROOFTOP FESTIVAL",
    detail: "8 ศิลปิน 2 เวที",
    genre: "special",
    date: "2026-08-22",
    doorsAt: "17:00",
    showAt: "17:30",
    cover: 1800,
    about:
      "งานใหญ่ประจำปี เปิดสองเวทีพร้อมกันตั้งแต่ห้าโมงเย็นถึงตีหนึ่ง มีซุ้มอาหารเพิ่มบนดาดฟ้า บัตรใบเดียวเข้าได้ทั้งสองเวที",
  },
  {
    id: "act-sarnsri",
    name: "สารศรี",
    detail: "วงสามชิ้น · อินดี้โฟล์ก",
    genre: "band",
    date: "2026-08-16",
    doorsAt: "20:00",
    showAt: "21:00",
    cover: 400,
    about:
      "อินดี้โฟล์กจากเชียงใหม่ ทัวร์กรุงเทพรอบเดียว เล่นเพลงจากอีพีล่าสุดทั้งชุด",
  },
  {
    id: "act-siam-groove",
    name: "SIAM GROOVE",
    detail: "ดีเจคู่ · ฟังก์ ดิสโก้ ลูกทุ่งรีมิกซ์",
    genre: "dj",
    date: "2026-08-23",
    doorsAt: "21:00",
    showAt: "22:00",
    cover: 350,
    about:
      "คืนที่เอาลูกทุ่งกับดิสโก้มาชนกัน เซ็ตแผ่นไวนิลล้วน ยาวถึงลาสต์ออเดอร์",
  },
  {
    id: "act-blue-hour",
    name: "BLUE HOUR",
    detail: "ควินเต็ต · โมเดิร์นแจ๊ส",
    genre: "jazz",
    date: "2026-08-28",
    doorsAt: "19:00",
    showAt: "20:30",
    cover: 600,
    about:
      "แจ๊สห้าชิ้นที่เล่นงานเรียบเรียงใหม่ทั้งเซ็ต มีช่วงอิมโพรไวส์ยาวรอบดึก",
  },
  {
    id: "act-anniversary",
    name: "5TH ANNIVERSARY NIGHT",
    detail: "ปาร์ตี้ครบรอบ 5 ปี · เชิญเฉพาะสมาชิก",
    genre: "special",
    date: "2026-09-05",
    doorsAt: "19:30",
    showAt: "20:30",
    cover: 2500,
    about:
      "คืนครบรอบห้าปี เชิญเฉพาะสมาชิกและผู้ถือบัตรเชิญ มีค็อกเทลเมนูพิเศษที่ทำเฉพาะคืนนี้ และวงที่เล่นในคืนเปิดร้านกลับมาเล่นอีกครั้ง",
  },
  {
    id: "act-after-rain",
    name: "AFTER RAIN",
    detail: "วงสี่ชิ้น · ซิตี้ป๊อป",
    genre: "band",
    date: "2026-09-12",
    doorsAt: "20:00",
    showAt: "21:30",
    cover: 700,
    about:
      "ซิตี้ป๊อปสไตล์ญี่ปุ่นยุค 80 ผสมเนื้อร้องภาษาไทย เซ็ตนี้มีคีย์บอร์ดรับเชิญเพิ่มอีกหนึ่งคน",
  },
];

/** Sorted by date, and past nights dropped — a board should never show old news. */
export function upcomingActs(todayIso: string): ReadonlyArray<Act> {
  return [...LINEUP]
    .filter((a) => a.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date));
}
