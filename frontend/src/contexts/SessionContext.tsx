import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

interface Session {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface SessionContextType {
  currentSession: Session | null;
  allSessions: Session[];
  switchSession: (sessionId: number) => Promise<void>;
  refreshSessions: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSession = async () => {
    try {
      const response = await apiClient.get('/api/v1/sessions/active');
      if (response.data.success) {
        setCurrentSession(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch active session:', err);
      setError(err.message || 'Failed to fetch active session');
    }
  };

  const fetchAllSessions = async () => {
    try {
      const response = await apiClient.get('/api/v1/sessions');
      if (response.data.success) {
        setAllSessions(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message || 'Failed to fetch sessions');
    }
  };

  const refreshSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchActiveSession(),
        fetchAllSessions()
      ]);
    } catch (err) {
      console.error('Failed to refresh sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchSession = async (sessionId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/api/v1/sessions/switch', {
        session_id: sessionId
      });
      
      if (response.data.success) {
        setCurrentSession(response.data.data);
        // Refresh all sessions to get updated statuses
        await fetchAllSessions();
        
        // Instead of reloading, emit a custom event to notify other components
        window.dispatchEvent(new CustomEvent('sessionChanged', { 
          detail: { sessionId, session: response.data.data } 
        }));
        
        // Show success message
        console.log(`Successfully switched to session: ${response.data.data.name}`);
      }
    } catch (err: any) {
      console.error('Failed to switch session:', err);
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Don't throw the error to prevent logout
        return;
      }
      
      setError(err.message || 'Failed to switch session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  const value: SessionContextType = {
    currentSession,
    allSessions,
    switchSession,
    refreshSessions,
    loading,
    error,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
