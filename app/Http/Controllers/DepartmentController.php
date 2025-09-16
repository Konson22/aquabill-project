<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::withCount('users')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('departments/index', [
            'departments' => $departments,
        ]);
    }

    public function create()
    {
        return Inertia::render('departments/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments',
        ]);

        Department::create([
            'name' => $request->name,
        ]);

        return redirect()->route('departments.index')
            ->with('success', 'Department created successfully.');
    }

    public function show(Department $department)
    {
        $department->load('users');

        return Inertia::render('departments/show', [
            'department' => $department,
        ]);
    }

    public function edit(Department $department)
    {
        return Inertia::render('departments/edit', [
            'department' => $department,
        ]);
    }

    public function update(Request $request, Department $department)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('departments')->ignore($department->id)],
        ]);

        $department->update([
            'name' => $request->name,
        ]);

        return redirect()->route('departments.index')
            ->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department)
    {
        // Check if department has users
        if ($department->users()->count() > 0) {
            return redirect()->route('departments.index')
                ->with('error', 'Cannot delete department with assigned staff members.');
        }

        $department->delete();

        return redirect()->route('departments.index')
            ->with('success', 'Department deleted successfully.');
    }
}
