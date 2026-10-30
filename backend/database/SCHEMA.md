# WorkTips MySQL schema

Operational facts live in `printing_jobs`, `ink_consumptions`, `issue_reports`, and `maintenance_*`. The analytics API only **reads aggregates** from those tables — it never stores a second copy of KPIs.

## Entity relationship (logical)

```
users ─┬─ knowledge_items ─┬─ knowledge_media
       │                   ├─ knowledge_comments
       │                   ├─ knowledge_ratings
       │                   ├─ saved_items
       │                   └─ content_reports
       ├─ issue_reports ── printers ─┬─ printer_ink_type ── ink_types
       ├─ printing_jobs ─────────────┤
       ├─ ink_consumptions ──────────┤
       └─ maintenance_records ───────┴─ printer_part_compatibilities ── printer_parts
                                      └─ printer_common_problems
                                      └─ maintenance_parts
categories ── knowledge_items
```

## Tables

| Table | Purpose |
|---|---|
| `users` | Employees and admins (`role`) |
| `personal_access_tokens` | Sanctum API tokens |
| `categories` | Knowledge taxonomy |
| `ink_types` | Ink brand / color / formula catalog |
| `printers` | Press inventory + maintenance schedule |
| `printer_ink_type` | Compatible ink per printer |
| `printer_parts` | Parts catalog |
| `printer_part_compatibilities` | Which parts fit which printers |
| `printer_common_problems` | Known faults + recommended solutions |
| `knowledge_items` | Tips, tutorials, docs, procedures |
| `knowledge_media` | Photos / videos on disk (`storage/app/public`) |
| `knowledge_comments` / `knowledge_ratings` / `saved_items` / `content_reports` | Social + QA on knowledge |
| `issue_reports` | Floor problems; copies recommended solution at submit time |
| `maintenance_records` / `maintenance_parts` | Service log + parts consumed |
| `printing_jobs` | Sales / orders (feeds revenue analytics) |
| `ink_consumptions` | Ink used, optionally linked to a job (feeds ink analytics) |

## Analytics mapping

| Dashboard metric | Source query |
|---|---|
| Total sales / orders / AOV | `SUM/COUNT printing_jobs.total_amount` |
| Sales by printing type | `GROUP BY printing_jobs.printing_type` |
| Monthly trend | `DATE_FORMAT(job_date, '%Y-%m')` |
| Most / least used ink | `SUM` of `ink_consumptions` (L converted to ml) |
| Ink by printer / type | Join consumptions → printers / jobs |
| Printers with problems | `issue_reports` where status not resolved |
| Maintenance due | `printers.next_maintenance_at` (updated when a maintenance record is saved) |
| Frequently replaced parts | `SUM(maintenance_parts.quantity)` |
| Most viewed / useful knowledge | `knowledge_items.views` and `AVG(knowledge_ratings.score)` |
| Most reported issues | `GROUP BY issue_reports.title` |
