<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    public function serviceCharges(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ServiceCharge::class);
    }
}
