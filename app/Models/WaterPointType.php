<?php

namespace App\Models;

use Database\Factories\WaterPointTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WaterPointType extends Model
{
    /** @use HasFactory<WaterPointTypeFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    /**
     * @return HasMany<WaterPoint, WaterPointType>
     */
    public function waterPoints(): HasMany
    {
        return $this->hasMany(WaterPoint::class);
    }
}
