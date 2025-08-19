<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * Get the classes for this section
     */
    public function classes()
    {
        return $this->hasMany(ClassRoom::class);
    }

    /**
     * Get the students in this section
     */
    public function students()
    {
        return $this->hasMany(\App\Models\Student::class);
    }
}
