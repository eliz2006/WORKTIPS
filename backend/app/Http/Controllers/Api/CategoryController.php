<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query()->orderBy('name');

        if ($request->filled('scope')) {
            $query->where('scope', $request->string('scope'));
        }

        return $query->get();
    }

    public function store(StoreCategoryRequest $request)
    {
        return response()->json(Category::create($request->validated()), 201);
    }

    public function update(StoreCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return $category;
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Category removed.']);
    }
}
