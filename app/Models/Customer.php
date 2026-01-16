<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
    ];

    public function homes()
    {
        return $this->hasMany(Home::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
