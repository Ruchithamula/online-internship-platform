import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaChartLine, 
  FaTrophy, 
  FaClock, 
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaDownload,
  FaEye,
  FaCalendarAlt,
  FaTarget,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import certificateGenerator from '../../utils/certificateGenerator';

const StudentProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState({
    testHistory: [],
    performance: {
      overall: { score: 0, percentile: 0, attempts: 0 },
      byCategory: [],
      byDifficulty: [],
      timeAnalysis: []
    },
    achievements: [],
    recommendations: [],
    certificates: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, [selectedTimeframe]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/student/progress?timeframe=${selectedTimeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      } else {
        // Fallback to mock data for demo
        setProgressData(generateMockProgressData());
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setProgressData(generateMockProgressData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockProgressData = () => ({
    testHistory: [
      {
        id: 1,
        date: '2024-01-15',
        score: 85,
        percentile: 92,
        status: 'passed',
        timeTaken: 25,
        totalQuestions: 40,
        correctAnswers: 34,
        category: 'Web Development',
        certificateId: 'CERT-20240115-STU1-ABC123'
      },
      {
        id: 2,
        date: '2024-01-10',
        score: 72,
        percentile: 78,
        status: 'passed',
        timeTaken: 28,
        totalQuestions: 40,
        correctAnswers: 29,
        category: 'Web Development',
        certificateId: 'CERT-20240110-STU1-DEF456'
      },
      {
        id: 3,
        date: '2024-01-05',
        score: 58,
        percentile: 45,
        status: 'failed',
        timeTaken: 30,
        totalQuestions: 40,
        correctAnswers: 23,
        category: 'Web Development',
        certificateId: null
      }
    ],
    performance: {
      overall: { score: 72, percentile: 78, attempts: 3 },
      byCategory: [
        { category: 'HTML', score: 85, questions: 10, correct: 8.5 },
        { category: 'CSS', score: 78, questions: 12, correct: 9.4 },
        { category: 'JavaScript', score: 65, questions: 10, correct: 6.5 },
        { category: 'React', score: 58, questions: 8, correct: 4.6 }
      ],
      byDifficulty: [
        { difficulty: 'Easy', score: 88, questions: 15, correct: 13.2 },
        { difficulty: 'Moderate', score: 72, questions: 15, correct: 10.8 },
        { difficulty: 'Hard', score: 58, questions: 10, correct: 5.8 }
      ],
      timeAnalysis: [
        { range: '0-10 min', count: 0, percentage: 0 },
        { range: '11-20 min', count: 1, percentage: 33.3 },
        { range: '21-30 min', count: 2, percentage: 66.7 }
      ]
    },
    achievements: [
      {
        id: 1,
        title: 'First Test Completion',
        description: 'Successfully completed your first assessment test',
        icon: 'FaCheckCircle',
        date: '2024-01-05',
        unlocked: true
      },
      {
        id: 2,
        title: 'Pass Master',
        description: 'Achieved a passing score in your test',
        icon: 'FaTrophy',
        date: '2024-01-10',
        unlocked: true
      },
      {
        id: 3,
        title: 'Top Performer',
        description: 'Scored in the top 10% of all candidates',
        icon: 'FaTrophy',
        date: '2024-01-15',
        unlocked: true
      },
      {
        id: 4,
        title: 'Speed Demon',
        description: 'Complete a test in under 20 minutes',
        icon: 'FaClock',
        date: null,
        unlocked: false
      }
    ],
    recommendations: [
      {
        id: 1,
        type: 'improvement',
        title: 'Focus on JavaScript',
        description: 'Your JavaScript score is below average. Consider practicing more JavaScript concepts.',
        priority: 'high',
        category: 'JavaScript'
      },
      {
        id: 2,
        type: 'practice',
        title: 'React Fundamentals',
        description: 'Try more React-related questions to improve your understanding.',
        priority: 'medium',
        category: 'React'
      },
      {
        id: 3,
        type: 'time',
        title: 'Time Management',
        description: 'You\'re using most of the allocated time. Practice to improve speed.',
        priority: 'low',
        category: 'General'
      }
    ],
    certificates: [
      {
        id: 1,
        certificateId: 'CERT-20240115-STU1-ABC123',
        date: '2024-01-15',
        score: 85,
        percentile: 92,
        status: 'active',
        downloadUrl: null
      },
      {
        id: 2,
        certificateId: 'CERT-20240110-STU1-DEF456',
        date: '2024-01-10',
        score: 72,
        percentile: 78,
        status: 'active',
        downloadUrl: null
      }
    ]
  });

  const handleDownloadCertificate = async (certificate) => {
    try {
      const testData = progressData.testHistory.find(test => test.certificateId === certificate.certificateId);
      if (testData) {
        const result = certificateGenerator.downloadCertificate(user, {
          score: testData.score,
          percentile: testData.percentile,
          totalQuestions: testData.totalQuestions,
          correctAnswers: testData.correctAnswers,
          timeTaken: testData.timeTaken,
          completionDate: testData.date,
          certificateId: certificate.certificateId
        });
        
        toast.success('Certificate downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handlePreviewCertificate = async (certificate) => {
    try {
      const testData = progressData.testHistory.find(test => test.certificateId === certificate.certificateId);
      if (testData) {
        const result = certificateGenerator.previewCertificate(user, {
          score: testData.score,
          percentile: testData.percentile,
          totalQuestions: testData.totalQuestions,
          correctAnswers: testData.correctAnswers,
          timeTaken: testData.timeTaken,
          completionDate: testData.date,
          certificateId: certificate.certificateId
        });
        
        setSelectedCertificate({ ...certificate, previewUrl: result.previewUrl });
        setShowCertificatePreview(true);
      }
    } catch (error) {
      console.error('Error previewing certificate:', error);
      toast.error('Failed to preview certificate');
    }
  };

  const getStatusIcon = (status) => {
    return status === 'passed' ? 
      <FaCheckCircle className="text-green-500" /> : 
      <FaTimesCircle className="text-red-500" />;
  };

  const getPriorityColor = (priority) => {
    return priority === 'high' ? 'text-red-600' : 
           priority === 'medium' ? 'text-yellow-600' : 'text-blue-600';
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="card text-center">
        <FaChartLine className="text-3xl text-blue-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">{progressData.performance.overall.score}%</h3>
        <p className="text-gray-600">Best Score</p>
        <div className="mt-2 text-sm text-green-600">
          <FaArrowUp className="inline mr-1" />
          +13% improvement
        </div>
      </div>
      
      <div className="card text-center">
        <FaTrophy className="text-3xl text-yellow-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">P{progressData.performance.overall.percentile}</h3>
        <p className="text-gray-600">Percentile</p>
        <div className="mt-2 text-sm text-green-600">
          <FaArrowUp className="inline mr-1" />
          Top {100 - progressData.performance.overall.percentile}%
        </div>
      </div>
      
      <div className="card text-center">
        <FaClock className="text-3xl text-purple-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">{progressData.performance.overall.attempts}</h3>
        <p className="text-gray-600">Tests Taken</p>
        <div className="mt-2 text-sm text-blue-600">
          {3 - progressData.performance.overall.attempts} attempts left
        </div>
      </div>
      
      <div className="card text-center">
        <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-primary-dark">
          {progressData.testHistory.filter(test => test.status === 'passed').length}
        </h3>
        <p className="text-gray-600">Passed Tests</p>
        <div className="mt-2 text-sm text-green-600">
          {Math.round((progressData.testHistory.filter(test => test.status === 'passed').length / progressData.testHistory.length) * 100)}% success rate
        </div>
      </div>
    </div>
  );

  const renderTestHistory = () => (
    <div className="card mb-8">
      <h2 className="text-xl font-semibold text-primary-dark mb-6">Test History</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Percentile</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {progressData.testHistory.map((test) => (
              <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-2" />
                    {new Date(test.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`font-medium ${test.score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                    {test.score}%
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({test.correctAnswers}/{test.totalQuestions})
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-bold text-accent-red">P{test.percentile}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {getStatusIcon(test.status)}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      test.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {test.status.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">
                    {test.timeTaken}m / 30m
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    {test.certificateId && (
                      <>
                        <button
                          onClick={() => handlePreviewCertificate({ certificateId: test.certificateId })}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Preview Certificate"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDownloadCertificate({ certificateId: test.certificateId })}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Download Certificate"
                        >
                          <FaDownload />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPerformanceAnalysis = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Performance by Category</h3>
        <div className="space-y-4">
          {progressData.performance.byCategory.map((category, index) => (
            <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{category.category}</span>
                <span className={`font-bold ${
                  category.score >= 80 ? 'text-green-600' :
                  category.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {category.score}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className={`h-2 rounded-full ${
                      category.score >= 80 ? 'bg-green-500' :
                      category.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${category.score}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {category.correct.toFixed(1)}/{category.questions} correct
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">Performance by Difficulty</h3>
        <div className="space-y-4">
          {progressData.performance.byDifficulty.map((difficulty, index) => (
            <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{difficulty.difficulty}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  difficulty.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  difficulty.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {difficulty.score}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className={`h-2 rounded-full ${
                      difficulty.score >= 80 ? 'bg-green-500' :
                      difficulty.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${difficulty.score}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {difficulty.correct.toFixed(1)}/{difficulty.questions} questions
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="card mb-8">
      <h2 className="text-xl font-semibold text-primary-dark mb-6">Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {progressData.achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              achievement.unlocked 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-center mb-3">
              {achievement.unlocked ? (
                <FaCheckCircle className="text-green-500 text-xl mr-3" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
              )}
              <h3 className={`font-semibold ${
                achievement.unlocked ? 'text-green-800' : 'text-gray-600'
              }`}>
                {achievement.title}
              </h3>
            </div>
            <p className={`text-sm ${
              achievement.unlocked ? 'text-green-700' : 'text-gray-500'
            }`}>
              {achievement.description}
            </p>
            {achievement.unlocked && achievement.date && (
              <p className="text-xs text-green-600 mt-2">
                Unlocked on {new Date(achievement.date).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="card mb-8">
      <h2 className="text-xl font-semibold text-primary-dark mb-6">Learning Recommendations</h2>
      <div className="space-y-4">
        {progressData.recommendations.map((recommendation) => (
          <div key={recommendation.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
            <FaLightbulb className={`text-xl mr-3 mt-1 ${getPriorityColor(recommendation.priority)}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{recommendation.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                  recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {recommendation.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{recommendation.description}</p>
              <div className="mt-2">
                <span className="text-xs text-gray-500">Category: {recommendation.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="card">
      <h2 className="text-xl font-semibold text-primary-dark mb-6">Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {progressData.certificates.map((certificate) => (
          <div key={certificate.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">Certificate #{certificate.certificateId}</h3>
                <p className="text-sm text-gray-600">Issued on {new Date(certificate.date).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                certificate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {certificate.status.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="font-semibold text-gray-800">{certificate.score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentile</p>
                <p className="font-semibold text-accent-red">P{certificate.percentile}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePreviewCertificate(certificate)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
              >
                <FaEye className="mr-1" />
                Preview
              </button>
              <button
                onClick={() => handleDownloadCertificate(certificate)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-1" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-primary-dark">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-dark">My Progress</h1>
              <p className="text-sm text-gray-600">Track your performance and achievements</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        {renderOverviewCards()}

        {/* Test History */}
        {renderTestHistory()}

        {/* Performance Analysis */}
        {renderPerformanceAnalysis()}

        {/* Achievements */}
        {renderAchievements()}

        {/* Recommendations */}
        {renderRecommendations()}

        {/* Certificates */}
        {renderCertificates()}
      </div>

      {/* Certificate Preview Modal */}
      {showCertificatePreview && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-dark">
                  Certificate Preview
                </h3>
                <button
                  onClick={() => setShowCertificatePreview(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <iframe
                  src={selectedCertificate.previewUrl}
                  className="w-full h-96 border border-gray-300 rounded-lg"
                  title="Certificate Preview"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCertificatePreview(false)}
                  className="btn-outline px-6 py-2"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadCertificate(selectedCertificate)}
                  className="btn-primary px-6 py-2"
                >
                  <FaDownload className="mr-2" />
                  Download Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress; 