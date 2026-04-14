import { useEffect, useRef } from 'react';

export default function PropertyTour3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const GOLD = '#efab0f';
    const TEAL = '#10b981';

    const floors = [
      { w: 200, d: 200, h: 40, y: 0,   color: '#1e293b', accent: TEAL },
      { w: 160, d: 160, h: 40, y: 40,  color: '#0f172a', accent: GOLD },
      { w: 120, d: 120, h: 40, y: 80,  color: '#1e293b', accent: TEAL },
      { w: 80,  d: 80,  h: 40, y: 120, color: '#0f172a', accent: GOLD },
      { w: 50,  d: 50,  h: 30, y: 160, color: '#1e293b', accent: GOLD },
    ];

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      r: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.3 - Math.random() * 0.5,
      color: Math.random() > 0.5 ? GOLD : TEAL,
      alpha: Math.random(),
    }));

    function isoX(wx, wy) { return wx - wy; }
    function isoY(wx, wy, wz) { return (wx + wy) * 0.5 - wz; }

    function drawFloor(cx, cy, floor, sc, pulse) {
      const w = floor.w * sc;
      const d = floor.d * sc;
      const h = (floor.h + pulse) * sc;
      const yBase = floor.y * sc;
      const ox = cx;
      const oy = cy - yBase;

      // Top face
      ctx.beginPath();
      ctx.moveTo(ox + isoX(0, 0), oy + isoY(0, 0, 0) - h);
      ctx.lineTo(ox + isoX(w, 0), oy + isoY(w, 0, 0) - h);
      ctx.lineTo(ox + isoX(w, d), oy + isoY(w, d, 0) - h);
      ctx.lineTo(ox + isoX(0, d), oy + isoY(0, d, 0) - h);
      ctx.closePath();
      const topGrad = ctx.createLinearGradient(ox, oy - h, ox + w * 0.5, oy - h + d * 0.25);
      topGrad.addColorStop(0, floor.accent + '55');
      topGrad.addColorStop(1, floor.color + 'bb');
      ctx.fillStyle = topGrad;
      ctx.fill();
      ctx.strokeStyle = floor.accent + '99';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left face
      ctx.beginPath();
      ctx.moveTo(ox + isoX(0, 0), oy + isoY(0, 0, 0) - h);
      ctx.lineTo(ox + isoX(0, d), oy + isoY(0, d, 0) - h);
      ctx.lineTo(ox + isoX(0, d), oy + isoY(0, d, 0));
      ctx.lineTo(ox + isoX(0, 0), oy + isoY(0, 0, 0));
      ctx.closePath();
      ctx.fillStyle = floor.color + 'cc';
      ctx.fill();
      ctx.strokeStyle = floor.accent + '44';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right face
      ctx.beginPath();
      ctx.moveTo(ox + isoX(w, 0), oy + isoY(w, 0, 0) - h);
      ctx.lineTo(ox + isoX(w, d), oy + isoY(w, d, 0) - h);
      ctx.lineTo(ox + isoX(w, d), oy + isoY(w, d, 0));
      ctx.lineTo(ox + isoX(w, 0), oy + isoY(w, 0, 0));
      ctx.closePath();
      ctx.fillStyle = floor.color + '99';
      ctx.fill();
      ctx.strokeStyle = floor.accent + '44';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing top edge
      ctx.beginPath();
      ctx.moveTo(ox + isoX(0, 0), oy + isoY(0, 0, 0) - h);
      ctx.lineTo(ox + isoX(w, 0), oy + isoY(w, 0, 0) - h);
      ctx.lineTo(ox + isoX(w, d), oy + isoY(w, d, 0) - h);
      ctx.lineTo(ox + isoX(0, d), oy + isoY(0, d, 0) - h);
      ctx.closePath();
      ctx.strokeStyle = floor.accent;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 14;
      ctx.shadowColor = floor.accent;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function draw() {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      t += 0.008;

      // Background gradient
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
      bg.addColorStop(0, '#0a0f1e');
      bg.addColorStop(1, '#000000');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      ctx.globalAlpha = 1;

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.004;
        if (p.alpha <= 0 || p.y < 0) { p.x = Math.random() * W; p.y = H + 10; p.alpha = 0.6 + Math.random() * 0.4; }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8; ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;

      // Building
      const sc = Math.min(W, H) / 700;
      const cx = W * 0.5;
      const cy = H * 0.75;

      floors.forEach((floor, i) => {
        const pulse = Math.sin(t * 1.5 + i * 0.8) * 3;
        drawFloor(cx, cy, floor, sc, pulse);
      });

      // AI orb
      const totalH = floors.reduce((s, f) => s + f.h, 0) * sc;
      const orbY = cy - totalH - 30 * sc + Math.sin(t * 2) * 10;
      const orbR = 22 * sc;
      const orbGrad = ctx.createRadialGradient(cx - orbR * 0.3, orbY - orbR * 0.3, 2, cx, orbY, orbR * 1.5);
      orbGrad.addColorStop(0, '#fffbe6');
      orbGrad.addColorStop(0.4, GOLD);
      orbGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, orbY, orbR, 0, Math.PI * 2);
      ctx.fillStyle = orbGrad;
      ctx.shadowBlur = 40; ctx.shadowColor = GOLD;
      ctx.fill(); ctx.shadowBlur = 0;

      // Orb rings
      [1.4, 1.8, 2.3].forEach((mul, ri) => {
        ctx.beginPath();
        ctx.arc(cx, orbY, orbR * mul, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD + ['44', '22', '11'][ri];
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Orb label
      ctx.fillStyle = GOLD;
      ctx.font = `bold ${Math.max(9, 12 * sc)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 6; ctx.shadowColor = GOLD;
      ctx.fillText('AI CORE', cx, orbY + 4 * sc);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden relative bg-surface-950 border border-surface-800 shadow-[0_0_50px_rgba(239,171,15,0.1)]">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-950/70 border border-surface-700 rounded-full backdrop-blur-md mb-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span className="text-xs font-bold text-surface-200 uppercase tracking-wider">Live 3D Render</span>
        </div>
        <h3 className="text-lg font-bold text-white drop-shadow-lg">Interactive Valuation Core</h3>
        <p className="text-xs text-surface-400 mt-0.5">Real-time isometric property visualization</p>
      </div>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  );
}
