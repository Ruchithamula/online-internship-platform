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
  FaTrophy,
  FaHome,
  FaChartBar,
  FaRandom
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import YugaYatraLogo from '../common/YugaYatraLogo';
import CandidatesList from './CandidatesList';
import RandomQuestionsManager from './RandomQuestionsManager';

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
      toast.error('Failed to load candidates data');
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates, refreshKey]);

  const stats = {
    totalCandidates: candidates.length,
    testCompleted: candidates.filter(c => c.testCompleted).length,
    testStarted: candidates.filter(c => c.testStarted).length,
    testEnabled: candidates.filter(c => c.testEnabled).length,
    averageScore: candidates.filter(c => c.bestScore > 0).length > 0 
      ? Math.round(candidates.filter(c => c.bestScore > 0).reduce((sum, c) => sum + c.bestScore, 0) / candidates.filter(c => c.bestScore > 0).length)
      : 0,
    passedTests: candidates.reduce((sum, c) => sum + c.passedTests, 0),
    totalAttempts: candidates.reduce((sum, c) => sum + c.totalAttempts, 0)
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'candidates', label: 'Candidates', icon: FaUsers },
    { id: 'random-questions', label: 'Random Questions', icon: FaRandom },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  if (loadingStats) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-primary-dark">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

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

      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-[#6b7280] hover:text-[#f8b800] transition-colors duration-200 font-medium"
              >
                <FaHome className="mr-2" />
                Home
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center text-[#6b7280] hover:text-[#f8b800] transition-colors duration-200 font-medium"
              >
                <FaChartBar className="mr-2" />
                Analytics
              </button>
              <span className="text-gray-300">|</span>
              <span className="text-[#f8b800] font-medium">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Logged in as: {user?.name || 'Admin'}</span>
            </div>
          </div>
        </div>
      </nav>

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

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {candidates.slice(0, 5).map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FaUserGraduate className="text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-sm text-gray-500">{candidate.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {candidate.testCompleted ? `${candidate.bestScore}%` : 'Not started'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {candidate.testCompleted ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <CandidatesList candidates={candidates} onRefresh={refreshData} />
        )}

        {/* Random Questions Tab */}
        {activeTab === 'random-questions' && (
          <RandomQuestionsManager />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Global Test Access</h4>
                    <p className="text-sm text-gray-500">Enable or disable test access for all candidates</p>
                  </div>
                  <button
                    onClick={() => setGlobalTestEnabled(!globalTestEnabled)}
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
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Export Data</h4>
                    <p className="text-sm text-gray-500">Download candidate data and test results</p>
                  </div>
                  <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <FaDownload className="mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 