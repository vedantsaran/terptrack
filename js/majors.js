'use strict';
/* ============================================================
   MAJOR TEMPLATES
   Lists of required course codes per major. Course metadata
   (title, credits, prereqs, gen-eds) is fetched live from
   umd.io + PlanetTerp when a major is applied. We only hand-curate
   the code lists and a few hints (recommended electives, goals,
   total credits, college/school grouping, default category buckets).
   ============================================================ */

// Colleges/schools used to group templates in the dropdown.
const COLLEGES = {
  ENG:   'A. James Clark School of Engineering',
  CMNS:  'Computer, Math & Natural Sciences (CMNS)',
  BMGT:  'Robert H. Smith School of Business',
  BSOS:  'Behavioral & Social Sciences (BSOS)',
  ARHU:  'Arts & Humanities (ARHU)',
  EDUC:  'College of Education',
  PUBH:  'School of Public Health',
  INFO:  'College of Information Studies',
  ARCH:  'School of Architecture',
  AGNR:  'Agriculture & Natural Resources',
  JOUR:  'Philip Merrill College of Journalism',
};

const UMD_CATALOG_ORIGIN = 'https://academiccatalog.umd.edu';
const UMD_CATALOG_PROGRAMS_URL = `${UMD_CATALOG_ORIGIN}/undergraduate/programs/`;
const UMD_COURSE_CATALOG_URL = `${UMD_CATALOG_ORIGIN}/undergraduate/approved-courses/`;
const UMD_CATALOG_YEAR = '2026-2027';
const UMD_CATALOG_CHECKED_AT = 'June 30, 2026';

const MAJOR_CATALOG_SOURCES = Object.freeze({
  AAST: { label: 'African American and Africana Studies Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-american-africana-studies-major/' },
  ACCOUNTING: { label: 'Accounting Major', path: '/undergraduate/colleges-schools/business/accounting/accounting-major/' },
  AMST: { label: 'American Studies Major', path: '/undergraduate/colleges-schools/arts-humanities/american-studies/american-studies-major/' },
  ANSC: { label: 'Animal Sciences Major', path: '/undergraduate/colleges-schools/agriculture-natural-resources/animal-sciences/animal-sciences-major/' },
  ANTH: { label: 'Anthropology Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/anthropology/anthropology-major/' },
  AOSC: { label: 'Atmospheric and Oceanic Science Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/atmospheric-oceanic-science/atmospheric-oceanic-science-major/' },
  ARCH: { label: 'Architecture Major', path: '/undergraduate/colleges-schools/architecture-planning-preservation/architecture-major/' },
  AREC: { label: 'Agricultural and Resource Economics Major', path: '/undergraduate/colleges-schools/agriculture-natural-resources/agricultural-resource-economics/agricultural-resource-economics-major/' },
  ARTH: { label: 'Art History Major', path: '/undergraduate/colleges-schools/arts-humanities/art-history-archaeology/art-history-major/' },
  ARTT: { label: 'Studio Art Major', path: '/undergraduate/colleges-schools/arts-humanities/art/art-major/' },
  ASTR: { label: 'Astronomy Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/astronomy/astronomy-major/' },
  BCHM: { label: 'Biochemistry Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/chemistry-biochemistry/biochemistry-major/' },
  BIOE: { label: 'Bioengineering Major', path: '/undergraduate/colleges-schools/engineering/bioengineering/bioengineering-major/' },
  BIOL: { label: 'Biological Sciences Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/' },
  CCJS: { label: 'Criminology and Criminal Justice Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/criminology-criminal-justice/criminology-criminal-justice-major/' },
  CE: { label: 'Computer Engineering Major', path: '/undergraduate/colleges-schools/engineering/electrical-and-computer/computer-engineering-major/' },
  CHEM: { label: 'Chemistry Major (B.A., B.S.)', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/chemistry-biochemistry/chemistry-major/' },
  CINE: { label: 'Cinema and Media Studies Major (SLLC)', path: '/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/cinema-media-studies-major/' },
  COMM: { label: 'Communication Major', path: '/undergraduate/colleges-schools/arts-humanities/communication/communication-major/' },
  CS: { label: 'Computer Science Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/computer-science-major/' },
  ECON: { label: 'Economics Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/economics/economics-major/' },
  EDUC: { label: 'Elementary Education Major', path: '/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/elementary-education-major/' },
  ENAE: { label: 'Aerospace Engineering Major', path: '/undergraduate/colleges-schools/engineering/aerospace-engineering/aerospace-engineering-major/' },
  ENCE: { label: 'Civil Engineering Major', path: '/undergraduate/colleges-schools/engineering/civil-environmental-engineering/civil-environmental-engineering-major/' },
  ENCH: { label: 'Chemical Engineering Major', path: '/undergraduate/colleges-schools/engineering/chemical-biomolecular-engineering/chemical-biomolecular-engineering-major/' },
  ENEE: { label: 'Electrical Engineering Major', path: '/undergraduate/colleges-schools/engineering/electrical-and-computer/electrical-engineering-major/' },
  ENFP: { label: 'Fire Protection Engineering Major', path: '/undergraduate/colleges-schools/engineering/fire-protection-engineering/fire-protection-engineering-major/' },
  ENGL: { label: 'English Language and Literature Major', path: '/undergraduate/colleges-schools/arts-humanities/english-language-literature/english-major/' },
  ENMA: { label: 'Materials Science and Engineering Major', path: '/undergraduate/colleges-schools/engineering/materials-science-engineering/materials-science-engineering-major/' },
  ENME: { label: 'Mechanical Engineering Major', path: '/undergraduate/colleges-schools/engineering/mechanical-engineering/mechanical-engineering-major/' },
  ENST: { label: 'Environmental Science and Technology Major', path: '/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-technology/environmental-science-technology-major/' },
  FINANCE: { label: 'Finance Major', path: '/undergraduate/colleges-schools/business/finance/finance-major/' },
  FMSC: { label: 'Family Health Major', path: '/undergraduate/colleges-schools/public-health/family-science/family-health-major/' },
  GEOG: { label: 'Geographical Sciences Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographical-sciences-major/' },
  GEOL: { label: 'Geology Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/geological-environmental-planetary-sciences/geology-major/' },
  GVPT: { label: 'Government and Politics Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/government-politics/government-politics-major/' },
  HESP: { label: 'Hearing and Speech Sciences Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/hearing-speech-sciences/hearing-speech-sciences-major/' },
  HIST: { label: 'History Major', path: '/undergraduate/colleges-schools/arts-humanities/history/history-major/' },
  HLTH: { label: 'Public Health Practice Major', path: '/undergraduate/colleges-schools/public-health/behavioral-community-health/public-health-practice-major/' },
  INST: { label: 'Information Science Major', path: '/undergraduate/colleges-schools/information/information-science-major/' },
  IS: { label: 'Information Systems Major', path: '/undergraduate/colleges-schools/business/decision-operations-information-technologies/information-systems-major/' },
  JOUR: { label: 'Journalism Major', path: '/undergraduate/colleges-schools/journalism/journalism-major/' },
  KNES: { label: 'Kinesiology Major', path: '/undergraduate/colleges-schools/public-health/kinesiology/kinesiology-major/' },
  LING: { label: 'Linguistics Major', path: '/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-major/' },
  MARKETING: { label: 'Marketing Major', path: '/undergraduate/colleges-schools/business/marketing/marketing-major/' },
  MATH: { label: 'Mathematics Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/mathematics-major/' },
  MGMT: { label: 'Management Major', path: '/undergraduate/colleges-schools/business/management/management-major/' },
  MUSC: { label: 'Music Major', path: '/undergraduate/colleges-schools/arts-humanities/music/music-major/' },
  NEUR: { label: 'Neuroscience Major (CMNS)', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biology/neuroscience-major/' },
  NFSC: { label: 'Nutrition and Food Science Major', path: '/undergraduate/colleges-schools/agriculture-natural-resources/nutrition-food-science/nutrition-food-science-major/' },
  PHIL: { label: 'Philosophy Major', path: '/undergraduate/colleges-schools/arts-humanities/philosophy/philosophy-major/' },
  PHSC: { label: 'Public Health Science Major', path: '/undergraduate/colleges-schools/public-health/public-health-science/public-health-science-major/' },
  PHYS: { label: 'Physics Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/' },
  PLSC: { label: 'Plant Sciences Major', path: '/undergraduate/colleges-schools/agriculture-natural-resources/plant-sciences-landscape-architecture/plant-sciences-major/' },
  PSYC: { label: 'Psychology Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/psychology/psychology-major/' },
  SCM: { label: 'Supply Chain Management Major', path: '/undergraduate/colleges-schools/business/logistics-business-public-policy/supply-chain-management-major/' },
  SOCY: { label: 'Sociology Major', path: '/undergraduate/colleges-schools/behavioral-social-sciences/sociology/sociology-major/' },
  SPAN: { label: 'Spanish Language, Literatures, and Culture Major', path: '/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/' },
  STAT: { label: 'Mathematics Major', path: '/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/mathematics-major/' },
  THET: { label: 'Theatre Major', path: '/undergraduate/colleges-schools/arts-humanities/theatre-dance-performance-studies/theatre-major/' },
  WMST: { label: 'Women, Gender, and Sexuality Studies Major', path: '/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/womens-gender-sexuality-studies-major/' },
});

const MAJOR_TEMPLATES = {
  /* ---------- ENGINEERING ---------- */
  CE: {
    id: 'CE', college: 'ENG',
    name: 'Computer Engineering',
    programName: 'Computer Engineering',
    eyebrow: 'UMD · Computer Engineering · 2026–2030',
    totalCredits: 125,
    useDefaultSchedule: true,
    goals: ['ENEE 436', 'CMSC 451', 'CMSC 472'],
    notes: 'CE uses the curated default schedule. Switch to a different major to use auto-generation.',
  },
  CS: {
    id: 'CS', college: 'CMNS',
    name: 'Computer Science',
    programName: 'Computer Science',
    eyebrow: 'UMD · Computer Science · BS',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_CS !== 'undefined' ? SCHEDULE_CS : null,
    coreCodes: [
      'CMSC131','CMSC132','CMSC216','CMSC250',
      'CMSC330','CMSC351',
      'MATH140','MATH141','MATH240',
      'STAT400',
      'CMSC320','CMSC335',
    ],
    upperElectiveCodes: ['CMSC421','CMSC422','CMSC451','CMSC411','CMSC414','CMSC417','CMSC430'],
    supportCodes: ['PHYS161','PHYS260','PHYS261'],
    goals: ['CMSC421','CMSC422','CMSC451'],
    notes: 'Pre-fills a popular ML / AI / theory upper-division mix. Specialization areas swap a few uppers.',
  },
  ENME: {
    id: 'ENME', college: 'ENG',
    name: 'Mechanical Engineering',
    programName: 'Mechanical Engineering',
    eyebrow: 'UMD · Mechanical Engineering · BS',
    totalCredits: 124,
    fixedSchedule: typeof SCHEDULE_ENME !== 'undefined' ? SCHEDULE_ENME : null,
    coreCodes: [
      'ENES100','ENES102',
      'ENME271','ENME272',
      'ENME220','ENME232','ENME217','ENME300','ENME342',
      'ENME351','ENME382','ENME432','ENME462','ENME472',
    ],
    upperElectiveCodes: ['ENME414','ENME489','ENME466'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','PHYS261','CHEM135'],
    goals: ['ENME472','ENME462'],
    notes: 'Standard ME track. Aerospace / Robotics tracks substitute a few upper-divs.',
  },
  ENEE: {
    id: 'ENEE', college: 'ENG',
    name: 'Electrical Engineering',
    programName: 'Electrical Engineering',
    eyebrow: 'UMD · Electrical Engineering · BS',
    totalCredits: 124,
    coreCodes: [
      'ENES100','ENES102',
      'ENEE150','ENEE205','ENEE222','ENEE244','ENEE245',
      'ENEE303','ENEE324','ENEE350','ENEE380','ENEE381','ENEE408A',
    ],
    upperElectiveCodes: ['ENEE436','ENEE411','ENEE459B','ENEE475','ENEE420'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','PHYS261','CHEM135'],
    goals: ['ENEE408A','ENEE436'],
    notes: 'EE BS. CE and EE share the early ENEE sequence — about 60% overlap.',
  },
  ENAE: {
    id: 'ENAE', college: 'ENG',
    name: 'Aerospace Engineering',
    programName: 'Aerospace Engineering',
    eyebrow: 'UMD · Aerospace Engineering · BS',
    totalCredits: 125,
    coreCodes: [
      'ENES100','ENES102',
      'ENAE100','ENAE200','ENAE202','ENAE283','ENAE301','ENAE404','ENAE311','ENAE324','ENAE362','ENAE455',
      'ENAE403','ENAE414','ENAE432','ENAE481','ENAE482',
    ],
    upperElectiveCodes: ['ENAE423','ENAE441','ENAE464','ENAE488C'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','PHYS261','CHEM135'],
    goals: ['ENAE481','ENAE482'],
    notes: 'Aerospace BS. Pick aero (atmospheric) or astro (space) track in junior year.',
  },
  ENCE: {
    id: 'ENCE', college: 'ENG',
    name: 'Civil Engineering',
    programName: 'Civil Engineering',
    eyebrow: 'UMD · Civil Engineering · BS',
    totalCredits: 124,
    coreCodes: [
      'ENES100','ENES102',
      'ENCE201','ENCE202','ENCE215','ENCE300','ENCE302','ENCE320','ENCE305','ENCE340','ENCE353',
      'ENCE360','ENCE411','ENCE420','ENCE489B',
    ],
    upperElectiveCodes: ['ENCE466','ENCE472'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','CHEM135'],
    goals: ['ENCE489B'],
    notes: 'Pick a track: structures, transportation, geotech, environmental, or water resources.',
  },
  BIOE: {
    id: 'BIOE', college: 'ENG',
    name: 'Bioengineering',
    programName: 'Bioengineering',
    eyebrow: 'UMD · Bioengineering · BS',
    totalCredits: 126,
    coreCodes: [
      'ENES100','BIOE120','BIOE241','BIOE340','BIOE331','BIOE332','BIOE371','BIOE372','BIOE404','BIOE453','BIOE485','BIOE486',
    ],
    upperElectiveCodes: ['BIOE411','BIOE420','BIOE489A'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','CHEM131','CHEM132','CHEM231','CHEM232','BSCI170','BSCI171'],
    goals: ['BIOE485','BIOE486'],
    notes: 'BIOE BS. Heavy on bio + chem support load alongside engineering core.',
  },

  /* ---------- CMNS (Computer, Math, Natural Sciences) ---------- */
  BIOL: {
    id: 'BIOL', college: 'CMNS',
    name: 'Biological Sciences',
    programName: 'Biological Sciences',
    eyebrow: 'UMD · Biological Sciences · BS',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_BIOL !== 'undefined' ? SCHEDULE_BIOL : null,
    coreCodes: [
      'BSCI160','BSCI161','BSCI170','BSCI171','BSCI222','BSCI223','BSCI330',
      'CHEM131','CHEM132','CHEM231','CHEM232','CHEM241','CHEM242',
      'MATH130','MATH131',
      'PHYS121','PHYS122',
      'BSCI440',
    ],
    upperElectiveCodes: ['BSCI410','BSCI415','BSCI420','BSCI430'],
    supportCodes: ['STAT100'],
    goals: ['BSCI330','BSCI440'],
    notes: 'Defaults to General Biology concentration. Specializations swap a few upper-divs.',
  },
  MATH: {
    id: 'MATH', college: 'CMNS',
    name: 'Mathematics',
    programName: 'Mathematics',
    eyebrow: 'UMD · Mathematics · BS',
    totalCredits: 120,
    coreCodes: [
      'MATH140','MATH141','MATH240','MATH241','MATH246',
      'MATH310','MATH410','MATH411','MATH405',
    ],
    upperElectiveCodes: ['MATH430','MATH452','MATH456','MATH463'],
    supportCodes: ['STAT400','CMSC131'],
    goals: ['MATH410','MATH411'],
    notes: 'Pure math BS. Applied math / stats / actuarial concentrations swap MATH 4xx upper-divs.',
  },
  STAT: {
    id: 'STAT', college: 'CMNS',
    name: 'Statistics',
    programName: 'Mathematics — Statistics',
    eyebrow: 'UMD · Statistics · BS',
    totalCredits: 120,
    coreCodes: [
      'MATH140','MATH141','MATH240','MATH241',
      'STAT400','STAT401','STAT410','STAT420','STAT430','STAT440',
    ],
    upperElectiveCodes: ['STAT426','STAT464','STAT470'],
    supportCodes: ['CMSC131','CMSC132'],
    goals: ['STAT410','STAT420'],
    notes: 'BS Statistics under MATH dept. Heavy programming via CMSC support sequence.',
  },
  CHEM: {
    id: 'CHEM', college: 'CMNS',
    name: 'Chemistry',
    programName: 'Chemistry',
    eyebrow: 'UMD · Chemistry · BS',
    totalCredits: 120,
    coreCodes: [
      'CHEM131','CHEM132','CHEM231','CHEM232','CHEM241','CHEM242',
      'CHEM271','CHEM272','CHEM403','CHEM482','CHEM441',
    ],
    upperElectiveCodes: ['CHEM425','CHEM481','CHEM483'],
    supportCodes: ['MATH140','MATH141','MATH246','PHYS161','PHYS260','PHYS261'],
    goals: ['CHEM441','CHEM483'],
    notes: 'ACS-certified BS Chemistry. Biochemistry concentration substitutes BCHM 461 + 462.',
  },
  PHYS: {
    id: 'PHYS', college: 'CMNS',
    name: 'Physics',
    programName: 'Physics',
    eyebrow: 'UMD · Physics · BS',
    totalCredits: 120,
    coreCodes: [
      'PHYS161','PHYS260','PHYS261','PHYS373','PHYS374',
      'PHYS401','PHYS402','PHYS404','PHYS410','PHYS411','PHYS412',
    ],
    upperElectiveCodes: ['PHYS405','PHYS420','PHYS441'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','MATH410'],
    goals: ['PHYS401','PHYS402'],
    notes: 'Physics BS. Quantum I/II + Classical Mech + Stat Mech are the core upper-div load.',
  },
  ASTR: {
    id: 'ASTR', college: 'CMNS',
    name: 'Astronomy',
    programName: 'Astronomy',
    eyebrow: 'UMD · Astronomy · BS',
    totalCredits: 120,
    coreCodes: [
      'ASTR120','ASTR220','ASTR300','ASTR310','ASTR320','ASTR340','ASTR398B','ASTR498N',
      'PHYS161','PHYS260','PHYS261','PHYS373','PHYS401','PHYS411',
    ],
    upperElectiveCodes: ['ASTR406','ASTR450'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','CMSC131'],
    goals: ['ASTR498N'],
    notes: 'BS Astronomy is essentially Physics with astronomy electives. Heavy quantum + mech load.',
  },

  /* ---------- BUSINESS (Smith) ---------- */
  FINANCE: {
    id: 'FINANCE', college: 'BMGT',
    name: 'Finance',
    programName: 'Business — Finance',
    eyebrow: 'UMD · Business Finance · BS',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_FINANCE !== 'undefined' ? SCHEDULE_FINANCE : null,
    coreCodes: [
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289B','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380',
      'BMGT343','BMGT440','BMGT443','BMGT446','BMGT496',
    ],
    upperElectiveCodes: ['BMGT441','BMGT445','BMGT442'],
    supportCodes: ['ECON200','ECON201','MATH220','STAT400'],
    goals: ['BMGT443','BMGT496'],
    notes: 'Smith Business — Finance track. Common business core + 5 finance-specific 4xx courses.',
  },
  MARKETING: {
    id: 'MARKETING', college: 'BMGT',
    name: 'Marketing',
    programName: 'Business — Marketing',
    eyebrow: 'UMD · Business Marketing · BS',
    totalCredits: 120,
    coreCodes: [
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289B','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380',
      'BMGT451','BMGT452','BMGT454','BMGT457','BMGT496',
    ],
    upperElectiveCodes: ['BMGT458A','BMGT458B'],
    supportCodes: ['ECON200','ECON201','MATH220'],
    goals: ['BMGT452','BMGT496'],
    notes: 'Smith Business — Marketing track. Core mirrors Finance/Mgmt; 4xx swaps differentiate.',
  },
  ACCOUNTING: {
    id: 'ACCOUNTING', college: 'BMGT',
    name: 'Accounting',
    programName: 'Business — Accounting',
    eyebrow: 'UMD · Business Accounting · BS',
    totalCredits: 120,
    coreCodes: [
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289B','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380',
      'BMGT310','BMGT321','BMGT323','BMGT326','BMGT417','BMGT496',
    ],
    upperElectiveCodes: ['BMGT411','BMGT422'],
    supportCodes: ['ECON200','ECON201','MATH220'],
    goals: ['BMGT310','BMGT417'],
    notes: 'Smith Business — Accounting track. CPA-eligible coursework includes audit + tax + cost.',
  },
  IS: {
    id: 'IS', college: 'BMGT',
    name: 'Information Systems',
    programName: 'Business — Information Systems',
    eyebrow: 'UMD · Business Information Systems · BS',
    totalCredits: 120,
    coreCodes: [
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289B','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380',
      'BMGT301','BMGT403','BMGT407','BMGT431','BMGT496',
    ],
    upperElectiveCodes: ['BMGT430','BMGT434'],
    supportCodes: ['ECON200','ECON201','MATH220','CMSC131'],
    goals: ['BMGT407','BMGT496'],
    notes: 'Smith Business — IS / Decision/Info Tech track. More technical than other Smith majors.',
  },

  /* ---------- BSOS (Behavioral & Social Sciences) ---------- */
  ECON: {
    id: 'ECON', college: 'BSOS',
    name: 'Economics',
    programName: 'Economics',
    eyebrow: 'UMD · Economics · BS',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_ECON !== 'undefined' ? SCHEDULE_ECON : null,
    coreCodes: [
      'ECON200','ECON201','ECON305','ECON306','ECON321','ECON325','ECON326',
      'MATH140','MATH141','STAT400',
    ],
    upperElectiveCodes: ['ECON414','ECON422','ECON425','ECON442','ECON450'],
    supportCodes: ['MATH240'],
    goals: ['ECON414','ECON422'],
    notes: 'BS variant — quantitative. MATH140/141 + STAT400 replace the BA stats track.',
  },
  PSYC: {
    id: 'PSYC', college: 'BSOS',
    name: 'Psychology',
    programName: 'Psychology',
    eyebrow: 'UMD · Psychology · BS',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_PSYC !== 'undefined' ? SCHEDULE_PSYC : null,
    coreCodes: [
      'PSYC100','PSYC200','PSYC300','PSYC332','PSYC341','PSYC353','PSYC355','PSYC361','PSYC489',
    ],
    upperElectiveCodes: ['PSYC433','PSYC436','PSYC440','PSYC456'],
    supportCodes: ['BIOL106','STAT100','MATH130'],
    goals: ['PSYC489'],
    notes: 'BS Psychology. Requires one course from each subfield (developmental, cognitive, social, clinical, biological).',
  },
  CCJS: {
    id: 'CCJS', college: 'BSOS',
    name: 'Criminology & Criminal Justice',
    programName: 'Criminology & Criminal Justice',
    eyebrow: 'UMD · Criminology & Criminal Justice · BA',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_CCJS !== 'undefined' ? SCHEDULE_CCJS : null,
    coreCodes: [
      'CCJS100','CCJS105','CCJS200','CCJS230','CCJS300','CCJS320','CCJS340','CCJS352','CCJS400','CCJS498',
    ],
    upperElectiveCodes: ['CCJS418','CCJS432','CCJS451','CCJS461'],
    supportCodes: ['STAT100','ECON200'],
    goals: ['CCJS400','CCJS498'],
    notes: 'BA in Criminology. Statistics (CCJS200) and methods (CCJS300) are the gateway sequence.',
  },
  GVPT: {
    id: 'GVPT', college: 'BSOS',
    name: 'Government & Politics',
    programName: 'Government & Politics',
    eyebrow: 'UMD · Government & Politics · BA',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_GVPT !== 'undefined' ? SCHEDULE_GVPT : null,
    coreCodes: [
      'GVPT100','GVPT170','GVPT200','GVPT241','GVPT280','GVPT399',
    ],
    upperElectiveCodes: ['GVPT403','GVPT404','GVPT423','GVPT431','GVPT457'],
    supportCodes: ['ECON200','STAT100'],
    goals: ['GVPT399'],
    notes: 'BA GVPT. Pick one of four subfield concentrations: American, Comparative, IR, or Theory.',
  },
  SOCY: {
    id: 'SOCY', college: 'BSOS',
    name: 'Sociology',
    programName: 'Sociology',
    eyebrow: 'UMD · Sociology · BA',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_SOCY !== 'undefined' ? SCHEDULE_SOCY : null,
    coreCodes: [
      'SOCY100','SOCY105','SOCY201','SOCY202','SOCY441','SOCY498C',
    ],
    upperElectiveCodes: ['SOCY410','SOCY424','SOCY428','SOCY465'],
    supportCodes: ['STAT100'],
    goals: ['SOCY498C'],
    notes: 'BA Sociology. SOCY 201 (stats) + 202 (methods) gateway must be passed before 4xx work.',
  },
  ANTH: {
    id: 'ANTH', college: 'BSOS',
    name: 'Anthropology',
    programName: 'Anthropology',
    eyebrow: 'UMD · Anthropology · BA',
    totalCredits: 120,
    coreCodes: [
      'ANTH220','ANTH240','ANTH260','ANTH305','ANTH411','ANTH498Y',
    ],
    upperElectiveCodes: ['ANTH415','ANTH447','ANTH462'],
    supportCodes: ['STAT100'],
    goals: ['ANTH498Y'],
    notes: 'BA Anthropology. Four-field intro covers cultural, archaeology, biological, linguistic.',
  },

  /* ---------- ARHU (Arts & Humanities) ---------- */
  ENGL: {
    id: 'ENGL', college: 'ARHU',
    name: 'English',
    programName: 'English',
    eyebrow: 'UMD · English · BA',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_ENGL !== 'undefined' ? SCHEDULE_ENGL : null,
    coreCodes: [
      'ENGL201','ENGL301','ENGL311','ENGL312','ENGL313','ENGL402','ENGL498',
    ],
    upperElectiveCodes: ['ENGL379M','ENGL433','ENGL437','ENGL489P'],
    supportCodes: ['ENGL101'],
    goals: ['ENGL498'],
    notes: 'BA English. Lots of choice; pre-fills survey + period sequence and a senior seminar.',
  },
  HIST: {
    id: 'HIST', college: 'ARHU',
    name: 'History',
    programName: 'History',
    eyebrow: 'UMD · History · BA',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_HIST !== 'undefined' ? SCHEDULE_HIST : null,
    coreCodes: [
      'HIST200','HIST201','HIST208B','HIST205','HIST407','HIST408B',
    ],
    upperElectiveCodes: ['HIST319L','HIST405','HIST429F','HIST462'],
    supportCodes: [],
    goals: ['HIST408B'],
    notes: 'BA History. HIST 200/201 are the methods gateway; HIST 408 is senior research seminar.',
  },
  PHIL: {
    id: 'PHIL', college: 'ARHU',
    name: 'Philosophy',
    programName: 'Philosophy',
    eyebrow: 'UMD · Philosophy · BA',
    totalCredits: 120,
    coreCodes: [
      'PHIL170','PHIL250','PHIL310','PHIL320','PHIL332','PHIL370','PHIL408R',
    ],
    upperElectiveCodes: ['PHIL360','PHIL428A','PHIL456'],
    supportCodes: [],
    goals: ['PHIL408R'],
    notes: 'BA Philosophy. Logic + ancient + modern + ethics is the typical core sweep.',
  },
  COMM: {
    id: 'COMM', college: 'ARHU',
    name: 'Communication',
    programName: 'Communication',
    eyebrow: 'UMD · Communication · BA',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_COMM !== 'undefined' ? SCHEDULE_COMM : null,
    coreCodes: [
      'COMM107','COMM200','COMM230','COMM250','COMM330','COMM350','COMM402','COMM497',
    ],
    upperElectiveCodes: ['COMM424','COMM453','COMM488'],
    supportCodes: ['STAT100'],
    goals: ['COMM497'],
    notes: 'BA Communication. Choose between rhetoric & political communication or public relations track.',
  },
  ARTH: {
    id: 'ARTH', college: 'ARHU',
    name: 'Art History',
    programName: 'Art History',
    eyebrow: 'UMD · Art History · BA',
    totalCredits: 120,
    coreCodes: [
      'ARTH221','ARTH200','ARTH201','ARTH250','ARTH320','ARTH488K','ARTH489K',
    ],
    upperElectiveCodes: ['ARTH351','ARTH418','ARTH465'],
    supportCodes: [],
    goals: ['ARTH489K'],
    notes: 'BA Art History. Survey (ancient → modern) + non-Western course + senior seminar.',
  },

  /* ---------- INFO ---------- */
  INST: {
    id: 'INST', college: 'INFO',
    name: 'Information Science',
    programName: 'Information Science',
    eyebrow: 'UMD · Information Science · BS',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_INST !== 'undefined' ? SCHEDULE_INST : null,
    coreCodes: [
      'INST126','INST201','INST301','INST311','INST314','INST326','INST327','INST335','INST352','INST362','INST414','INST490',
    ],
    upperElectiveCodes: ['INST377','INST447','INST462','INST469'],
    supportCodes: ['MATH107','STAT100'],
    goals: ['INST414','INST490'],
    notes: 'iSchool BS-IS. UX / Data Science tracks share most of the core.',
  },

  /* ---------- PUBLIC HEALTH ---------- */
  PHSC: {
    id: 'PHSC', college: 'PUBH',
    name: 'Public Health Science',
    programName: 'Public Health Science',
    eyebrow: 'UMD · Public Health Science · BS',
    totalCredits: 120,
    coreCodes: [
      'SPHL100','PHSC300','EPIB301','PHSC401','PHSC402','BSCI170','BSCI223','EPIB315','PHSC450',
    ],
    upperElectiveCodes: ['PHSC420','MIEH300','HLTH391'],
    supportCodes: ['BSCI171','CHEM131','CHEM132','MATH130','STAT100'],
    goals: ['PHSC450'],
    notes: 'BS PHSC at the Universities at Shady Grove. Heavy bio + chem support.',
  },
  KNES: {
    id: 'KNES', college: 'PUBH',
    name: 'Kinesiology',
    programName: 'Kinesiology',
    eyebrow: 'UMD · Kinesiology · BS',
    totalCredits: 120,
    coreCodes: [
      'KNES157T','KNES287','KNES289','KNES293','KNES350','KNES360','KNES385','KNES450',
    ],
    upperElectiveCodes: ['KNES400','KNES440','KNES465'],
    supportCodes: ['BSCI201','BSCI202','CHEM131','MATH130','STAT100'],
    goals: ['KNES450'],
    notes: 'BS Kinesiology. Anatomy + Physiology gateway is non-negotiable.',
  },
  FMSC: {
    id: 'FMSC', college: 'PUBH',
    name: 'Family Science',
    programName: 'Family Science',
    eyebrow: 'UMD · Family Science · BS',
    totalCredits: 120,
    coreCodes: [
      'FMSC170','FMSC110','FMSC260','FMSC290','FMSC330','FMSC332','FMSC381','FMSC487','FMSC498',
    ],
    upperElectiveCodes: ['FMSC430','FMSC450'],
    supportCodes: ['STAT100','PSYC100'],
    goals: ['FMSC498'],
    notes: 'BS Family Science. Couple/family therapy and CFLE certification track.',
  },

  /* ---------- AGNR ---------- */
  NFSC: {
    id: 'NFSC', college: 'AGNR',
    name: 'Nutrition & Food Science',
    programName: 'Nutrition & Food Science',
    eyebrow: 'UMD · Nutrition & Food Science · BS',
    totalCredits: 120,
    coreCodes: [
      'NFSC100','NFSC112','NFSC315','NFSC341','NFSC421','NFSC430','NFSC440','NFSC450',
    ],
    upperElectiveCodes: ['NFSC455','NFSC470'],
    supportCodes: ['BSCI170','BSCI171','BSCI222','CHEM131','CHEM132','CHEM231','CHEM232','CHEM271','CHEM272'],
    goals: ['NFSC450'],
    notes: 'BS Nutrition & Food Science. Dietetics track has additional clinical reqs.',
  },

  /* ---------- ARCH ---------- */
  ARCH: {
    id: 'ARCH', college: 'ARCH',
    name: 'Architecture',
    programName: 'Architecture',
    eyebrow: 'UMD · Architecture · BA',
    totalCredits: 120,
    coreCodes: [
      'ARCH170','ARCH171','ARCH200','ARCH201','ARCH225','ARCH226','ARCH270','ARCH271','ARCH300','ARCH400','ARCH401','ARCH402','ARCH403',
    ],
    upperElectiveCodes: ['ARCH408','ARCH430','ARCH460','ARCH481'],
    supportCodes: ['PHYS121','MATH140'],
    goals: ['ARCH403'],
    notes: 'BA Architecture (4-yr). M.Arch is the accredited path; BA is pre-professional.',
  },

  /* ---------- JOUR ---------- */
  JOUR: {
    id: 'JOUR', college: 'JOUR',
    name: 'Journalism',
    programName: 'Journalism',
    eyebrow: 'UMD · Journalism · BA',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_JOUR !== 'undefined' ? SCHEDULE_JOUR : null,
    coreCodes: [
      'JOUR175','JOUR200','JOUR201','JOUR202','JOUR320','JOUR352','JOUR353','JOUR402','JOUR456','JOUR480',
    ],
    upperElectiveCodes: ['JOUR453','JOUR451','JOUR458B'],
    supportCodes: ['ENGL101','STAT100'],
    goals: ['JOUR480'],
    notes: 'BA Journalism. News writing → multi-platform reporting → capstone newsroom.',
  },

  /* ---------- ENGINEERING (additional) ---------- */
  ENCH: {
    id: 'ENCH', college: 'ENG',
    name: 'Chemical Engineering',
    programName: 'Chemical Engineering',
    eyebrow: 'UMD · Chemical Engineering · BS',
    totalCredits: 124,
    coreCodes: [
      'ENES100','ENCH424','ENCH440','ENCH446','ENCH476','ENCH333','ENCH482','ENCH490','ENCH468C','ENCH437','ENCH442','ENCH444',
    ],
    upperElectiveCodes: ['ENCH468','ENCH468F'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','CHEM131','CHEM132','CHEM231','CHEM232','CHEM241','CHEM242'],
    goals: ['ENCH437','ENCH444'],
    notes: 'Chem-E BS. Heaviest chem load of the engineering majors — full o-chem + p-chem sequence required.',
  },
  ENMA: {
    id: 'ENMA', college: 'ENG',
    name: 'Materials Science & Engineering',
    programName: 'Materials Science & Engineering',
    eyebrow: 'UMD · Materials Science & Engineering · BS',
    totalCredits: 124,
    coreCodes: [
      'ENES100','ENMA150','ENMA300','ENMA310','ENMA362','ENMA461','ENMA460','ENMA462','ENMA464','ENMA471','ENMA481','ENMA490',
    ],
    upperElectiveCodes: ['ENMA465','ENMA470','ENMA482'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH246','PHYS161','PHYS260','PHYS261','CHEM131','CHEM132','CHEM231'],
    goals: ['ENMA490'],
    notes: 'BS MSE. Combines metals/ceramics/polymers/electronic materials cores.',
  },
  ENFP: {
    id: 'ENFP', college: 'ENG',
    name: 'Fire Protection Engineering',
    programName: 'Fire Protection Engineering',
    eyebrow: 'UMD · Fire Protection Engineering · BS',
    totalCredits: 124,
    coreCodes: [
      'ENES100','ENFP250','ENFP312','ENFP320','ENFP410','ENFP411','ENFP415','ENFP420','ENFP440','ENFP461','ENFP426','ENFP489I',
    ],
    upperElectiveCodes: ['ENFP413','ENFP425'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH246','PHYS161','PHYS260','CHEM135'],
    goals: ['ENFP489I'],
    notes: 'Only ABET-accredited FPE BS in the country. Highly employable, narrow path.',
  },

  /* ---------- CMNS (additional) ---------- */
  BCHM: {
    id: 'BCHM', college: 'CMNS',
    name: 'Biochemistry',
    programName: 'Biochemistry',
    eyebrow: 'UMD · Biochemistry · BS',
    totalCredits: 120,
    coreCodes: [
      'BSCI170','BSCI171','BSCI222','BCHM461','BCHM462','BCHM463','BCHM464','BCHM465',
    ],
    upperElectiveCodes: ['BCHM485','BSCI410'],
    supportCodes: ['CHEM131','CHEM132','CHEM231','CHEM232','CHEM241','CHEM242','CHEM271','CHEM272','MATH140','MATH141','PHYS141','PHYS142'],
    goals: ['BCHM465'],
    notes: 'BS Biochemistry. Heavy chem + bio overlap — prepares well for med school / grad school.',
  },
  NEUR: {
    id: 'NEUR', college: 'CMNS',
    name: 'Neuroscience',
    programName: 'Neuroscience',
    eyebrow: 'UMD · Neuroscience · BS',
    totalCredits: 120,
    coreCodes: [
      'NEUR200','NEUR305','NEUR306','NEUR405','BSCI170','BSCI171','BSCI222','PSYC100','PSYC301',
    ],
    upperElectiveCodes: ['NEUR479','PSYC414','PSYC417'],
    supportCodes: ['CHEM131','CHEM132','CHEM231','MATH140','STAT100','PHYS121'],
    goals: ['NEUR405'],
    notes: 'BS Neuroscience. Cross-listed with biology + psychology; pick lab or computational track.',
  },
  AOSC: {
    id: 'AOSC', college: 'CMNS',
    name: 'Atmospheric & Oceanic Science',
    programName: 'Atmospheric & Oceanic Science',
    eyebrow: 'UMD · Atmospheric & Oceanic Science · BS',
    totalCredits: 120,
    coreCodes: [
      'AOSC123','AOSC200','AOSC400','AOSC401','AOSC424','AOSC431','AOSC445','AOSC470',
    ],
    upperElectiveCodes: ['AOSC432','AOSC447'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','PHYS261','CHEM131'],
    goals: ['AOSC445'],
    notes: 'BS AOSC — meteorology + oceanography. Heavy math and physics support load.',
  },
  GEOL: {
    id: 'GEOL', college: 'CMNS',
    name: 'Geology',
    programName: 'Geology',
    eyebrow: 'UMD · Geology · BS',
    totalCredits: 120,
    coreCodes: [
      'GEOL100','GEOL110','GEOL322','GEOL331','GEOL340','GEOL341','GEOL452','GEOL393','GEOL460','GEOL453',
    ],
    upperElectiveCodes: ['GEOL412','GEOL435','GEOL451'],
    supportCodes: ['MATH140','MATH141','CHEM131','CHEM132','PHYS121','PHYS122'],
    goals: ['GEOL453'],
    notes: 'BS Geology. Field camp (GEOL 393/394) is a junior-year summer requirement.',
  },
  GEOG: {
    id: 'GEOG', college: 'BSOS',
    name: 'Geographical Sciences',
    programName: 'Geographical Sciences',
    eyebrow: 'UMD · Geographical Sciences · BS',
    totalCredits: 120,
    coreCodes: [
      'GEOG201','GEOG202','GEOG211','GEOG212','GEOG301','GEOG306','GEOG372','GEOG470','GEOG498I',
    ],
    upperElectiveCodes: ['GEOG373','GEOG423','GEOG432'],
    supportCodes: ['STAT100','MATH130'],
    goals: ['GEOG498I'],
    notes: 'BS Geographical Sciences. GIS, remote sensing, and environmental tracks share most of the core.',
  },

  /* ---------- BUSINESS (additional) ---------- */
  MGMT: {
    id: 'MGMT', college: 'BMGT',
    name: 'Management & Organization',
    programName: 'Business — Management',
    eyebrow: 'UMD · Business Management · BS',
    totalCredits: 120,
    coreCodes: [
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289B','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380','BMGT365','BMGT463','BMGT466','BMGT496',
    ],
    upperElectiveCodes: ['BMGT467','BMGT468Z'],
    supportCodes: ['ECON200','ECON201','MATH220'],
    goals: ['BMGT496'],
    notes: 'Smith Business — Management & Organization track.',
  },
  SCM: {
    id: 'SCM', college: 'BMGT',
    name: 'Supply Chain Management',
    programName: 'Business — Supply Chain Management',
    eyebrow: 'UMD · Business Supply Chain Management · BS',
    totalCredits: 120,
    coreCodes: [
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289B','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380','BMGT370','BMGT372','BMGT475','BMGT496',
    ],
    upperElectiveCodes: ['BMGT473','BMGT476'],
    supportCodes: ['ECON200','ECON201','MATH220'],
    goals: ['BMGT475','BMGT496'],
    notes: 'Smith Business — SCM track. Operations + logistics-heavy.',
  },

  /* ---------- BSOS (additional) ---------- */
  HESP: {
    id: 'HESP', college: 'BSOS',
    name: 'Hearing & Speech Sciences',
    programName: 'Hearing & Speech Sciences',
    eyebrow: 'UMD · Hearing & Speech Sciences · BA',
    totalCredits: 120,
    coreCodes: [
      'HESP120','HESP202','HESP300','HESP311','HESP400','HESP402','HESP411','HESP420','HESP489',
    ],
    upperElectiveCodes: ['HESP406','HESP417','HESP422'],
    supportCodes: ['PSYC100','BSCI201','STAT100','LING200'],
    goals: ['HESP489'],
    notes: 'BA Hearing & Speech. Pre-grad-school for SLP / audiology — clinical observation in junior/senior year.',
  },
  AAST: {
    id: 'AAST', college: 'BSOS',
    name: 'African American Studies',
    programName: 'African American Studies',
    eyebrow: 'UMD · African American Studies · BA',
    totalCredits: 120,
    coreCodes: [
      'AASP100','AASP202','AASP211','AASP301','AASP400','AASP401','AASP411',
    ],
    upperElectiveCodes: ['AASP320','AASP443'],
    supportCodes: ['HIST200','SOCY100'],
    goals: ['AASP401'],
    notes: 'BA AASP. Interdisciplinary across history, sociology, literature, and policy.',
  },

  /* ---------- ARHU (additional) ---------- */
  LING: {
    id: 'LING', college: 'ARHU',
    name: 'Linguistics',
    programName: 'Linguistics',
    eyebrow: 'UMD · Linguistics · BA',
    totalCredits: 120,
    coreCodes: [
      'LING200','LING240','LING311','LING321','LING322','LING330','LING420','LING444',
    ],
    upperElectiveCodes: ['LING410','LING419B','LING440'],
    supportCodes: ['PHIL170','STAT100'],
    goals: ['LING444'],
    notes: 'BA Linguistics. Strong overlap with cognitive science + computer science.',
  },
  SPAN: {
    id: 'SPAN', college: 'ARHU',
    name: 'Spanish Language & Cultures',
    programName: 'Spanish',
    eyebrow: 'UMD · Spanish · BA',
    totalCredits: 120,
    fixedSchedule: typeof SCHEDULE_SPAN !== 'undefined' ? SCHEDULE_SPAN : null,
    coreCodes: [
      'SPAN203','SPAN204','SPAN301','SPAN303','SPAN325','SPAN401','SPAN408K',
    ],
    upperElectiveCodes: ['SPAN363','SPAN450','SPAN470'],
    supportCodes: ['ENGL101'],
    goals: ['SPAN408K'],
    notes: 'BA Spanish. Heritage / non-heritage tracks differ in lower-division placement.',
  },
  THET: {
    id: 'THET', college: 'ARHU',
    name: 'Theatre',
    programName: 'Theatre',
    eyebrow: 'UMD · Theatre · BA',
    totalCredits: 120,
    coreCodes: [
      'THET110','THET120','THET116','THET222','THET223','THET274','THET330','THET371','THET489P',
    ],
    upperElectiveCodes: ['THET408W','THET447','THET477'],
    supportCodes: ['ENGL101'],
    goals: ['THET489P'],
    notes: 'BA Theatre. Performance / design / stage management tracks share most of the core.',
  },
  MUSC: {
    id: 'MUSC', college: 'ARHU',
    name: 'Music',
    programName: 'Music',
    eyebrow: 'UMD · Music · BA',
    totalCredits: 120,
    coreCodes: [
      'MUSC210','MUSC150','MUSC151','MUSC250','MUSC251','MUSC330','MUSC310','MUSC450',
    ],
    upperElectiveCodes: ['MUSC448C','MUSC443'],
    supportCodes: ['ENGL101'],
    goals: ['MUSC450'],
    notes: 'BA Music — non-performance track. Music Education / Performance are separate BMus paths.',
  },
  ARTT: {
    id: 'ARTT', college: 'ARHU',
    name: 'Studio Art',
    programName: 'Studio Art',
    eyebrow: 'UMD · Studio Art · BA',
    totalCredits: 120,
    coreCodes: [
      'ARTT100','ARTT110','ARTT150','ARTT200','ARTT210','ARTT255','ARTT320','ARTT489C',
    ],
    upperElectiveCodes: ['ARTT418','ARTT428','ARTT458'],
    supportCodes: ['ARTH200'],
    goals: ['ARTT489C'],
    notes: 'BA Studio Art. Concentrations: drawing, painting, sculpture, digital media, printmaking.',
  },
  CINE: {
    id: 'CINE', college: 'ARHU',
    name: 'Cinema & Media Studies',
    programName: 'Cinema & Media Studies',
    eyebrow: 'UMD · Cinema & Media Studies · BA',
    totalCredits: 120,
    coreCodes: [
      'CINE245','CINE280','CINE301','CINE302','CINE411','CINE469M',
    ],
    upperElectiveCodes: ['CINE344','CINE385'],
    supportCodes: ['ENGL101'],
    goals: ['CINE469M'],
    notes: 'BA Cinema & Media Studies. Critical / production hybrid; less focused on filmmaking than peer programs.',
  },
  WMST: {
    id: 'WMST', college: 'ARHU',
    name: 'Women, Gender, & Sexuality Studies',
    programName: 'Women, Gender, & Sexuality Studies',
    eyebrow: 'UMD · Women, Gender, & Sexuality Studies · BA',
    totalCredits: 120,
    coreCodes: [
      'WMST200','WMST250','WMST300','WMST488B','WMST498Q',
    ],
    upperElectiveCodes: ['WMST314','WMST452','WMST471'],
    supportCodes: ['SOCY100','PSYC100'],
    goals: ['WMST498Q'],
    notes: 'BA WGSS. Highly interdisciplinary; courses cross-list with HIST, SOCY, ENGL, AASP.',
  },
  AMST: {
    id: 'AMST', college: 'ARHU',
    name: 'American Studies',
    programName: 'American Studies',
    eyebrow: 'UMD · American Studies · BA',
    totalCredits: 120,
    coreCodes: [
      'AMST202','AMST205','AMST260','AMST340','AMST450','AMST498A',
    ],
    upperElectiveCodes: ['AMST328C','AMST398','AMST428P'],
    supportCodes: ['ENGL101','HIST200'],
    goals: ['AMST498A'],
    notes: 'BA American Studies. Material culture, popular culture, and US history strands.',
  },

  /* ---------- EDUCATION ---------- */
  EDUC: {
    id: 'EDUC', college: 'EDUC',
    name: 'Elementary Education',
    programName: 'Elementary Education',
    eyebrow: 'UMD · Elementary Education · BS',
    totalCredits: 120,
    coreCodes: [
      'EDCI210','EDHD413','EDHD420','EDCI322','EDCI352','EDCI372','EDCI397','EDCI488R',
    ],
    upperElectiveCodes: ['EDCI461','EDPS301'],
    supportCodes: ['MATH212','MATH213','BSCI170','PSYC100'],
    goals: ['EDCI488R'],
    notes: 'BS Elementary Education. Junior-year admission to the program; senior year is full-day student teaching.',
  },

  /* ---------- PUBLIC HEALTH (additional) ---------- */
  HLTH: {
    id: 'HLTH', college: 'PUBH',
    name: 'Community Health',
    programName: 'Community Health',
    eyebrow: 'UMD · Community Health · BS',
    totalCredits: 120,
    coreCodes: [
      'HLTH140','HLTH200','HLTH230','HLTH285','HLTH377','HLTH471','HLTH476','HLTH498L','HLTH490',
    ],
    upperElectiveCodes: ['HLTH302','HLTH410','HLTH460'],
    supportCodes: ['PSYC100','BSCI170','STAT100'],
    goals: ['HLTH490'],
    notes: 'BS Community Health. Internship + capstone in senior year. Pre-CHES certification track.',
  },

  /* ---------- AGNR (additional) ---------- */
  ANSC: {
    id: 'ANSC', college: 'AGNR',
    name: 'Animal Sciences',
    programName: 'Animal Sciences',
    eyebrow: 'UMD · Animal Sciences · BS',
    totalCredits: 120,
    coreCodes: [
      'ANSC101','ANSC204','ANSC212','ANSC227','ANSC314','ANSC327','ANSC410','ANSC447',
    ],
    upperElectiveCodes: ['ANSC417','ANSC444','ANSC453'],
    supportCodes: ['BSCI170','BSCI171','CHEM131','CHEM132','CHEM231','MATH130','STAT100'],
    goals: ['ANSC447'],
    notes: 'BS Animal Sciences. Pre-vet, equine, lab animal, and dairy/meat industry tracks share core.',
  },
  ENST: {
    id: 'ENST', college: 'AGNR',
    name: 'Environmental Science & Technology',
    programName: 'Environmental Science & Technology',
    eyebrow: 'UMD · Environmental Science & Technology · BS',
    totalCredits: 120,
    coreCodes: [
      'ENST200','ENST233','ENST301','ENST303','ENST388','ENST471','ENST499',
    ],
    upperElectiveCodes: ['ENST405','ENST422','ENST453'],
    supportCodes: ['BSCI170','BSCI171','CHEM131','CHEM132','MATH130','STAT100','GEOL100'],
    goals: ['ENST499'],
    notes: 'BS ENST. Soil/water/ecosystem/restoration science focus.',
  },
  AREC: {
    id: 'AREC', college: 'AGNR',
    name: 'Agricultural & Resource Economics',
    programName: 'Agricultural & Resource Economics',
    eyebrow: 'UMD · Agricultural & Resource Economics · BS',
    totalCredits: 120,
    coreCodes: [
      'AREC200','AREC240','AREC306','AREC326','AREC365','AREC422','AREC453','AREC489L',
    ],
    upperElectiveCodes: ['AREC435','AREC445','AREC456'],
    supportCodes: ['MATH140','MATH141','STAT400','ECON200','ECON201'],
    goals: ['AREC489L'],
    notes: 'BS AREC. Sister program to ECON with heavier policy + applied econometrics emphasis.',
  },
  PLSC: {
    id: 'PLSC', college: 'AGNR',
    name: 'Plant Sciences',
    programName: 'Plant Sciences',
    eyebrow: 'UMD · Plant Sciences · BS',
    totalCredits: 120,
    coreCodes: [
      'PLSC101','PLSC201','PLSC303','PLSC205','PLSC271','PLSC411','PLSC476','PLSC489B',
    ],
    upperElectiveCodes: ['PLSC453','PLSC471'],
    supportCodes: ['BSCI170','BSCI171','CHEM131','CHEM132','CHEM231','MATH130','STAT100'],
    goals: ['PLSC489B'],
    notes: 'BS Plant Sciences. Horticulture / urban agriculture / plant biology specializations.',
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

// True when a major ships with a curated 4-year schedule (CE default or
// any template with a fixedSchedule array). Auto-gen-only majors return false.
function isMajorFullyBaked(m) {
  if (!m) return false;
  if (m.useDefaultSchedule) return true;
  if (Array.isArray(m.fixedSchedule) && m.fixedSchedule.length) return true;
  return false;
}

// Display string used in dropdowns. Fully-baked majors get a ★;
// auto-gen majors get a ✱ marker for a generated full-plan draft.
function majorDisplayLabel(m) {
  const star = isMajorFullyBaked(m) ? '★ ' : '✱ ';
  const tail = m.useDefaultSchedule ? ' (curated)' : (m.isCustom ? ' (custom)' : '');
  return star + m.name + tail;
}

// Group templates by college so dropdowns can use <optgroup>.
function groupedMajors() {
  const groups = {};
  listMajors().forEach(m => {
    const key = m.college || 'CUSTOM';
    groups[key] = groups[key] || [];
    groups[key].push(m);
  });
  // Stable order: built-in colleges first (in declaration order), then custom
  const order = [...Object.keys(COLLEGES), 'CUSTOM'];
  const out = [];
  order.forEach(k => {
    if (groups[k]) out.push({
      key: k,
      label: k === 'CUSTOM' ? 'Custom Templates' : COLLEGES[k],
      majors: groups[k].sort((a, b) => a.name.localeCompare(b.name)),
    });
  });
  return out;
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

function majorOfficialSources(majorOrId, opts = {}) {
  const tpl = typeof majorOrId === 'string'
    ? getMajorTemplate(majorOrId)
    : majorOrId;
  const id = String(tpl?.id || majorOrId || '').trim().toUpperCase();
  const targetYear = typeof normalizeCatalogYear === 'function'
    ? normalizeCatalogYear(opts.catalogYear || (typeof getSettings === 'function' ? getSettings().catalogYear : UMD_CATALOG_YEAR))
    : (opts.catalogYear || UMD_CATALOG_YEAR);
  const isCurrentCatalog = targetYear === UMD_CATALOG_YEAR;
  const sourceMeta = {
    year: UMD_CATALOG_YEAR,
    sourceYear: UMD_CATALOG_YEAR,
    targetYear,
    isCurrentCatalog,
    checkedAt: UMD_CATALOG_CHECKED_AT,
  };
  const links = [];
  const source = MAJOR_CATALOG_SOURCES[id];
  if (source && source.path) {
    links.push({
      label: source.label || 'UMD Catalog major',
      url: `${UMD_CATALOG_ORIGIN}${source.path}`,
      kind: 'major-catalog',
      ...sourceMeta,
    });
  }
  if (opts.includeGeneral !== false) {
    links.push(
      { label: 'UMD Catalog programs', url: UMD_CATALOG_PROGRAMS_URL, kind: 'catalog-index', ...sourceMeta },
      { label: 'UMD course catalog', url: UMD_COURSE_CATALOG_URL, kind: 'course-catalog', ...sourceMeta },
    );
  }
  const seen = new Set();
  return links.filter(link => {
    const key = String(link.url || '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
