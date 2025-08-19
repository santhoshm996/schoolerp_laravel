<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class StudentFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'fee_type_id',
        'amount_due',
        'amount_paid',
        'status',
        'session_id',
        'due_date',
        'notes'
    ];

    protected $casts = [
        'amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'due_date' => 'date',
    ];

    /**
     * Get the student that owns this fee record
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the fee type that owns this fee record
     */
    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    /**
     * Get the session that owns this fee record
     */
    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    /**
     * Get the fee transactions for this student fee
     */
    public function feeTransactions()
    {
        return $this->hasMany(FeeTransaction::class, 'fee_type_id', 'fee_type_id')
                    ->where('student_id', $this->student_id)
                    ->where('session_id', $this->session_id);
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
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope to filter by class
     */
    public function scopeByClass($query, $classId)
    {
        return $query->whereHas('student', function ($q) use ($classId) {
            $q->where('class_id', $classId);
        });
    }

    /**
     * Scope to filter by section
     */
    public function scopeBySection($query, $sectionId)
    {
        return $query->whereHas('student', function ($q) use ($sectionId) {
            $q->where('section_id', $sectionId);
        });
    }

    /**
     * Get the remaining amount to be paid
     */
    public function getRemainingAmountAttribute()
    {
        return $this->amount_due - $this->amount_paid;
    }

    /**
     * Get the payment percentage
     */
    public function getPaymentPercentageAttribute()
    {
        if ($this->amount_due == 0) return 0;
        return round(($this->amount_paid / $this->amount_due) * 100, 2);
    }

    /**
     * Check if fee is overdue
     */
    public function getIsOverdueAttribute()
    {
        if (!$this->due_date) return false;
        return $this->due_date < Carbon::today() && $this->status !== 'paid';
    }

    /**
     * Update status based on payment amount
     */
    public function updateStatus()
    {
        if ($this->amount_paid >= $this->amount_due) {
            $this->status = 'paid';
        } elseif ($this->amount_paid > 0) {
            $this->status = 'partial';
        } else {
            $this->status = $this->is_overdue ? 'overdue' : 'pending';
        }
        
        $this->save();
    }

    /**
     * Get the fee master entry for this student fee
     */
    public function feeMaster()
    {
        return $this->belongsTo(FeeMaster::class, 'fee_type_id', 'fee_type_id')
                    ->where('class_id', $this->student->class_id)
                    ->where('session_id', $this->session_id);
    }
}
