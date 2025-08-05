const express = require('express');
const { executeQuery, executeQuerySingle, executeQueryRun } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Start a new test attempt - NO PAYMENT VALIDATION
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.user;
    
    // Get the next attempt number for this student
    const getNextAttemptQuery = `
      SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt
      FROM test_attempts 
      WHERE student_id = ?
    `;
    
    const nextAttemptResult = await executeQuery(getNextAttemptQuery, [student_id]);
    
    if (!nextAttemptResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get next attempt number' 
      });
    }
    
    const nextAttempt = nextAttemptResult.data[0].next_attempt;
    
    // Check if student has exceeded maximum attempts (3)
    if (nextAttempt > 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum test attempts (3) exceeded' 
      });
    }
    
    // Create new test attempt
    const createAttemptQuery = `
      INSERT INTO test_attempts (student_id, attempt_number, start_time, status)
      VALUES (?, ?, datetime('now'), 'in_progress')
    `;
    
    const createResult = await executeQuery(createAttemptQuery, [student_id, nextAttempt]);
    
    if (!createResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create test attempt' 
      });
    }
    
    res.json({
      success: true,
      message: 'Test attempt started successfully',
      data: {
        attempt_number: nextAttempt,
        start_time: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error starting test attempt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Complete a test attempt
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.user;
    const { 
      attempt_number, 
      score, 
      total_questions, 
      correct_answers, 
      wrong_answers, 
      unanswered_questions, 
      warnings_count, 
      answers_json 
    } = req.body;
    
    // Calculate duration
    const getStartTimeQuery = `
      SELECT start_time 
      FROM test_attempts 
      WHERE student_id = ? AND attempt_number = ?
    `;
    
    const startTimeResult = await executeQuery(getStartTimeQuery, [student_id, attempt_number]);
    
    if (!startTimeResult.success || startTimeResult.data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test attempt not found' 
      });
    }
    
    const startTime = new Date(startTimeResult.data[0].start_time);
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    
    // Update test attempt with completion data
    const completeAttemptQuery = `
      UPDATE test_attempts 
      SET 
        end_time = ?,
        duration_seconds = ?,
        score = ?,
        total_questions = ?,
        correct_answers = ?,
        wrong_answers = ?,
        unanswered_questions = ?,
        warnings_count = ?,
        status = 'completed',
        answers_json = ?,
        updated_at = datetime('now')
      WHERE student_id = ? AND attempt_number = ?
    `;
    
    const completeResult = await executeQuery(completeAttemptQuery, [
      endTime.toISOString(),
      durationSeconds,
      score,
      total_questions,
      correct_answers,
      wrong_answers,
      unanswered_questions,
      warnings_count,
      answers_json,
      student_id,
      attempt_number
    ]);
    
    if (!completeResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to complete test attempt' 
      });
    }
    
    res.json({
      success: true,
      message: 'Test completed successfully',
      data: {
        attempt_number,
        score,
        duration_seconds: durationSeconds,
        end_time: endTime.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error completing test attempt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get student's test attempts
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if admin or the student themselves
    if (req.user.userType !== 'admin' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const getAttemptsQuery = `
      SELECT 
        ta.*,
        s.name as student_name,
        s.email as student_email
      FROM test_attempts ta
      JOIN students s ON ta.student_id = s.id
      WHERE ta.student_id = ?
      ORDER BY ta.attempt_number DESC
    `;
    
    const result = await executeQuery(getAttemptsQuery, [studentId]);
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch test attempts' 
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
    
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get all test attempts (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const getAllAttemptsQuery = `
      SELECT 
        ta.*,
        s.name as student_name,
        s.email as student_email,
        s.college as student_college
      FROM test_attempts ta
      JOIN students s ON ta.student_id = s.id
      ORDER BY ta.start_time DESC
    `;
    
    const result = await executeQuery(getAllAttemptsQuery);
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch test attempts' 
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
    
  } catch (error) {
    console.error('Error fetching all test attempts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get test statistics (admin only)
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    // Check if admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const getStatsQuery = `
      SELECT 
        COUNT(DISTINCT ta.student_id) as total_students,
        COUNT(ta.id) as total_attempts,
        AVG(ta.score) as average_score,
        COUNT(CASE WHEN ta.score >= 60 THEN 1 END) as passed_attempts,
        COUNT(CASE WHEN ta.score < 60 THEN 1 END) as failed_attempts,
        AVG(ta.duration_seconds) as average_duration,
        COUNT(CASE WHEN ta.warnings_count > 0 THEN 1 END) as attempts_with_warnings
      FROM test_attempts ta
      WHERE ta.status = 'completed'
    `;
    
    const statsResult = await executeQuery(getStatsQuery);
    
    if (!statsResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch statistics' 
      });
    }
    
    const stats = statsResult.data[0];
    const passRate = stats.total_attempts > 0 ? 
      Math.round((stats.passed_attempts / stats.total_attempts) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        ...stats,
        pass_rate: passRate,
        average_duration_minutes: Math.round(stats.average_duration / 60)
      }
    });
    
  } catch (error) {
    console.error('Error fetching test statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router; 