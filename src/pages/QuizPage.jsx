import { FileText } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";

// ==================== QUIZ PAGE ====================
function QuizPage() {
  const { selectedPdf, quizAttempts, setQuizAttempts } = useApp();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});

    // Simulate quiz generation (replace with actual HuggingFace API call)
    setTimeout(() => {
      const sampleQuiz = {
        id: Date.now().toString(),
        pdfId: selectedPdf?.id || "all",
        questions: [
          {
            id: "1",
            type: "mcq",
            question: "What is the SI unit of force?",
            options: ["Newton", "Joule", "Watt", "Pascal"],
            correctAnswer: 0,
            explanation:
              "The SI unit of force is Newton (N), named after Sir Isaac Newton.",
          },
          {
            id: "2",
            type: "mcq",
            question:
              "Which law states that force equals mass times acceleration?",
            options: [
              "First Law",
              "Second Law",
              "Third Law",
              "Law of Gravitation",
            ],
            correctAnswer: 1,
            explanation: "Newton's Second Law states F = ma.",
          },
          {
            id: "3",
            type: "saq",
            question: "Define velocity and explain how it differs from speed.",
            correctAnswer:
              "Velocity is a vector quantity that includes both magnitude and direction, while speed is a scalar quantity with only magnitude.",
            explanation:
              "Velocity = displacement/time (vector), Speed = distance/time (scalar)",
          },
        ],
      };
      setQuiz(sampleQuiz);
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (q.type === "mcq" && parseInt(answers[idx]) === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round(
      (correctCount / quiz.questions.filter((q) => q.type === "mcq").length) *
        100
    );
    setScore(finalScore);
    setSubmitted(true);

    // Save attempt
    const attempt = {
      id: Date.now().toString(),
      quizId: quiz.id,
      pdfId: quiz.pdfId,
      score: finalScore,
      date: new Date().toISOString(),
      answers: answers,
    };
    setQuizAttempts((prev) => [...prev, attempt]);
  };

  if (!selectedPdf) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-yellow-800 font-medium">
            Please select a PDF to generate quiz
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Quiz Generator</h2>
          <button
            onClick={generateQuiz}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Generating..." : "Generate New Quiz"}
          </button>
        </div>

        {!quiz && !loading && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Click "Generate New Quiz" to start</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating quiz questions...</p>
          </div>
        )}

        {quiz && (
          <div className="space-y-6">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium mb-3">{q.question}</p>

                    {q.type === "mcq" && (
                      <div className="space-y-2">
                        {q.options.map((option, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                              submitted
                                ? optIdx === q.correctAnswer
                                  ? "bg-green-50 border-green-500"
                                  : parseInt(answers[idx]) === optIdx
                                  ? "bg-red-50 border-red-500"
                                  : "border-gray-200"
                                : answers[idx] === optIdx.toString()
                                ? "bg-indigo-50 border-indigo-500"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={optIdx}
                              checked={answers[idx] === optIdx.toString()}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [idx]: e.target.value,
                                }))
                              }
                              disabled={submitted}
                              className="text-indigo-600"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === "saq" && (
                      <textarea
                        value={answers[idx] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [idx]: e.target.value,
                          }))
                        }
                        disabled={submitted}
                        placeholder="Type your answer here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    )}

                    {submitted && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Explanation:
                        </p>
                        <p className="text-sm text-blue-800">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Submit Quiz
              </button>
            ) : (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">Quiz Completed! 🎉</h3>
                <p className="text-3xl font-bold">{score}%</p>
                <p className="mt-2">
                  Your score has been saved to progress tracking
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
