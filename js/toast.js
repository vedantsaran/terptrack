'use strict';
/* ============================================================
   TOAST NOTIFICATIONS — a small replacement for alert()
   ============================================================ */

let _toastContainer = null;

function _ensureToastContainer() {
  if (_toastContainer) return _toastContainer;
  _toastContainer = document.createElement('div');
  _toastContainer.className = 'toast-container';
  document.body.appendChild(_toastContainer);
  return _toastContainer;
}

function showToast(message, kind, durationMs) {
  const t = document.createElement('div');
  t.className = `toast toast-${kind || 'info'}`;
  t.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  t.textContent = message;
  const dismiss = document.createElement('button');
  dismiss.className = 'toast-x';
  dismiss.textContent = '×';
  dismiss.setAttribute('aria-label', 'Dismiss');
  dismiss.addEventListener('click', () => t.remove());
  t.appendChild(dismiss);
  _ensureToastContainer().appendChild(t);
  // Force animate in
  requestAnimationFrame(() => t.classList.add('show'));
  const ttl = durationMs ?? (kind === 'error' ? 6000 : 3000);
  if (ttl > 0) setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 220);
  }, ttl);
  return t;
}

// Conveniences
function toastInfo(m, ms)    { return showToast(m, 'info', ms); }
function toastSuccess(m, ms) { return showToast(m, 'success', ms); }
function toastError(m, ms)   { return showToast(m, 'error', ms); }
