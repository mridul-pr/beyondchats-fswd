const BASE_URL = "http://127.0.0.1:8000/api";

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

  if (!data.success) {
    throw new Error(data.error || "PDF upload failed");
  }

  return data;
};

/**
 * Select/load a PDF into the backend vector database
 * @param {string} pdfName - Name of the PDF file
 */
export const selectPDF = async (pdfName) => {
  const formData = new FormData();
  formData.append("pdf_name", pdfName);

  const res = await fetch(`${BASE_URL}/select-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`PDF selection failed: ${res.statusText}`);
  }

  const data = await res.json();

  return data; // Don't throw on !success, let caller handle
};

/**
 * Check vector database status
 */
export const getVectorDBStatus = async () => {
  const res = await fetch(`${BASE_URL}/vectordb-status`);

  if (!res.ok) {
    throw new Error(`Status check failed: ${res.statusText}`);
  }

  return await res.json();
};

/**
 * Chat with AI on selected PDF (simple version)
 * @param {string} query - user's question
 */
export const chatWithPDF = async (query) => {
  const formData = new FormData();
  formData.append("query", query);

  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Chat request failed");
  }

  return data;
};

/**
 * Chat with AI with citations
 * @param {string} query - user's question
 */
export const chatWithCitations = async (query) => {
  const formData = new FormData();
  formData.append("query", query);

  const res = await fetch(`${BASE_URL}/chat-with-citations`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Chat request failed");
  }

  return data;
};

/**
 * Generate quiz from PDF
 * @param {string} topic - PDF name or topic
 */
export const generateQuiz = async (topic) => {
  const formData = new FormData();
  formData.append("topic", topic);

  const res = await fetch(`${BASE_URL}/quiz`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Quiz generation failed: ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Quiz generation failed");
  }

  // Validate quiz structure
  if (!data.quiz || !Array.isArray(data.quiz)) {
    throw new Error("Invalid quiz format received from server");
  }

  return data;
};

/**
 * Get YouTube video recommendations
 * @param {string} topics - Comma-separated topics
 */
export const getYouTubeRecommendations = async (topics) => {
  const formData = new FormData();
  formData.append("topics", topics);

  const res = await fetch(`${BASE_URL}/youtube-recommendations`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`YouTube recommendations failed: ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to get recommendations");
  }

  return data;
};

/**
 * Analyze quiz attempt
 * @param {Object} quiz - Quiz questions
 * @param {Object} answers - User answers
 */
export const analyzeQuizAttempt = async (quiz, answers) => {
  const formData = new FormData();
  formData.append("quiz_data", JSON.stringify(quiz));
  formData.append("answers", JSON.stringify(answers));

  const res = await fetch(`${BASE_URL}/analyze-quiz-attempt`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Analysis failed: ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Analysis failed");
  }

  return data;
};

/**
 * Check API status
 */
export const checkAPIStatus = async () => {
  const res = await fetch(`${BASE_URL}/status`);
  return await res.json();
};
