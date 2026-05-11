import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./Globe"; 
import { 
  ShieldAlert, Activity, Cpu, Zap, LayoutDashboard, Network, 
  HardDrive, Bell, Search, Terminal, BrainCircuit, Sparkles, 
  AlertTriangle, Fingerprint, Crosshair 
} from 'lucide-react';

function App() {
  const [logs, setLogs] = useState([]);
  const [aiInsight, setAiInsight] = useState("Initializing IDPS Sentinel... Awaiting packet ingress.");
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    const attackTypes = [
      { event: 'DDoS Synergy-7', severity: 'High', msg: 'Anomalous traffic spike on port 80. Pattern matches Synergy-7 signature.' },
      { event: 'Brute Force Attempt', severity: 'High', msg: 'Multiple auth failures on Node-04. Initiating defensive lockout.' },
      { event: 'SQL Injection', severity: 'High', msg: 'Malicious query string detected in header. Neutralizing payload.' },
      { event: 'Baseline Scan', severity: 'Low', msg: 'Standard heuristic sweep completed. No threats identified.' }
    ];

    const simulate = () => {
      const incident = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      setLogs(prev => [{
        source_ip: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
        event: incident.event,
        severity: incident.severity,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
      setAiInsight(`IDPS ANALYSIS: ${incident.msg}`);
    };

    const interval = setInterval(simulate, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#020408] text-gray-200 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-white/5 flex flex-col py-10 bg-[#05070a]/80 backdrop-blur-2xl z-30">
        <div className="px-10 mb-16 text-center group">
          <div className="relative inline-block">
            <ShieldAlert className="text-blue-500 mx-auto mb-3 transition-transform group-hover:scale-110 duration-500" size={48} />
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">IDPS SENTINEL</h1>
          <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-blue-500/50 mt-1">Defense Protocol v4.0</p>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Threat Intel', icon: BrainCircuit },
            { name: 'Network Nodes', icon: Network },
            { name: 'Asset Guard', icon: HardDrive }
          ].map((item) => (
            <div 
              key={item.name} 
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center gap-4 px-6 py-4 cursor-pointer rounded-2xl transition-all border border-transparent ${
                activeTab === item.name ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.05)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="px-6 mt-auto">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase text-blue-400">Sentinel Active</span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold leading-tight">Master node secure. Haridwar_Alpha Online.</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#0a1224,_#020408)]">
        
        <header className="px-12 py-8 border-b border-white/5 flex justify-between items-center backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <Crosshair className="text-blue-500" size={20} />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Master Control Node</h2>
              <p className="text-sm font-black text-white tracking-tight">IDPS-ALPHA-PRIME // HARIDWAR_SEC</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
             <Bell size={18} className="text-gray-500 hover:text-blue-400 cursor-pointer transition-colors" />
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 group focus-within:border-blue-500/50 transition-all">
              <Search size={14} className="text-gray-500 group-hover:text-blue-400" />
              <input className="bg-transparent border-none outline-none text-[11px] w-64 placeholder:text-gray-600" placeholder="Analyze packet signature..." />
            </div>
          </div>
        </header>

        <div className="p-12 space-y-10 max-w-7xl mx-auto w-full">
          
          {/* AI CONSOLE */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={aiInsight}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative p-[1px] rounded-[3rem] bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-600 shadow-[0_0_60px_rgba(37,99,235,0.15)] group"
            >
              <div className="bg-[#05070a]/95 rounded-[2.9rem] p-10 flex flex-col lg:flex-row items-center gap-10 border border-white/5 backdrop-blur-3xl">
                <div className="relative">
                  <div className="p-6 bg-blue-500/10 rounded-[2rem] border border-blue-500/20">
                    <BrainCircuit className="text-blue-400 animate-pulse" size={40} />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 text-cyan-400 animate-bounce" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                     <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">IDPS Heuristic Intelligence</h3>
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
                  </div>
                  <p className="text-xl text-gray-200 font-medium italic tracking-tight italic">
                    "{aiInsight}"
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* THREAT GEOGRAPHY */}
            <div className="lg:col-span-8 relative group p-[1px] bg-white/5 rounded-[3rem] overflow-hidden">
              <div className="bg-[#080c14] p-10 rounded-[2.9rem] h-[550px] border border-white/10 relative">
                <div className="flex justify-between items-center mb-8 relative z-20">
                  <div className="flex items-center gap-4">
                    <Terminal size={18} className="text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Neural Threat Localization</h3>
                    <AlertTriangle size={14} className="text-amber-500 animate-pulse" />
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 tracking-widest animate-pulse">3D_ACTIVE</div>
                </div>
                
                <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
                  <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                    <Globe />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                  </Canvas>
                </div>
              </div>
            </div>

            {/* DPI REAL-TIME STREAM */}
            <div className="lg:col-span-4 relative group p-[1px] bg-white/5 rounded-[3rem] overflow-hidden">
              <div className="bg-[#05070a] p-8 rounded-[2.9rem] h-[550px] border border-white/10 relative flex flex-col">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Fingerprint size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Packet Deep Scan</span>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                  </div>
                </div>
                <div className="flex-1 font-mono text-[10px] space-y-2 overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                  {logs.map((log, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${log.severity === 'High' ? 'border-red-500/20 bg-red-500/5' : 'border-white/5'}`}>
                      <div className="flex justify-between mb-1">
                        <span className={log.severity === 'High' ? 'text-red-400' : 'text-blue-400'}>{log.event}</span>
                        <span className="text-gray-600">{log.time}</span>
                      </div>
                      <div className="text-gray-500 truncate">SRC: {log.source_ip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HUD METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
            {[
              { label: 'Network Integrity', val: '99.9%', icon: Activity },
              { label: 'Neural Load', val: '14.2%', icon: Cpu },
              { label: 'Response Time', val: '2ms', icon: Zap }
            ].map((s, i) => (
              <div key={i} className="relative group p-[1px] bg-white/5 rounded-[2.5rem] transition-all hover:scale-105 duration-500">
                <div className="bg-[#0b1220]/80 backdrop-blur-xl p-10 rounded-[2.4rem] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/30 rounded-tl-3xl" />
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-[0.3em]">{s.label}</p>
                  <div className="flex items-end justify-between">
                    <h4 className="text-4xl font-black text-white tracking-tighter">{s.val}</h4>
                    <div className="p-4 rounded-[1.2rem] bg-blue-500/10 border border-blue-500/20">
                      <s.icon size={24} className="text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
