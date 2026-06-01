<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'name',
        'default_price',
        'duration_minutes',
    ];

    protected function casts(): array
    {
        return [
            'default_price' => 'decimal:2',
            'duration_minutes' => 'integer',
        ];
    }

    public function serviceProducts(): HasMany
    {
        return $this->hasMany(ServiceProduct::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'service_products')
            ->withPivot('id', 'default_price')
            ->withTimestamps();
    }
}
