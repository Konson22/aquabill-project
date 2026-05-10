<?php

namespace App\Models;

use Database\Factories\ValveFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Valve extends Model
{
    /** @use HasFactory<ValveFactory> */
    use HasFactory;

    protected $fillable = [
        'valve_code',
        'zone_id',
        'pipe_id',
        'valve_type',
        'latitude',
        'longitude',
        'status',
        'installation_date',
        'description',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'installation_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Pipe, Valve>
     */
    public function pipe(): BelongsTo
    {
        return $this->belongsTo(Pipe::class);
    }

    /**
     * @return BelongsTo<Zone, Valve>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @param  Builder<Valve>  $query
     * @return Builder<Valve>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || $term === '') {
            return $query;
        }

        return $query->where('valve_code', 'like', "%{$term}%");
    }
}
