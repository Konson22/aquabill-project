<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StaffDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'staff_id',
        'document_type_id',
        'file_path',
        'document_number',
        'issued_at',
        'expires_at',
        'notes',
    ];

    /**
     * @return BelongsTo<Staff, StaffDocument>
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * @return BelongsTo<DocumentType, StaffDocument>
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'expires_at' => 'date',
        ];
    }
}
