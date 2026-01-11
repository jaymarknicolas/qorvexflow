"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface FocusDay {
  day: string;
  hours: number;
}

export default function FocusStats() {
  const data: FocusDay[] = [
    { day: "Mon", hours: 4.2 },
    { day: "Tue", hours: 5.1 },
    { day: "Wed", hours: 3.8 },
    { day: "Thu", hours: 6.2 },
    { day: "Fri", hours: 7.1 },
    { day: "Sat", hours: 5.5 },
    { day: "Sun", hours: 12.5 },
  ];

  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const dailyAverage = totalHours / data.length;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

      <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Focus Stats</h2>
            <p className="text-sm text-white/60 mt-1">
              Hours focused this week
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>

        {/* Chart */}
        <div className="h-40 -mx-2">
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
              <Line
                type="monotone"
                dataKey="hours"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
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
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
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
            <div className="text-xs text-white/60 mt-1">Daily average</div>
          </div>
        </div>
      </div>
    </div>
  );
}
