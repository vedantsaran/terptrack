'use strict';
/* ============================================================
   FIXED 4-YEAR SCHEDULES
   Per-major curated 8-semester layouts. When a major template
   carries `fixedSchedule: SCHEDULE_<ID>`, applyMajorTemplate uses it
   verbatim instead of auto-generating from code lists.
   Course metadata (gen_ed tags, prereqs from API, avg GPA) refines
   live on apply via the background prefetch.
   ============================================================ */

// Helper: a course row with sensible defaults
function _c(code, title, cr, opts) {
  const o = opts || {};
  return {
    code, title, cr,
    prereqs: o.prereqs || [],
    coreqs: o.coreqs || [],
    kind: o.kind || 'core',
    category: o.category || 'major-core',
    note: o.note || '',
    ...(Array.isArray(o.categories) ? { categories: o.categories } : {}),
    ...(o.isGoal ? { isGoal: true } : {}),
  };
}

// ============================================================
// CS — Computer Science (BS)
// ============================================================
const SCHEDULE_CS = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CMSC 131', 'Object-Oriented Programming I', 4, { category: 'major-core' }),
    _c('MATH 140', 'Calculus I', 4, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('CMSC 132', 'Object-Oriented Programming II', 4, { prereqs: ['CMSC 131'], category: 'major-core' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('CMSC 216', 'Introduction to Computer Systems', 4, { prereqs: ['CMSC 132','MATH 141'], category: 'major-core' }),
    _c('CMSC 250', 'Discrete Structures', 4, { prereqs: ['CMSC 131','MATH 141'], category: 'major-core', note: 'Satisfies FSAR' }),
    _c('MATH 240', 'Linear Algebra', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('BSCI 105', 'Principles of Biology I', 4, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('CMSC 320', 'Introduction to Data Science', 3, { prereqs: ['CMSC 216'], category: 'major-core' }),
    _c('CMSC 330', 'Organization of Programming Languages', 3, { prereqs: ['CMSC 250','CMSC 216'], category: 'major-core' }),
    _c('CMSC 351', 'Algorithms', 3, { prereqs: ['CMSC 250','CMSC 216'], category: 'major-core' }),
    _c('STAT 400', 'Applied Probability and Statistics I', 3, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('BSCI 106', 'Principles of Biology II', 4, { kind: 'gened', category: 'gened-dsnl' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('CMSC 335', 'Web Application Development', 3, { prereqs: ['CMSC 216'], category: 'major-core' }),
    _c('CMSC 411', 'Computer Systems Architecture', 3, { prereqs: ['CMSC 216','CMSC 250'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('CMSC 421', 'Introduction to Artificial Intelligence', 3, { prereqs: ['CMSC 351'], category: 'major-upper', isGoal: true }),
    _c('CMSC 414', 'Computer and Network Security', 3, { prereqs: ['CMSC 216','CMSC 330'], category: 'major-upper' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', categories: ['gened-dshs', 'gened-scis'], note: 'Satisfies DSHS SCIS' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('CMSC 422', 'Introduction to Machine Learning', 3, { prereqs: ['CMSC 320','MATH 240'], category: 'major-upper', isGoal: true }),
    _c('CMSC 451', 'Design and Analysis of Computer Algorithms', 3, { prereqs: ['CMSC 351'], category: 'major-upper', isGoal: true }),
    _c('CMSC 424', 'Database Design', 3, { prereqs: ['CMSC 330','CMSC 351'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('CMSC 430', 'Introduction to Compilers', 3, { prereqs: ['CMSC 330','CMSC 351'], category: 'major-upper' }),
    _c('CMSC 433', 'Programming Language Technologies and Paradigms', 3, { prereqs: ['CMSC 330'], category: 'major-upper' }),
    _c('DSHU/DVCC/DSSP Elective', 'Humanities Cultural Competence Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc', 'gened-dssp'], note: 'Satisfies DSHU DVCC DSSP' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective #2', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// BIOL — Biological Sciences (BS, General Biology concentration)
// ============================================================
const SCHEDULE_BIOL = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('BSCI 170', 'Principles of Molecular and Cellular Biology', 3, { category: 'major-core', categories: ['gened-dsns'], note: 'Double-counts: BIOL Core + DSNS' }),
    _c('BSCI 171', 'Molecular and Cellular Biology Lab', 1, { coreqs: ['BSCI 170'], category: 'major-core', categories: ['gened-dsnl'], note: 'Double-counts: BIOL Core + DSNL' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { category: 'major-support' }),
    _c('CHEM 132', 'General Chemistry I Lab', 1, { coreqs: ['CHEM 131'], category: 'major-support' }),
    _c('MATH 130', 'Calculus I for the Life Sciences', 4, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('BSCI 160', 'Principles of Ecology and Evolution', 3, { category: 'major-core' }),
    _c('BSCI 161', 'Ecology and Evolution Lab', 1, { coreqs: ['BSCI 160'], category: 'major-core' }),
    _c('CHEM 231', 'Organic Chemistry I', 3, { prereqs: ['CHEM 131'], category: 'major-support' }),
    _c('CHEM 232', 'Organic Chemistry Laboratory I', 1, { prereqs: ['CHEM 132'], coreqs: ['CHEM 231'], category: 'major-support' }),
    _c('MATH 131', 'Calculus II for Life Sciences', 4, { prereqs: ['MATH 130'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('BSCI 222', 'Principles of Genetics', 4, { prereqs: ['BSCI 170'], category: 'major-core' }),
    _c('CHEM 241', 'Organic Chemistry II', 3, { prereqs: ['CHEM 231'], category: 'major-support' }),
    _c('CHEM 242', 'Organic Chemistry Laboratory II', 1, { prereqs: ['CHEM 232'], coreqs: ['CHEM 241'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('BSCI 223', 'General Microbiology', 4, { prereqs: ['BSCI 170'], category: 'major-core' }),
    _c('PHYS 121', 'Fundamentals of Physics I', 4, { prereqs: ['MATH 130'], category: 'major-support' }),
    _c('BIOM 301', 'Introduction to Biometrics', 3, { prereqs: ['MATH 131'], category: 'major-support' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BSCI 330', 'Cell Biology and Physiology', 4, { prereqs: ['BSCI 222','CHEM 241'], category: 'major-core', isGoal: true }),
    _c('PHYS 122', 'Fundamentals of Physics II', 4, { prereqs: ['PHYS 121'], category: 'major-support' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BCHM 461', 'Biochemistry I', 3, { prereqs: ['CHEM 241'], category: 'major-upper' }),
    _c('BSCI 410', 'Molecular Genetics', 3, { prereqs: ['BSCI 222'], category: 'major-upper' }),
    _c('BSCI 437', 'General Virology', 3, { prereqs: ['BSCI 222'], category: 'major-upper' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', categories: ['gened-fsar', 'gened-dssp'], note: 'Satisfies FSAR DSSP' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', categories: ['gened-dshs', 'gened-scis'], note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BSCI 440', 'Mammalian Physiology', 4, { prereqs: ['BSCI 330'], category: 'major-upper', isGoal: true }),
    _c('BSCI 424', 'Pathogenic Microbiology', 4, { prereqs: ['BSCI 223'], category: 'major-upper' }),
    _c('BSCI 422', 'Principles of Immunology', 3, { prereqs: ['BSCI 222'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('BSCI 430', 'Developmental Biology', 3, { prereqs: ['BSCI 222','BSCI 330'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc'], note: 'Satisfies DSHU DVCC' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// MATH - Mathematics (BS, Traditional Track, 120 cr)
// ============================================================
const SCHEDULE_MATH = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('CMSC 131', 'Object-Oriented Programming I', 4, { category: 'major-support' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-core' }),
    _c('CMSC 132', 'Object-Oriented Programming II', 4, { prereqs: ['CMSC 131'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('MATH 240', 'Introduction to Linear Algebra', 4, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('MATH 310', 'Introduction to Mathematical Proof', 3, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MATH 246', 'Differential Equations for Scientists and Engineers', 3, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('CMSC 216', 'Introduction to Computer Systems', 4, { prereqs: ['CMSC 132'], category: 'major-support' }),
    _c('STAT 410', 'Introduction to Probability Theory', 3, { prereqs: ['MATH 141'], category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('MATH 405', 'Linear Algebra', 3, { prereqs: ['MATH 240', 'MATH 310'], category: 'major-upper' }),
    _c('MATH 410', 'Advanced Calculus I', 3, { prereqs: ['MATH 310'], category: 'major-upper' }),
    _c('MATH 403', 'Introduction to Abstract Algebra', 3, { prereqs: ['MATH 310'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('MATH 430', 'Euclidean and Non-Euclidean Geometries', 3, { prereqs: ['MATH 310'], category: 'major-upper' }),
    _c('MATH 452', 'Introduction to Dynamics and Chaos', 3, { prereqs: ['MATH 246'], category: 'major-upper' }),
    _c('MATH 456', 'Cryptography', 3, { prereqs: ['MATH 310'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('MATH 411', 'Advanced Calculus II', 3, { prereqs: ['MATH 410'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// STAT - Mathematics: Statistics Track (BS, 120 cr)
// ============================================================
const SCHEDULE_STAT = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('CMSC 131', 'Object-Oriented Programming I', 4, { category: 'major-support' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-core' }),
    _c('CMSC 132', 'Object-Oriented Programming II', 4, { prereqs: ['CMSC 131'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('MATH 240', 'Introduction to Linear Algebra', 4, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('MATH 310', 'Introduction to Mathematical Proof', 3, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('STAT 400', 'Applied Probability and Statistics I', 3, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MATH 246', 'Differential Equations for Scientists and Engineers', 3, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('STAT 401', 'Applied Probability and Statistics II', 3, { prereqs: ['STAT 400'], category: 'major-core' }),
    _c('STAT 410', 'Introduction to Probability Theory', 3, { prereqs: ['MATH 141'], category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('STAT 430', 'Introduction to Statistical Computing with SAS', 3, { prereqs: ['STAT 400'], category: 'major-upper' }),
    _c('AMSC 460', 'Computational Methods', 3, { prereqs: ['MATH 241'], category: 'major-upper' }),
    _c('MATH 405', 'Linear Algebra', 3, { prereqs: ['MATH 240', 'MATH 310'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('MATH 410', 'Advanced Calculus I', 3, { prereqs: ['MATH 310'], category: 'major-upper' }),
    _c('STAT 426', 'Introduction to Data Science and Machine Learning', 3, { prereqs: ['STAT 400'], category: 'major-upper' }),
    _c('STAT 440', 'Sampling Theory', 3, { prereqs: ['STAT 400'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('STAT 420', 'Theory and Methods of Statistics', 3, { prereqs: ['STAT 410'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// CHEM - Chemistry (BS, 120 cr)
// ============================================================
const SCHEDULE_CHEM = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CHEM 146', 'Principles of General Chemistry', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('CHEM 177', 'Introduction to Laboratory Practices and Research in the Chemical Sciences', 2, { kind: 'gened', category: 'gened-dsnl' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('CHEM 237', 'Principles of Organic Chemistry I', 4, { prereqs: ['CHEM 146'], category: 'major-core' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('CHEM 247', 'Principles of Organic Chemistry II', 4, { prereqs: ['CHEM 237'], category: 'major-core' }),
    _c('CHEM 276', 'General Chemistry and Energetics - Majors', 2, { prereqs: ['CHEM 146'], category: 'major-core' }),
    _c('CHEM 277', 'Fundamentals of Analytical and Bioanalytical Chemistry Laboratory', 3, { prereqs: ['CHEM 177'], category: 'major-core' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Vibration, Waves, Heat, Electricity and Magnetism', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)', 1, { coreqs: ['PHYS 260'], category: 'major-support' }),
    _c('CHEM 395', 'Professional Issues in Chemistry and Biochemistry', 1, { category: 'major-core' }),
    _c('CHEM 425', 'Instrumental Methods of Analysis', 4, { prereqs: ['CHEM 276', 'CHEM 277'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('CHEM 481', 'Physical Chemistry I', 3, { prereqs: ['MATH 241', 'PHYS 260'], category: 'major-upper' }),
    _c('CHEM 483', 'Physical Chemistry Laboratory I', 2, { coreqs: ['CHEM 481'], category: 'major-upper' }),
    _c('CHEM 401', 'Inorganic Chemistry', 3, { prereqs: ['CHEM 247'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('CHEM 482', 'Physical Chemistry II', 3, { prereqs: ['CHEM 481'], category: 'major-upper' }),
    _c('CHEM 484', 'Physical Chemistry Laboratory II', 2, { coreqs: ['CHEM 482'], category: 'major-upper' }),
    _c('BCHM 461', 'Biochemistry I', 3, { prereqs: ['CHEM 247'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('CHEM 441', 'Advanced Organic Chemistry', 3, { prereqs: ['CHEM 247'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
];

// ============================================================
// PHYS - Physics (BS, Physics Specialization, 120 cr)
// ============================================================
const SCHEDULE_PHYS = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('PHYS 170', 'Professional Physics Seminar', 1, { category: 'major-core' }),
    _c('PHYS 171', 'Introductory Physics: Mechanics and Relativity', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('PHYS 265', 'Introduction to Scientific Programming', 3, { prereqs: ['PHYS 171'], category: 'major-core' }),
    _c('PHYS 272', 'Introductory Physics: Fields', 3, { prereqs: ['PHYS 171'], category: 'major-core' }),
    _c('PHYS 275', 'Experimental Physics I: Mechanics and Heat', 2, { prereqs: ['PHYS 171'], category: 'major-core' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('PHYS 273', 'Introductory Physics: Waves', 3, { prereqs: ['PHYS 272'], category: 'major-core' }),
    _c('PHYS 276', 'Experimental Physics II: Electricity and Magnetism', 2, { prereqs: ['PHYS 275'], kind: 'gened', category: 'gened-dsnl' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('MATH 243', 'Introduction to Linear Algebra and Differential Equations', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('PHYS 313', 'Electricity and Magnetism I', 4, { prereqs: ['PHYS 272', 'MATH 241'], category: 'major-core' }),
    _c('PHYS 371', 'Modern Physics', 3, { prereqs: ['PHYS 273'], category: 'major-core' }),
    _c('PHYS 375', 'Experimental Physics III: Electromagnetic Waves, Optics and Modern Physics', 3, { prereqs: ['PHYS 276'], category: 'major-core' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('PHYS 401', 'Quantum Physics I', 4, { prereqs: ['PHYS 371'], category: 'major-upper' }),
    _c('PHYS 404', 'Introduction to Statistical Thermodynamics', 3, { prereqs: ['PHYS 371'], category: 'major-upper' }),
    _c('PHYS 410', 'Classical Mechanics', 3, { prereqs: ['PHYS 273', 'MATH 243'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('PHYS 413', 'Intermediate Electricity and Magnetism II', 3, { prereqs: ['PHYS 313'], category: 'major-upper' }),
    _c('PHYS 405', 'Advanced Experiments', 3, { prereqs: ['PHYS 375'], category: 'major-upper' }),
    _c('PHYS 420', 'Principles of Modern Physics', 3, { prereqs: ['PHYS 371'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('PHYS 402', 'Quantum Physics II', 3, { prereqs: ['PHYS 401'], category: 'major-upper', isGoal: true }),
    _c('PHYS 441', 'Topics in Nuclear and Particle Physics', 3, { prereqs: ['PHYS 371'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective #2', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
];

// ============================================================
// ASTR - Astronomy (BS, Astrophysics specialization, 120 cr)
// ============================================================
const SCHEDULE_ASTR = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ASTR 130', 'Introductory Astrophysics 1 - Foundations', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('PHYS 171', 'Introductory Physics: Mechanics and Relativity', 3, { category: 'major-support' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ASTR 131', 'Introductory Astrophysics 2 - Planets and Stars', 3, { prereqs: ['ASTR 130'], category: 'major-core' }),
    _c('PHYS 265', 'Introduction to Scientific Programming', 3, { prereqs: ['PHYS 171'], category: 'major-support' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ASTR 232', 'Introductory Astrophysics 3 - The Milky Way and Beyond', 4, { prereqs: ['ASTR 131'], category: 'major-core' }),
    _c('PHYS 272', 'Introductory Physics: Fields', 3, { prereqs: ['PHYS 171'], category: 'major-support' }),
    _c('PHYS 275', 'Experimental Physics I: Mechanics and Heat', 2, { prereqs: ['PHYS 171'], category: 'major-support' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ASTR 310', 'Observational Astronomy', 4, { prereqs: ['ASTR 232'], category: 'major-core' }),
    _c('PHYS 273', 'Introductory Physics: Waves', 3, { prereqs: ['PHYS 272'], category: 'major-support' }),
    _c('PHYS 276', 'Experimental Physics II: Electricity and Magnetism', 2, { prereqs: ['PHYS 275'], kind: 'gened', category: 'gened-dsnl' }),
    _c('MATH 243', 'Introduction to Linear Algebra and Differential Equations', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ASTR 320', 'Theoretical Astrophysics', 3, { prereqs: ['ASTR 232','MATH 241'], category: 'major-upper' }),
    _c('PHYS 313', 'Electricity and Magnetism I', 4, { prereqs: ['PHYS 272','MATH 241'], category: 'major-upper' }),
    _c('PHYS 371', 'Modern Physics', 3, { prereqs: ['PHYS 273'], category: 'major-upper' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ASTR 406', 'Stellar Structure and Evolution', 3, { prereqs: ['ASTR 320'], category: 'major-upper' }),
    _c('ASTR 415', 'Computational Astrophysics', 3, { prereqs: ['ASTR 320'], category: 'major-upper' }),
    _c('ASTR 421', 'Galaxies', 3, { prereqs: ['ASTR 320'], category: 'major-upper' }),
    _c('PHYS 401', 'Quantum Physics I', 4, { prereqs: ['PHYS 371'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ASTR 450', 'Orbital Dynamics', 3, { prereqs: ['ASTR 320'], category: 'major-upper' }),
    _c('ASTR 498N', 'Special Problems in Astronomy; Stellar Evolution', 3, { category: 'major-upper', isGoal: true }),
    _c('PHYS 410', 'Classical Mechanics', 3, { prereqs: ['PHYS 273','MATH 243'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// AOSC - Atmospheric and Oceanic Science (BS, 120 cr)
// ============================================================
const SCHEDULE_AOSC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('AOSC 200', 'Weather and Climate', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { category: 'major-support' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('AOSC 201', 'Weather and Climate Laboratory', 1, { prereqs: ['AOSC 200'], kind: 'gened', category: 'gened-dsnl' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('CHEM 136', 'General Chemistry Laboratory for Engineers', 1, { coreqs: ['CHEM 135'], category: 'major-support' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 174', 'Physics Laboratory Introduction', 1, { coreqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Mechanics, Vibrations, Waves, Heat (Laboratory)', 1, { coreqs: ['PHYS 260'], category: 'major-support' }),
    _c('AOSC 358L', 'Computing and Data Analysis: Deciphering Climate Change Clues', 3, { category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MATH 246', 'Differential Equations for Scientists and Engineers', 3, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 270', 'General Physics: Waves, Optics, Relativity and Modern Physics', 3, { prereqs: ['PHYS 260'], category: 'major-support' }),
    _c('PHYS 271', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics (Laboratory)', 1, { coreqs: ['PHYS 270'], category: 'major-support' }),
    _c('AOSC 431', 'Atmospheric Thermodynamics', 3, { prereqs: ['MATH 241','PHYS 260'], category: 'major-core' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('AOSC 432', 'Dynamics of the Atmosphere and Ocean', 3, { prereqs: ['AOSC 431'], category: 'major-core' }),
    _c('AOSC 400', 'Physical Meteorology of the Atmosphere', 3, { prereqs: ['AOSC 431'], category: 'major-upper' }),
    _c('AOSC 401', 'Climate Dynamics and Earth System Science', 3, { prereqs: ['AOSC 431'], category: 'major-upper' }),
    _c('AOSC 424', 'Remote Sensing of the Atmosphere and Ocean', 3, { category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('AOSC 470', 'Synoptic Meteorology', 3, { prereqs: ['AOSC 432'], category: 'major-upper' }),
    _c('AOSC 433', 'Atmospheric Chemistry and Climate', 3, { category: 'major-upper' }),
    _c('AOSC 445', 'Climate Data Science', 3, { category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('AOSC 493', 'Senior Research Project I', 3, { category: 'major-upper', isGoal: true }),
    _c('AOSC 494', 'Atmospheric and Oceanic Science Seminar', 1, { category: 'major-upper' }),
    _c('AOSC 498', 'Senior Research Project II', 3, { prereqs: ['AOSC 493'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// BCHM - Biochemistry (BS, 120 cr)
// ============================================================
const SCHEDULE_BCHM = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CHEM 146', 'Principles of General Chemistry', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('CHEM 177', 'Introduction to Laboratory Practices and Research in the Chemical Sciences', 2, { kind: 'gened', category: 'gened-dsnl' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('CHEM 237', 'Principles of Organic Chemistry I', 4, { prereqs: ['CHEM 146'], category: 'major-core' }),
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('CHEM 247', 'Principles of Organic Chemistry II', 4, { prereqs: ['CHEM 237'], category: 'major-core' }),
    _c('CHEM 276', 'General Chemistry and Energetics - Majors', 2, { prereqs: ['CHEM 146'], category: 'major-core' }),
    _c('CHEM 277', 'Fundamentals of Analytical and Bioanalytical Chemistry Laboratory', 3, { prereqs: ['CHEM 177'], category: 'major-core' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Mechanics, Vibrations, Waves, Heat (Laboratory)', 1, { coreqs: ['PHYS 260'], category: 'major-support' }),
    _c('CHEM 395', 'Professional Issues in Chemistry and Biochemistry', 1, { category: 'major-core' }),
    _c('CHEM 425', 'Instrumental Methods of Analysis', 4, { prereqs: ['CHEM 276','CHEM 277'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('CHEM 481', 'Physical Chemistry I', 3, { prereqs: ['MATH 241','PHYS 260'], category: 'major-upper' }),
    _c('CHEM 483', 'Physical Chemistry Laboratory I', 2, { coreqs: ['CHEM 481'], category: 'major-upper' }),
    _c('BCHM 461', 'Biochemistry I', 3, { prereqs: ['CHEM 247'], category: 'major-upper' }),
    _c('BSCI 222', 'Principles of Genetics', 4, { prereqs: ['BSCI 170'], category: 'major-support' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BCHM 462', 'Biochemistry II', 3, { prereqs: ['BCHM 461'], category: 'major-upper' }),
    _c('BCHM 464', 'Biochemistry Laboratory', 3, { prereqs: ['BCHM 461'], category: 'major-upper' }),
    _c('BCHM 485', 'Physical Biochemistry', 3, { prereqs: ['BCHM 461'], category: 'major-upper' }),
    _c('BSCI 410', 'Molecular Genetics', 3, { prereqs: ['BSCI 222'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BCHM 465', 'Biochemistry III', 3, { prereqs: ['BCHM 462'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// NEUR - Neuroscience (BS, Molecular/Cellular/Physiology track, 120 cr)
// ============================================================
const SCHEDULE_NEUR = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('NEUR 200', 'Introduction to Neuroscience', 3, { category: 'major-core' }),
    _c('BSCI 160', 'Principles of Ecology and Evolution', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('BSCI 161', 'Principles of Ecology and Evolution Lab', 1, { kind: 'gened', category: 'gened-dsnl' }),
    _c('MATH 135', 'Discrete Mathematics for Life Sciences', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support' }),
    _c('MATH 136', 'Calculus for Life Sciences', 4, { prereqs: ['MATH 135'], category: 'major-support' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { category: 'major-support' }),
    _c('CHEM 132', 'General Chemistry I Laboratory', 1, { coreqs: ['CHEM 131'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('CHEM 231', 'Organic Chemistry I', 3, { prereqs: ['CHEM 131'], category: 'major-support' }),
    _c('CHEM 232', 'Organic Chemistry Laboratory I', 1, { coreqs: ['CHEM 231'], category: 'major-support' }),
    _c('PSYC 100', 'Introduction to Psychology', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('STAT 400', 'Applied Probability and Statistics I', 3, { prereqs: ['MATH 136'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('CHEM 241', 'Organic Chemistry II', 3, { prereqs: ['CHEM 231'], category: 'major-support' }),
    _c('CHEM 242', 'Organic Chemistry Laboratory II', 1, { coreqs: ['CHEM 241'], category: 'major-support' }),
    _c('CHEM 271', 'General Chemistry and Energetics', 2, { prereqs: ['CHEM 131'], category: 'major-support' }),
    _c('CHEM 272', 'General Bioanalytical Chemistry Laboratory', 2, { coreqs: ['CHEM 271'], category: 'major-support' }),
    _c('PHYS 131', 'Fundamentals of Physics for Life Sciences I', 4, { prereqs: ['MATH 136'], category: 'major-support' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('PHYS 132', 'Fundamentals of Physics for Life Sciences II', 4, { prereqs: ['PHYS 131'], category: 'major-support' }),
    _c('NEUR 305', 'Neural Systems and Circuits', 3, { prereqs: ['NEUR 200'], category: 'major-core' }),
    _c('NEUR 306', 'Cellular and Molecular Neuroscience', 3, { prereqs: ['NEUR 200'], category: 'major-core' }),
    _c('BSCI 222', 'Principles of Genetics', 4, { prereqs: ['BSCI 170'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('NEUR 405', 'Neuroscience Laboratory', 4, { prereqs: ['NEUR 305','NEUR 306'], category: 'major-upper', isGoal: true }),
    _c('BSCI 331', 'Cell Biology and Physiology', 3, { prereqs: ['BSCI 222'], category: 'major-upper' }),
    _c('BSCI 332', 'Cell Biology and Physiology Laboratory', 1, { coreqs: ['BSCI 331'], category: 'major-upper' }),
    _c('BCHM 461', 'Biochemistry I', 3, { prereqs: ['CHEM 241'], category: 'major-upper' }),
    _c('BSCI 410', 'Molecular Genetics', 3, { prereqs: ['BSCI 222'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BSCI 440', 'Mammalian Physiology', 4, { prereqs: ['BSCI 331'], category: 'major-upper' }),
    _c('NEUR 479', 'Advanced Research in Neuroscience', 1, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 5, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// GEOL - Geology (BS, Professional track, 120 cr)
// ============================================================
const SCHEDULE_GEOL = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('GEOL 100', 'Physical Geology', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('GEOL 110', 'Physical Geology Laboratory', 1, { kind: 'gened', category: 'gened-dsnl' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('GEOL 102', 'Historical Geology', 4, { prereqs: ['GEOL 100'], category: 'major-core' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { category: 'major-support' }),
    _c('CHEM 132', 'General Chemistry I Laboratory', 1, { coreqs: ['CHEM 131'], category: 'major-support' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('GEOL 322', 'Mineralogy', 4, { prereqs: ['GEOL 102'], category: 'major-core' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Mechanics, Vibrations, Waves, Heat (Laboratory)', 1, { coreqs: ['PHYS 161'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('GEOL 341', 'Structural Geology', 4, { prereqs: ['GEOL 322'], category: 'major-core' }),
    _c('GEOL 342', 'Sedimentation and Stratigraphy', 4, { prereqs: ['GEOL 102'], category: 'major-core' }),
    _c('GEOL 351', 'Statistics for Geoscientists', 3, { category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('GEOL 423', 'Optical Mineralogy', 4, { prereqs: ['GEOL 322'], category: 'major-core' }),
    _c('GEOL 443', 'Petrology', 4, { prereqs: ['GEOL 423'], category: 'major-core' }),
    _c('GEOL 340', 'Geomorphology', 4, { category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('GEOL 446', 'Geophysics', 3, { category: 'major-upper' }),
    _c('GEOL 444', 'Low Temperature Geochemistry', 4, { category: 'major-upper' }),
    _c('GEOL 331', 'Principles of Paleontology', 4, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('GEOL 393', 'Geology Senior Thesis I: Proposal', 3, { category: 'major-upper', isGoal: true }),
    _c('GEOL 412', 'Geology of the Terrestrial Planets', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('GEOL 394', 'Geology Senior Thesis II: Research', 3, { prereqs: ['GEOL 393'], category: 'major-upper', isGoal: true }),
    _c('GEOL 490', 'Geology Field Camp', 6, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ARCH - Architecture (BS option, 120 cr)
// ============================================================
const SCHEDULE_ARCH = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ARCH 171', 'Design Thinking and Making in Architecture', 3, { category: 'major-core' }),
    _c('MATH 120', 'Elementary Calculus I', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ARCH 225', 'History of World Architecture I', 3, { category: 'major-core' }),
    _c('ARCH 200', 'Design Media and Representation I', 3, { category: 'major-core' }),
    _c('PHYS 121', 'Fundamentals of Physics I', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ARCH 226', 'History of World Architecture II', 3, { prereqs: ['ARCH 225'], category: 'major-core' }),
    _c('ARCH 300', 'Design Media and Representation II', 3, { prereqs: ['ARCH 200'], category: 'major-core' }),
    _c('ARCH 201', 'Elements and Principles of Architecture', 1, { category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ARCH 462', 'Methods & Materials of Building Construction', 3, { category: 'major-core' }),
    _c('ARCH 400', 'Architecture Design Studio I', 6, { category: 'major-core' }),
    _c('ARCH 463', 'Sustainable Systems in Architecture', 3, { category: 'major-core' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ARCH 401', 'Architecture Design Studio II', 6, { prereqs: ['ARCH 400'], category: 'major-upper' }),
    _c('ARCH 464', 'Architectural Structures I', 3, { category: 'major-upper' }),
    _c('ARCH 430', 'Measuring Sustainability in Architecture', 3, { category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ARCH 402', 'Architecture Design Studio III', 6, { prereqs: ['ARCH 401'], category: 'major-upper' }),
    _c('ARCH 465', 'Architectural Structures II', 3, { prereqs: ['ARCH 464'], category: 'major-upper' }),
    _c('ARCH 460', 'Site Analysis and Design', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ARCH 403', 'Architecture Design Studio IV', 6, { prereqs: ['ARCH 402'], category: 'major-upper', isGoal: true }),
    _c('ARCH 466', 'Environmental Systems in Architecture', 3, { category: 'major-upper' }),
    _c('ARCH 408', 'Special Topics Architecture Design Studio', 6, { category: 'major-upper' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ARCH 472', 'Building Information Modeling Communication and Collaboration', 3, { prereqs: ['ARCH 400'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// EDUC - Elementary Education (BS, 120 cr)
// ============================================================
const SCHEDULE_EDUC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('MATH 212', 'Elements of Numbers and Operations', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('HIST 200', 'Interpreting American History: Beginnings to 1877', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { kind: 'gened', category: 'gened-dsnl' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('MATH 213', 'Elements of Geometry and Measurement', 3, { prereqs: ['MATH 212'], category: 'major-support' }),
    _c('MATH 214', 'Elements of Probability and Statistics', 3, { prereqs: ['MATH 212'], category: 'major-support' }),
    _c('PHYS 121', 'Fundamentals of Physics I', 4, { category: 'major-support' }),
    _c('TLPL 251', 'Community, Learners, and Classroom Climate', 3, { category: 'major-core' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('GEOG 100', 'Introduction to Geography', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
    _c('TLPL 340', "Introduction to Children's Literature and Critical Literacy", 3, { category: 'major-core' }),
    _c('SOCY 230', 'Sociological Social Psychology', 3, { category: 'major-support' }),
    _c('TLPL 250', 'Historical and Philosophical Perspectives on Education', 3, { category: 'major-core' }),
    _c('EDHD 411', 'Child Growth and Development', 3, { category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('EDSP 401', 'Teaching Students with Disabilities in Elementary Classrooms', 3, { category: 'major-upper' }),
    _c('TLPL 332', 'Arts Integration in Elementary Classrooms', 3, { category: 'major-upper' }),
    _c('Area Emphasis Elective A', 'Elementary Education Area of Emphasis', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
    _c('Area Emphasis Elective B', 'Elementary Education Area of Emphasis', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('TLPL 341', 'Assessing Language and Literacy Development in Elementary Classrooms', 3, { category: 'major-upper' }),
    _c('TLPL 342', 'Promoting Skilled and Motivated Readers in Diverse Elementary Classrooms (Part 1)', 3, { category: 'major-upper' }),
    _c('TLPL 361', 'Community, Learners, and Classroom Engagement', 3, { category: 'major-upper' }),
    _c('TLPL 362', 'Curriculum and Instruction in Elementary Education: Social Studies', 3, { category: 'major-upper' }),
    _c('TLPL 478B', 'Professional Seminar in Education: Community, Learners and Classroom Engagement', 1, { category: 'major-upper' }),
    _c('TLPL 479B', 'Field Experiences in Education', 1, { category: 'major-upper' }),
    _c('Area Emphasis Elective C', 'Elementary Education Area of Emphasis', 3, { kind: 'gened', category: 'gened-dssp', note: 'Satisfies DSSP when selected from approved area-of-emphasis options' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('TLPL 300', 'Digital Learning Tools and Communities', 1, { category: 'major-upper' }),
    _c('TLPL 312', 'Curriculum and Instruction in Elementary Education: Mathematics', 3, { category: 'major-upper' }),
    _c('TLPL 321', 'Curriculum and Instruction in Elementary Education: Science', 3, { category: 'major-upper' }),
    _c('TLPL 343', 'Promoting Skilled and Motivated Readers in Diverse Elementary Classrooms (Part 2)', 3, { category: 'major-upper' }),
    _c('TLPL 344', 'Culturally Responsive Language and Literacy Instruction in Diverse Elementary Classrooms', 3, { category: 'major-upper' }),
    _c('TLPL 446', 'Language Variation and Multilingualism in Elementary Classrooms', 3, { category: 'major-upper' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('TLPL 478C', 'Professional Seminar in Education: Community, Learners and Classroom Behavior', 1, { category: 'major-upper' }),
    _c('TLPL 489A', 'Internship in Education', 9, { category: 'major-upper', isGoal: true }),
    _c('Area Emphasis Elective D', 'Elementary Education Area of Emphasis', 3, { category: 'major-upper' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('TLPL 478D', 'Professional Seminar in Education', 2, { category: 'major-upper' }),
    _c('TLPL 489B', 'Internship in Education', 2, { category: 'major-upper', isGoal: true }),
    _c('Area Emphasis Elective E', 'Elementary Education Area of Emphasis', 3, { category: 'major-upper' }),
    _c('Area Emphasis Elective F', 'Elementary Education Area of Emphasis', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 1, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// PSYC — Psychology (BS)
// ============================================================
const SCHEDULE_PSYC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('PSYC 100', 'Introduction to Psychology', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 130', 'Calculus I for the Life Sciences', 4, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('BSCI 170', 'Principles of Molecular and Cellular Biology', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('BSCI 171', 'Molecular and Cellular Biology Lab', 1, { kind: 'gened', category: 'gened-dsnl' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support', categories: ['gened-fsar'], note: 'Double-counts: PSYC support + FSAR' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('PSYC 200', 'Statistical Methods in Psychology', 3, { prereqs: ['PSYC 100','STAT 100'], category: 'major-core' }),
    _c('PSYC 355', 'Developmental Psychology', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('PSYC 300', 'Research Methods in Psychology Laboratory', 4, { prereqs: ['PSYC 200'], category: 'major-core' }),
    _c('PSYC 341', 'Introduction to Memory and Cognition', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('PSYC 353', 'Adult Psychopathology', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('Free Elective', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('PSYC 334', 'Psychology of Interpersonal Relationships', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('PSYC 304', 'Biological Psychology', 3, { prereqs: ['PSYC 100','BSCI 170'], category: 'major-core' }),
    _c('PSYC 425', 'Psychology and Law', 3, { prereqs: ['PSYC 100','PSYC 200','PSYC 300'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('PSYC 431', 'Human and Animal Intelligence', 3, { prereqs: ['PSYC 300'], category: 'major-upper' }),
    _c('PSYC 436', 'Introduction to Clinical Psychology: From Science to Practice', 3, { prereqs: ['PSYC 300'], category: 'major-upper' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', categories: ['gened-dshs', 'gened-scis'], note: 'Satisfies DSHS SCIS' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('PSYC 426', 'Psychology of Adolescents\' Close Relationships: Parents, Peers, and Romantic Partners', 3, { prereqs: ['PSYC 355'], category: 'major-upper' }),
    _c('PSYC 447', 'Diversity in Organizations', 3, { prereqs: ['PSYC 300'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc'], note: 'Satisfies DSHU DVCC' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('PSYC 489', 'Advanced Special Topics in Psychology', 3, { prereqs: ['PSYC 300'], category: 'major-upper', isGoal: true }),
    _c('PSYC 437', 'The Assessment and Treatment of Addictive Behaviors', 3, { prereqs: ['PSYC 100'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective #2', 'Free Elective', 1, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// CCJS — Criminology & Criminal Justice (BA)
// BA degrees require 4 semesters of one foreign language
// ============================================================
const SCHEDULE_CCJS = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CCJS 100', 'Introduction to Criminal Justice', 3, { category: 'major-core' }),
    _c('CCJS 105', 'Introduction to Criminology', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 113', 'College Algebra and Trigonometry', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('Foreign Language 101', 'Foreign Language Sequence I', 4, { category: 'major-support', note: 'BA req' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('CCJS 230', 'Criminal Law in Action', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('Foreign Language 102', 'Foreign Language Sequence II', 4, { prereqs: ['Foreign Language 101'], category: 'major-support', note: 'BA req' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support', categories: ['gened-fsar'], note: 'Double-counts: CCJS support + FSAR' }),
    _c('CCJS 200', 'Statistics for Criminology and Criminal Justice', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('Foreign Language 201', 'Foreign Language Sequence III', 3, { prereqs: ['Foreign Language 102'], category: 'major-support', note: 'BA req' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('CCJS 300', 'Criminological and Criminal Justice Research Methods', 3, { prereqs: ['CCJS 105','CCJS 200'], category: 'major-core' }),
    _c('CCJS 320', 'Introduction to Criminalistics', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('Foreign Language 202', 'Foreign Language Sequence IV', 3, { prereqs: ['Foreign Language 201'], category: 'major-support', note: 'BA req' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('CCJS 340', 'Policing', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('CCJS 352', 'Drugs and Crime', 3, { prereqs: ['CCJS 105'], category: 'major-core' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('CCJS 400', 'Criminal Justice Process', 3, { prereqs: ['CCJS 200','CCJS 300'], category: 'major-core', isGoal: true }),
    _c('CCJS 451', 'Crime and Delinquency Prevention', 3, { prereqs: ['CCJS 105','CCJS 300'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc'], note: 'Satisfies DSHU DVCC' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('CCJS 453', 'White Collar and Organized Crime', 3, { prereqs: ['CCJS 300','CCJS 105'], category: 'major-upper' }),
    _c('CCJS 454', 'Contemporary Criminological Theory', 3, { prereqs: ['CCJS 300','CCJS 105'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('CCJS 498', 'Selected Topics in Criminology and Criminal Justice', 3, { prereqs: ['CCJS 400'], category: 'major-upper', isGoal: true }),
    _c('CCJS 460', 'Victim Advocacy', 3, { prereqs: ['CCJS 100'], category: 'major-upper' }),
    _c('CCJS 461', 'Psychology of Criminal Behavior', 3, { prereqs: ['CCJS 105','CCJS 300'], category: 'major-upper' }),
    _c('DSSP/SCIS Elective', 'I-Series Scholarship in Practice', 2, { kind: 'gened', category: 'gened-dssp', categories: ['gened-dssp', 'gened-scis'], note: 'Satisfies DSSP SCIS' }),
  ]},
];

// ============================================================
// GVPT — Government & Politics (BA)
// BA degrees require 4 semesters of one foreign language
// ============================================================
const SCHEDULE_GVPT = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('GVPT 100', 'Scope and Methods for Political Science Research', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 113', 'College Algebra and Trigonometry', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('Foreign Language 101', 'Foreign Language Sequence I', 4, { category: 'major-support', note: 'BA req' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('GVPT 170', 'American Government', 3, { category: 'major-core' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support', categories: ['gened-fsar'], note: 'Double-counts: GVPT support + FSAR' }),
    _c('Foreign Language 102', 'Foreign Language Sequence II', 4, { prereqs: ['Foreign Language 101'], category: 'major-support', note: 'BA req' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('GVPT 200', 'International Political Relations', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('GVPT 241', 'The Study of Political Philosophy', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('Foreign Language 201', 'Foreign Language Sequence III', 3, { prereqs: ['Foreign Language 102'], category: 'major-support', note: 'BA req' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('GVPT 280', 'The Study of Comparative Politics', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('GVPT 301', 'Identity and Conflict', 3, { prereqs: ['GVPT 100'], category: 'major-upper' }),
    _c('Foreign Language 202', 'Foreign Language Sequence IV', 3, { prereqs: ['Foreign Language 201'], category: 'major-support', note: 'BA req' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('GVPT 306', 'Global Environmental Politics', 3, { prereqs: ['GVPT 200'], category: 'major-upper' }),
    _c('GVPT 390', 'Game Theory', 3, { category: 'major-upper' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('GVPT 392', 'Introduction to Geographic Information Systems for Social Science Research', 3, { category: 'major-upper' }),
    _c('GVPT 402', 'International Law', 3, { prereqs: ['GVPT 200'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc'], note: 'Satisfies DSHU DVCC' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('GVPT 457', 'American Foreign Relations', 3, { prereqs: ['GVPT 200'], category: 'major-upper' }),
    _c('GVPT 460', 'State Politics and Government', 3, { prereqs: ['GVPT 170'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('GVPT 399', 'Seminar in Government and Politics', 3, { prereqs: ['GVPT 200','GVPT 280'], category: 'major-upper', isGoal: true }),
    _c('GVPT 475', 'The Presidency and the Executive Branch', 3, { prereqs: ['GVPT 170'], category: 'major-upper' }),
    _c('DSSP/SCIS Elective', 'I-Series Scholarship in Practice', 2, { kind: 'gened', category: 'gened-dssp', categories: ['gened-dssp', 'gened-scis'], note: 'Satisfies DSSP SCIS' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ENME — Mechanical Engineering (BS, 124 cr)
// ============================================================
const SCHEDULE_ENME = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ENES 100', 'Introduction to Engineering Design', 3, { category: 'major-core' }),
    _c('MATH 140', 'Calculus I', 4, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ENES 102', 'Mechanics I', 3, { prereqs: ['MATH 140'], category: 'major-core' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { coreqs: ['MATH 141'], category: 'major-support' }),
    _c('ENME 202', 'Computing Fundamentals for Engineers', 3, { prereqs: ['MATH 140'], category: 'major-core' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('MATH 240', 'Linear Algebra', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)', 1, { coreqs: ['PHYS 260'], category: 'major-support', categories: ['gened-dsnl'], note: 'Double-counts: ME support + DSNL' }),
    _c('ENES 221', 'Dynamics', 3, { prereqs: ['ENES 102'], category: 'major-core' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MATH 246', 'Differential Equations for Scientists and Engineers', 3, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENES 220', 'Mechanics II', 3, { prereqs: ['ENES 102'], category: 'major-core' }),
    _c('ENES 232', 'Thermodynamics', 3, { prereqs: ['MATH 141','PHYS 161'], category: 'major-core' }),
    _c('ENME 272', 'Introduction to Computer Aided Design', 2, { prereqs: ['ENME 202'], category: 'major-core' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective #1', 'Free Elective', 1, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENME 350', 'Electronics and Instrumentation I', 3, { prereqs: ['ENME 202'], category: 'major-core' }),
    _c('ENME 331', 'Fluid Mechanics', 3, { prereqs: ['ENES 232','MATH 246'], category: 'major-core' }),
    _c('ENME 351', 'Electronics and Instrumentation II', 3, { prereqs: ['ENME 350'], category: 'major-core' }),
    _c('ENME 382', 'Introduction to Materials Engineering', 3, { prereqs: ['ENES 220'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENME 361', 'Vibration, Controls and Optimization I', 3, { prereqs: ['ENES 221','MATH 246'], category: 'major-core' }),
    _c('ENME 392', 'Statistical Methods for Product and Processes Development', 3, { prereqs: ['ENME 202'], category: 'major-core' }),
    _c('ENME 332', 'Transfer Processes', 3, { prereqs: ['ENME 331'], category: 'major-core' }),
    _c('ENME 371', 'Product Engineering and Manufacturing', 3, { prereqs: ['ENME 272'], category: 'major-core' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENME 462', 'Vibrations, Controls, and Optimization II', 3, { prereqs: ['ENME 361'], category: 'major-core' }),
    _c('ENME 416', 'Additive Manufacturing', 3, { prereqs: ['ENME 331','ENME 272'], category: 'major-upper' }),
    _c('ENME 441', 'Mechatronics and the Internet of Things', 3, { prereqs: ['ENME 351'], category: 'major-upper' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc'], note: 'Satisfies DSHU DVCC' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ENME 472', 'Integrated Product and Process Development', 3, { prereqs: ['ENME 462'], category: 'major-upper', isGoal: true }),
    _c('ENME 470', 'Finite Element Analysis', 3, { category: 'major-upper', note: 'Senior standing; department permission' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 4, { kind: 'gened', category: 'gened-fsar', categories: ['gened-fsar', 'gened-dssp'], note: 'Satisfies FSAR DSSP' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', categories: ['gened-dshs', 'gened-scis'], note: 'Satisfies DSHS SCIS' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

function _smithBusinessCommonTerms() {
  return [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('BMGT 110', 'Introduction to the Business Value Chain', 3, { category: 'major-core' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('MATH 220', 'Elementary Calculus I', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ECON 201', 'Principles of Macroeconomics', 3, { prereqs: ['ECON 200'], category: 'major-core' }),
    _c('BMGT 230', 'Business Statistics', 3, { prereqs: ['MATH 220'], category: 'major-core' }),
    _c('BMGT 220', 'Principles of Accounting I', 3, { category: 'major-core' }),
    _c('DSHU/DVUP Elective', 'Humanities and Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('BMGT 221', 'Principles of Accounting II', 3, { prereqs: ['BMGT 220'], category: 'major-core' }),
    _c('BMGT 301', 'Information Systems, AI, and Digital Transformation', 3, { category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning and Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('BMGT 340', 'Business Finance', 3, { prereqs: ['BMGT 220','ECON 201'], category: 'major-core' }),
    _c('BMGT 350', 'Marketing Principles and Organization', 3, { prereqs: ['ECON 200'], category: 'major-core' }),
    _c('BMGT 364', 'Managing People and Organizations', 3, { category: 'major-core' }),
    _c('BMGT 367', 'Career Search Strategies in Business', 1, { category: 'major-core' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('DSHS/SCIS Elective', 'History/Social Sciences and I-Series', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  ];
}

function _smithBusinessSchedule(upperTerms) {
  return [..._smithBusinessCommonTerms(), ...upperTerms];
}

// ============================================================
// FINANCE — Smith Business, Finance track (BS, 120 cr)
// ============================================================
const SCHEDULE_FINANCE = _smithBusinessSchedule([
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BMGT 380', 'Business Law I', 3, { category: 'major-core' }),
    _c('BMGT 343', 'Investments', 3, { prereqs: ['BMGT 340'], category: 'major-upper' }),
    _c('BMGT 440', 'Advanced Financial Management', 3, { prereqs: ['BMGT 340'], category: 'major-upper' }),
    _c('BMGT 347', 'Quantitative Financial Analysis', 3, { prereqs: ['BMGT 340','BMGT 343'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BMGT 441', 'Fixed Income', 3, { prereqs: ['BMGT 340'], category: 'major-upper' }),
    _c('BMGT 443', 'Applied Equity Analysis and Portfolio Management', 3, { prereqs: ['BMGT 343'], category: 'major-upper', isGoal: true }),
    _c('BMGT 446', 'International Finance', 3, { prereqs: ['BMGT 340'], category: 'major-upper' }),
    _c('BMGT 332', 'Quantitative Models for Management Decisions', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BMGT 341', 'Financial Markets', 3, { category: 'major-upper' }),
    _c('BMGT 445', 'Banking and Financial Institutions', 3, { prereqs: ['BMGT 340'], category: 'major-upper' }),
    _c('BMGT 495', 'Strategic Management', 3, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
]);

// ============================================================
// ACCOUNTING — Smith Business, Public Accounting path (BS, 120 cr)
// ============================================================
const SCHEDULE_ACCOUNTING = _smithBusinessSchedule([
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BMGT 380', 'Business Law I', 3, { category: 'major-core' }),
    _c('BMGT 310', 'Intermediate Accounting I', 3, { prereqs: ['BMGT 221'], category: 'major-upper' }),
    _c('BMGT 321', 'Managerial Accounting', 3, { prereqs: ['BMGT 221'], category: 'major-upper' }),
    _c('BMGT 326', 'Accounting Systems', 3, { prereqs: ['BMGT 221'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BMGT 311', 'Intermediate Accounting II', 3, { prereqs: ['BMGT 310'], category: 'major-upper' }),
    _c('BMGT 323', 'Taxation of Individuals', 3, { prereqs: ['BMGT 221'], category: 'major-upper' }),
    _c('BMGT 411', 'Ethics and Professionalism in Accounting', 3, { prereqs: ['BMGT 310'], category: 'major-upper' }),
    _c('BMGT 422', 'Auditing Theory and Practice', 3, { prereqs: ['BMGT 310'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BMGT 417', 'Taxation of Corporations, Partnerships and Estates', 3, { prereqs: ['BMGT 323'], category: 'major-upper', isGoal: true }),
    _c('BMGT 495', 'Strategic Management', 3, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
]);

// ============================================================
// INFORMATION SYSTEMS — Smith Business (BS, 120 cr)
// ============================================================
const SCHEDULE_IS = _smithBusinessSchedule([
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BMGT 380', 'Business Law I', 3, { category: 'major-core' }),
    _c('BMGT 302', 'Essential Programming and AI Skills for Business Analytics', 3, { category: 'major-upper' }),
    _c('BMGT 402', 'Database Systems', 3, { category: 'major-upper' }),
    _c('BMGT 403', 'Systems Analysis and Design', 3, { category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BMGT 407', 'Information Systems Projects', 3, { prereqs: ['BMGT 402','BMGT 403'], category: 'major-upper' }),
    _c('BMGT 400', 'Data Visualization and Web Analytics', 3, { category: 'major-upper' }),
    _c('BMGT 401', 'Big Data and AI using Cloud Computing', 3, { category: 'major-upper' }),
    _c('BMGT 430', 'Data Modeling in Business', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BMGT 485', 'Project Management', 3, { category: 'major-upper' }),
    _c('BMGT 495', 'Strategic Management', 3, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
]);

// ============================================================
// MARKETING — Smith Business (BS, 120 cr)
// ============================================================
const SCHEDULE_MARKETING = _smithBusinessSchedule([
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BMGT 380', 'Business Law I', 3, { category: 'major-core' }),
    _c('BMGT 354', 'Consumer Analysis', 3, { prereqs: ['BMGT 350'], category: 'major-upper' }),
    _c('BMGT 351', 'Marketing Research Methods', 3, { prereqs: ['BMGT 350'], category: 'major-upper' }),
    _c('BMGT 457', 'Marketing Policies and Strategies', 3, { prereqs: ['BMGT 350'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BMGT 456', 'Customer-Centric Innovation', 3, { prereqs: ['BMGT 350'], category: 'major-upper' }),
    _c('BMGT 453', 'Retail Management', 3, { prereqs: ['BMGT 220','BMGT 350'], category: 'major-upper' }),
    _c('BMGT 450', 'Integrated Marketing Communications', 3, { prereqs: ['BMGT 350'], category: 'major-upper' }),
    _c('BMGT 454', 'Global Marketing', 3, { prereqs: ['BMGT 350'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BMGT 455', 'Sales Management', 3, { prereqs: ['BMGT 350'], category: 'major-upper' }),
    _c('BMGT 495', 'Strategic Management', 3, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
]);

// ============================================================
// MANAGEMENT — Smith Business (BS, 120 cr)
// ============================================================
const SCHEDULE_MGMT = _smithBusinessSchedule([
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BMGT 380', 'Business Law I', 3, { category: 'major-core' }),
    _c('BMGT 363', 'Leadership and Teamwork in Organizations', 3, { category: 'major-upper' }),
    _c('BMGT 362', 'Negotiations', 3, { category: 'major-upper' }),
    _c('BMGT 360', 'Strategic Management of Human Capital', 3, { category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BMGT 366', 'Growth Strategies for Emerging Companies', 3, { category: 'major-upper' }),
    _c('BMGT 461', 'Entrepreneurship', 3, { category: 'major-upper' }),
    _c('BMGT 463', 'Cross-cultural Challenges in Business', 3, { category: 'major-upper' }),
    _c('BMGT 466', 'Global Business Strategy', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BMGT 495', 'Strategic Management', 3, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
]);

// ============================================================
// SUPPLY CHAIN MANAGEMENT — Smith Business (BS, 120 cr)
// ============================================================
const SCHEDULE_SCM = _smithBusinessSchedule([
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BMGT 380', 'Business Law I', 3, { category: 'major-core' }),
    _c('BMGT 370', 'Introduction to Transportation', 3, { category: 'major-upper' }),
    _c('BMGT 372', 'Introduction to Logistics and Supply Chain Management', 3, { category: 'major-upper' }),
    _c('BMGT 472', 'Purchasing and Inbound Logistics', 3, { prereqs: ['BMGT 372'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BMGT 476', 'Technology Applications in Supply Chain Management', 3, { prereqs: ['BMGT 372'], category: 'major-upper' }),
    _c('BMGT 477', 'International Supply Chain Management', 3, { category: 'major-upper' }),
    _c('BMGT 385', 'Operations Management', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BMGT 475', 'Supply Chain Strategy and Network Design', 3, { prereqs: ['BMGT 372'], category: 'major-upper', isGoal: true }),
    _c('BMGT 495', 'Strategic Management', 3, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
]);

// ============================================================
// INST — Information Science (BS, 120 cr)
// ============================================================
const SCHEDULE_INST = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('INST 126', 'Introduction to Programming for Information Science', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 113', 'College Algebra and Trigonometry', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('INST 201', 'Introduction to Information Science', 3, { category: 'major-core' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support', categories: ['gened-fsar'], note: 'Double-counts: INST support + FSAR' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('INST 301', 'Introduction to Information Science', 3, { prereqs: ['INST 126'], category: 'major-core' }),
    _c('INST 311', 'Information Organization', 3, { prereqs: ['INST 201'], category: 'major-core' }),
    _c('INST 314', 'Statistics for Information Science', 3, { prereqs: ['STAT 100'], category: 'major-core' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('INST 326', 'Object-Oriented Programming for Information Science', 3, { prereqs: ['INST 126'], category: 'major-core' }),
    _c('INST 327', 'Database Design and Modeling', 3, { prereqs: ['INST 126'], category: 'major-core' }),
    _c('INST 335', 'Organizations, Management and Teamwork', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('INST 352', 'Information User Needs and Assessment', 3, { prereqs: ['INST 201'], category: 'major-core' }),
    _c('INST 362', 'User-Centered Design', 3, { prereqs: ['INST 352'], category: 'major-core' }),
    _c('INST 420', 'Data Applications in Global Health', 3, { prereqs: ['INST 314'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc'], note: 'Satisfies DSHU DVCC' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('INST 414', 'Data Science Techniques', 3, { prereqs: ['INST 314','INST 327'], category: 'major-upper', isGoal: true }),
    _c('INST 450', 'Introduction to CRM in Salesforce', 3, { prereqs: ['INST 327'], category: 'major-upper' }),
    _c('INST 453', 'Project Management for Information Science', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('INST 455', 'Information Assurance and Compliance', 3, { category: 'major-upper' }),
    _c('INST 456', 'Risk Management Leadership in the Information Age', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('INST 490', 'Integrated Capstone for Information Science', 3, { prereqs: ['INST 414'], category: 'major-upper', isGoal: true }),
    _c('INST 461', 'Emerging Technologies and Risk Management', 3, { category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', categories: ['gened-dshs', 'gened-scis'], note: 'Satisfies DSHS SCIS' }),
    _c('Free Elective', 'Free Elective', 1, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// COMM — Communication (BA, 120 cr)
// BA degrees require 4 semesters of one foreign language
// ============================================================
const SCHEDULE_COMM = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('COMM 107', 'Oral Communication', 3, { category: 'major-core', note: 'Satisfies FSOC' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('Foreign Language 101', 'Foreign Language Sequence I', 4, { category: 'major-support', note: 'BA req' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('MATH 113', 'College Algebra and Trigonometry', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('COMM 200', 'Critical Thinking and Speaking', 3, { prereqs: ['COMM 107'], category: 'major-core' }),
    _c('Foreign Language 102', 'Foreign Language Sequence II', 4, { prereqs: ['Foreign Language 101'], category: 'major-support', note: 'BA req' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('COMM 230', 'Argumentation and Debate', 3, { prereqs: ['COMM 107'], category: 'major-core' }),
    _c('COMM 250', 'Introduction to Communication Inquiry', 3, { category: 'major-core' }),
    _c('Foreign Language 201', 'Foreign Language Sequence III', 3, { prereqs: ['Foreign Language 102'], category: 'major-support', note: 'BA req' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('COMM 330', 'Argumentation and Public Policy', 3, { prereqs: ['COMM 230'], category: 'major-core' }),
    _c('COMM 350', 'Mass Communication and Society', 3, { prereqs: ['COMM 250'], category: 'major-core' }),
    _c('Foreign Language 202', 'Foreign Language Sequence IV', 3, { prereqs: ['Foreign Language 201'], category: 'major-support', note: 'BA req' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('COMM 401', 'Interpreting Strategic Discourse', 3, { prereqs: ['COMM 250'], category: 'major-upper' }),
    _c('COMM 450', 'Ancient Worlds of Rhetoric', 3, { prereqs: ['COMM 250'], category: 'major-upper' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('COMM 456', 'Freedom of Speech & the First Amendment', 3, { category: 'major-upper' }),
    _c('COMM 461', 'Voices of Public Leadership in the Twentieth Century', 3, { category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc'], note: 'Satisfies DSHU DVCC' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('COMM 402', 'Communication Theory and Process', 3, { prereqs: ['COMM 250'], category: 'major-core' }),
    _c('COMM 475', 'Persuasion', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('COMM 488', 'Communication Portfolio Project', 1, { category: 'major-upper', isGoal: true }),
    _c('COMM 476', 'Language, Communication, and Action', 3, { category: 'major-upper' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', categories: ['gened-fsar', 'gened-dssp'], note: 'Satisfies FSAR DSSP' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', categories: ['gened-dshs', 'gened-scis'], note: 'Satisfies DSHS SCIS' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ECON — Economics (BS, 120 cr)
// ============================================================
const SCHEDULE_ECON = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('MATH 140', 'Calculus I', 4, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ECON 201', 'Principles of Macroeconomics', 3, { prereqs: ['ECON 200'], category: 'major-core' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ECON 306', 'Intermediate Microeconomic Theory & Policy', 4, { prereqs: ['ECON 200','MATH 140'], category: 'major-core' }),
    _c('ECON 305', 'Intermediate Macroeconomic Theory and Policy', 4, { prereqs: ['ECON 201','MATH 140'], category: 'major-core' }),
    _c('STAT 400', 'Applied Probability and Statistics I', 3, { prereqs: ['MATH 141'], category: 'major-core', categories: ['gened-fsar'], note: 'Double-counts: ECON Core + FSAR' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ECON 321', 'Economic Statistics', 3, { prereqs: ['STAT 400'], category: 'major-core' }),
    _c('ECON 325', 'Intermediate Macroeconomic Analysis', 4, { prereqs: ['ECON 305','MATH 141'], category: 'major-core' }),
    _c('MATH 240', 'Linear Algebra', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ECON 326', 'Intermediate Microeconomic Analysis', 4, { prereqs: ['ECON 306','MATH 141'], category: 'major-core' }),
    _c('ECON 402', 'Macroeconomic Models and Forecasting', 3, { prereqs: ['ECON 325','ECON 321'], category: 'major-upper' }),
    _c('DSSP/SCIS Elective', 'I-Series Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp', categories: ['gened-dssp', 'gened-scis'], note: 'Satisfies DSSP SCIS' }),
    _c('Free Elective', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ECON 406', 'Advanced Microeconomics', 3, { prereqs: ['ECON 326','ECON 321'], category: 'major-upper' }),
    _c('ECON 410', 'Comparative Economic Institutions', 3, { prereqs: ['ECON 325','ECON 326','ECON 321'], category: 'major-upper' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', categories: ['gened-dshu', 'gened-dvcc'], note: 'Satisfies DSHU DVCC' }),
    _c('Free Elective', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ECON 414', 'Game Theory', 3, { prereqs: ['ECON 326'], category: 'major-upper', isGoal: true }),
    _c('ECON 454', 'Public Finance and Public Policy', 3, { prereqs: ['ECON 326','ECON 321'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ECON 422', 'Econometrics II', 3, { prereqs: ['ECON 321'], category: 'major-upper', isGoal: true }),
    _c('ECON 460', 'Industrial Organization', 3, { prereqs: ['ECON 326','ECON 321'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ENGL — English (BA, 120 cr)
// ============================================================
const SCHEDULE_ENGL = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('ENGL 201', 'Inventing Western Literature: Ancient and Medieval Traditions', 3, { category: 'major-core' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ENGL 301', 'This is English: Fields and Methods', 3, { prereqs: ['ENGL 101'], category: 'major-core' }),
    _c('ENGL 311', 'British Literature from 1600 to 1800', 3, { prereqs: ['ENGL 201'], category: 'major-core' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ENGL 312', 'Romantic to Modern British Literature', 3, { prereqs: ['ENGL 201'], category: 'major-core' }),
    _c('ENGL 313', 'American Literature', 3, { prereqs: ['ENGL 201'], category: 'major-core' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ENGL 402', 'Chaucer', 3, { prereqs: ['ENGL 301'], category: 'major-core' }),
    _c('ENGL 379M', 'Special Topics in Literature; British Plays in Performance', 3, { prereqs: ['ENGL 301'], category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('ENGL 433', 'American Literature: 1914 to the Present, the Modern Period', 3, { prereqs: ['ENGL 301'], category: 'major-upper' }),
    _c('ENGL 437', 'Contemporary American Literature', 3, { prereqs: ['ENGL 301'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENGL 489P', 'Special Topics in Language and Rhetoric; The Language of Political Persuasion', 3, { prereqs: ['ENGL 301'], category: 'major-upper' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENGL 498', 'Advanced Fiction Workshop', 3, { prereqs: ['ENGL 301'], category: 'major-upper', isGoal: true }),
    _c('ENGL 403', 'Shakespeare: The Early Works', 3, { prereqs: ['ENGL 301'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// JOUR — Journalism (BA, 120 cr)
// ============================================================
const SCHEDULE_JOUR = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('JOUR 175', 'Media Literacy', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'major-support', note: 'Satisfies FSAR' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('JOUR 200', 'Journalism History, Roles and Structures', 3, { category: 'major-core' }),
    _c('JOUR 201', 'News Writing and Reporting I', 3, { prereqs: ['JOUR 175'], category: 'major-core' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('JOUR 202', 'News Editing', 3, { prereqs: ['JOUR 201'], category: 'major-core' }),
    _c('JOUR 320', 'News Writing and Reporting II: Multiplatform', 3, { prereqs: ['JOUR 201'], category: 'major-core' }),
    _c('JOUR 352', 'Interactive Design and Development', 3, { prereqs: ['JOUR 201'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('JOUR 353', 'News Bureau: Multimedia Reporting', 6, { prereqs: ['JOUR 320'], category: 'major-core' }),
    _c('JOUR 402', 'Journalism Law and Ethics', 3, { prereqs: ['JOUR 201'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('JOUR 456', 'Literature in Journalism', 3, { prereqs: ['JOUR 201'], category: 'major-core' }),
    _c('JOUR 453', 'News Coverage of Racial Issues', 3, { prereqs: ['JOUR 201'], category: 'major-upper' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('JOUR 451', 'Advertising and Society', 3, { prereqs: ['JOUR 201'], category: 'major-upper' }),
    _c('JOUR 458B', 'Special Topics in Journalism; Sports Media Today', 3, { prereqs: ['JOUR 201'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('JOUR 480', 'Capstone Colloquium: The Business of News', 1, { prereqs: ['JOUR 353'], category: 'major-upper', isGoal: true }),
    _c('JOUR 472', 'Data Journalism', 3, { prereqs: ['JOUR 320'], category: 'major-upper' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// HIST — History (BA, 120 cr)
// ============================================================
const SCHEDULE_HIST = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('HIST 200', 'Interpreting American History: Beginnings to 1877', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('HIST 201', 'Interpreting American History: From 1865 to the Present', 3, { category: 'major-core' }),
    _c('HIST 205', 'Environmental History', 3, { category: 'major-core' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('HIST 208B', 'Historical Research and Methods Seminar; "How to Rule the World": Political Theory and Governance in the Ancient Mediterranean', 3, { prereqs: ['HIST 200','HIST 201'], category: 'major-core' }),
    _c('HIST 319L', 'Special Topics in History; Islam: Learning, Piety, and Practice', 3, { category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('HIST 407', 'Technology and Social Change in History', 3, { prereqs: ['HIST 208B'], category: 'major-core' }),
    _c('HIST 405', 'Environmental History', 3, { prereqs: ['HIST 208B'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('HIST 429F', 'Special Topics in History; MAC to Millennium: History of the University of Maryland', 3, { prereqs: ['HIST 208B'], category: 'major-upper' }),
    _c('HIST 462', 'Slavery, Sectionalism, and the U.S. Civil War', 3, { prereqs: ['HIST 208B'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('HIST 408B', 'Senior Seminar; What Does Government Do? The State in American History', 3, { prereqs: ['HIST 208B'], category: 'major-upper', isGoal: true }),
    _c('HIST 451', 'American Capitalism: 1900 to Present', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// SOCY — Sociology (BA, 120 cr)
// ============================================================
const SCHEDULE_SOCY = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('SOCY 100', 'Introduction to Sociology', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'major-support', note: 'Satisfies FSAR' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('SOCY 105', 'Introduction to Contemporary Social Problems', 3, { category: 'major-core' }),
    _c('SOCY 201', 'Introductory Statistics for Sociology', 4, { prereqs: ['SOCY 100'], category: 'major-core' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('SOCY 202', 'Introduction to Research Methods in Sociology', 4, { prereqs: ['SOCY 201'], category: 'major-core' }),
    _c('SOCY 410', 'Social Demography', 3, { prereqs: ['SOCY 201'], category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('SOCY 441', 'Social Stratification and Inequality', 3, { prereqs: ['SOCY 201'], category: 'major-core' }),
    _c('SOCY 424', 'Sociology of Race Relations', 3, { prereqs: ['SOCY 201'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('SOCY 428', 'Research in Inequality', 3, { prereqs: ['SOCY 202'], category: 'major-upper' }),
    _c('SOCY 465', 'The Sociology of War', 3, { prereqs: ['SOCY 201'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('SOCY 498C', 'Selected Topics in Sociology; Sociology of Culture', 3, { prereqs: ['SOCY 202'], category: 'major-upper', isGoal: true }),
    _c('SOCY 475', 'Sociology of Emotions', 3, { prereqs: ['SOCY 201'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// SPAN — Spanish Language & Cultures (BA, 120 cr)
// ============================================================
const SCHEDULE_SPAN = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('SPAN 203', 'Intensive Intermediate Spanish', 4, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('SPAN 204', 'Spanish Grammar Review', 3, { prereqs: ['SPAN 203'], category: 'major-core' }),
    _c('SPAN 301', 'Advanced Grammar and Composition I', 3, { prereqs: ['SPAN 204'], category: 'major-core' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('SPAN 303', 'Approaches to Cultural Materials in the Hispanic World', 3, { prereqs: ['SPAN 301'], category: 'major-core' }),
    _c('SPAN 325', 'Hispanic Linguistics I: Phonetics and Phonology', 3, { prereqs: ['SPAN 301'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('SPAN 363', 'Latin American Literatures and Cultures III: From Modernism to Neo-Liberalism', 3, { prereqs: ['SPAN 303'], category: 'major-upper' }),
    _c('SPAN 401', 'Advanced Composition I', 3, { prereqs: ['SPAN 301'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('SPAN 450', 'The Hispanic Caribbean: What is a Beach?', 3, { prereqs: ['SPAN 303'], category: 'major-upper' }),
    _c('SPAN 470', 'Spanish for Business II', 3, { prereqs: ['SPAN 401'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('SPAN 408K', 'Special Topics in Iberian and Latin American Studies; Speaking Up/Out: Women Writers and Feminist Social Movements in Contemporary Latin America', 3, { prereqs: ['SPAN 363'], category: 'major-upper', isGoal: true }),
    _c('SPAN 452', 'Reflecting on Neoliberalism and Contemporary Southern Cone Culture', 3, { prereqs: ['SPAN 363'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// PHIL — Philosophy (BA, 120 cr)
// ============================================================
const SCHEDULE_PHIL = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('PHIL 170', 'Introduction to Symbolic Logic', 3, { category: 'major-core', note: 'Satisfies FSAR' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('PHIL 250', 'Philosophy of Science I', 3, { category: 'major-core' }),
    _c('PHIL 310', 'Ancient Greek and Roman Philosophy', 3, { category: 'major-core' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('PHIL 320', 'Knowing Oneself and Knowing the World: Early Modern Philosophy from Descartes to Kant', 3, { prereqs: ['PHIL 310'], category: 'major-core' }),
    _c('PHIL 332', 'Philosophy of Beauty', 3, { category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('PHIL 370', 'Logical Theory I: Metatheory', 3, { prereqs: ['PHIL 170'], category: 'major-core' }),
    _c('PHIL 360', 'Philosophy of Language', 3, { prereqs: ['PHIL 170'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('PHIL 428A', 'Topics in the History of Philosophy; Postcolonialism', 3, { prereqs: ['PHIL 310','PHIL 320'], category: 'major-upper' }),
    _c('PHIL 445', 'Contemporary Political Philosophy', 3, { category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('PHIL 408R', 'The Practice of Philosophy: How To Develop Your Own Work', 3, { prereqs: ['PHIL 360','PHIL 428A'], category: 'major-upper', isGoal: true }),
    _c('PHIL 443', 'Moral Psychology', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ARTH — Art History (BA, 120 cr)
// ============================================================
const SCHEDULE_ARTH = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ARTH 200', 'Art and Society in Ancient and Medieval Europe and the Mediterranean', 3, { category: 'major-core' }),
    _c('ARTH 221', 'Color: Art, Science, and Culture', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ARTH 201', 'Art and Society in the West from the Renaissance to the Present', 3, { category: 'major-core' }),
    _c('ARTH 250', 'Art and Society in the Ancient American World', 3, { category: 'major-core' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ARTH 320', 'Fourteenth and Fifteenth-Century Northern European Art', 3, { category: 'major-core' }),
    _c('ARTH 351', 'Picturing Contemporary Life: Art Since 1945', 3, { category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ARTH 418', 'Special Problems in Italian Renaissance Art', 3, { prereqs: ['ARTH 201'], category: 'major-upper' }),
    _c('ARTH 465', 'The Landscape in Modern and Contemporary Art', 3, { prereqs: ['ARTH 201'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ARTH 488K', 'Colloquium in Art History; Art History in the Museum World', 3, { prereqs: ['ARTH 320'], category: 'major-core' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ARTH 489K', 'Special Topics in Art History; Art and the Museum World', 3, { prereqs: ['ARTH 488K'], category: 'major-upper', isGoal: true }),
    _c('ARTH 484', 'Modern Chinese Film and Visual Culture', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// LING — Linguistics (BA, 120 cr)
// ============================================================
const SCHEDULE_LING = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('LING 200', 'Introductory Linguistics', 3, { category: 'major-core' }),
    _c('LING 240', 'Language and Mind', 3, { category: 'major-core' }),
    _c('PHIL 170', 'Introduction to Symbolic Logic', 3, { category: 'major-support', note: 'Satisfies FSAR' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('LING 311', 'Syntax I', 3, { prereqs: ['LING 200'], category: 'major-core' }),
    _c('LING 321', 'Phonology I', 3, { prereqs: ['LING 200'], category: 'major-core' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'major-support' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('LING 322', 'Phonology II', 3, { prereqs: ['LING 321'], category: 'major-core' }),
    _c('LING 330', 'Historical Linguistics', 3, { prereqs: ['LING 200'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('LING 410', 'Grammar and Meaning', 3, { prereqs: ['LING 311'], category: 'major-upper' }),
    _c('LING 420', 'Word Formation', 3, { prereqs: ['LING 311'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('LING 419B', 'Topics in Syntax; The Syntax of Silence', 3, { prereqs: ['LING 311'], category: 'major-upper' }),
    _c('LING 440', 'Grammars and Cognition', 3, { prereqs: ['LING 311'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('LING 444', 'Child Language Acquisition', 3, { prereqs: ['LING 311'], category: 'major-upper', isGoal: true }),
    _c('LING 460', 'Diversity and Unity in Human Languages', 3, { prereqs: ['LING 200'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// THET — Theatre (BA, 120 cr)
// ============================================================
const SCHEDULE_THET = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('THET 110', 'Introduction to the Theatre', 3, { category: 'major-core' }),
    _c('THET 120', 'Introduction to Acting', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('THET 116', 'Fundamentals of Theatrical Design', 3, { category: 'major-core' }),
    _c('THET 222', 'Foundations of Acting and Performance', 3, { prereqs: ['THET 120'], category: 'major-core' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('THET 223', 'Text and Context in Western Theatre', 3, { category: 'major-core' }),
    _c('THET 274', 'Introduction to Stage Management', 3, { category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('THET 330', 'Play Directing I', 3, { prereqs: ['THET 222','THET 223'], category: 'major-core' }),
    _c('THET 371', 'Scenic Design I', 3, { prereqs: ['THET 116'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('THET 408W', 'Seminar: Theory and Performance Studies; Documentary Theatre: Abolition Then and Now', 3, { prereqs: ['THET 223'], category: 'major-upper' }),
    _c('THET 447', 'Technologies of Japanese Performance', 3, { prereqs: ['THET 223'], category: 'major-upper' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('THET 477', 'Design Studio in Lighting', 3, { prereqs: ['THET 371'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('THET 489P', 'Special Topics in Theatre History from 1800 to Present; History of Shakespeare in Performance', 3, { prereqs: ['THET 223'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// MUSC — Music (BA, 120 cr)
// ============================================================
const SCHEDULE_MUSC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('MUSC 150', 'Theory of Music I', 3, { category: 'major-core' }),
    _c('MUSC 210', 'The Impact of Music on Life', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('MUSC 151', 'Theory of Music II', 3, { prereqs: ['MUSC 150'], category: 'major-core' }),
    _c('MUSC 310', 'Music History I', 3, { category: 'major-core' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('MUSC 250', 'Advanced Theory of Music I', 4, { prereqs: ['MUSC 151'], category: 'major-core' }),
    _c('MUSC 330', 'Music History III', 3, { category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MUSC 251', 'Advanced Theory of Music II', 4, { prereqs: ['MUSC 250'], category: 'major-core' }),
    _c('MUSC 443', 'Solo Vocal Literature', 3, { category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('MUSC 448C', 'Selected Topics in Music; Advanced Analytical Techniques II', 3, { prereqs: ['MUSC 251'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('MUSC 450', 'Musical Form', 3, { prereqs: ['MUSC 251'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ARTT — Studio Art (BA, 120 cr)
// ============================================================
const SCHEDULE_ARTT = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ARTT 100', 'Two-Dimensional Design Fundamentals', 3, { category: 'major-core' }),
    _c('ARTT 110', 'Elements of Drawing I', 3, { category: 'major-core' }),
    _c('ARTT 150', 'Introduction to Art Theory', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ARTT 200', 'Three-Dimensional Art Fundamentals', 3, { category: 'major-core' }),
    _c('ARTT 210', 'Elements of Drawing II', 3, { prereqs: ['ARTT 110'], category: 'major-core' }),
    _c('ARTH 200', 'Art and Society in Ancient and Medieval Europe and the Mediterranean', 3, { category: 'major-support' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ARTT 255', 'Introduction to Digital Art and Design Processes', 3, { category: 'major-core' }),
    _c('ARTT 320', 'Elements of Painting', 3, { prereqs: ['ARTT 110'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ARTT 418', 'Advanced Drawing Studio; Advanced Drawing', 3, { prereqs: ['ARTT 210'], category: 'major-upper' }),
    _c('ARTT 428', 'Advanced Painting Studio; Advanced Painting', 3, { prereqs: ['ARTT 320'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ARTT 458', 'Graphic Design Portfolio; Advanced Graphic Design', 3, { prereqs: ['ARTT 255'], category: 'major-upper' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ARTT 489C', 'Advanced Special Topics in Art; Markets and Collecting', 3, { category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// CINE — Cinema & Media Studies (BA, 120 cr)
// ============================================================
const SCHEDULE_CINE = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CINE 245', 'Film Form and Culture', 3, { category: 'major-core' }),
    _c('CINE 280', 'Film Art in a Global Society', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('CINE 301', 'Cinema History I: The Silent Era', 3, { prereqs: ['CINE 245'], category: 'major-core' }),
    _c('CINE 302', 'Cinema History II: The Sound Era', 3, { prereqs: ['CINE 245'], category: 'major-core' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('CINE 344', 'Film and the Fantastic', 3, { prereqs: ['CINE 245'], category: 'major-upper' }),
    _c('CINE 385', 'German Cinema', 3, { prereqs: ['CINE 245'], category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('CINE 411', 'Experimental Film', 3, { prereqs: ['CINE 301','CINE 302'], category: 'major-core' }),
    _c('CINE 335', 'Transnational Chinese Cinema', 3, { prereqs: ['CINE 245'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('CINE 461', 'Political Cinema', 3, { prereqs: ['CINE 301','CINE 302'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('CINE 469M', 'Special Topics in Film Theories II; Methods and Issues in Cinema and Media Studies', 3, { prereqs: ['CINE 301','CINE 302'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// WMST — Women, Gender, & Sexuality Studies (BA, 120 cr)
// ============================================================
const SCHEDULE_WMST = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('WMST 200', 'Introduction to WGSS: Gender, Power, and Society', 3, { category: 'major-core' }),
    _c('WMST 250', 'Introduction to WGSS: Art and Culture', 3, { category: 'major-core' }),
    _c('SOCY 100', 'Introduction to Sociology', 3, { category: 'major-support' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('WMST 300', 'Feminist Reconceptualizations of Knowledge', 3, { prereqs: ['WMST 200'], category: 'major-core' }),
    _c('PSYC 100', 'Introduction to Psychology', 3, { category: 'major-support' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('WMST 314', 'Black Women in United States History', 3, { prereqs: ['WMST 200'], category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('WMST 452', 'Women in the Media', 3, { prereqs: ['WMST 200'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('WMST 471', 'Women\'s Health', 3, { prereqs: ['WMST 300'], category: 'major-upper' }),
    _c('WMST 488B', 'Senior Seminar; Health Inequality and Social Determinants: How Race, Ethnicity, Class, and Gender Matter', 3, { prereqs: ['WMST 300'], category: 'major-core' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('WMST 498Q', 'Advanced Special Topics in Women\'s Studies; Gender and Politics', 3, { prereqs: ['WMST 300'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// AMST — American Studies (BA, 120 cr)
// ============================================================
const SCHEDULE_AMST = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('AMST 202', 'Cultures of Everyday Life in America', 3, { category: 'major-core' }),
    _c('AMST 205', 'American Material Culture: The Study of People, Places, and Things', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('AMST 260', 'American Culture in the Information Age', 3, { category: 'major-core' }),
    _c('HIST 200', 'Interpreting American History: Beginnings to 1877', 3, { category: 'major-support' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('AMST 340', 'Introduction to History, Theories and Methods in American Studies', 3, { prereqs: ['AMST 202'], category: 'major-core' }),
    _c('AMST 328C', 'Perspectives on Identity and Culture; Black Popular Culture: The Politics of Blackness, Media, and Representation', 3, { category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('AMST 428P', 'American Cultural Eras; Power, Paranoia, and Politics in Postwar Film and Popular Culture', 3, { prereqs: ['AMST 340'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('AMST 450', 'Seminar in American Studies', 3, { prereqs: ['AMST 340'], category: 'major-core' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('AMST 398', 'Independent Studies', 1, { category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('AMST 498A', 'Special Topics in American Studies; Border Crossings: People, Power, and Politics in Transnational Perspective', 3, { prereqs: ['AMST 340'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// AAST — African American and Africana Studies (BA, 120 cr)
// ============================================================
const SCHEDULE_AAST = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('AAAS 100', 'Introduction to African American and Africana Studies', 3, { category: 'major-core' }),
    _c('AAAS 202', 'Black Culture in the United States', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('AAAS 211', 'Get Out: The Sunken Place of Race Relations in the Post-Racial Era', 3, { category: 'major-core' }),
    _c('HIST 200', 'Interpreting American History: Beginnings to 1877', 3, { category: 'major-support' }),
    _c('SOCY 100', 'Introduction to Sociology', 3, { category: 'major-support' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('AAAS 301', 'Applied Policy Analysis and the Black Community', 3, { prereqs: ['AAAS 100'], category: 'major-core' }),
    _c('AAAS 320', 'Poverty and African American Children', 3, { category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('AAAS 400', 'Directed Readings in African American and Africana Studies', 3, { prereqs: ['AAAS 100'], category: 'major-core' }),
    _c('AAAS 411', 'Black Resistance Movements', 3, { prereqs: ['AAAS 100'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('AAAS 443', 'Law and the Black Community', 3, { prereqs: ['AAAS 100'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('AAAS 402', 'Classic Readings in African American and Africana Studies', 3, { prereqs: ['AAAS 100'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ANTH — Anthropology (BA, 120 cr)
// ============================================================
const SCHEDULE_ANTH = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ANTH 222', 'Introduction to Ecological and Evolutionary Anthropology', 4, { category: 'major-core', note: 'Current catalog replacement for ANTH 220' }),
    _c('ANTH 240', 'Introduction to Archaeology', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ANTH 260', 'Introduction to Sociocultural Anthropology and Linguistics', 3, { category: 'major-core' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ANTH 305', 'Archaeological Methods and Practice', 3, { prereqs: ['ANTH 240'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ANTH 411', 'Anthropology of Immigration and Health', 3, { prereqs: ['ANTH 260'], category: 'major-core' }),
    _c('ANTH 415', 'Critical Global Health', 3, { prereqs: ['ANTH 260'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ANTH 447', 'Material Culture Studies in Archaeology', 3, { prereqs: ['ANTH 240'], category: 'major-upper' }),
    _c('ANTH 462', 'Amazon Through Film', 3, { prereqs: ['ANTH 260'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ANTH 498Y', 'Advanced Field Training in Ethnography; Applied Archaeological Field Research', 3, { prereqs: ['ANTH 305'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// FMSC - Family Science (BS, 120 cr)
// ============================================================
const SCHEDULE_FMSC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('FMSC 170', 'Modern Families', 3, { category: 'major-core' }),
    _c('FMSC 110', 'Families and Global Health', 3, { category: 'major-core' }),
    _c('PSYC 100', 'Introduction to Psychology', 3, { category: 'major-support' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('FMSC 260', 'Couple Relationships', 3, { category: 'major-core' }),
    _c('FMSC 290', 'Family Economics', 3, { category: 'major-core' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('FMSC 330', 'Family Theories and Patterns', 3, { prereqs: ['FMSC 170'], category: 'major-core' }),
    _c('FMSC 332', 'Children in Families', 3, { prereqs: ['FMSC 170'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('FMSC 381', 'Poverty, Affluence, and Families', 3, { prereqs: ['FMSC 170'], category: 'major-core' }),
    _c('FMSC 430', 'Gender Issues in Families', 3, { prereqs: ['FMSC 170'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('FMSC 450', 'The Loneliness Epidemic and Mental Health', 3, { prereqs: ['FMSC 170'], category: 'major-upper' }),
    _c('FMSC 487', 'Family Law', 3, { prereqs: ['FMSC 170'], category: 'major-core' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('FMSC 498', 'Special Topics: Family Science; Family Studies', 1, { prereqs: ['FMSC 330'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// GEOG - Geographical Sciences (BS, 120 cr)
// ============================================================
const SCHEDULE_GEOG = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('GEOG 201', 'Geography of Environmental Systems', 3, { category: 'major-core' }),
    _c('GEOG 202', 'Introduction to Human Geography', 3, { category: 'major-core' }),
    _c('MATH 130', 'Calculus I for the Life Sciences', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('GEOG 211', 'Geography of Environmental Systems Laboratory', 1, { prereqs: ['GEOG 201'], category: 'major-core' }),
    _c('GEOG 212', 'Career Planning for Geographical Sciences, GIS, and ENSP Majors', 1, { category: 'major-core' }),
    _c('GEOG 306', 'Introduction to Quantitative Methods for the Geographical Environmental Sciences', 3, { prereqs: ['GEOG 201'], category: 'major-core' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('GEOG 301', 'Advanced Geographical Environmental Systems', 3, { prereqs: ['GEOG 201'], category: 'major-core' }),
    _c('GEOG 372', 'Remote Sensing', 3, { prereqs: ['GEOG 201'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('GEOG 373', 'Geographic Information Systems', 3, { prereqs: ['GEOG 306'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('GEOG 470', 'Spatial Data Algorithms', 3, { prereqs: ['GEOG 373'], category: 'major-core' }),
    _c('GEOG 423', 'Latin America', 3, { category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('GEOG 432', 'Spatial Econometrics', 3, { prereqs: ['GEOG 306'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('GEOG 498I', 'Topical Investigations; Algorithms for Geospatial Computing', 3, { prereqs: ['GEOG 470'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// HESP - Hearing & Speech Sciences (BA, 120 cr)
// ============================================================
const SCHEDULE_HESP = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('HESP 120', 'Introduction to Linguistics', 3, { category: 'major-core' }),
    _c('PSYC 100', 'Introduction to Psychology', 3, { category: 'major-support' }),
    _c('LING 200', 'Introductory Linguistics', 3, { category: 'major-support' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('HESP 202', 'Introduction to Hearing and Speech Sciences', 3, { category: 'major-core' }),
    _c('BSCI 201', 'Human Anatomy and Physiology I', 4, { category: 'major-support' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('HESP 300', 'Introduction to Psycholinguistics', 3, { prereqs: ['HESP 120'], category: 'major-core' }),
    _c('HESP 311', 'Anatomy, Pathology and Physiology of the Auditory System', 3, { prereqs: ['HESP 202'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('HESP 400', 'Speech and Language Development in Children', 3, { prereqs: ['HESP 202'], category: 'major-core' }),
    _c('HESP 411', 'Introduction to Audiology', 3, { prereqs: ['HESP 311'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('HESP 402', 'Language and Phonological Disorders in Children', 3, { prereqs: ['HESP 400'], category: 'major-core' }),
    _c('HESP 406', 'Acquired Neurogenic Communication Disorders in Adults', 3, { prereqs: ['HESP 400'], category: 'major-upper' }),
    _c('HESP 417', 'Principles and Methods in Speech-Language Pathology and Audiology', 3, { prereqs: ['HESP 400'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('HESP 420', 'Deaf Culture and ASL for the CSD Professional', 3, { prereqs: ['HESP 202'], category: 'major-core' }),
    _c('HESP 422', 'Neurological Bases of Human Communication', 3, { prereqs: ['HESP 311'], category: 'major-upper' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('HESP 489', 'Undergraduate Research Experience', 1, { prereqs: ['HESP 400'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// KNES - Kinesiology (BS, 120 cr)
// ============================================================
const SCHEDULE_KNES = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('KNES 157T', 'Physical Education Activities: Coed; Fight the 15: Introduction to Fitness and an Active Lifestyle', 1, { category: 'major-core' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { category: 'major-support', categories: ['gened-dsns'], note: 'Double-counts: KNES support + DSNS' }),
    _c('MATH 130', 'Calculus I for the Life Sciences', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('BSCI 201', 'Human Anatomy and Physiology I', 4, { category: 'major-support' }),
    _c('BSCI 202', 'Human Anatomy and Physiology II', 4, { prereqs: ['BSCI 201'], category: 'major-support' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('KNES 287', 'Sport and American Society', 3, { category: 'major-core' }),
    _c('KNES 289', 'Topical Investigations', 1, { category: 'major-core' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('KNES 293', 'History of Sport in America', 3, { category: 'major-core' }),
    _c('KNES 350', 'The Psychology of Sports & Exercise', 3, { prereqs: ['KNES 287'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('KNES 360', 'Physiology of Exercise', 4, { prereqs: ['BSCI 201'], category: 'major-core' }),
    _c('KNES 385', 'Motor Control and Learning', 4, { prereqs: ['KNES 287'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('KNES 400', 'The Foundations of Public Health in Kinesiology', 3, { prereqs: ['KNES 287'], category: 'major-upper' }),
    _c('KNES 440', 'Psychology of Athletic Performance', 3, { prereqs: ['KNES 350'], category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('KNES 465', 'Physical Activity and Disease Prevention and Treatment', 3, { prereqs: ['KNES 360'], category: 'major-upper' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('KNES 450', 'From the Olympics to the Rehabilitation Clinic: Mental Skills Training Applications', 3, { prereqs: ['KNES 350'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// PHSC - Public Health Science (BS, 120 cr)
// ============================================================
const SCHEDULE_PHSC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support', categories: ['gened-dsns'], note: 'Double-counts: PHSC support + DSNS' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support', categories: ['gened-dsnl'], note: 'Double-counts: PHSC support + DSNL' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { category: 'major-support' }),
    _c('CHEM 132', 'General Chemistry I Laboratory', 1, { category: 'major-support' }),
    _c('MATH 130', 'Calculus I for the Life Sciences', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('SPHL 100', 'Foundations of Public Health', 3, { category: 'major-core' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('BSCI 223', 'General Microbiology', 4, { prereqs: ['BSCI 170'], category: 'major-core' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('EPIB 301', 'Epidemiology for Public Health Practice', 3, { prereqs: ['SPHL 100'], category: 'major-core' }),
    _c('EPIB 315', 'Biostatistics for Public Health Practice', 3, { prereqs: ['STAT 100'], category: 'major-core' }),
    _c('PHSC 300', 'Foundations of Public Health', 3, { prereqs: ['SPHL 100'], category: 'major-core' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('PHSC 401', 'History of Public Health', 3, { prereqs: ['SPHL 100'], category: 'major-core' }),
    _c('PHSC 402', 'Public Health Emergency Preparedness', 3, { prereqs: ['SPHL 100'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('PHSC 420', 'Vaccines and Immunology', 3, { prereqs: ['BSCI 223'], category: 'major-upper' }),
    _c('MIEH 300', 'A Public Health Perspective: Introduction to Environmental Health', 3, { prereqs: ['SPHL 100'], category: 'major-upper' }),
    _c('HLTH 391', 'Making a Difference: Applying Community Health', 3, { category: 'major-upper' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('PHSC 450', 'Interdisciplinary Applications of Public Health', 3, { prereqs: ['PHSC 300'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// NFSC - Nutrition & Food Science (BS, 120 cr)
// ============================================================
const SCHEDULE_NFSC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support', categories: ['gened-dsns'], note: 'Double-counts: NFSC support + DSNS' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support', categories: ['gened-dsnl'], note: 'Double-counts: NFSC support + DSNL' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { category: 'major-support' }),
    _c('CHEM 132', 'General Chemistry I Laboratory', 1, { category: 'major-support' }),
    _c('NFSC 100', 'Elements of Nutrition', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('NFSC 112', 'Food: Science and Technology', 3, { category: 'major-core' }),
    _c('BSCI 222', 'Principles of Genetics', 4, { prereqs: ['BSCI 170'], category: 'major-support' }),
    _c('CHEM 231', 'Organic Chemistry I', 3, { prereqs: ['CHEM 131'], category: 'major-support' }),
    _c('CHEM 232', 'Organic Chemistry Laboratory I', 1, { prereqs: ['CHEM 231'], category: 'major-support' }),
    _c('CHEM 271', 'General Chemistry and Energetics', 2, { prereqs: ['CHEM 131'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('CHEM 272', 'General Bioanalytical Chemistry Laboratory', 2, { category: 'major-support' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('FSAR Elective', 'Analytic Reasoning', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('NFSC 315', 'Nutrition During the Life Cycle', 3, { prereqs: ['NFSC 100'], category: 'major-core' }),
    _c('NFSC 341', 'Fermented Food, Feed, and Pharmaceuticals', 3, { prereqs: ['NFSC 112'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('NFSC 421', 'Food Chemistry', 3, { prereqs: ['CHEM 231'], category: 'major-core' }),
    _c('NFSC 430', 'Food Microbiology', 3, { prereqs: ['NFSC 112'], category: 'major-core' }),
    _c('NFSC 440', 'Advanced Human Nutrition', 4, { prereqs: ['NFSC 315'], category: 'major-core' }),
    _c('NFSC 455', 'Medical Nutrition Therapy I', 4, { prereqs: ['NFSC 315'], category: 'major-upper' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('NFSC 470', 'Community Nutrition', 3, { prereqs: ['NFSC 315'], category: 'major-upper' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('NFSC 450', 'Food and Nutrient Analysis', 3, { prereqs: ['NFSC 421'], category: 'major-core', isGoal: true }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// HLTH - Community Health (BS, 120 cr)
// ============================================================
const SCHEDULE_HLTH = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('HLTH 140', 'Personal and Community Health', 3, { category: 'major-core' }),
    _c('PSYC 100', 'Introduction to Psychology', 3, { category: 'major-support' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('HLTH 200', 'Introduction to Research in Community Health', 3, { prereqs: ['HLTH 140'], category: 'major-core' }),
    _c('HLTH 230', 'Introduction to Health Behavior', 3, { category: 'major-core' }),
    _c('HLTH 285', 'Controlling Stress and Tension', 3, { category: 'major-core' }),
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('HLTH 377', 'Human Sexuality', 3, { prereqs: ['HLTH 230'], category: 'major-core' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('HLTH 302', 'Methods of Community Health Assessment', 3, { prereqs: ['HLTH 200'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('HLTH 410', 'Honors Seminar', 3, { prereqs: ['HLTH 200'], category: 'major-upper' }),
    _c('HLTH 460', 'Multicultural Population Health', 3, { prereqs: ['HLTH 230'], category: 'major-upper' }),
    _c('HLTH 471', 'Women\'s Health', 3, { category: 'major-core' }),
    _c('HLTH 476', 'Death Education', 3, { category: 'major-core' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('HLTH 498L', 'Special Topics in Health; Health Literacy', 3, { prereqs: ['HLTH 200'], category: 'major-core' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('HLTH 490', 'Professional Preparation in Community Health', 3, { prereqs: ['HLTH 200'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ENST - Environmental Science & Technology (BS, 120 cr)
// ============================================================
const SCHEDULE_ENST = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support', categories: ['gened-dsns'], note: 'Double-counts: ENST support + DSNS' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support', categories: ['gened-dsnl'], note: 'Double-counts: ENST support + DSNL' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { category: 'major-support' }),
    _c('CHEM 132', 'General Chemistry I Laboratory', 1, { category: 'major-support' }),
    _c('GEOL 100', 'Physical Geology', 3, { category: 'major-support' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ENST 200', 'Fundamentals of Soil Science', 4, { category: 'major-core' }),
    _c('ENST 233', 'Introduction to Environmental Health', 4, { category: 'major-core' }),
    _c('MATH 130', 'Calculus I for the Life Sciences', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ENST 301', 'Field Soil Morphology I', 1, { prereqs: ['ENST 200'], category: 'major-core' }),
    _c('ENST 303', 'Field Soil Morphology III', 1, { prereqs: ['ENST 200'], category: 'major-core' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ENST 388', 'Honors Thesis Research', 3, { prereqs: ['ENST 200'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENST 405', 'Energy and Environment', 3, { prereqs: ['ENST 200'], category: 'major-upper' }),
    _c('ENST 422', 'Soil Microbial Ecology', 3, { prereqs: ['ENST 200'], category: 'major-upper' }),
    _c('ENST 453', 'Watershed Science: Water Balance, Open Channel Flow, and Near Surface Hydrology', 3, { prereqs: ['ENST 200'], category: 'major-upper' }),
    _c('ENST 471', 'Capstone I', 2, { prereqs: ['ENST 301'], category: 'major-core' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENST 499', 'Special Topics in Environmental Science and Technology', 1, { prereqs: ['ENST 471'], category: 'major-core', isGoal: true }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ENCH - Chemical Engineering (BS, 124 cr)
// ============================================================
const SCHEDULE_ENCH = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ENES 100', 'Introduction to Engineering Design', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('CHBE 101', 'Introduction to Chemical and Biomolecular Engineering', 3, { category: 'major-core', note: 'Current catalog replacement for legacy ENCH 215 content' }),
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { category: 'major-support' }),
    _c('CHEM 136', 'General Chemistry Laboratory for Engineers', 1, { category: 'major-support' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma', note: 'Also satisfies FSAR' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('CHBE 250', 'Computer Methods in Chemical Engineering', 3, { prereqs: ['CHBE 101'], category: 'major-core' }),
    _c('BIOE 120', 'Biology for Engineers', 3, { category: 'major-support' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('CHBE 301', 'Chemical and Biomolecular Engineering Thermodynamics I', 3, { prereqs: ['CHBE 101'], category: 'major-core' }),
    _c('CHEM 231', 'Organic Chemistry I', 3, { prereqs: ['CHEM 135'], category: 'major-support' }),
    _c('CHEM 232', 'Organic Chemistry Laboratory I', 1, { prereqs: ['CHEM 231'], category: 'major-support' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 270', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 271', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics (Laboratory)', 1, { prereqs: ['PHYS 270'], kind: 'gened', category: 'gened-dsnl' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('CHBE 302', 'Chemical and Biomolecular Engineering Thermodynamics II', 3, { prereqs: ['CHBE 301'], category: 'major-core' }),
    _c('CHBE 333', 'Chemical Engineering Seminar', 1, { prereqs: ['CHBE 101'], category: 'major-core' }),
    _c('CHEM 241', 'Organic Chemistry II', 3, { prereqs: ['CHEM 231'], category: 'major-support' }),
    _c('CHEM 242', 'Organic Chemistry Laboratory II', 1, { prereqs: ['CHEM 241'], category: 'major-support' }),
    _c('MATH 246', 'Differential Equations for Scientists and Engineers', 3, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('CHBE 410', 'Statistics and Design of Experiments', 3, { prereqs: ['CHBE 250', 'MATH 241', 'MATH 246'], category: 'major-core' }),
    _c('CHBE 422', 'Chemical and Biomolecular Engineering Transport Phenomena I', 3, { prereqs: ['CHBE 101', 'CHBE 250', 'MATH 241', 'MATH 246'], category: 'major-core' }),
    _c('CHBE 440', 'Chemical Kinetics and Reactor Design', 3, { prereqs: ['CHBE 301', 'MATH 241', 'MATH 246'], category: 'major-core' }),
    _c('CHEM 272', 'General Bioanalytical Chemistry Laboratory', 2, { prereqs: ['CHEM 271'], category: 'major-support' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('CHBE 424', 'Chemical and Biomolecular Engineering Transport Phenomena II', 3, { prereqs: ['CHBE 422'], category: 'major-core' }),
    _c('CHBE 426', 'Chemical and Biomolecular Separation Processes', 3, { prereqs: ['CHBE 424'], category: 'major-core' }),
    _c('CHBE 444', 'Process Engineering Economics and Design I', 3, { prereqs: ['CHBE 424', 'CHBE 426', 'CHBE 440'], category: 'major-core' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('CHBE 437', 'Chemical and Biomolecular Engineering Laboratory', 3, { prereqs: ['CHBE 424', 'CHBE 426', 'CHBE 440'], category: 'major-core' }),
    _c('CHBE 442', 'Chemical and Biomolecular Systems Analysis', 3, { prereqs: ['CHBE 424', 'CHBE 426'], category: 'major-core' }),
    _c('CHBE 457', 'Design and Processing of Polymers for Biomedical Devices', 3, { prereqs: ['CHBE 424'], category: 'major-upper' }),
    _c('CHBE 482', 'Biochemical Engineering', 3, { prereqs: ['CHBE 301'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('CHBE 446', 'Process Engineering Economics and Design II', 3, { prereqs: ['CHBE 442', 'CHBE 444'], category: 'major-core', isGoal: true }),
    _c('CHBE 490', 'Polymer Science', 3, { prereqs: ['CHBE 301'], category: 'major-upper' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
  ]},
];

// ============================================================
// ENAE - Aerospace Engineering (BS, Aeronautical Track, 124 cr)
// ============================================================
const SCHEDULE_ENAE = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ENAE 100', 'The Aerospace Engineering Profession', 1, { category: 'major-core' }),
    _c('ENES 100', 'Introduction to Engineering Design', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ENAE 202', 'Computing Fundamentals for Engineers', 3, { coreqs: ['MATH 141'], category: 'major-core' }),
    _c('ENES 200', 'Technology and Consequences: Engineering, Ethics and Humanity', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ENAE 203', 'Introduction to Computer-Aided Design', 1, { prereqs: ['ENAE 100'], category: 'major-core' }),
    _c('ENAE 222', 'Aerospace Mechanics', 4, { prereqs: ['MATH 141', 'PHYS 161'], coreqs: ['MATH 241'], category: 'major-core' }),
    _c('ENAE 283', 'Foundations of Aerospace I', 3, { prereqs: ['MATH 141', 'PHYS 161'], coreqs: ['ENAE 222'], category: 'major-core' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)', 1, { coreqs: ['PHYS 260'], kind: 'gened', category: 'gened-dsnl' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ENAE 284', 'Foundations of Aerospace II', 3, { prereqs: ['ENAE 222', 'ENAE 283', 'PHYS 260'], category: 'major-core' }),
    _c('ENES 232', 'Thermodynamics', 3, { prereqs: ['MATH 141', 'PHYS 161'], category: 'major-support' }),
    _c('MATH 243', 'Introduction to Linear Algebra and Differential Equations', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 270', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 271', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics (Laboratory)', 1, { coreqs: ['PHYS 270'], category: 'major-support' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENAE 301', 'Dynamics of Aerospace Systems', 3, { prereqs: ['ENAE 202', 'ENAE 283', 'MATH 241', 'PHYS 270'], category: 'major-core' }),
    _c('ENAE 310', 'Incompressible Aerodynamics', 3, { prereqs: ['ENAE 202', 'ENAE 284', 'ENES 232', 'MATH 243'], category: 'major-core' }),
    _c('ENAE 362', 'Aerospace Instrumentation and Experimentation', 3, { prereqs: ['ENAE 283'], category: 'major-core' }),
    _c('ENAE 380', 'Flight Software Systems', 3, { prereqs: ['ENAE 202', 'ENAE 283'], category: 'major-core' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENAE 325', 'Aerospace Structures', 3, { prereqs: ['ENAE 222', 'ENAE 284'], category: 'major-core' }),
    _c('ENAE 364', 'Aerospace Engineering Laboratory', 3, { prereqs: ['ENAE 310', 'ENAE 362'], category: 'major-core' }),
    _c('ENAE 410', 'Compressible Aerodynamics', 3, { prereqs: ['ENAE 310', 'ENES 232', 'MATH 241'], category: 'major-core' }),
    _c('ENAE 432', 'Control of Aerospace Systems', 3, { prereqs: ['ENAE 301', 'ENAE 283'], category: 'major-core' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENAE 423', 'Vibration and Aeroelasticity', 3, { prereqs: ['ENAE 325'], category: 'major-core' }),
    _c('ENAE 480', 'Fundamentals of Aerospace Design', 2, { prereqs: ['ENAE 301', 'ENAE 310', 'ENAE 325', 'ENAE 362'], category: 'major-core' }),
    _c('ENAE 403', 'Aircraft Flight Dynamics', 3, { prereqs: ['ENAE 310', 'ENAE 432'], category: 'major-core' }),
    _c('ENAE 491', 'Principles of Aircraft Design', 2, { prereqs: ['ENAE 325'], coreqs: ['ENAE 403', 'ENAE 455', 'ENAE 480'], category: 'major-core' }),
    _c('ENAE 455', 'Aircraft Propulsion and Power', 3, { prereqs: ['ENAE 310', 'ENAE 410', 'ENES 232'], category: 'major-core' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ENAE 492', 'Aeronautical Systems Design', 3, { prereqs: ['ENAE 403', 'ENAE 423', 'ENAE 455', 'ENAE 491'], category: 'major-core', isGoal: true }),
    _c('ENAE 425', 'Mechanics of Composite Structures', 3, { prereqs: ['ENAE 325'], category: 'major-upper' }),
    _c('ENAE 471', 'Aircraft Flight Testing', 3, { prereqs: ['ENAE 310'], coreqs: ['ENAE 403'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
];

// ============================================================
// ENCE - Civil Engineering (BS, 122 cr)
// ============================================================
const SCHEDULE_ENCE = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ENES 100', 'Introduction to Engineering Design', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('GEOL 120', 'Environmental Geology', 3, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('ENES 102', 'Mechanics I', 3, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('ENES 200', 'Technology and Consequences: Engineering, Ethics and Humanity', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)', 1, { coreqs: ['PHYS 260'], category: 'major-support' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENES 220', 'Mechanics II', 3, { prereqs: ['ENES 102'], category: 'major-support' }),
    _c('ENCE 202', 'Engineering Drawings and Design for Civil and Environmental Engineers', 3, { prereqs: ['ENES 100', 'ENES 102', 'MATH 141'], category: 'major-core' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MATH 243', 'Introduction to Linear Algebra and Differential Equations', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENCE 305', 'Fundamentals of Engineering Fluids', 3, { category: 'major-core' }),
    _c('ENCE 203', 'Data Models and Numerical Computing for Civil Engineers', 3, { prereqs: ['ENES 220', 'MATH 241'], category: 'major-core' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENCE 303', 'Probability and Statistics for Civil and Environmental Engineers', 3, { category: 'major-core' }),
    _c('ENCE 312', 'Engineering Economics and Project Management', 3, { category: 'major-core' }),
    _c('ENCE 365', 'Materials in Civil Infrastructure', 4, { prereqs: ['ENES 220'], coreqs: ['ENCE 303'], category: 'major-core' }),
    _c('ENCE 336', 'Environment and Water I: Introduction to Environmental Engineering', 3, { prereqs: ['ENES 220', 'ENCE 203'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENCE 340', 'Fundamentals of Geotechnical Engineering', 3, { category: 'major-core' }),
    _c('ENCE 383', 'Transportation Systems I', 3, { prereqs: ['ENCE 303', 'PHYS 260', 'PHYS 261'], category: 'major-core' }),
    _c('ENCE 367', 'Civil Engineering Systems Optimization', 4, { prereqs: ['MATH 243'], coreqs: ['ENCE 303'], category: 'major-core' }),
    _c('ENCE 436', 'Environment and Water II: Water Management', 3, { category: 'major-core' }),
    _c('ENCE 342', 'Structural Analysis and Design I', 3, { category: 'major-core' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENCE 483', 'Transportation Systems II', 3, { prereqs: ['ENCE 383'], category: 'major-core' }),
    _c('ENCE 442', 'Structural Analysis and Design II', 3, { prereqs: ['ENCE 342'], category: 'major-core' }),
    _c('ENCE 464', 'Civil and Environmental Engineering Design I', 2, { prereqs: ['ENCE 336', 'ENCE 342', 'ENCE 367'], category: 'major-core' }),
    _c('ENCE 420', 'Selection and Utilization of Construction Equipment', 3, { category: 'major-upper' }),
    _c('ENCE 472', 'Transportation Engineering', 3, { category: 'major-upper' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ENCE 467', 'Civil and Environmental Engineering Design II', 2, { prereqs: ['ENCE 464'], category: 'major-core', isGoal: true }),
    _c('STAT 400', 'Applied Probability and Statistics I', 3, { prereqs: ['MATH 141'], kind: 'gened', category: 'gened-fsar' }),
    _c('ENCE 466', 'Design of Civil Engineering Systems', 3, { category: 'major-upper' }),
    _c('DSHS/DSSP Elective', 'Scholarship in Practice Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS DSSP' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
  ]},
];

// ============================================================
// BIOE - Bioengineering (BS, 126 cr)
// ============================================================
const SCHEDULE_BIOE = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ENES 100', 'Introduction to Engineering Design', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('CHEM 136', 'General Chemistry Laboratory for Engineers', 1, { kind: 'gened', category: 'gened-dsnl' }),
    _c('BIOE 120', 'Biology for Engineers', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('BIOE 121', 'Biology for Engineers Laboratory', 1, { coreqs: ['BIOE 120'], category: 'major-core' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('BIOE 241', 'Biocomputational Methods', 3, { category: 'major-core' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('CHEM 231', 'Organic Chemistry I', 3, { prereqs: ['CHEM 135'], category: 'major-support' }),
    _c('CHEM 232', 'Organic Chemistry Laboratory I', 1, { coreqs: ['CHEM 231'], category: 'major-support' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)', 1, { coreqs: ['PHYS 260'], category: 'major-support' }),
    _c('BIOE 221', 'Academic and Career Planning', 1, { category: 'major-core' }),
    _c('BIOE 232', 'Bioengineering Thermodynamics', 3, { category: 'major-core' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ENES 200', 'Technology and Consequences: Engineering, Ethics and Humanity', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('ENES 102', 'Mechanics I', 3, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('MATH 243', 'Introduction to Linear Algebra and Differential Equations', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('BIOE 246', 'Differential Equations for Bioengineering', 3, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('BSCI 207', 'Principles of Biology III - Organismal Biology', 3, { category: 'major-support' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BIOE 331', 'Biofluids', 3, { category: 'major-core' }),
    _c('BIOE 372', 'Biostatistics for Experimental Design and Data Analysis', 3, { category: 'major-core' }),
    _c('BSCI 331', 'Cell Biology and Physiology', 3, { category: 'major-support' }),
    _c('BSCI 332', 'Cell Biology and Physiology Laboratory', 1, { coreqs: ['BSCI 331'], category: 'major-support' }),
    _c('BIOE 340', 'Modeling Physiological Systems and Lab', 4, { category: 'major-core' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BIOE 457', 'Biomedical Electronics & Instrumentation', 4, { category: 'major-core' }),
    _c('BIOE 404', 'Biomechanics', 3, { category: 'major-upper' }),
    _c('BIOE 411', 'Tissue Engineering', 3, { category: 'major-upper' }),
    _c('BIOE 420', 'Bioimaging', 3, { category: 'major-upper' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BIOE 485', 'Capstone Design I: Entrepreneurship, Regulatory Issues, and Ethics', 3, { category: 'major-core' }),
    _c('BIOE 489A', 'Special Topics in Bioengineering; Python: Introduction to Programming and Data Analysis', 3, { category: 'major-upper' }),
    _c('BIOE 453', 'Biomaterials', 3, { category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('BIOE 486', 'Capstone Design II', 3, { prereqs: ['BIOE 485'], category: 'major-core', isGoal: true }),
    _c('BIOE 489B', 'Special Topics in Bioengineering; Numerical Methods in Bioengineering', 3, { category: 'major-upper' }),
    _c('BSCI 430', 'Developmental Biology', 3, { category: 'major-support' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
  ]},
];

// ============================================================
// ENMA - Materials Science & Engineering (BS, 124 cr)
// ============================================================
const SCHEDULE_ENMA = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('CHEM 136', 'General Chemistry Laboratory for Engineers', 1, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENES 100', 'Introduction to Engineering Design', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('ENMA 180', 'Materials Science and Engineering: The Field and the Future', 1, { category: 'major-core' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ENMA 165', 'Introduction to Programming with Python', 3, { category: 'major-core' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)', 1, { coreqs: ['PHYS 260'], kind: 'gened', category: 'gened-dsnl' }),
    _c('ENMA 300', 'Introduction to Materials Engineering', 3, { category: 'major-core' }),
    _c('ENES 200', 'Technology and Consequences: Engineering, Ethics and Humanity', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MATH 246', 'Differential Equations for Scientists and Engineers', 3, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 270', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 271', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics (Laboratory)', 1, { coreqs: ['PHYS 270'], category: 'major-support' }),
    _c('ENMA 301', 'Modern Materials Engineering', 3, { prereqs: ['ENMA 300'], category: 'major-core' }),
    _c('CHEM 231', 'Organic Chemistry I', 3, { prereqs: ['CHEM 135'], category: 'major-support' }),
    _c('CHEM 232', 'Organic Chemistry Laboratory I', 1, { coreqs: ['CHEM 231'], category: 'major-support' }),
    _c('FSAR/DSSP Elective', 'Analytic Reasoning Scholarship in Practice', 3, { kind: 'gened', category: 'gened-fsar', note: 'Satisfies FSAR DSSP' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENMA 312', 'Experimental Methods in Materials Science', 3, { prereqs: ['ENMA 301'], category: 'major-core' }),
    _c('ENMA 460', 'Introduction to Solid State Physics', 3, { prereqs: ['PHYS 270'], category: 'major-core' }),
    _c('ENMA 461', 'Thermodynamics of Materials', 3, { prereqs: ['ENMA 300'], category: 'major-core' }),
    _c('ENMA 465', 'Microprocessing Materials', 3, { prereqs: ['ENMA 300'], category: 'major-core' }),
    _c('ENMA 470', 'Materials Selection for Engineering Design', 3, { prereqs: ['ENMA 300'], category: 'major-core' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENMA 471', 'Kinetics, Diffusion and Phase Transformations', 3, { prereqs: ['ENMA 461'], category: 'major-core' }),
    _c('ENMA 441', 'Characterization of Materials', 3, { prereqs: ['ENMA 312'], category: 'major-core' }),
    _c('CHEM 481', 'Physical Chemistry I', 3, { prereqs: ['CHEM 231'], category: 'major-support' }),
    _c('ENMA 482', 'Introduction to Electron Microscopy', 3, { prereqs: ['ENMA 312'], category: 'major-upper' }),
    _c('ENMA 430', 'Nanosized Materials', 3, { prereqs: ['ENMA 300'], category: 'major-upper' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENMA 487', 'Capstone Preparation', 1, { prereqs: ['ENMA 470'], category: 'major-core' }),
    _c('ENMA 490', 'Materials Design', 3, { prereqs: ['ENMA 487'], category: 'major-core', isGoal: true }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('ENMA 425', 'Introduction to Biomaterials', 3, { prereqs: ['ENMA 300'], category: 'major-upper' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ENFP - Fire Protection Engineering (BS, 120 cr)
// ============================================================
const SCHEDULE_ENFP = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
    _c('ENES 100', 'Introduction to Engineering Design', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('ENFP 250', 'Introduction to Life Safety Analysis', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('ENES 102', 'Mechanics I', 3, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('ENFP 201', 'Numerical Methods with MatLab', 3, { prereqs: ['MATH 140'], category: 'major-core' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)', 1, { coreqs: ['PHYS 260'], kind: 'gened', category: 'gened-dsnl' }),
    _c('ENES 220', 'Mechanics II', 3, { prereqs: ['ENES 102'], category: 'major-support' }),
    _c('ENFP 300', 'Fire Protection Fluid Mechanics', 3, { prereqs: ['ENES 220'], category: 'major-core' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MATH 246', 'Differential Equations for Scientists and Engineers', 3, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENES 221', 'Dynamics', 3, { prereqs: ['ENES 220'], category: 'major-support' }),
    _c('ENES 232', 'Thermodynamics', 3, { prereqs: ['MATH 141', 'PHYS 161'], category: 'major-support' }),
    _c('ENFP 312', 'Heat and Mass Transfer', 3, { prereqs: ['ENES 232'], category: 'major-core' }),
    _c('ENFP 310', 'Water Based Fire Protection Systems Design', 3, { prereqs: ['ENFP 300'], category: 'major-core' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENFP 405', 'Structural Fire Protection', 3, { prereqs: ['ENFP 312'], category: 'major-core' }),
    _c('ENFP 410', 'Special Hazard Suppression Systems', 3, { prereqs: ['ENFP 310'], category: 'major-core' }),
    _c('ENFP 415', 'Fire Dynamics', 3, { prereqs: ['ENFP 312'], category: 'major-core' }),
    _c('ENFP 350', 'Professional Development Seminar', 1, { category: 'major-core' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
    _c('DSHS/DSSP Elective', 'Scholarship in Practice Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS DSSP' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENFP 411', 'Risk-Informed Performance Based Design', 3, { prereqs: ['ENFP 415'], category: 'major-core' }),
    _c('ENFP 420', 'Fire Assessment Methods and Laboratory', 4, { prereqs: ['ENFP 415'], category: 'major-core' }),
    _c('ENFP 413', 'Human Response to Fire', 3, { prereqs: ['ENFP 250'], category: 'major-core' }),
    _c('STAT 400', 'Applied Probability and Statistics I', 3, { prereqs: ['MATH 141'], kind: 'gened', category: 'gened-fsar' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENFP 425', 'Enclosure Fire Modeling', 3, { prereqs: ['ENFP 415'], category: 'major-core' }),
    _c('ENFP 426', 'Computational Methods in Fire Protection', 3, { prereqs: ['ENFP 201'], category: 'major-core' }),
    _c('ENFP 440', 'Smoke Management and Fire Alarm Systems', 3, { prereqs: ['ENFP 310'], category: 'major-core', isGoal: true }),
    _c('ENFP 461', 'Think Tank', 3, { category: 'major-upper' }),
    _c('ENFP 489I', 'Special Topics; Industrial Fire Safety', 3, { category: 'major-upper' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('ENME 400', 'Machine Design', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// ENEE - Electrical Engineering (BS, 122 cr)
// ============================================================
const SCHEDULE_ENEE = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CHEM 135', 'General Chemistry for Engineers', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('ENEE 101', 'Introduction to Electrical & Computer Engineering', 3, { category: 'major-core' }),
    _c('ENEE 140', 'Introduction to Programming Concepts for Engineers', 2, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 140', 'Calculus I', 4, { kind: 'gened', category: 'gened-fsma' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ENES 100', 'Introduction to Engineering Design', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('ENEE 150', 'Intermediate Programming Concepts for Engineers', 3, { prereqs: ['ENEE 140'], category: 'major-core' }),
    _c('MATH 141', 'Calculus II', 4, { prereqs: ['MATH 140'], category: 'major-support' }),
    _c('PHYS 161', 'General Physics: Mechanics and Particle Dynamics', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ENEE 290', 'Introduction to Differential Equations and Linear Algebra for Engineers', 4, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('ENEE 244', 'Digital Logic Design', 3, { prereqs: ['ENEE 150'], category: 'major-core' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Electricity, Magnetism and Thermodynamics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)', 1, { coreqs: ['PHYS 260'], kind: 'gened', category: 'gened-dsnl' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ENEE 205', 'Electric Circuits', 4, { prereqs: ['PHYS 260'], category: 'major-core' }),
    _c('ENEE 222', 'Elements of Discrete Signal Analysis', 4, { prereqs: ['ENEE 290'], category: 'major-core' }),
    _c('ENEE 245', 'Digital Circuits and Systems Laboratory', 2, { prereqs: ['ENEE 244'], category: 'major-core' }),
    _c('PHYS 270', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 271', 'General Physics: Electrodynamics, Light, Relativity and Modern Physics (Laboratory)', 1, { coreqs: ['PHYS 270'], category: 'major-support' }),
    _c('DSHU/DVUP Elective', 'Humanities and Plural Societies', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVUP' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENEE 304', 'Introduction to Micro and Nanoelectronics', 3, { prereqs: ['ENEE 205'], category: 'major-core' }),
    _c('ENEE 323', 'Signals and Systems: Theory and Applications', 4, { prereqs: ['ENEE 222'], category: 'major-core' }),
    _c('ENEE 350', 'Computer Organization', 3, { prereqs: ['ENEE 244'], category: 'major-core' }),
    _c('STAT 400', 'Applied Probability and Statistics I', 3, { prereqs: ['MATH 141'], kind: 'gened', category: 'gened-fsar' }),
    _c('DSHS/SCIS Elective', 'I-Series History/Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS SCIS' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENEE 200', 'Technology and Consequences: Engineering, Ethics, and Humanity', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('ENEE 305', 'Introduction to Micro and Nanoelectronics Lab', 2, { coreqs: ['ENEE 304'], category: 'major-core' }),
    _c('ENEE 324', 'Engineering Probability', 3, { prereqs: ['ENEE 222'], category: 'major-core' }),
    _c('ENEE 382', 'Electromagnetics', 4, { prereqs: ['PHYS 270'], category: 'major-core' }),
    _c('DSHU/DVCC Elective', 'Humanities and Cultural Competence', 3, { kind: 'gened', category: 'gened-dshu', note: 'Satisfies DSHU DVCC' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENEE 436', 'Foundations of Machine Learning', 3, { prereqs: ['ENEE 324'], category: 'major-upper', isGoal: true }),
    _c('ENEE 411', 'Advanced Analog and Digital Electronics', 3, { prereqs: ['ENEE 304'], category: 'major-upper' }),
    _c('ENEE 445', 'Computer Laboratory', 2, { prereqs: ['ENEE 350'], category: 'major-upper' }),
    _c('ENEE 475', 'Power Electronics', 3, { prereqs: ['ENEE 205'], category: 'major-upper' }),
    _c('DSHS/DSSP Elective', 'Scholarship in Practice Social Sciences', 3, { kind: 'gened', category: 'gened-dshs', note: 'Satisfies DSHS DSSP' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ENEE 408A', 'Capstone Design Project: Microprocessor-Based Design', 3, { prereqs: ['ENEE 350'], category: 'major-upper', isGoal: true }),
    _c('ENEE 420', 'Communication Systems', 3, { prereqs: ['ENEE 323'], category: 'major-upper' }),
    _c('ENEE 459B', 'Reverse Engineering and Hardware Security Laboratory', 3, { prereqs: ['ENEE 350'], category: 'major-upper' }),
    _c('ENEE 486', 'Optoelectronics Lab', 2, { prereqs: ['ENEE 205','PHYS 270','PHYS 271'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
];

// ============================================================
// ANSC - Animal Sciences (BS, Animal Care & Management, 120 cr)
// ============================================================
const SCHEDULE_ANSC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ANSC 101', 'Principles of Animal Science', 3, { category: 'major-core' }),
    _c('ANSC 103', 'Principles of Animal Science Laboratory', 1, { category: 'major-core' }),
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support' }),
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('CHEM 132', 'General Chemistry I Laboratory', 1, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ANSC 201', 'Anatomy and Physiology of Domestic Animals', 4, { prereqs: ['ANSC 101'], category: 'major-core' }),
    _c('BSCI 160', 'Principles of Ecology and Evolution', 3, { category: 'major-support' }),
    _c('BSCI 161', 'Principles of Ecology and Evolution Lab', 1, { category: 'major-support' }),
    _c('MATH 113', 'College Algebra and Trigonometry', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ANSC 314', 'Comparative Animal Nutrition', 3, { prereqs: ['ANSC 101'], category: 'major-core' }),
    _c('BSCI 223', 'General Microbiology', 4, { prereqs: ['BSCI 170'], category: 'major-support' }),
    _c('CHEM 231', 'Organic Chemistry I', 3, { prereqs: ['CHEM 131'], category: 'major-support' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('AREC 250', 'Elements of Agricultural and Resource Economics', 3, { category: 'major-support' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ANSC 315', 'Applied Animal Nutrition', 3, { prereqs: ['ANSC 314'], category: 'major-core' }),
    _c('BIOM 301', 'Introduction to Biometrics', 3, { prereqs: ['STAT 100'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ANSC 327', 'Molecular and Quantitative Animal Genetics', 3, { prereqs: ['BSCI 170'], category: 'major-core' }),
    _c('ANSC 401', 'Animal Growth and Development for Production Agriculture', 3, { prereqs: ['ANSC 201'], category: 'major-core' }),
    _c('ANSC 250', 'Companion Animal Care and Management', 3, { category: 'major-core' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ANSC 446', 'Physiology of Mammalian Reproduction', 3, { prereqs: ['ANSC 201'], category: 'major-core' }),
    _c('ANSC 447', 'Physiology of Mammalian Reproduction Laboratory', 1, { coreqs: ['ANSC 446'], category: 'major-core' }),
    _c('ANSC 260', 'Laboratory Animal Management', 3, { category: 'major-core' }),
    _c('ANSC 410', 'The Gut Microbiome and its Roles in Health and Disease', 3, { prereqs: ['BSCI 223'], category: 'major-upper' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ANSC 359', 'Internship Experience in Animal and Avian Sciences', 3, { category: 'major-core' }),
    _c('ANSC 417', 'Regulatory Issues in Animal Care and Management', 3, { category: 'major-upper' }),
    _c('AREC 306', 'Farm Management and Sustainable Food Production', 3, { prereqs: ['AREC 250'], category: 'major-support' }),
    _c('ANSC 282', 'Grazing Animal Management', 3, { category: 'major-core' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ANSC 453', 'Animal Welfare and Bioethics', 3, { category: 'major-upper', isGoal: true }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// AREC - Agricultural & Resource Economics (BS, Environmental and Resource Economics, 120 cr)
// ============================================================
const SCHEDULE_AREC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 120', 'Elementary Calculus I', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { category: 'major-support' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ECON 201', 'Principles of Macroeconomics', 3, { prereqs: ['ECON 200'], category: 'major-support' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('BMGT 230', 'Business Statistics', 3, { prereqs: ['MATH 120'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('AREC 326', 'Intermediate Applied Microeconomics', 3, { prereqs: ['ECON 200'], category: 'major-core' }),
    _c('AREC 380', 'Data Science for Environmental and Resource Economics', 3, { prereqs: ['STAT 100'], category: 'major-upper' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('AREC 422', 'Econometric Analysis in Agricultural and Environmental Economics', 3, { prereqs: ['BMGT 230'], category: 'major-upper' }),
    _c('GEOG 201', 'Geography of Environmental Systems', 3, { category: 'major-support' }),
    _c('GVPT 273', 'Introduction to Environmental Politics', 3, { category: 'major-support' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('AREC 453', 'Natural Resources and Public Policy', 3, { prereqs: ['ECON 200'], category: 'major-upper' }),
    _c('AREC 456', 'Energy and Environmental Economics', 3, { prereqs: ['ECON 200'], category: 'major-upper' }),
    _c('ENST 415', 'Renewable Energy', 3, { category: 'major-support' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('AREC 481', 'Environmental Economics', 3, { prereqs: ['AREC 326'], category: 'major-upper', isGoal: true }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// PLSC - Plant Sciences (BS, Turf & Plant Systems, 120 cr)
// ============================================================
const SCHEDULE_PLSC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('PLSC 110', 'Introduction to Horticulture', 3, { category: 'major-core' }),
    _c('PLSC 111', 'Introduction to Horticulture Laboratory', 1, { category: 'major-core' }),
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support', categories: ['gened-dsns'], note: 'Double-counts: PLSC support + DSNS' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 115', 'Precalculus', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('BSCI 160', 'Principles of Ecology and Evolution', 3, { category: 'major-support' }),
    _c('BSCI 161', 'Principles of Ecology and Evolution Lab', 1, { category: 'major-support' }),
    _c('AGST 275', 'Fundamentals of Agricultural and Environmental Chemistry', 3, { category: 'major-support' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('DSHU Elective #1', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('ENST 200', 'Fundamentals of Soil Science', 4, { category: 'major-core' }),
    _c('PLSC 201', 'Plant Structure and Function', 3, { prereqs: ['BSCI 170'], category: 'major-core' }),
    _c('BSCI 337', 'Biology of Insects', 4, { prereqs: ['BSCI 160'], category: 'major-support' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('PLSC 205', 'Introduction to Turf Science and Management', 4, { prereqs: ['PLSC 201'], category: 'major-core' }),
    _c('PHYS 121', 'Fundamentals of Physics I', 4, { category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSHU Elective #2', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('PLSC 420', 'Principles of Plant Pathology', 4, { prereqs: ['PLSC 201'], category: 'major-core' }),
    _c('INAG 215', 'Business Management Principles for Turf Facilities', 3, { category: 'major-support' }),
    _c('INAG 235', 'Irrigation and Drainage', 3, { category: 'major-support' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('PLSC 401', 'Pest Management Strategies for Turfgrass', 3, { prereqs: ['PLSC 205'], category: 'major-upper' }),
    _c('PLSC 453', 'Weed Science', 3, { prereqs: ['PLSC 201'], category: 'major-upper' }),
    _c('DSSP Elective #2', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVCC Elective', 'Cultural Competence', 3, { kind: 'gened', category: 'gened-dvcc' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('PLSC 389', 'Internship', 3, { category: 'major-core' }),
    _c('PLSC 402', 'Sports Turf Management', 3, { prereqs: ['PLSC 205'], category: 'major-upper', isGoal: true }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];
