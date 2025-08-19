<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeMaster extends Model
{
    use HasFactory;

    protected $table = 'fee_master';

    protected $fillable = [
        'fee_group_id',
        'fee_type_id',
        'class_id',
        'amount',
        'session_id'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the fee group that owns this fee master entry
     */
    public function feeGroup()
    {
        return $this->belongsTo(FeeGroup::class);
    }

    /**
     * Get the fee type that owns this fee master entry
     */
    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    /**
     * Get the class that owns this fee master entry
     */
    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    /**
     * Get the session that owns this fee master entry
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
        $activeSession = Session::getActiveSession();
        return $activeSession ? $query->where('session_id', $activeSession->id) : $query;
    }

    /**
     * Scope to filter by class
     */
    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope to filter by fee group
     */
    public function scopeByFeeGroup($query, $feeGroupId)
    {
        return $query->where('fee_group_id', $feeGroupId);
    }

    /**
     * Scope to filter by fee type
     */
    public function scopeByFeeType($query, $feeTypeId)
    {
        return $query->where('fee_type_id', $feeTypeId);
    }

    /**
     * Get the formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return '₹' . number_format($this->amount, 2);
    }

    /**
     * Check if this fee master entry can be deleted
     */
    public function canBeDeleted()
    {
        // Check if any students have fees assigned based on this master
        return !StudentFee::where('fee_type_id', $this->fee_type_id)
            ->where('session_id', $this->session_id)
            ->whereHas('student', function ($query) {
                $query->where('class_id', $this->class_id);
            })
            ->exists();
    }
}
