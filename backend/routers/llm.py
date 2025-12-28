from fastapi import APIRouter, HTTPException
from schemas import LLMRequest
from config import settings
from huggingface_hub import InferenceClient

router = APIRouter(prefix="/llm", tags=["llm"])

client = InferenceClient(token=settings.HF_TOKEN)

@router.post("/ask")
def ask_llm(request: LLMRequest):
    try:
        # Using a good instruct model
        model = "mistralai/Mistral-7B-Instruct-v0.2" 
        
        system_instruction = "You are a smart assistant for a Task Management/Notepad App. Use the provided Context (User's tasks) to answer their questions. If they ask to organize, summarize, or prioritize, use the task list provided."
        prompt = f"{system_instruction}\n\nContext:\n{request.context}\n\nUser Question: {request.prompt}" if request.context else request.prompt
        
        messages = [{"role": "user", "content": prompt}]
        
        response = client.chat_completion(
            model=model,
            messages=messages,
            max_tokens=500
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")
