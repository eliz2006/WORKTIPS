<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrintingJob;
use App\Support\Period;
use Illuminate\Http\Request;

class SalesSummaryController extends Controller
{
    /** GET /api/jobs/summary?group=day|month|year&month=11&year=2026 */
    public function __invoke(Request $request)
    {
        $formats = ['day' => 'YYYY-MM-DD', 'month' => 'YYYY-MM', 'year' => 'YYYY'];
        $group = array_key_exists($request->group, $formats) ? $request->group : 'month';
        $fmt = $formats[$group]; // whitelisted, safe to inline

        $query = PrintingJob::query()->where('status', '!=', 'cancelled');
        Period::apply($query, $request, 'job_date');

        $rows = (clone $query)
            ->selectRaw("TO_CHAR(job_date, '{$fmt}') as period, SUM(total_amount) as total, COUNT(*) as orders")
            ->groupByRaw("TO_CHAR(job_date, '{$fmt}')")
            ->orderBy('period', 'desc')
            ->get();

        return response()->json([
            'group' => $group,
            'rows' => $rows,
            'total_sales' => round((float) $rows->sum('total'), 2),
            'total_orders' => (int) $rows->sum('orders'),
        ]);
    }
}