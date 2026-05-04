<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceChargeType extends Model
{
    protected $fillable = [
        'name',
        'code',
        'amount',
        'description',
    ];

    /**
     * Get the service charges associated with this type.
     */
    public function serviceCharges(): HasMany
    {
        return $this->hasMany(ServiceCharge::class);
    }
}
