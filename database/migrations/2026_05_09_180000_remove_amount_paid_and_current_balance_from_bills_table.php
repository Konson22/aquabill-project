<?php

use App\Models\Bill;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Paid totals live on payments (polymorphic payable). Legacy bills.amount_paid is migrated
     * into a single payment row per bill when present, then dropped together with current_balance.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('bills', 'amount_paid')) {
            return;
        }

        $billMorph = Bill::class;

        foreach (DB::table('bills')->where('amount_paid', '>', 0)->cursor() as $row) {
            $exists = DB::table('payments')
                ->where('payable_type', $billMorph)
                ->where('payable_id', $row->id)
                ->exists();

            if ($exists) {
                continue;
            }

            $legacyBalance = Schema::hasColumn('bills', 'current_balance')
                ? (float) $row->current_balance
                : max(0.0, (float) $row->total_amount - (float) $row->amount_paid);

            DB::table('payments')->insert([
                'payable_type' => $billMorph,
                'payable_id' => $row->id,
                'amount' => $row->amount_paid,
                'current_balance' => $legacyBalance,
                'payment_date' => Carbon::parse($row->updated_at)->toDateString(),
                'payment_method' => 'cash',
                'reference_number' => null,
                'notes' => 'Migrated from bills.amount_paid',
                'recorded_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn(['amount_paid', 'current_balance']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->decimal('current_balance', 10, 2)->default(0);
        });

        if (! Schema::hasTable('payments')) {
            return;
        }

        $billMorph = Bill::class;

        foreach (DB::table('bills')->cursor() as $row) {
            $paid = (float) (DB::table('payments')
                ->where('payable_type', $billMorph)
                ->where('payable_id', $row->id)
                ->sum('amount'));

            $total = (float) $row->total_amount;
            $balance = max(0.0, $total - $paid);

            DB::table('bills')->where('id', $row->id)->update([
                'amount_paid' => $paid,
                'current_balance' => $balance,
            ]);
        }
    }
};
