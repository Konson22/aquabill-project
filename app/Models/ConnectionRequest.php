<?php

namespace App\Models;

use Database\Factories\ConnectionRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConnectionRequest extends Model
{
    /** @use HasFactory<ConnectionRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'request_number',
        'name',
        'phone',
        'email',
        'national_id',
        'address',
        'plot_no',
        'customer_type',
        'zone_id',
        'tariff_id',
        'status',
        'total_amount',
        'issued_date',
        'issued_by',
        'paid_at',
        'notes',
        'customer_id',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_date' => 'date',
            'paid_at' => 'datetime',
            'completed_at' => 'datetime',
            'total_amount' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ConnectionRequest $request): void {
            if (! empty($request->request_number)) {
                return;
            }

            $year = now()->format('Y');
            $prefix = "CONN-{$year}-";

            $maxSuffix = static::query()
                ->where('request_number', 'like', $prefix.'%')
                ->pluck('request_number')
                ->map(fn (string $number): int => (int) substr($number, strlen($prefix)))
                ->max() ?? 0;

            $request->request_number = $prefix.str_pad((string) ($maxSuffix + 1), 5, '0', STR_PAD_LEFT);
        });
    }

    /**
     * @return BelongsTo<Zone, ConnectionRequest>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @return BelongsTo<Tariff, ConnectionRequest>
     */
    public function tariff(): BelongsTo
    {
        return $this->belongsTo(Tariff::class);
    }

    /**
     * @return BelongsTo<User, ConnectionRequest>
     */
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * @return BelongsTo<Customer, ConnectionRequest>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return HasMany<ConnectionRequestItem, ConnectionRequest>
     */
    public function items(): HasMany
    {
        return $this->hasMany(ConnectionRequestItem::class)->orderBy('sort_order');
    }

    public function recalculateTotalAmount(): float
    {
        $total = $this->items()
            ->get()
            ->sum(fn (ConnectionRequestItem $item): float => $item->lineTotal());

        $this->update(['total_amount' => round($total, 2)]);

        return (float) $this->total_amount;
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }
}
