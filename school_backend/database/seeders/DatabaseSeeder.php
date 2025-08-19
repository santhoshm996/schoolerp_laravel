<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SessionSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            SectionClassSeeder::class,
            FeeSeeder::class,
            FeeDemoDataSeeder::class,
        ]);
    }
}
