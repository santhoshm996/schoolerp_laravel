import { useEffect, useCallback } from 'react';

interface SessionChangeEvent {
  sessionId: number;
  session: any;
}

export const useSessionChange = (onSessionChange: (session: any) => void) => {
  const handleSessionChange = useCallback((event: CustomEvent<SessionChangeEvent>) => {
    onSessionChange(event.detail.session);
  }, [onSessionChange]);

  useEffect(() => {
    window.addEventListener('sessionChanged', handleSessionChange as EventListener);
    
    return () => {
      window.removeEventListener('sessionChanged', handleSessionChange as EventListener);
    };
  }, [handleSessionChange]);
};
