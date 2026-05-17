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
        $franchiseeRole = Role::firstOrCreate(['name' => 'Franchisee']);
        $customerRole = Role::firstOrCreate(['name' => 'Customer']);

        // Create initial Admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@pastilnililing.com'],
            [
                'name' => 'Pastil Admin',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole($adminRole);

        // Create initial Franchisee user
        $franchisee = User::updateOrCreate(
            ['email' => 'franchise@pastilnililing.com'],
            [
                'name' => 'Liling Manila Franchisee',
                'password' => Hash::make('password'),
            ]
        );
        $franchisee->assignRole($franchiseeRole);
    }
}
