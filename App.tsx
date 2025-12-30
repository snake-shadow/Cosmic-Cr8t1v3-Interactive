// COSMIC CR8T1V3 - TACTICAL BRIDGE v4.9.8 - REFINED COSMETICS
import React, { useState, useEffect, useRef } from 'react';
import { generateSpaceContent } from './services/geminiService';
import { ContentMode, HistoryItem, ContentResponse } from './types';

declare global {
  interface Window {
    _stopTransmission?: () => void;
  }
}

const DISCOVERY_CARDS = [
  { id: '1', title: 'THE SUN', sub: 'SOL / OUR STELLAR ANCHOR', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002111/GSFC_20171208_Archive_e002111~orig.jpg' },
  { id: '2', title: 'THE PLANETS', sub: 'SOL SYSTEM / THE MAJOR EIGHT', img: 'https://images-assets.nasa.gov/image/PIA10969/PIA10969~medium.jpg' },
  { id: '3', title: 'MOONS & DWARFS', sub: 'LUNA, PLUTO & BEYOND', img: 'https://images-assets.nasa.gov/image/PIA19952/PIA19952~medium.jpg' },
  { id: '4', title: 'STELLAR CLASSES', sub: 'MAIN SEQUENCE / BINARIES', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000282/GSFC_20171208_Archive_e000282~small.jpg' },
  { id: '5', title: 'CONSTELLATIONS', sub: 'CELESTIAL MAPPING / NAVIGATION', img: 'https://images-assets.nasa.gov/image/PIA19832/PIA19832~medium.jpg' },
  { id: '6', title: 'BLACK HOLES', sub: 'SINGULARITIES / EVENT HORIZONS', img: 'https://images-assets.nasa.gov/image/PIA25440/PIA25440~medium.jpg' },
  { id: '7', title: 'GALACTIC CENTER', sub: 'SAGITTARIUS A* / CORE', img: 'https://images-assets.nasa.gov/image/PIA13101/PIA13101~medium.jpg' },
  { id: '8', title: 'SPIRAL ARMS', sub: 'ORION SPUR / STRUCTURE', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001558/GSFC_20171208_Archive_e001558~medium.jpg' },
  { id: '9', title: 'STELLAR NURSERIES', sub: 'NEBULA CLUSTERS / STAR BIRTH', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000226/GSFC_20171208_Archive_e000226~medium.jpg' },
  { id: '10', title: 'STELLAR REMNANTS', sub: 'WHITE DWARFS / NEUTRON STARS', img: 'https://images-assets.nasa.gov/image/PIA03519/PIA03519~medium.jpg' },
  { id: '11', title: 'EXOPLANET ARCHIVE', sub: 'BEYOND SOL / HABITABLE', img: 'https://images-assets.nasa.gov/image/PIA08042/PIA08042~medium.jpg' },
  { id: '12', title: 'VOID ANOMALIES', sub: 'DARK MATTER / HALO', img: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001774/GSFC_20171208_Archive_e001774~medium.jpg' },
  { id: '13', title: 'KUIPER ZONE', sub: 'ARROKOTH / ULTIMA THULE', img: 'https://images-assets.nasa.gov/image/ACD17-0168-009/ACD17-0168-009~large.jpg?w=400&h=300&fit=crop&crop=faces%2Cfocalpoint' },
  { id: '14', title: 'SPACETIME', sub: 'GRAVITATIONAL LENSING / WARPING', img: 'https://cdn.pixabay.com/photo/2016/03/26/05/17/fractal-1280081_1280.jpg' },
  { id: '15', title: 'QUASAR JETS', sub: 'HIGH-ENERGY GALACTIC CORE', img: 'https://www.nasa.gov/wp-content/uploads/2023/03/bhjets.jpg' },
  { id: '16', title: 'ASTEROID FIELDS', sub: 'BENNU / CERES / ROCKY FIELDS', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Abell_370_Parallel_Field_with_Asteroids.jpg/1071px-Abell_370_Parallel_Field_with_Asteroids.jpg?20220710122359' },
  { id: '17', title: 'COMET TAILS', sub: 'COMET NEOWISE / DUAL TAILS', img: 'https://assets.science.nasa.gov/dynamicimage/assets/science/missions/webb/science/2023/05/STScI-01H33ZARY650G5RJ5K061EWX9G.png?w=2000&h=1429&fit=crop&crop=faces%2Cfocalpoint' },
  { id: '18', title: 'SUPERNOVA', sub: 'STELLAR DEATH / DESTRUCTION', img: 'https://supernova.eso.org/static/archives/exhibitionimages/screen/1218_C_destruction-planetary-system-CCfinal.jpg' },
  { id: '19', title: 'DARK ENERGY', sub: 'THE EXPANSION FORCE', img: 'https://images.pexels.com/photos/10033759/pexels-photo-10033759.jpeg?_gl=1*38v8eb*_ga*MTE2NjQwOTQ0Ni4xNzM4OTc1NDUx*_ga_8JE65Q40S6*czE3NjY0MzUwNDYkbzExMCRnMSR0MTc2NjQzNTE5MSRqNTckbDAkaDA.' },
  { id: '20', title: 'DEEP FIELD', sub: 'THE DISTANT UNIVERSE', img: 'https://assets.science.nasa.gov/dynamicimage/assets/science/missions/hubble/releases/2012/09/STScI-01EVVD1H0Z5HWP2PPK7N0TMQN3.tif?w=2000&h=1745&fit=crop&crop=faces%2Cfocalpoint' },
  { id: '21', title: 'PULSAR BEAMS', sub: 'CHANDRA / CRAB NEBULA', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Chandra-crab.jpg/500px-Chandra-crab.jpg' },
  { id: '22', title: 'OORT SHELL', sub: 'OUTER REACHES / ICY CLOUD', img: 'https://images-assets.nasa.gov/image/PIA20118/PIA20118~orig.jpg?w=1015&h=1015&fit=clip&crop=faces%2Cfocalpoint' },
  { id: '23', title: 'MARS EXPLORATION', sub: 'PERSEVERANCE / RED PLANET', img: 'https://images.unsplash.com/photo-1701014159024-f9781490a228?q=80&w=1228&auto=format&fit=crop' },
  { id: '24', title: 'ARTEMIS II', sub: 'LUNA RETURN / ORION', img: 'https://cdn.mos.cms.futurecdn.net/L8exumuVUaJatGHCPDRuQm.jpg' },
  { id: '25', title: 'DEEP SPACE EYE', sub: 'JWST / INFRARED FRONTIER', img: 'https://cdn.esawebb.org/archives/images/wallpaper5/weic2216b.jpg' },
  { id: '26', title: 'EUROPA CLIPPER', sub: 'OCEAN WORLD / JUPITER', img: 'https://images-assets.nasa.gov/image/PIA24321/PIA24321~medium.jpg' }
];

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<ContentResponse | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>(['SYSTEM_BOOT_COMPLETE', 'UPLINK_READY', 'RECON_CATALOG_LOADED_v4.9.8']);
  
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const transmissionIntervalRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cosmic_cr8_v2');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startTransmissionSound = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const humOsc = ctx.createOscillator();
      const humGain = ctx.createGain();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(80, ctx.currentTime);
      humGain.gain.setValueAtTime(0.005, ctx.currentTime);
      humOsc.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start();

      const playBlipp = () => {
        if (!loading) return;
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'sine';
        const freqs = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
        const freq = freqs[Math.floor(Math.random() * freqs.length)];
        bOsc.frequency.setValueAtTime(freq, ctx.currentTime);
        bOsc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.04);
        bGain.gain.setValueAtTime(0.012, ctx.currentTime);
        bGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start();
        bOsc.stop(ctx.currentTime + 0.04);
      };

      transmissionIntervalRef.current = setInterval(() => {
        if (Math.random() > 0.5) playBlipp();
      }, 120);

      window._stopTransmission = () => {
        humOsc.stop();
        humOsc.disconnect();
      };
    } catch (e) { console.warn(e); }
  };

  const stopTransmissionSound = () => {
    if (transmissionIntervalRef.current) {
      clearInterval(transmissionIntervalRef.current);
      transmissionIntervalRef.current = null;
    }
    if (window._stopTransmission) {
      window._stopTransmission();
    }
  };

  const playSFX = (type: 'beep' | 'low' | 'pulse') => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'low') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'pulse') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) { console.warn(e); }
  };

  const addLog = (msg: string) => {
    setSystemLogs(prev => [msg, ...prev].slice(0, 20));
  };

  const handleSearch = async (t: string = topic) => {
    const query = t.trim();
    if (!query) return;
    
    setTopic(query);
    setLoading(true);
    setError(null);
    setCurrentResult(null);
    addLog(`SCANNING: ${query.toUpperCase()}`);
    startTransmissionSound();
    
    try {
      const result = await generateSpaceContent(query, ContentMode.FACTS);
      setCurrentResult(result);
      playSFX('beep');
      addLog(`DATA_SYNC: ${query.toUpperCase()} ACQUIRED`);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        topic: query,
        mode: ContentMode.FACTS,
        timestamp: Date.now(),
        content: result
      };
      
      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('cosmic_cr8_v2', JSON.stringify(newHistory));
    } catch (err: any) {
      console.error(err);
      setError(`SIGNAL_LOSS: ${err.message || "RETRY_UPLINK"}`);
      addLog(`ERR: PACKET_LOSS`);
    } finally {
      setLoading(false);
      stopTransmissionSound();
    }
  };

  const telemetrySamples = [
    "HEX_FETCH: 0x4F2A", "LAT_0.02MS", "SOL_RAD: 4.2kW", "GRAV_FLUX: 9.81",
    "PACKET_SYNC: [OK]", "UPLINK_DB: 104.2", "SCAN_AREA: SECTOR_7", "DB_PING: 14ms"
  ];

  return (
    <div className="h-screen w-screen flex flex-col p-4 relative overflow-hidden bg-[#010413]">
      <div className="star-engine"></div>
      <div className="scanline pointer-events-none opacity-5 absolute inset-0 z-[100]"></div>
      
      {/* HUD HEADER */}
      <header className="flex justify-between items-center mb-8 z-50 px-6">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { playSFX('low'); setCurrentResult(null); setTopic(''); }}>
          <div className="relative w-14 h-14 flex items-center justify-center transition-all group-hover:scale-110">
            {/* Branding Container with Glow */}
            <div className="absolute inset-0 rounded-xl border border-cyan-400/40 bg-cyan-900/10 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all"></div>
            <img 
                src="/favicon.png" 
                alt="COSMIC Logo" 
                className="w-10 h-10 relative z-10 logo-glow" 
                onError={(e) => {
                    // Fallback to sophisticated blue glass astronaut helmet SVG
                    (e.target as any).style.display = 'none';
                    (e.target as any).nextSibling.style.display = 'block';
                }}
            />
            {/* Sophisticated Blue Glass Astronaut Helmet SVG */}
            <svg style={{display: 'none'}} className="w-10 h-10 relative z-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] logo-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Outer Helmet Outline */}
              <path d="M12 2C7.58 2 4 5.58 4 10V14C4 15.1 4.9 16 6 16H18C19.1 16 20 15.1 20 14V10C20 5.58 16.42 2 12 2Z" fill="rgba(34,211,238,0.05)"/>
              {/* Visor Area (Blue Glass Effect) */}
              <path d="M6 9C6 7.34 7.34 6 9 6H15C16.66 6 18 7.34 18 9V12C18 13.66 16.66 15 15 15H9C7.34 15 6 13.66 6 12V9Z" fill="rgba(34,211,238,0.3)" stroke="rgba(34,211,238,0.6)" strokeWidth="0.5"/>
              {/* Internal detail */}
              <path d="M10 12L14 12" stroke="rgba(34,211,238,0.5)" strokeWidth="2" strokeLinecap="round"/>
              {/* Breathing filters */}
              <circle cx="8" cy="18" r="1.5" stroke="currentColor" fill="rgba(34,211,238,0.1)"/>
              <circle cx="16" cy="18" r="1.5" stroke="currentColor" fill="rgba(34,211,238,0.1)"/>
              <path d="M12 16L12 19" stroke="currentColor"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-cyan-400 michroma uppercase glow-cyan">COSMIC</span>
              <div className="px-2 py-0.5 rounded border border-purple-500/50 bg-purple-900/20 backdrop-blur-sm">
                <span className="text-xl font-black tracking-tight michroma uppercase text-purple-400">CR8T1V3</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="mono text-emerald-500/80">UPLINK_STABLE</span>
          </div>
        </div>
      </header>

      <section className="text-center mb-8 z-50">
        <div className="max-w-2xl mx-auto explorer-search relative">
          <input 
            type="text" 
            value={topic} 
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            onFocus={() => playSFX('low')}
            placeholder="INPUT_STATION_COORDS..." 
            className="flex-grow bg-transparent border-none outline-none text-white text-lg font-light tracking-widest placeholder:text-slate-700 michroma uppercase"
          />
          <button 
            onClick={() => handleSearch()} 
            onMouseEnter={() => playSFX('low')}
            className="search-trigger group !w-12 !h-12"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </button>
        </div>
        {error && <div className="mt-4 inline-block px-4 py-1.5 bg-red-900/30 border border-red-500 rounded-full text-red-500 mono text-[11px] uppercase">{error}</div>}
      </section>

      <main className="flex-grow flex gap-4 overflow-hidden px-4 mb-4">
        
        {!currentResult && !loading && (
          <div className="flex-grow overflow-y-auto custom-scroll pb-20 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {DISCOVERY_CARDS.map(card => (
                <div key={card.id} onClick={() => handleSearch(card.title)} onMouseEnter={() => playSFX('low')} className="tactical-card group cursor-pointer h-64 relative border border-white/5">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110 opacity-60 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <div className="absolute bottom-5 left-8 right-8 flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-white michroma uppercase glow-cyan leading-tight">{card.title}</h3>
                      <p className="text-[9px] text-cyan-400/50 uppercase tracking-[0.4em] mono mt-1 font-bold">{card.sub}</p>
                    </div>
                    {/* Fixed action button: Matching search trigger aesthetics (circular, neon cyan, glow) */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/10 border border-white/5 group-hover:bg-[#22d3ee] group-hover:text-black group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex-grow flex flex-col items-center justify-center relative">
            <div className="gauge-ring w-24 h-24 mb-10 border-[6px] border-cyan-400/20 border-t-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]"></div>
            <div className="text-center z-50">
              <p className="mono text-cyan-400 text-2xl tracking-[1.2em] michroma uppercase mb-4 loading-dots">LINKING</p>
              <div className="mt-8 w-48 h-12 telemetry-stream relative">
                <div className="telemetry-scroll flex flex-col gap-1">
                  {[...telemetrySamples, ...telemetrySamples].map((t, idx) => (
                    <span key={idx} className="mono text-[8px] text-cyan-400/40 tracking-widest uppercase">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentResult && !loading && (
          <div ref={mainScrollRef} className="flex-grow overflow-y-auto custom-scroll pr-6 pb-20 space-y-8 animate-in fade-in duration-700">
            <div className="tactical-card p-10 bg-black/80 border border-cyan-400/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="mono text-cyan-400 text-[11px] tracking-[0.6em] mb-4 uppercase">UPLINK_ESTABLISHED</p>
                  <h2 className="text-4xl font-black uppercase tracking-tighter michroma text-white glow-cyan italic leading-tight">{currentResult.hook}</h2>
                </div>
                <button onClick={() => { playSFX('low'); setCurrentResult(null); }} className="p-3 border border-red-500/20 hover:border-red-500 text-red-500 transition-all rounded-full bg-black/40">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {currentResult.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] mono text-slate-400 hover:text-cyan-400 border border-white/10 px-4 py-1.5 bg-white/5 transition-all uppercase rounded-full">
                    REF_{i+1}: {s.title.slice(0, 18)}...
                  </a>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentResult.sections.map((sec, idx) => (
                <div key={idx} className={`tactical-card p-8 bg-black/50 ${sec.type === 'lore' ? 'lg:col-span-2' : ''}`}>
                  <h4 className="michroma text-[11px] text-purple-400 mb-6 uppercase tracking-[0.5em] flex items-center justify-between border-b border-purple-400/20 pb-4">
                    <span className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">{sec.title}</span>
                  </h4>
                  <ul className="space-y-5">
                    {sec.content.map((item, i) => (
                      <li key={i} onMouseEnter={() => playSFX('low')} className="text-white/90 leading-relaxed font-light pl-6 border-l border-white/10 flex gap-4 hover:border-cyan-400 transition-colors group cursor-default">
                        <span className="mono text-[13px] text-cyan-400/40 font-black group-hover:text-cyan-400">#0{i+1}</span>
                        <span className="text-lg tracking-wide font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <aside className="hidden lg:flex flex-col w-[360px] gap-4 overflow-y-auto custom-scroll pr-1">
          <div className="tactical-card p-6 bg-black/60 border border-white/5 flex flex-col h-1/2">
             <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white michroma mb-5">Station Logs</h2>
             <div className="flex-grow overflow-y-auto custom-scroll pr-2 flex flex-col gap-3 mono text-[11px]">
               {systemLogs.map((log, i) => (
                 <div key={i} className={`p-2.5 border-l-2 ${log.includes('ERR') ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-cyan-400/40 text-cyan-400/70'} uppercase tracking-tighter`}>
                   [{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] &gt; {log}
                 </div>
               ))}
             </div>
          </div>
          
          {history.length > 0 && (
            <div className="tactical-card p-6 bg-black/60 border border-white/5 flex flex-col h-1/2 overflow-hidden">
               <p className="text-[9px] text-slate-500 mb-3 tracking-[0.3em] font-black uppercase">RECON_HIST</p>
               <div className="overflow-y-auto custom-scroll pr-2">
                 {history.map(item => (
                   <div key={item.id} onClick={() => { playSFX('pulse'); setCurrentResult(item.content); setTopic(item.topic); }} className="p-3 bg-white/5 hover:bg-cyan-400/10 border border-white/5 hover:border-cyan-400/30 rounded-sm cursor-pointer transition-all mb-2 flex justify-between items-center group">
                     <span className="text-white/60 group-hover:text-cyan-400 text-[11px] michroma uppercase truncate pr-2">{item.topic.toUpperCase()}</span>
                     <svg className="w-3 h-3 text-cyan-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m9 18 6-6-6-6"/></svg>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default App;