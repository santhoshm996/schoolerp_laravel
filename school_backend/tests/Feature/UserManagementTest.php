<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Run seeders
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    public function test_superadmin_can_view_users()
    {
        $superadmin = User::where('username', 'superadmin')->first();
        Sanctum::actingAs($superadmin);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'email',
                            'username',
                            'phone',
                            'status',
                            'roles'
                        ]
                    ]
                ]);
    }

    public function test_superadmin_can_create_user()
    {
        $superadmin = User::where('username', 'superadmin')->first();
        Sanctum::actingAs($superadmin);

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => 'password123',
            'phone' => '+1234567890',
            'role' => 'teacher',
            'status' => 'active'
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'email',
                        'username',
                        'phone',
                        'status',
                        'roles'
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'username' => 'testuser'
        ]);
    }

    public function test_admin_can_create_user()
    {
        $admin = User::where('username', 'admin')->first();
        Sanctum::actingAs($admin);

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => 'password123',
            'phone' => '+1234567890',
            'role' => 'teacher',
            'status' => 'active'
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201);
    }

    public function test_teacher_cannot_create_user()
    {
        $teacher = User::where('username', 'teacher')->first();
        Sanctum::actingAs($teacher);

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => 'password123',
            'phone' => '+1234567890',
            'role' => 'student',
            'status' => 'active'
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(403);
    }

    public function test_superadmin_can_update_user()
    {
        $superadmin = User::where('username', 'superadmin')->first();
        Sanctum::actingAs($superadmin);

        $user = User::where('username', 'teacher')->first();

        $updateData = [
            'name' => 'Updated Teacher Name',
            'phone' => '+9876543210'
        ];

        $response = $this->putJson("/api/v1/users/{$user->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'User updated successfully'
                ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Teacher Name',
            'phone' => '+9876543210'
        ]);
    }

    public function test_superadmin_can_delete_user()
    {
        $superadmin = User::where('username', 'superadmin')->first();
        Sanctum::actingAs($superadmin);

        $user = User::where('username', 'student')->first();

        $response = $this->deleteJson("/api/v1/users/{$user->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id
        ]);
    }

    public function test_user_cannot_delete_themselves()
    {
        $superadmin = User::where('username', 'superadmin')->first();
        Sanctum::actingAs($superadmin);

        $response = $this->deleteJson("/api/v1/users/{$superadmin->id}");

        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'message' => 'Cannot delete your own account'
                ]);
    }
}
