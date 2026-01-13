<?php

namespace App\Http\Responses;

trait RedirectsBasedOnDepartment
{
    /**
     * Get the redirect path based on user's role and department.
     *
     * @param  \App\Models\User|null  $user
     * @return string
     */
    protected function getRedirectPath($user): string
    {
        // Always redirect to /dashboard, which handles department-based routing
        return '/dashboard';
    }
}

