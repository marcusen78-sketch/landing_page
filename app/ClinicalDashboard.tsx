"use client";

import { memo, useEffect, useRef, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const progress = [
  { s: 1, v: 38 }, { s: 4, v: 44 }, { s: 7, v: 53 },
  { s: 10, v: 60 }, { s: 13, v: 65 }, { s: 16, v: 70 },
  { s: 19, v: 77 }, { s: 21, v: 81 }, { s: 23, v: 84 },
];

const radar = [
  { m: "Reacción", v: 82, b: 38 },
  { m: "Precisión", v: 84, b: 35 },
  { m: "Suavidad", v: 86, b: 42 },
  { m: "Flexión", v: 74, b: 30 },
  { m: "Coord.", v: 68, b: 22 },
  { m: "Voz", v: 71, b: 28 },
];

function useAnim(target: number, dur = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3)) * 10) / 10);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, dur]);
  return v;
}

function MiniHeatmap({ w, h }: { w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = 2;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#040810");
    bg.addColorStop(1, "#060c14");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(0,200,255,0.035)";
    ctx.lineWidth = 0.3;
    for (let x = 0; x < w; x += 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 10) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    const cx = w * 0.5, cy = h * 0.5;
    ctx.strokeStyle = "rgba(0,200,255,0.06)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.setLineDash([]);

    const fixations = [
      { x: 0.73, y: 0.32, r: 0.22, i: 1.0 },
      { x: 0.64, y: 0.50, r: 0.17, i: 0.85 },
      { x: 0.82, y: 0.55, r: 0.14, i: 0.7 },
      { x: 0.50, y: 0.48, r: 0.18, i: 0.55 },
      { x: 0.56, y: 0.28, r: 0.11, i: 0.5 },
      { x: 0.70, y: 0.68, r: 0.1, i: 0.45 },
      { x: 0.24, y: 0.44, r: 0.07, i: 0.12 },
      { x: 0.30, y: 0.62, r: 0.05, i: 0.08 },
    ];

    fixations.forEach(f => {
      const fx = f.x * w, fy = f.y * h, fr = f.r * w;
      const g1 = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr * 1.3);
      g1.addColorStop(0, `rgba(255, 120, 40, ${f.i * 0.12})`);
      g1.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = g1;
      ctx.beginPath(); ctx.arc(fx, fy, fr * 1.3, 0, Math.PI * 2); ctx.fill();

      const g2 = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
      g2.addColorStop(0, `rgba(100, 255, 240, ${f.i * 0.55})`);
      g2.addColorStop(0.3, `rgba(0, 220, 220, ${f.i * 0.3})`);
      g2.addColorStop(0.6, `rgba(0, 150, 180, ${f.i * 0.1})`);
      g2.addColorStop(1, "rgba(0,100,120,0)");
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
    });

    ctx.strokeStyle = "rgba(0, 220, 255, 0.07)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    [0, 3, 1, 4, 2, 5, 0, 6].forEach((idx, i) => {
      const f = fixations[idx];
      if (i === 0) ctx.moveTo(f.x * w, f.y * h); else ctx.lineTo(f.x * w, f.y * h);
    });
    ctx.stroke();

    fixations.forEach(f => {
      if (f.i < 0.2) return;
      const dg = ctx.createRadialGradient(f.x * w, f.y * h, 0, f.x * w, f.y * h, 6);
      dg.addColorStop(0, `rgba(150, 255, 250, ${f.i * 0.4})`);
      dg.addColorStop(1, "rgba(0,200,200,0)");
      ctx.fillStyle = dg;
      ctx.fillRect(f.x * w - 6, f.y * h - 6, 12, 12);
      ctx.beginPath();
      ctx.arc(f.x * w, f.y * h, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 255, 255, ${0.5 + f.i * 0.5})`;
      ctx.fill();
    });

    ctx.font = "600 5.5px 'JetBrains Mono'";
    ctx.fillStyle = "rgba(255,80,80,0.5)";
    ctx.textAlign = "left";
    ctx.fillText("◀ NEGLECT", 4, h - 4);
    ctx.fillStyle = "rgba(0,230,220,0.4)";
    ctx.textAlign = "right";
    ctx.fillText("FOCO ▶", w - 4, h - 4);
  }, [w, h]);

  return <canvas ref={ref} style={{ width: w, height: h }} className="rounded-lg" />;
}

function MiniHand({ w, h }: { w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = 2;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#040810");
    bg.addColorStop(1, "#060c14");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(0,200,255,0.035)";
    ctx.lineWidth = 0.3;
    for (let x = 0; x < w; x += 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 10) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    const cx = w / 2, cy = h / 2 + 6;
    const wrist = { x: cx, y: cy + 38 };
    const palm = { x: cx, y: cy + 6 };

    const fingers = [
      { pts: [{ x: cx - 24, y: cy + 8 }, { x: cx - 30, y: cy - 4 }, { x: cx - 34, y: cy - 18 }], rom: 62 },
      { pts: [{ x: cx - 10, y: cy - 5 }, { x: cx - 12, y: cy - 25 }, { x: cx - 13, y: cy - 42 }], rom: 71 },
      { pts: [{ x: cx + 1, y: cy - 7 }, { x: cx + 1, y: cy - 28 }, { x: cx + 1, y: cy - 46 }], rom: 68 },
      { pts: [{ x: cx + 10, y: cy - 4 }, { x: cx + 12, y: cy - 20 }, { x: cx + 14, y: cy - 34 }], rom: 54 },
      { pts: [{ x: cx + 19, y: cy + 1 }, { x: cx + 23, y: cy - 11 }, { x: cx + 26, y: cy - 22 }], rom: 48 },
    ];

    const getColor = (rom: number): [number, number, number] =>
      rom >= 65 ? [0, 230, 220] : rom >= 55 ? [255, 180, 40] : [255, 70, 60];

    for (let i = 0; i < 35; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 8 + 2;
      const g = ctx.createRadialGradient(
        wrist.x + Math.cos(a) * d, wrist.y + Math.sin(a) * d, 0,
        wrist.x + Math.cos(a) * d, wrist.y + Math.sin(a) * d, 2
      );
      g.addColorStop(0, `rgba(0,230,220,${0.04 + Math.random() * 0.06})`);
      g.addColorStop(1, "rgba(0,200,200,0)");
      ctx.fillStyle = g;
      ctx.fillRect(wrist.x + Math.cos(a) * d - 2, wrist.y + Math.sin(a) * d - 2, 4, 4);
    }

    ctx.strokeStyle = "rgba(0,230,220,0.2)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(wrist.x, wrist.y); ctx.lineTo(palm.x, palm.y); ctx.stroke();

    fingers.forEach(f => {
      const [r, g, b] = getColor(f.rom);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.06)`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(palm.x, palm.y);
      f.pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();

      ctx.strokeStyle = `rgba(${r},${g},${b},0.45)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(palm.x, palm.y);
      f.pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();

      f.pts.forEach((p, i) => {
        const rad = i === 2 ? 3 : 2;
        const jg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 3.5);
        jg.addColorStop(0, `rgba(${r},${g},${b},0.2)`);
        jg.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = jg;
        ctx.fillRect(p.x - rad * 3.5, p.y - rad * 3.5, rad * 7, rad * 7);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = i === 2 ? `rgba(255,255,255,0.9)` : `rgba(${r},${g},${b},0.85)`;
        ctx.fill();
      });

      const tip = f.pts[2];
      ctx.font = "700 6px 'JetBrains Mono'";
      ctx.fillStyle = `rgba(${r},${g},${b},0.75)`;
      ctx.textAlign = "center";
      ctx.fillText(`${f.rom}°`, tip.x, tip.y - 8);
    });

    const wg = ctx.createRadialGradient(wrist.x, wrist.y, 0, wrist.x, wrist.y, 12);
    wg.addColorStop(0, "rgba(0,230,220,0.2)");
    wg.addColorStop(1, "rgba(0,200,200,0)");
    ctx.fillStyle = wg;
    ctx.fillRect(wrist.x - 12, wrist.y - 12, 24, 24);
    ctx.beginPath();
    ctx.arc(wrist.x, wrist.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,240,230,0.85)";
    ctx.fill();

    ctx.font = "600 5px 'JetBrains Mono'";
    ctx.fillStyle = "rgba(0,220,210,0.28)";
    ctx.textAlign = "left";
    ctx.fillText("21 LANDMARKS", 4, h - 4);
    ctx.textAlign = "right";
    ctx.fillText("TREMOR 1.4mm", w - 4, h - 4);
  }, [w, h]);

  return <canvas ref={ref} style={{ width: w, height: h }} className="rounded-lg" />;
}

function KPI({ label, value, unit }: {
  label: string; value: number; unit: string;
}) {
  const v = useAnim(value);
  const display = unit === "%" || unit === "/100" ? v.toFixed(1) : Math.round(v);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] tracking-[0.14em] uppercase font-semibold" style={{
        color: "hsl(210,10%,45%)", fontFamily: "'JetBrains Mono'"
      }}>{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-extrabold tabular-nums leading-none" style={{
          color: "hsl(195,15%,88%)", fontFamily: "'JetBrains Mono'",
        }}>{display}</span>
        <span className="text-[9px] font-medium" style={{ color: "hsl(210,8%,40%)" }}>{unit}</span>
      </div>
    </div>
  );
}

function ClinicalDashboard() {
  return (
    <div className="w-full overflow-hidden relative" style={{
      background: "linear-gradient(155deg, hsl(190,25%,10%) 0%, hsl(195,20%,7%) 100%)",
      borderRadius: 14,
      border: "1px solid hsl(190,18%,16%)",
    }}>
      <div className="absolute inset-0 rounded-[14px] pointer-events-none" style={{
        background: "linear-gradient(135deg, rgba(0,180,170,0.06), transparent 40%)",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        padding: 1,
      }} />

      <div className="relative z-10 p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: "hsl(160,90%,48%)" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "hsl(160,90%,48%)" }} />
            </span>
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{
              fontFamily: "'JetBrains Mono'",
              color: "hsl(175,60%,52%)",
            }}>
              Session #23 — Carmen D.R.
            </span>
          </div>
          <span className="text-[9px] font-mono" style={{ color: "hsl(215,10%,35%)" }}>28/04/2026</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <KPI label="Reaction" value={198} unit="ms" />
          <KPI label="Smoothness" value={86.2} unit="/100" />
          <KPI label="Precision" value={84} unit="%" />
          <KPI label="Tremor" value={1.4} unit="mm" />
        </div>

        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(215,20%,16%), hsl(175,60%,20%), hsl(215,20%,16%), transparent)" }} />

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { title: "Eye fixation", comp: <MiniHeatmap w={160} h={110} /> },
            { title: "Hand tracking · CV", comp: <MiniHand w={160} h={110} /> },
            {
              title: "Functional profile",
              comp: (
                <div style={{ width: "100%", height: 110 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radar} cx="50%" cy="52%" outerRadius="60%">
                      <PolarGrid stroke="hsl(190,15%,14%)" />
                      <PolarAngleAxis dataKey="m" tick={{ fontSize: 6, fill: "hsl(190,10%,40%)", fontFamily: "'JetBrains Mono'" }} />
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                      <Radar dataKey="b" stroke="hsl(215,10%,22%)" fill="hsl(215,10%,22%)" fillOpacity={0.06} strokeWidth={0.8} strokeDasharray="3 3" />
                      <Radar dataKey="v" stroke="hsl(175,100%,48%)" fill="hsl(175,100%,48%)" fillOpacity={0.1} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ),
            },
          ].map(({ title, comp }) => (
            <div key={title} className="rounded-lg overflow-hidden" style={{
              background: "hsl(192,20%,6%)",
              border: "1px solid hsl(190,15%,13%)",
            }}>
              <div className="px-2.5 py-1.5">
                <span className="text-[7px] font-semibold tracking-[0.12em] uppercase" style={{
                  color: "hsl(175,80%,42%)", fontFamily: "'JetBrains Mono'"
                }}>{title}</span>
              </div>
              <div className="flex justify-center">{comp}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg p-2.5" style={{
          background: "hsl(192,20%,6%)",
          border: "1px solid hsl(190,15%,13%)",
        }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[7px] font-semibold tracking-[0.12em] uppercase" style={{
              color: "hsl(175,80%,42%)", fontFamily: "'JetBrains Mono'"
            }}>Progress — 23 sessions</span>
            <span className="text-[9px] font-mono font-bold" style={{ color: "hsl(195,15%,72%)" }}>
              ↑ +46 pts
            </span>
          </div>
          <div style={{ height: 50 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(175,100%,48%)" stopOpacity={0.25} />
                    <stop offset="50%" stopColor="hsl(200,80%,45%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(220,60%,30%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="s" hide />
                <YAxis hide domain={[0, 100]} />
                <Area type="monotone" dataKey="v" stroke="hsl(175,100%,48%)" fill="url(#sparkGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex justify-between pt-0.5">
          <span className="text-[7px] font-mono" style={{ color: "hsl(215,10%,28%)" }}>FixedGap Clinical v2.4</span>
          <span className="text-[7px] font-mono" style={{ color: "hsl(215,10%,28%)" }}>Webcam · Tobii Nano · Mic</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ClinicalDashboard);
