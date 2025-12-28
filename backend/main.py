from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from routers import tasks, llm

app = FastAPI(title="Notepad Backend")

origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(llm.router)

@app.get("/")
def read_root():
    return {"message": "Notepad Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "supabase_connected": True} 
