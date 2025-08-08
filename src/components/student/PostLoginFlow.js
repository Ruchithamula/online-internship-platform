import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaFileContract,
  FaPlay,
  FaUserCheck,
  FaArrowRight,
  FaSignOutAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import YugaYatraLogo from '../common/YugaYatraLogo';

const PostLoginFlow = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check user's current status
  const [userStatus, setUserStatus] = useState({
    termsAccepted: user?.termsAccepted || false,
    profileComplete: user?.profileComplete || false,
    testCompleted: user?.testCompleted || false,
    testStarted: user?.testStarted || false
  });

  useEffect(() => {
    // Determine current step based on user status (removed payment step)
    if (!userStatus.profileComplete) {
      setCurrentStep(1);
    } else if (!userStatus.termsAccepted) {
      setCurrentStep(2);
    } else if (!userStatus.testCompleted && !userStatus.testStarted) {
      setCurrentStep(3);
    } else if (userStatus.testStarted && !userStatus.testCompleted) {
      setCurrentStep(4);
    } else {
      setCurrentStep(5);
    }
  }, [userStatus]);

  const handleTermsAccept = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions to continue');
      return;
    }

    setLoading(true);
    try {
      // Update user status in localStorage
      const updatedUser = { ...user, termsAccepted: true };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      setUserStatus(prev => ({ ...prev, termsAccepted: true }));
      setCurrentStep(3); // Skip to test start step
      toast.success('Terms accepted successfully! You can now start the test.');
    } catch (error) {
      toast.error('Failed to update terms acceptance');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    // Navigate to profile page where user can complete their profile
    navigate('/student/profile');
  };

  const handleStartTest = () => {
    navigate('/student/dashboard');
  };

  const handleViewResults = () => {
    navigate('/student/results');
  };

  const steps = [
    {
      id: 1,
      title: 'Complete Profile',
      description: 'Update your profile information',
      icon: FaUserCheck,
      status: userStatus.profileComplete ? 'completed' : 'current',
      action: handleProfileComplete,
      actionText: 'Next',
      component: (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          <p className="text-gray-600 mb-4">
            Please complete your profile with accurate information including your educational details, 
            contact information, and other required fields.
          </p>
          <div className="space-y-3">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Personal Information</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Educational Background</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Contact Details</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Terms & Conditions',
      description: 'Read and accept the terms',
      icon: FaFileContract,
      status: userStatus.termsAccepted ? 'completed' : 'current',
      action: handleTermsAccept,
      actionText: 'Accept Terms',
      component: (
        <div className="bg-white rounded-lg p-6 border border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Test Rules and Guidelines</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You must complete the test independently without any external assistance</li>
                <li>Switching tabs or applications during the test is strictly prohibited</li>
                <li>Using keyboard shortcuts (Ctrl+C, Ctrl+V, etc.) is not allowed</li>
                <li>Right-clicking is disabled during the test</li>
                <li>You will receive warnings for any suspicious activity</li>
                <li>After 3 warnings, the test will be automatically submitted</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Test Duration and Format</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The test consists of 35 multiple-choice questions</li>
                <li>Questions are randomly selected from our question bank</li>
                <li>You have unlimited time to complete the test</li>
                <li>You can review and change your answers before submission</li>
                <li>Once submitted, answers cannot be modified</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Scoring and Results</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Each correct answer earns you points</li>
                <li>Passing score is 60% or higher</li>
                <li>Results will be displayed immediately after submission</li>
                <li>You can retake the test up to 3 times</li>
                <li>Your best score will be considered for evaluation</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Privacy and Data</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Your personal information will be kept confidential</li>
                <li>Test results may be shared with potential employers</li>
                <li>We may use your data for improving our services</li>
                <li>You can request deletion of your data at any time</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">5. Technical Requirements</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Stable internet connection is required</li>
                <li>Use a modern web browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Ensure your device has sufficient battery life</li>
                <li>Close unnecessary applications before starting the test</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-yellow-800 mb-1">Important Notice</h5>
                <p className="text-sm text-yellow-700">
                  By accepting these terms, you acknowledge that you understand the test rules and agree to follow them. 
                  Any violation may result in test disqualification.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded border-gray-300 text-primary-dark focus:ring-primary-dark"
              />
              <span className="ml-2 text-sm text-gray-700">
                I have read and agree to the Terms and Conditions
              </span>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Start Test',
      description: 'Begin your assessment',
      icon: FaPlay,
      status: (!userStatus.testCompleted && !userStatus.testStarted) ? 'current' : 'completed',
      action: handleStartTest,
      actionText: 'Start Test',
      component: (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Start Your Test</h3>
          <p className="text-gray-600 mb-6">
            You're all set to begin your software engineering assessment. The test will include questions 
            covering various topics in software development and engineering.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Test Overview</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-semibold">35</span>
              </div>
              <div className="flex justify-between">
                <span>Question Types:</span>
                <span className="font-semibold">Multiple Choice</span>
              </div>
              <div className="flex justify-between">
                <span>Time Limit:</span>
                <span className="font-semibold">No Time Limit</span>
              </div>
              <div className="flex justify-between">
                <span>Passing Score:</span>
                <span className="font-semibold">60%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Profile completed</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Terms accepted</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Test ready to start</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Test in Progress',
      description: 'Complete your assessment',
      icon: FaClock,
      status: (userStatus.testStarted && !userStatus.testCompleted) ? 'current' : 'completed',
      action: handleStartTest,
      actionText: 'Continue Test',
      component: (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test in Progress</h3>
          <p className="text-gray-600 mb-4">
            You have an active test session. You can continue from where you left off or start a new test.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaClock className="text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">Test session is active</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Test Completed',
      description: 'View your results',
      icon: FaCheckCircle,
      status: userStatus.testCompleted ? 'completed' : 'current',
      action: handleViewResults,
      actionText: 'View Results',
      component: (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Completed</h3>
          <p className="text-gray-600 mb-4">
            Congratulations! You have completed your assessment. You can now view your detailed results 
            and performance analysis.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-600 mr-2" />
              <span className="text-sm text-green-800">Assessment completed successfully</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gold-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <YugaYatraLogo className="w-10 h-10" showText={false} />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-primary-dark">Student Setup</h1>
                <p className="text-sm text-gray-600">Complete your profile and start your test</p>
              </div>
            </div>
            <div className="flex items-center">
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
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-primary-dark mb-4">Your Setup Status</h2>
          <div className="flex items-center justify-center space-x-8">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                userStatus.profileComplete 
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
              }`}>
                {userStatus.profileComplete ? '✓' : '1'}
              </div>
              <span className="text-xs font-medium text-gray-700">Profile</span>
              <span className={`text-xs ${
                userStatus.profileComplete ? 'text-green-600' : 'text-orange-600'
              }`}>
                {userStatus.profileComplete ? 'Complete' : 'In Progress'}
              </span>
            </div>
            
            <div className="w-12 h-0.5 bg-gray-300">
              <div className={`h-full ${userStatus.profileComplete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                userStatus.termsAccepted 
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
              }`}>
                {userStatus.termsAccepted ? '✓' : '2'}
              </div>
              <span className="text-xs font-medium text-gray-700">Terms</span>
              <span className={`text-xs ${
                userStatus.termsAccepted ? 'text-green-600' : 'text-orange-600'
              }`}>
                {userStatus.termsAccepted ? 'Accepted' : 'Pending'}
              </span>
            </div>
            
            <div className="w-12 h-0.5 bg-gray-300">
              <div className={`h-full ${userStatus.termsAccepted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                userStatus.testCompleted 
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                  : userStatus.testStarted 
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                    : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
              }`}>
                {userStatus.testCompleted ? '✓' : userStatus.testStarted ? '3' : '3'}
              </div>
              <span className="text-xs font-medium text-gray-700">Test</span>
              <span className={`text-xs ${
                userStatus.testCompleted 
                  ? 'text-green-600' 
                  : userStatus.testStarted 
                    ? 'text-orange-600'
                    : 'text-gray-600'
              }`}>
                {userStatus.testCompleted 
                  ? 'Completed' 
                  : userStatus.testStarted 
                    ? 'In Progress'
                    : 'Not Started'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          {steps.find(step => step.id === currentStep)?.component}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={steps.find(step => step.id === currentStep)?.action}
            disabled={loading}
            className="flex items-center px-8 py-3 bg-primary-dark text-white rounded-lg hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <FaArrowRight className="mr-2" />
            )}
            {steps.find(step => step.id === currentStep)?.actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostLoginFlow; 