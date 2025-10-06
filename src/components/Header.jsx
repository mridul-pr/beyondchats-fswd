import SourceSelector from "./SourceSelector";
import { Menu, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";

function Header() {
  const { setSidebarOpen, selectedPdf, pdfs, setSelectedPdf } = useApp();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex-1 max-w-md">
          <SourceSelector />
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
          <FileText className="w-4 h-4" />
          <span>{selectedPdf ? selectedPdf.name : "Select a PDF"}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
