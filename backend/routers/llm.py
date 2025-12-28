from fastapi import APIRouter, HTTPException
from schemas import LLMRequest
from config import settings
from huggingface_hub import InferenceClient

router = APIRouter(prefix="/llm", tags=["llm"])

client = InferenceClient(token=settings.HF_TOKEN)

@router.post("/ask")
def ask_llm(request: LLMRequest):
    """Simple LLM endpoint - just returns AI response, no parsing"""
    try:
        # Use a more stable model for Inference API
        model = "meta-llama/Llama-3.2-3B-Instruct"
        
        if not settings.HF_TOKEN:
            print("WARNING: HF_TOKEN is missing in .env")
            return {"response": "AI Assistant is not configured. Please add HF_TOKEN to .env"}

        # Simple system instruction
        system_instruction = """You are a helpful assistant for a task management app.
When users ask you to create, update, or delete tasks, respond with a JSON object:

For creating tasks:
{"action": "create_task", "title": "task name", "due_date": "tomorrow"}

For other questions, respond normally in plain text.
IMPORTANT: If you create a task, ONLY return the JSON object, no other text."""
        
        prompt = f"{system_instruction}\n\nContext:\n{request.context}\n\nUser: {request.prompt}"
        
        messages = [{"role": "user", "content": prompt}]
        
        print(f"Calling HF with model: {model}")
        try:
            response = client.chat_completion(
                model=model,
                messages=messages,
                max_tokens=500
            )
            ai_response = response.choices[0].message.content
            print(f"AI response: {ai_response}")
            return {"response": ai_response}
        except Exception as hf_err:
            print(f"HF API Error: {hf_err}")
            # Fallback to a simpler model if Llama fails
            print("Retrying with Mistral...")
            response = client.chat_completion(
                model="mistralai/Mistral-7B-Instruct-v0.3",
                messages=messages,
                max_tokens=500
            )
            ai_response = response.choices[0].message.content
            return {"response": ai_response}
        
    except Exception as e:
        print(f"General LLM Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")
