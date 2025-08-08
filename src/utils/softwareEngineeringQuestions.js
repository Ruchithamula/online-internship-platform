const softwareEngineeringQuestions = [
  // Easy Questions (18 questions)
  {
    id: 'easy_1',
    text: 'What is the primary purpose of version control systems like Git?',
    options: [
      'To store passwords securely',
      'To track changes in source code and collaborate with others',
      'To optimize database queries',
      'To create user interfaces'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Version Control'
  },
  {
    id: 'easy_2',
    text: 'Which of the following is NOT a primitive data type in JavaScript?',
    options: [
      'string',
      'number',
      'boolean',
      'array'
    ],
    correctAnswer: 3,
    difficulty: 'easy',
    category: 'Programming Fundamentals'
  },
  {
    id: 'easy_3',
    text: 'What does HTML stand for?',
    options: [
      'HyperText Markup Language',
      'High Tech Modern Language',
      'Home Tool Markup Language',
      'Hyperlink and Text Markup Language'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'Web Development'
  },
  {
    id: 'easy_4',
    text: 'Which HTTP method is typically used to retrieve data from a server?',
    options: [
      'POST',
      'GET',
      'PUT',
      'DELETE'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Web Development'
  },
  {
    id: 'easy_5',
    text: 'What is the purpose of CSS in web development?',
    options: [
      'To create dynamic content',
      'To style and layout web pages',
      'To handle server-side logic',
      'To manage databases'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Web Development'
  },
  {
    id: 'easy_6',
    text: 'Which of the following is a valid way to declare a variable in JavaScript?',
    options: [
      'var myVariable = 10;',
      'variable myVariable = 10;',
      'let myVariable = 10;',
      'Both A and C'
    ],
    correctAnswer: 3,
    difficulty: 'easy',
    category: 'Programming Fundamentals'
  },
  {
    id: 'easy_7',
    text: 'What is the main purpose of a database?',
    options: [
      'To create user interfaces',
      'To store and organize data',
      'To send emails',
      'To process images'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Databases'
  },
  {
    id: 'easy_8',
    text: 'Which of the following is a frontend framework?',
    options: [
      'Node.js',
      'React',
      'Express',
      'MongoDB'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Web Development'
  },
  {
    id: 'easy_9',
    text: 'What does API stand for?',
    options: [
      'Application Programming Interface',
      'Advanced Programming Integration',
      'Automated Process Interface',
      'Application Process Integration'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'Web Development'
  },
  {
    id: 'easy_10',
    text: 'Which of the following is a valid JavaScript function declaration?',
    options: [
      'function myFunction() {}',
      'function = myFunction() {}',
      'myFunction() = function {}',
      'function myFunction = () {}'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'Programming Fundamentals'
  },
  {
    id: 'easy_11',
    text: 'What is the purpose of the console.log() function in JavaScript?',
    options: [
      'To create new variables',
      'To display output in the browser console',
      'To connect to a database',
      'To style web pages'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Programming Fundamentals'
  },
  {
    id: 'easy_12',
    text: 'Which of the following is a valid HTML tag?',
    options: [
      '<div>',
      '<section>',
      '<article>',
      'All of the above'
    ],
    correctAnswer: 3,
    difficulty: 'easy',
    category: 'Web Development'
  },
  {
    id: 'easy_13',
    text: 'What is the purpose of a loop in programming?',
    options: [
      'To create variables',
      'To repeat a block of code multiple times',
      'To connect to databases',
      'To style web pages'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Programming Fundamentals'
  },
  {
    id: 'easy_14',
    text: 'Which of the following is a valid CSS property?',
    options: [
      'color',
      'background-color',
      'font-size',
      'All of the above'
    ],
    correctAnswer: 3,
    difficulty: 'easy',
    category: 'Web Development'
  },
  {
    id: 'easy_15',
    text: 'What is the purpose of comments in code?',
    options: [
      'To make code run faster',
      'To explain what the code does',
      'To create variables',
      'To connect to databases'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Programming Fundamentals'
  },
  {
    id: 'easy_16',
    text: 'Which of the following is a valid way to add JavaScript to an HTML file?',
    options: [
      '<script src="script.js"></script>',
      '<javascript src="script.js"></javascript>',
      '<js src="script.js"></js>',
      '<code src="script.js"></code>'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'Web Development'
  },
  {
    id: 'easy_17',
    text: 'What is the purpose of a conditional statement?',
    options: [
      'To create loops',
      'To make decisions in code based on conditions',
      'To create functions',
      'To style web pages'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Programming Fundamentals'
  },
  {
    id: 'easy_18',
    text: 'Which of the following is a valid database type?',
    options: [
      'Relational',
      'NoSQL',
      'Graph',
      'All of the above'
    ],
    correctAnswer: 3,
    difficulty: 'easy',
    category: 'Databases'
  },

  // Moderate Questions (11 questions)
  {
    id: 'moderate_1',
    text: 'What is the difference between let, const, and var in JavaScript?',
    options: [
      'There is no difference, they are all the same',
      'let and const are block-scoped, var is function-scoped; const cannot be reassigned',
      'var is the newest and most recommended',
      'const is the oldest and should not be used'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Programming Fundamentals'
  },
  {
    id: 'moderate_2',
    text: 'What is the purpose of the useEffect hook in React?',
    options: [
      'To create new components',
      'To handle side effects in functional components',
      'To style components',
      'To connect to APIs'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Web Development'
  },
  {
    id: 'moderate_3',
    text: 'What is the difference between synchronous and asynchronous programming?',
    options: [
      'There is no difference',
      'Synchronous executes code in order, asynchronous can execute code out of order',
      'Asynchronous is always faster',
      'Synchronous is always better'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Programming Fundamentals'
  },
  {
    id: 'moderate_4',
    text: 'What is the purpose of a REST API?',
    options: [
      'To create user interfaces',
      'To provide a standardized way for applications to communicate',
      'To store data',
      'To style web pages'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Web Development'
  },
  {
    id: 'moderate_5',
    text: 'What is the difference between SQL and NoSQL databases?',
    options: [
      'There is no difference',
      'SQL uses structured query language, NoSQL uses various data models',
      'NoSQL is always better',
      'SQL is always faster'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Databases'
  },
  {
    id: 'moderate_6',
    text: 'What is the purpose of environment variables?',
    options: [
      'To store user data',
      'To store configuration settings that vary between environments',
      'To create functions',
      'To style applications'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Software Engineering'
  },
  {
    id: 'moderate_7',
    text: 'What is the difference between a stack and a queue data structure?',
    options: [
      'There is no difference',
      'Stack is LIFO (Last In First Out), Queue is FIFO (First In First Out)',
      'Queue is always better',
      'Stack is always faster'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Data Structures'
  },
  {
    id: 'moderate_8',
    text: 'What is the purpose of unit testing?',
    options: [
      'To test the entire application',
      'To test individual components or functions in isolation',
      'To test user interfaces',
      'To test databases'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Software Engineering'
  },
  {
    id: 'moderate_9',
    text: 'What is the difference between GET and POST HTTP methods?',
    options: [
      'There is no difference',
      'GET is for retrieving data, POST is for sending data',
      'POST is always better',
      'GET is always faster'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Web Development'
  },
  {
    id: 'moderate_10',
    text: 'What is the purpose of a callback function?',
    options: [
      'To create loops',
      'To pass a function as an argument to another function',
      'To create variables',
      'To style components'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Programming Fundamentals'
  },
  {
    id: 'moderate_11',
    text: 'What is the difference between local storage and session storage?',
    options: [
      'There is no difference',
      'Local storage persists until manually cleared, session storage is cleared when the tab closes',
      'Session storage is always better',
      'Local storage is always faster'
    ],
    correctAnswer: 1,
    difficulty: 'moderate',
    category: 'Web Development'
  },

  // Expert Questions (6 questions)
  {
    id: 'expert_1',
    text: 'What is the time complexity of a binary search algorithm?',
    options: [
      'O(1)',
      'O(log n)',
      'O(n)',
      'O(n²)'
    ],
    correctAnswer: 1,
    difficulty: 'expert',
    category: 'Algorithms'
  },
  {
    id: 'expert_2',
    text: 'What is the purpose of a closure in JavaScript?',
    options: [
      'To create loops',
      'To create a function that has access to variables in its outer scope',
      'To create variables',
      'To style components'
    ],
    correctAnswer: 1,
    difficulty: 'expert',
    category: 'Programming Fundamentals'
  },
  {
    id: 'expert_3',
    text: 'What is the difference between shallow and deep copying in JavaScript?',
    options: [
      'There is no difference',
      'Shallow copy creates a new object with references to nested objects, deep copy creates completely independent copies',
      'Deep copy is always better',
      'Shallow copy is always faster'
    ],
    correctAnswer: 1,
    difficulty: 'expert',
    category: 'Programming Fundamentals'
  },
  {
    id: 'expert_4',
    text: 'What is the purpose of a design pattern in software development?',
    options: [
      'To create user interfaces',
      'To provide reusable solutions to common problems',
      'To store data',
      'To style applications'
    ],
    correctAnswer: 1,
    difficulty: 'expert',
    category: 'Software Engineering'
  },
  {
    id: 'expert_5',
    text: 'What is the difference between a microservice and a monolithic architecture?',
    options: [
      'There is no difference',
      'Microservices break an application into small, independent services, monolithic keeps everything in one application',
      'Monolithic is always better',
      'Microservices are always faster'
    ],
    correctAnswer: 1,
    difficulty: 'expert',
    category: 'Software Engineering'
  },
  {
    id: 'expert_6',
    text: 'What is the purpose of a virtual DOM in React?',
    options: [
      'To create real DOM elements',
      'To optimize rendering by comparing virtual and real DOM',
      'To store data',
      'To style components'
    ],
    correctAnswer: 1,
    difficulty: 'expert',
    category: 'Web Development'
  }
];

export default softwareEngineeringQuestions; 