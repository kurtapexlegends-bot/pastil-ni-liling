<?php

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\HubInventory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class HubSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Cubao Branch (Quezon City) - Official FB Branch
        $cubaoFranchisee = User::where('email', 'franchise@pnl.com')->first();
        if ($cubaoFranchisee) {
            $cubaoHub = Hub::updateOrCreate(
                ['name' => 'Cubao Hub (Arayat Market)'],
                [
                    'franchisee_id' => $cubaoFranchisee->id,
                    'address' => 'Stall # EA-05, Arayat Market, Cubao, Quezon City',
                    'latitude' => 14.61900000,
                    'longitude' => 121.05100000,
                    'status' => 'active',
                ]
            );

            // Assign cashier to Cubao hub
            $cubaoCashier = User::where('email', 'cashier@pnl.com')->first();
            if ($cubaoCashier) {
                $cubaoCashier->update(['hub_id' => $cubaoHub->id]);
            }
        }

        // 2. Bagong Silang Branch (Caloocan City) - Official FB Branch (Open 24/7)
        $caloocanFranchisee = User::where('email', 'franchise_caloocan@pnl.com')->first();
        if ($caloocanFranchisee) {
            $caloocanHub = Hub::updateOrCreate(
                ['name' => 'Bagong Silang Hub (Langit Road)'],
                [
                    'franchisee_id' => $caloocanFranchisee->id,
                    'address' => 'Langit Road, Bagong Silang, Caloocan City',
                    'latitude' => 14.77350000,
                    'longitude' => 121.05200000,
                    'status' => 'active',
                ]
            );

            // Assign cashier to Bagong Silang hub
            $caloocanCashier = User::where('email', 'cashier_caloocan@pnl.com')->first();
            if ($caloocanCashier) {
                $caloocanCashier->update(['hub_id' => $caloocanHub->id]);
            }
        }

        // Seed hub inventory stock for all active hubs
        $hubs = Hub::all();
        $products = Product::where('is_active', true)->get();

        foreach ($hubs as $hub) {
            foreach ($products as $product) {
                HubInventory::updateOrCreate(
                    [
                        'hub_id' => $hub->id,
                        'product_id' => $product->id,
                    ],
                    [
                        'stock_quantity' => 150,
                    ]
                );
            }
        }
    }
}
