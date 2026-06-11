from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import requests

app = FastAPI(title="ICFA Engine")

# Allow your local React app to communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

class FeedbackRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze_feedback(request: FeedbackRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable is not set.")
    
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""
        You are a customer feedback analysis engine. Analyze the following text.
        Feedback: "{request.text}"
        
        Respond ONLY with a raw JSON object matching this schema exactly:
        {{
            "sentiment": "Positive" | "Negative" | "Neutral",
            "confidence": 85,
            "sarcasm": "Sarcastic" | "Non-Sarcastic",
            "category": "Product Quality" | "Customer Support" | "Delivery" | "UI/UX" | "Pricing" | "Onboarding" | "General",
            "keywords": ["word1", "word2"],
            "summary": "One sentence reasoning explaining the analysis."
        }}
        """
        
        payload = {
            "model": "llama-3.1-8b-instant",  
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},  
            "temperature": 0.1
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Groq API Error: {response.text}")
            
        res_json = response.json()
        content_text = res_json["choices"][0]["message"]["content"]
        
        return json.loads(content_text.strip())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))