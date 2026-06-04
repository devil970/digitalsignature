(function () {
  "use strict";

  const STORAGE_THEME = "signcraft_theme";
  const STORAGE_HISTORY = "signcraft_history_v3";
  const MAX_HISTORY = 8;
  const EXPORT_SCALE = 3;

  /** @type {{id:string,name:string,cat:string,fam:string,w:number}[]} */
  const STYLES = [
    { id: "great-vibes", name: "Velvet Script", cat: "Elegant", fam: "'Great Vibes', cursive", w: 400 },
    { id: "dancing", name: "Flow Cursive", cat: "Cursive", fam: "'Dancing Script', cursive", w: 700 },
    { id: "pacifico", name: "Coastal Bold", cat: "Bold", fam: "'Pacifico', cursive", w: 400 },
    { id: "satisfy", name: "Ribbon Hand", cat: "Handwritten", fam: "'Satisfy', cursive", w: 400 },
    { id: "allura", name: "Silk Calligraphy", cat: "Calligraphy", fam: "'Allura', cursive", w: 400 },
    { id: "sacramento", name: "Airline Thin", cat: "Elegant", fam: "'Sacramento', cursive", w: 400 },
    { id: "courgette", name: "Brush Curve", cat: "Brush", fam: "'Courgette', cursive", w: 400 },
    { id: "kaushan", name: "Ink Impact", cat: "Bold", fam: "'Kaushan Script', cursive", w: 400 },
    { id: "marck", name: "Vintage Quill", cat: "Professional", fam: "'Marck Script', cursive", w: 400 },
    { id: "caveat", name: "Notebook Ink", cat: "Modern", fam: "'Caveat', cursive", w: 700 },
    { id: "marker", name: "Sharp Marker", cat: "Bold", fam: "'Permanent Marker', cursive", w: 400 },
    { id: "indie", name: "Friendly Scrawl", cat: "Handwritten", fam: "'Indie Flower', cursive", w: 400 },
    { id: "shadows", name: "Sketch Line", cat: "Handwritten", fam: "'Shadows Into Light', cursive", w: 400 },
    { id: "architect", name: "Architect Hand", cat: "Professional", fam: "'Architects Daughter', cursive", w: 400 },
    { id: "rock", name: "Chalk Board", cat: "Bold", fam: "'Rock Salt', cursive", w: 400 },
    { id: "reenie", name: "Tiny Script", cat: "Minimal", fam: "'Reenie Beanie', cursive", w: 400 },
    { id: "herr", name: "Classic Luxury", cat: "Luxury", fam: "'Herr Von Muellerhoff', cursive", w: 400 },
    { id: "tangerine", name: "Light Flourish", cat: "Elegant", fam: "'Tangerine', cursive", w: 700 },
    { id: "alex", name: "Soft Brush", cat: "Brush", fam: "'Alex Brush', cursive", w: 400 },
    { id: "parisienne", name: "Paris Chic", cat: "Luxury", fam: "'Parisienne', cursive", w: 400 },
    { id: "italianno", name: "Italian Line", cat: "Calligraphy", fam: "'Italianno', cursive", w: 400 },
    { id: "msmadi", name: "Studio Cursive", cat: "Modern", fam: "'Ms Madi', cursive", w: 400 },
    { id: "imperial", name: "Imperial Crest", cat: "Luxury", fam: "'Imperial Script', cursive", w: 400 },
    { id: "euphoria", name: "Euphoria Wave", cat: "Stylish", fam: "'Euphoria Script', cursive", w: 400 },
    { id: "pinyon", name: "Formal Crest", cat: "Professional", fam: "'Pinyon Script', cursive", w: 400 },
    { id: "corinthia", name: "Grand Luxe", cat: "Luxury", fam: "'Corinthia', cursive", w: 700 },
    { id: "windsong", name: "Airy Signature", cat: "Elegant", fam: "'WindSong', cursive", w: 400 },
    { id: "yesteryear", name: "Retro Ink", cat: "Stylish", fam: "'Yesteryear', cursive", w: 400 },
    { id: "lovers", name: "Romantic Swash", cat: "Stylish", fam: "'Lovers Quarrel', cursive", w: 400 },
    { id: "bilbo", name: "Fantasy Autograph", cat: "Stylish", fam: "'Bilbo Swash Caps', cursive", w: 400 },
    { id: "bonheur", name: "Royal Parade", cat: "Luxury", fam: "'Bonheur Royale', cursive", w: 400 },
    { id: "berkshire", name: "Swash Executive", cat: "Professional", fam: "'Berkshire Swash', cursive", w: 400 },
    { id: "norican", name: "Round Signet", cat: "Cursive", fam: "'Norican', cursive", w: 400 },
    { id: "aguafina", name: "Aqua Flow", cat: "Brush", fam: "'Aguafina Script', cursive", w: 400 },
    { id: "bad", name: "Quick Draft", cat: "Handwritten", fam: "'Bad Script', cursive", w: 400 },
    { id: "callig", name: "Street Calligraphy", cat: "Calligraphy", fam: "'Calligraffitti', cursive", w: 400 },
    { id: "cookie", name: "Sweet Cursive", cat: "Cursive", fam: "'Cookie', cursive", w: 400 },
    { id: "seaweed", name: "Organic Brush", cat: "Brush", fam: "'Seaweed Script', cursive", w: 400 },
    { id: "mrdafoe", name: "Stylish Autograph", cat: "Stylish", fam: "'Mr Dafoe', cursive", w: 400 },
    { id: "rouge", name: "Rouge Script", cat: "Elegant", fam: "'Rouge Script', cursive", w: 400 },
    { id: "petemoss", name: "Moss Stroke", cat: "Brush", fam: "'Petemoss', cursive", w: 400 },
    { id: "birthstone", name: "Long Luxury", cat: "Luxury", fam: "'Birthstone', cursive", w: 400 },
    { id: "ruthie", name: "Ruthie Flourish", cat: "Calligraphy", fam: "'Ruthie', cursive", w: 400 },
    { id: "allison", name: "Allison Script", cat: "Cursive", fam: "'Allison', cursive", w: 400 },
    { id: "yellowtail", name: "Retro Brush", cat: "Brush", fam: "'Yellowtail', cursive", w: 400 },
    { id: "nothing", name: "Natural Pen", cat: "Handwritten", fam: "'Nothing You Could Do', cursive", w: 400 },
    { id: "labelle", name: "Romantic Ink", cat: "Elegant", fam: "'La Belle Aurore', cursive", w: 400 },
    { id: "homemade", name: "Homemade Apple", cat: "Handwritten", fam: "'Homemade Apple', cursive", w: 400 },
    { id: "lobster", name: "Bold Display", cat: "Bold", fam: "'Lobster', cursive", w: 400 },
    { id: "lato-min", name: "Minimal Clean", cat: "Minimal", fam: "'Lato', sans-serif", w: 700 },
  ];

  const CATS = ["All", "Cursive", "Elegant", "Handwritten", "Bold", "Calligraphy", "Modern", "Brush", "Luxury", "Minimal", "Professional", "Stylish"];

  const html = document.documentElement;
  const $ = (id) => document.getElementById(id);

  let mode = "type";
  let styleKey = STYLES[0].id;
  let filterCat = "All";
  let drawTool = "pen";
  /** @type {{type:'pen'|'erase', color:string, width:number, points:[number,number][]}[]} */
  let strokes = [];
  let currentSeg = null;
  let drawing = false;
  let rafMove = 0;
  const past = [];
  let future = [];
  let drawCtx = null;

  const nameInput = $("nameInput");
  const gallery = $("gallery");
  const filterChips = $("filterChips");
  const typeControls = $("typeControls");
  const drawControls = $("drawControls");
  const tabs = document.querySelectorAll(".tab");
  const typedPreview = $("typedPreview");
  const typedPlaceholder = $("typedPlaceholder");
  const typedWrap = $("typedWrap");
  const previewBody = $("previewBody");
  const drawCanvas = $("drawCanvas");
  const exportCanvas = $("exportCanvas");
  const themeBtn = $("themeBtn");
  const inkColor = $("inkColor");
  const bgColor = $("bgColor");
  const transparentBg = $("transparentBg");
  const fontSize = $("fontSize");
  const sizeVal = $("sizeVal");
  const letterSpace = $("letterSpace");
  const letterVal = $("letterVal");
  const rotation = $("rotation");
  const rotVal = $("rotVal");
  const strokeColor = $("strokeColor");
  const strokeWidth = $("strokeWidth");
  const strokeVal = $("strokeVal");
  const btnPen = $("btnPen");
  const btnErase = $("btnErase");
  const undoBtn = $("undoBtn");
  const redoBtn = $("redoBtn");
  const clearCanvas = $("clearCanvas");
  const dlPng = $("dlPng");
  const dlPngTrans = $("dlPngTrans");
  const dlJpg = $("dlJpg");
  const dlSvg = $("dlSvg");
  const copyBtn = $("copyBtn");
  const saveHistory = $("saveHistory");
  const historyList = $("historyList");
  const historyEmpty = $("historyEmpty");
  const clearHistory = $("clearHistory");
  const toastHost = $("toastHost");

  function styleByKey(k) {
    return STYLES.find((s) => s.id === k) || STYLES[0];
  }

  function toast(msg, err) {
    const el = document.createElement("div");
    el.className = "toast " + (err ? "err" : "ok");
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      el.style.transition = "opacity .28s, transform .28s";
      setTimeout(() => el.remove(), 280);
    }, 3000);
  }

  function applySavedTheme() {
    const t = localStorage.getItem(STORAGE_THEME);
    if (t === "light" || t === "dark") html.dataset.theme = t;
    themeBtn.textContent = html.dataset.theme === "light" ? "☀️" : "🌙";
  }
  themeBtn.addEventListener("click", () => {
    const next = html.dataset.theme === "dark" ? "light" : "dark";
    html.dataset.theme = next;
    localStorage.setItem(STORAGE_THEME, next);
    themeBtn.textContent = next === "light" ? "☀️" : "🌙";
    if (mode === "draw") resizeDrawCanvas();
  });

  function renderFilters() {
    filterChips.innerHTML = "";
    CATS.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (c === filterCat ? " active" : "");
      b.textContent = c;
      b.addEventListener("click", () => {
        filterCat = c;
        renderFilters();
        renderGallery();
      });
      filterChips.appendChild(b);
    });
  }

  function galleryPreviewName() {
    const n = nameInput.value.trim();
    return n || "Your Name";
  }

  function renderGallery() {
    gallery.innerHTML = "";
    const list = STYLES.filter((s) => filterCat === "All" || s.cat === filterCat);
    list.forEach((s) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "style-card" + (s.id === styleKey ? " active" : "");
      card.dataset.key = s.id;
      const prev = document.createElement("div");
      prev.className = "style-card-preview";
      prev.textContent = galleryPreviewName();
      prev.style.fontFamily = s.fam;
      prev.style.fontWeight = String(s.w);
      prev.style.fontSize = "1.05rem";
      const meta = document.createElement("div");
      meta.className = "style-card-meta";
      meta.innerHTML = `<div class="style-card-title">${escapeHtml(s.name)}</div><div class="style-card-cat">${escapeHtml(s.cat)}</div>`;
      card.appendChild(prev);
      card.appendChild(meta);
      card.addEventListener("click", () => {
        styleKey = s.id;
        renderGallery();
        renderTyped();
      });
      gallery.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function setMode(m) {
    mode = m;
    tabs.forEach((t) => {
      const on = t.dataset.mode === m;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    typeControls.hidden = m !== "type";
    drawControls.hidden = m !== "draw";
    typedWrap.style.display = m === "type" ? "flex" : "none";
    drawCanvas.hidden = m !== "draw";
    updatePreviewBg();
    if (m === "type") renderTyped();
    else requestAnimationFrame(() => resizeDrawCanvas());
  }
  tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.mode)));

  function updatePreviewBg() {
    previewBody.classList.toggle("checker", mode === "type" && transparentBg.checked);
  }

  function renderTyped() {
    const name = nameInput.value.trim();
    const st = styleByKey(styleKey);
    if (!name) {
      typedPreview.style.display = "none";
      typedPlaceholder.style.display = "inline";
      return;
    }
    typedPlaceholder.style.display = "none";
    typedPreview.style.display = "block";
    typedPreview.textContent = name;
    typedPreview.style.fontFamily = st.fam;
    typedPreview.style.fontWeight = String(st.w);
    typedPreview.style.color = inkColor.value;
    typedPreview.style.setProperty("--preview-size", fontSize.value + "px");
    typedPreview.style.setProperty("--preview-weight", String(st.w));
    typedPreview.style.letterSpacing = letterSpace.value + "px";
    typedPreview.style.transform = `rotate(${rotation.value}deg)`;
    typedPreview.style.backgroundColor = transparentBg.checked ? "transparent" : bgColor.value;
    typedPreview.style.padding = "8px 14px";
    typedPreview.style.borderRadius = "12px";
    typedPreview.style.animation = "none";
    void typedPreview.offsetWidth;
    typedPreview.style.animation = "sigIn 0.42s ease";
    renderGallery();
  }

  nameInput.addEventListener("input", renderTyped);
  inkColor.addEventListener("input", renderTyped);
  bgColor.addEventListener("input", renderTyped);
  transparentBg.addEventListener("change", () => {
    updatePreviewBg();
    renderTyped();
  });
  fontSize.addEventListener("input", () => {
    sizeVal.textContent = fontSize.value;
    renderTyped();
  });
  letterSpace.addEventListener("input", () => {
    letterVal.textContent = letterSpace.value;
    renderTyped();
  });
  rotation.addEventListener("input", () => {
    rotVal.textContent = rotation.value;
    renderTyped();
  });

  function commitBeforeChange() {
    past.push(JSON.stringify(strokes));
    if (past.length > 100) past.shift();
    future = [];
  }

  function undo() {
    if (!past.length) return;
    future.push(JSON.stringify(strokes));
    strokes = JSON.parse(past.pop());
    redrawAll();
    toast("Undone");
  }
  function redo() {
    if (!future.length) return;
    past.push(JSON.stringify(strokes));
    strokes = JSON.parse(future.pop());
    redrawAll();
    toast("Redone");
  }

  undoBtn.addEventListener("click", undo);
  redoBtn.addEventListener("click", redo);

  function setTool(t) {
    drawTool = t;
    btnPen.classList.toggle("on", t === "pen");
    btnErase.classList.toggle("on", t === "erase");
    drawCanvas.style.cursor = t === "erase" ? "cell" : "crosshair";
  }
  btnPen.addEventListener("click", () => setTool("pen"));
  btnErase.addEventListener("click", () => setTool("erase"));

  function canvasBgCss() {
    return html.dataset.theme === "light" ? "#fafbff" : "#14141c";
  }

  function resizeDrawCanvas() {
    const rect = drawCanvas.parentElement.getBoundingClientRect();
    const w = Math.max(280, Math.floor(rect.width - 8));
    const h = Math.min(340, Math.max(200, Math.floor(window.innerHeight * 0.42)));
    const oldW = drawCanvas.width;
    const oldH = drawCanvas.height;
    if (oldW && oldH && strokes.length && (w !== oldW || h !== oldH)) {
      const sx = w / oldW;
      const sy = h / oldH;
      strokes = strokes.map((seg) => ({
        ...seg,
        points: seg.points.map(([x, y]) => [x * sx, y * sy]),
      }));
    }
    drawCanvas.width = w;
    drawCanvas.height = h;
    drawCtx = drawCanvas.getContext("2d");
    drawCtx.lineCap = "round";
    drawCtx.lineJoin = "round";
    redrawAll();
  }

  function drawSegmentPath(ctx, seg, partial) {
    const pts = partial || seg.points;
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (seg.type === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = seg.width * 1.25;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = seg.width;
    }
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  }

  function redrawAll(tempSeg) {
    if (!drawCtx) return;
    drawCtx.fillStyle = canvasBgCss();
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    strokes.forEach((s) => drawSegmentPath(drawCtx, s, null));
    if (tempSeg && tempSeg.points.length > 1) drawSegmentPath(drawCtx, tempSeg, tempSeg.points);
  }

  function canvasXY(e) {
    const r = drawCanvas.getBoundingClientRect();
    const sx = drawCanvas.width / r.width;
    const sy = drawCanvas.height / r.height;
    const cx = e.clientX;
    const cy = e.clientY;
    return [(cx - r.left) * sx, (cy - r.top) * sy];
  }

  function onPointerDown(e) {
    if (mode !== "draw") return;
    e.preventDefault();
    drawCanvas.setPointerCapture(e.pointerId);
    drawing = true;
    const p = canvasXY(e);
    const w = Math.max(1, parseInt(strokeWidth.value, 10) || 3);
    const col = strokeColor.value;
    currentSeg = {
      type: drawTool === "erase" ? "erase" : "pen",
      color: col,
      width: w,
      points: [p],
    };
  }

  function onPointerMove(e) {
    if (!drawing || !currentSeg || mode !== "draw") return;
    e.preventDefault();
    if (rafMove) return;
    rafMove = requestAnimationFrame(() => {
      rafMove = 0;
      const p = canvasXY(e);
      const last = currentSeg.points[currentSeg.points.length - 1];
      const dx = p[0] - last[0];
      const dy = p[1] - last[1];
      if (dx * dx + dy * dy < 1) return;
      currentSeg.points.push(p);
      redrawAll(currentSeg);
    });
  }

  function onPointerUp(e) {
    if (!drawing || mode !== "draw") return;
    e.preventDefault();
    try {
      drawCanvas.releasePointerCapture(e.pointerId);
    } catch (_) {}
    drawing = false;
    if (currentSeg && currentSeg.points.length > 1) {
      commitBeforeChange();
      strokes.push(currentSeg);
    }
    currentSeg = null;
    redrawAll();
  }

  drawCanvas.addEventListener("pointerdown", onPointerDown);
  drawCanvas.addEventListener("pointermove", onPointerMove);
  drawCanvas.addEventListener("pointerup", onPointerUp);
  drawCanvas.addEventListener("pointercancel", onPointerUp);

  strokeColor.addEventListener("input", () => {
    if (mode === "draw") redrawAll();
  });
  strokeWidth.addEventListener("input", () => {
    strokeVal.textContent = strokeWidth.value;
  });

  clearCanvas.addEventListener("click", () => {
    if (!strokes.length) return toast("Canvas is already empty", true);
    commitBeforeChange();
    strokes = [];
    redrawAll();
    toast("Canvas cleared");
  });

  window.addEventListener("resize", () => {
    if (mode === "draw") resizeDrawCanvas();
  });

  function measureTypedCanvas(scale) {
    const name = nameInput.value.trim();
    if (!name) return null;
    const st = styleByKey(styleKey);
    const s = scale;
    const sizePx = (parseInt(fontSize.value, 10) || 44) * s;
    const ls = parseFloat(letterSpace.value) || 0;
    const rot = (parseFloat(rotation.value) || 0) * (Math.PI / 180);
    const pad = 48 * s;
    const meas = document.createElement("canvas").getContext("2d");
    meas.font = `${st.w} ${sizePx}px ${st.fam}`;
    meas.letterSpacing = ls * s + "px";
    const tw = meas.measureText(name).width;
    const baseW = tw + pad * 2;
    const baseH = sizePx * 1.5 + pad * 2;
    const rw = Math.abs(baseW * Math.cos(rot)) + Math.abs(baseH * Math.sin(rot));
    const rh = Math.abs(baseW * Math.sin(rot)) + Math.abs(baseH * Math.cos(rot));
    return { name, st, s, sizePx, ls, rot, pad, w: Math.ceil(rw), h: Math.ceil(rh) };
  }

  function rasterizeTyped(scale, forceOpaqueWhite, transparentForce) {
    const m = measureTypedCanvas(scale);
    if (!m) return null;
    const c = exportCanvas;
    c.width = m.w;
    c.height = m.h;
    const ctx = c.getContext("2d");
    const transp = transparentForce || (transparentBg.checked && !forceOpaqueWhite);
    if (!transp) {
      ctx.fillStyle = forceOpaqueWhite ? "#ffffff" : bgColor.value;
      ctx.fillRect(0, 0, m.w, m.h);
    } else ctx.clearRect(0, 0, m.w, m.h);
    ctx.save();
    ctx.translate(m.w / 2, m.h / 2);
    ctx.rotate(m.rot);
    ctx.fillStyle = inkColor.value;
    ctx.font = `${m.st.w} ${m.sizePx}px ${m.st.fam}`;
    ctx.letterSpacing = m.ls * m.s + "px";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(m.name, 0, 0);
    ctx.restore();
    return true;
  }

  function rasterizeDrawToCanvas(target, scale, transparent) {
    const w = Math.round(drawCanvas.width * scale);
    const h = Math.round(drawCanvas.height * scale);
    target.width = w;
    target.height = h;
    const x = target.getContext("2d");
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.scale(scale, scale);
    if (!transparent) {
      x.fillStyle = canvasBgCss();
      x.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    } else x.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    strokes.forEach((seg) => drawSegmentPath(x, seg, null));
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function slug(name, ext) {
    const s = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "signature";
    return s + "." + ext;
  }

  dlPng.addEventListener("click", () => {
    if (mode === "type") {
      if (!rasterizeTyped(EXPORT_SCALE, false)) return toast("Enter your name first", true);
      exportCanvas.toBlob((b) => {
        downloadBlob(b, slug(nameInput.value.trim(), "png"));
        toast("High-quality PNG saved");
      }, "image/png");
    } else {
      if (!strokes.length) return toast("Draw a signature first", true);
      rasterizeDrawToCanvas(exportCanvas, EXPORT_SCALE, false);
      exportCanvas.toBlob((b) => {
        downloadBlob(b, "signature.png");
        toast("High-quality PNG saved");
      }, "image/png");
    }
  });

  dlPngTrans.addEventListener("click", () => {
    if (mode === "type") {
      if (!rasterizeTyped(EXPORT_SCALE, false, true)) return toast("Enter your name first", true);
      exportCanvas.toBlob((b) => {
        downloadBlob(b, slug(nameInput.value.trim().replace(/\s+/g, "-") + "-transparent", "png"));
        toast("Transparent PNG saved");
      }, "image/png");
    } else {
      if (!strokes.length) return toast("Draw a signature first", true);
      rasterizeDrawToCanvas(exportCanvas, EXPORT_SCALE, true);
      exportCanvas.toBlob((b) => {
        downloadBlob(b, "signature-transparent.png");
        toast("Transparent PNG saved");
      }, "image/png");
    }
  });

  dlJpg.addEventListener("click", () => {
    if (mode === "type") {
      if (!rasterizeTyped(EXPORT_SCALE, true)) return toast("Enter your name first", true);
      exportCanvas.toBlob(
        (b) => {
          downloadBlob(b, slug(nameInput.value.trim(), "jpg"));
          toast("JPG saved");
        },
        "image/jpeg",
        0.95
      );
    } else {
      if (!strokes.length) return toast("Draw a signature first", true);
      rasterizeDrawToCanvas(exportCanvas, EXPORT_SCALE, false);
      exportCanvas.toBlob(
        (b) => {
          downloadBlob(b, "signature.jpg");
          toast("JPG saved");
        },
        "image/jpeg",
        0.95
      );
    }
  });

  function typedSvg() {
    const name = nameInput.value.trim();
    if (!name) return "";
    const st = styleByKey(styleKey);
    const sizePx = parseInt(fontSize.value, 10) || 44;
    const ls = parseFloat(letterSpace.value) || 0;
    const rot = parseFloat(rotation.value) || 0;
    const meas = document.createElement("canvas").getContext("2d");
    meas.font = `${st.w} ${sizePx}px ${st.fam}`;
    meas.letterSpacing = ls + "px";
    const tw = meas.measureText(name).width;
    const pad = 28;
    const w = Math.ceil(tw + pad * 2);
    const h = Math.ceil(sizePx * 1.55 + pad * 2);
    const fam = st.fam.replace(/'/g, '"');
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const fill = esc(inkColor.value);
    const bg = transparentBg.checked ? "none" : esc(bgColor.value);
    const rect = transparentBg.checked ? "" : `<rect width="100%" height="100%" fill="${bg}"/>`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${rect}
  <g transform="translate(${w / 2}, ${h / 2}) rotate(${rot})">
    <text text-anchor="middle" dominant-baseline="middle" font-family="${fam}" font-size="${sizePx}" font-weight="${st.w}" fill="${fill}" letter-spacing="${ls}px">${esc(name)}</text>
  </g>
</svg>`;
  }

  function drawSvgRasterFallback() {
    rasterizeDrawToCanvas(exportCanvas, 2, false);
    const png = exportCanvas.toDataURL("image/png");
    const w = exportCanvas.width;
    const h = exportCanvas.height;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image width="100%" height="100%" xlink:href="${png}"/>
</svg>`;
  }

  function drawSvgPathsOnly() {
    const w = drawCanvas.width;
    const h = drawCanvas.height;
    const bg = canvasBgCss();
    const paths = strokes
      .filter((s) => s.type === "pen" && s.points.length > 1)
      .map((s) => {
        let d = `M ${s.points[0][0].toFixed(2)} ${s.points[0][1].toFixed(2)}`;
        for (let i = 1; i < s.points.length; i++) d += ` L ${s.points[i][0].toFixed(2)} ${s.points[i][1].toFixed(2)}`;
        return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"/>`;
      })
      .join("\n  ");
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${bg}"/>
  ${paths}
</svg>`;
  }

  dlSvg.addEventListener("click", () => {
    let svg = "";
    if (mode === "type") {
      svg = typedSvg();
      if (!svg) return toast("Enter your name first", true);
    } else {
      if (!strokes.length) return toast("Draw a signature first", true);
      const hasErase = strokes.some((s) => s.type === "erase");
      svg = hasErase ? drawSvgRasterFallback() : drawSvgPathsOnly();
    }
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), mode === "type" ? slug(nameInput.value.trim(), "svg") : "signature.svg");
    toast("SVG saved");
  });

  copyBtn.addEventListener("click", async () => {
    try {
      if (mode === "type") {
        if (!rasterizeTyped(2, false)) return toast("Enter your name first", true);
      } else {
        if (!strokes.length) return toast("Draw a signature first", true);
        rasterizeDrawToCanvas(exportCanvas, 2, false);
      }
      const blob = await new Promise((res) => exportCanvas.toBlob(res, "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast("Copied to clipboard");
    } catch (e) {
      console.error(e);
      toast("Copy failed — try PNG export", true);
    }
  });

  function readHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function writeHistory(items) {
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(items.slice(0, MAX_HISTORY)));
    renderHistory();
  }

  function snapshotTypedThumb() {
    rasterizeTyped(1, false, false);
    return exportCanvas.toDataURL("image/png");
  }

  function snapshotDrawThumb() {
    rasterizeDrawToCanvas(exportCanvas, 1, false);
    return exportCanvas.toDataURL("image/png");
  }

  function saveSnapshot() {
    const id = Date.now();
    if (mode === "type") {
      const name = nameInput.value.trim();
      if (!name) return null;
      return {
        id,
        mode: "type",
        name,
        styleKey,
        ink: inkColor.value,
        bg: bgColor.value,
        transparent: transparentBg.checked,
        fontSize: parseInt(fontSize.value, 10),
        letterSpace: parseFloat(letterSpace.value) || 0,
        rotation: parseFloat(rotation.value) || 0,
        thumb: snapshotTypedThumb(),
      };
    }
    if (!strokes.length) return null;
    return {
      id,
      mode: "draw",
      strokes: JSON.parse(JSON.stringify(strokes)),
      w: drawCanvas.width,
      h: drawCanvas.height,
      thumb: snapshotDrawThumb(),
    };
  }

  saveHistory.addEventListener("click", () => {
    const item = saveSnapshot();
    if (!item) return toast(mode === "type" ? "Enter a name to save" : "Draw something first", true);
    const list = readHistory();
    list.unshift(item);
    writeHistory(list.slice(0, MAX_HISTORY));
    toast("Saved to studio history");
  });

  function renderHistory() {
    const items = readHistory();
    historyList.innerHTML = "";
    historyEmpty.style.display = items.length ? "none" : "block";
    items.forEach((it) => {
      const row = document.createElement("div");
      row.className = "history-item";
      row.innerHTML = `<img class="history-thumb" alt="" src="${it.thumb}" /><div class="history-meta"><strong>${it.mode === "type" ? escapeHtml(it.name) : "Drawn signature"}</strong><span>${it.mode === "type" ? "Typed" : "Drawn"} · ${new Date(it.id).toLocaleString()}</span></div>`;
      row.addEventListener("click", () => restoreItem(it));
      historyList.appendChild(row);
    });
  }

  function restoreItem(it) {
    if (it.mode === "type") {
      setMode("type");
      nameInput.value = it.name;
      styleKey = it.styleKey || legacyStyleKey(it.styleId);
      inkColor.value = it.ink;
      bgColor.value = it.bg;
      transparentBg.checked = !!it.transparent;
      fontSize.value = it.fontSize || 44;
      sizeVal.textContent = fontSize.value;
      letterSpace.value = it.letterSpace != null ? it.letterSpace : 0;
      letterVal.textContent = letterSpace.value;
      rotation.value = it.rotation != null ? it.rotation : 0;
      rotVal.textContent = rotation.value;
      renderFilters();
      renderGallery();
      renderTyped();
    } else {
      setMode("draw");
      strokes = it.strokes || [];
      requestAnimationFrame(() => {
        const tw = it.w || Math.max(280, Math.floor(drawCanvas.parentElement.getBoundingClientRect().width - 8));
        const th = it.h || Math.min(340, Math.max(200, Math.floor(window.innerHeight * 0.42)));
        drawCanvas.width = tw;
        drawCanvas.height = th;
        drawCtx = drawCanvas.getContext("2d");
        drawCtx.lineCap = "round";
        drawCtx.lineJoin = "round";
        past.length = 0;
        future.length = 0;
        redrawAll();
      });
    }
    toast("Restored from history");
  }

  function legacyStyleKey(n) {
    const map = ["great-vibes", "dancing", "lobster", "pacifico", "lato-min", "dancing", "msmadi", "lato-min"];
    return map[(n | 0) - 1] || STYLES[0].id;
  }

  clearHistory.addEventListener("click", () => {
    writeHistory([]);
    toast("History cleared");
  });

  applySavedTheme();
  renderFilters();
  renderGallery();
  setMode("type");
  renderTyped();
  renderHistory();
  setTool("pen");

  window.SignCraft = {
    getMode: () => mode,
    hasSignature() {
      if (mode === "type") return !!nameInput.value.trim();
      return strokes.length > 0;
    },
    getSignaturePngDataUrl(scale) {
      const s = scale || 2;
      if (mode === "type") {
        if (!nameInput.value.trim()) return null;
        rasterizeTyped(s, false, true);
      } else {
        if (!strokes.length) return null;
        rasterizeDrawToCanvas(exportCanvas, s, true);
      }
      return exportCanvas.toDataURL("image/png");
    },
    async getSignaturePngBlob(scale) {
      const s = scale || 3;
      if (mode === "type") {
        if (!nameInput.value.trim()) return null;
        rasterizeTyped(s, false, true);
      } else {
        if (!strokes.length) return null;
        rasterizeDrawToCanvas(exportCanvas, s, true);
      }
      return new Promise((resolve) => exportCanvas.toBlob((b) => resolve(b), "image/png"));
    },
    toast,
  };
})();
