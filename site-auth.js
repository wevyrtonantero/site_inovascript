const siteSupabaseUrl = "https://iymaeroamjqsgmbyjjgd.supabase.co";
const siteSupabaseKey = "sb_publishable_3LFkB8e4i4acUDdAKTKHlw_Z9vr4tjT";

const recoveryParams = new URLSearchParams(window.location.hash.slice(1) || window.location.search.slice(1));
const isRecoveryLink =
  recoveryParams.get("type") === "recovery" ||
  recoveryParams.has("access_token") ||
  recoveryParams.has("code");

if (isRecoveryLink && !window.location.pathname.endsWith("/reset-senha.html")) {
  window.location.replace(`./reset-senha.html${window.location.search}${window.location.hash}`);
}

const siteSupabase = window.supabase.createClient(siteSupabaseUrl, siteSupabaseKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: !isRecoveryLink,
    persistSession: true,
  },
});

const loginModal = document.querySelector("[data-login-modal]");
const loginForm = document.querySelector("[data-client-login-form]");
const loginMessage = document.querySelector("[data-client-login-message]");
const openLoginButtons = document.querySelectorAll("[data-open-client-login]");
const closeLoginButtons = document.querySelectorAll("[data-close-client-login]");
const forgotPasswordButton = document.querySelector("[data-forgot-password]");
const isAdminRole = (role) => ["admin", "administrador"].includes(String(role || "").toLowerCase());

if (loginModal && loginForm) {
  const setMessage = (text, tone = "info") => {
    if (!loginMessage) return;

    if (!text) {
      loginMessage.hidden = true;
      loginMessage.className = "login-modal-message";
      loginMessage.textContent = "";
      return;
    }

    loginMessage.hidden = false;
    loginMessage.className = `login-modal-message is-${tone}`;
    loginMessage.textContent = text;
  };

  const toggleLoading = (button, isLoading, loadingText) => {
    if (!button) return;
    if (!button.dataset.defaultText) {
      button.dataset.defaultText = button.textContent;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : button.dataset.defaultText;
  };

  const openModal = () => {
    const siteMenu = document.querySelector(".header-panel");
    const menuToggle = document.querySelector(".menu-toggle");
    siteMenu?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");

    loginModal.hidden = false;
    document.body.classList.add("modal-open");
    setMessage("");

    const emailInput = loginForm.querySelector('input[name="email"]');
    window.setTimeout(() => emailInput?.focus(), 40);
  };

  const closeModal = () => {
    loginModal.hidden = true;
    document.body.classList.remove("modal-open");
    setMessage("");
    loginForm.reset();
  };

  const redirectToPortal = async () => {
    const {
      data: { user },
    } = await siteSupabase.auth.getUser();

    if (!user) {
      window.location.href = "./portal.html";
      return;
    }

    const { data } = await siteSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    window.location.href = isAdminRole(data?.role) ? "./admin.html" : "./portal.html";
  };

  openLoginButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const {
        data: { session },
      } = await siteSupabase.auth.getSession();

      if (session) {
        await redirectToPortal();
        return;
      }

      openModal();
    });
  });

  closeLoginButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !loginModal.hidden) {
      closeModal();
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = loginForm.querySelector('button[type="submit"]');
    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setMessage("Preencha e-mail e senha para entrar.", "error");
      return;
    }

    toggleLoading(submitButton, true, "Entrando...");
    setMessage("Validando seu acesso...", "info");

    const { error } = await siteSupabase.auth.signInWithPassword({
      email,
      password,
    });

    toggleLoading(submitButton, false);

    if (error) {
      setMessage("Não foi possível entrar. Confira e-mail e senha e tente novamente.", "error");
      return;
    }

    setMessage("Acesso confirmado. Abrindo seu painel...", "success");
    window.setTimeout(() => {
      redirectToPortal();
    }, 320);
  });

  forgotPasswordButton?.addEventListener("click", async () => {
    const emailInput = loginForm.querySelector('input[name="email"]');
    const email = String(emailInput?.value || "").trim();

    if (!email) {
      setMessage("Digite seu e-mail de login e clique em esqueci minha senha novamente.", "error");
      emailInput?.focus();
      return;
    }

    forgotPasswordButton.disabled = true;
    setMessage("Enviando link de redefinicao para seu e-mail...", "info");

    const { error } = await siteSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-senha.html`,
    });

    forgotPasswordButton.disabled = false;

    if (error) {
      setMessage(error.message || "Nao foi possivel enviar o link de redefinicao.", "error");
      return;
    }

    setMessage("Se este e-mail estiver cadastrado, voce recebera um link para criar uma nova senha.", "success");
  });
}
