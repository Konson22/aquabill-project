<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingDocument extends Model
{
    protected $fillable = [
        'training_program_id',
        'title',
        'file_path',
    ];

    /**
     * @return BelongsTo<TrainingProgram, TrainingDocument>
     */
    public function trainingProgram(): BelongsTo
    {
        return $this->belongsTo(TrainingProgram::class);
    }
}
