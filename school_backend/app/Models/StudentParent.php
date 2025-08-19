<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentParent extends Model
{
    use HasFactory;

    protected $table = 'parents';

    protected $fillable = [
        'student_id',
        'father_name',
        'father_phone',
        'father_email',
        'father_photo',
        'mother_name',
        'mother_phone',
        'mother_email',
        'mother_photo',
    ];

    /**
     * Get the student that owns this parent record
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
