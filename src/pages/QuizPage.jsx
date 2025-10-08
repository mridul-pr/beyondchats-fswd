import { FileText, BookOpen, MessageSquare, Edit } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";
import { generateQuiz, scoreOpenEndedAnswers } from "../services/api";
import PDFViewer from "../components/PDFViewer";

function QuizPage() {
  const { selectedPdf, setQuizAttempts } = useApp();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [activeTab, setActiveTab] = useState("quiz");

  const [openEndedScores, setOpenEndedScores] = useState({});
  const [isScoring, setIsScoring] = useState(false);

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
    // NEW: Reset scores when generating a new quiz
    setOpenEndedScores({});

    try {
      const res = await generateQuiz(selectedPdf.id || selectedPdf.name);

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
        questions: res.quiz.map((q, idx) => ({ ...q, id: idx.toString() })),
      };

      const hasInvalidMcq = quizData.questions.some(
        (q) =>
          q.type === "mcq" &&
          (!Array.isArray(q.options) || q.options.length < 4)
      );

      if (quizData.questions.length === 0 || hasInvalidMcq) {
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

  // UPDATED: handleSubmit is now an async function to handle the API call
  const handleSubmit = async () => {
    if (!quiz || quiz.questions.length === 0) return;

    // Part 1: Score MCQs locally (this is fast)
    let correctCount = 0;
    const mcqQuestions = quiz.questions.filter((q) => q.type === "mcq");

    quiz.questions.forEach((q, originalIndex) => {
      if (q.type === "mcq") {
        const userAnswer = parseInt(answers[originalIndex]);
        if (userAnswer === q.correctAnswer) {
          correctCount++;
        }
      }
    });

    const finalScore =
      mcqQuestions.length > 0
        ? Math.round((correctCount / mcqQuestions.length) * 100)
        : 0;

    setScore(finalScore);
    setSubmitted(true); // Show MCQ results immediately
    setIsScoring(true); // Show a loading indicator for the AI scoring

    // Part 2: Score SAQ/LAQ via API (this takes a moment)
    try {
      const scoringResponse = await scoreOpenEndedAnswers(quiz, answers);
      if (scoringResponse.success) {
        setOpenEndedScores(scoringResponse.scores);
      }
    } catch (err) {
      console.error("Error scoring open-ended answers:", err);
      // Optionally set an error state to show the user
    } finally {
      setIsScoring(false); // Hide loading indicator
    }

    // Part 3: Save the attempt
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
        } md:block md:w-1/2 overflow-auto p-6 bg-gray-50`}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
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
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading ? "Generating..." : "✨ Generate New Quiz"}
          </button>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {!quiz && !loading && !error && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Click "Generate New Quiz" to start
              </p>
              <p className="text-gray-600">
                The AI will create a mix of questions from your PDF.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">
                Generating your quiz...
              </p>
              <p className="text-gray-600">This may take a few moments.</p>
            </div>
          )}

          {quiz && (
            <div className="space-y-6">
              {quiz.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-lg shadow-md p-6 transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800 mb-1">
                        {q.question}
                      </p>
                      <p className="text-sm font-medium text-indigo-500 mb-4 uppercase">
                        {q.type}
                      </p>

                      {q.type === "mcq" && (
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => {
                            const isSelected =
                              answers[idx] === optIdx.toString();
                            const isCorrect = optIdx === q.correctAnswer;
                            const showResult = submitted;

                            let bgColor =
                              "bg-white border-gray-300 hover:bg-gray-100";
                            if (showResult) {
                              if (isCorrect)
                                bgColor =
                                  "bg-green-100 border-green-500 text-green-800";
                              else if (isSelected)
                                bgColor =
                                  "bg-red-100 border-red-500 text-red-800";
                              else
                                bgColor =
                                  "bg-gray-100 border-gray-300 text-gray-500";
                            } else if (isSelected) {
                              bgColor = "bg-indigo-100 border-indigo-500";
                            }

                            return (
                              <label
                                key={optIdx}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${bgColor}`}
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
                                  className="form-radio h-4 w-4 text-indigo-600"
                                />
                                <span className="flex-1">{option}</span>
                                {showResult && isCorrect && (
                                  <span className="font-semibold">
                                    ✓ Correct
                                  </span>
                                )}
                                {showResult && isSelected && !isCorrect && (
                                  <span className="font-semibold">✗ Wrong</span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {(q.type === "saq" || q.type === "laq") && (
                        <div className="mt-2">
                          <textarea
                            rows={q.type === "saq" ? 3 : 6}
                            value={answers[idx] || ""}
                            onChange={(e) =>
                              handleAnswerChange(idx, e.target.value)
                            }
                            disabled={submitted}
                            placeholder="Type your answer here..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                          />
                        </div>
                      )}

                      {submitted && q.explanation && (
                        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                          <p className="font-bold text-blue-800 mb-2">
                            💡 Explanation / Ideal Answer:
                          </p>
                          <p className="text-gray-700 text-sm">
                            {q.explanation}
                          </p>
                        </div>
                      )}

                      {/* NEW: Display the AI score and feedback */}
                      {submitted && (q.type === "saq" || q.type === "laq") && (
                        <div className="mt-4">
                          {isScoring && !openEndedScores[q.id] && (
                            <div className="text-sm p-3 bg-gray-100 rounded-md text-gray-500 animate-pulse">
                              🤖 AI is scoring this answer...
                            </div>
                          )}
                          {openEndedScores[q.id] && (
                            <div className="bg-purple-50 border border-purple-200 p-3 rounded-md">
                              <p className="font-bold text-purple-800">
                                AI Score:
                                <span className="text-xl ml-2">
                                  {openEndedScores[q.id].score}/10
                                </span>
                              </p>
                              <p className="text-sm text-purple-700 mt-1">
                                <span className="font-semibold">Feedback:</span>{" "}
                                {openEndedScores[q.id].feedback}
                              </p>
                            </div>
                          )}
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
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
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
                          (q, idx) =>
                            q.type === "mcq" &&
                            parseInt(answers[idx]) === q.correctAnswer
                        ).length
                      }{" "}
                      out of{" "}
                      {quiz.questions.filter((q) => q.type === "mcq").length}{" "}
                      MCQs correct.
                    </p>
                    <p className="text-gray-600 mt-2">
                      Review the AI scores and feedback for the other questions
                      above.
                    </p>
                    <button
                      onClick={generateNewQuiz}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
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
