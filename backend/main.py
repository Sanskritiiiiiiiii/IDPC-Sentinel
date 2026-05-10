from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ELASTICSEARCH_URL = "http://localhost:9200/filebeat-*/_search"

@app.get("/")
def home():
    return {"status": "Backend is Running"}

@app.get("/fetch-alerts")
def fetch_alerts():
    try:
        # We use simple requests to bypass the library errors
        response = requests.get(ELASTICSEARCH_URL)
        data = response.json()
        
        alerts = []
        for hit in data.get('hits', {}).get('hits', []):
            s = hit.get('_source', {})
            alerts.append({
                "timestamp": s.get("@timestamp") or s.get("timestamp"),
                "alert_message": s.get("alert_message") or s.get("message", "Security Alert"),
                "source_ip": s.get("source_ip") or s.get("ip", "127.0.0.1"),
                "severity": s.get("severity", "High")
            })
        return alerts
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
