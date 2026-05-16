# GoalTrack 🚀
### Enterprise Goal Setting & Tracking Portal

A premium, full-stack performance management solution built with **React**, **Tailwind CSS**, and **Supabase**. GoalTrack streamlines the entire goal lifecycle—from strategic alignment to quarterly achievement tracking.

---

## ✨ Key Features

### 1. Multi-Role Ecosystem
- **Employee:** Draft goals, track achievements, and receive feedback.
- **Manager (L1):** Oversight of direct reports, approval workflows, and structured check-ins.
- **Admin / HR:** Cycle management, global KPI distribution, and system-wide audit logs.

### 2. Goal Lifecycle Management
- **Strict Validation:** 100% weightage enforcement, min 10% per goal, max 8 goals.
- **Multi-UoM Support:** Numeric, Percentage, Timeline, and Zero-based targets.
- **Shared Goals:** Push organizational KPIs that remain read-only for employees.

### 3. Analytics & Reporting
- **Real-time Dashboards:** Performance trends and status distribution using Recharts.
- **Export Utility:** One-click CSV export for manager reports.
- **Audit Ready:** Complete history of all changes post-approval.

### 4. Premium Experience
- **Dark Mode:** System-wide dark mode support with a refined Slate/Indigo palette.
- **Modern UI:** Glassmorphism, responsive top navigation, and fluid animations.

---

## 🛠 Tech Stack
- **Frontend:** Vite + React + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + RLS)
- **Icons:** Lucide React
- **Charts:** Recharts

---

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. **Run Locally:**
   ```bash
   npm run dev
   ```

---

## 🔑 Demo Credentials (Prototype)
- **Admin:** `admin@goaltrack.com` / `Admin@123`
- **Manager:** `manager1@goaltrack.com` / `Manager@123`
- **Employee:** `employee1@goaltrack.com` / `Emp@123`

---
*Built with ❤️ for Atomberg Solutions.*
