<?php

namespace App\Models;

use Database\Factories\ConnectionRequestItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConnectionRequestItem extends Model
{
    /** @use HasFactory<ConnectionRequestItemFactory> */
    use HasFactory;

    protected $fillable = [
        'connection_request_id',
        'service_charge_type_id',
        'description',
        'amount',
        'quantity',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'quantity' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<ConnectionRequest, ConnectionRequestItem>
     */
    public function connectionRequest(): BelongsTo
    {
        return $this->belongsTo(ConnectionRequest::class);
    }

    /**
     * @return BelongsTo<ServiceChargeType, ConnectionRequestItem>
     */
    public function serviceChargeType(): BelongsTo
    {
        return $this->belongsTo(ServiceChargeType::class);
    }

    public function lineTotal(): float
    {
        return round((float) $this->amount * (int) $this->quantity, 2);
    }
}
