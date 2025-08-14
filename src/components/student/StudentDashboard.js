import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTest } from '../../contexts/TestContext';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaEdit, 
  FaCheck, 
  FaTimes,
  FaClock,
  FaTrophy,
  FaFileAlt,
  FaExclamationTriangle,
  FaHistory,
  FaCalendarAlt,
  FaChartLine,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaBook,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import YugaYatraLogo from '../common/YugaYatraLogo';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { startTest, loading } = useTest();
  
  const [showTerms, setShowTerms] = useState(false);
  const [testHistory, setTestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [globalTestEnabled, setGlobalTestEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    college: user?.college || '',
  });

  // Check global test status
  useEffect(() => {
    const globalTestStatus = localStorage.getItem('globalTestEnabled');
    setGlobalTestEnabled(globalTestStatus !== 'false');
  }, []);

  // Fetch test history
  useEffect(() => {
    const fetchTestHistory = async () => {
      if (!user?.id) return;
      
      setLoadingHistory(true);
      try {
        // Get test history from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const storedTestHistory = userData.testHistory || [];
        
        // Also check global test results
        const globalTestResults = JSON.parse(localStorage.getItem('testResults') || '[]');
        
        // Combine and format the data
        const combinedHistory = storedTestHistory.map(attempt => ({
          id: attempt.id,
          score: attempt.score,
          correct_answers: attempt.correctAnswers,
          total_questions: attempt.totalQuestions,
          duration_seconds: attempt.timeTaken,
          warnings_count: attempt.warnings,
          start_time: attempt.completedAt,
          end_time: attempt.completedAt,
          status: attempt.passed ? 'passed' : 'failed'
        }));
        
        setTestHistory(combinedHistory);
      } catch (error) {
        console.error('Error fetching test history:', error);
        setTestHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchTestHistory();
  }, [user?.id]);

  const handleProfileUpdate = async () => {
    if (!profileData.name || !profileData.phone || !profileData.college) {
      toast.error('Please fill in all required fields');
      return;
    }

    const success = await updateProfile(profileData);
    if (success) {
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    }
  };

  const handleStartTest = async () => {
    // Check if global test is enabled
    if (!globalTestEnabled) {
      toast.error('Test access is currently disabled by admin. Please try again later.');
      return;
    }

    // Check if user's individual test is enabled
    if (user && user.testEnabled === false) {
      toast.error('Your test access has been disabled by admin. Please contact support.');
      return;
    }

    // Show terms first
    setShowTerms(true);
  };

  const handleAcceptTerms = async () => {
    setShowTerms(false);
    
    // After accepting terms, check if payment is required
    if (!user?.paymentCompleted) {
      // Show payment modal/confirmation
      const confirmed = window.confirm(
        'Payment is required to start the test. The test fee is ₹99. Do you want to proceed with payment?'
      );
      
      if (confirmed) {
        // Simulate payment process
        toast.loading('Processing payment...', { duration: 2000 });
        
        // Simulate payment success after 2 seconds
        setTimeout(() => {
          // Update user payment status using AuthContext
          updateProfile({ ...user, paymentCompleted: true });
          
          toast.success('Payment successful! Starting test...');
          // Start the test after payment
          startTestAndNavigate();
        }, 2000);
      }
      return;
    }

    // If payment is already completed, start test directly
    startTestAndNavigate();
  };

  const startTestAndNavigate = async () => {
    const success = await startTest();
    if (success) {
      navigate('/student/test');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (score) => {
    if (score >= 60) {
      return 'bg-green-100 text-green-800';
    } else if (score >= 40) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (score) => {
    if (score >= 60) return 'PASSED';
    else if (score >= 40) return 'AVERAGE';
    else return 'FAILED';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'current':
        return 'text-orange-600';
      case 'not_entered':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'current':
        return <FaCircle className="text-orange-600" />;
      case 'not_entered':
        return <FaCircle className="text-gray-400" />;
      default:
        return <FaCircle className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header - Fixed across all pages */}
      <header className="bg-white shadow-lg border-b-2 border-gold-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* Yuga Yatra Logo */}
              <YugaYatraLogo className="w-16 h-16" showText={false} />
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  Student Portal
                </h1>
                <p className="text-sm text-gold-600 font-medium">Welcome, {user?.name || user?.email || 'Student'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-yellow-600 transition-colors rounded-md"
                >
                  <FaChartLine className="mr-2" />
                  Dashboard
                </button>
                <button
                  className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md"
                >
                  <FaUser className="mr-2" />
                  Profile
                </button>
            <button
              onClick={logout}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 transition-colors rounded-md"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress Status</h2>
            <div className="flex items-center justify-center space-x-8">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  user?.profileComplete 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                }`}>
                  {user?.profileComplete ? '✓' : '1'}
                </div>
                <span className="text-xs font-medium text-gray-700">Profile</span>
                <span className={`text-xs ${
                  user?.profileComplete ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {user?.profileComplete ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-300">
                <div className={`h-full ${user?.profileComplete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  user?.termsAccepted 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                }`}>
                  {user?.termsAccepted ? '✓' : '2'}
                </div>
                <span className="text-xs font-medium text-gray-700">Terms</span>
                <span className={`text-xs ${
                  user?.termsAccepted ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {user?.termsAccepted ? 'Accepted' : 'Pending'}
                </span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-300">
                <div className={`h-full ${user?.termsAccepted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  user?.paymentCompleted 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                }`}>
                  {user?.paymentCompleted ? '✓' : '3'}
                </div>
                <span className="text-xs font-medium text-gray-700">Payment</span>
                <span className={`text-xs ${
                  user?.paymentCompleted ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {user?.paymentCompleted ? 'Completed' : 'Pending'}
                </span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-300">
                <div className={`h-full ${user?.paymentCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  user?.testCompleted 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                    : user?.testStarted 
                      ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                      : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                }`}>
                  {user?.testCompleted ? '✓' : user?.testStarted ? '4' : '4'}
                </div>
                <span className="text-xs font-medium text-gray-700">Test</span>
                <span className={`text-xs ${
                  user?.testCompleted 
                    ? 'text-green-600' 
                    : user?.testStarted 
                      ? 'text-orange-600'
                      : 'text-gray-600'
                }`}>
                  {user?.testCompleted 
                    ? 'Completed' 
                    : user?.testStarted 
                      ? 'In Progress'
                      : 'Not Started'}
                </span>
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Student Details */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-primary-dark">Student Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-accent-red hover:text-red-600 transition-colors"
                >
                  {isEditing ? <FaTimes /> : <FaEdit />}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="input-field"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College/University *
                    </label>
                    <input
                      type="text"
                      value={profileData.college}
                      onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
                      className="input-field"
                      placeholder="Enter your college/university"
                    />
                  </div>
                  <button
                    onClick={handleProfileUpdate}
                      className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    <FaCheck className="mr-2" />
                      Update Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{user?.name || 'Not provided'}</p>
                    </div>
                  </div>
                    
                  <div className="flex items-center">
                      <FaEnvelope className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                    
                  <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                    
                  <div className="flex items-center">
                      <FaUniversity className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">College</p>
                      <p className="font-medium">{user?.college || 'Not provided'}</p>
                    </div>
                  </div>
                    
                    {user?.course && (
                      <div className="flex items-center">
                        <FaBook className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Course</p>
                          <p className="font-medium">{user.course}</p>
                        </div>
                      </div>
                    )}
                    
                    {user?.graduationYear && (
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Graduation Year</p>
                          <p className="font-medium">{user.graduationYear}</p>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

            {/* Right Side - Test Details */}
          <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-primary-dark">Test Information</h2>
                  {!globalTestEnabled && (
                    <div className="flex items-center text-red-600">
                      <FaExclamationTriangle className="mr-2" />
                      <span className="text-sm">Test Access Disabled</span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Test Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Software Engineering Assessment</h3>
                        <p className="text-sm text-gray-600">35 questions • 30 minutes • 60% passing score</p>
                </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`font-medium ${
                          user?.testCompleted 
                            ? 'text-green-600' 
                            : user?.testStarted 
                              ? 'text-orange-600'
                              : 'text-gray-600'
                        }`}>
                          {user?.testCompleted 
                            ? 'Completed' 
                            : user?.testStarted 
                              ? 'In Progress'
                              : 'Not Started'}
                        </p>
                  </div>
                </div>
              </div>

                  {/* Test Actions */}
                  <div className="flex justify-center">
              <button
                onClick={handleStartTest}
                      disabled={!globalTestEnabled || loading}
                      className={`btn-primary flex items-center px-8 py-3 text-lg ${
                        !globalTestEnabled || loading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-yellow-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                      }`}
                    >
                      <FaPlay className="mr-3" />
                      {loading ? 'Starting Test...' : 'Start Test'}
              </button>
            </div>

            {/* Test History */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaHistory className="mr-2 text-yellow-600" />
                      Test History
                    </h3>
                    
                    {testHistory.length > 0 ? (
                      <div className="space-y-4">
                        {testHistory.slice(0, 3).map((attempt, index) => (
                          <div 
                            key={index} 
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-yellow-300 transition-all duration-200 cursor-pointer"
                            onClick={() => navigate('/student/test-results')}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-yellow-600 font-semibold">#{index + 1}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">
                                    Attempt {index + 1}
                                  </span>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(attempt.start_time)}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(attempt.score)}`}>
                                {getStatusText(attempt.score)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">Score</p>
                                <p className="font-bold text-lg text-gray-900">{attempt.score}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">Duration</p>
                                <p className="font-semibold text-gray-900">{formatDuration(attempt.duration_seconds)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">Correct</p>
                                <p className="font-semibold text-green-600">{attempt.correct_answers}/{attempt.total_questions}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">Warnings</p>
                                <p className="font-semibold text-orange-600">{attempt.warnings_count}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center">
                                  <FaCalendarAlt className="mr-1" />
                                  {formatDate(attempt.start_time)}
                                </div>
                                {attempt.end_time && (
                                  <div className="flex items-center">
                                    <FaClock className="mr-1" />
                                    Completed: {formatDate(attempt.end_time)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {testHistory.length > 3 && (
                          <div className="text-center">
                            <button 
                              onClick={() => navigate('/student/test-results')}
                              className="text-yellow-600 hover:text-yellow-700 font-medium text-sm hover:underline transition-colors"
                            >
                              View All {testHistory.length} Attempts →
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No test attempts yet</p>
                        <p className="text-sm text-gray-400 mt-1">Complete your first test to see your history here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-primary-dark mb-4">Terms & Conditions</h3>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ CRITICAL WARNINGS</h4>
                  <ul className="text-red-700 space-y-1">
                    <li>• NO electronic devices (earphones, earbuds) during test</li>
                    <li>• NO screenshots or screen recordings</li>
                    <li>• NO switching between browser tabs/windows</li>
                    <li>• NO external help or communication</li>
                    <li>• 3 warnings = automatic test submission</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Test Rules:</h4>
                  <ul className="space-y-1">
                    <li>• Duration: 30 minutes (1800 seconds)</li>
                    <li>• Questions: 35 (Easy/Moderate/Expert mix)</li>
                    <li>• Passing: 60% or higher (21/35 correct)</li>
                    <li>• Fee: ₹99 - Non-refundable</li>
                    <li>• Max attempts: 3</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowTerms(false)}
                  className="btn-outline px-6 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptTerms}
                  className="btn-primary px-6 py-2"
                >
                  Accept & Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard; 