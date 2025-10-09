📚 StudyBuddy — AI-Powered Learning Companion

An intelligent web app that helps students revise course materials using AI-generated quizzes, interactive chat, and personalized video recommendations.

🌟 Features
✅ Must-Have Features (Completed)
📂 Source Selector

Upload custom PDF coursebooks

Select from preloaded NCERT Physics textbooks

View all uploaded PDFs in a dropdown

Real-time uploads with backend processing

📖 PDF Viewer

Split-view display alongside quiz/chat

Tab-based navigation for mobile

Zoom controls and pagination

Fully responsive layout

🧠 Quiz Generator Engine

AI-powered MCQ generation (Google Gemini)

Questions generated from actual PDF content

Fallback quiz system when API fails

Real-time answer validation & explanations

Score calculation, tracking & unlimited new quizzes

📈 Progress Tracking

Analytics dashboard with charts & trends

Track scores (average, best, worst)

Topic-wise performance & improvement insights

Quiz attempt history with timestamps

💎 Nice-to-Have Features (Completed)
💬 Chat UI (ChatGPT-Style)

Modern chat interface with sidebar history

Start new chats, switch between sessions

Message timestamps, loading states, and mobile support

🔍 RAG Answers with Citations

Vector database using ChromaDB

Context-aware, source-cited responses

Quotes & page number references

🎥 YouTube Recommendations

Personalized video suggestions for weak topics

Auto topic extraction from quiz analytics

Direct search links to educational videos

🛠 Tech Stack
🧩 Frontend

Framework: React 18

Styling: Tailwind CSS

Icons: Lucide React

State Management: Context API

Storage: localStorage

⚙️ Backend

Framework: FastAPI (Python)

AI Model: Google Gemini 2.5 Flash

Vector DB: ChromaDB

Embeddings: HuggingFace Sentence Transformers

PDF Processing: PyMuPDF (fitz)

Text Handling: LangChain

⚡ Installation & Setup
Prerequisites

Node.js ≥16

Python ≥3.8

Google Gemini API Key

Backend Setup
# Navigate to backend
cd src/backend

# Create and activate venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-multipart
pip install PyMuPDF python-dotenv
pip install langchain langchain-community langchain-huggingface
pip install chromadb sentence-transformers
pip install google-generativeai

# Run backend
python app.py
# Runs at http://localhost:8000

Frontend Setup
cd src/frontend
npm install
npm start
# Runs at http://localhost:3000

Environment Variables
# Frontend (.env)
VITE_API_URL=http://127.0.0.1:8000/api

# Backend (.env)
GEMINI_API_KEY=your_key_here

💡 How to Use

Upload a PDF

Click “Upload PDF” in the header.

Wait for embeddings to generate.

Generate Quizzes

Go to the Quiz page

Click “Generate New Quiz”

Answer and submit for instant results.

Chat with AI

Ask questions about your uploaded PDF.

Get context-based answers with citations.

Track Progress

Visit the Dashboard to see your analytics.

Identify strong & weak areas.

Watch Videos

Get topic-based YouTube recommendations.

🧩 Responsive Design

Desktop: Full sidebar and split views

Tablet: Collapsible sidebars

Mobile: Bottom navigation & tabbed views

🧠 Development Journey
Day	Focus	Highlights
Day 1	Foundation	React + FastAPI setup, Context API, ChromaDB integration
Day 2	Core Features	Quiz engine, Gemini integration, PDF viewer
Day 3	Advanced	Chat with citations, RAG, video recommendations, dashboard
Day 4	Polish	Mobile responsive, UX improvements, documentation
🤖 LLM Tools Used
Tool	Usage
Claude AI	Architecture, debugging, RAG logic
GitHub Copilot	Code completion & boilerplate
ChatGPT	Research, troubleshooting, documentation
✨ Key Decisions
Topic	Decision	Reason
Vector DB	ChromaDB	Lightweight & local
AI Model	Gemini 2.5 Flash	Free, fast, reliable
Storage	localStorage	Simple MVP persistence
Quiz Type	MCQs only	Auto-gradable & quick
YouTube	Search URLs	No API key needed
🎨 UI Highlights

Gradient headers, shadows & rounded corners

Color-coded feedback (green/yellow/red)

Clear navigation & accessibility features

⚠️ Known Limitations

❌ SAQs/LAQs not auto-graded

❌ No persistent backend database

❌ Large PDFs (>50MB) slow to process

❌ No authentication system

🔄 Future Improvements

 User Authentication

 PostgreSQL integration

 Flashcards & spaced repetition

 Voice-based chat input

 Dark Mode

 Mobile App

🧪 Testing

Manual testing (Chrome, Safari, Firefox)

Mobile tests (iOS + Android)

API testing via Postman

🌐 Deployment
Frontend (Vercel)
npm run build
vercel deploy

Backend (Hugging Face / Render)
pip freeze > requirements.txt


Deployed Space:
🔗 https://juicybro-beyondchats-backend.hf.space

📸 Screenshots
Home	Quiz	Chat

	
	
🤝 Contributing

Fork the repo

Create a feature branch

Commit changes (git commit -m "Add new feature")

Push and open a Pull Request

📄 License

All code is the intellectual property of Mridul P.
Developed for the BeyondChats internship assignment.
Not for reuse without developer’s consent.

🙏 Acknowledgments

Google Gemini

Hugging Face

ChromaDB

Tailwind CSS

Claude AI

BeyondChats

🚀 Live Demo

Frontend: beyondchats-fswd-dun.vercel.app

Backend: juicybro-beyondchats-backend.hf.space

🧑‍💻 Developer: Mridul Pramod
📧 mridulpramod8@gmail.com

🔗 LinkedIn
 • GitHub
 • Portfolio
