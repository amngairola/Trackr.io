import React, { useEffect, useState } from "react";
import { Loader2, Compass } from "lucide-react";
import api from "../context/axios";

// Import the card we just created
import SheetCard from "../components/SheetCard";

const Explore = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicSheets = async () => {
      try {
        setLoading(true);
        // Calling the requested route
        const response = await api.get("/get-public-sheet");

        // Assuming your API structure returns data inside a 'data' key.
        // Adjust if your API returns the array directly.
        // e.g., response.data.sheets or just response.data
        const sheetData = response.data.data || [];
        setSheets(sheetData);
      } catch (err) {
        console.error("Failed to fetch sheets:", err);
        setError("Failed to load system sheets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicSheets();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-[#8b949e] animate-pulse">Curating sheets...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center p-8 bg-[#161b22] border border-red-900/50 rounded-xl">
          <p className="text-red-400 mb-2">Error loading data</p>
          <p className="text-[#8b949e]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    // Main container with padding and animation
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Compass className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Explore System Sheets
          </h1>
        </div>
        <p className="text-lg text-[#8b949e] max-w-2xl">
          Curated problem lists by top companies and community leaders. Start a
          path and track your progress.
        </p>
      </div>

      {/* 2. Empty State Check */}
      {!loading && sheets.length === 0 && (
        <div className="text-center py-20 bg-[#161b22] border border-[#30363d] rounded-xl">
          <p className="text-xl text-white mb-2">No sheets found</p>
          <p className="text-[#8b949e]">Check back later for new content.</p>
        </div>
      )}

      {/* 3. Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sheets.map((sheet) => (
          <SheetCard key={sheet._id} sheet={sheet} />
        ))}
      </div>
    </div>
  );
};

export default Explore;

/*
Explore Page (/explore)
Backend Data: /get-public-sheet

Layout: A clean Grid of Cards.

Design:

Header: "Explore System Sheets" (Title).

Grid: A 3x3 grid of SheetCard components.

Card Look: Since these are "System" sheets (like Blind 75), give them a special gold border or badge to show they are "Official".
*/
