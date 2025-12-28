import React, { useEffect, useState } from "react";
import {
  Plus,
  Library as LibraryIcon,
  Loader2,
  FolderOpen,
} from "lucide-react";
import api from "../context/axios";

// Components
import SheetCard from "../components/SheetCard"; // Reuse your existing card
import CreateSheetModal from "../components/CreateSheetModal";

const MyLibrary = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Personal Sheets
  const fetchPersonalSheets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/get-personal-sheet");

      setSheets(response.data.data || []);
    } catch (error) {
      console.error("Failed to load personal sheets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalSheets();
  }, []);

  // Callback when a new sheet is created
  const handleSheetCreated = () => {
    fetchPersonalSheets(); // Refresh the list
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <LibraryIcon className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-white">My Library</h1>
          </div>
          <p className="text-[#8b949e]">
            Manage your personal collections and custom problem sets.
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Sheet
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : sheets.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 bg-[#161b22] border border-[#30363d] border-dashed rounded-xl text-center">
          <div className="p-4 bg-[#21262d] rounded-full mb-4">
            <FolderOpen className="w-8 h-8 text-[#8b949e]" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">
            No personal sheets yet
          </h3>
          <p className="text-[#8b949e] mb-6 max-w-sm">
            Create your first custom sheet to organize problems your way.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-purple-400 hover:text-purple-300 font-medium text-sm hover:underline"
          >
            Create one now &rarr;
          </button>
        </div>
      ) : (
        // List Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sheets.map((sheet) => (
            <SheetCard key={sheet._id} sheet={sheet} />
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateSheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSheetCreated={handleSheetCreated}
      />
    </div>
  );
};

export default MyLibrary;
