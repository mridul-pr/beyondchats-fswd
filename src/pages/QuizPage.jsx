import { FileText, BookOpen } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";
import { generateQuiz } from "../services/api";
import PDFViewer from "../components/PDFViewer";

function QuizPage() {
  const { selectedPdf, quizAttempts, setQuizAttempts } = useApp();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [activeTab, setActiveTab] = useState("quiz"); // 'quiz' or 'pdf'

  const generateNewQuiz = async () => {
    if (!selectedPdf) {
      setError("Please select a PDF first");
      return;
    }

    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setError(null);
    setQuiz(null);

    try {
      const res = await generateQuiz(selectedPdf.name);

      if (!res.success || !res.quiz) {
        throw new Error(res.error || "Quiz generation failed");
      }

      if (res.quiz.length === 0) {
        throw new Error("No questions generated. Try uploading the PDF again.");
      }

      const quizData = {
        id: Date.now().toString(),
        pdfId: selectedPdf.id,
        pdfName: selectedPdf.name,
        questions: res.quiz.map((q, idx) => ({
          id: idx.toString(),
          type: q.type || "mcq",
          question: q.question || "Question not available",
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer:
            typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          explanation: q.explanation || "No explanation provided",
        })),
      };

      if (
        quizData.questions.length === 0 ||
        quizData.questions.some((q) => q.options.length < 4)
      ) {
        throw new Error("Invalid quiz data received. Please try again.");
      }

      setQuiz(quizData);
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(`⚠️ ${err.message || "Failed to generate quiz"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIdx, value) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIdx]: value }));
  };

  const handleSubmit = () => {
    if (!quiz || quiz.questions.length === 0) return;

    let correctCount = 0;
    const mcqQuestions = quiz.questions.filter((q) => q.type === "mcq");

    mcqQuestions.forEach((q, idx) => {
      const userAnswer = parseInt(answers[idx]);
      if (userAnswer === q.correctAnswer) correctCount++;
    });

    const finalScore =
      mcqQuestions.length > 0
        ? Math.round((correctCount / mcqQuestions.length) * 100)
        : 0;
    setScore(finalScore);
    setSubmitted(true);

    const attempt = {
      id: Date.now().toString(),
      quizId: quiz.id,
      pdfId: quiz.pdfId,
      pdfName: quiz.pdfName,
      score: finalScore,
      date: new Date().toISOString(),
      totalQuestions: mcqQuestions.length,
      correctAnswers: correctCount,
      answers: answers,
    };

    setQuizAttempts((prev) => [...prev, attempt]);
  };

  if (!selectedPdf) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Please select a PDF from the library to generate a quiz
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Mobile Tab Switcher */}
      <div className="md:hidden bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex-1 py-3 font-medium ${
            activeTab === "quiz"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600"
          }`}
        >
          📝 Quiz
        </button>
        <button
          onClick={() => setActiveTab("pdf")}
          className={`flex-1 py-3 font-medium ${
            activeTab === "pdf"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600"
          }`}
        >
          📄 PDF
        </button>
      </div>

      {/* Quiz Section */}
      <div
        className={`${
          activeTab === "quiz" ? "block" : "hidden"
        } md:block md:w-1/2 overflow-auto p-6`}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Quiz Generator</h2>
            </div>
            <p className="text-indigo-100 text-sm">
              Selected: {selectedPdf.name}
            </p>
          </div>

          <button
            onClick={generateNewQuiz}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate New Quiz"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!quiz && !loading && !error && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Click "Generate New Quiz" to start
              </p>
              <p className="text-gray-600">
                The AI will create quiz questions based on your PDF content
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">
                Generating quiz questions...
              </p>
              <p className="text-gray-600">This may take a few moments</p>
            </div>
          )}

          {quiz && (
            <div className="space-y-6">
              {quiz.questions.map((q, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800 mb-4">
                        {q.question}
                      </p>

                      {q.type === "mcq" && (
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => {
                            const isSelected =
                              answers[idx] === optIdx.toString();
                            const isCorrect = optIdx === q.correctAnswer;
                            const showResult = submitted;

                            let bgColor =
                              "bg-white border-gray-200 hover:bg-gray-50";
                            if (showResult) {
                              if (isCorrect)
                                bgColor = "bg-green-50 border-green-500";
                              else if (isSelected)
                                bgColor = "bg-red-50 border-red-500";
                              else bgColor = "bg-gray-50 border-gray-200";
                            } else if (isSelected) {
                              bgColor = "bg-indigo-50 border-indigo-500";
                            }

                            return (
                              <label
                                key={optIdx}
                                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${bgColor}`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${idx}`}
                                  value={optIdx}
                                  checked={isSelected}
                                  onChange={(e) =>
                                    handleAnswerChange(idx, e.target.value)
                                  }
                                  disabled={submitted}
                                  className="text-indigo-600 w-4 h-4"
                                />
                                {option}
                                {showResult && isCorrect && (
                                  <span className="ml-auto text-green-600 font-semibold">
                                    ✓ Correct
                                  </span>
                                )}
                                {showResult && isSelected && !isCorrect && (
                                  <span className="ml-auto text-red-600 font-semibold">
                                    ✗ Wrong
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {submitted && q.explanation && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="font-semibold text-blue-800 mb-2">
                            💡 Explanation:
                          </p>
                          <p className="text-gray-700">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-lg shadow-md p-6">
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-2xl font-bold text-gray-800">
                      Quiz Completed! 🎉
                    </p>
                    <p className="text-6xl font-bold text-indigo-600">
                      {score}%
                    </p>
                    <p className="text-gray-600">
                      You got{" "}
                      {
                        quiz.questions.filter(
                          (_, idx) =>
                            parseInt(answers[idx]) ===
                            quiz.questions[idx].correctAnswer
                        ).length
                      }{" "}
                      out of {quiz.questions.length} correct
                    </p>
                    <p className="text-sm text-gray-500">
                      Your score has been saved to progress tracking
                    </p>
                    <button
                      onClick={generateNewQuiz}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Try Another Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Section */}
      <div
        className={`${
          activeTab === "pdf" ? "block" : "hidden"
        } md:block md:w-1/2 border-l border-gray-200`}
      >
        <PDFViewer pdfUrl={selectedPdf.url} pdfName={selectedPdf.name} />
      </div>
    </div>
  );
}

export default QuizPage;
