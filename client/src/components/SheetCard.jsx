import React from "react";
import { Link } from "react-router-dom";
import { Layers, ShieldCheck } from "lucide-react";

const SheetCard = ({ sheet }) => {
  const { _id, name, description, isSystem, totalProblems = 0 } = sheet;

  return (
    <Link
      to={`/sheet/${_id}`}
      className="block group relative bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#8b949e] transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
    >
      {/* Optional: Subtle top glow on hover (similar to your other cards) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="p-6 flex flex-col h-full">
        {/* 1. Header Area */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#21262d] rounded-lg text-[#8b949e] group-hover:text-blue-400 transition-colors">
              <Layers size={20} />
            </div>
            <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {name}
            </h3>
          </div>

          {/* Official Badge (Conditional Rendering) */}
          {isSystem && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              <ShieldCheck size={12} />
              Official
            </span>
          )}
        </div>

        {/* 2. Description Area */}
        <p className="text-[#8b949e] text-sm line-clamp-2 mb-6 grow">
          {description || "No description provided for this sheet."}
        </p>

        {/* 3. Footer / Progress Area (Placeholder based on requirements) */}
        <div className="mt-auto pt-4 border-t border-[#30363d]">
          <div className="flex justify-between text-xs mb-2 text-[#8b949e]">
            <span className="font-medium text-white">Progress</span>

            <span>0% Complete (0/{totalProblems} Solved)</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#238636] h-full transition-all duration-500"
              style={{ width: "0%" }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SheetCard;
