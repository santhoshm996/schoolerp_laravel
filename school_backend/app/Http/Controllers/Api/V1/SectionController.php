<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class SectionController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        // Apply role middleware to destructive operations
        $this->middleware('role:superadmin,admin')->only(['store', 'update', 'destroy']);
    }

    /**
     * Display a listing of the sections
     */
    public function index(): JsonResponse
    {
        $sections = Section::orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $sections,
            'message' => 'Sections retrieved successfully'
        ]);
    }

    /**
     * Store a newly created section
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:sections,name']
        ]);

        $section = Section::create([
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true,
            'data' => $section,
            'message' => 'Section created successfully'
        ], 201);
    }

    /**
     * Update the specified section
     */
    public function update(Request $request, Section $section): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('sections')->ignore($section->id)]
        ]);

        $section->update([
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true,
            'data' => $section,
            'message' => 'Section updated successfully'
        ]);
    }

    /**
     * Remove the specified section
     */
    public function destroy(Section $section): JsonResponse
    {
        // Check if section has classes
        if ($section->classes()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete section. It has associated classes.'
            ], 422);
        }

        $section->delete();

        return response()->json([
            'success' => true,
            'message' => 'Section deleted successfully'
        ]);
    }
}
