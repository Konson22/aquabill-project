<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingParticipant extends Model
{
    protected $table = 'training_participants';

    protected $fillable = [
        'training_program_id',
        'staff_id',
        'status',
        'score',
        'certificate_path',
        'remarks',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<TrainingProgram, TrainingParticipant>
     */
    public function trainingProgram(): BelongsTo
    {
        return $this->belongsTo(TrainingProgram::class);
    }

    /**
     * @return BelongsTo<Staff, TrainingParticipant>
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }
}
