<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InkConsumption extends Model
{
    protected $fillable = [
        'ink_type_id',
        'printer_id',
        'printing_job_id',
        'recorded_by',
        'quantity',
        'unit',
        'consumed_on',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'consumed_on' => 'date',
        ];
    }

    public function inkType(): BelongsTo
    {
        return $this->belongsTo(InkType::class);
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }

    public function printingJob(): BelongsTo
    {
        return $this->belongsTo(PrintingJob::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
