import {
  BarChart3,
  FileText,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useMemo, useState } from "react";
import PDFViewer from "../components/PDFViewer";

function Dashboard() {
  const { quizAttempts, selectedPdf } = useApp();
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    if (quizAttempts.length === 0) {
      return {
        totalQuizzes: 0,
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        improvement: 0,
        recentStreak: 0,
        topicsAnalysis: { strong: [], weak: [] },
      };
    }

    const totalQuizzes = quizAttempts.length;
    const avgScore = Math.round(
      quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalQuizzes
    );
    const highestScore = Math.max(...quizAttempts.map((a) => a.score));
    const lowestScore = Math.min(...quizAttempts.map((a) => a.score));

    // Calculate improvement (comparing recent 3 vs previous 3)
    let improvement = 0;
    if (totalQuizzes >= 6) {
      const recent = quizAttempts.slice(-3);
      const previous = quizAttempts.slice(-6, -3);
      const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / 3;
      const previousAvg = previous.reduce((sum, a) => sum + a.score, 0) / 3;
      improvement = Math.round(recentAvg - previousAvg);
    }

    // Analyze topics
    const topicScores = {};
    quizAttempts.forEach((attempt) => {
      const topic = attempt.pdfName.replace(".pdf", "").split(/[-_]/)[0];
      if (!topicScores[topic]) {
        topicScores[topic] = { scores: [], total: 0, count: 0 };
      }
      topicScores[topic].scores.push(attempt.score);
      topicScores[topic].total += attempt.score;
      topicScores[topic].count += 1;
    });

    const topics = Object.entries(topicScores).map(([name, data]) => ({
      name,
      avgScore: Math.round(data.total / data.count),
      attempts: data.count,
    }));

    const strong = topics
      .filter((t) => t.avgScore >= 75)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);
    const weak = topics
      .filter((t) => t.avgScore < 75)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3);

    return {
      totalQuizzes,
      avgScore,
      highestScore,
      lowestScore,
      improvement,
      recentStreak: Math.min(totalQuizzes, 7),
      topicsAnalysis: { strong, weak },
    };
  }, [quizAttempts]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    subtitle,
    trend,
  }) => (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}
          >
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
          {trend && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trend > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gray-50">
      {/* Main Dashboard Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-10 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-1">
                    Learning Analytics
                  </h1>
                  <p className="text-indigo-100 text-sm md:text-base">
                    Track your progress and master your studies
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="Total Quizzes"
              value={stats.totalQuizzes}
              icon={FileText}
              gradient="from-blue-500 to-cyan-500"
              subtitle={
                stats.totalQuizzes > 0
                  ? `${stats.recentStreak} day streak`
                  : "Start learning"
              }
            />
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              icon={Target}
              gradient="from-emerald-500 to-teal-500"
              subtitle={
                stats.totalQuizzes > 0
                  ? `Best: ${stats.highestScore}%`
                  : "No attempts yet"
              }
            />
            <StatCard
              title="Improvement"
              value={
                stats.improvement >= 0
                  ? `+${stats.improvement}%`
                  : `${stats.improvement}%`
              }
              icon={stats.improvement >= 0 ? TrendingUp : TrendingDown}
              gradient={
                stats.improvement >= 0
                  ? "from-green-500 to-emerald-500"
                  : "from-orange-500 to-red-500"
              }
              subtitle="vs. previous quizzes"
              trend={stats.improvement}
            />
            <StatCard
              title="Study Streak"
              value={`${stats.recentStreak}`}
              icon={Award}
              gradient="from-purple-500 to-pink-500"
              subtitle="days active"
            />
          </div>

          {/* No Data State */}
          {quizAttempts.length === 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-10 text-center shadow-lg">
              <div className="max-w-md mx-auto">
                <div className="inline-block p-4 bg-yellow-100 rounded-full mb-6">
                  <BarChart3 className="w-12 h-12 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Start Your Learning Journey! 🚀
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Take your first quiz to see your progress and track your
                  improvement
                </p>
                <button
                  onClick={() => (window.location.hash = "#quiz")}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Take a Quiz Now →
                </button>
              </div>
            </div>
          )}

          {/* Recent Quiz Attempts */}
          {quizAttempts.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Recent Quiz Attempts
                    </h3>
                  </div>
                  <span className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full">
                    {quizAttempts.length} total
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {quizAttempts
                  .slice(-10)
                  .reverse()
                  .map((attempt, idx) => (
                    <div
                      key={attempt.id}
                      className="group flex items-center justify-between p-5 border-2 border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                            attempt.score >= 80
                              ? "bg-gradient-to-br from-green-500 to-emerald-500"
                              : attempt.score >= 60
                              ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                              : "bg-gradient-to-br from-red-500 to-pink-500"
                          }`}
                        >
                          #{quizAttempts.length - idx}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                            {attempt.pdfName.replace(".pdf", "")}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-500">
                              {new Date(attempt.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                              {attempt.correctAnswers}/{attempt.totalQuestions}{" "}
                              correct
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div
                          className={`text-3xl font-bold ${
                            attempt.score >= 80
                              ? "text-green-600"
                              : attempt.score >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {attempt.score}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Topic Analysis */}
          {(stats.topicsAnalysis.strong.length > 0 ||
            stats.topicsAnalysis.weak.length > 0) && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Strong Topics */}
              {stats.topicsAnalysis.strong.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl shadow-lg border-2 border-green-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-7 h-7" />
                      <h3 className="text-xl font-bold">Strong Topics 💪</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {stats.topicsAnalysis.strong.map((topic, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 text-lg">
                              {topic.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {topic.attempts} quizzes taken
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                              {topic.avgScore}%
                            </div>
                          </div>
                        </div>
                        <div className="relative h-3 bg-green-100 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${topic.avgScore}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Topics */}
              {stats.topicsAnalysis.weak.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl shadow-lg border-2 border-orange-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                      <Target className="w-7 h-7" />
                      <h3 className="text-xl font-bold">Needs Practice 📚</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {stats.topicsAnalysis.weak.map((topic, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 text-lg">
                              {topic.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {topic.attempts} quizzes taken
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-orange-600">
                              {topic.avgScore}%
                            </div>
                          </div>
                        </div>
                        <div className="relative h-3 bg-orange-100 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${topic.avgScore}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => (window.location.hash = "#videos")}
                      className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      📹 Get Video Recommendations
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Motivational Card */}
          {quizAttempts.length > 0 && (
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3">
                  {stats.avgScore >= 80
                    ? "Outstanding Work! 🌟"
                    : stats.avgScore >= 60
                    ? "You're Making Progress! 📈"
                    : "Keep Practicing! 💪"}
                </h3>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  {stats.avgScore >= 80
                    ? "You're mastering the content! Keep challenging yourself with new topics and maintain this excellent momentum."
                    : stats.avgScore >= 60
                    ? "You're on the right track. Focus on your weak areas and you'll see great improvement in no time!"
                    : "Every expert was once a beginner. Keep taking quizzes and watching tutorial videos - consistency is key!"}
                </p>
              </div>
              <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>
          )}

          {/* PDF Viewer Toggle Button */}
          {selectedPdf && (
            <button
              onClick={() => setShowPdfViewer(!showPdfViewer)}
              className="lg:hidden w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <BookOpen className="w-5 h-5" />
              {showPdfViewer ? "Hide" : "View"} PDF: {selectedPdf.name}
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer Section - Desktop always visible, Mobile toggle */}
      {selectedPdf && (
        <div
          className={`${
            showPdfViewer ? "block" : "hidden"
          } lg:block lg:w-1/2 xl:w-2/5 border-l border-gray-200 bg-white`}
        >
          <PDFViewer pdfUrl={selectedPdf.url} pdfName={selectedPdf.name} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
