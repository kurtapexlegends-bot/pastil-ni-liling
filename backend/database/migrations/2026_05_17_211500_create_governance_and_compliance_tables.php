<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Digital Compliance & Quality Control Audits table
        Schema::create('compliance_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hub_id')->constrained()->onDelete('cascade');
            $table->foreignId('auditor_id')->constrained('users')->onDelete('cascade');
            $table->date('audit_date');
            $table->integer('hygiene_score'); // Out of 100
            $table->integer('recipe_adherence_score'); // Out of 100
            $table->string('kitchen_photo_path')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, approved, flagged
            $table->timestamps();
        });

        // 2. Branch Cashier Work Shifts table
        Schema::create('work_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Cashier employee
            $table->foreignId('hub_id')->constrained()->onDelete('cascade');
            $table->dateTime('clock_in');
            $table->dateTime('clock_out')->nullable();
            $table->decimal('hourly_rate', 10, 2)->default(60.00); // standard rate per hour in PHP
            $table->string('status')->default('active'); // active, completed
            $table->timestamps();
        });

        // 3. Direct Payouts and Commissions tracking table
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Cashier employee
            $table->foreignId('hub_id')->constrained()->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('base_pay', 10, 2)->default(0.00); // calculated from hours worked
            $table->decimal('commission_pay', 10, 2)->default(0.00); // 5% commission on walk-in POS sales
            $table->decimal('total_pay', 10, 2)->default(0.00);
            $table->string('status')->default('pending'); // pending, paid
            $table->timestamps();
        });

        // Add foreignId relation on orders for branch cashiers (POS walk-in commission calculation)
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('cashier_id')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['cashier_id']);
            $table->dropColumn('cashier_id');
        });

        Schema::dropIfExists('payouts');
        Schema::dropIfExists('work_shifts');
        Schema::dropIfExists('compliance_audits');
    }
};
