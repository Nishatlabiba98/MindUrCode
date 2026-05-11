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

export async function fetchMethod(methodId) {
  const res = await fetch(`${BASE}/analysis/methods/${methodId}`);
  if (!res.ok) throw new Error(`Fetch method failed: ${res.status}`);
  return res.json();
}

export async function fetchLatestResults(repoId, toolType) {
  const res = await fetch(`${BASE}/analysis/results/latest?repoId=${repoId}&toolType=${toolType}`);
  if (!res.ok) throw new Error(`Fetch latest failed: ${res.status}`);
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

// Splits an AI response into a code block and a plain-English explanation.
// Tries three formats in order:
//   1. Fenced code block  (```java ... ```)  — used by most tools
//   2. Javadoc block      (/** ... */)        — used by Documentation tool
//   3. No block found     — full response goes to explanation, code pane falls back to desc
function parseAiResponse(text) {
  if (!text) return { code: '', explanation: '' };

  // 1. Fenced code block
  const codeMatch = text.match(/```(?:java)?\n?([\s\S]*?)```/);
  if (codeMatch) {
    const code = codeMatch[1].trim();
    const explanation = text.replace(/```(?:java)?\n?[\s\S]*?```/g, '').trim();
    return { code, explanation };
  }

  // 2. Javadoc block — Documentation tool returns /** ... */ without backticks
  const javadocMatch = text.match(/(\/\*\*[\s\S]*?\*\/)/);
  if (javadocMatch) {
    const code = javadocMatch[1].trim();
    const explanation = text.replace(/\/\*\*[\s\S]*?\*\//, '').trim();
    return { code, explanation };
  }

  // 3. No recognisable block — show everything as explanation, pane falls back to desc
  return { code: '', explanation: text.trim() };
}

// Maps a ToolResult from the backend to the FindingsPanel format
export function mapToFinding(result) {
  const { code, explanation } = parseAiResponse(result.aiSuggestion);
  return {
    id: result.id,
    sev: statusToSev(result.status),
    tag: result.status,
    tagColor: statusToSev(result.status),
    title: `${result.toolType} suggestion`,
    desc: explanation,   // plain-English explanation — shown in collapsible drawer
    code: code,          // code block — shown in the AI Suggestion pane
    loc: `Method: ${result.methodId}`,
    actions: result.status === 'PENDING' ? ['Approve', 'Edit', 'Reject'] : [],
    _raw: result,
  };
}

function statusToSev(status) {
  if (status === 'APPROVED') return 'green';
  if (status === 'REJECTED') return 'red';
  return 'blue';
}
