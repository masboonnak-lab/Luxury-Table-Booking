/**
 * The full drinks and food list, beyond the four signatures the landing page
 * leads with. Prices are in THB.
 */

export interface MenuItem {
  name: string;
  detail: string;
  price: number;
}

export interface MenuSection {
  id: string;
  title: string;
  note?: string;
  items: ReadonlyArray<MenuItem>;
}

export const MENU: ReadonlyArray<MenuSection> = [
  {
    id: "signature",
    title: "ซิกเนเจอร์ค็อกเทล",
    note: "เปลี่ยนตามฤดูกาล",
    items: [
      { name: "Smoked Old Fashioned", detail: "Bourbon · เชอร์รี่รมควัน", price: 420 },
      { name: "Barrel-Aged Manhattan", detail: "Rye · บ่มถัง 60 วัน", price: 520 },
      { name: "Lemongrass Highball", detail: "Japanese whisky · ตะไคร้", price: 380 },
      { name: "Bangkok Negroni", detail: "Gin · มะขาม · คัมปารี", price: 450 },
      { name: "Pandan Sour", detail: "Rum · ใบเตย · ไข่ขาว", price: 390 },
      { name: "Kaffir Gimlet", detail: "Gin · ใบมะกรูด · น้ำผึ้งป่า", price: 400 },
    ],
  },
  {
    id: "classic",
    title: "คลาสสิก",
    items: [
      { name: "Negroni", detail: "Gin · Campari · Vermouth", price: 340 },
      { name: "Whisky Sour", detail: "Bourbon · เลมอน · ไข่ขาว", price: 340 },
      { name: "Espresso Martini", detail: "Vodka · เอสเพรสโซคั่วเข้ม", price: 360 },
      { name: "Margarita", detail: "Tequila · ไลม์ · ทริปเปิลเซค", price: 340 },
    ],
  },
  {
    id: "whisky",
    title: "วิสกี้",
    note: "เสิร์ฟแบบ pour 30 ml · มีให้เลือกกว่า 200 ฉลาก",
    items: [
      { name: "Single Malt · Speyside", detail: "12–15 ปี", price: 380 },
      { name: "Single Malt · Islay", detail: "พีทจัด 10–12 ปี", price: 450 },
      { name: "Japanese Whisky", detail: "ตามสต็อกในวันนั้น", price: 520 },
      { name: "Rare Cask", detail: "ถามพนักงานสำหรับรายการวันนี้", price: 1200 },
    ],
  },
  {
    id: "food",
    title: "อาหารทานเล่น",
    items: [
      { name: "ชีสบอร์ด", detail: "ชีส 4 ชนิด · ถั่ว · น้ำผึ้ง", price: 690 },
      { name: "ปีกไก่ทอดน้ำปลา", detail: "จานใหญ่ แบ่งกันได้", price: 320 },
      { name: "เฟรนช์ฟรายทรัฟเฟิล", detail: "โรยพาร์เมซาน", price: 280 },
      { name: "ข้าวเกรียบปากหม้อกุ้ง", detail: "จานเรียกน้ำย่อย", price: 240 },
      { name: "สเต๊กเนื้อสันใน", detail: "200 g · เสิร์ฟพร้อมซอสพริกไทยดำ", price: 890 },
    ],
  },
  {
    id: "soft",
    title: "ไม่มีแอลกอฮอล์",
    note: "สำหรับคนขับรถ",
    items: [
      { name: "Virgin Highball", detail: "ตะไคร้ · โซดา · มะนาว", price: 180 },
      { name: "Cold Brew Tonic", detail: "กาแฟสกัดเย็น · โทนิก", price: 200 },
      { name: "น้ำเปล่า / โซดา", detail: "ขวด", price: 90 },
    ],
  },
];
