<?php

use App\Models\Meter;

$meters = Meter::whereNotNull('customer_id')->take(5)->get(['meter_number', 'last_reading']);
foreach ($meters as $m) {
    echo "Meter: {$m->meter_number}, Last Reading: {$m->last_reading}\n";
}
