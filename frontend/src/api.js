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

// Splits an AI response into a severity rating, a code block, and a plain-English explanation.
// Tries three formats in order for the code block:
//   1. Fenced code block  (```java ... ```)  — used by most tools
//   2. Javadoc block      (/** ... */)        — used by Documentation tool
//   3. No block found     — full response goes to explanation, code pane falls back to desc
function parseAiResponse(text) {
  if (!text) return { code: '', explanation: '', severity: 'CLEAR', noIssues: false };

  // Extract severity — search the first 300 characters so we catch it even if the model
  // adds a short preamble before the severity line, or varies the formatting slightly.
  let severity = 'CLEAR';
  let body = text;
  const sevMatch = text.slice(0, 300).match(/SEVERITY:\s*(CLEAR|CONSEQUENTIAL|IMPORTANT)/i);
  if (sevMatch) {
    severity = sevMatch[1].toUpperCase();
    // Strip the entire severity line from wherever it appeared so it doesn't leak into the display
    body = text.replace(/[^\n]*SEVERITY:\s*(CLEAR|CONSEQUENTIAL|IMPORTANT)[^\n]*/i, '').trim();
  }

  // 1. Fenced code block
  const codeMatch = body.match(/```(?:java)?\n?([\s\S]*?)```/);
  if (codeMatch) {
    const code = codeMatch[1].trim();
    const explanation = body.replace(/```(?:java)?\n?[\s\S]*?```/g, '').trim();
    return { code, explanation, severity };
  }

  // 2. Javadoc block — Documentation tool returns /** ... */ without backticks
  const javadocMatch = body.match(/(\/\*\*[\s\S]*?\*\/)/);
  if (javadocMatch) {
    const code = javadocMatch[1].trim();
    const explanation = body.replace(/\/\*\*[\s\S]*?\*\//, '').trim();
    return { code, explanation, severity };
  }

  // 3. No recognisable block — show everything as explanation, pane falls back to desc
  return { code: '', explanation: body.trim(), severity };
}

// Maps a severity string to a dot/tag color
function severityToColor(severity) {
  if (severity === 'IMPORTANT')     return 'red';
  if (severity === 'CONSEQUENTIAL') return 'orange';
  return 'blue'; // CLEAR
}

// Maps a ToolResult from the backend to the FindingsPanel format.
export function mapToFinding(result) {
  const { code, explanation, severity } = parseAiResponse(result.aiSuggestion);
  const color = severityToColor(severity);
  return {
    id: result.id,
    sev: color,
    tag: severity,
    tagColor: color,
    title: `${result.toolType} suggestion`,
    desc: explanation,   // plain-English explanation — shown in collapsible drawer
    code: code,          // code block — shown in the AI Suggestion pane
    loc: `Method: ${result.methodId}`,
    actions: result.status === 'PENDING' ? ['Approve', 'Edit', 'Reject'] : [],
    _raw: result,
  };
}
