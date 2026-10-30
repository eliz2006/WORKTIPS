<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceRecord extends Model
{
    protected $fillable = [
        'printer_id', 'performed_by', 'performed_at', 'work_type', 'notes', 'labor_cost', 'next_due_at',
    ];

    protected function casts(): array
    {
        return [
            'performed_at' => 'datetime',
            'next_due_at' => 'date',
            'labor_cost' => 'decimal:2',
        ];
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(MaintenancePart::class);
    }
}
