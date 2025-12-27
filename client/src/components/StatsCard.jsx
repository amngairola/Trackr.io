import React from "react";

const StatsCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[#8b949e] text-xs font-medium uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-md bg-opacity-10 ${color}`}>
        <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
      </div>
    </div>
  );
};

export default StatsCard;
