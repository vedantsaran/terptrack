const UMDIO_BASE = 'https://api.umd.io/v1';

function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).send(JSON.stringify(body));
}

function normalizedPath(req) {
  const value = req.query && req.query.path;
  const raw = Array.isArray(value) ? value[0] : value;
  const text = String(raw || '').trim();
  if (!text || text.includes('://') || text.startsWith('//')) return '';
  return text.startsWith('/') ? text : `/${text}`;
}

function fallbackBody(pathAndQuery) {
  const clean = String(pathAndQuery || '').split('?')[0];
  if (clean === '/courses' || clean === '/courses/semesters' || clean.includes('/sections')) return [];
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('x-terptrack-proxy', 'umd-io');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const pathAndQuery = normalizedPath(req);
  if (!/^\/courses(?:[/?]|$)/.test(pathAndQuery)) {
    sendJson(res, 400, { error: 'Only umd.io course endpoints are proxied.' });
    return;
  }

  const upstreamUrl = `${UMDIO_BASE}${pathAndQuery}`;
  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        accept: req.headers.accept || 'application/json',
        'user-agent': 'TerpTrack/umd-io-proxy',
      },
    });
    const body = await upstream.text();
    if (!upstream.ok) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('x-terptrack-upstream-status', String(upstream.status));
      sendJson(res, 200, fallbackBody(pathAndQuery));
      return;
    }
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.status(upstream.status).send(body);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('x-terptrack-upstream-status', 'fetch-error');
    sendJson(res, 200, fallbackBody(pathAndQuery));
  }
};
