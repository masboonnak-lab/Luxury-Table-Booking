import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CheckCircle2, Printer } from "lucide-react";

import {
  formatThb2,
  receiptNumber,
  taxBreakdown,
  type ContactDraft,
} from "./booking";
import type { TableSpec, Zone } from "./floor";
import { VENUE } from "./venue";

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-[#6b6459]">{label}</dt>
      <dd className={mono ? "text-right font-mono" : "text-right"}>{value}</dd>
    </div>
  );
}

/**
 * Rendered on a light surface regardless of the page theme — a receipt is a
 * document, and it has to survive being printed on white paper.
 */
export function Receipt({
  reference,
  code,
  issuedAt,
  bookingDate,
  slot,
  guests,
  table,
  zone,
  deposit,
  contact,
  onRestart,
}: {
  reference: string;
  code: string;
  issuedAt: Date;
  bookingDate: Date;
  slot: string;
  guests: number;
  table: TableSpec;
  zone: Zone;
  deposit: number;
  contact: ContactDraft;
  onRestart: () => void;
}) {
  const tax = taxBreakdown(deposit);
  const docNo = receiptNumber(VENUE.receiptPrefix, issuedAt, code);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="grid size-12 place-content-center rounded-full bg-primary/15">
          <CheckCircle2 className="size-6 text-primary" />
        </div>
        <h3 className="mt-4 font-['Playfair_Display',serif] text-2xl">
          ชำระมัดจำเรียบร้อย
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          ส่งสำเนาใบเสร็จไปที่ {contact.email || contact.phone} แล้ว
        </p>
      </div>

      {/* Document */}
      <article
        id="tld-receipt"
        className="rounded-xl border border-[#ded6c6] bg-white p-6 text-[#1c1a16] sm:p-8"
      >
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5ddcd] pb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em]">{VENUE.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#6b6459]">
              {VENUE.legalName}
              <br />
              {VENUE.address}
              <br />
              โทร {VENUE.phone}
            </p>
            <p className="mt-2 text-xs text-[#6b6459]">
              เลขประจำตัวผู้เสียภาษี {VENUE.taxId} ({VENUE.branch})
            </p>
          </div>

          <div className="text-right">
            <h4 className="text-base font-medium">ใบเสร็จรับเงิน</h4>
            <p className="text-xs text-[#6b6459]">/ ใบกำกับภาษีอย่างย่อ</p>
            <p className="mt-3 text-xs text-[#6b6459]">เลขที่</p>
            <p className="font-mono text-sm">{docNo}</p>
            <p className="mt-2 text-xs text-[#6b6459]">วันที่ออก</p>
            <p className="text-sm tabular-nums">
              {format(issuedAt, "d MMM yyyy HH:mm", { locale: th })} น.
            </p>
          </div>
        </header>

        {/* Customer + booking */}
        <div className="grid gap-6 border-b border-[#e5ddcd] py-5 sm:grid-cols-2">
          <section>
            <h5 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#8a6d3b]">
              ข้อมูลลูกค้า
            </h5>
            <dl>
              <Row label="ชื่อ-นามสกุล" value={contact.name} />
              <Row label="โทรศัพท์" value={contact.phone} />
              {contact.email ? (
                <Row label="อีเมล" value={contact.email} />
              ) : null}
              <Row label="โอกาส" value={contact.occasion} />
            </dl>
          </section>

          <section>
            <h5 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#8a6d3b]">
              รายละเอียดการจอง
            </h5>
            <dl>
              <Row label="รหัสจอง" value={reference} mono />
              <Row
                label="วันที่"
                value={format(bookingDate, "d MMMM yyyy", { locale: th })}
              />
              <Row label="เวลา" value={`${slot} น.`} />
              <Row label="จำนวน" value={`${guests} ท่าน`} />
              <Row label="โต๊ะ" value={table.id} mono />
              <Row label="โซน" value={zone.name} />
            </dl>
          </section>
        </div>

        {/* Line items */}
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5ddcd] text-left text-xs uppercase tracking-wider text-[#6b6459]">
              <th className="pb-2 font-medium">รายการ</th>
              <th className="pb-2 text-center font-medium">จำนวน</th>
              <th className="pb-2 text-right font-medium">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f0ebe0]">
              <td className="py-3">
                เงินมัดจำสำรองโต๊ะ — {zone.name} (โต๊ะ {table.id})
                <span className="mt-0.5 block text-xs text-[#6b6459]">
                  {format(bookingDate, "d MMM yyyy", { locale: th })} เวลา{" "}
                  {slot} น. · {guests} ท่าน
                </span>
              </td>
              <td className="py-3 text-center tabular-nums">1</td>
              <td className="py-3 text-right tabular-nums">
                {formatThb2(tax.total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <dl className="w-full max-w-xs">
            <div className="flex justify-between gap-4 py-1 text-sm">
              <dt className="text-[#6b6459]">มูลค่าก่อนภาษี</dt>
              <dd className="tabular-nums">{formatThb2(tax.base)}</dd>
            </div>
            <div className="flex justify-between gap-4 py-1 text-sm">
              <dt className="text-[#6b6459]">ภาษีมูลค่าเพิ่ม 7%</dt>
              <dd className="tabular-nums">{formatThb2(tax.vat)}</dd>
            </div>
            <div className="mt-1.5 flex justify-between gap-4 border-t-2 border-[#1c1a16] pt-2 text-base font-medium">
              <dt>รวมทั้งสิ้น</dt>
              <dd className="tabular-nums">฿{formatThb2(tax.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 border-t border-[#e5ddcd] pt-4 text-xs leading-relaxed text-[#6b6459]">
          <p>
            ชำระโดย PromptPay · สถานะ{" "}
            <span className="font-medium text-[#1c1a16]">ชำระแล้ว</span>
          </p>
          <p className="mt-2">
            เงินมัดจำใช้หักเป็นส่วนลดค่าอาหารและเครื่องดื่มในวันเข้าใช้บริการ
            ยกเลิกฟรีก่อนเวลาจองอย่างน้อย 4 ชั่วโมง
          </p>
          <p className="mt-3 text-[10px]">
            เอกสารนี้ออกโดยระบบอัตโนมัติ (ตัวอย่างสำหรับ mockup — ยังไม่ใช่
            เอกสารทางภาษีที่ใช้ได้จริง)
          </p>
        </div>
      </article>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Printer className="size-4" />
          พิมพ์ / บันทึก PDF
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md border border-border px-5 py-2.5 text-sm transition-colors hover:border-primary hover:text-primary"
        >
          จองอีกครั้ง
        </button>
      </div>
    </div>
  );
}
