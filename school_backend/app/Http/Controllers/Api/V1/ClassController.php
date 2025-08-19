<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ClassRoom;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ClassController extends Controller
{
    /**
     * Display a listing of the classes
     */
    public function index(): JsonResponse
    {
        $classes = ClassRoom::with('section')->orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $classes,
            'message' => 'Classes retrieved successfully'
        ]);
    }

    /**
     * Store a newly created class
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'section_id' => ['required', 'exists:sections,id']
        ]);

        // Check if class name already exists in the same section
        $existingClass = ClassRoom::where('name', $request->name)
            ->where('section_id', $request->section_id)
            ->first();

        if ($existingClass) {
            return response()->json([
                'success' => false,
                'message' => 'A class with this name already exists in the selected section.'
            ], 422);
        }

        $class = ClassRoom::create([
            'name' => $request->name,
            'section_id' => $request->section_id
        ]);

        // Load the section relationship
        $class->load('section');

        return response()->json([
            'success' => true,
            'data' => $class,
            'message' => 'Class created successfully'
        ], 201);
    }

    /**
     * Update the specified class
     */
    public function update(Request $request, ClassRoom $class): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'section_id' => ['required', 'exists:sections,id']
        ]);

        // Check if class name already exists in the same section (excluding current class)
        $existingClass = ClassRoom::where('name', $request->name)
            ->where('section_id', $request->section_id)
            ->where('id', '!=', $class->id)
            ->first();

        if ($existingClass) {
            return response()->json([
                'success' => false,
                'message' => 'A class with this name already exists in the selected section.'
            ], 422);
        }

        $class->update([
            'name' => $request->name,
            'section_id' => $request->section_id
        ]);

        // Load the section relationship
        $class->load('section');

        return response()->json([
            'success' => true,
            'data' => $class,
            'message' => 'Class updated successfully'
        ]);
    }

    /**
     * Remove the specified class
     */
    public function destroy(ClassRoom $class): JsonResponse
    {
        $class->delete();

        return response()->json([
            'success' => true,
            'message' => 'Class deleted successfully'
        ]);
    }
}
