from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List
from bson import ObjectId

class MongoDBClient:
    def __init__(self, mongo_url: str):
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client.gift_list_rm
        self.collection = self.db.gifts

    async def connect(self) -> None:
        from pymongo.errors import ConnectionFailure, OperationFailure, ServerSelectionTimeoutError
        
        try:
            print(f"Attempting to connect to MongoDB at {self.client.address}")
            await self.client.gift_list_rm.command('ping')
            print("Successfully connected to MongoDB")
            print(f"Using database: {self.db.name}")
            print(f"Using collection: {self.collection.name}")
        except ConnectionFailure as e:
            print(f"Failed to connect to MongoDB: {str(e)}")
            print("Please ensure MongoDB is running and accessible")
            raise
        except ServerSelectionTimeoutError as e:
            print(f"Timed out when trying to connect to MongoDB: {str(e)}")
            print("Please check if MongoDB is running and the connection URL is correct")
            raise
        except OperationFailure as e:
            print(f"Authentication failed: {str(e)}")
            print("Please check your MongoDB credentials")
            raise
        except Exception as e:
            print(f"Unexpected error when connecting to MongoDB: {str(e)}")
            print("Please check your MongoDB configuration")
            raise

    def close(self) -> None:
        """Close the MongoDB connection"""
        self.client.close()

    async def create_gift(self, gift_data: dict) -> dict:
        try:
            gift_data["selector_email"] = ""
            print(f"Attempting to insert gift data: {gift_data}")
            result = await self.collection.insert_one(gift_data)
            print(f"Successfully inserted document with id: {result.inserted_id}")
            created_gift = await self.collection.find_one({"_id": result.inserted_id})
            if created_gift is None:
                raise Exception("Failed to retrieve created gift")
            created_gift["_id"] = str(created_gift["_id"])
            return created_gift
        except Exception as e:
            print(f"Error creating gift: {e}")
            raise Exception(f"Error creating gift: {e}")

    async def update_selector_email(self, gift_id: str, selector_email: str) -> Optional[dict]:
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(gift_id)},
                {"$set": {"selector_email": selector_email}}
            )
            
            if result.modified_count == 0:
                return None
                
            updated_gift = await self.collection.find_one({"_id": ObjectId(gift_id)})
            if updated_gift is None:
                return None
                
            updated_gift["_id"] = str(updated_gift["_id"])
            return updated_gift
        except Exception as e:
            print(f"Error updating selector email: {e}")
            raise Exception(f"Error updating selector email: {e}")

    async def delete_gift(self, gift_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(gift_id)})
        return result.deleted_count > 0

    async def get_available_gifts(self) -> List[dict]:
        items = []
        cursor = self.collection.find({"selector_email": ""})
        async for document in cursor:
            document["_id"] = str(document["_id"])
            items.append(document)
        return items

    async def get_all_gifts(self) -> List[dict]:
        items = []
        cursor = self.collection.find({})
        async for document in cursor:
            document["_id"] = str(document["_id"])
            items.append(document)
        return items

    async def get_gifts_by_selector_email(self, selector_email: str) -> List[dict]:
        items = []
        cursor = self.collection.find({"selector_email": selector_email})
        async for document in cursor:
            document["_id"] = str(document["_id"])
            items.append(document)
        return items
