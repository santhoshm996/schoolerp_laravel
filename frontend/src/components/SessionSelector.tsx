import React, { useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useToast } from '../contexts/ToastContext';
import { ChevronDown, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const SessionSelector: React.FC = () => {
  const { currentSession, allSessions, switchSession, loading } = useSession();
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleSessionSwitch = async (sessionId: number) => {
    try {
      await switchSession(sessionId);
      setIsOpen(false);
      
      // Show success message
      const session = allSessions.find(s => s.id === sessionId);
      if (session) {
        showSuccess(`Session Switched`, `Successfully switched to session: ${session.name}`);
      }
    } catch (error) {
      console.error('Failed to switch session:', error);
      // Show error message
      showError('Session Switch Failed', 'Failed to switch session. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-gray-400" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading sessions...</span>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-red-100 rounded-lg">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-600">No active session</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <Calendar className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-900">
          {currentSession.name}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Switch Academic Session</h3>
            <p className="text-xs text-gray-500 mt-1">
              Current: {currentSession.name} ({formatDate(currentSession.start_date)} - {formatDate(currentSession.end_date)})
            </p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {allSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSessionSwitch(session.id)}
                disabled={session.id === currentSession.id}
                className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                  session.id === currentSession.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(session.status)}
                    <span className={`text-sm font-medium ${
                      session.id === currentSession.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {session.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(session.start_date)} - {formatDate(session.end_date)}
                    </span>
                  </div>
                </div>
                
                {session.id === currentSession.id && (
                  <span className="text-xs text-blue-600 font-medium">Current</span>
                )}
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Switching sessions will update all data to show information for the selected academic year
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSelector;
