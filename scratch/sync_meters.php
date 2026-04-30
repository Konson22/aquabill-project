<?php

use App\Models\Meter;

Meter::all()->each(function ($m) {
    $latest = $m->readings()->latest('reading_date')->latest('id')->first();
    if ($latest) {
        $m->update(['last_reading' => $latest->current_reading]);
    }
});
