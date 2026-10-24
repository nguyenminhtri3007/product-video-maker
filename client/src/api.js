const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export async function generateCaption(files, hint) {
  const fd = new FormData();
  for (const f of files) fd.append('images', f);
  if (hint) fd.append('hint', hint);

  const res = await fetch(`${API_BASE}/api/caption`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Lỗi tạo caption');
  return res.json();
}

export async function renderVideo(payload) {
  const res = await fetch(`${API_BASE}/api/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Lỗi render video');
  return res.json();
}

export function assetUrl(p) {
  if (!p) return '';
  return `${API_BASE}${p}`;
}
