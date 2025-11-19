<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::withCount('customers')
            ->with(['customers' => function($query) {
                $query->where('is_active', true);
            }])
            ->get()
            ->map(function($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'tariff' => $category->tariff,
                    'fixed_charge' => $category->fixed_charge,
                    'customers_count' => $category->customers_count,
                    'active_customers_count' => $category->customers->count(),
                    'created_at' => $category->created_at,
                    'updated_at' => $category->updated_at,
                ];
            });

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'type_id' => 'required|string|max:255|unique:categories,type_id',
            'tariff' => 'required|numeric|min:0',
            'fixed_charge' => 'nullable|numeric|min:0',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'type_id' => $request->type_id,
            'tariff' => $request->tariff,
            'fixed_charge' => $request->fixed_charge ?? 0,
        ]);

        return redirect()->route('categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $category = Category::with([
            'customers' => function ($query) {
                $query->with(['location', 'meter']);
            },
            'tariffHistories' => function ($query) {
                $query->with('changedBy')
                    ->orderByDesc('effective_from')
                    ->orderByDesc('created_at');
            },
        ])->findOrFail($id);

        return Inertia::render('categories/show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $category = Category::findOrFail($id);
        
        return Inertia::render('categories/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:categories,name,' . $id,
                'tariff' => 'required|numeric|min:0',
                'fixed_charge' => 'nullable|numeric|min:0',
            ]);

            $category = Category::findOrFail($id);
            $category->update([
                'name' => $request->name,
                'tariff' => $request->tariff,
                'fixed_charge' => $request->fixed_charge ?? 0,
            ]);

            return redirect()->route('categories.index')
                ->with('success', 'Category updated successfully.');
        } catch (\Throwable $th) {
            return back()->withErrors(['error' => 'Failed to update category.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);
            
            // Check if category has active customers
            if ($category->hasActiveCustomers()) {
                return back()->withErrors(['error' => 'Cannot delete category with active customers.']);
            }
            
            // Permanently delete the category from database
            $category->forceDelete();
            return redirect()->route('categories.index')
                ->with('success', 'Category permanently deleted successfully.');
        } catch (\Throwable $th) {
            return back()->withErrors(['error' => 'Failed to delete category.']);
        }
    }
}