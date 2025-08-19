<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_no',
        'name',
        'email',
        'phone',
        'dob',
        'gender',
        'address',
        'photo',
        'class_id',
        'section_id',
        'user_id',
        'session_id',
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    /**
     * Get the user that owns this student
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the class that owns this student
     */
    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    /**
     * Get the section that owns this student
     */
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the full class name (class + section)
     */
    public function getFullClassNameAttribute()
    {
        if ($this->classRoom && $this->section) {
            return $this->classRoom->name . ' - ' . $this->section->name;
        }
        return 'N/A';
    }

    /**
     * Get the parent record for this student
     */
    public function parent()
    {
        return $this->hasOne(StudentParent::class);
    }

    /**
     * Get the guardian record for this student
     */
    public function guardian()
    {
        return $this->hasOne(Guardian::class);
    }

    /**
     * Get the session that owns this student
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
