<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InkType extends Model
{
    protected $fillable = [
        'name', 'color', 'brand', 'formula', 'unit', 'low_stock_threshold', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'low_stock_threshold' => 'decimal:2',
        ];
    }

    public function printers(): BelongsToMany
    {
        return $this->belongsToMany(Printer::class, 'printer_ink_type')->withTimestamps();
    }

    public function consumptions(): HasMany
    {
        return $this->hasMany(InkConsumption::class);
    }
}
