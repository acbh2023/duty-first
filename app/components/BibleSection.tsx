"use client";

import { useState } from "react";
import { BookOpen, Trash2, Download } from "lucide-react";
import { BibleNote } from "@/app/types";

interface BibleSectionProps {
  bibleTakeaways: BibleNote[];
  onAddNote: (note: BibleNote) => void;
  onDeleteNote: (id: number) => void;
}

export function BibleSection({ bibleTakeaways, onAddNote, onDeleteNote }: BibleSectionProps) {
  const [tempNote, setTempNote] = useState({ book: "", passage: "", note: "" });

  const addBibleNote = () => {
    if (tempNote.note) {
      const entry: BibleNote = {
        id: Date.now(),
        book: tempNote.book,
        passage: tempNote.passage,
        note: tempNote.note,
        createdTime: new Date().toLocaleString(),
      };
      onAddNote(entry);
      setTempNote({ book: "", passage: "", note: "" });
    }
  };

  const handleExportCSV = () => {
    const headers = "Book,Passage,Takeaway,Date\n";
    const rows = bibleTakeaways
      .map((t) => `"${t.book}","${t.passage}","${t.note.replace(/"/g, '""')}","${t.createdTime}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bible_Takeaways_${new Date().toLocaleDateString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-md mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header and Export Button */}
      <div className="px-4 pt-8 flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black uppercase italic text-white leading-none">Bible Takeaways</h2>
          <p className="text-orange-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            press button to download takeaways &#61; &gt;
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-orange-500 transition-colors"
          title="Export CSV"
        >
          <Download size={20} />
        </button>
      </div>

      {/* Input Form for Bible Takeaways */}
      <div className="mx-4 p-5 bg-slate-900/50 border border-slate-800 rounded-2xl mb-8 shadow-2xl">
        <div className="grid grid-cols-2 gap-3">
          {/* Book input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Book</label>
            <input
              placeholder="e.g. Proverbs"
              className="w-full bg-black border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-orange-500 outline-none transition-all"
              value={tempNote.book}
              onChange={(e) => setTempNote({ ...tempNote, book: e.target.value })}
            />
          </div>
          {/* Passage input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Passage</label>
            <input
              placeholder="e.g. 3:5-6"
              className="w-full bg-black border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-orange-500 outline-none transition-all"
              value={tempNote.passage}
              onChange={(e) => setTempNote({ ...tempNote, passage: e.target.value })}
            />
          </div>
        </div>
        {/* Takeaway/Question textarea */}
        <div className="space-y-1 mt-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Takeaway or Question</label>
          <textarea
            placeholder="What did the Lord show you?"
            className="w-full bg-black border border-slate-700 p-3 rounded-lg text-sm text-white h-28 resize-none focus:border-orange-500 outline-none transition-all"
            value={tempNote.note}
            onChange={(e) => setTempNote({ ...tempNote, note: e.target.value })}
          />
        </div>
        {/* Button to add note */}
        <button
          onClick={addBibleNote}
          className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-xs tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-lg mt-4"
        >
          ADD
        </button>
      </div>

      {/* List of Saved Bible Takeaways */}
      <div className="px-4 space-y-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2">Recent Archives</h3>
        {bibleTakeaways.length === 0 ? (
          // Message if no entries
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
            <BookOpen className="mx-auto text-slate-800 mb-2" size={32} />
            <p className="text-slate-600 text-xs uppercase font-bold">No entries in the log yet.</p>
          </div>
        ) : (
          // Map through existing takeaways
          bibleTakeaways.map((item) => (
            <div key={item.id} className="bg-slate-900 border-l-4 border-orange-600 p-5 rounded-r-2xl shadow-md">
              <div className="flex justify-between items-start mb-3">
                {/* Book and Passage */}
                <div className="flex flex-col">
                  <span className="text-white font-black text-sm uppercase italic tracking-tight">
                    {item.book} {item.passage}
                  </span>
                  {/* Creation Time */}
                  <span className="text-[10px] text-slate-600 font-bold">{item.createdTime}</span>
                </div>
                {/* Delete button */}
                <button
                  onClick={() => onDeleteNote(item.id)}
                  className="text-slate-700 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {/* Takeaway text */}
              <p className="text-sm text-slate-300 leading-relaxed italic">"{item.note}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
