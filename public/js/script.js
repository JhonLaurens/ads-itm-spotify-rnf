/**
 * RNF Spotify — interacciones (vanilla JS)
 */
(function () {
  "use strict";

  var THEME_KEY = "ads-itm-theme";

  var tacticModals = {
    "tactic-f1-1": {
      title: "Circuit breaker con fallback",
      html:
        "<p><strong>Problema:</strong> timeouts en servidores sobrecargados.</p>" +
        "<p><strong>Solución:</strong> tras 3 errores consecutivos, conmutar a una CDN alternativa.</p>" +
        "<p><strong>Beneficio:</strong> reduce latencia ~70 % en picos de demanda al evitar reintentos en cascada.</p>",
    },
    "tactic-f1-2": {
      title: "Adaptive Bitrate Streaming (ABR)",
      html:
        "<p><strong>Problema:</strong> ancho de banda variable provoca buffering.</p>" +
        "<p><strong>Solución:</strong> monitorizar throughput cada ~2 s y ajustar calidad con DASH.</p>" +
        "<p><strong>Beneficio:</strong> elimina ~95 % de interrupciones causadas por buffering perceptible.</p>",
    },
    "tactic-f2-1": {
      title: "Pre-computación con fallback",
      html:
        "<p><strong>Problema:</strong> generación en tiempo real muy lenta (5–10 s).</p>" +
        "<p><strong>Solución:</strong> jobs nocturnos + fallback a recomendaciones por clúster demográfico.</p>" +
        "<p><strong>Beneficio:</strong> latencia &lt; 800 ms para ~99,5 % de usuarios y ~90 % menos coste de inferencia online.</p>",
    },
    "tactic-f2-2": {
      title: "Multi-armed bandit para exploración",
      html:
        "<p><strong>Problema:</strong> solo explotar el historial refuerza la «burbuja de filtro».</p>" +
        "<p><strong>Solución:</strong> Thompson sampling con ~80 % explotación y ~20 % exploración.</p>" +
        "<p><strong>Beneficio:</strong> +40 % diversidad y +12 % retención a 6 meses (orden de magnitud ilustrativo).</p>",
    },
    "tactic-f3-1": {
      title: "Operational Transformation (OT)",
      html:
        "<p><strong>Problema:</strong> ediciones concurrentes sobre la cola de reproducción.</p>" +
        "<p><strong>Solución:</strong> transformar operaciones concurrentes para converger a un estado coherente.</p>" +
        "<p><strong>Beneficio:</strong> 0 pérdida de comandos y convergencia garantizada bajo concurrencia.</p>",
    },
    "tactic-f3-2": {
      title: "Health check con auto-discovery",
      html:
        "<p><strong>Problema:</strong> dispositivos offline siguen apareciendo como disponibles.</p>" +
        "<p><strong>Solución:</strong> heartbeat cada 10 s, marcar offline si no hay respuesta en 30 s; mDNS para nuevos dispositivos.</p>" +
        "<p><strong>Beneficio:</strong> lista fiable; menos frustración al reducir acciones sobre dispositivos inactivos.</p>",
    },
  };

  var matrixCopy = {
    "0-0": {
      title: "Disponibilidad × Disponibilidad",
      text: "Celda diagonal: misma dimensión de calidad. No hay tensión entre un RNF y sí mismo.",
    },
    "0-1": {
      title: "Disponibilidad × Rendimiento",
      text: "Conflicto: buffers grandes mejoran continuidad pero pueden aumentar latencia percibida o uso de recursos. Se equilibra con buffer adaptativo.",
    },
    "0-2": {
      title: "Disponibilidad × Consistencia",
      text: "Conflicto (CAP): fuerte consistencia global puede bloquear o retrasar respuestas; la disponibilidad del audio suele priorizarse con modelos eventualmente consistentes.",
    },
    "0-3": {
      title: "Disponibilidad × Interoperabilidad",
      text: "Complementarios: más dispositivos y protocolos bien integrados mantienen la experiencia disponible donde el usuario esté.",
    },
    "1-0": {
      title: "Rendimiento × Disponibilidad",
      text: "Conflicto: ver Disponibilidad × Rendimiento — trade-off entre precarga/buffer y tiempos de respuesta.",
    },
    "1-1": {
      title: "Rendimiento × Rendimiento",
      text: "Celda diagonal: métricas de rendimiento se refinan con percentiles, throughput y coste.",
    },
    "1-2": {
      title: "Rendimiento × Consistencia",
      text: "Complementarios: la caché bien acotada acelera lecturas y puede servir vistas coherentes con TTL y versionado.",
    },
    "1-3": {
      title: "Rendimiento × Interoperabilidad",
      text: "Conflicto: capas de adaptación y traducción de protocolos añaden latencia; se mitiga con adaptadores ligeros y rutas optimizadas.",
    },
    "2-0": {
      title: "Consistencia × Disponibilidad",
      text: "Conflicto (CAP): fuerte consistencia puede reducir disponibilidad bajo partición; eventual es más tolerante.",
    },
    "2-1": {
      title: "Consistencia × Rendimiento",
      text: "Complementarios: ver Rendimiento × Consistencia — diseños de lectura optimizada con consistencia definida por el negocio.",
    },
    "2-2": {
      title: "Consistencia × Consistencia",
      text: "Celda diagonal: se elige el modelo (fuerte, eventual, causal) según el caso de uso.",
    },
    "2-3": {
      title: "Consistencia × Interoperabilidad",
      text: "Conflicto: sincronizar muchos dispositivos heterogéneos encarece el costo de consistencia; CRDT y eventos ayudan.",
    },
    "3-0": {
      title: "Interoperabilidad × Disponibilidad",
      text: "Complementarios: abstracciones comunes y registro de dispositivos mantienen el control disponible en el ecosistema.",
    },
    "3-1": {
      title: "Interoperabilidad × Rendimiento",
      text: "Conflicto: overhead de protocolos; se compensa con edge, conexiones persistentes y payloads mínimos.",
    },
    "3-2": {
      title: "Interoperabilidad × Consistencia",
      text: "Conflicto: más superficies de integración implican más puntos de divergencia hasta converger.",
    },
    "3-3": {
      title: "Interoperabilidad × Interoperabilidad",
      text: "Celda diagonal: el reto es mantener el catálogo de integraciones y pruebas continuas en el tiempo.",
    },
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ---------- Theme ---------- */
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    var t = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    var btn = $("#theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", t === "light" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        t === "light" ? "Activar tema oscuro" : "Activar tema claro"
      );
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored) {
      applyTheme(stored);
      return;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      applyTheme("light");
    } else {
      applyTheme("dark");
    }
  }

  $("#theme-toggle") &&
    $("#theme-toggle").addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") || "dark";
      var next = cur === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
    });

  /* ---------- Wave canvas ---------- */
  function initWave() {
    var canvas = $("#wave-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var bars = 64;
    var phases = [];
    var i;
    for (i = 0; i < bars; i++) {
      phases.push(Math.random() * Math.PI * 2);
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    var reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function draw(t) {
      var w = canvas.getBoundingClientRect().width;
      var h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      var bw = w / bars;
      var isLight = document.documentElement.getAttribute("data-theme") === "light";
      var green = isLight ? "#158a42" : "#1db954";
      var tSec = t * 0.002;
      for (i = 0; i < bars; i++) {
        var amp = 0.35 + 0.65 * Math.sin(tSec * 1.2 + phases[i]);
        var bh = amp * h * 0.85;
        var x = i * bw + bw * 0.15;
        var y = (h - bh) / 2;
        ctx.fillStyle = green;
        ctx.globalAlpha = 0.2 + amp * 0.55;
        ctx.beginPath();
        ctx.roundRect(x, y, bw * 0.7, bh, 4);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    var raf;
    function loop(ts) {
      draw(ts || 0);
      if (!reduced) raf = requestAnimationFrame(loop);
    }

    function bootCanvas() {
      resize();
      if (!reduced) loop(0);
      else draw(0);
    }
    bootCanvas();
    requestAnimationFrame(bootCanvas);

    window.addEventListener("resize", function () {
      resize();
      if (reduced) draw(0);
    });

    var mo = new MutationObserver(function () {
      draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  if (CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
    };
  }

  /* ---------- Scroll spy & progress ---------- */
  function initScrollSpy() {
    var sections = $all("[data-section-title]");
    var links = $all(".spy-link");
    var map = {};
    sections.forEach(function (sec) {
      var id = sec.id;
      if (id) map[id] = sec;
    });

    var breadcrumbEl = $("#breadcrumb-current");
    var progressBar = $("#sidebar-progress-bar");
    var header = $("#site-header");
    var offset = header ? header.offsetHeight + 24 : 96;

    function setActive(id) {
      links.forEach(function (a) {
        var spy = a.getAttribute("data-spy");
        a.classList.toggle("is-active", spy === id);
      });
      if (breadcrumbEl && map[id]) {
        breadcrumbEl.textContent = map[id].getAttribute("data-section-title") || id;
      }
    }

    function pickSectionFromScroll() {
      var y = window.scrollY + offset;
      var current = sections.length ? sections[0].id : "hero";
      sections.forEach(function (sec) {
        var top = sec.offsetTop;
        if (top <= y) current = sec.id;
      });
      setActive(current);
    }

    function onScroll() {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var scrollHeight = doc.scrollHeight - doc.clientHeight;
      var p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = Math.min(100, Math.max(0, p)) + "%";
      pickSectionFromScroll();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = $all(".reveal");
    if (!els.length) return;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ---------- Tabs (clic + teclado: ←/→/Home/End, roving tabindex) ---------- */
  function initTabs() {
    function activateTab(buttons, panels, index) {
      var len = buttons.length;
      if (!len) return;
      var i = ((index % len) + len) % len;
      buttons.forEach(function (b, j) {
        var on = j === i;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.setAttribute("tabindex", on ? "0" : "-1");
      });
      panels.forEach(function (p, j) {
        var on = j === i;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
      });
    }

    $all("[data-tabs]").forEach(function (root) {
      var buttons = $all(".tab-btn", root);
      var panels = $all(".tab-panel", root);
      var list = $(".tabs-list", root);
      if (!buttons.length) return;

      var currentIndex = 0;
      var bi;
      for (bi = 0; bi < buttons.length; bi++) {
        if (buttons[bi].getAttribute("aria-selected") === "true") {
          currentIndex = bi;
          break;
        }
      }
      activateTab(buttons, panels, currentIndex);

      buttons.forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          activateTab(buttons, panels, idx);
        });
      });

      if (!list) return;

      list.addEventListener("keydown", function (e) {
        var focused = buttons.indexOf(document.activeElement);
        if (focused < 0) return;

        var next = focused;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          next = focused + 1;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          next = focused - 1;
        } else if (e.key === "Home") {
          e.preventDefault();
          next = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          next = buttons.length - 1;
        } else {
          return;
        }

        activateTab(buttons, panels, next);
        buttons[next].focus();
      });
    });
  }

  /* ---------- Accordion ---------- */
  function initAccordion() {
    $all(".accordion-trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(trigger.getAttribute("aria-controls"));
        trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (panel) panel.hidden = expanded;
      });
    });
  }

  /* ---------- Tooltips (posición + aria-describedby al foco) ---------- */
  function initTooltips() {
    var tipRoot = $("#tooltip-root");
    if (!tipRoot) return;
    var hideTimer;
    var tipId = "tooltip-root";

    function positionTip(el, text) {
      tipRoot.textContent = text;
      tipRoot.hidden = false;
      tipRoot.id = tipId;
      var rect = el.getBoundingClientRect();
      var tr = tipRoot.getBoundingClientRect();
      var left = rect.left + rect.width / 2 - tr.width / 2;
      var top = rect.top - tr.height - 8;
      if (left < 8) left = 8;
      if (left + tr.width > window.innerWidth - 8) left = window.innerWidth - tr.width - 8;
      if (top < 8) top = rect.bottom + 8;
      tipRoot.style.left = left + "px";
      tipRoot.style.top = top + "px";
    }

    function hide(el) {
      tipRoot.hidden = true;
      tipRoot.textContent = "";
      if (el && el.removeAttribute) el.removeAttribute("aria-describedby");
    }

    $all(".metric-tip").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        clearTimeout(hideTimer);
        var text = el.getAttribute("data-tooltip") || "";
        positionTip(el, text);
      });
      el.addEventListener("mouseleave", function () {
        hideTimer = setTimeout(function () {
          hide();
        }, 100);
      });
      el.addEventListener("focus", function () {
        var text = el.getAttribute("data-tooltip") || "";
        positionTip(el, text);
        el.setAttribute("aria-describedby", tipId);
      });
      el.addEventListener("blur", function () {
        hide(el);
      });
    });
  }

  /* ---------- Modal (trampa de foco + bloqueo scroll) ---------- */
  function initModal() {
    var root = $("#modal-root");
    var titleEl = $("#modal-title");
    var bodyEl = $("#modal-body");
    if (!root || !titleEl || !bodyEl) return;

    var lastFocus;
    var prevOverflow = "";

    var focusableSel =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function getFocusables() {
      var dialog = $(".modal-dialog", root);
      if (!dialog) return [];
      return [].slice.call(dialog.querySelectorAll(focusableSel)).filter(function (el) {
        return el.offsetParent !== null || (el.getClientRects && el.getClientRects().length);
      });
    }

    function onTrapKey(e) {
      if (root.hidden || e.key !== "Tab") return;
      var list = getFocusables();
      if (!list.length) {
        e.preventDefault();
        return;
      }
      if (list.length === 1) {
        e.preventDefault();
        list[0].focus();
        return;
      }
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function open(id) {
      var data = tacticModals[id];
      if (!data) return;
      lastFocus = document.activeElement;
      titleEl.textContent = data.title;
      bodyEl.innerHTML = data.html;
      root.hidden = false;
      root.setAttribute("aria-hidden", "false");
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onTrapKey, true);
      var closeBtn = $(".modal-close", root);
      if (closeBtn && closeBtn.focus) closeBtn.focus();
    }

    function close() {
      document.removeEventListener("keydown", onTrapKey, true);
      root.hidden = true;
      root.setAttribute("aria-hidden", "true");
      bodyEl.innerHTML = "";
      document.body.style.overflow = prevOverflow;
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    $all(".btn-modal").forEach(function (btn) {
      btn.addEventListener("click", function () {
        open(btn.getAttribute("data-modal"));
      });
    });

    $all("[data-close-modal]", root).forEach(function (el) {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !root.hidden) close();
    });
  }

  /* ---------- Matrix ---------- */
  function initMatrix() {
    var detailTitle = $("#matrix-detail-title");
    var detailText = $("#matrix-detail-text");
    var detailRegion = $("#matrix-detail");
    var buttons = $all("#tension-table .cell-btn");
    if (!detailTitle || !detailText) return;

    function show(key) {
      var data = matrixCopy[key];
      if (!data) return;
      detailTitle.textContent = data.title;
      detailText.textContent = data.text;
      buttons.forEach(function (b) {
        b.classList.toggle("is-selected", b.getAttribute("data-matrix") === key);
      });
      if (detailRegion && detailRegion.focus) detailRegion.focus({ preventScroll: true });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        show(btn.getAttribute("data-matrix"));
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var toggle = $("#menu-toggle");
    var drawer = $("#mobile-drawer");
    var overlay = $("#drawer-overlay");
    if (!toggle || !drawer || !overlay) return;

    function open() {
      drawer.hidden = false;
      overlay.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Cerrar menú");
      document.body.style.overflow = "hidden";
    }

    function close() {
      drawer.hidden = true;
      overlay.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
      document.body.style.overflow = "";
    }

    toggle.addEventListener("click", function () {
      if (drawer.hidden) open();
      else close();
    });
    overlay.addEventListener("click", close);
    $all(".drawer-list a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !drawer.hidden) close();
    });
  }

  /* ---------- Smooth anchor offset for fixed header ---------- */
  function initAnchorOffset() {
    var header = $("#site-header");
    if (!header) return;
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest("a[href^='#']") : null;
      if (!t || !t.getAttribute("href")) return;
      var id = t.getAttribute("href").slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initTheme();
    initWave();
    initScrollSpy();
    initReveal();
    initTabs();
    initAccordion();
    initTooltips();
    initModal();
    initMatrix();
    initMobileMenu();
    initAnchorOffset();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
