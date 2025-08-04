import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaSignOutAlt, 
  FaToggleOn, 
  FaToggleOff,
  FaUsers,
  FaChartBar,
  FaTrophy,
  FaCog,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaFileCsv,
  FaFileExcel,
  FaFileAlt,
  FaChevronDown,
  FaHome,
  FaToggleOn as FaToggleOnIcon,
  FaToggleOff as FaToggleOffIcon,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaClock,
  FaFileAlt as FaReport
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import YugaYatraLogo from '../common/YugaYatraLogo';

import { 
  downloadMeritListAsCSV, 
  downloadMeritListAsExcel, 
  downloadMeritListAsJSON
} from '../../utils/downloadUtils';
import { 
  exportUserDataAsCSV, 
  exportUserDataAsExcel, 
  exportUserDataAsJSON
} from '../../utils/exportUtils';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [testsEnabled, setTestsEnabled] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [candidateTestToggles, setCandidateTestToggles] = useState({});
  const [showCandidateReport, setShowCandidateReport] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Mock data for demonstration
  const [candidates] = useState([
    {
      id: 1,
      email: 'student1@example.com',
      name: 'John Doe',
      attempts: 1,
      bestScore: 85,
      percentile: 92,
      lastAttempt: '2024-01-15',
      status: 'passed',
      testStatus: 'completed',
      paymentStatus: 'paid',
      testsEnabled: true,
      tabSwitches: 0,
      warnings: 0,
      timeTaken: 25,
      autoSubmitted: false
    },
    {
      id: 2,
      email: 'student2@example.com',
      name: 'Jane Smith',
      attempts: 2,
      bestScore: 78,
      percentile: 85,
      lastAttempt: '2024-01-14',
      status: 'passed',
      testStatus: 'completed',
      paymentStatus: 'paid',
      testsEnabled: true,
      tabSwitches: 1,
      warnings: 0,
      timeTaken: 28,
      autoSubmitted: false
    },
    {
      id: 3,
      email: 'student3@example.com',
      name: 'Mike Johnson',
      attempts: 1,
      bestScore: 45,
      percentile: 35,
      lastAttempt: '2024-01-13',
      status: 'failed',
      testStatus: 'completed',
      paymentStatus: 'paid',
      testsEnabled: false,
      tabSwitches: 3,
      warnings: 2,
      timeTaken: 15,
      autoSubmitted: true
    },
    {
      id: 4,
      email: 'student4@example.com',
      name: 'Sarah Wilson',
      attempts: 3,
      bestScore: 92,
      percentile: 98,
      lastAttempt: '2024-01-12',
      status: 'passed',
      testStatus: 'completed',
      paymentStatus: 'paid',
      testsEnabled: true,
      tabSwitches: 0,
      warnings: 0,
      timeTaken: 30,
      autoSubmitted: false
    },
    {
      id: 5,
      email: 'student5@example.com',
      name: 'David Brown',
      attempts: 1,
      bestScore: 55,
      percentile: 45,
      lastAttempt: '2024-01-11',
      status: 'failed',
      testStatus: 'completed',
      paymentStatus: 'unpaid',
      testsEnabled: false,
      tabSwitches: 2,
      warnings: 1,
      timeTaken: 22,
      autoSubmitted: false
    },
    {
      id: 6,
      email: 'student6@example.com',
      name: 'Emily Davis',
      attempts: 0,
      bestScore: 0,
      percentile: 0,
      lastAttempt: '2024-01-10',
      status: 'pending',
      testStatus: 'pending',
      paymentStatus: 'unpaid',
      testsEnabled: false,
      tabSwitches: 0,
      warnings: 0,
      timeTaken: 0,
      autoSubmitted: false
    },
    {
      id: 7,
      email: 'student7@example.com',
      name: 'Alex Thompson',
      attempts: 0,
      bestScore: 0,
      percentile: 0,
      lastAttempt: '2024-01-09',
      status: 'pending',
      testStatus: 'pending',
      paymentStatus: 'paid',
      testsEnabled: true,
      tabSwitches: 0,
      warnings: 0,
      timeTaken: 0,
      autoSubmitted: false
    }
  ]);

  const [questions] = useState([
    {
      id: 1,
      question: "What is the capital of India?",
      options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
      correctAnswer: 1,
      difficulty: "easy",
      category: "General Knowledge"
    },
    {
      id: 2,
      question: "Which programming language is known as the 'language of the web'?",
      options: ["Python", "Java", "JavaScript", "C++"],
      correctAnswer: 2,
      difficulty: "moderate",
      category: "Computer Science"
    },
    {
      id: 3,
      question: "What is the Heisenberg Uncertainty Principle?",
      options: [
        "You cannot simultaneously know the position and momentum of a particle",
        "Energy cannot be created or destroyed",
        "Every action has an equal and opposite reaction",
        "Light travels in straight lines"
      ],
      correctAnswer: 0,
      difficulty: "expert",
      category: "Physics"
    }
  ]);

  const stats = {
    totalCandidates: candidates.length,
    totalTests: candidates.reduce((sum, c) => sum + c.attempts, 0),
    passRate: Math.round((candidates.filter(c => c.status === 'passed').length / candidates.length) * 100),
    averageScore: Math.round(candidates.reduce((sum, c) => sum + c.bestScore, 0) / candidates.length),
    revenue: candidates.length * 295,
    totalTabSwitches: candidates.reduce((sum, c) => sum + c.tabSwitches, 0),
    totalWarnings: candidates.reduce((sum, c) => sum + c.warnings, 0),
    autoSubmittedTests: candidates.filter(c => c.autoSubmitted).length
  };

  const meritList = candidates
    .filter(c => c.status === 'passed')
    .sort((a, b) => b.percentile - a.percentile)
    .slice(0, Math.ceil(candidates.length * 0.1)); // Top 10%

  const handleToggleTests = () => {
    setTestsEnabled(!testsEnabled);
    toast.success(`Tests ${!testsEnabled ? 'enabled' : 'disabled'} successfully!`);
  };

  const handleToggleCandidateTests = (candidateId) => {
    setCandidateTestToggles(prev => ({
      ...prev,
      [candidateId]: !prev[candidateId]
    }));
    
    const candidate = candidates.find(c => c.id === candidateId);
    const isEnabled = !candidateTestToggles[candidateId];
    toast.success(`Tests ${isEnabled ? 'enabled' : 'disabled'} for ${candidate.name}`);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      toast.success('Question deleted successfully!');
    }
  };

  const handleViewCandidateReport = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateReport(true);
  };

  const handleDownloadMeritList = async (format) => {
    setIsDownloading(true);
    setShowDownloadMenu(false);
    
    try {
      let result;
      const filename = `yuga-yatra-merit-list-${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'csv':
          result = downloadMeritListAsCSV(meritList, filename);
          break;
        case 'excel':
          result = downloadMeritListAsExcel(meritList, filename);
          break;
        case 'json':
          result = downloadMeritListAsJSON(meritList, filename);
          break;
        default:
          result = downloadMeritListAsCSV(meritList, filename);
      }
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download merit list');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportUserData = async (format) => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      let result;
      const filename = `yuga-yatra-user-data-${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'csv':
          result = exportUserDataAsCSV(candidates, filename);
          break;
        case 'excel':
          result = exportUserDataAsExcel(candidates, filename);
          break;
        case 'json':
          result = exportUserDataAsJSON(candidates, filename);
          break;
        default:
          result = exportUserDataAsCSV(candidates, filename);
      }
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export user data');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'passed' ? 'success-badge' : 'danger-badge';
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  // Close download and export menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDownloadMenu && !event.target.closest('.download-menu-container')) {
        setShowDownloadMenu(false);
      }
      if (showExportMenu && !event.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadMenu, showExportMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-100 to-yellow-100 shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <YugaYatraLogo className="w-12 h-12" showText={false} />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-primary-dark">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleTests}
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                  testsEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {testsEnabled ? <FaToggleOn className="mr-2" /> : <FaToggleOff className="mr-2" />}
                Tests {testsEnabled ? 'Enabled' : 'Disabled'}
              </button>
              <button
                onClick={logout}
                className="flex items-center text-accent-red hover:text-red-600 transition-colors"
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
        <div className="flex space-x-1 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-1 mb-8 shadow-sm border border-amber-200">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartBar },
            { id: 'candidates', label: 'Candidates', icon: FaUsers },
            { id: 'reports', label: 'Test Reports', icon: FaReport },
            { id: 'merit', label: 'Merit List', icon: FaTrophy },
            { id: 'questions', label: 'Questions', icon: FaCog }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-800 shadow-sm font-bold border-2 border-[#f8b800]'
                    : 'text-[#6b7280] hover:text-[#f8b800] hover:bg-white/50'
                }`}
              >
                <Icon className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <FaUsers className="text-3xl text-blue-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-primary-dark">{stats.totalCandidates}</h3>
                <p className="text-gray-600">Total Candidates</p>
              </div>
              <div className="card text-center">
                <FaChartBar className="text-3xl text-green-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-primary-dark">{stats.totalTests}</h3>
                <p className="text-gray-600">Tests Taken</p>
              </div>
              <div className="card text-center">
                <FaTrophy className="text-3xl text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-primary-dark">{stats.passRate}%</h3>
                <p className="text-gray-600">Pass Rate</p>
              </div>
              <div className="card text-center">
                <FaCog className="text-3xl text-purple-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-primary-dark">₹{stats.revenue.toLocaleString()}</h3>
                <p className="text-gray-600">Total Revenue</p>
              </div>
            </div>

            {/* Security Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <FaShieldAlt className="text-3xl text-red-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-primary-dark">{stats.totalTabSwitches}</h3>
                <p className="text-gray-600">Total Tab Switches</p>
              </div>
              <div className="card text-center">
                <FaExclamationTriangle className="text-3xl text-orange-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-primary-dark">{stats.totalWarnings}</h3>
                <p className="text-gray-600">Total Warnings</p>
              </div>
              <div className="card text-center">
                <FaClock className="text-3xl text-red-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-primary-dark">{stats.autoSubmittedTests}</h3>
                <p className="text-gray-600">Auto-Submitted Tests</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-xl font-semibold text-primary-dark mb-6">Recent Test Activity</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.slice(0, 5).map((candidate) => (
                      <tr key={candidate.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-primary-dark">{candidate.name}</p>
                            <p className="text-sm text-gray-600">{candidate.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{candidate.bestScore}%</span>
                          <span className="text-sm text-gray-600 ml-2">(P{candidate.percentile})</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`}>
                            {candidate.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(candidate.lastAttempt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Test Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* Security Overview */}
            <div className="card">
              <h2 className="text-xl font-semibold text-primary-dark mb-6">Security Violations Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <FaExclamationTriangle className="text-3xl text-red-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-red-700">{candidates.filter(c => c.tabSwitches > 0).length}</h3>
                  <p className="text-sm text-red-600">Candidates with Tab Switches</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <FaExclamationTriangle className="text-3xl text-orange-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-orange-700">{candidates.filter(c => c.warnings > 0).length}</h3>
                  <p className="text-sm text-orange-600">Candidates with Warnings</p>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-lg border border-red-300">
                  <FaClock className="text-3xl text-red-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-red-800">{candidates.filter(c => c.autoSubmitted).length}</h3>
                  <p className="text-sm text-red-700">Auto-Submitted Tests</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-green-700">{candidates.filter(c => c.tabSwitches === 0 && c.warnings === 0).length}</h3>
                  <p className="text-sm text-green-600">Clean Tests</p>
                </div>
              </div>
            </div>

            {/* Detailed Test Reports */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-primary-dark">Detailed Test Reports</h2>
                <div className="relative export-menu-container">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={isExporting}
                    className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center relative"
                  >
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-dark mr-2"></div>
                    ) : (
                      <FaDownload className="mr-2" />
                    )}
                    Export Reports
                    <FaChevronDown className="ml-2" />
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => handleExportUserData('csv')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaFileCsv className="mr-3 text-green-600" />
                          Export as CSV
                        </button>
                        <button
                          onClick={() => handleExportUserData('excel')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaFileExcel className="mr-3 text-blue-600" />
                          Export as Excel
                        </button>
                        <button
                          onClick={() => handleExportUserData('json')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaFileAlt className="mr-3 text-purple-600" />
                          Export as JSON
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tab Switches</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Warnings</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Time Taken</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Auto-Submitted</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.filter(c => c.testStatus === 'completed').map((candidate) => (
                      <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-primary-dark">{candidate.name}</p>
                            <p className="text-sm text-gray-600">{candidate.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${candidate.bestScore >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                            {candidate.bestScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`}>
                            {candidate.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {candidate.tabSwitches > 0 ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                candidate.tabSwitches >= 3 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                                <FaExclamationTriangle className="inline mr-1" />
                                {candidate.tabSwitches}/3
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaCheckCircle className="inline mr-1" />
                                0/3
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {candidate.warnings > 0 ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <FaExclamationTriangle className="inline mr-1" />
                                {candidate.warnings}/3
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaCheckCircle className="inline mr-1" />
                                0/3
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {candidate.timeTaken}m / 30m
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {candidate.autoSubmitted ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FaClock className="inline mr-1" />
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="inline mr-1" />
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleViewCandidateReport(candidate)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-100"
                          >
                            <FaEye className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Violation Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tab Switch Analysis */}
              <div className="card">
                <h3 className="text-lg font-semibold text-primary-dark mb-4">Tab Switch Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">No Tab Switches</span>
                    <span className="text-sm font-bold text-green-600">
                      {candidates.filter(c => c.tabSwitches === 0).length} candidates
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">1-2 Tab Switches</span>
                    <span className="text-sm font-bold text-orange-600">
                      {candidates.filter(c => c.tabSwitches >= 1 && c.tabSwitches < 3).length} candidates
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">3+ Tab Switches (Auto-Submitted)</span>
                    <span className="text-sm font-bold text-red-600">
                      {candidates.filter(c => c.tabSwitches >= 3).length} candidates
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Analysis */}
              <div className="card">
                <h3 className="text-lg font-semibold text-primary-dark mb-4">Warning Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">No Warnings</span>
                    <span className="text-sm font-bold text-green-600">
                      {candidates.filter(c => c.warnings === 0).length} candidates
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">1-2 Warnings</span>
                    <span className="text-sm font-bold text-orange-600">
                      {candidates.filter(c => c.warnings >= 1 && c.warnings < 3).length} candidates
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">3+ Warnings (Auto-Submitted)</span>
                    <span className="text-sm font-bold text-red-600">
                      {candidates.filter(c => c.warnings >= 3).length} candidates
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-primary-dark">All Candidates</h2>
              <div className="relative export-menu-container">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center relative"
                >
                  {isExporting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-dark mr-2"></div>
                  ) : (
                <FaDownload className="mr-2" />
                  )}
                Export Data
                  <FaChevronDown className="ml-2" />
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => handleExportUserData('csv')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaFileCsv className="mr-3 text-green-600" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExportUserData('excel')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaFileExcel className="mr-3 text-blue-600" />
                        Export as Excel
                      </button>
                      <button
                        onClick={() => handleExportUserData('json')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaFileAlt className="mr-3 text-purple-600" />
                        Export as JSON
              </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {candidates.map((candidate) => {
                const isTestEnabled = candidateTestToggles[candidate.id] !== undefined 
                  ? candidateTestToggles[candidate.id] 
                  : candidate.testsEnabled;
                
                return (
                  <div 
                    key={candidate.id} 
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-amber-200 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{candidate.name}</h3>
                          <div className="flex items-center text-[#D4AF37] font-medium">
                            <FaEnvelope className="mr-2 text-sm" />
                            <span className="text-xs sm:text-sm break-all">{candidate.email}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleCandidateTests(candidate.id)}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            isTestEnabled 
                              ? 'bg-[#D4AF37] text-white hover:bg-[#B8941F] shadow-lg' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                          title={`${isTestEnabled ? 'Disable' : 'Enable'} tests for ${candidate.name}`}
                        >
                          {isTestEnabled ? <FaToggleOnIcon className="text-lg" /> : <FaToggleOffIcon className="text-lg" />}
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      {/* Test Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Test Status:</span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          candidate.testStatus === 'completed' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {candidate.testStatus === 'completed' ? (
                            <span className="flex items-center">
                              <FaCheckCircle className="mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <FaTimesCircle className="mr-1" />
                              Pending
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Payment Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Payment:</span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          candidate.paymentStatus === 'paid' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {candidate.paymentStatus === 'paid' ? 'Paid ₹750' : 'Unpaid'}
                        </span>
                      </div>

                      {/* Test Results (if completed) */}
                      {candidate.testStatus === 'completed' && (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Best Score:</span>
                            <span className="font-bold text-[#D4AF37]">{candidate.bestScore}%</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Percentile:</span>
                            <span className="font-bold text-[#D4AF37]">P{candidate.percentile}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Attempts:</span>
                            <span className="font-bold text-[#D4AF37]">{candidate.attempts}</span>
                          </div>
                          
                          {/* Security Information */}
                          <div className="pt-2 border-t border-amber-200 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Tab Switches:</span>
                              <span className={`text-xs font-medium ${
                                candidate.tabSwitches === 0 ? 'text-green-600' : 
                                candidate.tabSwitches >= 3 ? 'text-red-600' : 'text-orange-600'
                              }`}>
                                {candidate.tabSwitches}/3
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Warnings:</span>
                              <span className={`text-xs font-medium ${
                                candidate.warnings === 0 ? 'text-green-600' : 
                                candidate.warnings >= 3 ? 'text-red-600' : 'text-orange-600'
                              }`}>
                                {candidate.warnings}/3
                              </span>
                            </div>
                            {candidate.autoSubmitted && (
                              <div className="flex items-center justify-center">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <FaClock className="inline mr-1" />
                                  Auto-Submitted
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Last Activity */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-amber-200 gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Last Activity:</span>
                        <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {new Date(candidate.lastAttempt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-amber-200">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          candidate.status === 'passed' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : candidate.status === 'failed'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {candidate.status.toUpperCase()}
                        </span>
                        <button 
                          onClick={() => handleViewCandidateReport(candidate)}
                          className="text-[#D4AF37] hover:text-[#B8941F] transition-colors p-2 rounded-full hover:bg-amber-100"
                        >
                          <FaEye className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Merit List Tab */}
        {activeTab === 'merit' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-primary-dark">Merit List (Top 10%)</h2>
              <div className="relative download-menu-container">
                <button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  disabled={isDownloading}
                  className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center relative"
                >
                  {isDownloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-dark mr-2"></div>
                  ) : (
                <FaDownload className="mr-2" />
                  )}
                Download Merit List
                  <FaChevronDown className="ml-2" />
                </button>
                
                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => handleDownloadMeritList('csv')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaFileCsv className="mr-3 text-green-600" />
                        Download as CSV
                      </button>
                      <button
                        onClick={() => handleDownloadMeritList('excel')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaFileExcel className="mr-3 text-blue-600" />
                        Download as Excel
                      </button>
                      <button
                        onClick={() => handleDownloadMeritList('json')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaFileAlt className="mr-3 text-purple-600" />
                        Download as JSON
              </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full merit-list-table">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Percentile</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {meritList.map((candidate, index) => (
                    <tr key={candidate.id} className="border-b border-gray-100 hover:bg-blue-50 transition-all duration-200">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {index < 3 ? (
                            <FaTrophy className={`text-xl mr-2 trophy-glow ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 'text-orange-500'
                            }`} />
                          ) : null}
                          <span className="font-bold text-primary-dark">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-primary-dark">{candidate.name}</td>
                      <td className="py-3 px-4 text-gray-600">{candidate.email}</td>
                      <td className="py-3 px-4 font-medium text-success">{candidate.bestScore}%</td>
                      <td className="py-3 px-4 font-bold text-accent-red">P{candidate.percentile}</td>
                      <td className="py-3 px-4">{candidate.attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-primary-dark">Question Bank</h2>
              <button
                onClick={handleAddQuestion}
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Question
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Question</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Difficulty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => (
                    <tr key={question.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <p className="font-medium text-primary-dark">{question.question}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Correct: {String.fromCharCode(65 + question.correctAnswer)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{question.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(question.difficulty)}`}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-primary-dark mb-6">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Enter the question..."
                    defaultValue={editingQuestion?.question || ''}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="input-field">
                      <option>General Knowledge</option>
                      <option>Computer Science</option>
                      <option>Mathematics</option>
                      <option>Science</option>
                      <option>Physics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select className="input-field">
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option, index) => (
                      <div key={option} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={index}
                          defaultChecked={editingQuestion?.correctAnswer === index}
                          className="text-primary-dark"
                        />
                        <input
                          type="text"
                          className="input-field flex-1"
                          placeholder={`Option ${option}`}
                          defaultValue={editingQuestion?.options[index] || ''}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="btn-outline px-6 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2"
                  >
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Report Modal */}
      {showCandidateReport && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-dark">
                  Test Report - {selectedCandidate.name}
                </h3>
                <button
                  onClick={() => setShowCandidateReport(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary-dark">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="text-gray-900">{selectedCandidate.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">{selectedCandidate.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Test Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedCandidate.status)}`}>
                        {selectedCandidate.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Payment Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCandidate.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCandidate.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Test Performance */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary-dark">Test Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Best Score:</span>
                      <span className={`font-bold ${selectedCandidate.bestScore >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedCandidate.bestScore}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Percentile:</span>
                      <span className="font-bold text-[#D4AF37]">P{selectedCandidate.percentile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Attempts:</span>
                      <span className="font-bold text-[#D4AF37]">{selectedCandidate.attempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Time Taken:</span>
                      <span className="text-gray-900">{selectedCandidate.timeTaken}m / 30m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Analysis */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-primary-dark mb-4">Security Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tab Switch Analysis */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FaExclamationTriangle className="text-red-500 mr-2" />
                      <h5 className="font-semibold text-gray-800">Tab Switch Activity</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tab Switches:</span>
                        <span className={`text-sm font-medium ${
                          selectedCandidate.tabSwitches === 0 ? 'text-green-600' : 
                          selectedCandidate.tabSwitches >= 3 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {selectedCandidate.tabSwitches}/3
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-medium ${
                          selectedCandidate.tabSwitches === 0 ? 'text-green-600' : 
                          selectedCandidate.tabSwitches >= 3 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {selectedCandidate.tabSwitches === 0 ? 'Clean' : 
                           selectedCandidate.tabSwitches >= 3 ? 'Violation' : 'Warning'}
                        </span>
                      </div>
                      {selectedCandidate.tabSwitches > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-red-700">
                            <strong>Note:</strong> {selectedCandidate.tabSwitches >= 3 ? 
                              'Test was auto-submitted due to 3 tab switches.' : 
                              `${3 - selectedCandidate.tabSwitches} more tab switch${3 - selectedCandidate.tabSwitches === 1 ? '' : 'es'} would have triggered auto-submission.`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning Analysis */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FaExclamationTriangle className="text-orange-500 mr-2" />
                      <h5 className="font-semibold text-gray-800">Warning Activity</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Warnings:</span>
                        <span className={`text-sm font-medium ${
                          selectedCandidate.warnings === 0 ? 'text-green-600' : 
                          selectedCandidate.warnings >= 3 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {selectedCandidate.warnings}/3
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-medium ${
                          selectedCandidate.warnings === 0 ? 'text-green-600' : 
                          selectedCandidate.warnings >= 3 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {selectedCandidate.warnings === 0 ? 'Clean' : 
                           selectedCandidate.warnings >= 3 ? 'Violation' : 'Warning'}
                        </span>
                      </div>
                      {selectedCandidate.warnings > 0 && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                          <p className="text-xs text-orange-700">
                            <strong>Note:</strong> {selectedCandidate.warnings >= 3 ? 
                              'Test was auto-submitted due to 3 warnings.' : 
                              `${3 - selectedCandidate.warnings} more warning${3 - selectedCandidate.warnings === 1 ? '' : 's'} would have triggered auto-submission.`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-Submission Status */}
              {selectedCandidate.autoSubmitted && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <FaClock className="text-red-600 mr-3" />
                    <div>
                      <h5 className="font-semibold text-red-800">Test Auto-Submitted</h5>
                      <p className="text-sm text-red-700">
                        This test was automatically submitted due to security violations. 
                        The candidate exceeded the maximum allowed tab switches or warnings.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCandidateReport(false)}
                  className="btn-outline px-6 py-2"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle download individual report
                    toast.success('Individual report download feature coming soon!');
                  }}
                  className="btn-secondary px-6 py-2"
                >
                  <FaDownload className="mr-2" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 