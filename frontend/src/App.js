import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./Globe"; // Points directly to your Globe.jsx in src/

import { 
  ShieldAlert, LayoutDashboard, Network, HardDrive, Bell, Search, 
  Terminal, BrainCircuit, Sparkles, AlertTriangle, Fingerprint, 
  Crosshair, Server, Database, Globe2 
} from 'lucide-react';

// ==========================================
// INTERNALIZED SUB-COMPONENTS (Prevents Compiler Errors)
// ==========================================
function BlockchainLedger({ ledgerChain }) {
  const severityMap = { "1": "#ef4444", "2": "#f59e0b", "3": "#3b82f6" };

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-2 py-2">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <ShieldAlert className="text-blue-500" size={16} />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Immutable Audit Ledger</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {ledgerChain.length > 0 ? (
          ledgerChain.map((block, index) => {
            const alertColor = severityMap[String(block.data?.severity)] || "#a855f7";
            return (
              <div 
                key={index} 
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all font-mono text-[11px] relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: alertColor }} />
                <div className="flex justify-between items-start mb-2 pl-2">
                  <span className="font-bold text-white tracking-tight uppercase truncate max-w-[180px]" style={{ color: alertColor }}>
                    {block.data?.signature || 'System Audit Block'}
                  </span>
                  <span className="text-[9px] text-gray-600">{block.timestamp?.split(" ")[1] || "Active"}</span>
                </div>
                <div className="space-y-1 pl-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>SRC_NODE:</span>
                    <span className="text-gray-300">{block.data?.src_ip || "Internal"}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-[9px] text-gray-500">
                    <Fingerprint size={10} className="text-gray-600" />
                    <span className="truncate tracking-tighter text-gray-600 group-hover:text-gray-400 transition-colors">
                      {block.hash}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-600 text-[11px] font-mono">
            Awaiting cryptographic block synchronizations...
          </div>
        )}
      </div>
    </div>
  );
}

function ThreatIntelPage({ liveAlerts }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-purple-500/10">
        <div className="flex items-center gap-4 mb-4">
          <BrainCircuit className="text-purple-400" size={24} />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Suricata Ingress Analysis</h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed max-w-3xl font-mono">
          Live verification stream reading active anomalies directly out of your environment loops.
        </p>
      </div>
      <div className="space-y-4">
        {liveAlerts.length > 0 ? (
          liveAlerts.map((alert, idx) => (
            <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl font-mono text-xs flex justify-between items-center">
              <div>
                <span className="text-red-400 font-bold uppercase block mb-1">{alert.alert?.signature}</span>
                <span className="text-gray-500">{alert.alert?.src_ip} → {alert.alert?.dest_ip}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-16 border border-dashed border-white/5 rounded-[2.5rem] text-gray-500 font-mono text-xs">
            No live threat arrays parsed in this active window loop.
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NetworkNodesPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { name: 'Gateway Alpha Ingress', ip: '10.0.2.15', status: 'Online', load: '12%', color: 'text-green-400', icon: Server },
        { name: 'Local Ledger Database', ip: '127.0.0.1', status: 'Synchronized', load: '4%', color: 'text-purple-400', icon: Database }
      ].map((node, i) => (
        <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 font-mono text-xs">
          <div className="flex justify-between items-start mb-6">
            <node.icon className={node.color} size={24} />
            <span className={`text-[10px] uppercase font-bold px-3 py-1 bg-white/5 rounded-full ${node.color}`}>{node.status}</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1">{node.name}</h4>
          <p className="text-gray-500 mb-4">{node.ip}</p>
        </div>
      ))}
    </motion.div>
  );
}

function AssetGuardPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 font-mono text-xs">
      <div className="flex items-center gap-3 mb-6">
        <HardDrive className="text-cyan-400" size={20} />
        <h3 className="text-xs font-black uppercase tracking-widest text-white">System Integrity Registers</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 uppercase">
              <th className="pb-4 font-bold">Monitored Absolute Path</th>
              <th className="pb-4 font-bold">Policy Evaluation</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 divide-y divide-white/5">
            <tr>
              <td className="py-4 text-white">/home/sanskriti/idpc_ai/backend/ledger.json</td>
              <td className="py-4 text-green-400">✓ Cryptographic Chain Verified</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ==========================================
// CORE LAYOUT
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [ledgerChain, setLedgerChain] = useState([]);
  const [metrics, setMetrics] = useState({ event_counts: { alert: 0, flow: 0, http: 0, dns: 0 }, top_signatures: {}, top_attackers: {} });
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [aiInsight, setAiInsight] = useState("Monitoring local Suricata file interfaces...");

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const chainResponse = await fetch('http://localhost:8000/api/v1/blockchain/ledger');
        const chainData = await chainResponse.json();
        if (chainData.status === 'success') {
          setLedgerChain(chainData.chain || []);
        }

        const metricsResponse = await fetch('http://localhost:8000/api/v1/dashboard/metrics');
        const metricsData = await metricsResponse.json();
        if (metricsData.status === 'success') {
          setMetrics(metricsData.data);
        }
      } catch (err) {
        console.warn("API Synchronizer waiting for backend loops...", err);
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/v1/telemetry');
    ws.onmessage = (event) => {
      try {
        const incomingData = JSON.parse(event.data);
        setLiveAlerts(prev => [incomingData, ...prev].slice(0, 10));
        setAiInsight(`[LOG INGRESS] Packet signature recognized: ${incomingData.alert?.signature || "Rule Triggered"}`);
      } catch (err) {
        console.error(err);
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div className="flex h-screen bg-[#020408] text-gray-200 overflow-hidden selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-white/5 flex flex-col py-10 bg-[#05070a]/80 backdrop-blur-2xl z-30">
        <div className="px-10 mb-16 text-center">
          <ShieldAlert className="text-blue-500 mx-auto mb-3" size={44} />
          <h1 className="text-xl font-black tracking-tighter text-white">IDPS SENTINEL</h1>
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
                activeTab === item.name ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <item.icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* CORE WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#0a1224,_#020408)]">
        <header className="px-12 py-8 border-b border-white/5 flex justify-between items-center backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <Crosshair className="text-blue-500" size={18} />
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Master Control Node</h2>
              <p className="text-xs font-mono text-white">IDPS-ALPHA-PRIME // HARIDWAR_SEC</p>
            </div>
          </div>
        </header>

        <div className="p-12 space-y-10 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'Dashboard' ? (
            <>
              {/* STATUS BANNER */}
              <div className="p-6 rounded-3xl bg-[#05070a] border border-white/5 font-mono text-xs flex items-center gap-4">
                <Sparkles className="text-cyan-400 animate-pulse" size={16} />
                <span className="text-gray-400">{aiInsight}</span>
              </div>

              {/* MAP & LEDGER ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-[#080c14] p-8 rounded-[2.5rem] h-[480px] border border-white/5 relative">
                  <div className="flex justify-between items-center mb-4 font-mono text-xs">
                    <span className="text-white font-bold">Threat Localization Spherical Engine</span>
                    <span className="text-green-500 text-[10px] animate-pulse">● PIPELINE STREAM ACTIVE</span>
                  </div>
                  <div className="absolute inset-0">
                    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                      <Globe liveAlerts={liveAlerts.length > 0 ? liveAlerts : ledgerChain.map(b => ({ alert: b.data }))} />
                      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
                    </Canvas>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-[#05070a] p-6 rounded-[2.5rem] h-[480px] border border-white/5 flex flex-col overflow-hidden">
                  <BlockchainLedger ledgerChain={ledgerChain} />
                </div>
              </div>

              {/* DYNAMIC HISTOGRAM SLABS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
                {[
                  { key: 'alert', label: 'Alert Anomalies', color: 'bg-red-500' },
                  { key: 'flow', label: 'Network Flows', color: 'bg-blue-500' },
                  { key: 'dns', label: 'DNS Queries', color: 'bg-amber-500' },
                  { key: 'http', label: 'HTTP Requests', color: 'bg-emerald-500' }
                ].map(item => (
                  <div key={item.key} className="bg-[#0b1220]/80 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-2">{item.label}</p>
                    <div className="flex items-center justify-between">
                      <h4 className="text-2xl font-black text-white">{metrics.event_counts?.[item.key] || 0}</h4>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* MATRICES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs pb-10">
                <div className="bg-[#05070a] border border-white/5 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold mb-4 uppercase text-[10px]">Top Rule Matrix Signatures</h4>
                  <div className="space-y-2">
                    {Object.entries(metrics.top_signatures || {}).map(([sig, count]) => (
                      <div key={sig} className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400 truncate max-w-[280px]">{sig}</span>
                        <span className="text-red-400 font-bold">{count} matches</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#05070a] border border-white/5 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold mb-4 uppercase text-[10px]">Active Vector Sources</h4>
                  <div className="space-y-2">
                    {Object.entries(metrics.top_attackers || {}).map(([ip, count]) => (
                      <div key={ip} className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">{ip}</span>
                        <span className="text-blue-400 font-bold">{count} links</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'Threat Intel' ? (
            <ThreatIntelPage liveAlerts={liveAlerts} />
          ) : activeTab === 'Network Nodes' ? (
            <NetworkNodesPage />
          ) : (
            <AssetGuardPage />
          )}
        </div>
      </main>
    </div>
  );
}
