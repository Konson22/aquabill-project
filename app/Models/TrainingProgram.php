<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingProgram extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'provider',
        'location',
        'start_date',
        'end_date',
        'cost',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'cost' => 'decimal:2',
        ];
    }

    /**
     * @return HasMany<TrainingParticipant, TrainingProgram>
     */
    public function participants(): HasMany
    {
        return $this->hasMany(TrainingParticipant::class);
    }

    /**
     * @return HasMany<TrainingDocument, TrainingProgram>
     */
    public function documents(): HasMany
    {
        return $this->hasMany(TrainingDocument::class);
    }

    /**
     * @return BelongsToMany<Staff, TrainingProgram>
     */
    public function staff(): BelongsToMany
    {
        return $this->belongsToMany(Staff::class, 'training_participants')
            ->withPivot(['id', 'status', 'score', 'certificate_path', 'remarks', 'created_at', 'updated_at'])
            ->withTimestamps();
    }
}
