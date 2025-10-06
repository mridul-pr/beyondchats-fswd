import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  if (!file) {
    return (
      <div className="p-6 bg-white rounded shadow">
        No PDF selected. Choose a source or upload a PDF.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="mb-2 font-semibold">{file.name || "Selected PDF"}</div>

      <div className="flex justify-center">
        <Document file={file.src || file} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <div>
          Page {pageNumber} / {numPages || "-"}
        </div>
        <div>
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            className="px-2 py-1 mr-2 bg-gray-100 rounded"
          >
            Prev
          </button>
          <button
            onClick={() =>
              setPageNumber((p) => Math.min(numPages || p + 1, p + 1))
            }
            className="px-2 py-1 bg-gray-100 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
