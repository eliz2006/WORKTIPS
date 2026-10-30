<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Printer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'brand',
        'model',
        'type',
        'serial_number',
        'printing_category',
        'condition',
        'maintenance_interval_days',
        'last_maintenance_at',
        'next_maintenance_at',
        'location',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'last_maintenance_at' => 'date',
            'next_maintenance_at' => 'date',
        ];
    }

    public function inkTypes(): BelongsToMany
    {
        return $this->belongsToMany(InkType::class, 'printer_ink_type')->withTimestamps();
    }

    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(PrinterPart::class, 'printer_part_compatibilities')->withTimestamps();
    }

    public function commonProblems(): HasMany
    {
        return $this->hasMany(PrinterCommonProblem::class);
    }

    public function issueReports(): HasMany
    {
        return $this->hasMany(IssueReport::class);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function printingJobs(): HasMany
    {
        return $this->hasMany(PrintingJob::class);
    }

    public function inkConsumptions(): HasMany
    {
        return $this->hasMany(InkConsumption::class);
    }

    public function scopeMaintenanceDue($query)
    {
        return $query->whereDate('next_maintenance_at', '<=', now()->toDateString());
    }
}
