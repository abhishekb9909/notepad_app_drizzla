from fastapi import APIRouter, HTTPException, Depends
from typing import List
from database import supabase
from schemas import Task, TaskCreate, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Helper to get user_id (Mocked for now, assumes header or default)
# In production, verify JWT from Supabase Auth header
def get_user_id():
    return "00000000-0000-0000-0000-000000000000" # Placeholder UUID

@router.get("/", response_model=List[Task])
def get_tasks(user_id: str = Depends(get_user_id)):
    response = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
    return response.data

@router.post("/", response_model=Task)
def create_task(task: TaskCreate, user_id: str = Depends(get_user_id)):
    task_data = task.model_dump()
    task_data["user_id"] = user_id
    response = supabase.table("tasks").insert(task_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create task")
    return response.data[0]

@router.put("/{task_id}", response_model=Task)
def update_task(task_id: str, task: TaskUpdate, user_id: str = Depends(get_user_id)):
    update_data = task.model_dump(exclude_unset=True)
    response = supabase.table("tasks").update(update_data).eq("id", task_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return response.data[0]

@router.delete("/{task_id}")
def delete_task(task_id: str, user_id: str = Depends(get_user_id)):
    response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
    return {"message": "Task deleted"}
