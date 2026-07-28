import type { Lang } from "./i18n";

/* -------------------------------------------------------------- events */

export interface VenueEvent {
  id: string;
  kind: "concert" | "dj" | "festival" | "special";
  title: string;
  artist: Record<Lang, string>;
  /** ISO date, yyyy-MM-dd. */
  date: string;
  doorsAt: string;
  price: number;
  capacity: number;
  sold: number;
}

export const EVENTS: ReadonlyArray<VenueEvent> = [
  {
    id: "ev-neon-soul",
    kind: "concert",
    title: "NEON SOUL LIVE",
    artist: { th: "วงเนออน โซล · ฟูลแบนด์", en: "Neon Soul · full band" },
    date: "2026-08-08",
    doorsAt: "20:00",
    price: 1200,
    capacity: 180,
    sold: 122,
  },
  {
    id: "ev-midnight-tokyo",
    kind: "dj",
    title: "MIDNIGHT IN TOKYO",
    artist: { th: "ดีเจ ริว (โตเกียว)", en: "DJ Ryu (Tokyo)" },
    date: "2026-08-15",
    doorsAt: "21:00",
    price: 900,
    capacity: 200,
    sold: 200,
  },
  {
    id: "ev-rooftop-fest",
    kind: "festival",
    title: "ROOFTOP FESTIVAL",
    artist: { th: "8 ศิลปิน 2 เวที", en: "8 artists · 2 stages" },
    date: "2026-08-22",
    doorsAt: "17:00",
    price: 1800,
    capacity: 400,
    sold: 231,
  },
  {
    id: "ev-anniversary",
    kind: "special",
    title: "5TH ANNIVERSARY NIGHT",
    artist: { th: "ปาร์ตี้ครบรอบ 5 ปี · เชิญเฉพาะสมาชิก", en: "Members-only anniversary party" },
    date: "2026-09-05",
    doorsAt: "19:30",
    price: 2500,
    capacity: 120,
    sold: 96,
  },
];

export const EVENT_KIND_LABEL: Record<
  VenueEvent["kind"],
  Record<Lang, string>
> = {
  concert: { th: "คอนเสิร์ต", en: "Concert" },
  dj: { th: "ดีเจ", en: "DJ" },
  festival: { th: "เฟสติวัล", en: "Festival" },
  special: { th: "อีเวนต์พิเศษ", en: "Special event" },
};

export function ticketsLeft(e: VenueEvent): number {
  return Math.max(0, e.capacity - e.sold);
}

/* ----------------------------------------------------------------- faq */

export interface FaqEntry {
  id: string;
  q: Record<Lang, string>;
  a: Record<Lang, string>;
}

export const FAQ: ReadonlyArray<FaqEntry> = [
  {
    id: "lock",
    q: {
      th: "จองแล้วล็อกโต๊ะทันทีหรือไม่",
      en: "Is my table locked as soon as I book?",
    },
    a: {
      th: "โต๊ะจะถูกล็อกทันทีที่ชำระเงินสำเร็จและระบบตรวจสลิปผ่านค่ะ ก่อนชำระเงินระบบจะกันโต๊ะไว้ให้ 10 นาทีระหว่างที่ท่านโอน",
      en: "The table is locked the moment payment clears. Before that we hold it for 10 minutes while you transfer.",
    },
  },
  {
    id: "parking",
    q: { th: "ร้านมีที่จอดรถหรือไม่", en: "Is there parking?" },
    a: {
      th: "มีที่จอดรถในอาคาร รองรับได้ 40 คัน จอดฟรี 3 ชั่วโมงเมื่อแสดงใบเสร็จที่เคาน์เตอร์ค่ะ",
      en: "Yes — 40 spaces in the building, free for 3 hours when you show your receipt at the counter.",
    },
  },
  {
    id: "age",
    q: {
      th: "จำกัดอายุผู้เข้าใช้บริการหรือไม่",
      en: "Is there an age limit?",
    },
    a: {
      th: "รับเฉพาะผู้ที่มีอายุ 20 ปีบริบูรณ์ขึ้นไป กรุณาแสดงบัตรประชาชนหรือพาสปอร์ตที่หน้าประตูทุกครั้งค่ะ",
      en: "Guests must be 20 or older. Please show ID or a passport at the door.",
    },
  },
  {
    id: "seats",
    q: { th: "1 โต๊ะนั่งได้กี่คน", en: "How many people fit at one table?" },
    a: {
      th: "ขึ้นอยู่กับโซนค่ะ — บาร์เคาน์เตอร์ 1–4 ท่าน โต๊ะทั่วไปและหน้าเวที 2–6 ท่าน โซฟาเลานจ์ 4–10 ท่าน ห้อง VIP 6–20 ท่าน",
      en: "It depends on the zone — bar counter 1–4, standard and stage-front tables 2–6, sofa lounge 4–10, VIP room 6–20.",
    },
  },
  {
    id: "extra",
    q: {
      th: "สามารถเพิ่มเก้าอี้หรือโต๊ะได้หรือไม่",
      en: "Can I add a chair or another table?",
    },
    a: {
      th: "เพิ่มเก้าอี้ได้สูงสุด 2 ตัวต่อโต๊ะ ส่วนการเพิ่มโต๊ะต้องแจ้งล่วงหน้าอย่างน้อย 1 วันและขึ้นกับที่ว่างในวันนั้นค่ะ",
      en: "Up to 2 extra chairs per table. Extra tables need at least 1 day's notice and depend on availability.",
    },
  },
  {
    id: "extra-cost",
    q: {
      th: "ค่าใช้จ่ายในการเพิ่มโต๊ะหรือเก้าอี้",
      en: "What does an extra table or chair cost?",
    },
    a: {
      th: "เก้าอี้เสริมตัวละ 200 บาท โต๊ะเสริมเริ่มต้น 1,500 บาท (รวมยอดขั้นต่ำของโซนนั้นแล้ว) ค่ะ",
      en: "Extra chair 200 THB each. Extra table from 1,500 THB, which includes that zone's minimum spend.",
    },
  },
  {
    id: "payment",
    q: { th: "วิธีการชำระเงิน", en: "How can I pay?" },
    a: {
      th: "ชำระผ่าน QR PromptPay หรือ Mobile Banking แล้วอัปโหลดสลิปเพื่อให้ระบบตรวจสอบค่ะ ยังไม่รองรับบัตรเครดิตในขั้นตอนจอง",
      en: "QR PromptPay or mobile banking, then upload the slip for verification. Cards are not supported at the booking stage.",
    },
  },
  {
    id: "cancel",
    q: { th: "วิธียกเลิกการจอง", en: "How do I cancel?" },
    a: {
      th: "เข้าเมนู ตั๋วของฉัน เลือกการจองที่ต้องการแล้วกดยกเลิกค่ะ อย่างไรก็ตามเงินมัดจำไม่สามารถคืนได้ทุกกรณีตามเงื่อนไขการจอง",
      en: "Open My Tickets, choose the booking and cancel it. Note that deposits are non-refundable under our booking terms.",
    },
  },
];

/* --------------------------------------------------------------- terms */

export interface TermsSection {
  id: string;
  title: Record<Lang, string>;
  items: Record<Lang, ReadonlyArray<string>>;
}

export const TERMS: ReadonlyArray<TermsSection> = [
  {
    id: "house",
    title: { th: "กฎการเข้าร้าน", en: "House rules" },
    items: {
      th: [
        "รับเฉพาะผู้มีอายุ 20 ปีบริบูรณ์ขึ้นไป ต้องแสดงบัตรประชาชนหรือพาสปอร์ตที่หน้าประตู",
        "ขอสงวนสิทธิ์ในการปฏิเสธการให้บริการแก่ผู้ที่มีอาการมึนเมาเกินควร",
        "ห้ามนำเครื่องดื่มแอลกอฮอล์จากภายนอกเข้ามาในร้าน",
        "งดสูบบุหรี่ภายในอาคาร มีพื้นที่สูบบุหรี่ที่ระเบียงชั้น 2",
      ],
      en: [
        "Guests must be 20 or older and show ID or a passport at the door.",
        "We reserve the right to refuse service to intoxicated guests.",
        "Outside alcohol may not be brought into the venue.",
        "No smoking indoors; there is a smoking terrace on level 2.",
      ],
    },
  },
  {
    id: "hold",
    title: {
      th: "เวลาในการรักษาสิทธิ์ของโต๊ะ",
      en: "Table hold time",
    },
    items: {
      th: [
        "ต้องมาถึงร้านเพื่อรับโต๊ะไม่เกิน 20:30 น. ของวันที่จอง",
        "เกินเวลารับโต๊ะ ระบบจะยกเลิกการจองอัตโนมัติและปล่อยโต๊ะให้ลูกค้ารายอื่น",
        "หากมาช้าโปรดแจ้งทาง LINE Official ล่วงหน้า ทางร้านจะพิจารณาเป็นกรณีไป",
      ],
      en: [
        "Tables must be claimed by 20:30 on the booking date.",
        "After that the booking is cancelled automatically and the table is released.",
        "If you are running late, message our LINE Official and we will do what we can.",
      ],
    },
  },
  {
    id: "pay",
    title: { th: "ข้อกำหนดการชำระเงิน", en: "Payment terms" },
    items: {
      th: [
        "ต้องชำระเงินมัดจำภายใน 10 นาทีหลังยืนยันการจอง มิฉะนั้นระบบจะปล่อยโต๊ะ",
        "ต้องอัปโหลดสลิปโอนเงินเพื่อให้ระบบตรวจสอบ สลิปที่เคยใช้แล้วจะถูกปฏิเสธ",
        "เงินมัดจำใช้หักเป็นส่วนลดค่าอาหารและเครื่องดื่มในวันเข้าใช้บริการ",
      ],
      en: [
        "The deposit must be paid within 10 minutes or the table is released.",
        "A transfer slip must be uploaded for verification; re-used slips are rejected.",
        "The deposit is credited against your food and drink bill on the night.",
      ],
    },
  },
  {
    id: "cancel",
    title: { th: "นโยบายการยกเลิก", en: "Cancellation policy" },
    items: {
      th: [
        "ยกเลิกการจองได้ผ่านเมนู ตั๋วของฉัน ก่อนถึงวันเข้าใช้บริการ",
        "ขอสงวนสิทธิ์ในการเปลี่ยนแปลงโต๊ะในกรณีจำเป็น โดยจะจัดโต๊ะที่เทียบเท่าหรือดีกว่าให้",
        "กรณีร้านยกเลิกงานเอง จะติดต่อกลับภายใน 24 ชั่วโมง",
      ],
      en: [
        "Cancel through My Tickets before the reserved date.",
        "We reserve the right to move you to an equivalent or better table if needed.",
        "If the venue cancels an event, we will contact you within 24 hours.",
      ],
    },
  },
  {
    id: "refund",
    title: { th: "นโยบายการคืนเงิน", en: "Refund policy" },
    items: {
      th: [
        "เมื่อชำระเงินแล้วไม่สามารถคืนเงินได้ทุกกรณี",
        "ยกเว้นกรณีที่ทางร้านยกเลิกงานหรือปิดให้บริการเอง จะคืนเงินเต็มจำนวนภายใน 7 วันทำการ",
      ],
      en: [
        "Payments are non-refundable.",
        "The only exception is a venue-side cancellation, refunded in full within 7 business days.",
      ],
    },
  },
  {
    id: "pdpa",
    title: {
      th: "นโยบายคุ้มครองข้อมูลส่วนบุคคล",
      en: "Personal data protection",
    },
    items: {
      th: [
        "เก็บเฉพาะข้อมูลที่จำเป็นต่อการจอง ได้แก่ ชื่อ เบอร์โทรศัพท์ และประวัติการจอง",
        "ไม่เปิดเผยข้อมูลแก่บุคคลภายนอก ยกเว้นกรณีที่กฎหมายกำหนด",
        "ท่านสามารถขอเข้าถึง แก้ไข หรือลบข้อมูลของท่านได้ผ่านช่องทางติดต่อของร้าน",
        "ข้อมูลการชำระเงินไม่ถูกจัดเก็บในระบบของร้าน",
      ],
      en: [
        "We store only what a booking needs: name, phone number and booking history.",
        "Data is not shared with third parties except where the law requires it.",
        "You may request access, correction or deletion through our contact channels.",
        "Payment details are never stored on our systems.",
      ],
    },
  },
];
