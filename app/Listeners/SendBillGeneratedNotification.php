<?php

namespace App\Listeners;

use App\Events\BillGenerated;
use App\Models\User;
use App\Notifications\BillGeneratedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendBillGeneratedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(BillGenerated $event): void
    {
        try {
            // Get all admin users
            $adminUsers = User::whereHas('roles', function($query) {
                $query->where('name', 'admin');
            })
            ->where('status', 'active')
            ->get();

            if ($adminUsers->isEmpty()) {
                Log::warning('No admin users found to notify about bill generation', [
                    'bill_id' => $event->bill->id
                ]);
                return;
            }

            // Send notification to each admin user
            foreach ($adminUsers as $admin) {
                $admin->notify(new BillGeneratedNotification($event->bill));
            }

            Log::info('Bill generation notifications sent to admin users', [
                'bill_id' => $event->bill->id,
                'admin_count' => $adminUsers->count(),
                'admin_emails' => $adminUsers->pluck('email')->toArray()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send bill generation notifications', [
                'bill_id' => $event->bill->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
