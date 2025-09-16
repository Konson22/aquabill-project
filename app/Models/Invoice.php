<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'reason',
        'issue_date',
        'due_date',
        'amount_due',
        'status'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'amount_due' => 'decimal:2'
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function meter()
    {
        return $this->belongsTo(Meter::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
