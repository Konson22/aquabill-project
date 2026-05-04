<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $users = User::query()
            ->with([
                'department:id,name',
                'roles:id,name',
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at,
                'department' => $user->department ? [
                    'id' => $user->department->id,
                    'name' => $user->department->name,
                ] : null,
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ])->values(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'departments' => Department::select('id', 'name')->get(),
            'roles' => Role::select('id', 'name')->get(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Password::defaults()],
            'department_id' => ['nullable', 'exists:departments,id'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'department_id' => $validated['department_id'] ?? null,
            'status' => 'active',
        ]);

        if (! empty($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return back()->with('success', 'User created successfully.');
    }

    public function show(User $user): Response
    {
        $user->load([
            'department:id,name',
            'roles:id,name',
        ]);

        $user->loadCount([
            'recordedReadings',
        ]);

        return Inertia::render('admin/users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at,
                'department' => $user->department ? [
                    'id' => $user->department->id,
                    'name' => $user->department->name,
                ] : null,
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ])->values(),
                'performance' => [
                    'readings_count' => $user->recorded_readings_count,
                ],
            ],
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load(['roles:id']);

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'department_id' => $user->department_id,
                'roles' => $user->roles->pluck('id')->map(fn ($id) => (string) $id),
            ],
            'departments' => Department::select('id', 'name')->get(),
            'roles' => Role::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'department_id' => ['nullable', 'exists:departments,id'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'department_id' => $validated['department_id'] ?? null,
        ]);

        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}
