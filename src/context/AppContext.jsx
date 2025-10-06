import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [currentView, setCurrentView] = useState("home");
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ========== Local storage / seeding ==========
  useEffect(() => {
    const savedPdfs = JSON.parse(sessionStorage.getItem("pdfs") || "[]");
    const savedChats = JSON.parse(sessionStorage.getItem("chats") || "[]");
    const savedAttempts = JSON.parse(
      sessionStorage.getItem("quizAttempts") || "[]"
    );

    setPdfs(savedPdfs);
    setChats(savedChats);
    setQuizAttempts(savedAttempts);

    // Seed PDFs if empty
    if (savedPdfs.length === 0) {
      const samplePdfs = [
        {
          id: "ncert1",
          name: "NCERT Physics Class XI - Part 1",
          url: "sample",
          pages: 150,
        },
        {
          id: "ncert2",
          name: "NCERT Physics Class XI - Part 2",
          url: "sample",
          pages: 180,
        },
      ];
      setPdfs(samplePdfs);
      sessionStorage.setItem("pdfs", JSON.stringify(samplePdfs));
    }
  }, []);

  useEffect(() => sessionStorage.setItem("pdfs", JSON.stringify(pdfs)), [pdfs]);
  useEffect(
    () => sessionStorage.setItem("chats", JSON.stringify(chats)),
    [chats]
  );
  useEffect(
    () => sessionStorage.setItem("quizAttempts", JSON.stringify(quizAttempts)),
    [quizAttempts]
  );

  // ========= Provide all values =========
  const value = {
    pdfs,
    setPdfs,
    selectedPdf,
    setSelectedPdf,
    currentView,
    setCurrentView,
    chats,
    setChats,
    currentChatId,
    setCurrentChatId,
    quizAttempts,
    setQuizAttempts,
    sidebarOpen,
    setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
