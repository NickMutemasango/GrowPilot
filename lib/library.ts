import type { Subject } from "@/lib/subjects";

export type ResourceKind = "Book" | "Study notes" | "Research paper";

export const resourceKinds: ResourceKind[] = ["Book", "Study notes", "Research paper"];

export type Resource = {
  slug: string;
  title: string;
  author: string;
  subject: Subject;
  kind: ResourceKind;
  format: "PDF" | "eBook";
  pages: number;
  year: number;
  description: string;
  downloads: number;
  /** Chapters for books, sections for notes and papers. */
  contents: string[];
};

// Placeholder content — replace with real data once the platform has it.
export const resources: Resource[] = [
  {
    slug: "cell-biology-essentials",
    title: "Cell Biology Essentials",
    author: "Dr. Sofia Lindqvist",
    subject: "Biology",
    kind: "Book",
    format: "PDF",
    pages: 240,
    year: 2023,
    description: "A clear tour of the cell, from membranes and organelles to division and signalling.",
    downloads: 8420,
    contents: [
      "What is a cell?",
      "Membranes and transport",
      "Organelles at work",
      "Energy: respiration and photosynthesis",
      "Cell division",
      "Cell signalling",
    ],
  },
  {
    slug: "organic-chemistry-study-notes",
    title: "Organic Chemistry Study Notes",
    author: "Dr. Nadia Haddad",
    subject: "Chemistry",
    kind: "Study notes",
    format: "PDF",
    pages: 96,
    year: 2024,
    description: "Condensed mechanisms, naming rules and reaction tables for quick revision.",
    downloads: 11230,
    contents: [
      "Naming organic compounds",
      "Isomerism",
      "Curved-arrow mechanisms",
      "Substitution vs elimination",
      "Reaction summary tables",
    ],
  },
  {
    slug: "the-modern-world-1900-today",
    title: "The Modern World, 1900–Today",
    author: "Prof. Eleanor Shaw",
    subject: "History",
    kind: "Book",
    format: "eBook",
    pages: 312,
    year: 2022,
    description: "Wars, revolutions and ideas that shaped the last century, told through primary sources.",
    downloads: 5170,
    contents: [
      "Empires at their peak",
      "The First World War",
      "Revolution and depression",
      "The Second World War",
      "A divided world",
      "Globalisation and the digital age",
    ],
  },
  {
    slug: "python-quick-reference",
    title: "Python Quick Reference",
    author: "Dr. Amara Okafor",
    subject: "Computer Science",
    kind: "Study notes",
    format: "PDF",
    pages: 32,
    year: 2025,
    description: "Syntax, built-ins and common patterns on a few pages you can keep open while coding.",
    downloads: 15640,
    contents: [
      "Core syntax",
      "Strings, lists and dictionaries",
      "Functions and modules",
      "Files and exceptions",
      "Handy built-ins",
    ],
  },
  {
    slug: "thinking-in-algorithms",
    title: "Thinking in Algorithms",
    author: "Prof. Daniel Reyes",
    subject: "Computer Science",
    kind: "Book",
    format: "eBook",
    pages: 428,
    year: 2021,
    description: "How to design, analyse and prove algorithms, with exercises after every chapter.",
    downloads: 7320,
    contents: [
      "Measuring efficiency",
      "Divide and conquer",
      "Greedy algorithms",
      "Graph algorithms",
      "Dynamic programming",
      "Hard problems and approximation",
    ],
  },
  {
    slug: "attention-in-neural-networks",
    title: "A Survey of Attention in Neural Networks",
    author: "Priya Natarajan et al.",
    subject: "Computer Science",
    kind: "Research paper",
    format: "PDF",
    pages: 28,
    year: 2024,
    description: "Reviews attention mechanisms and how they changed language and vision models.",
    downloads: 4010,
    contents: ["Abstract", "Introduction", "Attention mechanisms", "Applications", "Open problems", "References"],
  },
  {
    slug: "calculus-formula-sheet",
    title: "Calculus Formula Sheet",
    author: "Dr. Helen Brooks",
    subject: "Mathematics",
    kind: "Study notes",
    format: "PDF",
    pages: 12,
    year: 2025,
    description: "Derivatives, integrals and series results on one compact, printable sheet.",
    downloads: 18900,
    contents: ["Limits", "Derivative rules", "Common integrals", "Series and approximations"],
  },
  {
    slug: "linear-algebra-clearly",
    title: "Linear Algebra, Clearly",
    author: "Prof. Lukas Weber",
    subject: "Mathematics",
    kind: "Book",
    format: "PDF",
    pages: 356,
    year: 2020,
    description: "Vectors, matrices and eigenvalues with geometric pictures before proofs.",
    downloads: 6650,
    contents: [
      "Vectors and space",
      "Matrices as transformations",
      "Solving linear systems",
      "Determinants",
      "Eigenvalues and eigenvectors",
      "Orthogonality",
    ],
  },
  {
    slug: "quantum-mechanics-lecture-notes",
    title: "Quantum Mechanics Lecture Notes",
    author: "Prof. Kenji Tanaka",
    subject: "Physics",
    kind: "Study notes",
    format: "PDF",
    pages: 140,
    year: 2023,
    description: "A full semester of lecture notes with worked examples and problem sets.",
    downloads: 9120,
    contents: [
      "Wave functions",
      "The Schrödinger equation",
      "Operators and observables",
      "The harmonic oscillator",
      "The hydrogen atom",
      "Problem sets",
    ],
  },
  {
    slug: "dark-matter-observations",
    title: "Recent Observational Constraints on Dark Matter",
    author: "Marcus Bell et al.",
    subject: "Physics",
    kind: "Research paper",
    format: "PDF",
    pages: 34,
    year: 2025,
    description: "Summarises what galaxy surveys and lensing tell us about dark matter today.",
    downloads: 2280,
    contents: ["Abstract", "Introduction", "Galaxy rotation curves", "Gravitational lensing", "Discussion", "References"],
  },
  {
    slug: "crispr-gene-editing-review",
    title: "CRISPR Gene Editing: A Review",
    author: "Dr. Sofia Lindqvist et al.",
    subject: "Biology",
    kind: "Research paper",
    format: "PDF",
    pages: 22,
    year: 2024,
    description: "How CRISPR works, where it is used today and the open questions that remain.",
    downloads: 3540,
    contents: ["Abstract", "Introduction", "How CRISPR works", "Current applications", "Ethical questions", "References"],
  },
  {
    slug: "marketing-case-studies",
    title: "Marketing in Practice: 20 Case Studies",
    author: "Grace Mensah",
    subject: "Business",
    kind: "Book",
    format: "eBook",
    pages: 264,
    year: 2022,
    description: "Real campaigns broken down into the decisions, results and lessons behind them.",
    downloads: 4780,
    contents: [
      "How to read a case study",
      "Launching new products",
      "Repositioning a brand",
      "Digital-first campaigns",
      "When campaigns fail",
    ],
  },
  {
    slug: "accounting-cheat-sheet",
    title: "Accounting Cheat Sheet",
    author: "Tomás Alvarez",
    subject: "Business",
    kind: "Study notes",
    format: "PDF",
    pages: 8,
    year: 2025,
    description: "Debits, credits, statements and key ratios summarised for exam revision.",
    downloads: 10450,
    contents: ["Debits and credits", "The three statements", "Key ratios"],
  },
  {
    slug: "design-principles-handbook",
    title: "The Design Principles Handbook",
    author: "Leah Kim",
    subject: "Design",
    kind: "Book",
    format: "eBook",
    pages: 198,
    year: 2023,
    description: "Hierarchy, contrast, rhythm and accessibility, each shown with before-and-after examples.",
    downloads: 8030,
    contents: ["Hierarchy", "Contrast", "Alignment and rhythm", "Color", "Typography", "Accessible design"],
  },
];

export function getResource(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}

/** Same-subject resources first, then same-type ones, excluding the resource itself. */
export function getRelatedResources(resource: Resource, limit = 3) {
  const others = resources.filter((r) => r.slug !== resource.slug);
  const sameSubject = others.filter((r) => r.subject === resource.subject);
  const sameKind = others.filter((r) => r.subject !== resource.subject && r.kind === resource.kind);
  return [...sameSubject, ...sameKind].slice(0, limit);
}
