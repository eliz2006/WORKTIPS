<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrinterPart extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'part_type', 'quantity_on_hand', 'condition',
        'unit_cost', 'reorder_level', 'description',
    ];

    protected function casts(): array
    {
        return [
            'unit_cost' => 'decimal:2',
        ];
    }

    public function printers(): BelongsToMany
    {
        return $this->belongsToMany(Printer::class, 'printer_part_compatibilities')->withTimestamps();
    }

    public function maintenanceUsages(): HasMany
    {
        return $this->hasMany(MaintenancePart::class);
    }
}
