"use client";

import { Users, Info } from "lucide-react";
import { Wingman } from "@/app/types";

interface WingmanSectionProps {
  wingman: Wingman;
  tempWingman: Wingman;
  onWingmanChange: (wingman: Wingman) => void;
  onTempWingmanChange: (wingman: Wingman) => void;
}

const FAQ = ({ title, text }: { title: string; text: string }) => (
  <button
    onClick={() => alert(`${title.toUpperCase()}: ${text}`)}
    className="inline-block ml-1 text-slate-500 hover:text-orange-500 transition"
  >
    <Info size={14} />
  </button>
);

export function WingmanSection({
  wingman,
  tempWingman,
  onWingmanChange,
  onTempWingmanChange,
}: WingmanSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 px-4">
      <h2 className="text-2xl font-black uppercase text-white italic">
        Your Wingman <FAQ title="Wingman" text="Your brother in arms who disciples you." />
      </h2>

      {/* VIEW MODE: If Wingman is ALREADY saved in your local storage */}
      {wingman.name && wingman.phone ? (
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
              <Users className="text-orange-500" size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{wingman.name}</p>
              <p className="text-slate-400 text-sm mt-1">{wingman.phone}</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <p className="text-[10px] uppercase font-bold text-orange-500 mb-3 tracking-[0.2em]">
              Weekly Check-in Questions
            </p>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed italic">
              <p>• Did you complete your mission this week?</p>
              <p>• Did you protect your Private time?</p>
              <p>• Did you serve your wife and kids well?</p>
              <p>• What's your mission for next week?</p>
            </div>
          </div>

          <a
            href={`sms:${wingman.phone}`}
            className="w-full bg-orange-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm text-center block hover:bg-orange-500 transition-colors shadow-lg"
          >
            Text {wingman.name}
          </a>

          <button
            onClick={() => {
              onTempWingmanChange(wingman);
              onWingmanChange({ name: "", phone: "" });
            }}
            className="w-full border border-slate-800 text-slate-500 font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] hover:text-white transition-colors"
          >
            Change Wingman
          </button>
        </div>
      ) : (
        /* EDIT/INPUT MODE: Shown if wingman name is empty */
        <div className="bg-slate-900 border-2 border-dashed border-slate-800 p-8 rounded-3xl text-center space-y-6">
          <div className="space-y-2">
            <p className="text-white font-bold uppercase tracking-tight">Recruit a Wingman</p>
            <p className="text-xs text-slate-500">Every leader needs an accountability partner.</p>
          </div>

          <div className="space-y-3">
            <input
              className="w-full bg-black border border-slate-700 p-4 rounded-xl text-sm text-white focus:border-orange-500 outline-none transition-all"
              placeholder="Wingman Name"
              value={tempWingman.name}
              onChange={(e) => onTempWingmanChange({ ...tempWingman, name: e.target.value })}
            />
            <input
              className="w-full bg-black border border-slate-700 p-4 rounded-xl text-sm text-white focus:border-orange-500 outline-none transition-all"
              placeholder="Phone Number (e.g. +1234567890)"
              value={tempWingman.phone}
              onChange={(e) => onTempWingmanChange({ ...tempWingman, phone: e.target.value })}
            />
            <button
              disabled={!tempWingman.name.trim() || !tempWingman.phone.trim()}
              onClick={() => onWingmanChange(tempWingman)}
              className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm disabled:opacity-30 shadow-lg"
            >
              Lock in Wingman
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
