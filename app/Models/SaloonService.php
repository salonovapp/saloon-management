<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaloonService extends Model
{
    protected $fillable = [
        'saloon_id',
        'name',
        'category',
        'duration',
        'price',
        'buffer_time',
    ];

    public function saloon(): BelongsTo
    {
        return $this->belongsTo(Saloon::class);
    }
}
