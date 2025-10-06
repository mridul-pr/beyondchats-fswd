import React, { useState } from "react";
import SourceSelector from "../components/SourceSelector";
import PdfViewer from "../components/PdfViewer";

export default function Home() {
  const [selectedPdf, setSelectedPdf] = useState(null);

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3">
        <SourceSelector onSelect={setSelectedPdf} selected={selectedPdf} />
      </aside>

      <section className="col-span-6">
        <PdfViewer file={selectedPdf} />
      </section>

      <aside className="col-span-3">
        <div className="p-4 bg-white rounded shadow">
          Right panel — placeholder (chat / quiz controls)
        </div>
      </aside>
    </div>
  );
}
