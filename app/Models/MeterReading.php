<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeterReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'meter_id',
        'customer_id',
        'reading_date',
        'current_reading',
        'previous_reading',
        'read_by',
        'status',
        'is_initial',
        'image',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'reading_date' => 'date',
            'current_reading' => 'decimal:2',
            'previous_reading' => 'decimal:2',
            'consumption' => 'decimal:2',
            'is_initial' => 'boolean',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function meter()
    {
        return $this->belongsTo(Meter::class);
    }

    public function reader()
    {
        return $this->belongsTo(User::class, 'read_by');
    }

    public function bill()
    {
        return $this->hasOne(\App\Models\Bill::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (MeterReading $reading) {
            $bill = $reading->bill;
            if ($bill) {
                $bill->payments()->delete();
            }
        });
    }

    protected $appends = ['image_url', 'home'];

    /** For frontend: home.customer mirrors this reading's customer (API convention). */
    public function getHomeAttribute(): ?object
    {
        return $this->relationLoaded('customer') && $this->customer
            ? (object) ['customer' => $this->customer]
            : null;
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}

