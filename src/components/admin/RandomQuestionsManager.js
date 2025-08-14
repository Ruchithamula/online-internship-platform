import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaRandom, 
  FaCog, 
  FaSave, 
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaDownload,
  FaUpload,
  FaChartBar,
  FaQuestionCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const RandomQuestionsManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);

  // Randomization settings
  const [randomSettings, setRandomSettings] = useState({
    totalQuestions: 35,
    easyPercentage: 30,
    moderatePercentage: 50,
    expertPercentage: 20,
    categoryDistribution: {},
    shuffleOptions: true,
    preventDuplicates: true,
    timeLimit: 60
  });

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'moderate',
    category: '',
    explanation: '',
    isActive: true
  });

  useEffect(() => {
    fetchQuestions();
    fetchRandomSettings();
  }, []);

  const fetchRandomSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/random-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const settings = await response.json();
        setRandomSettings(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error fetching random settings:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/questions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        toast.error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'moderate',
      category: '',
      explanation: '',
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.text || question.question,
      options: JSON.parse(question.options || '[]'),
      correctAnswer: question.correct_answer || question.correctAnswer,
      difficulty: question.difficulty,
      category: question.category,
      explanation: question.explanation || '',
      isActive: question.active !== false
    });
    setShowAddModal(true);
  };

  const handleSaveQuestion = async () => {
    try {
      if (!questionForm.question.trim()) {
        toast.error('Question text is required');
        return;
      }

      if (questionForm.options.some(opt => !opt.trim())) {
        toast.error('All options must be filled');
        return;
      }

      if (!questionForm.category.trim()) {
        toast.error('Category is required');
        return;
      }

      const token = localStorage.getItem('authToken');
      const url = editingQuestion 
        ? `http://localhost:5000/api/questions/${editingQuestion.id}`
        : 'http://localhost:5000/api/questions';
      
      const method = editingQuestion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: questionForm.question,
          options: JSON.stringify(questionForm.options),
          correct_answer: questionForm.correctAnswer,
          difficulty: questionForm.difficulty,
          category: questionForm.category,
          explanation: questionForm.explanation,
          active: questionForm.isActive
        })
      });

      if (response.ok) {
        toast.success(editingQuestion ? 'Question updated successfully' : 'Question added successfully');
        setShowAddModal(false);
        fetchQuestions();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save question');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/questions/${questionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('Question deleted successfully');
          fetchQuestions();
        } else {
          toast.error('Failed to delete question');
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
      }
    }
  };

  const handleToggleQuestion = async (questionId, isActive) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !isActive })
      });

      if (response.ok) {
        toast.success(`Question ${isActive ? 'deactivated' : 'activated'} successfully`);
        fetchQuestions();
      } else {
        toast.error('Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const generateRandomQuestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/generate-random-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          totalQuestions: randomSettings.totalQuestions,
          easyPercentage: randomSettings.easyPercentage,
          moderatePercentage: randomSettings.moderatePercentage,
          expertPercentage: randomSettings.expertPercentage,
          categories: filterCategory === 'all' ? [] : [filterCategory],
          shuffleOptions: randomSettings.shuffleOptions,
          preventDuplicates: randomSettings.preventDuplicates
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewQuestions(data.questions);
        setShowPreview(true);
        toast.success(`Generated ${data.questions.length} random questions successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to generate random questions');
      }
    } catch (error) {
      console.error('Error generating random questions:', error);
      toast.error('Failed to generate random questions');
    }
  };

  const saveRandomSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/random-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(randomSettings)
      });

      if (response.ok) {
        toast.success('Random settings saved successfully');
        setShowSettingsModal(false);
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(questions.map(q => q.category))];
  const difficulties = ['easy', 'moderate', 'expert'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Random Questions Manager</h2>
          <p className="text-gray-600">Manage and configure random question generation</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaCog className="mr-2" />
            Settings
          </button>
          <button
            onClick={handleAddQuestion}
            className="flex items-center px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-dark/90 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Question
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaQuestionCircle className="text-blue-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold">{questions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaRandom className="text-green-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Questions</p>
              <p className="text-2xl font-bold">{questions.filter(q => q.active !== false).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaChartBar className="text-purple-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
                            <FaRandom className="text-orange-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Ready for Random</p>
              <p className="text-2xl font-bold">{filteredQuestions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
            >
              <option value="all">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateRandomQuestions}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaRandom className="mr-2" />
              Generate Random
            </button>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {question.text || question.question}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {question.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleQuestion(question.id, question.active !== false)}
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        question.active !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {question.active !== false ? <FaEye className="mr-1" /> : <FaEyeSlash className="mr-1" />}
                      {question.active !== false ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-900"
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

      {/* Add/Edit Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                  placeholder="Enter the question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={questionForm.category}
                  onChange={(e) => setQuestionForm({...questionForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                  placeholder="Enter category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={questionForm.difficulty}
                  onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={questionForm.correctAnswer === index}
                      onChange={() => setQuestionForm({...questionForm, correctAnswer: index})}
                      className="text-primary-dark focus:ring-primary-dark"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm({...questionForm, options: newOptions});
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                  placeholder="Enter explanation for the correct answer..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={questionForm.isActive}
                  onChange={(e) => setQuestionForm({...questionForm, isActive: e.target.checked})}
                  className="text-primary-dark focus:ring-primary-dark"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active (available for random selection)
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-dark/90 transition-colors"
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Random Questions Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                <input
                  type="number"
                  value={randomSettings.totalQuestions}
                  onChange={(e) => setRandomSettings({...randomSettings, totalQuestions: parseInt(e.target.value)})}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Easy Questions (%)</label>
                <input
                  type="number"
                  value={randomSettings.easyPercentage}
                  onChange={(e) => setRandomSettings({...randomSettings, easyPercentage: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moderate Questions (%)</label>
                <input
                  type="number"
                  value={randomSettings.moderatePercentage}
                  onChange={(e) => setRandomSettings({...randomSettings, moderatePercentage: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expert Questions (%)</label>
                <input
                  type="number"
                  value={randomSettings.expertPercentage}
                  onChange={(e) => setRandomSettings({...randomSettings, expertPercentage: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shuffleOptions"
                  checked={randomSettings.shuffleOptions}
                  onChange={(e) => setRandomSettings({...randomSettings, shuffleOptions: e.target.checked})}
                  className="text-primary-dark focus:ring-primary-dark"
                />
                <label htmlFor="shuffleOptions" className="ml-2 text-sm text-gray-700">
                  Shuffle answer options
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="preventDuplicates"
                  checked={randomSettings.preventDuplicates}
                  onChange={(e) => setRandomSettings({...randomSettings, preventDuplicates: e.target.checked})}
                  className="text-primary-dark focus:ring-primary-dark"
                />
                <label htmlFor="preventDuplicates" className="ml-2 text-sm text-gray-700">
                  Prevent duplicate questions in same test
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRandomSettings}
                className="px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-dark/90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Random Questions Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {previewQuestions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {question.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-900 mb-3">{question.text || question.question}</p>
                  <div className="space-y-1">
                    {JSON.parse(question.options || '[]').map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                        <span className="text-sm text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Here you would implement the logic to save this as a test template
                  toast.success('Random questions generated successfully!');
                  setShowPreview(false);
                }}
                className="px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-dark/90 transition-colors"
              >
                Use This Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomQuestionsManager;
