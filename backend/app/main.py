from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import hybrid, analytics, recommendation

app = FastAPI(
    title="BioOF Hybrid Query Engine",
    description="Optimization-Centric Database System MVP",
    version="0.3.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite
    "http://127.0.0.1:5173",
    "*"  # Open for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hybrid.router, prefix="/api", tags=["Hybrid Queries"])
app.include_router(analytics.router, prefix="/api", tags=["OLAP Analytics"])
app.include_router(recommendation.router, prefix="/api", tags=["Vector Search"])

@app.get("/")
def read_root():
    return {"message": "BioOF API is Running", "docs": "/docs"}
