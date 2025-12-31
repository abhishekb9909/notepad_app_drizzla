from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class TaskBase(BaseModel):
    title: str
    content: Optional[str] = None
    is_done: bool = False
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_done: Optional[bool] = None
    due_date: Optional[datetime] = None

class Task(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class LLMRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

class CalendarEvent(BaseModel):
    id: UUID
    title: str
    start: datetime
    end: datetime
    allDay: bool = False
