from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from elasticsearch import Elasticsearch

app = FastAPI()

# React Dashboard se baat karne ke liye CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development ke liye sab allowed hai
    allow_methods=["*"],
    allow_headers=["*"],
)

# Elasticsearch Connection
# Note: Humne downgrade kiya hai taaki compatibility bani rahe
es = Elasticsearch(["http://localhost:9200"])

@app.get("/")
def home():
    return {"status": "IDPC Backend is Running"}

@app.get("/fetch-alerts")
def fetch_alerts():
    try:
        # Latest alerts ko sabse upar dikhane ke liye 'descending' sort
        response = es.search(
            index="filebeat-*",
            body={
                "query": {"match_all": {}},
                "sort": [{"@timestamp": {"order": "desc"}}]
            },
            size=10
        )
        return response['hits']['hits']
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
