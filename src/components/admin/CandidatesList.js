import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaEye, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff,
  FaDownload,
  FaFileCsv,
  FaFileExcel,
  FaFileAlt,
  FaSync,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaGraduationCap,
  FaUniversity,
  FaMapMarkerAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadCandidates = useCallback(() => {
    try {
      // Load both registered users and OTP users
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const otpUsers = JSON.parse(localStorage.getItem('otpUsers') || '[]');
      
      // Create a map to deduplicate by email (prioritize registered users)
      const emailMap = new Map();
      
      // Add registered users first
      registeredUsers.forEach(user => {
        emailMap.set(user.email.toLowerCase(), {
          ...user,
          id: user.id || `reg_${Date.now()}_${Math.random()}`,
          registrationType: 'Registered',
          attempts: user.attempts || 0,
          bestScore: user.bestScore || 0,
          percentile: user.percentile || 0,
          lastAttempt: user.lastAttempt || 'Never',
          status: user.status || 'pending',
          testsEnabled: user.testsEnabled !== false
        });
      });
      
      // Add OTP users (only if not already present)
      otpUsers.forEach(user => {
        if (!emailMap.has(user.email.toLowerCase())) {
          emailMap.set(user.email.toLowerCase(), {
            ...user,
            id: user.id || `otp_${Date.now()}_${Math.random()}`,
            registrationType: 'OTP Login',
            attempts: user.attempts || 0,
            bestScore: user.bestScore || 0,
            percentile: user.percentile || 0,
            lastAttempt: user.lastAttempt || 'Never',
            status: user.status || 'pending',
            testsEnabled: user.testsEnabled !== false
          });
        }
      });
      
      const allCandidates = Array.from(emailMap.values());
      setCandidates(allCandidates);
      setFilteredCandidates(allCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
      setCandidates([]);
      setFilteredCandidates([]);
    }
  }, []);

  const filterAndSortCandidates = useCallback(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort candidates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'score':
          return (b.bestScore || 0) - (a.bestScore || 0);
        case 'date':
          return new Date(b.lastAttempt || 0) - new Date(a.lastAttempt || 0);
        default:
          return 0;
      }
    });

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    filterAndSortCandidates();
  }, [filterAndSortCandidates]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadCandidates();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadCandidates]);

  const handleDeleteCandidate = (candidateId) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate) return;

      // Remove from both registeredUsers and otpUsers
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const otpUsers = JSON.parse(localStorage.getItem('otpUsers') || '[]');

      const updatedRegisteredUsers = registeredUsers.filter(user => 
        user.email.toLowerCase() !== candidate.email.toLowerCase()
      );
      const updatedOtpUsers = otpUsers.filter(user => 
        user.email.toLowerCase() !== candidate.email.toLowerCase()
      );

      localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
      localStorage.setItem('otpUsers', JSON.stringify(updatedOtpUsers));

      toast.success('Candidate deleted successfully');
      loadCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const handleToggleTests = (candidateId) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate) return;

      const updatedCandidates = candidates.map(c => 
        c.id === candidateId 
          ? { ...c, testsEnabled: !c.testsEnabled }
          : c
      );

      setCandidates(updatedCandidates);
      
      // Update localStorage
      if (candidate.registrationType === 'Registered') {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedRegisteredUsers = registeredUsers.map(user => 
          user.email.toLowerCase() === candidate.email.toLowerCase()
            ? { ...user, testsEnabled: !candidate.testsEnabled }
            : user
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
      } else {
        const otpUsers = JSON.parse(localStorage.getItem('otpUsers') || '[]');
        const updatedOtpUsers = otpUsers.map(user => 
          user.email.toLowerCase() === candidate.email.toLowerCase()
            ? { ...user, testsEnabled: !candidate.testsEnabled }
            : user
        );
        localStorage.setItem('otpUsers', JSON.stringify(updatedOtpUsers));
      }

      toast.success(`Tests ${!candidate.testsEnabled ? 'enabled' : 'disabled'} for ${candidate.name}`);
    } catch (error) {
      console.error('Error toggling tests:', error);
      toast.error('Failed to toggle tests');
    }
  };

  const handleDownloadMeritList = async (format) => {
    setIsDownloading(true);
    setShowDownloadMenu(false);
    
    try {
      const data = filteredCandidates.map(candidate => ({
        Name: candidate.name,
        Email: candidate.email,
        RegistrationType: candidate.registrationType,
        Attempts: candidate.attempts,
        BestScore: candidate.bestScore,
        Percentile: candidate.percentile,
        LastAttempt: candidate.lastAttempt,
        Status: candidate.status,
        TestsEnabled: candidate.testsEnabled
      }));

      let content, filename, mimeType;

      switch (format) {
        case 'csv':
          const csvContent = [
            Object.keys(data[0] || {}).join(','),
            ...data.map(row => Object.values(row).join(','))
          ].join('\n');
          content = csvContent;
          filename = 'candidates.csv';
          mimeType = 'text/csv';
          break;
        case 'excel':
          // For Excel, we'll create a CSV that Excel can open
          const excelContent = [
            Object.keys(data[0] || {}).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
          ].join('\n');
          content = excelContent;
          filename = 'candidates.xls';
          mimeType = 'application/vnd.ms-excel';
          break;
        case 'json':
          content = JSON.stringify(data, null, 2);
          filename = 'candidates.json';
          mimeType = 'application/json';
          break;
        default:
          throw new Error('Unsupported format');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Candidates list downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download candidates list');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      passed: { 
        color: 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg', 
        text: 'Completed' 
      },
      failed: { 
        color: 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg', 
        text: 'Failed' 
      },
      pending: { 
        color: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg', 
        text: 'Pending' 
      },
      in_progress: { 
        color: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg', 
        text: 'In Progress' 
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color} transform hover:scale-105 transition-transform`}>
        {config.text}
      </span>
    );
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedCandidate(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Candidates</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadCandidates}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            title="Refresh candidates list"
          >
            <FaSync className="mr-2" />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              disabled={isDownloading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FaDownload className="mr-2" />
              {isDownloading ? 'Downloading...' : 'Download List'}
            </button>
            
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    onClick={() => handleDownloadMeritList('csv')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaFileCsv className="mr-2" />
                    Download as CSV
                  </button>
                  <button
                    onClick={() => handleDownloadMeritList('excel')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaFileExcel className="mr-2" />
                    Download as Excel
                  </button>
                  <button
                    onClick={() => handleDownloadMeritList('json')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaFileAlt className="mr-2" />
                    Download as JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="passed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="score">Sort by Score</option>
          <option value="date">Sort by Date</option>
        </select>
        <div className="text-sm text-gray-600 flex items-center">
          Total: {filteredCandidates.length} candidates
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Best Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Attempt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tests Enabled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                  No candidates found
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {candidate.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {candidate.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      candidate.registrationType === 'Registered' 
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg'
                    } transform hover:scale-105 transition-transform`}>
                      {candidate.registrationType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.attempts || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.bestScore || 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.percentile || 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.lastAttempt || 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(candidate.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleTests(candidate.id)}
                      className="text-2xl text-blue-600 hover:text-blue-800"
                      title={`${candidate.testsEnabled ? 'Disable' : 'Enable'} tests for ${candidate.name}`}
                    >
                      {candidate.testsEnabled ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(candidate)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete candidate"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Candidate Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Personal Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-blue-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{selectedCandidate.name || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-blue-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedCandidate.email || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-blue-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedCandidate.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaCalendar className="text-blue-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{selectedCandidate.dateOfBirth || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaMapMarkerAlt className="text-blue-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedCandidate.location || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Academic Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaGraduationCap className="text-green-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Current Education</p>
                        <p className="font-medium">{selectedCandidate.currentEducation || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaUniversity className="text-green-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Institution</p>
                        <p className="font-medium">{selectedCandidate.institution || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-green-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Registration Type</p>
                        <p className="font-medium">{selectedCandidate.registrationType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Performance */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Test Performance
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-purple-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Total Attempts</p>
                        <p className="font-medium">{selectedCandidate.attempts || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-purple-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Best Score</p>
                        <p className="font-medium">{selectedCandidate.bestScore || 0}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-purple-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Percentile</p>
                        <p className="font-medium">{selectedCandidate.percentile || 0}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaCalendar className="text-purple-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Last Attempt</p>
                        <p className="font-medium">{selectedCandidate.lastAttempt || 'Never'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-purple-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div>{getStatusBadge(selectedCandidate.status)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaToggleOn className="text-purple-500 w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-500">Tests Enabled</p>
                        <p className="font-medium">{selectedCandidate.testsEnabled ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Additional Information
                  </h4>
                  
                  <div className="space-y-3">
                    {selectedCandidate.interests && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Interests</p>
                        <p className="font-medium">{selectedCandidate.interests}</p>
                      </div>
                    )}
                    
                    {selectedCandidate.experience && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Experience</p>
                        <p className="font-medium">{selectedCandidate.experience}</p>
                      </div>
                    )}
                    
                    {selectedCandidate.skills && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Skills</p>
                        <p className="font-medium">{selectedCandidate.skills}</p>
                      </div>
                    )}
                    
                    {selectedCandidate.registrationDate && (
                      <div className="flex items-center space-x-3">
                        <FaCalendar className="text-orange-500 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Registration Date</p>
                          <p className="font-medium">{selectedCandidate.registrationDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesList; 