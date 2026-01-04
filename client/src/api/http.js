const API_BASE = "http://localhost:5000/api";

export const apiPost = async (path, body, userId) => {
  const headers = { "Content-Type": "application/json" };
  if (userId) headers["x-user-id"] = userId;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const apiGet = async (path, userId) => {
  const headers = {};
  if (userId) headers["x-user-id"] = userId;

  const res = await fetch(`${API_BASE}${path}`, { headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};


export const apiPatch = async (path, body, userId) => {
  const headers = { "Content-Type": "application/json" };
  if (userId) headers["x-user-id"] = userId;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

