<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Singleton-style application settings (one row). Billing cycle and financial year
     * anchors drive reporting periods, bill generation, and ledger workflows.
     */
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('billing_cycle', ['monthly', 'bimonthly', 'quarterly'])->default('monthly');
            $table->unsignedTinyInteger('billing_cycle_day')->default(27)->comment('Day of month the billing period closes (1–28)');
            $table->date('current_billing_period_start')->nullable();
            $table->date('current_billing_period_end')->nullable();
            $table->unsignedTinyInteger('financial_year_start_month')->default(6)->comment('Month financial year begins (1–12)');
            $table->unsignedTinyInteger('financial_year_start_day')->default(1)->comment('Day financial year begins (1–31)');
            $table->unsignedSmallInteger('disconnection_period_days')->default(30)->comment('Notice period before grace (days)');
            $table->unsignedSmallInteger('grace_period_days')->default(15)->comment('Final grace period after notice (days)');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
