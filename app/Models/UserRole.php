<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    protected $fillable = [
        'user_id',
        'role_id',
        'department_id',
    ];

    /**
     * Get the user that owns the role assignment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the role that is assigned.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the department for this role assignment.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
