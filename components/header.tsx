"use client";

import { User2, Palette } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function Header() {
  const navItems: NavItem[] = [
    { label: "Dashboard" },
    { label: "Tasks" },
    { label: "Focus" },
    { label: "Music" },
  ];

  const [activeNav, setActiveNav] = useState<string>("Dashboard");
  return (
    <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-20 bg-slate-950/50">
      <div className="max-w-11/12 mx-auto px-6 lg:px-8 py-4">
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

          <div className="flex gap-8">
            {/* Theme */}
            <Select>
              <SelectTrigger className="w-[180px] flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                <Palette className="w-4 h-4 text-cyan-400" />
                <SelectValue
                  placeholder="Theme"
                  className="text-sm font-medium text-white"
                />
              </SelectTrigger>
              <SelectContent position="item-aligned" align="end">
                <SelectItem value="neon">Neon</SelectItem>
                <SelectItem value="lofi">Lo-Fi Night</SelectItem>
                <SelectItem value="ghibli">Ghibli</SelectItem>
              </SelectContent>
            </Select>

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
