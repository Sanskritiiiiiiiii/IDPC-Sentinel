# IDPS Sentinel — AI-Driven, Blockchain-Enabled Intrusion Detection & Prevention System

## 1. Project Overview

IDPS Sentinel is a next-generation network defense platform that unifies real-time
traffic monitoring, automated intrusion prevention, and immutable security logging
into a single operational pipeline. The system continuously observes host-level
network telemetry, detects anomalous traffic conditions (e.g. packet floods), and
automatically executes mitigation — while recording every detection and response
action to a tamper-evident audit ledger.

The architecture is explicitly designed to accommodate two advanced capabilities
defined in the project's technical blueprint: an **AI Detection & Behavioral
Analysis Layer** (Random Forest / Deep Neural Network classification) and a
**Blockchain Logging & Security Ledger** (Hyperledger Fabric). Both are
architected for integration today via stable, modular interfaces, allowing the
core engine to run and be validated independently of when those production
components are finalized.

---

## 2. Current Implementation Status

| Layer | Status |
|---|---|
| **Real-Time Traffic Monitoring** | ✅ Fully functional — live packet rate, bandwidth, and connection metrics sourced directly from host system counters (`psutil`). |
| **Automated Intrusion Prevention** | ✅ Fully functional — threshold-based flood detection automatically triggers IP blocking / null-routing, with live status tracked end-to-end. |
| **Local Audit Ledger** | ✅ Fully functional — every detection and mitigation event is recorded in an append-only, hash-chained ledger (SHA-256 linked blocks), independently queryable and streamed live to the dashboard. |
| **AI Detection & Behavioral Analysis** | 🧩 Modular interface ready — implemented as a stable stub (`ai_engine_mock.py`) exposing the exact function signature the production Random Forest / Deep NN model will use. Wired into the live detection flow today so the full pipeline can be validated end-to-end. |
| **Blockchain Logging (Hyperledger Fabric)** | 🧩 Modular interface ready — implemented as a stable stub (`blockchain_logger_mock.py`) mirroring every detection event to the eventual Fabric ledger interface, alongside the fully functional local hash-chain. |

**In short:** the Core Prevention Pipeline — traffic monitoring, automated blocking,
and local audit logging — is fully functional and production-tested today. The AI
and distributed-ledger layers are not yet backed by their final production
components, but the system is fully wired to accept them without modification to
any surrounding logic.

---

## 3. Architectural Philosophy

IDPS Sentinel follows a **decoupled, interface-first design**. Rather than
building the AI and blockchain layers directly into the detection/response
pipeline, each is exposed behind a narrow, stable function contract:

```python
predict_attack(packet_data: dict) -> bool          # AI Detection Layer
record_attack_event(attack_data: dict) -> None      # Blockchain Logging Layer
```

The core engine (traffic monitoring, alerting, IP blocking, local ledger) depends
only on these function signatures — never on the internal implementation behind
them. This means:

- **The core engine is independently testable and deployable** today, without
  waiting on a trained model or a live Fabric network.
- **Production components can be hot-swapped in with a one-line import change.**
  Replacing `ai_engine_mock` with a real `ai_engine` module (backed by a trained
  Random Forest / Deep NN) or `blockchain_logger_mock` with a real
  `blockchain_logger` module (backed by the Hyperledger Fabric SDK) requires no
  changes anywhere else in `main.py`.
- **Risk is isolated.** A model retrain, a Fabric network migration, or a
  chaincode upgrade cannot destabilize the traffic monitoring or prevention
  logic, because those systems never depend on model or ledger internals.

This is a deliberate engineering choice, not a placeholder shortcut: the
plug-and-play boundary is the architecture.

---

## 4. Key Features

- **Real-Time Packet Monitoring** — live `packets_per_sec` and `bandwidth_mbps`
  derived from actual host NIC counters, not synthetic data.
- **Automated IPS Response** — real-time flood detection automatically triggers
  IP blocking / null-routing with no manual intervention.
- **Immutable Local Audit Ledger** — SHA-256 hash-chained, append-only event log
  covering every detection, block, and mitigation action.
- **Live Streaming Telemetry** — a resilient WebSocket pipeline (`/ws/v1/telemetry`)
  pushes the full system state to connected dashboards every 0.5s, with automatic
  client-side reconnection.
- **Modular AI Detection Interface** — a stable `predict_attack()` contract ready
  to receive a production-trained classifier.
- **Modular Blockchain Logging Interface** — a stable `record_attack_event()`
  contract ready to receive a production Hyperledger Fabric integration.
- **Real System-Grounded Telemetry** — active connection counts and core node
  load are sourced from live system state (`psutil.net_connections()`,
  `psutil.cpu_percent()`), not simulated placeholders.

---

## 5. Technology Stack

| Category | Technology |
|---|---|
| Backend Framework | Python 3, FastAPI, Uvicorn |
| Real-Time Transport | WebSockets (native FastAPI/Starlette) |
| System Telemetry | `psutil` |
| Security Ledger (current) | In-memory SHA-256 hash-chained ledger |
| Security Ledger (architected for) | Hyperledger Fabric (smart contracts: `recordAttackEvent()`, `storeSecurityLog()`, `verifyController()`, `auditSecurityEvents()`) |
| AI/ML Detection (architected for) | Random Forest / Isolation Forest / Deep Neural Networks / LSTM (scikit-learn, TensorFlow, or PyTorch) |
| Frontend | React (dashboard UI, real-time WebSocket client) |
| Deployment Target | Ubuntu (VirtualBox VM / bare metal), Docker-ready |

---

## 6. Installation & Usage

### Prerequisites

- Ubuntu 20.04+ (or any Linux environment with `/proc` access for `psutil`)
- Python 3.10+
- `pip`

### Setup

```bash
# 1. Clone or navigate into the project directory
cd ~/idpc_ai/backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install fastapi uvicorn psutil
```

### Running the Backend

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server exposes:

| Endpoint | Description |
|---|---|
| `GET /api/v1/dashboard/metrics` | Current metrics, node telemetry, and asset guard status |
| `GET /api/v1/threat/alerts` | Current alert list |
| `GET /api/v1/blockchain/ledger` | Current local audit ledger (hash-chained blocks) |
| `GET /api/v1/health` | Basic health check |
| `WS /ws/v1/telemetry` | Live streaming feed of the full system state (0.5s interval) |

### Verifying the System

```bash
# Confirm the backend is live
curl -s http://127.0.0.1:8000/api/v1/health

# Watch metrics update in real time
watch -n 1 curl -s http://127.0.0.1:8000/api/v1/dashboard/metrics
```

### Running the Frontend

From the frontend project directory:

```bash
npm install
npm start
```

The dashboard will automatically connect to `ws://127.0.0.1:8000/ws/v1/telemetry`
and begin rendering live telemetry, alerts, and audit ledger entries.

### Swapping in Production AI / Blockchain Modules

When the production components are ready:

1. Implement `ai_engine.py` exposing `predict_attack(packet_data: dict) -> bool`.
2. Implement `blockchain_logger.py` exposing `record_attack_event(attack_data: dict) -> None`.
3. In `main.py`, update the two import lines:

   ```python
   from ai_engine import predict_attack
   from blockchain_logger import record_attack_event
   ```

No other changes to `main.py` are required.
