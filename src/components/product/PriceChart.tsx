"use client";

import { useMemo, useState } from "react";
import { Target, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Point {
  date: string;
  price: number;
}

export default function PriceChart({ history, current }: { history: Point[]; current: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 160;
  const PAD = 8;

  const { data, firstLabel, lastLabel } = useMemo(() => {
    const points = history.length ? history : [];
    const all = [...points, { date: new Date().toISOString(), price: current }];
    const prices = all.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = Math.max(1, max - min);
    const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const mapped = all.map((p, i) => ({
      ...p,
      label: fmt(p.date),
      x: PAD + (i / Math.max(1, all.length - 1)) * (W - PAD * 2),
      y: H - PAD - ((p.price - min) / range) * (H - PAD * 2),
    }));
    return { data: mapped, firstLabel: mapped[0].label, lastLabel: mapped[mapped.length - 1].label };
  }, [history, current, H, W]);

  const line = data.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${W - PAD},${H - PAD}`;
  const min = Math.min(...data.map((p) => p.price));
  const max = Math.max(...data.map((p) => p.price));
  const avg = data.reduce((a, p) => a + p.price, 0) / data.length;
  const lowPct = Math.round(((current - min) / Math.max(1, max - min)) * 100);

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Price history · last {Math.max(1, data.length - 1)} weeks</p>
          <p className="font-display font-extrabold text-2xl mt-1 text-gradient">
            {hover != null ? formatPrice(data[hover].price) : formatPrice(current)}
          </p>
        </div>
        <div className="flex gap-4 text-[11px]">
          <span className="text-muted">Low <b className="text-fg">{formatPrice(min)}</b></span>
          <span className="text-muted">Avg <b className="text-fg">{formatPrice(avg)}</b></span>
          <span className="text-muted">High <b className="text-fg">{formatPrice(max)}</b></span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Price history line chart">
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#chartFill)" />
          <polyline points={line} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 6 : 3}
              fill="var(--bg)"
              stroke="var(--brand)"
              strokeWidth="2"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${p.label}: ${formatPrice(p.price)}`}</title>
            </circle>
          ))}
        </svg>
        <div className="flex justify-between text-[10px] text-muted mt-1">
          <span>{firstLabel}</span>
          <span>{lastLabel}</span>
        </div>
      </div>

      <p className="text-[11px] text-muted mt-3 flex items-center gap-1.5">
        {current <= min + 1 ? (
          <><Target size={12} className="text-emerald-700 dark:text-emerald-300 shrink-0" /> Lowest point in the tracked range.</>
        ) : lowPct <= 25 ? (
          <><TrendingDown size={12} className="text-emerald-700 dark:text-emerald-300 shrink-0" /> Near the lowest point tracked.</>
        ) : lowPct <= 60 ? (
          <><Minus size={12} className="shrink-0" /> Around the middle of the tracked range.</>
        ) : (
          <><TrendingUp size={12} className="text-amber-700 dark:text-amber-300 shrink-0" /> Above the average of the tracked range.</>
        )}
      </p>
    </div>
  );
}
