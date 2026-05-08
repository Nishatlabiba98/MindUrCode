const BASE = 'http://localhost:8080/api';

export async function getReposByUser(userId) {
  const res = await fetch(`${BASE}/repositories/user/${userId}`);
  if (!res.ok) throw new Error(`Load failed: ${res.status}`);
  return res.json();
}

export async function submitRepo(name, sourcePath, userId) {
  const params = new URLSearchParams({ name, sourcePath, userId });
  const res = await fetch(`${BASE}/repositories?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
  return res.json();
}

export async function runAnalysis(repoId, toolType) {
  const res = await fetch(
    `${BASE}/analysis/run?repoId=${repoId}&toolType=${toolType}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);
  return res.json();
}

export async function approveResult(id) {
  const res = await fetch(`${BASE}/analysis/results/${id}/approve`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Approve failed: ${res.status}`);
  return res.json();
}

export async function rejectResult(id) {
  const res = await fetch(`${BASE}/analysis/results/${id}/reject`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Reject failed: ${res.status}`);
  return res.json();
}

// Maps a ToolResult from the backend to the FindingsPanel format
export function mapToFinding(result) {
  return {
    id: result.id,
    sev: statusToSev(result.status),
    tag: result.status,
    tagColor: statusToSev(result.status),
    title: `${result.toolType} suggestion`,
    desc: result.aiSuggestion,
    loc: `Method: ${result.methodId}`,
    actions: result.status === 'PENDING' ? ['Approve', 'Reject'] : [],
    _raw: result,
  };
}

function statusToSev(status) {
  if (status === 'APPROVED') return 'green';
  if (status === 'REJECTED') return 'red';
  return 'blue';
}
