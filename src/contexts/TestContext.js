import React, { createContext, useContext, useReducer } from 'react';
import toast from 'react-hot-toast';

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

// Web Development Questions Database
const sampleQuestions = [
  // Easy Questions (20 questions)
  {
    id: 1,
    question: "What does HTML stand for?",
    options: ["Hyper Trainer Marking Language", "Hyper Text Marketing Language", "Hyper Text Markup Language", "Hyper Text Main Language"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 2,
    question: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<href>", "<a>", "<hyperlink>"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 3,
    question: "Which property is used in CSS to change the text color of an element?",
    options: ["font-style", "text-color", "color", "text-style"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 4,
    question: "Which HTML element is used for inserting a line break?",
    options: ["<br>", "<lb>", "<break>", "<newline>"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 5,
    question: "What does CSS stand for?",
    options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Colorful Style Sheets"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 6,
    question: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<href>", "<a>", "<hyperlink>"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 7,
    question: "Which property is used in CSS to change the text color of an element?",
    options: ["font-style", "text-color", "color", "text-style"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 8,
    question: "Which HTML element is used for inserting a line break?",
    options: ["<br>", "<lb>", "<break>", "<newline>"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 9,
    question: "What does CSS stand for?",
    options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Colorful Style Sheets"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 10,
    question: "What does HTML stand for?",
    options: ["Hyper Trainer Marking Language", "Hyper Text Marketing Language", "Hyper Text Markup Language", "Hyper Text Main Language"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 11,
    question: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<href>", "<a>", "<hyperlink>"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 12,
    question: "Which property is used in CSS to change the text color of an element?",
    options: ["font-style", "text-color", "color", "text-style"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 13,
    question: "Which HTML element is used for inserting a line break?",
    options: ["<br>", "<lb>", "<break>", "<newline>"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 14,
    question: "What does CSS stand for?",
    options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Colorful Style Sheets"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 15,
    question: "What does HTML stand for?",
    options: ["Hyper Trainer Marking Language", "Hyper Text Marketing Language", "Hyper Text Markup Language", "Hyper Text Main Language"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 16,
    question: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<href>", "<a>", "<hyperlink>"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 17,
    question: "Which property is used in CSS to change the text color of an element?",
    options: ["font-style", "text-color", "color", "text-style"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 18,
    question: "Which HTML element is used for inserting a line break?",
    options: ["<br>", "<lb>", "<break>", "<newline>"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "HTML"
  },
  {
    id: 19,
    question: "What does CSS stand for?",
    options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Colorful Style Sheets"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "CSS"
  },
  {
    id: 20,
    question: "What does HTML stand for?",
    options: ["Hyper Trainer Marking Language", "Hyper Text Marketing Language", "Hyper Text Markup Language", "Hyper Text Main Language"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "HTML"
  },
  
  // Medium Questions (10 questions)
  {
    id: 21,
    question: "Which CSS property controls the text size?",
    options: ["font-size", "text-size", "font-style", "text-style"],
    correctAnswer: 0,
    difficulty: "moderate",
    category: "CSS"
  },
  {
    id: 22,
    question: "Which HTML tag is used to define an internal style sheet?",
    options: ["<style>", "<css>", "<script>", "<link>"],
    correctAnswer: 0,
    difficulty: "moderate",
    category: "HTML"
  },
  {
    id: 23,
    question: "In JavaScript, which keyword is used to declare a variable?",
    options: ["var", "let", "const", "All of the above"],
    correctAnswer: 3,
    difficulty: "moderate",
    category: "JavaScript"
  },
  {
    id: 24,
    question: "Which CSS property is used to make text bold?",
    options: ["font-style", "text-decoration", "font-weight", "text-style"],
    correctAnswer: 2,
    difficulty: "moderate",
    category: "CSS"
  },
  {
    id: 25,
    question: "What does the 'z-index' property in CSS control?",
    options: ["Zoom level", "Stacking order", "Color saturation", "Image resolution"],
    correctAnswer: 1,
    difficulty: "moderate",
    category: "CSS"
  },
  {
    id: 26,
    question: "Which CSS property controls the text size?",
    options: ["font-size", "text-size", "font-style", "text-style"],
    correctAnswer: 0,
    difficulty: "moderate",
    category: "CSS"
  },
  {
    id: 27,
    question: "Which HTML tag is used to define an internal style sheet?",
    options: ["<style>", "<css>", "<script>", "<link>"],
    correctAnswer: 0,
    difficulty: "moderate",
    category: "HTML"
  },
  {
    id: 28,
    question: "In JavaScript, which keyword is used to declare a variable?",
    options: ["var", "let", "const", "All of the above"],
    correctAnswer: 3,
    difficulty: "moderate",
    category: "JavaScript"
  },
  {
    id: 29,
    question: "Which CSS property is used to make text bold?",
    options: ["font-style", "text-decoration", "font-weight", "text-style"],
    correctAnswer: 2,
    difficulty: "moderate",
    category: "CSS"
  },
  {
    id: 30,
    question: "What does the 'z-index' property in CSS control?",
    options: ["Zoom level", "Stacking order", "Color saturation", "Image resolution"],
    correctAnswer: 1,
    difficulty: "moderate",
    category: "CSS"
  },
  
  // Hard Questions (10 questions)
  {
    id: 31,
    question: "Which of the following is true about semantic HTML?",
    options: ["It uses tags for styling only", "It has no effect on SEO", "It provides meaning to the web page structure", "It is deprecated in HTML5"],
    correctAnswer: 2,
    difficulty: "expert",
    category: "HTML"
  },
  {
    id: 32,
    question: "Which method is used in JavaScript to attach an event to an element?",
    options: ["addEvent()", "attachEvent()", "addEventListener()", "bindEvent()"],
    correctAnswer: 2,
    difficulty: "expert",
    category: "JavaScript"
  },
  {
    id: 33,
    question: "What does the 'viewport' meta tag in HTML control?",
    options: ["Image rendering", "Mobile responsiveness", "Font type", "JavaScript execution"],
    correctAnswer: 1,
    difficulty: "expert",
    category: "HTML"
  },
  {
    id: 34,
    question: "Which of the following CSS units is relative to the root element?",
    options: ["em", "px", "rem", "%"],
    correctAnswer: 2,
    difficulty: "expert",
    category: "CSS"
  },
  {
    id: 35,
    question: "Which ARIA attribute is used to describe a live region in HTML?",
    options: ["aria-live", "aria-region", "aria-status", "aria-role"],
    correctAnswer: 0,
    difficulty: "expert",
    category: "HTML"
  },
  {
    id: 36,
    question: "Which of the following is true about semantic HTML?",
    options: ["It uses tags for styling only", "It has no effect on SEO", "It provides meaning to the web page structure", "It is deprecated in HTML5"],
    correctAnswer: 2,
    difficulty: "expert",
    category: "HTML"
  },
  {
    id: 37,
    question: "Which method is used in JavaScript to attach an event to an element?",
    options: ["addEvent()", "attachEvent()", "addEventListener()", "bindEvent()"],
    correctAnswer: 2,
    difficulty: "expert",
    category: "JavaScript"
  },
  {
    id: 38,
    question: "What does the 'viewport' meta tag in HTML control?",
    options: ["Image rendering", "Mobile responsiveness", "Font type", "JavaScript execution"],
    correctAnswer: 1,
    difficulty: "expert",
    category: "HTML"
  },
  {
    id: 39,
    question: "Which of the following CSS units is relative to the root element?",
    options: ["em", "px", "rem", "%"],
    correctAnswer: 2,
    difficulty: "expert",
    category: "CSS"
  },
  {
    id: 40,
    question: "Which ARIA attribute is used to describe a live region in HTML?",
    options: ["aria-live", "aria-region", "aria-status", "aria-role"],
    correctAnswer: 0,
    difficulty: "expert",
    category: "HTML"
  }
];

export const TestProvider = ({ children }) => {
  const [state, dispatch] = useReducer(testReducer, initialState);

  // Generate random test questions
  const generateTest = () => {
    const easyQuestions = sampleQuestions.filter(q => q.difficulty === 'easy');
    const moderateQuestions = sampleQuestions.filter(q => q.difficulty === 'moderate');
    const expertQuestions = sampleQuestions.filter(q => q.difficulty === 'expert');

    // Select random questions based on difficulty distribution
    // 20 easy questions (50%), 10 moderate (25%), 10 expert (25%)
    const selectedEasy = easyQuestions.sort(() => 0.5 - Math.random()).slice(0, 20);
    const selectedModerate = moderateQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
    const selectedExpert = expertQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

    const allQuestions = [...selectedEasy, ...selectedModerate, ...selectedExpert];
    
    // Shuffle the final array and ensure we have exactly 40 questions
    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    return shuffledQuestions.slice(0, 40);
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
        title: 'Web Development Assessment Test',
        duration: 1800, // 30 minutes
        totalQuestions: 40,
        startTime: new Date().toISOString(),
      };
      
      dispatch({
        type: 'START_TEST',
        payload: { test, questions },
      });
      
      toast.success('Test started! Good luck!');
      return true; // Return success status
      
    } catch (error) {
      toast.error('Failed to start test. Please try again.');
      return false; // Return failure status
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
    
    state.questions.forEach((question) => {
      const userAnswer = state.answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 60; // 60% passing criteria (24/40 questions)
    
    const results = {
      score,
      correctAnswers,
      totalQuestions,
      passed,
      timeTaken: 1800 - state.timeRemaining,
      completedAt: new Date().toISOString(),
      warnings: state.warnings,
      tabSwitches: state.tabSwitches,
    };
    
    dispatch({ type: 'COMPLETE_TEST', payload: results });
    
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