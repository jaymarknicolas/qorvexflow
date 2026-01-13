"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp, Info } from "lucide-react";

interface FocusDay {
  day: string;
  hours: number;
}

export default function FocusStats() {
  // Note: This is sample data. In production, this would come from actual tracking
  const data: FocusDay[] = [
    { day: "Mon", hours: 4.2 },
    { day: "Tue", hours: 5.1 },
    { day: "Wed", hours: 3.8 },
    { day: "Thu", hours: 6.2 },
    { day: "Fri", hours: 7.1 },
    { day: "Sat", hours: 5.5 },
    { day: "Sun", hours: 4.5 },
  ];

  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const dailyAverage = totalHours / data.length;
  const maxDay = data.reduce((max, d) => (d.hours > max.hours ? d : max), data[0]);

  return (
    <div className="relative group h-full">
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

      <div className="relative bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Focus Stats</h2>
            <p className="text-sm text-white/60 mt-1">
              Hours focused this week
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <button
              className="p-1 hover:bg-white/10 rounded transition-colors group/info"
              aria-label="Sample data"
            >
              <Info className="w-4 h-4 text-white/40 group-hover/info:text-white/60" />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-40 -mx-2 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="day"
                stroke="rgba(255,255,255,0.4)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(34, 211, 238)" />
                  <stop offset="100%" stopColor="rgb(168, 85, 247)" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-auto pt-6 border-t border-white/10">
          <div>
            <div className="text-2xl font-bold text-white">
              {totalHours.toFixed(1)}h
            </div>
            <div className="text-xs text-white/60 mt-1">This week</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {dailyAverage.toFixed(1)}h
            </div>
            <div className="text-xs text-white/60 mt-1">Daily avg</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {maxDay.hours.toFixed(1)}h
            </div>
            <div className="text-xs text-white/60 mt-1">Best day</div>
          </div>
        </div>
      </div>
    </div>
  );
}
