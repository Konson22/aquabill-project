<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Exception;

class AuthController extends BaseController
{
    /**
     * Login user and create token
     */
    public function login(Request $request): JsonResponse
    {
        try {

            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $user = User::where('email', $request->email)->first();
            
            // Revoke existing tokens
            $user->tokens()->delete();
            
            // Create new token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'token' => $token,
            ], 200);

           

        } catch (Exception $e) {
            Log::error('API Login error', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login. Please try again.'
            ], 500);
        }
    }

    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        try {
            Log::info('API Registration attempt started', [
                'email' => $request->email,
                'name' => $request->name,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'sometimes|string|in:user,admin,manager',
            ]);

            if ($validator->fails()) {
                Log::warning('API Registration validation failed', [
                    'email' => $request->email,
                    'name' => $request->name,
                    'errors' => $validator->errors()->toArray(),
                    'ip' => $request->ip()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'user',
                'status' => 'active', // Set default status
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('API Registration successful', [
                'user_id' => $user->id,
                'email' => $request->email,
                'name' => $request->name,
                'role' => $user->role,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 201);

        } catch (Exception $e) {
            Log::error('API Registration error', [
                'email' => $request->email,
                'name' => $request->name,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during registration. Please try again.'
            ], 500);
        }
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            Log::info('API Profile request', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'email_verified_at' => $user->email_verified_at,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,
                    ]
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error('API Profile error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching profile. Please try again.'
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            Log::info('API Profile update attempt', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
                'current_password' => 'required_with:new_password|string',
                'new_password' => 'sometimes|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                Log::warning('API Profile update validation failed', [
                    'user_id' => $user->id,
                    'errors' => $validator->errors()->toArray(),
                    'ip' => $request->ip()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify current password if changing password
            if ($request->has('new_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    Log::warning('API Profile update failed - incorrect current password', [
                        'user_id' => $user->id,
                        'ip' => $request->ip()
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Current password is incorrect'
                    ], 400);
                }
            }

            // Update user data
            if ($request->has('name')) {
                $user->name = $request->name;
            }
            
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            
            if ($request->has('new_password')) {
                $user->password = Hash::make($request->new_password);
            }

            $user->save();

            Log::info('API Profile update successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'email_verified_at' => $user->email_verified_at,
                        'updated_at' => $user->updated_at,
                    ]
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error('API Profile update error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating profile. Please try again.'
            ], 500);
        }
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            Log::info('API Logout attempt', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            $request->user()->currentAccessToken()->delete();

            Log::info('API Logout successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ], 200);

        } catch (Exception $e) {
            Log::error('API Logout error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during logout. Please try again.'
            ], 500);
        }
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            Log::info('API Token refresh attempt', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);
            
            // Revoke current token
            $request->user()->currentAccessToken()->delete();
            
            // Create new token
            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('API Token refresh successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => [
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error('API Token refresh error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during token refresh. Please try again.'
            ], 500);
        }
    }

    /**
     * Check if user is authenticated
     */
    public function check(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            Log::info('API Authentication check', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User is authenticated',
                'data' => [
                    'authenticated' => true,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ]
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error('API Authentication check error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during authentication check. Please try again.'
            ], 500);
        }
    }
}
