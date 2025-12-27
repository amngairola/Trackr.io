import React, { useEffect, useState } from "react";
import api from "../context/axios.js";
import { CheckCircle2, Flame, Loader2 } from "lucide-react"; // Removed Trophy
import { useAuth } from "../context/AuthContext";

import StatsCard from "./../components/StatsCard";
import ActivityHeatmap from "./../components/ActivityHeatmap";
import DailyChallengeCard from "./../components/DailyChallengeCard";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState([]);

  // New state for Heatmap
  const [heatmapValues, setHeatmapValues] = useState([]);

  const [stats, setStats] = useState({
    solved: 0,
    streak: 0,
    easy: 0, // Backend doesn't send this yet
    medium: 0, // Backend doesn't send this yet
    hard: 0, // Backend doesn't send this yet
  });

  // Helper: Calculate Streak from Heatmap Data
  const calculateStreak = (data) => {
    if (!data || data.length === 0) return 0;

    // Sort dates descending
    const sortedDates = data
      .map((item) => new Date(item.date))
      .sort((a, b) => b - a);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if latest activity is today or yesterday
    const lastActive = sortedDates[0];
    lastActive.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If last activity was more than 1 day ago (meaning not today or yesterday), streak is broken
    if (diffDays > 1) return 0;

    // Count consecutive days
    streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = sortedDates[i];
      const next = sortedDates[i + 1];

      const oneDay = 1000 * 60 * 60 * 24;
      const diff = (current - next) / oneDay;

      if (diff === 1) {
        streak++;
      } else if (diff > 1) {
        break;
      }
    }
    return streak;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Daily Challenge
        const challengeRes = await api.get("/daily-challenge");
        if (
          challengeRes.data.data &&
          challengeRes.data.data.problems &&
          challengeRes.data.data.problems.length > 0
        ) {
          setDailyChallenge(challengeRes.data.data.problems);
        } else {
          setDailyChallenge({
            title: "No Problems Yet",
            difficulty: "System",
            link: "#",
          });
        }

        // 2. Fetch User Progress (Updated with your Controller logic)
        const progressRes = await api.get(`/my-progress/${user._id}`);
        const { totalSolved, heatmapData } = progressRes.data.data;

        // Calculate Streak
        const currentStreak = calculateStreak(heatmapData);

        setStats({
          solved: totalSolved || 0,
          streak: currentStreak,
          easy: 0, // ⚠️ Your controller doesn't return this yet
          medium: 0, // ⚠️ Your controller doesn't return this yet
          hard: 0, // ⚠️ Your controller doesn't return this yet
        });

        // Pass data to heatmap
        setHeatmapValues(heatmapData || []);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#238636]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. TOP ROW: STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Problems Solved"
          value={stats.solved}
          icon={CheckCircle2}
          color="bg-blue-500 text-blue-500"
        />
        <StatsCard
          title="Current Streak"
          value={`${stats.streak} Days`}
          icon={Flame}
          color="bg-orange-500 text-orange-500"
        />
      </div>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* We pass the real values to the heatmap now */}
          <ActivityHeatmap values={heatmapValues} />

          {/* Difficulty Breakdown (Static 0 for now until backend update) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 opacity-50 pointer-events-none">
            <h3 className="text-lg font-semibold text-white mb-4">
              Difficulty Breakdown{" "}
              <span className="text-xs text-[#8b949e]">(Coming Soon)</span>
            </h3>
            {/* ... Kept existing chart code but it will show empty/0 ... */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#238636]">Easy</span>
                  <span className="text-[#8b949e]">0 solved</span>
                </div>
                <div className="w-full bg-[#30363d] rounded-full h-2">
                  <div
                    className="bg-[#238636] h-2 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <DailyChallengeCard challenges={dailyChallenge} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
