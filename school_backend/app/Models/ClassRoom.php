<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassRoom extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = ['name', 'section_id'];

    /**
     * Get the section that owns this class
     */
    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}
