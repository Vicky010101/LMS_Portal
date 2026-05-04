// Portal Courses seed data
const PORTAL_COURSES = [
    {
        title: 'Java Programming',
        description: 'Master Java from basics to OOP, collections, and exception handling. Build real-world programs with hands-on examples.',
        category: 'Java',
        thumbnail: '☕',
        difficulty: 'Beginner',
        duration: '12 hours',
        tags: ['Java', 'OOP', 'Programming'],
        modules: [
            {
                title: 'Introduction to Java',
                order: 1,
                duration: '20 min',
                theory: `Java is a high-level, class-based, object-oriented programming language designed to have as few implementation dependencies as possible.

**Key Features:**
- Platform Independent (Write Once, Run Anywhere)
- Object-Oriented
- Strongly Typed
- Automatic Memory Management (Garbage Collection)
- Rich Standard Library

**JDK vs JRE vs JVM:**
- JVM (Java Virtual Machine): Executes bytecode
- JRE (Java Runtime Environment): JVM + libraries
- JDK (Java Development Kit): JRE + development tools

**First Java Program:**
Every Java program starts with a class definition. The main method is the entry point.`,
                examples: [
                    {
                        title: 'Hello World',
                        code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
                        output: 'Hello, World!',
                        explanation: 'The main method is the entry point. System.out.println prints to console.',
                    },
                    {
                        title: 'Variables and Data Types',
                        code: `public class DataTypes {
    public static void main(String[] args) {
        int age = 25;
        double salary = 50000.50;
        char grade = 'A';
        boolean isActive = true;
        String name = "Alice";
        System.out.println(name + " age:" + age);
    }
}`,
                        output: 'Alice age:25',
                        explanation: 'Java has primitive types: int, double, char, boolean, and reference type String.',
                    },
                ],
                quiz: [
                    { question: 'What does JVM stand for?', options: ['Java Virtual Machine', 'Java Variable Method', 'Java Verified Module', 'Java Version Manager'], correctAnswer: 0, explanation: 'JVM stands for Java Virtual Machine which executes Java bytecode.' },
                    { question: 'Which method is the entry point of a Java program?', options: ['start()', 'run()', 'main()', 'init()'], correctAnswer: 2, explanation: 'The main() method with signature public static void main(String[] args) is the entry point.' },
                    { question: 'Java is _____ independent.', options: ['OS', 'Platform', 'Compiler', 'Hardware'], correctAnswer: 1, explanation: 'Java is platform independent - compiled to bytecode that runs on any JVM.' },
                    { question: 'Which is NOT a primitive data type in Java?', options: ['int', 'String', 'boolean', 'char'], correctAnswer: 1, explanation: 'String is a reference type (class), not a primitive type.' },
                    { question: 'What is the correct way to print in Java?', options: ['print("Hello")', 'console.log("Hello")', 'System.out.println("Hello")', 'echo "Hello"'], correctAnswer: 2, explanation: 'System.out.println() is used to print output in Java.' },
                ],
            },
            {
                title: 'Control Flow & Loops',
                order: 2,
                duration: '25 min',
                theory: `Control flow statements determine the order in which code executes.

**Conditional Statements:**
- if / else if / else
- switch statement
- Ternary operator: condition ? value1 : value2

**Loops:**
- for loop: when you know the number of iterations
- while loop: when condition-based
- do-while loop: executes at least once
- for-each loop: iterating over arrays/collections

**Break and Continue:**
- break: exits the loop immediately
- continue: skips current iteration`,
                examples: [
                    {
                        title: 'If-Else and Switch',
                        code: `int score = 85;
if (score >= 90) System.out.println("A");
else if (score >= 80) System.out.println("B");
else System.out.println("C");

// Switch
int day = 2;
switch(day) {
    case 1: System.out.println("Monday"); break;
    case 2: System.out.println("Tuesday"); break;
    default: System.out.println("Other");
}`,
                        output: 'B\nTuesday',
                        explanation: 'if-else checks conditions sequentially. switch matches exact values.',
                    },
                    {
                        title: 'For and While Loops',
                        code: `// For loop
for (int i = 1; i <= 5; i++) {
    System.out.print(i + " ");
}
System.out.println();

// While loop
int n = 1;
while (n <= 5) {
    System.out.print(n + " ");
    n++;
}`,
                        output: '1 2 3 4 5 \n1 2 3 4 5',
                        explanation: 'for loop is used when iterations are known. while loop when condition-based.',
                    },
                ],
                quiz: [
                    { question: 'Which loop always executes at least once?', options: ['for', 'while', 'do-while', 'for-each'], correctAnswer: 2, explanation: 'do-while checks condition after execution, so it always runs at least once.' },
                    { question: 'What does "break" do in a loop?', options: ['Pauses the loop', 'Exits the loop', 'Skips iteration', 'Restarts loop'], correctAnswer: 1, explanation: 'break immediately exits the loop.' },
                    { question: 'Ternary operator syntax is:', options: ['if ? else', 'condition ? true : false', 'condition : true ? false', 'true if condition'], correctAnswer: 1, explanation: 'Ternary: condition ? valueIfTrue : valueIfFalse' },
                    { question: 'Which loop is best for iterating an array?', options: ['while', 'do-while', 'for-each', 'switch'], correctAnswer: 2, explanation: 'for-each (enhanced for) is designed for iterating arrays and collections.' },
                    { question: 'What does "continue" do?', options: ['Exits loop', 'Skips current iteration', 'Breaks program', 'Restarts loop'], correctAnswer: 1, explanation: 'continue skips the rest of the current iteration and moves to the next.' },
                ],
            },
            {
                title: 'Object-Oriented Programming',
                order: 3,
                duration: '30 min',
                theory: `OOP is a programming paradigm based on objects that contain data and methods.

**Four Pillars of OOP:**
1. **Encapsulation**: Bundling data and methods, hiding internal state
2. **Inheritance**: Child class inherits from parent class
3. **Polymorphism**: Same method behaves differently based on object
4. **Abstraction**: Hiding complex implementation, showing only essentials

**Key Concepts:**
- Class: Blueprint for objects
- Object: Instance of a class
- Constructor: Special method to initialize objects
- this keyword: Refers to current object
- super keyword: Refers to parent class`,
                examples: [
                    {
                        title: 'Class and Objects',
                        code: `class Animal {
    String name;
    int age;
    
    Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    void speak() {
        System.out.println(name + " makes a sound");
    }
}

class Dog extends Animal {
    Dog(String name, int age) {
        super(name, age);
    }
    
    @Override
    void speak() {
        System.out.println(name + " says: Woof!");
    }
}

Dog d = new Dog("Rex", 3);
d.speak();`,
                        output: 'Rex says: Woof!',
                        explanation: 'Dog extends Animal (inheritance). speak() is overridden (polymorphism).',
                    },
                ],
                quiz: [
                    { question: 'Which OOP concept hides internal data?', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], correctAnswer: 2, explanation: 'Encapsulation bundles data and methods and hides internal state.' },
                    { question: 'What keyword is used for inheritance in Java?', options: ['implements', 'extends', 'inherits', 'super'], correctAnswer: 1, explanation: 'extends keyword is used for class inheritance in Java.' },
                    { question: 'What is a constructor?', options: ['A method that destroys objects', 'A method to initialize objects', 'A static method', 'An abstract method'], correctAnswer: 1, explanation: 'Constructor is a special method called when an object is created.' },
                    { question: '"this" keyword refers to:', options: ['Parent class', 'Current object', 'Static method', 'Interface'], correctAnswer: 1, explanation: '"this" refers to the current instance of the class.' },
                    { question: 'Overriding a method is an example of:', options: ['Encapsulation', 'Abstraction', 'Polymorphism', 'Inheritance'], correctAnswer: 2, explanation: 'Method overriding is runtime polymorphism.' },
                ],
            },
        ],
    },
];

module.exports = PORTAL_COURSES;

// Add more courses
PORTAL_COURSES.push({
    title: 'Python Programming',
    description: 'Learn Python from scratch — variables, functions, OOP, file handling, and popular libraries.',
    category: 'Python',
    thumbnail: '🐍',
    difficulty: 'Beginner',
    duration: '10 hours',
    tags: ['Python', 'Scripting', 'Data'],
    modules: [
        {
            title: 'Python Basics',
            order: 1,
            duration: '20 min',
            theory: `Python is a high-level, interpreted, general-purpose programming language known for its simplicity and readability.

**Why Python?**
- Simple, readable syntax
- Interpreted (no compilation needed)
- Dynamically typed
- Huge standard library
- Used in Web, AI/ML, Data Science, Automation

**Variables and Types:**
Python uses dynamic typing — no need to declare types.
- int: whole numbers
- float: decimal numbers  
- str: text (use quotes)
- bool: True or False
- list: ordered mutable collection
- dict: key-value pairs`,
            examples: [
                {
                    title: 'Hello World & Variables',
                    code: `# Hello World
print("Hello, World!")

# Variables
name = "Alice"
age = 25
height = 5.6
is_student = True

print(f"{name} is {age} years old")
print(type(age))`,
                    output: 'Hello, World!\nAlice is 25 years old\n<class \'int\'>',
                    explanation: 'Python uses f-strings for formatting. type() returns the data type.',
                },
                {
                    title: 'Lists and Dictionaries',
                    code: `# List
fruits = ["apple", "banana", "cherry"]
fruits.append("mango")
print(fruits[0])
print(len(fruits))

# Dictionary
student = {"name": "Bob", "age": 20, "grade": "A"}
print(student["name"])
student["age"] = 21
print(student)`,
                    output: 'apple\n4\nBob\n{\'name\': \'Bob\', \'age\': 21, \'grade\': \'A\'}',
                    explanation: 'Lists are ordered and mutable. Dictionaries store key-value pairs.',
                },
            ],
            quiz: [
                { question: 'Python is which type of language?', options: ['Compiled', 'Interpreted', 'Assembly', 'Machine'], correctAnswer: 1, explanation: 'Python is an interpreted language — code runs line by line.' },
                { question: 'How do you print in Python?', options: ['console.log()', 'System.out.println()', 'print()', 'echo'], correctAnswer: 2, explanation: 'print() is the built-in function to display output in Python.' },
                { question: 'Which is a mutable data structure?', options: ['tuple', 'string', 'list', 'int'], correctAnswer: 2, explanation: 'Lists are mutable — you can add, remove, or change elements.' },
                { question: 'What does len() return?', options: ['Last element', 'First element', 'Length/size', 'Type'], correctAnswer: 2, explanation: 'len() returns the number of elements in a sequence.' },
                { question: 'f-strings are used for:', options: ['File operations', 'String formatting', 'Functions', 'Loops'], correctAnswer: 1, explanation: 'f-strings (f"...") allow embedding expressions inside string literals.' },
            ],
        },
        {
            title: 'Functions & Modules',
            order: 2,
            duration: '25 min',
            theory: `Functions are reusable blocks of code that perform a specific task.

**Defining Functions:**
- Use def keyword
- Parameters are optional
- Return values with return keyword
- Default parameters allowed

**Lambda Functions:**
Anonymous one-line functions: lambda x: x * 2

**Modules:**
- import module_name
- from module import function
- Built-in modules: math, os, sys, random, datetime

**Scope:**
- Local: inside function
- Global: outside all functions
- Use global keyword to modify global variable inside function`,
            examples: [
                {
                    title: 'Functions',
                    code: `def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Hi"))

# Lambda
square = lambda x: x ** 2
print(square(5))

# *args
def add_all(*nums):
    return sum(nums)
print(add_all(1, 2, 3, 4))`,
                    output: 'Hello, Alice!\nHi, Bob!\n25\n10',
                    explanation: 'Default parameters, lambda functions, and *args for variable arguments.',
                },
            ],
            quiz: [
                { question: 'Keyword to define a function in Python:', options: ['function', 'def', 'func', 'define'], correctAnswer: 1, explanation: 'def keyword is used to define functions in Python.' },
                { question: 'Lambda is a:', options: ['Loop', 'Class', 'Anonymous function', 'Module'], correctAnswer: 2, explanation: 'Lambda creates anonymous (unnamed) functions in a single line.' },
                { question: 'How to import a module?', options: ['include math', 'require math', 'import math', 'use math'], correctAnswer: 2, explanation: 'import keyword is used to include modules in Python.' },
                { question: '*args allows:', options: ['Keyword arguments', 'Variable positional arguments', 'Default values', 'Return multiple values'], correctAnswer: 1, explanation: '*args allows a function to accept any number of positional arguments.' },
                { question: 'return keyword is used to:', options: ['Print output', 'Exit program', 'Send value back from function', 'Import module'], correctAnswer: 2, explanation: 'return sends a value back to the caller of the function.' },
            ],
        },
        {
            title: 'OOP in Python',
            order: 3,
            duration: '30 min',
            theory: `Python supports Object-Oriented Programming with classes and objects.

**Class Definition:**
- class ClassName:
- __init__ is the constructor
- self refers to the instance

**Inheritance:**
- class Child(Parent):
- super().__init__() calls parent constructor

**Special Methods (Dunder):**
- __str__: string representation
- __len__: length
- __add__: + operator

**Encapsulation:**
- _name: protected (convention)
- __name: private (name mangling)`,
            examples: [
                {
                    title: 'Classes and Inheritance',
                    code: `class Shape:
    def __init__(self, color):
        self.color = color
    
    def area(self):
        return 0
    
    def __str__(self):
        return f"{self.color} shape"

class Circle(Shape):
    def __init__(self, color, radius):
        super().__init__(color)
        self.radius = radius
    
    def area(self):
        return 3.14 * self.radius ** 2

c = Circle("red", 5)
print(c)
print(f"Area: {c.area()}")`,
                    output: 'red shape\nArea: 78.5',
                    explanation: 'Circle inherits from Shape. area() is overridden. __str__ provides string representation.',
                },
            ],
            quiz: [
                { question: 'Constructor in Python is:', options: ['__new__', '__init__', '__create__', '__start__'], correctAnswer: 1, explanation: '__init__ is the constructor method called when an object is created.' },
                { question: '"self" refers to:', options: ['Parent class', 'Current instance', 'Module', 'Global variable'], correctAnswer: 1, explanation: 'self refers to the current instance of the class.' },
                { question: 'Inheritance syntax in Python:', options: ['class Child extends Parent', 'class Child(Parent)', 'class Child inherits Parent', 'class Child: Parent'], correctAnswer: 1, explanation: 'class Child(Parent): is the syntax for inheritance in Python.' },
                { question: '__str__ method is used for:', options: ['Comparison', 'String representation', 'Addition', 'Length'], correctAnswer: 1, explanation: '__str__ returns a human-readable string representation of the object.' },
                { question: 'super() is used to:', options: ['Create superclass', 'Call parent class methods', 'Delete object', 'Import module'], correctAnswer: 1, explanation: 'super() gives access to parent class methods and constructor.' },
            ],
        },
    ],
});

PORTAL_COURSES.push({
    title: 'Data Structures & Algorithms',
    description: 'Master essential DSA concepts — arrays, linked lists, trees, sorting, searching, and complexity analysis.',
    category: 'DSA',
    thumbnail: '🔢',
    difficulty: 'Intermediate',
    duration: '15 hours',
    tags: ['DSA', 'Algorithms', 'Problem Solving'],
    modules: [
        {
            title: 'Arrays & Complexity',
            order: 1,
            duration: '25 min',
            theory: `An array is a collection of elements stored at contiguous memory locations.

**Time Complexity (Big O):**
- O(1): Constant — array access by index
- O(n): Linear — linear search
- O(n²): Quadratic — bubble sort
- O(log n): Logarithmic — binary search
- O(n log n): Merge sort, Quick sort

**Array Operations:**
- Access: O(1)
- Search: O(n)
- Insert at end: O(1) amortized
- Insert at middle: O(n)
- Delete: O(n)

**Two Pointer Technique:**
Use two pointers to solve array problems efficiently.`,
            examples: [
                {
                    title: 'Array Operations & Two Pointers',
                    code: `# Array basics
arr = [64, 34, 25, 12, 22, 11, 90]
print("Length:", len(arr))
print("Max:", max(arr))
print("Min:", min(arr))

# Two pointer - find pair with sum
def find_pair(arr, target):
    arr.sort()
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target: return (arr[left], arr[right])
        elif s < target: left += 1
        else: right -= 1
    return None

print(find_pair([1,4,6,8,10], 14))`,
                    output: 'Length: 7\nMax: 90\nMin: 11\n(4, 10)',
                    explanation: 'Two pointer technique reduces O(n²) to O(n log n) for pair sum problems.',
                },
            ],
            quiz: [
                { question: 'Time complexity of accessing array by index:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctAnswer: 2, explanation: 'Array access by index is O(1) — direct memory address calculation.' },
                { question: 'Binary search requires array to be:', options: ['Unsorted', 'Sorted', 'Reversed', 'Empty'], correctAnswer: 1, explanation: 'Binary search only works on sorted arrays.' },
                { question: 'O(n²) complexity means:', options: ['Constant time', 'Linear time', 'Quadratic time', 'Logarithmic time'], correctAnswer: 2, explanation: 'O(n²) is quadratic — time grows with square of input size.' },
                { question: 'Best sorting algorithm for large data:', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correctAnswer: 2, explanation: 'Merge Sort has O(n log n) which is optimal for comparison-based sorting.' },
                { question: 'Two pointer technique reduces complexity from:', options: ['O(1) to O(n)', 'O(n²) to O(n)', 'O(n) to O(1)', 'O(log n) to O(1)'], correctAnswer: 1, explanation: 'Two pointers can reduce O(n²) brute force to O(n) for many problems.' },
            ],
        },
        {
            title: 'Linked Lists & Stacks',
            order: 2,
            duration: '30 min',
            theory: `**Linked List:**
A linear data structure where elements are stored in nodes, each pointing to the next.

Types:
- Singly Linked List: each node points to next
- Doubly Linked List: each node points to next and previous
- Circular Linked List: last node points to first

**Advantages over Arrays:**
- Dynamic size
- Efficient insertion/deletion at beginning: O(1)

**Stack:**
LIFO (Last In First Out) data structure.
Operations: push, pop, peek — all O(1)

**Applications:**
- Function call stack
- Undo/Redo operations
- Expression evaluation
- Browser history`,
            examples: [
                {
                    title: 'Stack Implementation',
                    code: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
    
    def peek(self):
        return self.items[-1] if self.items else None
    
    def is_empty(self):
        return len(self.items) == 0

s = Stack()
s.push(1); s.push(2); s.push(3)
print(s.peek())
print(s.pop())
print(s.pop())`,
                    output: '3\n3\n2',
                    explanation: 'Stack follows LIFO. peek() views top without removing. pop() removes and returns top.',
                },
            ],
            quiz: [
                { question: 'Linked list nodes contain:', options: ['Only data', 'Only pointer', 'Data and pointer', 'Index'], correctAnswer: 2, explanation: 'Each node contains data and a pointer to the next node.' },
                { question: 'Stack follows which principle?', options: ['FIFO', 'LIFO', 'FILO', 'Random'], correctAnswer: 1, explanation: 'Stack follows LIFO — Last In First Out.' },
                { question: 'Time complexity of push/pop in stack:', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 3, explanation: 'Stack push and pop are O(1) operations.' },
                { question: 'Which uses stack internally?', options: ['Array sorting', 'Function calls', 'Binary search', 'Hash table'], correctAnswer: 1, explanation: 'Function call stack uses LIFO — last called function returns first.' },
                { question: 'Insertion at beginning of linked list is:', options: ['O(n)', 'O(n²)', 'O(1)', 'O(log n)'], correctAnswer: 2, explanation: 'Inserting at the head of a linked list is O(1) — just update the head pointer.' },
            ],
        },
    ],
});

PORTAL_COURSES.push({
    title: 'Web Development Fundamentals',
    description: 'Learn HTML, CSS, and JavaScript to build modern, responsive websites from scratch.',
    category: 'Web',
    thumbnail: '🌐',
    difficulty: 'Beginner',
    duration: '8 hours',
    tags: ['HTML', 'CSS', 'JavaScript', 'Web'],
    modules: [
        {
            title: 'HTML Fundamentals',
            order: 1,
            duration: '20 min',
            theory: `HTML (HyperText Markup Language) is the standard language for creating web pages.

**Structure:**
Every HTML document has: DOCTYPE, html, head, body

**Common Tags:**
- Headings: h1 to h6
- Paragraph: p
- Links: a href=""
- Images: img src=""
- Lists: ul, ol, li
- Div and Span: container elements
- Forms: form, input, button, select

**Semantic HTML5 Tags:**
- header, nav, main, section, article, aside, footer
- These improve accessibility and SEO

**Attributes:**
- id: unique identifier
- class: for CSS styling
- src, href: source/link
- alt: alternative text for images`,
            examples: [
                {
                    title: 'Basic HTML Page',
                    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
</head>
<body>
    <header>
        <h1>Welcome to My Site</h1>
        <nav>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
        </nav>
    </header>
    <main>
        <section id="about">
            <h2>About Me</h2>
            <p>I am learning web development!</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 My Site</p>
    </footer>
</body>
</html>`,
                    output: 'Renders a structured web page with header, navigation, content, and footer.',
                    explanation: 'Semantic HTML5 tags give meaning to structure, improving accessibility and SEO.',
                },
            ],
            quiz: [
                { question: 'HTML stands for:', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 0, explanation: 'HTML stands for HyperText Markup Language.' },
                { question: 'Which tag creates a hyperlink?', options: ['link', 'href', 'a', 'url'], correctAnswer: 2, explanation: '<a href="url"> creates hyperlinks in HTML.' },
                { question: 'Semantic HTML improves:', options: ['Speed', 'Accessibility and SEO', 'Colors', 'Animations'], correctAnswer: 1, explanation: 'Semantic tags like header, main, footer improve accessibility and search engine optimization.' },
                { question: 'Which is a block-level element?', options: ['span', 'a', 'div', 'img'], correctAnswer: 2, explanation: 'div is a block-level element that takes full width.' },
                { question: 'alt attribute in img is for:', options: ['Animation', 'Alternative text for accessibility', 'Alignment', 'Anchor'], correctAnswer: 1, explanation: 'alt provides alternative text when image cannot be displayed, important for accessibility.' },
            ],
        },
        {
            title: 'CSS Styling',
            order: 2,
            duration: '25 min',
            theory: `CSS (Cascading Style Sheets) controls the visual presentation of HTML elements.

**Selectors:**
- Element: p { }
- Class: .className { }
- ID: #idName { }
- Pseudo-class: a:hover { }

**Box Model:**
Every element is a box: content → padding → border → margin

**Flexbox:**
One-dimensional layout system.
- display: flex
- justify-content: horizontal alignment
- align-items: vertical alignment
- flex-wrap: wrapping

**CSS Grid:**
Two-dimensional layout system.
- display: grid
- grid-template-columns
- grid-template-rows

**Responsive Design:**
- Media queries: @media (max-width: 768px)
- Relative units: %, em, rem, vw, vh`,
            examples: [
                {
                    title: 'Flexbox Layout',
                    code: `.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    flex: 1;
    min-width: 200px;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
}`,
                    output: 'Creates a responsive card layout that stacks on mobile.',
                    explanation: 'Flexbox makes responsive layouts easy. Media queries handle different screen sizes.',
                },
            ],
            quiz: [
                { question: 'CSS stands for:', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Coded Style Sheets'], correctAnswer: 1, explanation: 'CSS stands for Cascading Style Sheets.' },
                { question: 'Box model order from inside out:', options: ['margin, border, padding, content', 'content, padding, border, margin', 'padding, content, margin, border', 'border, padding, content, margin'], correctAnswer: 1, explanation: 'Box model: content → padding → border → margin (inside to outside).' },
                { question: 'Flexbox is for _____ layouts:', options: ['2D', '3D', '1D', 'Grid'], correctAnswer: 2, explanation: 'Flexbox is a 1D layout system (row or column).' },
                { question: 'Media queries are used for:', options: ['Animations', 'Responsive design', 'Colors', 'Fonts'], correctAnswer: 1, explanation: 'Media queries apply different styles based on screen size for responsive design.' },
                { question: 'Class selector syntax:', options: ['#className', '.className', '*className', '@className'], correctAnswer: 1, explanation: '.className (dot prefix) is used for class selectors in CSS.' },
            ],
        },
    ],
});

PORTAL_COURSES.push({
    title: 'Aptitude & Logical Reasoning',
    description: 'Sharpen your quantitative aptitude, logical reasoning, and verbal ability for competitive exams and placements.',
    category: 'Aptitude',
    thumbnail: '🧠',
    difficulty: 'Beginner',
    duration: '6 hours',
    tags: ['Aptitude', 'Reasoning', 'Placement'],
    modules: [
        {
            title: 'Number Systems & Arithmetic',
            order: 1,
            duration: '20 min',
            theory: `Number systems and arithmetic form the foundation of quantitative aptitude.

**Types of Numbers:**
- Natural: 1, 2, 3, ...
- Whole: 0, 1, 2, 3, ...
- Integer: ...-2, -1, 0, 1, 2...
- Rational: p/q form
- Prime: divisible only by 1 and itself

**Divisibility Rules:**
- By 2: last digit even
- By 3: sum of digits divisible by 3
- By 4: last two digits divisible by 4
- By 5: ends in 0 or 5
- By 9: sum of digits divisible by 9

**LCM and HCF:**
- HCF (GCD): largest common factor
- LCM: smallest common multiple
- HCF × LCM = Product of two numbers

**Percentages:**
- x% of y = (x/100) × y
- % increase = (increase/original) × 100
- % decrease = (decrease/original) × 100`,
            examples: [
                {
                    title: 'LCM, HCF and Percentages',
                    code: `# HCF using Euclidean algorithm
def hcf(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return (a * b) // hcf(a, b)

print(f"HCF(12, 18) = {hcf(12, 18)}")
print(f"LCM(12, 18) = {lcm(12, 18)}")

# Percentage
price = 500
discount = 20
final = price - (price * discount / 100)
print(f"After {discount}% discount: {final}")`,
                    output: 'HCF(12, 18) = 6\nLCM(12, 18) = 36\nAfter 20% discount: 400.0',
                    explanation: 'Euclidean algorithm efficiently finds HCF. LCM = (a×b)/HCF.',
                },
            ],
            quiz: [
                { question: 'HCF of 12 and 18 is:', options: ['3', '6', '9', '12'], correctAnswer: 1, explanation: 'Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. HCF = 6.' },
                { question: '20% of 150 is:', options: ['20', '25', '30', '35'], correctAnswer: 2, explanation: '20% of 150 = (20/100) × 150 = 30.' },
                { question: 'Which number is divisible by 9?', options: ['123', '234', '333', '456'], correctAnswer: 2, explanation: '3+3+3=9, which is divisible by 9. So 333 is divisible by 9.' },
                { question: 'LCM × HCF = ?', options: ['Sum of numbers', 'Difference of numbers', 'Product of numbers', 'Average of numbers'], correctAnswer: 2, explanation: 'LCM × HCF = Product of the two numbers.' },
                { question: 'Prime numbers between 10 and 20:', options: ['11, 13, 17, 19', '11, 13, 15, 17', '13, 15, 17, 19', '11, 12, 17, 19'], correctAnswer: 0, explanation: 'Prime numbers between 10-20: 11, 13, 17, 19 (divisible only by 1 and themselves).' },
            ],
        },
        {
            title: 'Logical Reasoning',
            order: 2,
            duration: '25 min',
            theory: `Logical reasoning tests your ability to analyze patterns and draw conclusions.

**Types of Reasoning:**
1. **Series Completion**: Find the next term in a pattern
2. **Analogies**: A:B :: C:?
3. **Coding-Decoding**: Letters/numbers coded in a pattern
4. **Blood Relations**: Family relationship problems
5. **Direction Sense**: Navigation problems
6. **Syllogisms**: Logical conclusions from statements

**Series Patterns:**
- Arithmetic: +2, +4, +6 (constant difference)
- Geometric: ×2, ×3 (constant ratio)
- Fibonacci: each term = sum of previous two
- Mixed: alternating patterns

**Tips:**
- Find the difference between consecutive terms
- Check if ratio is constant
- Look for alternating patterns`,
            examples: [
                {
                    title: 'Series and Pattern Recognition',
                    code: `# Arithmetic series
series = [2, 5, 8, 11, 14]
diff = series[1] - series[0]
next_term = series[-1] + diff
print(f"Next term: {next_term}")  # 17

# Fibonacci
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=" ")
        a, b = b, a + b

fibonacci(8)

# Analogy: 4:16 :: 5:?
# Pattern: n:n²
print(f"\n5:{5**2}")`,
                    output: 'Next term: 17\n0 1 1 2 3 5 8 13 \n5:25',
                    explanation: 'Arithmetic series has constant difference. Fibonacci: each term = sum of previous two.',
                },
            ],
            quiz: [
                { question: 'Next term in: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], correctAnswer: 1, explanation: 'Differences: 4,6,8,10,12. Next difference is 12. 30+12=42.' },
                { question: 'If APPLE = 50, then each letter value averages:', options: ['8', '10', '12', '15'], correctAnswer: 1, explanation: 'APPLE has 5 letters. 50/5 = 10 per letter on average.' },
                { question: 'Fibonacci sequence starts with:', options: ['1, 2, 3', '0, 1, 1', '1, 1, 2', '0, 0, 1'], correctAnswer: 1, explanation: 'Fibonacci: 0, 1, 1, 2, 3, 5, 8... Each term is sum of previous two.' },
                { question: 'In a series 3, 9, 27, 81, the pattern is:', options: ['Add 6', 'Multiply by 3', 'Add 18', 'Multiply by 2'], correctAnswer: 1, explanation: '3×3=9, 9×3=27, 27×3=81. Geometric series with ratio 3.' },
                { question: 'Syllogism tests:', options: ['Memory', 'Logical conclusions from statements', 'Arithmetic', 'Vocabulary'], correctAnswer: 1, explanation: 'Syllogism tests ability to draw logical conclusions from given statements.' },
            ],
        },
    ],
});
