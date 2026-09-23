import { useEffect, useRef } from 'react';

/**
 * AuraDigitalBackground / BinaryRainBackground
 * Implements the Meng To / Aura.build animated ceiling grid with dripping stalactites:
 * 1. Fixed horizontal digital matrix ceiling along the very top of the viewport.
 * 2. Stalactite columns of micro-blocks / 0 & 1 bits hanging down at organic staggered heights.
 * 3. Droplets detaching from stalactite tips and accelerating downward into darkness.
 * 4. Ambient top nebula aura illumination in electric blue and cyber lavender.
 * 5. Glitch scanwaves and twinkling diamond glints across the ceiling grid.
 */
export default function BinaryRainBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Digital matrix parameters
    const cellSize = 5;
    const cellGap = 3;
    const stride = cellSize + cellGap; // 8px
    let columns = Math.ceil(width / stride);

    // Characters for occasional digital glyph rendering
    const glyphs = ['0', '1', '·', '▪', '▫'];

    // Precalculate column landscapes (peaks and valleys of the hanging digital stalactites)
    let columnProfiles = [];
    let droplets = [];

    const spawnDroplet = (initial = false) => {
      if (columnProfiles.length === 0) return;
      const colIdx = Math.floor(Math.random() * columnProfiles.length);
      const col = columnProfiles[colIdx];
      const startY = col.tipY - Math.random() * 15;

      droplets.push({
        x: colIdx * stride + cellSize / 2,
        y: initial ? startY + Math.random() * 200 : startY,
        vy: 0.8 + Math.random() * 1.2,
        gravity: 0.035 + Math.random() * 0.02,
        life: 0,
        maxLife: 160 + Math.random() * 240, // Distance it falls before fading out
        trail: [],
        char: Math.random() < 0.5 ? '0' : '1',
      });
    };

    const initGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.ceil(width / stride);

      columnProfiles = [];
      for (let c = 0; c < columns; c++) {
        // Base continuous ceiling depth (rows 6 to 14)
        const baseCeiling = Math.floor(
          7 + Math.sin(c * 0.07) * 3 + Math.cos(c * 0.14) * 2.5
        );
        // Stalactite hanging depth: cluster peaks hanging down 20-45 rows (~160px - 360px)
        const hangPeak =
          Math.pow(Math.sin(c * 0.045 + 0.8), 2) * 22 +
          Math.sin(c * 0.12) * 8 +
          Math.cos(c * 0.02) * 6;
        const totalDepth = Math.max(baseCeiling + 4, Math.floor(baseCeiling + hangPeak));

        // Generate static cell data with twinkling parameters
        const cells = [];
        for (let r = 0; r < totalDepth; r++) {
          // In ceiling (r < baseCeiling), fill probability is ~92%. Down the stalactite, it tapers
          let exists = true;
          if (r >= baseCeiling) {
            const prob = Math.pow(1 - (r - baseCeiling) / (totalDepth - baseCeiling), 0.85);
            exists = Math.random() < prob;
          }

          if (exists) {
            cells.push({
              row: r,
              isSpecial: Math.random() < 0.07, // Sparkle / diamond glint
              isGlyph: Math.random() < 0.25,
              glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
              phase: Math.random() * Math.PI * 2,
              speed: 0.02 + Math.random() * 0.04,
            });
          }
        }

        columnProfiles.push({
          col: c,
          baseCeiling,
          totalDepth,
          cells,
          tipY: totalDepth * stride,
        });
      }

      // Initialize detached falling droplets
      droplets = [];
      const dropletCount = Math.min(65, Math.floor(columns * 0.35));
      for (let i = 0; i < dropletCount; i++) {
        spawnDroplet(true);
      }
    };

    initGrid();

    const handleResize = () => {
      initGrid();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS smooth & light
    let scanWaveX = -200;

    const draw = (currentTime) => {
      animationFrameId = requestAnimationFrame(draw);

      if (document.hidden) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Clear frame
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Top Nebula Aura Glow
      const ambientGlow = ctx.createRadialGradient(
        width * 0.5,
        0,
        20,
        width * 0.5,
        0,
        width * 0.65
      );
      ambientGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      ambientGlow.addColorStop(0.35, 'rgba(99, 102, 241, 0.12)');
      ambientGlow.addColorStop(0.7, 'rgba(30, 27, 75, 0.06)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height * 0.7);

      // 2. Horizontal Cyber Scan Wave Progression
      scanWaveX += 6;
      if (scanWaveX > width + 400) {
        scanWaveX = -300;
      }

      const time = currentTime * 0.001;

      // 3. Render Matrix Ceiling Grid & Stalactite Columns
      for (let c = 0; c < columnProfiles.length; c++) {
        const col = columnProfiles[c];
        const x = c * stride;

        // Wave distance factor
        const distFromWave = Math.abs(x - scanWaveX);
        const waveBoost = distFromWave < 120 ? (1 - distFromWave / 120) * 0.45 : 0;

        for (let i = 0; i < col.cells.length; i++) {
          const cell = col.cells[i];
          const y = cell.row * stride;

          // Vertical taper: 1 at top down to 0.15 at stalactite tip
          const vertRatio = cell.row / col.totalDepth;
          const depthFade = Math.pow(1 - vertRatio * 0.75, 1.2);

          // Twinkle pulse
          const pulse = 0.5 + 0.5 * Math.sin(time * 3 * cell.speed + cell.phase);
          const alpha = Math.min(1, Math.max(0.12, (0.35 + 0.5 * pulse + waveBoost) * depthFade));

          if (cell.isSpecial && (pulse > 0.75 || waveBoost > 0.2)) {
            // Bright diamond sparkle / highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.3)})`;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.shadowBlur = 0;
          } else if (cell.isGlyph && (pulse > 0.6 || waveBoost > 0.1)) {
            // Occasional 0 or 1 digital glyph
            ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`;
            ctx.font = `600 ${cellSize + 1}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(cell.glyph, x + cellSize / 2, y + cellSize);
          } else {
            // Standard digital matrix block
            if (waveBoost > 0.15) {
              ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
            } else {
              ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            }
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }

      // 4. Render Detaching & Falling Droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];

        // Add current pos to trail
        d.trail.unshift({ y: d.y, alpha: 1 });
        if (d.trail.length > 5) d.trail.pop();

        // Advance position with gentle gravity
        d.vy += d.gravity;
        d.y += d.vy;
        d.life += d.vy;

        // Droplet fade out as it travels down
        const lifeRatio = d.life / d.maxLife;
        const dropAlpha = Math.max(0, 1 - lifeRatio);

        if (dropAlpha <= 0.02 || d.y > height * 0.75) {
          // Reset droplet
          droplets.splice(i, 1);
          spawnDroplet(false);
          continue;
        }

        // Draw trail
        for (let t = 0; t < d.trail.length; t++) {
          const tp = d.trail[t];
          const trailAlpha = (1 - t / d.trail.length) * dropAlpha * 0.45;
          ctx.fillStyle = `rgba(56, 189, 248, ${trailAlpha})`;
          ctx.fillRect(d.x - cellSize / 2, tp.y, cellSize * 0.8, cellSize * 0.8);
        }

        // Draw falling head droplet (glowing cyan / white head)
        ctx.fillStyle = `rgba(224, 242, 254, ${dropAlpha * 0.95})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.fillRect(d.x - cellSize / 2, d.y, cellSize, cellSize + 2);
        ctx.shadowBlur = 0;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} id="matrixBgCanvas" className="matrix-bg-canvas" aria-hidden="true" />;
}

export { BinaryRainBackground as AuraBackground };
