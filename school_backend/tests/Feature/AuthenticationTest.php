<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Run seeders
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    public function test_user_can_login_with_email()
    {
        $user = User::where('username', 'superadmin')->first();

        $response = $this->postJson('/api/v1/login', [
            'email' => $user->email,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'token',
                        'user' => [
                            'id',
                            'name',
                            'email',
                            'username',
                            'phone',
                            'status',
                            'role',
                            'role_description'
                        ]
                    ]
                ]);

        $this->assertNotEmpty($response->json('data.token'));
        $this->assertEquals('superadmin', $response->json('data.user.role'));
    }

    public function test_user_can_login_with_username()
    {
        $user = User::where('username', 'admin')->first();

        $response = $this->postJson('/api/v1/login', [
            'username' => $user->username,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'token',
                        'user' => [
                            'id',
                            'name',
                            'email',
                            'username',
                            'phone',
                            'status',
                            'role',
                            'role_description'
                        ]
                    ]
                ]);

        $this->assertNotEmpty($response->json('data.token'));
        $this->assertEquals('admin', $response->json('data.user.role'));
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        $response = $this->postJson('/api/v1/login', [
            'email' => 'invalid@example.com',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ]);
    }

    public function test_user_cannot_login_with_inactive_account()
    {
        $user = User::where('username', 'superadmin')->first();
        $user->update(['status' => 'inactive']);

        $response = $this->postJson('/api/v1/login', [
            'email' => $user->email,
            'password' => 'password123'
        ]);

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'message' => 'Account is inactive'
                ]);
    }

    public function test_user_can_logout()
    {
        $user = User::where('username', 'superadmin')->first();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/logout');

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'User successfully logged out'
                ]);
    }

    public function test_user_can_get_profile()
    {
        $user = User::where('username', 'teacher')->first();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'id',
                        'name',
                        'email',
                        'username',
                        'phone',
                        'status',
                        'role',
                        'role_description',
                        'permissions'
                    ]
                ]);

        $this->assertEquals('teacher', $response->json('data.role'));
    }

    public function test_unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/v1/me');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_user_management()
    {
        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(401);
    }
}
