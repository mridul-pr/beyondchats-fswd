import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";

function PDFViewer() {
  const { selectedPdf } = useApp();
  const [currentPage, setCurrentPage] = useState(1);

  if (!selectedPdf) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">PDF Viewer</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 hover:bg-gray-100 rounded"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page {currentPage} / {selectedPdf.pages || "?"}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-medium">{selectedPdf.name}</p>
          <p className="text-sm mt-2">
            PDF viewing requires pdf.js integration
          </p>
          <p className="text-xs mt-1">See implementation notes in README</p>
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;
