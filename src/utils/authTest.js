// Authentication Test Utility
export const testAuthPersistence = () => {
  console.log('=== Auth Persistence Test ===');
  
  // Check localStorage
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  const userData = localStorage.getItem('userData');
  const sessionStartTime = localStorage.getItem('sessionStartTime');
  
  console.log('LocalStorage Check:', {
    hasToken: !!token,
    userType,
    hasUserData: !!userData,
    sessionStartTime: sessionStartTime ? new Date(parseInt(sessionStartTime)).toLocaleString() : 'None'
  });
  
  // Check session validity
  if (sessionStartTime) {
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    const currentTime = Date.now();
    const sessionAge = currentTime - parseInt(sessionStartTime);
    const isExpired = sessionAge > sessionDuration;
    
    console.log('Session Check:', {
      sessionAge: Math.round(sessionAge / 1000 / 60) + ' minutes',
      sessionDuration: Math.round(sessionDuration / 1000 / 60) + ' minutes',
      isExpired
    });
  }
  
  // Parse user data if available
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('User Data:', {
        id: user.id,
        email: user.email,
        name: user.name,
        type: userType
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  console.log('=== End Test ===');
};

// Test authentication state
export const testAuthState = (authContext) => {
  console.log('=== Auth State Test ===');
  console.log('Auth Context:', {
    isAuthenticated: authContext.isAuthenticated,
    userType: authContext.userType,
    loading: authContext.loading,
    user: authContext.user ? {
      id: authContext.user.id,
      email: authContext.user.email,
      name: authContext.user.name
    } : null
  });
  console.log('=== End Test ===');
}; 