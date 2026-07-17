import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./Globe"; // Points directly to your Globe.jsx in src/

import {
  ShieldAlert, LayoutDashboard, Network, HardDrive,
  BrainCircuit, Sparkles, Fingerprint, Crosshair, Server, Database
} from 'lucide-react';

const WS_URL = 'ws://127.0.0.1:8000/ws/v1/telemetry';

// Default shape mirrors backend STATE exactly, so the UI never has to
// guard against undefined fields before the first message arrives.
const DEFAULT_METRICS = {
  packets_per_sec: 0,
  bandwidth_mbps: 0,
  active_connections: 0,
  blocked_ips_count: 0,
  threat_score: 0,
  cpu_load_pct: 0,
  last_updated: null,
};

const SEVERITY_COLOR = {
  low: "#3b82f6",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#ef4444",
};

// ==========================================
// INTERNALIZED SUB-COMPONENTS
// ==========================================
function BlockchainLedger({ ledgerChain }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden px-2 py-2">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <ShieldAlert className="text-blue-500" size={16} />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Immutable Audit Ledger</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {ledgerChain.length > 0 ? (
          [...ledgerChain].reverse().map((block) => {
            const alertColor = SEVERITY_COLOR[block.data?.severity] || "#a855f7";
            const timeLabel = block.timestamp ? block.timestamp.split("T")[1]?.slice(0, 8) : "Active";
            return (
              <div
                key={block.index}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all font-mono text-[11px] relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: alertColor }} />
                <div className="flex justify-between items-start mb-2 pl-2">
                  <span className="font-bold tracking-tight uppercase truncate max-w-[180px]" style={{ color: alertColor }}>
                    {block.data?.event || 'system_audit_block'}
                  </span>
                  <span className="text-[9px] text-gray-600">{timeLabel}</span>
                </div>
                <div className="space-y-1 pl-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>SRC_NODE:</span>
                    <span className="text-gray-300">{block.data?.source_ip || "Internal"}</span>
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
          liveAlerts.map((alert) => (
            <div key={alert.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl font-mono text-xs flex justify-between items-center">
              <div>
                <span
                  className="font-bold uppercase block mb-1"
                  style={{ color: SEVERITY_COLOR[alert.severity] || "#a855f7" }}
                >
                  {alert.type}
                </span>
                <span className="text-gray-500">{alert.source_ip} · {alert.severity}</span>
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

function NetworkNodesPage({ nodes }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {nodes.map((node) => {
        const isOnline = node.status === 'online';
        const color = isOnline ? 'text-green-400' : 'text-gray-400';
        return (
          <div key={node.id} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 font-mono text-xs">
            <div className="flex justify-between items-start mb-6">
              <Server className={color} size={24} />
              <span className={`text-[10px] uppercase font-bold px-3 py-1 bg-white/5 rounded-full ${color}`}>{node.status}</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">{node.name}</h4>
            <p className="text-gray-500 mb-4">{node.id} · load {node.load_pct}%</p>
          </div>
        );
      })}
    </motion.div>
  );
}

function AssetGuardPage({ assetGuard }) {
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
              <th className="pb-4 font-bold">Monitored Asset</th>
              <th className="pb-4 font-bold">Policy Evaluation</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 divide-y divide-white/5">
            {assetGuard.map((asset) => (
              <tr key={asset.id}>
                <td className="py-4 text-white">{asset.name}</td>
                <td className="py-4 text-green-400">✓ {asset.status}</td>
              </tr>
            ))}
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
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [alerts, setAlerts] = useState([]);
  const [blockchain, setBlockchain] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [assetGuard, setAssetGuard] = useState([]);
  const [wsStatus, setWsStatus] = useState('connecting');

  // Single native WebSocket connection. The backend pushes the full STATE
  // snapshot every 0.5s, so this is the only data source the UI needs.
  useEffect(() => {
    let ws;
    let reconnectTimer;
    let unmounted = false;

    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => setWsStatus('open');

      ws.onmessage = (event) => {
        try {
          const state = JSON.parse(event.data);
          setMetrics(state.metrics || DEFAULT_METRICS);
          setAlerts(state.alerts || []);
          setBlockchain(state.blockchain || []);
          setNodes(state.nodes || []);
          setAssetGuard(state.asset_guard || []);
        } catch (err) {
          console.error("Telemetry parse error:", err);
        }
      };

      ws.onclose = () => {
        setWsStatus('reconnecting');
        if (!unmounted) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  const statusLine = wsStatus === 'open'
    ? `[TELEMETRY LIVE] BW ${metrics.bandwidth_mbps} Mbps · CPU ${metrics.cpu_load_pct}%`
    : '[TELEMETRY] Reconnecting to backend...';

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
                <span className="text-gray-400">{statusLine}</span>
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
                      <Globe />
                      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
                    </Canvas>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-[#05070a] p-6 rounded-[2.5rem] h-[480px] border border-white/5 flex flex-col overflow-hidden">
                  <BlockchainLedger ledgerChain={blockchain} />
                </div>
              </div>

              {/* DYNAMIC METRIC TILES */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
                {[
                  { key: 'packets_per_sec', label: 'Packets / Sec', color: 'bg-red-500' },
                  { key: 'active_connections', label: 'Active Connections', color: 'bg-blue-500' },
                  { key: 'blocked_ips_count', label: 'Blocked IPs', color: 'bg-amber-500' },
                  { key: 'threat_score', label: 'Threat Score', color: 'bg-emerald-500' }
                ].map(item => (
                  <div key={item.key} className="bg-[#0b1220]/80 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-2">{item.label}</p>
                    <div className="flex items-center justify-between">
                      <h4 className="text-2xl font-black text-white">{metrics[item.key]}</h4>
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
                    {alerts.slice(0, 6).map((alert) => (
                      <div key={alert.id} className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400 truncate max-w-[280px]">{alert.type}</span>
                        <span className="font-bold" style={{ color: SEVERITY_COLOR[alert.severity] || "#a855f7" }}>
                          {alert.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#05070a] border border-white/5 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold mb-4 uppercase text-[10px]">Active Vector Sources</h4>
                  <div className="space-y-2">
                    {alerts.slice(0, 6).map((alert) => (
                      <div key={alert.id} className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">{alert.source_ip}</span>
                        <span className="text-blue-400 font-bold">{alert.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'Threat Intel' ? (
            <ThreatIntelPage liveAlerts={alerts} />
          ) : activeTab === 'Network Nodes' ? (
            <NetworkNodesPage nodes={nodes} />
          ) : (
            <AssetGuardPage assetGuard={assetGuard} />
          )}
        </div>
      </main>
    </div>
  );
}
