<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class PrintingJob extends Model
{
    protected $fillable = [
        'job_number',
        'printer_id',
        'sold_by',
        'customer_name',
        'printing_type',
        'product_name',
        'quantity',
        'unit_price',
        'total_amount',
        'job_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'job_date' => 'date',
            'unit_price' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (PrintingJob $job) {
            $job->job_number = $job->job_number ?: 'WT-'.now()->format('Ymd').'-'.Str::upper(Str::random(5));
            $job->total_amount = $job->quantity * $job->unit_price;
        });

        static::updating(function (PrintingJob $job) {
            $job->total_amount = $job->quantity * $job->unit_price;
        });
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sold_by');
    }

    public function inkConsumptions(): HasMany
    {
        return $this->hasMany(InkConsumption::class);
    }
}
