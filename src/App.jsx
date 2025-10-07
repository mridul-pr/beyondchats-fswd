import { useState } from "react";
import {
  Home,
  FileText,
  MessageSquare,
  BarChart3,
  Youtube,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "./context/AppContext";
import SourceSelector from "./components/SourceSelector";
import HomePage from "./pages/Home";
import QuizPage from "./pages/QuizPage";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import YouTubeRecommendations from "./pages/YouTubeRecommendations";

function App() {
  const { currentView, setCurrentView, selectedPdf } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", icon: Home, view: "home" },
    { name: "Quiz", icon: FileText, view: "quiz" },
    { name: "Chat", icon: MessageSquare, view: "chat" },
    { name: "Progress", icon: BarChart3, view: "dashboard" },
    { name: "Videos", icon: Youtube, view: "videos" },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "home":
        return <HomePage />;
      case "quiz":
        return <QuizPage />;
      case "chat":
        return <Chat />;
      case "dashboard":
        return <Dashboard />;
      case "videos":
        return <YouTubeRecommendations />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                  StudyBuddy
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === item.view
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Source Selector */}
            <div className="hidden md:block">
              <SourceSelector />
            </div>
          </div>

          {/* Mobile Source Selector */}
          <div className="md:hidden mt-3">
            <SourceSelector />
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setCurrentView(item.view);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      currentView === item.view
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* PDF Status Bar (if no PDF selected) */}
      {!selectedPdf && currentView !== "home" && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select or upload a PDF to use this feature
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{renderContent()}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden bg-white border-t border-gray-200 sticky bottom-0 z-20">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                  currentView === item.view
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
