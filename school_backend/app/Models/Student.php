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
    public function class()
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
        if ($this->class && $this->section) {
            return $this->class->name . ' - ' . $this->section->name;
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
}
