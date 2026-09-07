# NEXORA — Intelligent Infrastructure Project-Monitoring Platform

> **"See the delay before it becomes a crisis."**

NEXORA is a web-based, integrated project-monitoring platform designed for large infrastructure, public-works, and capital programs. It implements the closed-loop **MONITOR → DETECT → EXPLAIN → ACT** paradigm with deterministic analytics, DAG bottleneck identification, what-if simulations, multi-channel automated alerts, and AI risk syntheses.

---

## 🚀 Key Capabilities

1. **Deterministic 5-Part Health Score Engine**:
   - Schedule Health (30%)
   - Budget Health (20%)
   - Milestone Health (20%)
   - Dependency Health (15%)
   - Risk Health (15%)
   - Status Classification Bands: `ON TRACK` (80–100), `AT RISK` (60–79), `DELAYED` (0–59)

2. **Dependency DAG Traversal & Bottleneck Engine**:
   - Traverses dependency graph to find all transitive uncompleted downstream blocked activities.
   - Isolates the single highest-impact bottleneck node.

3. **Interactive What-If Simulation Engine**:
   - Recomputes project delay, schedule health, and completion date purely deterministically on slider adjustments.

4. **Multi-Channel Automated Alert Dispatch**:
   - Threshold-triggered notifications across WhatsApp, Email, and SMS for critical schedule slips and bottlenecks.

5. **Project Onboarding & Leadership Assignment**:
   - Interactive modal to onboard new capital projects, assign nodal officers, and track real-time telemetry.

6. **Action Center & State Mutation**:
   - Real-time `Assign`, `Escalate`, and `Mark Resolved` mutations with persistence.

7. **Flagship Demo Asset**:
   - *East-West Highway Expansion* (Kolkata, Roads) — showcasing land-acquisition delay blocking 4 downstream activities.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS + Lucide React
- **Visualizations:** Recharts + SVG Radial Health Gauges + Gantt Phase Timelines
- **Testing:** Vitest (100% test pass on calculation engines)
- **AI Layer:** OpenAI / Gemini integration with 100% deterministic rule-based fallback

---

## 🏁 Quickstart

### Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- npm or pnpm

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/kingsupraaa/NEXORA.git
cd NEXORA

# Install dependencies
npm install

# Run unit test suite
npm test

# Start development server
npm run dev

# Or build and run production server
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Environment Variables

Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: LLM API Keys (Falls back automatically to deterministic rule engine if unset)
OPENAI_API_KEY=
GEMINI_API_KEY=
```

---

## 📄 License
MIT License. Synthetic demo data for prototyping.
