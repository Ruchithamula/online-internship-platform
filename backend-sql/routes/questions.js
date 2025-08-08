const express = require('express');
const { executeQuery, executeQuerySingle } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all questions (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const result = await executeQuery('SELECT * FROM questions ORDER BY category, difficulty, id');
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch questions',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get questions by difficulty
router.get('/difficulty/:difficulty', authenticateToken, async (req, res) => {
  try {
    const { difficulty } = req.params;
    
    if (!['easy', 'moderate', 'expert'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level. Must be easy, moderate, or expert.'
      });
    }

    const result = await executeQuery(
      'SELECT * FROM questions WHERE difficulty = ? ORDER BY RANDOM()',
      [difficulty]
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch questions',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching questions by difficulty:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get questions by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    
    const result = await executeQuery(
      'SELECT * FROM questions WHERE category = ? ORDER BY difficulty, id',
      [category]
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch questions',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate test with specified distribution
router.post('/generate-test', authenticateToken, async (req, res) => {
  try {
    const { 
      totalQuestions = 35,
      easyPercentage = 50,
      moderatePercentage = 30,
      expertPercentage = 20,
      categories = null
    } = req.body;

    // Validate percentages
    if (easyPercentage + moderatePercentage + expertPercentage !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentages must sum to 100'
      });
    }

    // Calculate questions per difficulty
    const easyCount = Math.round(totalQuestions * (easyPercentage / 100));
    const moderateCount = Math.round(totalQuestions * (moderatePercentage / 100));
    const expertCount = totalQuestions - easyCount - moderateCount;

    let questions = [];

    // Build category filter
    const categoryFilter = categories && categories.length > 0 
      ? `AND category IN (${categories.map(() => '?').join(',')})`
      : '';

    // Get easy questions
    if (easyCount > 0) {
      const easyResult = await executeQuery(
        `SELECT * FROM questions WHERE difficulty = 'easy' ${categoryFilter} ORDER BY RANDOM() LIMIT ?`,
        categories ? [...categories, easyCount] : [easyCount]
      );
      if (easyResult.success) {
        questions.push(...easyResult.data);
      }
    }

    // Get moderate questions
    if (moderateCount > 0) {
      const moderateResult = await executeQuery(
        `SELECT * FROM questions WHERE difficulty = 'moderate' ${categoryFilter} ORDER BY RANDOM() LIMIT ?`,
        categories ? [...categories, moderateCount] : [moderateCount]
      );
      if (moderateResult.success) {
        questions.push(...moderateResult.data);
      }
    }

    // Get expert questions
    if (expertCount > 0) {
      const expertResult = await executeQuery(
        `SELECT * FROM questions WHERE difficulty = 'expert' ${categoryFilter} ORDER BY RANDOM() LIMIT ?`,
        categories ? [...categories, expertCount] : [expertCount]
      );
      if (expertResult.success) {
        questions.push(...expertResult.data);
      }
    }

    // Shuffle questions
    questions = shuffleArray(questions);

    // Format questions for frontend
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      correctAnswer: q.correct_answer,
      difficulty: q.difficulty,
      category: q.category
    }));

    res.json({
      success: true,
      data: {
        questions: formattedQuestions,
        totalQuestions: formattedQuestions.length,
        distribution: {
          easy: easyCount,
          moderate: moderateCount,
          expert: expertCount
        }
      }
    });

  } catch (error) {
    console.error('Error generating test:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get question statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    // Check if admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const statsResult = await executeQuery(`
      SELECT 
        difficulty,
        category,
        COUNT(*) as count
      FROM questions 
      GROUP BY difficulty, category
      ORDER BY category, difficulty
    `);

    const totalResult = await executeQuery('SELECT COUNT(*) as total FROM questions');
    const difficultyResult = await executeQuery(`
      SELECT difficulty, COUNT(*) as count 
      FROM questions 
      GROUP BY difficulty
    `);
    const categoryResult = await executeQuery(`
      SELECT category, COUNT(*) as count 
      FROM questions 
      GROUP BY category
    `);

    if (statsResult.success && totalResult.success && difficultyResult.success && categoryResult.success) {
      res.json({
        success: true,
        data: {
          total: totalResult.data[0].total,
          byDifficulty: difficultyResult.data,
          byCategory: categoryResult.data,
          detailed: statsResult.data
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }

  } catch (error) {
    console.error('Error fetching question statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = router; 