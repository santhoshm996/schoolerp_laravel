<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Session extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'status'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the active session
     */
    public static function getActiveSession()
    {
        return static::where('status', 'active')->first();
    }

    /**
     * Check if session is currently active
     */
    public function isActive()
    {
        $now = Carbon::now();
        return $this->status === 'active' && 
               $now->gte($this->start_date) && 
               $now->lte($this->end_date);
    }

    /**
     * Get all students in this session
     */
    public function students()
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get all classes in this session
     */
    public function classes()
    {
        return $this->hasMany(ClassRoom::class);
    }

    /**
     * Get all sections in this session
     */
    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    /**
     * Scope to get only active sessions
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get sessions by date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($subQ) use ($startDate, $endDate) {
                  $subQ->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
              });
        });
    }
}
