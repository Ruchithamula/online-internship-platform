import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../contexts/TestContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaTrophy, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaHome,
  FaRedo,
  FaDownload,
  FaShare
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import YugaYatraLogo from '../common/YugaYatraLogo';

const TestResults = () => {
  const navigate = useNavigate();
  const { results, resetTest } = useTest();
  const { user } = useAuth();
  
  // Get actual test results from localStorage
  const getLatestTestResult = () => {
    try {
      const storedResults = JSON.parse(localStorage.getItem('testResults') || '[]');
      if (storedResults.length > 0) {
        return storedResults[0]; // Return the most recent result
      }
      return null;
    } catch (error) {
      console.error('Error retrieving test results:', error);
      return null;
    }
  };

  // Get the actual test result (from context or localStorage)
  const actualResults = results || getLatestTestResult();

  if (!actualResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Test Results Found</h2>
            <p className="text-gray-600 mb-6">
              You haven't completed any tests yet. Take a test to see your results here.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/student/test')}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start a Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Passed';
    return 'Failed';
  };

  const handleRetakeTest = () => {
    resetTest();
    navigate('/student/dashboard');
    toast.success('Test reset. You can start a new test from the dashboard.');
  };

  const handleDownloadCertificate = () => {
    if (actualResults.passed) {
      // Simulate certificate download
      toast.loading('Generating certificate...', { duration: 2000 });
      setTimeout(() => {
        toast.success('Certificate downloaded successfully!');
      }, 2000);
    } else {
      toast.error('Certificate is only available for passed tests.');
    }
  };

  const handleShareResults = () => {
    const shareText = `I scored ${actualResults.score}% on the Software Engineering Internship Assessment Test! ${actualResults.passed ? 'Passed! 🎉' : 'Keep learning! 📚'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Test Results',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <YugaYatraLogo className="w-10 h-10" showText={false} />
              <h1 className="text-xl font-bold text-primary-dark ml-3">Test Results</h1>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(actualResults.completedAt)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Result Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            {actualResults.passed ? (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaTrophy className="w-10 h-10 text-green-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <FaTimesCircle className="w-10 h-10 text-red-600" />
              </div>
            )}

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {actualResults.passed ? 'Congratulations!' : 'Test Completed'}
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              {actualResults.passed 
                ? 'You have successfully passed the assessment test!'
                : 'You need to score at least 60% to pass. Keep practicing!'
              }
            </p>

            {/* Score Display */}
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <div className="text-center text-white">
                <div className="text-4xl font-bold">{actualResults.score}%</div>
                <div className="text-sm opacity-90">{getPerformanceLabel(actualResults.score)}</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{actualResults.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {Object.keys(actualResults.answers || {}).length}
              </div>
              <div className="text-sm text-gray-600">Questions Attempted</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-gray-600 mb-2">{actualResults.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {Math.round((actualResults.correctAnswers / actualResults.totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <FaClock className="text-blue-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Time Taken</h3>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(actualResults.timeTaken)}
              </div>
              <div className="text-sm text-gray-600">out of 30:00</div>
              <div className="mt-2 text-xs text-blue-600 font-medium">
                {Math.round((actualResults.timeTaken / 1800) * 100)}% of total time used
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <FaCheckCircle className="text-green-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Attempt Rate</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((Object.keys(actualResults.answers || {}).length / actualResults.totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-gray-600">
                {Object.keys(actualResults.answers || {}).length} of {actualResults.totalQuestions} questions
              </div>
              <div className="mt-2 text-xs text-green-600 font-medium">
                {actualResults.totalQuestions - Object.keys(actualResults.answers || {}).length} questions skipped
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <FaExclamationTriangle className="text-orange-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Warnings</h3>
                  </div>
              <div className="text-2xl font-bold text-orange-600">
                {actualResults.warnings}
                  </div>
              <div className="text-sm text-gray-600">suspicious activities</div>
              <div className="mt-2 text-xs text-orange-600 font-medium">
                {actualResults.warnings >= 3 ? 'Test auto-submitted' : 'Within limits'}
                </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="btn-primary flex items-center justify-center"
            >
              <FaHome className="mr-2" />
              Back to Dashboard
            </button>
            
            {actualResults.passed && (
              <button
                onClick={handleDownloadCertificate}
                className="btn-secondary flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download Certificate
              </button>
            )}
            
            <button
              onClick={handleShareResults}
              className="btn-outline flex items-center justify-center"
            >
              <FaShare className="mr-2" />
              Share Results
            </button>
            
            <button
              onClick={handleRetakeTest}
              className="btn-outline flex items-center justify-center"
            >
              <FaRedo className="mr-2" />
              Retake Test
            </button>
          </div>
        </div>

        {/* Detailed Performance Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Time Analysis */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaClock className="mr-2 text-blue-600" />
                Time Efficiency
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Used:</span>
                  <span className="font-medium">{formatTime(actualResults.timeTaken)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className="font-medium">{formatTime(1800 - actualResults.timeTaken)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Efficiency:</span>
                  <span className={`font-medium ${
                    (actualResults.timeTaken / 1800) * 100 < 80 ? 'text-green-600' : 
                    (actualResults.timeTaken / 1800) * 100 < 90 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round((actualResults.timeTaken / 1800) * 100)}%
                        </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Time per Question:</span>
                  <span className="font-medium">
                    {Object.keys(actualResults.answers || {}).length > 0 
                      ? formatTime(Math.round(actualResults.timeTaken / Object.keys(actualResults.answers || {}).length))
                      : 'N/A'
                    }
                        </span>
                      </div>
                      </div>
                    </div>

            {/* Question Analysis */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaCheckCircle className="mr-2 text-green-600" />
                Question Analysis
                    </h4>
                    <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions Attempted:</span>
                  <span className="font-medium">{Object.keys(actualResults.answers || {}).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions Skipped:</span>
                  <span className="font-medium">{actualResults.totalQuestions - Object.keys(actualResults.answers || {}).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Attempt Rate:</span>
                  <span className={`font-medium ${
                    (Object.keys(actualResults.answers || {}).length / actualResults.totalQuestions) * 100 >= 90 ? 'text-green-600' :
                    (Object.keys(actualResults.answers || {}).length / actualResults.totalQuestions) * 100 >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round((Object.keys(actualResults.answers || {}).length / actualResults.totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className={`font-medium ${
                    (actualResults.correctAnswers / Object.keys(actualResults.answers || {}).length) * 100 >= 80 ? 'text-green-600' :
                    (actualResults.correctAnswers / Object.keys(actualResults.answers || {}).length) * 100 >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Object.keys(actualResults.answers || {}).length > 0 
                      ? Math.round((actualResults.correctAnswers / Object.keys(actualResults.answers || {}).length) * 100)
                      : 0
                    }%
                            </span>
                </div>
                          </div>
                        </div>
                    </div>

          {/* Performance Insights */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Performance Insights</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-700">
                {actualResults.passed && (
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Congratulations! You passed the test with a score of {actualResults.score}%.</span>
                  </li>
                )}
                {!actualResults.passed && (
                  <li className="flex items-start">
                    <FaTimesCircle className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You need to score at least 60% to pass. Your current score is {actualResults.score}%.</span>
                  </li>
                )}
                {Object.keys(actualResults.answers || {}).length < actualResults.totalQuestions && (
                  <li className="flex items-start">
                    <FaExclamationTriangle className="text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You attempted {Object.keys(actualResults.answers || {}).length} out of {actualResults.totalQuestions} questions. Consider attempting more questions next time.</span>
                  </li>
                )}
                {(actualResults.timeTaken / 1800) * 100 > 90 && (
                  <li className="flex items-start">
                    <FaClock className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You used {Math.round((actualResults.timeTaken / 1800) * 100)}% of the available time. Consider managing your time better in future attempts.</span>
                  </li>
                )}
                {actualResults.warnings > 0 && (
                  <li className="flex items-start">
                    <FaExclamationTriangle className="text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You received {actualResults.warnings} warning(s) during the test. Please follow test guidelines more carefully.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults; 