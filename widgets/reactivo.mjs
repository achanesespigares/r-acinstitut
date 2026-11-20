// reactivo.mjs · Visualizador de la reactividad de Shiny (AC Institut · anywidget para MyST)
// Arriba, la app tal como la ve quien la usa; abajo, su grafo reactivo: entradas → expresiones
// reactivas → salidas. Cada cambio de una entrada se cuenta en dos pasos: primero se marca como
// caducado todo lo que depende de ella; después Shiny lo vuelve a calcular, y solo eso. Los datos
// (qué se ejecutó, en qué orden, qué valen las salidas) salen de ejecutar la app de verdad con
// shiny::testServer() en herramientas/shiny.R.

const ESTILOS = `
.rx{ --acento:#7A1F36; --suave:#F6F0EE; --banda:#6B6B6B; --filete:#9A9A9A; --fila:#D4D4D4; --fondo:#F4F4F4; --tinta:#111; --sub:#333; --ok:#2D5A48;
  --titulo:"Montserrat","Helvetica Neue",Arial,sans-serif; --texto:"Arimo","Liberation Sans",Arial,sans-serif; --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  font:400 15px/1.55 var(--texto); color:var(--tinta); background:#fff; display:flex; flex-direction:column; gap:16px;
  padding:16px; border:1px solid var(--fila); border-radius:10px; margin:1.25rem 0; }
.rx *{ box-sizing:border-box; min-width:0; }
.rx p{ margin:0; }
.rx-cab{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; flex-wrap:wrap; }
.rx-tit{ font:700 18px/1.2 var(--titulo); }
.rx-etq{ font:600 10.5px/1 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--acento); border:1.5px solid var(--acento); border-radius:6px; padding:5px 8px; }
.rx-idea{ border-left:4px solid var(--acento); padding:2px 0 2px 12px; color:var(--sub); }
.rx-escena{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.15fr); gap:16px; align-items:start; }
.rx-col{ display:flex; flex-direction:column; gap:12px; }
.rx-caja{ border:2px solid var(--tinta); background:#fff; }
.rx-barra{ background:var(--acento); color:#fff; padding:6px 12px; font:600 10.5px/1.2 var(--titulo); letter-spacing:.12em; text-transform:uppercase; display:flex; justify-content:space-between; gap:2px 8px; flex-wrap:wrap; }
.rx-barra.negro{ background:var(--tinta); }
pre.rx-codigo{ margin:0; font:400 12.5px/1.7 var(--mono); overflow-x:auto; background:var(--fondo); padding:6px 0; border:0; }
.rx .ln{ display:flex; white-space:pre; padding-right:12px; border-left:4px solid transparent; min-width:max-content; }
.rx .ln .no{ width:2.4ch; flex:none; text-align:right; color:var(--filete); margin:0 10px 0 6px; }
.rx .ln.calc{ border-left-color:var(--acento); background:var(--suave); }
.rx .ln.cad{ border-left:4px dashed var(--filete); background:#F7F7F7; }
.rx-narr{ background:var(--suave); border-left:4px solid var(--acento); padding:12px 14px; font-size:15px; }
.rx-narr code{ font:500 13px/1.3 var(--mono); background:#fff; padding:1px 4px; border-radius:3px; }
.rx-mandos{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.rx-mandos button{ font:600 14px/1 var(--titulo); min-height:44px; padding:0 16px; border:2px solid var(--tinta); background:#fff; color:var(--tinta); border-radius:6px; cursor:pointer; }
.rx-mandos button.pri{ background:var(--acento); border-color:var(--acento); color:#fff; }
.rx-mandos button:disabled{ opacity:.4; cursor:default; }
.rx-mandos button:focus-visible{ outline:3px solid var(--acento); outline-offset:2px; }
.rx-cuenta{ margin-left:auto; font:500 12.5px/1 var(--mono); color:var(--banda); }
.rx-app{ padding:14px 16px 16px; display:flex; flex-direction:column; gap:10px; font-family:"Helvetica Neue",Arial,sans-serif; }
.rx-app h3{ margin:0 0 4px; font:500 22px/1.2 "Helvetica Neue",Arial,sans-serif; }
.rx-des{ display:flex; flex-direction:column; gap:2px; padding:6px 8px; border-radius:6px; border:2px solid transparent; }
.rx-des.cambia{ border-color:var(--acento); background:var(--suave); }
.rx-des label{ font-weight:600; font-size:14px; }
.rx-des .fila{ display:flex; align-items:center; gap:10px; }
.rx-des input{ flex:1; accent-color:var(--acento); }
.rx-des .val{ font:600 13px/1 var(--mono); background:var(--acento); color:#fff; border-radius:4px; padding:4px 6px; min-width:3.2em; text-align:center; }
.rx-sal{ font-size:15px; transition:opacity .2s; padding:2px 0; }
.rx-sal.cad, .rx-img.cad{ opacity:.35; }
.rx-img img{ width:100%; max-width:420px; height:auto; display:block; transition:opacity .2s; }
.rx-img.cad img{ opacity:.35; }
svg.rx-grafo{ width:100%; max-width:820px; height:auto; display:block; margin:0 auto; background:#fff; }
.rx-grafo .nodo rect{ fill:#fff; stroke:var(--tinta); stroke-width:1.5; }
.rx-grafo .nodo text{ font:500 14px var(--mono); fill:var(--tinta); }
.rx-grafo .nodo.entrada rect{ fill:var(--fondo); }
.rx-grafo .nodo.cambia rect{ fill:var(--acento); stroke:var(--acento); } .rx-grafo .nodo.cambia text{ fill:#fff; }
.rx-grafo .nodo.cad rect{ stroke:var(--filete); stroke-dasharray:4 3; fill:#F7F7F7; } .rx-grafo .nodo.cad text{ fill:var(--banda); }
.rx-grafo .nodo.calc rect{ fill:var(--suave); stroke:var(--acento); stroke-width:2.5; }
.rx-grafo .nodo .ord{ fill:var(--acento); } .rx-grafo .nodo .ordt{ font:700 11px var(--titulo); fill:#fff; }
.rx-grafo .arista{ stroke:var(--filete); stroke-width:1.5; fill:none; }
.rx-grafo .arista.viva{ stroke:var(--acento); stroke-width:2.2; }
.rx-grafo .col{ font:600 10px var(--titulo); letter-spacing:.1em; fill:var(--banda); }
.rx-enlace{ display:inline-flex; align-items:center; gap:8px; align-self:flex-start; font:600 14px/1 var(--titulo); color:#fff; background:var(--acento); padding:12px 16px; border-radius:6px; text-decoration:none; }
.rx-enlace:hover{ background:#5A1628; color:#fff; }
.rx-nota{ font-size:13px; color:var(--banda); }
.rx:fullscreen{ overflow:auto; padding:24px 4vw; border:0; border-radius:0; margin:0; }
.rx:fullscreen > *{ zoom:1.2; }
@media (max-width:760px){ .rx-escena{ grid-template-columns:minmax(0,1fr); } }
`;

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const code = s => "<code>" + esc(s) + "</code>";
const lista = xs => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " y " + xs[xs.length - 1];
const fmt = v => String(v);   // como el deslizador de Shiny, con punto decimal

function render({ model, el }) {
  const C = model.get("config") || {}, archivo = model.get("archivo");
  if (!archivo) { el.textContent = "Faltan los datos: ejecuta herramientas/shiny.R sobre este capítulo."; return; }
  el.innerHTML = '<p style="font:500 13px/1.4 sans-serif;color:#6B6B6B;margin:0;padding:12px 0">Cargando el visualizador…</p>';
  return fetch(new URL("../" + archivo, import.meta.url))
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => dibuja(el, C, d))
    .catch(() => { el.textContent = "No se ha podido cargar el visualizador (" + archivo + ")."; });
}

function dibuja(el, C, D) {
  el.innerHTML = "<style>" + ESTILOS + '</style><div class="rx">' +
    '<div class="rx-cab"><span class="rx-tit"></span><span class="rx-etq"></span></div><p class="rx-idea"></p>' +
    '<div class="rx-escena"><div class="rx-col">' +
      '<div class="rx-caja"><div class="rx-barra"><span>app.R</span><span class="rx-lin"></span></div><pre class="rx-codigo"></pre></div>' +
      '<div class="rx-narr" aria-live="polite"></div>' +
      '<div class="rx-mandos"><button class="rx-ant" aria-label="Paso anterior">◀</button><button class="rx-sig pri">Paso ▶</button>' +
      '<button class="rx-play">Reproducir</button><button class="rx-reset">Reiniciar</button><button class="rx-proy">Proyectar</button><span class="rx-cuenta"></span></div>' +
    '</div><div class="rx-col">' +
      '<div class="rx-caja"><div class="rx-barra negro"><span>La app</span><span>lo que ve quien la usa</span></div><div class="rx-app"></div></div>' +
    "</div></div>" +
    '<div class="rx-caja"><div class="rx-barra negro"><span>El grafo reactivo</span><span>quién depende de quién</span></div><div class="rx-g"></div></div></div>';
  const q = s => el.querySelector(s);
  const L = D.codigo.split("\n"), U = D.ui, N = D.nodos, E = D.estados;
  q(".rx-tit").textContent = C.titulo || "";
  q(".rx-etq").textContent = C.etiqueta || "";
  q(".rx-idea").textContent = C.idea || "";
  if (!C.idea) q(".rx-idea").style.display = "none";
  q(".rx-codigo").innerHTML = L.map((l, i) => '<span class="ln" data-n="' + (i + 1) + '"><span class="no">' + (i + 1) + "</span>" + (esc(l) || " ") + "</span>").join("");

  // los pasos: el arranque y, por cada cambio, «caduca» y «recalcula»
  const P = [{ tipo: "arranque", e: 0 }];
  for (let i = 1; i < E.length; i++) { P.push({ tipo: "caduca", e: i }); P.push({ tipo: "recalcula", e: i }); }

  // el grafo: tres columnas, entradas, expresiones reactivas y salidas
  const lee = n => [].concat(n.lee || []);
  const entradas = U.entradas.map(x => "input$" + x.id), reac = N.filter(n => n.clase === "reactiva"), sal = N.filter(n => n.clase === "salida");
  const W = 640, fila = 54, alto = Math.max(entradas.length, reac.length, sal.length) * fila + 36;
  const pos = {};
  const coloca = (ids, x) => ids.forEach((id, i) => { pos[id] = { x, y: 36 + (alto - 36 - ids.length * fila) / 2 + i * fila + fila / 2 }; });
  coloca(entradas, 100); coloca(reac.map(n => n.id), 320); coloca(sal.map(n => n.id), 540);
  const etiqueta = id => N.find(n => n.id === id && n.clase === "reactiva") ? id + "()" : id;
  const aristas = N.flatMap(n => lee(n).map(de => [de, n.id]));

  function grafo(cambia, cad, calc) {
    let s = '<svg class="rx-grafo" viewBox="0 0 ' + W + " " + alto + '" role="img" aria-label="Grafo reactivo de la app">' +
      '<text class="col" x="100" y="16" text-anchor="middle">ENTRADAS</text><text class="col" x="320" y="16" text-anchor="middle">REACTIVAS</text><text class="col" x="540" y="16" text-anchor="middle">SALIDAS</text>';
    for (const [a, b] of aristas) {
      const p = pos[a], r = pos[b]; if (!p || !r) continue;
      const viva = (cad.includes(b) || calc.includes(b)) && (cambia === a || cad.includes(a) || calc.includes(a));
      s += '<path class="arista' + (viva ? " viva" : "") + '" d="M' + (p.x + 88) + " " + p.y + " C " + (p.x + 140) + " " + p.y + ", " + (r.x - 140) + " " + r.y + ", " + (r.x - 88) + " " + r.y + '"/>';
    }
    for (const id of Object.keys(pos)) {
      const { x, y } = pos[id], o = calc.indexOf(id);
      const cls = "nodo" + (entradas.includes(id) ? " entrada" : "") + (id === cambia ? " cambia" : o >= 0 ? " calc" : cad.includes(id) ? " cad" : "");
      s += '<g class="' + cls + '"><rect x="' + (x - 88) + '" y="' + (y - 16) + '" width="176" height="32" rx="7"/><text x="' + x + '" y="' + (y + 4.5) + '" text-anchor="middle">' + esc(etiqueta(id)) + "</text>" +
        (o >= 0 ? '<circle class="ord" cx="' + (x + 88) + '" cy="' + (y - 16) + '" r="10"/><text class="ordt" x="' + (x + 88) + '" y="' + (y - 12) + '" text-anchor="middle">' + (o + 1) + "</text>" : "") + "</g>";
    }
    return s + "</svg>";
  }

  function app(est, cambiado, caducas) {
    const img = src => new URL("../" + src, import.meta.url).href;
    let h = U.titulo ? "<h3>" + esc(U.titulo) + "</h3>" : "";
    for (const x of U.entradas) {
      const v = est.entradas[x.id];
      h += '<div class="rx-des' + (x.id === cambiado ? " cambia" : "") + '"><label>' + esc(x.etiqueta) + '</label><div class="fila"><input type="range" disabled min="' + x.min + '" max="' + x.max + '" step="' + (x.paso || 1) + '" value="' + v + '" aria-label="' + esc(x.etiqueta) + '"><span class="val">' + fmt(v) + "</span></div></div>";
    }
    for (const s of U.salidas) {
      const v = est.salidas[s.id] || {}, cad = caducas.includes("output$" + s.id) ? " cad" : "";
      h += v.imagen ? '<div class="rx-img' + cad + '"><img alt="El gráfico de la app" src="' + img(v.imagen) + '"></div>' : '<div class="rx-sal' + cad + '">' + esc(v.texto) + "</div>";
    }
    return h;
  }

  const lineasDe = ids => ids.flatMap(id => { const n = N.find(m => m.id === id); return n && n.lineas ? Array.from({ length: n.lineas[1] - n.lineas[0] + 1 }, (_, i) => n.lineas[0] + i) : []; });

  function narra(p) {
    const est = E[p.e], reg = [].concat(est.registro || []);
    if (p.tipo === "arranque") {
      const nr = reg.filter(r => !r.startsWith("output$"));
      return "La app arranca. Shiny dibuja la interfaz con los valores iniciales de los deslizadores y calcula todas las salidas: " + lista(sal.map(n => code(n.id))) + "." +
        (nr.length ? " Para calcular " + code(reg[0]) + " hace falta " + code(nr[0] + "()") + ", así que Shiny la calcula en ese momento. Las demás salidas que la usan ya la encuentran calculada y no la repiten: " + code(nr[0] + "()") + " se ejecuta una sola vez." : "");
    }
    const [id, v] = Object.entries(est.cambio)[0], cad = [].concat(est.caducan || []), nada = sal.map(n => n.id).filter(x => !cad.includes(x));
    if (p.tipo === "caduca")
      return "Mueves el deslizador " + code("input$" + id) + " a " + fmt(v) + ". Shiny todavía no calcula nada: primero marca como <b>caducado</b> todo lo que depende de " + code("input$" + id) + ", directa o indirectamente: " + lista(cad.map(x => code(etiqueta(x)))) + "." +
        (nada.length ? " " + lista(nada.map(code)) + " no depende" + (nada.length > 1 ? "n" : "") + " de esa entrada: no se toca." : "");
    const nr = reg.filter(r => !r.startsWith("output$"));
    const s = est.salidas;
    return "Ahora Shiny vuelve a calcular lo caducado, y nada más, en este orden: " + lista(reg.map((r, i) => (i + 1) + ". " + code(etiqueta(r)))) + "." +
      (nr.length ? (() => {
        const i = reg.indexOf(nr[0]), antes = i > 0 ? reg[i - 1] : null, luego = reg.slice(i + 1).filter(r => (lee(N.find(n => n.id === r) || {})).includes(nr[0]));
        return " " + (antes ? code(antes) + " empieza a recalcularse, ve que necesita " + code(nr[0] + "()") + ", que está caducada, y la recalcula antes de terminar. " : code(nr[0] + "()") + " se recalcula primero. ") +
          (luego.length ? lista(luego.map(code)) + " también la usa" + (luego.length > 1 ? "n" : "") + ", pero ya la encuentra" + " calculada: " + code(nr[0] + "()") + " se ejecuta una sola vez." : "");
      })() : "") +
      " La app ya enseña los resultados nuevos: " + lista(U.salidas.filter(x => s[x.id] && s[x.id].texto != null).map(x => "«" + esc(s[x.id].texto) + "»")) + "." +
      (nada.length ? " " + lista(nada.map(code)) + " sigue igual, sin volver a calcularse." : "");
  }

  let k = 0, timer = null;
  function pinta() {
    const p = P[k], est = E[p.e];
    const cambio = est.cambio ? Object.keys(est.cambio)[0] : null;
    const cad = p.tipo === "caduca" ? [].concat(est.caducan || []) : [];
    const calc = p.tipo === "caduca" ? [] : [].concat(est.registro || []);
    // en el paso «caduca» la app todavía enseña las salidas de antes, apagadas
    const mostrar = p.tipo === "caduca" ? { ...E[p.e - 1], entradas: est.entradas } : est;
    q(".rx-app").innerHTML = app(mostrar, p.tipo === "arranque" ? null : cambio, cad);
    q(".rx-g").innerHTML = grafo(p.tipo === "arranque" ? null : "input$" + cambio, cad, calc);
    el.querySelectorAll(".rx .ln").forEach(n => n.classList.remove("calc", "cad"));
    lineasDe(cad).forEach(n => { const ln = q('.ln[data-n="' + n + '"]'); if (ln) ln.classList.add("cad"); });
    lineasDe(calc).forEach(n => { const ln = q('.ln[data-n="' + n + '"]'); if (ln) ln.classList.add("calc"); });
    q(".rx-lin").textContent = p.tipo === "arranque" ? "arranque" : "cambio " + p.e;
    q(".rx-narr").innerHTML = narra(p);
    q(".rx-cuenta").textContent = "paso " + k + " de " + (P.length - 1);
    q(".rx-ant").disabled = k === 0; q(".rx-sig").disabled = k === P.length - 1;
  }
  const para = () => { if (timer) { clearInterval(timer); timer = null; q(".rx-play").textContent = "Reproducir"; } };
  q(".rx-sig").addEventListener("click", () => { para(); if (k < P.length - 1) { k++; pinta(); } });
  q(".rx-ant").addEventListener("click", () => { para(); if (k > 0) { k--; pinta(); } });
  q(".rx-reset").addEventListener("click", () => { para(); k = 0; pinta(); });
  q(".rx-play").addEventListener("click", () => {
    if (timer) return para();
    if (k === P.length - 1) k = 0;
    q(".rx-play").textContent = "Pausa";
    timer = setInterval(() => { if (k >= P.length - 1) return para(); k++; pinta(); }, 2000);
  });
  if (D.shinylive) {
    const a = document.createElement("a");
    a.className = "rx-enlace"; a.href = D.shinylive; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Abrir la app de verdad (Shinylive) ↗";
    const n = document.createElement("p"); n.className = "rx-nota";
    n.textContent = "Se abre en una pestaña nueva y funciona en tu navegador, sin instalar nada: R va dentro de la página. La primera vez tarda unos segundos en cargar.";
    q(".rx").append(a, n);
  }
  const raiz = q(".rx"), proy = q(".rx-proy");
  raiz.tabIndex = -1;
  const proyectando = () => ((raiz.getRootNode().fullscreenElement || document.fullscreenElement) === raiz);
  if (!document.fullscreenEnabled || !raiz.requestFullscreen) proy.remove();
  else proy.addEventListener("click", () => { if (proyectando()) document.exitFullscreen(); else raiz.requestFullscreen().then(() => raiz.focus()).catch(() => {}); });
  const alCambiar = () => { proy.textContent = proyectando() ? "Salir de la proyección" : "Proyectar"; };
  document.addEventListener("fullscreenchange", alCambiar);
  raiz.addEventListener("keydown", e => {
    const acc = { ArrowRight: ".rx-sig", PageDown: ".rx-sig", ArrowLeft: ".rx-ant", PageUp: ".rx-ant", Home: ".rx-reset", p: ".rx-play", P: ".rx-play", f: ".rx-proy", F: ".rx-proy" };
    const b = acc[e.key] && q(acc[e.key]);
    if (b && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); b.click(); }
  });
  pinta();
  return () => { para(); document.removeEventListener("fullscreenchange", alCambiar); };
}

export default { render };
