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
    throw Object.assign(new Error("Apenas administradores podem excluir cliente."), { status: 403 });
  }
};

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

    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const clientId = String(body.client_id || "").trim();

    if (!clientId) {
      json(response, 400, { error: "Informe o cliente para excluir." });
      return;
    }

    const clients = await supabaseRequest(
      `/rest/v1/clients?id=eq.${encodeURIComponent(clientId)}&select=id,profile_id,nome_empresa,email,ativo`
    );
    const client = Array.isArray(clients) ? clients[0] : null;

    if (!client || client.ativo === false) {
      json(response, 404, { error: "Cliente ativo nao encontrado." });
      return;
    }

    await supabaseRequest(`/rest/v1/projects?client_id=eq.${encodeURIComponent(client.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ ativo: false }),
    });

    await supabaseRequest(`/rest/v1/clients?id=eq.${encodeURIComponent(client.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ ativo: false }),
    });

    if (client.profile_id) {
      await supabaseRequest(`/rest/v1/profiles?id=eq.${encodeURIComponent(client.profile_id)}`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: false }),
      });
    }

    json(response, 200, {
      client: {
        id: client.id,
        nome_empresa: client.nome_empresa,
      },
      ok: true,
    });
  } catch (error) {
    json(response, error.status || 500, {
      error: error.message || "Nao foi possivel excluir o cliente.",
      details: error.body || null,
    });
  }
};
