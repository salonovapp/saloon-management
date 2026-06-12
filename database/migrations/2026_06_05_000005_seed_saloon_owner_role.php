<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Role::query()->firstOrCreate(
            ['name' => 'saloon_owner', 'saloon_id' => null],
            ['is_active' => true],
        );
    }

    public function down(): void
    {
        Role::query()->where('name', 'saloon_owner')->whereNull('saloon_id')->delete();
    }
};
