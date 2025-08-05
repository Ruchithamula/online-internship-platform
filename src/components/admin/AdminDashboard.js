import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUsers, 
  FaChartLine, 
  FaCog, 
  FaSignOutAlt,
  FaToggleOn,
  FaToggleOff,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUserGraduate,
  FaFileAlt,
  FaQuestionCircle,
  FaTrophy
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import YugaYatraLogo from '../common/YugaYatraLogo';
import CandidatesList from './CandidatesList';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [candidates, setCandidates] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [globalTestEnabled, setGlobalTestEnabled] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time data refresh
  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    loadCandidates();
  }, []);

  // Load candidates data
  const loadCandidates = useCallback(() => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const otpUsers = JSON.parse(localStorage.getItem('otpUsers') || '[]');
      const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
      
      // Combine and deduplicate users
      const emailMap = new Map();
      
      // Add registered users first (priority)
      registeredUsers.forEach(user => {
        emailMap.set(user.email, {
          ...user,
          registrationType: 'Registered',
          id: user.id || `reg_${Date.now()}_${Math.random()}`,
          testEnabled: user.testEnabled !== false,
          testHistory: user.testHistory || []
        });
      });
      
      // Add OTP users if not already present
      otpUsers.forEach(user => {
        if (!emailMap.has(user.email)) {
          emailMap.set(user.email, {
            ...user,
            registrationType: 'OTP Login',
            id: user.id || `otp_${Date.now()}_${Math.random()}`,
            testEnabled: user.testEnabled !== false,
            testHistory: user.testHistory || []
          });
        }
      });
      
      // Enhance candidates with test results
      const allCandidates = Array.from(emailMap.values()).map(candidate => {
        // Find test results for this candidate
        const candidateResults = testResults.filter(result => 
          result.userEmail === candidate.email || 
          result.userId === candidate.id
        );
        
        // Get latest test result
        const latestResult = candidateResults.length > 0 ? candidateResults[0] : null;
        
        // Calculate test statistics
        const testStats = {
          testCompleted: latestResult !== null,
          testStarted: candidate.testHistory && candidate.testHistory.length > 0,
          bestScore: latestResult ? latestResult.score : 0,
          totalAttempts: candidate.testHistory ? candidate.testHistory.length : 0,
          lastAttemptDate: latestResult ? latestResult.completedAt : null,
          averageScore: candidate.testHistory && candidate.testHistory.length > 0 
            ? Math.round(candidate.testHistory.reduce((sum, attempt) => sum + attempt.score, 0) / candidate.testHistory.length)
            : 0,
          passedTests: candidate.testHistory ? candidate.testHistory.filter(attempt => attempt.passed).length : 0,
          totalWarnings: candidate.testHistory ? candidate.testHistory.reduce((sum, attempt) => sum + (attempt.warnings || 0), 0) : 0
        };
        
        return {
          ...candidate,
          ...testStats,
          latestResult,
          testHistory: candidate.testHistory || []
        };
      });
      
      setCandidates(allCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
      setCandidates([]);
    }
  }, []);

  // Load data on mount and set up real-time updates
  useEffect(() => {
    loadCandidates();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadCandidates, 30000);
    
    // Listen for storage changes (when new users register/login)
    const handleStorageChange = () => {
      loadCandidates();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadCandidates]);

  // Toggle global test access
  const toggleGlobalTest = () => {
    setGlobalTestEnabled(!globalTestEnabled);
    localStorage.setItem('globalTestEnabled', (!globalTestEnabled).toString());
    toast.success(`Global test ${!globalTestEnabled ? 'enabled' : 'disabled'}`);
  };

  // Toggle individual candidate test access
  const toggleCandidateTest = (candidateId) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, testEnabled: !candidate.testEnabled }
        : candidate
    ));
    toast.success('Candidate test access updated');
  };

  // Export candidates data
  const exportData = (format = 'csv') => {
    try {
      const data = candidates.map(candidate => ({
        Name: candidate.name || 'N/A',
        Email: candidate.email,
        Phone: candidate.phone || 'N/A',
        College: candidate.college || 'N/A',
        RegistrationType: candidate.registrationType,
        TestEnabled: candidate.testEnabled ? 'Yes' : 'No',
        ProfileComplete: candidate.profileComplete ? 'Yes' : 'No',
        TermsAccepted: candidate.termsAccepted ? 'Yes' : 'No',
        TestCompleted: candidate.testCompleted ? 'Yes' : 'No',
        Score: candidate.bestScore || 'N/A',
        CreatedAt: candidate.createdAt || 'N/A'
      }));

      let content, filename, mimeType;

      if (format === 'csv') {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        content = [headers, ...rows].join('\n');
        filename = 'candidates.csv';
        mimeType = 'text/csv';
      } else if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = 'candidates.json';
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Candidates data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Calculate statistics
  const stats = {
    totalCandidates: candidates.length,
    registeredUsers: candidates.filter(c => c.registrationType === 'Registered').length,
    otpUsers: candidates.filter(c => c.registrationType === 'OTP Login').length,
    testEnabled: candidates.filter(c => c.testEnabled).length,
    testCompleted: candidates.filter(c => c.testCompleted).length,
    testStarted: candidates.filter(c => c.testStarted).length,
    profileComplete: candidates.filter(c => c.profileComplete).length,
    averageScore: candidates.filter(c => c.bestScore > 0).length > 0 
      ? Math.round(candidates.filter(c => c.bestScore > 0).reduce((sum, c) => sum + c.bestScore, 0) / candidates.filter(c => c.bestScore > 0).length)
      : 0,
    passedTests: candidates.reduce((sum, c) => sum + c.passedTests, 0),
    totalAttempts: candidates.reduce((sum, c) => sum + c.totalAttempts, 0)
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'candidates', label: 'Candidates', icon: FaUsers },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <YugaYatraLogo className="w-10 h-10" showText={false} />
              <h1 className="text-2xl font-bold text-primary-dark ml-3">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                title="Refresh data"
              >
                <FaClock className="mr-2" />
                Refresh
              </button>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <FaUsers className="text-blue-500 text-2xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Total Candidates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <FaFileAlt className="text-green-500 text-2xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Tests Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.testCompleted}</p>
                    <p className="text-xs text-gray-500">{stats.totalAttempts} total attempts</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <FaTrophy className="text-yellow-500 text-2xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                    <p className="text-xs text-gray-500">{stats.passedTests} passed tests</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <FaCheckCircle className="text-purple-500 text-2xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Test Enabled</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.testEnabled}</p>
                    <p className="text-xs text-gray-500">{stats.testStarted} started tests</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Test Control */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Global Test Control</h3>
                  <p className="text-sm text-gray-600">
                    Enable or disable test access for all students
                  </p>
                </div>
                <button
                  onClick={toggleGlobalTest}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    globalTestEnabled
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {globalTestEnabled ? <FaToggleOn className="mr-2" /> : <FaToggleOff className="mr-2" />}
                  {globalTestEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Recent Candidates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Candidates</h3>
                <button
                  onClick={() => setActiveTab('candidates')}
                  className="text-primary-dark hover:text-accent-red transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {candidates.slice(0, 5).map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-dark text-white rounded-full flex items-center justify-center mr-4">
                        {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{candidate.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                        {candidate.testCompleted && (
                          <p className="text-xs text-green-600 font-medium">
                            Best Score: {candidate.bestScore}% • {candidate.totalAttempts} attempt(s)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.testCompleted 
                          ? candidate.bestScore >= 60 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          : candidate.testStarted
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.testCompleted 
                          ? candidate.bestScore >= 60 ? 'Passed' : 'Failed'
                          : candidate.testStarted 
                            ? 'In Progress' 
                            : 'Not Started'}
                      </span>
                      <button
                        onClick={() => toggleCandidateTest(candidate.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          candidate.testEnabled
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={candidate.testEnabled ? 'Disable Test' : 'Enable Test'}
                      >
                        {candidate.testEnabled ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <CandidatesList 
            candidates={candidates}
            onToggleTest={toggleCandidateTest}
            onRefresh={refreshData}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => exportData('csv')}
                  className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <FaDownload className="mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <FaDownload className="mr-2" />
                  Export JSON
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Management</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => toast.info('Question management feature coming soon!')}
                  className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add Questions
                </button>
                <button
                  onClick={() => toast.info('Question editing feature coming soon!')}
                  className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit Questions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 