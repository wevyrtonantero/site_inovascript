const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
};

const getBearerToken = (authorization = "") => {
  const [type, token] = authorization.split(" ");
  return type?.toLowerCase() === "bearer" && token ? token : null;
};

const supabaseRequest = async (path, options = {}) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
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
  if (!profile || profile.role !== "admin" || profile.ativo === false) {
    throw Object.assign(new Error("Apenas administradores podem redefinir senha de cliente."), { status: 403 });
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
    const password = String(body.password || "");

    if (!clientId || !password) {
      json(response, 400, { error: "Informe cliente e nova senha." });
      return;
    }

    if (password.length < 6) {
      json(response, 400, { error: "A senha precisa ter pelo menos 6 caracteres." });
      return;
    }

    const clients = await supabaseRequest(
      `/rest/v1/clients?id=eq.${encodeURIComponent(clientId)}&select=id,profile_id,nome_empresa,email,ativo`
    );
    const client = Array.isArray(clients) ? clients[0] : null;

    if (!client || client.ativo === false || !client.profile_id) {
      json(response, 404, { error: "Cliente ativo nao encontrado para redefinicao de senha." });
      return;
    }

    await supabaseRequest(`/auth/v1/admin/users/${encodeURIComponent(client.profile_id)}`, {
      method: "PUT",
      body: JSON.stringify({
        password,
        email_confirm: true,
      }),
    });

    json(response, 200, {
      client: {
        email: client.email,
        id: client.id,
        nome_empresa: client.nome_empresa,
      },
      ok: true,
    });
  } catch (error) {
    json(response, error.status || 500, {
      error: error.message || "Nao foi possivel redefinir a senha do cliente.",
      details: error.body || null,
    });
  }
};
