import type { Subject } from "@/lib/subjects";

export type Level = "Beginner" | "Intermediate" | "Advanced";

export const levels: Level[] = ["Beginner", "Intermediate", "Advanced"];

export type Module = { title: string; lessons: number };

export type Course = {
  slug: string;
  title: string;
  subject: Subject;
  level: Level;
  instructor: string;
  description: string;
  /** Module lesson counts add up to `lessons`. */
  lessons: number;
  hours: number;
  rating: number;
  students: number;
  outcomes: string[];
  modules: Module[];
};

// Placeholder content — replace with real data once the platform has it.
export const courses: Course[] = [
  {
    slug: "python-for-beginners",
    title: "Python for Beginners",
    subject: "Computer Science",
    level: "Beginner",
    instructor: "Dr. Amara Okafor",
    description: "Write your first programs, from variables and loops to small automation scripts.",
    lessons: 24,
    hours: 9,
    rating: 4.8,
    students: 12840,
    outcomes: [
      "Write and run Python programs from scratch",
      "Use variables, conditions, loops and functions",
      "Work with lists, dictionaries and files",
      "Automate a small everyday task end to end",
    ],
    modules: [
      { title: "Getting set up", lessons: 4 },
      { title: "Values, variables and decisions", lessons: 6 },
      { title: "Loops and functions", lessons: 6 },
      { title: "Working with data and files", lessons: 5 },
      { title: "Project: your first automation", lessons: 3 },
    ],
  },
  {
    slug: "algorithms-in-five-levels",
    title: "Algorithms in Five Levels",
    subject: "Computer Science",
    level: "Intermediate",
    instructor: "Prof. Daniel Reyes",
    description: "Sorting, searching, graphs and dynamic programming, explained one step deeper each level.",
    lessons: 18,
    hours: 11,
    rating: 4.7,
    students: 6420,
    outcomes: [
      "Reason about running time with Big-O notation",
      "Implement classic sorting and searching algorithms",
      "Model problems as graphs and traverse them",
      "Recognise and solve dynamic programming problems",
    ],
    modules: [
      { title: "Level 1: Complexity", lessons: 3 },
      { title: "Level 2: Sorting and searching", lessons: 4 },
      { title: "Level 3: Trees and heaps", lessons: 3 },
      { title: "Level 4: Graphs", lessons: 4 },
      { title: "Level 5: Dynamic programming", lessons: 4 },
    ],
  },
  {
    slug: "systems-design-fundamentals",
    title: "Systems Design Fundamentals",
    subject: "Computer Science",
    level: "Advanced",
    instructor: "Priya Natarajan",
    description: "Caching, queues, sharding and trade-offs for building services that scale.",
    lessons: 15,
    hours: 8,
    rating: 4.6,
    students: 3110,
    outcomes: [
      "Break a product requirement into services and data stores",
      "Choose between caching, replication and sharding",
      "Design for failure with queues and retries",
      "Explain trade-offs clearly in a design review",
    ],
    modules: [
      { title: "Thinking in systems", lessons: 3 },
      { title: "Storage and caching", lessons: 4 },
      { title: "Scaling out", lessons: 4 },
      { title: "Reliability and case studies", lessons: 4 },
    ],
  },
  {
    slug: "calculus-made-clear",
    title: "Calculus Made Clear",
    subject: "Mathematics",
    level: "Beginner",
    instructor: "Dr. Helen Brooks",
    description: "Limits, derivatives and integrals built up from intuition before formulas.",
    lessons: 22,
    hours: 10,
    rating: 4.9,
    students: 9875,
    outcomes: [
      "Understand limits and continuity intuitively",
      "Differentiate common functions and apply the chain rule",
      "Use derivatives to solve optimisation problems",
      "Compute areas with definite integrals",
    ],
    modules: [
      { title: "Functions and limits", lessons: 5 },
      { title: "The derivative", lessons: 6 },
      { title: "Applications of derivatives", lessons: 5 },
      { title: "Integration", lessons: 6 },
    ],
  },
  {
    slug: "matrix-differential-equations",
    title: "Matrix Differential Equations",
    subject: "Mathematics",
    level: "Advanced",
    instructor: "Prof. Lukas Weber",
    description: "Solve linear systems of ODEs with eigenvalues, matrix exponentials and phase portraits.",
    lessons: 12,
    hours: 7,
    rating: 4.5,
    students: 1980,
    outcomes: [
      "Write linear ODE systems in matrix form",
      "Solve systems using eigenvalues and eigenvectors",
      "Compute and apply the matrix exponential",
      "Sketch and interpret phase portraits",
    ],
    modules: [
      { title: "Systems in matrix form", lessons: 3 },
      { title: "Eigenvalue methods", lessons: 4 },
      { title: "The matrix exponential", lessons: 3 },
      { title: "Phase portraits and stability", lessons: 2 },
    ],
  },
  {
    slug: "genetics-and-heredity",
    title: "Genetics and Heredity",
    subject: "Biology",
    level: "Intermediate",
    instructor: "Dr. Sofia Lindqvist",
    description: "From Mendel's peas to modern genomics, with worked problems after every lesson.",
    lessons: 16,
    hours: 7,
    rating: 4.7,
    students: 4230,
    outcomes: [
      "Predict inheritance patterns with Punnett squares",
      "Explain how DNA is copied and expressed",
      "Interpret pedigrees and genetic disorders",
      "Describe how modern sequencing works",
    ],
    modules: [
      { title: "Mendelian inheritance", lessons: 4 },
      { title: "DNA and gene expression", lessons: 5 },
      { title: "Human genetics", lessons: 4 },
      { title: "Genomics today", lessons: 3 },
    ],
  },
  {
    slug: "introduction-to-quantum-physics",
    title: "Introduction to Quantum Physics",
    subject: "Physics",
    level: "Intermediate",
    instructor: "Prof. Kenji Tanaka",
    description: "Wave functions, uncertainty and the experiments that forced a new kind of physics.",
    lessons: 20,
    hours: 12,
    rating: 4.8,
    students: 7350,
    outcomes: [
      "Explain the experiments behind quantum theory",
      "Interpret wave functions and probabilities",
      "Apply the uncertainty principle",
      "Solve the particle-in-a-box problem",
    ],
    modules: [
      { title: "The crisis in classical physics", lessons: 4 },
      { title: "Waves and particles", lessons: 5 },
      { title: "The Schrödinger equation", lessons: 6 },
      { title: "Spin, entanglement and beyond", lessons: 5 },
    ],
  },
  {
    slug: "everyday-physics",
    title: "Everyday Physics",
    subject: "Physics",
    level: "Beginner",
    instructor: "Marcus Bell",
    description: "Motion, energy and electricity explained through things you use every day.",
    lessons: 14,
    hours: 5,
    rating: 4.6,
    students: 5120,
    outcomes: [
      "Describe motion and forces in everyday situations",
      "Track how energy changes form",
      "Understand how household circuits work",
      "Make quick physics estimates",
    ],
    modules: [
      { title: "Motion and forces", lessons: 4 },
      { title: "Energy all around", lessons: 4 },
      { title: "Electricity at home", lessons: 3 },
      { title: "Light and sound", lessons: 3 },
    ],
  },
  {
    slug: "organic-chemistry-i",
    title: "Organic Chemistry I",
    subject: "Chemistry",
    level: "Intermediate",
    instructor: "Dr. Nadia Haddad",
    description: "Structure, bonding and reaction mechanisms with clear, step-by-step drawings.",
    lessons: 19,
    hours: 10,
    rating: 4.5,
    students: 3890,
    outcomes: [
      "Draw and name organic molecules",
      "Predict shape and polarity from bonding",
      "Follow reaction mechanisms with curved arrows",
      "Compare substitution and elimination reactions",
    ],
    modules: [
      { title: "Structure and bonding", lessons: 5 },
      { title: "Naming and isomers", lessons: 4 },
      { title: "Reaction mechanisms", lessons: 5 },
      { title: "Substitution and elimination", lessons: 5 },
    ],
  },
  {
    slug: "principles-of-marketing",
    title: "Principles of Marketing",
    subject: "Business",
    level: "Beginner",
    instructor: "Grace Mensah",
    description: "Customers, positioning and campaigns, with case studies from real brands.",
    lessons: 14,
    hours: 6,
    rating: 4.4,
    students: 6010,
    outcomes: [
      "Define a target customer and their needs",
      "Position a product against competitors",
      "Plan a simple multi-channel campaign",
      "Measure whether a campaign worked",
    ],
    modules: [
      { title: "Understanding customers", lessons: 4 },
      { title: "Positioning and brand", lessons: 3 },
      { title: "Channels and campaigns", lessons: 4 },
      { title: "Measuring results", lessons: 3 },
    ],
  },
  {
    slug: "financial-accounting-basics",
    title: "Financial Accounting Basics",
    subject: "Business",
    level: "Beginner",
    instructor: "Tomás Alvarez",
    description: "Read balance sheets and income statements, and record transactions with confidence.",
    lessons: 17,
    hours: 7,
    rating: 4.6,
    students: 4470,
    outcomes: [
      "Record transactions with double-entry bookkeeping",
      "Read a balance sheet and income statement",
      "Understand cash flow and why it matters",
      "Calculate common financial ratios",
    ],
    modules: [
      { title: "The accounting equation", lessons: 4 },
      { title: "Recording transactions", lessons: 5 },
      { title: "Financial statements", lessons: 5 },
      { title: "Analysing performance", lessons: 3 },
    ],
  },
  {
    slug: "the-cold-war",
    title: "The Cold War, 1945–1991",
    subject: "History",
    level: "Intermediate",
    instructor: "Prof. Eleanor Shaw",
    description: "The rivalry that shaped the modern world, told through key moments and sources.",
    lessons: 13,
    hours: 6,
    rating: 4.7,
    students: 2760,
    outcomes: [
      "Explain the origins of the Cold War",
      "Analyse key crises using primary sources",
      "Compare the superpowers' strategies",
      "Assess why the Cold War ended",
    ],
    modules: [
      { title: "Origins, 1945–1949", lessons: 3 },
      { title: "Crises and confrontation", lessons: 4 },
      { title: "Détente and proxy wars", lessons: 3 },
      { title: "The end of the Cold War", lessons: 3 },
    ],
  },
  {
    slug: "ui-design-fundamentals",
    title: "UI Design Fundamentals",
    subject: "Design",
    level: "Beginner",
    instructor: "Leah Kim",
    description: "Layout, type, color and spacing — the foundations of interfaces people enjoy using.",
    lessons: 16,
    hours: 7,
    rating: 4.8,
    students: 8930,
    outcomes: [
      "Build clear layouts with grids and spacing",
      "Pair typefaces and set readable type",
      "Choose accessible color palettes",
      "Design and critique a complete screen",
    ],
    modules: [
      { title: "Layout and spacing", lessons: 4 },
      { title: "Typography", lessons: 4 },
      { title: "Color and contrast", lessons: 4 },
      { title: "Project: design a screen", lessons: 4 },
    ],
  },
  {
    slug: "design-systems-in-practice",
    title: "Design Systems in Practice",
    subject: "Design",
    level: "Advanced",
    instructor: "Omar Farouk",
    description: "Tokens, components and documentation that keep a growing product consistent.",
    lessons: 11,
    hours: 5,
    rating: 4.6,
    students: 2240,
    outcomes: [
      "Define design tokens for color, type and spacing",
      "Build a reusable component library",
      "Document components so teams use them",
      "Govern and evolve a system over time",
    ],
    modules: [
      { title: "Foundations and tokens", lessons: 3 },
      { title: "Components", lessons: 3 },
      { title: "Documentation", lessons: 3 },
      { title: "Adoption and governance", lessons: 2 },
    ],
  },
];

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

/** Same-subject courses first, then same-level ones, excluding the course itself. */
export function getRelatedCourses(course: Course, limit = 3) {
  const others = courses.filter((c) => c.slug !== course.slug);
  const sameSubject = others.filter((c) => c.subject === course.subject);
  const sameLevel = others.filter((c) => c.subject !== course.subject && c.level === course.level);
  return [...sameSubject, ...sameLevel].slice(0, limit);
}
