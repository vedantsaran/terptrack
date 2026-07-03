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
