import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Loader2,
  Plus,
  Code2,
  List,
  FileJson,
  CheckCircle2,
} from "lucide-react";
import api from "../context/axios";
import toast from "react-hot-toast";

const AddProblemModal = ({ isOpen, onClose, sheetId, onProblemAdded }) => {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const [activeTab, setActiveTab] = useState("single");
  const [loading, setLoading] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    difficulty: "Medium",
    platform: "LeetCode",
  });

  // Hook 2: useEffect
  useEffect(() => {
    if (isOpen) {
      setBulkText("");
      setFormData({
        title: "",
        url: "",
        difficulty: "Medium",
        platform: "LeetCode",
      });
    }
  }, [isOpen]);

  // Helper function (not a hook, but needed for useMemo)
  const parseBulkInput = (text) => {
    if (!text) return [];
    const rawurls = text
      .split(/[\n,\s]+/)
      .filter((l) => l.trim().startsWith("http"));
    const uniqueurls = [...new Set(rawurls)];

    return uniqueurls.map((url) => {
      let title = "Unknown Problem";
      let platform = "Other";
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        if (urlObj.hostname.includes("leetcode")) {
          platform = "LeetCode";
          const match = path.match(/\/problems\/([^/]+)/);
          if (match && match[1]) {
            title = match[1]
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
          }
        } else if (urlObj.hostname.includes("geeksforgeeks")) {
          platform = "GeeksForGeeks";
          const match = path.match(/\/problems\/([^/]+)/);
          if (match && match[1]) {
            title = match[1]
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
          } else {
            title = "GFG Problem";
          }
        }
      } catch (e) {
        console.warn("Invalid URL", url);
      }
      return { title, url: url, difficulty: "Medium" };
    });
  };

  // Hook 3: useMemo (MUST BE BEFORE RETURN)
  const detectedProblems = useMemo(() => parseBulkInput(bulkText), [bulkText]);

  // 2. NOW WE CAN CONDITIONALLY RETURN
  if (!isOpen) return null;

  // ... handler logic ...
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sheetId) return toast.error("Sheet ID missing.");
    setLoading(true);

    try {
      if (activeTab === "single") {
        await api.post("/add-problem", { sheetId, problems: formData });
        toast.success("Problem added!");
      } else {
        if (detectedProblems.length === 0) return;
        await api.post("/add-bulk", { sheetId, problems: detectedProblems });
        toast.success(`Imported ${detectedProblems.length} problems!`);
      }

      if (onProblemAdded) onProblemAdded();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add problems");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-white focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] focus:outline-none placeholder-[#484f58]";
  const tabClass = (isActive) =>
    `flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
      isActive
        ? "border-[#f78166] text-white"
        : "border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* ... The rest of your JSX remains exactly the same ... */}
      <div className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#161b22]">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <div className="p-1.5 bg-[#238636]/10 rounded-md text-[#238636]">
              <Code2 className="w-5 h-5" />
            </div>
            Add Problems
          </h2>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-white p-1 hover:bg-[#30363d] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-0 border-b border-[#30363d] bg-[#0d1117]">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={tabClass(activeTab === "single")}
          >
            Single Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={tabClass(activeTab === "bulk")}
          >
            Bulk Import
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form
            id="add-problem-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {activeTab === "single" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    Problem Title
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Two Sum"
                    className={inputClass}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    Problem url
                  </label>
                  <input
                    name="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://leetcode.com/problems/..."
                    className={inputClass}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="Easy" className="bg-[#0d1117]">
                        Easy
                      </option>
                      <option value="Medium" className="bg-[#0d1117]">
                        Medium
                      </option>
                      <option value="Hard" className="bg-[#0d1117]">
                        Hard
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                      Platform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) =>
                        setFormData({ ...formData, platform: e.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="LeetCode" className="bg-[#0d1117]">
                        LeetCode
                      </option>
                      <option value="GeeksForGeeks" className="bg-[#0d1117]">
                        GeeksForGeeks
                      </option>
                      <option value="CodeStudio" className="bg-[#0d1117]">
                        CodeStudio
                      </option>
                      <option value="Other" className="bg-[#0d1117]">
                        Other
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm text-blue-200/90">
                  <List className="w-5 h-5 mt-0.5 shrink-0 text-blue-400" />
                  <p className="text-xs leading-relaxed">
                    Paste raw URLs (LeetCode, GFG). We will automatically
                    extract titles.
                  </p>
                </div>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="https://leetcode.com/problems/two-sum"
                  rows={6}
                  className={`${inputClass} font-mono text-xs leading-relaxed`}
                />

                {detectedProblems.length > 0 && (
                  <div className="border border-[#30363d] rounded-md bg-[#0d1117] overflow-hidden">
                    <div className="bg-[#21262d] px-3 py-2 border-b border-[#30363d] flex justify-between items-center">
                      <span className="text-xs font-medium text-[#c9d1d9] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />{" "}
                        Detected Problems
                      </span>
                      <span className="bg-[#30363d] text-white text-[10px] px-2 py-0.5 rounded-full">
                        {detectedProblems.length}
                      </span>
                    </div>
                    <div className="max-h-32 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {detectedProblems.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs p-1.5 hover:bg-[#161b22] rounded group"
                        >
                          <span className="text-white truncate max-w-[70%]">
                            {p.title}
                          </span>
                          <span className="text-[#8b949e] text-[10px]">
                            {p.platform}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#30363d] bg-[#161b22] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#c9d1d9] hover:text-white hover:bg-[#30363d] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-problem-form"
            disabled={
              loading || (activeTab === "bulk" && detectedProblems.length === 0)
            }
            className="px-4 py-2 text-sm font-medium text-white bg-[#238636] border border-[#238636]/50 rounded-md hover:bg-[#2ea043] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : activeTab === "bulk" ? (
              <FileJson className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {activeTab === "single"
              ? "Add Problem"
              : `Import ${detectedProblems.length || ""} Problems`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProblemModal;
