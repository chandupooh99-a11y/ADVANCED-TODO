from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Annotated, List, Optional
from bson import ObjectId

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = "mongodb://mongo:27017"
client = AsyncIOMotorClient(MONGO_URL)
db = client.todo_db
collection = db.todos

PyObjectId = Annotated[str, BeforeValidator(str)]

class TodoModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    completed: bool = False

@app.get("/todos", response_model=List[TodoModel])
async def get_todos():
    return await collection.find().to_list(100)

@app.post("/todos", response_model=TodoModel)
async def create_todo(todo: TodoModel):
    new_todo = todo.model_dump(by_alias=True, exclude=["id"])
    result = await collection.insert_one(new_todo)
    return await collection.find_one({"_id": result.inserted_id})

@app.put("/todos/{id}")
async def update_todo(id: str):
    todo = await collection.find_one({"_id": ObjectId(id)})
    if todo:
        await collection.update_one({"_id": ObjectId(id)}, {"$set": {"completed": not todo["completed"]}})
    return {"status": "updated"}

@app.delete("/todos/{id}")
async def delete_todo(id: str):
    await collection.delete_one({"_id": ObjectId(id)})
    return {"status": "deleted"}