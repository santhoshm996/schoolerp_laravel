<?php

namespace App\Services;

use App\Models\Session;
use Illuminate\Support\Facades\DB;
use Exception;

class SessionService
{
    /**
     * Create a new session
     */
    public function createSession(array $data): Session
    {
        DB::beginTransaction();
        
        try {
            // If setting as active, deactivate all other sessions
            if ($data['status'] === 'active') {
                $this->deactivateAllSessions();
            }
            
            $session = Session::create($data);
            
            DB::commit();
            return $session;
            
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing session
     */
    public function updateSession(Session $session, array $data): Session
    {
        DB::beginTransaction();
        
        try {
            // If setting as active, deactivate all other sessions
            if ($data['status'] === 'active') {
                $this->deactivateAllSessions($session->id);
            }
            
            $session->update($data);
            
            DB::commit();
            return $session;
            
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Switch to a different active session
     */
    public function switchToSession(int $sessionId): Session
    {
        DB::beginTransaction();
        
        try {
            // Deactivate all sessions
            $this->deactivateAllSessions();
            
            // Activate the selected session
            $session = Session::findOrFail($sessionId);
            $session->update(['status' => 'active']);
            
            DB::commit();
            return $session;
            
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Deactivate all sessions except the specified one
     */
    private function deactivateAllSessions(int $exceptId = null): void
    {
        $query = Session::where('status', 'active');
        
        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }
        
        $query->update(['status' => 'inactive']);
    }

    /**
     * Get session statistics
     */
    public function getSessionStats(Session $session): array
    {
        return [
            'total_students' => $session->students()->count(),
            'total_classes' => $session->classes()->count(),
            'total_sections' => $session->sections()->count(),
            'is_active' => $session->isActive(),
            'days_remaining' => $session->end_date->diffInDays(now()),
            'progress_percentage' => $this->calculateProgressPercentage($session),
        ];
    }

    /**
     * Calculate session progress percentage
     */
    private function calculateProgressPercentage(Session $session): float
    {
        $totalDays = $session->start_date->diffInDays($session->end_date);
        $elapsedDays = $session->start_date->diffInDays(now());
        
        if ($totalDays <= 0) {
            return 0;
        }
        
        $percentage = ($elapsedDays / $totalDays) * 100;
        return min(100, max(0, $percentage));
    }

    /**
     * Validate session dates don't overlap
     */
    public function validateSessionDates(string $startDate, string $endDate, int $excludeId = null): bool
    {
        $query = Session::where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($subQ) use ($startDate, $endDate) {
                  $subQ->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
              });
        });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return !$query->exists();
    }

    /**
     * Get upcoming sessions
     */
    public function getUpcomingSessions(int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        return Session::where('start_date', '>', now())
            ->orderBy('start_date')
            ->limit($limit)
            ->get();
    }

    /**
     * Get expired sessions
     */
    public function getExpiredSessions(): \Illuminate\Database\Eloquent\Collection
    {
        return Session::where('end_date', '<', now())
            ->orderBy('end_date', 'desc')
            ->get();
    }
}
