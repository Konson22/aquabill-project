<?php

namespace App\Models;

use Database\Factories\PipeFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pipe extends Model
{
    /** @use HasFactory<PipeFactory> */
    use HasFactory;

    protected $fillable = [
        'pipe_code',
        'zone_id',
        'pipe_type',
        'material',
        'diameter',
        'length',
        'coordinates',
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
            'coordinates' => 'array',
            'diameter' => 'float',
            'length' => 'float',
            'installation_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Zone, Pipe>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @return HasMany<Valve, Pipe>
     */
    public function valves(): HasMany
    {
        return $this->hasMany(Valve::class);
    }

    /**
     * @param  Builder<Pipe>  $query
     * @return Builder<Pipe>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || $term === '') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term): void {
            $q->where('pipe_code', 'like', "%{$term}%")
                ->orWhere('material', 'like', "%{$term}%");
        });
    }
}
