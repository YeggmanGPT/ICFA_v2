# ICFA v2.0 — Intelligent Customer Feedback Analyser
An enterprise-ready, decoupled full-stack microservice designed to automate customer feedback triage, extract structured linguistic insights, and eliminate manual data processing pipelines. 

## The Evolution Story (Legacy to Microservice)
This repository represents a complete production-grade re-engineering of a monolithic text classifier originally built in 2022 using Django and Scikit-Learn for my bachelor's major project. 

### The Core Architectural Upgrades:
* **Monolith to Distributed:** Replaced a heavy Django server with a high-performance **FastAPI** backend middleware paired with an independent, asynchronous **React (Vite)** dashboard.
* **Training vs Inference:** Replaced a monolithic Scikit-Learn training loop that re-fitted a Logistic Regression pipeline on every API call with hardware-accelerated LLM inference via **Groq's LPUs**.
* **Advanced NLP Capabilities:** Upgraded raw binary sentiment categorization into an advanced linguistic analyzer capable of zero-shot domain tagging, keyword extraction, and deterministic hardware-enforced **Sarcasm Detection**—preventing false positives that traditionally bypass naive ML classifiers.

## System Architecture

   ┌──────────────────────┐
   │  React (Vite) UI     │ <── Real-time Analytics Dashboard
   └──────────┬───────────┘
              │
              │ HTTP POST (JSON Payload)
              ▼
   ┌──────────────────────┐
   │   FastAPI Backend    │ <── CORS Middleware & Pydantic Validation
   └──────────┬───────────┘
              │
              │ REST Call (Enforced JSON Schema)
              ▼
   ┌──────────────────────┐
   │ Groq Inference Engine│ <── Llama-3.1-8b-instant (Hardware JSON Mode)
   └──────────────────────┘

   🛠️ Tech Stack
Backend: Python, FastAPI, Pydantic v2, Requests, Uvicorn

Frontend: React.js (Hooks, Context), Vite, Inline CSS3 (Custom Dark Palette)

AI/NLP Layer: Groq LPU Architecture, Llama 3.1 (8B Instant)

⚡ Key Architectural Features
Hardware-Level JSON Enforcement: Utilizes Groq’s native response_format={"type": "json_object"} to guarantee that the inference engine outputs data matching backend Pydantic schemas structurally, neutralizing runtime formatting bugs.

Separation of Concerns: Zero direct client-to-LLM connections. The frontend communicates strictly via an abstraction layer with the FastAPI gateway, isolating API credentials securely.

Linguistic Sarcasm Filter: Implements a secondary semantic evaluation layer to catch sarcastic feedback, solving a critical real-world production problem where models misinterpret negative feedback masked as praise.

🚀 Local Installation & Setup
1. Backend Setup
Navigate to the backend directory, spin up a virtual environment, and install dependencies:

Bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
Set your environment variables and start the microservice:

Bash
# On Windows PowerShell:
$env:GROQ_API_KEY="your_groq_api_key"
# On Mac/Linux:
export GROQ_API_KEY="your_groq_api_key"

uvicorn main:app --reload
The server will initialize on http://localhost:8000.

2. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and launch the development environment:

Bash
cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser to launch the live dashboard.