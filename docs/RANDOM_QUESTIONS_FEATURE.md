# Random Questions Feature - Admin Side

## Overview

The Random Questions feature allows administrators to manage and generate random question sets for tests with advanced configuration options. This feature provides a comprehensive interface for question management and randomization settings.

## Features

### 1. Question Management
- **Add Questions**: Create new questions with multiple choice options
- **Edit Questions**: Modify existing questions, options, and settings
- **Delete Questions**: Remove questions from the database
- **Toggle Active Status**: Enable/disable questions for random selection
- **Search and Filter**: Find questions by text, category, or difficulty

### 2. Random Question Generation
- **Configurable Distribution**: Set percentage distribution for easy, moderate, and expert questions
- **Category Filtering**: Generate questions from specific categories
- **Option Shuffling**: Randomize answer options to prevent memorization
- **Duplicate Prevention**: Ensure no duplicate questions in the same test
- **Preview Mode**: Review generated questions before using them

### 3. Advanced Settings
- **Total Questions**: Set the number of questions per test (1-100)
- **Difficulty Distribution**: Configure percentage of easy (30%), moderate (50%), expert (20%) questions
- **Shuffle Options**: Enable/disable answer option randomization
- **Prevent Duplicates**: Ensure unique questions in each test
- **Time Limit**: Set test duration (configurable)

## How to Use

### Accessing the Feature

1. Login as an administrator
2. Navigate to the Admin Dashboard
3. Click on the "Random Questions" tab

### Adding Questions

1. Click "Add Question" button
2. Fill in the question details:
   - **Question Text**: Enter the main question
   - **Category**: Choose or create a category (e.g., "Software Development", "Mathematics")
   - **Difficulty**: Select Easy, Moderate, or Expert
   - **Options**: Add 2-6 multiple choice options
   - **Correct Answer**: Select the correct option
   - **Explanation**: Optional explanation for the correct answer
   - **Active Status**: Enable/disable for random selection
3. Click "Add Question" to save

### Generating Random Questions

1. **Configure Settings**:
   - Click "Settings" to open the configuration modal
   - Set total questions (default: 35)
   - Configure difficulty distribution percentages
   - Enable/disable option shuffling
   - Enable/disable duplicate prevention

2. **Filter Questions** (Optional):
   - Use search to find specific questions
   - Filter by category
   - Filter by difficulty level

3. **Generate Questions**:
   - Click "Generate Random" button
   - Review the generated questions in the preview modal
   - Click "Use This Set" to apply the questions

### Managing Questions

- **Edit**: Click the edit icon (pencil) next to any question
- **Delete**: Click the delete icon (trash) to remove questions
- **Toggle Active**: Click the status button to enable/disable questions
- **Bulk Operations**: Select multiple questions for bulk actions

## Database Schema

### Questions Table
```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array of options
  correct_answer INTEGER NOT NULL,
  difficulty TEXT NOT NULL, -- 'easy', 'moderate', 'expert'
  category TEXT NOT NULL,
  explanation TEXT,
  active BOOLEAN DEFAULT 1,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Random Settings Table
```sql
CREATE TABLE random_settings (
  id INTEGER PRIMARY KEY,
  settings TEXT NOT NULL, -- JSON object of settings
  updated_by INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Questions Management
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Random Questions
- `POST /api/admin/generate-random-questions` - Generate random questions
- `POST /api/admin/random-settings` - Save random settings
- `GET /api/admin/random-settings` - Get random settings

## Configuration Options

### Default Settings
```json
{
  "totalQuestions": 35,
  "easyPercentage": 30,
  "moderatePercentage": 50,
  "expertPercentage": 20,
  "shuffleOptions": true,
  "preventDuplicates": true,
  "timeLimit": 60
}
```

### Difficulty Levels
- **Easy**: Basic concepts, straightforward questions
- **Moderate**: Intermediate complexity, requires understanding
- **Expert**: Advanced topics, complex problem-solving

## Best Practices

### Question Creation
1. **Clear and Concise**: Write questions that are easy to understand
2. **Balanced Options**: Ensure all options are plausible
3. **Proper Categorization**: Use consistent category names
4. **Appropriate Difficulty**: Match difficulty to question complexity
5. **Include Explanations**: Add explanations for educational value

### Random Generation
1. **Sufficient Pool**: Ensure enough questions in each category/difficulty
2. **Balanced Distribution**: Maintain appropriate difficulty distribution
3. **Regular Updates**: Add new questions regularly to prevent repetition
4. **Quality Control**: Review generated question sets before use

### Security Considerations
1. **Option Shuffling**: Always enable to prevent answer memorization
2. **Duplicate Prevention**: Enable to ensure test integrity
3. **Active Status**: Use to control which questions are available
4. **Access Control**: Ensure only admins can modify questions

## Troubleshooting

### Common Issues

1. **"Not enough questions available"**
   - Add more questions to the database
   - Reduce the total number of questions requested
   - Check if questions are marked as active

2. **Questions not appearing in random generation**
   - Verify questions are marked as active
   - Check category and difficulty filters
   - Ensure questions have valid options and correct answers

3. **Settings not saving**
   - Check admin authentication
   - Verify database permissions
   - Check for validation errors

### Performance Tips

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Question Pool Size**: Maintain a large enough question pool
3. **Caching**: Consider caching frequently used questions
4. **Batch Operations**: Use batch operations for bulk question management

## Future Enhancements

### Planned Features
- **Question Import/Export**: CSV/Excel import/export functionality
- **Question Templates**: Pre-defined question templates
- **Advanced Analytics**: Question performance analytics
- **Question Banks**: Organize questions into banks
- **Version Control**: Track question changes and versions
- **Collaborative Editing**: Multiple admin collaboration
- **Question Validation**: Automated question quality checks

### Integration Possibilities
- **Learning Management Systems**: Integration with LMS platforms
- **Assessment Tools**: Export to external assessment platforms
- **Analytics Platforms**: Integration with learning analytics
- **Mobile Apps**: Mobile-friendly question management

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
