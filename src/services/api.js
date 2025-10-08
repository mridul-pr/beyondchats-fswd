const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Upload PDF file
 * @param {File} file - PDF file object
 */
export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`PDF upload failed: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || "PDF upload failed");
  return data;
};

/**
 * Tell the backend to load a specific PDF into its memory.
 * @param {string} filename - The name of the PDF file.
 */
export const selectPDF = async (filename) => {
  const formData = new FormData();
  formData.append("filename", filename);

  const res = await fetch(`${BASE_URL}/select-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`PDF selection failed: ${res.statusText}`);
  const data = await res.json();
  if (!data.success)
    throw new Error(data.error || "Failed to select PDF on backend");
  return data;
};

/**
 * Check vector database status
 */
export const getVectorDBStatus = async () => {
  const res = await fetch(`${BASE_URL}/vectordb-status`);
  if (!res.ok) throw new Error(`Status check failed: ${res.statusText}`);
  return await res.json();
};

/**
 * Chat with AI on selected PDF (simple version)
 */
export const chatWithPDF = async (query) => {
  const formData = new FormData();
  formData.append("query", query);

  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.statusText}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Chat request failed");
  return data;
};

/**
 * Chat with AI with citations
 */
export const chatWithCitations = async (query) => {
  const formData = new FormData();
  formData.append("query", query);

  const res = await fetch(`${BASE_URL}/chat-with-citations`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.statusText}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Chat request failed");
  return data;
};

/**
 * Generate quiz from PDF
 */
export const generateQuiz = async (topic) => {
  const formData = new FormData();
  formData.append("topic", topic);
  formData.append(
    "instruction",
    "Generate quiz questions strictly from the content of the selected student's PDF. Do NOT use any external or general knowledge. If insufficient data, reply with 'Not enough information in the PDF.'"
  );

  const res = await fetch(`${BASE_URL}/quiz`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Quiz generation failed: ${res.statusText}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Quiz generation failed");
  if (!data.quiz || !Array.isArray(data.quiz)) {
    throw new Error("Invalid quiz format received from server");
  }
  return data;
};

/**
 * Get scores for open-ended questions from the backend
 */
export const scoreOpenEndedAnswers = async (quiz, answers) => {
  const formData = new FormData();
  formData.append("quiz_data", JSON.stringify(quiz));
  formData.append("answers", JSON.stringify(answers));

  const res = await fetch(`${BASE_URL}/score-answers`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Scoring request failed: ${res.statusText}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to score answers");
  return data;
};

/**
 * Get YouTube video recommendations
 */
export const getYouTubeRecommendations = async (topics) => {
  const formData = new FormData();
  formData.append("topics", topics);

  const res = await fetch(`${BASE_URL}/youtube-recommendations`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok)
    throw new Error(`YouTube recommendations failed: ${res.statusText}`);
  const data = await res.json();
  if (!data.success)
    throw new Error(data.error || "Failed to get recommendations");
  return data;
};

/**
 * Analyze quiz attempt
 */
export const analyzeQuizAttempt = async (quiz, answers) => {
  const formData = new FormData();
  formData.append("quiz_data", JSON.stringify(quiz));
  formData.append("answers", JSON.stringify(answers));

  const res = await fetch(`${BASE_URL}/analyze-quiz-attempt`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Analysis failed");
  return data;
};

/**
 * ✅ NEW: Get AI-generated quiz feedback and weak topic insights
 * @param {Array} answers - Array of student answers with question, ideal answer, and topic
 */
export const getQuizFeedback = async (answers) => {
  const res = await fetch(`${BASE_URL}/quiz-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) throw new Error(`Feedback request failed: ${res.statusText}`);
  const data = await res.json();
  if (!data.success)
    throw new Error(data.error || "Feedback generation failed");
  return data;
};

/**
 * Check API status
 */
export const checkAPIStatus = async () => {
  const res = await fetch(`${BASE_URL}/status`);
  return await res.json();
};
