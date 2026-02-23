<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    public function areas()
    {
        return $this->hasMany(Area::class);
    }

    public function homes()
    {
        return $this->hasMany(Customer::class);
    }
}
