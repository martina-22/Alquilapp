// src/utils/authFetch.ts

export const authFetch = async (
  input: RequestInfo,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');

  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(input, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // 🔒 Token inválido o expirado
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_id');
    window.location.href = '/login'; // 🔁 Redirige al login automáticamente
  }

  return response;
};

export const obtenerUsuarioIdDesdeToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.usuario_id || null;
  } catch (e) {
    console.error("❌ Error al decodificar el token JWT", e);
    return null;
  }
};
