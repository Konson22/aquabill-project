<?php

namespace App\Models;

use Database\Factories\StationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Station extends Model
{
    /** @use HasFactory<StationFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'zone_id',
        'accountant_id',
        'manager_name',
        'manager_phone',
        'coordinate',
    ];

    /**
     * @return BelongsTo<Zone, Station>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @return BelongsTo<User, Station>
     */
    public function accountant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accountant_id');
    }

    /**
     * @return HasMany<Payment, Station>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
