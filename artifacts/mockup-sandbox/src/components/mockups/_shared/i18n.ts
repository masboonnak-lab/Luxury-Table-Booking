/** Every user-facing string, in both languages the venue serves. */

export type Lang = "th" | "en";

export const STRINGS = {
  th: {
    // Header / drawer
    menu: "เมนู",
    close: "ปิด",
    login: "เข้าสู่ระบบ",
    register: "สมัครสมาชิก",
    logout: "ออกจากระบบ",
    language: "เลือกภาษา",
    thai: "ไทย",
    english: "อังกฤษ",
    theme: "ธีมสี",
    textSize: "ขนาดตัวอักษร",
    loggedInAs: "เข้าสู่ระบบในชื่อ",

    // Menu tiles
    myTickets: "ตั๋วของฉัน",
    myTicketsDesc: "ประวัติการจองและบัตรทั้งหมด",
    buyTicket: "ซื้อตั๋วเข้างาน",
    buyTicketDesc: "คอนเสิร์ต ดีเจ เฟสติวัล",
    contact: "ช่องทางการติดต่อ",
    contactDesc: "ติดต่อร้านและแจ้งปัญหา",
    bookTable: "จองโต๊ะล่วงหน้า",
    bookTableDesc: "เลือกโต๊ะและชำระมัดจำ",
    location: "โลเคชั่น",
    locationDesc: "แผนที่และการเดินทาง",
    terms: "ข้อตกลงและเงื่อนไข",
    termsDesc: "กฎร้านและนโยบาย",

    // PDPA
    consentTitle: "ความยินยอมในการเก็บข้อมูลส่วนบุคคล",
    consentBody:
      "เมื่อกดยืนยัน ถือว่าท่านยินยอมให้ร้านสามารถจัดเก็บและใช้ข้อมูลส่วนบุคคล เพื่ออำนวยความสะดวกในการจองครั้งถัดไปตามนโยบายความเป็นส่วนตัว",
    confirm: "ยืนยัน",
    cancel: "ยกเลิก",

    // Auth fields
    name: "ชื่อ",
    fullName: "ชื่อผู้จอง",
    phone: "เบอร์โทรศัพท์",
    password: "รหัสผ่าน",
    loginWithLine: "เข้าสู่ระบบด้วย LINE",
    noAccount: "ยังไม่มีบัญชี?",
    haveAccount: "มีบัญชีอยู่แล้ว?",

    // Booking / tickets
    guests: "จำนวนคน",
    tickets: "จำนวนบัตร",
    bookingDate: "วันที่จอง",
    contactPhone: "เบอร์โทรศัพท์ติดต่อ",
    holdTime: "ระยะเวลามาเอาโต๊ะ",
    holdAck: "ข้าพเจ้ารับทราบว่าต้องมารับโต๊ะไม่เกิน {time} น.",
    next: "ถัดไป",
    back: "ย้อนกลับ",
    selectTable: "เลือกโต๊ะ",
    tableNo: "เลขที่โต๊ะ",
    zone: "โซน",
    summary: "สรุปรายละเอียดการจอง",
    conditions: "เงื่อนไขการจอง",
    bookerName: "ชื่อผู้จอง",

    // Payment
    payment: "ชำระเงิน",
    payWithin: "ชำระภายใน",
    minutes: "นาที",
    qrPromptpay: "QR PromptPay",
    mobileBanking: "Mobile Banking",
    uploadSlip: "อัปโหลดสลิปโอนเงิน",
    slipHint: "ระบบจะตรวจสอบว่าสลิปนี้เคยถูกใช้แล้วหรือไม่",
    slipDuplicate: "สลิปนี้เคยถูกใช้ยืนยันการชำระเงินแล้ว",
    slipAccepted: "ตรวจสอบสลิปเรียบร้อย",
    confirmPayment: "ยืนยันการชำระเงิน",
    expired: "หมดเวลาชำระเงิน",
    renew: "ขอ QR ใหม่",
    amount: "ยอดชำระ",

    // Result
    bookingSuccess: "จองสำเร็จ",
    ticketSuccess: "ซื้อบัตรสำเร็จ",
    savedToMyTickets: "บันทึกไว้ในเมนู ตั๋วของฉัน แล้ว",
    bookingNo: "เลขที่การจอง",
    showAtDoor: "แสดง QR นี้ที่หน้าประตู",
    backHome: "กลับหน้าแรก",

    // My tickets
    tabBookings: "ประวัติการจอง",
    tabTickets: "ประวัติการซื้อบัตร",
    noRecords: "ยังไม่มีรายการ",
    viewDetail: "ดูรายละเอียด",

    // Events
    allEvents: "กิจกรรมทั้งหมด",
    selectEvent: "เลือกกิจกรรม",
    perTicket: "ต่อใบ",
    soldOut: "บัตรหมด",

    // Contact / chatbot
    contactChannels: "ช่องทางติดต่อ",
    reportIssue: "แจ้งปัญหาการใช้งาน",
    openChatbot: "เข้าสู่ระบบแชทบอท",
    chatbotTitle: "ผู้ช่วยอัตโนมัติ",
    chatbotGreeting: "สวัสดีค่ะ เลือกคำถามที่ต้องการทราบได้เลยค่ะ",
    askAdmin: "ส่งต่อให้เจ้าหน้าที่",
    adminHandoff:
      "ส่งเรื่องให้เจ้าหน้าที่แล้วค่ะ ทีมงานจะติดต่อกลับทาง LINE ภายใน 15 นาที",
    otherQuestion: "คำถามอื่น",

    // Location
    openInMaps: "เปิดใน Google Maps",

    // Footer
    followUs: "ติดตามเรา",
    allRights: "สงวนลิขสิทธิ์",

    // Validation
    required: "กรุณากรอกข้อมูล",
    invalidPhone: "เบอร์โทรไม่ถูกต้อง (ขึ้นต้นด้วย 0 และมี 9–10 หลัก)",
    passwordShort: "รหัสผ่านอย่างน้อย 6 ตัวอักษร",
    mustAckHold: "ต้องยืนยันเวลารับโต๊ะก่อนจึงจะจองได้",
    mustConsent: "ต้องให้ความยินยอมก่อน",
    pickTable: "กรุณาเลือกโต๊ะ",
    tableTaken: "โต๊ะนี้ถูกจองแล้ว กรุณาเลือกโต๊ะใหม่",
    mockNotice: "ข้อมูลทั้งหมดเป็นข้อมูลจำลองสำหรับ mockup เท่านั้น",
  },

  en: {
    menu: "Menu",
    close: "Close",
    login: "Sign in",
    register: "Create account",
    logout: "Sign out",
    language: "Language",
    thai: "Thai",
    english: "English",
    theme: "Colour theme",
    textSize: "Text size",
    loggedInAs: "Signed in as",

    myTickets: "My Tickets",
    myTicketsDesc: "Bookings and event tickets",
    buyTicket: "Buy Event Tickets",
    buyTicketDesc: "Concerts, DJs, festivals",
    contact: "Contact Us",
    contactDesc: "Reach the venue or report an issue",
    bookTable: "Book a Table",
    bookTableDesc: "Pick a table and pay the deposit",
    location: "Location",
    locationDesc: "Map and directions",
    terms: "Terms & Conditions",
    termsDesc: "House rules and policies",

    consentTitle: "Personal Data Consent",
    consentBody:
      "By confirming, you consent to the venue collecting and using your personal data to make future bookings easier, in accordance with our privacy policy.",
    confirm: "Confirm",
    cancel: "Cancel",

    name: "Name",
    fullName: "Full name",
    phone: "Phone number",
    password: "Password",
    loginWithLine: "Continue with LINE",
    noAccount: "No account yet?",
    haveAccount: "Already have an account?",

    guests: "Guests",
    tickets: "Tickets",
    bookingDate: "Date",
    contactPhone: "Contact number",
    holdTime: "Table pick-up time",
    holdAck: "I understand the table must be claimed by {time}.",
    next: "Next",
    back: "Back",
    selectTable: "Select a table",
    tableNo: "Table",
    zone: "Zone",
    summary: "Booking summary",
    conditions: "Booking conditions",
    bookerName: "Booked by",

    payment: "Payment",
    payWithin: "Pay within",
    minutes: "min",
    qrPromptpay: "QR PromptPay",
    mobileBanking: "Mobile Banking",
    uploadSlip: "Upload transfer slip",
    slipHint: "We check whether this slip has already been used.",
    slipDuplicate: "This slip has already been used for a payment.",
    slipAccepted: "Slip verified",
    confirmPayment: "Confirm payment",
    expired: "Payment window expired",
    renew: "Get a new QR",
    amount: "Amount due",

    bookingSuccess: "Booking confirmed",
    ticketSuccess: "Tickets purchased",
    savedToMyTickets: "Saved to My Tickets",
    bookingNo: "Booking number",
    showAtDoor: "Show this QR at the door",
    backHome: "Back to home",

    tabBookings: "Table bookings",
    tabTickets: "Event tickets",
    noRecords: "Nothing here yet",
    viewDetail: "View",

    allEvents: "All events",
    selectEvent: "Choose an event",
    perTicket: "per ticket",
    soldOut: "Sold out",

    contactChannels: "Contact channels",
    reportIssue: "Report a problem",
    openChatbot: "Open the chatbot",
    chatbotTitle: "Automated assistant",
    chatbotGreeting: "Hi! Pick a question below.",
    askAdmin: "Talk to a person",
    adminHandoff:
      "Passed to our team — they will reply on LINE within 15 minutes.",
    otherQuestion: "Another question",

    openInMaps: "Open in Google Maps",

    followUs: "Follow us",
    allRights: "All rights reserved",

    required: "This field is required",
    invalidPhone: "Invalid phone number (must start with 0, 9–10 digits)",
    passwordShort: "Password must be at least 6 characters",
    mustAckHold: "You must acknowledge the pick-up time to book",
    mustConsent: "Consent is required",
    pickTable: "Please select a table",
    tableTaken: "That table is taken — please pick another",
    mockNotice: "All data here is mock data for this prototype only.",
  },
} as const;

export type StringKey = keyof (typeof STRINGS)["th"];

export function translate(
  lang: Lang,
  key: StringKey,
  vars?: Record<string, string>,
): string {
  let out: string = STRINGS[lang][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{${k}}`).join(v);
    }
  }
  return out;
}
