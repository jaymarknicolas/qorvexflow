/**
 * Theme Configurations
 * Each theme defines colors, gradients, and visual styles
 */

export interface ThemeConfig {
  id: "neon" | "lofi" | "ghibli" | "coffeeshop" | "timebased" | "weather";
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      from: string;
      via: string;
      to: string;
    };
    card: {
      from: string;
      to: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    glow: string[];
  };
  effects: {
    glassmorphism: boolean;
    particles: boolean;
    animations: "fast" | "normal" | "slow";
  };
}

export const THEMES: Record<string, ThemeConfig> = {
  neon: {
    id: "neon",
    name: "Neon Cyber",
    description: "Vibrant cyberpunk aesthetic with electric colors",
    colors: {
      primary: "#06b6d4", // cyan-500
      secondary: "#3b82f6", // blue-500
      accent: "#a855f7", // purple-500
      background: {
        from: "#0f172a", // slate-950
        via: "#1e293b", // slate-900
        to: "#0f172a", // slate-950
      },
      card: {
        from: "rgba(30, 41, 59, 0.4)", // slate-800/40
        to: "rgba(15, 23, 42, 0.4)", // slate-900/40
      },
      text: {
        primary: "#ffffff",
        secondary: "rgba(255, 255, 255, 0.8)",
        muted: "rgba(255, 255, 255, 0.6)",
      },
      border: "rgba(255, 255, 255, 0.1)",
      glow: ["#06b6d4", "#a855f7", "#f97316"], // cyan, purple, orange
    },
    effects: {
      glassmorphism: true,
      particles: true,
      animations: "fast",
    },
  },

  lofi: {
    id: "lofi",
    name: "Lo-Fi Night",
    description: "Calm, muted colors inspired by lo-fi study aesthetics",
    colors: {
      primary: "#8b5cf6", // violet-500
      secondary: "#ec4899", // pink-500
      accent: "#f472b6", // pink-400
      background: {
        from: "#1e1b4b", // indigo-950
        via: "#312e81", // indigo-900
        to: "#1e1b4b", // indigo-950
      },
      card: {
        from: "rgba(67, 56, 202, 0.3)", // indigo-700/30
        to: "rgba(49, 46, 129, 0.3)", // indigo-900/30
      },
      text: {
        primary: "#fdf4ff", // fuchsia-50
        secondary: "rgba(253, 244, 255, 0.8)",
        muted: "rgba(253, 244, 255, 0.6)",
      },
      border: "rgba(253, 244, 255, 0.15)",
      glow: ["#8b5cf6", "#ec4899", "#f59e0b"], // violet, pink, amber
    },
    effects: {
      glassmorphism: true,
      particles: false,
      animations: "slow",
    },
  },

  ghibli: {
    id: "ghibli",
    name: "Studio Ghibli",
    description: "Warm, nostalgic palette inspired by Studio Ghibli films",
    colors: {
      primary: "#10b981", // emerald-500
      secondary: "#f59e0b", // amber-500
      accent: "#ef4444", // red-500
      background: {
        from: "#1c4532", // emerald-950
        via: "#14532d", // green-950
        to: "#1c4532", // emerald-950
      },
      card: {
        from: "rgba(34, 197, 94, 0.2)", // green-600/20
        to: "rgba(20, 83, 45, 0.3)", // green-950/30
      },
      text: {
        primary: "#fef3c7", // amber-50
        secondary: "rgba(254, 243, 199, 0.9)",
        muted: "rgba(254, 243, 199, 0.7)",
      },
      border: "rgba(254, 243, 199, 0.2)",
      glow: ["#10b981", "#f59e0b", "#fb923c"], // emerald, amber, orange
    },
    effects: {
      glassmorphism: false,
      particles: true,
      animations: "normal",
    },
  },

  coffeeshop: {
    id: "coffeeshop",
    name: "Coffee Shop",
    description: "Warm, cozy vibes inspired by coffee shop ambiance",
    colors: {
      primary: "#d97706", // amber-600
      secondary: "#92400e", // amber-800
      accent: "#fbbf24", // amber-400
      background: {
        from: "#292524", // stone-800
        via: "#44403c", // stone-700
        to: "#292524", // stone-800
      },
      card: {
        from: "rgba(68, 64, 60, 0.4)", // stone-700/40
        to: "rgba(41, 37, 36, 0.4)", // stone-800/40
      },
      text: {
        primary: "#fef3c7", // amber-100
        secondary: "rgba(254, 243, 199, 0.9)",
        muted: "rgba(254, 243, 199, 0.6)",
      },
      border: "rgba(217, 119, 6, 0.2)",
      glow: ["#d97706", "#92400e", "#fbbf24"], // amber tones
    },
    effects: {
      glassmorphism: true,
      particles: false,
      animations: "slow",
    },
  },

  timebased: {
    id: "timebased",
    name: "Time-Based",
    description: "Dynamic theme that shifts colors based on time of day",
    colors: {
      primary: "#7dd3fc",
      secondary: "#fb923c",
      accent: "#c084fc",
      background: {
        from: "#0f172a",
        via: "#1e1b4b",
        to: "#0f172a",
      },
      card: {
        from: "rgba(30, 27, 75, 0.4)",
        to: "rgba(15, 23, 42, 0.4)",
      },
      text: {
        primary: "#f0f9ff",
        secondary: "rgba(240, 249, 255, 0.8)",
        muted: "rgba(186, 230, 253, 0.6)",
      },
      border: "rgba(125, 211, 252, 0.2)",
      glow: ["#3b82f6", "#8b5cf6", "#6366f1"],
    },
    effects: {
      glassmorphism: true,
      particles: false,
      animations: "normal",
    },
  },

  weather: {
    id: "weather",
    name: "Weather",
    description: "Dynamic theme that reacts to real weather conditions",
    colors: {
      primary: "#94a3b8",
      secondary: "#a8a29e",
      accent: "#7dd3fc",
      background: {
        from: "#1e293b",
        via: "#334155",
        to: "#1e293b",
      },
      card: {
        from: "rgba(51, 65, 85, 0.4)",
        to: "rgba(30, 41, 59, 0.4)",
      },
      text: {
        primary: "#f1f5f9",
        secondary: "rgba(241, 245, 249, 0.8)",
        muted: "rgba(203, 213, 225, 0.6)",
      },
      border: "rgba(148, 163, 184, 0.2)",
      glow: ["#64748b", "#94a3b8", "#cbd5e1"],
    },
    effects: {
      glassmorphism: true,
      particles: true,
      animations: "normal",
    },
  },
};

/**
 * Get theme configuration by ID
 */
export function getTheme(themeId: string): ThemeConfig {
  return THEMES[themeId] || THEMES.neon;
}

/**
 * Generate CSS variables for a theme
 */
export function generateThemeCSS(theme: ThemeConfig): string {
  return `
    :root[data-theme="${theme.id}"] {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};

      --bg-from: ${theme.colors.background.from};
      --bg-via: ${theme.colors.background.via};
      --bg-to: ${theme.colors.background.to};

      --card-from: ${theme.colors.card.from};
      --card-to: ${theme.colors.card.to};

      --text-primary: ${theme.colors.text.primary};
      --text-secondary: ${theme.colors.text.secondary};
      --text-muted: ${theme.colors.text.muted};

      --border-color: ${theme.colors.border};

      --glow-1: ${theme.colors.glow[0]};
      --glow-2: ${theme.colors.glow[1]};
      --glow-3: ${theme.colors.glow[2]};
    }
  `;
}
