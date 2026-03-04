<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, \Laravel\Sanctum\HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'password',
        'department_id',
        'role',
        'zone_id',
    ];

    /**
     * Get the name for password reset (Fortify/laravel uses "email" key but we use name).
     */
    public function getEmailForPasswordReset(): string
    {
        return $this->name;
    }

    /**
     * Get the department the user belongs to.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Department name for backward compatibility (e.g. 'admin', 'finance', 'meters').
     */
    public function getDepartmentAttribute(): ?string
    {
        return $this->getRelationValue('department')?->name;
    }

    /**
     * Get the zone the user is assigned to (null = can see all zones).
     */
    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
