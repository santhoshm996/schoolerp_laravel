<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Session;
use Carbon\Carbon;

class SessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default sessions
        $sessions = [
            [
                'name' => '2024-2025',
                'start_date' => '2024-06-01',
                'end_date' => '2025-05-31',
                'status' => 'inactive',
            ],
            [
                'name' => '2025-2026',
                'start_date' => '2025-06-01',
                'end_date' => '2026-05-31',
                'status' => 'active',
            ],
            [
                'name' => '2026-2027',
                'start_date' => '2026-06-01',
                'end_date' => '2027-05-31',
                'status' => 'inactive',
            ],
        ];

        foreach ($sessions as $sessionData) {
            Session::create($sessionData);
        }

        $this->command->info('Sessions seeded successfully!');
    }
}
