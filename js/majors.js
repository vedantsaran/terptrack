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
      'ENEE303','ENEE324','ENEE350','ENEE380','ENEE381','ENEE408',
    ],
    upperElectiveCodes: ['ENEE436','ENEE439','ENEE459','ENEE475','ENEE429'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','PHYS261','CHEM135'],
    goals: ['ENEE408','ENEE436'],
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
      'ENAE100','ENAE201','ENAE202','ENAE283','ENAE301','ENAE302','ENAE311','ENAE324','ENAE362','ENAE371',
      'ENAE403','ENAE414','ENAE432','ENAE451','ENAE452',
    ],
    upperElectiveCodes: ['ENAE423','ENAE441','ENAE464','ENAE488'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','PHYS261','CHEM135'],
    goals: ['ENAE451','ENAE452'],
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
      'ENCE201','ENCE202','ENCE215','ENCE300','ENCE302','ENCE320','ENCE330','ENCE340','ENCE350',
      'ENCE362','ENCE410','ENCE420','ENCE489',
    ],
    upperElectiveCodes: ['ENCE466','ENCE471'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','CHEM135'],
    goals: ['ENCE489'],
    notes: 'Pick a track: structures, transportation, geotech, environmental, or water resources.',
  },
  BIOE: {
    id: 'BIOE', college: 'ENG',
    name: 'Bioengineering',
    programName: 'Bioengineering',
    eyebrow: 'UMD · Bioengineering · BS',
    totalCredits: 126,
    coreCodes: [
      'ENES100','BIOE120','BIOE241','BIOE241L','BIOE331','BIOE332','BIOE371','BIOE372','BIOE385','BIOE441','BIOE451','BIOE452',
    ],
    upperElectiveCodes: ['BIOE419','BIOE438','BIOE489'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','CHEM131','CHEM132','CHEM231','CHEM232','BSCI170','BSCI171'],
    goals: ['BIOE451','BIOE452'],
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
    upperElectiveCodes: ['STAT426','STAT436','STAT470'],
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
      'CHEM271','CHEM272','CHEM403','CHEM404','CHEM441',
    ],
    upperElectiveCodes: ['CHEM425','CHEM481','CHEM498'],
    supportCodes: ['MATH140','MATH141','MATH246','PHYS161','PHYS260','PHYS261'],
    goals: ['CHEM441','CHEM498'],
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
      'PHYS401','PHYS402','PHYS404','PHYS411','PHYS412','PHYS499',
    ],
    upperElectiveCodes: ['PHYS405','PHYS429','PHYS441'],
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
      'ASTR120','ASTR220','ASTR300','ASTR310','ASTR320','ASTR340','ASTR398','ASTR499',
      'PHYS161','PHYS260','PHYS261','PHYS373','PHYS401','PHYS411',
    ],
    upperElectiveCodes: ['ASTR405','ASTR450'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','CMSC131'],
    goals: ['ASTR499'],
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
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380',
      'BMGT343','BMGT440','BMGT443','BMGT446','BMGT496',
    ],
    upperElectiveCodes: ['BMGT449','BMGT445','BMGT442'],
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
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380',
      'BMGT451','BMGT452','BMGT454','BMGT457','BMGT496',
    ],
    upperElectiveCodes: ['BMGT458','BMGT459'],
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
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380',
      'BMGT321','BMGT322','BMGT323','BMGT326','BMGT417','BMGT496',
    ],
    upperElectiveCodes: ['BMGT411','BMGT421'],
    supportCodes: ['ECON200','ECON201','MATH220'],
    goals: ['BMGT322','BMGT417'],
    notes: 'Smith Business — Accounting track. CPA-eligible coursework includes audit + tax + cost.',
  },
  IS: {
    id: 'IS', college: 'BMGT',
    name: 'Information Systems',
    programName: 'Business — Information Systems',
    eyebrow: 'UMD · Business Information Systems · BS',
    totalCredits: 120,
    coreCodes: [
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380',
      'BUSI430','BUSI431','BUSI432','BUSI433','BMGT496',
    ],
    upperElectiveCodes: ['BUSI434','BUSI446'],
    supportCodes: ['ECON200','ECON201','MATH220','CMSC131'],
    goals: ['BUSI432','BMGT496'],
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
    coreCodes: [
      'SOCY100','SOCY105','SOCY201','SOCY202','SOCY441','SOCY498',
    ],
    upperElectiveCodes: ['SOCY410','SOCY423','SOCY425','SOCY465'],
    supportCodes: ['STAT100'],
    goals: ['SOCY498'],
    notes: 'BA Sociology. SOCY 201 (stats) + 202 (methods) gateway must be passed before 4xx work.',
  },
  ANTH: {
    id: 'ANTH', college: 'BSOS',
    name: 'Anthropology',
    programName: 'Anthropology',
    eyebrow: 'UMD · Anthropology · BA',
    totalCredits: 120,
    coreCodes: [
      'ANTH220','ANTH240','ANTH260','ANTH298','ANTH401','ANTH497',
    ],
    upperElectiveCodes: ['ANTH415','ANTH445','ANTH462'],
    supportCodes: ['STAT100'],
    goals: ['ANTH497'],
    notes: 'BA Anthropology. Four-field intro covers cultural, archaeology, biological, linguistic.',
  },

  /* ---------- ARHU (Arts & Humanities) ---------- */
  ENGL: {
    id: 'ENGL', college: 'ARHU',
    name: 'English',
    programName: 'English',
    eyebrow: 'UMD · English · BA',
    totalCredits: 120,
    coreCodes: [
      'ENGL201','ENGL301','ENGL311','ENGL312','ENGL313','ENGL402','ENGL498',
    ],
    upperElectiveCodes: ['ENGL379','ENGL433','ENGL437','ENGL488'],
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
    coreCodes: [
      'HIST200','HIST201','HIST208','HIST209','HIST407','HIST408',
    ],
    upperElectiveCodes: ['HIST319','HIST405','HIST429','HIST462'],
    supportCodes: [],
    goals: ['HIST408'],
    notes: 'BA History. HIST 200/201 are the methods gateway; HIST 408 is senior research seminar.',
  },
  PHIL: {
    id: 'PHIL', college: 'ARHU',
    name: 'Philosophy',
    programName: 'Philosophy',
    eyebrow: 'UMD · Philosophy · BA',
    totalCredits: 120,
    coreCodes: [
      'PHIL170','PHIL250','PHIL310','PHIL320','PHIL330','PHIL370','PHIL498',
    ],
    upperElectiveCodes: ['PHIL360','PHIL427','PHIL456'],
    supportCodes: [],
    goals: ['PHIL498'],
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
      'ARTH100','ARTH200','ARTH201','ARTH250','ARTH320','ARTH488','ARTH489',
    ],
    upperElectiveCodes: ['ARTH354','ARTH418','ARTH443'],
    supportCodes: [],
    goals: ['ARTH489'],
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
      'PHSC100','PHSC300','PHSC301','PHSC401','PHSC402','BSCI170','BSCI223','EPIB315','PHSC498',
    ],
    upperElectiveCodes: ['PHSC420','PHSC450','PHSC470'],
    supportCodes: ['BSCI171','CHEM131','CHEM132','MATH130','STAT100'],
    goals: ['PHSC498'],
    notes: 'BS PHSC at the Universities at Shady Grove. Heavy bio + chem support.',
  },
  KNES: {
    id: 'KNES', college: 'PUBH',
    name: 'Kinesiology',
    programName: 'Kinesiology',
    eyebrow: 'UMD · Kinesiology · BS',
    totalCredits: 120,
    coreCodes: [
      'KNES157','KNES287','KNES289','KNES293','KNES350','KNES360','KNES385','KNES450',
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
      'FMSC105','FMSC110','FMSC260','FMSC290','FMSC330','FMSC332','FMSC381','FMSC487','FMSC498',
    ],
    upperElectiveCodes: ['FMSC430','FMSC447'],
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
      'NFSC100','NFSC112','NFSC315','NFSC340','NFSC421','NFSC430','NFSC440','NFSC451',
    ],
    upperElectiveCodes: ['NFSC453','NFSC470'],
    supportCodes: ['BSCI170','BSCI171','BSCI222','CHEM131','CHEM132','CHEM231','CHEM232','CHEM271','CHEM272'],
    goals: ['NFSC451'],
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
      'ARCH170','ARCH171','ARCH220','ARCH221','ARCH222','ARCH320','ARCH321','ARCH400','ARCH401','ARCH402','ARCH478',
    ],
    upperElectiveCodes: ['ARCH408','ARCH418','ARCH452'],
    supportCodes: ['PHYS121','MATH140'],
    goals: ['ARCH478'],
    notes: 'BA Architecture (4-yr). M.Arch is the accredited path; BA is pre-professional.',
  },

  /* ---------- JOUR ---------- */
  JOUR: {
    id: 'JOUR', college: 'JOUR',
    name: 'Journalism',
    programName: 'Journalism',
    eyebrow: 'UMD · Journalism · BA',
    totalCredits: 120,
    coreCodes: [
      'JOUR175','JOUR200','JOUR201','JOUR202','JOUR320','JOUR352','JOUR353','JOUR402','JOUR456','JOUR499',
    ],
    upperElectiveCodes: ['JOUR450','JOUR451','JOUR458'],
    supportCodes: ['ENGL101','STAT100'],
    goals: ['JOUR499'],
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
      'ENES100','ENCH215','ENCH222','ENCH250','ENCH300','ENCH333','ENCH400','ENCH422','ENCH427','ENCH437','ENCH442','ENCH444',
    ],
    upperElectiveCodes: ['ENCH468','ENCH485'],
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
      'ENES100','ENMA150','ENMA300','ENMA310','ENMA362','ENMA371','ENMA460','ENMA462','ENMA464','ENMA471','ENMA481','ENMA489',
    ],
    upperElectiveCodes: ['ENMA465','ENMA470','ENMA483'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH246','PHYS161','PHYS260','PHYS261','CHEM131','CHEM132','CHEM231'],
    goals: ['ENMA489'],
    notes: 'BS MSE. Combines metals/ceramics/polymers/electronic materials cores.',
  },
  ENFP: {
    id: 'ENFP', college: 'ENG',
    name: 'Fire Protection Engineering',
    programName: 'Fire Protection Engineering',
    eyebrow: 'UMD · Fire Protection Engineering · BS',
    totalCredits: 124,
    coreCodes: [
      'ENES100','ENFP251','ENFP312','ENFP320','ENFP410','ENFP411','ENFP415','ENFP421','ENFP422','ENFP424','ENFP426','ENFP489',
    ],
    upperElectiveCodes: ['ENFP413','ENFP425'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH246','PHYS161','PHYS260','CHEM135'],
    goals: ['ENFP489'],
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
    upperElectiveCodes: ['BCHM485','BCHM499'],
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
      'NEUR240','NEUR321','NEUR322','NEUR400','BSCI170','BSCI171','BSCI222','PSYC100','PSYC301',
    ],
    upperElectiveCodes: ['NEUR410','NEUR430','NEUR485'],
    supportCodes: ['CHEM131','CHEM132','CHEM231','MATH140','STAT100','PHYS121'],
    goals: ['NEUR400'],
    notes: 'BS Neuroscience. Cross-listed with biology + psychology; pick lab or computational track.',
  },
  AOSC: {
    id: 'AOSC', college: 'CMNS',
    name: 'Atmospheric & Oceanic Science',
    programName: 'Atmospheric & Oceanic Science',
    eyebrow: 'UMD · Atmospheric & Oceanic Science · BS',
    totalCredits: 120,
    coreCodes: [
      'AOSC123','AOSC200','AOSC400','AOSC401','AOSC424','AOSC431','AOSC444','AOSC470',
    ],
    upperElectiveCodes: ['AOSC410','AOSC447'],
    supportCodes: ['MATH140','MATH141','MATH240','MATH241','MATH246','PHYS161','PHYS260','PHYS261','CHEM131'],
    goals: ['AOSC444'],
    notes: 'BS AOSC — meteorology + oceanography. Heavy math and physics support load.',
  },
  GEOL: {
    id: 'GEOL', college: 'CMNS',
    name: 'Geology',
    programName: 'Geology',
    eyebrow: 'UMD · Geology · BS',
    totalCredits: 120,
    coreCodes: [
      'GEOL100','GEOL110','GEOL322','GEOL331','GEOL340','GEOL341','GEOL388','GEOL393','GEOL394','GEOL494',
    ],
    upperElectiveCodes: ['GEOL412','GEOL435','GEOL451'],
    supportCodes: ['MATH140','MATH141','CHEM131','CHEM132','PHYS121','PHYS122'],
    goals: ['GEOL494'],
    notes: 'BS Geology. Field camp (GEOL 393/394) is a junior-year summer requirement.',
  },
  GEOG: {
    id: 'GEOG', college: 'BSOS',
    name: 'Geographical Sciences',
    programName: 'Geographical Sciences',
    eyebrow: 'UMD · Geographical Sciences · BS',
    totalCredits: 120,
    coreCodes: [
      'GEOG201','GEOG202','GEOG211','GEOG212','GEOG305','GEOG306','GEOG370','GEOG470','GEOG498',
    ],
    upperElectiveCodes: ['GEOG373','GEOG423','GEOG432'],
    supportCodes: ['STAT100','MATH130'],
    goals: ['GEOG498'],
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
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380','BMGT365','BMGT460','BMGT466','BMGT496',
    ],
    upperElectiveCodes: ['BMGT462','BMGT467'],
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
      'BMGT110','BMGT220','BMGT221','BMGT230','BMGT289','BMGT340','BMGT350','BMGT364','BMGT367','BMGT380','BMGT370','BMGT372','BMGT475','BMGT496',
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
    upperElectiveCodes: ['HESP406','HESP427','HESP437'],
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
      'AASP100','AASP201','AASP298','AASP301','AASP397','AASP401','AASP498',
    ],
    upperElectiveCodes: ['AASP422','AASP443'],
    supportCodes: ['HIST200','SOCY100'],
    goals: ['AASP498'],
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
      'LING200','LING240','LING311','LING321','LING322','LING330','LING422','LING488',
    ],
    upperElectiveCodes: ['LING410','LING412','LING440'],
    supportCodes: ['PHIL170','STAT100'],
    goals: ['LING488'],
    notes: 'BA Linguistics. Strong overlap with cognitive science + computer science.',
  },
  SPAN: {
    id: 'SPAN', college: 'ARHU',
    name: 'Spanish Language & Cultures',
    programName: 'Spanish',
    eyebrow: 'UMD · Spanish · BA',
    totalCredits: 120,
    coreCodes: [
      'SPAN203','SPAN204','SPAN301','SPAN303','SPAN325','SPAN401','SPAN488',
    ],
    upperElectiveCodes: ['SPAN345','SPAN450','SPAN470'],
    supportCodes: ['ENGL101'],
    goals: ['SPAN488'],
    notes: 'BA Spanish. Heritage / non-heritage tracks differ in lower-division placement.',
  },
  THET: {
    id: 'THET', college: 'ARHU',
    name: 'Theatre',
    programName: 'Theatre',
    eyebrow: 'UMD · Theatre · BA',
    totalCredits: 120,
    coreCodes: [
      'THET110','THET120','THET170','THET171','THET220','THET279','THET330','THET355','THET490',
    ],
    upperElectiveCodes: ['THET418','THET447','THET479'],
    supportCodes: ['ENGL101'],
    goals: ['THET490'],
    notes: 'BA Theatre. Performance / design / stage management tracks share most of the core.',
  },
  MUSC: {
    id: 'MUSC', college: 'ARHU',
    name: 'Music',
    programName: 'Music',
    eyebrow: 'UMD · Music · BA',
    totalCredits: 120,
    coreCodes: [
      'MUSC110','MUSC150','MUSC151','MUSC250','MUSC251','MUSC330','MUSC331','MUSC450',
    ],
    upperElectiveCodes: ['MUSC419','MUSC448'],
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
      'ARTT100','ARTT110','ARTT150','ARTT200','ARTT210','ARTT250','ARTT320','ARTT489',
    ],
    upperElectiveCodes: ['ARTT418','ARTT428','ARTT458'],
    supportCodes: ['ARTH200'],
    goals: ['ARTT489'],
    notes: 'BA Studio Art. Concentrations: drawing, painting, sculpture, digital media, printmaking.',
  },
  CINE: {
    id: 'CINE', college: 'ARHU',
    name: 'Cinema & Media Studies',
    programName: 'Cinema & Media Studies',
    eyebrow: 'UMD · Cinema & Media Studies · BA',
    totalCredits: 120,
    coreCodes: [
      'CINE110','CINE220','CINE330','CINE395','CINE427','CINE498',
    ],
    upperElectiveCodes: ['CINE344','CINE389'],
    supportCodes: ['ENGL101'],
    goals: ['CINE498'],
    notes: 'BA Cinema & Media Studies. Critical / production hybrid; less focused on filmmaking than peer programs.',
  },
  WMST: {
    id: 'WMST', college: 'ARHU',
    name: 'Women, Gender, & Sexuality Studies',
    programName: 'Women, Gender, & Sexuality Studies',
    eyebrow: 'UMD · Women, Gender, & Sexuality Studies · BA',
    totalCredits: 120,
    coreCodes: [
      'WMST200','WMST250','WMST301','WMST488','WMST498',
    ],
    upperElectiveCodes: ['WMST314','WMST450','WMST463'],
    supportCodes: ['SOCY100','PSYC100'],
    goals: ['WMST498'],
    notes: 'BA WGSS. Highly interdisciplinary; courses cross-list with HIST, SOCY, ENGL, AASP.',
  },
  AMST: {
    id: 'AMST', college: 'ARHU',
    name: 'American Studies',
    programName: 'American Studies',
    eyebrow: 'UMD · American Studies · BA',
    totalCredits: 120,
    coreCodes: [
      'AMST201','AMST205','AMST260','AMST330','AMST450','AMST498',
    ],
    upperElectiveCodes: ['AMST329','AMST398','AMST428'],
    supportCodes: ['ENGL101','HIST200'],
    goals: ['AMST498'],
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
      'EDUC100','EDHD413','EDHD420','EDCI416','EDCI417','EDCI418','EDCI419','EDCI488',
    ],
    upperElectiveCodes: ['EDCI487','EDPS301'],
    supportCodes: ['MATH210','MATH211','BSCI170','PSYC100'],
    goals: ['EDCI488'],
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
      'HLTH140','HLTH200','HLTH230','HLTH285','HLTH377','HLTH471','HLTH476','HLTH485','HLTH490',
    ],
    upperElectiveCodes: ['HLTH320','HLTH410','HLTH456'],
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
      'ANSC101','ANSC203','ANSC212','ANSC227','ANSC301','ANSC305','ANSC411','ANSC447',
    ],
    upperElectiveCodes: ['ANSC412','ANSC444','ANSC453'],
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
      'AREC200','AREC240','AREC306','AREC326','AREC365','AREC410','AREC453','AREC489',
    ],
    upperElectiveCodes: ['AREC435','AREC445','AREC460'],
    supportCodes: ['MATH140','MATH141','STAT400','ECON200','ECON201'],
    goals: ['AREC489'],
    notes: 'BS AREC. Sister program to ECON with heavier policy + applied econometrics emphasis.',
  },
  PLSC: {
    id: 'PLSC', college: 'AGNR',
    name: 'Plant Sciences',
    programName: 'Plant Sciences',
    eyebrow: 'UMD · Plant Sciences · BS',
    totalCredits: 120,
    coreCodes: [
      'PLSC101','PLSC202','PLSC303','PLSC304','PLSC313','PLSC411','PLSC472','PLSC489',
    ],
    upperElectiveCodes: ['PLSC453','PLSC470'],
    supportCodes: ['BSCI170','BSCI171','CHEM131','CHEM132','CHEM231','MATH130','STAT100'],
    goals: ['PLSC489'],
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
