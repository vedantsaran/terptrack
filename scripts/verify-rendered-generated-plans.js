#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { createRequire } = require('module');

const ROOT = path.resolve(__dirname, '..');

const TARGETS = [
  {
    major: 'GEOL',
    name: 'Geology',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'GEOL490', credits: 6, title: 'Geology Field Camp' },
      { code: 'GEOL394', credits: 3, title: 'Geology Senior Thesis II: Research' },
    ],
  },
  {
    major: 'AOSC',
    name: 'Atmospheric & Oceanic Science',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'AOSC498', credits: 3, title: 'Senior Research Project II' },
      { code: 'AOSC493', credits: 3, title: 'Senior Research Project I' },
    ],
  },
  {
    major: 'ASTR',
    name: 'Astronomy',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ASTR498N', credits: 3, title: 'Special Problems in Astronomy; Stellar Evolution' },
      { code: 'ASTR450', credits: 3, title: 'Orbital Dynamics' },
    ],
  },
  {
    major: 'BCHM',
    name: 'Biochemistry',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'BCHM465', credits: 3, title: 'Biochemistry III' },
      { code: 'BCHM485', credits: 3, title: 'Physical Biochemistry' },
    ],
  },
  {
    major: 'NEUR',
    name: 'Neuroscience',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'NEUR405', credits: 4, title: 'Neuroscience Laboratory' },
      { code: 'NEUR479', credits: 1, title: 'Advanced Research in Neuroscience' },
    ],
  },
  {
    major: 'ARCH',
    name: 'Architecture',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ARCH403', credits: 6, title: 'Architecture Design Studio IV' },
      { code: 'ARCH408', credits: 6, title: 'Special Topics Architecture Design Studio' },
    ],
  },
  {
    major: 'EDUC',
    name: 'Elementary Education',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'TLPL489A', credits: 9, title: 'Internship in Education' },
      { code: 'TLPL489B', credits: 2, title: 'Internship in Education' },
    ],
  },
];

const CURATED_TARGETS = [
  {
    major: 'MATH',
    name: 'Mathematics',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'MATH411', credits: 3, title: 'Advanced Calculus II' },
      { code: 'MATH410', credits: 3, title: 'Advanced Calculus I' },
    ],
  },
  {
    major: 'STAT',
    name: 'Statistics',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'STAT420', credits: 3, title: 'Theory and Methods of Statistics' },
      { code: 'STAT430', credits: 3, title: 'Introduction to Statistical Computing with SAS' },
    ],
  },
  {
    major: 'CHEM',
    name: 'Chemistry',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'CHEM441', credits: 3, title: 'Advanced Organic Chemistry' },
      { code: 'CHEM425', credits: 4, title: 'Instrumental Methods of Analysis' },
    ],
  },
  {
    major: 'PHYS',
    name: 'Physics',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'PHYS402', credits: 4, title: 'Quantum Physics II' },
      { code: 'PHYS410', credits: 4, title: 'Classical Mechanics' },
    ],
  },
  {
    major: 'ENGL',
    name: 'English',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ENGL498', credits: 3, title: 'Advanced Fiction Workshop' },
      { code: 'ENGL402', credits: 3, title: 'Chaucer' },
    ],
  },
  {
    major: 'JOUR',
    name: 'Journalism',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'JOUR353', credits: 6, title: 'News Bureau' },
      { code: 'JOUR480', credits: 1, title: 'Capstone Colloquium' },
    ],
  },
  {
    major: 'HIST',
    name: 'History',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'HIST408B', credits: 3, title: 'Senior Seminar' },
      { code: 'HIST407', credits: 3, title: 'Technology and Social Change' },
    ],
  },
  {
    major: 'SOCY',
    name: 'Sociology',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'SOCY202', credits: 4, title: 'Research Methods' },
      { code: 'SOCY498C', credits: 3, title: 'Sociology of Culture' },
    ],
  },
  {
    major: 'SPAN',
    name: 'Spanish Language & Cultures',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'SPAN408K', credits: 3, title: 'Women Writers' },
      { code: 'SPAN401', credits: 3, title: 'Advanced Composition I' },
    ],
  },
  {
    major: 'PHIL',
    name: 'Philosophy',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'PHIL408R', credits: 3, title: 'Practice of Philosophy' },
      { code: 'PHIL370', credits: 3, title: 'Logical Theory I' },
    ],
  },
  {
    major: 'ARTH',
    name: 'Art History',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ARTH489K', credits: 3, title: 'Art and the Museum World' },
      { code: 'ARTH488K', credits: 3, title: 'Museum World' },
    ],
  },
  {
    major: 'LING',
    name: 'Linguistics',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'LING444', credits: 3, title: 'Child Language Acquisition' },
      { code: 'LING311', credits: 3, title: 'Syntax I' },
    ],
  },
  {
    major: 'THET',
    name: 'Theatre',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'THET489P', credits: 3, title: 'History of Shakespeare in Performance' },
      { code: 'THET371', credits: 3, title: 'Scenic Design I' },
    ],
  },
  {
    major: 'MUSC',
    name: 'Music',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'MUSC450', credits: 3, title: 'Musical Form' },
      { code: 'MUSC251', credits: 4, title: 'Advanced Theory of Music II' },
    ],
  },
  {
    major: 'ARTT',
    name: 'Studio Art',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ARTT489C', credits: 3, title: 'Markets and Collecting' },
      { code: 'ARTT428', credits: 3, title: 'Advanced Painting' },
    ],
  },
  {
    major: 'CINE',
    name: 'Cinema & Media Studies',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'CINE469M', credits: 3, title: 'Methods and Issues' },
      { code: 'CINE411', credits: 3, title: 'Experimental Film' },
    ],
  },
  {
    major: 'WMST',
    name: 'Women, Gender, & Sexuality Studies',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'WMST498Q', credits: 3, title: 'Gender and Politics' },
      { code: 'WMST488B', credits: 3, title: 'Health Inequality' },
    ],
  },
  {
    major: 'AMST',
    name: 'American Studies',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'AMST498A', credits: 3, title: 'Border Crossings' },
      { code: 'AMST450', credits: 3, title: 'Seminar in American Studies' },
    ],
  },
  {
    major: 'AAST',
    name: 'African American Studies',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'AASP401', credits: 3, title: 'Research Directions' },
      { code: 'AASP443', credits: 3, title: 'Blacks and the Law' },
    ],
  },
  {
    major: 'ANTH',
    name: 'Anthropology',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ANTH498Y', credits: 3, title: 'Applied Archaeological Field Research' },
      { code: 'ANTH222', credits: 4, title: 'Ecological and Evolutionary Anthropology' },
    ],
  },
  {
    major: 'FMSC',
    name: 'Family Science',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'FMSC498', credits: 1, title: 'Family Studies' },
      { code: 'FMSC450', credits: 3, title: 'Loneliness Epidemic' },
    ],
  },
  {
    major: 'GEOG',
    name: 'Geographical Sciences',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'GEOG498I', credits: 3, title: 'Algorithms for Geospatial Computing' },
      { code: 'GEOG470', credits: 3, title: 'Spatial Data Algorithms' },
    ],
  },
  {
    major: 'HESP',
    name: 'Hearing & Speech Sciences',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'HESP489', credits: 1, title: 'Undergraduate Research Experience' },
      { code: 'HESP417', credits: 3, title: 'Speech-Language Pathology' },
    ],
  },
  {
    major: 'KNES',
    name: 'Kinesiology',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'KNES450', credits: 3, title: 'Mental Skills Training Applications' },
      { code: 'KNES360', credits: 4, title: 'Physiology of Exercise' },
    ],
  },
  {
    major: 'PHSC',
    name: 'Public Health Science',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'PHSC450', credits: 3, title: 'Interdisciplinary Applications of Public Health' },
      { code: 'PHSC420', credits: 3, title: 'Vaccines and Immunology' },
    ],
  },
  {
    major: 'NFSC',
    name: 'Nutrition & Food Science',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'NFSC450', credits: 3, title: 'Food and Nutrient Analysis' },
      { code: 'NFSC440', credits: 4, title: 'Advanced Human Nutrition' },
    ],
  },
  {
    major: 'HLTH',
    name: 'Community Health',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'HLTH490', credits: 3, title: 'Professional Preparation in Community Health' },
      { code: 'HLTH498L', credits: 3, title: 'Health Literacy' },
    ],
  },
  {
    major: 'ENST',
    name: 'Environmental Science & Technology',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ENST499', credits: 1, title: 'Special Topics in Environmental Science and Technology' },
      { code: 'ENST453', credits: 3, title: 'Watershed Science' },
    ],
  },
  {
    major: 'ENCH',
    name: 'Chemical Engineering',
    kind: 'curated',
    targetCredits: 124,
    cards: [
      { code: 'CHBE446', credits: 3, title: 'Process Engineering Economics and Design II' },
      { code: 'CHBE437', credits: 3, title: 'Chemical and Biomolecular Engineering Laboratory' },
    ],
  },
  {
    major: 'ANSC',
    name: 'Animal Sciences',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ANSC453', credits: 3, title: 'Animal Welfare and Bioethics' },
      { code: 'ANSC417', credits: 3, title: 'Regulatory Issues in Animal Care and Management' },
    ],
  },
  {
    major: 'AREC',
    name: 'Agricultural & Resource Economics',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'AREC481', credits: 3, title: 'Environmental Economics' },
      { code: 'AREC422', credits: 3, title: 'Econometric Analysis' },
    ],
  },
  {
    major: 'PLSC',
    name: 'Plant Sciences',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'PLSC402', credits: 3, title: 'Sports Turf Management' },
      { code: 'PLSC420', credits: 4, title: 'Principles of Plant Pathology' },
    ],
  },
  {
    major: 'ENMA',
    name: 'Materials Science & Engineering',
    kind: 'curated',
    targetCredits: 124,
    cards: [
      { code: 'ENMA490', credits: 3, title: 'Materials Design' },
      { code: 'ENMA441', credits: 3, title: 'Characterization of Materials' },
    ],
  },
  {
    major: 'ENFP',
    name: 'Fire Protection Engineering',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'ENFP440', credits: 3, title: 'Smoke Management and Fire Alarm Systems' },
      { code: 'ENFP420', credits: 4, title: 'Fire Assessment Methods and Laboratory' },
    ],
  },
  {
    major: 'ENEE',
    name: 'Electrical Engineering',
    kind: 'curated',
    targetCredits: 122,
    cards: [
      { code: 'ENEE408A', credits: 3, title: 'Capstone Design Project' },
      { code: 'ENEE436', credits: 3, title: 'Foundations of Machine Learning' },
    ],
  },
  {
    major: 'ENAE',
    name: 'Aerospace Engineering',
    kind: 'curated',
    targetCredits: 124,
    cards: [
      { code: 'ENAE492', credits: 3, title: 'Aeronautical Systems Design' },
      { code: 'ENAE432', credits: 3, title: 'Control of Aerospace Systems' },
    ],
  },
  {
    major: 'ENCE',
    name: 'Civil Engineering',
    kind: 'curated',
    targetCredits: 122,
    cards: [
      { code: 'ENCE467', credits: 2, title: 'Civil and Environmental Engineering Design II' },
      { code: 'ENCE464', credits: 2, title: 'Civil and Environmental Engineering Design I' },
    ],
  },
  {
    major: 'BIOE',
    name: 'Bioengineering',
    kind: 'curated',
    targetCredits: 126,
    cards: [
      { code: 'BIOE486', credits: 3, title: 'Capstone Design II' },
      { code: 'BIOE485', credits: 3, title: 'Capstone Design I' },
    ],
  },
  {
    major: 'FINANCE',
    name: 'Finance',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'BMGT495', credits: 3, title: 'Strategic Management' },
      { code: 'BMGT443', credits: 3, title: 'Applied Equity Analysis and Portfolio Management' },
    ],
  },
  {
    major: 'ACCOUNTING',
    name: 'Accounting',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'BMGT417', credits: 3, title: 'Taxation of Corporations, Partnerships and Estates' },
      { code: 'BMGT422', credits: 3, title: 'Auditing Theory and Practice' },
    ],
  },
  {
    major: 'IS',
    name: 'Information Systems',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'BMGT495', credits: 3, title: 'Strategic Management' },
      { code: 'BMGT407', credits: 3, title: 'Information Systems Projects' },
    ],
  },
  {
    major: 'MARKETING',
    name: 'Marketing',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'BMGT495', credits: 3, title: 'Strategic Management' },
      { code: 'BMGT457', credits: 3, title: 'Marketing Policies and Strategies' },
    ],
  },
  {
    major: 'MGMT',
    name: 'Management & Organization',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'BMGT495', credits: 3, title: 'Strategic Management' },
      { code: 'BMGT463', credits: 3, title: 'Cross-cultural Challenges in Business' },
    ],
  },
  {
    major: 'SCM',
    name: 'Supply Chain Management',
    kind: 'curated',
    targetCredits: 120,
    cards: [
      { code: 'BMGT475', credits: 3, title: 'Supply Chain Strategy and Network Design' },
      { code: 'BMGT476', credits: 3, title: 'Technology Applications in Supply Chain Management' },
    ],
  },
];

const ALL_TARGETS = [...TARGETS, ...CURATED_TARGETS];

const VIEWPORTS = {
  desktop: {
    id: 'desktop',
    label: 'desktop',
    context: { viewport: { width: 1440, height: 960 } },
  },
  mobile: {
    id: 'mobile',
    label: 'mobile',
    context: {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    },
  },
};

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function parseArgs(argv) {
  const opts = {
    majors: [],
    viewports: [],
    headed: false,
    keepOpen: false,
    timeoutMs: Number(process.env.TERPTRACK_RENDER_TIMEOUT_MS || 120000),
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--headed') {
      opts.headed = true;
    } else if (arg === '--keep-open') {
      opts.keepOpen = true;
    } else if (arg === '--major' || arg === '--majors') {
      const value = argv[++i] || '';
      opts.majors.push(...value.split(','));
    } else if (arg.startsWith('--major=')) {
      opts.majors.push(...arg.slice('--major='.length).split(','));
    } else if (arg.startsWith('--majors=')) {
      opts.majors.push(...arg.slice('--majors='.length).split(','));
    } else if (arg === '--viewport' || arg === '--viewports') {
      const value = argv[++i] || '';
      opts.viewports.push(...value.split(','));
    } else if (arg.startsWith('--viewport=')) {
      opts.viewports.push(...arg.slice('--viewport='.length).split(','));
    } else if (arg.startsWith('--viewports=')) {
      opts.viewports.push(...arg.slice('--viewports='.length).split(','));
    } else if (arg === '--timeout-ms') {
      opts.timeoutMs = Number(argv[++i] || opts.timeoutMs);
    } else if (arg.startsWith('--timeout-ms=')) {
      opts.timeoutMs = Number(arg.slice('--timeout-ms='.length) || opts.timeoutMs);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  opts.majors = Array.from(new Set(opts.majors.map(item => String(item || '').trim().toUpperCase()).filter(Boolean)));
  opts.viewports = Array.from(new Set(opts.viewports.flatMap(item => {
    const value = String(item || '').trim().toLowerCase();
    if (!value) return [];
    if (value === 'all') return Object.keys(VIEWPORTS);
    return [value];
  })));
  if (!opts.viewports.length) opts.viewports = Object.keys(VIEWPORTS);
  for (const viewport of opts.viewports) {
    if (!VIEWPORTS[viewport]) fail(`Unknown viewport: ${viewport}`);
  }
  opts.timeoutMs = Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0 ? opts.timeoutMs : 120000;
  return opts;
}

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {}

  const candidates = [
    process.env.TERPTRACK_NODE_MODULES,
    process.env.NODE_REPL_NODE_MODULE_DIRS,
    path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),
  ].filter(Boolean).flatMap(value => String(value).split(path.delimiter).filter(Boolean));

  for (const dir of candidates) {
    const pkg = path.join(dir, 'playwright', 'package.json');
    if (!fs.existsSync(pkg)) continue;
    return createRequire(path.join(dir, 'terptrack-render-verifier.js'))('playwright');
  }

  fail('Playwright is required. Install it locally, set NODE_PATH, or set TERPTRACK_NODE_MODULES to a node_modules directory that contains playwright.');
}

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent((requestPath || '/').split('?')[0]);
  const rel = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.resolve(root, rel);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) return null;
  return resolved;
}

function umdIoFallbackBody(pathAndQuery) {
  const clean = String(pathAndQuery || '').split('?')[0];
  if (clean === '/courses' || clean === '/courses/semesters' || clean.includes('/sections')) return [];
  return null;
}

async function fetchUmdIoText(clean, timeoutMs = 8500) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timer = null;
  const request = (async () => {
    const upstream = await fetch(`https://api.umd.io/v1${clean}`, {
      headers: { accept: 'application/json', 'user-agent': 'TerpTrack/render-verifier' },
      ...(controller ? { signal: controller.signal } : {}),
    });
    const body = await upstream.text();
    return { upstream, body };
  })();
  try {
    return await Promise.race([
      request,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          if (controller) controller.abort();
          reject(new Error('umd.io verifier proxy timed out'));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url === '/api/config') {
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        res.end(JSON.stringify({ supabaseUrl: '', supabaseAnonKey: '' }));
        return;
      }
      if (req.url && req.url.startsWith('/api/umd')) {
        let clean = '';
        try {
          const requestUrl = new URL(req.url, 'http://127.0.0.1');
          const raw = requestUrl.searchParams.get('path') || '';
          clean = raw.startsWith('/') ? raw : `/${raw}`;
          if (!/^\/courses(?:[/?]|$)/.test(clean) || clean.includes('://') || clean.startsWith('//')) {
            res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'x-terptrack-proxy': 'umd-io' });
            res.end(JSON.stringify({ error: 'Only umd.io course endpoints are proxied.' }));
            return;
          }
          const { upstream, body } = await fetchUmdIoText(clean);
          if (!upstream.ok) {
            res.writeHead(200, {
              'content-type': 'application/json; charset=utf-8',
              'cache-control': 'no-store',
              'x-terptrack-proxy': 'umd-io',
              'x-terptrack-upstream-status': String(upstream.status),
            });
            res.end(JSON.stringify(umdIoFallbackBody(clean)));
            return;
          }
          res.writeHead(upstream.status, {
            'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
            'cache-control': upstream.ok ? 'public, max-age=900' : 'no-store',
            'x-terptrack-proxy': 'umd-io',
          });
          res.end(body);
        } catch (error) {
          res.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
            'x-terptrack-proxy': 'umd-io',
            'x-terptrack-upstream-status': 'fetch-error',
          });
          res.end(JSON.stringify(umdIoFallbackBody(clean)));
        }
        return;
      }
      const file = safeJoin(ROOT, req.url);
      if (!file) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(file, (error, body) => {
        if (error) {
          res.writeHead(error.code === 'ENOENT' ? 404 : 500);
          res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
          return;
        }
        res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(body);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${address.port}/`,
      });
    });
  });
}

function normalizeCode(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function isIgnoredConsoleError(text) {
  const value = String(text || '');
  return value.includes('api.umd.io')
    || value.includes('CORS policy')
    || value.startsWith('Failed to load resource: net::ERR_FAILED')
    || value.startsWith('Failed to load resource: the server responded with a status of 404');
}

function isTransientBrowserResourceError(text) {
  const value = String(text || '');
  return value.startsWith('Failed to load resource: net::ERR_NETWORK_IO_SUSPENDED')
    || value.startsWith('Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED');
}

function cardSnapshotScript() {
  return `(() => {
    const cards = Array.from(document.querySelectorAll('.course')).map(card => {
      const titleNode = card.querySelector('.title');
      const rawTitle = titleNode ? Array.from(titleNode.childNodes)
        .filter(node => node.nodeType === 3)
        .map(node => node.textContent)
        .join(' ')
        .trim() : '';
      return {
        code: card.querySelector('.code')?.textContent?.trim() || '',
        title: rawTitle || titleNode?.textContent?.replace(/PT\\s*↗/g, '').trim() || '',
        credits: card.querySelector('.credits')?.childNodes?.[0]?.textContent?.trim() || '',
        text: card.textContent.replace(/\\s+/g, ' ').trim().slice(0, 360),
      };
    });
    const review = document.querySelector('#set-auto-plan-review');
    const reviewVisible = review && !review.hidden && review.offsetParent !== null;
    const release = document.querySelector('#set-release-checklist');
    const releaseVisible = release && !release.hidden && release.offsetParent !== null;
    const modal = document.querySelector('#settings-modal .modal, #settings-modal');
    return {
      cards,
      reviewText: review ? review.textContent.replace(/\\s+/g, ' ').trim() : '',
      releaseText: release ? release.textContent.replace(/\\s+/g, ' ').trim() : '',
      statusText: document.querySelector('#set-major-status')?.textContent?.replace(/\\s+/g, ' ').trim() || '',
      scripts: Array.from(document.scripts).map(script => script.getAttribute('src')).filter(Boolean),
      styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.getAttribute('href')),
      overflow: {
        document: document.documentElement.scrollWidth > window.innerWidth + 1,
        body: document.body.scrollWidth > window.innerWidth + 1,
        modal: modal ? modal.scrollWidth > modal.clientWidth + 1 : false,
        review: reviewVisible ? review.scrollWidth > review.clientWidth + 1 : false,
        release: releaseVisible ? release.scrollWidth > release.clientWidth + 1 : false,
      },
    };
  })()`;
}

async function waitForReview(page, target, timeoutMs) {
  if (target.kind === 'curated') {
    const waitForCuratedReady = () => page.waitForFunction(
      ({ name, targetCredits }) => {
        const review = document.querySelector('#set-auto-plan-review');
        const text = review ? review.textContent.replace(/\s+/g, ' ') : '';
        return text.includes(name)
          && text.includes('Curated plan ready')
          && text.includes(`${targetCredits} planned credits`)
          && text.includes('Generated Catalog Freshness')
          && text.includes('pass208-curated-final-all');
      },
      { name: target.name, targetCredits: target.targetCredits },
      { timeout: timeoutMs },
    );
    await waitForCuratedReady();
    return;
  }

  const waitForReady = () => page.waitForFunction(
    ({ name, coverage, targetCredits }) => {
      const review = document.querySelector('#set-auto-plan-review');
      const text = review ? review.textContent.replace(/\s+/g, ' ') : '';
      return text.includes(name)
        && text.includes(coverage)
        && text.includes(`/${targetCredits} planned credits`)
        && text.includes('Generated Catalog Freshness')
        && text.includes('pass206-curated-core-stem-all');
    },
    { name: target.name, coverage: target.coverage, targetCredits: target.targetCredits },
    { timeout: timeoutMs },
  );
  try {
    await waitForReady();
  } catch (error) {
    const before = await page.locator('#set-auto-plan-review').textContent({ timeout: 2000 }).catch(() => '');
    await page.evaluate(async majorId => {
      const root = document.querySelector('#set-auto-plan-review');
      if (!root || typeof buildAutoPlanPreview !== 'function') return;
      const tpl = getMajorTemplate(majorId);
      if (!tpl) return;
      root.hidden = false;
      root.className = 'auto-plan-review loading';
      root.innerHTML = `
        <div class="auto-plan-review-head">
          <div>
            <strong>Retrying ${settingsHtml(tpl.name)}</strong>
            <span>Refreshing live course metadata...</span>
          </div>
        </div>
      `;
      const review = await buildAutoPlanPreview(majorId, {
        force: true,
        profilePrefs: readProfileForm('set'),
        catalogYear: settingsCatalogYearValue(),
      });
      root.className = `auto-plan-review ${review.kind === 'curated' ? 'curated' : 'generated'}`;
      root.innerHTML = autoPlanReviewHtml(review);
    }, target.major).catch(() => {});
    try {
      await waitForReady();
    } catch (retryError) {
      const after = await page.locator('#set-auto-plan-review').textContent({ timeout: 2000 }).catch(() => '');
      const current = String(after || before || '').replace(/\s+/g, ' ').trim().slice(0, 900);
      fail(`${target.major}: review did not reach ${target.coverage} and /${target.targetCredits} planned credits after forced live metadata retry. Current text: ${current}`);
    }
  }
}

function verifyReviewCredits(target, reviewText) {
  const match = String(reviewText || '').match(/Generated\s+(\d+)\/(\d+)\s+planned credits/);
  assert(match, `${target.major}: review did not expose planned/target credits`);
  const planned = Number(match[1]);
  const targetCredits = Number(match[2]);
  assert(targetCredits === target.targetCredits, `${target.major}: review target credits ${targetCredits}, expected ${target.targetCredits}`);
  assert(planned >= targetCredits, `${target.major}: rendered ${planned}/${targetCredits} planned credits below target`);
  assert(planned <= targetCredits + 2, `${target.major}: rendered ${planned}/${targetCredits} planned credits, more than 2 over target`);
}

async function applyMajor(page, target, timeoutMs) {
  await page.selectOption('#set-major', target.major);
  await waitForReview(page, target, timeoutMs);
  const reviewText = await page.locator('#set-auto-plan-review').textContent({ timeout: timeoutMs });
  assert(reviewText.includes(target.name), `${target.major}: review did not include major name ${target.name}`);
  if (target.kind === 'curated') {
    assert(reviewText.includes('Curated plan ready'), `${target.major}: rendered curated preview was not ready`);
    assert(reviewText.includes('curated local schedule'), `${target.major}: rendered curated preview missing local schedule evidence`);
    assert(reviewText.includes('GenEd / I-Series Coverage'), `${target.major}: rendered curated preview missing GenEd coverage block`);
    assert(reviewText.includes('FSAW') && reviewText.includes('FSPW') && reviewText.includes('SCIS'), `${target.major}: rendered curated preview missing representative GenEd tags`);
    assert(reviewText.includes('Plan Reality'), `${target.major}: rendered curated preview missing plan reality block`);
    assert(reviewText.includes('Live-backed requirements'), `${target.major}: rendered curated preview missing curated source metric`);
    assert(reviewText.includes('Placeholder credits'), `${target.major}: rendered curated preview missing placeholder metric`);
    assert(reviewText.includes('Official sources'), `${target.major}: rendered curated preview missing official source links`);
    assert(reviewText.includes('Catalog year 2026-2027'), `${target.major}: rendered curated preview missing catalog year metadata`);
    assert(reviewText.includes('Generated Catalog Freshness'), `${target.major}: rendered curated preview missing generated freshness panel`);
  } else {
    assert(!reviewText.includes('Template fallback'), `${target.major}: rendered preview still shows template fallback`);
    assert(reviewText.includes('13/13'), `${target.major}: rendered preview missing full GenEd coverage`);
    assert(reviewText.includes('Major Requirement Groups'), `${target.major}: rendered preview missing requirement group block`);
    assert(reviewText.includes('Plan Reality'), `${target.major}: rendered preview missing plan reality block`);
    assert(reviewText.includes('Live-backed requirements'), `${target.major}: rendered preview missing live-backed requirement metric`);
    assert(reviewText.includes('Elective placement'), `${target.major}: rendered preview missing elective placement metric`);
    if (!reviewText.includes('No open elective slots needed')) {
      assert(reviewText.includes('Elective Roadmap'), `${target.major}: rendered preview missing elective roadmap for elective-bearing plan`);
    }
    assert(reviewText.includes('Next replacement actions'), `${target.major}: rendered preview missing next replacement actions`);
    assert(reviewText.includes('Apply + resolve placeholders'), `${target.major}: rendered preview missing initial placeholder resolver action`);
    assert(reviewText.includes('Core Requirements'), `${target.major}: rendered preview missing core requirement group`);
    assert(reviewText.includes('Upper-Level Choices'), `${target.major}: rendered preview missing upper requirement group`);
    assert(reviewText.includes('Official sources'), `${target.major}: rendered preview missing official source links`);
    assert(reviewText.includes('Requirement source'), `${target.major}: rendered preview missing requirement source links`);
    assert(reviewText.includes('Catalog year 2026-2027'), `${target.major}: rendered preview missing catalog year metadata`);
    assert(reviewText.includes('Audit history') && reviewText.includes('pass86-all'), `${target.major}: rendered preview missing audit history`);
    verifyReviewCredits(target, reviewText);
  }

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#settings-modal button[onclick="applyMajorFromSettings()"]').click({ timeout: timeoutMs });
  await page.waitForFunction(
    majorName => (document.querySelector('#set-major-status')?.textContent || '').includes(`Applied ${majorName}`),
    target.name,
    { timeout: timeoutMs },
  );
}

function verifyCards(target, snapshot) {
  const cards = snapshot.cards || [];
  for (const expected of target.cards) {
    const card = cards.find(item => normalizeCode(item.code) === expected.code);
    assert(card, `${target.major}: missing rendered card ${expected.code}`);
    assert(Number(card.credits) === expected.credits, `${target.major}: ${expected.code} rendered ${card.credits} credits, expected ${expected.credits}`);
    assert(card.title.includes(expected.title), `${target.major}: ${expected.code} title "${card.title}" did not include "${expected.title}"`);
  }
  Object.entries(snapshot.overflow || {}).forEach(([key, value]) => {
    assert(!value, `${target.major}: ${key} has horizontal overflow`);
  });
}

async function runViewport(browser, url, viewport, selected, opts) {
  const context = await browser.newContext({
    ...viewport.context,
    reducedMotion: 'reduce',
  });
  const rows = [];
  try {
    const page = await context.newPage();
    const consoleErrors = [];
    const ignoredConsoleErrors = [];
    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (isTransientBrowserResourceError(text)) return;
      if (isIgnoredConsoleError(text)) ignoredConsoleErrors.push(text);
      else consoleErrors.push(text);
    });
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`${url}?render-verifier=pass88-${viewport.id}`, { waitUntil: 'domcontentloaded', timeout: opts.timeoutMs });
    const onboardingSkip = page.locator('#ob-skip');
    if (await onboardingSkip.isVisible({ timeout: 3000 }).catch(() => false)) {
      await onboardingSkip.click({ timeout: opts.timeoutMs });
      await page.locator('#onboard-modal.open').waitFor({ state: 'hidden', timeout: opts.timeoutMs }).catch(() => {});
    }
    await page.locator('#settings-btn').click({ timeout: opts.timeoutMs });
    await page.locator('#settings-modal.open').waitFor({ state: 'visible', timeout: opts.timeoutMs });
    await page.waitForFunction(() => {
      const release = document.querySelector('#set-release-checklist');
      const text = release ? release.textContent.replace(/\s+/g, ' ') : '';
      return text.includes('Release Readiness')
        && text.includes('Default release gate')
        && text.includes('Cloud account setup')
        && !text.includes('Checking cloud config');
    }, null, { timeout: opts.timeoutMs });

    const initialSnapshot = await page.evaluate(cardSnapshotScript());
    assert(initialSnapshot.styles.includes('styles.css?v=122'), `${viewport.label}: rendered app did not load styles.css?v=122`);
    assert(initialSnapshot.scripts.includes('js/majors.js?v=16'), `${viewport.label}: rendered app did not load js/majors.js?v=16`);
    assert(initialSnapshot.scripts.includes('js/planetterp.js?v=4'), `${viewport.label}: rendered app did not load js/planetterp.js?v=4`);
    assert(initialSnapshot.scripts.includes('js/api.js?v=9'), `${viewport.label}: rendered app did not load js/api.js?v=9`);
    assert(initialSnapshot.scripts.includes('js/settings.js?v=51'), `${viewport.label}: rendered app did not load js/settings.js?v=51`);
    assert(initialSnapshot.scripts.includes('js/import.js?v=13'), `${viewport.label}: rendered app did not load js/import.js?v=13`);
    assert(initialSnapshot.releaseText.includes('4/5 launch checks ready'), `${viewport.label}: release checklist did not show 4/5 ready status`);
    assert(initialSnapshot.releaseText.includes('Official source links'), `${viewport.label}: release checklist missing official source row`);
    assert(initialSnapshot.releaseText.includes('Live generated-template audit'), `${viewport.label}: release checklist missing generated audit row`);
    assert(initialSnapshot.releaseText.includes('Generated course catalog sweep'), `${viewport.label}: release checklist missing catalog sweep row`);
    assert(initialSnapshot.releaseText.includes('0/0 unique generated required courses'), `${viewport.label}: release checklist missing catalog sweep coverage`);
    assert(initialSnapshot.releaseText.includes('0/0 title drifts'), `${viewport.label}: release checklist missing official title drift evidence`);
    assert(initialSnapshot.releaseText.includes('0/0 term-specific title suffixes'), `${viewport.label}: release checklist missing Testudo title suffix evidence`);
    assert(initialSnapshot.releaseText.includes('Maintainer commands'), `${viewport.label}: release checklist missing maintainer command block`);
    assert(initialSnapshot.releaseText.includes('--live-catalog-write-settings-snapshot'), `${viewport.label}: release checklist missing snapshot refresh command`);
    assert(initialSnapshot.releaseText.includes('Default release gate'), `${viewport.label}: release checklist missing release gate row`);
    assert(initialSnapshot.releaseText.includes('Pass 208'), `${viewport.label}: release checklist missing Pass 208 snapshot`);
    assert(initialSnapshot.releaseText.includes('Cloud account setup'), `${viewport.label}: release checklist missing cloud setup row`);
    assert(initialSnapshot.releaseText.includes('SUPABASE_URL'), `${viewport.label}: release checklist missing Vercel/Supabase setup detail`);
    Object.entries(initialSnapshot.overflow || {}).forEach(([key, value]) => {
      assert(!value, `${viewport.label}: initial ${key} has horizontal overflow`);
    });

    for (const target of selected) {
      await applyMajor(page, target, opts.timeoutMs);
      const snapshot = await page.evaluate(cardSnapshotScript());
      verifyCards(target, snapshot);
      rows.push({
        id: target.major,
        viewport: viewport.id,
        coverage: target.kind === 'curated' ? 'curated' : target.coverage,
        cards: target.cards.map(card => `${card.code}:${card.credits}cr`).join(','),
      });
      console.log(`${target.major} [${viewport.label}]: rendered ${rows[rows.length - 1].coverage}; cards ${rows[rows.length - 1].cards}`);
    }

    assert(!pageErrors.length, `${viewport.label}: browser page errors: ${pageErrors.slice(0, 5).join(' | ')}`);
    assert(!consoleErrors.length, `${viewport.label}: unexpected browser console errors: ${consoleErrors.slice(0, 5).join(' | ')}`);
    assert(!ignoredConsoleErrors.length, `${viewport.label}: expected the umd.io proxy to prevent network console noise: ${ignoredConsoleErrors.slice(0, 5).join(' | ')}`);
    if (opts.keepOpen) await page.waitForTimeout(60_000);
    return rows;
  } finally {
    await context.close().catch(() => {});
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  const selected = opts.majors.length
    ? opts.majors.map(id => ALL_TARGETS.find(target => target.major === id) || fail(`Unknown rendered verifier target: ${id}`))
    : TARGETS;
  const selectedViewports = opts.viewports.map(id => VIEWPORTS[id]);
  const { chromium } = loadPlaywright();
  const { server, url } = await startServer();
  const browser = await chromium.launch({ headless: !opts.headed });
  const rows = [];
  try {
    for (const viewport of selectedViewports) {
      rows.push(...await runViewport(browser, url, viewport, selected, opts));
    }

    console.log(`Verified ${rows.length} rendered plan viewport runs (${selected.length} majors x ${selectedViewports.length} viewports) in rendered browser UI with clean proxy-backed console.`);
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
