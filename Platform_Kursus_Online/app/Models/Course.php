<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'title',
        'description',
        'category',
        'level',
        'price',
        'duration_hours',
        'thumbnail',
        'is_published'
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    // 🔽 Tambahkan relasi ke modul
    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('sort_order');
    }
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }
    public function totalLessons()
    {
        return $this->modules()->withCount('lessons')->get()->sum('lessons_count');
    }
}
