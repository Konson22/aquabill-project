<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('department')->latest()->paginate(10);
        $users = $users->through(fn ($user) => array_merge($user->toArray(), [
            'department' => $user->getRelationValue('department')?->name,
        ]));
        $departments = Department::orderBy('name')->get(['id', 'name']);
        $zones = Zone::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/dashboard/users/index', [
            'users' => $users,
            'departments' => $departments,
            'zones' => $zones,
        ]);
    }

    public function show(User $user)
    {
        $user->load('department');

        return Inertia::render('admin/dashboard/users/show', [
            'user' => array_merge($user->toArray(), [
                'department' => $user->getRelationValue('department')?->name,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'department' => 'required|string|in:admin,finance,meters',
        ]);

        $department = Department::where('name', $request->department)->firstOrFail();

        User::create([
            'name' => $request->name,
            'password' => Hash::make($request->password),
            'department_id' => $department->id,
            'role' => 'staff',
        ]);

        return redirect()->back();
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:users,name,'.$user->id,
            'department' => 'required|string|in:admin,finance,meters',
            'zone_id' => ['nullable', Rule::when(
                $request->filled('zone_id') && $request->zone_id !== '__all__',
                'exists:zones,id'
            )],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $department = Department::where('name', $request->department)->firstOrFail();

        $zoneId = $request->input('zone_id');
        if ($zoneId === '' || $zoneId === '__all__' || ! $request->filled('zone_id')) {
            $zoneId = null;
        }

        $user->update([
            'name' => $request->name,
            'department_id' => $department->id,
            'zone_id' => $zoneId,
        ]);

        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return redirect()->back();
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->back();
    }
}
