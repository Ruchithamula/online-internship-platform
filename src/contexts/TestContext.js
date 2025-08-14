import React, { createContext, useContext, useReducer } from 'react';
import toast from 'react-hot-toast';
import softwareEngineeringQuestions from '../utils/softwareEngineeringQuestions';
import { useAuth } from './AuthContext';

const TestContext = createContext();

const initialState = {
  currentTest: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 1800, // 30 minutes in seconds
  testStarted: false,
  testCompleted: false,
  results: null,
  warnings: 0,
  tabSwitches: 0,
  suspiciousActivity: false,
  autoSaveEnabled: true,
  loading: false,
};

const testReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'START_TEST':
      return {
        ...state,
        currentTest: action.payload.test,
        questions: action.payload.questions,
        testStarted: true,
        timeRemaining: 1800,
        currentQuestionIndex: 0,
        answers: {},
        warnings: 0,
        tabSwitches: 0,
        suspiciousActivity: false,
      };
    
    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.answer,
        },
      };
    
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          state.questions.length - 1
        ),
      };
    
    case 'PREV_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      };
    
    case 'GO_TO_QUESTION':
      return {
        ...state,
        currentQuestionIndex: action.payload,
      };
    
    case 'UPDATE_TIMER':
      return {
        ...state,
        timeRemaining: action.payload,
      };
    
    case 'ADD_WARNING':
      return {
        ...state,
        warnings: state.warnings + 1,
        suspiciousActivity: state.warnings + 1 >= 3,
      };
    
    case 'ADD_TAB_SWITCH':
      return {
        ...state,
        tabSwitches: state.tabSwitches + 1,
      };
    
    case 'COMPLETE_TEST':
      return {
        ...state,
        testCompleted: true,
        results: action.payload,
      };
    
    case 'RESET_TEST':
      return {
        ...initialState,
        loading: false,
      };
    
    case 'AUTO_SAVE':
      return {
        ...state,
        answers: {
          ...state.answers,
          ...action.payload,
        },
      };
    
    default:
      return state;
  }
};

// Software Engineering questions database
const sampleQuestions = softwareEngineeringQuestions;

export const TestProvider = ({ children }) => {
  const [state, dispatch] = useReducer(testReducer, initialState);
  const { user } = useAuth();

  // Generate random test questions
  const generateTest = () => {
    const easyQuestions = softwareEngineeringQuestions.filter(q => q.difficulty === 'easy');
    const moderateQuestions = softwareEngineeringQuestions.filter(q => q.difficulty === 'moderate');
    const expertQuestions = softwareEngineeringQuestions.filter(q => q.difficulty === 'expert');

    // Select random questions based on difficulty distribution
    const selectedEasy = easyQuestions.sort(() => 0.5 - Math.random()).slice(0, 18);
    const selectedModerate = moderateQuestions.sort(() => 0.5 - Math.random()).slice(0, 11);
    const selectedExpert = expertQuestions.sort(() => 0.5 - Math.random()).slice(0, 6);

    const allQuestions = [...selectedEasy, ...selectedModerate, ...selectedExpert];
    
    // Shuffle the final array and ensure we have exactly 35 questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 35);
  };

  // Start test
  const startTest = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const questions = generateTest();
      const test = {
        id: 'test_' + Date.now(),
        title: 'Internship Assessment Test',
        duration: 1800, // 30 minutes
        totalQuestions: 35,
        startTime: new Date().toISOString(),
      };
      
      dispatch({
        type: 'START_TEST',
        payload: { test, questions },
      });
      
      toast.success('Test started! Good luck!');
      return true; // Return success
      
    } catch (error) {
      toast.error('Failed to start test. Please try again.');
      return false; // Return failure
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Submit answer
  const submitAnswer = (questionId, answer) => {
    dispatch({
      type: 'SET_ANSWER',
      payload: { questionId, answer },
    });
  };

  // Navigate questions
  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const prevQuestion = () => {
    dispatch({ type: 'PREV_QUESTION' });
  };

  const goToQuestion = (index) => {
    dispatch({ type: 'GO_TO_QUESTION', payload: index });
  };

  // Timer management
  const updateTimer = (timeRemaining) => {
    dispatch({ type: 'UPDATE_TIMER', payload: timeRemaining });
    
    if (timeRemaining <= 0) {
      completeTest();
    }
  };

  // Add warning for suspicious activity
  const addWarning = () => {
    dispatch({ type: 'ADD_WARNING' });
    
    const newWarningCount = state.warnings + 1;
    if (newWarningCount >= 3) {
      toast.error('Maximum warnings reached. Test will be submitted automatically.');
      completeTest();
    } else {
      toast.error(`Warning ${newWarningCount}/3: Suspicious activity detected!`);
    }
  };

  // Add tab switch
  const addTabSwitch = () => {
    dispatch({ type: 'ADD_TAB_SWITCH' });
    
    const newTabSwitchCount = state.tabSwitches + 1;
    if (newTabSwitchCount >= 3) {
      toast.error('Test automatically submitted due to 3 tab switches!');
      completeTest();
    } else {
      toast.error(`Warning: Tab switching detected! (${newTabSwitchCount}/3)`);
    }
  };

  // Complete test and calculate results
  const completeTest = () => {
    const totalQuestions = state.questions.length;
    let correctAnswers = 0;
    
    state.questions.forEach((question, index) => {
      const userAnswer = state.answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 60; // 60% passing criteria
    
    const results = {
      score,
      correctAnswers,
      totalQuestions,
      passed,
      timeTaken: 1800 - state.timeRemaining,
      completedAt: new Date().toISOString(),
      warnings: state.warnings,
      tabSwitches: state.tabSwitches,
      answers: state.answers,
      questions: state.questions.map(q => ({ id: q.id, text: q.text, options: q.options, correctAnswer: q.correctAnswer, difficulty: q.difficulty })),
      testId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userEmail: user?.email,
      userId: user?.id,
      userName: user?.name
    };
    
    // Store results in localStorage
    const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    const updatedResults = [results, ...existingResults]; // Add new result at the beginning
    localStorage.setItem('testResults', JSON.stringify(updatedResults));
    
    // Also store in user's test history
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userTestHistory = userData.testHistory || [];
    const testAttempt = {
      id: results.testId,
      score: results.score,
      correctAnswers: results.correctAnswers,
      totalQuestions: results.totalQuestions,
      timeTaken: results.timeTaken,
      warnings: results.warnings,
      completedAt: results.completedAt,
      passed: results.passed
    };
    userData.testHistory = [testAttempt, ...userTestHistory];
    localStorage.setItem('userData', JSON.stringify(userData));
    
    dispatch({ type: 'COMPLETE_TEST', payload: results });
    
    // Navigate to results page
    window.location.href = '/student/test-results';
    
    if (passed) {
      toast.success(`Congratulations! You passed with ${score}%`);
    } else {
      toast.error(`Test completed. You scored ${score}%. Minimum required: 60%`);
    }
  };

  // Auto-save answers
  const autoSave = (answers) => {
    dispatch({ type: 'AUTO_SAVE', payload: answers });
  };

  // Reset test
  const resetTest = () => {
    dispatch({ type: 'RESET_TEST' });
  };

  const value = {
    ...state,
    startTest,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    updateTimer,
    addWarning,
    addTabSwitch,
    completeTest,
    autoSave,
    resetTest,
  };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
}; 