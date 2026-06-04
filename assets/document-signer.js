(function () {
  "use strict";

  const STORAGE_DOC = "signcraft_doc_sessions_v2";
  const STORAGE_DOC_LEGACY = "signcraft_doc_sessions_v1";
  const MAX_DOC_HISTORY = 8;

  const $ = (id) => document.getElementById(id);
  const loading = $("globalLoading");
  const loadingTitle = $("loadingTitle");
  const loadingSub = $("loadingSub");

  function showLoading(title, sub) {
    loadingTitle.textContent = title || "Working…";
    loadingSub.textContent = sub || "";
    loading.classList.add("is-active");
    loading.setAttribute("aria-busy", "true");
  }
  function hideLoading() {
    loading.classList.remove("is-active");
    loading.removeAttribute("aria-busy");
  }

  function toast(msg, err) {
    if (window.SignCraft && typeof SignCraft.toast === "function") SignCraft.toast(msg, err);
  }

  const state = {
    pdfJsDoc: null,
    pdfBytes: null,
    numPages: 0,
    currentPage: 1,
    zoom: 1,
    docType: null,
    imageEl: null,
    placements: {},
    sigUrl: null,
    renderTask: null,
    widget: null,
    drag: null,
    currentFileLabel: "",
  };

  const pdfCanvas = $("pdfCanvas");
  const docPageHost = $("docPageHost");
  const docOverlay = $("docOverlay");
  const fileInput = $("docFileInput");
  const uploadZone = $("uploadZone");
  const uploadWrap = uploadZone ? uploadZone.closest(".upload-zone-wrap") : null;
  const thumbsStrip = $("pageThumbs");
  const btnPrev = $("docPagePrev");
  const btnNext = $("docPageNext");
  const pageLabel = $("docPageLabel");
  const zoomOut = $("docZoomOut");
  const zoomIn = $("docZoomIn");
  const zoomLabel = $("docZoomLabel");
  const btnPlaceSig = $("btnPlaceSig");
  const btnRemoveSig = $("btnRemoveSig");
  const sigOpacity = $("docSigOpacity");
  const opacityVal = $("docOpacityVal");
  const btnExportPdf = $("btnExportPdf");
  const btnExportPng = $("btnExportPng");
  const docHistoryList = $("docHistoryList");
  const docHistoryEmpty = $("docHistoryEmpty");
  const docFileInfo = $("docFileInfo");
  const docFileName = $("docFileName");
  const docFileDetail = $("docFileDetail");
  const docFileIcon = $("docFileIcon");
  const docFileRemove = $("docFileRemove");
  const docEmptyState = $("docEmptyState");
  const docScroll = $("docScroll");
  const docPagesSection = $("docPagesSection");
  const sigChipPreview = $("sigChipPreview");
  const sigChipEdit = $("sigChipEdit");
  const zoomFit = $("docZoomFit");
  const btnApplyAll = $("btnApplyAll");

  let pdfjsLib = window.pdfjsLib;
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  function setWorkspace(ws) {
    document.querySelectorAll(".app-tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.workspace === ws);
    });
    const create = $("createWorkspace");
    const doc = $("documentWorkspace");
    if (create) create.hidden = ws !== "create";
    if (doc) doc.hidden = ws !== "document";
    if (ws === "document") {
      requestAnimationFrame(() => {
        syncOverlaySize();
        refreshSigPreview();
      });
    }
  }
  document.querySelectorAll(".app-tab").forEach((btn) => {
    btn.addEventListener("click", () => setWorkspace(btn.dataset.workspace));
  });

  function normalizeHistoryEntry(x) {
    if (typeof x === "string") return { name: x, ts: Date.now(), kind: "pdf" };
    return { name: x.name || "Document", ts: x.ts || Date.now(), kind: x.kind || "pdf" };
  }

  function readDocHistory() {
    try {
      let r = localStorage.getItem(STORAGE_DOC);
      if (!r) {
        const leg = localStorage.getItem(STORAGE_DOC_LEGACY);
        if (leg) {
          const arr = JSON.parse(leg);
          const next = Array.isArray(arr) ? arr.map((n) => (typeof n === "string" ? { name: n, ts: Date.now(), kind: "pdf" } : n)) : [];
          localStorage.setItem(STORAGE_DOC, JSON.stringify(next));
          localStorage.removeItem(STORAGE_DOC_LEGACY);
          r = JSON.stringify(next);
        }
      }
      return r ? JSON.parse(r).map(normalizeHistoryEntry) : [];
    } catch {
      return [];
    }
  }

  function writeDocHistory(items) {
    localStorage.setItem(STORAGE_DOC, JSON.stringify(items.slice(0, MAX_DOC_HISTORY)));
    renderDocHistory();
  }

  function pushDocHistory(name, kind) {
    const entry = { name: name || "Document", ts: Date.now(), kind: kind || "pdf" };
    const list = readDocHistory().filter((x) => x.name !== entry.name);
    list.unshift(entry);
    writeDocHistory(list);
  }

  function formatTimeAgo(ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return "Just now";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 48) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  function renderDocHistory() {
    if (!docHistoryList) return;
    docHistoryList.innerHTML = "";
    const items = readDocHistory();
    if (docHistoryEmpty) docHistoryEmpty.hidden = items.length > 0;
    items.forEach((it) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "doc-history-card";
      const icon = it.kind === "image" ? "🖼️" : "📄";
      el.innerHTML =
        '<span class="doc-history-card-icon" aria-hidden="true">' +
        icon +
        "</span>" +
        '<span class="doc-history-card-body">' +
        '<span class="doc-history-card-name"></span>' +
        '<span class="doc-history-card-meta"></span>' +
        "</span>";
      el.querySelector(".doc-history-card-name").textContent = it.name;
      el.querySelector(".doc-history-card-meta").textContent = (it.kind === "image" ? "Image" : "PDF") + " · " + formatTimeAgo(it.ts);
      el.addEventListener("click", () => toast("Open files from your device — recent list is for quick reference only.", false));
      docHistoryList.appendChild(el);
    });
  }

  function updateStepBar() {
    const s1 = $("step1");
    const s2 = $("step2");
    const s3 = $("step3");
    if (!s1 || !s2 || !s3) return;
    const hasDoc = !!state.numPages;
    const hasPlacement = Object.keys(state.placements).length > 0;
    s1.dataset.active = !hasDoc ? "true" : "false";
    s2.dataset.active = hasDoc && !hasPlacement ? "true" : "false";
    s3.dataset.active = hasPlacement ? "true" : "false";
  }

  function refreshSigPreview() {
    if (!sigChipPreview || !window.SignCraft) return;
    sigChipPreview.classList.remove("is-image-preview");
    sigChipPreview.style.backgroundImage = "";
    sigChipPreview.style.backgroundSize = "";
    sigChipPreview.style.backgroundRepeat = "";
    sigChipPreview.style.backgroundPosition = "";
    if (!SignCraft.hasSignature()) {
      sigChipPreview.textContent = "—";
      return;
    }
    const url = SignCraft.getSignaturePngDataUrl(2);
    if (url) {
      sigChipPreview.textContent = "";
      sigChipPreview.classList.add("is-image-preview");
      sigChipPreview.style.backgroundImage = "url(" + url + ")";
      sigChipPreview.style.backgroundSize = "contain";
      sigChipPreview.style.backgroundRepeat = "no-repeat";
      sigChipPreview.style.backgroundPosition = "left center";
    }
  }

  function updateDocChrome() {
    const hasDoc = !!state.numPages;
    if (docEmptyState) docEmptyState.hidden = hasDoc;
    if (docScroll) docScroll.hidden = !hasDoc;
    if (docPagesSection) docPagesSection.hidden = !hasDoc;
    if (docFileInfo) docFileInfo.hidden = !hasDoc;
    if (docFileName && state.currentFileLabel) docFileName.textContent = state.currentFileLabel;
    if (docFileDetail) {
      if (!hasDoc) docFileDetail.textContent = "—";
      else if (state.docType === "pdf") docFileDetail.textContent = state.numPages + " page" + (state.numPages === 1 ? "" : "s") + " · PDF";
      else docFileDetail.textContent = "Image · " + pdfCanvas.width + "×" + pdfCanvas.height + " px";
    }
    if (docFileIcon) docFileIcon.textContent = state.docType === "image" ? "🖼️" : "📄";
    updateStepBar();
  }

  function resetDocument() {
    if (state.renderTask && state.renderTask.cancel) try { state.renderTask.cancel(); } catch (_) {}
    state.pdfJsDoc = null;
    state.pdfBytes = null;
    state.numPages = 0;
    state.currentPage = 1;
    state.docType = null;
    state.imageEl = null;
    state.placements = {};
    state.currentFileLabel = "";
    clearWidget();
    if (pdfCanvas.width) pdfCanvas.getContext("2d").clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);
    thumbsStrip.innerHTML = "";
    pageLabel.textContent = "—";
    btnPrev.disabled = true;
    btnNext.disabled = true;
    updateDocChrome();
  }

  function clearWidget() {
    if (state.sigUrl) {
      URL.revokeObjectURL(state.sigUrl);
      state.sigUrl = null;
    }
    docOverlay.innerHTML = "";
    state.widget = null;
  }

  function syncOverlaySize() {
    docOverlay.style.width = pdfCanvas.clientWidth + "px";
    docOverlay.style.height = pdfCanvas.clientHeight + "px";
  }

  async function loadPdfFromBuffer(buffer, name) {
    if (!window.pdfjsLib) {
      toast("PDF engine not loaded — check your network and refresh", true);
      return;
    }
    resetDocument();
    state.pdfBytes = buffer.slice(0);
    state.docType = "pdf";
    showLoading("Opening PDF", "Rendering pages…");
    try {
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      state.pdfJsDoc = await loadingTask.promise;
      state.numPages = state.pdfJsDoc.numPages;
      state.currentPage = 1;
      await buildThumbnails();
      await renderCurrentPage();
      state.currentFileLabel = name || "document.pdf";
      pushDocHistory(state.currentFileLabel, "pdf");
      updateDocChrome();
      refreshSigPreview();
      toast("PDF loaded — place your signature");
    } catch (e) {
      console.error(e);
      toast("Could not read this PDF", true);
      resetDocument();
    } finally {
      hideLoading();
    }
  }

  async function buildThumbnails() {
    thumbsStrip.innerHTML = "";
    for (let i = 1; i <= state.numPages; i++) {
      const page = await state.pdfJsDoc.getPage(i);
      const vp = page.getViewport({ scale: 0.18 });
      const c = document.createElement("canvas");
      c.width = vp.width;
      c.height = vp.height;
      const ctx = c.getContext("2d");
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb-btn" + (i === state.currentPage ? " active" : "");
      btn.appendChild(c);
      btn.addEventListener("click", async () => {
        savePlacementFromWidget();
        state.currentPage = i;
        highlightThumb();
        await renderCurrentPage();
        restorePlacementForPage();
      });
      thumbsStrip.appendChild(btn);
    }
  }

  function highlightThumb() {
    thumbsStrip.querySelectorAll(".thumb-btn").forEach((b, idx) => {
      b.classList.toggle("active", idx + 1 === state.currentPage);
    });
  }

  async function renderCurrentPage() {
    if (state.docType === "image" && state.imageEl) {
      renderImageToCanvas();
      updatePageControls();
      return;
    }
    if (!state.pdfJsDoc) return;
    if (state.renderTask && state.renderTask.cancel) try { state.renderTask.cancel(); } catch (_) {}
    const page = await state.pdfJsDoc.getPage(state.currentPage);
    const base = Math.min(2.2, Math.max(0.6, window.innerWidth / 720));
    const scale = base * state.zoom;
    const viewport = page.getViewport({ scale });
    pdfCanvas.width = viewport.width;
    pdfCanvas.height = viewport.height;
    const ctx = pdfCanvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
    state.renderTask = page.render({ canvasContext: ctx, viewport });
    await state.renderTask.promise;
    docPageHost.style.transform = "scale(1)";
    syncOverlaySize();
    updatePageControls();
    window.requestAnimationFrame(syncOverlaySize);
  }

  function renderImageToCanvas() {
    const img = state.imageEl;
    if (!img || !img.complete) return;
    const maxW = Math.min(920, window.innerWidth - 80);
    const ratio = Math.min(1, maxW / img.naturalWidth);
    const w = Math.round(img.naturalWidth * ratio);
    const h = Math.round(img.naturalHeight * ratio);
    pdfCanvas.width = w;
    pdfCanvas.height = h;
    const ctx = pdfCanvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    syncOverlaySize();
  }

  async function loadImageFile(file) {
    resetDocument();
    state.docType = "image";
    state.numPages = 1;
    state.currentPage = 1;
    showLoading("Loading image", "");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      state.imageEl = img;
      URL.revokeObjectURL(url);
      thumbsStrip.innerHTML = "";
      renderImageToCanvas();
      updatePageControls();
      state.currentFileLabel = file.name;
      pushDocHistory(file.name, "image");
      updateDocChrome();
      refreshSigPreview();
      toast("Image loaded — place your signature");
      hideLoading();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast("Invalid image file", true);
      hideLoading();
      resetDocument();
    };
    img.src = url;
  }

  function updatePageControls() {
    pageLabel.textContent = state.numPages ? state.currentPage + " / " + state.numPages : "—";
    btnPrev.disabled = state.currentPage <= 1;
    btnNext.disabled = state.currentPage >= state.numPages;
    zoomLabel.textContent = Math.round(state.zoom * 100) + "%";
    updateStepBar();
  }

  btnPrev.addEventListener("click", async () => {
    if (state.currentPage <= 1) return;
    savePlacementFromWidget();
    state.currentPage--;
    highlightThumb();
    await renderCurrentPage();
    restorePlacementForPage();
  });
  btnNext.addEventListener("click", async () => {
    if (state.currentPage >= state.numPages) return;
    savePlacementFromWidget();
    state.currentPage++;
    highlightThumb();
    await renderCurrentPage();
    restorePlacementForPage();
  });

  zoomIn.addEventListener("click", async () => {
    state.zoom = Math.min(2.4, state.zoom + 0.12);
    savePlacementFromWidget();
    await renderCurrentPage();
    restorePlacementForPage();
  });
  zoomOut.addEventListener("click", async () => {
    state.zoom = Math.max(0.55, state.zoom - 0.12);
    savePlacementFromWidget();
    await renderCurrentPage();
    restorePlacementForPage();
  });

  function savePlacementFromWidget() {
    if (!state.widget || !pdfCanvas.width) return;
    const host = docPageHost.getBoundingClientRect();
    const wrect = state.widget.getBoundingClientRect();
    const relX = (wrect.left - host.left) / host.width;
    const relY = (wrect.top - host.top) / host.height;
    const relW = wrect.width / host.width;
    const relH = wrect.height / host.height;
    const rot = parseFloat(state.widget.dataset.rot || "0", 10) || 0;
    const opacity = parseFloat(state.widget.dataset.opacity || "1", 10);
    state.placements[state.currentPage] = { relX, relY, relW, relH, rot, opacity };
  }

  function restorePlacementForPage() {
    clearWidget();
    const p = state.placements[state.currentPage];
    if (!p || !state.sigUrl) return;
    createWidgetFromExisting(p);
  }

  async function ensureSignatureUrl() {
    if (!window.SignCraft || !SignCraft.hasSignature()) {
      toast("Create a typed or drawn signature first", true);
      return null;
    }
    const blob = await SignCraft.getSignaturePngBlob(3);
    if (!blob) {
      toast("Could not build signature image", true);
      return null;
    }
    if (state.sigUrl) URL.revokeObjectURL(state.sigUrl);
    state.sigUrl = URL.createObjectURL(blob);
    return state.sigUrl;
  }

  btnPlaceSig.addEventListener("click", async () => {
    if (!state.numPages) {
      toast("Upload a PDF or image first", true);
      return;
    }
    savePlacementFromWidget();
    docOverlay.innerHTML = "";
    state.widget = null;
    if (state.sigUrl) {
      URL.revokeObjectURL(state.sigUrl);
      state.sigUrl = null;
    }
    const url = await ensureSignatureUrl();
    if (!url) return;
    const w = docPageHost.clientWidth;
    const h = docPageHost.clientHeight;
    const defW = Math.min(200, w * 0.35);
    const defH = defW * 0.35;
    const p = {
      relX: 0.32,
      relY: 0.55,
      relW: defW / w,
      relH: defH / h,
      rot: 0,
      opacity: parseFloat(sigOpacity.value, 10) || 1,
    };
    state.placements[state.currentPage] = p;
    createWidgetFromExisting(p);
    updateStepBar();
    toast("Drag, resize, and rotate — then export");
  });

  btnRemoveSig.addEventListener("click", () => {
    savePlacementFromWidget();
    delete state.placements[state.currentPage];
    clearWidget();
    updateStepBar();
    toast("Signature removed from this page");
  });

  if (btnApplyAll) {
    btnApplyAll.addEventListener("click", () => {
      const cur = state.placements[state.currentPage];
      if (!cur) return toast("Place a signature on this page first", true);
      if (!state.numPages) return;
      for (let i = 1; i <= state.numPages; i++) {
        state.placements[i] = { ...cur };
      }
      updateStepBar();
      toast("Signature layout copied to every page");
    });
  }

  if (zoomFit) {
    zoomFit.addEventListener("click", async () => {
      state.zoom = 1;
      savePlacementFromWidget();
      await renderCurrentPage();
      restorePlacementForPage();
    });
  }

  if (docFileRemove) {
    docFileRemove.addEventListener("click", () => {
      resetDocument();
      toast("Document removed");
    });
  }

  if (sigChipEdit) {
    sigChipEdit.addEventListener("click", (e) => {
      e.preventDefault();
      setWorkspace("create");
      requestAnimationFrame(refreshSigPreview);
    });
  }

  sigOpacity.addEventListener("input", () => {
    const v = parseFloat(sigOpacity.value, 10) || 1;
    if (opacityVal) opacityVal.textContent = Math.round(v * 100) + "%";
    if (state.widget) {
      state.widget.dataset.opacity = String(v);
      state.widget.style.opacity = String(v);
    }
  });

  function createWidgetFromExisting(p) {
    const hostW = docPageHost.clientWidth;
    const hostH = docPageHost.clientHeight;
    const el = document.createElement("div");
    el.className = "sig-widget";
    el.style.left = p.relX * 100 + "%";
    el.style.top = p.relY * 100 + "%";
    el.style.width = p.relW * 100 + "%";
    el.style.height = p.relH * 100 + "%";
    el.dataset.rot = String(p.rot || 0);
    el.dataset.opacity = String(p.opacity != null ? p.opacity : 1);
    el.style.opacity = el.dataset.opacity;
    const inner = document.createElement("div");
    inner.style.width = "100%";
    inner.style.height = "100%";
    inner.style.transform = "rotate(" + (p.rot || 0) + "deg)";
    inner.style.transformOrigin = "center center";
    const img = document.createElement("img");
    img.src = state.sigUrl;
    img.alt = "Signature";
    inner.appendChild(img);
    el.appendChild(inner);
    ["se", "rot"].forEach((h) => {
      const d = document.createElement("div");
      d.className = "handle handle-" + (h === "rot" ? "rot" : h);
      d.dataset.handle = h;
      el.appendChild(d);
    });
    docOverlay.appendChild(el);
    state.widget = el;
    wireWidget(el, inner);
  }

  function wireWidget(el, inner) {
    let mode = null;
    let start = {};
    const onDown = (e) => {
      if (e.target.dataset.handle) {
        mode = e.target.dataset.handle === "rot" ? "rot" : "resize";
        const r = el.getBoundingClientRect();
        start = {
          x: e.clientX,
          y: e.clientY,
          el,
          inner,
          baseRot: parseFloat(el.dataset.rot || "0", 10) || 0,
          startAng:
            mode === "rot"
              ? Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * (180 / Math.PI)
              : 0,
          w: r.width,
          h: r.height,
          ox: el.offsetLeft,
          oy: el.offsetTop,
          cx: r.left + r.width / 2,
          cy: r.top + r.height / 2,
        };
        el.classList.add("is-dragging");
      } else if (e.target === inner || e.target === el || e.target.tagName === "IMG") {
        mode = "move";
        start = { x: e.clientX, y: e.clientY, ox: el.offsetLeft, oy: el.offsetTop, el, inner };
        el.classList.add("is-dragging");
      } else return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!mode) return;
      const host = docPageHost;
      const hw = host.clientWidth;
      const hh = host.clientHeight;
      if (mode === "move") {
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        el.style.left = (start.ox + dx) / hw * 100 + "%";
        el.style.top = (start.oy + dy) / hh * 100 + "%";
      } else if (mode === "resize") {
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const nw = Math.max(40, start.w + dx);
        const nh = Math.max(24, start.h + dy);
        el.style.width = (nw / hw) * 100 + "%";
        el.style.height = (nh / hh) * 100 + "%";
      } else if (mode === "rot") {
        const ang = Math.atan2(e.clientY - start.cy, e.clientX - start.cx) * (180 / Math.PI);
        const next = start.baseRot + (ang - start.startAng);
        el.dataset.rot = String(Math.round(next * 10) / 10);
        inner.style.transform = "rotate(" + el.dataset.rot + "deg)";
      }
    };
    const onUp = (e) => {
      if (!mode) return;
      mode = null;
      el.classList.remove("is-dragging");
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      savePlacementFromWidget();
      updateStepBar();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
  }

  async function flattenPageToCanvas(pageIndex0) {
    const page = await state.pdfJsDoc.getPage(pageIndex0 + 1);
    const vp = page.getViewport({ scale: 2 });
    const c = document.createElement("canvas");
    c.width = vp.width;
    c.height = vp.height;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    const p = state.placements[pageIndex0 + 1];
    if (p && state.sigUrl) {
      const img = await loadImage(state.sigUrl);
      const x = p.relX * c.width;
      const y = p.relY * c.height;
      const w = p.relW * c.width;
      const h = p.relH * c.height;
      const rot = parseFloat(p.rot || "0", 10);
      const op = p.opacity != null ? p.opacity : 1;
      ctx.save();
      ctx.globalAlpha = op;
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    return c;
  }

  async function flattenImageDoc() {
    const c = document.createElement("canvas");
    c.width = pdfCanvas.width;
    c.height = pdfCanvas.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(pdfCanvas, 0, 0);
    const p = state.placements[1];
    if (p && state.sigUrl) {
      const img = await loadImage(state.sigUrl);
      const x = p.relX * c.width;
      const y = p.relY * c.height;
      const w = p.relW * c.width;
      const h = p.relH * c.height;
      const rot = parseFloat(p.rot || "0", 10);
      const op = p.opacity != null ? p.opacity : 1;
      ctx.save();
      ctx.globalAlpha = op;
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    return c;
  }

  function loadImage(src) {
    return new Promise((res, rej) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
  }

  function canvasToUint8(c) {
    const data = c.toDataURL("image/png");
    const bin = atob(data.split(",")[1]);
    const arr = new Uint8Array(bin.length);
    for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
    return arr;
  }

  btnExportPdf.addEventListener("click", async () => {
    if (!window.PDFLib) {
      toast("PDF library not ready — refresh the page", true);
      return;
    }
    if (state.docType === "pdf" && !state.pdfBytes) {
      toast("No PDF loaded", true);
      return;
    }
    if (state.docType === "image" && !state.imageEl) {
      toast("No image loaded", true);
      return;
    }
    const { PDFDocument } = PDFLib;
    showLoading("Building signed PDF", "This may take a moment…");
    try {
      if (state.docType === "image") {
        const flat = await flattenImageDoc();
        const pngBytes = canvasToUint8(flat);
        const newPdf = await PDFDocument.create();
        const pngImage = await newPdf.embedPng(pngBytes);
        const ptW = flat.width * 0.52;
        const ptH = flat.height * 0.52;
        const page = newPdf.addPage([ptW, ptH]);
        page.drawImage(pngImage, { x: 0, y: 0, width: ptW, height: ptH });
        const out = await newPdf.save();
        downloadUint8(out, "signed-document.pdf");
        toast("Signed PDF downloaded");
      } else {
        const srcPdf = await PDFDocument.load(state.pdfBytes);
        const newPdf = await PDFDocument.create();
        for (let i = 0; i < state.numPages; i++) {
          const flat = await flattenPageToCanvas(i);
          const pngBytes = canvasToUint8(flat);
          const pngImage = await newPdf.embedPng(pngBytes);
          const srcPage = srcPdf.getPage(i);
          const { width: pw, height: ph } = srcPage.getSize();
          const page = newPdf.addPage([pw, ph]);
          page.drawImage(pngImage, { x: 0, y: 0, width: pw, height: ph });
        }
        const out = await newPdf.save();
        downloadUint8(out, "signed-document.pdf");
        toast("Signed PDF downloaded");
      }
    } catch (e) {
      console.error(e);
      toast("PDF export failed", true);
    } finally {
      hideLoading();
    }
  });

  btnExportPng.addEventListener("click", async () => {
    showLoading("Rendering page", "");
    try {
      let c;
      if (state.docType === "image") c = await flattenImageDoc();
      else if (state.pdfJsDoc) c = await flattenPageToCanvas(state.currentPage - 1);
      else {
        toast("No document loaded", true);
        return;
      }
      c.toBlob((blob) => {
        downloadBlob(blob, "signed-page-" + state.currentPage + ".png");
        toast("Page image downloaded");
      }, "image/png");
    } catch (e) {
      console.error(e);
      toast("Image export failed", true);
    } finally {
      hideLoading();
    }
  });

  function downloadBlob(blob, name) {
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    a.click();
    URL.revokeObjectURL(u);
  }
  function downloadUint8(u8, name) {
    downloadBlob(new Blob([u8], { type: "application/pdf" }), name);
  }

  function bindUpload() {
    const markDrag = (on) => {
      uploadZone.classList.toggle("dragover", on);
      if (uploadWrap) uploadWrap.classList.toggle("is-dragover", on);
    };
    uploadZone.addEventListener("click", () => fileInput.click());
    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      markDrag(true);
    });
    uploadZone.addEventListener("dragleave", () => markDrag(false));
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      markDrag(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    });
    fileInput.addEventListener("change", () => {
      const f = fileInput.files[0];
      if (f) handleFile(f);
      fileInput.value = "";
    });
  }

  async function handleFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) {
      const buf = await file.arrayBuffer();
      await loadPdfFromBuffer(buf, file.name);
    } else if (/\.(png|jpe?g|webp|gif)$/i.test(name)) {
      await loadImageFile(file);
    } else {
      toast("Use a PDF or image (PNG, JPG, WebP, GIF)", true);
    }
  }

  window.addEventListener("resize", () => {
    syncOverlaySize();
    if (state.docType === "image" && state.imageEl) renderImageToCanvas();
  });

  bindUpload();
  renderDocHistory();
  updateDocChrome();
  refreshSigPreview();
})();
