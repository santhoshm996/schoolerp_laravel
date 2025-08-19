<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guardian extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'name',
        'relationship',
        'phone',
        'email',
        'photo',
    ];

    /**
     * Get the student that owns this guardian record
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
