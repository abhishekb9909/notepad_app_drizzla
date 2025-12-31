from fastapi import APIRouter, Depends
from typing import List
from database import supabase
from schemas import CalendarEvent
from routers.tasks import get_user_id
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/calendar", tags=["calendar"])

@router.get("/events", response_model=List[CalendarEvent])
def get_calendar_events(user_id: str = Depends(get_user_id)):
    logger.info(f"GET /calendar/events - user_id: {user_id}")
    
    # Fetch tasks that have a due_date
    response = supabase.table("tasks") \
        .select("id, title, due_date") \
        .eq("user_id", user_id) \
        .not_.is_("due_date", "null") \
        .execute()
    
    events = []
    for task in response.data:
        events.append(CalendarEvent(
            id=task["id"],
            title=task["title"],
            start=task["due_date"],
            end=task["due_date"],
            allDay=False 
        ))
    
    logger.info(f"GET /calendar/events - returned {len(events)} events")
    return events
