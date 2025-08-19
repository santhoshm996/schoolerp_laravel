<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default superadmin user
        $superadmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@school.com',
            'username' => 'superadmin',
            'password' => Hash::make('password123'),
            'phone' => '+1234567890',
            'status' => 'active',
        ]);

        // Assign superadmin role
        $superadmin->assignRole('superadmin');

        // Create default admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@school.com',
            'username' => 'admin',
            'password' => Hash::make('password123'),
            'phone' => '+1234567891',
            'status' => 'active',
        ]);

        // Assign admin role
        $admin->assignRole('admin');

        // Create sample teacher
        $teacher = User::create([
            'name' => 'John Teacher',
            'email' => 'teacher@school.com',
            'username' => 'teacher',
            'password' => Hash::make('password123'),
            'phone' => '+1234567892',
            'status' => 'active',
        ]);

        // Assign teacher role
        $teacher->assignRole('teacher');

        // Create sample accountant
        $accountant = User::create([
            'name' => 'Jane Accountant',
            'email' => 'accountant@school.com',
            'username' => 'accountant',
            'password' => Hash::make('password123'),
            'phone' => '+1234567893',
            'status' => 'active',
        ]);

        // Assign accountant role
        $accountant->assignRole('accountant');

        // Create sample student
        $student = User::create([
            'name' => 'Bob Student',
            'email' => 'student@school.com',
            'username' => 'student',
            'password' => Hash::make('password123'),
            'phone' => '+1234567894',
            'status' => 'active',
        ]);

        // Assign student role
        $student->assignRole('student');
    }
}
