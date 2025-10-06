import { Upload } from "lucide-react";
import { useApp } from "../context/AppContext";

function SourceSelector() {
  const { pdfs, selectedPdf, setSelectedPdf, setPdfs } = useApp();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const newPdf = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        file: file,
        pages: 0,
      };
      setPdfs((prev) => [...prev, newPdf]);
      setSelectedPdf(newPdf);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedPdf?.id || ""}
        onChange={(e) => {
          const pdf = pdfs.find((p) => p.id === e.target.value);
          setSelectedPdf(pdf || null);
        }}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">Select PDF...</option>
        <option value="all">All Uploaded PDFs</option>
        {pdfs.map((pdf) => (
          <option key={pdf.id} value={pdf.id}>
            {pdf.name}
          </option>
        ))}
      </select>

      <label className="cursor-pointer p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
        <Upload className="w-5 h-5" />
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </div>
  );
}

export default SourceSelector;
