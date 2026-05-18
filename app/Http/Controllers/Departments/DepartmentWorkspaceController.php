<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Generic landing page for organisation departments that do not yet have a bespoke dashboard module.
 */
class DepartmentWorkspaceController extends Controller
{
    public function __invoke(Request $request): InertiaResponse
    {
        $department = $request->user()->loadMissing('department')->department;

        return Inertia::render('departments/workspace', [
            'department' => [
                'name' => $department?->name,
                'description' => $department?->description,
            ],
        ]);
    }
}
