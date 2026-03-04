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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('name')->constrained('departments')->nullOnDelete();
            $table->enum('role', ['manager', 'staff'])->default('staff')->after('department_id');
        });

        // Migrate existing department enum to department_id
        $departments = DB::table('departments')->pluck('id', 'name');
        foreach (['admin', 'finance', 'meters'] as $name) {
            if ($departments->has($name)) {
                DB::table('users')->where('department', $name)->update([
                    'department_id' => $departments[$name],
                ]);
            }
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
            $table->dropColumn('role');
            $table->enum('department', ['admin', 'finance', 'meters'])->default('admin')->after('name');
        });
    }
};
