<?php

namespace App\Http\Controllers\Finance\Concerns;

use Inertia\Inertia;
use Inertia\Response;

trait RendersFinanceOrAdminInertia
{
    /**
     * Render a page under admin/* for admin/meters users, or finance/* for finance users.
     *
     * @param  string  $relativePath  Path after admin/ or finance/, e.g. bills/index
     */
    protected function renderFinanceOrAdmin(string $relativePath, array $props = []): Response
    {
        $prefix = auth()->user()?->department === 'finance' ? 'finance' : 'admin';

        return Inertia::render($prefix.'/'.$relativePath, $props);
    }
}
