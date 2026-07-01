#!/usr/bin/env node
'use strict';

const handler = require('../api/umd.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeRes() {
  return {
    headers: {},
    statusCode: 200,
    body: '',
    setHeader(key, value) {
      this.headers[String(key).toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

function jsonBody(res) {
  return JSON.parse(res.body || 'null');
}

function upstreamResponse({ ok = true, status = 200, contentType = 'application/json; charset=utf-8', body = '' } = {}) {
  return {
    ok,
    status,
    headers: {
      get(name) {
        return String(name).toLowerCase() === 'content-type' ? contentType : null;
      },
    },
    async text() {
      return body;
    },
  };
}

async function withMockFetch(mock, fn) {
  const original = global.fetch;
  global.fetch = mock;
  try {
    await fn();
  } finally {
    global.fetch = original;
  }
}

async function call(req) {
  const res = makeRes();
  await handler({
    method: 'GET',
    headers: { accept: 'application/json' },
    query: {},
    ...req,
  }, res);
  return res;
}

async function testSuccess() {
  const calls = [];
  await withMockFetch(async (url, opts) => {
    calls.push({ url, opts });
    return upstreamResponse({
      body: JSON.stringify([{ course_id: 'ENEE244', name: 'Digital Logic Design' }]),
    });
  }, async () => {
    const res = await call({ query: { path: '/courses/ENEE244' } });
    assert(calls.length === 1, 'success: expected one upstream fetch');
    assert(calls[0].url === 'https://api.umd.io/v1/courses/ENEE244', `success: unexpected URL ${calls[0].url}`);
    assert(calls[0].opts.headers.accept === 'application/json', 'success: should forward accept header');
    assert(res.statusCode === 200, `success: status ${res.statusCode}`);
    assert(res.headers['x-terptrack-proxy'] === 'umd-io', 'success: missing proxy marker');
    assert(/s-maxage=900/.test(res.headers['cache-control']), 'success: should cache successful upstream response');
    assert(jsonBody(res)[0].course_id === 'ENEE244', 'success: should forward upstream body');
  });
}

async function testPathNormalization() {
  const calls = [];
  await withMockFetch(async (url) => {
    calls.push(url);
    return upstreamResponse({ body: JSON.stringify(['202601', '202608']) });
  }, async () => {
    const res = await call({ query: { path: ['courses/semesters'] } });
    assert(calls[0] === 'https://api.umd.io/v1/courses/semesters', `normalize: unexpected URL ${calls[0]}`);
    assert(jsonBody(res)[0] === '202601', 'normalize: should forward semesters response');
  });
}

async function testBadPathRejects() {
  let fetchCalled = false;
  await withMockFetch(async () => {
    fetchCalled = true;
    return upstreamResponse();
  }, async () => {
    const cases = ['/bad', 'https://evil.example/courses', '//evil.example/courses', ''];
    for (const path of cases) {
      const res = await call({ query: { path } });
      assert(res.statusCode === 400, `bad path ${path}: status ${res.statusCode}`);
      assert(res.headers['x-terptrack-proxy'] === 'umd-io', `bad path ${path}: missing proxy marker`);
    }
    assert(!fetchCalled, 'bad path: should not call upstream fetch');
  });
}

async function testMethodRejects() {
  const res = await call({ method: 'POST', query: { path: '/courses/ENEE244' } });
  assert(res.statusCode === 405, `method: status ${res.statusCode}`);
  assert(res.headers.allow === 'GET, HEAD', 'method: should set Allow header');
  assert(res.headers['x-terptrack-proxy'] === 'umd-io', 'method: missing proxy marker');
}

async function testUpstreamFailureFallbacks() {
  await withMockFetch(async (url) => {
    if (String(url).includes('/sections')) return upstreamResponse({ ok: false, status: 503, body: 'unavailable' });
    return upstreamResponse({ ok: false, status: 404, body: 'missing' });
  }, async () => {
    const course = await call({ query: { path: '/courses/MISSING' } });
    assert(course.statusCode === 200, `failure course: status ${course.statusCode}`);
    assert(course.headers['cache-control'] === 'no-store', 'failure course: should not cache fallback');
    assert(course.headers['x-terptrack-upstream-status'] === '404', 'failure course: should expose upstream status');
    assert(jsonBody(course) === null, 'failure course: single-course fallback should be null');

    const sections = await call({ query: { path: '/courses/ENEE244/sections?semester=202608' } });
    assert(sections.statusCode === 200, `failure sections: status ${sections.statusCode}`);
    assert(sections.headers['x-terptrack-upstream-status'] === '503', 'failure sections: should expose upstream status');
    assert(Array.isArray(jsonBody(sections)) && jsonBody(sections).length === 0, 'failure sections: fallback should be []');
  });
}

async function testFetchErrorFallback() {
  await withMockFetch(async () => {
    throw new Error('offline');
  }, async () => {
    const res = await call({ query: { path: '/courses' } });
    assert(res.statusCode === 200, `fetch error: status ${res.statusCode}`);
    assert(res.headers['cache-control'] === 'no-store', 'fetch error: should not cache fallback');
    assert(res.headers['x-terptrack-upstream-status'] === 'fetch-error', 'fetch error: should expose fetch-error status');
    assert(Array.isArray(jsonBody(res)) && jsonBody(res).length === 0, 'fetch error: course-list fallback should be []');
  });
}

async function main() {
  await testSuccess();
  await testPathNormalization();
  await testBadPathRejects();
  await testMethodRejects();
  await testUpstreamFailureFallbacks();
  await testFetchErrorFallback();
  console.log('UMD proxy offline fixtures passed.');
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
