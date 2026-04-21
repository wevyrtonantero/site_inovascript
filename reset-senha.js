const resetSupabaseUrl = "https://iymaeroamjqsgmbyjjgd.supabase.co";
const resetSupabaseKey = "sb_publishable_3LFkB8e4i4acUDdAKTKHlw_Z9vr4tjT";

const resetSupabase = window.supabase.createClient(resetSupabaseUrl, resetSupabaseKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

const resetForm = document.querySelector("[data-reset-password-form]");
const resetMessage = document.querySelector("[data-reset-message]");
let recoverySessionReady = false;

const setMessage = (text, tone = "info") => {
  if (!resetMessage) return;
  if (!text) {
    resetMessage.hidden = true;
    resetMessage.className = "admin-message";
    resetMessage.textContent = "";
    return;
  }

  resetMessage.hidden = false;
  resetMessage.className = `admin-message is-${tone}`;
  resetMessage.textContent = text;
};

const setButtonLoading = (button, loading, text = "Salvando...") => {
  if (!button) return;
  if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
  button.disabled = loading;
  button.textContent = loading ? text : button.dataset.defaultText;
};

const getUrlParams = () => ({
  hash: new URLSearchParams(window.location.hash.slice(1)),
  search: new URLSearchParams(window.location.search.slice(1)),
});

const cleanRecoveryUrl = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const showInvalidLinkMessage = () => {
  setMessage(
    "Link invalido ou expirado. Solicite um novo link em 'Esqueci minha senha' e abra o ultimo e-mail recebido.",
    "error"
  );
};

const ensureRecoverySession = async () => {
  const { hash, search } = getUrlParams();
  const errorDescription = hash.get("error_description") || search.get("error_description");

  if (errorDescription) {
    throw new Error(errorDescription.replaceAll("+", " "));
  }

  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await resetSupabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    cleanRecoveryUrl();
  }

  const code = search.get("code");
  if (code) {
    const { error } = await resetSupabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    cleanRecoveryUrl();
  }

  const {
    data: { session },
  } = await resetSupabase.auth.getSession();

  recoverySessionReady = Boolean(session);
  return recoverySessionReady;
};

const checkRecoverySession = async () => {
  try {
    const hasSession = await ensureRecoverySession();
    if (!hasSession) {
      setMessage("Abra esta pagina pelo link de redefinicao enviado para seu e-mail.", "info");
      return;
    }
    setMessage("Link validado. Digite sua nova senha.", "success");
  } catch (error) {
    recoverySessionReady = false;
    setMessage(error.message || "Nao foi possivel validar o link de redefinicao.", "error");
  }
};

resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = resetForm.querySelector('button[type="submit"]');
  const formData = new FormData(resetForm);
  const password = String(formData.get("password") || "");
  const passwordConfirm = String(formData.get("password_confirm") || "");

  if (password.length < 6) {
    setMessage("A senha precisa ter pelo menos 6 caracteres.", "error");
    return;
  }

  if (password !== passwordConfirm) {
    setMessage("As senhas digitadas nao conferem.", "error");
    return;
  }

  if (!recoverySessionReady) {
    const hasSession = await ensureRecoverySession().catch(() => false);
    if (!hasSession) {
      showInvalidLinkMessage();
      return;
    }
  }

  setButtonLoading(button, true, "Atualizando...");
  setMessage("Atualizando sua senha...", "info");

  const { error } = await resetSupabase.auth.updateUser({ password });

  setButtonLoading(button, false);

  if (error) {
    setMessage(error.message || "Nao foi possivel atualizar sua senha.", "error");
    return;
  }

  await resetSupabase.auth.signOut();
  resetForm.reset();
  setMessage("Senha atualizada. Volte ao site e entre com sua nova senha.", "success");
});

resetSupabase.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    setMessage("Link validado. Digite sua nova senha.", "success");
  }
});

checkRecoverySession();
