const STORAGE_KEY = "lashstudiobymiri-editable-content";
const SECRET_COMMAND = "miriadmin";

const pageKey = document.body.dataset.page;
const siteHeader = document.getElementById("site-header");
const pageContent = document.getElementById("page-content");
const siteFooter = document.getElementById("site-footer");
const defaultContent = JSON.parse(JSON.stringify(window.SITE_CONTENT || {}));

let content = loadContent();
let activeSlide = 0;
let typedBuffer = "";
let editorElements = null;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function loadContent() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultContent));
  } catch {
    return JSON.parse(JSON.stringify(defaultContent));
  }
}

const cloneContent = (value) => JSON.parse(JSON.stringify(value));

const sanitizeUrl = (value, fallback = "#") => {
  const text = String(value || "").trim();

  if (!text) {
    return fallback;
  }

  if (/^(https?:|mailto:|tel:)/i.test(text) || text.startsWith("#")) {
    return text;
  }

  if (/^[\w./-]+(\?.*)?(#.*)?$/.test(text)) {
    return text;
  }

  return fallback;
};

const buildWaUrl = (message) => {
  const text = encodeURIComponent(message || content.site.defaultMessage);
  return `https://wa.me/${content.site.whatsappNumber}?text=${text}`;
};

const humanizeKey = (key) =>
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const setMeta = (page) => {
  if (!page) {
    return;
  }

  document.title = page.title;
  const metaDescription = document.querySelector('meta[name="description"]');

  if (metaDescription) {
    metaDescription.setAttribute("content", page.description);
  }
};

const renderHeader = () => {
  if (!siteHeader) {
    return;
  }

  const navigation = content.site.navigation
    .map(
      (item) => `
        <a data-nav="${escapeHtml(item.key)}" href="${escapeHtml(sanitizeUrl(item.href, "index.html"))}">${escapeHtml(item.label)}</a>
      `
    )
    .join("");

  siteHeader.innerHTML = `
    <div class="container header-bar">
      <a class="brand" href="index.html" aria-label="Ir al inicio de ${escapeHtml(content.site.brandName)}">
        <span class="brand-mark">${escapeHtml(content.site.brandMark)}</span>
        <span class="brand-copy">
          <strong>${escapeHtml(content.site.brandName)}</strong>
          <small>${escapeHtml(content.site.brandTagline)}</small>
        </span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Abrir menú">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="nav" id="main-nav">
        ${navigation}
        <a class="button button-primary wa-link" data-wa-message="${escapeHtml(content.site.defaultMessage)}" href="#" target="_blank" rel="noreferrer">Reservar turno</a>
      </nav>
    </div>
  `;
};

const renderFooter = () => {
  if (!siteFooter) {
    return;
  }

  const socialLinks = content.site.socialLinks
    .map(
      (item) => `
        <a href="${escapeHtml(sanitizeUrl(item.href))}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>
      `
    )
    .join("");

  siteFooter.innerHTML = `
    <div class="container footer-grid">
      <div>
        <strong class="footer-brand">${escapeHtml(content.site.brandName)}</strong>
        <p>${escapeHtml(content.site.footerDescription)}</p>
      </div>
      <div>
        <span class="footer-label">Redes sociales</span>
        <div class="social-links">
          ${socialLinks}
        </div>
      </div>
      <div>
        <span class="footer-label">Ubicación</span>
        <p>${escapeHtml(content.site.location)}</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>${escapeHtml(content.site.copyright)}</span>
    </div>
  `;
};

const renderInfoCards = (items = []) =>
  items
    .map(
      (item) => `
        <article class="info-card reveal">
          <span class="eyebrow">${escapeHtml(item.eyebrow)}</span>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");

const renderTestimonials = (items = []) =>
  items
    .map(
      (item) => `
        <article class="testimonial">
          <p>${escapeHtml(item.text)}</p>
          <strong>${escapeHtml(item.name)}</strong>
        </article>
      `
    )
    .join("");

const renderPage = () => {
  if (!pageContent || !content?.pages?.[pageKey]) {
    return;
  }

  const page = content.pages[pageKey];

  if (pageKey === "inicio") {
    const highlights = page.highlights
      .map(
        (item) => `
          <article>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.text)}</span>
          </article>
        `
      )
      .join("");

    const stats = page.panel.stats
      .map(
        (item) => `
          <div>
            <strong>${escapeHtml(item.value)}</strong>
            <span>${escapeHtml(item.label)}</span>
          </div>
        `
      )
      .join("");

    const browseCards = page.browse.cards
      .map(
        (item) => `
          <article class="page-link-card reveal">
            <span class="service-tag">${escapeHtml(item.tag)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
            <a class="button button-secondary" href="${escapeHtml(sanitizeUrl(item.href, "index.html"))}">${escapeHtml(item.label)}</a>
          </article>
        `
      )
      .join("");

    const aboutCards = page.about.features
      .map(
        (item) => `
          <article class="about-card reveal">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `
      )
      .join("");

    pageContent.innerHTML = `
      <section class="hero">
        <div class="hero-backdrop"></div>
        <div class="container hero-layout">
          <div class="hero-copy reveal">
            <span class="eyebrow">${escapeHtml(page.hero.eyebrow)}</span>
            <h1>${escapeHtml(page.hero.title)}</h1>
            <p class="hero-lead">${escapeHtml(page.hero.text)}</p>
            <div class="hero-actions">
              <a class="button button-primary wa-link" data-wa-message="${escapeHtml(page.hero.primaryMessage)}" href="#" target="_blank" rel="noreferrer">${escapeHtml(page.hero.primaryLabel)}</a>
              <a class="button button-secondary" href="${escapeHtml(sanitizeUrl(page.hero.secondaryHref, "servicios.html"))}">${escapeHtml(page.hero.secondaryLabel)}</a>
            </div>
            <div class="hero-highlights">
              ${highlights}
            </div>
          </div>
          <div class="hero-panel reveal">
            <div class="hero-card card-glass">
              <span class="card-kicker">${escapeHtml(page.panel.kicker)}</span>
              <h2>${escapeHtml(page.panel.title)}</h2>
              <p>${escapeHtml(page.panel.text)}</p>
              <div class="hero-card-grid">
                ${stats}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-heading reveal">
            <span class="eyebrow">${escapeHtml(page.browse.eyebrow)}</span>
            <h2>${escapeHtml(page.browse.title)}</h2>
            <p>${escapeHtml(page.browse.text)}</p>
          </div>
          <div class="page-links-grid">
            ${browseCards}
          </div>
        </div>
      </section>
      <section class="section about-section">
        <div class="container about-grid">
          <div class="about-copy reveal">
            <span class="eyebrow">${escapeHtml(page.about.eyebrow)}</span>
            <h2>${escapeHtml(page.about.title)}</h2>
            <p>${escapeHtml(page.about.text)}</p>
          </div>
          <div class="about-features">
            ${aboutCards}
          </div>
        </div>
      </section>
    `;

    return;
  }

  if (pageKey === "servicios") {
    const services = page.services
      .map(
        (item) => `
          <article class="service-card reveal">
            <span class="service-tag">${escapeHtml(item.tag)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
            <strong class="service-price">${escapeHtml(item.price)}</strong>
            <a class="button button-secondary wa-link" data-wa-message="${escapeHtml(item.message)}" href="#" target="_blank" rel="noreferrer">Reservar</a>
          </article>
        `
      )
      .join("");

    pageContent.innerHTML = `
      <section class="page-hero">
        <div class="container page-hero-content reveal">
          <span class="eyebrow">${escapeHtml(page.hero.eyebrow)}</span>
          <h1>${escapeHtml(page.hero.title)}</h1>
          <p>${escapeHtml(page.hero.text)}</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="services-grid">
            ${services}
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container info-grid">
          ${renderInfoCards(page.infoCards)}
        </div>
      </section>
    `;

    return;
  }

  if (pageKey === "galeria") {
    const gallery = page.galleryItems
      .map(
        (item) => `
          <figure class="${escapeHtml(item.classes)}">
            <img src="${escapeHtml(sanitizeUrl(item.src))}" alt="${escapeHtml(item.alt)}">
            <figcaption>${escapeHtml(item.caption)}</figcaption>
          </figure>
        `
      )
      .join("");

    pageContent.innerHTML = `
      <section class="page-hero">
        <div class="container page-hero-content reveal">
          <span class="eyebrow">${escapeHtml(page.hero.eyebrow)}</span>
          <h1>${escapeHtml(page.hero.title)}</h1>
          <p>${escapeHtml(page.hero.text)}</p>
        </div>
      </section>
      <section class="section gallery-section">
        <div class="container">
          <div class="gallery-grid gallery-grid-expanded">
            ${gallery}
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container info-grid">
          ${renderInfoCards(page.infoCards)}
        </div>
      </section>
    `;

    return;
  }

  if (pageKey === "opiniones") {
    const stats = page.stats
      .map(
        (item) => `
          <article class="stat-card reveal">
            <strong>${escapeHtml(item.value)}</strong>
            <span>${escapeHtml(item.label)}</span>
          </article>
        `
      )
      .join("");

    pageContent.innerHTML = `
      <section class="page-hero">
        <div class="container page-hero-content reveal">
          <span class="eyebrow">${escapeHtml(page.hero.eyebrow)}</span>
          <h1>${escapeHtml(page.hero.title)}</h1>
          <p>${escapeHtml(page.hero.text)}</p>
        </div>
      </section>
      <section class="section">
        <div class="container stats-grid">
          ${stats}
        </div>
      </section>
      <section class="section opinions-section">
        <div class="container">
          <div class="testimonials-card reveal">
            <div class="testimonials-header">
              <div>
                <span class="mini-label">${escapeHtml(page.testimonialsHeader.eyebrow)}</span>
                <h3>${escapeHtml(page.testimonialsHeader.title)}</h3>
              </div>
              <div class="slider-controls">
                <button class="slider-button" type="button" data-direction="prev" aria-label="Ver opinión anterior">←</button>
                <button class="slider-button" type="button" data-direction="next" aria-label="Ver siguiente opinión">→</button>
              </div>
            </div>
            <div class="testimonials-viewport">
              <div class="testimonials-track">
                ${renderTestimonials(page.testimonials)}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container info-grid">
          ${renderInfoCards(page.infoCards)}
        </div>
      </section>
    `;

    return;
  }

  if (pageKey === "contacto") {
    pageContent.innerHTML = `
      <section class="page-hero">
        <div class="container page-hero-content reveal">
          <span class="eyebrow">${escapeHtml(page.hero.eyebrow)}</span>
          <h1>${escapeHtml(page.hero.title)}</h1>
          <p>${escapeHtml(page.hero.text)}</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="contact-card reveal">
            <div class="contact-copy">
              <span class="eyebrow">${escapeHtml(page.contactCard.eyebrow)}</span>
              <h2>${escapeHtml(page.contactCard.title)}</h2>
              <p>${escapeHtml(page.contactCard.text)}</p>
              <div class="contact-meta">
                <div>
                  <small>${escapeHtml(page.contactCard.numberLabel)}</small>
                  <strong id="display-number">${escapeHtml(content.site.whatsappDisplay)}</strong>
                </div>
                <div>
                  <small>${escapeHtml(page.contactCard.messageLabel)}</small>
                  <strong>${escapeHtml(content.site.defaultMessage)}</strong>
                </div>
              </div>
            </div>
            <div class="contact-actions">
              <a class="button button-whatsapp wa-link" data-wa-message="${escapeHtml(content.site.defaultMessage)}" href="#" target="_blank" rel="noreferrer">${escapeHtml(page.contactCard.buttonLabel)}</a>
              <a class="button button-secondary" href="${escapeHtml(sanitizeUrl(page.contactCard.secondaryHref, "servicios.html"))}">${escapeHtml(page.contactCard.secondaryLabel)}</a>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container info-grid">
          ${renderInfoCards(page.infoCards)}
        </div>
      </section>
    `;
  }
};

const applyWhatsappLinks = () => {
  const waLinks = document.querySelectorAll(".wa-link");
  const displayNumber = document.getElementById("display-number");

  waLinks.forEach((link) => {
    const message = link.dataset.waMessage || content.site.defaultMessage;
    link.href = buildWaUrl(message);
  });

  if (displayNumber) {
    displayNumber.textContent = content.site.whatsappDisplay;
  }
};

const initMenu = () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav a[data-nav]");

  if (pageKey) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.nav === pageKey);
    });
  }

  if (!menuToggle || !nav) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
};

const initReveal = () => {
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
    return;
  }

  revealElements.forEach((element) => element.classList.add("is-visible"));
};

const getCardsPerView = () => {
  if (window.innerWidth <= 860) {
    return 1;
  }

  if (window.innerWidth <= 1120) {
    return 2;
  }

  return 3;
};

const updateSlider = () => {
  const sliderTrack = document.querySelector(".testimonials-track");

  if (!sliderTrack) {
    return;
  }

  const cards = Array.from(sliderTrack.children);
  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(cards.length - cardsPerView, 0);

  if (activeSlide > maxIndex) {
    activeSlide = maxIndex;
  }

  const cardWidth = cards[0]?.getBoundingClientRect().width || 0;
  const gap = 16;
  const offset = activeSlide * (cardWidth + gap);

  sliderTrack.style.transform = `translateX(-${offset}px)`;
};

const initSlider = () => {
  const sliderButtons = document.querySelectorAll(".slider-button");

  sliderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sliderTrack = document.querySelector(".testimonials-track");

      if (!sliderTrack) {
        return;
      }

      const cards = Array.from(sliderTrack.children);
      const cardsPerView = getCardsPerView();
      const maxIndex = Math.max(cards.length - cardsPerView, 0);

      if (button.dataset.direction === "next") {
        activeSlide = activeSlide >= maxIndex ? 0 : activeSlide + 1;
      } else {
        activeSlide = activeSlide <= 0 ? maxIndex : activeSlide - 1;
      }

      updateSlider();
    });
  });

  updateSlider();
};

const getValueByPath = (source, path) =>
  path.reduce((current, key) => (current == null ? current : current[key]), source);

const setValueByPath = (source, path, value) => {
  const parent = path.slice(0, -1).reduce((current, key) => current[key], source);
  parent[path[path.length - 1]] = value;
};

const isUrlField = (key) => ["href", "src"].includes(String(key).toLowerCase());

const isLongField = (key, value) =>
  ["text", "description", "message", "copyright"].includes(String(key).toLowerCase()) ||
  String(value).length > 60;

const buildEditorField = (path, key, value) => {
  const pathValue = path.join(".");
  const label = humanizeKey(key);

  if (isLongField(key, value)) {
    return `
      <label class="admin-editor-field">
        <span>${escapeHtml(label)}</span>
        <textarea data-path="${escapeHtml(pathValue)}" rows="4">${escapeHtml(value)}</textarea>
      </label>
    `;
  }

  const type = isUrlField(key) ? "url" : "text";

  return `
    <label class="admin-editor-field">
      <span>${escapeHtml(label)}</span>
      <input type="${type}" data-path="${escapeHtml(pathValue)}" value="${escapeHtml(value)}">
    </label>
  `;
};

const buildEditorMarkup = (source, path = [], title = "") => {
  const entries = Array.isArray(source) ? source.map((value, index) => [index, value]) : Object.entries(source);

  return entries
    .map(([key, value]) => {
      const nextPath = [...path, key];

      if (value && typeof value === "object") {
        const summary = Array.isArray(source)
          ? `${title || humanizeKey(path[path.length - 1] || "Item")} ${Number(key) + 1}`
          : humanizeKey(key);

        return `
          <details class="admin-editor-group" open>
            <summary>${escapeHtml(summary)}</summary>
            <div class="admin-editor-group-body">
              ${buildEditorMarkup(value, nextPath, humanizeKey(key))}
            </div>
          </details>
        `;
      }

      return buildEditorField(nextPath, key, value);
    })
    .join("");
};

const serializeContentFile = (source) => `window.SITE_CONTENT = ${JSON.stringify(source, null, 2)};\n`;

const downloadContentFile = (source) => {
  const file = new Blob([serializeContentFile(source)], {
    type: "application/javascript;charset=utf-8"
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "content.js";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

const ensureEditor = () => {
  if (editorElements) {
    return editorElements;
  }

  const root = document.createElement("div");
  root.className = "admin-editor";
  root.innerHTML = `
    <div class="admin-editor-backdrop" data-close-editor="true"></div>
    <div class="admin-editor-panel" role="dialog" aria-modal="true" aria-label="Editor visual oculto">
      <div class="admin-editor-header">
        <div>
          <span class="admin-editor-badge">Modo editor</span>
          <h2>Editar contenido visualmente</h2>
          <p>Modificá textos, links, servicios, opiniones, imágenes y contacto sin tocar código.</p>
        </div>
        <button class="admin-editor-close" type="button" data-close-editor="true">Cerrar</button>
      </div>
      <div class="admin-editor-toolbar">
        <button class="button button-secondary" type="button" data-editor-action="preview">Vista previa</button>
        <button class="button button-primary" type="button" data-editor-action="save">Guardar</button>
        <button class="button button-secondary" type="button" data-editor-action="export">Descargar content.js</button>
        <button class="button button-secondary" type="button" data-editor-action="reset">Restablecer</button>
      </div>
      <div class="admin-editor-status" aria-live="polite"></div>
      <div class="admin-editor-scroll">
        <form class="admin-editor-form"></form>
      </div>
    </div>
  `;

  document.body.append(root);

  const form = root.querySelector(".admin-editor-form");
  const status = root.querySelector(".admin-editor-status");

  root.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.dataset.closeEditor === "true") {
      closeEditor();
      return;
    }

    const action = target.dataset.editorAction;

    if (!action) {
      return;
    }

    if (action === "preview") {
      content = cloneContent(editorElements.draft);
      renderSite();
      setEditorStatus("Vista previa aplicada.");
      return;
    }

    if (action === "save") {
      content = cloneContent(editorElements.draft);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      renderSite();
      setEditorStatus("Cambios guardados en este navegador.");
      return;
    }

    if (action === "export") {
      downloadContentFile(editorElements.draft);
      setEditorStatus("Se descargó un nuevo content.js.");
      return;
    }

    if (action === "reset") {
      editorElements.draft = cloneContent(defaultContent);
      content = cloneContent(defaultContent);
      localStorage.removeItem(STORAGE_KEY);
      renderEditorForm();
      renderSite();
      setEditorStatus("Se restableció el contenido original.");
    }
  });

  form.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      return;
    }

    const path = target.dataset.path?.split(".") || [];

    if (!path.length) {
      return;
    }

    setValueByPath(editorElements.draft, path, target.value);
  });

  editorElements = {
    root,
    form,
    status,
    draft: cloneContent(content)
  };

  return editorElements;
};

const renderEditorForm = () => {
  const editor = ensureEditor();
  editor.form.innerHTML = `
    <details class="admin-editor-group" open>
      <summary>Configuración general</summary>
      <div class="admin-editor-group-body">
        ${buildEditorMarkup(editor.draft.site, ["site"])}
      </div>
    </details>
    <details class="admin-editor-group" open>
      <summary>Páginas</summary>
      <div class="admin-editor-group-body">
        ${buildEditorMarkup(editor.draft.pages, ["pages"])}
      </div>
    </details>
  `;
};

const setEditorStatus = (message) => {
  if (!editorElements) {
    return;
  }

  editorElements.status.textContent = message;
};

const openEditor = () => {
  const editor = ensureEditor();
  editor.draft = cloneContent(content);
  renderEditorForm();
  setEditorStatus(`Comando oculto activado. Escribí, previsualizá y guardá.`);
  editor.root.classList.add("is-open");
  document.body.classList.add("editor-open");
};

const closeEditor = () => {
  if (!editorElements) {
    return;
  }

  editorElements.root.classList.remove("is-open");
  document.body.classList.remove("editor-open");
};

const initSecretCommand = () => {
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isEditingField =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;

    if (event.key === "Escape" && editorElements?.root.classList.contains("is-open")) {
      closeEditor();
      return;
    }

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "e") {
      event.preventDefault();
      openEditor();
      typedBuffer = "";
      return;
    }

    if (isEditingField || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) {
      return;
    }

    typedBuffer = `${typedBuffer}${event.key.toLowerCase()}`.slice(-SECRET_COMMAND.length);

    if (typedBuffer === SECRET_COMMAND) {
      openEditor();
      typedBuffer = "";
    }
  });
};

const renderSite = () => {
  if (!content?.pages?.[pageKey]) {
    return;
  }

  setMeta(content.pages[pageKey]);
  renderHeader();
  renderPage();
  renderFooter();
  applyWhatsappLinks();
  initMenu();
  initReveal();
  initSlider();
};

if (content?.pages?.[pageKey]) {
  renderSite();
  initSecretCommand();
  window.addEventListener("resize", updateSlider);
}
