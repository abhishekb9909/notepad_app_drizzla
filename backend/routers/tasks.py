from fastapi import APIRouter, HTTPException, Depends
from typing import List
from database import supabase
from schemas import Task, TaskCreate, TaskUpdate
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Helper to get user_id (Mocked for now, assumes header or default)
# In production, verify JWT from Supabase Auth header
def get_user_id():
    return "00000000-0000-0000-0000-000000000000" # Placeholder UUID

@router.get("/", response_model=List[Task])
def get_tasks(user_id: str = Depends(get_user_id)):
    logger.info(f"GET /tasks/ - user_id: {user_id}")
    response = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
    logger.info(f"GET /tasks/ - returned {len(response.data)} tasks")
    return response.data

@router.post("/", response_model=Task)
def create_task(task: TaskCreate, user_id: str = Depends(get_user_id)):
    logger.info(f"POST /tasks/ - Received request")
    logger.info(f"POST /tasks/ - Task data: {task.model_dump(mode='json')}")
    logger.info(f"POST /tasks/ - user_id: {user_id}")
    
    try:
        task_data = task.model_dump(mode='json')
        task_data["user_id"] = user_id
        
        logger.info(f"POST /tasks/ - Inserting into Supabase: {task_data}")
        response = supabase.table("tasks").insert(task_data).execute()
        
        if not response.data:
            logger.error(f"POST /tasks/ - Supabase returned no data")
            raise HTTPException(status_code=400, detail="Could not create task")
        
        logger.info(f"POST /tasks/ - Success! Created task: {response.data[0]}")
        return response.data[0]
    except Exception as e:
        logger.error(f"POST /tasks/ - Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{task_id}", response_model=Task)
def update_task(task_id: str, task: TaskUpdate, user_id: str = Depends(get_user_id)):
    logger.info(f"PUT /tasks/{task_id} - Update data: {task.model_dump(mode='json', exclude_unset=True)}")
    
    update_data = task.model_dump(mode='json', exclude_unset=True)
    response = supabase.table("tasks").update(update_data).eq("id", task_id).eq("user_id", user_id).execute()
    
    if not response.data:
        logger.error(f"PUT /tasks/{task_id} - Task not found")
        raise HTTPException(status_code=404, detail="Task not found")
    
    logger.info(f"PUT /tasks/{task_id} - Success!")
    return response.data[0]

@router.delete("/{task_id}")
def delete_task(task_id: str, user_id: str = Depends(get_user_id)):
    logger.info(f"DELETE /tasks/{task_id}")
    response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
    logger.info(f"DELETE /tasks/{task_id} - Success!")
    return {"message": "Task deleted"}
