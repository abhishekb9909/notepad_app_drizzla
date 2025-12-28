# 📝 AI-Powered Notepad App

A modern, full-stack notepad application featuring intelligent task management, history tracking, and an integrated AI assistant powered by Hugging Face. Build with FastAPI and React.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![React](https://img.shields.io/badge/react-18.x-61dafb.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)

## ✨ Features

- **🔐 Secure Authentication**: User management via Supabase Auth.
- **✅ Task Management**: Create, read, update, and delete (CRUD) tasks efficiently.
- **📅 Calendar View**: Visualize your deadlines with a dedicated calendar interface.
- **📜 History**: Archive and review completed tasks.
- **🤖 AI Assistant**: Context-aware AI (Mistral-7B via Hugging Face) that helps organize and prioritize your specific task list.
- **💻 Modern UI**: Dark-mode enabled, responsive interface built with Vite and React.

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework.
- **Supabase**: PostgreSQL database and Authentication.
- **Hugging Face**: Serverless Inference API for LLM features.
- **Pydantic**: Data validation and settings management.

### Frontend
- **React**: UI library.
- **Vite**: Next-generation build tool.
- **Lucide React**: Beautiful icons.
- **CSS3**: Custom modern styling with variables and dark theme.

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase Account
- Hugging Face Access Token

### 1. Clone the Repository
```bash
git clone https://github.com/abhishekb9909/note_pad_dirzzla.git
cd note_pad_dirzzla
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment and install dependencies:
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Configure Environment Variables:
Rename `.env.example` to `.env` and fill in your credentials:
```ini
SUPABASE_URL="your-supabase-url"
SUPABASE_KEY="your-supabase-anon-key"
SUPABASE_DB_PASSWORD="your-db-password"
HF_TOKEN="your-huggingface-token"
```

Start the Server:
```bash
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000` (Docs at `/docs`).

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
```

Install Dependencies:
```bash
npm install
```

Start the Development Server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 🗄️ Database Schema

Run the following SQL in your Supabase SQL Editor to set up the required table:

```sql
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  content text,
  is_done boolean default false,
  due_date timestamptz,
  created_at timestamptz default now()
);
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
