from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from urllib.parse import quote_plus
import requests
import google.generativeai as genai
import json
import re

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOAD_DIR = "uploads"
DB_DIR = "data/chroma_db"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

# Initialize embeddings (local, no API needed)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Configure Gemini (FREE - 15 requests/min, no credit card needed)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
model = None

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
    # List of models to try (in order of preference - with models/ prefix)
    model_names = [
        "models/gemini-2.0-flash-exp",      # Latest experimental
        "models/gemini-1.5-flash",           # Stable and fast
        "models/gemini-1.5-pro",             # Better quality
        "models/gemini-pro",                 # Legacy
    ]
    
    for model_name in model_names:
        try:
            test_model = genai.GenerativeModel(model_name)
            # Test with a simple prompt
            test_response = test_model.generate_content("Say OK")
            if test_response.text:
                model = test_model
                print(f"✅ Gemini API configured successfully (using {model_name})")
                break
        except Exception as e:
            print(f"⚠️ Failed to load {model_name}: {str(e)[:60]}")
            continue
    
    if not model:
        print("⚠️ Could not initialize any Gemini model. Using fallback mode.")
        print("   Try running: python check_models.py to see available models")
else:
    print("⚠️ GEMINI_API_KEY not found. Quiz generation will use fallback mode.")

# Global vector database
vectordb = None


def process_pdf(pdf_path):
    """Extract text from PDF and split into chunks."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text")
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = splitter.create_documents([text])
    return docs, text


@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload PDF and create vector embeddings."""
    try:
        path = os.path.join(UPLOAD_DIR, file.filename)
        with open(path, "wb") as f:
            f.write(await file.read())
        
        docs, full_text = process_pdf(path)
        
        global vectordb
        vectordb = Chroma.from_documents(
            docs, 
            embedding=embeddings, 
            persist_directory=DB_DIR
        )
        
        return {
            "success": True,
            "message": f"Successfully indexed {len(docs)} chunks from {file.filename}",
            "filename": file.filename,
            "text_length": len(full_text)
        }
    except Exception as e:
        print(f"Upload error: {e}")
        return {"success": False, "error": str(e)}


@app.get("/api/vectordb-status")
async def vectordb_status():
    """Check if vector database is initialized."""
    return {
        "initialized": vectordb is not None,
        "ready": vectordb is not None
    }


@app.post("/api/chat-with-citations")
async def chat_with_citations(query: str = Form(...)):
    """Chat with PDF and provide comprehensive, conversational responses with citations."""
    try:
        global vectordb
        
        # Try to reinitialize if None but DB exists
        if vectordb is None:
            if os.path.exists(DB_DIR) and os.listdir(DB_DIR):
                try:
                    vectordb = Chroma(
                        persist_directory=DB_DIR, 
                        embedding_function=embeddings
                    )
                    print("✅ Reinitialized vectordb from persisted data")
                except Exception as e:
                    print(f"Failed to reinitialize vectordb: {e}")
        
        if vectordb is None:
            return {
                "success": False,
                "error": "No PDF has been uploaded yet. Please upload a PDF first from the Library page."
            }
        
        # Get more relevant documents for comprehensive answers
        retriever = vectordb.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 6}  # Increased from 4 to 6 for more context
        )
        docs = retriever.get_relevant_documents(query)
        
        if not docs:
            return {
                "success": True,
                "answer": "I couldn't find relevant information in the PDF to answer your question. Could you try rephrasing or asking about a different topic covered in the document?",
                "citations": []
            }
        
        # Remove duplicate content and build unique context
        seen_content = set()
        unique_docs = []
        for doc in docs:
            content_preview = doc.page_content[:200].strip()
            if content_preview not in seen_content:
                seen_content.add(content_preview)
                unique_docs.append(doc)
        
        # Build context with source tracking
        context_parts = []
        citations = []
        
        for idx, doc in enumerate(unique_docs[:5]):  # Use top 5 sources
            context_parts.append(f"[Source {idx+1}]: {doc.page_content}")
            citations.append({
                "source": idx + 1,
                "text": doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content,
                "page": doc.metadata.get("page", "Unknown")
            })
        
        context = "\n\n".join(context_parts)
        
        # Use Gemini for comprehensive, conversational responses
        if model:
            prompt = f"""You are a helpful, friendly AI study assistant helping students understand their coursebook. Your goal is to provide comprehensive, conversational responses that truly help students learn.

Context from the student's PDF:
{context}

Student's Question: {query}

Instructions for your response:
1. Provide a COMPREHENSIVE, DETAILED answer (aim for 3-5 paragraphs minimum)
2. Use a friendly, conversational tone - like you're explaining to a friend
3. Break down complex concepts into understandable parts
4. Use examples from the text when available
5. Connect different ideas and show relationships between concepts
6. If the text mentions examples, exercises, or applications, discuss them
7. Add context that helps understanding (background, significance, real-world relevance)
8. If appropriate, suggest what the student should focus on or study next
9. Be thorough but clear - don't rush through the explanation
10. Base everything on the provided context - don't make up information

Format your response naturally:
- Start with a direct answer to the question
- Then expand with detailed explanation
- Use paragraph breaks for readability
- Include relevant examples or details from the text
- End with a helpful summary or next steps if appropriate

Remember: Students want to learn and understand deeply, not just get quick answers. Take your time to explain thoroughly!

Your detailed response:"""
            
            try:
                generation_config = {
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "max_output_tokens": 2048,  # Increased for longer responses
                }
                
                safety_settings = [
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
                ]
                
                response = model.generate_content(
                    prompt,
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
                
                if response.candidates and response.candidates[0].finish_reason == 1:
                    answer = response.text.strip()
                    
                    # Ensure minimum length - if too short, add more context
                    if len(answer) < 200:
                        answer += f"\n\nFor more context, here's what the material says:\n\n{unique_docs[0].page_content[:600]}..."
                else:
                    # Fallback with more comprehensive manual response
                    answer = generate_fallback_answer(query, unique_docs)
                    
            except Exception as e:
                print(f"Gemini chat error: {e}")
                # Fallback to comprehensive manual response
                answer = generate_fallback_answer(query, unique_docs)
        else:
            # Fallback without Gemini: provide comprehensive manual response
            answer = generate_fallback_answer(query, unique_docs)
        
        # Clean up answer formatting
        answer = answer.replace("[Source 1]", "").replace("[Source 2]", "").replace("[Source 3]", "").strip()
        
        return {
            "success": True,
            "query": query,
            "answer": answer,
            "citations": citations
        }
    except Exception as e:
        print(f"Chat with citations error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False, 
            "error": f"Error processing your question: {str(e)}"
        }


def generate_fallback_answer(query, docs):
    """Generate a comprehensive fallback answer when Gemini is unavailable."""
    if not docs or len(docs) == 0:
        return "I couldn't find enough information in the PDF to answer your question comprehensively."
    
    # Combine multiple document chunks for comprehensive answer
    combined_text = "\n\n".join([doc.page_content for doc in docs[:3]])
    
    answer = f"""Based on the content in your PDF, here's what I found:\n\n"""
    
    # Add main content
    answer += f"{combined_text[:1200]}\n\n"
    
    # Add contextual closing
    if len(docs) > 1:
        answer += f"""This information comes from multiple sections of your document. """
    
    answer += f"""If you'd like me to explain any specific part in more detail, or if you have follow-up questions about this topic, feel free to ask! I'm here to help you understand the material better."""
    
    return answer


@app.post("/api/chat")
async def chat(query: str = Form(...)):
    """Simple chat endpoint (legacy support)."""
    try:
        global vectordb
        if vectordb is None:
            vectordb = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
        
        retriever = vectordb.as_retriever(search_kwargs={"k": 3})
        docs = retriever.get_relevant_documents(query)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        if model:
            prompt = f"""Based on this context, answer the question in detail:

Context: {context}

Question: {query}

Provide a comprehensive answer:"""
            response = model.generate_content(prompt)
            answer = response.text
        else:
            answer = f"Based on the document:\n\n{docs[0].page_content[:500]}..."
        
        return {
            "success": True,
            "query": query,
            "answer": answer
        }
    except Exception as e:
        print(f"Chat error: {e}")
        return {"success": False, "error": str(e)}


def generate_smart_quiz(topic, context):
    """Generate quiz using Gemini AI with improved safety handling."""
    context_clean = context.replace('\n', ' ').strip()[:2500]
    
    prompt = f"""You are creating an educational quiz for students based on their textbook.

TEXTBOOK EXCERPT:
{context_clean}

Create exactly 3 multiple-choice questions testing understanding of the concepts above.

REQUIREMENTS:
- Questions must be based on the textbook content
- Test comprehension, not just recall
- Provide clear explanations
- 4 options per question

Return ONLY this JSON array (no extra text):
[
  {{
    "question": "According to the text, what is...",
    "options": ["Answer from text", "Incorrect", "Incorrect", "Incorrect"],
    "correctAnswer": 0,
    "explanation": "The text states that..."
  }},
  {{
    "question": "Which statement is true based on the content?",
    "options": ["Incorrect", "Answer from text", "Incorrect", "Incorrect"],
    "correctAnswer": 1,
    "explanation": "This is explained in the passage..."
  }},
  {{
    "question": "What concept is described in the text?",
    "options": ["Incorrect", "Incorrect", "Answer from text", "Incorrect"],
    "correctAnswer": 2,
    "explanation": "As mentioned, this refers to..."
  }}
]"""

    try:
        generation_config = {
            "temperature": 0.8,
            "top_p": 0.95,
            "max_output_tokens": 2048,
        }
        
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        
        if not response.candidates:
            print("⚠️ Gemini response blocked by safety filter")
            return None
            
        if response.candidates[0].finish_reason != 1:
            print(f"⚠️ Gemini finish_reason: {response.candidates[0].finish_reason}")
            return None
        
        result_text = response.text.strip()
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        
        json_match = re.search(r'\[.*\]', result_text, re.DOTALL)
        if json_match:
            quiz_data = json.loads(json_match.group(0))
            
            if isinstance(quiz_data, list) and len(quiz_data) > 0:
                first_q = quiz_data[0]
                if all(key in first_q for key in ["question", "options", "correctAnswer"]):
                    print(f"✅ Gemini generated {len(quiz_data)} questions")
                    return quiz_data
        
        print("⚠️ Could not parse Gemini JSON")
        return None
        
    except Exception as e:
        print(f"Gemini error: {e}")
        return None


def generate_fallback_quiz(topic, context):
    """Generate quiz from actual PDF content."""
    context_clean = context.replace('\n', ' ').strip()
    
    sentences = []
    for s in context_clean.split('.'):
        s = s.strip()
        if (len(s) > 100 and 
            not s.startswith('Ans') and 
            not s.startswith('Q.') and
            not s.startswith('Page') and
            'solution' not in s.lower()[:20]):
            sentences.append(s)
    
    if len(sentences) < 3:
        all_sentences = [s.strip() for s in context_clean.split('.') if len(s.strip()) > 50]
        sentences = all_sentences[:5] if all_sentences else []
    
    questions = []
    
    if len(sentences) >= 3:
        q1_sentence = sentences[0]
        questions.append({
            "question": f"Based on the text, which statement is most accurate?",
            "options": [
                q1_sentence[:90] + "..." if len(q1_sentence) > 90 else q1_sentence,
                "This is not mentioned in the text",
                "The opposite is true",
                "The text does not discuss this"
            ],
            "correctAnswer": 0,
            "explanation": f"This is directly stated in the content: {q1_sentence[:200]}",
            "type": "mcq"
        })
        
        q2_sentence = sentences[1] if len(sentences) > 1 else sentences[0]
        questions.append({
            "question": "According to the material, what is described?",
            "options": [
                "An unrelated concept",
                q2_sentence[:90] + "..." if len(q2_sentence) > 90 else q2_sentence,
                "Something not in the text",
                "A different topic"
            ],
            "correctAnswer": 1,
            "explanation": f"The text explains: {q2_sentence[:200]}",
            "type": "mcq"
        })
        
        q3_sentence = sentences[2] if len(sentences) > 2 else sentences[0]
        questions.append({
            "question": "What information is provided in the content?",
            "options": [
                "Incorrect information",
                "Not discussed in the text",
                q3_sentence[:90] + "..." if len(q3_sentence) > 90 else q3_sentence,
                "Opposite of what's stated"
            ],
            "correctAnswer": 2,
            "explanation": f"From the content: {q3_sentence[:200]}",
            "type": "mcq"
        })
    else:
        questions = [
            {
                "question": "What is the main topic discussed in this document?",
                "options": [
                    "The document discusses educational concepts and principles",
                    "Unrelated subject matter",
                    "Different topic entirely",
                    "Not applicable"
                ],
                "correctAnswer": 0,
                "explanation": "Based on the available content from the document",
                "type": "mcq"
            },
            {
                "question": "Which type of content is presented in this material?",
                "options": [
                    "Fiction narrative",
                    "Educational and instructional content",
                    "News article",
                    "Advertisement"
                ],
                "correctAnswer": 1,
                "explanation": "The document contains educational information",
                "type": "mcq"
            },
            {
                "question": "What is the purpose of this document?",
                "options": [
                    "Entertainment",
                    "Marketing",
                    "Teaching and learning",
                    "Legal documentation"
                ],
                "correctAnswer": 2,
                "explanation": "This appears to be educational material for learning",
                "type": "mcq"
            }
        ]
    
    return questions


@app.post("/api/quiz")
async def quiz_generate(topic: str = Form(...)):
    """Generate quiz questions from uploaded PDF content."""
    try:
        global vectordb
        
        if vectordb is None:
            return {
                "success": False,
                "error": "Please upload a PDF first! Click the 'Upload PDF' button to add your coursebook."
            }
        
        try:
            retriever = vectordb.as_retriever(search_kwargs={"k": 5})
            topic_clean = topic.replace('.pdf', '').replace('_', ' ').replace('-', ' ')
            docs = retriever.get_relevant_documents(topic_clean)
            
            if not docs or len(docs) == 0:
                search_terms = ["introduction", "chapter", "concept", "definition", "example"]
                for term in search_terms:
                    docs = retriever.get_relevant_documents(term)
                    if docs and len(docs) > 0:
                        break
            
            context = "\n\n".join([doc.page_content for doc in docs])
            
            print(f"✅ Retrieved {len(docs)} documents, context length: {len(context)}")
            
            if len(context) < 100:
                return {
                    "success": False,
                    "error": "Not enough content extracted. Please re-upload the PDF."
                }
                
        except Exception as e:
            print(f"Vector DB error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": f"Could not retrieve PDF content: {str(e)}"
            }
        
        quiz_data = None
        if model:
            try:
                print(f"Attempting Gemini generation with {len(context)} chars of content")
                quiz_data = generate_smart_quiz(topic_clean, context)
            except Exception as e:
                print(f"Gemini error: {e}")
                import traceback
                traceback.print_exc()
        
        if not quiz_data or len(quiz_data) == 0:
            print("Using improved fallback generation with actual content")
            quiz_data = generate_fallback_quiz(topic_clean, context)
        
        if quiz_data and len(quiz_data) > 0:
            formatted_quiz = []
            for q in quiz_data:
                options = q.get("options", [])
                if not isinstance(options, list) or len(options) < 4:
                    options = ["Option A", "Option B", "Option C", "Option D"]
                
                formatted_quiz.append({
                    "question": q.get("question", "Question unavailable"),
                    "options": options[:4],
                    "correctAnswer": int(q.get("correctAnswer", 0)) % 4,
                    "explanation": q.get("explanation", "No explanation available"),
                    "type": "mcq"
                })
            
            print(f"✅ Returning {len(formatted_quiz)} questions")
            return {"success": True, "quiz": formatted_quiz}
        
        return {
            "success": False,
            "error": "Could not generate quiz. Please try again."
        }
        
    except Exception as e:
        print(f"Quiz generation error: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


@app.get("/")
async def root():
    return {
        "status": "AI Study Assistant API",
        "version": "1.0",
        "gemini_enabled": model is not None,
        "vector_db_initialized": vectordb is not None,
        "message": "Get free Gemini API key at: https://makersuite.google.com/app/apikey"
    }


@app.get("/api/status")
async def status():
    """Check API status and configuration"""
    return {
        "api": "running",
        "gemini": "enabled" if model else "disabled (fallback mode)",
        "vector_db": "initialized" if vectordb else "not initialized (upload PDF first)",
        "upload_dir": os.path.exists(UPLOAD_DIR),
        "db_dir": os.path.exists(DB_DIR)
    }


@app.post("/api/youtube-recommendations")
async def youtube_recommendations(topics: str = Form(...)):
    """Get YouTube video recommendations for topics."""
    try:
        topic_list = [t.strip() for t in topics.split(',') if t.strip()]
        
        if not topic_list:
            return {"success": False, "error": "No topics provided"}
        
        recommendations = []
        
        for topic in topic_list[:3]:
            search_query = quote_plus(f"{topic} tutorial explanation")
            search_url = f"https://www.youtube.com/results?search_query={search_query}"
            
            recommendations.append({
                "topic": topic,
                "search_url": search_url,
                "suggested_query": f"{topic} tutorial explanation",
                "videos": []
            })
        
        return {
            "success": True,
            "recommendations": recommendations
        }
    except Exception as e:
        print(f"YouTube recommendation error: {e}")
        return {"success": False, "error": str(e)}


@app.post("/api/analyze-quiz-attempt")
async def analyze_quiz_attempt(
    quiz_data: str = Form(...),
    answers: str = Form(...)
):
    """Analyze quiz attempt and identify weak topics."""
    try:
        import json
        quiz = json.loads(quiz_data)
        user_answers = json.loads(answers)
        
        weak_topics = []
        strong_topics = []
        
        for idx, question in enumerate(quiz):
            user_answer = user_answers.get(str(idx))
            correct_answer = question.get("correctAnswer")
            question_text = question.get("question", "")
            
            topic_keywords = question_text.split()[:5]
            topic = " ".join([w for w in topic_keywords if len(w) > 4])
            
            if user_answer is not None:
                if int(user_answer) == correct_answer:
                    strong_topics.append(topic)
                else:
                    weak_topics.append(topic)
        
        return {
            "success": True,
            "weak_topics": list(set(weak_topics)),
            "strong_topics": list(set(strong_topics))
        }
    except Exception as e:
        print(f"Quiz analysis error: {e}")
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)