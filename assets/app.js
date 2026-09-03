/* ============================================================
   Wheel Spot — shared behaviour
   ============================================================ */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const params = new URLSearchParams(location.search);

  /* ---------- toast ---------- */
  function toast(msg, kind = "") {
    let wrap = $(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const el = document.createElement("div");
    el.className = "toast " + kind;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .25s, transform .25s";
      el.style.opacity = "0"; el.style.transform = "translateY(10px)";
      setTimeout(() => el.remove(), 260);
    }, 2600);
  }
  window.WS = { toast, $, $$, params };

  /* ---------- fake form submit → toast + optional redirect ---------- */
  $$("form[data-fake]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit], .btn");
      const msg  = form.dataset.msg || "Berhasil dikirim.";
      const go   = form.dataset.go;
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Memproses…"; }
      setTimeout(() => {
        toast(msg, "ok");
        if (go) { setTimeout(() => (location.href = go), 650); }
        else if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
      }, 700);
    });
  });

  /* ---------- generic confirm links ---------- */
  $$("[data-confirm]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (!confirm(el.dataset.confirm)) e.preventDefault();
    });
  });

  /* ---------- toast-only buttons ---------- */
  $$("[data-toast]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (el.tagName === "A" && el.getAttribute("href") === "#") e.preventDefault();
      toast(el.dataset.toast, el.dataset.toastKind || "");
    });
  });

  /* ---------- print ---------- */
  $$("[data-print]").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); window.print(); })
  );

  /* ---------- star rating input ---------- */
  $$(".star-input").forEach((group) => {
    const btns = $$("button", group);
    const hidden = group.nextElementSibling && group.nextElementSibling.matches("input[type=hidden]")
      ? group.nextElementSibling : null;
    const paint = (n) => btns.forEach((b, i) => b.classList.toggle("on", i < n));
    btns.forEach((b, i) => {
      b.addEventListener("mouseenter", () => paint(i + 1));
      b.addEventListener("focus", () => paint(i + 1));
      b.addEventListener("click", () => { group.dataset.value = i + 1; if (hidden) hidden.value = i + 1; paint(i + 1); });
    });
    group.addEventListener("mouseleave", () => paint(Number(group.dataset.value || 0)));
    paint(Number(group.dataset.value || 0));
  });

  /* ---------- live text filter (data-filter-input → data-filter-item) ---------- */
  $$("[data-filter-input]").forEach((input) => {
    const scope = document.querySelector(input.dataset.filterInput) || document;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      $$("[data-filter-item]", scope).forEach((item) => {
        item.classList.toggle("hidden", q && !item.textContent.toLowerCase().includes(q));
      });
    });
  });

  /* ---------- segmented / tab controls (data-tabs) ---------- */
  $$("[data-tabs]").forEach((bar) => {
    const targets = bar.dataset.tabs;
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-tab]");
      if (!btn) return;
      $$("button[data-tab]", bar).forEach((b) => b.classList.toggle("on", b === btn));
      $$(targets).forEach((panel) => panel.classList.toggle("hidden", panel.dataset.panel !== btn.dataset.tab));
    });
  });

  /* ---------- mobile menu toggle ---------- */
  $$("[data-menu-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = document.querySelector(btn.dataset.menuToggle);
      if (t) t.classList.toggle("hidden");
    });
  });

  /* ============================================================
     Dashboard session state machine
     ?state = menuju | verifikasi | valid | salah | denda
     ============================================================ */
  const dash = $("#dash");
  if (dash) {
    const state = params.get("state") || "valid";
    $$("[data-state]").forEach((el) => {
      const list = el.dataset.state.split(",").map((s) => s.trim());
      el.classList.toggle("hidden", !list.includes(state));
    });
    $$(".segmented a").forEach((a) =>
      a.classList.toggle("on", a.getAttribute("href").includes("state=" + state))
    );
    // simple countdown timers
    $$("[data-countdown]").forEach((el) => {
      let [m, s] = el.textContent.trim().split(":").map(Number);
      if (isNaN(m)) return;
      setInterval(() => {
        if (m === 0 && s === 0) return;
        if (s === 0) { m--; s = 59; } else s--;
        el.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      }, 1000);
    });
    // count-up parking duration hh:mm:ss
    $$("[data-timer]").forEach((el) => {
      let parts = el.textContent.trim().split(":").map(Number);
      if (parts.length !== 3) return;
      let [h, m, s] = parts;
      setInterval(() => {
        s++; if (s === 60) { s = 0; m++; } if (m === 60) { m = 0; h++; }
        el.textContent = [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
      }, 1000);
    });
  }

  /* ============================================================
     Receipt success/failure toggle  ?state=success|failed
     ============================================================ */
  const receipt = $("#receipt");
  if (receipt) {
    const set = (mode) => {
      $$("[data-receipt]", receipt).forEach((el) =>
        el.classList.toggle("hidden", el.dataset.receipt !== mode)
      );
    };
    set(params.get("state") === "success" ? "success" : "failed");
    $$("[data-receipt-go]").forEach((b) =>
      b.addEventListener("click", (e) => { e.preventDefault(); set(b.dataset.receiptGo); window.scrollTo({ top: 0, behavior: "smooth" }); })
    );
  }

  /* ============================================================
     Live parking map generator
     ============================================================ */
  const pmap = $("#pmap");
  if (pmap) {
    const info = $("#slotInfo");
    let filter = "all";
    const slots = [];

    // zones: [containerId, fromNumber, toNumber, forcedKind?, reversed?]
    const ZONES = [
      ["zRight", 1, 8, "inactive", false],
      ["zTop", 9, 40, null, true],
      ["zLeft", 41, 48, null, false],
      ["zRowA", 49, 86, null, false],
      ["zRowB", 87, 120, null, true],
      ["zBottom", 121, 150, null, false],
    ];

    const pick = () => {
      const r = Math.random();
      return r < 0.05 ? "inactive" : r < 0.46 ? "full" : "empty";
    };

    const select = (b) => {
      slots.forEach((s) => s.classList.remove("sel"));
      b.classList.add("sel");
      if (!info) return;
      const kind = b.dataset.kind;
      const label = kind === "empty" ? "Available" : kind === "full" ? "Occupied" : "Inactive";
      info.querySelector("[data-slot-name]").textContent = "Slot " + b.dataset.n;
      const badge = info.querySelector("[data-slot-badge]");
      badge.textContent = label;
      badge.className = "badge " + (kind === "empty" ? "ok" : kind === "full" ? "danger" : "warn");
      info.querySelector("[data-slot-note]").textContent =
        kind === "empty" ? "Standard car size. Slot bisa dibooking sekarang."
        : kind === "full" ? "Standard car size. Not equipped with EV charging."
        : "Sedang maintenance — tidak tersedia.";
      info.querySelector("[data-slot-action]").classList.toggle("hidden", kind !== "empty");
    };

    ZONES.forEach(([id, from, to, forced, reversed]) => {
      const box = document.getElementById(id);
      if (!box) return;
      const nums = [];
      for (let n = from; n <= to; n++) nums.push(n);
      if (reversed) nums.reverse();
      nums.forEach((n) => {
        const kind = forced || pick();
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pslot " + kind;
        b.textContent = n;
        b.dataset.kind = kind;
        b.dataset.n = n;
        b.setAttribute("aria-label", "Slot " + n + " — " + kind);
        b.addEventListener("click", () => select(b));
        slots.push(b);
        box.appendChild(b);
      });
    });

    /* ----- filters ----- */
    const applyFilter = () => {
      slots.forEach((s) => {
        const n = Number(s.dataset.n);
        const show = filter === "all"
          || (filter === "available" && s.dataset.kind === "empty")
          || (filter === "occupied" && s.dataset.kind === "full")
          || (filter === "ev" && s.dataset.kind === "empty" && n % 7 === 0)
          || (filter === "accessible" && s.dataset.kind === "empty" && n % 11 === 0);
        s.classList.toggle("dim", !show);
      });
    };
    $$("#mapFilters button").forEach((b) =>
      b.addEventListener("click", () => {
        $$("#mapFilters button").forEach((x) => x.classList.toggle("on", x === b));
        filter = b.dataset.filter;
        applyFilter();
      })
    );

    /* ----- search ----- */
    const search = $("#mapSearch");
    if (search) search.addEventListener("input", () => {
      const q = search.value.trim();
      slots.forEach((s) => {
        const hit = !q || s.dataset.n === q;
        s.classList.toggle("dim", !!q && !hit);
        if (hit && q) select(s);
      });
    });

    /* ----- counts ----- */
    const av = slots.filter((s) => s.dataset.kind === "empty").length;
    const inact = slots.filter((s) => s.dataset.kind === "inactive").length;
    if ($("#mapAvail")) $("#mapAvail").textContent = av;
    if ($("#mapOcc")) $("#mapOcc").textContent = slots.length - av - inact;

    /* ============================================================
       Zoom + pan
       ============================================================ */
    const vp = $("#pmapViewport");
    let zoom = 1;
    const baseWidth = pmap.offsetWidth; // unscaled plan width, measured once
    const MIN = 0.5, MAX = 2.6;
    const supportsZoom = "zoom" in pmap.style; // Chrome/Edge/Safari, Firefox 126+
    const setZoom = (v) => {
      zoom = Math.min(MAX, Math.max(MIN, Math.round(v * 100) / 100));
      if (supportsZoom) pmap.style.zoom = zoom;
      else { pmap.style.transform = "scale(" + zoom + ")"; pmap.style.transformOrigin = "0 0"; }
    };
    let autoFit = true;
    const fitToWidth = () => {
      const fit = (vp.clientWidth - 8) / baseWidth;
      setZoom(fit < 1 ? fit : 1);
    };
    $("#zoomIn").addEventListener("click", () => { autoFit = false; setZoom(zoom + 0.2); });
    $("#zoomOut").addEventListener("click", () => { autoFit = false; setZoom(zoom - 0.2); });
    $("#zoomReset").addEventListener("click", () => {
      autoFit = true; fitToWidth();
      vp.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    });
    vp.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      autoFit = false;
      setZoom(zoom - Math.sign(e.deltaY) * 0.15);
    }, { passive: false });

    // drag-to-pan (ignore clicks on slots)
    let dragging = false, sx0 = 0, sy0 = 0, l0 = 0, t0 = 0;
    vp.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".pslot")) return;
      dragging = true; vp.classList.add("grabbing");
      sx0 = e.clientX; sy0 = e.clientY; l0 = vp.scrollLeft; t0 = vp.scrollTop;
      vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      vp.scrollLeft = l0 - (e.clientX - sx0);
      vp.scrollTop = t0 - (e.clientY - sy0);
    });
    const endDrag = () => { dragging = false; vp.classList.remove("grabbing"); };
    vp.addEventListener("pointerup", endDrag);
    vp.addEventListener("pointercancel", endDrag);

    // fit the whole plan into the viewport on load + on resize (until the user zooms)
    requestAnimationFrame(fitToWidth);
    window.addEventListener("resize", () => { if (autoFit) fitToWidth(); });
  }

  /* ---------- year stamp ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
