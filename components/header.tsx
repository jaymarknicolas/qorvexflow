"use client";

import { User2, Layout, Check, Grid3x3, Grid2x2, Maximize, Columns, Rows } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useTheme } from "@/lib/contexts/theme-context";
import { useLayout } from "@/lib/contexts/layout-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
}

interface HeaderProps {
  onLayoutClick?: () => void;
}

export default function Header({ onLayoutClick }: HeaderProps = {}) {
  const navItems: NavItem[] = [
    { label: "Dashboard" },
    { label: "Tasks" },
    { label: "Focus" },
    { label: "Music" },
  ];

  const [activeNav, setActiveNav] = useState<string>("Dashboard");
  const { theme, setTheme } = useTheme();
  const { layout, setLayout } = useLayout();

  return (
    <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-20 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                QORVEX
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center bg-white/10 rounded-full p-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-full   transition-colors",
                    item.label === activeNav &&
                      "bg-gradient-to-r from-cyan-400 to-blue-500"
                  )}
                  onClick={() => setActiveNav(item.label)}
                >
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex gap-3">
            {/* Layout Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                  <Layout className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium">
                    {layout === "default" && "Default"}
                    {layout === "grid-3x3" && "Grid 3×3"}
                    {layout === "grid-2x3" && "Grid 2×3"}
                    {layout === "single-focus" && "Single Focus"}
                    {layout === "dual-column" && "Dual Column"}
                    {layout === "triple-row" && "Triple Row"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Select Layout</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLayout("default")} className="cursor-pointer">
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Grid2x2 className="w-4 h-4" />
                      <span>Default (2+3)</span>
                    </span>
                    {layout === "default" && <Check className="w-4 h-4 text-cyan-400" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("grid-3x3")} className="cursor-pointer">
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4" />
                      <span>Grid 3×3</span>
                    </span>
                    {layout === "grid-3x3" && <Check className="w-4 h-4 text-cyan-400" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("grid-2x3")} className="cursor-pointer">
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Grid2x2 className="w-4 h-4" />
                      <span>Grid 2×3</span>
                    </span>
                    {layout === "grid-2x3" && <Check className="w-4 h-4 text-cyan-400" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("single-focus")} className="cursor-pointer">
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Maximize className="w-4 h-4" />
                      <span>Single Focus</span>
                    </span>
                    {layout === "single-focus" && <Check className="w-4 h-4 text-cyan-400" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("dual-column")} className="cursor-pointer">
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Columns className="w-4 h-4" />
                      <span>Dual Column</span>
                    </span>
                    {layout === "dual-column" && <Check className="w-4 h-4 text-cyan-400" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("triple-row")} className="cursor-pointer">
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Rows className="w-4 h-4" />
                      <span>Triple Row</span>
                    </span>
                    {layout === "triple-row" && <Check className="w-4 h-4 text-cyan-400" />}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                  <span className="text-sm font-medium">
                    {theme === "neon" && "🌆 Neon Cyber"}
                    {theme === "lofi" && "🎵 Lo-Fi Night"}
                    {theme === "ghibli" && "🌿 Studio Ghibli"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme("neon")}
                  className="cursor-pointer"
                >
                  <span className="flex items-center justify-between w-full">
                    <span>🌆 Neon Cyber</span>
                    {theme === "neon" && (
                      <Check className="w-4 h-4 text-cyan-400" />
                    )}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("lofi")}
                  className="cursor-pointer"
                >
                  <span className="flex items-center justify-between w-full">
                    <span>🎵 Lo-Fi Night</span>
                    {theme === "lofi" && (
                      <Check className="w-4 h-4 text-cyan-400" />
                    )}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("ghibli")}
                  className="cursor-pointer"
                >
                  <span className="flex items-center justify-between w-full">
                    <span>🌿 Studio Ghibli</span>
                    {theme === "ghibli" && (
                      <Check className="w-4 h-4 text-cyan-400" />
                    )}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-10 h-10 border-none rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <User2 className="w-5 h-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Billing
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Settings
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Keyboard shortcuts
                    <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      Invite users
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Email</DropdownMenuItem>
                        <DropdownMenuItem>Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>More...</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    New Team
                    <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>GitHub</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuItem disabled>API</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
