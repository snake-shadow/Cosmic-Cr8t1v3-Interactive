import React, { useState, useEffect, useRef } from 'react';
import { generateSpaceContent } from './services/geminiService';
import { ContentMode, HistoryItem, ContentResponse, TacticalSection } from './types';
import Starfield from './components/Starfield';
import GalaxyMap from './components/GalaxyMap';

// --- TACTICAL SOUND ENGINE ---
const useSoundEngine = () => {
  const audioCtx = useRef<AudioContext | null>(null);

  const initCtx = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  const playHover = () => {
    initCtx();
    const ctx = audioCtx.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const playClick = () => {
    initCtx();
    const ctx = audioCtx.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const createSyncHum = () => {
    initCtx();
    const ctx = audioCtx.current!;
    const osc = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    mod.frequency.setValueAtTime(8, ctx.currentTime);
    modGain.gain.setValueAtTime(20, ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.2);

    mod.connect(modGain);
    modGain.connect(osc.frequency);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    mod.start();

    return {
      stop: () => {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        setTimeout(() => {
          osc.stop();
          mod.stop();
        }, 600);
      }
    };
  };

  return { playHover, playClick, createSyncHum };
};

// --- TACTICAL ICONS ---
const TelemetryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" filter="url(#rocketGlow)">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="url(#rocketGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AnalysisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" filter="url(#rocketGlow)">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#rocketGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="11" r="3" stroke="url(#rocketGrad)" strokeWidth="1.5"/>
  </svg>
);

const VisualIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" filter="url(#rocketGlow)">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="url(#rocketGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="url(#rocketGrad)" strokeWidth="1.5"/>
  </svg>
);

const AnomalyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" filter="url(#rocketGlow)">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="url(#rocketGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RocketOutline = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-cyan-400">
    <defs>
      <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
      </linearGradient>
      <filter id="rocketGlow">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" stroke="url(#rocketGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#rocketGlow)"/>
  </svg>
);

const StarSparkleOutline = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-cyan-400">
    <g filter="drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))">
      <path d="M9.5 2L11 6L15 7.5L11 9L9.5 13L8 9L4 7.5L8 6L9.5 2Z" stroke="url(#starGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 13L20 15.5L22.5 16.5L20 17.5L19 20L18 17.5L15.5 16.5L18 15.5L19 13Z" stroke="url(#starGrad)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3L17.5 4.5L19 5L17.5 5.5L17 7L16.5 5.5L15 5L16.5 4.5L17 3Z" stroke="url(#starGrad)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
  </svg>
);

const LENS_CARDS = [
  { id: 'c1', title: 'THE SUN', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002111/GSFC_20171208_Archive_e002111~orig.jpg', desc: 'SOL / OUR STELLAR ANCHOR' },
  { id: 'c2', title: 'THE PLANETS', img: 'https://images-assets.nasa.gov/image/PIA10969/PIA10969~medium.jpg', desc: 'SOL SYSTEM / THE MAJOR EIGHT' },
  { id: 'c3', title: 'MOONS & DWARFS', img: 'https://images-assets.nasa.gov/image/PIA19952/PIA19952~medium.jpg', desc: 'LUNA, PLUTO & BEYOND' },
  { id: 'c4', title: 'STELLAR CLASSES', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000282/GSFC_20171208_Archive_e000282~small.jpg', desc: 'MAIN SEQUENCE / BINARIES' },
  { id: 'c5', title: 'CONSTELLATIONS', img: 'https://images-assets.nasa.gov/image/PIA19832/PIA19832~medium.jpg', desc: 'CELESTIAL MAPPING / NAVIGATION' },
  { id: 'c6', title: 'BLACK HOLES', img: 'https://images-assets.nasa.gov/image/PIA25440/PIA25440~medium.jpg', desc: 'SINGULARITIES / EVENT HORIZONS' },
  { id: 'c7', title: 'GALACTIC CENTER', img: 'https://images-assets.nasa.gov/image/PIA13101/PIA13101~medium.jpg', desc: 'SAGITTARIUS A* / CORE' },
  { id: 'c8', title: 'SPIRAL ARMS', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001558/GSFC_20171208_Archive_e001558~medium.jpg', desc: 'ORION SPUR / STRUCTURE' },
  { id: 'c9', title: 'STELLAR NURSERIES', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000226/GSFC_20171208_Archive_e000226~medium.jpg', desc: 'NEBULA CLUSTERS / STAR BIRTH' },
  { id: 'c10', title: 'STELLAR REMNANTS', img: 'https://images-assets.nasa.gov/image/PIA03519/PIA03519~medium.jpg', desc: 'WHITE DWARFS / NEUTRON STARS' },
  { id: 'c11', title: 'EXOPLANET ARCHIVE', img: 'https://images-assets.nasa.gov/image/PIA08042/PIA08042~medium.jpg', desc: 'BEYOND SOL / HABITABLE' },
  { id: 'c12', title: 'VOID ANOMALIES', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001774/GSFC_20171208_Archive_e001774~medium.jpg', desc: 'DARK MATTER / HALO' }
];

const SectionCard: React.FC<{ section: TacticalSection; onHover: () => void }> = ({ section, onHover }) => {
  const getStyle = () => {
    switch(section.type) {
      case 'telemetry': return { color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', icon: <TelemetryIcon /> };
      case 'analysis': return { color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', icon: <AnalysisIcon /> };
      case 'visual': return { color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', icon: <VisualIcon /> };
      case 'anomaly': return { color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5', icon: <AnomalyIcon /> };
      default: return { color: 'text-slate-400', border: 'border-slate-500/20', bg: 'bg-slate-500/5', icon: <TelemetryIcon /> };
    }
  };

  const style = getStyle();

  return (
    <div onMouseEnter={onHover} className={`p-6 rounded-2xl border ${style.border} ${style.bg} backdrop-blur-md group hover:bg-opacity-10 transition-all cursor-default`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
          {style.icon}
        </div>
        <h3 className={`mono text-[11px] font-black uppercase tracking-[0.2em] ${style.color}`}>
          {section.title}
        </h3>
      </div>
      <ul className="space-y-3">
        {section.content.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed font-medium">
            <span className={style.color}>•</span>
            <span className="uppercase tracking-wide text-[12px]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<ContentResponse | null>(null);
  const [showMap, setShowMap] = useState(false); // PATCH: Added view state for Galaxy Map
  
  const { playHover, playClick, createSyncHum } = useSoundEngine();
  const activeHum = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cosmic_history_v2');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (loading) {
      activeHum.current = createSyncHum();
    } else {
      if (activeHum.current) {
        activeHum.current.stop();
        activeHum.current = null;
      }
    }
    return () => activeHum.current?.stop();
  }, [loading]);

  const handleSearch = async (t: string = topic) => {
    if (!t.trim()) return;
    playClick();
    setLoading(true);
    setCurrentResult(null);
    setShowMap(false); // Close map if open
    try {
      const result = await generateSpaceContent(t, ContentMode.FACTS);
      setCurrentResult(result);
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        topic: t,
        mode: ContentMode.FACTS,
        timestamp: Date.now(),
        content: result
      };
      const newHistory = [newItem, ...history].slice(0, 8);
      setHistory(newHistory);
      localStorage.setItem('cosmic_history_v2', JSON.stringify(newHistory));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-6 md:p-10 relative">
      <Starfield />
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-12 px-4">
        <div className="flex items-center gap-4">
            <div 
              onMouseEnter={playHover} 
              onClick={() => { playClick(); setShowMap(false); setCurrentResult(null); }} 
              className="w-14 h-14 bg-cyan-950/40 backdrop-blur-lg rounded-xl flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] group hover:border-cyan-400 transition-all cursor-pointer"
            >
                <RocketOutline />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none glow-cyan">Cosmic Cr8t1v3</span>
              <span className="text-[10px] mono text-cyan-500 font-bold uppercase tracking-[0.3em] mt-1">Interactive Explorer</span>
            </div>
        </div>
        <div className="flex gap-8 text-[10px] mono text-slate-400 font-bold uppercase tracking-widest items-center">
            {/* PATCH: Mission Databases now toggles the GalaxyMap component */}
            <button 
              onMouseEnter={playHover} 
              onClick={() => { playClick(); setShowMap(!showMap); }} 
              className={`px-6 py-2 rounded-full border transition-all uppercase tracking-widest ${showMap ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'}`}
            >
              {showMap ? '[ CLOSE_MAP ]' : 'Mission Databases'}
            </button>
            <button onMouseEnter={playHover} onClick={playClick} className="text-xl hover:rotate-90 transition-transform duration-500 text-cyan-500/50 hover:text-cyan-400">⚙️</button>
        </div>
      </div>

      <div className="flex flex-col items-center mb-16 mt-8">
          <div className="w-full max-w-2xl relative search-pill flex items-center p-1 group overflow-hidden">
              <span className="pl-6 pr-4">
                <StarSparkleOutline />
              </span>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onMouseEnter={playHover}
                placeholder="PROBE COORDINATES..."
                className="w-full bg-transparent py-6 text-white focus:outline-none text-xl placeholder:text-slate-700 mono tracking-[0.1em] font-bold"
              />
              <button 
                onClick={() => handleSearch()}
                onMouseEnter={playHover}
                className="mr-3 w-14 h-14 bg-cyan-400 rounded-full flex items-center justify-center text-black text-2xl hover:bg-cyan-300 transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 flex-shrink-0"
              >
                  ➔
              </button>
          </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-hidden">
        
        {/* Main Content Area */}
        <div className="lg:col-span-9 overflow-y-auto pr-2 custom-scroll pb-24">
            {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
                    <div className="mono text-cyan-400 animate-pulse tracking-widest text-sm font-bold">SYNCHRONIZING WITH DEEP SPACE NODES...</div>
                </div>
            ) : showMap ? (
                /* PATCH: Display the GalaxyMap when the view state is active */
                <div className="animate-in fade-in zoom-in-95 duration-500 h-full">
                  <GalaxyMap onSelect={(lm) => {
                    setTopic(lm.name);
                    handleSearch(lm.name);
                  }} />
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={() => setShowMap(false)}
                      className="mono text-[10px] text-cyan-500 hover:text-white transition-colors tracking-widest border border-cyan-500/20 px-8 py-3 rounded-lg hover:bg-cyan-500/10 font-bold uppercase"
                    >
                      [ RETURN_TO_DASHBOARD ]
                    </button>
                  </div>
                </div>
            ) : currentResult ? (
                <div className="cosmic-card brackets p-10 animate-in zoom-in-95 duration-500 min-h-[500px] flex flex-col relative overflow-hidden">
                    <button 
                      onMouseEnter={playHover}
                      onClick={() => { playClick(); setCurrentResult(null); }} 
                      className="absolute top-6 right-8 text-red-500 hover:text-white mono text-[10px] tracking-tighter transition-all bg-red-500/5 hover:bg-red-600 px-4 py-2 rounded-lg border border-red-500/40 uppercase font-black z-20"
                    >
                      [ DISCONNECT_FEED_EXIT ]
                    </button>
                    
                    <div className="mb-12">
                        <span className="mono text-[10px] text-cyan-600 uppercase tracking-[0.3em] block mb-2 font-bold italic">Source Node: Tactical_Archive_0.1</span>
                        <h2 className="text-4xl font-extrabold text-white glow-cyan leading-tight uppercase tracking-tighter italic">{currentResult.hook}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                        {currentResult.sections.map((section, idx) => (
                          <SectionCard key={idx} section={section} onHover={playHover} />
                        ))}
                    </div>
                    
                    {currentResult.sources.length > 0 && (
                      <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center">
                        <span className="mono text-[9px] text-slate-600 uppercase font-bold">Validation Links:</span>
                        {currentResult.sources.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noreferrer" onMouseEnter={playHover} onClick={playClick} className="text-[9px] mono text-cyan-500/60 hover:text-cyan-400 transition-colors uppercase underline decoration-cyan-500/20 underline-offset-4 font-bold">{s.title}</a>
                        ))}
                      </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {LENS_CARDS.map(card => (
                        <div 
                          key={card.id} 
                          onMouseEnter={playHover}
                          onClick={() => handleSearch(card.title)}
                          className="cosmic-card brackets group cursor-pointer h-64"
                        >
                            <img src={card.img} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-70 transition-all duration-700 group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{card.title}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mono">{card.desc}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-cyan-900/40 border border-cyan-500/50 flex items-center justify-center text-white text-lg group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">➔</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-3 space-y-8 flex flex-col h-full overflow-hidden">
            <div onMouseEnter={playHover} className="cosmic-card p-8 flex-shrink-0">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">System Status</h3>
                    <span className="text-xs text-slate-600">▼</span>
                </div>
                <div className="space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 border-2 border-cyan-500/20 rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                            <div className="w-5 h-5 bg-cyan-500/20 rounded-full blur-[2px]"></div>
                        </div>
                        <div>
                            <div className="text-[9px] mono text-slate-500 tracking-widest uppercase mb-1 font-bold">Live_Uptime</div>
                            <div className="text-lg font-black text-white tracking-tight italic">998,400 <span className="text-[10px] text-cyan-600">MS</span></div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] mono text-slate-500 font-bold uppercase">
                            <span>Deep_Sense</span>
                            <span className="text-cyan-400">125,000</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 w-[45%] shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cosmic-card p-8 flex-grow overflow-hidden flex flex-col">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 border-b border-slate-800 pb-3">Mission History</h3>
                <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scroll">
                    {history.length > 0 ? history.map(h => (
                        <div 
                          key={h.id} 
                          onMouseEnter={playHover}
                          onClick={() => { playClick(); setShowMap(false); setCurrentResult(h.content); setTopic(h.topic); }}
                          className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-cyan-500/20 group"
                        >
                            <div className="w-2 h-2 rounded-full bg-cyan-500 group-hover:scale-150 group-hover:shadow-[0_0_10px_#06b6d4] transition-all"></div>
                            <div className="flex flex-col">
                                <span className="text-[11px] text-white font-bold tracking-tight truncate max-w-[140px] uppercase mono">{h.topic}</span>
                                <span className="text-[8px] mono text-slate-600 uppercase font-bold">{new Date(h.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-[10px] mono text-slate-700 text-center py-10 italic uppercase font-bold">Log empty. Awaiting telemetry.</div>
                    )}
                </div>
            </div>
        </aside>
      </div>
      <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
    </div>
  );
};

export default App;