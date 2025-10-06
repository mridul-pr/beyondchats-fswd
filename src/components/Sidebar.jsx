// src/frontend/components/Sidebar.jsx
import React from "react";
import { BookOpen, X, FileText, MessageSquare, BarChart3 } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen } = useApp();

  const menuItems = [
    { id: "home", icon: BookOpen, label: "Home" },
    { id: "quiz", icon: FileText, label: "Quiz" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "dashboard", icon: BarChart3, label: "Progress" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-xl font-bold">StudyBuddy</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === item.id
                  ? "bg-white text-indigo-900 shadow-lg"
                  : "hover:bg-indigo-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-700">
          <p className="text-sm text-indigo-200">Your AI Learning Companion</p>
        </div>
      </div>
    </>
  );
}
