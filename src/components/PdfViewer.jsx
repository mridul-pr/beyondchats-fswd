import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, FileText } from "lucide-react";

function PDFViewer({ pdfUrl, pdfName }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  if (!pdfUrl || pdfUrl === "sample") {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">PDF Preview</h3>
          </div>
        </div>

        {/* Placeholder */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              PDF Preview Not Available
            </h3>
            <p className="text-gray-600 mb-4">
              {pdfName === "sample" || !pdfName
                ? "This is a sample PDF placeholder. Upload a real PDF file to view it here."
                : "Upload a PDF file to view it here."}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
              <p className="font-semibold text-blue-800 mb-2">
                💡 To view PDFs:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Click "Upload PDF" in the header</li>
                <li>Select your coursebook PDF file</li>
                <li>Wait for processing to complete</li>
                <li>View it here alongside your quiz/chat</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col bg-gray-100 ${
        fullscreen ? "fixed inset-0 z-50" : ""
      }`}
    >
      {/* PDF Controls Header - HIDDEN IN FULLSCREEN */}
      {!fullscreen && (
        <div className="bg-white border-b border-gray-300 p-3 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm">
          {/* Page Navigation */}

          {/* PDF Name (Hidden on small screens) */}
          <div className="hidden md:block text-center">
            <p
              className="text-sm font-medium text-gray-700 truncate"
              title={pdfName}
            >
              {pdfName}
            </p>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={zoom <= 50}
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <div className="px-3 py-1 bg-gray-100 rounded-lg min-w-[60px] text-center">
              <span className="text-sm font-medium text-gray-700">{zoom}%</span>
            </div>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={zoom >= 200}
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
              title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* PDF Display Area - SCROLLABLE */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        <div className="max-w-5xl mx-auto">
          {/* PDF Iframe with proper scrolling */}
          <div
            className="bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              marginBottom: zoom > 100 ? `${(zoom - 100) * 5}px` : "0",
            }}
          >
            <iframe
              src={`${pdfUrl}#page=${currentPage}&view=FitH`}
              className="w-full border-0"
              style={{
                height: fullscreen ? "100vh" : "90vh", // Adjust height for fullscreen
                minHeight: "600px",
              }}
              title={pdfName}
            />
          </div>
        </div>
      </div>

      {/* Quick Tips (Only show when not fullscreen) */}
      {!fullscreen && (
        <div className="bg-indigo-50 border-t border-indigo-200 p-3 flex-shrink-0">
          <div className="flex items-start gap-2 text-xs text-indigo-700">
            <span className="font-semibold">💡 Tips:</span>
            <span>
              Use arrow buttons to navigate • Zoom in/out for better readability
              • Click fullscreen for focused view
            </span>
          </div>
        </div>
      )}

      {/* Fullscreen Close Button */}
      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors z-[100] flex items-center gap-2"
        >
          <span>✕</span>
          <span className="font-medium">Close Fullscreen</span>
        </button>
      )}
    </div>
  );
}

export default PDFViewer;
