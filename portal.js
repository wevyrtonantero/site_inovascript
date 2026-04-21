const supabaseUrl = "https://iymaeroamjqsgmbyjjgd.supabase.co";
const supabaseKey = "sb_publishable_3LFkB8e4i4acUDdAKTKHlw_Z9vr4tjT";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

const state = {
  clients: [],
  details: new Map(),
  profile: null,
  selectedServiceId: null,
  services: [],
};

const elements = {
  cards: document.querySelector("[data-client-cards]"),
  clientCompany: document.querySelector("[data-client-company]"),
  clientLogin: document.querySelector("[data-client-login]"),
  clientPerson: document.querySelector("[data-client-person]"),
  feedbackForm: document.querySelector("[data-feedback-form]"),
  feedbackList: document.querySelector("[data-feedback-list]"),
  forgotPassword: document.querySelector("[data-forgot-password]"),
  loading: document.querySelector("[data-client-loading]"),
  loginForm: document.querySelector("[data-client-login-form]"),
  loginMessage: document.querySelector("[data-client-login-message]"),
  logout: document.querySelector("[data-client-logout]"),
  message: document.querySelector("[data-client-message]"),
  pageSubtitle: document.querySelector("[data-page-subtitle]"),
  pageTitle: document.querySelector("[data-page-title]"),
  refresh: document.querySelector("[data-client-refresh]"),
  selectedServiceMeta: document.querySelector("[data-selected-service-meta]"),
  selectedServiceName: document.querySelector("[data-selected-service-name]"),
  serviceList: document.querySelector("[data-service-list]"),
  serviceSummary: document.querySelector("[data-service-summary]"),
  shell: document.querySelector("[data-client-shell]"),
  stepList: document.querySelector("[data-step-list]"),
  updateList: document.querySelector("[data-update-list]"),
};

const tabButtons = document.querySelectorAll("[data-tab-button]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");

const projectStatusLabels = {
  aguardando_cliente: "Aguardando cliente",
  briefing: "Briefing",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  homologacao: "Homologação",
  pausado: "Pausado",
};

const projectStatusTones = {
  aguardando_cliente: "amber",
  briefing: "blue",
  em_andamento: "blue",
  finalizado: "green",
  homologacao: "amber",
  pausado: "red",
};

const stepStatusLabels = {
  bloqueado: "Bloqueado",
  concluido: "Concluído",
  em_andamento: "Em andamento",
  nao_possivel: "Não possível",
  pendente: "Pendente",
};

const feedbackStatusLabels = {
  concluido: "Concluído",
  em_analise: "Em análise",
  nao_possivel: "Não possível",
  pendente: "Pendente",
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDate = (value) => {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
};

const getLabel = (map, key) => map[key] || "Não definido";
const getTone = (key) => projectStatusTones[key] || "blue";
const selectedService = () => state.services.find((service) => service.id === state.selectedServiceId) || null;
const selectedDetails = () => state.details.get(state.selectedServiceId) || { feedbacks: [], steps: [], updates: [] };

const setMessage = (element, text, tone = "info") => {
  if (!element) return;
  if (!text) {
    element.hidden = true;
    element.className = "admin-message";
    element.textContent = "";
    return;
  }
  element.hidden = false;
  element.className = `admin-message is-${tone}`;
  element.textContent = text;
};

const setButtonLoading = (button, loading, text = "Carregando...") => {
  if (!button) return;
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }
  button.disabled = loading;
  button.textContent = loading ? text : button.dataset.defaultText;
};

const activateTab = (name) => {
  tabButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.tabButton === name));
  tabPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.tabPanel === name));
};

const renderCards = () => {
  const total = state.services.length;
  const active = state.services.filter((service) => service.status === "em_andamento").length;
  const waiting = state.services.filter((service) => service.status === "aguardando_cliente").length;
  const average = total
    ? Math.round(state.services.reduce((sum, service) => sum + Number(service.percentual || 0), 0) / total)
    : 0;

  const cards = [
    ["Serviços", total, "entregas cadastradas"],
    ["Em andamento", active, "serviços em execução"],
    ["Aguardando você", waiting, "serviços esperando retorno"],
    ["Progresso médio", `${average}%`, "média dos seus serviços"],
  ];

  elements.cards.innerHTML = cards
    .map(
      ([label, value, note]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
          <p>${escapeHtml(note)}</p>
        </article>
      `
    )
    .join("");
};

const renderClientInfo = () => {
  const client = state.clients[0];
  elements.clientCompany.textContent = client?.nome_empresa || "Cliente";
  elements.clientPerson.textContent = client?.responsavel || state.profile?.email || "";
  elements.pageTitle.textContent = client?.nome_empresa || "Portal do cliente";
  elements.pageSubtitle.textContent = "Acompanhe seus serviços, cronograma, links e conversa.";
};

const renderServiceList = () => {
  if (!state.services.length) {
    elements.serviceList.innerHTML = `<div class="empty-block">Nenhum serviço liberado ainda.</div>`;
    return;
  }

  elements.serviceList.innerHTML = state.services
    .map((service) => {
      const active = service.id === state.selectedServiceId;
      return `
        <button class="service-card${active ? " is-active" : ""}" type="button" data-service-id="${service.id}">
          <strong>${escapeHtml(service.nome)}</strong>
          <span>${escapeHtml(getLabel(projectStatusLabels, service.status))} - ${escapeHtml(service.percentual ?? 0)}%</span>
        </button>
      `;
    })
    .join("");

  elements.serviceList.querySelectorAll("[data-service-id]").forEach((button) => {
    button.addEventListener("click", () => selectService(button.dataset.serviceId, true));
  });
};

const renderSelectedService = () => {
  const service = selectedService();
  if (!service) {
    elements.selectedServiceName.textContent = "Nenhum serviço selecionado";
    elements.selectedServiceMeta.textContent = "Selecione um serviço na lateral.";
    return;
  }
  elements.selectedServiceName.textContent = service.nome;
  elements.selectedServiceMeta.textContent = `${getLabel(projectStatusLabels, service.status)} - ${service.percentual || 0}% concluído`;
};

const renderSummary = () => {
  const service = selectedService();
  if (!service) {
    elements.serviceSummary.innerHTML = `<div class="empty-block">Selecione um serviço para ver o resumo.</div>`;
    return;
  }

  const progress = Math.max(0, Math.min(Number(service.percentual || 0), 100));
  elements.serviceSummary.innerHTML = `
    <div class="service-summary-hero">
      <div>
        <span class="status-pill" data-tone="${getTone(service.status)}">${escapeHtml(getLabel(projectStatusLabels, service.status))}</span>
        <h3>${escapeHtml(service.nome)}</h3>
        <p>${escapeHtml(service.descricao || "Serviço em acompanhamento pela InovaScript.")}</p>
      </div>
      <div class="progress-line"><span style="width: ${progress}%"></span></div>
      <strong>${progress}% concluído</strong>
      <div class="summary-chips">
        <span class="summary-chip">Início: ${escapeHtml(formatDate(service.data_inicio))}</span>
        <span class="summary-chip">Previsão: ${escapeHtml(formatDate(service.data_previsao))}</span>
      </div>
      <div class="summary-chips">
        ${
          service.url_preview
            ? `<a class="admin-button admin-button-secondary" href="${escapeHtml(service.url_preview)}" target="_blank" rel="noreferrer">Abrir preview</a>`
            : `<span class="summary-chip">Preview ainda não liberado</span>`
        }
        ${
          service.url_producao
            ? `<a class="admin-button admin-button-secondary" href="${escapeHtml(service.url_producao)}" target="_blank" rel="noreferrer">Abrir publicado</a>`
            : `<span class="summary-chip">Publicado ainda não liberado</span>`
        }
      </div>
    </div>
  `;
};

const renderSteps = () => {
  const steps = selectedDetails().steps || [];
  if (!state.selectedServiceId) {
    elements.stepList.innerHTML = `<div class="empty-block">Selecione um serviço para ver o cronograma.</div>`;
    return;
  }
  if (!steps.length) {
    elements.stepList.innerHTML = `<div class="empty-block">Nenhuma etapa publicada ainda.</div>`;
    return;
  }
  elements.stepList.innerHTML = steps
    .map(
      (step) => `
        <article class="list-item">
          <div>
            <strong>${escapeHtml(step.titulo)}</strong>
            <span>${escapeHtml(getLabel(stepStatusLabels, step.status))} - ${escapeHtml(step.percentual ?? 0)}%</span>
            <small>Previsto: ${escapeHtml(formatDate(step.data_prevista))}</small>
            ${step.justificativa ? `<small>Justificativa: ${escapeHtml(step.justificativa)}</small>` : ""}
          </div>
        </article>
      `
    )
    .join("");
};

const renderUpdates = () => {
  const updates = selectedDetails().updates || [];
  if (!state.selectedServiceId) {
    elements.updateList.innerHTML = `<div class="empty-block">Selecione um serviço para ver atualizações.</div>`;
    return;
  }
  if (!updates.length) {
    elements.updateList.innerHTML = `<div class="empty-block">Nenhuma atualização publicada ainda.</div>`;
    return;
  }
  elements.updateList.innerHTML = updates
    .map(
      (update) => `
        <article class="list-item">
          <div>
            <strong>${escapeHtml(update.titulo)}</strong>
            <span>${escapeHtml(update.descricao || "Sem descrição adicional")}</span>
            <small>${escapeHtml(formatDate(update.created_at))}</small>
          </div>
          ${
            update.url_anexo
              ? `<div class="list-actions"><a class="admin-button admin-button-secondary" href="${escapeHtml(update.url_anexo)}" target="_blank" rel="noreferrer">Abrir link</a></div>`
              : ""
          }
        </article>
      `
    )
    .join("");
};

const renderFeedbacks = () => {
  const feedbacks = selectedDetails().feedbacks || [];
  if (!state.selectedServiceId) {
    elements.feedbackList.innerHTML = `<div class="empty-block">Selecione um serviço para ver a conversa.</div>`;
    return;
  }
  if (!feedbacks.length) {
    elements.feedbackList.innerHTML = `<div class="empty-block">Nenhuma mensagem enviada ainda.</div>`;
    return;
  }
  elements.feedbackList.innerHTML = feedbacks
    .map(
      (feedback) => `
        <article class="list-item">
          <div>
            <strong>${escapeHtml(feedback.mensagem)}</strong>
            <span>${escapeHtml(getLabel(feedbackStatusLabels, feedback.status))} - ${escapeHtml(formatDate(feedback.created_at))}</span>
            ${feedback.resposta_admin ? `<small>Resposta InovaScript: ${escapeHtml(feedback.resposta_admin)}</small>` : ""}
          </div>
        </article>
      `
    )
    .join("");
};

const renderAll = () => {
  renderCards();
  renderClientInfo();
  renderServiceList();
  renderSelectedService();
  renderSummary();
  renderSteps();
  renderUpdates();
  renderFeedbacks();
};

const loadProfile = async (userId) => {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, nome, email, role, ativo")
    .eq("id", userId)
    .single();

  if (error) throw error;
  if (!data?.ativo) throw new Error("Seu acesso está inativo. Fale com a InovaScript.");
  if (data.role === "admin") {
    window.location.replace("./admin.html");
    return null;
  }
  state.profile = data;
  return data;
};

const loadClients = async () => {
  const { data, error } = await supabaseClient
    .from("clients")
    .select("id, profile_id, nome_empresa, responsavel, telefone, email, observacao, ativo, created_at")
    .eq("profile_id", state.profile.id)
    .order("nome_empresa", { ascending: true });

  if (error) throw error;
  state.clients = data || [];
};

const loadServices = async () => {
  const clientIds = state.clients.map((client) => client.id);
  if (!clientIds.length) {
    state.services = [];
    return;
  }

  const { data, error } = await supabaseClient
    .from("projects")
    .select("id, client_id, nome, descricao, url_preview, url_producao, status, percentual, data_inicio, data_previsao, data_finalizacao, observacao, ativo, created_at")
    .in("client_id", clientIds)
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  state.services = data || [];
};

const fetchServiceDetails = async (serviceId, force = false) => {
  if (!serviceId) return { feedbacks: [], steps: [], updates: [] };
  if (!force && state.details.has(serviceId)) return state.details.get(serviceId);

  const [steps, updates, feedbacks] = await Promise.all([
    supabaseClient
      .from("project_steps")
      .select("id, titulo, descricao, status, percentual, ordem, data_prevista, data_conclusao, justificativa")
      .eq("project_id", serviceId)
      .order("ordem", { ascending: true }),
    supabaseClient
      .from("project_updates")
      .select("id, titulo, descricao, url_anexo, visivel_cliente, created_at")
      .eq("project_id", serviceId)
      .eq("visivel_cliente", true)
      .order("created_at", { ascending: false }),
    supabaseClient
      .from("feedbacks")
      .select("id, mensagem, status, resposta_admin, concluido, created_at")
      .eq("project_id", serviceId)
      .order("created_at", { ascending: false }),
  ]);

  if (steps.error) throw steps.error;
  if (updates.error) throw updates.error;
  if (feedbacks.error) throw feedbacks.error;

  const details = {
    feedbacks: feedbacks.data || [],
    steps: steps.data || [],
    updates: updates.data || [],
  };
  state.details.set(serviceId, details);
  return details;
};

const selectService = async (serviceId, force = false) => {
  state.selectedServiceId = serviceId || null;
  await fetchServiceDetails(state.selectedServiceId, force);
  renderAll();
};

const loadPortal = async (session) => {
  const profile = await loadProfile(session.user.id);
  if (!profile) return;

  await loadClients();
  await loadServices();
  state.selectedServiceId = state.services[0]?.id || null;
  if (state.selectedServiceId) {
    await fetchServiceDetails(state.selectedServiceId, true);
  }

  elements.loading.hidden = true;
  elements.clientLogin.hidden = true;
  elements.shell.hidden = false;
  renderAll();
};

const handleLogin = async (event) => {
  event.preventDefault();
  const button = elements.loginForm.querySelector('button[type="submit"]');
  const formData = new FormData(elements.loginForm);
  setButtonLoading(button, true, "Entrando...");
  setMessage(elements.loginMessage, "Validando seu acesso...", "info");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
  });

  setButtonLoading(button, false);
  if (error) {
    setMessage(elements.loginMessage, "Não foi possível entrar. Confira e-mail e senha.", "error");
    return;
  }

  try {
    await loadPortal(data.session);
  } catch (loadError) {
    setMessage(elements.loginMessage, loadError.message || "Não foi possível carregar seu portal.", "error");
  }
};

const handleForgotPassword = async () => {
  const emailInput = elements.loginForm.querySelector('input[name="email"]');
  const email = String(emailInput?.value || "").trim();

  if (!email) {
    setMessage(elements.loginMessage, "Digite seu e-mail de login antes de pedir a redefinicao.", "error");
    emailInput?.focus();
    return;
  }

  setButtonLoading(elements.forgotPassword, true, "Enviando...");
  setMessage(elements.loginMessage, "Enviando link de redefinicao para seu e-mail...", "info");

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-senha.html`,
  });

  setButtonLoading(elements.forgotPassword, false);

  if (error) {
    setMessage(elements.loginMessage, error.message || "Nao foi possivel enviar o link de redefinicao.", "error");
    return;
  }

  setMessage(elements.loginMessage, "Se este e-mail estiver cadastrado, voce recebera um link para criar uma nova senha.", "success");
};

const handleRefresh = async () => {
  setButtonLoading(elements.refresh, true, "Atualizando...");
  state.details.clear();
  try {
    await loadClients();
    await loadServices();
    if (!state.services.some((service) => service.id === state.selectedServiceId)) {
      state.selectedServiceId = state.services[0]?.id || null;
    }
    if (state.selectedServiceId) await fetchServiceDetails(state.selectedServiceId, true);
    renderAll();
    setMessage(elements.message, "Portal atualizado.", "success");
  } catch (error) {
    setMessage(elements.message, error.message || "Não foi possível atualizar.", "error");
  } finally {
    setButtonLoading(elements.refresh, false);
  }
};

const handleLogout = async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "./index.html";
};

const handleFeedbackSubmit = async (event) => {
  event.preventDefault();
  const service = selectedService();
  if (!service) {
    setMessage(elements.message, "Selecione um serviço antes de enviar mensagem.", "error");
    return;
  }

  const button = elements.feedbackForm.querySelector('button[type="submit"]');
  const formData = new FormData(elements.feedbackForm);
  const mensagem = String(formData.get("mensagem") || "").trim();
  if (!mensagem) return;

  setButtonLoading(button, true, "Enviando...");
  const { error } = await supabaseClient.from("feedbacks").insert({
    author_profile_id: state.profile.id,
    client_id: service.client_id,
    mensagem,
    project_id: service.id,
    status: "pendente",
  });
  setButtonLoading(button, false);

  if (error) {
    setMessage(elements.message, error.message || "Não foi possível enviar a mensagem.", "error");
    return;
  }

  elements.feedbackForm.reset();
  await fetchServiceDetails(service.id, true);
  renderFeedbacks();
  activateTab("conversa");
  setMessage(elements.message, "Mensagem enviada.", "success");
};

const bootstrap = async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    elements.loading.hidden = true;
    elements.clientLogin.hidden = false;
    return;
  }

  try {
    await loadPortal(session);
  } catch (error) {
    elements.loading.hidden = true;
    elements.clientLogin.hidden = false;
    setMessage(elements.loginMessage, error.message || "Não foi possível carregar seu portal.", "error");
  }
};

elements.loginForm.addEventListener("submit", handleLogin);
elements.forgotPassword.addEventListener("click", handleForgotPassword);
elements.refresh.addEventListener("click", handleRefresh);
elements.logout.addEventListener("click", handleLogout);
elements.feedbackForm.addEventListener("submit", handleFeedbackSubmit);
tabButtons.forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.tabButton)));

bootstrap();
