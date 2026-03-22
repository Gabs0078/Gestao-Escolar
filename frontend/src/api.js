// Em produção (Docker): deixe vazio para usar /api no mesmo host (Nginx faz proxy ao backend).
// Só defina VITE_API_URL se precisar apontar para outro servidor (ex.: testes).
const base = import.meta.env.VITE_API_URL ?? "";

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Erro na requisição");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}
