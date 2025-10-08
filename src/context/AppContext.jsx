import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { selectPDF, uploadPDF } from "../services/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 🔹 Handle PDF selection (no saving/loading now)
  const handleSelectPdf = useCallback(
    async (pdf) => {
      if (!pdf || (selectedPdf && selectedPdf.id === pdf.id)) return;

      console.log(`🔄 Selecting PDF: ${pdf.name}`);
      setPdfLoading(true);
      setSelectedPdf(pdf);

      try {
        await selectPDF(pdf.name);
        console.log(`✅ Synced with backend: ${pdf.name}`);
      } catch (error) {
        console.error("Failed to sync PDF with backend:", error);
        setSelectedPdf(null);
      } finally {
        setPdfLoading(false);
      }
    },
    [selectedPdf]
  );

  // 🔹 Remove all sessionStorage loading or default seeding
  useEffect(() => {
    console.log("🚀 App initialized — no saved PDFs will be loaded.");
  }, []);

  // ✅ Keep only non-PDF related persistence if needed
  useEffect(() => {
    sessionStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    sessionStorage.setItem("quizAttempts", JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  const value = {
    pdfs,
    setPdfs,
    selectedPdf,
    setSelectedPdf: handleSelectPdf,
    pdfLoading,
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
