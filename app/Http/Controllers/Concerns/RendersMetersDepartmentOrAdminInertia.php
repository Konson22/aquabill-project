<?php

namespace App\Http\Controllers\Concerns;

use Inertia\Inertia;
use Inertia\Response;

trait RendersMetersDepartmentOrAdminInertia
{
    /**
     * Render under meters-readers/* for meters department users, otherwise admin/*.
     *
     * @param  string  $relativePath  Path after admin/ or meters-readers/, e.g. meters/index
     */
    protected function renderMetersOrAdmin(string $relativePath, array $props = []): Response
    {
        $prefix = auth()->user()?->department === 'meters' ? 'meters-readers' : 'admin';

        return Inertia::render($prefix.'/'.$relativePath, $props);
    }
}
