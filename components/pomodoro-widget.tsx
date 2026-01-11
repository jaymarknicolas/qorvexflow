"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";

interface PomodoroWidgetProps {
  onSessionComplete?: () => void;
}

export default function PomodoroWidget({
  onSessionComplete,
}: PomodoroWidgetProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setSessions(sessions + 1);
            onSessionComplete?.();
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessions, onSessionComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const progress = (1 - timeLeft / (25 * 60)) * 100;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>

      <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-xl font-bold text-white">Pomodoro</h2>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Timer Circle */}
        <div className="flex items-center justify-center mb-8 relative h-48">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgb(30, 41, 59)"
              strokeWidth="8"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="8"
              strokeDasharray={`${(progress / 100) * 440} 440`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(34, 211, 238)" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute text-center">
            <div className="text-5xl font-bold text-white font-mono">
              {displayTime}
            </div>
            <div className="text-sm text-white/60 mt-2">
              {sessions} sessions
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-all duration-300 flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Break
          </button>

          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-all duration-300">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
