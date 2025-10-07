import { useApp } from "../context/AppContext";
import ActionCard from "../components/ActionCard";
import { BarChart3, FileText, MessageSquare, Youtube } from "lucide-react";

function HomePage() {
  const { selectedPdf, setSelectedPdf, setCurrentView, pdfs, setPdfs } =
    useApp();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to StudyBuddy! 📚</h2>
        <p className="text-indigo-100">
          Your AI-powered learning companion for NCERT coursebooks
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <ActionCard
          title="Take a Quiz"
          description="Test your knowledge with AI-generated questions"
          icon={FileText}
          color="indigo"
          onClick={() => setCurrentView("quiz")}
          disabled={!selectedPdf}
        />
        <ActionCard
          title="Chat with AI"
          description="Get instant answers from your coursebooks"
          icon={MessageSquare}
          color="purple"
          onClick={() => setCurrentView("chat")}
          disabled={!selectedPdf}
        />
        <ActionCard
          title="Track Progress"
          description="Monitor your learning journey"
          icon={BarChart3}
          color="green"
          onClick={() => setCurrentView("dashboard")}
        />
        <ActionCard
          title="Watch Videos"
          description="Discover relevant YouTube tutorials"
          icon={Youtube}
          color="red"
          onClick={() => setCurrentView("videos")}
        />
      </div>
    </div>
  );
}

export default HomePage;
