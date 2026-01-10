# 🧵 **STITCH.AI — FULL MASTER PROMPT FOR WIDGETFLOW**

## Project Name

**WidgetFlow**

## App Type

Web Application (Single Page App)

---

## 🧠 Product Vision

Design a **modular, AI-assisted productivity dashboard** that acts as a **personal productivity workspace**.
Users can **drag, drop, resize, and arrange widgets freely on a canvas**, while benefiting from **smart layout presets and AI-generated dashboards**.

The app should combine:

- **Visual freedom** (canvas-style layout)
- **Smart defaults** (presets & AI)
- **Full customization** (user always in control)

This should feel like:

- Notion Canvas
- FigJam / Miro
- macOS widgets
- Calm productivity tools

---

## 🎯 Core UX Principles

- Never start users with a blank screen
- Presets first, customization always available
- AI assists but never locks the user
- Clean, calm, productivity-focused
- Designed for daily, long-term use

---

## 🖼️ Overall Layout Structure

### Top Bar

- App name (WidgetFlow)
- Workspace selector (Work / Study / Personal)
- Dark mode toggle
- User profile menu

### Left Sidebar (or Modal)

- Widget picker
- Layout presets
- Dashboard presets
- Add widget button

### Main Canvas (Core Area)

- Freeform canvas with subtle dotted or grid background
- Widgets appear as floating cards
- Users can freely position widgets

### Right Panel (Contextual)

- Layout customization
- Widget settings
- AI suggestions

---

## 🧱 Canvas & Widget Behavior (IMPORTANT)

### Canvas

- Subtle dotted or grid background
- Large, scrollable workspace
- Supports free placement

### Widgets

Widgets are **independent cards** with:

- Rounded corners
- Soft shadows
- White or light surfaces
- Clear headers

Supported widget interactions:

- Drag to reposition
- Resize from edges and corners
- Snap subtly to grid
- No overlapping
- Lock / unlock position
- Minimize / expand
- Settings icon per widget

---

## 🧩 Core Widgets (Shown on Canvas)

- **Pomodoro Timer** (primary widget, often centered)
- **To-Do List**
- **Notes / Rich Text Editor**
- **Media / YouTube / Embed Widget**
- (Future) AI Assistant Widget

---

## ➕ Adding Widgets

Users can add widgets by:

- Dragging from a left sidebar
- Clicking “Add Widget” button
- Using a modal widget picker

Widget picker shows:

- Icon
- Name
- Short description

Widgets can be dragged directly from the picker onto the canvas.

---

## 🧱 Layout System (Presets + Customization)

### Supported Layout Types

#### 1. Grid Layout

- Structured, productivity-focused
- Snap-to-grid
- Fixed columns

#### 2. Masonry Layout

- Variable widget heights
- Auto-flow columns
- Content-heavy dashboards

#### 3. Focus Layout

- One primary widget enlarged
- Secondary widgets minimized or hidden
- Designed for deep work

#### 4. Freeform / Canvas Layout

- Absolute positioning
- Maximum freedom
- Power-user friendly

#### 5. AI-Optimized Layout

- Automatically generated based on user goals
- Can be regenerated or customized

Users can switch layouts **without losing widgets**.

---

## 🛠️ Layout Customization Panel

Controls include:

- Layout type selector
- Column count
- Grid spacing
- Snap strength
- Compact vs spacious mode
- Lock entire layout
- Lock individual widgets

Inspired by tools like Figma and Notion settings.

---

## 📦 Dashboard Preset System

### Preset Gallery

Preset examples:

- Student Planner
- Freelancer Workday
- ADHD Focus Dashboard
- Creative Studio
- Developer Mode

Each preset card shows:

- Layout preview
- Description
- Tags (Focus, Study, Creative)

Users can:

- Apply preset
- Customize after applying
- Save as personal preset

---

## 🤖 AI-Powered Features

### AI Onboarding Flow

On first use, ask:

- Primary goal (Work, Study, Creative, Personal)
- Daily focus hours
- Preferred structure (Minimal / Structured / Flexible)
- Focus challenges (Distractions, Procrastination, Overworking)

AI generates:

- Widget selection
- Widget placement
- Initial layout
- Starter content

User can accept or regenerate.

---

### AI Assistant Widget

Embedded in the dashboard.

Capabilities:

- Generate or improve layouts
- Break tasks into subtasks
- Suggest Pomodoro schedules
- Detect focus issues
- Provide daily productivity briefings

Example prompts:

- “What should I focus on today?”
- “Improve my dashboard layout”
- “Break this task into steps”

---

### AI Insights & Suggestions

Subtle, non-intrusive insights such as:

- Best focus times
- Widget usage patterns
- Productivity trends

Tone: encouraging, calm, non-judgmental.

---

## 🎯 Focus Mode

A distraction-free mode designed for deep work.

Features:

- Enlarged Pomodoro timer
- Highlighted current task
- Dimmed or hidden secondary widgets
- Optional ambient sound controls

Visual style:

- Dark
- Minimal
- High contrast

---

## 🎨 Visual Style Guidelines

- Modern, minimal UI
- Calm productivity color palette
- Rounded corners
- Soft shadows
- Smooth drag & resize animations
- Dark mode optimized
- Clear visual hierarchy

---

## ⌨️ Power User Features (Optional but Designed)

- Command palette (Cmd + K)
- Keyboard shortcuts
- Undo / redo layout changes
- Restore previous layouts

---

## 🧠 Key Differentiator

WidgetFlow intelligently **creates the dashboard for the user**, then lets them **fully customize it** — combining AI-powered setup with total creative freedom.

---

## 📤 Output Expectation

Generate:

- High-fidelity UI screens
- Modular component system
- Responsive behavior
- Canvas-style dashboard
- Design ready for implementation with React + Tailwind CSS
