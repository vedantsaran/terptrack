'use strict';
/* ============================================================
   ROADMAP VIEW — dynamic prerequisite graph
   ============================================================ */

let roadmapLastGraph = null;
let roadmapFullGraph = null;
let roadmapFilter = 'all';
const ROADMAP_FILTERS = [
  { id: 'all', label: 'All planned' },
  { id: 'blockers', label: 'Blockers' },
  { id: 'major', label: 'Major' },
  { id: 'gened', label: 'GenEds' },
];

function roadmapEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function roadmapIsUmdCode(code) {
  return /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(String(code || '').trim());
}

function roadmapDisplayCode(code) {
  return typeof displayCode === 'function' ? displayCode(code) : String(code || '');
}

function roadmapCourseItems() {
  const items = [];
  getAllSemesters().forEach((sem, semIndex) => {
    (sem.courses || []).forEach((course, courseIndex) => {
      if (!roadmapIsUmdCode(course.code)) return;
      items.push({ course, sem, semIndex, courseIndex, source: 'base' });
    });
    (state.customCourses || [])
      .filter(course => course.semId === sem.id)
      .forEach((course, courseIndex) => {
        if (!roadmapIsUmdCode(course.code)) return;
        items.push({ course, sem, semIndex, courseIndex, source: 'custom' });
      });
  });
  return items;
}

function roadmapPrereqGroups(course) {
  if (Array.isArray(course.prereqGroups) && course.prereqGroups.length) return course.prereqGroups;
  return (course.prereqs || []).map(code => [code]);
}

function roadmapStatus(code) {
  const direct = getCourseState(code);
  const display = getCourseState(roadmapDisplayCode(code));
  return direct.status !== 'not-started' ? direct : display;
}

function roadmapPassed(code) {
  const status = roadmapStatus(code).status;
  return status === 'passed' || status === 'transfer';
}

function roadmapGroupSatisfiedBefore(group, itemByCode, semIndex) {
  return (group || []).some(code => {
    const norm = normalizeCode(code);
    if (roadmapPassed(code)) return true;
    return itemByCode[norm] && itemByCode[norm].semIndex < semIndex;
  });
}

function roadmapCourseReady(item, itemByCode) {
  return roadmapPrereqGroups(item.course).every(group => roadmapGroupSatisfiedBefore(group, itemByCode, item.semIndex));
}

function roadmapTruncate(value, len = 22) {
  const text = String(value || '');
  return text.length > len ? `${text.slice(0, len - 1)}…` : text;
}

function roadmapIsMajorNode(node) {
  const category = String(node.course?.category || '').toLowerCase();
  const kind = String(node.course?.kind || '').toLowerCase();
  return !!(node.goal
    || category.startsWith('major')
    || category === 'critical'
    || category === 'elective'
    || kind === 'critical'
    || kind === 'core'
    || kind === 'tech');
}

function roadmapIsGenEdNode(node) {
  const category = String(node.course?.category || '').toLowerCase();
  const kind = String(node.course?.kind || '').toLowerCase();
  return kind === 'gened' || category.startsWith('gened');
}

function roadmapBuildGraph() {
  const items = roadmapCourseItems();
  const itemByCode = {};
  items.forEach(item => {
    const norm = normalizeCode(item.course.code);
    if (!itemByCode[norm] || item.semIndex < itemByCode[norm].semIndex) itemByCode[norm] = item;
  });

  const nodes = {};
  const edges = [];
  function ensureNode(code, item = null, reason = '') {
    const norm = normalizeCode(code);
    if (!norm) return null;
    if (!nodes[norm]) {
      const planned = item || itemByCode[norm] || null;
      const course = planned?.course || findCourse(roadmapDisplayCode(norm)) || {
        code: roadmapDisplayCode(norm),
        title: reason || 'Prerequisite not in plan',
        cr: 0,
        prereqs: [],
        prereqGroups: [],
      };
      const status = roadmapStatus(norm).status;
      const ready = planned ? roadmapCourseReady(planned, itemByCode) : roadmapPassed(norm);
      nodes[norm] = {
        code: roadmapDisplayCode(course.code || norm),
        norm,
        title: course.title || reason || '',
        cr: Number(course.cr) || 0,
        course,
        item: planned,
        semName: planned?.sem?.name || (roadmapPassed(norm) ? 'Completed' : 'Not planned'),
        semIndex: planned ? planned.semIndex : -1,
        planned: !!planned,
        missing: !planned && !roadmapPassed(norm),
        status,
        ready,
        goal: course && isGoalCourse(course),
        unlocks: 0,
      };
    }
    return nodes[norm];
  }

  items.forEach(item => ensureNode(item.course.code, item));
  items.forEach(item => {
    const to = ensureNode(item.course.code, item);
    roadmapPrereqGroups(item.course).forEach((group, groupIndex) => {
      group.forEach(prereq => {
        const from = ensureNode(prereq, itemByCode[normalizeCode(prereq)] || null, 'Missing prerequisite');
        if (!from || !to || from.norm === to.norm) return;
        const satisfied = roadmapPassed(prereq)
          || (itemByCode[from.norm] && itemByCode[from.norm].semIndex < item.semIndex);
        const groupMet = roadmapGroupSatisfiedBefore(group, itemByCode, item.semIndex);
        edges.push({
          from: from.norm,
          to: to.norm,
          groupIndex,
          optional: group.length > 1,
          cls: satisfied ? 'satisfied' : groupMet ? 'option' : 'blocked',
        });
        from.unlocks += 1;
      });
    });
  });

  const incoming = {};
  Object.keys(nodes).forEach(code => { incoming[code] = []; });
  edges.forEach(edge => {
    if (incoming[edge.to]) incoming[edge.to].push(edge.from);
  });
  const layerMemo = {};
  function layerFor(code, stack = new Set()) {
    if (layerMemo[code] !== undefined) return layerMemo[code];
    if (stack.has(code)) return 0;
    stack.add(code);
    const prereqs = incoming[code] || [];
    const layer = prereqs.length ? Math.max(...prereqs.map(pr => layerFor(pr, stack))) + 1 : 0;
    stack.delete(code);
    layerMemo[code] = Math.min(layer, 7);
    return layerMemo[code];
  }
  Object.keys(nodes).forEach(code => { nodes[code].layer = layerFor(code); });

  const blockers = Object.values(nodes)
    .filter(node => node.planned && !node.ready && node.status === 'not-started')
    .sort((a, b) => a.semIndex - b.semIndex || a.code.localeCompare(b.code));
  const missing = Object.values(nodes).filter(node => node.missing);
  const ready = Object.values(nodes).filter(node => node.planned && node.ready && node.status === 'not-started');
  const complete = Object.values(nodes).filter(node => node.status === 'passed' || node.status === 'transfer');

  return { nodes, edges, blockers, missing, ready, complete };
}

function roadmapRecomputeGraphStats(nodes, edges) {
  const list = Object.values(nodes);
  return {
    nodes,
    edges,
    blockers: list
      .filter(node => node.planned && !node.ready && node.status === 'not-started')
      .sort((a, b) => a.semIndex - b.semIndex || a.code.localeCompare(b.code)),
    missing: list.filter(node => node.missing),
    ready: list.filter(node => node.planned && node.ready && node.status === 'not-started'),
    complete: list.filter(node => node.status === 'passed' || node.status === 'transfer'),
  };
}

function roadmapFilterTitle(filter = roadmapFilter) {
  return ROADMAP_FILTERS.find(item => item.id === filter)?.label || 'All planned';
}

function roadmapFilteredGraph(graph, filter = roadmapFilter) {
  if (filter === 'all') return roadmapRecomputeGraphStats({ ...graph.nodes }, graph.edges.slice());
  const selected = new Set();
  const addConnectedContext = code => {
    selected.add(code);
    graph.edges.forEach(edge => {
      if (edge.to === code || edge.from === code) {
        selected.add(edge.from);
        selected.add(edge.to);
      }
    });
  };

  Object.values(graph.nodes).forEach(node => {
    if (filter === 'blockers' && (node.missing || (node.planned && !node.ready && node.status === 'not-started'))) {
      addConnectedContext(node.norm);
    }
    if (filter === 'major' && roadmapIsMajorNode(node)) addConnectedContext(node.norm);
    if (filter === 'gened' && roadmapIsGenEdNode(node)) selected.add(node.norm);
  });

  const nodes = {};
  selected.forEach(code => {
    if (graph.nodes[code]) nodes[code] = { ...graph.nodes[code] };
  });
  const edges = graph.edges.filter(edge => nodes[edge.from] && nodes[edge.to]);
  Object.values(nodes).forEach(node => { node.unlocks = edges.filter(edge => edge.from === node.norm).length; });
  return roadmapRecomputeGraphStats(nodes, edges);
}

function roadmapNodeClass(node) {
  const classes = ['node-rect'];
  if (node.missing) classes.push('missing');
  else if (node.status === 'passed' || node.status === 'transfer') classes.push('passed');
  else if (node.status === 'in-progress') classes.push('in-progress');
  else if (node.status === 'failed') classes.push('failed');
  else if (node.ready) classes.push('available');
  else classes.push('blocked');
  if (node.goal) classes.push('goal');
  return classes.join(' ');
}

function roadmapRenderSvg(graph) {
  if (!Object.keys(graph.nodes).length) {
    return '<div class="roadmap-empty">No courses match this Roadmap filter.</div>';
  }
  const nodeW = 138;
  const nodeH = 54;
  const gapX = 48;
  const gapY = 28;
  const layers = {};
  Object.values(graph.nodes).forEach(node => {
    layers[node.layer] = layers[node.layer] || [];
    layers[node.layer].push(node);
  });
  Object.values(layers).forEach(list => {
    list.sort((a, b) => {
      if (a.semIndex !== b.semIndex) return a.semIndex - b.semIndex;
      if (b.unlocks !== a.unlocks) return b.unlocks - a.unlocks;
      return a.code.localeCompare(b.code);
    });
  });
  const layerKeys = Object.keys(layers).map(Number).sort((a, b) => a - b);
  const maxPerLayer = Math.max(1, ...Object.values(layers).map(list => list.length));
  const svgW = Math.max(720, layerKeys.length * (nodeW + gapX) + 80);
  const svgH = Math.max(260, maxPerLayer * (nodeH + gapY) + 70);
  const positions = {};
  layerKeys.forEach((layer, li) => {
    const list = layers[layer];
    const totalH = list.length * (nodeH + gapY) - gapY;
    const startY = Math.max(34, (svgH - totalH) / 2);
    list.forEach((node, i) => {
      positions[node.norm] = {
        x: 34 + li * (nodeW + gapX),
        y: startY + i * (nodeH + gapY),
      };
    });
  });

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="Dynamic prerequisite roadmap">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--line-strong)"/>
      </marker>
    </defs>`;

  graph.edges.forEach(edge => {
    const a = positions[edge.from];
    const b = positions[edge.to];
    if (!a || !b) return;
    const x1 = a.x + nodeW;
    const y1 = a.y + nodeH / 2;
    const x2 = b.x;
    const y2 = b.y + nodeH / 2;
    const cx = (x1 + x2) / 2;
    svg += `<path class="edge ${roadmapEscape(edge.cls)}${edge.optional ? ' optional' : ''}" d="M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}"/>`;
  });

  Object.values(graph.nodes).forEach(node => {
    const p = positions[node.norm];
    if (!p) return;
    const sub = node.missing ? 'not planned'
      : node.semName ? roadmapTruncate(node.semName, 18)
        : `${node.cr} cr`;
    svg += `<g class="roadmap-node" data-roadmap-code="${roadmapEscape(node.norm)}" tabindex="0" role="button" aria-label="${roadmapEscape(node.code)} ${roadmapEscape(node.title)}">`;
    svg += `<rect class="${roadmapNodeClass(node)}" x="${p.x}" y="${p.y}" width="${nodeW}" height="${nodeH}"/>`;
    svg += `<text class="node-text" x="${p.x + nodeW / 2}" y="${p.y + 21}" text-anchor="middle">${roadmapEscape(node.code)}</text>`;
    svg += `<text class="node-text muted" x="${p.x + nodeW / 2}" y="${p.y + 38}" text-anchor="middle">${roadmapEscape(sub)}${node.goal ? ' ★' : ''}</text>`;
    svg += '</g>';
  });
  svg += '</svg>';
  return svg;
}

function roadmapDefaultDetails(graph) {
  const blockerRows = graph.blockers.slice(0, 5).map(node => {
    const missing = roadmapPrereqGroups(node.course)
      .filter(group => !roadmapGroupSatisfiedBefore(group, Object.fromEntries(Object.values(graph.nodes).filter(n => n.item).map(n => [n.norm, n.item])), node.semIndex))
      .map(group => group.map(roadmapDisplayCode).join(' or '))
      .join(' · ');
    return `<div><strong>${roadmapEscape(node.code)}</strong><span>${roadmapEscape(node.semName)} · needs ${roadmapEscape(missing || 'prerequisite')}</span></div>`;
  }).join('');
  return `
    <div class="roadmap-detail-card">
      <h3>${roadmapEscape(roadmapFilterTitle())} Health</h3>
      <div class="roadmap-detail-stats">
        <span>${Object.keys(graph.nodes).length} nodes</span>
        <span>${graph.edges.length} edges</span>
        <span>${graph.ready.length} ready</span>
        <span>${graph.blockers.length} blocked</span>
        <span>${graph.missing.length} missing</span>
      </div>
      <div class="roadmap-blockers">
        ${blockerRows || '<p>No blocked planned courses found in the current graph.</p>'}
      </div>
    </div>
  `;
}

function roadmapRenderDetail(code) {
  const root = document.getElementById('roadmap-detail');
  if (!root || !roadmapLastGraph) return;
  const node = roadmapLastGraph.nodes[normalizeCode(code)];
  if (!node) {
    root.innerHTML = roadmapDefaultDetails(roadmapLastGraph);
    return;
  }
  const prereqEdges = roadmapLastGraph.edges.filter(edge => edge.to === node.norm);
  const unlockEdges = roadmapLastGraph.edges.filter(edge => edge.from === node.norm);
  const prereqs = prereqEdges.length
    ? prereqEdges.map(edge => {
      const from = roadmapLastGraph.nodes[edge.from];
      return `<span class="${roadmapEscape(edge.cls)}">${roadmapEscape(from?.code || edge.from)}</span>`;
    }).join('')
    : '<span>None in graph</span>';
  const unlocks = unlockEdges.length
    ? unlockEdges.map(edge => {
      const to = roadmapLastGraph.nodes[edge.to];
      return `<span class="${roadmapEscape(edge.cls)}">${roadmapEscape(to?.code || edge.to)}</span>`;
    }).join('')
    : '<span>No dependent planned courses</span>';
  root.innerHTML = `
    <div class="roadmap-detail-card">
      <h3>${roadmapEscape(node.code)}</h3>
      <p>${roadmapEscape(node.title || '')}</p>
      <div class="roadmap-detail-stats">
        <span>${roadmapEscape(node.semName)}</span>
        <span>${node.cr} cr</span>
        <span>${roadmapEscape(node.status.replace('-', ' '))}</span>
        <span>${node.ready ? 'ready' : 'locked'}</span>
      </div>
      <div class="roadmap-pills"><strong>Prereqs</strong>${prereqs}</div>
      <div class="roadmap-pills"><strong>Unlocks</strong>${unlocks}</div>
    </div>
  `;
}

function renderRoadmap() {
  const root = document.getElementById('roadmap-container');
  if (!root) return;
  roadmapFullGraph = roadmapBuildGraph();
  const graph = roadmapFilteredGraph(roadmapFullGraph, roadmapFilter);
  roadmapLastGraph = graph;
  const fullCount = Object.keys(roadmapFullGraph.nodes).length;
  root.innerHTML = `
    <div class="roadmap-toolbar" role="group" aria-label="Roadmap filter">
      ${ROADMAP_FILTERS.map(filter => `<button class="roadmap-filter ${roadmapFilter === filter.id ? 'active' : ''}" type="button" data-roadmap-filter="${roadmapEscape(filter.id)}">${roadmapEscape(filter.label)}</button>`).join('')}
      <span>${Object.keys(graph.nodes).length}/${fullCount} shown</span>
    </div>
    <div class="roadmap-summary">
      <div><strong>${Object.keys(graph.nodes).length}</strong><span>courses and prereqs</span></div>
      <div><strong>${graph.edges.length}</strong><span>dependency links</span></div>
      <div class="${graph.blockers.length ? 'warn' : 'ok'}"><strong>${graph.blockers.length}</strong><span>blocked planned courses</span></div>
      <div class="${graph.missing.length ? 'warn' : 'ok'}"><strong>${graph.missing.length}</strong><span>missing prereqs</span></div>
    </div>
    <div class="roadmap-legend">
      <span class="passed">Complete</span>
      <span class="available">Ready</span>
      <span class="blocked">Locked</span>
      <span class="missing">Missing</span>
      <span class="goal">Goal</span>
    </div>
    <div class="roadmap-canvas">${roadmapRenderSvg(graph)}</div>
    <div id="roadmap-detail" class="roadmap-detail">${roadmapDefaultDetails(graph)}</div>
  `;
}

document.addEventListener('click', e => {
  const filter = e.target.closest('[data-roadmap-filter]');
  if (filter) {
    roadmapFilter = filter.dataset.roadmapFilter || 'all';
    renderRoadmap();
    return;
  }
  const node = e.target.closest('[data-roadmap-code]');
  if (!node) return;
  roadmapRenderDetail(node.dataset.roadmapCode);
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const node = e.target.closest && e.target.closest('[data-roadmap-code]');
  if (!node) return;
  e.preventDefault();
  roadmapRenderDetail(node.dataset.roadmapCode);
});
