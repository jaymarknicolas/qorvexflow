"use client";

import { LayoutDashboard, CheckSquare, Zap, Music, User2 } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-20 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              QORVEX
            </span>
          </div>

          <div className="flex gap-8">
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">
                  Dashboard
                </span>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <CheckSquare className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium text-white/60">Tasks</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <Zap className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium text-white/60">Focus</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <Music className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium text-white/60">Music</span>
              </button>
            </nav>

            {/* User Profile */}
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform">
              <User2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
