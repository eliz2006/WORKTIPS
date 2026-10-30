# WorkTips

Workplace knowledge sharing and business analytics for printing press operations.

Employees publish tips and report machine problems. Supervisors approve knowledge, maintain printers and parts, and read live sales / ink / maintenance analytics.

## Stack

- Backend: Laravel 11, Sanctum token auth, MySQL, public disk uploads
- Frontend: React (Vite), Tailwind CSS 4, React Router, Axios, Recharts

## Folder structure

```
backend/                 Laravel API
  app/Http/Controllers/Api
  app/Http/Requests
  app/Models
  database/migrations
  database/SCHEMA.md
  routes/api.php
frontend/                React SPA
  src/pages
  src/components
  src/context
WORKTIPS-main/           original static prototype (reference only)
```

## Setup

1. Create MySQL database `worktips`.
2. Backend:

```bash
cd backend
copy .env.example .env   # already configured in this copy
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Employee | eliza@worktips.test | password |
| Admin | admin@worktips.test | password |

## How jobs and issues feed analytics

There is no separate “analytics table”. `GET /api/analytics` (admin) aggregates:

- **Sales KPIs and charts** from `printing_jobs` (`total_amount`, `printing_type`, `job_date`).
- **Ink charts** from `ink_consumptions`, including rows created in the same request as a job (`printing_job_id`).
- **Problem printers** from open `issue_reports`.
- **Maintenance due** from `printers.next_maintenance_at`, which is rewritten whenever a maintenance record is stored.
- **Parts wear** from `maintenance_parts`.
- **Knowledge quality** from views, ratings, and grouped issue titles.

Recording a tarpaulin job today immediately increases total sales, that type’s share, the monthly bar for the current month, and (if ink was attached) ink-by-printer and ink-by-type.
