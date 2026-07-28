/**
 * End-to-end exercise of the booking flow against a running server and a real
 * database. Not part of `pnpm run check`, which must stay runnable with no
 * database: start the API, then
 *
 *   pnpm --filter @workspace/api-server run check:flow
 *
 * It writes real rows. Point API_URL at a scratch database, never production.
 */
const A = (process.env.API_URL ?? "http://127.0.0.1:5100") + "/api";
let cookie = "";

async function call(method, path, body) {
  const res = await fetch(A + path, {
    method,
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) {
    cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  }
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text.slice(0, 120);
  }
  return { status: res.status, body: json };
}

let failures = 0;
function expect(label, actual, wanted) {
  const ok = actual === wanted;
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"} ${label} — got ${actual}, want ${wanted}`);
}

const SLOT = "21:00";

/**
 * Its own night per run. Runs share a database, and the run leaves one paid
 * booking behind on purpose (the duplicate-slip case needs a second order), so
 * a fixed date meant the next run found that table already taken.
 */
const DATE = (() => {
  // Relative to today and inside the 120-day booking window. A fixed base date
  // drifted past that window as time passed and every booking 400'd.
  const base = new Date();
  base.setUTCDate(base.getUTCDate() + 7 + Number(process.hrtime.bigint() % 80n));
  return base.toISOString().slice(0, 10);
})();
console.log(`booking night for this run: ${DATE}`);

/**
 * A fresh member every run. The first version reused one account and changed
 * its password at the end, so the second run signed in with a password that no
 * longer existed and failed for a reason that had nothing to do with the code.
 */
const uniq = process.hrtime.bigint().toString().slice(-8);
const PHONE = `09${uniq}`;
const EMAIL = `flow-${uniq}@example.com`;
const PASSWORD = "hunter2hunter";

console.log("\n— register the member this run books as —");
const signup = await call("POST", "/auth/register", {
  name: "สมชาย ใจดี",
  phone: PHONE,
  email: EMAIL,
  password: PASSWORD,
  pdpaConsent: true,
});
expect("registered", signup.status, 201);
console.log(`  ${PHONE} · ${EMAIL} · role ${signup.body.role}`);

console.log("\n— availability before —");
const before = await call("GET", `/availability?date=${DATE}&slot=${SLOT}&guests=4`);
const freeBefore = before.body.freeTables;
console.log(`  ${freeBefore} tables free`);

console.log("\n— book T3 —");
const booking = await call("POST", "/bookings", {
  bookerName: "สมชาย ใจดี",
  phone: PHONE,
  email: EMAIL,
  guests: 4,
  date: DATE,
  slot: SLOT,
  tableId: "T3",
  occasion: "วันเกิด",
});
expect("created", booking.status, 201);
const code = booking.body.code;
console.log(`  code ${code} · amount B${booking.body.amount} (base ${booking.body.amountBase} + vat ${booking.body.amountVat}) · status ${booking.body.status}`);
console.log(`  zone ${booking.body.zoneName} · holds until ${booking.body.holdExpiresAt}`);

console.log("\n— the same table again —");
const clash = await call("POST", "/bookings", {
  bookerName: "คนอื่น", phone: "0899998888", email: "x@example.com",
  guests: 4, date: DATE, slot: SLOT, tableId: "T3",
});
expect("second booking rejected", clash.status, 409);
console.log(`  ${clash.body.error}: ${clash.body.message}`);

console.log("\n— availability after —");
const after = await call("GET", `/availability?date=${DATE}&slot=${SLOT}&guests=4`);
expect("one fewer table free", after.body.freeTables, freeBefore - 1);

console.log("\n— party too large for the table —");
const tooBig = await call("POST", "/bookings", {
  bookerName: "กลุ่มใหญ่", phone: "0866667777", email: "y@example.com",
  guests: 12, date: DATE, slot: SLOT, tableId: "T4",
});
expect("rejected", tooBig.status, 400);
console.log(`  ${tooBig.body.message}`);

console.log("\n— booking in the past —");
const past = await call("POST", "/bookings", {
  bookerName: "ย้อนเวลา", phone: "0866667777", email: "y@example.com",
  guests: 2, date: "2020-01-01", slot: SLOT, tableId: "T5",
});
expect("rejected", past.status, 400);

console.log("\n— pay with a slip —");
// A fresh hash each run: the duplicate check is real, so a fixed one would
// fail on the second run for the right reason and look like a bug.
const stamp = process.hrtime.bigint().toString(16).padStart(16, "0");
const hash = (stamp + "0".repeat(64)).slice(0, 64);
const paid = await call("POST", `/orders/${code}/slip`, {
  hash, fileName: "slip.png", sizeBytes: 120_000,
});
expect("accepted", paid.status, 200);
console.log(`  order now ${paid.body.order.status} · slip ${paid.body.slipStatus} · pendingBankCheck ${paid.body.pendingBankCheck}`);

console.log("\n— same slip image on another booking —");
const second = await call("POST", "/bookings", {
  bookerName: "อีกคน", phone: "0855554444", email: "z@example.com",
  guests: 2, date: DATE, slot: SLOT, tableId: "T6",
});
const reused = await call("POST", `/orders/${second.body.code}/slip`, {
  hash, fileName: "slip-copy.png", sizeBytes: 120_000,
});
expect("duplicate slip rejected", reused.status, 409);
console.log(`  ${reused.body.error}: ${reused.body.message}`);

console.log("\n— paying twice —");
const twice = await call("POST", `/orders/${code}/slip`, {
  hash: ("f" + stamp + "0".repeat(64)).slice(0, 64), fileName: "again.png", sizeBytes: 1000,
});
expect("rejected", twice.status, 409);

console.log("\n— cancel with the wrong phone —");
const wrongPhone = await call("POST", `/orders/${code}/cancel`, { phone: "0800000000" });
expect("refused", wrongPhone.status, 403);

console.log("\n— cancel with the right phone —");
const cancelled = await call("POST", `/orders/${code}/cancel`, { phone: PHONE });
expect("cancelled", cancelled.status, 200);
console.log(`  status ${cancelled.body.status}`);

console.log("\n— the table is free again —");
const freed = await call("GET", `/availability?date=${DATE}&slot=${SLOT}&guests=4`);
expect("T3 released", freed.body.tables.find((t) => t.id === "T3").free, true);

console.log("\n— my orders, signed in —");
await call("POST", "/auth/login", { phone: PHONE, password: PASSWORD });
const mine = await call("GET", "/me/orders");
expect("listed", mine.status, 200);
console.log(`  ${mine.body.length} order(s): ${mine.body.map((o) => `${o.code}=${o.status}`).join(", ")}`);

console.log("\n— change my profile —");
const profile = await call("PATCH", "/auth/me", { name: "สมชาย ใจดีมาก" });
expect("updated", profile.status, 200);
console.log(`  name is now ${profile.body.name}`);

console.log("\n— change my password —");
const pw = await call("POST", "/auth/password", {
  currentPassword: PASSWORD,
  newPassword: "correct-horse-battery",
});
expect("changed", pw.status, 204);
const oldPw = await call("POST", "/auth/login", { phone: PHONE, password: PASSWORD });
expect("old password refused", oldPw.status, 401);
const newPw = await call("POST", "/auth/login", { phone: PHONE, password: "correct-horse-battery" });
expect("new password works", newPw.status, 200);

console.log(
  failures === 0 ? "\nALL FLOW CHECKS PASSED" : `\n${failures} FLOW CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
