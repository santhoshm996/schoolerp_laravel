<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Session;
use App\Services\SessionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SessionController extends Controller
{
    protected $sessionService;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(SessionService $sessionService)
    {
        $this->sessionService = $sessionService;
        $this->middleware('role:superadmin,admin')->only(['store', 'update', 'destroy', 'switchSession']);
    }

    /**
     * Display a listing of sessions
     */
    public function index()
    {
        try {
            $sessions = Session::orderBy('start_date', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sessions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the currently active session
     */
    public function getActiveSession()
    {
        try {
            $activeSession = Session::getActiveSession();

            if (!$activeSession) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active session found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $activeSession
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created session
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:50|unique:sessions,name',
                'start_date' => 'required|date|before:end_date',
                'end_date' => 'required|date|after:start_date',
                'status' => 'nullable|in:active,inactive'
            ], [
                'name.unique' => 'Session name already exists',
                'start_date.before' => 'Start date must be before end date',
                'end_date.after' => 'End date must be after start date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $session = $this->sessionService->createSession($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Session created successfully',
                'data' => $session
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified session
     */
    public function show($id)
    {
        try {
            $session = Session::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $session
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified session
     */
    public function update(Request $request, $id)
    {
        try {
            $session = Session::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:50|unique:sessions,name,' . $id,
                'start_date' => 'required|date|before:end_date',
                'end_date' => 'required|date|after:start_date',
                'status' => 'nullable|in:active,inactive'
            ], [
                'name.unique' => 'Session name already exists',
                'start_date.before' => 'Start date must be before end date',
                'end_date.after' => 'End date must be after start date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $session = $this->sessionService->updateSession($session, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Session updated successfully',
                'data' => $session
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified session
     */
    public function destroy($id)
    {
        try {
            $session = Session::findOrFail($id);

            // Check if session has associated data
            if ($session->students()->exists() || $session->classes()->exists() || $session->sections()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete session with associated data'
                ], 422);
            }

            $session->delete();

            return response()->json([
                'success' => true,
                'message' => 'Session deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Switch to a different active session
     */
    public function switchSession(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'session_id' => 'required|exists:sessions,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $session = $this->sessionService->switchToSession($request->session_id);

            return response()->json([
                'success' => true,
                'message' => 'Session switched successfully',
                'data' => $session
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to switch session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get session statistics
     */
    public function getStats($id)
    {
        try {
            $session = Session::findOrFail($id);

            $stats = [
                'total_students' => $session->students()->count(),
                'total_classes' => $session->classes()->count(),
                'total_sections' => $session->sections()->count(),
                'is_active' => $session->isActive(),
                'days_remaining' => $session->end_date->diffInDays(now()),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch session statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
