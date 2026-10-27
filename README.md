# MaintainIQ

React + Vite. Original single `maintainiq.tsx` split into one component per file, each with its own vanilla CSS file.

## Run
```
npm install
npm run dev
```

## Structure
```
src/
  main.jsx                      entry (loads primitives.css, then base.css, then App)
  App.jsx / App.css             state, CRUD logic, routing, shell layout
  styles/
    base.css                    design tokens, reset, utility classes (old MAINTAINIQ_VANILLA_CSS)
    primitives.css              shared .btn / .card / .form-* / .data-table
  data/constants.js             seed data & constants
  utils/                        dateUtils, storage, authStorage, triageEngine
  components/                   Sidebar, Topbar, NotificationBell, ToastStack, StorageWarningBanner,
                                JudgeGuideModal, Modal, Badges (3, share Badge.css), DeterministicQRCodeSVG
  pages/                        AuthGatewayView, DashboardView, AnalyticsTrendsView, AssetsView,
                                AssetDetailsView, NotFoundView,
                                PublicPortalDirectoryView, PublicQRStandaloneView
                                + placeholders: IssuesView, IssueDetailsView, AITriageView,
                                  MaintenanceView, HistoryView, SettingsView
```

## Pages (all fully functional)
- **Work Orders / Issues** - list + Kanban board, quick stat filters, search/status/priority/technician/sort filters, "my assignments" toggle, New Work Order modal with validation.
- **Work Order Details** - workflow stepper, status transitions (follows ALLOWED_TRANSITIONS), technician re-assign + notes, Log Maintenance modal (with "mark resolved"), AI analysis panel, per-issue timeline, reopen/lock for Closed.
- **AI Issue Triage** - sample complaints, staged analysis, editable title/category/priority, auto-assign, one-click work order creation, rule library + usage stats.
- **Maintenance & Schedule** - overdue / 7-day / 30-day service tracking, technician workload, cost by category, full service log.
- **Activity Timeline** - day-grouped audit trail, event-type chips, asset/period/search filters, load more, CSV export.
- **Settings & Auth Users** - organization settings (admin only), my account + demo role switch, registered users, technician roster, storage usage, JSON backup, confirmed reset.

PublicPortalDirectoryView and PublicQRStandaloneView were rebuilt earlier from scratch (original code was not in the first upload).
