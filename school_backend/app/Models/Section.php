<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'session_id'];

    /**
     * Get the classes for this section
     */
    public function classes()
    {
        return $this->hasMany(ClassRoom::class);
    }

    /**
     * Get the students in this section
     */
    public function students()
    {
        return $this->hasMany(\App\Models\Student::class);
    }

    /**
     * Get the session that owns this section
     */
    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    /**
     * Scope to filter by session
     */
    public function scopeInSession($query, $sessionId = null)
    {
        if ($sessionId) {
            return $query->where('session_id', $sessionId);
        }
        
        // Default to active session if none specified
        $activeSession = \App\Models\Session::getActiveSession();
        return $activeSession ? $query->where('session_id', $activeSession->id) : $query;
    }
}
