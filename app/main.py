from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

client = AsyncIOMotorClient(MONGO_URL)
db = client.gift_lit_rm
gift_ideas_collenction = db.gift_ideas

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
    
    yield
    
    # Shutdown
    client.close()

app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

@app.get("/items", response_model=List[dict])
async def get_all_items():
    items = []
    cursor = gift_ideas_collenction.find({})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        items.append(document)
    return items

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI with MongoDB"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
