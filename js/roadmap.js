'use strict';
/* ============================================================
   ROADMAP VIEW (mini prereq graph)
   ============================================================ */
function renderRoadmap() {
  // Show the prereq graph for goal courses + their chain
  const focusCourses = ["CMSC 131", "CMSC 132", "CMSC 216", "CMSC 250", "MATH 140", "MATH 141",
    "ENEE 290", "CMSC 320", "CMSC 330", "CMSC 351", "ENEE 436", "CMSC 451", "CMSC 472"];
  // Layout — group by depth
  const layers = {
    0: ["MATH 140", "CMSC 131"],
    1: ["MATH 141", "CMSC 132"],
    2: ["ENEE 290", "CMSC 216", "CMSC 250"],
    3: ["CMSC 330", "CMSC 351", "CMSC 320"],
    4: ["ENEE 436", "CMSC 451", "CMSC 472"],
  };
  const nodeW = 110, nodeH = 40, gapX = 30, gapY = 70;
  const layerCount = Object.keys(layers).length;
  const maxPerLayer = Math.max(...Object.values(layers).map(l => l.length));
  const svgW = layerCount * (nodeW + gapX) + 80;
  const svgH = maxPerLayer * (nodeH + gapY) + 80;

  const positions = {};
  Object.keys(layers).forEach((lk) => {
    const li = parseInt(lk);
    const items = layers[lk];
    const totalH = items.length * (nodeH + gapY) - gapY;
    const startY = (svgH - totalH) / 2;
    items.forEach((code, i) => {
      positions[code] = {
        x: 40 + li * (nodeW + gapX),
        y: startY + i * (nodeH + gapY),
      };
    });
  });

  // Build edges
  const edges = [];
  focusCourses.forEach(code => {
    const c = findCourse(code);
    if (!c) return;
    c.prereqs.forEach(p => {
      if (positions[p]) {
        const ps = getCourseState(p);
        const cs = getCourseState(code);
        let cls = '';
        if (ps.status === "passed" || ps.status === "transfer") cls = 'satisfied';
        else if (cs.status === "not-started" && ps.status !== "passed") cls = 'blocked';
        edges.push({ from: p, to: code, cls });
      }
    });
  });

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--line-strong)"/>
      </marker>
    </defs>`;
  // edges first
  edges.forEach(e => {
    const a = positions[e.from], b = positions[e.to];
    const x1 = a.x + nodeW, y1 = a.y + nodeH/2;
    const x2 = b.x, y2 = b.y + nodeH/2;
    const cx = (x1 + x2) / 2;
    svg += `<path class="edge ${e.cls}" d="M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}"/>`;
  });
  // nodes
  Object.keys(positions).forEach(code => {
    const p = positions[code];
    const c = findCourse(code);
    if (!c) return;
    const s = getCourseState(code);
    const pre = prereqsMet(c);
    let cls = '';
    if (s.status === "passed" || s.status === "transfer") cls = 'passed';
    else if (s.status === "in-progress") cls = 'in-progress';
    else if (s.status === "failed") cls = 'failed';
    else if (pre.met) cls = 'available';
    const goal = isGoalCourse(c);
    if (goal) cls += ' goal';
    svg += `<rect class="node-rect ${cls}" x="${p.x}" y="${p.y}" width="${nodeW}" height="${nodeH}"/>`;
    svg += `<text class="node-text" x="${p.x + nodeW/2}" y="${p.y + 17}" text-anchor="middle">${code}</text>`;
    svg += `<text class="node-text muted" x="${p.x + nodeW/2}" y="${p.y + 30}" text-anchor="middle" style="font-size:9px">${c.cr} cr${goal ? ' ★' : ''}</text>`;
  });
  svg += '</svg>';
  document.getElementById('roadmap-container').innerHTML = svg;
}

