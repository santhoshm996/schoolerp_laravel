<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'session_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the session that owns this fee group
     */
    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    /**
     * Get the fee types in this group
     */
    public function feeTypes()
    {
        return $this->hasMany(FeeType::class);
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
        $activeSession = Session::getActiveSession();
        return $activeSession ? $query->where('session_id', $activeSession->id) : $query;
    }

    /**
     * Scope to get only active fee groups
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
