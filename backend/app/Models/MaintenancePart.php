<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenancePart extends Model
{
    protected $fillable = ['maintenance_record_id', 'printer_part_id', 'quantity'];

    public function record(): BelongsTo
    {
        return $this->belongsTo(MaintenanceRecord::class, 'maintenance_record_id');
    }

    public function part(): BelongsTo
    {
        return $this->belongsTo(PrinterPart::class, 'printer_part_id');
    }
}
