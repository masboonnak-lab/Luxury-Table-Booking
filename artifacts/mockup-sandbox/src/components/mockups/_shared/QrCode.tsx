const SIZE = 29;

function seedHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Structural areas of a real QR symbol — kept clear of pseudo-random fill. */
function isReserved(r: number, c: number): boolean {
  const topLeft = r < 9 && c < 9;
  const topRight = r < 9 && c >= SIZE - 8;
  const bottomLeft = r >= SIZE - 8 && c < 9;
  return topLeft || topRight || bottomLeft || r === 6 || c === 6;
}

function buildMatrix(seed: string): Array<Array<boolean>> {
  const m: Array<Array<boolean>> = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => false),
  );

  function finder(row: number, col: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const ring = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        m[row + r][col + c] = ring || core;
      }
    }
  }

  finder(0, 0);
  finder(0, SIZE - 7);
  finder(SIZE - 7, 0);

  for (let i = 8; i < SIZE - 8; i++) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
  }

  let h = seedHash(seed);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (isReserved(r, c)) {
        continue;
      }
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      m[r][c] = ((h >>> 13) & 1) === 1;
    }
  }

  return m;
}

/**
 * A visual stand-in, NOT a scannable code — it carries no EMVCo/PromptPay
 * payload. Rendering a real payload here would point a real banking app at a
 * real account, which a mockup must never do. See the note in BookingFlow for
 * how to swap in a genuine one.
 */
export function QrCodePlaceholder({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const matrix = buildMatrix(seed);

  return (
    <svg
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      role="img"
      aria-label="ตัวอย่างคิวอาร์โค้ดสำหรับชำระเงิน"
      className={className}
      shapeRendering="crispEdges"
    >
      <rect
        x={-2}
        y={-2}
        width={SIZE + 4}
        height={SIZE + 4}
        fill="#ffffff"
      />
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill="#0f0e0d"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
