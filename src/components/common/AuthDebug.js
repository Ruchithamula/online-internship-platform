import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { testAuthPersistence, testAuthState } from '../../utils/authTest';

const AuthDebug = () => {
  const auth = useAuth();
  const { isAuthenticated, userType, user, loading, logout } = auth;

  if (!process.env.NODE_ENV === 'development') {
    return null;
  }

  const handleTestAuth = () => {
    testAuthPersistence();
    testAuthState(auth);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User Type: {userType || 'None'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>User Email: {user?.email || 'None'}</div>
        <div>Token: {localStorage.getItem('authToken') ? 'Present' : 'None'}</div>
        <div>Session Start: {localStorage.getItem('sessionStartTime') || 'None'}</div>
      </div>
      <div className="mt-2 space-x-1">
        <button 
          onClick={handleTestAuth}
          className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Test Auth
        </button>
        {isAuthenticated && (
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthDebug; 