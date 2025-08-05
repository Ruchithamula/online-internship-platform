import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SessionProtection = () => {
  const { isAuthenticated, checkSessionTimeout } = useAuth();

  useEffect(() => {
    // Check session timeout on component mount
    if (isAuthenticated) {
      const isExpired = checkSessionTimeout();
      if (isExpired) {
        console.log('SessionProtection: Session expired, user will be logged out');
      }
    }
  }, [isAuthenticated, checkSessionTimeout]);

  // This component doesn't render anything visible
  // It just handles session protection logic
  return null;
};

export default SessionProtection; 