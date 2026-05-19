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
            ['email' => 'admin@pastilnililing.com'],
            [
                'name' => 'Pastil Admin',
                'password' => 'password',
            ]
        );
        $admin->assignRole($adminRole);

        // Create initial HQ operations user
        $hqOps = User::updateOrCreate(
            ['email' => 'hq_ops@pastilnililing.com'],
            [
                'name' => 'Liling HQ Operations Director',
                'password' => 'password',
            ]
        );
        $hqOps->assignRole($hqOpsRole);

        // Create initial Franchisee user
        $franchisee = User::updateOrCreate(
            ['email' => 'franchise@pastilnililing.com'],
            [
                'name' => 'Liling Manila Franchisee',
                'password' => 'password',
            ]
        );
        $franchisee->assignRole($franchiseeRole);

        // Create initial Branch Cashier user
        $cashier = User::updateOrCreate(
            ['email' => 'cashier@pastilnililing.com'],
            [
                'name' => 'Liling Diliman Cashier',
                'password' => 'password',
            ]
        );
        $cashier->assignRole($cashierRole);
    }
}
