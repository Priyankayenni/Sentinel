# SENTINEL — Cyber Security Operations Dashboard

A production-ready, full-stack cybersecurity operations dashboard built with React 18, Vite, TypeScript, Tailwind CSS, and Supabase.



[LINK] (https://sentinel-7mxu9rdys-priyas-projects-cb19cbd4.vercel.app/login)

## 🚀 Quick Start (Demo Mode)

The app works immediately without any configuration using built-in demo accounts:

| Role    | Email                    | Password     | Access Level          |
|---------|--------------------------|--------------|------------------------|
| Admin   | admin@sentinel.io        | Admin@123    | Full access            |
| Analyst | analyst@sentinel.io      | Analyst@123  | Read/Write (no admin)  |
| Viewer  | viewer@sentinel.io       | Viewer@123   | Read-only              |

## 📁 Project Structure

```
sentinel/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx        # Main layout wrapper
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   └── Header.tsx        # Top header + notifications
│   │   ├── ui/
│   │   │   ├── Badge.tsx         # Severity/Status badges
│   │   │   ├── Button.tsx        # Cyber-styled buttons
│   │   │   ├── Card.tsx          # Card components
│   │   │   └── Input.tsx         # Input/Select fields
│   │   └── ProtectedRoute.tsx    # Auth guard
│   ├── contexts/
│   │   └── AuthContext.tsx       # Auth + RBAC context
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── database.types.ts     # TypeScript types
│   │   ├── mockData.ts           # Demo data
│   │   └── utils.ts              # Utility functions
│   ├── pages/
│   │   ├── Login.tsx             # Auth page with terminal animation
│   │   ├── Dashboard.tsx         # Main SOC dashboard
│   │   ├── Alerts.tsx            # Alert management
│   │   ├── Incidents.tsx         # Incident management
│   │   ├── VulnerabilityScanner.tsx # Vuln scanner + history
│   │   ├── PasswordAnalyzer.tsx  # Password strength + HIBP
│   │   ├── ActivityLog.tsx       # Audit trail
│   │   ├── Reports.tsx           # Report generation
│   │   ├── Settings.tsx          # Profile + team management
│   │   └── ApiKeys.tsx           # API key management
│   ├── App.tsx                   # Router + providers
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Cyberpunk theme styles
├── supabase/
│   └── schema.sql                # Complete DB schema + RLS
├── .env.example                  # Environment variables template
└── README.md
```

## ⚙️ Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the schema: Go to **SQL Editor** → paste `supabase/schema.sql` → Run
3. Copy your project URL and anon key from **Settings → API**
4. Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔐 Features

### Authentication & RBAC
- Supabase Auth with email/password
- Role-based access control (Admin / Analyst / Viewer)
- Row Level Security (RLS) on all database tables
- Demo mode with hardcoded test accounts

### Dashboard
- Live threat counter with real-time updates
- Threat timeline charts (Area/Line)
- Attack type distribution (Pie chart)
- Geo-threat origin table
- Live threat event feed (auto-refreshes every 4s)
- Infrastructure health monitor
- Weekly trend bar chart

### Alerts
- Full CRUD with severity/status/category filters
- Searchable table with sort options
- Alert detail modal with raw data view
- CSV export
- Real-time status updates

### Incidents
- Complete incident lifecycle management
- Timeline tracking with notes
- Priority-based classification
- Linked alert tracking
- Assignment tracking

### Vulnerability Scanner
- Simulated multi-step scan with terminal output
- Realistic CVE findings with CVSS scores
- Finding detail expansion with remediation steps
- Scan history with risk scoring
- JSON report export

### Password Analyzer
- Real-time strength analysis (zxcvbn)
- Entropy calculation
- HIBP breach simulation (k-anonymity model)
- Secure password generator
- NIST SP 800-63B compliance checklist

### Activity Log
- Complete audit trail of all user actions
- Filter by action type, user
- Action distribution charts

### Reports
- 5 report types: Executive, Vulnerability, Incident, Threat Intel, Compliance
- One-click generation + download
- Report history

### Settings
- Profile management
- Password change
- Session management
- MFA toggle
- Notification preferences
- Team/role management (Admin only)

### API Keys
- Generate keys with scoped permissions
- Key rotation and revocation
- Usage tracking
- API reference documentation

## 🎨 Design System

- **Theme**: Cyberpunk / Terminal-inspired dark theme
- **Colors**: Cyan (#00d4ff) primary, semantic severity colors
- **Typography**: Inter + JetBrains Mono
- **Effects**: Scanlines, glows, pulse animations, grid background
- **Charts**: Recharts with custom dark theme

## 🚀 Deployment (Vercel)

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📊 Database Schema

See `supabase/schema.sql` for the complete PostgreSQL schema including:
- `profiles` — User profiles extending Supabase auth
- `alerts` — Security alerts with severity/status
- `threat_events` — Real-time threat intelligence
- `incidents` — Incident management
- `scan_reports` — Vulnerability scan results
- `password_checks` — Password analysis history
- `activity_logs` — Complete audit trail
- `notifications` — In-app notifications
- `infrastructure_nodes` — Asset inventory
- `api_keys` — Programmatic access keys
- `reports` — Generated report metadata
