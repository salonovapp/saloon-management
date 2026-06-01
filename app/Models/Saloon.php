<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Saloon extends Model
{
    protected $fillable = [
        'name',
        'branch_name',
        'address',
        'city',
        'state',
        'phone',
        'whatsapp',
        'gst_number',
        'working_hours',
    ];

    protected $casts = [
        'working_hours' => 'array',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
