<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $hqOpsRole = Role::firstOrCreate(['name' => 'HQ operations']);
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);
        $cashierRole = Role::firstOrCreate(['name' => 'Branch Cashier']);
        $customerRole = Role::firstOrCreate(['name' => 'Customer']);

        // Create initial Admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@pnl.com'],
            [
                'name' => 'Pastil Admin',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole($adminRole);

        // Create initial HQ operations user
        $hqOps = User::updateOrCreate(
            ['email' => 'hq_ops@pnl.com'],
            [
                'name' => 'Liling HQ Operations Director',
                'password' => Hash::make('password'),
            ]
        );
        $hqOps->assignRole($hqOpsRole);

        // Create initial Franchisee user
        $franchisee = User::updateOrCreate(
            ['email' => 'franchise@pnl.com'],
            [
                'name' => 'Liling Manila Franchisee',
                'password' => Hash::make('password'),
            ]
        );
        $franchisee->assignRole($franchiseeRole);

        // Create initial Branch Cashier user
        $cashier = User::updateOrCreate(
            ['email' => 'cashier@pnl.com'],
            [
                'name' => 'Liling Diliman Cashier',
                'password' => Hash::make('password'),
            ]
        );
        $cashier->assignRole($cashierRole);

        // Create initial Customer user
        $customer = User::updateOrCreate(
            ['email' => 'customer@pnl.com'],
            [
                'name' => 'Liling Customer',
                'password' => Hash::make('password'),
            ]
        );
        $customer->assignRole($customerRole);
    }
}
