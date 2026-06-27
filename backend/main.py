from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

EVE_LOG_PATH = "/var/log/suricata/eve.json"

def get_latest_alerts():
    alerts = []
    if os.path.exists(EVE_LOG_PATH):
        with open(EVE_LOG_PATH, "r") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    if entry.get("event_type") == "alert":
                        alerts.append({
                            "data": {
                                "signature": entry["alert"]["signature"],
                                "src_ip": entry["src_ip"],
                                "severity": entry["alert"]["severity"]
                            },
                            "timestamp": entry["timestamp"],
                            "hash": "BLOCK-" + str(hash(line))[:10]
                        })
                except: continue
    return alerts[-10:] # Return last 10 alerts

@app.get("/api/v1/blockchain/ledger")
def get_ledger():
    return {"status": "success", "chain": get_latest_alerts()}

@app.get("/api/v1/dashboard/metrics")
def get_metrics():
    # Simple count logic
    alerts = get_latest_alerts()
    return {
        "status": "success",
        "data": {
            "event_counts": {"alert": len(alerts), "flow": 50, "http": 10, "dns": 5},
            "top_signatures": {"SYN Flood": len(alerts)},
            "top_attackers": {"10.0.0.1": len(alerts)}
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
