'use strict';
/* ============================================================
   MAJOR TEMPLATES
   Lists of required course codes per major. Course metadata
   (title, credits, prereqs, gen-eds) is fetched live from
   umd.io + PlanetTerp when a major is applied. We only hand-curate
   the code lists and a few hints (recommended electives, goals,
   total credits, default category buckets).
   ============================================================ */

const MAJOR_TEMPLATES = {
  CE: {
    id: 'CE',
    name: 'Computer Engineering',
    programName: 'Computer Engineering',
    eyebrow: 'UMD · Computer Engineering · 2026–2030',
    totalCredits: 125,
    // CE keeps the existing hand-tuned SCHEDULE; auto-gen is skipped.
    useDefaultSchedule: true,
    goals: ['ENEE 436', 'CMSC 451', 'CMSC 472'],
    notes: 'CE uses the curated default schedule. Switch to a different major to use auto-generation.',
  },
  CS: {
    id: 'CS',
    name: 'Computer Science',
    programName: 'Computer Science',
    eyebrow: 'UMD · Computer Science · BS',
    totalCredits: 120,
    coreCodes: [
      'CMSC131', 'CMSC132', 'CMSC216', 'CMSC250',
      'CMSC330', 'CMSC351',
      'MATH140', 'MATH141', 'MATH240',
      'STAT400',
      'CMSC320', 'CMSC335',
    ],
    upperElectiveCodes: [
      'CMSC421', 'CMSC422', 'CMSC451',
      'CMSC411', 'CMSC414', 'CMSC417', 'CMSC430',
    ],
    supportCodes: ['PHYS161', 'PHYS260', 'PHYS261'],
    goals: ['CMSC421', 'CMSC422', 'CMSC451'],
    notes: 'CS requires upper-division specialization (Areas 1–4). Pre-fills a popular ML/AI/theory mix; swap as you like.',
  },
  BIOL: {
    id: 'BIOL',
    name: 'Biological Sciences',
    programName: 'Biological Sciences',
    eyebrow: 'UMD · Biological Sciences · BS',
    totalCredits: 120,
    coreCodes: [
      'BSCI160', 'BSCI161', 'BSCI170', 'BSCI171',
      'BSCI222', 'BSCI223', 'BSCI330',
      'CHEM131', 'CHEM132', 'CHEM231', 'CHEM232', 'CHEM241', 'CHEM242',
      'MATH130', 'MATH131',
      'PHYS121', 'PHYS122',
      'BSCI440',
    ],
    upperElectiveCodes: ['BSCI410', 'BSCI415', 'BSCI420', 'BSCI430'],
    supportCodes: ['STAT100'],
    goals: ['BSCI330', 'BSCI440'],
    notes: 'Defaults to General Biology concentration. Specializations (Cell Bio, Ecology, Physiology) swap a few upper-divs.',
  },
  INST: {
    id: 'INST',
    name: 'Information Science',
    programName: 'Information Science',
    eyebrow: 'UMD · Information Science · BS',
    totalCredits: 120,
    coreCodes: [
      'INST126', 'INST201', 'INST301', 'INST311', 'INST314',
      'INST326', 'INST327', 'INST335', 'INST352', 'INST362',
      'INST414', 'INST490',
    ],
    upperElectiveCodes: ['INST377', 'INST447', 'INST462', 'INST469'],
    supportCodes: ['MATH107', 'STAT100'],
    goals: ['INST414', 'INST490'],
    notes: 'iSchool BS-IS. Picks "User Experience" / "Data Science" tracks default to similar core.',
  },
  CCJS: {
    id: 'CCJS',
    name: 'Criminology & Criminal Justice',
    programName: 'Criminology & Criminal Justice',
    eyebrow: 'UMD · Criminology & Criminal Justice · BA',
    totalCredits: 120,
    coreCodes: [
      'CCJS100', 'CCJS105', 'CCJS200', 'CCJS230',
      'CCJS300', 'CCJS320', 'CCJS340', 'CCJS352',
      'CCJS400', 'CCJS498',
    ],
    upperElectiveCodes: ['CCJS418', 'CCJS432', 'CCJS451', 'CCJS461'],
    supportCodes: ['STAT100', 'ECON200'],
    goals: ['CCJS400', 'CCJS498'],
    notes: 'BA in Criminology. Statistics (CCJS200) and methods (CCJS300) are the gateway sequence.',
  },
  ECON: {
    id: 'ECON',
    name: 'Economics',
    programName: 'Economics',
    eyebrow: 'UMD · Economics · BS',
    totalCredits: 120,
    coreCodes: [
      'ECON200', 'ECON201',
      'ECON305', 'ECON306',
      'ECON321', 'ECON325', 'ECON326',
      'MATH140', 'MATH141',
      'STAT400',
    ],
    upperElectiveCodes: ['ECON414', 'ECON422', 'ECON425', 'ECON442', 'ECON450'],
    supportCodes: ['MATH240'],
    goals: ['ECON414', 'ECON422'],
    notes: 'BS variant (more quantitative than BA). MATH140/141 + STAT400 replace the BA stats track.',
  },
  PSYC: {
    id: 'PSYC',
    name: 'Psychology',
    programName: 'Psychology',
    eyebrow: 'UMD · Psychology · BS',
    totalCredits: 120,
    coreCodes: [
      'PSYC100', 'PSYC200', 'PSYC300',
      'PSYC332', 'PSYC341', 'PSYC353', 'PSYC355', 'PSYC361',
      'PSYC489',
    ],
    upperElectiveCodes: ['PSYC433', 'PSYC436', 'PSYC440', 'PSYC456'],
    supportCodes: ['BIOL106', 'STAT100', 'MATH130'],
    goals: ['PSYC489'],
    notes: 'BS Psychology. Requires one course from each subfield (developmental, cognitive, social, clinical, biological).',
  },
};

function getMajorTemplate(id) {
  return MAJOR_TEMPLATES[id] || null;
}

function listMajors() {
  return Object.values(MAJOR_TEMPLATES);
}

// All required + recommended codes, with default categorizations.
function majorAllCodes(template) {
  if (!template || template.useDefaultSchedule) return [];
  const out = [];
  (template.coreCodes || []).forEach(c => out.push({ code: c, category: 'major-core', kind: 'core' }));
  (template.supportCodes || []).forEach(c => out.push({ code: c, category: 'major-support', kind: 'tech' }));
  (template.upperElectiveCodes || []).forEach(c => out.push({ code: c, category: 'major-upper', kind: 'tech' }));
  return out;
}
