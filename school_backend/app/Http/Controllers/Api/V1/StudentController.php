<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use App\Models\ClassRoom;
use App\Models\Section;
use App\Models\StudentParent;
use App\Models\Guardian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        // Apply role middleware to destructive operations
        $this->middleware('role:superadmin,admin')->only(['store', 'update', 'destroy', 'bulkImport']);
    }

    /**
     * Display a listing of students
     */
    public function index(Request $request)
    {
        try {
            $query = Student::with(['classRoom', 'section', 'user'])
                ->inSession($request->session_id)
                ->orderBy('created_at', 'desc');

            // Filter by class
            if ($request->has('class_id') && $request->class_id) {
                $query->where('class_id', $request->class_id);
            }

            // Filter by section
            if ($request->has('section_id') && $request->section_id) {
                $query->where('section_id', $request->section_id);
            }

            // Search by name or admission number
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('admission_no', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $students = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $students->items(),
                'pagination' => [
                    'current_page' => $students->currentPage(),
                    'last_page' => $students->lastPage(),
                    'per_page' => $students->perPage(),
                    'total' => $students->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch students',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created student
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'admission_no' => 'required|string|max:50|unique:students,admission_no|regex:/^[A-Z0-9\-]+$/',
                'name' => 'required|string|max:255|min:2|regex:/^[a-zA-Z\s\.\-\']+$/',
                'email' => 'required|email|max:255|unique:students,email|unique:users,email',
                'phone' => 'nullable|string|max:20|regex:/^[\+]?[1-9][\d]{0,15}$/',
                'dob' => 'nullable|date|before:today|after:1900-01-01',
                'gender' => 'nullable|in:male,female,other',
                'address' => 'nullable|string|max:500',
                'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                'class_id' => 'required|exists:classes,id',
                'section_id' => 'required|exists:sections,id',
                
                // Parent fields
                'father_name' => 'nullable|string|max:255|min:2|regex:/^[a-zA-Z\s\.\-\']+$/',
                'father_phone' => 'nullable|string|max:20|regex:/^[\+]?[1-9][\d]{0,15}$/',
                'father_email' => 'nullable|email|max:255|unique:users,email',
                'father_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                'mother_name' => 'nullable|string|max:255|min:2|regex:/^[a-zA-Z\s\.\-\']+$/',
                'mother_phone' => 'nullable|string|max:20|regex:/^[\+]?[1-9][\d]{0,15}$/',
                'mother_email' => 'nullable|email|max:255|unique:users,email',
                'mother_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                
                // Guardian fields
                'guardian_name' => 'nullable|string|max:255|min:2|regex:/^[a-zA-Z\s\.\-\']+$/',
                'guardian_relationship' => 'nullable|string|max:100|regex:/^[a-zA-Z\s\.\-\']+$/',
                'guardian_phone' => 'nullable|string|max:20|regex:/^[\+]?[1-9][\d]{0,15}$/',
                'guardian_email' => 'nullable|email|max:255|unique:users,email',
                'guardian_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ], [
                'admission_no.regex' => 'Admission number can only contain uppercase letters, numbers, hyphens, and underscores.',
                'name.regex' => 'Name can only contain letters, spaces, dots, hyphens, and apostrophes.',
                'phone.regex' => 'Please enter a valid phone number.',
                'dob.before' => 'Date of birth must be in the past.',
                'dob.after' => 'Date of birth must be after 1900.',
                'father_name.regex' => 'Father\'s name can only contain letters, spaces, dots, hyphens, and apostrophes.',
                'father_phone.regex' => 'Please enter a valid phone number for father.',
                'mother_name.regex' => 'Mother\'s name can only contain letters, spaces, dots, hyphens, and apostrophes.',
                'mother_phone.regex' => 'Please enter a valid phone number for mother.',
                'guardian_name.regex' => 'Guardian\'s name can only contain letters, spaces, dots, hyphens, and apostrophes.',
                'guardian_relationship.regex' => 'Relationship can only contain letters, spaces, dots, hyphens, and apostrophes.',
                'guardian_phone.regex' => 'Please enter a valid phone number for guardian.',
                'photo.max' => 'Student photo must be less than 2MB.',
                'father_photo.max' => 'Father\'s photo must be less than 2MB.',
                'mother_photo.max' => 'Mother\'s photo must be less than 2MB.',
                'guardian_photo.max' => 'Guardian\'s photo must be less than 2MB.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Additional business logic validation
            if ($request->dob) {
                $dob = \Carbon\Carbon::parse($request->dob);
                $age = $dob->age;
                
                if ($age < 3 || $age > 25) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Student age must be between 3 and 25 years',
                        'errors' => ['dob' => ['Student age must be between 3 and 25 years']]
                    ], 422);
                }
            }

            // Validate class and section compatibility (if you have business rules)
            $class = ClassRoom::find($request->class_id);
            $section = Section::find($request->section_id);
            
            if (!$class || !$section) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid class or section selected',
                    'errors' => ['class_id' => ['Invalid class selected'], 'section_id' => ['Invalid section selected']]
                ], 422);
            }

            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'username' => $request->admission_no,
                'phone' => $request->phone,
                'password' => Hash::make($request->dob ? $request->dob : 'password123'),
                'status' => 'active',
            ]);

            // Assign student role
            $user->assignRole('student');

            // Handle student photo upload
            $studentPhotoPath = null;
            if ($request->hasFile('photo')) {
                $studentPhotoPath = $request->file('photo')->store('students/photos', 'public');
            }

            // Get active session
            $activeSession = \App\Models\Session::getActiveSession();
            if (!$activeSession) {
                throw new \Exception('No active session found. Please create and activate a session first.');
            }

            // Create student record
            $student = Student::create([
                'admission_no' => $request->admission_no,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'dob' => $request->dob,
                'gender' => $request->gender,
                'address' => $request->address,
                'photo' => $studentPhotoPath,
                'class_id' => $request->class_id,
                'section_id' => $request->section_id,
                'user_id' => $user->id,
                'session_id' => $activeSession->id,
            ]);

            // Handle parent photo uploads and create parent record
            $fatherPhotoPath = null;
            $motherPhotoPath = null;
            
            if ($request->hasFile('father_photo')) {
                $fatherPhotoPath = $request->file('father_photo')->store('students/parents', 'public');
            }
            
            if ($request->hasFile('mother_photo')) {
                $motherPhotoPath = $request->file('mother_photo')->store('students/parents', 'public');
            }

            // Create parent record if any parent data is provided
            if ($request->father_name || $request->mother_name || $request->father_phone || $request->mother_phone || 
                $request->father_email || $request->mother_email || $fatherPhotoPath || $motherPhotoPath) {
                
                StudentParent::create([
                    'student_id' => $student->id,
                    'father_name' => $request->father_name,
                    'father_phone' => $request->father_phone,
                    'father_email' => $request->father_email,
                    'father_photo' => $fatherPhotoPath,
                    'mother_name' => $request->mother_name,
                    'mother_phone' => $request->mother_phone,
                    'mother_email' => $request->mother_email,
                    'mother_photo' => $motherPhotoPath,
                ]);
            }

            // Handle guardian photo upload and create guardian record
            $guardianPhotoPath = null;
            
            if ($request->hasFile('guardian_photo')) {
                $guardianPhotoPath = $request->file('guardian_photo')->store('students/guardians', 'public');
            }

            // Create guardian record if guardian data is provided
            if ($request->guardian_name || $request->guardian_relationship || $request->guardian_phone || 
                $request->guardian_email || $guardianPhotoPath) {
                
                Guardian::create([
                    'student_id' => $student->id,
                    'name' => $request->guardian_name,
                    'relationship' => $request->guardian_relationship,
                    'phone' => $request->guardian_phone,
                    'email' => $request->guardian_email,
                    'photo' => $guardianPhotoPath,
                ]);
            }

            DB::commit();

            // Load relationships for response
            $student->load(['classRoom', 'section', 'user', 'parent', 'guardian']);

            return response()->json([
                'success' => true,
                'message' => 'Student created successfully',
                'data' => $student
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified student
     */
    public function show($id)
    {
        try {
            $student = Student::with(['classRoom', 'section', 'user', 'parent', 'guardian'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified student
     */
    public function update(Request $request, $id)
    {
        try {
            $student = Student::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'admission_no' => [
                    'required',
                    'string',
                    'max:50',
                    'regex:/^[A-Z0-9\-]+$/',
                    Rule::unique('students')->ignore($id),
                ],
                'name' => 'required|string|max:255|min:2|regex:/^[a-zA-Z\s\.\-\']+$/',
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('students')->ignore($id),
                    Rule::unique('users')->ignore($student->user_id),
                ],
                'phone' => 'nullable|string|max:20|regex:/^[\+]?[1-9][\d]{0,15}$/',
                'dob' => 'nullable|date|before:today|after:1900-01-01',
                'gender' => 'nullable|in:male,female,other',
                'address' => 'nullable|string|max:500',
                'class_id' => 'required|exists:classes,id',
                'section_id' => 'required|exists:sections,id',
            ], [
                'admission_no.regex' => 'Admission number can only contain uppercase letters, numbers, hyphens, and underscores.',
                'name.regex' => 'Name can only contain letters, spaces, dots, hyphens, and apostrophes.',
                'phone.regex' => 'Please enter a valid phone number.',
                'dob.before' => 'Date of birth must be in the past.',
                'dob.after' => 'Date of birth must be after 1900.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Additional business logic validation
            if ($request->dob) {
                $dob = \Carbon\Carbon::parse($request->dob);
                $age = $dob->age;
                
                if ($age < 3 || $age > 25) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Student age must be between 3 and 25 years',
                        'errors' => ['dob' => ['Student age must be between 3 and 25 years']]
                    ], 422);
                }
            }

            // Validate class and section compatibility
            $class = ClassRoom::find($request->class_id);
            $section = Section::find($request->section_id);
            
            if (!$class || !$section) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid class or section selected',
                    'errors' => ['class_id' => ['Invalid class selected'], 'section_id' => ['Invalid section selected']]
                ], 422);
            }

            DB::beginTransaction();

            // Update user account
            $student->user->update([
                'name' => $request->name,
                'email' => $request->email,
                'username' => $request->admission_no,
                'phone' => $request->phone,
            ]);

            // Update student record
            $student->update([
                'admission_no' => $request->admission_no,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'dob' => $request->dob,
                'gender' => $request->gender,
                'address' => $request->address,
                'class_id' => $request->class_id,
                'section_id' => $request->section_id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student updated successfully',
                'data' => $student->load(['classRoom', 'section', 'user'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified student
     */
    public function destroy($id)
    {
        try {
            $student = Student::findOrFail($id);
            
            DB::beginTransaction();

            // Delete associated user
            if ($student->user) {
                $student->user->delete();
            }

            // Delete student record
            $student->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk import students from CSV/Excel
     */
    public function bulkImport(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:csv,txt|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $csvData = array_map('str_getcsv', file($file->getPathname()));
            $headers = array_shift($csvData);

            // Validate CSV headers
            $requiredHeaders = ['admission_no', 'name', 'email', 'phone', 'dob', 'gender', 'address', 'class_name', 'section_name'];
            $missingHeaders = array_diff($requiredHeaders, $headers);
            
            if (!empty($missingHeaders)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid CSV format. Missing headers: ' . implode(', ', $missingHeaders)
                ], 422);
            }

            $results = [
                'total' => count($csvData),
                'imported' => 0,
                'failed' => 0,
                'errors' => []
            ];

            DB::beginTransaction();

            foreach ($csvData as $index => $row) {
                try {
                    $data = array_combine($headers, $row);
                    
                    // Validate class and section exist
                    $class = ClassRoom::where('name', $data['class_name'])->first();
                    $section = Section::where('name', $data['section_name'])->first();

                    if (!$class || !$section) {
                        $results['failed']++;
                        $results['errors'][] = "Row " . ($index + 2) . ": Class or section not found";
                        continue;
                    }

                    // Check if student already exists
                    if (Student::where('admission_no', $data['admission_no'])->exists() ||
                        Student::where('email', $data['email'])->exists()) {
                        $results['failed']++;
                        $results['errors'][] = "Row " . ($index + 2) . ": Student already exists";
                        continue;
                    }

                    // Create user account
                    $user = User::create([
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'username' => $data['admission_no'],
                        'phone' => $data['phone'] ?? null,
                        'password' => Hash::make($data['dob'] ?: 'password123'),
                        'status' => 'active',
                    ]);

                    $user->assignRole('student');

                    // Get active session
                    $activeSession = \App\Models\Session::getActiveSession();
                    if (!$activeSession) {
                        throw new \Exception('No active session found. Please create and activate a session first.');
                    }

                    // Create student record
                    Student::create([
                        'admission_no' => $data['admission_no'],
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'phone' => $data['phone'] ?? null,
                        'dob' => $data['dob'] ? date('Y-m-d', strtotime($data['dob'])) : null,
                        'gender' => $data['gender'] ?? null,
                        'address' => $data['address'] ?? null,
                        'class_id' => $class->id,
                        'section_id' => $section->id,
                        'user_id' => $user->id,
                        'session_id' => $activeSession->id,
                    ]);

                    $results['imported']++;

                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = "Row " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bulk import completed',
                'data' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process bulk import',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get classes and sections for dropdowns
     */
    public function getClassesAndSections()
    {
        try {
            $classes = ClassRoom::with('section')->inSession()->get();
            $sections = Section::inSession()->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'classes' => $classes,
                    'sections' => $sections
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch classes and sections',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
