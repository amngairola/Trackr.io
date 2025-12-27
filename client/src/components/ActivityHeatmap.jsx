import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

const ActivityHeatmap = ({ values }) => {
  // Use today as end date
  const today = new Date();

  // Calculate start date (1 year ago)
  const shiftDate = (date, numDays) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  };
  const startDate = shiftDate(today, -365);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Activity</h3>

      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={values || []}
        classForValue={(value) => {
          if (!value) {
            return "color-empty";
          }
          return `color-github-${Math.min(value.count, 4)}`;
        }}
        tooltipDataAttrs={(value) => {
          return {
            "data-tip": `${value.date} has count: ${value.count}`,
          };
        }}
        showWeekdayLabels={true}
      />

      <style>{`
        .react-calendar-heatmap text { fill: #8b949e; font-size: 10px; }
        .react-calendar-heatmap .color-empty { fill: #161b22; outline: 1px solid #30363d; }
        .react-calendar-heatmap .color-github-1 { fill: #0e4429; }
        .react-calendar-heatmap .color-github-2 { fill: #006d32; }
        .react-calendar-heatmap .color-github-3 { fill: #26a641; }
        .react-calendar-heatmap .color-github-4 { fill: #39d353; }
      `}</style>
    </div>
  );
};
export default ActivityHeatmap;
