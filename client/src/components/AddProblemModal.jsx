import React, { useState } from "react";
import { X, Loader2, Plus, Code2, List, Link as LinkIcon } from "lucide-react";
import api from "../context/axios";

const AddProblemModal = ({ isOpen, onClose, sheetId, onProblemAdded }) => {
  const [activeTab, setActiveTab] = useState("single"); // 'single' | 'bulk'
  const [loading, setLoading] = useState(false);

  // Single State
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    difficulty: "Easy",
    platform: "LeetCode",
  });

  // Bulk State
  const [bulkText, setBulkText] = useState("");

  if (!isOpen) return null;

  // --- Helper: Parse Bulk Text ---
  const parseBulkInput = (text) => {
    // Split by new lines or commas
    const lines = text
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l);

    return lines.map((link) => {
      // Auto-generate title from URL slug (Simple logic)
      let title = "Unknown Problem";
      let platform = "Other";

      try {
        const urlObj = new URL(link);
        if (urlObj.hostname.includes("leetcode")) {
          platform = "LeetCode";
          // extract 'two-sum' from /problems/two-sum/
          const parts = urlObj.pathname.split("/").filter((p) => p);
          const slugIndex = parts.indexOf("problems");
          if (slugIndex !== -1 && parts[slugIndex + 1]) {
            // Convert "two-sum-ii" -> "Two Sum Ii"
            title = parts[slugIndex + 1]
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
        } else if (urlObj.hostname.includes("geeksforgeeks")) {
          platform = "GeeksForGeeks";
          // Simple logic for GFG
          title = "GFG Problem";
        }
      } catch (e) {
        // invalid url, keep defaults
      }

      return {
        title,
        link,
        difficulty: "Medium", // Default for bulk
        platform,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === "single") {
        // --- SINGLE ADD ---
        const payload = {
          sheetId,
          problem: formData,
        };
        await api.post("/sheet/add-problem", payload);
      } else {
        // --- BULK ADD ---
        const problems = parseBulkInput(bulkText);
        if (problems.length === 0) return;

        await api.post("/sheet/add-bulk", {
          sheetId,
          problems,
        });
      }

      if (onProblemAdded) onProblemAdded();

      // Cleanup
      setFormData({
        title: "",
        link: "",
        difficulty: "Easy",
        platform: "LeetCode",
      });
      setBulkText("");
      onClose();
    } catch (error) {
      console.error("Failed to add", error);
      alert("Error adding problems. Please check the links.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors placeholder-[#8b949e]";
  const tabClass = (isActive) =>
    `flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
      isActive
        ? "border-green-500 text-white"
        : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-green-500" />
            Add Problems
          </h2>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b border-[#30363d]">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={tabClass(activeTab === "single")}
          >
            Single Add
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={tabClass(activeTab === "bulk")}
          >
            Bulk Import
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {activeTab === "single" ? (
            /* --- SINGLE FORM --- */
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#c9d1d9]">
                  Title
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
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#c9d1d9]">
                  Link
                </label>
                <input
                  name="link"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://..."
                  className={inputClass}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#c9d1d9]">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#c9d1d9]">
                    Platform
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option>LeetCode</option>
                    <option>GeeksForGeeks</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            /* --- BULK FORM --- */
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm text-blue-200">
                <List className="w-5 h-5 mt-0.5 shrink-0" />
                <p>
                  Paste LeetCode URLs separated by commas or new lines. We will
                  auto-detect the titles.
                </p>
              </div>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`https://leetcode.com/problems/two-sum\nhttps://leetcode.com/problems/3sum`}
                rows={6}
                className={`${inputClass} font-mono text-xs`}
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#c9d1d9] hover:bg-[#30363d] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (activeTab === "bulk" && !bulkText)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#238636] border border-[#238636]/50 rounded-md hover:bg-[#2ea043] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {activeTab === "single" ? "Add Problem" : "Import All"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProblemModal;
