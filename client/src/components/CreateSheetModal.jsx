import React, { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import api from "../context/axios";

const CreateSheetModal = ({ isOpen, onClose, onSheetCreated }) => {
  // 1. Changed 'name' to 'title' to match backend
  const [formData, setFormData] = useState({
    title: "",
    description: "", // Backend controller ignores this currently (see note below)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      setError("");

      // 2. Construct the Payload exactly as the Controller expects
      const payload = {
        title: formData.title,
        problems: [],
        description: formData.description,
      };

      const response = await api.post("/create-new-sheet", payload);

      if (onSheetCreated) {
        onSheetCreated(response.data.data);
      }

      setFormData({ title: "", description: "" });
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to create sheet.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Create New List
          </h2>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/10 border border-red-900/20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#c9d1d9]">
              Sheet Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. My weak topics"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#c9d1d9]">
              Description{" "}
              <span className="text-xs text-[#8b949e]">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#238636] border border-[#238636]/50 rounded-md hover:bg-[#2ea043] flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Sheet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSheetModal;
