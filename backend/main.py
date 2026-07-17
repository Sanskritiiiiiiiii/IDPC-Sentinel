"""
IDPS Sentinel - Backend

- Global STATE dict (metrics, alerts, blockchain ledger, nodes, asset guard)
- Background asyncio task ticks STATE every 0.5s
- packets_per_sec / bandwidth_mbps are pulled from real host NIC counters
  via psutil.net_io_counters(); everything else remains lightweight
  simulated telemetry
- Static REST GET routes + a WebSocket route expose the current STATE
"""

import asyncio
import hashlib
import random
import socket
import time
from datetime import datetime, timezone

import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Architectural bridges to the planned AI + Hyperledger layers. Swap these
# imports for the real modules later — see the docstring in each mock file.
from ai_engine_mock import predict_attack
from blockchain_logger_mock import record_attack_event

# ---------------------------------------------------------------------------
# GLOBAL STATE
# ---------------------------------------------------------------------------
# Everything the frontend needs lives here. The background worker mutates
# this dict in place; GET routes just read a snapshot of it.

STATE = {
    "metrics": {
        "packets_per_sec": 200,
        "bandwidth_mbps": 12.5,
        "active_connections": 340,
        "blocked_ips_count": 0,
        "threat_score": 5,          # 0-100 composite risk score
        "cpu_load_pct": 18.0,
        "last_updated": None,
    },
    "alerts": [],        # most recent first, capped list
    "blockchain": [],    # append-only ledger, index 0 = genesis
    "blocked_ips": [],   # active mitigation / null-route list, most recent first
    "nodes": [
        {"id": "node-alpha", "name": "Edge Node Alpha", "status": "online", "load_pct": 22.0},
        {"id": "node-beta", "name": "Edge Node Beta", "status": "online", "load_pct": 31.0},
        {"id": "node-gateway", "name": "Core Gateway", "status": "online", "load_pct": 44.0},
    ],
    "asset_guard": [
        {"id": "asset-db01", "name": "Primary DB Cluster", "status": "protected"},
        {"id": "asset-web01", "name": "Web Tier", "status": "protected"},
        {"id": "asset-auth01", "name": "Auth Service", "status": "protected"},
    ],
}

MAX_ALERTS = 50
MAX_BLOCKS = 200
MAX_BLOCKED_IPS = 200
FLOOD_THRESHOLD_PPS = 1500

# baseline for real network delta measurement (psutil.net_io_counters is
# cumulative since boot, so we diff it against the previous tick)
_last_net_io = psutil.net_io_counters()
_last_net_time = time.monotonic()

# psutil.cpu_percent() reports usage since its *previous* call, so prime it
# once here; every call inside the loop afterward gives a real delta.
psutil.cpu_percent()

# edge-trigger flag so a sustained flood only raises one alert, not one
# every 0.5s tick while traffic stays above threshold
_flood_alert_active = False


def _local_ip() -> str:
    """Best-effort real, non-loopback IPv4 address of this host."""
    try:
        for addrs in psutil.net_if_addrs().values():
            for addr in addrs:
                if addr.family == socket.AF_INET and not addr.address.startswith("127."):
                    return addr.address
    except Exception:
        pass
    return "127.0.0.1"


def _genesis_block() -> dict:
    payload = "GENESIS-IDPS-SENTINEL"
    return {
        "index": 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {"event": "ledger_initialized"},
        "prev_hash": "0" * 64,
        "hash": hashlib.sha256(payload.encode()).hexdigest(),
    }


def _new_block(event_data: dict) -> dict:
    prev = STATE["blockchain"][-1] if STATE["blockchain"] else _genesis_block()
    index = prev["index"] + 1
    timestamp = datetime.now(timezone.utc).isoformat()
    block_content = f'{index}{timestamp}{event_data}{prev["hash"]}'
    block_hash = hashlib.sha256(block_content.encode()).hexdigest()
    return {
        "index": index,
        "timestamp": timestamp,
        "data": event_data,
        "prev_hash": prev["hash"],
        "hash": block_hash,
    }


def _tick_metrics() -> None:
    """Pull real packets/sec + bandwidth from the host NIC counters; keep
    the remaining fields as lightweight simulated telemetry."""
    global _last_net_io, _last_net_time
    m = STATE["metrics"]

    current_io = psutil.net_io_counters()
    now = time.monotonic()
    dt = max(now - _last_net_time, 0.001)  # guard against div-by-zero

    packets_delta = (current_io.packets_sent + current_io.packets_recv) - (
        _last_net_io.packets_sent + _last_net_io.packets_recv
    )
    bytes_delta = (current_io.bytes_sent + current_io.bytes_recv) - (
        _last_net_io.bytes_sent + _last_net_io.bytes_recv
    )

    m["packets_per_sec"] = max(0, int(packets_delta / dt))
    m["bandwidth_mbps"] = round(max(0.0, (bytes_delta * 8 / 1_000_000) / dt), 2)

    _last_net_io = current_io
    _last_net_time = now

    try:
        m["active_connections"] = len(psutil.net_connections())
    except Exception:
        pass  # keep previous value if the platform denies this call

    m["cpu_load_pct"] = round(min(99.0, max(3.0, m["cpu_load_pct"] + random.uniform(-3, 3))), 1)

    # threat score now drifts off the real packet rate instead of a
    # synthetic spike flag
    drift = random.uniform(-2, 2) + (6 if m["packets_per_sec"] > FLOOD_THRESHOLD_PPS else -1)
    m["threat_score"] = int(min(100, max(0, m["threat_score"] + drift)))

    m["last_updated"] = datetime.now(timezone.utc).isoformat()


def _maybe_raise_alert() -> None:
    """Fire one high-severity flood alert when real packets_per_sec crosses
    the threshold; reset once traffic falls back below it (edge-triggered,
    so a sustained flood doesn't spam an alert every tick)."""
    global _flood_alert_active
    m = STATE["metrics"]

    if m["packets_per_sec"] <= FLOOD_THRESHOLD_PPS:
        _flood_alert_active = False
        return

    if _flood_alert_active:
        return  # already reported this ongoing flood

    # --- AI Detection & Behavioral Analysis Layer bridge ---
    # Feed the real threshold-crossing traffic into the model for
    # confirmation, matching the blueprint's detection flow. The mock
    # always confirms True today; a real model may veto false positives.
    packet_data = {
        "packets_per_sec": m["packets_per_sec"],
        "bandwidth_mbps": m["bandwidth_mbps"],
        "active_connections": m["active_connections"],
    }
    if not predict_attack(packet_data):
        return  # AI layer did not confirm this as an attack

    _flood_alert_active = True
    host_ip = _local_ip()
    severity = "high"
    alert = {
        "id": f"alt-{int(time.time() * 1000)}-{random.randint(100, 999)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_ip": host_ip,
        "dest_ip": host_ip,
        "type": "UDP/TCP Traffic Flood Detected",
        "severity": severity,
        "status": "detected",
    }
    STATE["alerts"].insert(0, alert)
    if len(STATE["alerts"]) > MAX_ALERTS:
        STATE["alerts"].pop()

    # --- automated response: null-route the offending IP ---
    block_entry = {
        "ip": host_ip,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "reason": "UDP/TCP Traffic Flood Detected",
        "alert_id": alert["id"],
        "action": "null-routed",
    }
    STATE["blocked_ips"].insert(0, block_entry)
    if len(STATE["blocked_ips"]) > MAX_BLOCKED_IPS:
        STATE["blocked_ips"].pop()

    # mutate the same alert object in place so the dashboard sees it flip
    # from "detected" to "blocked" once mitigation has been applied
    alert["status"] = "blocked"

    STATE["metrics"]["blocked_ips_count"] = len(STATE["blocked_ips"])

    block = _new_block({
        "event": "traffic_flood_detected",
        "source_ip": host_ip,
        "severity": severity,
        "alert_id": alert["id"],
        "packets_per_sec": m["packets_per_sec"],
        "action": "null-routed",
    })
    STATE["blockchain"].append(block)
    if len(STATE["blockchain"]) > MAX_BLOCKS:
        STATE["blockchain"].pop(0)

    # --- Blockchain Logging & Security Ledger layer bridge ---
    # Mirrors the same event to the (eventual) Hyperledger Fabric ledger.
    # The internal STATE["blockchain"] hash-chain above remains the live
    # local ledger the dashboard reads from; this call is the bridge point
    # for the real distributed ledger described in the blueprint.
    record_attack_event(block["data"])


def _tick_nodes() -> None:
    for node in STATE["nodes"]:
        if node["id"] == "node-gateway":
            # Core Gateway node reflects real host CPU utilization
            node["load_pct"] = round(psutil.cpu_percent(), 1)
        else:
            # edge nodes stay simulated network endpoints
            node["load_pct"] = round(min(99.0, max(2.0, node["load_pct"] + random.uniform(-4, 4))), 1)


async def background_worker() -> None:
    """Single long-lived task that mutates STATE every 0.5s."""
    if not STATE["blockchain"]:
        STATE["blockchain"].append(_genesis_block())

    while True:
        _tick_metrics()
        _tick_nodes()
        _maybe_raise_alert()
        await asyncio.sleep(0.5)


# ---------------------------------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------------------------------

app = FastAPI(title="IDPS Sentinel Backend", version="0.1.0-milestone1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this once the frontend origin is fixed
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    asyncio.create_task(background_worker())


@app.get("/api/v1/dashboard/metrics")
async def get_metrics():
    return {
        "metrics": STATE["metrics"],
        "nodes": STATE["nodes"],
        "asset_guard": STATE["asset_guard"],
    }


@app.get("/api/v1/threat/alerts")
async def get_alerts():
    return {"alerts": STATE["alerts"]}


@app.get("/api/v1/blockchain/ledger")
async def get_ledger():
    return {"blockchain": STATE["blockchain"]}


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


@app.websocket("/ws/v1/telemetry")
async def ws_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(STATE)
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass
