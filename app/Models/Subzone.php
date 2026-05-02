<?php

namespace App\Models;

use Database\Factories\SubzoneFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subzone extends Model
{
    /** @use HasFactory<SubzoneFactory> */
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'name',
        'description',
        'status',
    ];

    /**
     * @return BelongsTo<Zone, Subzone>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }
}
