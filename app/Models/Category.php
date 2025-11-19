<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type_id',
        'tariff',
        'fixed_charge',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tariff' => 'decimal:2',
        'fixed_charge' => 'decimal:2',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    /**
     * Get the customers that belong to this category.
     */
    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * Get the tariffs that belong to this category.
     */
    public function tariffs()
    {
        return $this->hasMany(Tariff::class);
    }

    /**
     * History of tariff changes for this category.
     */
    public function tariffHistories()
    {
        return $this->hasMany(TariffHistory::class);
    }

    /**
     * Check if the category has any active customers.
     */
    public function hasActiveCustomers()
    {
        return $this->customers()->where('is_active', true)->exists();
    }
}
