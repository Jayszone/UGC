from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.api import router

app = FastAPI(title="Blaze UGC Growth Lab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3005"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
