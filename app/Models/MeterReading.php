<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeterReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'meter_id',
        'home_id',
        'reading_date',
        'current_reading',
        'previous_reading',
        'read_by',
        'status',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'reading_date' => 'date',
            'current_reading' => 'decimal:2',
            'previous_reading' => 'decimal:2',
        ];
    }

    public function home()
    {
        return $this->belongsTo(Home::class);
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

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}

