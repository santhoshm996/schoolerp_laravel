<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'fee_type_id',
        'amount_paid',
        'payment_date',
        'payment_mode',
        'receipt_no',
        'session_id',
        'collected_by',
        'notes',
        'reference_no'
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'payment_date' => 'date',
    ];

    /**
     * Get the student that owns this transaction
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the fee type that owns this transaction
     */
    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    /**
     * Get the session that owns this transaction
     */
    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    /**
     * Get the user who collected this payment
     */
    public function collectedBy()
    {
        return $this->belongsTo(User::class, 'collected_by');
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
     * Scope to filter by payment mode
     */
    public function scopeByPaymentMode($query, $paymentMode)
    {
        return $query->where('payment_mode', $paymentMode);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
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
     * Get the formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return '₹' . number_format($this->amount_paid, 2);
    }

    /**
     * Get the formatted payment date
     */
    public function getFormattedPaymentDateAttribute()
    {
        return $this->payment_date->format('d M Y');
    }

    /**
     * Generate a unique receipt number
     */
    public static function generateReceiptNo()
    {
        $prefix = 'RCPT';
        $year = date('Y');
        $month = date('m');
        
        $lastReceipt = static::where('receipt_no', 'like', "{$prefix}{$year}{$month}%")
                             ->orderBy('receipt_no', 'desc')
                             ->first();
        
        if ($lastReceipt) {
            $lastNumber = intval(substr($lastReceipt->receipt_no, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $prefix . $year . $month . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
