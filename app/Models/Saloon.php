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
        'payment_type',
        'payment_amount',
        'transaction_id',
        'is_active',
        'referral_code',
    ];

    protected $casts = [
        'working_hours' => 'array',
        'payment_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function branches(): HasMany
    {
        return $this->hasMany(SaloonBranch::class);
    }

    public function salonServiceProducts(): HasMany
    {
        return $this->hasMany(SalonServiceProduct::class);
    }
}
