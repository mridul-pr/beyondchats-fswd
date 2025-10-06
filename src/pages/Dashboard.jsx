import { BarChart3, BarChart3Icon, FileText, BookOpen } from "lucide-react";
import StatCard from "../components/StatCard";
import { useApp } from "../context/AppContext";

function Dashboard() {
  const { quizAttempts } = useApp();

  const avgScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum, a) => sum + a.score, 0) /
            quizAttempts.length
        )
      : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold">Learning Progress</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Total Quizzes"
          value={quizAttempts.length}
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="Study Streak"
          value={`${Math.min(quizAttempts.length, 7)} days`}
          icon={BookOpen}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Quiz Attempts</h3>
        {quizAttempts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3Icon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No quiz attempts yet. Take a quiz to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizAttempts
              .slice(-10)
              .reverse()
              .map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">
                      Quiz #{attempt.quizId.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(attempt.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
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
              ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Strengths & Weaknesses</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">
              💪 Strong Topics
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span>Force & Motion</span>
                <span className="text-sm font-medium">92%</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span>Energy</span>
                <span className="text-sm font-medium">88%</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-600 mb-2">
              📚 Needs Practice
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span>Thermodynamics</span>
                <span className="text-sm font-medium">65%</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span>Waves</span>
                <span className="text-sm font-medium">58%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-2">Keep Going! 🚀</h3>
        <p>
          You're making great progress. Practice regularly to improve your
          understanding.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
