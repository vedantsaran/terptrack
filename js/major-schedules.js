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
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('CMSC 422', 'Introduction to Machine Learning', 3, { prereqs: ['CMSC 320','MATH 240'], category: 'major-upper', isGoal: true }),
    _c('CMSC 451', 'Design and Analysis of Algorithms', 3, { prereqs: ['CMSC 351'], category: 'major-upper', isGoal: true }),
    _c('CMSC 4xx Upper Elective A', 'Upper-Division CS Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('CMSC 4xx Upper Elective B', 'Upper-Division CS Elective', 3, { category: 'major-upper' }),
    _c('CMSC 4xx Upper Elective C', 'Upper-Division CS Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// BIOL — Biological Sciences (BS, General Biology concentration)
// ============================================================
const SCHEDULE_BIOL = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('BSCI 170', 'Principles of Molecular and Cellular Biology', 3, { category: 'major-core' }),
    _c('BSCI 171', 'Molecular and Cellular Biology Lab', 1, { coreqs: ['BSCI 170'], category: 'major-core' }),
    _c('CHEM 131', 'General Chemistry I', 3, { category: 'major-support' }),
    _c('CHEM 132', 'General Chemistry I Lab', 1, { coreqs: ['CHEM 131'], category: 'major-support' }),
    _c('MATH 130', 'Calculus for the Life Sciences I', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('BSCI 160', 'Principles of Ecology and Evolution', 3, { category: 'major-core' }),
    _c('BSCI 161', 'Ecology and Evolution Lab', 1, { coreqs: ['BSCI 160'], category: 'major-core' }),
    _c('CHEM 231', 'Organic Chemistry I', 3, { prereqs: ['CHEM 131'], category: 'major-support' }),
    _c('CHEM 232', 'Organic Chemistry I Lab', 2, { prereqs: ['CHEM 132'], coreqs: ['CHEM 231'], category: 'major-support' }),
    _c('MATH 131', 'Calculus for the Life Sciences II', 3, { prereqs: ['MATH 130'], category: 'major-support' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('BSCI 222', 'Principles of Genetics', 4, { prereqs: ['BSCI 170'], category: 'major-core' }),
    _c('CHEM 241', 'Organic Chemistry II', 3, { prereqs: ['CHEM 231'], category: 'major-support' }),
    _c('CHEM 242', 'Organic Chemistry II Lab', 2, { prereqs: ['CHEM 232'], coreqs: ['CHEM 241'], category: 'major-support' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('BSCI 223', 'General Microbiology', 4, { prereqs: ['BSCI 170'], category: 'major-core' }),
    _c('PHYS 121', 'Fundamentals of Physics I', 4, { prereqs: ['MATH 130'], category: 'major-support' }),
    _c('BIOM 301', 'Introduction to Biostatistics', 3, { prereqs: ['MATH 131'], category: 'major-support' }),
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
    _c('BSCI 4xx Upper Elective A', 'Upper-Division BSCI Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BSCI 440', 'Mammalian Physiology', 4, { prereqs: ['BSCI 330'], category: 'major-upper', isGoal: true }),
    _c('BSCI 4xx Upper Lab', 'Upper-Division BSCI Lab', 4, { category: 'major-upper' }),
    _c('BSCI 4xx Upper Elective B', 'Upper-Division BSCI Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('BSCI 4xx Capstone', 'Senior Capstone Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
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
    _c('PHYS 410', 'Classical Mechanics', 4, { prereqs: ['PHYS 273', 'MATH 243'], category: 'major-upper' }),
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
    _c('PHYS 402', 'Quantum Physics II', 4, { prereqs: ['PHYS 401'], category: 'major-upper', isGoal: true }),
    _c('PHYS 441', 'Topics in Nuclear and Particle Physics', 3, { prereqs: ['PHYS 371'], category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
    _c('DSHS Elective #2', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
];

// ============================================================
// PSYC — Psychology (BS)
// ============================================================
const SCHEDULE_PSYC = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('PSYC 100', 'Introduction to Psychology', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 130', 'Calculus for the Life Sciences I', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('BIOL 106', 'Principles of Biology II', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('PSYC 200', 'Statistical Methods in Psychology', 3, { prereqs: ['PSYC 100','STAT 100'], category: 'major-core' }),
    _c('PSYC 332', 'Psychology of Human Development', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('CHEM 131', 'General Chemistry I', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('PSYC 300', 'Research Methods in Psychology', 3, { prereqs: ['PSYC 200'], category: 'major-core' }),
    _c('PSYC 341', 'Introduction to Memory and Cognition', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('PSYC 353', 'Adult Psychopathology', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('PSYC 355', 'The Psychology of Social Behavior', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('PSYC 361', 'Biological Bases of Behavior', 3, { prereqs: ['PSYC 100'], category: 'major-core' }),
    _c('PSYC 4xx Elective A', 'Upper-Division PSYC Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('PSYC 4xx Elective B', 'Upper-Division PSYC Elective', 3, { category: 'major-upper' }),
    _c('PSYC 4xx Elective C', 'Upper-Division PSYC Elective', 3, { category: 'major-upper' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('PSYC 4xx Elective D', 'Upper-Division PSYC Elective', 3, { category: 'major-upper' }),
    _c('PSYC 4xx Elective E', 'Upper-Division PSYC Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('PSYC 489', 'Field Experience in Psychology', 3, { prereqs: ['PSYC 300'], category: 'major-upper', isGoal: true }),
    _c('PSYC 4xx Elective F', 'Upper-Division PSYC Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
    _c('MATH 113', 'College Algebra with Applications', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('Foreign Language 101', 'Foreign Language Sequence I', 4, { category: 'major-support', note: 'BA req' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('CCJS 230', 'Criminal Procedure', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('Foreign Language 102', 'Foreign Language Sequence II', 4, { prereqs: ['Foreign Language 101'], category: 'major-support', note: 'BA req' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support' }),
    _c('CCJS 200', 'Methods of Criminal Justice Research', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('Foreign Language 201', 'Foreign Language Sequence III', 3, { prereqs: ['Foreign Language 102'], category: 'major-support', note: 'BA req' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('CCJS 300', 'Criminological and Criminal Justice Theory', 3, { prereqs: ['CCJS 105','CCJS 200'], category: 'major-core' }),
    _c('CCJS 320', 'Concepts of Law Enforcement Administration', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('Foreign Language 202', 'Foreign Language Sequence IV', 3, { prereqs: ['Foreign Language 201'], category: 'major-support', note: 'BA req' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('CCJS 340', 'Concepts of Law', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('CCJS 352', 'Drugs and Crime', 3, { prereqs: ['CCJS 105'], category: 'major-core' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('CCJS 400', 'Criminal Justice Process', 3, { prereqs: ['CCJS 200','CCJS 300'], category: 'major-core', isGoal: true }),
    _c('CCJS 4xx Elective A', 'Upper-Division CCJS Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('CCJS 4xx Elective B', 'Upper-Division CCJS Elective', 3, { category: 'major-upper' }),
    _c('CCJS 4xx Elective C', 'Upper-Division CCJS Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('CCJS 498', 'Senior Internship in Criminal Justice', 3, { prereqs: ['CCJS 400'], category: 'major-upper', isGoal: true }),
    _c('CCJS 4xx Elective D', 'Upper-Division CCJS Elective', 3, { category: 'major-upper' }),
    _c('CCJS 4xx Elective E', 'Upper-Division CCJS Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// GVPT — Government & Politics (BA)
// BA degrees require 4 semesters of one foreign language
// ============================================================
const SCHEDULE_GVPT = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('GVPT 100', 'Principles of Government and Politics', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 113', 'College Algebra with Applications', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('Foreign Language 101', 'Foreign Language Sequence I', 4, { category: 'major-support', note: 'BA req' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('GVPT 170', 'American Government', 3, { category: 'major-core' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support' }),
    _c('Foreign Language 102', 'Foreign Language Sequence II', 4, { prereqs: ['Foreign Language 101'], category: 'major-support', note: 'BA req' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('GVPT 200', 'Introduction to Comparative Politics', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('GVPT 241', 'The Study of Political Philosophy', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('Foreign Language 201', 'Foreign Language Sequence III', 3, { prereqs: ['Foreign Language 102'], category: 'major-support', note: 'BA req' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('GVPT 280', 'Introduction to International Relations', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('GVPT 3xx Elective A', 'Upper-Division GVPT Elective', 3, { prereqs: ['GVPT 100'], category: 'major-upper' }),
    _c('Foreign Language 202', 'Foreign Language Sequence IV', 3, { prereqs: ['Foreign Language 201'], category: 'major-support', note: 'BA req' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('GVPT 3xx Elective B', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('GVPT 3xx Elective C', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('GVPT 3xx Elective D', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('GVPT 4xx Elective A', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('GVPT 4xx Elective B', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('GVPT 4xx Elective C', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('GVPT 399', 'Senior Seminar', 3, { prereqs: ['GVPT 200','GVPT 280'], category: 'major-upper', isGoal: true }),
    _c('GVPT 4xx Elective D', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
    _c('ENME 271', 'Engineering Computation', 3, { prereqs: ['MATH 140'], category: 'major-core' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('MATH 240', 'Linear Algebra', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('MATH 241', 'Calculus III', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('PHYS 260', 'General Physics: Vibrations, Waves, Electricity and Magnetism', 3, { prereqs: ['PHYS 161'], category: 'major-support' }),
    _c('PHYS 261', 'General Physics Laboratory', 1, { coreqs: ['PHYS 260'], category: 'major-support' }),
    _c('ENME 220', 'Mechanics II: Dynamics', 3, { prereqs: ['ENES 102'], category: 'major-core' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('MATH 246', 'Differential Equations for Scientists and Engineers', 3, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('ENME 217', 'Mechanics of Materials', 3, { prereqs: ['ENES 102'], category: 'major-core' }),
    _c('ENME 232', 'Thermodynamics', 3, { prereqs: ['MATH 141','PHYS 161'], category: 'major-core' }),
    _c('ENME 272', 'Introduction to Mechanical Engineering Design and CAD', 3, { prereqs: ['ENME 271'], category: 'major-core' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ENME 300', 'Engineering Materials', 3, { prereqs: ['CHEM 135','ENME 217'], category: 'major-core' }),
    _c('ENME 342', 'Fluid Mechanics', 3, { prereqs: ['ENME 232','MATH 246'], category: 'major-core' }),
    _c('ENME 351', 'Manufacturing Process Engineering', 3, { prereqs: ['ENME 272'], category: 'major-core' }),
    _c('ENME 382', 'Introduction to Materials Engineering', 3, { prereqs: ['ENME 217'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENME 360', 'Vibration, Controls, and Optimization I', 3, { prereqs: ['ENME 220','MATH 246'], category: 'major-core' }),
    _c('ENME 414', 'Computer-Aided Design', 3, { prereqs: ['ENME 272'], category: 'major-upper' }),
    _c('ENME 432', 'Heat Transfer', 3, { prereqs: ['ENME 342'], category: 'major-core' }),
    _c('ENME 4xx Tech Elective A', 'Upper-Division ENME Elective', 3, { category: 'major-upper' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENME 462', 'Vibrations, Controls, and Optimization II', 3, { prereqs: ['ENME 360'], category: 'major-core' }),
    _c('ENME 4xx Tech Elective B', 'Upper-Division ENME Elective', 3, { category: 'major-upper' }),
    _c('ENME 4xx Tech Elective C', 'Upper-Division ENME Elective', 3, { category: 'major-upper' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ENME 472', 'Integrated Product and Process Development', 3, { prereqs: ['ENME 462'], category: 'major-upper', isGoal: true }),
    _c('ENME 4xx Tech Elective D', 'Upper-Division ENME Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// FINANCE — Smith Business, Finance track (BS, 120 cr)
// ============================================================
const SCHEDULE_FINANCE = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('BMGT 110', 'Introduction to Business and Management', 3, { category: 'major-core' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('MATH 220', 'Elementary Calculus I', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('ECON 201', 'Principles of Macroeconomics', 3, { prereqs: ['ECON 200'], category: 'major-core' }),
    _c('BMGT 230', 'Business Statistics', 3, { prereqs: ['MATH 220'], category: 'major-core' }),
    _c('BMGT 220', 'Principles of Accounting I', 3, { category: 'major-core' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('BMGT 221', 'Principles of Accounting II', 3, { prereqs: ['BMGT 220'], category: 'major-core' }),
    _c('BMGT 289I', 'Introductory Business Lecture Series', 1, { category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 2, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('BMGT 340', 'Business Finance', 3, { prereqs: ['BMGT 220','ECON 201'], category: 'major-core' }),
    _c('BMGT 350', 'Marketing Principles', 3, { prereqs: ['ECON 200'], category: 'major-core' }),
    _c('BMGT 364', 'Management and Organization Theory', 3, { category: 'major-core' }),
    _c('BMGT 367', 'Career Search Strategies in Business', 1, { category: 'major-core' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('BMGT 343', 'Investments', 3, { prereqs: ['BMGT 340'], category: 'major-upper' }),
    _c('BMGT 380', 'Business Law', 3, { category: 'major-core' }),
    _c('BMGT 4xx Finance Elective A', 'Upper-Division Finance Elective', 3, { category: 'major-upper' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('BMGT 440', 'Advanced Financial Management', 3, { prereqs: ['BMGT 340'], category: 'major-upper' }),
    _c('BMGT 443', 'Security Analysis and Valuation', 3, { prereqs: ['BMGT 343'], category: 'major-upper', isGoal: true }),
    _c('BMGT 446', 'Commercial Bank Management', 3, { prereqs: ['BMGT 343'], category: 'major-upper' }),
    _c('BMGT 4xx Finance Elective B', 'Upper-Division Finance Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('BMGT 449', 'Real Estate Finance and Investment', 3, { prereqs: ['BMGT 340'], category: 'major-upper' }),
    _c('BMGT 4xx Finance Elective C', 'Upper-Division Finance Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('BMGT 496', 'Business Ethics', 3, { category: 'major-upper', isGoal: true }),
    _c('BMGT 4xx Finance Elective D', 'Upper-Division Finance Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// INST — Information Science (BS, 120 cr)
// ============================================================
const SCHEDULE_INST = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('INST 126', 'Introduction to Programming for Information Science', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 113', 'College Algebra with Applications', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('INST 201', 'Introduction to Information Science', 3, { category: 'major-core' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('INST 301', 'Integrated Information Technology', 3, { prereqs: ['INST 126'], category: 'major-core' }),
    _c('INST 311', 'Information Organization', 3, { prereqs: ['INST 201'], category: 'major-core' }),
    _c('INST 314', 'Statistics for Information Science', 3, { prereqs: ['STAT 100'], category: 'major-core' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('INST 326', 'Object-Oriented Programming for Information Science', 3, { prereqs: ['INST 126'], category: 'major-core' }),
    _c('INST 327', 'Database Design and Modeling', 3, { prereqs: ['INST 126'], category: 'major-core' }),
    _c('INST 335', 'Tech, Society and Policy', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('INST 352', 'Information User Needs and Assessment', 3, { prereqs: ['INST 201'], category: 'major-core' }),
    _c('INST 362', 'User-Centered Design', 3, { prereqs: ['INST 352'], category: 'major-core' }),
    _c('INST 4xx Specialization A', 'INST Specialization Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('INST 414', 'Advanced Data Science', 3, { prereqs: ['INST 314','INST 327'], category: 'major-upper', isGoal: true }),
    _c('INST 4xx Specialization B', 'INST Specialization Elective', 3, { category: 'major-upper' }),
    _c('INST 4xx Specialization C', 'INST Specialization Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('INST 4xx Specialization D', 'INST Specialization Elective', 3, { category: 'major-upper' }),
    _c('INST 4xx Specialization E', 'INST Specialization Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('INST 490', 'Integrated Capstone for Information Science', 3, { prereqs: ['INST 414'], category: 'major-upper', isGoal: true }),
    _c('INST 4xx Specialization F', 'INST Specialization Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
    _c('MATH 113', 'College Algebra with Applications', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
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
    _c('COMM 4xx Elective A', 'Upper-Division COMM Elective', 3, { category: 'major-upper' }),
    _c('COMM 4xx Elective B', 'Upper-Division COMM Elective', 3, { category: 'major-upper' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('COMM 4xx Elective C', 'Upper-Division COMM Elective', 3, { category: 'major-upper' }),
    _c('COMM 4xx Elective D', 'Upper-Division COMM Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('COMM 402', 'Communication Theory and Process', 3, { prereqs: ['COMM 250'], category: 'major-core' }),
    _c('COMM 4xx Elective E', 'Upper-Division COMM Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('COMM 497', 'Senior Capstone in Communication', 3, { prereqs: ['COMM 402'], category: 'major-upper', isGoal: true }),
    _c('COMM 4xx Elective F', 'Upper-Division COMM Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
    _c('ECON 305', 'Intermediate Microeconomic Theory', 3, { prereqs: ['ECON 200','MATH 140'], category: 'major-core' }),
    _c('ECON 306', 'Intermediate Macroeconomic Theory', 3, { prereqs: ['ECON 201','MATH 140'], category: 'major-core' }),
    _c('STAT 400', 'Applied Probability and Statistics I', 3, { prereqs: ['MATH 141'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('ECON 321', 'Economic Statistics', 3, { prereqs: ['STAT 400'], category: 'major-core' }),
    _c('ECON 325', 'Intermediate Mathematical Microeconomics', 3, { prereqs: ['ECON 305','MATH 141'], category: 'major-core' }),
    _c('MATH 240', 'Linear Algebra', 4, { prereqs: ['MATH 141'], category: 'major-support' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('ECON 326', 'Intermediate Mathematical Macroeconomics', 3, { prereqs: ['ECON 306','MATH 141'], category: 'major-core' }),
    _c('ECON 4xx Elective A', 'Upper-Division ECON Elective', 3, { category: 'major-upper' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ECON 4xx Elective B', 'Upper-Division ECON Elective', 3, { category: 'major-upper' }),
    _c('ECON 4xx Elective C', 'Upper-Division ECON Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ECON 414', 'Game Theory', 3, { prereqs: ['ECON 325'], category: 'major-upper', isGoal: true }),
    _c('ECON 4xx Elective D', 'Upper-Division ECON Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('ECON 422', 'Econometrics II', 3, { prereqs: ['ECON 321'], category: 'major-upper', isGoal: true }),
    _c('ECON 4xx Elective E', 'Upper-Division ECON Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
    _c('ENGL 4xx Elective', 'Upper-Division ENGL Elective', 3, { category: 'major-upper' }),
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
    _c('JOUR 4xx Elective', 'Upper-Division JOUR Elective', 3, { category: 'major-upper' }),
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
    _c('HIST 4xx Elective', 'Upper-Division HIST Elective', 3, { category: 'major-upper' }),
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
    _c('SOCY 4xx Elective', 'Upper-Division SOCY Elective', 3, { category: 'major-upper' }),
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
    _c('SPAN 4xx Elective', 'Upper-Division SPAN Elective', 3, { category: 'major-upper' }),
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
    _c('ARTH 4xx Elective', 'Upper-Division ARTH Elective', 3, { category: 'major-upper' }),
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
    _c('LING 4xx Elective', 'Upper-Division LING Elective', 3, { category: 'major-upper' }),
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
// AAST — African American Studies (BA, 120 cr)
// ============================================================
const SCHEDULE_AAST = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('AASP 100', 'Introduction to African American Studies', 3, { category: 'major-core' }),
    _c('AASP 202', 'Black Culture in the United States', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('COMM 107', 'Oral Communication: Principles and Practices', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { kind: 'gened', category: 'gened-fsar' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-support' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('AASP 211', 'Get Out: The Sunken Place of Race Relations in the Post-Racial Era', 3, { category: 'major-core' }),
    _c('HIST 200', 'Interpreting American History: Beginnings to 1877', 3, { category: 'major-support' }),
    _c('SOCY 100', 'Introduction to Sociology', 3, { category: 'major-support' }),
    _c('FSMA Elective', 'Mathematics', 3, { kind: 'gened', category: 'gened-fsma' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('AASP 301', 'Applied Policy Analysis and the Black Community', 3, { prereqs: ['AASP 100'], category: 'major-core' }),
    _c('AASP 320', 'Poverty and African American Children', 3, { category: 'major-upper' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('SCIS Elective', 'I-Series Signature Course', 3, { kind: 'gened', category: 'gened-scis' }),
    _c('DSHS Elective #1', 'History/Social Sciences Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('AASP 400', 'Directed Readings in African American Studies', 3, { prereqs: ['AASP 301'], category: 'major-core' }),
    _c('AASP 411', 'Black Resistance Movements', 3, { prereqs: ['AASP 301'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSSP Elective #1', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('AASP 443', 'Blacks and the Law', 3, { category: 'major-upper' }),
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
    _c('AASP 401', 'Research Directions in African-American Studies', 3, { prereqs: ['AASP 301'], category: 'major-core', isGoal: true }),
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
    _c('CHEM 131', 'Chemistry I - Fundamentals of General Chemistry', 3, { category: 'major-support' }),
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
    _c('KNES 385', 'Motor Control and Learning', 3, { prereqs: ['KNES 287'], category: 'major-core' }),
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
    _c('Free Elective', 'Free Elective', 4, { kind: 'tech', category: 'elective' }),
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
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support' }),
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
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support' }),
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
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
    _c('BSCI 171', 'Principles of Molecular & Cellular Biology Laboratory', 1, { category: 'major-support' }),
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
    _c('PHYS 261', 'General Physics Laboratory', 1, { coreqs: ['PHYS 260'], kind: 'gened', category: 'gened-dsnl' }),
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
    _c('PHYS 261', 'General Physics Laboratory', 1, { coreqs: ['PHYS 260'], category: 'major-support' }),
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
    _c('ENCE 336', 'Structural Systems and Behavior', 3, { prereqs: ['ENES 220', 'ENCE 203'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('ENCE 340', 'Fundamentals of Geotechnical Engineering', 3, { category: 'major-core' }),
    _c('ENCE 383', 'Transportation Systems I', 3, { prereqs: ['ENCE 303', 'PHYS 260', 'PHYS 261'], category: 'major-core' }),
    _c('ENCE 367', 'Civil Engineering Systems Optimization', 4, { prereqs: ['MATH 243'], coreqs: ['ENCE 303'], category: 'major-core' }),
    _c('ENCE 436', 'Structural Design and Materials II', 3, { category: 'major-core' }),
    _c('ENCE 342', 'Environmental Engineering Fundamentals', 3, { category: 'major-core' }),
  ]},
  { id: 'F29', name: 'Fall 2029', year: 'Year 4', courses: [
    _c('ENCE 483', 'Transportation Systems II', 3, { prereqs: ['ENCE 383'], category: 'major-core' }),
    _c('ENCE 442', 'Environmental Engineering Design', 3, { prereqs: ['ENCE 342'], category: 'major-core' }),
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
    _c('PHYS 261', 'General Physics Laboratory', 1, { coreqs: ['PHYS 260'], category: 'major-support' }),
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
    _c('PHYS 261', 'General Physics Laboratory', 1, { coreqs: ['PHYS 260'], kind: 'gened', category: 'gened-dsnl' }),
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
    _c('PHYS 261', 'General Physics Laboratory', 1, { coreqs: ['PHYS 260'], kind: 'gened', category: 'gened-dsnl' }),
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
    _c('PHYS 261', 'General Physics Laboratory', 1, { coreqs: ['PHYS 260'], kind: 'gened', category: 'gened-dsnl' }),
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
    _c('ENEE 428', 'Communications Design Laboratory', 2, { prereqs: ['ENEE 420'], category: 'major-upper' }),
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
    _c('BSCI 170', 'Principles of Molecular & Cellular Biology', 3, { category: 'major-support' }),
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
    _c('PLSC 201', 'Plant Structure and Function', 4, { prereqs: ['BSCI 170'], category: 'major-core' }),
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
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
