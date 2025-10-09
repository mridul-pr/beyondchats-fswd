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

Questions generated directly from uploaded PDF content

Intelligent fallback quiz system

Real-time answer validation with explanations

Score calculation, tracking, and unlimited new quizzes

📈 Progress Tracking

Analytics dashboard with charts & trends

Average, best, and worst score tracking

Topic-wise performance and improvement insights

Quiz attempt history with timestamps

💎 Nice-to-Have Features (Completed)
💬 Chat UI (ChatGPT-Style)

Modern chat interface with sidebar history

Create new chats and switch sessions

Message timestamps and loading indicators

Fully responsive mobile layout

🔍 RAG Answers with Citations

Vector database powered by ChromaDB

Context-aware responses with citations

Snippet quotes and page number references

🎥 YouTube Recommendations

Personalized video suggestions based on weak topics

Auto topic extraction from quiz analytics

Direct links to educational videos on YouTube

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

Node.js ≥ 16

Python ≥ 3.8

Google Gemini API Key

Backend Setup
# Navigate to backend
cd src/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-multipart
pip install PyMuPDF python-dotenv
pip install langchain langchain-community langchain-huggingface
pip install chromadb sentence-transformers
pip install google-generativeai

# Run backend
python app.py
# → http://localhost:8000

Frontend Setup
cd src/frontend
npm install
npm start
# → http://localhost:3000

Environment Variables
# Frontend (.env)
VITE_API_URL=http://127.0.0.1:8000/api

# Backend (.env)
GEMINI_API_KEY=your_key_here

💡 How to Use

Upload a PDF
Click “Upload PDF” and wait for processing.

Generate Quizzes
Go to the Quiz page → Click “Generate New Quiz” → Answer & submit.

Chat with AI
Ask questions about your uploaded PDF → Get context-based answers with citations.

Track Progress
Open Dashboard to analyze performance and trends.

Watch Videos
Access personalized YouTube recommendations based on weak topics.

🧩 Responsive Design

🖥️ Desktop: Full sidebar, split views

💻 Tablet: Collapsible sidebars

📱 Mobile: Bottom navigation & tabbed views

🧠 Development Journey
Day	Focus	Highlights
Day 1	Foundation	React + FastAPI setup, Context API, ChromaDB integration
Day 2	Core Features	Quiz engine, Gemini integration, PDF viewer
Day 3	Advanced	Chat with citations, RAG, dashboard, video recommendations
Day 4	Polish	Responsive design, UX improvements, documentation
🤖 LLM Tools Used
Tool	Usage
Claude AI	Architecture, debugging, RAG logic
GitHub Copilot	Code completion & boilerplate
ChatGPT	Research, troubleshooting, documentation
✨ Key Decisions
Topic	Decision	Reason
Vector DB	ChromaDB	Lightweight, no external DB needed
AI Model	Gemini 2.5 Flash	Free, fast, reliable
Storage	localStorage	Simple MVP persistence
Quiz Type	MCQs only	Auto-gradable, efficient
YouTube	Search URLs	No API key required
🎨 UI Highlights

Gradient headers, rounded corners, and shadows

Color-coded performance indicators (🟢 ≥80%, 🟡 60–79%, 🔴 <60%)

Clean navigation, accessibility, and loading states

⚠️ Known Limitations

❌ SAQs/LAQs not implemented

❌ No persistent backend database

❌ Large PDFs (>50MB) may be slow

❌ No authentication system

🔄 Future Improvements

 User authentication system

 PostgreSQL integration

 Flashcards & spaced repetition

 Voice-based chat input

 Dark Mode

 Mobile App

🧪 Testing

✅ Manual testing (Chrome, Safari, Firefox)

✅ Mobile testing (iOS + Android)

✅ API validation via Postman

🌐 Deployment
Frontend (Vercel)
npm run build
vercel deploy

Backend (Hugging Face / Render)
pip freeze > requirements.txt


Live Deployment:

🖥️ Frontend: beyondchats-fswd-dun.vercel.app

⚙️ Backend: juicybro-beyondchats-backend.hf.space

📸 Screenshots
Home	Quiz	Chat

	
	
🤝 Contributing

Fork the repo

Create a feature branch

Commit your changes

git commit -m "Add new feature"


Push and open a Pull Request

📄 License

This project is the intellectual property of Mridul P.
Developed for the BeyondChats Internship Assignment.
Use only with the developer’s consent.

🙏 Acknowledgments

Google Gemini

Hugging Face

ChromaDB

Tailwind CSS

Claude AI

BeyondChats

🚀 Live Demo

🔗 Frontend: beyondchats-fswd-dun.vercel.app

🔗 Backend: juicybro-beyondchats-backend.hf.space

🧑‍💻 Developer Info

👨‍💻 Name: Mridul Pramod
📧 Email: mridulpramod8@gmail.com

🔗 Links:
LinkedIn
 • GitHub
 • Portfolio
