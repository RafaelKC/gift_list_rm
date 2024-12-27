from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from mongodb_client import MongoDBClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    raise ValueError("MONGO_URL environment variable is not set")
mongodb_client = MongoDBClient(MONGO_URL)  # type: ignore

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("DEBUG: Application starting up...")
    await mongodb_client.connect()
    print("DEBUG: MongoDB connected")
    yield
    # Shutdown
    print("DEBUG: Application shutting down...")
    mongodb_client.close()
    print("DEBUG: MongoDB connection closed")

app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

class GiftCreate(BaseModel):
    gift_link: str
    gift_price: float
    gift_name: str
    gift_image_url: Optional[str] = None
    gift_description: str

class UpdateSelectorEmail(BaseModel):
    selector_email: str

@app.post("/gifts", response_model=dict)
async def create_gift(gift: GiftCreate):
    print(f"DEBUG: Creating gift: {gift.gift_name}")
    gift_dict = gift.model_dump()
    result = await mongodb_client.create_gift(gift_dict)
    print(f"DEBUG: Gift created with result: {result}")
    return result

@app.patch("/gifts/{gift_id}/selector", response_model=dict)
async def update_selector_email(gift_id: str, update: UpdateSelectorEmail):
    try:
        updated_gift = await mongodb_client.update_selector_email(gift_id, update.selector_email)
        if not updated_gift:
            raise HTTPException(status_code=404, detail="Gift not found")
        return updated_gift
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/gifts/{gift_id}")
async def delete_gift(gift_id: str):
    try:
        success = await mongodb_client.delete_gift(gift_id)
        if not success:
            raise HTTPException(status_code=404, detail="Gift not found")
        return {"message": "Gift successfully deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/gifts", response_model=List[dict])
async def get_available_gifts():
    return await mongodb_client.get_available_gifts()

@app.get("/gifts/selector/{selector_email}", response_model=List[dict])
async def get_gifts_by_selector(selector_email: str):
    try:
        gifts = await mongodb_client.get_gifts_by_selector_email(selector_email)
        return gifts
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import logging
    logging.basicConfig(level=logging.DEBUG)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")
