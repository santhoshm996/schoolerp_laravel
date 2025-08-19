<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',
            
            // School management (for future use)
            'view schools',
            'create schools',
            'edit schools',
            'delete schools',
            
            // Class management (for future use)
            'view classes',
            'create classes',
            'edit classes',
            'delete classes',
            
            // Teacher management (for future use)
            'view teachers',
            'create teachers',
            'edit teachers',
            'delete teachers',
            
            // Student management (for future use)
            'view students',
            'create students',
            'edit students',
            'delete students',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $superadminRole = Role::create([
            'name' => 'superadmin',
            'description' => 'Super Administrator with full access to all features'
        ]);

        $adminRole = Role::create([
            'name' => 'admin',
            'description' => 'Administrator with access to most features'
        ]);

        $teacherRole = Role::create([
            'name' => 'teacher',
            'description' => 'Teacher with access to class and student management'
        ]);

        $accountantRole = Role::create([
            'name' => 'accountant',
            'description' => 'Accountant with access to financial features'
        ]);

        $studentRole = Role::create([
            'name' => 'student',
            'description' => 'Student with limited access to their own information'
        ]);

        // Assign permissions to roles
        $superadminRole->givePermissionTo(Permission::all());

        $adminRole->givePermissionTo([
            'view users', 'create users', 'edit users', 'delete users',
            'view schools', 'create schools', 'edit schools', 'delete schools',
            'view classes', 'create classes', 'edit classes', 'delete classes',
            'view teachers', 'create teachers', 'edit teachers', 'delete teachers',
            'view students', 'create students', 'edit students', 'delete students',
        ]);

        $teacherRole->givePermissionTo([
            'view classes', 'view students',
            'view teachers',
        ]);

        $accountantRole->givePermissionTo([
            'view students',
        ]);

        $studentRole->givePermissionTo([
            'view students',
        ]);
    }
}
