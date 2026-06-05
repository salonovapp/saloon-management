<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => config('app.name'),
    ]);
});

Route::view('/', 'welcome');

Route::view('/{any}', 'welcome')
    ->where('any', '^(?!api|health).*$');
