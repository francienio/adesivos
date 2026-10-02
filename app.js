(() => {
  // js/util.js
  var $ = (s, r = document) => r.querySelector(s);
  var $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  function el(tag2, attrs = {}, children = []) {
    const n = document.createElement(tag2);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== void 0) n.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    return n;
  }
  var uid = (p = "id") => p + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  var clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  var lerp = (a, b, t) => a + (b - a) * t;
  function deepClone(o) {
    return JSON.parse(JSON.stringify(o));
  }
  function hexToRgb(hex) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    let h = String(hex).replace("#", "").trim();
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
    return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255 };
  }
  var rgbToHex = (r, g, b) => "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h, s, l };
  }
  function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHsl(r, g, b);
  }
  function mixHex(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t));
  }
  function loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("N\xE3o foi poss\xEDvel carregar a imagem"));
      img.src = src;
    });
  }
  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }
  function fitCanvas(src, maxSide = 1600) {
    const w = src.naturalWidth || src.width, h = src.naturalHeight || src.height;
    const k = Math.min(1, maxSide / Math.max(w, h));
    const c = makeCanvas(w * k, h * k);
    c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
    return c;
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4e3);
  }
  function canvasToBlob(canvas, type = "image/png", quality = 0.95) {
    return new Promise((res) => canvas.toBlob(res, type, quality));
  }
  function debounce(fn, ms = 220) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  }
  function toast(msg, type = "info", ms = 2600) {
    let host = document.getElementById("toasts");
    if (!host) {
      host = document.createElement("div");
      host.id = "toasts";
      document.body.appendChild(host);
    }
    const t = el("div", { class: `toast ${type}`, text: msg });
    host.appendChild(t);
    requestAnimationFrame(() => t.classList.add("in"));
    setTimeout(() => {
      t.classList.remove("in");
      setTimeout(() => t.remove(), 320);
    }, ms);
  }
  function openModal({ title, body, footer, wide = false, onClose }) {
    const wrap = el("div", { class: "modal-wrap" });
    const card = el("div", { class: "modal-card" + (wide ? " wide" : "") });
    const head = el("div", { class: "modal-head" }, [el("h3", { text: title }), el("button", { class: "icon-btn", text: "\xD7", onclick: close })]);
    const bodyBox = el("div", { class: "modal-body" });
    if (typeof body === "string") bodyBox.innerHTML = body;
    else if (body) bodyBox.appendChild(body);
    card.appendChild(head);
    card.appendChild(bodyBox);
    if (footer) {
      const f = el("div", { class: "modal-foot" });
      f.appendChild(footer);
      card.appendChild(f);
    }
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("in"));
    function close() {
      wrap.classList.remove("in");
      setTimeout(() => wrap.remove(), 200);
      onClose && onClose();
    }
    wrap.addEventListener("pointerdown", (e) => {
      if (e.target === wrap) close();
    });
    return { close, body: bodyBox, card };
  }
  function confirmModal(title, text, okLabel = "Confirmar") {
    return new Promise((resolve) => {
      const m = openModal({ title, body: `<p style="margin:0;line-height:1.6">${text}</p>` });
      const no = el("button", { class: "btn ghost", text: "Cancelar", onclick: () => {
        m.close();
        resolve(false);
      } });
      const yes = el("button", { class: "btn danger", text: okLabel, onclick: () => {
        m.close();
        resolve(true);
      } });
      m.card.querySelector(".modal-body").appendChild(el("div", { class: "modal-foot" }, [no, yes]));
    });
  }
  var LS = {
    get(k, d = null) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
        return true;
      } catch (e) {
        console.warn("localStorage", e);
        return false;
      }
    },
    del(k) {
      try {
        localStorage.removeItem(k);
      } catch {
      }
    }
  };
  function compressImage(img, maxSide = 2048, mime = "image/jpeg") {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    if (Math.max(w, h) <= maxSide) return null;
    const k = maxSide / Math.max(w, h);
    const c = makeCanvas(Math.round(w * k), Math.round(h * k));
    const g = c.getContext("2d");
    if (mime === "image/jpeg") {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, c.width, c.height);
    }
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(mime, 0.92);
  }

  // js/geometry.js
  function toLocal(p, layer) {
    const rad = -(layer.rotation || 0);
    const c = Math.cos(rad), s = Math.sin(rad);
    const dx = p.x - layer.x, dy = p.y - layer.y;
    return { x: dx * c - dy * s, y: dx * s + dy * c };
  }
  function toWorld(p, layer) {
    const rad = layer.rotation || 0;
    const c = Math.cos(rad), s = Math.sin(rad);
    return { x: layer.x + p.x * c - p.y * s, y: layer.y + p.x * s + p.y * c };
  }
  function layerBox(layer, layout) {
    switch (layer.type) {
      case "text": {
        const L = layout || {};
        const w = Math.max(1, L.maxWidth || 100), h = Math.max(1, L.totalHeight || 40);
        if (layer.curve && L.radius) {
          const r = L.radius;
          const half = Math.min(Math.PI * 0.98, w / (2 * r));
          const sag = r * (1 - Math.cos(half));
          const lh = L.lineHeight || layer.fontSize * 1.2;
          if (layer.curve > 0) return { x: -Math.sin(half) * r, y: -sag - lh * 0.5, w: Math.sin(half) * r * 2, h: sag + lh };
          return { x: -Math.sin(half) * r, y: -lh * 0.5, w: Math.sin(half) * r * 2, h: sag + lh };
        }
        return { x: -w / 2, y: -h / 2, w, h };
      }
      case "image":
        return { x: -50, y: -50, w: 100, h: 100 };
      case "icon": {
        const s = layer.size || 200;
        return { x: -s / 2, y: -s / 2, w: s, h: s };
      }
      case "path": {
        const pts = layer.points || [];
        if (!pts.length) return { x: -10, y: -10, w: 20, h: 20 };
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of pts) {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        }
        const pad = (layer.strokeWidth || 4) / 2 + 2;
        return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
      }
      case "shape": {
        const s = layer.size || 100;
        if (layer.kind === "rect") return { x: -(layer.w || s) / 2, y: -(layer.h || s) / 2, w: layer.w || s, h: layer.h || s };
        if (layer.kind === "line") return { x: -(layer.w || s) / 2, y: -(layer.strokeWidth || 4) / 2, w: layer.w || s, h: layer.strokeWidth || 4 };
        return { x: -s / 2, y: -s / 2, w: s, h: s };
      }
      default:
        return { x: -50, y: -50, w: 100, h: 100 };
    }
  }
  function boxCorners(box) {
    return [
      { x: box.x, y: box.y },
      { x: box.x + box.w, y: box.y },
      { x: box.x + box.w, y: box.y + box.h },
      { x: box.x, y: box.y + box.h }
    ];
  }
  function bboxOfPoints(pts) {
    if (!pts.length) return { x: 0, y: 0, w: 0, h: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }
  function pointInPoly(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
      const hit = yi > p.y !== yj > p.y && p.x < (xj - xi) * (p.y - yi) / (yj - yi || 1e-9) + xi;
      if (hit) inside = !inside;
    }
    return inside;
  }
  function hitLayer(pWorld, layer, layout, opts = {}) {
    const l = toLocal(pWorld, layer);
    const box = layerBox(layer, layout);
    if (opts.bboxOnly || layer.type === "text") {
      return l.x >= box.x && l.x <= box.x + box.w && l.y >= box.y && l.y <= box.y + box.h;
    }
    if (layer.type === "image") return l.x >= -50 && l.x <= 50 && l.y >= -50 && l.y <= 50;
    if (layer.type === "icon") {
      const s = layer.size || 200;
      return l.x >= -s / 2 && l.x <= s / 2 && l.y >= -s / 2 && l.y <= s / 2;
    }
    if (layer.type === "path") {
      const tol = Math.max(8, (layer.strokeWidth || 6) / (layer.scale || 1) + 8);
      const pts = layer.points || [];
      for (let i = 1; i < pts.length; i++) {
        if (distToSegment(l, pts[i - 1], pts[i]) <= tol) return true;
      }
      return false;
    }
    if (layer.type === "shape") {
      const s = layer.size || 100;
      const nx = (l.x + s / 2) / s * 2 - 1;
      const ny = (l.y + s / 2) / s * 2 - 1;
      switch (layer.kind) {
        case "ellipse":
        case "ring":
          return nx * nx + ny * ny <= 1;
        case "triangle": {
          const poly = shapePolygon("triangle", 2, 60);
          return pointInPoly({ x: nx * 100, y: ny * 100 }, poly);
        }
        case "diamond":
          return Math.abs(nx) + Math.abs(ny) <= 1;
        case "arrow":
        case "lightning":
        case "flame":
        case "crown":
        case "shield":
        case "banner":
        case "splash":
        case "badge":
        case "star":
        case "hexagon": {
          const poly = shapePolygon(layer.kind, 200, 60);
          return pointInPoly({ x: nx * 100, y: ny * 100 }, poly);
        }
        default:
          return true;
      }
    }
    return true;
  }
  function distToSegment(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1e-9;
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx, py = a.y + t * dy;
    return Math.hypot(p.x - px, p.y - py);
  }
  function shapePolygon(kind, size = 200, sides = 6, innerRatio = 0.5, rotation = 0) {
    const R = size / 2, pts = [];
    const push = (ang, r) => pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
    switch (kind) {
      case "triangle":
        for (let i = 0; i < 3; i++) push(-Math.PI / 2 + rotation + i * (Math.PI * 2 / 3), R);
        break;
      case "diamond":
        push(-Math.PI / 2 + rotation, R);
        push(rotation, R * 0.62);
        push(Math.PI / 2 + rotation, R);
        push(Math.PI + rotation, R * 0.62);
        break;
      case "hexagon":
        for (let i = 0; i < sides; i++) push(rotation + i * (Math.PI * 2 / sides), R);
        break;
      case "star": {
        const n = Math.max(3, sides | 0);
        for (let i = 0; i < n * 2; i++) {
          const ang = rotation - Math.PI / 2 + i * Math.PI / n;
          push(ang, i % 2 === 0 ? R : R * innerRatio);
        }
        break;
      }
      case "shield": {
        const w = R * 0.9;
        pts.push(
          { x: -w, y: -R * 0.85 },
          { x: w, y: -R * 0.85 },
          { x: w, y: R * 0.1 },
          { x: 0, y: R * 0.92 },
          { x: -w, y: R * 0.1 }
        );
        break;
      }
      case "badge": {
        const n = 26;
        for (let i = 0; i < n; i++) {
          const ang = rotation + i * Math.PI * 2 / n;
          push(ang, i % 2 === 0 ? R * 0.98 : R * 0.86);
        }
        break;
      }
      case "banner": {
        const w = R, h = R * 0.46, t = R * 0.28;
        pts.push({ x: -w, y: -h }, { x: w, y: -h }, { x: w, y: h }, { x: w * 0.35, y: h }, { x: 0, y: h + t }, { x: -w * 0.35, y: h }, { x: -w, y: h });
        break;
      }
      case "splash": {
        const n = 14;
        for (let i = 0; i < n; i++) {
          const ang = rotation + i * Math.PI * 2 / n;
          const rr = R * (0.62 + 0.38 * (i * 37 % 7) / 7);
          push(ang, rr);
        }
        break;
      }
      case "arrow": {
        const w = R, h = R * 0.34;
        pts.push(
          { x: -w, y: -h },
          { x: w * 0.1, y: -h },
          { x: w * 0.1, y: -R * 0.8 },
          { x: w, y: 0 },
          { x: w * 0.1, y: R * 0.8 },
          { x: w * 0.1, y: h },
          { x: -w, y: h }
        );
        break;
      }
      case "lightning": {
        pts.push(
          { x: R * 0.18, y: -R },
          { x: -R * 0.55, y: R * 0.12 },
          { x: -R * 0.05, y: R * 0.12 },
          { x: -R * 0.2, y: R },
          { x: R * 0.6, y: -R * 0.14 },
          { x: R * 0.06, y: -R * 0.14 }
        );
        break;
      }
      case "flame": {
        const n = 22;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const x = -R + t * R * 2;
          const y = -Math.sin(t * Math.PI) * R * (0.55 + 0.45 * Math.sin(t * 7));
          pts.push({ x, y });
        }
        for (let i = n; i >= 0; i--) {
          const t = i / n;
          const x = -R + t * R * 2;
          pts.push({ x, y: R * 0.75 - Math.sin(t * Math.PI) * R * 0.2 });
        }
        break;
      }
      case "crown": {
        const w = R, h = R * 0.6;
        pts.push(
          { x: -w, y: h },
          { x: -w * 0.8, y: -h },
          { x: -w * 0.35, y: h * 0.1 },
          { x: 0, y: -h },
          { x: w * 0.35, y: h * 0.1 },
          { x: w * 0.8, y: -h },
          { x: w, y: h }
        );
        break;
      }
      default:
        pts.push({ x: -R, y: -R }, { x: R, y: -R }, { x: R, y: R }, { x: -R, y: R });
    }
    return pts;
  }
  function alignLayer(layer, mode, layout, area = null) {
    const box = area || { x: 0, y: 0, w: 0, h: 0 };
    const b = layerBox(layer, layout);
    const cx = layer.x, cy = layer.y;
    const left = cx + b.x, top = cy + b.y;
    switch (mode) {
      case "left":
        layer.x += box.x - left;
        break;
      case "hcenter":
        layer.x += (area ? area.x + area.w / 2 : 0) - cx;
        break;
      case "right":
        layer.x += (area ? area.x + area.w : 0) - (left + b.w);
        break;
      case "top":
        layer.y += area.y - top;
        break;
      case "vcenter":
        layer.y += (area ? area.y + area.h / 2 : 0) - cy;
        break;
      case "bottom":
        layer.y += (area ? area.y + area.h : 0) - (top + b.h);
        break;
    }
    return layer;
  }
  function layoutText(text, opts, measure) {
    const {
      fontSize = 64,
      lineHeight = 1.2,
      letterSpacing = 0,
      align = "center",
      textBoxWidth = null,
      wrap = false,
      curve = 0
    } = opts;
    const paragraphs = String(text ?? "").split("\n");
    const widths = [];
    const lines = [];
    const measureLine = (s) => measure(s, { fontSize, letterSpacing }) + (letterSpacing || 0);
    for (const para of paragraphs) {
      if (!wrap || !textBoxWidth) {
        lines.push(para);
        widths.push(measureLine(para));
        continue;
      }
      const words = para.split(" ");
      let cur = "";
      for (const w of words) {
        const test = cur ? cur + " " + w : w;
        if (measureLine(test) > textBoxWidth && cur) {
          lines.push(cur);
          widths.push(measureLine(cur));
          cur = w;
        } else cur = test;
      }
      lines.push(cur);
      widths.push(measureLine(cur));
    }
    const lh = fontSize * lineHeight;
    const maxWidth = Math.max(1, ...widths);
    const totalHeight = Math.max(lh, lines.length * lh);
    const glyphs = [];
    if (curve) {
      const arcFrac = Math.min(1, Math.abs(curve) / 100);
      const totalAngle = Math.max(0.25, Math.PI * 1.1 * arcFrac);
      const r = Math.max(60, maxWidth / totalAngle);
      let acc = 0;
      lines.forEach((line, li) => {
        const lw = widths[li];
        acc += lw;
        for (const ch of line) {
          const cw = measure(ch, { fontSize, letterSpacing }) + (letterSpacing || 0);
          glyphs.push({ ch, w: cw, line: li, offsetInLine: acc - lw + (acc - (acc - lw)) });
        }
      });
      let gi = 0;
      lines.forEach((line, li) => {
        let x = -widths[li] / 2;
        const y = (li - (lines.length - 1) / 2) * lh;
        for (const ch of line) {
          const cw = measure(ch, { fontSize, letterSpacing }) + (letterSpacing || 0);
          glyphs[gi].x = x + cw / 2;
          glyphs[gi].y = y;
          glyphs[gi].w = cw;
          gi++;
          x += cw;
        }
      });
      return { lines, widths, maxWidth, totalHeight, lineHeight: lh, glyphs, radius: r };
    }
    return { lines, widths, maxWidth, totalHeight, lineHeight: lh, glyphs: null, radius: 0 };
  }

  // js/effects.js
  function analyzeImage(imgOrCanvas) {
    const c = imgOrCanvas.getContext ? imgOrCanvas : drawToCanvas(imgOrCanvas, 360);
    const w = c.width, h = c.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const d = ctx.getImageData(0, 0, w, h).data;
    const hist = new Array(10).fill(0);
    let satSum = 0, lumSum = 0, n = 0, opaque = 0;
    const lum = new Float32Array(w * h);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      if (a < 40) continue;
      opaque++;
      const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      lum[p] = L;
      lumSum += L;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      satSum += mx === 0 ? 0 : (mx - mn) / mx;
      hist[Math.min(9, Math.floor(L * 10))]++;
      n++;
    }
    if (!n) n = 1;
    let edge = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const gx = Math.abs(lum[i + 1] - lum[i - 1]);
        const gy = Math.abs(lum[i + w] - lum[i - w]);
        if (gx + gy > 0.18) edge++;
      }
    }
    const total = n || 1;
    const dark = hist.slice(0, 4).reduce((a, b) => a + b, 0) / total;
    const bright = hist.slice(7).reduce((a, b) => a + b, 0) / total;
    const mid = 1 - dark - bright;
    return {
      width: w,
      height: h,
      aspect: w / h,
      avgLum: lumSum / n,
      avgSat: satSum / n,
      darkRatio: dark,
      midRatio: mid,
      brightRatio: bright,
      edgeDensity: edge / total,
      histogram: hist.map((v) => v / total),
      opaqueRatio: opaque / (w * h)
    };
  }
  function drawToCanvas(img, maxSide) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const k = Math.min(1, maxSide / Math.max(w, h));
    const c = makeCanvas(w * k, h * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c;
  }
  function silhouetteMask(source, width, height, tolerance = 34) {
    const c = makeCanvas(width, height);
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, width, height);
    const img = ctx.getImageData(0, 0, width, height);
    const d = img.data;
    const seeds = [];
    const push = (x, y) => {
      if (x >= 0 && y >= 0 && x < width && y < height) seeds.push([x, y]);
    };
    for (let x = 0; x < width; x += 2) {
      push(x, 0);
      push(x, height - 1);
    }
    for (let y = 0; y < height; y += 2) {
      push(0, y);
      push(width - 1, y);
    }
    const visited = new Uint8Array(width * height);
    const stack = [];
    const key = (x, y) => y * width + x;
    const refColors = [];
    for (const [x, y] of seeds) {
      const i = key(x, y) * 4;
      refColors.push([d[i], d[i + 1], d[i + 2]]);
      if (!visited[key(x, y)]) {
        visited[key(x, y)] = 1;
        stack.push([x, y]);
      }
    }
    const avg = refColors.reduce((a, c2) => [a[0] + c2[0] / refColors.length, a[1] + c2[1] / refColors.length, a[2] + c2[2] / refColors.length], [0, 0, 0]);
    const matches = (i) => {
      let ok = false;
      for (const rc of refColors.slice(0, 240)) {
        if (Math.abs(d[i] - rc[0]) + Math.abs(d[i + 1] - rc[1]) + Math.abs(d[i + 2] - rc[2]) < tolerance * 2.2) {
          ok = true;
          break;
        }
      }
      if (ok) return true;
      return Math.abs(d[i] - avg[0]) + Math.abs(d[i + 1] - avg[1]) + Math.abs(d[i + 2] - avg[2]) < tolerance * 2.6;
    };
    const isBg = new Uint8Array(width * height);
    while (stack.length) {
      const [x, y] = stack.pop();
      const k = key(x, y);
      isBg[k] = 1;
      const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (const [nx, ny] of nb) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const nk = key(nx, ny);
        if (visited[nk]) continue;
        visited[nk] = 1;
        if (matches(nk * 4)) stack.push([nx, ny]);
      }
    }
    const out = ctx.createImageData(width, height);
    for (let i = 0, p = 0; p < width * height; p++, i += 4) {
      const v = isBg[p] ? 0 : 255;
      out.data[i] = out.data[i + 1] = out.data[i + 2] = 255;
      out.data[i + 3] = v;
    }
    const maskC = makeCanvas(width, height);
    maskC.getContext("2d").putImageData(out, 0, 0);
    return maskC;
  }
  function carbonTexture(w, h, scale = 1) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    g.fillStyle = "#0a0a0b";
    g.fillRect(0, 0, w, h);
    const s = Math.max(6, 14 * scale);
    for (let y = 0; y < h; y += s) {
      for (let x = 0; x < w; x += s) {
        const even = (x / s | 0) % 2 === (y / s | 0) % 2;
        const grad = even ? g.createLinearGradient(x, y, x + s, y) : g.createLinearGradient(x, y, x, y + s);
        grad.addColorStop(0, "#2a2d31");
        grad.addColorStop(0.5, "#101114");
        grad.addColorStop(1, "#24272b");
        g.fillStyle = grad;
        g.fillRect(x, y, s, s);
        g.strokeStyle = "rgba(255,255,255,0.07)";
        g.lineWidth = 1;
        g.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
      }
    }
    return c;
  }
  function brushedTexture(w, h) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    g.fillStyle = "#80858b";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < Math.round(h * 3); i++) {
      const y = Math.random() * h;
      g.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.07})`;
      g.lineWidth = Math.random() < 0.1 ? 2 : 1;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y + (Math.random() - 0.5) * 2);
      g.stroke();
    }
    return c;
  }
  function noiseTexture(w, h, alpha = 0.05) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    const img = g.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = alpha * 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  function holographicTexture(w, h) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    g.globalCompositeOperation = "source-over";
    const grad = g.createLinearGradient(0, 0, w, h);
    for (let i = 0; i <= 10; i++) {
      const hue = i / 10 * 360;
      grad.addColorStop(i / 10, `hsl(${hue} 90% 65%)`);
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "overlay";
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.12})`;
      const y = Math.random() * h;
      g.fillRect(0, y, w, 1 + Math.random() * 3);
    }
    return c;
  }
  function pearlTexture(w, h, baseHex) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, w * 0.4, h);
    const { h: hh } = hexToHsl(baseHex || "#ffffff");
    grad.addColorStop(0, `hsl(${(hh * 360 + 300) % 360} 60% 82%)`);
    grad.addColorStop(0.4, `hsl(${(hh * 360 + 180) % 360} 55% 80%)`);
    grad.addColorStop(0.7, `hsl(${(hh * 360 + 60) % 360} 60% 85%)`);
    grad.addColorStop(1, `hsl(${(hh * 360 + 280) % 360} 55% 78%)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    return c;
  }
  function chameleonTexture(w, h, hexA, hexB) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, w, h * 0.8);
    grad.addColorStop(0, hexA);
    grad.addColorStop(0.5, mixHex(hexA, hexB, 0.5));
    grad.addColorStop(1, hexB);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "overlay";
    const gl = g.createLinearGradient(0, 0, 0, h);
    gl.addColorStop(0, "rgba(255,255,255,0.5)");
    gl.addColorStop(0.45, "rgba(255,255,255,0)");
    gl.addColorStop(1, "rgba(255,255,255,0.35)");
    g.fillStyle = gl;
    g.fillRect(0, 0, w, h);
    return c;
  }
  function chromeTexture(w, h) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#f6f8fa");
    grad.addColorStop(0.35, "#9aa3ad");
    grad.addColorStop(0.5, "#5c646d");
    grad.addColorStop(0.55, "#dfe5ea");
    grad.addColorStop(0.8, "#8b939b");
    grad.addColorStop(1, "#e9edf0");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    return c;
  }
  function reflectiveTexture(w, h) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    g.fillStyle = "#cfd6dc";
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 10) {
      g.fillStyle = `rgba(255,255,255,${y % 20 === 0 ? 0.55 : 0.18})`;
      g.fillRect(0, y, w, 5);
    }
    return c;
  }
  function halftonePattern(w, h, color = "#000000", step = 9, alpha = 0.5) {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d");
    g.globalAlpha = alpha;
    g.fillStyle = color;
    for (let y = 0; y < h; y += step) {
      for (let x = y / step % 2 * step / 2; x < w; x += step) {
        g.beginPath();
        g.arc(x, y, step * 0.22, 0, Math.PI * 2);
        g.fill();
      }
    }
    return c;
  }
  function recolorPhoto(source, mask, opts) {
    const w = mask.width, h = mask.height;
    const out = makeCanvas(w, h);
    const g = out.getContext("2d", { willReadFrequently: true });
    g.drawImage(source, 0, 0, w, h);
    const frame = g.getImageData(0, 0, w, h);
    const d = frame.data;
    const mctx = mask.getContext("2d", { willReadFrequently: true });
    const md = mctx.getImageData(0, 0, w, h).data;
    const base = opts.base || "#0d0d0f";
    const accent = opts.accent || "#c8102e";
    const silver = opts.silver || "#c8ced6";
    const baseRgb = hexToRgb(base);
    const silverRgb = hexToRgb(silver);
    const accentRgb = hexToRgb(accent);
    const keepHighlights = opts.keepHighlights !== false;
    const accentAmount = opts.accentAmount ?? 0.18;
    const accentAngle = opts.accentAngle ?? 0.4;
    const silverStart = opts.silverStart ?? 0.62;
    const dx = Math.cos(accentAngle), dy = Math.sin(accentAngle);
    const projMax = Math.abs(w * dx) + Math.abs(h * dy);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (md[p * 4 + 3] < 128) continue;
      const r = d[i], gg = d[i + 1], b = d[i + 2];
      const L = (0.299 * r + 0.587 * gg + 0.114 * b) / 255;
      let nr = baseRgb.r + (L - 0.45) * 92;
      let ng = baseRgb.g + (L - 0.45) * 92;
      let nb = baseRgb.b + (L - 0.45) * 92;
      if (keepHighlights && L > silverStart) {
        const t = clamp((L - silverStart) / (1 - silverStart), 0, 1) * (opts.silverStrength ?? 0.9);
        nr = nr + (silverRgb.r - nr) * t;
        ng = ng + (silverRgb.g - ng) * t;
        nb = nb + (silverRgb.b - nb) * t;
      }
      const x = i / 4 % w, y = i / 4 / w | 0;
      const proj = (x * dx + y * dy) / projMax;
      const wave = Math.sin(proj * Math.PI * 2 * 2.2 + (opts.phase || 0));
      const sharp = Math.max(0, (Math.abs(wave) - (1 - accentAmount * 2)) / (accentAmount * 2 || 1));
      const bandT = Math.min(1, sharp) * (L > 0.28 ? 0.9 : 0.25);
      if (bandT > 0.02) {
        nr = nr + (accentRgb.r - nr) * bandT;
        ng = ng + (accentRgb.g - ng) * bandT;
        nb = nb + (accentRgb.b - nb) * bandT;
      }
      d[i] = clamp(nr, 0, 255);
      d[i + 1] = clamp(ng, 0, 255);
      d[i + 2] = clamp(nb, 0, 255);
    }
    g.putImageData(frame, 0, 0);
    return out;
  }
  function applyFinish(baseCanvas, mask, finishId, opts = {}) {
    const w = baseCanvas.width, h = baseCanvas.height;
    const out = makeCanvas(w, h);
    const g = out.getContext("2d");
    g.drawImage(baseCanvas, 0, 0);
    const texture = (() => {
      switch (finishId) {
        case "carbon":
          return carbonTexture(w, h, opts.scale || 1);
        case "brushed":
          return brushedTexture(w, h);
        case "holographic":
          return holographicTexture(w, h);
        case "pearl":
          return pearlTexture(w, h, opts.baseHex);
        case "chameleon":
          return chameleonTexture(w, h, opts.chamA || "#2a3b8f", opts.chamB || "#7a2f8f");
        case "chrome":
        case "mirror":
          return chromeTexture(w, h);
        case "reflective":
          return reflectiveTexture(w, h);
        case "textured":
          return noiseTexture(w, h, 0.16);
        default:
          return null;
      }
    })();
    if (texture) {
      g.save();
      g.globalCompositeOperation = finishId === "carbon" ? "overlay" : "soft-light";
      g.globalAlpha = finishId === "carbon" ? 0.85 : 0.6;
      g.drawImage(texture, 0, 0);
      g.restore();
    }
    g.save();
    g.globalCompositeOperation = "soft-light";
    const spec = g.createLinearGradient(0, 0, w * 0.8, h);
    const glossAmount = finishId === "matte" ? 0.1 : finishId === "satin" ? 0.3 : 0.65;
    spec.addColorStop(0, `rgba(255,255,255,${glossAmount * 0.9})`);
    spec.addColorStop(0.45, "rgba(255,255,255,0)");
    spec.addColorStop(0.7, `rgba(255,255,255,${glossAmount * 0.35})`);
    spec.addColorStop(1, "rgba(0,0,0,0.35)");
    g.fillStyle = spec;
    g.fillRect(0, 0, w, h);
    g.restore();
    if (finishId === "matte") {
      g.save();
      g.globalCompositeOperation = "source-atop";
      g.fillStyle = "rgba(120,124,130,0.16)";
      g.fillRect(0, 0, w, h);
      g.restore();
    }
    const final = makeCanvas(w, h);
    const fg = final.getContext("2d");
    fg.drawImage(mask, 0, 0);
    fg.globalCompositeOperation = "source-in";
    fg.drawImage(out, 0, 0);
    return final;
  }
  function drawGraphics(ctx, w, h, opts) {
    const { level = "moderado", accent = "#c8102e", secondary = "#f2f4f6", base = "#0d0d0f" } = opts;
    const intensity = { discreto: 1, moderado: 2, agressivo: 3, extremo: 4 }[level] || 2;
    ctx.save();
    if (intensity >= 1) {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = Math.max(2, w * 4e-3);
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.lineTo(w, h * 0.42);
      ctx.stroke();
    }
    if (intensity >= 2) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w, h * 0.48);
      ctx.lineTo(w, h * 0.55);
      ctx.lineTo(0, h * 0.85);
      ctx.closePath();
      ctx.fill();
    }
    if (intensity >= 3) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(w * 0.05, h);
      ctx.lineTo(w * 0.55, 0);
      ctx.lineTo(w * 0.68, 0);
      ctx.lineTo(w * 0.18, h);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.drawImage(halftonePattern(w, h, accent, 10, 0.5), 0, 0);
    }
    if (intensity >= 4) {
      ctx.globalAlpha = 0.75;
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, h * 0.18, w, h * 0.12);
    }
    ctx.restore();
  }
  function renderWrap(source, option, opts = {}) {
    const maxSide = opts.maxSide || 1280;
    const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;
    const k = Math.min(1, maxSide / Math.max(sw, sh));
    const w = Math.round(sw * k), h = Math.round(sh * k);
    const bg = makeCanvas(w, h);
    bg.getContext("2d").drawImage(source, 0, 0, w, h);
    const mask = opts.mask || silhouetteMask(bg, w, h, opts.tolerance ?? 36);
    const base = recolorPhoto(bg, mask, {
      base: option.colors.base,
      accent: option.colors.accent,
      silver: option.colors.silver || "#c8ced6",
      accentAmount: option.accentAmount ?? 0.16,
      accentAngle: option.accentAngle ?? 0.4,
      silverStrength: option.silverStrength ?? 0.85,
      phase: (option.accentAngle ?? 0.4) * 3
    });
    const wrapped = applyFinish(base, mask, option.finish, {
      baseHex: option.colors.base,
      chamA: option.colors.base,
      chamB: option.colors.accent
    });
    const gfx = makeCanvas(w, h);
    const gg = gfx.getContext("2d");
    gg.drawImage(mask, 0, 0);
    gg.globalCompositeOperation = "source-in";
    gg.save();
    drawGraphics(gg, w, h, {
      level: option.level,
      accent: option.colors.accent,
      secondary: option.colors.secondary || "#ffffff",
      base: option.colors.base
    });
    gg.restore();
    const out = makeCanvas(w, h);
    const g = out.getContext("2d");
    g.drawImage(bg, 0, 0);
    g.drawImage(wrapped, 0, 0);
    g.globalAlpha = option.gfxAlpha ?? 0.85;
    g.drawImage(gfx, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = "soft-light";
    g.fillStyle = "rgba(255,255,255,0.06)";
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "source-over";
    return out;
  }
  function removeBackground(source, { tolerance = 38, feather = 1.5, target = null, maxSide = 1400 } = {}) {
    const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;
    const k = Math.min(1, maxSide / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k));
    const work = makeCanvas(w, h);
    const wctx = work.getContext("2d", { willReadFrequently: true });
    wctx.drawImage(source, 0, 0, w, h);
    const img = wctx.getImageData(0, 0, w, h);
    const d = img.data;
    const ref = target || (() => {
      const pts = [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2], [w / 2 | 0, 1], [w / 2 | 0, h - 2]];
      const acc = [0, 0, 0];
      for (const [x, y] of pts) {
        const i = (y * w + x) * 4;
        acc[0] += d[i];
        acc[1] += d[i + 1];
        acc[2] += d[i + 2];
      }
      return [acc[0] / pts.length, acc[1] / pts.length, acc[2] / pts.length];
    })();
    const dist = (i) => Math.sqrt((d[i] - ref[0]) ** 2 + (d[i + 1] - ref[1]) ** 2 + (d[i + 2] - ref[2]) ** 2);
    const alpha = new Float32Array(w * h);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const dd = dist(i);
      alpha[p] = clamp((dd - tolerance * 0.55) / (tolerance * 1.2), 0, 1);
    }
    const keep = new Uint8Array(w * h).fill(1);
    const stack = [];
    const push = (p) => {
      if (alpha[p] < 0.5 && keep[p]) {
        keep[p] = 0;
        stack.push(p);
      }
    };
    for (let x = 0; x < w; x++) {
      push(x);
      push((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      push(y * w);
      push(y * w + w - 1);
    }
    while (stack.length) {
      const p = stack.pop();
      const x = p % w, y = p / w | 0;
      if (x > 0) push(p - 1);
      if (x < w - 1) push(p + 1);
      if (y > 0) push(p - w);
      if (y < h - 1) push(p + w);
    }
    const out = wctx.createImageData(w, h);
    for (let p = 0, i = 0; p < w * h; p++, i += 4) {
      out.data[i] = d[i];
      out.data[i + 1] = d[i + 1];
      out.data[i + 2] = d[i + 2];
      out.data[i + 3] = Math.round(255 * (keep[p] ? Math.max(alpha[p], 0.9) : alpha[p] * 0.12));
    }
    const res = makeCanvas(w, h);
    res.getContext("2d").putImageData(out, 0, 0);
    if (feather > 0) {
      const blurred = makeCanvas(w, h);
      const bg2 = blurred.getContext("2d");
      bg2.filter = `blur(${feather}px)`;
      bg2.drawImage(res, 0, 0);
      const final = makeCanvas(w, h);
      const fg = final.getContext("2d");
      fg.drawImage(blurred, 0, 0);
      fg.globalCompositeOperation = "destination-in";
      fg.filter = `blur(${feather * 0.6}px)`;
      fg.drawImage(res, 0, 0);
      return final;
    }
    return res;
  }

  // js/fx-client.js
  var import_meta = {};
  var worker = null;
  var failed = false;
  var nid = 1;
  var pending = /* @__PURE__ */ new Map();
  function getWorker() {
    if (failed) return null;
    if (worker) return worker;
    try {
      worker = new Worker(new URL("./fx-worker.js", import_meta.url), { type: "module" });
      worker.onmessage = (e) => {
        const { id, result, error } = e.data || {};
        const cb = pending.get(id);
        if (!cb) return;
        pending.delete(id);
        cb(error ? new Error(error) : null, result);
      };
      worker.onerror = () => {
        failed = true;
        try {
          worker?.terminate();
        } catch {
        }
        worker = null;
        for (const [, cb] of pending) cb(new Error("worker indispon\xEDvel"));
        pending.clear();
      };
    } catch {
      failed = true;
      worker = null;
    }
    return worker;
  }
  function runFX(fn, payload, transfer, fallback) {
    return new Promise((resolve) => {
      const w = getWorker();
      if (!w) {
        resolve(fallback());
        return;
      }
      const id = nid++;
      const timer = setTimeout(() => {
        if (pending.delete(id)) resolve(fallback());
      }, 15e3);
      pending.set(id, (err, result) => {
        clearTimeout(timer);
        resolve(err ? fallback() : result);
      });
      try {
        w.postMessage({ id, fn, payload }, transfer || []);
      } catch {
        clearTimeout(timer);
        pending.delete(id);
        resolve(fallback());
      }
    });
  }
  function toWorkCanvas(imgOrCanvas, maxSide) {
    if (imgOrCanvas.getContext) {
      const w2 = imgOrCanvas.width, h2 = imgOrCanvas.height;
      if (Math.max(w2, h2) <= maxSide) return imgOrCanvas;
      const k2 = maxSide / Math.max(w2, h2);
      const c2 = makeCanvas(w2 * k2, h2 * k2);
      c2.getContext("2d").drawImage(imgOrCanvas, 0, 0, c2.width, c2.height);
      return c2;
    }
    const w = imgOrCanvas.naturalWidth || imgOrCanvas.width, h = imgOrCanvas.naturalHeight || imgOrCanvas.height;
    const k = Math.min(1, maxSide / Math.max(w, h));
    const c = makeCanvas(w * k, h * k);
    c.getContext("2d").drawImage(imgOrCanvas, 0, 0, c.width, c.height);
    return c;
  }
  function analyzeImageAsync(imgOrCanvas) {
    const c = toWorkCanvas(imgOrCanvas, 360);
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const img = ctx.getImageData(0, 0, c.width, c.height);
    return runFX(
      "analyze",
      { buf: img.data.buffer, w: c.width, h: c.height },
      [img.data.buffer],
      () => analyzeImage(imgOrCanvas)
    );
  }
  function removeBackgroundAsync(source, opts = {}) {
    const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;
    const maxSide = opts.maxSide || 1400;
    const k = Math.min(1, maxSide / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k));
    const work = makeCanvas(w, h);
    work.getContext("2d").drawImage(source, 0, 0, w, h);
    const img = work.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, w, h);
    return runFX(
      "removeBg",
      { buf: img.data.buffer, w, h, opts: { tolerance: opts.tolerance ?? 38, feather: opts.feather ?? 1.5, target: opts.target } },
      [img.data.buffer],
      () => removeBackground(source, opts)
    ).then((res) => {
      if (res instanceof Element || res && res.getContext) return res;
      const c = makeCanvas(res.w, res.h);
      c.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(res.buf), res.w, res.h), 0, 0);
      return c;
    });
  }

  // js/fonts-data.js
  var CORE_FAMILIES = ["Anton", "Bebas Neue", "Pirata One", "Racing Sans One", "Montserrat"];
  var CORE_CSS = "@font-face{font-family:'Anton';font-style:normal;font-weight:400;font-display:block;src:url(data:font/woff2;base64,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) format('woff2');}\n@font-face{font-family:'Bebas Neue';font-style:normal;font-weight:400;font-display:block;src:url(data:font/woff2;base64,d09GMgABAAAAACLgABEAAAAAU6gAACJ9AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoFaG5N0HIEEBmAAhFgIgQIJnBURCArNLMVaC4MoAAE2AiQDhkYEIAWEBAeNcQyBSxsCTTXM83WD2wGC9H29yEiEHgc4j0gUwcYBsZedwf//OYHKGK7TpwMA1AeZ7axaL/EIekl5NjfB6CrxYrikSAlSSBBSyDa5UR/FG32ikocV6BuQWFEUpKLC+bzH+l6tKz1rd3+x8BbHS1rRPqk4NRQlQc57S33Qpzjq9ZwxCLYsR8lf1natJbQLPWbWM9zjoWKdcQZj9l8ucfJPzXPxue8YDY0kJs/Hy/37a8+5yScrs4OgSkAX1En9xerN8LTNf+846kh1gorcaLGxUYxeWdDGUBGj0F6Uq2rnUmFl7Osq+/9v/U/TmdndL+nOpXR0zwQlXW4NyXKTzyilIUepBAYG4+AQgJt5SZi/A915t1wr9C+LLvDUc7G/s36AZ3QQZ4EHKQTSSyLIfPS/MU1y9AuMQleoe9WySk9txgELO//Tlu45SVEBKfCUH97ZDZABdWQE/aDkW19Ru6jVVU9r5h9sY/8NmDu9oSUbkgEuZIedRpkkHMN9+1d9tP/VaV9gDEmWo7BrDDngkgukAtDEy3xv720L77cud0xnXMdfp3hNqSlETOe3mcPBzyWK09wAvOCPQHTZ27mmytIp0URkyXIefMt2ylQm5/+rvV3G2r/T/ZGYu1b7btaSNYZYogxTomTheSQWbkPvp6kDJa+Un6A2ZWprd3W6scg2IWUNRSMbupirYrV7e77du7NeyX8KH6TPsj3oJMPLJil+jpmQUhVD91B+RUVTUtNS9hR1zdAC//8//WbPfudl/TeJmkKxX0iEY2FVeKEll1KKalX1uEGPAuHwLDzj0HThLDzUL6c+3ixVgsIpVuK+89CTTZWlKnXyjEOqmNvTZ2ey16GkwQYRERseeff+7lJeFZkKAfeevKytKpBgNtZRG4P/7p3/ByyAlQAsCEHQqROiWw/EWecgEDgiMoiKCqKhgRjYIBeuIC4eiI8P6k8EkpCCvPiBAgSAFBSgYOEgJSUoSgwoTgIoSRIoRQpogEGgIbJAWkZQNjOoQBGoWCmoXDvIzg466iioUyeCbj0IzjqHAALmp1QP2W6HNB3An4WNNsCEAvT/DERAlDUDBUU69fh6Gwj9xP/Vo4CfrbLaKmsBSGcldB59+ybj7VjDBkMqAIICjrMGgqMVHUU4BR8+JHBunEH/mRn0G8eBsblwjHCEurcLxsQoTurckzw97KJLULNKyqoWpq1+WcxlKk2lVWrFV/ZRClWA5BLZp5anOGILezoo/C8/8zlv8zwPcztXcz696Ywjh/6c05od2QTXwGXKgmdpdLPMyhSaWzIyjbExXFbm+aZYkhcDlSyeUhj8jw1Gt01eDj2Jb9VYZH3ujspnGYm3TTCgI3GAGaQ6q9fbVy3z6XCtNtw7+oYFzFs/tOpkHrrdcayDmH3ySu+IIea16+WoOBNGn8cereDg9YW0+oyCyVMBeuk2xuo6KIa2p8tW5070uI71oEocbuh4Vd3GVLrLV6OLPtlzMnuH7bOgx4CIUSfMlwUDEwyGmmiq6Xayszl2M+7+FlhqmX3s7wACfyxNsAxZQmnpRDAwirxEWOUEUgg2tx4MTF7baKvxtms35XLRwdLTxo4SB+SZDKGgzk3xBWWSRMDSNQZxdkg8EV87BAVh0mIOOoQfFHCJUAgyYBoUhgWDmSvp1v7QbSCkF85XaWEKUEXCUQmXPRXdSiB+GEiq2EA1aiC22AG1zwFEBx1CAs0HQUjaoED9XCYuaIBpiP1f/9uXFfgcgipO6D9Ad/C7dQZBevoBHdcHch33sDvIfqShnlPwlzx0EJ+AqRnEa3VegYCGkZXSZHcm0P4LdBvQH3obYP5Blu/IQRR4T7yhe32kU0MWcLo7+mc6ofBxIP3vgkf179DlPjxam594R9LduU8rhz73fbgmcahvBlW19fv+2MzVtjil+HqnAQrvZFr14lUTE9zTCLe7odyFMzxPIPMtsBDRFTVpwsLvpHGQI1DdHS/W5GpPo5lmM5l7Kdcy+SwPwi2tw5pBWCoI6wQ23YQg3LqNmmiSyVA+rkTN9aU6jVgda/zqMivvr7MZmvfniXZqRUq9yfcpDmtfZrNvdIZGjJlg1ESTTTbFVFONGTMN+qtZGNTUSHuZaZbZdgrnjS4R1FYB+T1Ek2Eww41GMAaBbhrEqCHfnYViNoMaeFADuIRZxedpVluLHoYZZppltp3C+TL2LAqYL2y+hDY6wda/QVREJGQhwmlVqWZDQezrSJ+Q71LboQpUjzaMNfa3uLQ9SdfD9MCAcVnQrwqxULQsbpsSSsctvnEr2MZ2doz7vGMb2M+B8aD/yCHUKQVrP9BjwLgsgCnEQhHFlKi0R8EqWAWrYBWsAiuwAiuwAtsNA8/1+k+/HYnymgCB6GH1tfueaQLgds9MFwD2SyOC2gV+CtaHOu3MoirQ74P0hwLgkRCChASakPLKMaEyGWyyHYRKp7fBNoRMzDxEoG4pE2BXfbBzhKzZBNQCJBKCIEQEAmAexcu63U2TDuIxVmwRJk1dBWC8HfMKANwLUB+WA7ACAqAAsCVFhShBK/mcrcQjvt8LEVg3CqozNgvyP1IUIUf9U311b0ACSqDgDi/hMzwBN+KFeCU+GV+DfwEE7YLjQpf//x90DoAbUXfLv+VWAgijqfAiXtSNxw14AV6Bt8Dh80P6n37C40IIvX9Dpg6n/L/5/v3/36//dv/b928HHrJz3wDmPDGH8GDqwS4QAJtY4SaQtajoi2Q1yttf348BVDCYoQDZ7N8+S9NVI6pCZsNQh6UBWyOmei6a9NPMwyhcw7kbiWc0NyMIjNPfWCLjCbWQmkhiAj/T+JhCbhJfU3nzMlmAGRQnNgxmoU//6hBijjDzhJsvykLRllBZbJEYSyVYIc4y8ZYbYLVB1hpojSHWybBRug3SrKe3jc5WWluYtcq1W7adhtorxy559ijUpthBJcodVqldhSOoaiRZKdMmBtvR1HI1DN8YSgukWCXLZkY7FDmgwD4W+5U6pNCWffwaOQXkb6ALDHc2AGtlHLnF2t3fLeXUB6JbagXiHjej+ngm90H7A7s85o8JXu/cE0Yg3Pu+AmvXUL5do37/y3PhiP3XMEa6fyH2eGOKKR8jOTbWEp4Ju9JrAclucBUR6Oe4IoZYILyFBGjOyPb9wnUpiBBcxttdl5P5XWLun4JFI2Y3NqQ3py2em2NwDH6e2jcGzW15p7PzFJxJXCuKiKxOCFf+RFtZsGJATSRYpQdUBZICn6xBA/7bkNZfbb+U2B/1qTdvSVx3f/uU2aQn5dWNxtTu4XJH9fKrIqNIbNgfaSeKWTKecYB/cRgjfUUO2CwY3KfhdoclB7kRVDObIHYWOSLceMLpnllZMaPFS/TO4zWTEeUKrzV5V22iEgWlngB9GSkpTitqQB+kHhvQ4LanYY6mOWOtEmVFPewIQMSyMXEAYbc14wZuGKS5RqiNrevJE8n//9GJnC0mpHXHh20Td9WLWgXVvQdu4kNNWlNFA7RYtoDTDcx4y5yAcNhF4smYaGrQGK9BC7A6vszRNZX3lQEEVSrUG3rb9dlorS3Z7bsPtoBAIbOgtKK0AAqx10bqAf0UdTRB90ArMQ/SP6IKnEHiQa2nqktKYtyMyxByYlDGjr1kZ6UNIW3bWyNWP9iKFWQ81/jZexUZiBJghauCnEzMnJJ1whuV5Q1wJJDgbBDXVD5S1MkZkF6VIieQDTpY2/eZznr6iqUfOTWAaL7j1/aObmNXQVzcRQane6A4pB5Rd+ShrsWwu1w5QZZCtCsg8YPnMCaSuktfUB9hYyt5uUszdAA73+TSWlnhcEGD08yStHxSudkMMEqPiITNFpVyfnJVFBlu+56OOfRZNseSkaYDXWOTgahf1fc7wIu7hXMuIkGXgWYHsruS8nt59FIrSmSoljSWagmpnrAaiaiZqFpJUzvp6iRDXjI1k6zrKSQh21LPtX0vqIk+x0+/bB6BFjL/7j1edPPfF/FRcB+ODz7ni3qY+UmAT4gSocQoCUoXpYfSRxmgDNE7E2C2gjXlbg6sJ7rCq90cR1FyUsQNMoSUWJfMuOIsgCHSG5U4KQt9/pTcRAHMSYdoLi+1ElwdZ8dZKzt9/0m9VefDVABtswXguweNFlGgzjTdIaKwKefwJkGeA+A1L5N5oVR9niM5MIuhHwZhd/4BVVxC/XC24jJLhIijXOoKMhb5GvUUJETjp/VK+hraKxbhj808nGquXS5o596H0bwKgmTtclN/EriRi8KvsMDyJE0MmE3LfRlrPtRyW1I3xxUEX2eZVHXrz6je8Q2J1TtNdXNvlU2kiNOQQZgHRWIv8PwnrVMroQyNUGNsNoViZiQe5r6svIEoKG2kyiBOGqHNAbFjoq23AZgLYhLgISkBzeM7KzhIWo2xOCOEzq1pOltqxfWYMJh+rSJDZic9RRte2nTKoMfKcTYrNmmIU1LEkWF352vMijXykcM+nQLduosdrXzMSMnMWfU0a9xKv2LrTrJAL+gYpJ9jIqc6piCoo4neG67Rb5td9ZjVOmfFLUOlt2+9a7Y7vyMjb84p3gVXQ3H8HrgWyd9xrfVhWmYxUWfNrAj2vSDrVKsZMCKLmxQCfFUk2wK1TOoxHyDbC+76dl7af4lhNWPf8HI24axMGls3fqv2gsPGsFpGhx2JaPdbIdSr8lDAY606/j0tTHTlrm3Lx9flpPUpMiDWzSWInIErGJyvC2RfUGOQoh41zwUK281zznSJFjrUwVQGm0TbFmKXaL+KOuSQCLcQx+TpE85QsNs4my4dxNV0W0Mh7qZHB/G06aWb/fSuG31aiG+i3yrqCJKIthByEop97FmtW2kdhG5hoIowTVYHYdtjBxldiQy38xSZJXuwkx/8YQN3JHAcA1qFDThqQPEFdEsnyTdpviNDA5vyYwBU0YDKBlRdQAsaS50XTV60edEdhPoGNDQwOnMSFnFMznFMyXFMzXFMOwhNb6BmNPDOTL822r3u77eSeE8oQkg5SCzkCbOzE31bKcWvEiT34Vftf/cHEOz/DQOYAZCnAXsDk/2AaSfXuq1Mfnyw4POIXlaqT5M+xSgOPNiqeB+fImjvA5nXh8Z9CHmC42XVms2b+Wf9W6J33v6/FXJlgBsaMUkCkswshtzpnqRiR6koz7O9UxHzLGJMJh0v4uV+HuXwSZFIKJNddq9inEiiY7yi/OZBYS+cxWwME3dVl4VFMkpARjX7Rukenpy/CMoctmD2ZjnosIPIMzPl04bOb4DtN7/xEMw091lg5jNcsOmNzXgfjj8QgCkD2+QsSUcyAIb27KGHFQzlSEieBcBV/1CvG9udbKzycWraU4Qs8k4BHkuavuPpBkcKNGEXMDrfQahkJIKAUM9mUOxph9/+A2aH0tnPVL8zmGGMvmsZFa6gdaFxLIWjTwx2VGBvNjoDfPCNaLIYcc7k2daB7c6OJz0+Bu113jLY0PJeKpLMOivOF9iyAxIPtpIGW+1P8SSFVto6bSad7LjgigERa2wR0A2dL+0msk07mVYMczxCxGqoQzRyjb7QnfKOr1OtS5Tf7H8P1BQZOJ1z1/gMPF8tqjDcFgQMq9miugwGdXi/Vq8eYOOKJLosn/hMUoadnUG6fvF9PSFle1qsvXb+de2W+ru6H3I72l5VPc2pLG5g6dRuKUI/onDe9M7WSiX26CxGUWgpTZJWUh5c+7qIen2InN7pen7Y9s/SRLERdXKvbHoa8k3ffMcNnx+xxhJzrJYpi80Ns5X42JxSzCq0vFakKRBa1t6c7T1AISMitlJme/2FUkfR0hXc+DSAtoHHrl61s2tULHYYh960qJ/EYFf9pnKuvC3Lo0NqV70TpTYzlgFwRD4CdPOPbOzAQb3kOarHRtGGoA71EpT0uzVZ4FZrIXb/ckhb7niER1t3UTTQ+CtgXAIt4N24U4eyrUc+Y+Te42Z0s+vizQzGoF2OPbKFs2SLi7sp5PspWHH8/GH2ZkezaPrFFzr6NJhOjJl0oP5VCxtjX1xnt7nMQMa4TCt59SLLRgKzfWNSY1lsVKAkdXG8P+AhSUIOkNdxVXnfFA4QMnzAorrt5dZj7UutS28cs/pNrxJNK//xYomo0xLk9i369AyNZ7goKRZR85qj1TqdZveyNUIo95Kt54e1x0bxj8liFKgs6EZMI1WTrRmuGd2ZmUzq4DJ1QkREwtT4PhpfWVbUv4JiuX2bRm3UW/T9djXbNhfxLkiqJBd4yq/dEDuqF6swKwTbwrbuTQ6lWXlb6R8hQm73s7SR9xJj26i8bwoZvj6pqw4/a7zcLrYe7JpjnRNkEzdStTn6Wr02JyvrSI0uS0qJjEwZl4wSkqdHWNc+Ayhltc3a+M18m8OmalbZhDuBPB11oDxHXmgrbH6b5Yuzmy3N4QnkHshlmV6z4md4HS4GbdwnKcn6pZ/wY+hu4xgytGrv3Ea9ZspsE8Ckjoa8CF/TA5tAqzEdtIrdm8auBRWPDYnzi6zidbLhsk22gOaxw+ertfnJ7atTviJXW+0oc0YynfLeW8S5QCi3z6jYgGy0OOom/qf+eZe2J+V/4XJu406Rupa7CM3imFExE5llOaYbrB0U0kzV5+pqdfpctboloixKGfs94Jcqv9xGaWTvDKNHUNs9U1vjXi20OS31C/vqpjWjkXL7hgRaUjYUyretb+Htlmglu3mhN3w8fGOp/JnJt3qAJzJKMCh2FB5aV5sV49WieCaT+dkWzxVCebhsPT+4N7iUqs7Ry8sUyZGeJ6R+XonmJFVYQYxWm5OVmZWj55dJJK28iCSZPMGcrAopTDToctXzh2an5iaRcJHUXcoNDXAXYIMpWB+V2cFg8lyIimRianam5FX+L+X2DEuaw+AxJdOlAM/Km+DQJ8MbOvBgo8kWNtbYYNVZG0w23ltje5o1TWVTEd7eOwSBF7ysCUf2NzF72oeX3Co5Nlxygce7IMErOEX2DYVVdk5qpHH0VH7Jzsg3cAiSkaPhWoGCaa9QuCMh7sOfCsLE56fapwfdQGxjxQuEs70nzW8aDJBdQCVW5GPjOxee+dZJlJaXDZ8lid4mt1SrvFNuTU2NTY16+vBmFLiPZIULk+ORdbLBkZyE8Mx0Y2xWVFZsyRkhlLvJ1vOFO3y4/GMyDwUq4x+w8JT6PN/ZklZ9q2S2b57epNf56lV6VUxAcpJYdEs5OXbxhpb8lg5rBxqg1hEboA4Zkiw/qD0mVb8YgKf8lQ2Qjaa4bjg4zdr/h3Sl4LEVg5IbT1LWm8/EKa6cn97RakztU1GRH2jzTyc/UVtKLMuL33dAShCrrSVWAUVsHp5SrxWAjRpW1Cd0mWtK69Nv1z9tUIrp5SUluf71/ipCkrlM7UuUybRCSpGZyHwaZcKI50fdEqImcd0WRSVwzyvV0gciqVQkk8llrzqz2c5M5i9TUvaTfY54Om9/OYlMoTstynx7vkpySOLzjOcC6hRJXp5mr1c6EEEBw2l9AK+JcyjLnghgyy7H0dseJ3Nf7o2ucurout6Lc+vg1IVzd3rewdzWl7viXHnC4cKH6dlxW297Xnd1eUrc4TLZl78TvCmnj3ra7No852z5j7S6Aqe7dReE155TZOdY/RP04Ge/j1hyEUZFhu96RPbMOC+2Pa23PaW7znkkVg+GyUF3qX/lwjcf/UNdqVOdqcGjHjvMm3LxU4feI/L56KJp+xzK56NraMpumXbUE6aeZ3hG4qz8tifc3Js7o3tgzdQBuTO6lbU92nOfrrdC/LwjfSCjomFgYmFz0Y8rLjfuPPDw9ScgJCIhJefFhy8//gIoBAoWIlSYcMouar2SExu/RJ6r5iqixYgTL0GSFAMMNMgQadJlyJRFS0fPwChbjlx5VB/KrEAhiyLFSpWrUMlelxNx91tHX5wanftv+oGPP3v2+sh71+7MvODH1y6cc+1fbtV5CCwI5PphhjkRBtR6NvS2v3yoifo9JXlAVfvZ+bwiBuSGckhtuH+mlENIZLvJjIX9nvJhJkjy1SnQPn7pmDX2bzaWo18DZo+1edDW72xm2PqayU/Dgu1XxVKcZCGdp5k1sklbTNP/mAOvoUJ8cAJeQ69ZT5iF7dqJuH2eEUSgY8TLxMvgaMiB5hwaJPnrFBEhHR7F6O1wQTnoBJMKrIZSOFuinkh9HswWLKCWkyzapSagNszVcKkBXTq9PzqpzgWCrav/JuXIR4NWQ+orPCcQU18EyYtMOTcyFsKp1e2OQ9yeIJcUlB+iIda5o/IEUf2fdkaukPwVDflSq5l/zgjlvAnV7Sh3oLq/lCN/hWF1Lu3LqHplar7ODR3Lm73ZdZUPGrbAL7CT+p7cbW5X7naKPGUmlgAZ1FSMtLO3VGOFxr1toQyXt3/AUc60OJuq/ooOljWH6LoHbCaC3EK5H8VAMTAacKbbXKqWjihFIqGyk8GU2T2A4K2IzXN9l7SFcyktr+VxzgM3CSxbTNVmRiJLguWyppcjeZ4aJCrAZgL3qFoRW1o+HJhggqO9Z7YtpWq1Y4hlQwhX9JkJSDa4s2L3J+JYHB4FrbgdN2q86TRHvmkz6ekPa39WMcrFd9zk9khCDbhOYBZXjYielsstgfe5t+SgLKocMDIcolAkhs2nKjLtTEp6L9bPMWa3Cq3E12wmVQs1lchMbLhb1THbPIcsQwXYyjD47SRXxKCCgVGeWDab590IQs8WOBWW4lWs24JtIwMPAGasa2UIj9tenmfV7MzvmmRVw2yLZMDEJLtJLIjEu/O+Qu8W1dWCaTYfVZhYgsU8cHiD7VLdSqmnwy4IEPkzoAFWmk2MM+GmSwEPs4CeyBxVsz3D5/2f75Oi40I30OhC7KrppFTHUkQJKz4WF21ZY84ROqRxnJzqXiJ8LLQNj1sSjgN0tL/C6ybIrhsJkjKQ4WQAdJVUvwcyFxyPqOjVdXoLucAyeEFpY+PgMCqwQloT0iWKaM6MZPxqPgeneXYgTYRHDSZ76xRuea/RHjexwUvfFjpucJJP4G1Mhm10Iyg8ciF01K1OMhdTEVQrywVRzhc7jCNYUb9LcAXgy/b1Rl6PXINMk9RtmHWF7KG8O4HqdLmbwOFSNitg+uXI3wUWFyR26nZyg1n5Fviqh5ck1sh6IXKTz/L5OkjsW3evpoEy9rnXK3Fhlds54RQ7pQ5PfD2uJ09byl828xyqHRXhJ5YOaff74d2Ob9hcevqjsD+riHO4vQMSb7irJm2fAzlroAwsOsRj4uAj8d0SeJ+jJdqywMTtbE9i2DCq/bcgEkulF89ZEUV+dqQi0pNHdOEdE2XvJLiS9wkU7xRFVg+ebctkOKMtSenH0RI4vrblsUzwlvT5bUVEH7IlfAlN/C8Xw1C6LRgLezSvfC7SMZlkrhIa2U1tRYRZ12muzkMS9JaN2vVIgNUIlmcVqd6TRhVhnDvrdQ9FpMp8UgEjvFENwye8rklBbTaFEEW3i+qPwaCO4PmILrwhe2ixpsHkGfu4CXhLen+bZe0jtoSUE3Sazs3zgzvxO5wXgEfnl2S7qpj1VoPEhvoYCW3cnD3ekqBv92BzaJ3CJQuv1F5M6iwtT8JN+v9RvMyACC0UiUiLtfOg2wmarYNtVUDK0KtkfVtbTRA0qZQi+qaieTpu4HwVL2WyCVTpLLDhSf2psMzPatalOqaHnQ4G2Rns76eYExnRNNyzqpd5tvf3G0eL8+N8kqeDaBSPwsCf8TrrQzEzJy/9GuZ8rciL36qgya1pKCMhNmA5zgBWy5EflB9hoxKiYGDH+P6aiXQiiEaEKtLm+7l++Sus5PKUQp/K2eaSPjmp1cIL3kczXiQJ1Am0w3ILoGPmYkvIzLGPuwvMzcb+SI+z6U/cvP5SgrPHoSoJ0FsEeIZEBcReuVUJ+j0cXv46q1L0J/BEaFA1I/HhbCSB1Bjcm0LlYG8V5rAKk7dse78Ubkym6yKXq6sKcrkxr9P7yh0mevyyGgOLSPwSyU/RAJIWdInwa+BPeQBWnf5obp4WmxFJvEmYXiWV1yC9xi8cXlTxI2KksdDRNOvjj/kj+rXrYmXdBePBZgLl6WLXYVBCZwPL/PJk/kNsA6++g16iiRcAJ1gfqZqog/MlDlNZHunuWS+udxEBCPh/uL+9VK7/VrF/AN9/jvwF4O/Xtv897eVxJA+QIAAAAcnfC7EdF5gOAojiUq+K88fCaU+93it3o59aybDTsoj3bY8jYkvaA2+F6S6ppGi67amEbBODh2B0O2HxPrj7NTDgO+hUdS1UwK6PW8O7LBM0XroKVh7wvr7ZeVvzCAXucRN4l7XwjjXiqEvndp6OO7SA9D7jD9a9MwP1VhVcsh6inIemoMOR+zCQ+KXYKQqHHLkc9wMMDpTEXHi8+URaeJw5IyQZZ3cR1bqn3jhnVqEBfSZfTQV6AuB5OFbvBjynjwScAbfCJjibXe5/945pNNxUEDBDGrICRAg5ndmAaw9XEBAA8ypBACdUALzqvXUB1M/tCxBMZy8gUFp0AUqi9gIiD4YLSERCGfOpDXCSxuqcWlECzQ2K1Cu3WaOUBGhgVfrtqVGvVKBMqdIkKmZRqEGGYk2K+dMoVqpJlUL1DIrVD1lVDRuBYAEUVfqHS8AyBOldP1SVZANppFNNzzRzT0xOUqPWiF15aQRkxboKQSIJ6BqwOI9VzVnq1agQtag/kKBJ87KISIdLHqne8BwqVe4MNLGQFXWw6mbIqmxNVq3MjUaoVcy02UX+Lu9f0d/ypqyivxow43/IiYmzRuyOHmAbRtv+rZnRrlf+vMz2Sk5vHzxvTj795MJVzZdUy09do988tLTz1ymAV6AZvkDY4xSigsQSXb2C9Q0Mmw8VYlSYsYlp4bKe9keQOfMWirAot2TZSkqr1qzbsGmrKAqLwxdtLztcjIOeG5uYmplb9B/Aycoa+Nva2TvAjv1idHZxdXP38PTy9vH1Q1AyhdoTGp3BZLE5XB5fIBSJJT3rr+EyuUKpUmu0CIrhBEnRDMvx/f7FXkmOKpQqtUar0xuMJrPFarMX+nrQbax4xs6B/d7pT8RaHO5jJ9YZjj0txIocvjdRZE/tw0r8xp/TKf/bwq0VT443hL83KQLhx2UnRuDnlymUEGWjkYAaKpHNT6I2USRXNPdAYy14qK1GVI8x+4yqyZdvPaGtLqYzTO0Xp9Yp0mc1nNaY9ExwM3MsPEOYWEcHa2osyOFA88lYQR1Xj5jXJtoD1moNu1ZVZXA96ttW/l5aGzFjvQ5WfsbANb8cO5GOO6cp7Hul92aGVW4BPudm6/WMw3fvEQcxflceMcMJbF1prOPQWLGnxj9WygscIB9OhjicJpYnMqW/ZAC5TlZu/h0uXlz6vLhue1DXCtA+eRA/1g+iHdH6uaXRz+EnEEodLtDCsVIHKtLS9LZfUm5hh2JRHVQvtENNoemkIVETNCnCo7YgvYBCcRrfQEX/v0bhADO/juYI1sOspuMEtqIx/sYqFDbOMWkZlVXiG7U6pR3RKds5PuCX8o8PBGUH4grKCCuqVCiaWMcXotKRGImREFkja+KYFCXWxDGzZta8KCcmHcvJLTqu1RRev4jJvmp0RK8TjG9v7PIz/yoYLo+kg9L4ipo1/fn+3yFdkdiie3J3L0OKNjdbVJcQDPmB3n38PgjnHNwKv9S06tc+QN7mLQDWO1Hg07XWrTCVD/Fic00o1nONOEXIN3qGjdG2+YgFGKiIV0HRGmD5QPwTQZt8AQRgu48ETtvb1Bo/zbQDVos8fIQCSALY7sHb57WP66C0gJN4ZZEOgB92MB6LUZikkRtQps8z/H/yq+js1xBX4pdonQ6SLwAA) format('woff2');}\n@font-face{font-family:'Montserrat';font-style:normal;font-weight:400;font-display:block;src:url(data:font/woff2;base64,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) format('woff2');}\n@font-face{font-family:'Montserrat';font-style:normal;font-weight:700;font-display:block;src:url(data:font/woff2;base64,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) format('woff2');}\n@font-face{font-family:'Montserrat';font-style:normal;font-weight:900;font-display:block;src:url(data:font/woff2;base64,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) format('woff2');}\n@font-face{font-family:'Pirata One';font-style:normal;font-weight:400;font-display:block;src:url(data:font/woff2;base64,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) format('woff2');}\n@font-face{font-family:'Racing Sans One';font-style:normal;font-weight:400;font-display:block;src:url(data:font/woff2;base64,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) format('woff2');}\n";
  var FONT_FACES = [{ "family": "Anton", "weight": 400 }, { "family": "Archivo Black", "weight": 400 }, { "family": "Big Shoulders Display", "weight": 700 }, { "family": "Big Shoulders Display", "weight": 900 }, { "family": "Bebas Neue", "weight": 400 }, { "family": "Black Ops One", "weight": 400 }, { "family": "Bungee", "weight": 400 }, { "family": "Caveat", "weight": 600 }, { "family": "Chakra Petch", "weight": 600 }, { "family": "Chakra Petch", "weight": 700 }, { "family": "Cinzel", "weight": 700 }, { "family": "Dancing Script", "weight": 700 }, { "family": "Eater", "weight": 400 }, { "family": "Faster One", "weight": 400 }, { "family": "Great Vibes", "weight": 400 }, { "family": "Kaushan Script", "weight": 400 }, { "family": "Lobster", "weight": 400 }, { "family": "Marcellus", "weight": 400 }, { "family": "Monoton", "weight": 400 }, { "family": "Montserrat", "weight": 400 }, { "family": "Montserrat", "weight": 700 }, { "family": "Montserrat", "weight": 900 }, { "family": "Nabla", "weight": 400 }, { "family": "Nosifer", "weight": 400 }, { "family": "Orbitron", "weight": 700 }, { "family": "Oswald", "weight": 500 }, { "family": "Oswald", "weight": 700 }, { "family": "Pacifico", "weight": 400 }, { "family": "Pirata One", "weight": 400 }, { "family": "Playfair Display", "weight": 700 }, { "family": "Poppins", "weight": 400 }, { "family": "Poppins", "weight": 700 }, { "family": "Poppins", "weight": 900 }, { "family": "Press Start 2P", "weight": 400 }, { "family": "Racing Sans One", "weight": 400 }, { "family": "Righteous", "weight": 400 }, { "family": "Rubik Mono One", "weight": 400 }, { "family": "Saira Stencil One", "weight": 400 }, { "family": "Sora", "weight": 600 }, { "family": "Space Grotesk", "weight": 500 }, { "family": "Space Grotesk", "weight": 700 }, { "family": "Teko", "weight": 600 }, { "family": "Teko", "weight": 700 }, { "family": "Creepster", "weight": 400 }, { "family": "Frijole", "weight": 400 }, { "family": "Permanent Marker", "weight": 400 }, { "family": "Share Tech Mono", "weight": 400 }, { "family": "UnifrakturMaguntia", "weight": 400 }, { "family": "Wallpoet", "weight": 400 }];
  var FONT_CATEGORIES = [
    {
      "id": "esportiva",
      "label": "Esportiva",
      "fonts": [
        "Bebas Neue",
        "Anton",
        "Teko",
        "Oswald",
        "Saira Stencil One",
        "Black Ops One"
      ]
    },
    {
      "id": "graffiti",
      "label": "Graffiti",
      "fonts": [
        "Permanent Marker",
        "Bungee",
        "Rubik Mono One",
        "Monoton",
        "Creepster",
        "Nosifer"
      ]
    },
    {
      "id": "street",
      "label": "Street",
      "fonts": [
        "Bungee",
        "Faster One",
        "Righteous",
        "Press Start 2P",
        "Nabla",
        "Wallpoet"
      ]
    },
    {
      "id": "elegante",
      "label": "Elegante",
      "fonts": [
        "Playfair Display",
        "Cinzel",
        "Marcellus",
        "Great Vibes",
        "Monoton"
      ]
    },
    {
      "id": "minimalista",
      "label": "Minimalista",
      "fonts": [
        "Montserrat",
        "Poppins",
        "Sora",
        "Space Grotesk",
        "Chakra Petch",
        "Teko"
      ]
    },
    {
      "id": "retro",
      "label": "Retr\xF4",
      "fonts": [
        "Lobster",
        "Pacifico",
        "Righteous",
        "Monoton",
        "Faster One",
        "Press Start 2P"
      ]
    },
    {
      "id": "racing",
      "label": "Racing",
      "fonts": [
        "Racing Sans One",
        "Wallpoet",
        "Orbitron",
        "Chakra Petch",
        "Teko",
        "Big Shoulders Display"
      ]
    },
    {
      "id": "gothic",
      "label": "Gothic",
      "fonts": [
        "Pirata One",
        "UnifrakturMaguntia",
        "Eater",
        "Frijole",
        "Creepster",
        "Nosifer"
      ]
    },
    {
      "id": "manuscrita",
      "label": "Manuscrita",
      "fonts": [
        "Caveat",
        "Dancing Script",
        "Pacifico",
        "Kaushan Script",
        "Great Vibes",
        "Permanent Marker"
      ]
    },
    {
      "id": "industrial",
      "label": "Industrial",
      "fonts": [
        "Oswald",
        "Archivo Black",
        "Big Shoulders Display",
        "Share Tech Mono",
        "Saira Stencil One",
        "Chakra Petch"
      ]
    },
    {
      "id": "corporativa",
      "label": "Corporativa",
      "fonts": [
        "Montserrat",
        "Poppins",
        "Space Grotesk",
        "Playfair Display",
        "Marcellus",
        "Sora"
      ]
    }
  ];
  var ALL_FONTS = ["Anton", "Archivo Black", "Bebas Neue", "Big Shoulders Display", "Black Ops One", "Bungee", "Caveat", "Chakra Petch", "Cinzel", "Creepster", "Dancing Script", "Eater", "Faster One", "Frijole", "Great Vibes", "Kaushan Script", "Lobster", "Marcellus", "Monoton", "Montserrat", "Nabla", "Nosifer", "Orbitron", "Oswald", "Pacifico", "Permanent Marker", "Pirata One", "Playfair Display", "Poppins", "Press Start 2P", "Racing Sans One", "Righteous", "Rubik Mono One", "Saira Stencil One", "Share Tech Mono", "Sora", "Space Grotesk", "Teko", "UnifrakturMaguntia", "Wallpoet"];

  // js/fonts.js
  var installed = false;
  var extraPromise = null;
  var loaded = new Set(CORE_FAMILIES);
  async function installFonts() {
    if (installed) return;
    installed = true;
    const style = document.createElement("style");
    style.id = "embedded-fonts";
    style.textContent = CORE_CSS;
    document.head.appendChild(style);
    if (!document.fonts || !document.fonts.load) return;
    const jobs = FONT_FACES.filter((f) => CORE_FAMILIES.includes(f.family)).map((f) => document.fonts.load(`${f.weight} 40px "${f.family}"`, "AaBb77").catch(() => null));
    await Promise.all(jobs);
    try {
      await document.fonts.ready;
    } catch {
    }
  }
  function fontLoaded(family) {
    try {
      return document.fonts.check(`16px "${family}"`);
    } catch {
      return false;
    }
  }
  function idbGet() {
    return new Promise((resolve) => {
      try {
        const rq = indexedDB.open("adv-font-cache", 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore("kv");
        rq.onsuccess = () => {
          try {
            const g = rq.result.transaction("kv").get("extra-css");
            g.onsuccess = () => resolve(g.result || null);
            g.onerror = () => resolve(null);
          } catch {
            resolve(null);
          }
        };
        rq.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  function idbSet(css) {
    try {
      const rq = indexedDB.open("adv-font-cache", 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("kv");
      rq.onsuccess = () => {
        try {
          rq.result.transaction("kv", "readwrite").put(css, "extra-css");
        } catch {
        }
      };
    } catch {
    }
  }
  function loadExtraCss() {
    if (!extraPromise) {
      extraPromise = (async () => {
        let css = await idbGet();
        if (!css) {
          let r = await fetch("js/fonts-extra.css").catch(() => null);
          if (!r || !r.ok) r = await fetch("fonts-extra.css");
          if (!r.ok) throw new Error("HTTP " + r.status);
          css = await r.text();
          idbSet(css);
        }
        const st = document.createElement("style");
        st.id = "embedded-fonts-extra";
        st.textContent = css;
        document.head.appendChild(st);
        return true;
      })();
      extraPromise.catch(() => {
        extraPromise = null;
      });
    }
    return extraPromise;
  }
  async function ensureFontFamily(family) {
    if (!family || family === "system-emoji" || !ALL_FONTS.includes(family)) return true;
    if (loaded.has(family) && fontLoaded(family)) return true;
    if (CORE_FAMILIES.includes(family)) return fontLoaded(family) || true;
    try {
      await loadExtraCss();
      if (document.fonts && document.fonts.load) {
        const weights = FONT_FACES.filter((f) => f.family === family).map((f) => f.weight);
        await Promise.all((weights.length ? weights : [400]).map((w) => document.fonts.load(`${w} 40px "${family}"`, "AaBb77").catch(() => null)));
      }
      loaded.add(family);
      return true;
    } catch {
      return false;
    }
  }
  async function ensureLayerFonts(layers) {
    const fams = [...new Set((layers || []).filter((l) => l.type === "text" && l.font && l.font !== "system-emoji").map((l) => l.font))];
    if (!fams.length) return false;
    const res = await Promise.all(fams.map((f) => ensureFontFamily(f)));
    return res.some(Boolean);
  }

  // js/pdf.js
  var PT = 72 / 25.4;
  function buildPdf(jpegBytes, ptW, ptH, pxW, pxH) {
    const m = 10;
    const L = 24;
    const marks = [
      // cantos: pares de linhas (registro de corte)
      [0, ptH - m, L, ptH - m],
      [m, ptH, m, ptH - L],
      [ptW, ptH - m, ptW - L, ptH - m],
      [ptW - m, ptH, ptW - m, ptH - L],
      [0, m, L, m],
      [m, 0, m, L],
      [ptW, m, ptW - L, m],
      [ptW - m, 0, ptW - m, L]
    ].map(([x1, y1, x2, y2]) => `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`).join("\n");
    const content = `q
${ptW.toFixed(2)} 0 0 ${ptH.toFixed(2)} 0 0 cm
/Im1 Do
Q
0.45 G
0.6 w
${marks}
`;
    const contentBytes = new TextEncoder().encode(content);
    const objs = [];
    objs[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
    objs[2] = `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`;
    objs[3] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW.toFixed(2)} ${ptH.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> /ProcSet [/PDF /ImageC] >> >>`;
    objs[4] = `<< /Length ${contentBytes.length} >>
stream
${content}endstream`;
    const enc = new TextEncoder();
    const chunks = [];
    let offset = 0;
    const offsets = [0];
    const push = (str) => {
      const b = enc.encode(str);
      chunks.push(b);
      offset += b.length;
    };
    const pushB = (b) => {
      chunks.push(b);
      offset += b.length;
    };
    push("%PDF-1.4\n");
    for (let i = 1; i <= 4; i++) {
      offsets[i] = offset;
      push(`${i} 0 obj
${objs[i]}
endobj
`);
    }
    offsets[5] = offset;
    push(`5 0 obj
<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>
stream
`);
    pushB(jpegBytes);
    push(`
endstream
endobj
`);
    const xrefAt = offset;
    let xref = `xref
0 6
0000000000 65535 f 
`;
    for (let i = 1; i <= 5; i++) xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    xref += `trailer
<< /Size 6 /Root 1 0 R >>
startxref
${xrefAt}
%%EOF
`;
    push(xref);
    let total = 0;
    for (const c of chunks) total += c.length;
    const out = new Uint8Array(total);
    let at = 0;
    for (const c of chunks) {
      out.set(c, at);
      at += c.length;
    }
    return out;
  }
  async function exportPrintPDF(editor) {
    const doc = editor.doc;
    const mmW = doc.mm || doc.width * 25.4 / 96;
    const mmH = mmW * doc.height / doc.width;
    const dpi = 150;
    const pxW = Math.min(6e3, Math.round(mmW / 25.4 * dpi));
    const pxH = Math.min(6e3, Math.round(mmH / 25.4 * dpi));
    const c = makeCanvas(pxW, pxH);
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, pxW, pxH);
    g.scale(pxW / doc.width, pxH / doc.height);
    editor.drawDocument(g, true);
    const blob = await canvasToBlob(c, "image/jpeg", 0.92);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const pdf = buildPdf(bytes, mmW * PT, mmH * PT, pxW, pxH);
    const name = String($("#ed-name")?.value || "adesivo").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadBlob(new Blob([pdf], { type: "application/pdf" }), name + "-impressao.pdf");
  }

  // js/catalog.js
  var SHAPES = [
    { id: "rect", label: "Ret\xE2ngulo" },
    { id: "ellipse", label: "C\xEDrculo" },
    { id: "triangle", label: "Tri\xE2ngulo" },
    { id: "diamond", label: "Losango" },
    { id: "hexagon", label: "Hex\xE1gono" },
    { id: "star", label: "Estrela" },
    { id: "shield", label: "Escudo" },
    { id: "badge", label: "Selo" },
    { id: "banner", label: "Faixa" },
    { id: "splash", label: "Respingo" },
    { id: "arrow", label: "Seta" },
    { id: "lightning", label: "Raio" },
    { id: "flame", label: "Chama" },
    { id: "crown", label: "Coroa" },
    { id: "ring", label: "Anel" },
    { id: "line", label: "Linha" }
  ];
  var ICONS = [
    { id: "star", name: "Estrela", d: "M12 2l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.8 6.1 20.5l1.2-6.7L2.5 9.1l6.6-.9z" },
    { id: "heart", name: "Cora\xE7\xE3o", d: "M12 21s-7.5-4.7-9.3-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.3 12c-1.8 4.3-9.3 9-9.3 9z" },
    { id: "bolt", name: "Raio", d: "M13 2L4 14h6l-1 8 9-12h-6z" },
    { id: "flame", name: "Chama", d: "M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.3-2-.3-2 2 1.6 3.3 4 3.3 6.5A7 7 0 0 1 5 14c0-5 5-7 7-12z" },
    { id: "crown", name: "Coroa", d: "M3 18h18l-1.5-9-4 3.5L12 5 8.5 12.5 4.5 9z" },
    { id: "skull", name: "Caveira", d: "M12 2a8 8 0 0 0-8 8c0 2.5 1.2 4 2.5 5v3h11v-3c1.3-1 2.5-2.5 2.5-5a8 8 0 0 0-8-8zm-3 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" },
    { id: "shield", name: "Escudo", d: "M12 2l8 3v6c0 5-3.5 9.3-8 11-4.5-1.7-8-6-8-11V5z" },
    { id: "flag", name: "Bandeira", d: "M5 3v18h2v-7h11l-2-4 2-4H7V3z" },
    { id: "wheel", name: "Roda", d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
    { id: "piston", name: "Pist\xE3o", d: "M7 3h10v4l-2 2v4l2 2v6H7v-6l2-2V9L7 7z" },
    { id: "helmet", name: "Capacete", d: "M4 13a8 8 0 0 1 16 0v4h-4l-2 2h-6a4 4 0 0 1-4-4zm6-2h8v2h-8z" },
    { id: "gear", name: "Engrenagem", d: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4l2 1.5-2 3.5-2.4-.8-1.6 1 .3 2.5h-4l.3-2.5-1.6-1L9 19.5 7 16l2-1.5v-2L7 11l2-3.5 2.4.8 1.6-1-.3-2.5h4l-.3 2.5 1.6 1L21 5.5 23 9z" },
    { id: "wrench", name: "Chave", d: "M20 5a5 5 0 0 1-6.5 6.5L6 19l-2-2 7.5-7.5A5 5 0 0 1 18 3l-3 3 2 2z" },
    { id: "arrow-right", name: "Seta", d: "M3 11h12V7l6 5-6 5v-4H3z" },
    { id: "check", name: "Check", d: "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" },
    { id: "music", name: "M\xFAsica", d: "M9 18V5l12-2v13a3 3 0 1 1-2-2.8V6.5l-8 1.3V18a3 3 0 1 1-2-2.8z" },
    { id: "fire-alt", name: "Fogo", d: "M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S6 10 6 13a6 6 0 0 0 12 0c0-5-6-7-6-11z" },
    { id: "diamond", name: "Diamante", d: "M6 3h12l4 6-10 12L2 9z" },
    { id: "moon", name: "Lua", d: "M20 14a8 8 0 1 1-9.9-10 7 7 0 0 0 9.9 10z" },
    { id: "sun", name: "Sol", d: "M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM11 1h2v3h-2zm0 19h2v3h-2zM1 11h3v2H1zm19 0h3v2h-3zM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4zm11.3 11.3l1.4-1.4 2.1 2.1-1.4 1.4zM18.3 5.6l2.1-2.1 1.4 1.4-2.1 2.1zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1z" },
    { id: "target", name: "Alvo", d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" },
    { id: "gauge", name: "Veloc\xEDmetro", d: "M12 4a9 9 0 0 0-9 9h2a7 7 0 0 1 14 0h2a9 9 0 0 0-9-9zm4.5 4.5l-4 5.5-1.6-1.2 4-5.5z" },
    { id: "trophy", name: "Trof\xE9u", d: "M7 4h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 15.9V18h3v2H8v-2h3v-2.1A5 5 0 0 1 8.3 13H8a4 4 0 0 1-4-4V6h3zm10 4v1a2 2 0 0 0 2-2V8zM7 8H5v1a2 2 0 0 0 2 2z" },
    { id: "pin", name: "Pino", d: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" }
  ];
  var EMOJI_CATEGORIES = [
    { id: "faces", label: "Carinhas", items: ["\u{1F600}", "\u{1F60E}", "\u{1F929}", "\u{1F608}", "\u{1F479}", "\u{1F916}", "\u{1F47B}", "\u{1F480}", "\u{1F976}", "\u{1F525}", "\u2B50", "\u{1F4A5}", "\u2728", "\u{1F451}", "\u{1F48E}"] },
    { id: "veiculos", label: "Ve\xEDculos", items: ["\u{1F697}", "\u{1F3CE}\uFE0F", "\u{1F699}", "\u{1F6FB}", "\u{1F69A}", "\u{1F68C}", "\u{1F3CD}\uFE0F", "\u{1F6F5}", "\u{1F6B2}", "\u{1F6F4}", "\u{1F681}", "\u2708\uFE0F", "\u{1F6A4}", "\u26F5", "\u{1F69C}"] },
    { id: "corrida", label: "Racing", items: ["\u{1F3C1}", "\u{1F3C6}", "\u{1F947}", "\u23F1\uFE0F", "\u{1F527}", "\u{1F6E0}\uFE0F", "\u2699\uFE0F", "\u{1F529}", "\u{1F6DE}", "\u26FD", "\u{1F6A6}", "\u{1F4E3}", "\u{1F3AF}", "\u{1F4A8}", "\u{1F50B}"] },
    { id: "simbolos", label: "S\xEDmbolos", items: ["\u2764\uFE0F", "\u{1F9E1}", "\u{1F49B}", "\u{1F49A}", "\u{1F499}", "\u{1F49C}", "\u{1F5A4}", "\u{1F90D}", "\u2660\uFE0F", "\u2663\uFE0F", "\u2665\uFE0F", "\u2666\uFE0F", "\u2620\uFE0F", "\u26A1", "\u{1F531}"] },
    { id: "maos", label: "Gestos", items: ["\u{1F44D}", "\u{1F44A}", "\u{1F918}", "\u270C\uFE0F", "\u{1F919}", "\u{1F44C}", "\u{1F64C}", "\u{1F44F}", "\u{1F4AA}", "\u{1F91D}", "\u{1FAE1}", "\u{1F44B}", "\u{1F596}", "\u{1FAF6}", "\u261D\uFE0F"] },
    { id: "natureza", label: "Diversos", items: ["\u{1F308}", "\u2600\uFE0F", "\u{1F319}", "\u2B50", "\u{1F30A}", "\u{1F340}", "\u{1F338}", "\u{1F43A}", "\u{1F985}", "\u{1F40D}", "\u{1F982}", "\u{1F577}\uFE0F", "\u{1F41D}", "\u{1F3A7}", "\u{1F3B8}"] }
  ];
  var TEXT_PRESETS = [
    { label: "T\xEDtulo esportivo", text: "TURBO", font: "Bebas Neue", size: 120, weight: 400, color: "#ffffff", tracking: 8 },
    { label: "Racing", text: "RACING", font: "Racing Sans One", size: 110, weight: 400, color: "#c8102e", tracking: 2 },
    { label: "Street", text: "STREET", font: "Bungee", size: 100, weight: 400, color: "#f5c400", tracking: 0 },
    { label: "Gothic", text: "LEGEND", font: "Pirata One", size: 120, weight: 400, color: "#0c0c0d", tracking: 0 },
    { label: "Elegante", text: "Premium", font: "Playfair Display", size: 100, weight: 700, color: "#c9a227", tracking: 4 },
    { label: "Manuscrito", text: "feito \xE0 m\xE3o", font: "Caveat", size: 130, weight: 600, color: "#ffffff", tracking: 0 },
    { label: "Futurista", text: "NEON", font: "Orbitron", size: 100, weight: 700, color: "#00a3e0", tracking: 10 },
    { label: "Industrial", text: "HEAVY DUTY", font: "Archivo Black", size: 90, weight: 400, color: "#f26522", tracking: 0 },
    { label: "Retr\xF4", text: "Vintage 78", font: "Lobster", size: 120, weight: 400, color: "#0f7a3d", tracking: 0 },
    { label: "Militar", text: "TACTICAL", font: "Saira Stencil One", size: 100, weight: 400, color: "#4b5320", tracking: 2 },
    { label: "N\xFAmero", text: "77", font: "Anton", size: 220, weight: 400, color: "#ffffff", tracking: 0 },
    { label: "Hashtag", text: "#CUSTOM", font: "Montserrat", size: 80, weight: 900, color: "#000000", tracking: 0 }
  ];
  function templateLayers(id) {
    const T = [];
    switch (id) {
      case "speed-stripes":
        T.push(
          { type: "shape", kind: "rect", size: 1e3, w: 1e3, h: 130, x: 500, y: 380, rotation: 0, fill: "#c8102e" },
          { type: "shape", kind: "rect", size: 1e3, w: 1e3, h: 46, x: 500, y: 480, rotation: 0, fill: "#ffffff" },
          { type: "shape", kind: "rect", size: 1e3, w: 1e3, h: 26, x: 500, y: 530, rotation: 0, fill: "#0c0c0d" }
        );
        break;
      case "diagonal":
        T.push(
          { type: "shape", kind: "rect", size: 900, w: 1400, h: 120, x: 500, y: 430, rotation: -0.35, fill: "#00a3e0" },
          { type: "shape", kind: "rect", size: 900, w: 1400, h: 40, x: 500, y: 540, rotation: -0.35, fill: "#ffffff" },
          { type: "shape", kind: "rect", size: 900, w: 1400, h: 120, x: 500, y: 650, rotation: -0.35, fill: "#0c0c0d" }
        );
        break;
      case "number-badge":
        T.push(
          { type: "shape", kind: "badge", size: 420, x: 500, y: 500, fill: "#ffffff", stroke: "#0c0c0d", strokeWidth: 14 },
          { type: "text", text: "77", font: "Anton", fontSize: 240, x: 500, y: 500, fill: "#0c0c0d" }
        );
        break;
      case "shield-badge":
        T.push(
          { type: "shape", kind: "shield", size: 480, x: 500, y: 480, fill: "#0b3d91", stroke: "#c9a227", strokeWidth: 12 },
          { type: "text", text: "CLUBE", font: "Bebas Neue", fontSize: 90, x: 500, y: 380, fill: "#ffffff", letterSpacing: 6 },
          { type: "text", text: "77", font: "Anton", fontSize: 170, x: 500, y: 500, fill: "#c9a227" }
        );
        break;
      case "flames":
        T.push(
          { type: "shape", kind: "flame", size: 700, x: 300, y: 500, fill: "#f26522" },
          { type: "shape", kind: "flame", size: 520, x: 380, y: 500, fill: "#f5c400" }
        );
        break;
      case "geo":
        for (let i = 0; i < 6; i++) {
          T.push({
            type: "shape",
            kind: i % 2 ? "triangle" : "diamond",
            size: 220,
            x: 180 + i * 140,
            y: 500 + (i % 2 ? 60 : -60),
            rotation: i * 0.4,
            fill: ["#c8102e", "#0c0c0d", "#ffffff", "#f5c400", "#00a3e0", "#0f7a3d"][i],
            opacity: 0.95
          });
        }
        break;
      case "frame":
        T.push(
          { type: "shape", kind: "rect", size: 900, w: 880, h: 880, x: 500, y: 500, fill: null, stroke: "#ffffff", strokeWidth: 18 },
          { type: "shape", kind: "rect", size: 820, w: 800, h: 800, x: 500, y: 500, fill: null, stroke: "#c8102e", strokeWidth: 8 },
          { type: "text", text: "SEU NOME", font: "Bebas Neue", fontSize: 120, x: 500, y: 500, fill: "#ffffff", letterSpacing: 10 }
        );
        break;
      case "label":
        T.push(
          { type: "shape", kind: "banner", size: 620, x: 500, y: 500, fill: "#c8102e", stroke: "#ffffff", strokeWidth: 8 },
          { type: "text", text: "CUSTOM", font: "Anton", fontSize: 110, x: 500, y: 490, fill: "#ffffff", letterSpacing: 4 }
        );
        break;
      case "circle-stamp":
        T.push(
          { type: "shape", kind: "ellipse", size: 520, x: 500, y: 500, fill: "#0c0c0d", stroke: "#c9a227", strokeWidth: 16 },
          { type: "shape", kind: "ellipse", size: 430, x: 500, y: 500, fill: null, stroke: "#c9a227", strokeWidth: 4 },
          { type: "text", text: "ORIGINAL", font: "Montserrat", fontSize: 58, x: 500, y: 400, fill: "#c9a227", letterSpacing: 12, weight: 700 },
          { type: "text", text: "WRAP CO.", font: "Anton", fontSize: 120, x: 500, y: 520, fill: "#ffffff" },
          { type: "text", text: "EST. 2026", font: "Montserrat", fontSize: 46, x: 500, y: 620, fill: "#c9a227", letterSpacing: 8 }
        );
        break;
      case "arrow-set":
        for (let i = 0; i < 3; i++) {
          T.push({ type: "shape", kind: "arrow", size: 300 - i * 40, x: 350 + i * 150, y: 500, fill: i === 1 ? "#c8102e" : "#0c0c0d", opacity: 1 - i * 0.15 });
        }
        break;
      case "halftone-wave":
        for (let i = 0; i < 14; i++) {
          T.push({
            type: "shape",
            kind: "ellipse",
            size: 60 + i * 22,
            x: 200 + i * 45,
            y: 500 + Math.sin(i * 0.7) * 90,
            fill: null,
            stroke: "#00a3e0",
            strokeWidth: 10,
            opacity: 0.85
          });
        }
        break;
      case "crown-king":
        T.push(
          { type: "shape", kind: "crown", size: 380, x: 500, y: 330, fill: "#c9a227" },
          { type: "text", text: "KING", font: "Cinzel", fontSize: 170, x: 500, y: 560, fill: "#0c0c0d", weight: 700, letterSpacing: 14 }
        );
        break;
      default:
        return [];
    }
    return T.map((l, i) => ({
      id: "tpl_" + id + "_" + i,
      name: l.text ? `Texto "${l.text}"` : l.kind || "Elemento",
      type: l.type,
      x: l.x,
      y: l.y,
      rotation: l.rotation || 0,
      scale: l.scale || 1,
      opacity: l.opacity ?? 1,
      locked: false,
      visible: true,
      stroke: l.stroke || null,
      strokeWidth: l.strokeWidth || 0,
      shadow: null,
      filters: null,
      ...l.type === "text" ? {
        text: l.text,
        font: l.font || "Montserrat",
        fontSize: l.fontSize || 80,
        weight: l.weight || 400,
        italic: false,
        align: "center",
        letterSpacing: l.letterSpacing || 0,
        lineHeight: 1.2,
        curve: 0,
        textBoxWidth: 0,
        wrap: false,
        fill: l.fill || "#000000",
        gradient: null
      } : {},
      ...l.type === "shape" ? {
        kind: l.kind,
        size: l.size || 200,
        w: l.w || 0,
        h: l.h || 0,
        sides: l.sides || 5,
        innerRatio: l.innerRatio || 0.5,
        fill: l.fill === void 0 ? "#c8102e" : l.fill,
        gradient: null,
        cornerRadius: 0
      } : {}
    }));
  }
  var TEMPLATES = [
    { id: "speed-stripes", label: "Faixas de velocidade", cat: "Racing" },
    { id: "diagonal", label: "Diagonais", cat: "Racing" },
    { id: "number-badge", label: "N\xFAmero", cat: "Racing" },
    { id: "shield-badge", label: "Escudo", cat: "Clube" },
    { id: "circle-stamp", label: "Selo redondo", cat: "Clube" },
    { id: "label", label: "Etiqueta", cat: "Clube" },
    { id: "flames", label: "Chamas", cat: "Agressivo" },
    { id: "arrow-set", label: "Setas", cat: "Agressivo" },
    { id: "geo", label: "Geom\xE9trico", cat: "Street" },
    { id: "halftone-wave", label: "Ondas", cat: "Street" },
    { id: "frame", label: "Moldura + nome", cat: "B\xE1sico" },
    { id: "crown-king", label: "Coroa", cat: "Premium" }
  ];

  // js/palettes.js
  var COLOR_GROUPS = [
    {
      id: "preto",
      label: "Preto",
      colors: [
        { name: "Preto Fosco", hex: "#0c0c0d", finish: "matte" },
        { name: "Preto Brilhante", hex: "#050505", finish: "gloss" },
        { name: "Black Piano", hex: "#000000", finish: "piano" },
        { name: "Preto Acetinado", hex: "#15161a", finish: "satin" },
        { name: "Grafite", hex: "#2b2e33", finish: "satin" }
      ]
    },
    {
      id: "neutros",
      label: "Neutros",
      colors: [
        { name: "Branco Fosco", hex: "#f4f5f6", finish: "matte" },
        { name: "Branco Brilhante", hex: "#ffffff", finish: "gloss" },
        { name: "Cinza Claro", hex: "#c9ced4", finish: "satin" },
        { name: "Cinza M\xE9dio", hex: "#8d949c", finish: "satin" },
        { name: "Cinza Chumbo", hex: "#4a4f56", finish: "matte" },
        { name: "Prata", hex: "#c7ccd1", finish: "chrome" },
        { name: "Prata Espelhada", hex: "#dfe3e6", finish: "mirror" }
      ]
    },
    {
      id: "quentes",
      label: "Quentes",
      colors: [
        { name: "Vermelho", hex: "#c8102e", finish: "gloss" },
        { name: "Vermelho Fosco", hex: "#a30f24", finish: "matte" },
        { name: "Laranja", hex: "#f26522", finish: "gloss" },
        { name: "Amarelo", hex: "#f5c400", finish: "gloss" },
        { name: "Dourado", hex: "#c9a227", finish: "chrome" },
        { name: "Bronze", hex: "#8c6239", finish: "brushed" },
        { name: "Cobre", hex: "#b87333", finish: "brushed" }
      ]
    },
    {
      id: "frias",
      label: "Frias",
      colors: [
        { name: "Azul Royal", hex: "#0b3d91", finish: "gloss" },
        { name: "Azul Marinho", hex: "#101d33", finish: "matte" },
        { name: "Azul El\xE9trico", hex: "#00a3e0", finish: "gloss" },
        { name: "Verde", hex: "#0f7a3d", finish: "gloss" },
        { name: "Verde Militar", hex: "#4b5320", finish: "matte" },
        { name: "Roxo", hex: "#5b2c87", finish: "gloss" },
        { name: "Rosa", hex: "#e5447f", finish: "gloss" }
      ]
    },
    {
      id: "especiais",
      label: "Especiais",
      colors: [
        { name: "Carbono", hex: "#1b1c1f", finish: "carbon" },
        { name: "Camale\xE3o Azul/Roxo", hex: "#2a3b8f", finish: "chameleon" },
        { name: "Camale\xE3o Verde/Ouro", hex: "#2f6b3a", finish: "chameleon" },
        { name: "Hologr\xE1fico", hex: "#b8c6ff", finish: "holographic" },
        { name: "Perolizado", hex: "#efe6df", finish: "pearl" },
        { name: "Refletivo", hex: "#d8dde2", finish: "reflective" },
        { name: "Metal Escovado", hex: "#9aa1a8", finish: "brushed" },
        { name: "Cromado", hex: "#e6e9ec", finish: "chrome" }
      ]
    }
  ];
  var ALL_COLORS = COLOR_GROUPS.flatMap((g) => g.colors);
  var FINISHES = [
    { id: "matte", label: "Fosco", mult: 1, note: "Toque seco, sem reflexo" },
    { id: "gloss", label: "Brilhante", mult: 1.08, note: "Alto brilho, cor viva" },
    { id: "satin", label: "Satin", mult: 1.06, note: "Meio brilho" },
    { id: "piano", label: "Black Piano", mult: 1.22, note: "Preto profundo espelhado" },
    { id: "carbon", label: "Fibra de Carbono", mult: 1.55, note: "Textura 3D" },
    { id: "brushed", label: "Metal Escovado", mult: 1.35, note: "Textura met\xE1lica" },
    { id: "chrome", label: "Cromado", mult: 1.6, note: "Espelhado" },
    { id: "mirror", label: "Espelhado", mult: 1.5, note: "Reflexo total" },
    { id: "holographic", label: "Hologr\xE1fico", mult: 1.45, note: "Muda de cor com a luz" },
    { id: "pearl", label: "Perolizado", mult: 1.3, note: "Brilho suave perolado" },
    { id: "chameleon", label: "Camale\xE3o", mult: 1.65, note: "Duas cores conforme o \xE2ngulo" },
    { id: "textured", label: "Texturizado", mult: 1.25, note: "Relevo (couro/lixado)" },
    { id: "reflective", label: "Refletivo", mult: 1.5, note: "Reflete luz \xE0 noite" }
  ];
  var finishById = (id) => FINISHES.find((f) => f.id === id) || FINISHES[0];
  var STYLES = [
    { id: "esportivo", label: "Esportivo", icon: "\u26A1" },
    { id: "racing", label: "Racing", icon: "\u{1F3C1}" },
    { id: "street", label: "Street", icon: "\u{1F6F9}" },
    { id: "premium", label: "Premium", icon: "\u{1F48E}" },
    { id: "discreto", label: "Discreto", icon: "\u{1F576}\uFE0F" },
    { id: "agressivo", label: "Agressivo", icon: "\u{1F525}" },
    { id: "minimalista", label: "Minimalista", icon: "\u25FD" },
    { id: "retro", label: "Retr\xF4", icon: "\u{1F4FC}" },
    { id: "futurista", label: "Futurista", icon: "\u{1F916}" },
    { id: "militar", label: "Militar", icon: "\u{1F396}\uFE0F" },
    { id: "luxuoso", label: "Luxuoso", icon: "\u{1F451}" },
    { id: "personalizado", label: "Personalizado", icon: "\u270F\uFE0F" }
  ];
  var LEVELS = [
    { id: "discreto", label: "Discreto", desc: "Detalhes sutis, quase impercept\xEDvel", cover: 0.22 },
    { id: "moderado", label: "Moderado", desc: "\xC1reas principais envelopadas", cover: 0.45 },
    { id: "agressivo", label: "Agressivo", desc: "Presen\xE7a forte, grafismos marcantes", cover: 0.68 },
    { id: "extremo", label: "Extremo", desc: "Transforma\xE7\xE3o total", cover: 0.9 }
  ];
  var levelById = (id) => LEVELS.find((l) => l.id === id) || LEVELS[1];
  var AREAS = [
    { id: "toda", label: "Toda a superf\xEDcie" },
    { id: "laterais", label: "Apenas laterais" },
    { id: "tanque", label: "Tanque" },
    { id: "capo", label: "Cap\xF4" },
    { id: "teto", label: "Teto" },
    { id: "portas", label: "Portas" },
    { id: "paralamas", label: "Para-lamas" },
    { id: "retrovisores", label: "Retrovisores" },
    { id: "rodas", label: "Rodas" },
    { id: "detalhes", label: "Detalhes" },
    { id: "internas", label: "Partes internas" }
  ];
  var SURFACES = [
    { id: "carro", label: "Carro", icon: "\u{1F697}", area: 16 },
    { id: "moto", label: "Moto", icon: "\u{1F3CD}\uFE0F", area: 5.5 },
    { id: "caminhao", label: "Caminh\xE3o", icon: "\u{1F69A}", area: 42 },
    { id: "van", label: "Van / Utilit\xE1rio", icon: "\u{1F690}", area: 24 },
    { id: "capacete", label: "Capacete", icon: "\u26D1\uFE0F", area: 0.8 },
    { id: "movel", label: "M\xF3vel", icon: "\u{1FA91}", area: 4 },
    { id: "cozinha", label: "Cozinha", icon: "\u{1F373}", area: 6 },
    { id: "armario", label: "Arm\xE1rio / Guarda-roupa", icon: "\u{1F6AA}", area: 7 },
    { id: "mesa", label: "Mesa", icon: "\u{1FAB5}", area: 2.5 },
    { id: "eletro", label: "Eletrodom\xE9stico", icon: "\u{1F9CA}", area: 2.2 },
    { id: "outro", label: "Outra superf\xEDcie", icon: "\u2728", area: 5 }
  ];
  var VIEWS = [
    { id: "frente", label: "Frente" },
    { id: "traseira", label: "Traseira" },
    { id: "esquerda", label: "Lateral esquerda" },
    { id: "direita", label: "Lateral direita" },
    { id: "tresquartos", label: "Vista 3/4" },
    { id: "detalhe", label: "Detalhe" }
  ];
  var DEFAULT_PRICING = {
    whatsapp: "",
    currency: "BRL",
    priceMatte: 189,
    // R$ por m²
    priceGloss: 199,
    priceSpecial: 289,
    // carbono, holográfico, camaleão, refletivo, cromado
    wasteFactor: 0.18,
    // perda de material
    minArea: 0.5,
    // m² mínimo cobrado
    laborPerM2: 145,
    // mão de obra de aplicação
    designFee: 250,
    // arte/design
    installMin: 180,
    // taxa mínima de instalação
    currencySymbol: "R$"
  };
  var SPECIAL_FINISHES = /* @__PURE__ */ new Set(["carbon", "holographic", "chameleon", "reflective", "chrome", "mirror", "brushed", "pearl", "textured", "piano"]);

  // js/budget.js
  function calcQuote({ areaM2, finishes = [{ id: "matte", pct: 100 }], pricing, includeDesign = true, installIncluded = true }) {
    const area = Math.max(Number(areaM2) || 0, pricing.minArea);
    const areaWithWaste = area * (1 + (pricing.wasteFactor || 0));
    const totalPct = finishes.reduce((a, f) => a + (Number(f.pct) || 0), 0) || 100;
    let pricePerM2 = 0;
    const breakdown = [];
    for (const f of finishes) {
      const fin = finishById(f.id);
      const pct = (Number(f.pct) || 0) / totalPct;
      const base = SPECIAL_FINISHES.has(f.id) ? pricing.priceSpecial : f.id === "matte" ? pricing.priceMatte : pricing.priceGloss;
      const unit = base * (fin.mult || 1);
      pricePerM2 += unit * pct;
      breakdown.push({ label: `${fin.label} (${Math.round(pct * 100)}%)`, unit, pct, subtotal: unit * pct * areaWithWaste });
    }
    const material = pricePerM2 * areaWithWaste;
    const labor = installIncluded ? Math.max(pricing.installMin, pricing.laborPerM2 * area) : 0;
    const design = includeDesign ? pricing.designFee || 0 : 0;
    const total = material + labor + design;
    return {
      area,
      areaWithWaste,
      pricePerM2,
      breakdown,
      material,
      labor,
      design,
      total,
      formatted: {
        material: money(material),
        labor: money(labor),
        design: money(design),
        total: money(total),
        pricePerM2: money(pricePerM2),
        area: area.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " m\xB2"
      }
    };
  }
  var money = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  function estimateArea(surfaceId, level = "moderado", areas = []) {
    const s = SURFACES.find((x) => x.id === surfaceId) || SURFACES[0];
    const cover = { discreto: 0.25, moderado: 0.5, agressivo: 0.75, extremo: 1 }[level] ?? 0.5;
    let base = s.area * cover;
    if (areas && areas.includes("toda")) base = s.area;
    return Math.max(0.3, base);
  }
  function whatsappText({ projectName, surface, style, colors, finish, level, quote, note, link }) {
    const lines = [];
    lines.push("*SOLICITA\xC7\xC3O DE OR\xC7AMENTO \u2014 ENVELOPAMENTO*");
    lines.push("");
    if (projectName) lines.push(`*Projeto:* ${projectName}`);
    if (surface) lines.push(`*Superf\xEDcie:* ${surface}`);
    if (style) lines.push(`*Estilo:* ${style}`);
    if (colors) lines.push(`*Cores:* ${colors}`);
    if (finish) lines.push(`*Acabamento:* ${finish}`);
    if (level) lines.push(`*N\xEDvel:* ${level}`);
    if (quote) {
      lines.push("");
      lines.push(`*\xC1rea estimada:* ${quote.formatted.area}`);
      lines.push(`*Material:* ${quote.formatted.material}`);
      if (quote.labor) lines.push(`*Aplica\xE7\xE3o:* ${quote.formatted.labor}`);
      if (quote.design) lines.push(`*Arte/design:* ${quote.formatted.design}`);
      lines.push(`*TOTAL ESTIMADO:* ${quote.formatted.total}`);
    }
    if (note) {
      lines.push("");
      lines.push(`*Descri\xE7\xE3o:* ${note}`);
    }
    if (link) {
      lines.push("");
      lines.push(`*Projeto (link/arquivo):* ${link}`);
    }
    lines.push("");
    lines.push("_Enviado pelo Studio de Adesivos_");
    return lines.join("\n");
  }
  function whatsappUrl(phone, text) {
    const p = String(phone || "").replace(/\D/g, "");
    const url = "https://wa.me/" + (p ? p : "") + "?text=" + encodeURIComponent(text);
    return url;
  }

  // js/store.js
  var DB_NAME = "wrapstudio";
  var DB_VERSION = 1;
  var S_PROJECTS = "projects";
  var S_IMAGES = "images";
  var _db = null;
  function openDB() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(S_PROJECTS)) db.createObjectStore(S_PROJECTS, { keyPath: "id" });
        if (!db.objectStoreNames.contains(S_IMAGES)) db.createObjectStore(S_IMAGES);
      };
      req.onsuccess = () => {
        _db = req.result;
        resolve(_db);
      };
      req.onerror = () => reject(req.error);
    });
  }
  function tx(store, mode, fn) {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const os = t.objectStore(store);
      const r = fn(os);
      t.oncomplete = () => resolve(r && r.result !== void 0 ? r.result : void 0);
      t.onerror = () => reject(t.error);
    }));
  }
  async function listProjects() {
    try {
      const all = await tx(S_PROJECTS, "readonly", (os) => os.getAll());
      return (all || []).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } catch {
      return [];
    }
  }
  async function getProject(id) {
    try {
      return await tx(S_PROJECTS, "readonly", (os) => os.get(id));
    } catch {
      return null;
    }
  }
  async function saveProject(project) {
    const p = { ...project, updatedAt: Date.now(), createdAt: project.createdAt || Date.now() };
    try {
      await tx(S_PROJECTS, "readwrite", (os) => os.put(p));
      return p;
    } catch (e) {
      console.error("saveProject", e);
      return p;
    }
  }
  async function deleteProject(id) {
    try {
      await tx(S_PROJECTS, "readwrite", (os) => os.delete(id));
    } catch {
    }
  }
  function newProject({ name = "Novo adesivo", width = 1e3, height = 1e3, mm = 200 } = {}) {
    return {
      id: "proj_" + Math.random().toString(36).slice(2, 10),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      document: {
        width,
        height,
        mm,
        // largura física em mm (para orçamento)
        background: { type: "transparent", color: "#ffffff", gradient: null },
        layers: []
      },
      meta: { source: "manual", surface: null, style: null, finish: null },
      thumb: null
    };
  }

  // js/editor.js
  var Editor = class {
    constructor(root, app) {
      this.root = root;
      this.app = app;
      this.canvas = $("#ed-canvas", root);
      this.ctx = this.canvas.getContext("2d");
      this.stage = $("#ed-stage", root);
      this.project = newProject();
      this.tool = "select";
      this.shapeKind = "rect";
      this.camera = { x: 0, y: 0, zoom: 0.6 };
      this.selection = [];
      this.hoverId = null;
      this.snap = true;
      this.showGuides = true;
      this.images = /* @__PURE__ */ new Map();
      this.history = { stack: [], index: -1 };
      this.interaction = null;
      this.textLayouts = /* @__PURE__ */ new Map();
      this._bmp = /* @__PURE__ */ new Map();
      this.guides = null;
      this.pickCb = null;
      this.brush = { size: 14, color: "#0c0c0d", opacity: 1, smooth: true };
      this.cutPreview = false;
      this.dpi = 96;
      this._bindCanvas();
      this._bindToolbar();
      this._bindDock();
      this._bindKeyboard();
      this._bindDrop();
      this._resizeObserver();
      this.pushHistory(true);
      this.renderProps();
      this.renderLayers();
      this.requestRender();
    }
    /* ---------------- documento ---------------- */
    get doc() {
      return this.project.document;
    }
    get layers() {
      return this.doc.layers;
    }
    setProject(p) {
      this.project = p;
      this.images.clear();
      this.textLayouts.clear();
      this.selection = [];
      this.history = { stack: [], index: -1 };
      $("#ed-name").value = p.name || "Sem nome";
      this.fit();
      (p.document.layers || []).forEach((l) => {
        if (l.type === "image" && l.src) this.ensureImage(l);
      });
      ensureLayerFonts(p.document.layers).then((ok) => {
        if (ok) {
          this.textLayouts.clear();
          this.requestRender();
        }
      });
      this.pushHistory(true);
      this.renderProps();
      this.renderLayers();
      this.requestRender();
    }
    _sigOf(layer, q) {
      const o = {};
      for (const k of Object.keys(layer)) {
        if (k === "x" || k === "y" || k === "rotation" || k === "scale") continue;
        const v = layer[k];
        o[k] = k === "src" && typeof v === "string" ? v.length + ":" + v.slice(-24) : v;
      }
      return JSON.stringify(o) + "|" + q;
    }
    layerBitmap(layer) {
      const q = clamp(Math.round(this.camera.zoom), 1, 2);
      const sig = this._sigOf(layer, q);
      const hit = this._bmp.get(layer.id);
      if (hit && hit.sig === sig) return hit;
      const layout = layer.type === "text" ? this.layoutOf(layer).layout : null;
      const box = layerBox(layer, layout);
      const pad = 14;
      const cv = makeCanvas(Math.max(2, Math.ceil((box.w + pad * 2) * q)), Math.max(2, Math.ceil((box.h + pad * 2) * q)));
      const g = cv.getContext("2d");
      g.scale(q, q);
      g.translate(pad - box.x, pad - box.y);
      const sx = layer.x, sy = layer.y, sr = layer.rotation;
      layer.x = 0;
      layer.y = 0;
      layer.rotation = 0;
      this.drawLayer(g, layer);
      layer.x = sx;
      layer.y = sy;
      layer.rotation = sr;
      const entry = { sig, cv, pad, q };
      this._bmp.set(layer.id, entry);
      if (this._bmp.size > 48) this._bmp.delete(this._bmp.keys().next().value);
      return entry;
    }
    _ensureFont(family) {
      if (!family || family === "system-emoji") return;
      ensureFontFamily(family).then((ok) => {
        if (ok) {
          this.textLayouts.clear();
          this.requestRender();
        }
      });
    }
    async ensureImage(layer) {
      if (!layer.src) return null;
      if (this.images.has(layer.id)) return this.images.get(layer.id);
      try {
        const img = await loadImage(layer.src);
        this.images.set(layer.id, img);
        if (!layer._sized) {
          const ar = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
          if (ar >= 1) {
            layer.w = 100;
            layer.h = 100 / ar;
          } else {
            layer.w = 100 * ar;
            layer.h = 100;
          }
          layer._sized = true;
        }
        this.requestRender();
        return img;
      } catch {
        return null;
      }
    }
    addLayer(partial, { select = true, history = true } = {}) {
      const base = {
        id: uid("l"),
        name: "Elemento",
        type: "shape",
        x: this.doc.width / 2,
        y: this.doc.height / 2,
        rotation: 0,
        scale: 1,
        opacity: 1,
        locked: false,
        visible: true,
        stroke: null,
        strokeWidth: 0,
        shadow: null,
        clip: null,
        filters: null
      };
      const layer = { ...base, ...partial, id: partial.id || uid("l") };
      this.layers.push(layer);
      if (layer.type === "image") {
        layer.name = "Imagem";
        this.ensureImage(layer);
      }
      if (layer.type === "text") {
        layer.name = `Texto "${(layer.text || "").slice(0, 14)}"`;
        this._ensureFont(layer.font);
      }
      if (layer.type === "shape") layer.name = SHAPES.find((s) => s.id === layer.kind)?.label || "Forma";
      if (layer.type === "path") layer.name = "Desenho";
      if (layer.type === "icon") layer.name = "\xCDcone";
      if (select) this.selection = [layer.id];
      if (history) this.pushHistory();
      this.renderLayers();
      this.renderProps();
      this.requestRender();
      return layer;
    }
    selected() {
      return this.layers.filter((l) => this.selection.includes(l.id));
    }
    selectedOne() {
      const s = this.selected();
      return s.length === 1 ? s[0] : null;
    }
    updateLayer(id, patch, { history = true, silent = false } = {}) {
      const l = this.layers.find((x) => x.id === id);
      if (!l) return;
      Object.assign(l, patch);
      if (l.type === "text" && !silent) l.name = `Texto "${(l.text || "").slice(0, 14)}"`;
      if (patch.font) this._ensureFont(patch.font);
      if (!silent) {
        this.renderLayers();
      }
      this.requestRender();
      if (history) this.pushHistory();
    }
    updateSelected(patch, opts) {
      this.selected().forEach((l) => this.updateLayer(l.id, patch, opts));
    }
    removeSelected() {
      if (!this.selection.length) return;
      const names = this.selected().map((l) => l.name).join(", ");
      this.doc.layers = this.layers.filter((l) => !this.selection.includes(l.id));
      this.selection = [];
      this.pushHistory();
      this.renderLayers();
      this.renderProps();
      this.requestRender();
      toast("Removido: " + names, "info");
    }
    duplicateSelected() {
      const clones = this.selected().map((l) => {
        const c = deepClone(l);
        c.id = uid("l");
        c.x += 30;
        c.y += 30;
        c.locked = false;
        if (c.type === "image" && c.src) this.ensureImage(c);
        return c;
      });
      if (!clones.length) return;
      this.layers.push(...clones);
      this.selection = clones.map((c) => c.id);
      this.pushHistory();
      this.renderLayers();
      this.renderProps();
      this.requestRender();
      toast("Duplicado", "ok");
    }
    moveLayer(dir) {
      const ids = this.selection;
      if (!ids.length) return;
      const arr = this.layers;
      for (const id of ids) {
        const i = arr.findIndex((l) => l.id === id);
        const j = dir === "up" ? Math.min(arr.length - 1, i + 1) : dir === "down" ? Math.max(0, i - 1) : dir === "top" ? arr.length - 1 : 0;
        if (i === j) continue;
        const [item] = arr.splice(i, 1);
        arr.splice(j, 0, item);
      }
      this.pushHistory();
      this.renderLayers();
      this.requestRender();
    }
    /* ---------------- histórico ---------------- */
    pushHistory(initial = false) {
      const snap = JSON.stringify({ doc: this.doc, name: this.project.name });
      if (!initial && this.history.stack[this.history.index] === snap) return;
      this.history.stack = this.history.stack.slice(0, this.history.index + 1);
      this.history.stack.push(snap);
      if (this.history.stack.length > 60) this.history.stack.shift();
      this.history.index = this.history.stack.length - 1;
      this._syncHistoryButtons();
      this.scheduleAutosave();
    }
    undo() {
      if (this.history.index <= 0) return toast("Nada para desfazer");
      this.history.index--;
      this._restoreHistory();
    }
    redo() {
      if (this.history.index >= this.history.stack.length - 1) return toast("Nada para refazer");
      this.history.index++;
      this._restoreHistory();
    }
    _restoreHistory() {
      const s = JSON.parse(this.history.stack[this.history.index]);
      this.project.document = s.doc;
      this.project.name = s.name;
      $("#ed-name").value = s.name;
      this.selection = this.selection.filter((id) => this.layers.some((l) => l.id === id));
      this.textLayouts.clear();
      this.layers.forEach((l) => {
        if (l.type === "image") this.ensureImage(l);
      });
      this._syncHistoryButtons();
      this.renderLayers();
      this.renderProps();
      this.requestRender();
      this.scheduleAutosave();
    }
    _syncHistoryButtons() {
      const u = $("#btn-undo"), r = $("#btn-redo");
      if (u) u.disabled = this.history.index <= 0;
      if (r) r.disabled = this.history.index >= this.history.stack.length - 1;
    }
    scheduleAutosave = debounce(() => {
      try {
        LS.set("wrapstudio.autosave.editor", { at: Date.now(), project: this.project });
      } catch (e) {
        console.warn("autosave", e);
      }
    }, 900);
    /* ---------------- viewport ---------------- */
    _resizeObserver() {
      const ro = new ResizeObserver(() => this.resize());
      ro.observe(this.stage);
      window.addEventListener("resize", () => this.resize());
    }
    resize() {
      const r = this.stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.max(320, r.width * dpr);
      this.canvas.height = Math.max(240, r.height * dpr);
      this.canvas.style.width = r.width + "px";
      this.canvas.style.height = r.height + "px";
      this.dpr = dpr;
      this.requestRender();
    }
    fit() {
      const r = this.stage.getBoundingClientRect();
      const pad = 90;
      const z = Math.min((r.width - pad) / this.doc.width, (r.height - pad) / this.doc.height);
      this.camera.zoom = clamp(z || 0.5, 0.05, 6);
      this.requestRender();
    }
    zoomBy(k) {
      this.camera.zoom = clamp(this.camera.zoom * k, 0.05, 6);
      this._syncZoomLabel();
      this.requestRender();
    }
    _syncZoomLabel() {
      const z = $("#ed-zoom-label");
      if (z) z.textContent = Math.round(this.camera.zoom * 100) + "%";
    }
    toWorld(clientX, clientY) {
      const r = this.canvas.getBoundingClientRect();
      const cx = clientX - r.left, cy = clientY - r.top;
      const { zoom, x, y } = this.camera;
      return { x: (cx - r.width / 2) / zoom - x + this.doc.width / 2, y: (cy - r.height / 2) / zoom - y + this.doc.height / 2 };
    }
    /* ---------------- render ---------------- */
    requestRender() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this.render();
      });
    }
    render() {
      const ctx = this.ctx, dpr = this.dpr || 1;
      const w = this.canvas.width, h = this.canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#16181c";
      ctx.fillRect(0, 0, w, h);
      const { zoom } = this.camera;
      ctx.setTransform(zoom * dpr, 0, 0, zoom * dpr, w / 2 + (this.camera.x - this.doc.width / 2) * zoom * dpr, h / 2 + (this.camera.y - this.doc.height / 2) * zoom * dpr);
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 26 / zoom;
      ctx.shadowOffsetY = 8 / zoom;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, this.doc.width, this.doc.height);
      ctx.restore();
      this.drawDocument(ctx, false);
      this.drawOverlay(ctx, zoom);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    drawDocument(ctx, forExport) {
      const { width: W, height: H, background: bg } = this.doc;
      ctx.save();
      {
        if (bg?.type === "color") {
          ctx.fillStyle = bg.color;
          ctx.fillRect(0, 0, W, H);
        } else if (bg?.type === "gradient") {
          const g = ctx.createLinearGradient(0, 0, W, H);
          (bg.gradient.stops || []).forEach((s) => g.addColorStop(s.at, s.color));
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        } else if (bg?.type === "image" && (forExport ? this.images.get("__bg__") : this.images.get("__bg__"))) {
          ctx.drawImage(this.images.get("__bg__"), 0, 0, W, H);
        }
      }
      for (const layer of this.layers) {
        if (!layer.visible) continue;
        if (forExport) {
          this.drawLayer(ctx, layer);
          continue;
        }
        try {
          const entry = this.layerBitmap(layer);
          const layout = layer.type === "text" ? this.layoutOf(layer).layout : null;
          const box = layerBox(layer, layout);
          ctx.save();
          ctx.translate(layer.x, layer.y);
          ctx.rotate(layer.rotation || 0);
          ctx.scale(layer.scale || 1, layer.scale || 1);
          ctx.drawImage(entry.cv, box.x - entry.pad, box.y - entry.pad, entry.cv.width / entry.q, entry.cv.height / entry.q);
          ctx.restore();
        } catch {
          this.drawLayer(ctx, layer);
        }
      }
      ctx.restore();
    }
    applyFill(ctx, layer, box) {
      if (layer.gradient && layer.gradient.enabled) {
        const stops = layer.gradient.stops || [{ at: 0, color: "#ffffff" }, { at: 1, color: "#000000" }];
        let g;
        if (layer.gradient.type === "radial") {
          g = ctx.createRadialGradient(box.x + box.w / 2, box.y + box.h / 2, 1, box.x + box.w / 2, box.y + box.h / 2, Math.max(box.w, box.h) / 2);
        } else if (layer.gradient.type === "diagonal") {
          g = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
        } else {
          g = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y);
        }
        stops.forEach((s) => g.addColorStop(clamp(s.at, 0, 1), s.color));
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = layer.fill || "#000000";
      }
    }
    applyShadow(ctx, layer) {
      const s = layer && layer.shadow;
      if (s && s.enabled !== false) {
        ctx.shadowColor = s.color || "rgba(0,0,0,0.6)";
        ctx.shadowBlur = (s.blur ?? 8) * (layer.scale || 1);
        ctx.shadowOffsetX = (s.x ?? 4) * (layer.scale || 1);
        ctx.shadowOffsetY = (s.y ?? 4) * (layer.scale || 1);
      }
    }
    applyFilters(ctx, layer) {
      const f = layer.filters;
      if (!f) return;
      const parts = [];
      if (f.blur) parts.push(`blur(${f.blur}px)`);
      if (f.brightness && f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
      if (f.contrast && f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
      if (f.saturate && f.saturate !== 100) parts.push(`saturate(${f.saturate}%)`);
      if (f.hue) parts.push(`hue-rotate(${f.hue}deg)`);
      if (parts.length) ctx.filter = parts.join(" ");
    }
    clipLayer(ctx, layer, box) {
      const c = layer.clip;
      if (!c || !c.enabled) return false;
      const s = c.size || Math.max(box.w, box.h);
      const cx = (c.dx || 0) - (box.x + box.w / 2), cy = (c.dy || 0) - (box.y + box.h / 2);
      ctx.beginPath();
      switch (c.shape) {
        case "ellipse":
          ctx.ellipse(cx, cy, s / 2 * (c.sx || 1), s / 2 * (c.sy || 1), 0, 0, Math.PI * 2);
          break;
        case "rect": {
          const w = s * (c.sx || 1), h = s * (c.sy || 1), r = c.radius || 0;
          ctx.roundRect(cx - w / 2, cy - h / 2, w, h, r);
          break;
        }
        case "star":
        case "hexagon":
        case "shield":
        case "diamond":
        case "triangle": {
          const pts = shapePolygon(c.shape, s, c.sides || 5, 0.5, 0);
          pts.forEach((p, i) => i ? ctx.lineTo(cx + p.x * (c.sx || 1), cy + p.y * (c.sy || 1)) : ctx.moveTo(cx + p.x * (c.sx || 1), cy + p.y * (c.sy || 1)));
          ctx.closePath();
          break;
        }
        default:
          ctx.rect(box.x, box.y, box.w, box.h);
      }
      ctx.clip();
      return true;
    }
    layoutOf(layer) {
      if (layer.type !== "text") return null;
      const key = layer.id + "|" + layer.text + "|" + layer.fontSize + "|" + layer.letterSpacing + "|" + layer.lineHeight + "|" + layer.font + "|" + layer.weight + "|" + layer.wrap + "|" + layer.textBoxWidth + "|" + layer.curve + "|" + layer.italic;
      if (this.textLayouts.has(key)) {
        const v = this.textLayouts.get(key);
        return { key, layout: v };
      }
      const layout = layoutText(layer.text || "", {
        fontSize: layer.fontSize || 64,
        lineHeight: layer.lineHeight || 1.2,
        letterSpacing: layer.letterSpacing || 0,
        align: layer.align || "center",
        textBoxWidth: layer.wrap ? layer.textBoxWidth || 400 : null,
        wrap: !!layer.wrap,
        curve: layer.curve || 0
      }, (s, o) => this._measure(s, o, layer));
      this.textLayouts.set(key, layout);
      if (this.textLayouts.size > 300) this.textLayouts.clear();
      return { key, layout };
    }
    _measure(text, opts, layer) {
      const c = this._measureCanvas || (this._measureCanvas = makeCanvas(8, 8));
      const g = c.getContext("2d");
      g.font = this.fontString(layer, opts.fontSize || layer.fontSize || 64);
      if ("letterSpacing" in g) g.letterSpacing = (opts.letterSpacing ?? layer.letterSpacing ?? 0) + "px";
      return g.measureText(text).width;
    }
    fontString(layer, size) {
      const weight = layer.weight || 400;
      const italic = layer.italic ? "italic " : "";
      return `${italic}${weight} ${size}px "${layer.font || "Montserrat"}", system-ui, sans-serif`;
    }
    drawText(ctx, layer) {
      const { layout } = this.layoutOf(layer);
      const size = layer.fontSize || 64;
      ctx.font = this.fontString(layer, size);
      if ("letterSpacing" in ctx) ctx.letterSpacing = (layer.letterSpacing || 0) + "px";
      const box = layerBox(layer, layout);
      this.applyFill(ctx, layer, box);
      this.applyShadow(ctx, layer);
      const stroke = layer.stroke && layer.strokeWidth ? layer.stroke : null;
      if (layer.curve && layout.glyphs) {
        const r = layout.radius;
        const arch = layer.curve > 0;
        const nLines = layout.lines.length;
        for (const gl of layout.glyphs) {
          const theta = gl.x / r;
          const lineOff = (gl.line - (nLines - 1) / 2) * layout.lineHeight;
          ctx.save();
          if (arch) {
            ctx.translate(Math.sin(theta) * r, r - Math.cos(theta) * r);
            ctx.rotate(theta);
            ctx.translate(0, lineOff);
          } else {
            ctx.translate(Math.sin(theta) * r, Math.cos(theta) * r - r);
            ctx.rotate(-theta);
            ctx.translate(0, -lineOff);
          }
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          if (stroke) {
            ctx.lineWidth = layer.strokeWidth;
            ctx.strokeStyle = stroke;
            ctx.lineJoin = "round";
            ctx.strokeText(gl.ch, 0, 0);
          }
          ctx.fillText(gl.ch, 0, 0);
          ctx.restore();
        }
        return;
      }
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      const lh = layout.lineHeight;
      layout.lines.forEach((line, i) => {
        const y = (i - (layout.lines.length - 1) / 2) * lh;
        let x = -layout.widths[i] / 2;
        if (layer.align === "left") x = -layout.maxWidth / 2;
        if (layer.align === "right") x = layout.maxWidth / 2 - layout.widths[i];
        if (stroke) {
          ctx.lineWidth = layer.strokeWidth;
          ctx.strokeStyle = stroke;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeText(line, x, y);
        }
        ctx.fillText(line, x, y);
      });
    }
    drawShape(ctx, layer) {
      const s = layer.size || 100;
      const box = layerBox(layer);
      this.applyFill(ctx, layer, box);
      this.applyShadow(ctx, layer);
      ctx.lineJoin = "round";
      const strokeIt = () => {
        if (layer.stroke && layer.strokeWidth) {
          ctx.strokeStyle = layer.stroke;
          ctx.lineWidth = layer.strokeWidth;
          ctx.stroke();
        }
      };
      ctx.beginPath();
      switch (layer.kind) {
        case "rect": {
          const w = layer.w || s, h = layer.h || s, r = Math.min(layer.cornerRadius || 0, w / 2, h / 2);
          ctx.roundRect(-w / 2, -h / 2, w, h, r);
          if (layer.fill !== null && layer.fill !== void 0) ctx.fill();
          strokeIt();
          break;
        }
        case "line": {
          const w = layer.w || s;
          ctx.moveTo(-w / 2, 0);
          ctx.lineTo(w / 2, 0);
          ctx.strokeStyle = layer.stroke || layer.fill || "#000";
          ctx.lineWidth = layer.strokeWidth || 6;
          ctx.lineCap = "round";
          ctx.stroke();
          break;
        }
        case "ellipse": {
          const w = layer.w || s, h = layer.h || s;
          ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
          if (layer.fill !== null && layer.fill !== void 0) ctx.fill();
          strokeIt();
          break;
        }
        case "ring": {
          const w = layer.w || s, h = layer.h || s, t = layer.ringThickness || 0.22;
          ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.ellipse(0, 0, w / 2 * (1 - t), h / 2 * (1 - t), 0, 0, Math.PI * 2, true);
          ctx.fill("evenodd");
          strokeIt();
          break;
        }
        default: {
          const pts = shapePolygon(layer.kind, s, layer.sides || 5, layer.innerRatio || 0.5, 0);
          pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
          ctx.closePath();
          if (layer.fill !== null && layer.fill !== void 0) ctx.fill();
          strokeIt();
        }
      }
    }
    drawImageLayer(ctx, layer) {
      const img = this.images.get(layer.id);
      const w = layer.w || 100, h = layer.h || 100;
      if (!img) {
        ctx.save();
        ctx.fillStyle = "rgba(120,125,135,0.25)";
        ctx.strokeStyle = "rgba(150,155,165,0.6)";
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.restore();
        return;
      }
      ctx.drawImage(
        img,
        (layer.crop?.sx || 0) / 100 * img.naturalWidth,
        (layer.crop?.sy || 0) / 100 * img.naturalHeight,
        (layer.crop?.sw || 100) / 100 * img.naturalWidth,
        (layer.crop?.sh || 100) / 100 * img.naturalHeight,
        -w / 2,
        -h / 2,
        w,
        h
      );
    }
    drawPath(ctx, layer) {
      const pts = layer.points || [];
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = layer.stroke || "#000";
      ctx.lineWidth = layer.strokeWidth || 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = layer.opacity ?? 1;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (layer.smooth) {
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2, yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      } else {
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
    drawIcon(ctx, layer) {
      const p = this._iconPath(layer.d);
      if (!p) return;
      const s = (layer.size || 200) / 24;
      ctx.save();
      ctx.scale(s, s);
      ctx.translate(-12, -12);
      this.applyFill(ctx, layer, { x: 0, y: 0, w: 24, h: 24 });
      this.applyShadow(ctx, layer);
      if (layer.fill) ctx.fill(p, "evenodd");
      if (layer.stroke && layer.strokeWidth) {
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.strokeWidth / s;
        ctx.stroke(p);
      }
      ctx.restore();
    }
    _iconPath(d) {
      this._iconCache = this._iconCache || /* @__PURE__ */ new Map();
      if (this._iconCache.has(d)) return this._iconCache.get(d);
      let p = null;
      try {
        p = new Path2D(d);
      } catch (e) {
        p = null;
      }
      this._iconCache.set(d, p);
      return p;
    }
    drawLayer(ctx, layer) {
      const box = layerBox(layer, layer.type === "text" ? this.layoutOf(layer).layout : null);
      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate(layer.rotation || 0);
      ctx.scale(layer.scale || 1, layer.scale || 1);
      ctx.globalAlpha = layer.opacity ?? 1;
      this.applyFilters(ctx, layer);
      this.clipLayer(ctx, layer, box);
      try {
        if (layer.type === "text") this.drawText(ctx, layer);
        else if (layer.type === "shape") this.drawShape(ctx, layer);
        else if (layer.type === "image") this.drawImageLayer(ctx, layer);
        else if (layer.type === "path") this.drawPath(ctx, layer);
        else if (layer.type === "icon") this.drawIcon(ctx, layer);
      } catch (e) {
        console.warn("drawLayer", e);
      }
      ctx.restore();
    }
    drawOverlay(ctx, zoom) {
      const W = this.doc.width, H = this.doc.height;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(0, 0, W, H);
      ctx.restore();
      if (this.guides && this.guides.length) {
        ctx.save();
        ctx.strokeStyle = "#ff4fd8";
        ctx.lineWidth = 1 / zoom;
        for (const gd of this.guides) {
          ctx.beginPath();
          if (gd.axis === "v") {
            ctx.moveTo(gd.at, 0);
            ctx.lineTo(gd.at, H);
          } else {
            ctx.moveTo(0, gd.at);
            ctx.lineTo(W, gd.at);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      if (this.cutPreview) {
        ctx.save();
        ctx.strokeStyle = "#ff3b6b";
        ctx.setLineDash([14 / zoom, 10 / zoom]);
        ctx.lineWidth = 3 / zoom;
        const inset = 12;
        ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
        ctx.restore();
      }
      const sel = this.selected().filter((l) => !l.locked);
      for (const l of this.selected()) {
        const box = layerBox(l, l.type === "text" ? this.layoutOf(l).layout : null);
        const corners = boxCorners(box).map((p) => toWorld(p, l));
        ctx.save();
        ctx.strokeStyle = l.locked ? "#f2b134" : "#54ff7e";
        ctx.lineWidth = 1.6 / zoom;
        ctx.beginPath();
        corners.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      const one = this.selectedOne();
      if (one && !one.locked) {
        const box = layerBox(one, one.type === "text" ? this.layoutOf(one).layout : null);
        const hs = 9 / zoom;
        const pos = this.handlePositions(one, box);
        ctx.save();
        for (const [name, p] of Object.entries(pos)) {
          ctx.beginPath();
          if (name === "rot") {
            ctx.arc(p.x, p.y, hs * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = "#54ff7e";
            ctx.fill();
          } else {
            ctx.rect(p.x - hs / 2, p.y - hs / 2, hs, hs);
            ctx.fillStyle = "#0b0d10";
            ctx.fill();
            ctx.strokeStyle = "#54ff7e";
            ctx.lineWidth = 1.6 / zoom;
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }
    handlePositions(layer, box) {
      const corners = boxCorners(box);
      const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const local = {
        nw: corners[0],
        n: mid(corners[0], corners[1]),
        ne: corners[1],
        e: mid(corners[1], corners[2]),
        se: corners[2],
        s: mid(corners[2], corners[3]),
        sw: corners[3],
        w: mid(corners[3], corners[0])
      };
      const top = mid(corners[0], corners[1]);
      local.rot = { x: top.x, y: top.y - 34 / this.camera.zoom / (layer.scale || 1) };
      const out = {};
      for (const [k, v] of Object.entries(local)) out[k] = toWorld(v, layer);
      return out;
    }
    /* ---------------- interação ---------------- */
    _bindCanvas() {
      const c = this.canvas;
      c.addEventListener("pointerdown", (e) => this.onPointerDown(e));
      window.addEventListener("pointermove", (e) => this.onPointerMove(e));
      window.addEventListener("pointerup", (e) => this.onPointerUp(e));
      c.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0) {
          this.zoomBy(e.deltaY < 0 ? 1.09 : 0.92);
        }
      }, { passive: false });
      c.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    onPointerDown(e) {
      try {
        this.canvas.setPointerCapture?.(e.pointerId);
      } catch {
      }
      const p = this.toWorld(e.clientX, e.clientY);
      if (this.pickCb) {
        const cb = this.pickCb;
        this.pickCb = null;
        this.canvas.style.cursor = "";
        const rect = this.canvas.getBoundingClientRect();
        const dpr = this.dpr || 1;
        const px = Math.round((e.clientX - rect.left) * dpr), py = Math.round((e.clientY - rect.top) * dpr);
        try {
          const d = this.ctx.getImageData(px, py, 1, 1).data;
          cb(rgbToHex(d[0], d[1], d[2]));
        } catch {
        }
        return;
      }
      if (e.button === 1 || this.tool === "hand" || e.shiftKey && this.tool === "select" && e.altKey) {
        this.interaction = { mode: "pan", start: { x: e.clientX, y: e.clientY }, cam: { ...this.camera } };
        return;
      }
      if (this.tool === "draw") {
        const layer = {
          id: uid("l"),
          type: "path",
          name: "Desenho",
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: this.brush.opacity,
          visible: true,
          locked: false,
          points: [p],
          smooth: this.brush.smooth,
          stroke: this.brush.color,
          strokeWidth: this.brush.size,
          fill: null
        };
        this.layers.push(layer);
        this.selection = [layer.id];
        this.interaction = { mode: "draw", layerId: layer.id };
        this.renderLayers();
        this.requestRender();
        return;
      }
      if (this.tool === "rect" || this.tool === "ellipse") {
        this.interaction = { mode: "marquee", start: p, end: p };
        return;
      }
      if (this.tool === "text") {
        this.addText();
        this.setTool("select");
        return;
      }
      if (this.tool === "shape") {
        const kind = this.shapeKind;
        this.addLayer({ type: "shape", kind, size: 220, fill: "#c8102e", stroke: null, strokeWidth: 0, w: kind === "rect" ? 340 : 0, h: kind === "rect" ? 220 : 0 });
        this.setTool("select");
        return;
      }
      const one = this.selectedOne();
      if (one && !one.locked) {
        const box = layerBox(one, one.type === "text" ? this.layoutOf(one).layout : null);
        const hs = this.handlePositions(one, box);
        for (const [name, wp] of Object.entries(hs)) {
          if (Math.hypot(wp.x - p.x, wp.y - p.y) <= 12 / this.camera.zoom) {
            const center = { x: one.x, y: one.y };
            this.interaction = {
              mode: name === "rot" ? "rotate" : "scale",
              handle: name,
              layer: one,
              start: p,
              center,
              startRot: one.rotation || 0,
              startScale: one.scale || 1,
              startBox: box,
              startAngle: Math.atan2(p.y - center.y, p.x - center.x),
              shift: e.shiftKey
            };
            return;
          }
        }
      }
      const hit = this.hitTest(p);
      if (hit) {
        if (e.shiftKey) {
          this.selection = this.selection.includes(hit.id) ? this.selection.filter((i) => i !== hit.id) : [...this.selection, hit.id];
        } else if (!this.selection.includes(hit.id)) {
          this.selection = [hit.id];
        }
        const targets = this.selected().filter((l) => !l.locked);
        this.interaction = {
          mode: "move",
          start: p,
          items: targets.map((l) => ({ id: l.id, x: l.x, y: l.y }))
        };
      } else {
        if (!e.shiftKey) this.selection = [];
        this.interaction = { mode: "marquee", start: p, end: p };
      }
      this.renderLayers();
      this.renderProps();
      this.requestRender();
    }
    onPointerMove(e) {
      const it = this.interaction;
      if (!it) {
        if (this.tool === "select") {
          const p2 = this.toWorld(e.clientX, e.clientY);
          const hit = this.hitTest(p2);
          const id = hit ? hit.id : null;
          if (id !== this.hoverId) {
            this.hoverId = id;
            this.canvas.style.cursor = id ? "move" : "default";
          }
        }
        return;
      }
      const p = this.toWorld(e.clientX, e.clientY);
      if (it.mode === "pan") {
        const dx = (e.clientX - it.start.x) / this.camera.zoom;
        const dy = (e.clientY - it.start.y) / this.camera.zoom;
        this.camera.x = it.cam.x + dx;
        this.camera.y = it.cam.y + dy;
        this.requestRender();
        return;
      }
      if (it.mode === "marquee") {
        it.end = p;
        this.requestRender();
        const b = { x: Math.min(it.start.x, p.x), y: Math.min(it.start.y, p.y), w: Math.abs(p.x - it.start.x), h: Math.abs(p.y - it.start.y) };
        this.selection = this.layers.filter((l) => {
          const c = { x: l.x, y: l.y };
          return c.x >= b.x && c.x <= b.x + b.w && c.y >= b.y && c.y <= b.y + b.h;
        }).map((l) => l.id);
        this.renderLayers();
        return;
      }
      if (it.mode === "draw") {
        const l = this.layers.find((x) => x.id === it.layerId);
        if (!l) return;
        const last = l.points[l.points.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) > 2.2) {
          l.points.push(p);
          this.requestRender();
        }
        return;
      }
      if (it.mode === "move") {
        let dx = p.x - it.start.x, dy = p.y - it.start.y;
        if (e.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) dy = 0;
          else dx = 0;
        }
        this.guides = null;
        if (this.snap && it.items.length) {
          const main = this.layers.find((x) => x.id === it.items[0].id);
          if (main) {
            const sn = this._moveSnap(main, it.items[0], dx, dy);
            dx += sn.dx;
            dy += sn.dy;
            if (sn.guides.length) this.guides = sn.guides;
          }
        }
        for (const item of it.items) {
          const l = this.layers.find((x) => x.id === item.id);
          if (!l) continue;
          l.x = item.x + dx;
          l.y = item.y + dy;
        }
        this.requestRender();
        this._syncPosInputs();
        return;
      }
      if (it.mode === "rotate") {
        const a = Math.atan2(p.y - it.center.y, p.x - it.center.x);
        let rot = it.startRot + (a - it.startAngle);
        if (e.shiftKey) rot = Math.round(rot / (Math.PI / 12)) * (Math.PI / 12);
        it.layer.rotation = rot;
        this.requestRender();
        this._syncPosInputs();
        return;
      }
      if (it.mode === "scale") {
        const l = it.layer;
        const h = it.handle;
        const local = toLocal(p, l);
        const b = it.startBox;
        let sx = 1, sy = 1;
        const relX = (local.x - b.x) / (b.w || 1);
        const relY = (local.y - b.y) / (b.h || 1);
        if (h.includes("e")) sx = clamp(relX, 0.05, 10);
        if (h.includes("s")) sy = clamp(relY, 0.05, 10);
        if (h.includes("w")) sx = clamp(1 - relX, 0.05, 10);
        if (h.includes("n")) sy = clamp(1 - relY, 0.05, 10);
        const k = Math.max(sx, sy);
        if (h === "n" || h === "s") {
          l.scale = it.startScale * sy;
        } else if (h === "e" || h === "w") {
          l.scale = it.startScale * sx;
        } else {
          const uniform = e.shiftKey || e.altKey ? k : (sx + sy) / 2;
          l.scale = it.startScale * uniform;
        }
        l.scale = clamp(l.scale, 0.02, 40);
        this.requestRender();
        this._syncPosInputs();
        return;
      }
    }
    onPointerUp(e) {
      const it = this.interaction;
      this.interaction = null;
      this.guides = null;
      if (!it) return;
      if (it.mode === "draw") {
        const l = this.layers.find((x) => x.id === it.layerId);
        if (l) this._normalizePath(l);
        this.pushHistory();
        this.renderLayers();
        this.renderProps();
      } else if (it.mode !== "pan" && it.mode !== "marquee") {
        this.pushHistory();
        this.renderProps();
      }
      this.requestRender();
    }
    _normalizePath(l) {
      const b = bboxOfPoints(l.points);
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      l.points = l.points.map((p) => ({ x: p.x - cx, y: p.y - cy }));
      l.x = cx;
      l.y = cy;
    }
    _moveSnap(l, item0, dx, dy) {
      const layout = l.type === "text" ? this.layoutOf(l).layout : null;
      const box = layerBox(l, layout);
      const sc = l.scale || 1;
      const nx = item0.x + dx, ny = item0.y + dy;
      const hw = box.w * sc / 2, hh = box.h * sc / 2;
      const candX = [nx - hw, nx, nx + hw], candY = [ny - hh, ny, ny + hh];
      const tol = 6 / this.camera.zoom;
      const tx2 = [{ x: 0 }, { x: this.doc.width / 2 }, { x: this.doc.width }];
      const ty = [{ y: 0 }, { y: this.doc.height / 2 }, { y: this.doc.height }];
      for (const o of this.layers) {
        if (o.id === l.id || !o.visible || this.selection.includes(o.id)) continue;
        const ob = layerBox(o, o.type === "text" ? this.layoutOf(o).layout : null);
        const os = o.scale || 1;
        tx2.push({ x: o.x - ob.w * os / 2 }, { x: o.x }, { x: o.x + ob.w * os / 2 });
        ty.push({ y: o.y - ob.h * os / 2 }, { y: o.y }, { y: o.y + ob.h * os / 2 });
      }
      let bx = null, by = null;
      for (const c of candX) for (const t of tx2) {
        const d = t.x - c;
        if (Math.abs(d) < tol && (!bx || Math.abs(d) < Math.abs(bx.d))) bx = { d, at: t.x };
      }
      for (const c of candY) for (const t of ty) {
        const d = t.y - c;
        if (Math.abs(d) < tol && (!by || Math.abs(d) < Math.abs(by.d))) by = { d, at: t.y };
      }
      const guides = [];
      let ddx = 0, ddy = 0;
      if (bx) {
        ddx = bx.d;
        guides.push({ axis: "v", at: bx.at });
      }
      if (by) {
        ddy = by.d;
        guides.push({ axis: "h", at: by.at });
      }
      return { dx: ddx, dy: ddy, guides };
    }
    startPick(cb) {
      this.pickCb = cb;
      this.canvas.style.cursor = "crosshair";
      toast("Clique numa cor da prancheta", "ok", 2200);
    }
    hitTest(p) {
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const l = this.layers[i];
        if (!l.visible) continue;
        const layout = l.type === "text" ? this.layoutOf(l).layout : null;
        if (hitLayer(p, l, layout, { bboxOnly: false })) return l;
      }
      return null;
    }
    _bindDrop() {
      const zone = this.stage;
      ["dragenter", "dragover"].forEach((ev) => zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.add("drop");
      }));
      ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.remove("drop");
      }));
      zone.addEventListener("drop", async (e) => {
        const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
        for (const f of files) await this.insertImageFile(f);
      });
    }
    _bindKeyboard() {
      window.addEventListener("keydown", (e) => {
        const tag2 = (e.target.tagName || "").toLowerCase();
        if (tag2 === "input" || tag2 === "textarea" || e.target.isContentEditable) return;
        const k = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && k === "z") {
          e.preventDefault();
          e.shiftKey ? this.redo() : this.undo();
        } else if ((e.ctrlKey || e.metaKey) && k === "y") {
          e.preventDefault();
          this.redo();
        } else if ((e.ctrlKey || e.metaKey) && k === "d") {
          e.preventDefault();
          this.duplicateSelected();
        } else if ((e.ctrlKey || e.metaKey) && k === "a") {
          e.preventDefault();
          this.selection = this.layers.map((l) => l.id);
          this.renderLayers();
          this.renderProps();
          this.requestRender();
        } else if ((e.ctrlKey || e.metaKey) && k === "s") {
          e.preventDefault();
          this.app.saveCurrentProject();
        } else if (k === "delete" || k === "backspace") {
          e.preventDefault();
          this.removeSelected();
        } else if (k === "escape") {
          this.selection = [];
          this.renderLayers();
          this.renderProps();
          this.requestRender();
        } else if (k.startsWith("arrow")) {
          const d = e.shiftKey ? 10 : 1;
          const sel = this.selected().filter((l) => !l.locked);
          if (!sel.length) return;
          e.preventDefault();
          sel.forEach((l) => {
            if (k === "arrowleft") l.x -= d;
            if (k === "arrowright") l.x += d;
            if (k === "arrowup") l.y -= d;
            if (k === "arrowdown") l.y += d;
          });
          this.requestRender();
          this._syncPosInputs();
        } else if (k === "l" && !e.ctrlKey) {
          this.selected().forEach((l) => this.updateLayer(l.id, { locked: !l.locked }, { history: false }));
          this.renderLayers();
          this.renderProps();
          this.scheduleAutosave();
        }
      });
    }
    /* ---------------- ferramentas ---------------- */
    setTool(t) {
      this.tool = t;
      $$("#ed-tools .tool").forEach((b) => b.classList.toggle("active", b.dataset.tool === t));
      this.canvas.style.cursor = t === "hand" ? "grab" : t === "draw" ? "crosshair" : "default";
      const panel = $("#tool-opts");
      if (panel) {
        panel.innerHTML = "";
        if (t === "shape") {
          const sel = el("select", { class: "input", onchange: (e) => {
            this.shapeKind = e.target.value;
          } });
          SHAPES.forEach((s) => sel.appendChild(el("option", { value: s.id, text: s.label, ...s.id === this.shapeKind ? { selected: "selected" } : {} })));
          panel.appendChild(el("label", { class: "lbl" }, ["Forma ", sel]));
          panel.appendChild(el("p", { class: "hint", text: "Clique na prancheta para inserir." }));
        }
        if (t === "draw") {
          panel.appendChild(rangeRow("Espessura", 2, 90, this.brush.size, (v) => {
            this.brush.size = v;
          }));
          panel.appendChild(colorRow("Cor do pincel", this.brush.color, (v) => {
            this.brush.color = v;
          }));
          panel.appendChild(rangeRow("Opacidade", 5, 100, this.brush.opacity * 100, (v) => {
            this.brush.opacity = v / 100;
          }, "%"));
          panel.appendChild(toggleRow("Suavizar tra\xE7o", this.brush.smooth, (v) => {
            this.brush.smooth = v;
          }));
        }
      }
    }
    addText(preset = {}) {
      const l = this.addLayer({
        type: "text",
        text: preset.text || "SEU TEXTO",
        font: preset.font || "Anton",
        fontSize: preset.size || 96,
        weight: preset.weight || 400,
        italic: false,
        align: "center",
        letterSpacing: preset.tracking || 0,
        lineHeight: 1.2,
        curve: 0,
        wrap: false,
        textBoxWidth: 500,
        fill: preset.color || "#ffffff",
        gradient: { enabled: false, type: "linear", stops: [{ at: 0, color: "#ffffff" }, { at: 1, color: "#888888" }] },
        stroke: "#000000",
        strokeWidth: 0,
        shadow: { enabled: false, color: "rgba(0,0,0,0.55)", x: 6, y: 6, blur: 10 }
      });
      return l;
    }
    openImagePicker() {
      const body = el("div");
      const tabs = el("div", { class: "btn-row" });
      const paneFile = el("div"), paneUrl = el("div", { class: "hidden" }), paneSearch = el("div", { class: "hidden" });
      const mk = (label, pane) => {
        const b = el("button", { class: "btn sm", text: label });
        b.addEventListener("click", () => {
          [paneFile, paneUrl, paneSearch].forEach((x) => x.classList.add("hidden"));
          pane.classList.remove("hidden");
        });
        return b;
      };
      tabs.appendChild(mk("\u{1F4C1} Arquivo", paneFile));
      tabs.appendChild(mk("\u{1F517} Colar URL", paneUrl));
      tabs.appendChild(mk("\u{1F310} Buscar na internet", paneSearch));
      body.appendChild(tabs);
      const fi = el("input", { type: "file", accept: "image/*", multiple: "multiple" });
      fi.addEventListener("change", async (e) => {
        for (const f of e.target.files || []) await this.insertImageFile(f);
        m.close();
      });
      paneFile.appendChild(el("label", { class: "lbl" }, ["Escolher do dispositivo", fi]));
      const u = el("input", { class: "input", placeholder: "https://\u2026/imagem.png" });
      paneUrl.appendChild(el("label", { class: "lbl" }, ["URL da imagem", u]));
      paneUrl.appendChild(el("button", { class: "btn primary sm", text: "Inserir", onclick: async () => {
        await this.insertImageFromUrl(u.value);
        m.close();
      } }));
      const q = el("input", { class: "input", placeholder: "ex.: chama, caveira, racing, lobo, listras\u2026" });
      const grid = el("div", { class: "search-grid" });
      const status = el("p", { class: "hint", text: "Busca imagens de refer\xEAncia livres no Wikimedia Commons." });
      const doSearch = async () => {
        grid.innerHTML = "";
        status.textContent = "Buscando\u2026";
        try {
          const api = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" + encodeURIComponent(q.value + " filetype:bitmap") + "&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=720&format=json&origin=*";
          const r = await fetch(api);
          if (!r.ok) throw new Error("HTTP " + r.status);
          const j = await r.json();
          const pages = Object.values(j.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
          status.textContent = pages.length + " refer\xEAncias encontradas (licen\xE7as livres).";
          pages.forEach((res) => {
            const info = res.imageinfo?.[0];
            if (!info) return;
            const license = info.extmetadata?.LicenseShortName?.value?.replace(/<[^>]+>/g, "") || "licen\xE7a livre";
            const b = el("button", { class: "search-card", title: (res.title || "imagem") + " \xB7 " + license });
            const im = el("img", { src: info.thumburl || info.url, loading: "lazy" });
            b.appendChild(im);
            b.appendChild(el("span", { class: "search-lic", text: license }));
            b.addEventListener("click", async () => {
              await this.insertImageFromUrl(info.thumburl || info.url, { title: res.title, license });
              m.close();
            });
            grid.appendChild(b);
          });
        } catch (e) {
          status.textContent = "N\xE3o consegui buscar agora (" + e.message + "). Cole uma URL na aba ao lado.";
        }
      };
      paneSearch.appendChild(el("div", { class: "row" }, [q, el("button", { class: "btn primary sm", text: "Buscar", onclick: doSearch })]));
      q.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSearch();
      });
      paneSearch.appendChild(status);
      paneSearch.appendChild(grid);
      body.appendChild(paneFile);
      body.appendChild(paneUrl);
      body.appendChild(paneSearch);
      const m = openModal({ title: "Inserir imagem", body, wide: true });
    }
    async insertImageFromUrl(url, meta) {
      if (!url) return toast("Informe uma URL");
      try {
        let dataUrl = url;
        let mime = "";
        try {
          const r = await fetch(url);
          if (r.ok) {
            const blob = await r.blob();
            mime = blob.type;
            dataUrl = await fileToDataUrl(blob);
          }
        } catch {
        }
        let img = await loadImage(dataUrl);
        const packed = compressImage(img, 2048, mime === "image/png" ? "image/png" : "image/jpeg");
        if (packed) {
          dataUrl = packed;
          img = await loadImage(packed);
        }
        const ar = img.naturalWidth / img.naturalHeight;
        const w = ar >= 1 ? 420 : 420 * ar, h = ar >= 1 ? 420 / ar : 420;
        this.addLayer({ type: "image", src: dataUrl, w, h, crop: { sx: 0, sy: 0, sw: 100, sh: 100 }, credit: meta?.title || "" });
        toast("Imagem inserida", "ok");
      } catch {
        toast("N\xE3o foi poss\xEDvel carregar essa imagem", "err");
      }
    }
    async insertImageFile(file) {
      try {
        let dataUrl = await fileToDataUrl(file);
        let img = await loadImage(dataUrl);
        const packed = compressImage(img, 2048, file.type === "image/png" ? "image/png" : "image/jpeg");
        if (packed) {
          dataUrl = packed;
          img = await loadImage(packed);
        }
        const ar = img.naturalWidth / img.naturalHeight;
        const w = ar >= 1 ? 420 : 420 * ar, h = ar >= 1 ? 420 / ar : 420;
        this.addLayer({ type: "image", src: dataUrl, w, h, crop: { sx: 0, sy: 0, sw: 100, sh: 100 } });
        toast("Imagem adicionada", "ok");
      } catch {
        toast("Falha ao carregar a imagem", "err");
      }
    }
    addEmoji(ch) {
      this.addLayer({
        type: "text",
        text: ch,
        font: "system-emoji",
        fontSize: 200,
        weight: 400,
        fill: "#000000",
        letterSpacing: 0,
        lineHeight: 1.1,
        curve: 0,
        wrap: false,
        align: "center"
      });
    }
    addIcon(pathD) {
      this.addLayer({
        type: "icon",
        name: "\xCDcone",
        d: pathD,
        size: 260,
        fill: "#0c0c0d",
        stroke: null,
        strokeWidth: 0
      });
    }
    /* ---------------- painéis ---------------- */
    renderLayers() {
      const host = $("#layers-list");
      if (!host) return;
      host.innerHTML = "";
      const items = [...this.layers].reverse();
      if (!items.length) host.appendChild(el("p", { class: "hint", text: "Nenhuma camada ainda. Use o menu inferior para adicionar." }));
      for (const l of items) {
        const row = el("div", { class: "layer-row" + (this.selection.includes(l.id) ? " sel" : "") + (l.locked ? " locked" : "") });
        const icon = { text: "T", image: "\u{1F5BC}", shape: "\u25C6", path: "\u270E", icon: "\u2605" }[l.type] || "\u2022";
        row.appendChild(el("span", { class: "layer-ico", text: icon }));
        const name = el("span", { class: "layer-name", text: l.name });
        name.addEventListener("dblclick", () => {
          const inp = el("input", { class: "input mini", value: l.name });
          inp.addEventListener("blur", () => {
            l.name = inp.value || l.name;
            this.renderLayers();
          });
          inp.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") inp.blur();
          });
          row.replaceChild(inp, name);
          inp.focus();
          inp.select();
        });
        row.appendChild(name);
        row.appendChild(miniBtn(l.visible ? "\u{1F441}" : "\u{1F6AB}", () => {
          this.updateLayer(l.id, { visible: !l.visible }, { history: false });
          this.scheduleAutosave();
        }));
        row.appendChild(miniBtn(l.locked ? "\u{1F512}" : "\u{1F513}", () => {
          this.updateLayer(l.id, { locked: !l.locked }, { history: false });
          this.scheduleAutosave();
        }));
        row.addEventListener("click", (e) => {
          if (e.target.tagName === "BUTTON") return;
          this.selection = e.shiftKey ? [.../* @__PURE__ */ new Set([...this.selection, l.id])] : [l.id];
          this.renderLayers();
          this.renderProps();
          this.requestRender();
        });
        host.appendChild(row);
      }
    }
    renderProps() {
      const host = $("#props-body");
      if (!host) return;
      host.innerHTML = "";
      const sel = this.selected();
      if (!sel.length) {
        host.appendChild(section("Documento", [
          rowLabel("Tamanho", [
            numInput("Largura", this.doc.width, (v) => {
              this.doc.width = clamp(v, 50, 8e3);
              this.fit();
              this.pushHistory();
            }),
            numInput("Altura", this.doc.height, (v) => {
              this.doc.height = clamp(v, 50, 8e3);
              this.fit();
              this.pushHistory();
            })
          ]),
          rowLabel("Largura real", [numInput("mm", this.doc.mm, (v) => {
            this.doc.mm = clamp(v, 5, 1e4);
            this.pushHistory();
          })]),
          bgControls(this),
          el("button", { class: "btn ghost wide", text: "\u{1F4B0} Ver or\xE7amento deste adesivo", onclick: () => this.app.openQuote() })
        ]));
        host.appendChild(section("Dicas", [
          el("ul", { class: "tips", html: "<li>Arraste imagens para dentro da prancheta.</li><li>Shift + arrastar = mover em linha reta.</li><li>Ctrl+D duplica, L bloqueia, Delete apaga.</li><li>Scroll = zoom.</li>" })
        ]));
        return;
      }
      const one = sel.length === 1 ? sel[0] : null;
      const box = one ? layerBox(one, one.type === "text" ? this.layoutOf(one).layout : null) : null;
      host.appendChild(section("Transformar", [
        rowLabel("Posi\xE7\xE3o", [
          numInput("X", Math.round(one?.x ?? 0), (v) => this.updateSelected({ x: v }), one?.id),
          numInput("Y", Math.round(one?.y ?? 0), (v) => this.updateSelected({ y: v }), one?.id)
        ]),
        rowLabel("Tamanho / giro", [
          numInput("Escala %", Math.round((one?.scale ?? 1) * 100), (v) => this.updateSelected({ scale: clamp(v, 2, 4e3) / 100 }), one?.id),
          numInput("Rota\xE7\xE3o \xB0", Math.round((one?.rotation ?? 0) * 180 / Math.PI), (v) => this.updateSelected({ rotation: v * Math.PI / 180 }), one?.id)
        ]),
        rangeRow("Opacidade", 0, 100, Math.round((one?.opacity ?? 1) * 100), (v) => this.updateSelected({ opacity: v / 100 }, { history: false }), "%"),
        btnRow([
          el("button", { class: "btn sm", text: "\u29C9 Duplicar", onclick: () => this.duplicateSelected() }),
          el("button", { class: "btn sm", text: one?.locked ? "\u{1F513} Desbloquear" : "\u{1F512} Bloquear", onclick: () => {
            this.updateSelected({ locked: !one?.locked }, { history: false });
            this.renderLayers();
            this.renderProps();
          } }),
          el("button", { class: "btn sm danger", text: "\u{1F5D1} Apagar", onclick: () => this.removeSelected() })
        ]),
        btnRow([
          el("button", { class: "btn sm", text: "\u2912 Frente", onclick: () => this.moveLayer("top") }),
          el("button", { class: "btn sm", text: "\u2191 Subir", onclick: () => this.moveLayer("up") }),
          el("button", { class: "btn sm", text: "\u2193 Descer", onclick: () => this.moveLayer("down") }),
          el("button", { class: "btn sm", text: "\u2913 Fundo", onclick: () => this.moveLayer("bottom") })
        ]),
        alignRow(this, box)
      ]));
      if (one && ["text", "shape", "icon"].includes(one.type)) host.appendChild(stylePresetsSection(this, one));
      if (one?.type === "text") host.appendChild(textPanel(this, one));
      if (one?.type === "shape") host.appendChild(shapePanel(this, one));
      if (one?.type === "image") host.appendChild(imagePanel(this, one));
      if (one?.type === "path") host.appendChild(pathPanel(this, one));
      if (one?.type === "icon") host.appendChild(iconPanel(this, one));
      if (one) host.appendChild(effectsPanel(this, one));
      else host.appendChild(section("Sele\xE7\xE3o m\xFAltipla", [
        el("p", { class: "hint", text: sel.length + " elementos selecionados. Use Transformar para mover, girar, duplicar ou alinhar todos juntos." })
      ]));
    }
    _syncPosInputs() {
      const one = this.selectedOne();
      if (!one) return;
      const x = $("#prop-x"), y = $("#prop-y"), sc = $("#prop-scale"), rot = $("#prop-rot");
      if (x) x.value = Math.round(one.x);
      if (y) y.value = Math.round(one.y);
      if (sc) sc.value = Math.round(one.scale * 100);
      if (rot) rot.value = Math.round(one.rotation * 180 / Math.PI);
    }
    /* ---------------- ferramentas do dock ---------------- */
    _bindToolbar() {
      $$("#ed-tools .tool").forEach((b) => b.addEventListener("click", () => {
        const t = b.dataset.tool;
        this.setTool(this.tool === t && t !== "select" ? "select" : t);
      }));
      $$(".side-tab").forEach((t) => t.addEventListener("click", () => {
        $$(".side-tab").forEach((x) => x.classList.toggle("active", x === t));
        $("#panel-props")?.classList.toggle("hidden", t.dataset.tab !== "props");
        $("#panel-layers")?.classList.toggle("hidden", t.dataset.tab !== "layers");
      }));
      $("#btn-panel")?.addEventListener("click", () => $(".ed-side")?.classList.toggle("open"));
      $("#btn-undo")?.addEventListener("click", () => this.undo());
      $("#btn-redo")?.addEventListener("click", () => this.redo());
      $("#btn-zoom-out")?.addEventListener("click", () => this.zoomBy(0.9));
      $("#btn-zoom-in")?.addEventListener("click", () => this.zoomBy(1.1));
      $("#btn-zoom-fit")?.addEventListener("click", () => this.fit());
      $("#ed-name")?.addEventListener("input", (e) => {
        this.project.name = e.target.value;
      });
      $("#btn-save")?.addEventListener("click", () => this.app.saveCurrentProject());
      $("#btn-export")?.addEventListener("click", () => this.openExport());
      $("#btn-cut")?.addEventListener("click", () => {
        this.cutPreview = !this.cutPreview;
        $("#btn-cut").classList.toggle("active", this.cutPreview);
        this.requestRender();
        toast(this.cutPreview ? "Linha de corte vis\xEDvel" : "Linha de corte oculta");
      });
      $("#btn-clear")?.addEventListener("click", async () => {
        if (await confirmModal("Limpar tudo?", "Todas as camadas da prancheta ser\xE3o removidas.")) {
          this.doc.layers = [];
          this.selection = [];
          this.pushHistory();
          this.renderLayers();
          this.renderProps();
          this.requestRender();
        }
      });
    }
    _bindDock() {
      $$("#ed-dock .dock-btn").forEach((b) => {
        b.addEventListener("click", () => {
          const act = b.dataset.act;
          if (act === "text") this.openTextPicker();
          if (act === "font") this.openFontLibrary();
          if (act === "shape") this.setTool(this.tool === "shape" ? "select" : "shape");
          if (act === "image") this.openImagePicker();
          if (act === "emoji") this.openEmojiPicker();
          if (act === "icon") this.openIconPicker();
          if (act === "template") this.openTemplatePicker();
          if (act === "draw") this.setTool(this.tool === "draw" ? "select" : "draw");
          if (act === "cutout") this.openCutout();
          if (act === "sticker") this.openStickerEffects();
        });
      });
      $("#file-input")?.addEventListener("change", async (e) => {
        for (const f of Array.from(e.target.files || [])) await this.insertImageFile(f);
        e.target.value = "";
      });
    }
    openFontLibrary() {
      const body = el("div", { class: "font-lib" });
      const search = el("input", { class: "input", placeholder: "Buscar fonte\u2026" });
      const list = el("div", { class: "font-list" });
      const render = (q = "") => {
        list.innerHTML = "";
        for (const cat of FONT_CATEGORIES) {
          const fonts = cat.fonts.filter((f) => !q || f.toLowerCase().includes(q.toLowerCase()));
          if (!fonts.length) continue;
          list.appendChild(el("h4", { class: "cat-title", text: cat.label }));
          const grid = el("div", { class: "font-grid" });
          for (const f of fonts) {
            const card = el("button", { class: "font-card", style: `font-family:'${f}'` });
            card.appendChild(el("span", { class: "fc-sample", text: "Aa Bb 77" }));
            card.appendChild(el("span", { class: "fc-name", text: f, style: "font-family:inherit" }));
            card.addEventListener("click", () => {
              const one = this.selectedOne();
              if (one && one.type === "text") {
                this.updateLayer(one.id, { font: f });
                this.renderProps();
              } else {
                this.addText({ font: f });
              }
              toast("Fonte aplicada: " + f, "ok");
              m.close();
            });
            grid.appendChild(card);
          }
          list.appendChild(grid);
        }
      };
      search.addEventListener("input", debounce(() => render(search.value), 160));
      render();
      body.appendChild(search);
      body.appendChild(list);
      const m = openModal({ title: "Biblioteca de fontes", body, wide: true });
    }
    openTextPicker() {
      const body = el("div");
      const ta = el("textarea", { class: "input", rows: "2", placeholder: "Digite seu texto\u2026" });
      body.appendChild(el("label", { class: "lbl" }, ["Texto", ta]));
      body.appendChild(el("h4", { class: "cat-title", text: "Prontos" }));
      const grid = el("div", { class: "preset-grid" });
      for (const p of TEXT_PRESETS) {
        const b = el("button", { class: "preset-card", style: `font-family:'${p.font}'` }, [el("span", { text: p.text })]);
        b.addEventListener("click", () => {
          this.addText(p);
          m.close();
        });
        grid.appendChild(b);
      }
      body.appendChild(grid);
      const add = el("button", {
        class: "btn primary",
        text: "+ Adicionar texto",
        onclick: () => {
          const t = ta.value.trim();
          if (!t) return toast("Digite algo primeiro");
          this.addText({ text: t });
          m.close();
        }
      });
      const foot = el("div", { class: "row-end" }, [add]);
      const m = openModal({ title: "Adicionar texto", body, footer: foot });
    }
    openEmojiPicker() {
      const body = el("div");
      for (const cat of EMOJI_CATEGORIES) {
        body.appendChild(el("h4", { class: "cat-title", text: cat.label }));
        const g = el("div", { class: "emoji-grid" });
        for (const ch of cat.items) {
          const b = el("button", { class: "emoji-btn", text: ch });
          b.addEventListener("click", () => {
            this.addEmoji(ch);
            m.close();
          });
          g.appendChild(b);
        }
        body.appendChild(g);
      }
      const m = openModal({ title: "Emojis", body, wide: true });
    }
    openIconPicker() {
      const body = el("div", { class: "icon-grid" });
      for (const ic of ICONS) {
        const b = el("button", { class: "icon-card", title: ic.name, html: `<svg viewBox="0 0 24 24"><path d="${ic.d}"/></svg><span>${ic.name}</span>` });
        b.addEventListener("click", () => {
          this.addIcon(ic.d);
          m.close();
        });
        body.appendChild(b);
      }
      const m = openModal({ title: "\xCDcones", body, wide: true });
    }
    openTemplatePicker() {
      const body = el("div", { class: "tpl-grid" });
      const mine = JSON.parse(LS.get("adv_templates", "[]"));
      if (this.layers.length) {
        body.appendChild(el("button", {
          class: "btn ghost wide",
          text: "\u{1F4BE} Salvar arte atual como modelo",
          onclick: () => {
            const c = makeCanvas(120, Math.max(2, Math.round(120 * this.doc.height / this.doc.width)));
            const g = c.getContext("2d");
            g.fillStyle = "#ffffff";
            g.fillRect(0, 0, c.width, c.height);
            g.scale(c.width / this.doc.width, c.width / this.doc.width);
            this.drawDocument(g, true);
            const list = JSON.parse(LS.get("adv_templates", "[]"));
            list.push({ id: uid("tpl"), name: ($("#ed-name")?.value || "Meu modelo").slice(0, 24), thumb: c.toDataURL("image/png"), layers: deepClone(this.layers) });
            LS.set("adv_templates", JSON.stringify(list));
            toast("Modelo salvo \u2014 ele aparece nesta lista", "ok");
            m.close();
          }
        }));
      }
      for (const mt of mine) {
        const card = el("button", { class: "tpl-card" });
        const prev = el("div", { class: "tpl-prev" });
        const im = el("img", { src: mt.thumb });
        im.style.cssText = "width:100%;height:100%;object-fit:contain;background:#fff";
        prev.appendChild(im);
        card.appendChild(prev);
        card.appendChild(el("span", { class: "tpl-name", text: "\u2B50 " + mt.name }));
        card.appendChild(el("span", { class: "tpl-cat", text: "meus modelos" }));
        card.addEventListener("click", () => {
          deepClone(mt.layers).forEach((l) => {
            delete l.id;
            this.addLayer(l, { select: false, history: false });
          });
          this.pushHistory();
          this.renderLayers();
          this.renderProps();
          this.requestRender();
          m.close();
          toast("Modelo inserido", "ok");
        });
        body.appendChild(card);
      }
      for (const t of TEMPLATES) {
        const card = el("button", { class: "tpl-card" });
        const prev = el("div", { class: "tpl-prev" });
        prev.appendChild(templatePreview(t.id));
        card.appendChild(prev);
        card.appendChild(el("span", { class: "tpl-name", text: t.label }));
        card.appendChild(el("span", { class: "tpl-cat", text: t.cat }));
        card.addEventListener("click", () => {
          const ls = templateLayers(t.id);
          ls.forEach((l) => this.addLayer(l, { select: false, history: false }));
          this.selection = ls.map((l) => l.id);
          this.pushHistory();
          this.renderLayers();
          this.renderProps();
          this.requestRender();
          m.close();
          toast("Modelo inserido", "ok");
        });
        body.appendChild(card);
      }
      const m = openModal({ title: "Modelos prontos", body, wide: true });
    }
    openCutout() {
      const one = this.selectedOne();
      const body = el("div");
      if (!one) {
        body.appendChild(el("p", { class: "hint", text: "Selecione uma IMAGEM na prancheta. Se quiser recortar a foto de um carro/moto, use o Designer IA (enviar foto \u2192 remover fundo)." }));
        openModal({ title: "Recortar", body });
        return;
      }
      if (one.type !== "image") {
        body.appendChild(el("p", { class: "hint", text: "Recorte funciona em imagens. Selecione uma imagem." }));
        openModal({ title: "Recortar", body });
        return;
      }
      const img = this.images.get(one.id);
      if (!img) {
        body.appendChild(el("p", { class: "hint", text: "Aguarde a imagem carregar\u2026" }));
        openModal({ title: "Recortar", body });
        return;
      }
      body.appendChild(el("h4", { class: "cat-title", text: "1. Remover fundo" }));
      const tol = el("input", { type: "range", min: 4, max: 120, value: 38 });
      const tolVal = el("span", { class: "val", text: "38" });
      tol.addEventListener("input", () => tolVal.textContent = tol.value);
      body.appendChild(el("label", { class: "lbl" }, ["Toler\xE2ncia ", tol, tolVal]));
      body.appendChild(el("p", { class: "hint", text: "Remove a cor de fundo (usa a cor das bordas da foto). Depois voc\xEA pode refinar." }));
      const preview = el("div", { class: "cut-preview" });
      const canvas = makeCanvas(420, 420 * (img.naturalHeight / img.naturalWidth));
      preview.appendChild(canvas);
      body.appendChild(preview);
      let result = null;
      let running = false;
      const run = async () => {
        if (running) return;
        running = true;
        try {
          result = await removeBackgroundAsync(img, { tolerance: Number(tol.value) });
          const g = canvas.getContext("2d");
          canvas.width = result.width;
          canvas.height = result.height;
          canvas.style.width = "100%";
          g.fillStyle = "#22252a";
          g.fillRect(0, 0, canvas.width, canvas.height);
          g.drawImage(result, 0, 0);
        } finally {
          running = false;
        }
      };
      run();
      const foot = el("div", { class: "row-end" }, [
        el("button", { class: "btn ghost", text: "Refazer", onclick: run }),
        el("button", {
          class: "btn primary",
          text: "Aplicar recorte",
          onclick: () => {
            one.src = result.toDataURL("image/png");
            this.images.delete(one.id);
            one._sized = false;
            this.ensureImage(one);
            this.pushHistory();
            this.requestRender();
            m.close();
            toast("Fundo removido", "ok");
          }
        })
      ]);
      const m = openModal({ title: "Remover fundo / recortar", body, footer: foot, wide: true });
    }
    openStickerEffects() {
      const one = this.selectedOne();
      const body = el("div");
      if (!one) {
        body.appendChild(el("p", { class: "hint", text: "Selecione um elemento para aplicar contorno de recorte." }));
        openModal({ title: "Efeitos de adesivo", body });
        return;
      }
      body.appendChild(el("p", { class: "hint", text: "Aplica contorno (borda) e sombra no elemento selecionado \u2014 o famoso acabamento de adesivo recortado." }));
      const w = el("input", { type: "range", min: 0, max: 40, value: one.strokeWidth || 8 });
      const c = el("input", { type: "color", value: (one.stroke || "#ffffff").slice(0, 7) });
      body.appendChild(el("label", { class: "lbl" }, ["Espessura do contorno ", w]));
      body.appendChild(el("label", { class: "lbl" }, ["Cor do contorno ", c]));
      const apply = () => {
        this.updateLayer(one.id, { stroke: c.value, strokeWidth: Number(w.value), shadow: { enabled: true, color: "rgba(0,0,0,0.5)", x: 4, y: 6, blur: 10 } });
      };
      w.addEventListener("input", apply);
      c.addEventListener("input", apply);
      const m = openModal({ title: "Efeitos de adesivo", body, footer: el("div", { class: "row-end" }, [el("button", { class: "btn primary", text: "Concluir", onclick: () => m.close() })]) });
    }
    /* ---------------- exportação ---------------- */
    exportCanvas({ scale = 2, transparent = true, format = "png" } = {}) {
      const W = this.doc.width, H = this.doc.height;
      const c = makeCanvas(W * scale, H * scale);
      const g = c.getContext("2d");
      g.scale(scale, scale);
      if (!transparent || format === "jpg") {
        g.fillStyle = this.doc.background?.color || "#ffffff";
        g.fillRect(0, 0, W, H);
      }
      const oldSel = this.selection;
      this.selection = [];
      this.drawDocument(g, true);
      this.selection = oldSel;
      return c;
    }
    async exportPNG(scale = 2, transparent = true) {
      try {
        const c = this.exportCanvas({ scale, transparent });
        const blob = await canvasToBlob(c, "image/png");
        downloadBlob(blob, `${safeName(this.project.name)}-${scale}x.png`);
        toast("PNG exportado", "ok");
      } catch (e) {
        console.error("exportPNG falhou", e);
        toast("Falha ao exportar: " + e.message, "err", 5e3);
      }
    }
    async exportJPG() {
      const c = this.exportCanvas({ scale: 2, transparent: false, format: "jpg" });
      const blob = await canvasToBlob(c, "image/jpeg", 0.94);
      downloadBlob(blob, `${safeName(this.project.name)}.jpg`);
      toast("JPG exportado", "ok");
    }
    exportSVG() {
      const W = this.doc.width, H = this.doc.height;
      const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`];
      for (const l of this.layers) {
        if (!l.visible) continue;
        const t = `translate(${l.x} ${l.y}) rotate(${(l.rotation * 180 / Math.PI).toFixed(2)}) scale(${l.scale})`;
        const op = l.opacity != null ? ` opacity="${l.opacity}"` : "";
        if (l.type === "shape") {
          const fill = l.fill || "none", stroke = l.stroke || "none", sw = l.strokeWidth || 0;
          if (l.kind === "rect") parts.push(`<g transform="${t}"${op}><rect x="${-(l.w || l.size) / 2}" y="${-(l.h || l.size) / 2}" width="${l.w || l.size}" height="${l.h || l.size}" rx="${l.cornerRadius || 0}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`);
          else if (l.kind === "ellipse" || l.kind === "ring") parts.push(`<g transform="${t}"${op}><ellipse rx="${(l.w || l.size) / 2}" ry="${(l.h || l.size) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`);
          else {
            const pts = shapePolygon(l.kind, l.size, l.sides || 5, l.innerRatio || 0.5, 0).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
            parts.push(`<g transform="${t}"${op}><polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`);
          }
        } else if (l.type === "path") {
          const d = (l.points || []).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
          parts.push(`<g transform="${t}"${op}><path d="${d}" fill="${l.fill || "none"}" stroke="${l.stroke || "none"}" stroke-width="${l.strokeWidth || 0}" stroke-linecap="round" stroke-linejoin="round"/></g>`);
        } else if (l.type === "text") {
          const fill = l.fill || "#000";
          const stroke = l.strokeWidth ? ` stroke="${l.stroke}" stroke-width="${l.strokeWidth}" paint-order="stroke"` : "";
          const ls = l.letterSpacing ? ` letter-spacing="${l.letterSpacing}"` : "";
          const anchor = l.align === "left" ? "start" : l.align === "right" ? "end" : "middle";
          const safe = String(l.text).replace(/&/g, "&amp;").replace(/</g, "&lt;");
          parts.push(`<g transform="${t}"${op}><text x="0" y="0" font-family="${l.font}" font-size="${l.fontSize}" font-weight="${l.weight}" ${l.italic ? 'font-style="italic"' : ""} text-anchor="${anchor}" fill="${fill}"${stroke}${ls}>${safe}</text></g>`);
        } else if (l.type === "image") {
          const w = l.w || 100, h = l.h || 100;
          parts.push(`<g transform="${t}"${op}><image href="${l.src}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" preserveAspectRatio="none"/></g>`);
        } else if (l.type === "icon") {
          const s = (l.size || 200) / 24;
          parts.push(`<g transform="${t}"${op}"><path d="${l.d}" fill="${l.fill || "none"}" stroke="${l.stroke || "none"}" stroke-width="${l.strokeWidth || 0}" fill-rule="evenodd" transform="scale(${s}) translate(-12 -12)"/></g>`);
        }
      }
      parts.push("</svg>");
      const blob = new Blob([parts.join("\n")], { type: "image/svg+xml" });
      downloadBlob(blob, `${safeName(this.project.name)}.svg`);
      toast("SVG exportado", "ok");
    }
    exportJSON() {
      const blob = new Blob([JSON.stringify(this.project, null, 2)], { type: "application/json" });
      downloadBlob(blob, `${safeName(this.project.name)}.wrapstudio.json`);
      toast("Projeto exportado (.json)", "ok");
    }
    openExport() {
      const body = el("div");
      const prev = el("div", { class: "export-prev" });
      const thumb = this.exportCanvas({ scale: 0.4, transparent: true });
      prev.appendChild(thumb);
      thumb.style.width = "100%";
      body.appendChild(prev);
      body.appendChild(el("p", { class: "hint", text: "PNG com fundo transparente \xE9 o formato ideal para plotter de recorte e impress\xE3o." }));
      const foot = el("div", { class: "export-actions" }, [
        el("button", { class: "btn primary", "data-export": "png1", text: "PNG 1x", onclick: () => {
          this.exportPNG(1);
          m.close();
        } }),
        el("button", { class: "btn primary", "data-export": "png2", text: "PNG 2x", onclick: () => {
          this.exportPNG(2);
          m.close();
        } }),
        el("button", { class: "btn primary", "data-export": "png4", text: "PNG 4x (impress\xE3o)", onclick: () => {
          this.exportPNG(4);
          m.close();
        } }),
        el("button", { class: "btn", "data-export": "jpg", text: "JPG", onclick: () => {
          this.exportJPG();
          m.close();
        } }),
        el("button", { class: "btn", "data-export": "svg", text: "SVG (vetor)", onclick: () => {
          this.exportSVG();
          m.close();
        } }),
        el("button", { class: "btn", "data-export": "pdf", text: "PDF p/ impress\xE3o (mm)", onclick: async () => {
          m.close();
          try {
            await exportPrintPDF(this);
            toast("PDF gerado", "ok");
          } catch (e) {
            toast("Falha no PDF: " + e.message, "err");
          }
        } }),
        el("button", { class: "btn ghost", "data-export": "json", text: "Projeto (.json)", onclick: () => {
          this.exportJSON();
          m.close();
        } })
      ]);
      const m = openModal({ title: "Exportar adesivo", body, footer: foot, wide: true });
    }
    thumbDataUrl(size = 320) {
      try {
        const c = this.exportCanvas({ scale: size / Math.max(this.doc.width, this.doc.height), transparent: true });
        return c.toDataURL("image/png");
      } catch {
        return null;
      }
    }
  };
  var STYLE_PRESETS = [
    { label: "\u2728 Neon", apply: { stroke: "#00e5ff", strokeWidth: 6, shadow: { enabled: true, color: "rgba(0,229,255,0.8)", x: 0, y: 0, blur: 18 } } },
    { label: "\u2B55 Contorno", apply: { stroke: "#ffffff", strokeWidth: 10, shadow: { enabled: false, color: "rgba(0,0,0,0.55)", x: 6, y: 6, blur: 10 } } },
    { label: "\u{1F9CA} Sombra 3D", apply: { stroke: null, strokeWidth: 0, shadow: { enabled: true, color: "rgba(0,0,0,0.65)", x: 9, y: 9, blur: 0 } } },
    { label: "\u{1F3C6} Ouro", apply: { gradient: { enabled: true, type: "linear", stops: [{ at: 0, color: "#f9e79b" }, { at: 0.5, color: "#c9a227" }, { at: 1, color: "#8a6d1a" }] }, stroke: "#5c4a10", strokeWidth: 2 } },
    { label: "\u{1F4FC} Retr\xF4", apply: { gradient: { enabled: true, type: "linear", stops: [{ at: 0, color: "#ff9a3d" }, { at: 1, color: "#d1345b" }] }, shadow: { enabled: true, color: "rgba(20,20,40,0.7)", x: 5, y: 5, blur: 0 } } }
  ];
  function stylePresetsSection(editor, l) {
    const saved = JSON.parse(LS.get("adv_style_presets", "[]"));
    const btns = STYLE_PRESETS.map((p) => el("button", {
      class: "btn sm",
      text: p.label,
      onclick: () => {
        editor.updateLayer(l.id, deepClone(p.apply));
        editor.renderProps();
      }
    }));
    const savedBtns = saved.map((p, i) => el("button", {
      class: "btn sm ghost",
      text: "\u2B50 " + (p.name || "Preset " + (i + 1)),
      onclick: () => {
        editor.updateLayer(l.id, deepClone(p.apply));
        editor.renderProps();
      }
    }));
    const save = el("button", {
      class: "btn sm ghost wide",
      text: "\u{1F4BE} Salvar estilo atual",
      onclick: () => {
        const cur = { name: (l.name || "estilo").slice(0, 18), apply: deepClone({ stroke: l.stroke, strokeWidth: l.strokeWidth, shadow: l.shadow, gradient: l.gradient }) };
        const list = JSON.parse(LS.get("adv_style_presets", "[]"));
        list.push(cur);
        LS.set("adv_style_presets", JSON.stringify(list));
        editor.renderProps();
        toast("Estilo salvo", "ok");
      }
    });
    return section("Presets de estilo", [...btns, ...savedBtns, save]);
  }
  function safeName(s) {
    return String(s || "adesivo").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  }
  function section(title, children) {
    const s = el("div", { class: "panel-section" });
    s.appendChild(el("h4", { class: "sec-title", text: title }));
    children.forEach((c) => s.appendChild(c));
    return s;
  }
  function rowLabel(label, inputs) {
    return el("label", { class: "row" }, [el("span", { class: "row-lbl", text: label }), el("div", { class: "row-inputs" }, inputs)]);
  }
  function numInput(label, value, onChange, id) {
    const i = el("input", { class: "input num", type: "number", value: Math.round(value), ...id ? { id } : {} });
    i.addEventListener("change", () => onChange(Number(i.value)));
    i.addEventListener("input", debounce(() => onChange(Number(i.value)), 400));
    return el("span", { class: "num-wrap" }, [el("small", { text: label }), i]);
  }
  function rangeRow(label, min, max, value, onChange, suffix = "") {
    const r = el("input", { type: "range", min, max, value });
    const v = el("span", { class: "val", text: value + suffix });
    r.addEventListener("input", () => {
      v.textContent = r.value + suffix;
      onChange(Number(r.value));
    });
    return el("label", { class: "row range" }, [el("span", { class: "row-lbl", text: label }), r, v]);
  }
  function colorRow(label, value, onChange) {
    const c = el("input", { type: "color", value: (value || "#000000").slice(0, 7) });
    const t = el("input", { class: "input mini", type: "text", value: value || "#000000" });
    c.addEventListener("input", () => {
      t.value = c.value;
      onChange(c.value);
    });
    t.addEventListener("change", () => {
      if (/^#[0-9a-f]{6}$/i.test(t.value)) {
        c.value = t.value;
        onChange(t.value);
      }
    });
    const pick2 = el("button", { class: "icon-btn", title: "Conta-gotas: colher cor da prancheta", text: "\u{1F3AF}" });
    pick2.addEventListener("click", () => {
      window.app?.editor?.startPick((hex) => {
        c.value = hex;
        t.value = hex;
        onChange(hex);
      });
    });
    return el("label", { class: "row" }, [el("span", { class: "row-lbl", text: label }), c, t, pick2]);
  }
  function toggleRow(label, value, onChange) {
    const t = el("input", { type: "checkbox" });
    t.checked = !!value;
    t.addEventListener("change", () => onChange(t.checked));
    return el("label", { class: "row toggle" }, [el("span", { class: "row-lbl", text: label }), t]);
  }
  function btnRow(btns) {
    return el("div", { class: "btn-row" }, btns);
  }
  function miniBtn(txt, fn) {
    const b = el("button", { class: "mini", text: txt });
    b.addEventListener("click", fn);
    return b;
  }
  function gradientControls(layer, onChange) {
    const wrap = el("div", { class: "grad-box" });
    const g = layer.gradient || (layer.gradient = { enabled: false, type: "linear", stops: [{ at: 0, color: "#ffffff" }, { at: 1, color: "#111111" }] });
    wrap.appendChild(toggleRow("Usar gradiente", g.enabled, (v) => {
      g.enabled = v;
      onChange();
      render();
    }));
    const sel = el("select", { class: "input" });
    ["linear", "diagonal", "radial"].forEach((t) => sel.appendChild(el("option", { value: t, text: { linear: "Linear", diagonal: "Diagonal", radial: "Radial" }[t], ...g.type === t ? { selected: "selected" } : {} })));
    sel.addEventListener("change", () => {
      g.type = sel.value;
      onChange();
    });
    const stopsBox = el("div", { class: "stops" });
    function render() {
      stopsBox.innerHTML = "";
      g.enabled = !!g.enabled;
      sel.disabled = !g.enabled;
      g.stops.forEach((s, i) => {
        const c = el("input", { type: "color", value: s.color });
        const r = el("input", { type: "range", min: 0, max: 100, value: Math.round(s.at * 100) });
        c.addEventListener("input", () => {
          s.color = c.value;
          onChange();
        });
        r.addEventListener("input", () => {
          s.at = r.value / 100;
          onChange();
        });
        stopsBox.appendChild(el("div", { class: "stop-row" }, [c, r]));
      });
      const add = el("button", { class: "btn sm ghost", text: "+ Parada", onclick: () => {
        g.stops.push({ at: 0.5, color: "#888888" });
        onChange();
        render();
      } });
      const del = el("button", { class: "btn sm ghost", text: "\u2212 Parada", onclick: () => {
        if (g.stops.length > 2) {
          g.stops.pop();
          onChange();
          render();
        }
      } });
      stopsBox.appendChild(el("div", { class: "btn-row" }, [add, del]));
    }
    wrap.appendChild(sel);
    wrap.appendChild(stopsBox);
    render();
    return wrap;
  }
  function alignRow(editor, box) {
    const acts = [
      ["\u21E4", "left"],
      ["\u21D4", "hcenter"],
      ["\u21E5", "right"],
      ["\u2912", "top"],
      ["\u2195", "vcenter"],
      ["\u2913", "bottom"]
    ];
    const btns = acts.map(([t, mode]) => el("button", {
      class: "btn sm",
      text: t,
      title: "Alinhar " + mode,
      onclick: () => {
        const area = { x: 0, y: 0, w: editor.doc.width, h: editor.doc.height };
        editor.selected().forEach((l) => {
          if (l.locked) return;
          alignLayer(l, mode, l.type === "text" ? editor.layoutOf(l).layout : null, area);
        });
        editor.pushHistory();
        editor.requestRender();
      }
    }));
    return el("div", { class: "btn-row align" }, btns);
  }
  function textPanel(editor, l) {
    const ta = el("textarea", { class: "input", rows: "2" });
    ta.value = l.text;
    ta.addEventListener("input", () => editor.updateLayer(l.id, { text: ta.value }, { history: false }));
    ta.addEventListener("change", () => editor.pushHistory());
    const fontSel = el("select", { class: "input" });
    for (const cat of FONT_CATEGORIES) {
      const og = el("optgroup", { label: cat.label });
      cat.fonts.forEach((f) => og.appendChild(el("option", { value: f, text: f, ...l.font === f ? { selected: "selected" } : {} })));
      fontSel.appendChild(og);
    }
    fontSel.addEventListener("change", () => {
      editor.updateLayer(l.id, { font: fontSel.value });
    });
    const libBtn = el("button", { class: "btn sm ghost", text: "Biblioteca de fontes", onclick: () => editor.openFontLibrary() });
    const weight = el("select", { class: "input" });
    [100, 300, 400, 500, 700, 900].forEach((w) => weight.appendChild(el("option", { value: w, text: "Peso " + w, ...Number(l.weight) === w ? { selected: "selected" } : {} })));
    weight.addEventListener("change", () => editor.updateLayer(l.id, { weight: Number(weight.value) }));
    const align = el("select", { class: "input" });
    [["left", "Esquerda"], ["center", "Centro"], ["right", "Direita"]].forEach(([v, t]) => align.appendChild(el("option", { value: v, text: t, ...l.align === v ? { selected: "selected" } : {} })));
    align.addEventListener("change", () => editor.updateLayer(l.id, { align: align.value }));
    const italic = el("input", { type: "checkbox" });
    italic.checked = !!l.italic;
    italic.addEventListener("change", () => editor.updateLayer(l.id, { italic: italic.checked }));
    return section("Texto", [
      el("label", { class: "lbl" }, ["Conte\xFAdo", ta]),
      el("label", { class: "lbl" }, ["Fonte", fontSel]),
      libBtn,
      rowLabel("Estilo", [weight, align, el("label", { class: "chk" }, [italic, el("span", { text: "It\xE1lico" })])]),
      rangeRow("Tamanho", 8, 600, l.fontSize, (v) => editor.updateLayer(l.id, { fontSize: v }, { history: false }), "px"),
      rangeRow("Entre letras", -20, 80, l.letterSpacing, (v) => editor.updateLayer(l.id, { letterSpacing: v }, { history: false }), "px"),
      rangeRow("Entre linhas", 60, 300, Math.round((l.lineHeight || 1.2) * 100), (v) => editor.updateLayer(l.id, { lineHeight: v / 100 }, { history: false }), "%"),
      rangeRow("Curvatura", -100, 100, l.curve || 0, (v) => editor.updateLayer(l.id, { curve: v }, { history: false })),
      toggleRow("Quebrar linha", !!l.wrap, (v) => editor.updateLayer(l.id, { wrap: v })),
      l.wrap ? rangeRow("Largura da caixa", 100, 1600, l.textBoxWidth || 500, (v) => editor.updateLayer(l.id, { textBoxWidth: v }, { history: false }), "px") : el("span"),
      colorRow("Cor", l.fill, (v) => editor.updateLayer(l.id, { fill: v }, { history: false })),
      gradientControls(l, () => {
        editor.updateLayer(l.id, {}, { history: false });
      }),
      colorRow("Contorno", l.stroke || "#000000", (v) => editor.updateLayer(l.id, { stroke: v }, { history: false })),
      rangeRow("Espessura do contorno", 0, 40, l.strokeWidth || 0, (v) => editor.updateLayer(l.id, { strokeWidth: v }, { history: false }), "px")
    ]);
  }
  function shapePanel(editor, l) {
    const sel = el("select", { class: "input" });
    SHAPES.forEach((s) => sel.appendChild(el("option", { value: s.id, text: s.label, ...l.kind === s.id ? { selected: "selected" } : {} })));
    sel.addEventListener("change", () => editor.updateLayer(l.id, { kind: sel.value }));
    const rows = [
      el("label", { class: "lbl" }, ["Forma", sel]),
      rangeRow("Tamanho", 10, 1600, l.size, (v) => editor.updateLayer(l.id, { size: v }, { history: false }), "px")
    ];
    if (l.kind === "rect" || l.kind === "ellipse" || l.kind === "ring" || l.kind === "line") {
      rows.push(rangeRow("Largura", 10, 2e3, l.w || l.size, (v) => editor.updateLayer(l.id, { w: v }, { history: false }), "px"));
      if (l.kind !== "line") rows.push(rangeRow("Altura", 10, 2e3, l.h || l.size, (v) => editor.updateLayer(l.id, { h: v }, { history: false }), "px"));
    }
    if (l.kind === "rect") rows.push(rangeRow("Cantos arredondados", 0, 200, l.cornerRadius || 0, (v) => editor.updateLayer(l.id, { cornerRadius: v }, { history: false }), "px"));
    if (l.kind === "star" || l.kind === "hexagon") {
      rows.push(rangeRow("Pontas / lados", 3, 12, l.sides || 5, (v) => editor.updateLayer(l.id, { sides: v }, { history: false })));
    }
    if (l.kind === "star") rows.push(rangeRow("Pontas (profundidade)", 10, 90, Math.round((l.innerRatio || 0.5) * 100), (v) => editor.updateLayer(l.id, { innerRatio: v / 100 }, { history: false }), "%"));
    if (l.kind === "ring") rows.push(rangeRow("Espessura do anel", 5, 80, Math.round((l.ringThickness || 0.22) * 100), (v) => editor.updateLayer(l.id, { ringThickness: v / 100 }, { history: false }), "%"));
    rows.push(colorRow("Preenchimento", l.fill || "#000000", (v) => editor.updateLayer(l.id, { fill: v }, { history: false })));
    rows.push(gradientControls(l, () => editor.updateLayer(l.id, {}, { history: false })));
    rows.push(colorRow("Contorno", l.stroke || "#000000", (v) => editor.updateLayer(l.id, { stroke: v }, { history: false })));
    rows.push(rangeRow("Espessura do contorno", 0, 60, l.strokeWidth || 0, (v) => editor.updateLayer(l.id, { strokeWidth: v }, { history: false }), "px"));
    return section("Forma", rows);
  }
  function imagePanel(editor, l) {
    const rows = [
      rangeRow("Largura", 20, 2e3, l.w || 100, (v) => editor.updateLayer(l.id, { w: v }, { history: false }), "px"),
      rangeRow("Altura", 20, 2e3, l.h || 100, (v) => editor.updateLayer(l.id, { h: v }, { history: false }), "px")
    ];
    const c = l.crop || (l.crop = { sx: 0, sy: 0, sw: 100, sh: 100 });
    rows.push(rangeRow("Recorte: in\xEDcio X", 0, 99, c.sx, (v) => {
      c.sx = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "%"));
    rows.push(rangeRow("Recorte: in\xEDcio Y", 0, 99, c.sy, (v) => {
      c.sy = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "%"));
    rows.push(rangeRow("Recorte: largura", 1, 100, c.sw, (v) => {
      c.sw = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "%"));
    rows.push(rangeRow("Recorte: altura", 1, 100, c.sh, (v) => {
      c.sh = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "%"));
    rows.push(btnRow([
      el("button", { class: "btn sm", text: "\u2702 Recortar / remover fundo", onclick: () => editor.openCutout() }),
      el("button", { class: "btn sm", text: "\u21BA Resetar recorte", onclick: () => {
        l.crop = { sx: 0, sy: 0, sw: 100, sh: 100 };
        editor.updateLayer(l.id, {});
        editor.renderProps();
      } })
    ]));
    const clip = l.clip || (l.clip = { enabled: false, shape: "ellipse", size: 100, dx: 0, dy: 0, sx: 1, sy: 1, radius: 0 });
    rows.push(toggleRow("Recortar por forma (m\xE1scara)", clip.enabled, (v) => {
      clip.enabled = v;
      editor.updateLayer(l.id, {}, { history: false });
    }));
    if (clip.enabled) {
      const cs = el("select", { class: "input" });
      [["ellipse", "C\xEDrculo"], ["rect", "Ret\xE2ngulo"], ["star", "Estrela"], ["hexagon", "Hex\xE1gono"], ["shield", "Escudo"], ["diamond", "Losango"]].forEach(([v, t]) => cs.appendChild(el("option", { value: v, text: t, ...clip.shape === v ? { selected: "selected" } : {} })));
      cs.addEventListener("change", () => {
        clip.shape = cs.value;
        editor.updateLayer(l.id, {});
      });
      rows.push(el("label", { class: "lbl" }, ["Forma da m\xE1scara", cs]));
      rows.push(rangeRow("Tamanho da m\xE1scara", 10, 400, clip.size, (v) => {
        clip.size = v;
        editor.updateLayer(l.id, {}, { history: false });
      }, "px"));
      rows.push(rangeRow("Deslocamento X", -200, 200, clip.dx, (v) => {
        clip.dx = v;
        editor.updateLayer(l.id, {}, { history: false });
      }, "px"));
      rows.push(rangeRow("Deslocamento Y", -200, 200, clip.dy, (v) => {
        clip.dy = v;
        editor.updateLayer(l.id, {}, { history: false });
      }, "px"));
    }
    rows.push(btnRow([
      el("button", { class: "btn sm", text: "\u{1F5BC} Trocar imagem", onclick: () => $("#file-input")?.click() })
    ]));
    return section("Imagem", rows);
  }
  function pathPanel(editor, l) {
    return section("Desenho", [
      rangeRow("Espessura", 1, 90, l.strokeWidth || 6, (v) => editor.updateLayer(l.id, { strokeWidth: v }, { history: false }), "px"),
      colorRow("Cor", l.stroke || "#000000", (v) => editor.updateLayer(l.id, { stroke: v }, { history: false })),
      toggleRow("Suavizar", l.smooth !== false, (v) => editor.updateLayer(l.id, { smooth: v })),
      toggleRow("Preencher (\xEDcone)", !!l.fill, (v) => editor.updateLayer(l.id, { fill: v ? "#0c0c0d" : null })),
      l.fill ? colorRow("Cor do preenchimento", l.fill, (v) => editor.updateLayer(l.id, { fill: v }, { history: false })) : el("span")
    ]);
  }
  function iconPanel(editor, l) {
    return section("\xCDcone", [
      rangeRow("Tamanho", 20, 1200, l.size || 200, (v) => editor.updateLayer(l.id, { size: v }, { history: false }), "px"),
      colorRow("Preenchimento", l.fill || "#000000", (v) => editor.updateLayer(l.id, { fill: v }, { history: false })),
      colorRow("Contorno", l.stroke || "#000000", (v) => editor.updateLayer(l.id, { stroke: v }, { history: false })),
      rangeRow("Espessura do contorno", 0, 40, l.strokeWidth || 0, (v) => editor.updateLayer(l.id, { strokeWidth: v }, { history: false }), "px")
    ]);
  }
  function effectsPanel(editor, l) {
    if (!l) return el("span");
    const s = l.shadow || (l.shadow = { enabled: false, color: "rgba(0,0,0,0.55)", x: 6, y: 6, blur: 10 });
    const f = l.filters || (l.filters = { blur: 0, brightness: 100, contrast: 100, saturate: 100, hue: 0 });
    const rows = [
      toggleRow("Sombra", s.enabled, (v) => {
        s.enabled = v;
        editor.updateLayer(l.id, {}, { history: false });
      })
    ];
    if (s.enabled) {
      rows.push(rangeRow("Sombra: desloc. X", -60, 60, s.x, (v) => {
        s.x = v;
        editor.updateLayer(l.id, {}, { history: false });
      }, "px"));
      rows.push(rangeRow("Sombra: desloc. Y", -60, 60, s.y, (v) => {
        s.y = v;
        editor.updateLayer(l.id, {}, { history: false });
      }, "px"));
      rows.push(rangeRow("Sombra: desfoque", 0, 80, s.blur, (v) => {
        s.blur = v;
        editor.updateLayer(l.id, {}, { history: false });
      }, "px"));
      rows.push(el("label", { class: "row" }, [el("span", { class: "row-lbl", text: "Cor da sombra" }), (() => {
        const i = el("input", { type: "color", value: "#000000" });
        i.addEventListener("input", () => {
          s.color = hexWithAlpha(i.value, 0.55);
          editor.updateLayer(l.id, {}, { history: false });
        });
        return i;
      })()]));
    }
    rows.push(rangeRow("Desfoque", 0, 30, f.blur, (v) => {
      f.blur = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "px"));
    rows.push(rangeRow("Brilho", 20, 220, f.brightness, (v) => {
      f.brightness = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "%"));
    rows.push(rangeRow("Contraste", 20, 220, f.contrast, (v) => {
      f.contrast = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "%"));
    rows.push(rangeRow("Satura\xE7\xE3o", 0, 250, f.saturate, (v) => {
      f.saturate = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "%"));
    rows.push(rangeRow("Matiz", 0, 360, f.hue, (v) => {
      f.hue = v;
      editor.updateLayer(l.id, {}, { history: false });
    }, "\xB0"));
    return section("Efeitos", rows);
  }
  function hexWithAlpha(hex, a) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  function bgControls(editor) {
    const bg = editor.doc.background || (editor.doc.background = { type: "transparent", color: "#ffffff" });
    const sel = el("select", { class: "input" });
    [["transparent", "Transparente"], ["color", "Cor s\xF3lida"], ["gradient", "Gradiente"], ["image", "Imagem"]].forEach(([v, t]) => sel.appendChild(el("option", { value: v, text: t, ...bg.type === v ? { selected: "selected" } : {} })));
    sel.addEventListener("change", () => {
      bg.type = sel.value;
      editor.pushHistory();
      editor.requestRender();
      editor.renderProps();
    });
    const rows = [el("label", { class: "lbl" }, ["Fundo", sel])];
    if (bg.type === "color") rows.push(colorRow("Cor", bg.color, (v) => {
      bg.color = v;
      editor.requestRender();
    }));
    if (bg.type === "gradient") {
      bg.gradient = bg.gradient || { stops: [{ at: 0, color: "#0c0c0d" }, { at: 1, color: "#c8102e" }] };
      bg.gradient.stops.forEach((s, i) => {
        const c = el("input", { type: "color", value: s.color });
        c.addEventListener("input", () => {
          s.color = c.value;
          editor.requestRender();
        });
        rows.push(el("label", { class: "row" }, [el("span", { class: "row-lbl", text: "Cor " + (i + 1) }), c]));
      });
    }
    if (bg.type === "image") {
      rows.push(el("button", {
        class: "btn sm",
        text: "Escolher imagem de fundo",
        onclick: async () => {
          const inp = el("input", { type: "file", accept: "image/*" });
          inp.addEventListener("change", async () => {
            const f = inp.files[0];
            if (!f) return;
            const url = await fileToDataUrl(f);
            editor.images.set("__bg__", await loadImage(url));
            bg.src = url;
            editor.requestRender();
          });
          inp.click();
        }
      }));
    }
    return el("div", {}, rows);
  }
  function templatePreview(id) {
    const c = makeCanvas(180, 180);
    const g = c.getContext("2d");
    g.fillStyle = "#2a2d33";
    g.fillRect(0, 0, 180, 180);
    g.save();
    g.translate(90, 90);
    g.scale(180 / 1e3, 180 / 1e3);
    g.translate(-500, -500);
    const layers = templateLayers(id);
    for (const l of layers) {
      g.save();
      g.globalAlpha = l.opacity ?? 1;
      g.translate(l.x, l.y);
      g.rotate(l.rotation || 0);
      g.scale(l.scale || 1, l.scale || 1);
      if (l.type === "shape") {
        g.beginPath();
        if (l.kind === "rect") g.rect(-(l.w || l.size) / 2, -(l.h || l.size) / 2, l.w || l.size, l.h || l.size);
        else if (l.kind === "ellipse") g.ellipse(0, 0, (l.w || l.size) / 2, (l.h || l.size) / 2, 0, 0, Math.PI * 2);
        else shapePolygon(l.kind, l.size, l.sides || 5, 0.5, 0).forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y));
        g.closePath();
        if (l.fill) {
          g.fillStyle = l.fill;
          g.fill();
        }
        if (l.stroke && l.strokeWidth) {
          g.strokeStyle = l.stroke;
          g.lineWidth = l.strokeWidth;
          g.stroke();
        }
      } else if (l.type === "text") {
        g.font = `${l.weight || 400} ${l.fontSize}px "${l.font}", sans-serif`;
        g.fillStyle = l.fill || "#000";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(l.text, 0, 0);
      }
      g.restore();
    }
    g.restore();
    return c;
  }

  // js/generator.js
  var STYLE_PROFILE = {
    esportivo: { name: ["SPORT", "DYNAMIC", "VELOCITY"], finishes: ["gloss", "matte", "carbon"], accentBias: 0.22, level: "moderado" },
    racing: { name: ["RACING", "PIT LANE", "APEX"], finishes: ["matte", "carbon", "gloss"], accentBias: 0.3, level: "agressivo" },
    street: { name: ["STREET", "URBAN", "CONCRETE"], finishes: ["matte", "textured", "gloss"], accentBias: 0.26, level: "agressivo" },
    premium: { name: ["PREMIUM", "SIGNATURE", "ATELIER"], finishes: ["satin", "piano", "brushed"], accentBias: 0.1, level: "discreto" },
    discreto: { name: ["SUBTLE", "SHADOW", "SILENT"], finishes: ["matte", "satin"], accentBias: 0.06, level: "discreto" },
    agressivo: { name: ["AGGRESSIVE", "BEAST", "FURY"], finishes: ["matte", "carbon"], accentBias: 0.34, level: "extremo" },
    minimalista: { name: ["MINIMAL", "PURE", "CLEAN"], finishes: ["matte", "satin"], accentBias: 0.05, level: "discreto" },
    retro: { name: ["RETRO", "CLASSIC", "HERITAGE"], finishes: ["gloss", "pearl"], accentBias: 0.24, level: "moderado" },
    futurista: { name: ["CYBER", "NEON", "QUANTUM"], finishes: ["holographic", "reflective", "chrome"], accentBias: 0.3, level: "agressivo" },
    militar: { name: ["TACTICAL", "RECON", "STEALTH OPS"], finishes: ["matte", "textured", "carbon"], accentBias: 0.08, level: "moderado" },
    luxuoso: { name: ["LUXE", "GOLD LINE", "MAJESTIC"], finishes: ["piano", "chrome", "pearl"], accentBias: 0.14, level: "moderado" },
    personalizado: { name: ["CUSTOM", "YOUR WAY", "BESPOKE"], finishes: ["matte", "gloss", "carbon"], accentBias: 0.2, level: "moderado" }
  };
  var TITLE_WORDS = [
    "BLACK",
    "DARK",
    "GHOST",
    "PHANTOM",
    "STEALTH",
    "MIDNIGHT",
    "SHADOW",
    "OBSIDIAN",
    "SILVER",
    "CHROME",
    "TITAN",
    "METALLIC",
    "GRAPHITE",
    "CARBON",
    "NIGHT",
    "ROYAL",
    "STORM",
    "VIPER",
    "INFERNO",
    "ARCTIC",
    "MAGMA",
    "ECLIPSE",
    "BLAZE",
    "ONYX"
  ];
  var pick = (arr, i, salt = 0) => arr[Math.abs(Math.floor(i * 2.39996 + salt)) % arr.length];
  function buildBrief(answers) {
    const styles = answers.styles?.length ? answers.styles : ["esportivo"];
    const primary = answers.primary || "#0d0d0f";
    const secondary = answers.secondary || "#1b1c1f";
    const accent = answers.accent || "#c8102e";
    const finishes = answers.finishes?.length ? answers.finishes : ["matte"];
    const level = answers.level || "moderado";
    const areas = answers.areas || [];
    const surface = answers.surface || "outro";
    const free = (answers.description || "").trim();
    return { styles, primary, secondary, accent, finishes, level, areas, surface, free, stats: answers.stats || null };
  }
  function parseFreeText(text) {
    const t = String(text || "").toLowerCase();
    const out = { hints: [], primary: null, secondary: null, accent: null, finishes: [], level: null, styles: [] };
    if (!t) return out;
    const colorMap = {
      "preto": "#0d0d0f",
      "branco": "#f4f5f6",
      "cinza": "#8d949c",
      "grafite": "#2b2e33",
      "prata": "#c7ccd1",
      "vermelho": "#c8102e",
      "azul": "#0b3d91",
      "verde": "#0f7a3d",
      "amarelo": "#f5c400",
      "laranja": "#f26522",
      "roxo": "#5b2c87",
      "dourado": "#c9a227",
      "bronze": "#8c6239",
      "rosa": "#e5447f"
    };
    const found = [];
    for (const [k, v] of Object.entries(colorMap)) if (t.includes(k)) found.push({ k, v, i: t.indexOf(k) });
    found.sort((a, b) => a.i - b.i);
    if (found[0]) {
      out.primary = found[0].v;
      out.hints.push(`cor principal: ${found[0].k}`);
    }
    if (found[1]) {
      out.accent = found[1].v;
      out.hints.push(`detalhe: ${found[1].k}`);
    }
    if (found[2]) {
      out.secondary = found[2].v;
      out.hints.push(`secund\xE1ria: ${found[2].k}`);
    }
    const finishWords = {
      "fosco": "matte",
      "fosca": "matte",
      "brilhante": "gloss",
      "brilho": "gloss",
      "satin": "satin",
      "acetinado": "satin",
      "piano": "piano",
      "carbono": "carbon",
      "fibra de carbono": "carbon",
      "escovado": "brushed",
      "cromado": "chrome",
      "hologr\xE1fico": "holographic",
      "holografico": "holographic",
      "perolizado": "pearl",
      "camale\xE3o": "chameleon",
      "camaleao": "chameleon",
      "refletivo": "reflective",
      "texturizado": "textured",
      "espelhado": "mirror"
    };
    for (const [k, v] of Object.entries(finishWords)) if (t.includes(k) && !out.finishes.includes(v)) {
      out.finishes.push(v);
      out.hints.push(`acabamento: ${k}`);
    }
    if (/agressiv|bruto|extrem|radical/.test(t)) {
      out.level = "agressivo";
      out.styles.push("agressivo");
      out.hints.push("visual agressivo");
    }
    if (/discret|sut|sutil|suave|leve/.test(t)) {
      out.level = "discreto";
      out.styles.push("discreto");
      out.hints.push("visual discreto");
    }
    if (/luxo|luxuos|premium|elegan/.test(t)) {
      out.styles.push("luxuoso");
      out.hints.push("toque premium");
    }
    if (/esportiv|sport|racing|corrida/.test(t)) {
      out.styles.push("racing");
      out.hints.push("pegada racing");
    }
    if (/minimal|limpo|clean|pouco/.test(t)) {
      out.styles.push("minimalista");
      out.hints.push("minimalista");
    }
    if (/militar|t[aá]tico|tactical/.test(t)) {
      out.styles.push("militar");
      out.hints.push("estilo militar");
    }
    if (/futur|neon|cyber/.test(t)) {
      out.styles.push("futurista");
      out.hints.push("estilo futurista");
    }
    if (/reflita prata|refletir prata|prata/.test(t)) {
      out.hints.push("reflexos prateados");
      out.silver = "#c8ced6";
    }
    if (/n[aã]o (quero )?(alterar|mudar|exagerar)|sem exager/.test(t)) out.hints.push("manter estrutura original");
    return out;
  }
  function mergeBrief(answers) {
    const brief = buildBrief(answers);
    const parsed = parseFreeText(brief.free);
    if (parsed.primary) brief.primary = parsed.primary;
    if (parsed.secondary) brief.secondary = parsed.secondary;
    if (parsed.accent) brief.accent = parsed.accent;
    if (parsed.finishes.length) brief.finishes = [.../* @__PURE__ */ new Set([...parsed.finishes, ...brief.finishes])];
    if (parsed.level) brief.level = parsed.level;
    if (parsed.styles.length) brief.styles = [.../* @__PURE__ */ new Set([...brief.styles, ...parsed.styles])];
    brief.silver = parsed.silver || "#c8ced6";
    brief.hints = parsed.hints;
    return brief;
  }
  function optionName(brief, index, stats) {
    const style = STYLE_PROFILE[brief.styles[index % brief.styles.length]] || STYLE_PROFILE.esportivo;
    const primaryName = (ALL_COLORS.find((c) => c.hex.toLowerCase() === String(brief.primary).toLowerCase())?.name || "Custom").split(" ")[0].toUpperCase();
    const accentName = (ALL_COLORS.find((c) => c.hex.toLowerCase() === String(brief.accent).toLowerCase())?.name || "Detalhe").split(" ")[0].toUpperCase();
    const finishLabel = finishById(style.finishes[index % style.finishes.length]).label.toUpperCase();
    const sets = [
      [primaryName, pick(style.name, index, 1)],
      [primaryName, "&", accentName],
      [pick(TITLE_WORDS, index, 3), pick(style.name, index, 2)],
      [primaryName, finishLabel]
    ];
    const s = sets[index % sets.length];
    return "OP\xC7\xC3O " + String(index + 1).padStart(2, "0") + " \u2014 " + s.join(" ");
  }
  function optionDescription(brief, index, stats) {
    const style = STYLE_PROFILE[brief.styles[index % brief.styles.length]] || STYLE_PROFILE.esportivo;
    const finish = finishById(style.finishes[index % style.finishes.length]);
    const base = ALL_COLORS.find((c) => c.hex.toLowerCase() === String(brief.primary).toLowerCase())?.name || "cor principal";
    const accent = ALL_COLORS.find((c) => c.hex.toLowerCase() === String(brief.accent).toLowerCase())?.name || "cor de detalhe";
    const lvl = levelById(brief.level);
    const coverage = Math.round(lvl.cover * 100);
    const phrases = [
      `Predomin\xE2ncia em ${base.toLowerCase()} com acabamento ${finish.label.toLowerCase()}, detalhes em ${accent.toLowerCase()} e grafismos ${lvl.label.toLowerCase()}s.`,
      `${base} como base, recortes em ${accent.toLowerCase()} e ${finish.label.toLowerCase()} nas \xE1reas de destaque \u2014 cerca de ${coverage}% de cobertura.`,
      `Visual ${brief.styles[index % brief.styles.length]}: ${base.toLowerCase()} + ${accent.toLowerCase()}, textura ${finish.label.toLowerCase()}. Estrutura original preservada.`,
      `Combina\xE7\xE3o de ${base.toLowerCase()} e ${finish.label.toLowerCase()}, com filetes em ${accent.toLowerCase()} acompanhando as linhas do objeto.`
    ];
    let extra = "";
    if (stats) {
      if (stats.edgeDensity > 0.18) extra = " Detectamos muitas arestas e recortes \u2014 a arte foi ajustada para acompanhar os pain\xE9is.";
      else if (stats.brightRatio > 0.4) extra = " A foto tem bastante reflexo; mantivemos as \xE1reas claras para preservar o volume.";
      else if (stats.darkRatio > 0.55) extra = " A foto \xE9 escura, ent\xE3o refor\xE7amos o contraste do envelopamento.";
    }
    return phrases[index % phrases.length] + extra;
  }
  function generateOptions(brief, stats) {
    const opts = [];
    const styleList = brief.styles.length ? brief.styles : ["esportivo"];
    const finishList = brief.finishes.length ? brief.finishes : ["matte"];
    for (let i = 0; i < 4; i++) {
      const style = STYLE_PROFILE[styleList[i % styleList.length]] || STYLE_PROFILE.esportivo;
      const finish = finishList[i] || style.finishes[i % style.finishes.length] || "matte";
      const level = i === 0 ? brief.level : i === 1 ? brief.level === "discreto" ? "moderado" : brief.level : i === 2 ? brief.level === "extremo" ? "agressivo" : levelUp(brief.level) : "discreto";
      const accentAmount = Math.min(0.42, Math.max(0.04, style.accentBias + (i - 1) * 0.05));
      opts.push({
        id: "opt_" + (i + 1),
        index: i,
        name: optionName(brief, i, stats),
        description: optionDescription(brief, i, stats),
        style: styleList[i % styleList.length],
        finish,
        level,
        surface: brief.surface,
        areas: brief.areas,
        colors: {
          base: brief.primary,
          accent: brief.accent,
          secondary: brief.secondary,
          silver: brief.silver || "#c8ced6"
        },
        accentAmount,
        accentAngle: 0.25 + i * 0.32,
        silverStart: 0.58 + i * 0.04,
        silverStrength: 0.7 + i * 0.06,
        gfxAlpha: [0.9, 0.75, 0.85, 0.5][i],
        mix: buildMix(finish, i, brief),
        brief,
        stats
      });
    }
    return opts;
  }
  function levelUp(l) {
    const order = ["discreto", "moderado", "agressivo", "extremo"];
    return order[Math.min(order.length - 1, order.indexOf(l) + 1)];
  }
  function buildMix(finish, i, brief) {
    const second = brief.finishes[(i + 1) % Math.max(1, brief.finishes.length)] || finish;
    if (second === finish) return [{ finish, pct: 100 }];
    const table = [
      [{ finish, pct: 70 }, { finish: second, pct: 20 }, { finish: "carbon", pct: 10 }],
      [{ finish, pct: 60 }, { finish: second, pct: 40 }],
      [{ finish, pct: 80 }, { finish: "reflective", pct: 20 }],
      [{ finish, pct: 100 }]
    ];
    return table[i % table.length];
  }
  function analysisReport(stats, surface) {
    if (!stats) return [];
    const rows = [];
    rows.push(["Tipo detectado", surfaceLabel(surface)]);
    rows.push(["Propor\xE7\xE3o da foto", `${stats.aspect.toFixed(2)} : 1`]);
    rows.push(["\xC1reas escuras", `${Math.round(stats.darkRatio * 100)}%`]);
    rows.push(["\xC1reas m\xE9dias", `${Math.round(stats.midRatio * 100)}%`]);
    rows.push(["\xC1reas claras / reflexos", `${Math.round(stats.brightRatio * 100)}%`]);
    rows.push(["Densidade de arestas", stats.edgeDensity > 0.2 ? "alta (muitos recortes)" : stats.edgeDensity > 0.1 ? "m\xE9dia" : "baixa (superf\xEDcie lisa)"]);
    rows.push(["Satura\xE7\xE3o m\xE9dia", stats.avgSat > 0.3 ? "colorida" : stats.avgSat > 0.12 ? "neutra" : "quase monocrom\xE1tica"]);
    rows.push(["Pe\xE7as preservadas", "rodas, far\xF3is, retrovisores, escapamento e geometria"]);
    return rows;
  }
  function surfaceLabel(id) {
    const s = { carro: "Carro", moto: "Moto", caminhao: "Caminh\xE3o", van: "Van / Utilit\xE1rio", capacete: "Capacete", movel: "M\xF3vel", cozinha: "Cozinha", armario: "Arm\xE1rio", mesa: "Mesa", eletro: "Eletrodom\xE9stico", outro: "Superf\xEDcie personalizada" };
    return s[id] || "Superf\xEDcie personalizada";
  }

  // js/ai.js
  var KEY = "wrapstudio.ai.config";
  function getAIConfig() {
    return LS.get(KEY, { enabled: false, provider: "gemini", key: "", model: "gemini-2.5-flash-image", fluxModel: "black-forest-labs/flux-1.1-pro" });
  }
  function saveAIConfig(cfg) {
    LS.set(KEY, cfg);
  }
  function realAIReady() {
    const c = getAIConfig();
    return !!(c.enabled && c.key && c.key.length > 10);
  }
  function buildPrompt({ brief, option, surfaceLabel: surfaceLabel2 }) {
    const c = option.colors;
    const styleName = option.style;
    const finishName = option.finish;
    const level = option.level;
    return [
      "Voc\xEA \xE9 um designer especializado em ENVELOPAMENTO (wrapping) de ve\xEDculos e m\xF3veis.",
      `Aplique um envelopamento de vinil no objeto da foto: ${surfaceLabel2}.`,
      `Proposta "${option.name}": predomin\xE2ncia de ${c.base}, detalhes em ${c.accent}, secund\xE1ria ${c.secondary}.`,
      `Estilo: ${styleName}. Acabamento: ${finishName}. N\xEDvel de personaliza\xE7\xE3o: ${level}.`,
      "REGRAS OBRIGAT\xD3RIAS:",
      "- N\xC3O altere a geometria, o formato, as propor\xE7\xF5es nem o desenho original do objeto.",
      "- N\xC3O modifique rodas, far\xF3is, lanternas, retrovisores, escapamento, vidros ou componentes mec\xE2nicos.",
      "- N\xC3O mude o \xE2ngulo da c\xE2mera, o fundo, o piso nem a ilumina\xE7\xE3o da foto.",
      "- Apenas substitua a cor/acabamento das superf\xEDcies pint\xE1veis pelo vinil descrito.",
      "- O resultado deve parecer uma FOTOGRAFIA REAL de um envelopamento aplicado, com recortes precisos nos pain\xE9is.",
      brief.free ? `- Pedido do cliente: "${brief.free}"` : ""
    ].filter(Boolean).join("\n");
  }
  async function generateWithAI({ imageEl, option, surfaceLabel: surfaceLabel2, onStatus }) {
    const cfg = getAIConfig();
    if (!cfg.enabled || !cfg.key) throw new Error("IA real desativada. Adicione sua chave em Configura\xE7\xF5es.");
    const prompt = buildPrompt({ brief: option.brief || {}, option, surfaceLabel: surfaceLabel2 });
    if (cfg.provider === "gemini") return await callGemini(cfg, imageEl, prompt, onStatus);
    if (cfg.provider === "flux") return await callFlux(cfg, imageEl, prompt, onStatus);
    throw new Error("Provedor desconhecido: " + cfg.provider);
  }
  async function imageToPngDataUrl(img, maxSide = 1024) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const k = Math.min(1, maxSide / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.round(w * k);
    c.height = Math.round(h * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/png");
    return { base64: url.split(",")[1], mime: "image/png" };
  }
  async function callGemini(cfg, img, prompt, onStatus) {
    const { base64, mime } = await imageToPngDataUrl(img);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model || "gemini-2.5-flash-image"}:generateContent`;
    onStatus && onStatus("Enviando para o Gemini\u2026");
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] }],
        generationConfig: { responseModalities: ["IMAGE"] }
      })
    });
    if (!r.ok) {
      let msg = "HTTP " + r.status;
      try {
        const j2 = await r.json();
        msg = j2?.error?.message || msg;
      } catch {
      }
      throw new Error("Gemini: " + msg);
    }
    const j = await r.json();
    const parts = j?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
    if (!imgPart) throw new Error("Gemini n\xE3o retornou imagem (talvez o modelo precise de outro nome).");
    const data = imgPart.inlineData?.data || imgPart.inline_data?.data;
    const mimeType = imgPart.inlineData?.mimeType || imgPart.inline_data?.mime_type || "image/png";
    return { dataUrl: `data:${mimeType};base64,${data}`, provider: "Gemini" };
  }
  async function callFlux(cfg, img, prompt, onStatus) {
    const { base64 } = await imageToPngDataUrl(img, 768);
    onStatus && onStatus("Criando tarefa no Flux\u2026");
    const model = cfg.fluxModel || "black-forest-labs/flux-1.1-pro";
    const create = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${cfg.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        version: void 0,
        model,
        input: { prompt, image: `data:image/png;base64,${base64}`, aspect_ratio: "match_input_image", output_format: "png" }
      })
    });
    if (!create.ok) {
      let msg = "HTTP " + create.status;
      try {
        const j = await create.json();
        msg = j?.detail || JSON.stringify(j) || msg;
      } catch {
      }
      throw new Error("Flux: " + msg);
    }
    const job = await create.json();
    let current = job;
    for (let i = 0; i < 90; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const poll = await fetch(current.urls.get, { headers: { "Authorization": `Bearer ${cfg.key}` } });
      current = await poll.json();
      onStatus && onStatus("Gerando\u2026 " + (current.status || ""));
      if (current.status === "succeeded") break;
      if (current.status === "failed" || current.status === "canceled") throw new Error("Flux falhou: " + (current.error || current.status));
    }
    const out = current.output;
    const fileUrl = Array.isArray(out) ? out[0] : out;
    if (!fileUrl) throw new Error("Flux n\xE3o retornou imagem.");
    onStatus && onStatus("Baixando imagem gerada\u2026");
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error("N\xE3o foi poss\xEDvel baixar a imagem gerada.");
    const blob = await resp.blob();
    const dataUrl = await new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.readAsDataURL(blob);
    });
    return { dataUrl, provider: "Flux" };
  }

  // js/ai-designer.js
  var AIDesigner = class {
    constructor(root, app) {
      this.root = root;
      this.app = app;
      this.step = 0;
      this.state = {
        photos: [],
        // { id, dataUrl, view, img }
        surface: "moto",
        answers: { styles: ["esportivo"], primary: "#0d0d0f", secondary: "#2b2e33", accent: "#c8102e", finishes: ["matte"], level: "moderado", areas: [], description: "", useRealAI: false },
        stats: null,
        options: [],
        selected: null
      };
      this.container = $("#ai-body", root);
      $$("#ai-steps .step").forEach((s, i) => s.addEventListener("click", () => {
        if (i <= this.maxStep()) this.go(i);
      }));
      this.render();
    }
    maxStep() {
      if (!this.state.photos.length) return 0;
      if (!this.state.options.length) return 1;
      return this.state.selected ? 3 : 2;
    }
    go(i) {
      this.step = clamp(i, 0, 3);
      this.render();
    }
    render() {
      $$("#ai-steps .step").forEach((s, i) => {
        s.classList.toggle("active", i === this.step);
        s.classList.toggle("done", i < this.step);
      });
      this.container.innerHTML = "";
      [this.renderUpload, this.renderBrief, this.renderOptions, this.renderQuote][this.step].call(this);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    /* ============ PASSO 1 — UPLOAD ============ */
    renderUpload() {
      const c = this.container;
      c.appendChild(el("h2", { class: "view-title", text: "Envie a foto do que voc\xEA quer envelopar" }));
      c.appendChild(el("p", { class: "view-sub", text: "Carro, moto, caminh\xE3o, capacete, m\xF3vel, cozinha, arm\xE1rio, eletrodom\xE9stico\u2026 qualquer superf\xEDcie. Quanto melhor a foto, mais fiel o resultado." }));
      const grid = el("div", { class: "surface-grid" });
      for (const s of SURFACES) {
        const b = el("button", { class: "surface-card" + (this.state.surface === s.id ? " sel" : "") });
        b.appendChild(el("span", { class: "sicon", text: s.icon }));
        b.appendChild(el("span", { class: "slabel", text: s.label }));
        b.addEventListener("click", () => {
          this.state.surface = s.id;
          this.render();
        });
        grid.appendChild(b);
      }
      c.appendChild(el("h3", { class: "block-title", text: "Tipo de superf\xEDcie" }));
      c.appendChild(grid);
      c.appendChild(el("h3", { class: "block-title", text: "Fotos (aceita v\xE1rias \u2014 frente, traseira, laterais, 3/4)" }));
      const drop = el("div", { class: "dropzone", html: '<div class="dz-ico">\u{1F4F7}</div><div><strong>Arraste fotos aqui</strong> ou clique para escolher<br><small>JPG, PNG ou WEBP</small></div>' });
      const input = el("input", { type: "file", accept: "image/jpeg,image/png,image/webp", multiple: "multiple", style: "display:none" });
      drop.addEventListener("click", () => input.click());
      ["dragover", "dragenter"].forEach((ev) => drop.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.add("over");
      }));
      ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.remove("over");
      }));
      drop.addEventListener("drop", (e) => this.addFiles(e.dataTransfer.files));
      input.addEventListener("change", (e) => this.addFiles(e.target.files));
      c.appendChild(drop);
      c.appendChild(input);
      const thumbs = el("div", { class: "photo-strip" });
      if (!this.state.photos.length) thumbs.appendChild(el("p", { class: "hint", text: "Nenhuma foto ainda. A primeira foto enviada \xE9 usada como base da simula\xE7\xE3o." }));
      this.state.photos.forEach((p, idx) => {
        const card = el("div", { class: "photo-card" });
        const img = el("img", { src: p.dataUrl });
        card.appendChild(img);
        const sel = el("select", { class: "input mini" });
        VIEWS.forEach((v) => sel.appendChild(el("option", { value: v.id, text: v.label, ...p.view === v.id ? { selected: "selected" } : {} })));
        sel.addEventListener("change", () => {
          p.view = sel.value;
        });
        card.appendChild(sel);
        const base = el("label", { class: "chk" }, [el("input", { type: "radio", name: "base", ...idx === 0 ? { checked: "checked" } : {} }), el("span", { text: " usar como base" })]);
        base.querySelector("input").addEventListener("change", () => {
          const [moved] = this.state.photos.splice(idx, 1);
          this.state.photos.unshift(moved);
          this.render();
        });
        card.appendChild(base);
        card.appendChild(el("button", { class: "mini danger", text: "\u2715", onclick: () => {
          this.state.photos.splice(idx, 1);
          this.render();
        } }));
        thumbs.appendChild(card);
      });
      c.appendChild(thumbs);
      const next = el("button", { class: "btn primary big", text: "Continuar \u2192" });
      next.disabled = !this.state.photos.length;
      next.addEventListener("click", () => this.go(1));
      c.appendChild(el("div", { class: "row-end" }, [next]));
    }
    async addFiles(fileList) {
      const files = Array.from(fileList || []).filter((f) => /^image\/(jpeg|png|webp)/.test(f.type));
      if (!files.length) return toast("Envie JPG, PNG ou WEBP", "err");
      for (const f of files) {
        try {
          let dataUrl = await fileToDataUrl(f);
          let img = await loadImage(dataUrl);
          const packed = compressImage(img, 1600, f.type === "image/png" ? "image/png" : "image/jpeg");
          if (packed) {
            dataUrl = packed;
            img = await loadImage(packed);
          }
          this.state.photos.push({ id: uid("p"), dataUrl, view: VIEWS[Math.min(this.state.photos.length, VIEWS.length - 1)].id, img });
        } catch {
          toast("Falha ao ler " + f.name, "err");
        }
      }
      this.render();
    }
    /* ============ PASSO 2 — QUESTIONÁRIO ============ */
    renderBrief() {
      const c = this.container;
      const a = this.state.answers;
      c.appendChild(el("h2", { class: "view-title", text: "Como voc\xEA imagina o envelopamento?" }));
      c.appendChild(el("p", { class: "view-sub", text: "Responda o b\xE1sico. Se preferir, escreva tudo no campo de descri\xE7\xE3o \u2014 a IA interpreta o texto." }));
      const styleGrid = el("div", { class: "chip-grid" });
      STYLES.forEach((s) => {
        const b = el("button", { class: "chip" + (a.styles.includes(s.id) ? " sel" : ""), text: s.icon + " " + s.label });
        b.addEventListener("click", () => {
          a.styles = a.styles.includes(s.id) ? a.styles.filter((x) => x !== s.id) : [...a.styles, s.id];
          b.classList.toggle("sel");
        });
        styleGrid.appendChild(b);
      });
      c.appendChild(block("Qual estilo voc\xEA quer?", "Pode escolher v\xE1rios", styleGrid));
      const colorBox = el("div", { class: "color-picker" });
      const roles = [
        { key: "primary", label: "Cor principal" },
        { key: "secondary", label: "Cor secund\xE1ria" },
        { key: "accent", label: "Cor de detalhes" }
      ];
      for (const role of roles) {
        const row = el("div", { class: "color-role" });
        row.appendChild(el("h4", { text: role.label }));
        const swatches = el("div", { class: "swatches" });
        COLOR_GROUPS.forEach((g) => {
          g.colors.forEach((col) => {
            const b = el("button", { class: "swatch" + (a[role.key] === col.hex ? " sel" : ""), title: col.name, style: `background:${col.hex}` });
            b.addEventListener("click", () => {
              a[role.key] = col.hex;
              $$(".swatch", swatches).forEach((x) => x.classList.remove("sel"));
              b.classList.add("sel");
              custom.value = col.hex;
            });
            swatches.appendChild(b);
          });
        });
        const custom = el("input", { type: "color", value: a[role.key] });
        custom.addEventListener("input", () => {
          a[role.key] = custom.value;
          $$(".swatch", swatches).forEach((x) => x.classList.remove("sel"));
        });
        row.appendChild(swatches);
        row.appendChild(el("label", { class: "row" }, [el("span", { class: "row-lbl", text: "Outra cor" }), custom]));
        colorBox.appendChild(row);
      }
      c.appendChild(block("Quais cores voc\xEA deseja?", "Principal, secund\xE1ria e detalhes", colorBox));
      const finGrid = el("div", { class: "chip-grid" });
      FINISHES.forEach((f) => {
        const b = el("button", { class: "chip" + (a.finishes.includes(f.id) ? " sel" : ""), title: f.note, text: f.label });
        b.addEventListener("click", () => {
          a.finishes = a.finishes.includes(f.id) ? a.finishes.filter((x) => x !== f.id) : [...a.finishes, f.id];
          b.classList.toggle("sel");
          renderMix();
        });
        finGrid.appendChild(b);
      });
      const mixBox = el("div", { class: "mix-box" });
      function renderMix() {
        mixBox.innerHTML = "";
        if (a.finishes.length < 2) {
          mixBox.appendChild(el("p", { class: "hint", text: "Escolha 2 ou mais acabamentos para combinar percentuais (ex.: 70% fosco, 20% brilhante, 10% carbono)." }));
          return;
        }
        mixBox.appendChild(el("h4", { text: "Combina\xE7\xE3o de acabamentos" }));
        const sliders = [];
        const total = el("span", { class: "val" });
        a.mix = a.mix && a.mix.length === a.finishes.length ? a.mix : a.finishes.map((f, i) => ({ finish: f, pct: i === 0 ? 70 : i === 1 ? 20 : 10 }));
        a.finishes.forEach((f, i) => {
          const s = el("input", { type: "range", min: 0, max: 100, value: a.mix[i].pct });
          const lbl = el("span", { class: "row-lbl", text: finishById(f).label });
          const v = el("span", { class: "val", text: a.mix[i].pct + "%" });
          s.addEventListener("input", () => {
            a.mix[i].pct = Number(s.value);
            v.textContent = s.value + "%";
            updateTotal();
          });
          sliders.push(s);
          mixBox.appendChild(el("label", { class: "row range" }, [lbl, s, v]));
        });
        function updateTotal() {
          const t = a.mix.reduce((x, y) => x + y.pct, 0);
          total.textContent = t + "% do total";
          total.style.color = t === 100 ? "#3ddc84" : "#f2b134";
        }
        mixBox.appendChild(el("div", { class: "row-end" }, [total]));
        updateTotal();
      }
      c.appendChild(block("Acabamento", "Pode combinar v\xE1rios", el("div", {}, [finGrid, mixBox])));
      renderMix();
      const lvlGrid = el("div", { class: "level-grid" });
      LEVELS.forEach((l) => {
        const b = el("button", { class: "level-card" + (a.level === l.id ? " sel" : "") });
        b.appendChild(el("strong", { text: l.label }));
        b.appendChild(el("small", { text: l.desc }));
        b.appendChild(el("span", { class: "bar" }, [el("i", { style: `width:${Math.round(l.cover * 100)}%` })]));
        b.addEventListener("click", () => {
          a.level = l.id;
          $$(".level-card", lvlGrid).forEach((x) => x.classList.remove("sel"));
          b.classList.add("sel");
        });
        lvlGrid.appendChild(b);
      });
      c.appendChild(block("Quanto voc\xEA quer modificar?", "", lvlGrid));
      const areaGrid = el("div", { class: "chip-grid" });
      AREAS.forEach((ar) => {
        const b = el("button", { class: "chip" + (a.areas.includes(ar.id) ? " sel" : ""), text: ar.label });
        b.addEventListener("click", () => {
          a.areas = a.areas.includes(ar.id) ? a.areas.filter((x) => x !== ar.id) : [...a.areas, ar.id];
          b.classList.toggle("sel");
        });
        areaGrid.appendChild(b);
      });
      c.appendChild(block("Quais \xE1reas ser\xE3o envelopadas?", "Se n\xE3o souber, deixe em branco \u2014 a IA sugere.", areaGrid));
      const ta = el("textarea", { class: "input big", rows: "5", placeholder: "Ex.: Quero deixar essa moto mais agressiva. Predomin\xE2ncia de preto fosco, detalhes em preto brilhante, algumas partes que reflitam prata e pequenos detalhes em vermelho. N\xE3o quero alterar as pe\xE7as da moto." });
      ta.value = a.description;
      ta.addEventListener("input", debounce(() => {
        a.description = ta.value;
      }, 200));
      const examples = [
        "Quero predomin\xE2ncia de preto fosco com detalhes em vermelho e partes que reflitam prata.",
        "Visual discreto: grafite fosco nas laterais e filete fino prateado.",
        "Estilo racing: carbono no tanque, faixas vermelhas e n\xFAmero branco."
      ];
      const exRow = el("div", { class: "chip-row" });
      examples.forEach((t) => {
        const b = el("button", { class: "chip small", text: "\u201C" + t.slice(0, 42) + "\u2026\u201D" });
        b.addEventListener("click", () => {
          ta.value = t;
          a.description = t;
        });
        exRow.appendChild(b);
      });
      c.appendChild(block("Descreva como voc\xEA imagina", "Pode escrever livremente \u2014 a IA interpreta", el("div", {}, [ta, exRow])));
      const aiCfg = getAIConfig();
      const aiRow = el("div", { class: "ai-toggle" });
      const chk = el("input", { type: "checkbox" });
      chk.checked = !!a.useRealAI;
      chk.disabled = !realAIReady();
      chk.addEventListener("change", () => a.useRealAI = chk.checked);
      aiRow.appendChild(el("label", { class: "chk" }, [chk, el("span", { text: realAIReady() ? "Usar IA de imagem real (" + aiCfg.provider + ")" : "IA real indispon\xEDvel \u2014 configure a chave em \u2699 Configura\xE7\xF5es" })]));
      c.appendChild(aiRow);
      const nav = el("div", { class: "nav-row" }, [
        el("button", { class: "btn ghost", text: "\u2190 Voltar", onclick: () => this.go(0) }),
        el("button", { class: "btn primary big", text: "\u{1FA84} Gerar op\xE7\xF5es com IA", onclick: () => this.generate() })
      ]);
      c.appendChild(nav);
    }
    /* ============ PASSO 3 — OPÇÕES ============ */
    async generate() {
      const base = this.state.photos[0];
      if (!base) return toast("Envie uma foto primeiro", "err");
      this.go(2);
      const c = this.container;
      c.innerHTML = "";
      c.appendChild(el("h2", { class: "view-title", text: "Analisando sua foto\u2026" }));
      const bar = el("div", { class: "progress" }, [el("i")]);
      c.appendChild(bar);
      const status = el("p", { class: "hint", text: "Preparando\u2026" });
      c.appendChild(status);
      const setProgress = (p, txt) => {
        bar.querySelector("i").style.width = p * 100 + "%";
        if (txt) status.textContent = txt;
      };
      try {
        await new Promise((r) => setTimeout(r, 120));
        setProgress(0.15, "Lendo pixels, cores e propor\xE7\xF5es\u2026");
        const src = fitCanvas(base.img, 1280);
        const stats = await analyzeImageAsync(src);
        this.state.stats = stats;
        setProgress(0.35, "Identificando o objeto e separando o fundo\u2026");
        const mask = silhouetteMask(src, src.width, src.height, 36);
        this.state.mask = mask;
        setProgress(0.5, "Interpretando sua descri\xE7\xE3o\u2026");
        const brief = mergeBrief({ ...this.state.answers, surface: this.state.surface, stats });
        this.state.brief = brief;
        setProgress(0.62, "Montando 4 propostas de envelopamento\u2026");
        const options = generateOptions(brief, stats);
        for (let i = 0; i < options.length; i++) {
          setProgress(0.65 + i * 0.08, `Renderizando ${options[i].name}\u2026`);
          await new Promise((r) => setTimeout(r, 30));
          const canvas = renderWrap(src, options[i], { mask });
          options[i].canvas = canvas;
          options[i].dataUrl = canvas.toDataURL("image/jpeg", 0.86);
        }
        this.state.options = options;
        setProgress(1, "Pronto!");
        await new Promise((r) => setTimeout(r, 200));
        this.renderOptions();
      } catch (e) {
        console.error(e);
        c.innerHTML = "";
        c.appendChild(el("h2", { class: "view-title", text: "N\xE3o consegui analisar a foto" }));
        c.appendChild(el("p", { class: "hint", text: String(e.message || e) }));
        c.appendChild(el("button", { class: "btn primary", text: "\u2190 Voltar", onclick: () => this.go(1) }));
      }
    }
    renderOptions() {
      const c = this.container;
      const opts = this.state.options;
      if (!opts.length) return this.go(1);
      c.appendChild(el("h2", { class: "view-title", text: "Aqui est\xE3o as propostas para o seu " + surfaceLabel(this.state.surface).toLowerCase() }));
      c.appendChild(el("p", { class: "view-sub", text: "A mesma foto, 4 caminhos diferentes. Escolha uma e ajuste o que quiser \u2014 ou pe\xE7a outra rodada." }));
      const rows = analysisReport(this.state.stats, this.state.surface);
      const table = el("div", { class: "analysis" });
      rows.forEach(([k, v]) => table.appendChild(el("div", { class: "an-row" }, [el("span", { text: k }), el("strong", { text: v })])));
      const det = el("details", { class: "analysis-box" }, [el("summary", { text: "\u{1F50E} O que a IA detectou na sua foto" }), table]);
      if (this.state.brief?.hints?.length) {
        det.appendChild(el("p", { class: "hint", text: "Do seu texto: " + this.state.brief.hints.join(" \xB7 ") }));
      }
      c.appendChild(det);
      const grid = el("div", { class: "options-grid" });
      opts.forEach((o, i) => {
        const card = el("div", { class: "option-card" + (this.state.selected === i ? " sel" : "") });
        const imgBox = el("div", { class: "option-img" });
        const img = el("img", { src: o.dataUrl, alt: o.name });
        imgBox.appendChild(img);
        const badge = el("span", { class: "badge", text: "OP\xC7\xC3O " + String(i + 1).padStart(2, "0") });
        imgBox.appendChild(badge);
        card.appendChild(imgBox);
        card.appendChild(el("h3", { text: o.name.replace(/^OPÇÃO \d+ — /, "") }));
        card.appendChild(el("p", { class: "opt-desc", text: o.description }));
        const meta = el("div", { class: "opt-meta" });
        meta.appendChild(tag(finishById(o.finish).label));
        meta.appendChild(tag("N\xEDvel: " + o.level));
        (o.mix || []).forEach((m) => meta.appendChild(tag(`${finishById(m.finish).label} ${m.pct}%`)));
        card.appendChild(meta);
        const swatches = el("div", { class: "opt-swatches" });
        ["base", "accent", "secondary"].forEach((k) => swatches.appendChild(el("span", { class: "dot", style: `background:${o.colors[k]}`, title: k })));
        card.appendChild(swatches);
        const actions = el("div", { class: "opt-actions" });
        actions.appendChild(el("button", {
          class: "btn sm",
          text: "\u{1F50D} Comparar antes/depois",
          onclick: () => this.compare(o)
        }));
        actions.appendChild(el("button", {
          class: "btn sm primary",
          text: "Escolher esta",
          onclick: () => {
            this.state.selected = i;
            this.renderOptions();
            this.go(3);
          }
        }));
        if (realAIReady()) {
          actions.appendChild(el("button", {
            class: "btn sm ghost",
            text: "\u2728 Gerar com IA real",
            onclick: (e) => this.generateReal(o, e.target)
          }));
        }
        card.appendChild(actions);
        grid.appendChild(card);
      });
      c.appendChild(grid);
      c.appendChild(el("div", { class: "nav-row" }, [
        el("button", { class: "btn ghost", text: "\u2190 Ajustar ideia", onclick: () => this.go(1) }),
        el("button", { class: "btn", text: "\u{1F3B2} Gerar outras 4", onclick: () => {
          this.state.answers.styles = shuffle(this.state.answers.styles);
          this.generate();
        } })
      ]));
    }
    async generateReal(option, btn) {
      btn.disabled = true;
      const old = btn.textContent;
      btn.textContent = "Gerando\u2026";
      try {
        const res = await generateWithAI({ imageEl: this.state.photos[0].img, option, surfaceLabel: surfaceLabel(this.state.surface), onStatus: (s) => btn.textContent = s });
        option.dataUrl = res.dataUrl;
        option.realAI = true;
        btn.textContent = "\u2705 Feito (" + res.provider + ")";
        this.renderOptions();
        toast("Imagem gerada com " + res.provider, "ok");
      } catch (e) {
        btn.textContent = old;
        btn.disabled = false;
        toast(String(e.message || e), "err", 6e3);
      }
    }
    compare(option) {
      const before = this.state.photos[0].dataUrl;
      const body = el("div", { class: "compare" });
      const box = el("div", { class: "compare-box" });
      const a = el("img", { src: before, class: "cmp-img" });
      const b = el("img", { src: option.dataUrl, class: "cmp-img" });
      box.appendChild(a);
      box.appendChild(b);
      const range = el("input", { type: "range", min: 0, max: 100, value: 50, class: "cmp-range" });
      range.addEventListener("input", () => {
        b.style.clipPath = `inset(0 0 0 ${range.value}%)`;
      });
      b.style.clipPath = "inset(0 0 0 50%)";
      body.appendChild(box);
      body.appendChild(range);
      body.appendChild(el("p", { class: "hint", text: "Arraste para comparar. Esquerda: original. Direita: envelopamento." }));
      openModal({ title: option.name, body, wide: true });
    }
    /* ============ PASSO 4 — ORÇAMENTO ============ */
    renderQuote() {
      const c = this.container;
      const i = this.state.selected;
      const o = this.state.options[i];
      if (!o) return this.go(2);
      const pricing = this.app.pricing;
      c.appendChild(el("h2", { class: "view-title", text: "Resumo e or\xE7amento \u2014 " + o.name }));
      const wrap = el("div", { class: "quote-layout" });
      const left = el("div", { class: "quote-left" });
      left.appendChild(el("img", { class: "quote-img", src: o.dataUrl }));
      left.appendChild(el("div", { class: "opt-meta" }, [tag(finishById(o.finish).label), tag("N\xEDvel: " + o.level), tag(surfaceLabel(this.state.surface))]));
      left.appendChild(el("p", { class: "opt-desc", text: o.description }));
      wrap.appendChild(left);
      const right = el("div", { class: "quote-right" });
      const areaM2 = estimateArea(this.state.surface, o.level, this.state.answers.areas);
      const finishes = (o.mix && o.mix.length ? o.mix : [{ finish: o.finish, pct: 100 }]).map((m) => ({ id: m.finish, pct: m.pct }));
      const quote = calcQuote({ areaM2, finishes, pricing });
      this.state.quote = quote;
      this.state.areaM2 = areaM2;
      const rows = [
        ["\xC1rea estimada", quote.formatted.area],
        ["Material (com perda de " + Math.round(pricing.wasteFactor * 100) + "%)", quote.formatted.material],
        ["Aplica\xE7\xE3o / m\xE3o de obra", quote.formatted.labor],
        ["Arte e design", quote.formatted.design]
      ];
      const box = el("div", { class: "quote-box" });
      rows.forEach(([k, v]) => box.appendChild(el("div", { class: "an-row" }, [el("span", { text: k }), el("strong", { text: v })])));
      box.appendChild(el("div", { class: "an-row total" }, [el("span", { text: "TOTAL ESTIMADO" }), el("strong", { text: quote.formatted.total })]));
      right.appendChild(box);
      right.appendChild(el("p", { class: "hint", text: "Estimativa autom\xE1tica. O valor final \xE9 confirmado ap\xF3s medi\xE7\xE3o e escolha do vinil." }));
      const areaInput = el("input", { class: "input", type: "number", step: "0.1", value: areaM2.toFixed(1) });
      areaInput.addEventListener("change", () => {
        const v = Number(areaInput.value);
        if (v > 0) {
          this.state.areaM2 = v;
          this.renderQuote();
        }
      });
      right.appendChild(el("label", { class: "row" }, [el("span", { class: "row-lbl", text: "Ajustar \xE1rea (m\xB2)" }), areaInput]));
      const note = el("textarea", { class: "input", rows: "3", placeholder: "Observa\xE7\xF5es para o or\xE7amento (prazo, cidade, onde aplicar\u2026)" });
      right.appendChild(el("label", { class: "lbl" }, ["Observa\xE7\xF5es", note]));
      const phone = pricing.whatsapp || "";
      const btnWa = el("button", {
        class: "btn wa big",
        text: "\u{1F4F1} Pedir or\xE7amento no WhatsApp",
        onclick: () => {
          const text = whatsappText({
            projectName: o.name,
            surface: surfaceLabel(this.state.surface),
            style: o.style,
            colors: `${o.colors.base} / detalhe ${o.colors.accent}`,
            finish: finishById(o.finish).label,
            level: o.level,
            quote,
            note: note.value
          });
          window.open(whatsappUrl(phone, text), "_blank");
        }
      });
      if (!phone) btnWa.title = "Defina o n\xFAmero em \u2699 Configura\xE7\xF5es";
      right.appendChild(btnWa);
      right.appendChild(el("div", { class: "btn-row" }, [
        el("button", { class: "btn", text: "\u{1F3A8} Personalizar no editor", onclick: () => this.sendToEditor(o) }),
        el("button", { class: "btn ghost", text: "\u2B07 Baixar pr\xE9via", onclick: () => {
          const a = document.createElement("a");
          a.href = o.dataUrl;
          a.download = "opcao-" + (i + 1) + ".jpg";
          a.click();
        } })
      ]));
      wrap.appendChild(right);
      c.appendChild(wrap);
      c.appendChild(el("div", { class: "nav-row" }, [
        el("button", { class: "btn ghost", text: "\u2190 Ver outras op\xE7\xF5es", onclick: () => this.go(2) })
      ]));
    }
    async sendToEditor(o) {
      const project = this.app.newEditorProject({
        name: o.name,
        width: o.canvas ? o.canvas.width : 1e3,
        height: o.canvas ? o.canvas.height : 1e3
      });
      project.document.background = { type: "image", color: "#ffffff", src: o.dataUrl };
      project.meta = { source: "ai", surface: this.state.surface, style: o.style, finish: o.finish, level: o.level, colors: o.colors };
      await this.app.openEditorWith(project, o.dataUrl);
      toast("Aberto no editor \u2014 personalize \xE0 vontade", "ok");
    }
  };
  function block(title, sub, content) {
    const b = el("div", { class: "brief-block" });
    b.appendChild(el("h3", { class: "block-title", text: title }));
    if (sub) b.appendChild(el("p", { class: "block-sub", text: sub }));
    b.appendChild(content);
    return b;
  }
  function tag(t) {
    return el("span", { class: "tag", text: t });
  }
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // js/app.js
  var PRICING_KEY = "wrapstudio.pricing";
  var App = class {
    constructor() {
      this.pricing = { ...DEFAULT_PRICING, ...LS.get(PRICING_KEY, {}) || {} };
      this.editor = null;
      this.designer = null;
      this.view = "home";
      this.bindNav();
      this.bindGlobal();
      this.show("home");
    }
    bindNav() {
      $$(".nav-link").forEach((b) => b.addEventListener("click", () => this.show(b.dataset.view)));
      $("#btn-nav-settings")?.addEventListener("click", () => this.openSettings());
    }
    bindGlobal() {
      window.addEventListener("beforeunload", () => {
      });
    }
    show(view) {
      this.view = view;
      $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
      $$(".nav-link").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
      if (view === "home") this.renderHome();
      if (view === "projects") this.renderProjects();
      if (view === "designer" && !this.designer) this.designer = new AIDesigner($("#view-designer"), this);
      if (view === "editor" && !this.editor) {
        this.editor = new Editor($("#view-editor"), this);
      }
      if (view === "editor") this.editor?.resize();
    }
    /* ---------- HOME ---------- */
    renderHome() {
      const host = $("#home-projects");
      if (!host) return;
      host.innerHTML = "";
      listProjects().then((list) => {
        if (!list.length) {
          host.appendChild(el("p", { class: "hint", text: "Voc\xEA ainda n\xE3o salvou projetos. Crie um adesivo ou use o Designer IA." }));
          return;
        }
        list.slice(0, 6).forEach((p) => host.appendChild(this.projectCard(p)));
      });
    }
    projectCard(p) {
      const card = el("div", { class: "proj-card" });
      const thumb = el("div", { class: "proj-thumb" });
      if (p.thumb) thumb.appendChild(el("img", { src: p.thumb }));
      else thumb.appendChild(el("span", { class: "proj-emoji", text: "\u{1F3A8}" }));
      card.appendChild(thumb);
      card.appendChild(el("h4", { text: p.name || "Sem nome" }));
      card.appendChild(el("small", { text: new Date(p.updatedAt || Date.now()).toLocaleDateString("pt-BR") }));
      const actions = el("div", { class: "proj-actions" });
      actions.appendChild(el("button", { class: "btn sm primary", text: "Abrir", onclick: async () => {
        const full = await getProject(p.id);
        if (full) this.openEditorWith(full);
      } }));
      actions.appendChild(el("button", {
        class: "btn sm ghost",
        text: "\u{1F5D1}",
        onclick: async () => {
          if (await confirmModal("Apagar projeto?", `"${p.name}" ser\xE1 removido definitivamente.`)) {
            await deleteProject(p.id);
            this.renderHome();
            this.renderProjects();
            toast("Projeto apagado");
          }
        }
      }));
      card.appendChild(actions);
      return card;
    }
    renderProjects() {
      const host = $("#projects-list");
      if (!host) return;
      host.innerHTML = "";
      listProjects().then((list) => {
        if (!list.length) {
          host.appendChild(el("p", { class: "hint", text: "Nenhum projeto salvo ainda." }));
          return;
        }
        const grid = el("div", { class: "proj-grid" });
        list.forEach((p) => grid.appendChild(this.projectCard(p)));
        host.appendChild(grid);
      });
    }
    /* ---------- EDITOR ---------- */
    newEditorProject(opts) {
      return newProject(opts);
    }
    async openEditorWith(project, bgDataUrl) {
      this.show("editor");
      this.editor.setProject(project);
      if (bgDataUrl) {
        try {
          this.editor.images.set("__bg__", await loadImage(bgDataUrl));
        } catch {
        }
        this.editor.doc.background = { type: "image", color: "#ffffff", src: bgDataUrl };
      }
      this.editor.fit();
      this.editor.requestRender();
    }
    startBlank() {
      const m = openModal({ title: "Novo adesivo" });
      const presets = [
        { label: "Quadrado 1000\xD71000 (20 cm)", w: 1e3, h: 1e3, mm: 200 },
        { label: "Retangular 1600\xD7600 (40\xD715 cm)", w: 1600, h: 600, mm: 400 },
        { label: "Vertical 800\xD71200 (20\xD730 cm)", w: 800, h: 1200, mm: 200 },
        { label: "Faixa 2400\xD7400 (60\xD710 cm)", w: 2400, h: 400, mm: 600 },
        { label: "A4 1240\xD71754 (21\xD729,7 cm)", w: 1240, h: 1754, mm: 210 }
      ];
      const body = el("div");
      const grid = el("div", { class: "preset-grid" });
      presets.forEach((p) => {
        const b = el("button", { class: "preset-card", text: p.label });
        b.addEventListener("click", async () => {
          const proj = newProject({ width: p.w, height: p.h, mm: p.mm });
          m.close();
          await this.openEditorWith(proj);
        });
        grid.appendChild(b);
      });
      body.appendChild(grid);
      body.appendChild(el("p", { class: "hint", text: "Voc\xEA pode mudar o tamanho depois, no painel Documento." }));
      m.body.appendChild(body);
    }
    async saveCurrentProject() {
      if (!this.editor) return;
      const ed = this.editor;
      ed.project.thumb = ed.thumbDataUrl(300);
      await saveProject(ed.project);
      toast("Projeto salvo \u2713", "ok");
      this.renderHome();
    }
    /* ---------- ORÇAMENTO ---------- */
    openQuote() {
      const ed = this.editor;
      const body = el("div");
      const mm = ed?.doc.mm || 200;
      const widthMm = mm;
      const heightMm = mm * (ed ? ed.doc.height / ed.doc.width : 1);
      const areaM2 = widthMm * heightMm / 1e6;
      const finSel = [];
      const finishRow = el("div", { class: "chip-grid" });
      const chosen = /* @__PURE__ */ new Set(["matte"]);
      FINISHES.forEach((f) => {
        const b = el("button", { class: "chip sel", text: f.label });
        b.classList.toggle("sel", chosen.has(f.id));
        b.addEventListener("click", () => {
          if (chosen.has(f.id)) {
            chosen.delete(f.id);
            b.classList.remove("sel");
          } else {
            chosen.add(f.id);
            b.classList.add("sel");
          }
          recalc();
        });
        finishRow.appendChild(b);
      });
      body.appendChild(el("h4", { class: "cat-title", text: "Acabamentos" }));
      body.appendChild(finishRow);
      const areaInput = el("input", { class: "input", type: "number", step: "0.05", value: areaM2.toFixed(2) });
      body.appendChild(el("label", { class: "row" }, [el("span", { class: "row-lbl", text: "\xC1rea (m\xB2)" }), areaInput]));
      const out = el("div", { class: "quote-box" });
      body.appendChild(out);
      function recalc() {
        const list = [...chosen];
        const finishes = (list.length ? list : ["matte"]).map((id, i) => ({ id, pct: Math.round(100 / (list.length || 1)) }));
        const q = calcQuote({ areaM2: Number(areaInput.value) || areaM2, finishes, pricing: self.pricing });
        out.innerHTML = "";
        [["Material", q.formatted.material], ["Aplica\xE7\xE3o", q.formatted.labor], ["Arte/design", q.formatted.design]].forEach(([k, v]) => out.appendChild(el("div", { class: "an-row" }, [el("span", { text: k }), el("strong", { text: v })])));
        out.appendChild(el("div", { class: "an-row total" }, [el("span", { text: "TOTAL" }), el("strong", { text: q.formatted.total })]));
        out.dataset.total = q.formatted.total;
        out._quote = q;
      }
      const self = this;
      areaInput.addEventListener("input", recalc);
      recalc();
      const foot = el("div", { class: "row-end" }, [
        el("button", {
          class: "btn wa",
          text: "\u{1F4F1} Enviar no WhatsApp",
          onclick: () => {
            const text = whatsappText({
              projectName: ed?.project.name,
              surface: "Adesivo personalizado",
              finish: [...chosen].map((id) => FINISHES.find((f) => f.id === id)?.label).join(", "),
              quote: out._quote
            });
            window.open(whatsappUrl(self.pricing.whatsapp, text), "_blank");
          }
        })
      ]);
      openModal({ title: "Or\xE7amento do adesivo", body, footer: foot, wide: true });
    }
    /* ---------- CONFIGURAÇÕES ---------- */
    openSettings() {
      const body = el("div");
      const p = this.pricing;
      body.appendChild(el("h3", { class: "block-title", text: "Empresa" }));
      const phone = el("input", { class: "input", value: p.whatsapp || "", placeholder: "5587999999999 (com DDI e DDD, s\xF3 n\xFAmeros)" });
      body.appendChild(el("label", { class: "lbl" }, ["WhatsApp para or\xE7amentos", phone]));
      body.appendChild(el("h3", { class: "block-title", text: "Tabela de pre\xE7os" }));
      const fields = [
        ["priceMatte", "R$/m\xB2 vinil fosco"],
        ["priceGloss", "R$/m\xB2 vinil brilhante/satin"],
        ["priceSpecial", "R$/m\xB2 especiais (carbono, hologr\xE1fico\u2026)"],
        ["laborPerM2", "R$/m\xB2 m\xE3o de obra"],
        ["installMin", "Taxa m\xEDnima de instala\xE7\xE3o (R$)"],
        ["designFee", "Arte/design (R$)"],
        ["minArea", "\xC1rea m\xEDnima cobrada (m\xB2)"]
      ];
      const inputs = {};
      fields.forEach(([k, label]) => {
        const i = el("input", { class: "input", type: "number", step: "0.01", value: p[k] });
        inputs[k] = i;
        body.appendChild(el("label", { class: "row" }, [el("span", { class: "row-lbl", text: label }), i]));
      });
      const waste = el("input", { type: "range", min: 0, max: 60, value: Math.round(p.wasteFactor * 100) });
      const wasteVal = el("span", { class: "val", text: Math.round(p.wasteFactor * 100) + "%" });
      waste.addEventListener("input", () => wasteVal.textContent = waste.value + "%");
      body.appendChild(el("label", { class: "row range" }, [el("span", { class: "row-lbl", text: "Perda de material" }), waste, wasteVal]));
      body.appendChild(el("h3", { class: "block-title", text: "IA de imagem (opcional)" }));
      const cfg = getAIConfig();
      const enabled = el("input", { type: "checkbox" });
      enabled.checked = !!cfg.enabled;
      body.appendChild(el("label", { class: "chk" }, [enabled, el("span", { text: "Ativar IA real (gera imagens por IA na nuvem)" })]));
      const provider = el("select", { class: "input" });
      [["gemini", "Google Gemini (nano banana / flash image)"], ["flux", "Flux via Replicate"]].forEach(([v, t]) => provider.appendChild(el("option", { value: v, text: t, ...cfg.provider === v ? { selected: "selected" } : {} })));
      body.appendChild(el("label", { class: "lbl" }, ["Provedor", provider]));
      const key = el("input", { class: "input", type: "password", value: cfg.key || "", placeholder: "Cole sua chave de API" });
      body.appendChild(el("label", { class: "lbl" }, ["Chave de API", key]));
      const model = el("input", { class: "input", value: cfg.model || "", placeholder: "gemini-2.5-flash-image" });
      body.appendChild(el("label", { class: "lbl" }, ["Modelo (Gemini)", model]));
      body.appendChild(el("p", { class: "hint", html: "A chave fica salva apenas no seu navegador (localStorage). Sem chave, o sistema usa o motor local, que simula o envelopamento a partir da sua foto \u2014 sem custo." }));
      const foot = el("div", { class: "row-end" }, [
        el("button", { class: "btn ghost", text: "Restaurar pre\xE7os padr\xE3o", onclick: () => {
          this.pricing = { ...DEFAULT_PRICING };
          LS.set(PRICING_KEY, this.pricing);
          toast("Pre\xE7os restaurados");
          m.close();
        } }),
        el("button", {
          class: "btn primary",
          text: "Salvar",
          onclick: () => {
            this.pricing = { ...p, whatsapp: phone.value.trim(), wasteFactor: Number(waste.value) / 100 };
            Object.keys(inputs).forEach((k) => this.pricing[k] = Number(inputs[k].value));
            LS.set(PRICING_KEY, this.pricing);
            saveAIConfig({ enabled: enabled.checked, provider: provider.value, key: key.value.trim(), model: model.value.trim(), fluxModel: cfg.fluxModel });
            toast("Configura\xE7\xF5es salvas \u2713", "ok");
            m.close();
          }
        })
      ]);
      const m = openModal({ title: "Configura\xE7\xF5es", body, footer: foot, wide: true });
    }
  };
  async function boot() {
    const splash = $("#splash");
    try {
      await installFonts();
    } catch (e) {
      console.warn("fontes", e);
    }
    window.app = new App();
    $("#cta-designer")?.addEventListener("click", () => window.app.show("designer"));
    $("#cta-editor")?.addEventListener("click", () => window.app.startBlank());
    $("#cta-blank")?.addEventListener("click", () => window.app.startBlank());
    $("#cta-open-designer")?.addEventListener("click", () => window.app.show("designer"));
    $("#import-input")?.addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const txt = await f.text();
        const proj = JSON.parse(txt);
        await saveProject(proj);
        await window.app.openEditorWith(proj);
        toast("Projeto importado", "ok");
      } catch {
        toast("Arquivo inv\xE1lido", "err");
      }
      e.target.value = "";
    });
    $("#btn-import")?.addEventListener("click", () => $("#import-input")?.click());
    const auto = LS.get("wrapstudio.autosave.editor", null);
    if (auto && auto.project?.document?.layers?.length) {
      const bar = el("div", { class: "autosave-bar" }, [
        el("span", { text: "Encontramos um trabalho n\xE3o salvo." }),
        el("button", {
          class: "btn sm primary",
          text: "Restaurar",
          onclick: async () => {
            await window.app.openEditorWith(auto.project);
            bar.remove();
          }
        }),
        el("button", { class: "btn sm ghost", text: "Descartar", onclick: () => {
          LS.del("wrapstudio.autosave.editor");
          bar.remove();
        } })
      ]);
      document.body.appendChild(bar);
    }
    splash?.classList.add("hide");
    setTimeout(() => splash?.remove(), 500);
  }
  boot();
})();
