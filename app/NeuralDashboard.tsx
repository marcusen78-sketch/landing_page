"use client";

import { memo, useEffect, useRef, useState } from "react";

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

function HandVis({ w, h }: { w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = 2;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);

    const ox = w * 0.5, oy = h * 0.55;
    const wrist = { x: ox, y: oy + 58 };
    const palmBase = { x: ox, y: oy + 20 };
    const palmTop = { x: ox, y: oy - 5 };

    const fingers = [
      { label: "I", rom: 62, joints: [{ x: ox - 30, y: oy + 15 }, { x: ox - 40, y: oy }, { x: ox - 48, y: oy - 16 }, { x: ox - 52, y: oy - 30 }] },
      { label: "II", rom: 88, joints: [{ x: ox - 12, y: oy - 8 }, { x: ox - 15, y: oy - 30 }, { x: ox - 17, y: oy - 48 }, { x: ox - 18, y: oy - 64 }] },
      { label: "III", rom: 82, joints: [{ x: ox + 1, y: oy - 10 }, { x: ox + 1, y: oy - 34 }, { x: ox + 1, y: oy - 54 }, { x: ox + 1, y: oy - 72 }] },
      { label: "IV", rom: 71, joints: [{ x: ox + 14, y: oy - 6 }, { x: ox + 17, y: oy - 26 }, { x: ox + 19, y: oy - 42 }, { x: ox + 20, y: oy - 56 }] },
      { label: "V", rom: 48, joints: [{ x: ox + 25, y: oy + 2 }, { x: ox + 30, y: oy - 12 }, { x: ox + 34, y: oy - 24 }, { x: ox + 36, y: oy - 34 }] },
    ];

    const getColor = (rom: number): [number, number, number] =>
      rom >= 80 ? [110, 195, 175] : rom >= 60 ? [195, 175, 100] : [195, 120, 100];

    let frame = 0;
    const draw = () => {
      frame++;
      const t = frame * 0.012;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(150,175,185,0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wrist.x - 18, wrist.y);
      ctx.quadraticCurveTo(ox - 35, oy + 5, fingers[0].joints[0].x, fingers[0].joints[0].y);
      ctx.lineTo(fingers[0].joints[3].x, fingers[0].joints[3].y);
      ctx.moveTo(wrist.x + 18, wrist.y);
      ctx.quadraticCurveTo(ox + 30, oy + 5, fingers[4].joints[0].x, fingers[4].joints[0].y);
      ctx.lineTo(fingers[4].joints[3].x, fingers[4].joints[3].y);
      ctx.stroke();

      const palmGrad = ctx.createRadialGradient(ox, oy + 10, 0, ox, oy + 10, 50);
      palmGrad.addColorStop(0, "rgba(130,165,175,0.12)");
      palmGrad.addColorStop(1, "rgba(130,165,175,0)");
      ctx.fillStyle = palmGrad;
      ctx.beginPath();
      ctx.ellipse(ox, oy + 10, 38, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(150,180,185,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wrist.x, wrist.y);
      ctx.lineTo(palmBase.x, palmBase.y);
      ctx.stroke();

      fingers.forEach((f, fi) => {
        const [r, g, b] = getColor(f.rom);
        const phase = t * 1.3 + fi * 0.7;
        const breathe = Math.sin(phase) * 0.4;
        const allPts = [palmTop, ...f.joints];

        for (let s = 0; s < allPts.length - 1; s++) {
          const p0 = allPts[s];
          const p1 = allPts[s + 1];
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.08 + breathe * 0.02})`;
          ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.45 + breathe * 0.1})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        }

        f.joints.forEach((j, ji) => {
          const isTip = ji === 3;
          const rad = isTip ? 4 : 3;
          const jointPulse = 1 + Math.sin(phase + ji) * 0.06;
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.18 + breathe * 0.04})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(j.x, j.y, rad * 2.5 * jointPulse, 0, Math.PI * 2); ctx.stroke();
          const jg = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, rad * 3);
          jg.addColorStop(0, `rgba(${r},${g},${b},${0.18})`);
          jg.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = jg;
          ctx.beginPath(); ctx.arc(j.x, j.y, rad * 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(j.x, j.y, rad * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = isTip ? `rgba(220,230,235,0.95)` : `rgba(${r},${g},${b},0.85)`;
          ctx.fill();
        });

        const tip = f.joints[3];
        ctx.font = "700 7px 'JetBrains Mono'";
        ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
        ctx.textAlign = "center";
        ctx.fillText(`${f.rom}°`, tip.x, tip.y - 9);
        ctx.font = "500 5px 'JetBrains Mono'";
        ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
        ctx.fillText(f.label, tip.x, tip.y - 16);
      });

      const wg = ctx.createRadialGradient(wrist.x, wrist.y, 0, wrist.x, wrist.y, 8);
      wg.addColorStop(0, "rgba(130,170,175,0.1)");
      wg.addColorStop(1, "rgba(130,170,175,0)");
      ctx.fillStyle = wg;
      ctx.beginPath(); ctx.arc(wrist.x, wrist.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(wrist.x, wrist.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(140,185,180,0.5)";
      ctx.fill();

      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2 + t * 0.3;
        const d = 6 + Math.sin(t * 2 + i * 0.8) * 3;
        ctx.beginPath(); ctx.arc(wrist.x + Math.cos(a) * d, wrist.y + Math.sin(a) * d, 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,175,185,${0.08 + Math.sin(t + i) * 0.04})`;
        ctx.fill();
      }

      fingers.forEach((f, fi) => {
        if (fi === 0 || fi === 4) return;
        const mcp = f.joints[0];
        const pip = f.joints[1];
        const angle1 = Math.atan2(palmTop.y - mcp.y, palmTop.x - mcp.x);
        const angle2 = Math.atan2(pip.y - mcp.y, pip.x - mcp.x);
        ctx.strokeStyle = `rgba(${getColor(f.rom).join(",")},0.12)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(mcp.x, mcp.y, 6, angle2, angle1); ctx.stroke();
      });

      ctx.font = "600 6px 'JetBrains Mono'";
      ctx.fillStyle = "rgba(150,170,180,0.45)";
      ctx.textAlign = "left";
      ctx.fillText("21 LANDMARKS", 4, h - 4);
      ctx.textAlign = "right";
      ctx.fillText("TREMOR 1.4mm", w - 4, h - 4);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [w, h]);

  return <canvas ref={ref} style={{ width: w, height: h }} className="rounded-lg" />;
}

function EyeVis({ w, h }: { w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = 2;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx = w * 0.5, cy = h * 0.48;
    const irisR = Math.min(w, h) * 0.28;
    const saccades = [
      { x: 0.3, y: 0.35 }, { x: 0.7, y: 0.3 }, { x: 0.65, y: 0.55 },
      { x: 0.4, y: 0.6 }, { x: 0.55, y: 0.4 }, { x: 0.75, y: 0.65 },
      { x: 0.35, y: 0.5 }, { x: 0.6, y: 0.35 },
    ];

    let frame = 0;
    const draw = () => {
      frame++;
      const t = frame * 0.01;
      ctx.clearRect(0, 0, w, h);

      const pupilDilation = 0.38 + Math.sin(t * 0.6) * 0.08;
      const pupilR = irisR * pupilDilation;
      const eyeX = cx + Math.sin(t * 0.4) * 2;
      const eyeY = cy + Math.cos(t * 0.3) * 1.5;

      ctx.strokeStyle = "rgba(150,175,185,0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(eyeX - irisR * 1.6, eyeY);
      ctx.quadraticCurveTo(eyeX, eyeY - irisR * 1.1, eyeX + irisR * 1.6, eyeY);
      ctx.quadraticCurveTo(eyeX, eyeY + irisR * 1.1, eyeX - irisR * 1.6, eyeY);
      ctx.stroke();

      const irisGlow = ctx.createRadialGradient(eyeX, eyeY, irisR * 0.5, eyeX, eyeY, irisR * 1.2);
      irisGlow.addColorStop(0, "rgba(80,130,120,0.18)");
      irisGlow.addColorStop(1, "rgba(80,130,120,0)");
      ctx.fillStyle = irisGlow;
      ctx.beginPath(); ctx.arc(eyeX, eyeY, irisR * 1.2, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = "rgba(100,160,145,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(eyeX, eyeY, irisR, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(100,160,145,0.18)";
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(eyeX, eyeY, irisR * 0.75, 0, Math.PI * 2); ctx.stroke();

      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const innerR = pupilR + 2;
        const outerR = irisR - 1;
        const wobble = Math.sin(a * 3 + t) * 0.5;
        ctx.strokeStyle = `rgba(100,155,140,${0.12 + Math.sin(a * 5 + t * 0.5) * 0.05})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(eyeX + Math.cos(a) * innerR, eyeY + Math.sin(a) * innerR);
        ctx.lineTo(eyeX + Math.cos(a + wobble * 0.02) * outerR, eyeY + Math.sin(a + wobble * 0.02) * outerR);
        ctx.stroke();
      }

      const pupilGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, pupilR);
      pupilGrad.addColorStop(0, "rgba(8,12,18,0.9)");
      pupilGrad.addColorStop(0.7, "rgba(15,20,28,0.85)");
      pupilGrad.addColorStop(1, "rgba(30,45,50,0.6)");
      ctx.fillStyle = pupilGrad;
      ctx.beginPath(); ctx.arc(eyeX, eyeY, pupilR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(100,160,145,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(eyeX, eyeY, pupilR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(eyeX - pupilR * 0.3, eyeY - pupilR * 0.3, pupilR * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,220,225,0.45)";
      ctx.fill();

      ctx.strokeStyle = "rgba(150,175,185,0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(eyeX - pupilR, eyeY); ctx.lineTo(eyeX - irisR * 1.4, eyeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eyeX + pupilR, eyeY); ctx.lineTo(eyeX + irisR * 1.4, eyeY); ctx.stroke();
      ctx.setLineDash([]);

      const diamMm = (3.2 + Math.sin(t * 0.6) * 0.6).toFixed(1);
      ctx.font = "700 6px 'JetBrains Mono'";
      ctx.fillStyle = "rgba(150,180,175,0.7)";
      ctx.textAlign = "center";
      ctx.fillText(`⌀ ${diamMm}mm`, eyeX, eyeY + irisR + 14);

      ctx.strokeStyle = "rgba(130,165,155,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const trailProgress = (t * 0.15) % 1;
      const numPts = Math.floor(trailProgress * saccades.length) + 2;
      for (let i = 0; i < Math.min(numPts, saccades.length); i++) {
        const s = saccades[i];
        const sx = eyeX + (s.x - 0.5) * irisR * 1.2;
        const sy = eyeY + (s.y - 0.5) * irisR * 1.2;
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      for (let i = 0; i < Math.min(numPts, saccades.length); i++) {
        const s = saccades[i];
        const sx = eyeX + (s.x - 0.5) * irisR * 1.2;
        const sy = eyeY + (s.y - 0.5) * irisR * 1.2;
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(130,170,160,0.35)";
        ctx.fill();
      }

      ctx.font = "600 6.5px 'JetBrains Mono'";
      ctx.fillStyle = "rgba(150,170,180,0.5)";
      ctx.textAlign = "left";
      ctx.fillText("SACCADE 8pts", 4, h - 4);
      ctx.textAlign = "right";
      ctx.fillText("198ms REACT.", w - 4, h - 4);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [w, h]);

  return <canvas ref={ref} style={{ width: w, height: h }} className="rounded-lg" />;
}

function VoiceVis({ w, h }: { w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = 2;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cols = 80;
    const bands = 24;
    const spectroData: number[][] = [];
    for (let col = 0; col < cols; col++) {
      const column: number[] = [];
      for (let band = 0; band < bands; band++) {
        const freq = band / bands;
        const f1 = Math.exp(-Math.pow((freq - 0.15) / 0.06, 2));
        const f2 = Math.exp(-Math.pow((freq - 0.35) / 0.08, 2));
        const f3 = Math.exp(-Math.pow((freq - 0.6) / 0.1, 2));
        const base = (f1 * 0.9 + f2 * 0.6 + f3 * 0.35);
        const variation = Math.sin(col * 0.3 + band * 0.5) * 0.3 + Math.sin(col * 0.7) * 0.2;
        const voiced = Math.sin(col * 0.15) > -0.3 ? 1 : 0.15;
        column.push(Math.max(0, Math.min(1, (base + variation * 0.3) * voiced)));
      }
      spectroData.push(column);
    }

    let frame = 0;
    const draw = () => {
      frame++;
      const t = frame * 0.02;
      ctx.clearRect(0, 0, w, h);

      const spectroH = h * 0.55;
      const waveH = h * 0.30;
      const spectroY = 4;
      const waveY = spectroH + 12;
      const colW = w / cols;
      const bandH = spectroH / bands;
      const scrollOffset = Math.floor(t * 3) % cols;

      for (let col = 0; col < cols; col++) {
        const dataCol = (col + scrollOffset) % cols;
        for (let band = 0; band < bands; band++) {
          const val = spectroData[dataCol][band];
          const pulse = val * (0.85 + Math.sin(t * 0.5 + col * 0.1) * 0.15);
          if (pulse < 0.05) continue;
          const freqRatio = band / bands;
          let r: number, g: number, b: number;
          if (freqRatio < 0.3) { r = 170; g = 140 + pulse * 40; b = 100; }
          else if (freqRatio < 0.6) { r = 130; g = 165 + pulse * 20; b = 155; }
          else { r = 120; g = 150; b = 170 + pulse * 20; }
          ctx.fillStyle = `rgba(${r},${g},${b},${pulse * 0.65})`;
          ctx.fillRect(col * colW + 0.5, spectroY + (bands - 1 - band) * bandH + 0.5, colW - 1, bandH - 0.5);
        }
      }

      ctx.font = "500 4.5px 'JetBrains Mono'";
      ctx.fillStyle = "rgba(150,170,180,0.4)";
      ctx.textAlign = "right";
      ctx.fillText("4kHz", w - 3, spectroY + 6);
      ctx.fillText("2kHz", w - 3, spectroY + spectroH * 0.4);
      ctx.fillText("500", w - 3, spectroY + spectroH * 0.75);
      ctx.fillText("Hz", w - 3, spectroY + spectroH - 2);

      const waveMid = waveY + waveH / 2;
      ctx.strokeStyle = "rgba(150,175,185,0.1)";
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, waveMid); ctx.lineTo(w, waveMid); ctx.stroke();

      ctx.strokeStyle = "rgba(140,175,170,0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const xn = x / w;
        const voiced = Math.sin(xn * 0.15 * Math.PI * 2 + t * 0.5) > -0.3 ? 1 : 0.1;
        const amp = voiced * (Math.sin(x * 0.15 + t * 3) * 0.4 + Math.sin(x * 0.08 + t * 2) * 0.3 + Math.sin(x * 0.35 + t * 4) * 0.15 + Math.sin(x * 0.5 + t * 5) * 0.08);
        const y = waveMid + amp * waveH * 0.4;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(140,175,170,0.08)";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const xn = x / w;
        const voiced = Math.sin(xn * 0.15 * Math.PI * 2 + t * 0.5) > -0.3 ? 1 : 0.1;
        const env = voiced * (0.3 + Math.sin(x * 0.03 + t) * 0.15);
        const y = waveMid - env * waveH * 0.5;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (let x = w - 1; x >= 0; x--) {
        const xn = x / w;
        const voiced = Math.sin(xn * 0.15 * Math.PI * 2 + t * 0.5) > -0.3 ? 1 : 0.1;
        const env = voiced * (0.3 + Math.sin(x * 0.03 + t) * 0.15);
        const y = waveMid + env * waveH * 0.5;
        ctx.lineTo(x, y);
      }
      ctx.fill();

      ctx.font = "600 6.5px 'JetBrains Mono'";
      ctx.fillStyle = "rgba(150,170,180,0.5)";
      ctx.textAlign = "left";
      ctx.fillText("F0 182Hz · JITTER 0.8%", 4, h - 4);
      ctx.textAlign = "right";
      ctx.fillText("SHIMMER 2.1%", w - 4, h - 4);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [w, h]);

  return <canvas ref={ref} style={{ width: w, height: h }} className="rounded-lg" />;
}

function useStream(base: number, range = 0.04, speed = 1.2) {
  const [v, setV] = useState(base);
  const baseRef = useRef(base);
  const frameRef = useRef(0);

  useEffect(() => { baseRef.current = base; }, [base]);

  useEffect(() => {
    let running = true;
    const jitter = () => {
      if (!running) return;
      const b = baseRef.current;
      const noise = (Math.random() - 0.5) * 2 * b * range;
      setV(prev => {
        const target = b + noise;
        return prev + (target - prev) * 0.15;
      });
      frameRef.current = window.setTimeout(jitter, 80 + Math.random() * 120 * (1 / speed));
    };
    let entered = false;
    const t0 = performance.now();
    const enter = (now: number) => {
      const p = Math.min((now - t0) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(baseRef.current * eased);
      if (p < 1) requestAnimationFrame(enter);
      else if (!entered) { entered = true; jitter(); }
    };
    requestAnimationFrame(enter);
    return () => { running = false; clearTimeout(frameRef.current); };
  }, [range, speed]);

  return v;
}

function StreamBar({ value, color }: { value: number; color: string }) {
  const v = useStream(value, 0.03, 0.8);
  return (
    <div className="w-full h-[3px] rounded-full" style={{ background: "rgba(160,180,195,0.05)" }}>
      <div className="h-full rounded-full transition-[width] duration-300 ease-out" style={{
        width: `${Math.max(0, Math.min(100, v * 100))}%`,
        background: `linear-gradient(90deg, rgba(${color},0.15), rgba(${color},0.45))`,
      }} />
    </div>
  );
}

function StreamMetric({ value, decimals = 0, size = "text-[14px]", color = "200,210,215", opacity = 0.7 }: {
  value: number; decimals?: number; size?: string; color?: string; opacity?: number;
}) {
  const v = useStream(value, 0.03, 1);
  return (
    <span className={`${size} font-mono font-bold leading-none tabular-nums`} style={{
      color: `rgba(${color},${opacity})`,
      fontFamily: "'JetBrains Mono'",
    }}>
      {decimals > 0 ? v.toFixed(decimals) : Math.round(v)}
    </span>
  );
}

function KPI({ label, value, unit }: { label: string; value: number; unit: string }) {
  const v = useStream(value, 0.025, 1);
  const display = unit === "%" || unit === "mm" ? v.toFixed(1) : Math.round(v);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[7px] tracking-[0.14em] uppercase font-semibold text-cyan-400/60"
        style={{ fontFamily: "'JetBrains Mono'" }}>{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[19px] font-extrabold tabular-nums leading-none text-cyan-50/90"
          style={{ fontFamily: "'JetBrains Mono'" }}>{display}</span>
        <span className="text-[8px] font-medium text-cyan-400/45">{unit}</span>
      </div>
    </div>
  );
}

function NeuralDashboard() {
  return (
    <div className="w-full overflow-hidden relative" style={{
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: 16,
      border: "1px solid rgba(34, 211, 238, 0.35)",
      boxShadow: "0 0 40px rgba(0, 212, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
    }}>
      <div className="relative z-10 p-2.5 space-y-1.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5" style={{ borderBottom: "1px solid rgba(34, 211, 238, 0.1)" }}>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
                style={{ background: "rgb(34, 211, 238)" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ background: "rgb(34, 211, 238)" }} />
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-cyan-400/90"
              style={{ fontFamily: "'JetBrains Mono'" }}>
              Clinician Dashboard
            </span>
            <span className="text-[9px] font-mono text-cyan-300/60">Carmen D.R.</span>
          </div>
          <span className="text-[9px] font-mono tracking-wider text-cyan-400/70">LIVE</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <KPI label="Reaction" value={198} unit="ms" />
          <KPI label="Avg ROM" value={72} unit="°" />
          <KPI label="F0 vocal" value={182} unit="Hz" />
          <KPI label="Pupil" value={3.4} unit="mm" />
        </div>

        {/* Hand panel — canvas only */}
        <div className="rounded overflow-hidden" style={{
          background: "rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(34, 211, 238, 0.08)",
        }}>
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-[7px] font-semibold tracking-[0.12em] uppercase text-cyan-400/70"
              style={{ fontFamily: "'JetBrains Mono'" }}>Hand tracking</span>
            <span className="text-[6px] font-mono text-white/35">21 landmarks</span>
          </div>
          <div className="flex justify-center"><HandVis w={250} h={100} /></div>
        </div>

        {/* Eye panel — canvas only */}
        <div className="rounded overflow-hidden" style={{
          background: "rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(34, 211, 238, 0.08)",
        }}>
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-[7px] font-semibold tracking-[0.12em] uppercase text-cyan-400/70"
              style={{ fontFamily: "'JetBrains Mono'" }}>Pupillometry</span>
            <span className="text-[6px] font-mono text-white/35">saccade tracking</span>
          </div>
          <div className="flex justify-center"><EyeVis w={250} h={85} /></div>
        </div>

        {/* Voice panel — canvas only */}
        <div className="rounded overflow-hidden" style={{
          background: "rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(34, 211, 238, 0.08)",
        }}>
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-[7px] font-semibold tracking-[0.12em] uppercase text-cyan-400/70"
              style={{ fontFamily: "'JetBrains Mono'" }}>Voice analysis</span>
            <span className="text-[6px] font-mono text-white/35">spectrogram</span>
          </div>
          <div className="flex justify-center"><VoiceVis w={250} h={75} /></div>
        </div>

        <div className="flex justify-between pt-0.5">
          <span className="text-[7px] font-mono text-cyan-400/35">FixedGap Clinical v2.4</span>
          <span className="text-[7px] font-mono text-white/25">Webcam · Mic</span>
        </div>
      </div>
    </div>
  );
}

export default memo(NeuralDashboard);
