import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Plus, // Added
  Database, // Added
} from "lucide-react";
import api from "../context/axios";

import { useNavigate } from "react-router-dom";

import AddProblemModal from "../components/AddProblemModal";

const SheetView = () => {
  const { sheetId } = useParams();

  const navigate = useNavigate();

  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedProblems, setCompletedProblems] = useState({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch Sheet Details AND User Progress in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Run both requests at the same time for speed
        const [sheetRes, progressRes] = await Promise.all([
          api.get(`/getSheet/${sheetId}`),
          api.get("/progress/completed"),
        ]);

        // 2. Set Sheet Data
        // Adjust this if your backend returns { data: { ... } } or just { ... }
        setSheet(sheetRes.data.data || sheetRes.data);

        // 3. Set Progress Map
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

  // Function to refresh data after adding a problem
  const handleProblemAdded = () => {
    window.location.reload();
  };

  // Helper booleans
  // We assume personal sheets have isSystem: false (or undefined)
  const isPersonalSheet =
    sheet && (sheet.isSystem === false || sheet.isSystem === undefined);
  const isEmpty = sheet && (!sheet.problems || sheet.problems.length === 0);

  // Handle Toggle Logic
  const handleToggle = async (url) => {
    try {
      const isCurrentlyDone = completedProblems[url];

      // 1. Optimistic UI Update
      setCompletedProblems((prev) => ({
        ...prev,
        [url]: !isCurrentlyDone,
      }));

      // 2. API Call
      await api.post("/toggel-Status", {
        problemUrl: url,
      });
    } catch (error) {
      console.error("Toggle failed", error);
      // Revert if API fails
      setCompletedProblems((prev) => ({
        ...prev,
        [url]: !prev[url],
      }));
    }
  };

  // Calculate Progress Stats
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
      <div className="p-10 text-center text-[#8b949e]">
        Sheet not found or failed to load.
      </div>
    );
  }

  const progressPercentage = calculateProgress();
  const solvedCount = sheet.problems
    ? sheet.problems.filter((p) => completedProblems[p.link || p.url]).length
    : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* 1. Navigation & Header */}
      <div className="mb-8">
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
          className="inline-flex items-center text-sm text-[#8b949e] hover:text-blue-400 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {sheet.title || sheet.name}
            </h1>
            <p className="text-[#8b949e] max-w-2xl">
              {sheet.description ||
                "Master these problems to ace your interviews."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress Card */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#8b949e]">
                  Progress
                </span>
                <span className="text-xl font-bold text-white">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-[#30363d] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-[#8b949e] text-right">
                {solvedCount} / {sheet.problems?.length || 0} Solved
              </div>
            </div>

            {/* NEW: Add Problem Button (Only for Personal Sheets) */}
            {isPersonalSheet && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 h-full px-4 py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Add Problem</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Problems Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden min-h-[300px] flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#30363d] bg-[#21262d]/50 text-sm font-medium text-[#8b949e]">
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-7">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-[#30363d] flex-grow">
          {sheet.problems &&
            sheet.problems.map((problem, index) => {
              // FIX: Handle both 'url' and 'link' keys just in case
              const targetLink = problem.link || problem.url;
              const isDone = !!completedProblems[targetLink];

              // Difficulty Colors
              const diffColor =
                problem.difficulty === "Easy"
                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                  : problem.difficulty === "Medium"
                  ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                  : "text-red-400 bg-red-400/10 border-red-400/20";

              return (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#21262d]/30 transition-colors ${
                    isDone ? "opacity-75" : ""
                  }`}
                >
                  {/* Checkbox Column */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => handleToggle(targetLink)}
                      className="text-[#8b949e] hover:text-green-500 transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          fillOpacity={0.2}
                        />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Title Column */}
                  <div className="col-span-7">
                    <a
                      href={targetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-medium hover:text-blue-400 transition-colors ${
                        isDone
                          ? "text-[#8b949e] line-through decoration-[#8b949e]/50"
                          : "text-[#c9d1d9]"
                      }`}
                    >
                      {problem.title}
                    </a>
                  </div>

                  {/* Difficulty Column */}
                  <div className="col-span-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border ${diffColor}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Action Column */}
                  <div className="col-span-2 text-right">
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
            <div className="flex flex-col items-center justify-center py-20 text-center h-full">
              <div className="bg-[#21262d] p-4 rounded-full mb-4">
                <Database className="w-8 h-8 text-[#8b949e]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                This sheet is empty
              </h3>
              <p className="text-[#8b949e] mb-6 max-w-sm">
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

      {/* 3. The Modal */}
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
