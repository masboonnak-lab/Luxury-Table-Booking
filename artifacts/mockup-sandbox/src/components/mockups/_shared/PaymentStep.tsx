import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, ScanLine, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

import { QrCodePlaceholder } from "./QrCode";
import { formatThb2, taxBreakdown, type TaxBreakdown } from "./booking";
import { VENUE } from "./venue";

function mmss(msLeft: number): string {
  const total = Math.max(0, Math.ceil(msLeft / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Countdown({
  deadline,
  onExpire,
}: {
  deadline: number;
  onExpire: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Re-sync on every deadline change; the interval is always torn down.
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  const left = deadline - now;

  useEffect(() => {
    if (left <= 0) {
      onExpire();
    }
  }, [left, onExpire]);

  const urgent = left <= 60_000;

  return (
    <span
      className={cn(
        "tabular-nums",
        urgent ? "text-destructive" : "text-primary",
      )}
    >
      {mmss(left)}
    </span>
  );
}

function AmountRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4 py-1.5 text-sm",
        strong && "border-t border-border pt-2.5 text-base font-medium",
      )}
    >
      <dt className={strong ? undefined : "text-muted-foreground"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export function PaymentStep({
  reference,
  deposit,
  deadline,
  expired,
  onExpire,
  onRenew,
  onPaid,
}: {
  reference: string;
  deposit: number;
  deadline: number;
  expired: boolean;
  onExpire: () => void;
  onRenew: () => void;
  onPaid: () => void;
}) {
  const tax: TaxBreakdown = taxBreakdown(deposit);

  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      {/* QR */}
      <div className="mx-auto w-full max-w-[260px]">
        <div
          className={cn(
            "rounded-xl border border-border bg-white p-4 transition-opacity",
            expired && "opacity-30",
          )}
        >
          <div className="mb-3 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#0f0e0d]">
              PromptPay
            </p>
            <p className="mt-0.5 text-[10px] text-[#6b6459]">
              {VENUE.legalName}
            </p>
          </div>

          <QrCodePlaceholder seed={reference} className="w-full" />

          <p className="mt-3 text-center text-[11px] tabular-nums text-[#6b6459]">
            {VENUE.promptPayId}
          </p>
        </div>

        {expired ? (
          <button
            type="button"
            onClick={onRenew}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm text-primary transition-colors hover:bg-primary/10"
          >
            <RefreshCw className="size-4" />
            ขอ QR ใหม่
          </button>
        ) : (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ScanLine className="size-3.5 text-primary" />
            สแกนด้วยแอปธนาคารเพื่อชำระ
          </p>
        )}
      </div>

      {/* Detail */}
      <div>
        <div
          className={cn(
            "mb-5 flex items-center gap-2 rounded-md border px-4 py-3 text-sm",
            expired
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border bg-card",
          )}
        >
          <AlertCircle className="size-4 shrink-0" />
          {expired ? (
            <span>QR หมดอายุแล้ว กรุณากดขอ QR ใหม่เพื่อชำระเงิน</span>
          ) : (
            <span>
              กรุณาชำระภายใน <Countdown deadline={deadline} onExpire={onExpire} />{" "}
              นาที มิฉะนั้นระบบจะปล่อยโต๊ะให้ลูกค้ารายอื่น
            </span>
          )}
        </div>

        <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
          ยอดชำระมัดจำ
        </h4>

        <dl className="mt-3">
          <AmountRow
            label="มูลค่าก่อนภาษี"
            value={`฿${formatThb2(tax.base)}`}
          />
          <AmountRow label="ภาษีมูลค่าเพิ่ม 7%" value={`฿${formatThb2(tax.vat)}`} />
          <AmountRow
            label="ยอดชำระทั้งสิ้น"
            value={`฿${formatThb2(tax.total)}`}
            strong
          />
        </dl>

        <p className="mt-4 rounded-md bg-primary/10 px-3 py-2.5 text-xs leading-relaxed text-primary">
          เงินมัดจำนี้จะถูกหักเป็นส่วนลดค่าอาหารและเครื่องดื่มในวันเข้าใช้บริการ
          และคืนเต็มจำนวนหากยกเลิกก่อนเวลาจองอย่างน้อย 4 ชั่วโมง
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          อ้างอิงการจอง <span className="font-mono text-foreground">{reference}</span>
        </p>

        <button
          type="button"
          onClick={onPaid}
          disabled={expired}
          className={cn(
            "mt-6 flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            expired
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <ShieldCheck className="size-4" />
          ฉันชำระเงินแล้ว
        </button>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          ปุ่มนี้จำลองการยืนยันจากระบบธนาคาร (mockup)
        </p>
      </div>
    </div>
  );
}
