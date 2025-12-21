
import React, { useEffect, useRef } from 'react';

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: { x: number; y: number; s: number; v: number; a: number }[] = [];
    
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        s: Math.random() * 1.5 + 0.5,
        v: Math.random() * 0.2 + 0.05,
        a: Math.random() * Math.PI * 2
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        const flicker = Math.sin(Date.now() * 0.001 + star.a) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${flicker * 0.5})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
        ctx.fill();

        star.y -= star.v;
        if (star.y < 0) star.y = canvas.height;
      });
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', init);
    init();
    draw();
    return () => window.removeEventListener('resize', init);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] pointer-events-none opacity-40" />;
};

export default Starfield;
