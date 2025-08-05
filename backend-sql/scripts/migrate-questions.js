const { executeQuery, executeQueryRun } = require('../config/database-sqlite');

const createQuestionsTable = async () => {
  console.log('🚀 Starting questions migration...');
  
  // Create questions table
  const createQuestionsTableQuery = `
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'expert')),
      category TEXT NOT NULL,
      explanation TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    const result = await executeQueryRun(createQuestionsTableQuery);
    if (result.success) {
      console.log('✅ Questions table created successfully');
    } else {
      console.error('❌ Failed to create questions table:', result.error);
      return false;
    }

    // Create index for better performance
    const indexQuery = 'CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty)';
    await executeQueryRun(indexQuery);
    console.log('✅ Questions index created');

    return true;
  } catch (error) {
    console.error('❌ Error creating questions table:', error);
    return false;
  }
};

const insertQuestions = async () => {
  const questions = [
    // HTML Questions
    {
      text: "What does HTML stand for?",
      option_a: "Hyper Text Markup Language",
      option_b: "High Tech Modern Language",
      option_c: "Home Tool Markup Language",
      option_d: "Hyperlink and Text Markup Language",
      correct_answer: 0,
      difficulty: "easy",
      category: "HTML"
    },
    {
      text: "Which HTML tag is used to define an internal style sheet?",
      option_a: "<script>",
      option_b: "<style>",
      option_c: "<css>",
      option_d: "<link>",
      correct_answer: 1,
      difficulty: "easy",
      category: "HTML"
    },
    {
      text: "What is the correct HTML element for inserting a line break?",
      option_a: "<break>",
      option_b: "<lb>",
      option_c: "<br>",
      option_d: "<newline>",
      correct_answer: 2,
      difficulty: "easy",
      category: "HTML"
    },
    {
      text: "Which HTML attribute specifies an alternate text for an image?",
      option_a: "src",
      option_b: "alt",
      option_c: "title",
      option_d: "img",
      correct_answer: 1,
      difficulty: "easy",
      category: "HTML"
    },
    {
      text: "What is the purpose of the HTML5 <section> element?",
      option_a: "To create a navigation menu",
      option_b: "To define a section in a document",
      option_c: "To create a sidebar",
      option_d: "To define a header",
      correct_answer: 1,
      difficulty: "moderate",
      category: "HTML"
    },
    {
      text: "Which HTML5 element is used to draw graphics on a web page?",
      option_a: "<svg>",
      option_b: "<canvas>",
      option_c: "<draw>",
      option_d: "<graphics>",
      correct_answer: 1,
      difficulty: "moderate",
      category: "HTML"
    },
    {
      text: "What is the difference between <div> and <span> elements?",
      option_a: "There is no difference",
      option_b: "<div> is block-level, <span> is inline",
      option_c: "<div> is inline, <span> is block-level",
      option_d: "<div> is deprecated in HTML5",
      correct_answer: 1,
      difficulty: "moderate",
      category: "HTML"
    },
    {
      text: "Which HTML5 API allows web applications to store data locally?",
      option_a: "WebSQL",
      option_b: "LocalStorage",
      option_c: "SessionStorage",
      option_d: "All of the above",
      correct_answer: 3,
      difficulty: "expert",
      category: "HTML"
    },

    // CSS Questions
    {
      text: "What does CSS stand for?",
      option_a: "Computer Style Sheets",
      option_b: "Creative Style Sheets",
      option_c: "Cascading Style Sheets",
      option_d: "Colorful Style Sheets",
      correct_answer: 2,
      difficulty: "easy",
      category: "CSS"
    },
    {
      text: "Which CSS property controls the text size?",
      option_a: "text-size",
      option_b: "font-size",
      option_c: "text-style",
      option_d: "font-style",
      correct_answer: 1,
      difficulty: "easy",
      category: "CSS"
    },
    {
      text: "How do you add a background color for all <h1> elements?",
      option_a: "h1 {background-color:#FFFFFF;}",
      option_b: "h1.all {background-color:#FFFFFF;}",
      option_c: "all.h1 {background-color:#FFFFFF;}",
      option_d: "h1 {bgcolor:#FFFFFF;}",
      correct_answer: 0,
      difficulty: "easy",
      category: "CSS"
    },
    {
      text: "Which CSS property is used to change the text color of an element?",
      option_a: "text-color",
      option_b: "fgcolor",
      option_c: "color",
      option_d: "text-style",
      correct_answer: 2,
      difficulty: "easy",
      category: "CSS"
    },
    {
      text: "What is the CSS Box Model?",
      option_a: "A way to create boxes in CSS",
      option_b: "A model that describes how elements are laid out",
      option_c: "A method for creating responsive designs",
      option_d: "A technique for centering elements",
      correct_answer: 1,
      difficulty: "moderate",
      category: "CSS"
    },
    {
      text: "Which CSS property is used to create space between elements?",
      option_a: "spacing",
      option_b: "margin",
      option_c: "padding",
      option_d: "border",
      correct_answer: 1,
      difficulty: "moderate",
      category: "CSS"
    },
    {
      text: "What is the difference between margin and padding?",
      option_a: "There is no difference",
      option_b: "Margin is outside the border, padding is inside",
      option_c: "Padding is outside the border, margin is inside",
      option_d: "Margin is for text, padding is for backgrounds",
      correct_answer: 1,
      difficulty: "moderate",
      category: "CSS"
    },
    {
      text: "What is CSS Grid?",
      option_a: "A way to create tables",
      option_b: "A two-dimensional layout system",
      option_c: "A method for creating animations",
      option_d: "A technique for responsive images",
      correct_answer: 1,
      difficulty: "moderate",
      category: "CSS"
    },
    {
      text: "What is the CSS specificity hierarchy?",
      option_a: "ID > Class > Element",
      option_b: "Class > ID > Element",
      option_c: "Element > Class > ID",
      option_d: "There is no hierarchy",
      correct_answer: 0,
      difficulty: "expert",
      category: "CSS"
    },
    {
      text: "What is the purpose of CSS preprocessors like SASS?",
      option_a: "To make CSS faster",
      option_b: "To add programming features to CSS",
      option_c: "To reduce file size",
      option_d: "To improve browser compatibility",
      correct_answer: 1,
      difficulty: "expert",
      category: "CSS"
    },

    // JavaScript Questions
    {
      text: "What is JavaScript?",
      option_a: "A markup language",
      option_b: "A programming language",
      option_c: "A styling language",
      option_d: "A database language",
      correct_answer: 1,
      difficulty: "easy",
      category: "JavaScript"
    },
    {
      text: "How do you declare a variable in JavaScript?",
      option_a: "var variableName",
      option_b: "v variableName",
      option_c: "variable variableName",
      option_d: "declare variableName",
      correct_answer: 0,
      difficulty: "easy",
      category: "JavaScript"
    },
    {
      text: "Which operator is used to assign a value to a variable?",
      option_a: "=",
      option_b: "==",
      option_c: "===",
      option_d: "=>",
      correct_answer: 0,
      difficulty: "easy",
      category: "JavaScript"
    },
    {
      text: "What is the correct way to write a JavaScript array?",
      option_a: "var colors = (1:'red', 2:'green', 3:'blue')",
      option_b: "var colors = 'red', 'green', 'blue'",
      option_c: "var colors = ['red', 'green', 'blue']",
      option_d: "var colors = 1 = ('red'), 2 = ('green'), 3 = ('blue')",
      correct_answer: 2,
      difficulty: "easy",
      category: "JavaScript"
    },
    {
      text: "What is a JavaScript function?",
      option_a: "A block of code designed to perform a particular task",
      option_b: "A variable that stores data",
      option_c: "A type of loop",
      option_d: "A conditional statement",
      correct_answer: 0,
      difficulty: "moderate",
      category: "JavaScript"
    },
    {
      text: "What is the difference between == and === in JavaScript?",
      option_a: "There is no difference",
      option_b: "== checks value and type, === checks only value",
      option_c: "== checks only value, === checks value and type",
      option_d: "== is deprecated, === is the new syntax",
      correct_answer: 2,
      difficulty: "moderate",
      category: "JavaScript"
    },
    {
      text: "What is closure in JavaScript?",
      option_a: "A way to close browser windows",
      option_b: "A function that has access to variables in its outer scope",
      option_c: "A method to end loops",
      option_d: "A way to close database connections",
      correct_answer: 1,
      difficulty: "expert",
      category: "JavaScript"
    },
    {
      text: "What is the event loop in JavaScript?",
      option_a: "A loop that handles events",
      option_b: "A mechanism that handles asynchronous operations",
      option_c: "A way to loop through events",
      option_d: "A method to create infinite loops",
      correct_answer: 1,
      difficulty: "expert",
      category: "JavaScript"
    },

    // React Questions
    {
      text: "What is React?",
      option_a: "A programming language",
      option_b: "A JavaScript library for building user interfaces",
      option_c: "A database management system",
      option_d: "A web server",
      correct_answer: 1,
      difficulty: "easy",
      category: "React"
    },
    {
      text: "What is a React component?",
      option_a: "A JavaScript function or class that returns JSX",
      option_b: "A CSS file",
      option_c: "A database table",
      option_d: "A server-side script",
      correct_answer: 0,
      difficulty: "easy",
      category: "React"
    },
    {
      text: "What is JSX?",
      option_a: "A new programming language",
      option_b: "A syntax extension for JavaScript",
      option_c: "A database query language",
      option_d: "A styling framework",
      correct_answer: 1,
      difficulty: "easy",
      category: "React"
    },
    {
      text: "What is the purpose of state in React?",
      option_a: "To store CSS styles",
      option_b: "To store data that can change over time",
      option_c: "To connect to databases",
      option_d: "To handle server requests",
      correct_answer: 1,
      difficulty: "moderate",
      category: "React"
    },
    {
      text: "What are React hooks?",
      option_a: "Functions that let you use state and other React features",
      option_b: "CSS animations",
      option_c: "Database connections",
      option_d: "Server-side functions",
      correct_answer: 0,
      difficulty: "moderate",
      category: "React"
    },
    {
      text: "What is the difference between props and state?",
      option_a: "There is no difference",
      option_b: "Props are read-only, state can be changed",
      option_c: "State is read-only, props can be changed",
      option_d: "Props are for styling, state is for data",
      correct_answer: 1,
      difficulty: "moderate",
      category: "React"
    },
    {
      text: "What is the Virtual DOM?",
      option_a: "A real DOM element",
      option_b: "A lightweight copy of the actual DOM",
      option_c: "A database table",
      option_d: "A server component",
      correct_answer: 1,
      difficulty: "expert",
      category: "React"
    },
    {
      text: "What is Redux?",
      option_a: "A styling library",
      option_b: "A state management library",
      option_c: "A database system",
      option_d: "A testing framework",
      correct_answer: 1,
      difficulty: "expert",
      category: "React"
    },

    // Firebase Questions
    {
      text: "What is Firebase?",
      option_a: "A programming language",
      option_b: "A platform for building web and mobile applications",
      option_c: "A database system",
      option_d: "A web server",
      correct_answer: 1,
      difficulty: "easy",
      category: "Firebase"
    },
    {
      text: "Which Firebase service is used for real-time database?",
      option_a: "Firebase Storage",
      option_b: "Firebase Authentication",
      option_c: "Firebase Realtime Database",
      option_d: "Firebase Hosting",
      correct_answer: 2,
      difficulty: "easy",
      category: "Firebase"
    },
    {
      text: "What is Firestore?",
      option_a: "A file storage service",
      option_b: "A NoSQL cloud database",
      option_c: "A web hosting service",
      option_d: "An authentication service",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Firebase"
    },
    {
      text: "What is the main advantage of Firebase?",
      option_a: "It's free",
      option_b: "It provides backend services without server management",
      option_c: "It's faster than other platforms",
      option_d: "It has better security",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Firebase"
    },

    // Cursor AI Questions
    {
      text: "What is Cursor AI?",
      option_a: "A programming language",
      option_b: "An AI-powered code editor",
      option_c: "A database system",
      option_d: "A web framework",
      correct_answer: 1,
      difficulty: "easy",
      category: "Cursor AI"
    },
    {
      text: "What is the main feature of Cursor AI?",
      option_a: "Code completion",
      option_b: "AI-powered code generation and editing",
      option_c: "Database management",
      option_d: "Web hosting",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Cursor AI"
    },
    {
      text: "How does Cursor AI help developers?",
      option_a: "By writing all code automatically",
      option_b: "By providing intelligent code suggestions and completions",
      option_c: "By managing databases",
      option_d: "By hosting applications",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Cursor AI"
    },

    // Java Questions
    {
      text: "What is Java?",
      option_a: "A markup language",
      option_b: "A programming language",
      option_c: "A database system",
      option_d: "A web server",
      correct_answer: 1,
      difficulty: "easy",
      category: "Java"
    },
    {
      text: "What is the main principle of Java?",
      option_a: "Write once, run anywhere",
      option_b: "Fast execution",
      option_c: "Easy syntax",
      option_d: "Free to use",
      correct_answer: 0,
      difficulty: "easy",
      category: "Java"
    },
    {
      text: "What is an object in Java?",
      option_a: "A variable",
      option_b: "An instance of a class",
      option_c: "A method",
      option_d: "A loop",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Java"
    },
    {
      text: "What is inheritance in Java?",
      option_a: "A way to create variables",
      option_b: "A mechanism where one class acquires properties of another",
      option_c: "A type of loop",
      option_d: "A method of data storage",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Java"
    },
    {
      text: "What is polymorphism in Java?",
      option_a: "A way to create multiple variables",
      option_b: "The ability to present the same interface for different underlying forms",
      option_c: "A type of inheritance",
      option_d: "A method of data encryption",
      correct_answer: 1,
      difficulty: "expert",
      category: "Java"
    },

    // Database Questions
    {
      text: "What is a database?",
      option_a: "A programming language",
      option_b: "An organized collection of data",
      option_c: "A web server",
      option_d: "A file system",
      correct_answer: 1,
      difficulty: "easy",
      category: "Database"
    },
    {
      text: "What is SQL?",
      option_a: "A programming language",
      option_b: "A language for managing relational databases",
      option_c: "A web framework",
      option_d: "A styling language",
      correct_answer: 1,
      difficulty: "easy",
      category: "Database"
    },
    {
      text: "What is a primary key?",
      option_a: "A key that opens the database",
      option_b: "A unique identifier for each record in a table",
      option_c: "The first column in a table",
      option_d: "A password for the database",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Database"
    },
    {
      text: "What is normalization?",
      option_a: "A process to make data consistent",
      option_b: "A process to organize data to reduce redundancy",
      option_c: "A way to backup data",
      option_d: "A method to encrypt data",
      correct_answer: 1,
      difficulty: "expert",
      category: "Database"
    },

    // Angular Questions
    {
      text: "What is Angular?",
      option_a: "A programming language",
      option_b: "A platform for building web applications",
      option_c: "A database system",
      option_d: "A web server",
      correct_answer: 1,
      difficulty: "easy",
      category: "Angular"
    },
    {
      text: "What is a component in Angular?",
      option_a: "A CSS file",
      option_b: "A class that controls a view",
      option_c: "A database table",
      option_d: "A server script",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Angular"
    },
    {
      text: "What is dependency injection in Angular?",
      option_a: "A way to inject CSS",
      option_b: "A design pattern where dependencies are provided to a class",
      option_c: "A method to connect to databases",
      option_d: "A way to handle errors",
      correct_answer: 1,
      difficulty: "expert",
      category: "Angular"
    },

    // Additional Technologies
    {
      text: "What is Node.js?",
      option_a: "A database system",
      option_b: "A JavaScript runtime environment",
      option_c: "A web framework",
      option_d: "A programming language",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Node.js"
    },
    {
      text: "What is Git?",
      option_a: "A programming language",
      option_b: "A version control system",
      option_c: "A database system",
      option_d: "A web server",
      correct_answer: 1,
      difficulty: "moderate",
      category: "Git"
    },
    {
      text: "What is Docker?",
      option_a: "A programming language",
      option_b: "A platform for developing, shipping, and running applications",
      option_c: "A database system",
      option_d: "A web framework",
      correct_answer: 1,
      difficulty: "expert",
      category: "Docker"
    },
    {
      text: "What is REST API?",
      option_a: "A programming language",
      option_b: "An architectural style for designing networked applications",
      option_c: "A database system",
      option_d: "A web server",
      correct_answer: 1,
      difficulty: "expert",
      category: "API"
    }
  ];

  try {
    for (const question of questions) {
      const insertQuery = `
        INSERT OR IGNORE INTO questions 
        (text, option_a, option_b, option_c, option_d, correct_answer, difficulty, category) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await executeQueryRun(insertQuery, [
        question.text,
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
        question.correct_answer,
        question.difficulty,
        question.category
      ]);

      if (!result.success) {
        console.error('❌ Failed to insert question:', result.error);
        return false;
      }
    }

    console.log(`✅ Successfully inserted ${questions.length} questions`);
    return true;
  } catch (error) {
    console.error('❌ Error inserting questions:', error);
    return false;
  }
};

const migrateQuestions = async () => {
  try {
    const tableCreated = await createQuestionsTable();
    if (!tableCreated) {
      return false;
    }

    const questionsInserted = await insertQuestions();
    if (!questionsInserted) {
      return false;
    }

    console.log('🎉 Questions migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Questions migration failed:', error);
    return false;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateQuestions()
    .then((success) => {
      if (success) {
        console.log('✅ Questions migration completed successfully');
        process.exit(0);
      } else {
        console.log('❌ Questions migration failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Questions migration error:', error);
      process.exit(1);
    });
}

module.exports = { migrateQuestions }; 