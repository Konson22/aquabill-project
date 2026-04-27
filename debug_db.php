<?php

use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$results = DB::select('DESCRIBE roles');
file_put_contents('describe_roles.txt', json_encode($results, JSON_PRETTY_PRINT));
echo "Done\n";
