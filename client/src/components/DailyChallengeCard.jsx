import React from "react";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const DailyChallengeCard = ({ challenges }) => {
  const challengeList = Array.isArray(challenges)
    ? challenges
    : challenges
    ? [challenges]
    : [];

  if (challengeList.length === 0) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 h-full flex flex-col items-center justify-center text-center">
        <p className="text-[#8b949e]">Loading daily challenge...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-green-500/20"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 z-10">
        <Zap className="w-5 h-5 text-[#d29922]" fill="#d29922" />
        <h3 className="text-lg font-semibold text-white">Daily Challenge</h3>
      </div>

      {/* Map through the challenges */}
      <div className="flex-1 space-y-6 z-10">
        {challengeList.map((challenge, index) => {
          const difficultyColor =
            challenge.difficulty === "Easy"
              ? "text-[#238636] border-[#238636]"
              : challenge.difficulty === "Medium"
              ? "text-[#d29922] border-[#d29922]"
              : "text-[#da3633] border-[#da3633]";

          return (
            <div
              key={index}
              className={index > 0 ? "pt-4 border-t border-[#30363d]" : ""}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-medium text-[#c9d1d9] line-clamp-1">
                  {challenge.title}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${difficultyColor} bg-opacity-10`}
                >
                  {challenge.difficulty}
                </span>
              </div>

              {/* Use 'url' or 'link' depending on your backend data */}
              <Link
                to={challenge.url || challenge.link}
                target="_blank"
                className="mt-3 w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Solve Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-[#8b949e] mt-4 z-10">
        Recommended to keep your streak alive!
      </p>
    </div>
  );
};

export default DailyChallengeCard;
