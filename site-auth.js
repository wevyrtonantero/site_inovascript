const siteSupabaseUrl = "https://iymaeroamjqsgmbyjjgd.supabase.co";
const siteSupabaseKey = "sb_publishable_3LFkB8e4i4acUDdAKTKHlw_Z9vr4tjT";

const siteSupabase = window.supabase.createClient(siteSupabaseUrl, siteSupabaseKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

const loginModal = document.querySelector("[data-login-modal]");
const loginForm = document.querySelector("[data-client-login-form]");
const loginMessage = document.querySelector("[data-client-login-message]");
const openLoginButtons = document.querySelectorAll("[data-open-client-login]");
const closeLoginButtons = document.querySelectorAll("[data-close-client-login]");

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

    window.location.href = data?.role === "admin" ? "./admin.html" : "./portal.html";
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
}
