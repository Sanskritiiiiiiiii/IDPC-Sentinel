"""
IDPS Sentinel - Backend
Milestone 1: Baseline Backend Setup

- Global STATE dict (metrics, alerts, blockchain ledger, nodes, asset guard)
- Single asyncio background task fluctuates STATE every 0.5s
- Static REST GET routes expose current STATE snapshot

Deliberately lean: no DB, no auth, no extra libs beyond FastAPI/uvicorn.
Everything lives in-memory in STATE. This is the foundation Milestone 2
will stream over a WebSocket instead of polling.
"""

import asyncio
import hashlib
import random
import time
from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

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

ALERT_SEVERITIES = ["low", "medium", "high", "critical"]
ALERT_TYPES = [
    "Port Scan Detected",
    "Anomalous Packet Burst",
    "Suspicious Protocol Behavior",
    "Repeated Connection Failures",
    "Unusual Source Geolocation",
]

MAX_ALERTS = 50
MAX_BLOCKS = 200

# in-flight "spike" state so packets/sec moves in realistic bursts rather
# than pure random noise every tick
_spike_ticks_remaining = 0


def _random_ip() -> str:
    """Generate a plausible-looking public IPv4 address."""
    first = random.choice([203, 45, 88, 112, 61, 178, 91, 130])
    return f"{first}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"


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
    """Advance packets/sec with occasional spikes, plus jitter on the rest."""
    global _spike_ticks_remaining
    m = STATE["metrics"]

    if _spike_ticks_remaining > 0:
        target = random.randint(2500, 5000)
        _spike_ticks_remaining -= 1
    else:
        target = random.randint(180, 260)
        # ~4% chance per tick to enter a spike window
        if random.random() < 0.04:
            _spike_ticks_remaining = random.randint(4, 10)

    # smooth toward target instead of jumping, so the graph looks organic
    m["packets_per_sec"] = int(m["packets_per_sec"] + (target - m["packets_per_sec"]) * 0.5)
    m["packets_per_sec"] = max(0, m["packets_per_sec"])

    m["bandwidth_mbps"] = round(max(0.5, m["packets_per_sec"] * 0.0065 + random.uniform(-1, 1)), 2)
    m["active_connections"] = max(0, m["active_connections"] + random.randint(-15, 20))
    m["cpu_load_pct"] = round(min(99.0, max(3.0, m["cpu_load_pct"] + random.uniform(-3, 3))), 1)

    # threat score drifts, but leans higher while a packet spike is active
    drift = random.uniform(-2, 2) + (6 if _spike_ticks_remaining > 0 else -1)
    m["threat_score"] = int(min(100, max(0, m["threat_score"] + drift)))

    m["last_updated"] = datetime.now(timezone.utc).isoformat()


def _maybe_raise_alert() -> None:
    """Randomly emit an alert, biased toward firing during packet spikes."""
    m = STATE["metrics"]
    base_chance = 0.03
    if m["packets_per_sec"] > 1500:
        base_chance = 0.35

    if random.random() >= base_chance:
        return

    severity = random.choice(ALERT_SEVERITIES)
    source_ip = _random_ip()
    alert = {
        "id": f"alt-{int(time.time() * 1000)}-{random.randint(100, 999)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_ip": source_ip,
        "type": random.choice(ALERT_TYPES),
        "severity": severity,
        "status": "open",
    }
    STATE["alerts"].insert(0, alert)
    if len(STATE["alerts"]) > MAX_ALERTS:
        STATE["alerts"].pop()

    # high/critical alerts count as a block and bump blocked_ips_count
    if severity in ("high", "critical"):
        STATE["metrics"]["blocked_ips_count"] += 1
        block = _new_block({
            "event": "ip_blocked",
            "source_ip": source_ip,
            "severity": severity,
            "alert_id": alert["id"],
        })
        STATE["blockchain"].append(block)
        if len(STATE["blockchain"]) > MAX_BLOCKS:
            STATE["blockchain"].pop(0)


def _tick_nodes() -> None:
    for node in STATE["nodes"]:
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
