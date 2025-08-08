import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUser, 
  FaEdit, 
  FaCheck, 
  FaTimes,
  FaCamera,
  FaPhone,
  FaEnvelope,
  FaUniversity,
  FaCalendarAlt,
  FaBook,
  FaTrophy,
  FaCertificate,
  FaChartLine,
  FaDownload,
  FaEye,
  FaStar,
  FaSignOutAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Added for navigation

const StudentProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    college: user?.college || '',
    graduationYear: user?.graduationYear || '',
    course: user?.course || '',
    branch: user?.branch || '',
    cgpa: user?.cgpa || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    portfolio: user?.portfolio || '',
    skills: user?.skills || [],
    bio: user?.bio || ''
  });

  const [testHistory] = useState([
    {
      id: 1,
      date: '2024-01-15',
      score: 85,
      totalQuestions: 35,
      correctAnswers: 30,
      timeTaken: 25,
      percentile: 92,
      isPassed: true,
      rank: 15,
      totalCandidates: 150,
      certificateUrl: '/certificates/cert1.pdf',
      certificateId: 'CERT001'
    },
    {
      id: 2,
      date: '2024-01-10',
      score: 72,
      totalQuestions: 35,
      correctAnswers: 25,
      timeTaken: 28,
      percentile: 78,
      isPassed: true,
      rank: 45,
      totalCandidates: 150,
      certificateUrl: '/certificates/cert2.pdf',
      certificateId: 'CERT002'
    }
  ]);

  const [profileImage, setProfileImage] = useState(user?.profileImage || '/default-avatar.png');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!user?.profileComplete) {
      setIsEditing(true);
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!profileData.name || !profileData.phone || !profileData.college) {
      toast.error('Please fill in all required fields');
      return;
    }

    const success = await updateProfile(profileData);
    if (success) {
      setIsEditing(false);
      // Redirect to dashboard after profile completion
      navigate('/student/dashboard');
      toast.success('Profile updated successfully! Redirecting to dashboard...');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setIsUploading(true);

      // Simulate upload
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileImage(e.target.result);
          toast.success('Profile picture updated successfully!');
        };
        reader.readAsDataURL(file);
        setIsUploading(false);
      }, 1000);
    }
  };

  const addSkill = (skill) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, skill]
      });
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const averageScore = testHistory.length > 0 
    ? Math.round(testHistory.reduce((sum, test) => sum + test.score, 0) / testHistory.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header with Logout */}
      <header className="bg-white shadow-lg border-b-2 border-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-dark">Student Profile</h1>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary-dark">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-accent-red hover:text-red-600 transition-colors"
                >
                  {isEditing ? <FaTimes /> : <FaEdit />}
                </button>
              </div>

              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gold-200"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-gold-500 text-white p-2 rounded-full cursor-pointer hover:bg-gold-600 transition-colors">
                      <FaCamera />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {isUploading && (
                  <div className="mt-2 text-sm text-gray-500">Uploading...</div>
                )}
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    <input
                      type="text"
                      value={profileData.course}
                      onChange={(e) => setProfileData({ ...profileData, course: e.target.value })}
                      className="input-field"
                      placeholder="e.g., B.Tech, BCA, MCA"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch/Specialization
                    </label>
                    <input
                      type="text"
                      value={profileData.branch}
                      onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Computer Science, IT"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        value={profileData.graduationYear}
                        onChange={(e) => setProfileData({ ...profileData, graduationYear: e.target.value })}
                        className="input-field"
                        placeholder="2024"
                        min="2020"
                        max="2030"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={profileData.cgpa}
                        onChange={(e) => setProfileData({ ...profileData, cgpa: e.target.value })}
                        className="input-field"
                        placeholder="8.5"
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="input-field"
                      rows="3"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profileData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-gold-600 hover:text-gold-800"
                          >
                            <FaTimes size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a skill"
                        className="input-field flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSkill(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add a skill"]');
                          if (input.value) {
                            addSkill(input.value);
                            input.value = '';
                          }
                        }}
                        className="btn-secondary px-4"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                      className="input-field"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      value={profileData.github}
                      onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                      className="input-field"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      value={profileData.portfolio}
                      onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
                      className="input-field"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  
                  <button
                    onClick={handleProfileUpdate}
                    className="btn-primary w-full"
                  >
                    <FaCheck className="mr-2" />
                    Next
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
                  
                  {user?.skills && user.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Start Test Section */}
            <div className="card">
              <h2 className="text-xl font-semibold text-primary-dark mb-6">Start Your Assessment Test</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">35</span>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Questions</h3>
                  <p className="text-sm text-blue-600">Comprehensive assessment covering software engineering concepts</p>
                  <div className="mt-3 text-xs text-blue-500">
                    • Multiple choice questions<br/>
                    • Single correct answer<br/>
                    • No negative marking
                  </div>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200 hover:shadow-lg transition-shadow">
                  <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold">30</span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Time Limit</h3>
                  <p className="text-sm text-green-600">Minutes to complete the entire assessment</p>
                  <div className="mt-3 text-xs text-green-500">
                    • Timer starts immediately<br/>
                    • Auto-submit when time expires<br/>
                    • No pause functionality
                  </div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold">60%</span>
                  </div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Passing Criteria</h3>
                  <p className="text-sm text-purple-600">Minimum score required to pass the assessment</p>
                  <div className="mt-3 text-xs text-purple-500">
                    • Merit-based ranking<br/>
                    • Certificate on completion<br/>
                    • Detailed performance report
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-white p-2 rounded-full mr-3 mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Important Test Rules</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• <strong>No electronic devices:</strong> Earphones, earbuds, or any external devices are strictly prohibited</li>
                      <li>• <strong>No screenshots:</strong> Taking screenshots or screen recordings is not allowed</li>
                      <li>• <strong>No tab switching:</strong> Stay on the test page throughout the assessment</li>
                      <li>• <strong>Test fee:</strong> ₹250 + GST = ₹295 (non-refundable once started)</li>
                      <li>• <strong>Maximum attempts:</strong> 3 attempts allowed per student</li>
                      <li>• <strong>Anti-cheating:</strong> System monitors for suspicious activities</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => window.location.href = '/student/dashboard'}
                  className="btn-primary px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Test Now
                </button>
                <p className="text-sm text-gray-500 mt-2">Click to begin your assessment test</p>
              </div>
            </div>

            {/* Test History */}
            <div className="card">
              <h2 className="text-xl font-semibold text-primary-dark mb-6">Test History</h2>
              
              {testHistory.length > 0 ? (
                <div className="space-y-4">
                  {testHistory.map((test) => (
                    <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">Internship Assessment Test</h3>
                          <p className="text-sm text-gray-500">{new Date(test.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getPerformanceColor(test.score)}`}>
                            {test.score}%
                          </span>
                          <p className="text-sm text-gray-500">{getPerformanceLabel(test.score)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Questions:</span>
                          <span className="ml-2 font-medium">{test.correctAnswers}/{test.totalQuestions}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-2 font-medium">{test.timeTaken} min</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Percentile:</span>
                          <span className="ml-2 font-medium">{test.percentile}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rank:</span>
                          <span className="ml-2 font-medium">{test.rank}/{test.totalCandidates}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center">
                          {test.isPassed ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              Passed
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              Failed
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="btn-outline text-sm px-3 py-1">
                            <FaEye className="mr-1" />
                            View Details
                          </button>
                          {test.isPassed && (
                            <button className="btn-secondary text-sm px-3 py-1">
                              <FaDownload className="mr-1" />
                              Certificate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaCertificate className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p>No test attempts yet</p>
                  <p className="text-sm">Complete your first test to see your history here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 