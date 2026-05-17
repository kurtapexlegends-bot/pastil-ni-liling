<?php

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\User;
use Illuminate\Database\Seeder;

class HubSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $franchisee = User::where('email', 'franchise@pastilnililing.com')->first();

        if ($franchisee) {
            Hub::updateOrCreate(
                ['franchisee_id' => $franchisee->id],
                [
                    'name' => 'Manila Spoke Hub',
                    'address' => '123 Taft Ave, Manila',
                    'status' => 'active',
                ]
            );
        }
    }
}
