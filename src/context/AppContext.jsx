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

  // Initialize data from sessionStorage
  useEffect(() => {
    const savedPdfs = JSON.parse(sessionStorage.getItem("pdfs") || "[]");
    const savedChats = JSON.parse(sessionStorage.getItem("chats") || "[]");
    const savedAttempts = JSON.parse(
      sessionStorage.getItem("quizAttempts") || "[]"
    );
    const savedSelectedPdf = JSON.parse(
      sessionStorage.getItem("selectedPdf") || "null"
    );

    setPdfs(savedPdfs);
    setChats(savedChats);
    setQuizAttempts(savedAttempts);

    // If no PDFs saved, seed from public folder automatically
    if (savedPdfs.length === 0) {
      const seedPdfs = [
        {
          id: "pdf1",
          name: "Class 3 Maths",
          url: "/pdfs/Class3_Maths.pdf",
          pages: 0,
          uploadedAt: new Date().toISOString(),
        },
        {
          id: "pdf2",
          name: "Class 7 Science",
          url: "/pdfs/Class7_Science.pdf",
          pages: 0,
          uploadedAt: new Date().toISOString(),
        },
      ];
      setPdfs(seedPdfs);
      sessionStorage.setItem("pdfs", JSON.stringify(seedPdfs));

      // Auto-select the first PDF
      setSelectedPdf(seedPdfs[0]);
      sessionStorage.setItem("selectedPdf", JSON.stringify(seedPdfs[0]));
    } else if (savedSelectedPdf) {
      // Restore selected PDF from session storage
      // Verify it still exists in the pdfs array
      const pdfExists = savedPdfs.find((pdf) => pdf.id === savedSelectedPdf.id);
      if (pdfExists) {
        setSelectedPdf(pdfExists);
      } else if (savedPdfs.length > 0) {
        // If saved PDF doesn't exist, select the first available
        setSelectedPdf(savedPdfs[0]);
        sessionStorage.setItem("selectedPdf", JSON.stringify(savedPdfs[0]));
      }
    } else if (savedPdfs.length > 0) {
      // If no PDF was selected but PDFs exist, select the first one
      setSelectedPdf(savedPdfs[0]);
      sessionStorage.setItem("selectedPdf", JSON.stringify(savedPdfs[0]));
    }
  }, []);

  // Persist data to sessionStorage whenever it changes
  useEffect(() => {
    if (pdfs.length > 0) {
      sessionStorage.setItem("pdfs", JSON.stringify(pdfs));
    }
  }, [pdfs]);

  useEffect(() => {
    sessionStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    sessionStorage.setItem("quizAttempts", JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  // Persist selectedPdf to sessionStorage
  useEffect(() => {
    if (selectedPdf) {
      sessionStorage.setItem("selectedPdf", JSON.stringify(selectedPdf));
      console.log("📌 Selected PDF updated:", selectedPdf.name);
    } else {
      sessionStorage.removeItem("selectedPdf");
      console.log("📌 Selected PDF cleared");
    }
  }, [selectedPdf]);

  // Custom setter that ensures PDF selection is tracked
  const selectPdf = (pdf) => {
    console.log("🔄 Selecting PDF:", pdf?.name || "none");
    setSelectedPdf(pdf);
  };

  const value = {
    pdfs,
    setPdfs,
    selectedPdf,
    setSelectedPdf: selectPdf, // Use wrapped setter
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
