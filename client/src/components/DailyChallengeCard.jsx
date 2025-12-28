import React, { useState, useEffect } from "react";
import { ArrowRight, Zap, CheckSquare, Square } from "lucide-react";

import api from "../context/axios";

const DailyChallengeCard = ({ challenges, onStatusChange }) => {
  const [completedProblems, setCompletedProblems] = useState({});

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Ensure this endpoint exists in your backend as we discussed!
        const { data } = await api.get("/progress/completed");

        const statusMap = {};
        data.forEach((url) => {
          statusMap[url] = true;
        });

        setCompletedProblems(statusMap);
      } catch (error) {
        console.error("Failed to load completed problems", error);
      }
    };

    fetchStatus();
  }, []);

  const challengeList = Array.isArray(challenges)
    ? challenges
    : challenges
    ? [challenges]
    : [];

  // Loading State
  if (challengeList.length === 0) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 h-full flex flex-col items-center justify-center text-center">
        <p className="text-[#8b949e]">Loading daily challenge...</p>
      </div>
    );
  }

  const handleToggle = async (url) => {
    try {
      const isCurrentlyDone = completedProblems[url];

      // 1. Optimistic UI Update (Immediate feedback)
      setCompletedProblems((prev) => ({
        ...prev,
        [url]: !isCurrentlyDone,
      }));

      // 2. API Call
      await api.post("/toggel-Status", {
        problemUrl: url,
      });

      // 3. Notify Parent Component (Updates Heatmap!)
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Toggle failed", error);
      // Revert if API fails
      setCompletedProblems((prev) => ({
        ...prev,
        [url]: !prev[url],
      }));
    }
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-green-500/20"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 z-10">
        <Zap className="w-5 h-5 text-[#d29922]" fill="#d29922" />
        <h3 className="text-lg font-semibold text-white">Daily Challenge</h3>
      </div>

      {/* Challenge List */}
      <div className="flex-1 space-y-6 z-10">
        {challengeList.map((challenge, index) => {
          const difficultyColor =
            challenge.difficulty === "Easy"
              ? "text-[#238636] border-[#238636]"
              : challenge.difficulty === "Medium"
              ? "text-[#d29922] border-[#d29922]"
              : "text-[#da3633] border-[#da3633]";

          const isDone = !!completedProblems[challenge.url];
          const targetLink = challenge.url || challenge.link;

          return (
            <div
              key={index}
              className={index > 0 ? "pt-4 border-t border-[#30363d]" : ""}
            >
              <div className="flex items-center justify-between mb-2">
                <h4
                  className={`text-xl font-medium line-clamp-1 ${
                    isDone ? "text-[#8b949e] line-through" : "text-[#c9d1d9]"
                  }`}
                >
                  {challenge.title}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${difficultyColor} bg-opacity-10`}
                >
                  {challenge.difficulty}
                </span>
              </div>

              <div className="flex gap-3 mt-3">
                {/* FIX: Use <a> tag for external links, not <Link> */}
                <a
                  href={targetLink}
                  target="_blank"
                  rel="noopener noreferrer" // Security best practice
                  className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Solve <ArrowRight className="w-4 h-4" />
                </a>

                {/* Toggle Button */}
                <button
                  onClick={() => handleToggle(targetLink)}
                  className={`px-4 rounded-md border transition-colors flex items-center justify-center ${
                    isDone
                      ? "bg-[#238636]/20 border-[#238636] text-[#238636]"
                      : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e]"
                  }`}
                  title={isDone ? "Mark as Incomplete" : "Mark as Done"}
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-[#8b949e] mt-4 z-10">
        Done? Check the box to keep your streak alive!
      </p>
    </div>
  );
};

export default DailyChallengeCard;
