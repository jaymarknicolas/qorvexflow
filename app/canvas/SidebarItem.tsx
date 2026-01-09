"use client";

import React from "react";

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isMinimized?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ icon, label, isMinimized = false, onClick, isActive = false }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-transparent border-none rounded-lg cursor-pointer flex items-center gap-3 text-[#1a1a1a] text-sm font-medium transition-colors duration-200 text-left ${
        isActive ? "bg-black/10" : "hover:bg-black/5"
      } ${isMinimized ? "p-3 justify-center" : "px-4 py-3 justify-start"}`}
      title={isMinimized ? label : undefined}
    >
      <span className="text-gray-600 flex items-center">{icon}</span>
      {!isMinimized && <span>{label}</span>}
    </button>
  );
};

export default SidebarItem;
