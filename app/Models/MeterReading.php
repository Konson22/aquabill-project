<?php

namespace App\Models;

use Database\Factories\MeterReadingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MeterReading extends Model
{
    /** @use HasFactory<MeterReadingFactory> */
    use HasFactory;

    protected $fillable = [
        'meter_id',
        'reading_date',
        'previous_reading',
        'current_reading',
        'consumption',
        'image',
        'recorded_by',
        'notes',
        'is_initial',
    ];

    protected $appends = ['image_url'];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reading_date' => 'date',
            'previous_reading' => 'decimal:2',
            'current_reading' => 'decimal:2',
            'consumption' => 'decimal:2',
            'is_initial' => 'boolean',
        ];
    }

    /**
     * Get the full URL for the reading image.
     */
    protected function imageUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->image ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->image) : null,
        );
    }

    protected static function booted(): void
    {
        static::creating(function (MeterReading $reading) {
            // Fetch previous reading if not provided or explicitly null
            if ($reading->previous_reading === null) {
                $lastReading = static::where('meter_id', $reading->meter_id)
                    ->orderBy('reading_date', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();

                $reading->previous_reading = $lastReading ? $lastReading->current_reading : 0;
            }

            // Calculate consumption
            $reading->consumption = $reading->current_reading - $reading->previous_reading;

            // Prevent negative consumption
            if ($reading->consumption < 0) {
                throw new \InvalidArgumentException("Current reading ({$reading->current_reading}) cannot be less than previous reading ({$reading->previous_reading}).");
            }
        });
    }

    /**
     * Get the meter that the reading belongs to.
     *
     * @return BelongsTo<Meter, MeterReading>
     */
    public function meter(): BelongsTo
    {
        return $this->belongsTo(Meter::class);
    }

    /**
     * Get the user who recorded the reading.
     *
     * @return BelongsTo<User, MeterReading>
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Get the bill associated with the reading.
     *
     * @return HasOne<Bill, MeterReading>
     */
    public function bill(): HasOne
    {
        return $this->hasOne(Bill::class, 'reading_id');
    }
}
