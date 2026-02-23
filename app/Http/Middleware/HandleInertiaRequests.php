<?php

namespace App\Http\Middleware;

use App\Models\Bill;
use App\Models\Meter;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $shared = [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];

        if ($request->user()) {
            // Overdue readings: active meters that have been read at least once but not in the last 30 days
            $shared['overdue_reading_count'] = Meter::where('status', 'active')
                ->whereHas('readings')
                ->whereDoesntHave('readings', function ($q) {
                    $q->where('reading_date', '>=', now()->subDays(30));
                })
                ->count();
            // Overdue bills: unpaid (pending/partial) and due date in the past
            $shared['overdue_bill_count'] = Bill::whereIn('status', ['pending', 'partial paid'])
                ->where('due_date', '<', now())
                ->count();
        }

        return $shared;
    }
}
