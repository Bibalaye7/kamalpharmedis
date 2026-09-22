<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => 'KamalPharMédis API',
    'version' => '1.0',
    'docs' => url('/api/health'),
]));
