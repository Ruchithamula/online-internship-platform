import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  userType: null, // 'student' or 'admin'
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
        isAuthenticated: true,
        loading: false,
      };
    
    case 'LOGOUT':
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      return {
        ...initialState,
        loading: false,
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    console.log('AuthContext: Checking existing auth', { token: !!token, userType, hasUserData: !!userData });

    if (token && userType && userData) {
      try {
        // Check if session has expired
        const sessionStartTime = localStorage.getItem('sessionStartTime');
        if (sessionStartTime) {
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          const currentTime = Date.now();
          const sessionAge = currentTime - parseInt(sessionStartTime);
          
          console.log('AuthContext: Session check', { sessionAge, sessionDuration, isExpired: sessionAge > sessionDuration });
          
          if (sessionAge > sessionDuration) {
            // Session expired, logout user
            console.log('AuthContext: Session expired, logging out');
            dispatch({ type: 'LOGOUT' });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }
        }
        
        const user = JSON.parse(userData);
        console.log('AuthContext: Restoring user session', { userType, userId: user.id });
        dispatch({
          type: 'SET_USER',
          payload: { user, userType },
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      console.log('AuthContext: No existing auth found');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Set up periodic session timeout check
  useEffect(() => {
    const sessionCheckInterval = setInterval(() => {
      const sessionStartTime = localStorage.getItem('sessionStartTime');
      if (sessionStartTime) {
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const currentTime = Date.now();
        const sessionAge = currentTime - parseInt(sessionStartTime);
        
        if (sessionAge > sessionDuration) {
          // Session expired, logout user
          dispatch({ type: 'LOGOUT' });
          toast.error('Session expired. Please login again.');
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheckInterval);
  }, []);

  // Refresh session on user activity
  useEffect(() => {
    const refreshSession = () => {
      if (state.isAuthenticated) {
        localStorage.setItem('sessionStartTime', Date.now().toString());
      }
    };

    // Refresh session on user activity (mouse move, click, keypress)
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, refreshSession, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, refreshSession, true);
      });
    };
  }, [state.isAuthenticated]);

  // Student password login
  const studentPasswordLogin = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For demo purposes, accept any email/password combination
      const user = {
        id: `student_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'student',
        termsAccepted: false,
        profileComplete: false,
        testCompleted: false,
        testStarted: false
      };

      // Store user data
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('userType', 'student');
      localStorage.setItem('sessionStartTime', Date.now().toString());
      
      // Add to registered users for admin tracking
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUserIndex = registeredUsers.findIndex(u => u.email === email);
      
      if (existingUserIndex >= 0) {
        registeredUsers[existingUserIndex] = { ...registeredUsers[existingUserIndex], ...user };
      } else {
        registeredUsers.push({
          ...user,
          createdAt: new Date().toISOString(),
          registrationType: 'Password Login'
        });
      }
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      
      console.log('AuthContext: Password login successful', { email, userId: user.id });
      
      dispatch({
        type: 'SET_USER',
        payload: { user, userType: 'student' },
      });
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  // Admin login
  const adminLogin = async (username, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Admin authentication with credentials: Admin/Admin
      if (username === 'Admin' && password === 'Admin') {
        const user = {
          id: 'admin_1',
          username: 'Admin',
          name: 'Administrator',
          role: 'admin',
        };
        
        const token = 'admin_token_' + Date.now();
        
        console.log('AuthContext: Admin login successful', { username, userId: user.id });
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('sessionStartTime', Date.now().toString());
        
        dispatch({
          type: 'SET_USER',
          payload: { user, userType: 'admin' },
        });
        
        toast.success('Admin login successful!');
        return true;
      } else {
        toast.error('Invalid credentials. Please try again.');
        return false;
      }
      
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = { 
        ...state.user, 
        ...profileData, 
        profileComplete: true,
        termsAccepted: true, // Also mark terms as accepted when profile is completed
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      dispatch({
        type: 'SET_USER',
        payload: { user: updatedUser, userType: state.userType },
      });
      
      toast.success('Profile updated successfully!');
      return true;
      
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      return false;
    }
  };

  // Register new student
  const registerStudent = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if email already exists (in a real app, this would be a database check)
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const emailExists = existingUsers.some(user => user.email === userData.email);
      
      if (emailExists) {
        toast.error('Email already registered. Please use a different email or login.');
        return false;
      }
      
      // Create new user object
      const newUser = {
        id: 'student_' + Date.now(),
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        college: userData.college,
        graduationYear: userData.graduationYear,
        course: userData.course,
        branch: userData.branch,
        cgpa: userData.cgpa || '',
        linkedin: userData.linkedin || '',
        github: userData.github || '',
        portfolio: userData.portfolio || '',
        skills: userData.skills || [],
        bio: userData.bio || '',
        profileComplete: true,
        termsAccepted: true, // Set to true since users agree during registration
        createdAt: new Date().toISOString(),
        password: userData.password // In real app, this would be hashed
      };
      
      // Store user in localStorage (in real app, this would be in database)
      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      
      toast.success('Account created successfully! Please login with your credentials.');
      return true;
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout
  const logout = () => {
    console.log('AuthContext: Logging out user');
    
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    localStorage.removeItem('sessionStartTime');
    
    // Clear any other session-related data
    sessionStorage.clear();
    
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully!');
  };

  // Check session timeout
  const checkSessionTimeout = () => {
    const sessionStartTime = localStorage.getItem('sessionStartTime');
    if (sessionStartTime) {
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const currentTime = Date.now();
      const sessionAge = currentTime - parseInt(sessionStartTime);
      
      if (sessionAge > sessionDuration) {
        logout();
        return true; // Session expired
      }
    }
    return false; // Session still valid
  };

  // Refresh session manually
  const refreshSession = () => {
    if (state.isAuthenticated) {
      localStorage.setItem('sessionStartTime', Date.now().toString());
      return true;
    }
    return false;
  };

  const value = {
    ...state,
    studentPasswordLogin,
    adminLogin,
    registerStudent,
    updateProfile,
    logout,
    checkSessionTimeout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 