export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
  async get(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },
  async post(endpoint: string, body?: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },
  async patch(endpoint: string, body: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },
  async put(endpoint: string, body: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },
  async delete(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("API Error");
    return res.json();
  }
};
