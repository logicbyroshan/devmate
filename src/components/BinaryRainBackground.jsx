import { useEffect, useRef } from 'react';

/**
 * BinaryRainBackground
 * Renders a fixed digital falling 0 & 1 matrix/binary rain at the top of the viewport.
 * Features random character mutations/glitches, electric blue styling, and a graceful vertical curtain fade.
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

    // Characters: predominantly 0 & 1 with occasional subtle dev glyphs
    const chars = ['0', '1', '0', '1', '1', '0', '0', '1', '0', '1', '<', '>', '/', '{', '}', '1', '0'];
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);

    let drops = [];

    const initDrops = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops.push({
          y: Math.random() * -50, // Stagger initial vertical position
          speed: 0.35 + Math.random() * 0.65, // Gentle falling speed
          length: Math.floor(12 + Math.random() * 18),
          chars: Array.from({ length: 30 }, () => chars[Math.floor(Math.random() * chars.length)]),
          glitchCounter: Math.floor(Math.random() * 10),
        });
      }
    };

    initDrops();

    const handleResize = () => {
      initDrops();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS update interval: low CPU, high matrix authenticity

    const draw = (currentTime) => {
      animationFrameId = requestAnimationFrame(draw);

      if (document.hidden) return; // Pause when tab is inactive

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Clear previous frame
      ctx.clearRect(0, 0, width, height);

      ctx.font = `${fontSize}px "Courier New", Consolas, "Orbitron", monospace`;
      ctx.textAlign = 'center';

      // Curtain fade limit: particles dissolve gracefully down the upper viewport
      const fadeHeight = height * 0.65;

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        drop.glitchCounter++;

        // Randomly mutate characters in place for the glitchy hacker vibe
        if (drop.glitchCounter % 3 === 0) {
          const mutateIdx = Math.floor(Math.random() * drop.length);
          drop.chars[mutateIdx] = chars[Math.floor(Math.random() * chars.length)];
        }

        const x = i * fontSize + fontSize / 2;

        for (let j = 0; j < drop.length; j++) {
          const charY = (drop.y - j) * fontSize;
          if (charY < 0 || charY > height) continue;

          // Exponential vertical fade: dense at the top, fading away downwards
          const verticalProgress = Math.min(1, Math.max(0, charY / fadeHeight));
          const topFade = Math.pow(1 - verticalProgress, 1.4);
          if (topFade <= 0.01) continue;

          // Head character vs trail characters
          if (j === 0) {
            // Bright electric blue leading character
            ctx.fillStyle = `rgba(186, 230, 253, ${0.72 * topFade})`;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 6;
          } else {
            // Darker electric blue trail
            const trailFade = 1 - j / drop.length;
            const alpha = 0.22 * topFade * (0.4 + 0.6 * trailFade);
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.shadowBlur = 0;
          }

          const char = drop.chars[j % drop.chars.length];
          ctx.fillText(char, x, charY);
        }

        // Advance downward
        drop.y += drop.speed;

        // Reset drop when tail passes fade limit
        if ((drop.y - drop.length) * fontSize > fadeHeight + 40) {
          drop.y = Math.random() * -20;
          drop.speed = 0.35 + Math.random() * 0.65;
          drop.length = Math.floor(12 + Math.random() * 18);
        }
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
