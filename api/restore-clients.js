const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
};

const getBearerToken = (authorization = "") => {
  const [type, token] = authorization.split(" ");
  return type?.toLowerCase() === "bearer" && token ? token : null;
};

const isAdminRole = (role) => ["admin", "administrador"].includes(String(role || "").toLowerCase());

const supabaseRequest = async (path, options = {}) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.message || body?.error_description || body?.error || "Erro ao consultar Supabase.";
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
};

const getCurrentUser = async (accessToken) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw Object.assign(new Error("Sessao invalida. Entre novamente no portal."), { status: 401, body });
  }

  return body;
};

const ensureAdmin = async (userId) => {
  const profiles = await supabaseRequest(
    `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,role,ativo`
  );

  const profile = Array.isArray(profiles) ? profiles[0] : null;
  if (!profile || !isAdminRole(profile.role) || profile.ativo === false) {
    throw Object.assign(new Error("Apenas administradores podem restaurar clientes."), { status: 403 });
  }
};

const buildInFilter = (ids) => ids.map((id) => encodeURIComponent(id)).join(",");

module.exports = async (request, response) => {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method !== "POST") {
    json(response, 405, { error: "Metodo nao permitido." });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    json(response, 500, {
      error: "Variaveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configuradas na Vercel.",
    });
    return;
  }

  try {
    const accessToken = getBearerToken(request.headers.authorization);
    if (!accessToken) {
      json(response, 401, { error: "Sessao administrativa nao encontrada." });
      return;
    }

    const adminUser = await getCurrentUser(accessToken);
    await ensureAdmin(adminUser.id);

    const inactiveClients = await supabaseRequest(
      "/rest/v1/clients?ativo=eq.false&select=id,profile_id,nome_empresa,email"
    );

    if (!Array.isArray(inactiveClients) || !inactiveClients.length) {
      json(response, 200, {
        ok: true,
        restored_clients: 0,
        restored_profiles: 0,
        restored_projects: 0,
      });
      return;
    }

    const clientIds = inactiveClients.map((client) => client.id).filter(Boolean);
    const profileIds = inactiveClients.map((client) => client.profile_id).filter(Boolean);

    const restoredClients = clientIds.length
      ? await supabaseRequest(`/rest/v1/clients?id=in.(${buildInFilter(clientIds)})`, {
          method: "PATCH",
          body: JSON.stringify({ ativo: true }),
        })
      : [];

    const restoredProjects = clientIds.length
      ? await supabaseRequest(`/rest/v1/projects?client_id=in.(${buildInFilter(clientIds)})`, {
          method: "PATCH",
          body: JSON.stringify({ ativo: true }),
        })
      : [];

    const restoredProfiles = profileIds.length
      ? await supabaseRequest(`/rest/v1/profiles?id=in.(${buildInFilter(profileIds)})`, {
          method: "PATCH",
          body: JSON.stringify({ ativo: true }),
        })
      : [];

    json(response, 200, {
      ok: true,
      restored_clients: Array.isArray(restoredClients) ? restoredClients.length : 0,
      restored_profiles: Array.isArray(restoredProfiles) ? restoredProfiles.length : 0,
      restored_projects: Array.isArray(restoredProjects) ? restoredProjects.length : 0,
    });
  } catch (error) {
    json(response, error.status || 500, {
      error: error.message || "Nao foi possivel restaurar clientes.",
      details: error.body || null,
    });
  }
};
