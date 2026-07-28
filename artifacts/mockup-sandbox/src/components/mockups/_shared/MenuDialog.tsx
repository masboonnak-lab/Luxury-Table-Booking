import { useEffect } from "react";
import { X } from "lucide-react";

import { formatThb } from "./booking";
import { MENU } from "./menu";

export function MenuDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="เมนูทั้งหมด"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-card sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-2xl">เมนูทั้งหมด</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              ราคาต่อแก้ว/จาน ยังไม่รวมภาษีมูลค่าเพิ่ม
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="-mr-1.5 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {MENU.map((section) => (
            <section key={section.id} className="mb-7 last:mb-0">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[11px] uppercase tracking-[0.28em] text-primary">
                  {section.title}
                </h3>
                {section.note ? (
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {section.note}
                  </span>
                ) : null}
              </div>

              <ul className="mt-3.5 space-y-3">
                {section.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-baseline gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 tabular-nums text-sm text-primary">
                      ฿{formatThb(item.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
