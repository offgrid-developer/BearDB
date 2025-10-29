const BASE_URL = "http://localhost:8000";

export async function searchBearing(query) {
  const res = await fetch(`${BASE_URL}/search?query=${query}`);
  if (!res.ok) throw new Error("Failed to fetch search results");
  return res.json();
}

export async function addBearing(data) {
  const res = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add bearing");
  return res.json();
}
