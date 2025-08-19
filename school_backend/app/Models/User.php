<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The guard name for the model.
     *
     * @var string
     */
    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'phone',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the user's primary role
     */
    public function getPrimaryRoleAttribute()
    {
        return $this->roles->first();
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($role)
    {
        return $this->roles->contains('name', $role);
    }

    /**
     * Check if user is superadmin
     */
    public function isSuperAdmin()
    {
        return $this->hasRole('superadmin');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->hasRole('admin') || $this->isSuperAdmin();
    }

    /**
     * Check if user can manage users
     */
    public function canManageUsers()
    {
        return $this->isAdmin();
    }

    /**
     * Get the student record associated with this user
     */
    public function student()
    {
        return $this->hasOne(\App\Models\Student::class);
    }
}
