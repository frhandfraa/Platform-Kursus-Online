<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'progress_percent',
        'completed_at',
        'status',
    ];

    protected $casts = [
        'progress_percent' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function certificate()
    {
        return $this->hasOne(Certificate::class);
    }
    public function completedLessons()
    {
        return $this->belongsToMany(Lesson::class, 'enrollment_lesson')
            ->withPivot('is_completed')
            ->withTimestamps();
    }
}
