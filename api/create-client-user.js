const { randomUUID } = require("crypto");

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
    throw Object.assign(new Error("Apenas administradores podem criar acesso de cliente."), { status: 403 });
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
    const nomeEmpresa = String(body.nome_empresa || "").trim();
    const responsavel = String(body.responsavel || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const telefone = String(body.telefone || "").trim() || null;
    const observacao = String(body.observacao || "").trim() || null;

    if (!nomeEmpresa || !email || !password) {
      json(response, 400, { error: "Informe empresa, e-mail e senha do cliente." });
      return;
    }

    if (password.length < 6) {
      json(response, 400, { error: "A senha precisa ter pelo menos 6 caracteres." });
      return;
    }

    const authUserResponse = await supabaseRequest("/auth/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome: responsavel || nomeEmpresa,
          nome_empresa: nomeEmpresa,
        },
      }),
    });

    const authUser = authUserResponse.user || authUserResponse;
    const profileId = authUser.id;

    if (!profileId) {
      throw new Error("Usuario criado, mas o Supabase nao retornou o ID do acesso.");
    }
    const clientId = randomUUID();

    await supabaseRequest("/rest/v1/profiles?on_conflict=id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          id: profileId,
          nome: responsavel || nomeEmpresa,
          email,
          role: "cliente",
          ativo: true,
        },
      ]),
    });

    const [client] = await supabaseRequest("/rest/v1/clients?on_conflict=id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          id: clientId,
          profile_id: profileId,
          nome_empresa: nomeEmpresa,
          responsavel: responsavel || null,
          telefone,
          email,
          observacao,
          ativo: true,
        },
      ]),
    });

    try {
      await supabaseRequest("/rest/v1/client_users?on_conflict=client_id,profile_id", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify([
          {
            client_id: clientId,
            profile_id: profileId,
            role: "cliente",
            ativo: true,
          },
        ]),
      });
    } catch (_error) {
      // A tabela client_users e opcional nesta fase; o vinculo principal continua em clients.profile_id.
    }

    json(response, 201, {
      client,
      profile: {
        id: profileId,
        email,
        nome: responsavel || nomeEmpresa,
        role: "cliente",
      },
    });
  } catch (error) {
    const status = error.status && error.status >= 400 ? error.status : 500;
    json(response, status, {
      error: error.message || "Nao foi possivel criar o cliente agora.",
    });
  }
};
