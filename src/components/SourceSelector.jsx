import React from "react";

const seeded = [
  {
    id: "ncert-xi-phy-1",
    name: "NCERT XI Physics — Sample 1",
    src: "/pdfs/ncert-sample1.pdf",
  },
  {
    id: "ncert-xi-phy-2",
    name: "NCERT XI Physics — Sample 2",
    src: "/pdfs/ncert-sample2.pdf",
  },
];

export default function SourceSelector({ onSelect, selected }) {
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    onSelect({ id: f.name, name: f.name, src: url, file: f });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Source selector</h3>

        <button
          className="text-sm underline mb-2"
          onClick={() =>
            onSelect({ id: "all", name: "All uploaded PDFs", src: null })
          }
        >
          All uploaded PDFs
        </button>

        <div className="mt-2 space-y-1">
          {seeded.map((s) => (
            <div
              key={s.id}
              className={`p-2 rounded cursor-pointer ${
                selected?.id === s.id
                  ? "bg-blue-50 border-l-4 border-blue-400"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => onSelect(s)}
            >
              {s.name}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-1">Upload PDF</label>
          <input type="file" accept="application/pdf" onChange={handleFile} />
        </div>
      </div>
    </div>
  );
}
