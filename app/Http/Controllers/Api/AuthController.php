<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Mobile clients send the identifier in the "name" key; it is the user's email address.
     * The "email" key is also accepted for compatibility.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required_without:email|string|email',
            'email' => 'required_without:name|string|email',
            'password' => 'required',
        ]);

        $email = $validated['email'] ?? $validated['name'];

        Log::info('API login attempt', ['email' => $email]);

        if (! Auth::attempt(['email' => $email, 'password' => $validated['password']])) {
            Log::warning('API login failed: invalid credentials', ['email' => $email]);

            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'user' => [
                'name' => $user->name,
                'id' => $user->id,
                'department' => $user->department,
                'zone_id' => $user->zone_id,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out',
        ]);
    }
}
