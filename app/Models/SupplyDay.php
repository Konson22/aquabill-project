<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplyDay extends Model
{
    protected $fillable = [
        'name',
        'sort_order',
        'status',
    ];

    /**
     * @return HasMany<Zone, SupplyDay>
     */
    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
    }
}
