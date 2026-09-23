import { useEffect, useRef } from 'react';

/**
 * BinaryRainBackground / AuraDigitalBackground
 * 1. Centered inverted-triangle canopy: concentrated in the center of the viewport,
 *    tapering down from top center into a V-shaped triangular code matrix.
 * 2. Composed exclusively of binary bits ('0', '1') and code symbols ('<', '>', '/', '{', '}', '*', '+', '~').
 * 3. Falling code droplets: leading code glyph with trailing binary characters cascading down softly.
 * 4. Atmospheric transparency: subtle, cyber-hacker aesthetic that sits strictly in the background
 *    behind all cards, buttons, and content.
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

    // Grid spacing tailored for legible monospace glyphs
    const strideX = 14;
    const strideY = 15;
    let columns = Math.ceil(width / strideX);

    // Code symbols pool (mostly 0 and 1 with code syntax characters)
    const CODE_GLYPHS = ['0', '1', '0', '1', '1', '0', '<', '>', '/', '{', '}', '*', '+', '~', ';', '#', 'λ', '0', '1'];

    let columnProfiles = [];
    let droplets = [];

    const spawnDroplet = (initial = false) => {
      // Pick randomly among active central triangle columns
      const activeColumns = columnProfiles.filter((c) => c.active && c.cells.length > 0);
      if (activeColumns.length === 0) return;

      const col = activeColumns[Math.floor(Math.random() * activeColumns.length)];
      const startY = col.tipY - Math.random() * 12;

      droplets.push({
        x: col.x + strideX / 2,
        y: initial ? startY + Math.random() * 220 : startY,
        vy: 1.0 + Math.random() * 1.5,
        gravity: 0.02 + Math.random() * 0.015,
        life: 0,
        maxLife: 140 + Math.random() * 180, // Falling distance before dissolving
        char: CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)],
        trail: [],
      });
    };

    const initGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.ceil(width / strideX);

      const centerX = width * 0.5;
      // Triangle width span: central ~76% of viewport (min 420px, max 1100px)
      const triangleHalfWidth = Math.min(Math.max(width * 0.38, 280), 580);

      columnProfiles = [];

      for (let c = 0; c < columns; c++) {
        const x = c * strideX;
        const distFromCenter = Math.abs(x - centerX);
        const normalizedDist = distFromCenter / triangleHalfWidth;

        if (normalizedDist >= 1.0) {
          // Outside the central triangle: inactive
          columnProfiles.push({
            col: c,
            x,
            active: false,
            cells: [],
            tipY: 0,
          });
          continue;
        }

        // Triangular envelope: deepest at center (normalizedDist = 0), sloping upward towards edges
        const triangleShape = Math.pow(1 - normalizedDist, 0.88);
        const centerMaxRows = 24 + Math.sin(c * 0.3) * 3 + Math.cos(c * 0.5) * 2;
        const totalRows = Math.max(2, Math.floor(centerMaxRows * triangleShape));

        // Generate cells for this column
        const cells = [];
        for (let r = 0; r < totalRows; r++) {
          // Higher density at top, tapering towards tip of triangle
          const rowRatio = r / totalRows;
          const densityProb = Math.pow(1 - rowRatio * 0.65, 0.9);

          if (Math.random() < densityProb) {
            cells.push({
              row: r,
              char: CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)],
              isSparkle: Math.random() < 0.08,
              twinkleSpeed: 0.02 + Math.random() * 0.04,
              twinklePhase: Math.random() * Math.PI * 2,
              glitchCounter: Math.floor(Math.random() * 120),
            });
          }
        }

        columnProfiles.push({
          col: c,
          x,
          active: true,
          totalRows,
          cells,
          tipY: totalRows * strideY,
        });
      }

      // Initialize falling code streams
      droplets = [];
      const dropletCount = Math.min(38, Math.floor(columns * 0.22));
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
    const fpsInterval = 1000 / 30; // 30 FPS smooth & lightweight
    let scanWaveX = -250;

    const draw = (currentTime) => {
      animationFrameId = requestAnimationFrame(draw);

      if (document.hidden) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Clear frame
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Triangular Center Nebula Glow
      const centerX = width * 0.5;
      const ambientGlow = ctx.createRadialGradient(
        centerX,
        0,
        10,
        centerX,
        0,
        width * 0.42
      );
      ambientGlow.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
      ambientGlow.addColorStop(0.35, 'rgba(37, 99, 235, 0.08)');
      ambientGlow.addColorStop(0.7, 'rgba(15, 23, 42, 0.03)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height * 0.65);

      // 2. Horizontal Subtle Cyber Scan Wave
      scanWaveX += 5.5;
      if (scanWaveX > width + 300) {
        scanWaveX = -250;
      }

      const time = currentTime * 0.001;

      // 3. Render Triangular Code Grid (0, 1, and code symbols)
      ctx.font = '600 11px "SF Mono", "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let c = 0; c < columnProfiles.length; c++) {
        const col = columnProfiles[c];
        if (!col.active || col.cells.length === 0) continue;

        const x = col.x + strideX / 2;

        // Wave distance factor
        const distFromWave = Math.abs(col.x - scanWaveX);
        const waveBoost = distFromWave < 100 ? (1 - distFromWave / 100) * 0.35 : 0;

        for (let i = 0; i < col.cells.length; i++) {
          const cell = col.cells[i];
          const y = cell.row * strideY + strideY / 2;

          // Occasional subtle glitch character mutation
          cell.glitchCounter++;
          if (cell.glitchCounter > 150 + Math.random() * 200) {
            cell.char = CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)];
            cell.glitchCounter = 0;
          }

          // Vertical depth taper (more transparent toward bottom tip of triangle)
          const vertRatio = cell.row / col.totalRows;
          const depthFade = Math.pow(1 - vertRatio * 0.68, 1.1);

          // Twinkle pulse
          const pulse = 0.5 + 0.5 * Math.sin(time * 3 * cell.twinkleSpeed + cell.twinklePhase);
          const alpha = Math.min(0.85, Math.max(0.12, (0.28 + 0.42 * pulse + waveBoost) * depthFade));

          if (cell.isSparkle && (pulse > 0.78 || waveBoost > 0.18)) {
            // Bright cyber white diamond glint
            ctx.fillStyle = `rgba(240, 249, 255, ${Math.min(0.95, alpha + 0.35)})`;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 6;
            ctx.fillText(cell.char, x, y);
            ctx.shadowBlur = 0;
          } else if (waveBoost > 0.12) {
            // Scanwave highlight (sky blue)
            ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
            ctx.fillText(cell.char, x, y);
          } else {
            // Standard electric cyan binary glyph
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.fillText(cell.char, x, y);
          }
        }
      }

      // 4. Render Falling Code Droplets (0 and 1 streams with trailing characters)
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];

        // Add previous pos to trail
        d.trail.unshift({
          y: d.y,
          char: CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)],
        });
        if (d.trail.length > 5) d.trail.pop();

        // Advance position with gentle gravity
        d.vy += d.gravity;
        d.y += d.vy;
        d.life += d.vy;

        // Droplet fade out as it travels down past hero
        const lifeRatio = d.life / d.maxLife;
        const dropAlpha = Math.max(0, 1 - lifeRatio);

        if (dropAlpha <= 0.02 || d.y > height * 0.7) {
          // Reset droplet
          droplets.splice(i, 1);
          spawnDroplet(false);
          continue;
        }

        // Draw trail characters
        for (let t = 0; t < d.trail.length; t++) {
          const tp = d.trail[t];
          const trailAlpha = (1 - t / d.trail.length) * dropAlpha * 0.38;
          ctx.fillStyle = `rgba(56, 189, 248, ${trailAlpha})`;
          ctx.fillText(tp.char, d.x, tp.y);
        }

        // Draw leading falling glyph (glowing cyan / white)
        ctx.fillStyle = `rgba(224, 242, 254, ${dropAlpha * 0.9})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.fillText(d.char, d.x, d.y);
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
