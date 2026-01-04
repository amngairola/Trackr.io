import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Plus,
  Database,
} from "lucide-react";
import api from "../context/axios";
import { useAuth } from "../context/AuthContext";
import AddProblemModal from "../components/AddProblemModal";

const SheetView = () => {
  const { user, setUser } = useAuth();
  const { sheetId } = useParams();
  const navigate = useNavigate();

  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedProblems, setCompletedProblems] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sheetRes, progressRes] = await Promise.all([
          api.get(`/getSheet/${sheetId}`),
          api.get("/progress/completed"),
        ]);

        setSheet(sheetRes.data.data || sheetRes.data);

        const statusMap = {};
        if (progressRes.data) {
          progressRes.data.forEach((url) => {
            statusMap[url] = true;
          });
        }
        setCompletedProblems(statusMap);
      } catch (error) {
        console.error("Error loading sheet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sheetId]);

  const handleProblemAdded = () => {
    window.location.reload();
  };

  // Helpers
  const isPersonalSheet =
    sheet &&
    user &&
    (sheet.owner?._id || sheet.owner)?.toString() === user._id?.toString();

  const isEmpty = sheet && (!sheet.problems || sheet.problems.length === 0);

  // Logic
  const handleToggle = async (url) => {
    try {
      const isCurrentlyDone = completedProblems[url];
      setCompletedProblems((prev) => ({ ...prev, [url]: !isCurrentlyDone }));
      await api.post("/toggel-Status", { problemUrl: url });
    } catch (error) {
      console.error("Toggle failed", error);
      setCompletedProblems((prev) => ({ ...prev, [url]: !prev[url] }));
    }
  };

  const calculateProgress = () => {
    if (!sheet || !sheet.problems || sheet.problems.length === 0) return 0;
    const solvedCount = sheet.problems.filter(
      (p) => completedProblems[p.link || p.url]
    ).length;
    return Math.round((solvedCount / sheet.problems.length) * 100);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="p-10 text-center text-[#8b949e]">Sheet not found.</div>
    );
  }

  const progressPercentage = calculateProgress();
  const solvedCount = sheet.problems
    ? sheet.problems.filter((p) => completedProblems[p.link || p.url]).length
    : 0;

  return (
    // Changed p-6 to p-3 for mobile, md:p-6 for desktop
    <div className="p-3 md:p-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      {/* 1. Navigation & Header */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
          className="inline-flex items-center text-sm text-[#8b949e] hover:text-blue-400 mb-4 transition-colors cursor-pointer active:scale-95 transform"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              {sheet.title || sheet.name}
            </h1>
            <p className="text-[#8b949e] text-sm md:text-base max-w-2xl line-clamp-2 md:line-clamp-none">
              {sheet.description ||
                "Master these problems to ace your interviews."}
            </p>
          </div>

          <div className="flex items-stretch gap-3 md:gap-4 shrink-0">
            {/* Progress Card */}
            <div className="bg-[#161b22] border border-[#30363d] p-3 md:p-4 rounded-xl flex-1 md:min-w-50">
              <div className="flex items-center justify-between mb-2 gap-4">
                <span className="text-xs md:text-sm font-medium text-[#8b949e]">
                  Progress
                </span>
                <span className="text-lg md:text-xl font-bold text-white">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-[#30363d] h-1.5 md:h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="mt-2 text-[10px] md:text-xs text-[#8b949e] text-right font-mono">
                {solvedCount} / {sheet.problems?.length || 0} Solved
              </div>
            </div>

            {/* Add Button (Mobile Compact / Desktop Full) */}
            {isPersonalSheet && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center px-4 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl font-medium transition-colors shadow-sm active:scale-95"
              >
                <Plus className="w-6 h-6 md:w-5 md:h-5 md:mr-2" />
                <span className="hidden md:inline">Add Problem</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Problems List/Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden min-h-[300px] flex flex-col shadow-lg">
        {/* Table Header (Desktop Only) */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-[#30363d] bg-[#21262d]/50 text-sm font-medium text-[#8b949e]">
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-7">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-[#30363d] flex-grow">
          {sheet.problems &&
            sheet.problems.map((problem, index) => {
              const targetLink = problem.link || problem.url;
              const isDone = !!completedProblems[targetLink];

              const diffColor =
                problem.difficulty === "Easy"
                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                  : problem.difficulty === "Medium"
                  ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                  : "text-red-400 bg-red-400/10 border-red-400/20";

              return (
                <div
                  key={index}
                  className={`
                    group
                    flex md:grid md:grid-cols-12 
                    gap-3 md:gap-4 
                    p-3 md:p-4 
                    items-center 
                    hover:bg-[#21262d]/40 transition-all active:bg-[#21262d]/60
                    ${isDone ? "opacity-60 grayscale-[0.5]" : ""}
                  `}
                >
                  {/* 1. Checkbox */}
                  <div className="shrink-0 md:col-span-1 flex justify-center">
                    <button
                      onClick={() => handleToggle(targetLink)}
                      className="text-[#8b949e] hover:text-green-500 transition-colors p-1"
                    >
                      {isDone ? (
                        <CheckCircle2
                          className="w-5 h-5 md:w-5 md:h-5 text-green-500"
                          fill="currentColor"
                          fillOpacity={0.2}
                        />
                      ) : (
                        <Circle className="w-5 h-5 md:w-5 md:h-5" />
                      )}
                    </button>
                  </div>

                  {/* 2. Content (Title + Badge) */}
                  <div className="flex-1 min-w-0 md:col-span-9 md:grid md:grid-cols-9 md:gap-4 items-center">
                    {/* Title */}
                    <div className="md:col-span-7 flex flex-col md:block">
                      <a
                        href={targetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm md:text-base font-medium truncate block mb-1 md:mb-0 hover:text-blue-400 transition-colors ${
                          isDone
                            ? "line-through text-[#8b949e]"
                            : "text-[#e6edf3]"
                        }`}
                      >
                        {problem.title}
                      </a>

                      {/* Mobile Badge (Shown below title) */}
                      <div className="md:hidden">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-block ${diffColor}`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Desktop Badge (Shown in column) */}
                    <div className="hidden md:block md:col-span-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border ${diffColor}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* 3. Action Icon */}
                  <div className="shrink-0 md:col-span-2 text-right">
                    <a
                      href={targetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 text-[#8b949e] hover:text-white hover:bg-[#30363d] rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}

          {/* EMPTY STATE */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-20 text-center h-full px-4">
              <div className="bg-[#21262d] p-4 rounded-full mb-4">
                <Database className="w-8 h-8 text-[#8b949e]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                This sheet is empty
              </h3>
              <p className="text-[#8b949e] mb-6 max-w-sm text-sm">
                {isPersonalSheet
                  ? "Start building your collection by adding your first problem."
                  : "No problems found in this system sheet."}
              </p>
              {isPersonalSheet && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-[#30363d] rounded-md text-blue-400 hover:text-blue-300 hover:bg-[#30363d] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AddProblemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        sheetId={sheetId}
        onProblemAdded={handleProblemAdded}
      />
    </div>
  );
};

export default SheetView;
