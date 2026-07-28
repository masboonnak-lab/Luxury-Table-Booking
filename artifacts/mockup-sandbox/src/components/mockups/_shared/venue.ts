// Single source of truth for the mockups. Change these to the real venue's details.
export const VENUE = {
  name: "TEST LAB DRINK",
  kind: "Cocktail Bar & Whisky Lounge",
  tagline: "Sathorn · Bangkok",
  address: "123 ถนนสาทรใต้ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120",
  phone: "02 123 4567",
  minimumAge: 20,

  // Placeholder billing identity — replace with the real registration before use.
  legalName: "บริษัท เทสต์ แล็บ ดริ๊งค์ จำกัด",
  taxId: "0-1055-00000-00-0",
  branch: "สำนักงานใหญ่",
  promptPayId: "0-2123-4567",
  receiptPrefix: "TLD",

  /**
   * Online channels, in the order they should be offered. `href` is what the
   * row links to — a LINE deep link, a profile URL, or a mailto/tel.
   */
  online: [
    {
      id: "line",
      label: "LINE Official",
      handle: "@testlabdrink",
      href: "https://line.me/R/ti/p/@testlabdrink",
    },
    {
      id: "facebook",
      label: "Facebook",
      handle: "testlabdrink",
      href: "https://facebook.com/testlabdrink",
    },
    {
      id: "instagram",
      label: "Instagram",
      handle: "@testlabdrink",
      href: "https://instagram.com/testlabdrink",
    },
    {
      id: "email",
      label: "อีเมล",
      handle: "reserve@testlabdrink.com",
      href: "mailto:reserve@testlabdrink.com",
    },
    {
      id: "phone",
      label: "โทรศัพท์",
      handle: "02 123 4567",
      href: "tel:+6621234567",
    },
  ],

  hours: [
    { days: "อังคาร – พฤหัสบดี", time: "18:00 – 01:00" },
    { days: "ศุกร์ – เสาร์", time: "18:00 – 02:00" },
    { days: "อาทิตย์", time: "18:00 – 00:00" },
    { days: "จันทร์", time: "ปิดทำการ" },
  ],
  house: [
    "งดบุคคลอายุต่ำกว่า 20 ปี กรุณาแสดงบัตรประชาชนที่หน้าประตู",
    "เก็บโต๊ะให้ 15 นาทีหลังเวลาจอง หากมาช้ากว่านั้นถือว่าสละสิทธิ์",
    "ยกเลิกฟรีก่อนเวลาจอง 4 ชั่วโมง หลังจากนั้นไม่คืนเงินมัดจำ",
    "เงินมัดจำใช้หักเป็นส่วนลดค่าอาหารและเครื่องดื่มในวันเข้าใช้บริการ",
  ],
} as const;
