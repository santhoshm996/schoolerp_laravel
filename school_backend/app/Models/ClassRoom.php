<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassRoom extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = ['name', 'section_id', 'session_id'];

    /**
     * Get the section that owns this class
     */
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the students in this class
     */
    public function students()
    {
        return $this->hasMany(\App\Models\Student::class, 'class_id');
    }

    /**
     * Get the session that owns this class
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
