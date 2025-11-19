<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('invoice_number', 50)->nullable()->unique()->after('id');
        });

        DB::table('invoices')
            ->orderBy('id')
            ->lazy()
            ->each(function ($invoice) {
                $number = 'INV-' . str_pad((string) $invoice->id, 6, '0', STR_PAD_LEFT);

                DB::table('invoices')
                    ->where('id', $invoice->id)
                    ->update(['invoice_number' => $number]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropUnique('invoices_invoice_number_unique');
            $table->dropColumn('invoice_number');
        });
    }
};


