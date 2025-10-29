const BASE_URL = "http://localhost:8000";

export async function generateBearing(data) {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addBearing(data) {
  const res = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchBearing(query, k = 5) {
  const res = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}&k=${k}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
