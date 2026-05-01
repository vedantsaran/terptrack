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
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S30', name: 'Spring 2030', year: 'Year 4', courses: [
    _c('CMSC 4xx Upper Elective B', 'Upper-Division CS Elective', 3, { category: 'major-upper' }),
    _c('CMSC 4xx Upper Elective C', 'Upper-Division CS Elective', 3, { category: 'major-upper' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
// ============================================================
const SCHEDULE_CCJS = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('CCJS 100', 'Introduction to Criminal Justice', 3, { category: 'major-core' }),
    _c('CCJS 105', 'Introduction to Criminology', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 113', 'College Algebra with Applications', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('CCJS 230', 'Criminal Procedure', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support' }),
    _c('CCJS 200', 'Methods of Criminal Justice Research', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('CCJS 300', 'Criminological and Criminal Justice Theory', 3, { prereqs: ['CCJS 105','CCJS 200'], category: 'major-core' }),
    _c('CCJS 320', 'Concepts of Law Enforcement Administration', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('CCJS 340', 'Concepts of Law', 3, { prereqs: ['CCJS 100'], category: 'major-core' }),
    _c('CCJS 352', 'Drugs and Crime', 3, { prereqs: ['CCJS 105'], category: 'major-core' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S29', name: 'Spring 2029', year: 'Year 3', courses: [
    _c('CCJS 400', 'Criminal Justice Process', 3, { prereqs: ['CCJS 200','CCJS 300'], category: 'major-core', isGoal: true }),
    _c('CCJS 4xx Elective A', 'Upper-Division CCJS Elective', 3, { category: 'major-upper' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
];

// ============================================================
// GVPT — Government & Politics (BA)
// ============================================================
const SCHEDULE_GVPT = [
  { id: 'F26', name: 'Fall 2026', year: 'Year 1', courses: [
    _c('GVPT 100', 'Principles of Government and Politics', 3, { category: 'major-core' }),
    _c('ENGL 101', 'Academic Writing', 3, { kind: 'gened', category: 'gened-fsaw' }),
    _c('MATH 113', 'College Algebra with Applications', 3, { category: 'major-support', note: 'Satisfies FSMA' }),
    _c('UNIV 100', 'The Student in the University', 1, { category: 'major-core' }),
    _c('DSHU Elective', 'Humanities Distributive', 3, { kind: 'gened', category: 'gened-dshu' }),
    _c('COMM 107', 'Oral Communication', 3, { kind: 'gened', category: 'gened-fsoc' }),
  ]},
  { id: 'S27', name: 'Spring 2027', year: 'Year 1', courses: [
    _c('GVPT 170', 'American Government', 3, { category: 'major-core' }),
    _c('ECON 200', 'Principles of Microeconomics', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('STAT 100', 'Elementary Statistics and Probability', 3, { category: 'major-support' }),
    _c('DSNS Elective', 'Natural Sciences Distributive', 3, { kind: 'gened', category: 'gened-dsns' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F27', name: 'Fall 2027', year: 'Year 2', courses: [
    _c('GVPT 200', 'Introduction to Comparative Politics', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('GVPT 241', 'The Study of Political Philosophy', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('DSNL Elective', 'Natural Sciences Lab', 4, { kind: 'gened', category: 'gened-dsnl' }),
    _c('ENGL 393', 'Technical Writing', 3, { prereqs: ['ENGL 101'], kind: 'gened', category: 'gened-fspw' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'S28', name: 'Spring 2028', year: 'Year 2', courses: [
    _c('GVPT 280', 'Introduction to International Relations', 3, { prereqs: ['GVPT 100'], category: 'major-core' }),
    _c('GVPT 3xx Elective A', 'Upper-Division GVPT Elective', 3, { prereqs: ['GVPT 100'], category: 'major-upper' }),
    _c('DSHS Elective', 'History/Social Sci Distributive', 3, { kind: 'gened', category: 'gened-dshs' }),
    _c('DVUP Elective', 'Understanding Plural Societies', 3, { kind: 'gened', category: 'gened-dvup' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
  ]},
  { id: 'F28', name: 'Fall 2028', year: 'Year 3', courses: [
    _c('GVPT 3xx Elective B', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('GVPT 3xx Elective C', 'Upper-Division GVPT Elective', 3, { category: 'major-upper' }),
    _c('DSSP Elective', 'Scholarship in Practice', 3, { kind: 'gened', category: 'gened-dssp' }),
    _c('Free Elective', 'Free Elective', 3, { kind: 'tech', category: 'elective' }),
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
