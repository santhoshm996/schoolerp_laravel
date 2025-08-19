<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'amount',
        'fee_group_id',
        'session_id',
        'frequency',
        'due_date',
        'is_active'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the fee group that owns this fee type
     */
    public function feeGroup()
    {
        return $this->belongsTo(FeeGroup::class);
    }

    /**
     * Get the session that owns this fee type
     */
    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    /**
     * Get the student fees for this fee type
     */
    public function studentFees()
    {
        return $this->hasMany(StudentFee::class);
    }

    /**
     * Get the fee transactions for this fee type
     */
    public function feeTransactions()
    {
        return $this->hasMany(FeeTransaction::class);
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
     * Scope to get only active fee types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return '₹' . number_format($this->amount, 2);
    }
}
