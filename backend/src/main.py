from fastapi import FastAPI

app = FastAPI(title="Proximity Alarm API", version="0.1.0")

@app.get("/")
def root():
    return {"message": "Hello World", "service": "proximity-alarm-api"}

@app.get("/health")
def health():
    return {"status": "healthy"}
