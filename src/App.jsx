import React from "react";
import { useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Home from "./pages/Home";
import QuizPage from "./pages/QuizPage";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { currentView } = useApp();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {currentView === "home" && <Home />}
          {currentView === "quiz" && <QuizPage />}
          {currentView === "chat" && <Chat />}
          {currentView === "dashboard" && <Dashboard />}
        </main>
      </div>
    </div>
  );
}
