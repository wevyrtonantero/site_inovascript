const root = document.documentElement;
const menuToggle = document.querySelector(".menu-toggle");
const headerPanel = document.querySelector(".header-panel");
const themeToggle = document.querySelector("[data-theme-toggle]");
const langButtons = document.querySelectorAll("[data-lang-choice]");
const metaDescription = document.querySelector('meta[name="description"]');

const translations = {
  pt: {
    meta: {
      title: "InovaScript | Soluções sob medida para indústria",
      description:
        "A InovaScript cria soluções sob medida para pequenas e médias empresas: controle de estoque, automação de etiquetas, CRM, manutenção, integrações fabris e sites profissionais.",
    },
    controls: {
      menu: "Menu",
      themeDark: "Tema escuro",
      themeLight: "Tema claro",
    },
    brand: {
      tagline: "Soluções industriais sob medida",
    },
    nav: {
      company: "Empresa",
      solutions: "Soluções",
      process: "Como atuamos",
      case: "Case",
      contact: "Contato",
      clientPortal: "Área do cliente",
      whatsapp: "WhatsApp",
    },
    hero: {
      eyebrow: "Consultoria e software para indústria",
      title: "Sua operação precisa de um sistema que entenda o processo real da empresa.",
      copy:
        "A InovaScript desenvolve soluções personalizadas para pequenas e médias empresas, sempre com foco industrial: controle de estoque, automação de etiquetas, manutenção, CRM, integrações fabris e sites profissionais.",
      ctaPrimary: "Falar no WhatsApp",
      ctaSecondary: "Ver soluções",
      ctaPortal: "Acompanhar meu projeto",
      proofLabel: "Projeto industrial em operação",
      proofValue: "Fluxo completo com estoque, produção e automação de etiquetas",
      bullet1: "Começamos com videoconferência para entender o processo real",
      bullet2: "Diagnóstico técnico antes do desenvolvimento",
      bullet3: "Software sob medida para o ritmo da operação",
      bullet4: "Equipe com engenharia, elétrica, mecânica e programação",
      scroll: "Role e veja como trabalhamos",
    },
    telemetry: {
      diagTitle: "Videoconferência de diagnóstico",
      diagDesc: "Entendimento do processo, gargalos e rotina da operação.",
      flowTitle: "Mapeamento do fluxo completo",
      flowDesc: "Produção, estoque, inspeção, matéria-prima e expedição.",
      buildTitle: "Implantação sob medida",
      buildDesc: "Sistema ajustado ao dia a dia e preparado para evoluir.",
    },
    signal: [
      "Controle de estoque",
      "Automação de etiquetas",
      "CRM personalizado",
      "Controle de manutenção",
      "Integração de fluxo fabril",
      "Sites profissionais",
      "Dashboards operacionais",
      "Controle de estoque",
      "Automação de etiquetas",
      "CRM personalizado",
      "Controle de manutenção",
      "Integração de fluxo fabril",
      "Sites profissionais",
      "Dashboards operacionais",
    ],
    solutions: {
      eyebrow: "O que entregamos",
      title: "Soluções que acompanham a rotina da sua empresa",
      copy:
        "Cada projeto nasce da necessidade real da operação. Nada de pacote genérico. O foco é organizar fluxo, reduzir atrito e dar clareza para quem precisa produzir, vender, manter e entregar.",
    },
    company: {
      eyebrow: "Empresa brasileira",
      title:
        "A InovaScript nasceu no Brasil para transformar processo em solução sob medida.",
      copy1:
        "Somos uma empresa brasileira pensada para diagnosticar a rotina, entender a necessidade da operação e transformar isso em sistema, automação e ferramenta útil de verdade.",
      copy2:
        "Não trabalhamos com código genérico empurrado para qualquer cenário. Entramos para compreender a realidade da empresa e construir uma solução personalizada, com visão técnica, proximidade e responsabilidade na entrega.",
      panel1Label: "Origem",
      panel1Title: "Empresa brasileira com foco industrial",
      panel1Desc:
        "Criada para atender pequenas e médias empresas que precisam organizar operação, informação e crescimento.",
      panel2Label: "Abordagem",
      panel2Title: "Consultoria antes de desenvolvimento",
      panel2Desc:
        "Entendemos processo, gargalo e rotina antes de definir tela, fluxo, impressão ou integração.",
      panel3Label: "Entrega",
      panel3Title: "Software e automação com aplicação real",
      panel3Desc:
        "Sites profissionais, controle de estoque, manutenção, CRM, integração fabril e soluções feitas para o uso diário.",
    },
    services: {
      inventoryTitle: "Controle de estoque",
      inventoryDesc:
        "Entradas, saídas, rastreabilidade, localização de itens e visão do estoque em tempo real.",
      labelsTitle: "Automação de etiquetas",
      labelsDesc:
        "Geração e impressão integradas ao processo para reduzir retrabalho e ganhar velocidade na expedição.",
      maintenanceTitle: "Controle de manutenção",
      maintenanceDesc:
        "Histórico de equipamentos, ordens de serviço, programação e acompanhamento do que não pode parar.",
      crmTitle: "CRM de vendas personalizado",
      crmDesc:
        "Funil comercial ajustado ao jeito da sua equipe vender, sem excesso de tela e sem processo engessado.",
      flowTitle: "Integração de fluxo fabril",
      flowDesc:
        "Produção, almoxarifado, expedição e indicadores conectados para o dado circular onde faz diferença.",
      sitesTitle: "Sites profissionais",
      sitesDesc:
        "Presença digital séria, clara e alinhada à autoridade técnica da empresa para vender melhor.",
    },
    portal: {
      eyebrow: "Portal de acompanhamento",
      title: "Quem contrata a InovaScript acompanha o projeto em tempo real.",
      copy:
        "O portal é um benefício dos nossos clientes: um espaço privado para acompanhar a aplicação ganhando corpo, ver o percentual de evolução, acessar previews, acompanhar decisões e deixar feedbacks com transparência durante toda a criação.",
      button: "Entrar no portal do cliente",
      card1Title: "Cronograma visível",
      card1Copy: "Etapas, status, previsão e justificativas sem troca perdida de mensagem.",
      card2Title: "Links do projeto",
      card2Copy: "Preview, ambiente publicado, anexos e atualizações em um só lugar.",
      card3Title: "Conversa por serviço",
      card3Copy: "Feedbacks ficam vinculados ao serviço certo, com resposta e status.",
    },
    process: {
      eyebrow: "Como atuamos",
      title: "Começamos por videoconferência e desenhamos a solução em cima do processo real.",
      copy1:
        "Nossa equipe reúne engenheiros, profissionais de elétrica, mecânica e programadores para entender a operação a fundo antes de desenhar qualquer tela.",
      copy2:
        "Falamos com quem compra, produz, separa, mantém, etiqueta, expede e vende. A solução só faz sentido quando cabe no dia a dia da empresa.",
      step1Title: "Videoconferência de entendimento",
      step1Desc:
        "Começamos com uma conversa técnica para mapear rotina, gargalos, decisões e pontos de perda da operação.",
      step2Title: "Mapeamento do fluxo completo",
      step2Desc:
        "Estruturamos fluxo, permissões, telas, impressões e integrações com foco no uso real da empresa.",
      step3Title: "Implantação acompanhada",
      step3Desc:
        "Ajustamos o sistema junto com a equipe para a entrega acontecer com clareza, segurança e velocidade.",
      step4Title: "Evolução contínua",
      step4Desc:
        "O projeto pode crescer com novos módulos, relatórios e etapas conforme a operação amadurece.",
    },
    case: {
      eyebrow: "Case de sucesso",
      title: "Fluxo completo implantado em operação real",
      copy1:
        "Em um dos projetos em operação, estruturamos um fluxo completo para uma indústria brasileira, indo muito além de um controle simples ou de uma automação isolada.",
      copy2:
        "A solução conectou etapas, organizou informação e colocou a tecnologia a favor da rotina da fábrica, com visão operacional de ponta a ponta.",
      tag1: "Fluxo completo implantado",
      tag2: "Operação conectada",
      tag3: "Base pronta para evoluir",
      scopeTitle: "Resumo do case",
      scopeSummary:
        "Esse case é da SAFISA Servo Embreagem. De forma resumida, estruturamos um fluxo completo para produção, estoques por etapa e automação de etiqueta dentro da rotina real da empresa.",
      scope1: "Ordem de produção",
      scope2: "Produção",
      scope3: "Controle de matéria-prima",
      scope4: "Controle de almoxarifado",
      scope5: "Estoque de montagem",
      scope6: "Estoque de inspeção",
      scope7: "Tratamentos externos",
      scope8: "Controle de estoque",
      scope9: "Automação da etiqueta",
    },
    trusted: {
      eyebrow: "Empresas que confiam",
      title: "Empresas que acreditam no nosso trabalho",
    },
    industry: {
      eyebrow: "Foco industrial",
      title:
        "Quem vive chão de fábrica, manutenção e expedição precisa de software que fale a mesma língua.",
      copy:
        "A InovaScript entra para entender o cenário, traduzir a necessidade e transformar isso em uma ferramenta personalizada, objetiva e pronta para crescer com a empresa.",
      item1: "Produção",
      item2: "Manutenção",
      item3: "Almoxarifado",
      item4: "Expedição",
      item5: "Comercial",
      item6: "Gestão",
    },
    pricing: {
      eyebrow: "Condição comercial",
      title: "Projeto sob medida com valor acessível e proposta competitiva.",
      copy1:
        "Trabalhamos para entregar uma condição viável para pequenas e médias empresas, com negociação direta e proposta construída em cima da realidade da operação.",
      copy2:
        "Já tem uma oferta em mãos? Traga para a conversa. Nosso objetivo é montar a solução mais forte possível dentro da melhor condição.",
      panelTitle: "Parceria próxima do início à implantação",
      panelCopy:
        "Proposta clara, atendimento próximo e solução personalizada para a realidade da empresa.",
    },
    cta: {
      eyebrow: "Vamos conversar",
      title: "Me conta o que trava a sua operação hoje e eu transformo isso em um projeto claro.",
      copy:
        "Atendimento direto pelo WhatsApp para entender sua empresa, avaliar o cenário atual e desenhar a solução certa.",
      button: "Chamar no WhatsApp",
    },
    footer: {
      copy: "Soluções personalizadas para indústria e empresas em crescimento.",
      rights: "© 2026 InovaScript. Todos os direitos reservados.",
    },
  },
  en: {
    meta: {
      title: "InovaScript | Custom software for industry",
      description:
        "InovaScript builds custom solutions for small and midsize companies: inventory control, label automation, CRM, maintenance, factory workflow integrations and professional websites.",
    },
    controls: {
      menu: "Menu",
      themeDark: "Dark mode",
      themeLight: "Light mode",
    },
    brand: {
      tagline: "Custom industrial solutions",
    },
    nav: {
      company: "Company",
      solutions: "Solutions",
      process: "Process",
      case: "Case",
      contact: "Contact",
      clientPortal: "Client area",
      whatsapp: "WhatsApp",
    },
    hero: {
      eyebrow: "Consulting and software for industry",
      title: "Your operation needs a system that understands the real process behind the business.",
      copy:
        "InovaScript develops custom solutions for small and midsize companies with an industrial mindset: inventory control, label automation, maintenance, CRM, factory workflow integrations and professional websites.",
      ctaPrimary: "Talk on WhatsApp",
      ctaSecondary: "View solutions",
      ctaPortal: "Track my project",
      proofLabel: "Industrial project in operation",
      proofValue: "Full workflow with inventory, production and label automation",
      bullet1: "We start with a video call to understand the real process",
      bullet2: "Technical diagnosis before development",
      bullet3: "Custom software built for the actual operation",
      bullet4: "Team with engineering, electrical, mechanical and software expertise",
      scroll: "Scroll to see how we work",
    },
    telemetry: {
      diagTitle: "Diagnostic video call",
      diagDesc: "Understanding the process, bottlenecks and day-to-day operation.",
      flowTitle: "Full workflow mapping",
      flowDesc: "Production, inventory, inspection, raw materials and shipping.",
      buildTitle: "Custom implementation",
      buildDesc: "System adjusted to the real routine and ready to evolve.",
    },
    signal: [
      "Inventory control",
      "Label automation",
      "Custom CRM",
      "Maintenance control",
      "Factory workflow integration",
      "Professional websites",
      "Operational dashboards",
      "Inventory control",
      "Label automation",
      "Custom CRM",
      "Maintenance control",
      "Factory workflow integration",
      "Professional websites",
      "Operational dashboards",
    ],
    solutions: {
      eyebrow: "What we deliver",
      title: "Solutions built around the way your company actually works",
      copy:
        "Every project starts from a real operational need. No generic package. The goal is to organize flow, reduce friction and give clarity to the people who need to produce, sell, maintain and deliver.",
    },
    company: {
      eyebrow: "Brazilian company",
      title:
        "InovaScript was created in Brazil to turn process into custom solutions.",
      copy1:
        "We are a Brazilian company built to diagnose routines, understand operational needs and turn them into systems, automation and tools that are genuinely useful.",
      copy2:
        "We do not push generic code into every scenario. We step in to understand the company’s reality and build a custom solution with technical vision, proximity and accountability in delivery.",
      panel1Label: "Origin",
      panel1Title: "Brazilian company with industrial focus",
      panel1Desc:
        "Created to support small and midsize businesses that need to organize operations, information and growth.",
      panel2Label: "Approach",
      panel2Title: "Consulting before development",
      panel2Desc:
        "We understand process, bottlenecks and routine before defining screens, flows, printing or integrations.",
      panel3Label: "Delivery",
      panel3Title: "Software and automation for real use",
      panel3Desc:
        "Professional websites, inventory control, maintenance, CRM, factory integration and solutions built for daily work.",
    },
    services: {
      inventoryTitle: "Inventory control",
      inventoryDesc:
        "Inbound, outbound, traceability, item location and real-time inventory visibility.",
      labelsTitle: "Label automation",
      labelsDesc:
        "Integrated label generation and printing to reduce rework and speed up shipping.",
      maintenanceTitle: "Maintenance control",
      maintenanceDesc:
        "Equipment history, work orders, planning and follow-up for what cannot stop.",
      crmTitle: "Custom sales CRM",
      crmDesc:
        "A sales pipeline tailored to the way your team actually sells, without unnecessary screens or rigid steps.",
      flowTitle: "Factory workflow integration",
      flowDesc:
        "Production, warehouse, shipping and indicators connected so data flows where it matters.",
      sitesTitle: "Professional websites",
      sitesDesc:
        "A serious digital presence aligned with your technical authority so the company sells better.",
    },
    portal: {
      eyebrow: "Client tracking portal",
      title: "InovaScript clients track their project in real time.",
      copy:
        "The portal is a benefit for our clients: a private space to watch the application take shape, follow progress percentage, access previews, review decisions and leave feedback with transparency throughout the build.",
      button: "Open client portal",
      card1Title: "Visible timeline",
      card1Copy: "Steps, status, forecast dates and justifications without lost message threads.",
      card2Title: "Project links",
      card2Copy: "Preview, published environment, attachments and updates in one organized place.",
      card3Title: "Conversation by service",
      card3Copy: "Feedback stays linked to the right service, with response and status.",
    },
    process: {
      eyebrow: "How we work",
      title: "We start with a video call and design the solution around the real process.",
      copy1:
        "Our team brings together engineers, electrical and mechanical specialists, and programmers to understand the operation in depth before drawing any screen.",
      copy2:
        "We talk to the people who buy, produce, pick, maintain, label, ship and sell. The solution only makes sense when it fits the company’s daily routine.",
      step1Title: "Discovery video call",
      step1Desc:
        "We begin with a technical conversation to map routines, bottlenecks, decisions and loss points in the operation.",
      step2Title: "Full workflow mapping",
      step2Desc:
        "We structure flows, permissions, screens, print routines and integrations around real use.",
      step3Title: "Guided implementation",
      step3Desc:
        "We adjust the system with the team so delivery happens with clarity, speed and confidence.",
      step4Title: "Continuous evolution",
      step4Desc:
        "The project can grow with new modules, reports and stages as the operation matures.",
    },
    case: {
      eyebrow: "Success case",
      title: "Full workflow deployed in real operation",
      copy1:
        "In one of our live projects, we structured a complete workflow for a Brazilian industrial company, going far beyond a simple control tool or a standalone automation.",
      copy2:
        "The solution connected stages, organized information and put technology to work for the factory routine with end-to-end operational visibility.",
      tag1: "Full workflow deployed",
      tag2: "Connected operation",
      tag3: "Foundation ready to grow",
      scopeTitle: "Case summary",
      scopeSummary:
        "This case belongs to SAFISA Servo Embreagem. In short, we structured a complete flow for production, stage-based inventories and label automation inside the company’s real routine.",
      scope1: "Production orders",
      scope2: "Production",
      scope3: "Raw material control",
      scope4: "Warehouse control",
      scope5: "Assembly stock",
      scope6: "Inspection stock",
      scope7: "External treatments",
      scope8: "Inventory control",
      scope9: "Label automation",
    },
    trusted: {
      eyebrow: "Trusted by companies",
      title: "Companies that believe in our work",
    },
    industry: {
      eyebrow: "Industrial focus",
      title:
        "If you live in factory floors, maintenance and shipping, you need software that speaks the same language.",
      copy:
        "InovaScript comes in to understand the scenario, translate the need and turn it into a custom, objective tool ready to grow with the company.",
      item1: "Production",
      item2: "Maintenance",
      item3: "Warehouse",
      item4: "Shipping",
      item5: "Sales",
      item6: "Management",
    },
    pricing: {
      eyebrow: "Commercial terms",
      title: "Custom projects with accessible pricing and a competitive proposal.",
      copy1:
        "We work to deliver viable conditions for small and midsize companies, with direct negotiation and proposals built around the reality of the operation.",
      copy2:
        "Already have another offer? Bring it to the conversation. Our goal is to build the strongest solution possible within the best condition.",
      panelTitle: "Close partnership from the first conversation to deployment",
      panelCopy:
        "Clear proposal, close support and a custom solution built around the company’s reality.",
    },
    cta: {
      eyebrow: "Let’s talk",
      title: "Tell me what is slowing your operation down today and I will turn it into a clear project.",
      copy:
        "Direct WhatsApp contact to understand your company, assess the current scenario and design the right solution.",
      button: "Start on WhatsApp",
    },
    footer: {
      copy: "Custom solutions for industry and growing companies.",
      rights: "© 2026 InovaScript. All rights reserved.",
    },
  },
};

let currentLang = localStorage.getItem("inovascript-language") || "pt";
let currentTheme = localStorage.getItem("inovascript-theme") || "light";

const getTranslation = (lang, key) =>
  key.split(".").reduce((value, segment) => value?.[segment], translations[lang]);

const updateThemeLabel = () => {
  if (!themeToggle) return;
  const nextThemeKey = currentTheme === "dark" ? "themeLight" : "themeDark";
  themeToggle.textContent = translations[currentLang].controls[nextThemeKey];
  themeToggle.setAttribute("aria-pressed", String(currentTheme === "dark"));
};

const applyTheme = (theme) => {
  currentTheme = theme;
  root.dataset.theme = theme;
  localStorage.setItem("inovascript-theme", theme);
  updateThemeLabel();
};

const applyLanguage = (lang) => {
  currentLang = lang;
  localStorage.setItem("inovascript-language", lang);
  root.lang = lang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    const value = getTranslation(lang, key);
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-signal-index]").forEach((element) => {
    const index = Number(element.dataset.signalIndex);
    element.textContent = translations[lang].signal[index];
  });

  document.title = translations[lang].meta.title;
  if (metaDescription) {
    metaDescription.setAttribute("content", translations[lang].meta.description);
  }

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langChoice === lang);
    button.setAttribute("aria-pressed", String(button.dataset.langChoice === lang));
  });

  updateThemeLabel();
};

if (menuToggle && headerPanel) {
  menuToggle.addEventListener("click", () => {
    const isOpen = headerPanel.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  headerPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      headerPanel.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (!headerPanel.classList.contains("is-open")) return;
    if (headerPanel.contains(event.target) || menuToggle.contains(event.target)) return;
    headerPanel.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.langChoice);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

const hero = document.querySelector(".hero");
const canvas = document.querySelector(".hero-canvas");

if (hero && canvas) {
  const ctx = canvas.getContext("2d");
  const points = [];
  const pointCount = 34;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resizeCanvas = () => {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (points.length === 0) {
      for (let index = 0; index < pointCount; index += 1) {
        points.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.22,
          size: Math.random() * 2.2 + 1.2,
        });
      }
    } else {
      points.forEach((point) => {
        point.x = (point.x / Math.max(canvas.clientWidth, 1)) * rect.width;
        point.y = (point.y / Math.max(canvas.clientHeight, 1)) * rect.height;
      });
    }
  };

  const drawGrid = (width, height) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 90) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const animate = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);
    drawGrid(width, height);

    points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x <= 0 || point.x >= width) point.vx *= -1;
      if (point.y <= 0 || point.y >= height) point.vy *= -1;
    });

    for (let a = 0; a < points.length; a += 1) {
      const pointA = points[a];

      ctx.beginPath();
      ctx.fillStyle = "rgba(70, 162, 255, 0.95)";
      ctx.arc(pointA.x, pointA.y, pointA.size, 0, Math.PI * 2);
      ctx.fill();

      for (let b = a + 1; b < points.length; b += 1) {
        const pointB = points[b];
        const dx = pointA.x - pointB.x;
        const dy = pointA.y - pointB.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 165) {
          const opacity = 1 - distance / 165;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(239, 125, 29, ${opacity * 0.18})`;
          ctx.lineWidth = 1;
          ctx.moveTo(pointA.x, pointA.y);
          ctx.lineTo(pointB.x, pointB.y);
          ctx.stroke();
        }
      }
    }

    if (!reducedMotion) {
      window.requestAnimationFrame(animate);
    }
  };

  resizeCanvas();
  animate();
  window.addEventListener("resize", resizeCanvas);
}

applyLanguage(currentLang);
applyTheme(currentTheme);
