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
  search: "",
  selectedClientId: null,
  selectedServiceId: null,
  services: [],
  stepSort: "ordem",
};

const elements = {
  cards: document.querySelector("[data-admin-cards]"),
  clientCreateForm: document.querySelector("[data-client-create-form]"),
  clientList: document.querySelector("[data-client-list]"),
  clientModal: document.querySelector("[data-client-modal]"),
  clientModalMessage: document.querySelector("[data-client-modal-message]"),
  clientSearch: document.querySelector("[data-client-search]"),
  confirmDeleteClient: document.querySelector("[data-confirm-delete-client]"),
  createdAccess: document.querySelector("[data-created-access]"),
  deleteClientInfo: document.querySelector("[data-delete-client-info]"),
  deleteClientMessage: document.querySelector("[data-delete-client-message]"),
  deleteClientModal: document.querySelector("[data-delete-client-modal]"),
  feedbackList: document.querySelector("[data-feedback-list]"),
  generatePassword: document.querySelector("[data-generate-password]"),
  generateResetPassword: document.querySelector("[data-generate-reset-password]"),
  loading: document.querySelector("[data-admin-loading]"),
  login: document.querySelector("[data-admin-login]"),
  loginForm: document.querySelector("[data-admin-login-form]"),
  loginMessage: document.querySelector("[data-admin-login-message]"),
  logout: document.querySelector("[data-admin-logout]"),
  mainMessage: document.querySelector("[data-admin-message]"),
  archiveService: document.querySelector("[data-archive-service]"),
  editService: document.querySelector("[data-edit-service]"),
  openClientModal: document.querySelector("[data-open-client-modal]"),
  openDeleteClientModal: document.querySelector("[data-open-delete-client-modal]"),
  openPasswordModal: document.querySelector("[data-open-password-modal]"),
  pageSubtitle: document.querySelector("[data-page-subtitle]"),
  pageTitle: document.querySelector("[data-page-title]"),
  passwordClientInfo: document.querySelector("[data-password-client-info]"),
  passwordModal: document.querySelector("[data-password-modal]"),
  passwordModalMessage: document.querySelector("[data-password-modal-message]"),
  passwordResetForm: document.querySelector("[data-password-reset-form]"),
  refresh: document.querySelector("[data-refresh-admin]"),
  resetAccess: document.querySelector("[data-reset-access]"),
  restoreClients: document.querySelector("[data-restore-clients]"),
  selectedClientMeta: document.querySelector("[data-selected-client-meta]"),
  selectedClientName: document.querySelector("[data-selected-client-name]"),
  serviceForm: document.querySelector("[data-service-form]"),
  serviceList: document.querySelector("[data-service-list]"),
  serviceModal: document.querySelector("[data-service-modal]"),
  serviceModalTitle: document.querySelector("[data-service-modal-title]"),
  serviceSummary: document.querySelector("[data-service-summary]"),
  shell: document.querySelector("[data-admin-shell]"),
  stepForm: document.querySelector("[data-step-form]"),
  stepList: document.querySelector("[data-step-list]"),
  stepModal: document.querySelector("[data-step-modal]"),
  stepModalTitle: document.querySelector("[data-step-modal-title]"),
  stepSort: document.querySelector("[data-step-sort]"),
  updateForm: document.querySelector("[data-update-form]"),
  updateList: document.querySelector("[data-update-list]"),
  updateModal: document.querySelector("[data-update-modal]"),
  updateModalTitle: document.querySelector("[data-update-modal-title]"),
};

const closeClientModalButtons = document.querySelectorAll("[data-close-client-modal]");
const closeDeleteClientModalButtons = document.querySelectorAll("[data-close-delete-client-modal]");
const closePasswordModalButtons = document.querySelectorAll("[data-close-password-modal]");
const closeServiceModalButtons = document.querySelectorAll("[data-close-service-modal]");
const closeStepModalButtons = document.querySelectorAll("[data-close-step-modal]");
const closeUpdateModalButtons = document.querySelectorAll("[data-close-update-modal]");
const openServiceModalButtons = document.querySelectorAll("[data-open-service-modal]");
const openStepModalButtons = document.querySelectorAll("[data-open-step-modal]");
const openUpdateModalButtons = document.querySelectorAll("[data-open-update-modal]");
const tabButtons = document.querySelectorAll("[data-tab-button]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");

const projectStatusLabels = {
  aguardando_cliente: "Aguardando cliente",
  briefing: "Briefing",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  homologacao: "Homologacao",
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
  concluido: "Concluido",
  em_andamento: "Em andamento",
  nao_possivel: "Nao possivel",
  pendente: "Pendente",
};

const feedbackStatusLabels = {
  concluido: "Concluido",
  em_analise: "Em analise",
  nao_possivel: "Nao possivel",
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
  if (!value) return "Nao informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nao informado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
};

const toInputDate = (value) => (value ? String(value).slice(0, 10) : "");
const getLabel = (map, key) => map[key] || "Nao definido";
const getTone = (key) => projectStatusTones[key] || "blue";
const getProgress = (value) => Math.max(0, Math.min(Number(value || 0), 100));
const getProgressTone = (value) => {
  const progress = getProgress(value);
  if (progress >= 90) return "green";
  if (progress >= 50) return "blue";
  if (progress >= 25) return "amber";
  return "red";
};
const sortSteps = (steps) =>
  [...steps].sort((a, b) => {
    if (state.stepSort === "percentual") {
      return getProgress(b.percentual) - getProgress(a.percentual) || Number(a.ordem || 0) - Number(b.ordem || 0);
    }
    return Number(a.ordem || 0) - Number(b.ordem || 0) || getProgress(b.percentual) - getProgress(a.percentual);
  });
const selectedClient = () => state.clients.find((client) => client.id === state.selectedClientId) || null;
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

const setButtonLoading = (button, loading, text = "Salvando...") => {
  if (!button) return;
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }
  button.disabled = loading;
  button.textContent = loading ? text : button.dataset.defaultText;
};

const setFieldValue = (form, name, value) => {
  const field = form?.elements?.namedItem(name);
  if (field) field.value = value ?? "";
};

const setCheckboxValue = (form, name, checked) => {
  const field = form?.elements?.namedItem(name);
  if (field) field.checked = Boolean(checked);
};

const generatePassword = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const symbols = "!@#$%";
  const random = (max) => crypto.getRandomValues(new Uint32Array(1))[0] % max;
  const chars = Array.from({ length: 10 }, () => letters[random(letters.length)]);
  chars.push(symbols[random(symbols.length)]);
  chars.push(String(random(10)));
  return chars.sort(() => random(1000) - 500).join("");
};

const openClientModal = () => {
  elements.clientModal.hidden = false;
  document.body.classList.add("modal-open");
  setMessage(elements.clientModalMessage, "");
  elements.createdAccess.hidden = true;
  elements.createdAccess.innerHTML = "";
  elements.clientCreateForm.reset();
  setFieldValue(elements.clientCreateForm, "password", generatePassword());
  window.setTimeout(() => elements.clientCreateForm.querySelector('input[name="nome_empresa"]')?.focus(), 40);
};

const closeClientModal = () => {
  elements.clientModal.hidden = true;
  document.body.classList.remove("modal-open");
  setMessage(elements.clientModalMessage, "");
};

const openDeleteClientModal = () => {
  const client = selectedClient();
  if (!client) {
    setMessage(elements.mainMessage, "Selecione um cliente antes de excluir.", "error");
    return;
  }

  elements.deleteClientInfo.textContent = `Cliente: ${client.nome_empresa} - ${client.email || "sem e-mail"}`;
  setMessage(elements.deleteClientMessage, "");
  elements.deleteClientModal.hidden = false;
  document.body.classList.add("modal-open");
};

const closeDeleteClientModal = () => {
  elements.deleteClientModal.hidden = true;
  document.body.classList.remove("modal-open");
  setMessage(elements.deleteClientMessage, "");
};

const openPasswordModal = () => {
  const client = selectedClient();
  if (!client) {
    setMessage(elements.mainMessage, "Selecione um cliente antes de redefinir a senha.", "error");
    return;
  }

  elements.passwordClientInfo.textContent = `Cliente: ${client.nome_empresa} - login ${client.email || "sem e-mail"}`;
  elements.passwordResetForm.reset();
  setFieldValue(elements.passwordResetForm, "password", generatePassword());
  elements.resetAccess.hidden = true;
  elements.resetAccess.innerHTML = "";
  setMessage(elements.passwordModalMessage, "");
  elements.passwordModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => elements.passwordResetForm.querySelector('input[name="password"]')?.focus(), 40);
};

const closePasswordModal = () => {
  elements.passwordModal.hidden = true;
  document.body.classList.remove("modal-open");
  setMessage(elements.passwordModalMessage, "");
};

const openServiceModal = (mode = "new") => {
  if (!state.selectedClientId) {
    setMessage(elements.mainMessage, "Selecione um cliente antes de criar um servico.", "error");
    return;
  }

  const editing = mode === "edit" && selectedService();
  elements.serviceModalTitle.textContent = editing ? "Editar servico" : "Criar servico";
  if (editing) {
    fillServiceForm(selectedService());
  } else {
    resetServiceForm();
  }

  elements.serviceModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => elements.serviceForm.querySelector('input[name="nome"]')?.focus(), 40);
};

const closeServiceModal = () => {
  elements.serviceModal.hidden = true;
  document.body.classList.remove("modal-open");
};

const openStepModal = (step = null) => {
  if (!state.selectedServiceId) {
    setMessage(elements.mainMessage, "Selecione um servico antes de criar etapas.", "error");
    return;
  }

  elements.stepModalTitle.textContent = step ? "Editar etapa" : "Nova etapa";
  if (step) {
    fillStepForm(step);
  } else {
    resetStepForm();
  }
  elements.stepModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => elements.stepForm.querySelector('input[name="titulo"]')?.focus(), 40);
};

const closeStepModal = () => {
  elements.stepModal.hidden = true;
  document.body.classList.remove("modal-open");
};

const openUpdateModal = (update = null) => {
  if (!state.selectedServiceId) {
    setMessage(elements.mainMessage, "Selecione um servico antes de publicar atualizacoes.", "error");
    return;
  }

  elements.updateModalTitle.textContent = update ? "Editar atualizacao" : "Publicar atualizacao";
  if (update) {
    fillUpdateForm(update);
  } else {
    resetUpdateForm();
  }
  elements.updateModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => elements.updateForm.querySelector('input[name="titulo"]')?.focus(), 40);
};

const closeUpdateModal = () => {
  elements.updateModal.hidden = true;
  document.body.classList.remove("modal-open");
};

const activateTab = (name) => {
  tabButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.tabButton === name));
  tabPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.tabPanel === name));
};

const renderCards = async () => {
  const serviceIds = state.services.map((service) => service.id);
  let openFeedbacks = 0;

  if (serviceIds.length) {
    const { data } = await supabaseClient
      .from("feedbacks")
      .select("id, status, project_id")
      .in("project_id", serviceIds);
    openFeedbacks = (data || []).filter((feedback) => feedback.status !== "concluido").length;
  }

  const cards = [
    ["Clientes", state.clients.length, "empresas cadastradas"],
    ["Servicos", state.services.length, "servicos/projetos ativos"],
    [
      "Em andamento",
      state.services.filter((service) => service.status === "em_andamento").length,
      "servicos em execucao",
    ],
    ["Conversas abertas", openFeedbacks, "feedbacks para responder"],
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

const renderClients = () => {
  const term = state.search.trim().toLowerCase();
  const clients = state.clients.filter((client) => {
    const haystack = `${client.nome_empresa || ""} ${client.responsavel || ""} ${client.email || ""}`.toLowerCase();
    return !term || haystack.includes(term);
  });

  if (!clients.length) {
    elements.clientList.innerHTML = `<div class="empty-block">Nenhum cliente encontrado.</div>`;
    return;
  }

  elements.clientList.innerHTML = clients
    .map((client) => {
      const count = state.services.filter((service) => service.client_id === client.id).length;
      return `
        <button class="client-item${client.id === state.selectedClientId ? " is-active" : ""}" type="button" data-client-id="${client.id}">
          <strong>${escapeHtml(client.nome_empresa)}</strong>
          <span>${escapeHtml(client.responsavel || client.email || "Sem responsavel")} - ${count} servico(s)</span>
        </button>
      `;
    })
    .join("");

  elements.clientList.querySelectorAll("[data-client-id]").forEach((button) => {
    button.addEventListener("click", () => selectClient(button.dataset.clientId));
  });
};

const renderServiceList = () => {
  const services = state.services.filter((service) => service.client_id === state.selectedClientId);
  if (!state.selectedClientId) {
    elements.serviceList.innerHTML = `<div class="empty-block">Selecione um cliente para ver os servicos.</div>`;
    return;
  }

  if (!services.length) {
    elements.serviceList.innerHTML = `<div class="empty-block">Este cliente ainda nao tem servicos. Clique em "Novo servico".</div>`;
    return;
  }

  elements.serviceList.innerHTML = services
    .map((service) => {
      const active = service.id === state.selectedServiceId;
      const progress = getProgress(service.percentual);
      return `
        <button class="service-card${active ? " is-active" : ""}" type="button" data-service-id="${service.id}" style="--service-progress: ${progress}%">
          <span class="service-card-fill" aria-hidden="true"></span>
          <span class="service-card-content">
            <strong>${escapeHtml(service.nome)}</strong>
            <span class="service-card-meta">${escapeHtml(getLabel(projectStatusLabels, service.status))}</span>
            <span class="service-card-progress">
              <span class="service-card-bar" aria-hidden="true"><span style="width: ${progress}%"></span></span>
              <em>${progress}%</em>
            </span>
          </span>
        </button>
      `;
    })
    .join("");

  elements.serviceList.querySelectorAll("[data-service-id]").forEach((button) => {
    button.addEventListener("click", () => selectService(button.dataset.serviceId, true));
  });
};

const resetServiceForm = () => {
  elements.serviceForm.reset();
  setFieldValue(elements.serviceForm, "id", "");
  setFieldValue(elements.serviceForm, "status", "briefing");
  setFieldValue(elements.serviceForm, "percentual", 0);
};

const fillServiceForm = (service) => {
  if (!service) {
    resetServiceForm();
    return;
  }
  setFieldValue(elements.serviceForm, "id", service.id);
  setFieldValue(elements.serviceForm, "nome", service.nome);
  setFieldValue(elements.serviceForm, "status", service.status || "briefing");
  setFieldValue(elements.serviceForm, "descricao", service.descricao);
  setFieldValue(elements.serviceForm, "percentual", service.percentual ?? 0);
  setFieldValue(elements.serviceForm, "data_inicio", toInputDate(service.data_inicio));
  setFieldValue(elements.serviceForm, "data_previsao", toInputDate(service.data_previsao));
  setFieldValue(elements.serviceForm, "url_preview", service.url_preview);
  setFieldValue(elements.serviceForm, "url_producao", service.url_producao);
  setFieldValue(elements.serviceForm, "observacao", service.observacao);
};

const resetStepForm = () => {
  elements.stepForm.reset();
  setFieldValue(elements.stepForm, "id", "");
  setFieldValue(elements.stepForm, "status", "pendente");
  setFieldValue(elements.stepForm, "percentual", 0);
  setFieldValue(elements.stepForm, "ordem", 1);
};

const fillStepForm = (step) => {
  setFieldValue(elements.stepForm, "id", step.id);
  setFieldValue(elements.stepForm, "titulo", step.titulo);
  setFieldValue(elements.stepForm, "descricao", step.descricao);
  setFieldValue(elements.stepForm, "status", step.status || "pendente");
  setFieldValue(elements.stepForm, "percentual", step.percentual ?? 0);
  setFieldValue(elements.stepForm, "ordem", step.ordem ?? 1);
  setFieldValue(elements.stepForm, "data_prevista", toInputDate(step.data_prevista));
  setFieldValue(elements.stepForm, "justificativa", step.justificativa);
};

const resetUpdateForm = () => {
  elements.updateForm.reset();
  setFieldValue(elements.updateForm, "id", "");
  setCheckboxValue(elements.updateForm, "visivel_cliente", true);
};

const fillUpdateForm = (update) => {
  setFieldValue(elements.updateForm, "id", update.id);
  setFieldValue(elements.updateForm, "titulo", update.titulo);
  setFieldValue(elements.updateForm, "descricao", update.descricao);
  setFieldValue(elements.updateForm, "url_anexo", update.url_anexo);
  setCheckboxValue(elements.updateForm, "visivel_cliente", update.visivel_cliente !== false);
};

const renderSelectedClient = () => {
  const client = selectedClient();
  if (!client) {
    elements.selectedClientName.textContent = "Nenhum cliente selecionado";
    elements.selectedClientMeta.textContent = "Cadastre ou selecione um cliente na lateral.";
    elements.pageTitle.textContent = "Clientes e servicos";
    elements.pageSubtitle.textContent = "Escolha um cliente para alimentar o acompanhamento dele.";
    return;
  }

  elements.selectedClientName.textContent = client.nome_empresa;
  elements.selectedClientMeta.textContent = [client.responsavel, client.email, client.telefone].filter(Boolean).join(" - ");
  elements.pageTitle.textContent = client.nome_empresa;
  elements.pageSubtitle.textContent = "Alimente o servico, o cronograma e a conversa deste cliente.";
};

const renderServiceSummary = () => {
  const client = selectedClient();
  const service = selectedService();

  if (!client) {
    elements.serviceSummary.innerHTML = `<div class="empty-block">Selecione um cliente na lateral para comecar.</div>`;
    return;
  }

  if (!service) {
    elements.serviceSummary.innerHTML = `
      <div class="empty-block">
        Este cliente ainda nao possui servico selecionado. Clique em "Novo servico" e cadastre a primeira entrega.
      </div>
    `;
    return;
  }

  const progress = getProgress(service.percentual);
  elements.serviceSummary.innerHTML = `
    <div class="service-summary-hero">
      <div>
        <span class="status-pill" data-tone="${getTone(service.status)}">${escapeHtml(getLabel(projectStatusLabels, service.status))}</span>
        <h3>${escapeHtml(service.nome)}</h3>
        <p>${escapeHtml(service.descricao || "Servico em acompanhamento pela InovaScript.")}</p>
      </div>
      <div class="progress-line"><span style="width: ${progress}%"></span></div>
      <strong>${progress}% concluido</strong>
      <div class="summary-chips">
        <span class="summary-chip">Inicio: ${escapeHtml(formatDate(service.data_inicio))}</span>
        <span class="summary-chip">Previsao: ${escapeHtml(formatDate(service.data_previsao))}</span>
      </div>
      <div class="summary-chips">
        ${
          service.url_preview
            ? `<a class="admin-button admin-button-secondary" href="${escapeHtml(service.url_preview)}" target="_blank" rel="noreferrer">Abrir preview</a>`
            : `<span class="summary-chip">Preview nao liberado</span>`
        }
        ${
          service.url_producao
            ? `<a class="admin-button admin-button-secondary" href="${escapeHtml(service.url_producao)}" target="_blank" rel="noreferrer">Abrir publicado</a>`
            : `<span class="summary-chip">Publicado nao liberado</span>`
        }
      </div>
      <div class="summary-actions">
        <button class="admin-button admin-button-secondary" type="button" data-summary-edit-service>Editar servico</button>
        <button class="admin-button admin-button-danger" type="button" data-summary-archive-service>Apagar do portal</button>
      </div>
    </div>
  `;

  elements.serviceSummary
    .querySelector("[data-summary-edit-service]")
    ?.addEventListener("click", () => openServiceModal("edit"));
  elements.serviceSummary
    .querySelector("[data-summary-archive-service]")
    ?.addEventListener("click", handleArchiveService);
};

const renderSteps = () => {
  const steps = sortSteps(selectedDetails().steps || []);
  if (!state.selectedServiceId) {
    elements.stepList.innerHTML = `<div class="empty-block">Selecione um servico antes de criar etapas.</div>`;
    return;
  }
  if (!steps.length) {
    elements.stepList.innerHTML = `<div class="empty-block">Nenhuma etapa cadastrada neste servico.</div>`;
    return;
  }
  elements.stepList.innerHTML = steps
    .map(
      (step) => {
        const progress = getProgress(step.percentual);
        return `
        <article class="list-item step-item" data-tone="${getProgressTone(progress)}" style="--step-progress: ${progress}%">
          <span class="step-progress-bg" aria-hidden="true"></span>
          <div class="step-content">
            <strong>${escapeHtml(step.titulo)}</strong>
            <span>${escapeHtml(getLabel(stepStatusLabels, step.status))}</span>
            <div class="step-progress-line">
              <span aria-hidden="true"><span style="width: ${progress}%"></span></span>
              <em>${progress}%</em>
            </div>
            <small>Etapa ${escapeHtml(step.ordem ?? "-")} - previsto: ${escapeHtml(formatDate(step.data_prevista))}</small>
          </div>
          <div class="list-actions">
            <button class="admin-button admin-button-secondary" type="button" data-edit-step="${step.id}">Editar</button>
            <button class="admin-button admin-button-danger" type="button" data-delete-step="${step.id}">Excluir</button>
          </div>
        </article>
      `;
      }
    )
    .join("");
  elements.stepList.querySelectorAll("[data-edit-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const step = steps.find((item) => item.id === button.dataset.editStep);
      if (step) openStepModal(step);
    });
  });
  elements.stepList.querySelectorAll("[data-delete-step]").forEach((button) => {
    button.addEventListener("click", () => handleDeleteStep(button.dataset.deleteStep));
  });
};

const renderUpdates = () => {
  const updates = selectedDetails().updates || [];
  if (!state.selectedServiceId) {
    elements.updateList.innerHTML = `<div class="empty-block">Selecione um servico antes de publicar atualizacoes.</div>`;
    return;
  }
  if (!updates.length) {
    elements.updateList.innerHTML = `<div class="empty-block">Nenhuma atualizacao publicada.</div>`;
    return;
  }
  elements.updateList.innerHTML = updates
    .map(
      (update) => `
        <article class="list-item">
          <div>
            <strong>${escapeHtml(update.titulo)}</strong>
            <span>${escapeHtml(update.descricao || "Sem descricao")}</span>
            <small>${update.visivel_cliente ? "Visivel para o cliente" : "Somente interno"} - ${escapeHtml(formatDate(update.created_at))}</small>
          </div>
          <div class="list-actions">
            <button class="admin-button admin-button-secondary" type="button" data-edit-update="${update.id}">Editar</button>
            <button class="admin-button admin-button-danger" type="button" data-delete-update="${update.id}">Excluir</button>
          </div>
        </article>
      `
    )
    .join("");
  elements.updateList.querySelectorAll("[data-edit-update]").forEach((button) => {
    button.addEventListener("click", () => {
      const update = updates.find((item) => item.id === button.dataset.editUpdate);
      if (update) openUpdateModal(update);
    });
  });
  elements.updateList.querySelectorAll("[data-delete-update]").forEach((button) => {
    button.addEventListener("click", () => handleDeleteUpdate(button.dataset.deleteUpdate));
  });
};

const renderFeedbacks = () => {
  const feedbacks = selectedDetails().feedbacks || [];
  if (!state.selectedServiceId) {
    elements.feedbackList.innerHTML = `<div class="empty-block">Selecione um servico para ver a conversa.</div>`;
    return;
  }
  if (!feedbacks.length) {
    elements.feedbackList.innerHTML = `<div class="empty-block">Nenhuma mensagem do cliente ainda.</div>`;
    return;
  }
  elements.feedbackList.innerHTML = feedbacks
    .map(
      (feedback) => `
        <article class="list-item">
          <div>
            <strong>${escapeHtml(feedback.mensagem)}</strong>
            <span>${escapeHtml(getLabel(feedbackStatusLabels, feedback.status))} - ${escapeHtml(formatDate(feedback.created_at))}</span>
            ${feedback.resposta_admin ? `<small>Resposta atual: ${escapeHtml(feedback.resposta_admin)}</small>` : ""}
            <form class="feedback-reply" data-feedback-form="${feedback.id}">
              <label>
                <span>Status</span>
                <select name="status">
                  <option value="pendente" ${feedback.status === "pendente" ? "selected" : ""}>Pendente</option>
                  <option value="em_analise" ${feedback.status === "em_analise" ? "selected" : ""}>Em analise</option>
                  <option value="concluido" ${feedback.status === "concluido" ? "selected" : ""}>Concluido</option>
                  <option value="nao_possivel" ${feedback.status === "nao_possivel" ? "selected" : ""}>Nao possivel</option>
                </select>
              </label>
              <label>
                <span>Resposta</span>
                <textarea name="resposta_admin" rows="2">${escapeHtml(feedback.resposta_admin || "")}</textarea>
              </label>
              <button class="admin-button admin-button-primary" type="submit">Responder</button>
            </form>
          </div>
        </article>
      `
    )
    .join("");

  elements.feedbackList.querySelectorAll("[data-feedback-form]").forEach((form) => {
    form.addEventListener("submit", handleFeedbackReply);
  });
};

const renderAll = () => {
  renderClients();
  renderSelectedClient();
  renderServiceList();
  renderServiceSummary();
  fillServiceForm(selectedService());
  renderSteps();
  renderUpdates();
  renderFeedbacks();
};

const loadClients = async () => {
  const { data, error } = await supabaseClient
    .from("clients")
    .select("id, profile_id, nome_empresa, responsavel, telefone, email, observacao, ativo, created_at")
    .eq("ativo", true)
    .order("nome_empresa", { ascending: true });
  if (error) throw error;
  state.clients = data || [];
};

const loadServices = async () => {
  const { data, error } = await supabaseClient
    .from("projects")
    .select("id, client_id, nome, descricao, url_preview, url_producao, status, percentual, data_inicio, data_previsao, data_finalizacao, observacao, ativo, created_at")
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
  resetStepForm();
  resetUpdateForm();
  await fetchServiceDetails(state.selectedServiceId, force);
  renderAll();
};

const selectClient = async (clientId) => {
  state.selectedClientId = clientId;
  const services = state.services.filter((service) => service.client_id === clientId);
  const currentBelongsToClient = services.some((service) => service.id === state.selectedServiceId);
  state.selectedServiceId = currentBelongsToClient ? state.selectedServiceId : services[0]?.id || null;
  if (state.selectedServiceId) {
    await fetchServiceDetails(state.selectedServiceId, true);
  }
  renderAll();
};

const loadProfile = async (userId) => {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, nome, email, role, ativo")
    .eq("id", userId)
    .single();
  if (error) throw error;
  if (!data?.ativo || data.role !== "admin") {
    throw new Error("Acesso administrativo nao autorizado.");
  }
  state.profile = data;
};

const loadAdmin = async (session) => {
  await loadProfile(session.user.id);
  await Promise.all([loadClients(), loadServices()]);
  if (!state.selectedClientId && state.clients.length) {
    state.selectedClientId = state.clients[0].id;
  }
  if (state.selectedClientId) {
    const service = state.services.find((item) => item.client_id === state.selectedClientId);
    state.selectedServiceId = service?.id || null;
    if (state.selectedServiceId) {
      await fetchServiceDetails(state.selectedServiceId, true);
    }
  }
  await renderCards();
  renderAll();
  elements.loading.hidden = true;
  elements.login.hidden = true;
  elements.shell.hidden = false;
};

const handleLogin = async (event) => {
  event.preventDefault();
  const button = elements.loginForm.querySelector('button[type="submit"]');
  const formData = new FormData(elements.loginForm);
  setButtonLoading(button, true, "Entrando...");
  setMessage(elements.loginMessage, "Validando acesso administrativo...", "info");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
  });

  setButtonLoading(button, false);
  if (error) {
    setMessage(elements.loginMessage, "Nao foi possivel entrar. Confira e-mail e senha.", "error");
    return;
  }

  try {
    await loadAdmin(data.session);
  } catch (loadError) {
    setMessage(elements.loginMessage, loadError.message || "Acesso nao autorizado.", "error");
  }
};

const handleLogout = async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "./index.html";
};

const handleRefresh = async () => {
  setButtonLoading(elements.refresh, true, "Atualizando...");
  state.details.clear();
  try {
    await Promise.all([loadClients(), loadServices()]);
    if (!state.clients.some((client) => client.id === state.selectedClientId)) {
      state.selectedClientId = state.clients[0]?.id || null;
      state.selectedServiceId = null;
    }
    if (state.selectedClientId && !state.services.some((service) => service.id === state.selectedServiceId)) {
      const service = state.services.find((item) => item.client_id === state.selectedClientId);
      state.selectedServiceId = service?.id || null;
    }
    await renderCards();
    if (state.selectedServiceId) await fetchServiceDetails(state.selectedServiceId, true);
    renderAll();
    setMessage(elements.mainMessage, "Painel atualizado.", "success");
  } catch (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel atualizar.", "error");
  } finally {
    setButtonLoading(elements.refresh, false);
  }
};

const handleRestoreClients = async () => {
  const confirmed = window.confirm(
    "Restaurar clientes excluidos? Isso reativa clientes, acessos e servicos desativados por exclusao."
  );
  if (!confirmed) return;

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.access_token) {
    setMessage(elements.mainMessage, "Sua sessao expirou. Entre novamente como administrador.", "error");
    return;
  }

  setButtonLoading(elements.restoreClients, true, "Restaurando...");
  setMessage(elements.mainMessage, "Restaurando clientes excluidos...", "info");

  try {
    const response = await fetch("/api/restore-clients", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const responseText = await response.text();
    let result = null;
    try {
      result = responseText ? JSON.parse(responseText) : null;
    } catch (_error) {
      result = null;
    }
    if (response.status === 404) {
      throw new Error("A API de restauracao ainda nao esta publicada. Aguarde a Vercel finalizar o deploy.");
    }
    if (!response.ok) throw new Error(result?.error || responseText || "Nao foi possivel restaurar clientes.");

    state.details.clear();
    await Promise.all([loadClients(), loadServices()]);
    if (!state.clients.some((client) => client.id === state.selectedClientId)) {
      state.selectedClientId = state.clients[0]?.id || null;
    }
    if (state.selectedClientId) {
      const service = state.services.find((item) => item.client_id === state.selectedClientId);
      state.selectedServiceId = service?.id || null;
      if (state.selectedServiceId) await fetchServiceDetails(state.selectedServiceId, true);
    }
    await renderCards();
    renderAll();
    setMessage(
      elements.mainMessage,
      `Restaurado: ${result?.restored_clients || 0} cliente(s), ${result?.restored_projects || 0} servico(s).`,
      "success"
    );
  } catch (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel restaurar clientes.", "error");
  } finally {
    setButtonLoading(elements.restoreClients, false);
  }
};

const handleCreateClient = async (event) => {
  event.preventDefault();
  const button = elements.clientCreateForm.querySelector('button[type="submit"]');
  const formData = new FormData(elements.clientCreateForm);
  const password = String(formData.get("password") || "");
  const payload = {
    email: String(formData.get("email") || "").trim(),
    nome_empresa: String(formData.get("nome_empresa") || "").trim(),
    observacao: String(formData.get("observacao") || "").trim(),
    password,
    responsavel: String(formData.get("responsavel") || "").trim(),
    telefone: String(formData.get("telefone") || "").trim(),
  };

  if (!payload.email || !payload.nome_empresa || !payload.password) {
    setMessage(elements.clientModalMessage, "Informe empresa, e-mail e senha.", "error");
    return;
  }

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.access_token) {
    setMessage(elements.clientModalMessage, "Sua sessao expirou. Entre novamente como administrador.", "error");
    return;
  }

  setButtonLoading(button, true, "Criando...");
  setMessage(elements.clientModalMessage, "Criando usuario e vinculando cliente...", "info");

  try {
    const response = await fetch("/api/create-client-user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    let result = null;
    try {
      result = responseText ? JSON.parse(responseText) : null;
    } catch (_error) {
      result = null;
    }
    if (response.status === 404) {
      throw new Error("A API de criacao de usuario nao esta rodando. Use a Vercel publicada ou rode com vercel dev.");
    }
    if (!response.ok) throw new Error(result?.error || responseText || "Nao foi possivel criar o cliente.");

    await loadClients();
    await renderCards();
    state.selectedClientId = result.client?.id || state.selectedClientId;
    state.selectedServiceId = null;
    renderAll();

    elements.createdAccess.hidden = false;
    elements.createdAccess.innerHTML = `
      <strong>Cliente criado com sucesso.</strong>
      <span>Login: ${escapeHtml(payload.email)}</span>
      <span>Senha inicial: ${escapeHtml(password)}</span>
      <span>Proximo passo: criar o servico/projeto deste cliente.</span>
    `;
    setMessage(elements.clientModalMessage, "Acesso criado. Copie login e senha antes de fechar.", "success");
  } catch (error) {
    setMessage(elements.clientModalMessage, error.message || "Nao foi possivel criar o cliente.", "error");
  } finally {
    setButtonLoading(button, false);
  }
};

const handleResetPassword = async (event) => {
  event.preventDefault();
  const client = selectedClient();
  if (!client) {
    setMessage(elements.passwordModalMessage, "Selecione um cliente antes de redefinir a senha.", "error");
    return;
  }

  const button = elements.passwordResetForm.querySelector('button[type="submit"]');
  const formData = new FormData(elements.passwordResetForm);
  const password = String(formData.get("password") || "");
  if (password.length < 6) {
    setMessage(elements.passwordModalMessage, "A nova senha precisa ter pelo menos 6 caracteres.", "error");
    return;
  }

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.access_token) {
    setMessage(elements.passwordModalMessage, "Sua sessao expirou. Entre novamente como administrador.", "error");
    return;
  }

  setButtonLoading(button, true, "Alterando...");
  setMessage(elements.passwordModalMessage, "Atualizando senha do cliente...", "info");

  try {
    const response = await fetch("/api/reset-client-password", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: client.id,
        password,
      }),
    });
    const responseText = await response.text();
    let result = null;
    try {
      result = responseText ? JSON.parse(responseText) : null;
    } catch (_error) {
      result = null;
    }
    if (response.status === 404) {
      throw new Error("A API de redefinicao de senha nao esta rodando. Use a Vercel publicada ou rode com vercel dev.");
    }
    if (!response.ok) throw new Error(result?.error || responseText || "Nao foi possivel redefinir a senha.");

    elements.resetAccess.hidden = false;
    elements.resetAccess.innerHTML = `
      <strong>Senha redefinida com sucesso.</strong>
      <span>Cliente: ${escapeHtml(client.nome_empresa)}</span>
      <span>Login: ${escapeHtml(result?.client?.email || client.email || "")}</span>
      <span>Nova senha: ${escapeHtml(password)}</span>
    `;
    setMessage(elements.passwordModalMessage, "Senha atualizada. Envie a nova senha ao cliente por um canal seguro.", "success");
  } catch (error) {
    setMessage(elements.passwordModalMessage, error.message || "Nao foi possivel redefinir a senha.", "error");
  } finally {
    setButtonLoading(button, false);
  }
};

const handleDeleteClient = async () => {
  const client = selectedClient();
  if (!client) {
    setMessage(elements.deleteClientMessage, "Selecione um cliente antes de excluir.", "error");
    return;
  }

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.access_token) {
    setMessage(elements.deleteClientMessage, "Sua sessao expirou. Entre novamente como administrador.", "error");
    return;
  }

  setButtonLoading(elements.confirmDeleteClient, true, "Excluindo...");
  setMessage(elements.deleteClientMessage, "Removendo cliente do portal...", "info");

  try {
    const response = await fetch("/api/delete-client-user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ client_id: client.id }),
    });
    const responseText = await response.text();
    let result = null;
    try {
      result = responseText ? JSON.parse(responseText) : null;
    } catch (_error) {
      result = null;
    }
    if (response.status === 404) {
      throw new Error("A API de exclusao de cliente nao esta rodando. Use a Vercel publicada ou rode com vercel dev.");
    }
    if (!response.ok) throw new Error(result?.error || responseText || "Nao foi possivel excluir o cliente.");

    state.details.clear();
    state.selectedClientId = null;
    state.selectedServiceId = null;
    await Promise.all([loadClients(), loadServices()]);
    state.selectedClientId = state.clients[0]?.id || null;
    if (state.selectedClientId) {
      const service = state.services.find((item) => item.client_id === state.selectedClientId);
      state.selectedServiceId = service?.id || null;
      if (state.selectedServiceId) await fetchServiceDetails(state.selectedServiceId, true);
    }
    await renderCards();
    renderAll();
    closeDeleteClientModal();
    setMessage(elements.mainMessage, `Cliente "${client.nome_empresa}" excluido do portal.`, "success");
  } catch (error) {
    setMessage(elements.deleteClientMessage, error.message || "Nao foi possivel excluir o cliente.", "error");
  } finally {
    setButtonLoading(elements.confirmDeleteClient, false);
  }
};

const handleServiceSave = async (event) => {
  event.preventDefault();
  if (!state.selectedClientId) {
    setMessage(elements.mainMessage, "Selecione um cliente antes de salvar o servico.", "error");
    return;
  }
  const button = elements.serviceForm.querySelector('button[type="submit"]');
  const formData = new FormData(elements.serviceForm);
  const id = String(formData.get("id") || "").trim();
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) {
    setMessage(elements.mainMessage, "Informe o nome do servico.", "error");
    return;
  }

  const payload = {
    ativo: true,
    client_id: state.selectedClientId,
    data_inicio: String(formData.get("data_inicio") || "").trim() || null,
    data_previsao: String(formData.get("data_previsao") || "").trim() || null,
    descricao: String(formData.get("descricao") || "").trim() || null,
    nome,
    observacao: String(formData.get("observacao") || "").trim() || null,
    percentual: Number(formData.get("percentual") || 0),
    status: String(formData.get("status") || "briefing"),
    url_preview: String(formData.get("url_preview") || "").trim() || null,
    url_producao: String(formData.get("url_producao") || "").trim() || null,
  };

  setButtonLoading(button, true, "Salvando...");
  const targetId = id || crypto.randomUUID();
  const { error } = id
    ? await supabaseClient.from("projects").update(payload).eq("id", id)
    : await supabaseClient.from("projects").insert({ id: targetId, ...payload });
  setButtonLoading(button, false);

  if (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel salvar o servico.", "error");
    return;
  }

  state.selectedServiceId = targetId;
  state.details.delete(targetId);
  await loadServices();
  await fetchServiceDetails(targetId, true);
  await renderCards();
  renderAll();
  closeServiceModal();
  activateTab("resumo");
  setMessage(elements.mainMessage, "Servico salvo com sucesso.", "success");
};

const handleArchiveService = async () => {
  const service = selectedService();
  if (!service) {
    setMessage(elements.mainMessage, "Selecione um servico para apagar do portal.", "error");
    return;
  }

  const confirmed = window.confirm(
    `Apagar o servico "${service.nome}" do portal? Ele sai da tela do cliente e dos servicos ativos, mas o historico fica preservado no banco.`
  );
  if (!confirmed) return;

  setButtonLoading(elements.archiveService, true, "Apagando...");
  const { error } = await supabaseClient.from("projects").update({ ativo: false }).eq("id", service.id);
  setButtonLoading(elements.archiveService, false);

  if (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel apagar o servico do portal.", "error");
    return;
  }

  state.details.delete(service.id);
  await loadServices();
  const nextService = state.services.find((item) => item.client_id === state.selectedClientId);
  state.selectedServiceId = nextService?.id || null;
  if (state.selectedServiceId) {
    await fetchServiceDetails(state.selectedServiceId, true);
  }
  await renderCards();
  renderAll();
  activateTab("resumo");
  setMessage(elements.mainMessage, "Servico apagado do portal com sucesso.", "success");
};

const handleStepSave = async (event) => {
  event.preventDefault();
  if (!state.selectedServiceId) {
    setMessage(elements.mainMessage, "Selecione um servico antes de salvar etapas.", "error");
    return;
  }
  const button = elements.stepForm.querySelector('button[type="submit"]');
  const formData = new FormData(elements.stepForm);
  const id = String(formData.get("id") || "").trim();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;

  const status = String(formData.get("status") || "pendente");
  const payload = {
    data_conclusao: status === "concluido" ? new Date().toISOString().slice(0, 10) : null,
    data_prevista: String(formData.get("data_prevista") || "").trim() || null,
    descricao: String(formData.get("descricao") || "").trim() || null,
    justificativa: String(formData.get("justificativa") || "").trim() || null,
    ordem: Number(formData.get("ordem") || 1),
    percentual: Number(formData.get("percentual") || 0),
    project_id: state.selectedServiceId,
    status,
    titulo,
  };

  setButtonLoading(button, true, "Salvando...");
  const targetId = id || crypto.randomUUID();
  const { error } = id
    ? await supabaseClient.from("project_steps").update(payload).eq("id", id)
    : await supabaseClient.from("project_steps").insert({ id: targetId, ...payload });
  setButtonLoading(button, false);

  if (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel salvar etapa.", "error");
    return;
  }
  resetStepForm();
  await fetchServiceDetails(state.selectedServiceId, true);
  renderSteps();
  closeStepModal();
  setMessage(elements.mainMessage, "Etapa salva.", "success");
};

const handleDeleteStep = async (stepId) => {
  if (!stepId || !state.selectedServiceId) return;
  const step = (selectedDetails().steps || []).find((item) => item.id === stepId);
  const confirmed = window.confirm(`Excluir a etapa "${step?.titulo || "selecionada"}"?`);
  if (!confirmed) return;

  const { error } = await supabaseClient.from("project_steps").delete().eq("id", stepId);
  if (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel excluir a etapa.", "error");
    return;
  }

  await fetchServiceDetails(state.selectedServiceId, true);
  renderSteps();
  setMessage(elements.mainMessage, "Etapa excluida.", "success");
};

const handleUpdateSave = async (event) => {
  event.preventDefault();
  if (!state.selectedServiceId) {
    setMessage(elements.mainMessage, "Selecione um servico antes de publicar atualizacoes.", "error");
    return;
  }
  const button = elements.updateForm.querySelector('button[type="submit"]');
  const formData = new FormData(elements.updateForm);
  const id = String(formData.get("id") || "").trim();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;

  const payload = {
    descricao: String(formData.get("descricao") || "").trim() || null,
    project_id: state.selectedServiceId,
    titulo,
    url_anexo: String(formData.get("url_anexo") || "").trim() || null,
    visivel_cliente: formData.get("visivel_cliente") === "on",
  };

  setButtonLoading(button, true, "Salvando...");
  const targetId = id || crypto.randomUUID();
  const { error } = id
    ? await supabaseClient.from("project_updates").update(payload).eq("id", id)
    : await supabaseClient.from("project_updates").insert({ id: targetId, ...payload });
  setButtonLoading(button, false);

  if (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel salvar atualizacao.", "error");
    return;
  }
  resetUpdateForm();
  await fetchServiceDetails(state.selectedServiceId, true);
  renderUpdates();
  closeUpdateModal();
  setMessage(elements.mainMessage, "Atualizacao salva.", "success");
};

const handleDeleteUpdate = async (updateId) => {
  if (!updateId || !state.selectedServiceId) return;
  const update = (selectedDetails().updates || []).find((item) => item.id === updateId);
  const confirmed = window.confirm(`Excluir a atualizacao "${update?.titulo || "selecionada"}"?`);
  if (!confirmed) return;

  const { error } = await supabaseClient.from("project_updates").delete().eq("id", updateId);
  if (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel excluir a atualizacao.", "error");
    return;
  }

  await fetchServiceDetails(state.selectedServiceId, true);
  renderUpdates();
  setMessage(elements.mainMessage, "Atualizacao excluida.", "success");
};

async function handleFeedbackReply(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const status = String(formData.get("status") || "pendente");
  setButtonLoading(button, true, "Respondendo...");

  const { error } = await supabaseClient
    .from("feedbacks")
    .update({
      concluido: status === "concluido",
      resposta_admin: String(formData.get("resposta_admin") || "").trim() || null,
      status,
    })
    .eq("id", form.dataset.feedbackForm);

  setButtonLoading(button, false);
  if (error) {
    setMessage(elements.mainMessage, error.message || "Nao foi possivel responder.", "error");
    return;
  }
  await fetchServiceDetails(state.selectedServiceId, true);
  await renderCards();
  renderFeedbacks();
  setMessage(elements.mainMessage, "Resposta salva.", "success");
}

const bootstrap = async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    elements.loading.hidden = true;
    elements.login.hidden = false;
    return;
  }

  try {
    await loadAdmin(session);
  } catch (error) {
    elements.loading.hidden = true;
    elements.login.hidden = false;
    setMessage(elements.loginMessage, error.message || "Acesso administrativo nao autorizado.", "error");
  }
};

elements.loginForm.addEventListener("submit", handleLogin);
elements.logout.addEventListener("click", handleLogout);
elements.refresh.addEventListener("click", handleRefresh);
elements.restoreClients.addEventListener("click", handleRestoreClients);
elements.openClientModal.addEventListener("click", openClientModal);
elements.openDeleteClientModal.addEventListener("click", openDeleteClientModal);
elements.openPasswordModal.addEventListener("click", openPasswordModal);
elements.clientCreateForm.addEventListener("submit", handleCreateClient);
elements.passwordResetForm.addEventListener("submit", handleResetPassword);
elements.confirmDeleteClient.addEventListener("click", handleDeleteClient);
elements.generatePassword.addEventListener("click", () => {
  setFieldValue(elements.clientCreateForm, "password", generatePassword());
});
elements.generateResetPassword.addEventListener("click", () => {
  setFieldValue(elements.passwordResetForm, "password", generatePassword());
});
elements.serviceForm.addEventListener("submit", handleServiceSave);
elements.stepForm.addEventListener("submit", handleStepSave);
elements.updateForm.addEventListener("submit", handleUpdateSave);
openServiceModalButtons.forEach((button) => button.addEventListener("click", () => openServiceModal("new")));
elements.editService.addEventListener("click", () => openServiceModal("edit"));
elements.archiveService.addEventListener("click", handleArchiveService);
openStepModalButtons.forEach((button) => button.addEventListener("click", () => openStepModal()));
openUpdateModalButtons.forEach((button) => button.addEventListener("click", () => openUpdateModal()));
elements.clientSearch.addEventListener("input", () => {
  state.search = elements.clientSearch.value;
  renderClients();
});
elements.stepSort.addEventListener("change", () => {
  state.stepSort = elements.stepSort.value;
  renderSteps();
});
closeClientModalButtons.forEach((button) => button.addEventListener("click", closeClientModal));
closeDeleteClientModalButtons.forEach((button) => button.addEventListener("click", closeDeleteClientModal));
closePasswordModalButtons.forEach((button) => button.addEventListener("click", closePasswordModal));
closeServiceModalButtons.forEach((button) => button.addEventListener("click", closeServiceModal));
closeStepModalButtons.forEach((button) => button.addEventListener("click", closeStepModal));
closeUpdateModalButtons.forEach((button) => button.addEventListener("click", closeUpdateModal));
tabButtons.forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.tabButton)));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!elements.clientModal.hidden) {
    closeClientModal();
  } else if (!elements.deleteClientModal.hidden) {
    closeDeleteClientModal();
  } else if (!elements.passwordModal.hidden) {
    closePasswordModal();
  } else if (!elements.serviceModal.hidden) {
    closeServiceModal();
  } else if (!elements.stepModal.hidden) {
    closeStepModal();
  } else if (!elements.updateModal.hidden) {
    closeUpdateModal();
  }
});

bootstrap();
