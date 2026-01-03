import React from "react";
import { Link } from "react-router-dom";
import { Layers, ShieldCheck } from "lucide-react";

const SheetCard = ({ sheet }) => {
  const { _id, title, description, isSystem, totalProblems = 0 } = sheet;
  console.log(sheet);
  return (
    <Link
      to={`/sheet/${_id}`}
      className="block group relative bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#58a6ff] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col h-full"
    >
      {/* Top Accent Line (Visible on Hover) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#58a6ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="p-5 flex flex-col h-full">
        {/* 1. Header: Icon + Title + Badge */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Icon Container */}
            <div className="shrink-0 p-2 bg-[#21262d] rounded-lg text-[#7d8590] group-hover:text-[#58a6ff] group-hover:bg-[#58a6ff]/10 transition-colors duration-300">
              <Layers size={20} strokeWidth={2} />
            </div>

            {/* SHEET TITLE - Enhanced Visibility */}
            <h3 className="text-lg font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors truncate">
              {title}
            </h3>
          </div>

          {/* Official Badge */}
          {isSystem && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/20 uppercase tracking-wide">
              <ShieldCheck size={10} />
              Official
            </span>
          )}
        </div>

        {/* 2. Description */}
        <p className="text-[#8b949e] text-sm leading-relaxed line-clamp-2 mb-6 grow">
          {description || "Master these problems to level up your skills."}
        </p>

        {/* 3. Footer: Stats & Progress */}
        <div className="mt-auto pt-4 border-t border-[#30363d] group-hover:border-[#30363d]/80 transition-colors">
          <div className="flex justify-between items-end mb-2">
            <div className="text-xs font-medium text-[#8b949e]">
              <span className="text-[#e6edf3]">0%</span> Complete
            </div>
            <div className="text-xs text-[#8b949e] font-mono">
              0 / {totalProblems}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#30363d] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#238636] h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
              style={{ width: "2%" }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SheetCard;
