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
    goals: ['ENEE436', 'CMSC451', 'CMSC472'],
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

  BMGT: {
    id: 'BMGT',
    name: 'Business Administration',
    programName: 'Business Administration',
    eyebrow: 'UMD · Business Administration · BS',
    totalCredits: 120,
    coreCodes: [
      'BMGT110', 'BMGT220', 'BMGT221', 'BMGT230', 'BMGT289A',
      'BMGT340', 'BMGT350', 'BMGT364', 'BMGT367',
      'ECON200', 'ECON201', 'MATH120', 'STAT100',
    ],
    upperElectiveCodes: ['BMGT370', 'BMGT380', 'BMGT402', 'BMGT495'],
    supportCodes: ['COMM107'],
    goals: ['BMGT340', 'BMGT364'],
    notes: 'Smith School core plus sample upper-level business electives.',
  },
  FIRE: {
    id: 'FIRE',
    name: 'Finance',
    programName: 'Finance',
    eyebrow: 'UMD · Finance · BS',
    totalCredits: 120,
    coreCodes: ['BMGT110', 'BMGT220', 'BMGT221', 'BMGT340', 'BMGT350', 'BMGT364', 'BMGT367', 'FINA300'],
    upperElectiveCodes: ['FINA331', 'FINA411', 'FINA412', 'FINA424'],
    supportCodes: ['ECON200', 'ECON201', 'STAT100', 'MATH120'],
    goals: ['FINA300', 'FINA424'],
    notes: 'Finance major path using Smith core + sample FINA electives.',
  },
  ACCT: {
    id: 'ACCT',
    name: 'Accounting',
    programName: 'Accounting',
    eyebrow: 'UMD · Accounting · BS',
    totalCredits: 120,
    coreCodes: ['BMGT110', 'BMGT220', 'BMGT221', 'BMGT230', 'BMGT340', 'BMGT350', 'BMGT364', 'BMGT367', 'BMGT495'],
    upperElectiveCodes: ['BMGT440', 'BMGT441', 'BMGT442', 'BMGT444'],
    supportCodes: ['ECON200', 'ECON201', 'STAT100'],
    goals: ['BMGT440', 'BMGT444'],
    notes: 'Accounting track aligned with common upper-level BMGT accounting sequence.',
  },
  ENEE: {
    id: 'ENEE',
    name: 'Electrical Engineering',
    programName: 'Electrical Engineering',
    eyebrow: 'UMD · Electrical Engineering · BS',
    totalCredits: 125,
    coreCodes: ['MATH140', 'MATH141', 'MATH241', 'PHYS161', 'PHYS260', 'PHYS261', 'ENEE140', 'ENEE150', 'ENEE205', 'ENEE222', 'ENEE244', 'ENEE303', 'ENEE307'],
    upperElectiveCodes: ['ENEE322', 'ENEE324', 'ENEE350', 'ENEE446'],
    supportCodes: ['CMSC131', 'CMSC132', 'CHEM135'],
    goals: ['ENEE303', 'ENEE446'],
    notes: 'EE core path with circuits/systems emphasis and sample technical electives.',
  },
  MECH: {
    id: 'MECH',
    name: 'Mechanical Engineering',
    programName: 'Mechanical Engineering',
    eyebrow: 'UMD · Mechanical Engineering · BS',
    totalCredits: 126,
    coreCodes: ['MATH140', 'MATH141', 'MATH241', 'PHYS161', 'PHYS260', 'PHYS261', 'CHEM135', 'ENME202', 'ENME272', 'ENME331', 'ENME350', 'ENME351', 'ENME361'],
    upperElectiveCodes: ['ENME371', 'ENME382', 'ENME462', 'ENME472'],
    supportCodes: ['CMSC131', 'ENES100'],
    goals: ['ENME350', 'ENME472'],
    notes: 'ME sequence with thermofluids + design/manufacturing focused elective defaults.',
  },
  AERO: {
    id: 'AERO',
    name: 'Aerospace Engineering',
    programName: 'Aerospace Engineering',
    eyebrow: 'UMD · Aerospace Engineering · BS',
    totalCredits: 126,
    coreCodes: ['MATH140', 'MATH141', 'MATH241', 'PHYS161', 'PHYS260', 'PHYS261', 'CHEM135', 'ENAE202', 'ENAE311', 'ENAE324', 'ENAE362', 'ENAE414'],
    upperElectiveCodes: ['ENAE432', 'ENAE441', 'ENAE457', 'ENAE483'],
    supportCodes: ['CMSC131', 'ENES100'],
    goals: ['ENAE324', 'ENAE483'],
    notes: 'Aerospace template with structures + aerodynamics base and capstone-oriented electives.',
  },
  CHBE: {
    id: 'CHBE',
    name: 'Chemical Engineering',
    programName: 'Chemical Engineering',
    eyebrow: 'UMD · Chemical Engineering · BS',
    totalCredits: 125,
    coreCodes: ['MATH140', 'MATH141', 'MATH241', 'CHEM135', 'CHEM136', 'CHEM231', 'CHEM232', 'CHBE250', 'CHBE301', 'CHBE302', 'CHBE440', 'CHBE442'],
    upperElectiveCodes: ['CHBE424', 'CHBE433', 'CHBE434', 'CHBE482'],
    supportCodes: ['PHYS161', 'PHYS260', 'ENES100'],
    goals: ['CHBE302', 'CHBE482'],
    notes: 'Chemical engineering fundamentals with transport/reaction and process design emphasis.',
  },
  MATH: {
    id: 'MATH',
    name: 'Mathematics',
    programName: 'Mathematics',
    eyebrow: 'UMD · Mathematics · BS',
    totalCredits: 120,
    coreCodes: ['MATH140', 'MATH141', 'MATH240', 'MATH241', 'MATH310', 'MATH410', 'MATH411'],
    upperElectiveCodes: ['MATH403', 'MATH406', 'MATH432', 'MATH475'],
    supportCodes: ['STAT400', 'CMSC131'],
    goals: ['MATH410', 'MATH475'],
    notes: 'Pure/applied math blend with upper-level proof and analysis sequence.',
  },
  GVPT: {
    id: 'GVPT',
    name: 'Government & Politics',
    programName: 'Government & Politics',
    eyebrow: 'UMD · Government & Politics · BA',
    totalCredits: 120,
    coreCodes: ['GVPT100', 'GVPT170', 'GVPT201', 'GVPT241', 'GVPT280', 'GVPT429'],
    upperElectiveCodes: ['GVPT301', 'GVPT368', 'GVPT402', 'GVPT406'],
    supportCodes: ['STAT100'],
    goals: ['GVPT241', 'GVPT429'],
    notes: 'BA template spanning American politics, comparative politics, and methods.',
  },
  COMM: {
    id: 'COMM',
    name: 'Communication',
    programName: 'Communication',
    eyebrow: 'UMD · Communication · BA',
    totalCredits: 120,
    coreCodes: ['COMM107', 'COMM200', 'COMM324', 'COMM330', 'COMM351', 'COMM398'],
    upperElectiveCodes: ['COMM382', 'COMM400', 'COMM451', 'COMM456'],
    supportCodes: ['STAT100'],
    goals: ['COMM324', 'COMM398'],
    notes: 'Communication BA with rhetoric/media/interpersonal coursework mix.',
  },
  ENGL: {
    id: 'ENGL',
    name: 'English Language & Literature',
    programName: 'English Language & Literature',
    eyebrow: 'UMD · English · BA',
    totalCredits: 120,
    coreCodes: ['ENGL101', 'ENGL301', 'ENGL391', 'ENGL393', 'ENGL398'],
    upperElectiveCodes: ['ENGL402', 'ENGL407', 'ENGL420', 'ENGL466'],
    supportCodes: ['LING200'],
    goals: ['ENGL398'],
    notes: 'English BA with literature, language, and capstone seminar defaults.',
  },
  ARCH: {
    id: 'ARCH',
    name: 'Architecture',
    programName: 'Architecture',
    eyebrow: 'UMD · Architecture · BS',
    totalCredits: 120,
    coreCodes: ['ARCH200', 'ARCH223', 'ARCH226', 'ARCH260', 'ARCH406', 'ARCH407', 'ARCH408'],
    upperElectiveCodes: ['ARCH412', 'ARCH417', 'ARCH462', 'ARCH489'],
    supportCodes: ['MATH120', 'PHYS121'],
    goals: ['ARCH407', 'ARCH489'],
    notes: 'Architecture sequence with studio/theory core and sample design electives.',
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
  if (MAJOR_TEMPLATES[id]) return MAJOR_TEMPLATES[id];
  const custom = (state && state.customMajors) || [];
  return custom.find(m => m.id === id) || null;
}

function listMajors() {
  const custom = (state && state.customMajors) || [];
  return [...Object.values(MAJOR_TEMPLATES), ...custom];
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
