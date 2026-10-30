<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrinterCommonProblem extends Model
{
    protected $fillable = ['printer_id', 'title', 'description', 'recommended_solution'];

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }
}
