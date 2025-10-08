import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { uploadPDF } from "../services/api";
import { useState } from "react";

function SourceSelector() {
  // Get the new pdfLoading state from the context
  const { pdfs, selectedPdf, setSelectedPdf, setPdfs, pdfLoading } = useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      //... (error handling remains the same)
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      // This part remains mostly the same, as uploading a new file
      // should still make it the active one.
      const response = await uploadPDF(file);

      console.log(response);

      if (!response.success) {
        throw new Error(response.error || "Upload failed");
      }

      const newPdf = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        backendProcessed: true,
      };

      setPdfs((prev) => {
        // Avoid duplicates
        if (prev.find((p) => p.name === newPdf.name)) return prev;
        return [...prev, newPdf];
      });

      // This will now automatically trigger the backend sync via the context
      setSelectedPdf(newPdf);

      setUploadStatus({
        type: "success",
        message: `✅ ${file.name} uploaded & selected!`,
      });
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message: `❌ Upload failed: ${error.message}`,
      });
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3 relative">
      <select
        value={selectedPdf?.id || ""}
        onChange={(e) => {
          const pdf = pdfs.find((p) => p.id === e.target.value);
          if (pdf) {
            // This now triggers the backend sync automatically
            setSelectedPdf(pdf);
          }
        }}
        // The dropdown is disabled while uploading OR while a selection is processing
        disabled={uploading || pdfLoading}
        className={`flex-1 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
          uploading || pdfLoading
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white"
        }`}
      >
        <option value="">
          {pdfLoading ? "Loading PDF..." : "Select a PDF..."}
        </option>
        {pdfs.map((pdf) => (
          <option key={pdf.id} value={pdf.id}>
            {pdf.name}
          </option>
        ))}
      </select>

      {/* Use the pdfLoading state to show a spinner inside the dropdown */}
      {pdfLoading && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Upload Button */}
      <label className="relative">
        {/* ... (the upload button and input remain exactly the same) ... */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={uploading || pdfLoading}
          className="hidden"
          id="pdf-upload-input"
        />
        <button
          type="button"
          onClick={() => document.getElementById("pdf-upload-input").click()}
          disabled={uploading || pdfLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload PDF</span>
            </>
          )}
        </button>
      </label>

      {/* ... (the status message display remains exactly the same) ... */}
      {uploadStatus && (
        <div
          className={`absolute top-full mt-2 right-0 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 min-w-[250px] ${
            uploadStatus.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {uploadStatus.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
}

export default SourceSelector;
