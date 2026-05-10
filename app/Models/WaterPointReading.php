<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class WaterPointReading extends Model
{
    protected $fillable = [
        'water_point_id',
        'meter_no',
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
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image ? Storage::disk('public')->url($this->image) : null,
        );
    }

    protected static function booted(): void
    {
        static::creating(function (WaterPointReading $reading): void {
            if ($reading->meter_no === null) {
                $reading->meter_no = WaterPoint::query()->whereKey($reading->water_point_id)->value('meter_no');
            }

            if ($reading->previous_reading === null) {
                $lastReading = static::query()
                    ->where('water_point_id', $reading->water_point_id)
                    ->orderByDesc('reading_date')
                    ->orderByDesc('id')
                    ->first();

                $reading->previous_reading = $lastReading ? $lastReading->current_reading : 0;
            }

            $reading->consumption = $reading->current_reading - $reading->previous_reading;

            if ($reading->consumption < 0) {
                throw new \InvalidArgumentException("Current reading ({$reading->current_reading}) cannot be less than previous reading ({$reading->previous_reading}).");
            }
        });

        static::updating(function (WaterPointReading $reading): void {
            if ($reading->isDirty(['previous_reading', 'current_reading'])) {
                $reading->consumption = (float) $reading->current_reading - (float) $reading->previous_reading;
            }
        });
    }

    /**
     * @return BelongsTo<WaterPoint, WaterPointReading>
     */
    public function waterPoint(): BelongsTo
    {
        return $this->belongsTo(WaterPoint::class);
    }

    /**
     * @return BelongsTo<User, WaterPointReading>
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
