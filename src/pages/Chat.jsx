import { Send, MessageSquare, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";

function Chat() {
  const { chats, setChats, currentChatId, setCurrentChatId, selectedPdf } =
    useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    setInput("");
    setLoading(true);

    // Simulate AI response with RAG
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on the selected PDF "${
          selectedPdf?.name || "document"
        }", here's what I found:\n\nAccording to page 23: "Force is a vector quantity that causes acceleration." This fundamental principle helps us understand motion.\n\nWould you like me to explain this concept in more detail?`,
        citations: [
          {
            page: 23,
            text: "Force is a vector quantity that causes acceleration.",
          },
        ],
        timestamp: new Date().toISOString(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-full">
      {/* Chat List Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                currentChatId === chat.id
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-medium truncate">{chat.title}</p>
              <p className="text-xs text-gray-500">
                {chat.messages.length} messages
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No chat selected</p>
              <p className="text-sm">Create a new chat to get started</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-2xl rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        {msg.citations.map((cite, idx) => (
                          <p key={idx} className="text-xs text-gray-600">
                            📄 Page {cite.page}: "{cite.text}"
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-bounce">●</div>
                      <div className="animate-bounce delay-100">●</div>
                      <div className="animate-bounce delay-200">●</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything about your coursebook..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
