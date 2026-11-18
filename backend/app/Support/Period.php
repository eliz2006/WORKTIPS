<?php

namespace App\Support;

use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Month / year filtering for any list.
 * Usage in a controller:  Period::apply($query, $request, 'job_date');
 * Frontend sends ?month=11&year=2026 (either one may be missing).
 */
class Period
{
    public static function range(?int $month, ?int $year): ?array
    {
        if (! $month && ! $year) {
            return null;
        }

        $year = $year ?: now()->year;
        $start = $month ? Carbon::create($year, $month, 1)->startOfDay() : Carbon::create($year, 1, 1)->startOfDay();
        $end = $month ? $start->copy()->endOfMonth() : $start->copy()->endOfYear();

        return [$start, $end];
    }

    public static function apply($query, Request $request, string $column)
    {
        $month = $request->integer('month') ?: null;
        $year = $request->integer('year') ?: null;

        if ($month && ($month < 1 || $month > 12)) {
            $month = null;
        }

        if ($range = self::range($month, $year)) {
            $query->whereBetween($column, $range);
        }

        return $query;
    }
}