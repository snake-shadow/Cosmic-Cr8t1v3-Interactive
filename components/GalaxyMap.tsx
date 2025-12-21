
import React, { useEffect, useRef, useState } from 'react';

interface Landmark {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'STAR' | 'BLACK_HOLE' | 'NEBULA' | 'ANOMALY' | 'EXOPLANET' | 'PULSAR';
  facts: string[];
}

const LANDMARKS: Landmark[] = [
  { id: 'sgr-a', name: 'SAGITTARIUS A*', x: 0.5, y: 0.5, type: 'BLACK_HOLE', facts: ['Core Singularity', '4M Solar Masses', 'Event Horizon active'] },
  { id: 'sol', name: 'SOL SYSTEM', x: 0.35, y: 0.32, type: 'STAR', facts: ['Class G Star', 'Habitable Zone: Earth', 'Sector 001'] },
  { id: 'pillars', name: 'PILLARS OF CREATION', x: 0.62, y: 0.28, type: 'NEBULA', facts: ['Star Nursery', 'M16 Region', '5ly Height'] },
  { id: 'kepler-186f', name: 'KEPLER-186f', x: 0.25, y: 0.45, type: 'EXOPLANET', facts: ['Earth Twin?', 'Red Dwarf Orbit', 'Possible Liquid H2O'] },
  { id: 'trappist-1', name: 'TRAPPIST-1', x: 0.45, y: 0.15, type: 'STAR', facts: ['Ultra-Cool Dwarf', '7 Rocky Planets', 'High Bio-Sign Potential'] },
  { id: 'crab-pulsar', name: 'CRAB PULSAR', x: 0.75, y: 0.55, type: 'PULSAR', facts: ['Neutron Star', '30 rotations/sec', 'Radio Beam Pulse'] },
  { id: 'voyager-1', name: 'VOYAGER 1 VESTIGE', x: 0.36, y: 0.33, type: 'ANOMALY', facts: ['Oldest Probe', 'Interstellar Medium', 'Golden Record onboard'] },
  { id: 'oort-cloud', name: 'OORT CLOUD', x: 0.42, y: 0.38, type: 'ANOMALY', facts: ['Comet Shell', 'Outer Solar Reach', 'Gravitational Boundary'] },
  { id: 'proxima-b', name: 'PROXIMA B', x: 0.38, y: 0.41, type: 'EXOPLANET', facts: ['Closest Exoplanet', 'Habitable Potential', 'Alpha Centauri System'] },
  { id: 'dyson-node', name: 'TYPE-II CANDIDATE', x: 0.15, y: 0.82, type: 'ANOMALY', facts: ['Dyson Swarm Lead', 'Infrared Excess', 'Potential Mega-Structure'] },
  { id: 'void-7', name: 'VOID SECTOR 7', x: 0.90, y: 0.10, type: 'ANOMALY', facts: ['Low Star Density', 'Cosmic Microwave Hotspot', 'Unexplained Redshift'] },
  { id: 'nova-target', name: 'T PYXIDIS', x: 0.82, y: 0.65, type: 'PULSAR', facts: ['Recurrent Nova', 'Binary White Dwarf', 'Critical Mass Imminent'] },
  { id: 'magellanic', name: 'LMC BRIDGE', x: 0.10, y: 0.20, type: 'NEBULA', facts: ['Satellite Galaxy Link', 'Gas Stream', 'High Velocity Cloud'] },
  { id: 'carina', name: 'CARINA CORE', x: 0.68, y: 0.85, type: 'NEBULA', facts: ['Eta Carinae Site', 'Hypergiant Star', 'Destruction Imminent'] },
  { id: 'sombrero', name: 'SOMBRERO VECTOR', x: 0.05, y: 0.55, type: 'ANOMALY', facts: ['Extragalactic view', 'Bulge concentration', 'Halo Star Stream'] },
];

interface GalaxyMapProps {
  onSelect: (landmark: Landmark) => void;
}

const GalaxyMap: React.FC<GalaxyMapProps> = ({ onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<Landmark | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const stars: { angle: number; dist: number; speed: number; size: number; color: string; drift: number }[] = [];
    
    for (let i = 0; i < 4000; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.7) * 450;
      stars.push({
        angle,
        dist,
        speed: (0.00005 + Math.random() * 0.0002) * (1 - dist/500),
        size: Math.random() * 1.8,
        color: i % 15 === 0 ? '#3b82f6' : i % 25 === 0 ? '#22d3ee' : i % 40 === 0 ? '#f43f5e' : '#ffffff',
        drift: Math.random() * 0.5
      });
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      frame++;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      
      // Global Composite: Lighter for "glow" blending
      ctx.globalCompositeOperation = 'lighter';

      // 1. Background Nebula Volumetrics
      for(let i=0; i<3; i++) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 350 + Math.sin(frame * 0.01 + i) * 50);
          const c = i === 0 ? 'rgba(34, 211, 238, 0.08)' : i === 1 ? 'rgba(99, 102, 241, 0.04)' : 'rgba(244, 63, 94, 0.03)';
          grad.addColorStop(0, c);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
      }

      // 2. Galaxy Stars with Parallax Drift
      ctx.save();
      ctx.translate(cx, cy);
      // Mouse Parallax
      const mx = (mouseRef.current.x - cx) * 0.05;
      const my = (mouseRef.current.y - cy) * 0.05;
      ctx.translate(-mx, -my);

      stars.forEach((s, i) => {
        const currentAngle = s.angle + (frame * s.speed);
        const x = Math.cos(currentAngle) * s.dist;
        const y = Math.sin(currentAngle) * s.dist;
        
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.2 + Math.sin(frame * 0.01 + i) * 0.5;
        ctx.fillRect(x, y, s.size, s.size);
      });
      ctx.restore();

      // 3. Grid Lines
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 100) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 100) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      // 4. Landmarks
      LANDMARKS.forEach(lm => {
        const x = lm.x * w;
        const y = lm.y * h;
        const isHovered = hovered?.id === lm.id;

        // Draw Object
        const pulse = Math.sin(frame * 0.08) * 1.5;
        ctx.shadowBlur = isHovered ? 25 : 8;
        ctx.shadowColor = isHovered ? '#22d3ee' : 'rgba(34, 211, 238, 0.3)';
        
        ctx.beginPath();
        ctx.arc(x, y, (isHovered ? 6 : 3) + pulse/2, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#22d3ee' : 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        if (isHovered) {
          // Tactical Reticle
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(x, y, 20 + Math.sin(frame * 0.1) * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated Crosshairs
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
          ctx.beginPath();
          ctx.moveTo(x - 30, y); ctx.lineTo(x + 30, y);
          ctx.moveTo(x, y - 30); ctx.lineTo(x, y + 30);
          ctx.stroke();

          // Data Connector
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 50, y - 50);
          ctx.lineTo(x + 200, y - 50);
          ctx.stroke();

          // Mini Data HUD
          ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
          ctx.font = 'bold 12px "Share Tech Mono"';
          ctx.fillText(lm.name, x + 55, y - 58);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '9px "Share Tech Mono"';
          ctx.fillText(`TYPE: ${lm.type}`, x + 55, y - 40);
          ctx.fillText(`STATUS: LOCKED`, x + 55, y - 30);
        }
      });

      // Scan Progress (Top Bar)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
      ctx.fillRect(50, 20, w - 100, 2);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
      ctx.fillRect(50, 20, ((frame % 300) / 300) * (w - 100), 2);

      requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };

      const found = LANDMARKS.find(lm => {
        const lx = lm.x * (canvas.width / window.devicePixelRatio);
        const ly = lm.y * (canvas.height / window.devicePixelRatio);
        return Math.sqrt((x - lx)**2 + (y - ly)**2) < 25;
      });
      setHovered(found || null);
    };

    const handleClick = () => { if(hovered) onSelect(hovered); };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [hovered, onSelect]);

  return (
    <div className="relative w-full h-[65vh] glass rounded-2xl overflow-hidden border-2 border-sky-500/30">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
        <div>
            <div className="mono text-[10px] text-sky-400 tracking-[0.5em] mb-1">LONG RANGE SENSOR ARRAY</div>
            <div className="text-2xl font-bold tracking-widest text-white glow-text italic">GALAXY_MAP.01</div>
        </div>
        <div className="text-right">
            <div className="mono text-[9px] text-sky-600 font-bold mb-1">DATA_STREAM: ACTIVE</div>
            <div className="flex gap-1 justify-end">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 h-3 bg-sky-500/20" style={{ height: `${Math.random()*15+5}px` }}></div>
                ))}
            </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
          <div className="mono text-[9px] text-slate-500 mb-2">SECTOR_INDEX: GC-449-X</div>
          <div className="flex items-center gap-3">
              <div className="w-32 h-1 bg-slate-900 overflow-hidden">
                  <div className="h-full bg-sky-500 w-1/2 animate-pulse"></div>
              </div>
              <span className="mono text-[8px] text-sky-400">THRUSTERS: STABLE</span>
          </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
    </div>
  );
};

export default GalaxyMap;
