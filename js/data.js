'use strict';
const SCHEDULE = [
  {
    id: "F26", name: "Fall 2026", year: "Year 1",
    courses: [
      { code: "CMSC 131", title: "Object-Oriented Programming I", cr: 4, prereqs: [], coreqs: [], kind: "core", category: "ce-core" },
      { code: "MATH 140", title: "Calculus I",                    cr: 4, prereqs: [], coreqs: [], kind: "core", category: "gened-fsma", note: "Double-counts: CE Core + FSMA" },
      { code: "CHEM 135", title: "General Chemistry for Engineers",cr: 3, prereqs: [], coreqs: [], kind: "core", category: "ce-core" },
      { code: "ENGL 101", title: "Academic Writing",               cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-fsaw", note: "FSAW" },
      { code: "UNIV 100", title: "The University Mind",            cr: 1, prereqs: [], coreqs: [], kind: "core", category: "ce-core" },
    ]
  },
  {
    id: "S27", name: "Spring 2027", year: "Year 1",
    courses: [
      { code: "CMSC 132", title: "Object-Oriented Programming II",cr: 4, prereqs: ["CMSC 131"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "MATH 141", title: "Calculus II",                    cr: 4, prereqs: ["MATH 140"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "PHYS 161", title: "General Physics: Mechanics",     cr: 3, prereqs: [], coreqs: ["MATH 141"], kind: "core", category: "gened-dsns", note: "Double-counts: CE Core + DSNS" },
      { code: "ENES 100", title: "Intro to Engineering Design",    cr: 3, prereqs: [], coreqs: [], kind: "core", category: "ce-core", note: "Cannot share semester w/ ENEE 101" },
      { code: "GenEd HU-1", title: "Humanities Distributive #1",   cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-dshu", note: "DSHU #1" },
    ]
  },
  {
    id: "F27", name: "Fall 2027", year: "Year 2",
    courses: [
      { code: "CMSC 216", title: "Intro to Computer Systems",      cr: 4, prereqs: ["CMSC 132"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "ENEE 101", title: "Intro to ECE",                   cr: 3, prereqs: [], coreqs: ["MATH 140"], kind: "core", category: "ce-core" },
      { code: "ENEE 244", title: "Digital Logic Design",           cr: 3, prereqs: [], coreqs: ["CMSC 132"], kind: "core", category: "ce-core" },
      { code: "ENEE 290", title: "Diff Eq & LinAlg for Engr",      cr: 4, prereqs: ["MATH 141"], coreqs: [], kind: "critical", category: "ce-core", note: "Replaces MATH 246+461 · LinAlg prereq for CMSC 472" },
      { code: "PHYS 260", title: "Physics: Waves & E&M (incl. 261 Lab)",cr: 4, prereqs: ["PHYS 161"], coreqs: [], kind: "core", category: "gened-dsnl", note: "Double-counts: CE Core + DSNL" },
    ]
  },
  {
    id: "S28", name: "Spring 2028", year: "Year 2",
    courses: [
      { code: "CMSC 250", title: "Discrete Structures",            cr: 4, prereqs: ["MATH 141"], coreqs: [], kind: "core", category: "gened-fsar", note: "Double-counts: CE Core + FSAR" },
      { code: "ENEE 205", title: "Electric Circuits",              cr: 4, prereqs: ["PHYS 260"], coreqs: ["ENEE 290"], kind: "core", category: "ce-core" },
      { code: "ENEE 222", title: "Discrete Signal Analysis",       cr: 4, prereqs: [], coreqs: ["ENEE 290"], kind: "core", category: "ce-core" },
      { code: "ENEE 245", title: "Digital Circuits & Systems Lab", cr: 2, prereqs: ["ENEE 244"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "ENEE 200", title: "Engr Ethics & Humanity",         cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-dshu", note: "Double-counts: CE Core + DSHU (often also I-Series)" },
    ]
  },
  {
    id: "F28", name: "Fall 2028", year: "Year 3",
    courses: [
      { code: "CMSC 330", title: "Org. of Programming Languages",  cr: 3, prereqs: ["CMSC 216", "CMSC 250"], coreqs: [], kind: "critical", category: "ce-core", note: "Prereq for ENEE 436 + CMSC 472" },
      { code: "ENEE 322", title: "Signal & System Theory",         cr: 3, prereqs: ["ENEE 222", "ENEE 290"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "ENEE 350", title: "Computer Organization",          cr: 3, prereqs: ["ENEE 244", "CMSC 132"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "COMM 107", title: "Oral Communication",             cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-fsoc", note: "FSOC" },
      { code: "GenEd HS-1", title: "History/Social Sciences #1",   cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-dshs", note: "DSHS #1" },
      { code: "MATH 241", title: "Calculus III",                   cr: 4, prereqs: ["MATH 141"], coreqs: [], kind: "tech", category: "tech-a", note: "Tech Cat A (300-level) · supports high-dim ML" },
    ]
  },
  {
    id: "S29", name: "Spring 2029", year: "Year 3",
    courses: [
      { code: "CMSC 351", title: "Algorithms",                     cr: 3, prereqs: ["CMSC 216", "CMSC 250"], coreqs: [], kind: "critical", category: "ce-core", note: "Prereq for ENEE 436 + CMSC 451 + CMSC 472" },
      { code: "CMSC 320", title: "Intro to Data Science",          cr: 3, prereqs: ["CMSC 216", "CMSC 250"], coreqs: [], kind: "critical", category: "tech-f", note: "Strongly recommended for Deep Learning/ML tracks" },
      { code: "ENEE 324", title: "Engineering Probability & Stats",cr: 3, prereqs: ["ENEE 322"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "ENEE 445", title: "Computer Laboratory",            cr: 2, prereqs: ["ENEE 245"], coreqs: [], kind: "tech", category: "tech-d", note: "Tech Cat D · Advanced Lab · Fall/Spring · easiest lab option" },
      { code: "GenEd HS-2", title: "HS #2 + I-Series + Diversity", cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-dshs", note: "Pick HS course tagged I-Series + UP/CC" },
    ]
  },
  {
    id: "F29", name: "Fall 2029", year: "Year 4",
    courses: [
      { code: "ENEE 436", title: "Foundations of Machine Learning",cr: 3, prereqs: ["CMSC 330", "CMSC 351"], coreqs: [], kind: "goal", category: "tech-c", isGoal: true, note: "★ GOAL · Tech Cat C · EE Theory" },
      { code: "CMSC 451", title: "Design & Analysis of Algorithms",cr: 3, prereqs: ["CMSC 351"], coreqs: [], kind: "goal", category: "tech-b", isGoal: true, note: "★ GOAL · Tech Cat B" },
      { code: "ENEE 446", title: "Digital Computer Design",        cr: 3, prereqs: ["ENEE 350"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "ENGL 393", title: "Technical Writing",              cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-fspw", note: "FSPW · Junior standing" },
      { code: "GenEd SP-1", title: "Scholarship in Practice (outside major)",cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-dssp", note: "DSSP #1" },
      { code: "MATH 401", title: "Applications of Linear Algebra", cr: 3, prereqs: ["MATH 241"], coreqs: [], kind: "tech", category: "tech-a", note: "Tech Cat A (400-level) · satisfies Cat A 400-lvl rule" },
    ]
  },
  {
    id: "S30", name: "Spring 2030", year: "Year 4",
    courses: [
      { code: "CMSC 472", title: "Introduction to Deep Learning",  cr: 3, prereqs: ["CMSC 330", "CMSC 351", "ENEE 290"], coreqs: [], kind: "goal", category: "tech-f", isGoal: true, note: "★ GOAL · Apply Nov 2029" },
      { code: "CMSC 412", title: "Operating Systems (or ENEE 447)",cr: 4, prereqs: ["CMSC 330", "CMSC 351"], coreqs: [], kind: "core", category: "ce-core" },
      { code: "ENEE 408N", title: "Design Experience in Machine Learning", cr: 3, prereqs: [], coreqs: [], kind: "tech", category: "tech-e", note: "Tech Cat E · Capstone · Spring Only · pairs perfectly w/ ML/Deep Learning track" },
      { code: "ENEE 440", title: "Microprocessors",                cr: 3, prereqs: ["ENEE 350"], coreqs: [], kind: "tech", category: "tech-c", note: "Tech Cat C" },
      { code: "GenEd SP-2", title: "Scholarship in Practice #2",   cr: 3, prereqs: [], coreqs: [], kind: "gened", category: "gened-dssp", note: "DSSP #2" },
    ]
  },
];

const DEFAULT_TIMELINE_EVENTS = [
  { date: "Year 1", title: "Lock in 3.0+ GPA", desc: "First semesters set the gateway tone. Use office hours from week 2 in any quantitative course.", phase: "past" },
  { date: "Year 2", title: "Apply to research / clubs", desc: "Programs like the Academy of Machine Learning or undergrad research roles unlock priority for capstones and competitive seats.", phase: "upcoming" },
  { date: "Year 3", title: "Start portfolio projects", desc: "Kaggle entries, open-source contributions, or research roles. By permission-request time, evidence matters.", phase: "upcoming" },
  { date: "Year 4 — Spring", title: "Submit goal-course permission requests", desc: "Most permission-tight courses require advisor sign-off the term before registration. Screenshot your degree audit and submit early.", phase: "critical" },
  { date: "Final Term", title: "Apply for graduation", desc: "Submit early in the term. Confirm your degree audit with your advisor 60 days before commencement.", phase: "upcoming" },
];

const STORAGE_KEY = "terp-track-v2";
const PT_CACHE_KEY = "terp-track-pt-cache-v1";
const PT_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const DEFAULT_SETTINGS = {
  programName: "Computer Engineering",
  eyebrow: "UMD · Computer Engineering · 2026–2030",
  catalogYear: "2026-2027",
  totalCredits: 125,
  goalCourses: ["ENEE 436", "CMSC 451", "CMSC 472"],
  footerNote: "Always confirm with your advisor before registration",
};

const GRADE_POINTS = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0
};
const GRADE_OPTIONS = ["", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
