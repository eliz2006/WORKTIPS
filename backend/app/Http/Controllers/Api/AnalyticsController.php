<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InkConsumption;
use App\Models\IssueReport;
use App\Models\KnowledgeItem;
use App\Models\MaintenancePart;
use App\Models\Printer;
use App\Models\PrintingJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Live dashboard metrics sourced from operational tables.
     *
     * Printing jobs write sales rows; optional ink lines on the same request
     * write ink_consumptions. Issue reports increment printer problem counts.
     * Maintenance records update next_maintenance_at and parts replaced.
     */
    public function dashboard(Request $request)
    {
        $from = $request->filled('from') ? $request->date('from') : now()->copy()->startOfYear();
        $to = $request->filled('to') ? $request->date('to') : now();

        $jobs = PrintingJob::query()->whereBetween('job_date', [$from, $to])->where('status', '!=', 'cancelled');

        $totalSales = (clone $jobs)->sum('total_amount');
        $totalOrders = (clone $jobs)->count();

        $salesByType = (clone $jobs)
            ->select('printing_type', DB::raw('SUM(total_amount) as total'), DB::raw('COUNT(*) as orders'))
            ->groupBy('printing_type')
            ->get();

        $monthlySales = (clone $jobs)
            ->select(
                DB::raw("DATE_FORMAT(job_date, '%Y-%m') as month"),
                DB::raw('SUM(total_amount) as total'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy(DB::raw("DATE_FORMAT(job_date, '%Y-%m')"))
            ->orderBy('month')
            ->get();

        $inkBase = InkConsumption::query()
            ->whereBetween('consumed_on', [$from, $to])
            ->selectRaw("SUM(CASE WHEN unit = 'L' THEN quantity * 1000 ELSE quantity END) as ml");

        $inkByType = InkConsumption::query()
            ->join('ink_types', 'ink_types.id', '=', 'ink_consumptions.ink_type_id')
            ->leftJoin('printing_jobs', 'printing_jobs.id', '=', 'ink_consumptions.printing_job_id')
            ->whereBetween('consumed_on', [$from, $to])
            ->select(
                'ink_types.id',
                'ink_types.name',
                'ink_types.color',
                'ink_types.brand',
                DB::raw("SUM(CASE WHEN ink_consumptions.unit = 'L' THEN ink_consumptions.quantity * 1000 ELSE ink_consumptions.quantity END) as ml")
            )
            ->groupBy('ink_types.id', 'ink_types.name', 'ink_types.color', 'ink_types.brand')
            ->orderByDesc('ml')
            ->get();

        $inkByPrinter = InkConsumption::query()
            ->join('printers', 'printers.id', '=', 'ink_consumptions.printer_id')
            ->whereBetween('consumed_on', [$from, $to])
            ->select(
                'printers.id',
                'printers.name',
                DB::raw("SUM(CASE WHEN unit = 'L' THEN quantity * 1000 ELSE quantity END) as ml")
            )
            ->groupBy('printers.id', 'printers.name')
            ->orderByDesc('ml')
            ->get();

        $inkByPrintingType = InkConsumption::query()
            ->join('printing_jobs', 'printing_jobs.id', '=', 'ink_consumptions.printing_job_id')
            ->whereBetween('consumed_on', [$from, $to])
            ->select(
                'printing_jobs.printing_type',
                DB::raw("SUM(CASE WHEN ink_consumptions.unit = 'L' THEN ink_consumptions.quantity * 1000 ELSE ink_consumptions.quantity END) as ml")
            )
            ->groupBy('printing_jobs.printing_type')
            ->get();

        $problemPrinters = Printer::query()
            ->select(['id', 'name', 'model', 'condition', 'next_maintenance_at'])
            ->whereHas('issueReports', fn ($q) => $q->whereNotIn('status', ['resolved', 'closed']))
            ->withCount(['issueReports as open_issues_count' => fn ($q) => $q->whereNotIn('status', ['resolved', 'closed'])])
            ->orderByDesc('open_issues_count')
            ->get();

        $maintenanceDue = Printer::query()
            ->whereNotNull('next_maintenance_at')
            ->whereDate('next_maintenance_at', '<=', now()->addDays(7))
            ->orderBy('next_maintenance_at')
            ->get(['id', 'name', 'model', 'condition', 'next_maintenance_at']);

        $replacedParts = MaintenancePart::query()
            ->join('printer_parts', 'printer_parts.id', '=', 'maintenance_parts.printer_part_id')
            ->select('printer_parts.id', 'printer_parts.name', 'printer_parts.part_type', DB::raw('SUM(maintenance_parts.quantity) as replaced'))
            ->groupBy('printer_parts.id', 'printer_parts.name', 'printer_parts.part_type')
            ->orderByDesc('replaced')
            ->limit(10)
            ->get();

        return response()->json([
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'kpis' => [
                'total_sales' => round((float) $totalSales, 2),
                'total_orders' => $totalOrders,
                'average_order_value' => $totalOrders ? round($totalSales / $totalOrders, 2) : 0,
                'ink_consumed_ml' => round((float) ($inkBase->value('ml') ?? 0), 2),
                'open_issues' => IssueReport::query()->whereNotIn('status', ['resolved', 'closed'])->count(),
                'pending_tips' => KnowledgeItem::query()->where('status', 'pending')->count(),
            ],
            'sales_by_type' => $salesByType,
            'monthly_sales' => $monthlySales,
            'most_used_ink' => $inkByType->first(),
            'low_usage_ink' => $inkByType->sortBy('ml')->values()->take(5),
            'ink_by_type' => $inkByType,
            'ink_by_printer' => $inkByPrinter,
            'ink_by_printing_type' => $inkByPrintingType,
            'printers_with_problems' => $problemPrinters,
            'maintenance_due' => $maintenanceDue,
            'frequently_replaced_parts' => $replacedParts,
            'most_viewed_tutorials' => KnowledgeItem::query()->approved()->where('type', 'tutorial')->orderByDesc('views')->limit(5)->get(['id', 'title', 'views', 'type']),
            'most_useful_tips' => KnowledgeItem::query()->approved()->withAvg('ratings', 'score')->orderByDesc('ratings_avg_score')->limit(5)->get(['id', 'title', 'views', 'type']),
            'most_reported_issues' => IssueReport::query()
                ->select('title', DB::raw('COUNT(*) as reports'))
                ->groupBy('title')
                ->orderByDesc('reports')
                ->limit(8)
                ->get(),
        ]);
    }
}
