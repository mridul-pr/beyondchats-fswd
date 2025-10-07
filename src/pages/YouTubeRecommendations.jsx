import { Youtube, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const BASE_URL = "http://127.0.0.1:8000/api";

function YouTubeRecommendations() {
  const { quizAttempts, selectedPdf } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weakTopics, setWeakTopics] = useState([]);

  useEffect(() => {
    analyzeWeakTopics();
  }, [quizAttempts]);

  const analyzeWeakTopics = () => {
    if (quizAttempts.length === 0) return;

    // Get recent attempts (last 5)
    const recentAttempts = quizAttempts.slice(-5);
    const topics = {};

    recentAttempts.forEach((attempt) => {
      // Extract topics from quiz (simplified - you'd want better topic extraction)
      const score = attempt.score;
      const pdfName = attempt.pdfName;

      if (score < 70) {
        // Consider this a weak topic
        const topic = pdfName
          .replace(".pdf", "")
          .replace("_", " ")
          .replace("-", " ");
        topics[topic] = (topics[topic] || 0) + 1;
      }
    });

    const sortedTopics = Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    setWeakTopics(sortedTopics);
  };

  const fetchRecommendations = async () => {
    if (weakTopics.length === 0 && !selectedPdf) {
      alert("Please take some quizzes or select a PDF first!");
      return;
    }

    setLoading(true);
    try {
      const topics =
        weakTopics.length > 0
          ? weakTopics.join(",")
          : selectedPdf.name.replace(".pdf", "");

      const formData = new FormData();
      formData.append("topics", topics);

      const res = await fetch(`${BASE_URL}/youtube-recommendations`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Youtube className="w-8 h-8" />
          <h2 className="text-3xl font-bold">Video Recommendations</h2>
        </div>
        <p className="text-red-100">
          Personalized video tutorials based on your quiz performance
        </p>
      </div>

      {/* Weak Topics Section */}
      {weakTopics.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">📚 Topics to Focus On</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {weakTopics.map((topic, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-medium"
              >
                {topic}
              </div>
            ))}
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Finding Videos...
              </>
            ) : (
              <>
                <Youtube className="w-5 h-5" />
                Get Video Recommendations
              </>
            )}
          </button>
        </div>
      )}

      {/* No Quiz Attempts */}
      {quizAttempts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Youtube className="w-16 h-16 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Take Quizzes to Get Personalized Recommendations
          </h3>
          <p className="text-gray-600">
            Complete a few quizzes so we can analyze your weak areas and suggest
            helpful videos
          </p>
        </div>
      )}

      {/* Recommendations Display */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Recommended Videos</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4">
                  <h4 className="font-semibold text-white text-lg">
                    {rec.topic}
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Search Query:{" "}
                    <span className="font-medium">{rec.suggested_query}</span>
                  </p>
                  <a
                    href={rec.search_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Youtube className="w-5 h-5" />
                    Watch on YouTube
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternative: Current PDF Recommendations */}
      {selectedPdf && recommendations.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            📖 Videos for Current PDF
          </h3>
          <p className="text-gray-600 mb-4">
            Get video tutorials related to:{" "}
            <span className="font-semibold">{selectedPdf.name}</span>
          </p>
          <button
            onClick={fetchRecommendations}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
          >
            <Youtube className="w-5 h-5" />
            Find Videos
          </button>
        </div>
      )}

      {/* Educational Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          💡 Tips for Effective Video Learning
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">1.</span>
            <span>Take notes while watching videos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">2.</span>
            <span>Pause and try solving problems on your own</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">3.</span>
            <span>Rewatch difficult sections multiple times</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">4.</span>
            <span>Practice with quiz after watching</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default YouTubeRecommendations;
