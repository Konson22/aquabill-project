<?php

namespace App\Models;

use Database\Factories\WaterPointFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WaterPoint extends Model
{
    /** @use HasFactory<WaterPointFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'meter_no',
        'name',
        'water_point_type_id',
        'zone_id',
        'latitude',
        'longitude',
        'manager_name',
        'manager_phone',
        'status',
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
        ];
    }

    /**
     * @return BelongsTo<WaterPointType, WaterPoint>
     */
    public function waterPointType(): BelongsTo
    {
        return $this->belongsTo(WaterPointType::class);
    }

    /**
     * @return BelongsTo<Zone, WaterPoint>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @return HasMany<WaterPointReading, WaterPoint>
     */
    public function readings(): HasMany
    {
        return $this->hasMany(WaterPointReading::class);
    }

    /**
     * @param  Builder<WaterPoint>  $query
     * @return Builder<WaterPoint>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || $term === '') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term): void {
            $q->where('code', 'like', "%{$term}%")
                ->orWhere('meter_no', 'like', "%{$term}%")
                ->orWhere('name', 'like', "%{$term}%")
                ->orWhere('manager_phone', 'like', "%{$term}%");
        });
    }
}
