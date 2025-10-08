import {
  Send,
  MessageSquare,
  Plus,
  BookOpen,
  X,
  Sparkles,
  Bot,
  User,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";
import PdfViewer from "../components/PdfViewer";

const BASE_URL = "http://127.0.0.1:8000/api";

function Chat() {
  const { chats, setChats, currentChatId, setCurrentChatId, selectedPdf } =
    useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const currentChat = chats.find((c) => c.id === currentChatId);

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentChatId) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              title:
                chat.messages.length === 0
                  ? input.slice(0, 30) + "..."
                  : chat.title,
              messages: [...chat.messages, userMessage],
            }
          : chat
      )
    );

    const query = input;
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("query", query);

      const res = await fetch(`${BASE_URL}/chat-with-citations`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          citations: data.citations || [],
          timestamp: new Date().toISOString(),
        };

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, aiMessage] }
              : chat
          )
        );
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "❌ Sorry, I couldn't process that request. " + err.message,
        timestamp: new Date().toISOString(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPdf) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-10 max-w-md">
          <div className="inline-block p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-6">
            <BookOpen className="w-20 h-20 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No PDF Selected
          </h3>
          <p className="text-gray-600 mb-6">
            Please upload and select a PDF to start chatting with the AI
            assistant
          </p>
          <button
            onClick={() => (window.location.hash = "#library")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Go to Library →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-72 bg-white border-r border-gray-200 flex flex-col absolute md:relative inset-0 md:inset-auto z-20 shadow-xl md:shadow-none max-h-[100dvh] overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple bg-opacity-20 rounded-xl backdrop-blur-sm">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">Your Chats</h3>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="inline-block p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4">
                <MessageSquare className="w-10 h-10 text-indigo-600" />
              </div>
              <p className="text-gray-500 text-sm">No chats yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Start a new conversation
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setCurrentChatId(chat.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  currentChatId === chat.id
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border-2 border-indigo-200 shadow-md"
                    : "hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <p className="font-semibold truncate text-sm">{chat.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {chat.messages.length} messages
                </p>
              </button>
            ))
          )}
        </div>

        {/* PDF Info Footer */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 font-medium">Chatting with:</p>
              <p className="font-semibold text-gray-800 truncate">
                {selectedPdf.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!currentChat ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-2xl">
                <div className="inline-block p-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-6">
                  <MessageSquare className="w-24 h-24 text-indigo-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-3">
                  Start a Conversation
                </h3>
                <p className="text-gray-600 text-lg mb-8">
                  Ask questions about your PDF and get instant answers with
                  citations
                </p>
                <button
                  onClick={createNewChat}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Create New Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-2 text-white overflow-hidden shadow-lg flex-shrink-0">
                <div className="absolute inset-0 bg-black opacity-5"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <div className="p-2 bg-purple bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <Bot className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h2 className="font-bold text-lg">{currentChat.title}</h2>
                    <p className="text-xs text-indigo-100">
                      AI Study Assistant
                    </p>
                  </div>
                  {selectedPdf && (
                    <button
                      onClick={() => setShowPdfViewer(!showPdfViewer)}
                      className="lg:hidden px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all backdrop-blur-sm font-medium text-sm"
                    >
                      <BookOpen className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              </div>

              {/* Messages + Input */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
                  {currentChat.messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-10 max-w-2xl mx-auto border-2 border-indigo-100 shadow-xl">
                        <div className="inline-block p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6">
                          <Sparkles className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                          👋 Hello! I'm your AI study companion
                        </h3>
                        <p className="text-gray-600 mb-6 text-lg">
                          I can help you understand your coursebook better. Try
                          asking:
                        </p>
                        <div className="grid gap-3 text-sm">
                          <div className="bg-white rounded-xl p-4 text-left shadow-md hover:shadow-lg transition-shadow border border-indigo-100">
                            <span className="font-semibold text-indigo-600">
                              💡
                            </span>{" "}
                            "Explain the main concepts in this chapter"
                          </div>
                          <div className="bg-white rounded-xl p-4 text-left shadow-md hover:shadow-lg transition-shadow border border-purple-100">
                            <span className="font-semibold text-purple-600">
                              📖
                            </span>{" "}
                            "Give me examples of [topic]"
                          </div>
                          <div className="bg-white rounded-xl p-4 text-left shadow-md hover:shadow-lg transition-shadow border border-pink-100">
                            <span className="font-semibold text-pink-600">
                              ❓
                            </span>{" "}
                            "What is [concept] and why is it important?"
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      } animate-fadeIn`}
                    >
                      <div
                        className={`max-w-3xl ${
                          msg.role === "user" ? "w-auto" : "w-full"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {msg.role === "assistant" && (
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Bot className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div
                              className={`rounded-2xl p-5 shadow-lg ${
                                msg.role === "user"
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </p>

                              {msg.citations && msg.citations.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-gray-200">
                                  <p className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Sources:
                                  </p>
                                  <div className="space-y-2">
                                    {msg.citations.map((citation, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100"
                                      >
                                        <span className="font-bold text-indigo-600">
                                          [Source {citation.source}]
                                        </span>
                                        <p className="text-gray-700 mt-1 leading-relaxed">
                                          {citation.text}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 px-2">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          {msg.role === "user" && (
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
                          <div className="flex items-center gap-3 text-gray-500">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <span className="text-sm font-medium">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex-none bg-white border-t border-gray-200 p-4 mb-15 shadow-lg">
                  <div className="max-w-4xl mx-auto flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && !e.shiftKey && sendMessage()
                      }
                      placeholder="Ask anything about your coursebook..."
                      disabled={loading}
                      className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 transition-all text-gray-800 placeholder-gray-400"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <Send className="w-5 h-5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* PDF Viewer Section - Desktop always visible, Mobile toggle */}
        {selectedPdf && (
          <div
            className={`${
              showPdfViewer ? "block" : "hidden"
            } lg:block lg:w-1/2 xl:w-2/5 border-l border-gray-200 bg-white`}
          >
            <PdfViewer pdfUrl={selectedPdf.url} pdfName={selectedPdf.name} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
