// traza-r.mjs · Visualizador de trazas de R (AC Institut · anywidget para MyST / Jupyter Book 2)
// Un programa de R ejecutándose paso a paso: la línea, los vectores de la memoria (en R todo es
// un vector, y cada variable se dibuja como su fila de casillas numeradas desde 1), las
// condiciones con sus valores, la consola, los avisos de R y la tabla de traza.
// El modelo llega del cuerpo JSON de la directiva: { "config": {...}, "traza": {...} },
// y la traza la escribe herramientas/trazar.R.

const ESTILOS = `
.tz{ --acento:#7A1F36; --suave:#F6F0EE; --oscuro:#5A1628; --banda:#6B6B6B; --filete:#9A9A9A; --fila:#D4D4D4;
  --fondo:#F4F4F4; --sub:#333; --tinta:#111; --si:#2D5A48;
  --titulo:"Montserrat","Helvetica Neue",Arial,sans-serif; --texto:"Arimo","Liberation Sans",Arial,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  font:400 15px/1.55 var(--texto); color:var(--tinta); background:#fff; display:flex; flex-direction:column; gap:16px;
  padding:16px; border:1px solid var(--fila); border-radius:10px; margin:1.25rem 0; }
.tz *{ box-sizing:border-box; min-width:0; }
.tz p{ margin:0; }
.tz-cab{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; flex-wrap:wrap; }
.tz-tit{ font:700 18px/1.2 var(--titulo); }
.tz-etq{ font:600 10.5px/1 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--acento);
  border:1.5px solid var(--acento); border-radius:6px; padding:5px 8px; }
.tz-idea{ border-left:4px solid var(--acento); padding:2px 0 2px 12px; color:var(--sub); }
.tz-escena{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:16px; align-items:start; }
.tz-col{ display:flex; flex-direction:column; gap:12px; }
.tz-caja{ border:2px solid var(--tinta); background:#fff; }
.tz-barra{ background:var(--acento); color:#fff; padding:6px 12px; font:600 10.5px/1.2 var(--titulo); letter-spacing:.12em;
  text-transform:uppercase; display:flex; justify-content:space-between; gap:8px; }
.tz-barra.negro{ background:var(--tinta); }
pre.tz-codigo{ margin:0; font:400 14px/1.85 var(--mono); overflow-x:auto; background:var(--fondo); padding:6px 0; border:0; }
.tz .ln{ display:flex; align-items:center; white-space:pre; padding-right:12px; border-left:4px solid transparent; }
.tz .ln .fl{ width:20px; flex:none; text-align:center; font-size:11px; color:transparent; }
.tz .ln .no{ width:2.4ch; flex:none; text-align:right; color:var(--filete); margin-right:12px; }
.tz .ln.hecha{ border-left-color:var(--acento); background:var(--suave); }
.tz .ln.hecha .fl{ color:var(--acento); }
.tz .ln.error{ background:#F3E3E6; }
.tz .kw{ color:var(--acento); font-weight:600; } .tz .str{ color:#4A5A2A; } .tz .num{ color:#1E4A6B; } .tz .com{ color:var(--filete); font-style:italic; }
.tz-narr{ min-height:4.4em; padding:10px 12px; background:var(--suave); border-left:4px solid var(--acento); }
.tz-narr code,.tz-cond code{ font:500 13px/1 var(--mono); background:#fff; padding:2px 5px; border-radius:4px; }
.tz-mandos{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.tz-mandos button{ font:600 14px/1 var(--titulo); min-height:40px; padding:0 14px; border:2px solid var(--tinta); background:#fff; color:var(--tinta); border-radius:6px; cursor:pointer; }
.tz-mandos button.pri{ background:var(--acento); border-color:var(--acento); color:#fff; }
.tz-mandos button:disabled{ opacity:.4; cursor:default; }
.tz-mandos button:focus-visible{ outline:3px solid var(--acento); outline-offset:2px; }
.tz-cuenta{ font:500 12.5px/1 var(--mono); color:var(--banda); margin-left:auto; }
.tz-mem{ padding:12px; display:flex; flex-direction:column; gap:14px; }
.tz-vacio{ font-size:14px; color:var(--banda); font-style:italic; }
.tz .vec{ display:flex; flex-direction:column; gap:4px; }
.tz .vec-cab{ display:flex; gap:8px; align-items:baseline; flex-wrap:wrap; font:600 14px/1.2 var(--mono); }
.tz .vec-cab .tipo{ font:600 9.5px/1 var(--titulo); letter-spacing:.06em; text-transform:uppercase; color:var(--acento); border:1px solid var(--acento); border-radius:3px; padding:2px 4px; }
.tz .vec-cab .lon{ font:400 12px/1 var(--texto); color:var(--banda); }
.tz .vec.cambia .vec-cab .nom{ color:var(--acento); }
.tz .fila-cas{ display:flex; overflow-x:auto; position:relative; padding-bottom:2px; }
.tz .cas{ display:flex; flex-direction:column; align-items:center; gap:4px; flex:none; }
.tz .cas .v{ min-width:44px; height:40px; padding:0 6px; border:2px solid var(--tinta); margin-left:-2px; display:flex; align-items:center;
  justify-content:center; font:600 16px/1 var(--mono); background:#fff; transition:background .25s; }
.tz .cas:first-child .v{ margin-left:0; }
.tz .cas .idx{ font:500 11.5px/1 var(--mono); color:var(--banda); }
.tz .cas.cambia .v{ background:var(--suave); border-color:var(--acento); position:relative; z-index:1; }
.tz .cas.foco .v{ border:3px solid var(--acento); background:var(--suave); position:relative; z-index:2; }
.tz .cas.foco .idx{ color:var(--acento); font-weight:600; }
.tz .grande .cas .v{ min-width:54px; height:52px; font-size:19px; }
.tz .grande{ padding-top:34px; }
.tz .puntero{ position:absolute; top:0; display:flex; flex-direction:column; align-items:center; gap:2px; transition:left .35s ease; pointer-events:none; transform:translateX(-50%); }
.tz .puntero .et{ font:600 12.5px/1 var(--mono); color:#fff; background:var(--acento); padding:4px 7px; border-radius:4px; white-space:nowrap; }
.tz .puntero .flecha{ width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid var(--acento); }
.tz .otro{ font:500 13.5px/1.4 var(--mono); white-space:pre-wrap; background:var(--fondo); padding:6px 8px; }
.tz-cond{ border:1.5px dashed var(--filete); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:6px; font:500 15px/1.35 var(--mono); }
.tz-cond .res{ align-self:flex-start; font:700 13px/1 var(--titulo); padding:5px 9px; border-radius:999px; color:#fff; }
.tz-cond .res.si{ background:var(--si); } .tz-cond .res.no{ background:var(--acento); }
.tz-aviso{ border:2px solid #8A5A00; background:#FBF3E2; color:#4A3000; border-radius:8px; padding:8px 12px; font-size:14px; }
.tz-aviso b{ font-family:var(--titulo); }
.tz-error{ border:2px solid var(--acento); background:var(--suave); border-radius:8px; padding:8px 12px; font-size:14px; }
.tz-consola{ background:var(--tinta); color:#EDEDED; font:400 14px/1.6 var(--mono); padding:10px 12px; min-height:2.6em; white-space:pre-wrap; margin:0; }
.tz-tabla{ border-collapse:collapse; font:500 14px/1.2 var(--mono); width:100%; }
.tz-tabla th{ font:600 10.5px/1.2 var(--titulo); letter-spacing:.06em; text-align:left; color:var(--banda); padding:6px 10px; border-bottom:1.5px solid var(--tinta); }
.tz-tabla td{ padding:6px 10px; border-bottom:1px solid var(--fila); }
.tz-tabla tr.nueva td{ background:var(--suave); }
.tz-nota{ font-size:12.5px; color:var(--banda); padding:8px 12px 10px; }
@media (max-width:760px){ .tz-escena{ grid-template-columns:minmax(0,1fr); } }
@media (prefers-reduced-motion:reduce){ .tz *{ transition:none !important; } }
`;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const code = s => "<code>" + esc(s) + "</code>";
const PALABRAS = /\b(for|in|while|repeat|if|else|function|return|next|break|TRUE|FALSE|NULL|NA|NaN|Inf)\b/g;

function colorea(linea) {
  const com = linea.indexOf("#");
  const [cuerpo, resto] = com >= 0 ? [linea.slice(0, com), linea.slice(com)] : [linea, ""];
  const trozos = cuerpo.split(/("[^"]*"|'[^']*')/);
  const html = trozos.map((t, i) => i % 2 ? '<span class="str">' + esc(t) + "</span>"
    : esc(t).replace(/\b(\d+(?:\.\d+)?L?)\b/g, '<span class="num">$1</span>').replace(PALABRAS, '<span class="kw">$1</span>')).join("");
  return html + (resto ? '<span class="com">' + esc(resto) + "</span>" : "");
}

const PLANTILLA = `
<div class="tz-cab"><span class="tz-tit"></span><span class="tz-etq"></span></div>
<p class="tz-idea"></p>
<div class="tz-escena">
  <div class="tz-col">
    <div class="tz-caja"><div class="tz-barra"><span>Código</span><span class="tz-lin"></span></div><pre class="tz-codigo"></pre></div>
    <div class="tz-narr" aria-live="polite"></div>
    <div class="tz-mandos">
      <button class="tz-ant" aria-label="Paso anterior">◀</button>
      <button class="tz-sig pri">Paso ▶</button>
      <button class="tz-play">Reproducir</button>
      <button class="tz-reset">Reiniciar</button>
      <span class="tz-cuenta"></span>
    </div>
  </div>
  <div class="tz-col">
    <div class="tz-caja"><div class="tz-barra negro"><span>Memoria</span><span>en R todo es un vector</span></div><div class="tz-mem"></div></div>
    <div class="tz-caja"><div class="tz-barra negro"><span>Consola</span></div><pre class="tz-consola"></pre></div>
  </div>
</div>
<div class="tz-caja tz-tabla-bloque"><div class="tz-barra"><span>Tabla de traza</span><span class="tz-tabla-sub"></span></div>
  <div style="overflow-x:auto"><table class="tz-tabla"><thead></thead><tbody></tbody></table></div><p class="tz-nota"></p></div>`;

function render({ model, el }) {
  const C = model.get("config") || {};
  const D = model.get("traza");
  if (!D || !D.pasos) { el.textContent = "Falta la traza: ejecuta herramientas/trazar.R sobre este capítulo."; return; }
  el.innerHTML = '<style>' + ESTILOS + '</style><div class="tz">' + PLANTILLA + "</div>";
  const q = s => el.querySelector(s);
  const P = D.pasos, L = D.codigo.split("\n"), cols = C.columnas || [];
  const porLinea = C.fila_en === "cada_linea";
  let k = 0, timer = null;

  q(".tz-tit").textContent = C.titulo || "";
  q(".tz-etq").textContent = C.etiqueta || "";
  q(".tz-idea").textContent = C.idea || "";
  q(".tz-codigo").innerHTML = L.map((l, i) => '<span class="ln" data-n="' + (i + 1) + '"><span class="fl">▶</span><span class="no">' + (i + 1) + "</span>" + (colorea(l) || " ") + "</span>").join("");
  if (!cols.length) q(".tz-tabla-bloque").style.display = "none";
  q(".tz-tabla").querySelector("thead").innerHTML = "<tr>" + cols.map(c => "<th>" + esc(c) + "</th>").join("") + "</tr>";
  q(".tz-tabla-sub").textContent = porLinea ? "una fila por línea" : "una fila por vuelta";
  q(".tz-nota").textContent = porLinea ? "Cada fila es el estado justo después de ejecutar esa línea." : "La fila de cada vuelta se escribe al terminarla.";

  const vec = (p, n) => p.estado[n];
  const longitud = v => v && v.v ? v.v.length : 0;
  const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const muestra = v => !v ? "" : v.v ? (v.v.length === 1 ? v.v[0] : "c(" + v.v.join(", ") + ")") : v.t;
  const varDelFor = l => ((L[l - 1] || "").match(/for\s*\(\s*([\w.]+)\s+in\s+(.+)\)\s*\{?\s*$/) || []);

  function narra(p, prev) {
    if (p.tipo === "inicio") return "El programa está listo. Pulsa «Paso ▶» para ejecutar la primera línea.";
    if (p.tipo === "error") return "R se detiene en la línea " + p.linea + " con un error. Lo que viene detrás ya no se ejecuta.";
    if (p.tipo === "vuelta") {
      const [, v, sec] = varDelFor(p.linea);
      return v ? "Vuelta " + p.vuelta + " del <code>for</code>: " + code(v) + " toma el elemento " + p.vuelta + " de " + code(sec) + ", que vale " + esc(muestra(vec(p, v))) + "."
        : "Vuelta " + p.vuelta + " del bucle.";
    }
    if (p.tipo === "fin") return p.vuelta ? "El <code>for</code> ya ha recorrido todos los elementos (" + p.vuelta + (p.vuelta === 1 ? " vuelta" : " vueltas") + "): el programa sigue después del bucle."
      : "El bucle termina: el programa sigue después de él.";
    if (p.tipo === "condicion") {
      const si = p.cond.valor === "TRUE", esWhile = /^\s*while\b/.test(L[p.linea - 1]);
      return "Se comprueba " + code(p.cond.texto) + (p.cond.valores !== p.cond.texto ? ": con los valores de ahora, " + code(p.cond.valores) : "") + ", que es " + code(p.cond.valor) + ". " +
        (esWhile ? (si ? "El <code>while</code> da otra vuelta." : "El <code>while</code> se detiene.") : (si ? "Se entra en el bloque del <code>if</code>." : "Se salta el bloque del <code>if</code>" + (/else/.test(L.slice(p.linea - 1).join(" ")) ? " y se va al <code>else</code>." : ".")));
    }
    const frases = [];
    for (const n of Object.keys(p.estado)) {
      const a = prev.estado[n], b = p.estado[n];
      if (!a) { frases.push("Se crea " + code(n) + (b.v ? ", un vector " + code(b.t) + " de " + (b.v.length === 1 ? "un elemento" : b.v.length + " elementos") : ", de tipo " + code(b.t)) + "."); continue; }
      if (igual(a, b)) continue;
      if (a.v && b.v && a.v.length === b.v.length) {
        const camb = b.v.map((x, i) => x !== a.v[i] ? i : -1).filter(i => i >= 0);
        if (camb.length === 1 && b.v.length > 1) frases.push("Cambia " + code(n + "[" + (camb[0] + 1) + "]") + ": valía " + esc(a.v[camb[0]]) + " y ahora vale " + esc(b.v[camb[0]]) + ".");
        else if (b.v.length === 1) frases.push(code(n) + " valía " + esc(a.v[0]) + " y ahora vale " + esc(b.v[0]) + ".");
        else frases.push("Cambian " + camb.length + " elementos de " + code(n) + ".");
      } else frases.push(code(n) + " cambia" + (b.v ? ": ahora tiene " + b.v.length + " elementos." : "."));
    }
    if (p.salida.length > prev.salida.length) frases.push("R escribe el resultado en la consola.");
    if (p.avisos) frases.push("Y R da un <b>aviso</b>: el cálculo se hace, pero algo no encaja.");
    return frases.length ? frases.join(" ") : "Se ejecuta la línea " + p.linea + ".";
  }

  function casillas(v, previo, opciones = {}) {
    const cambia = i => previo && previo.v && previo.v.length === v.v.length && previo.v[i] !== v.v[i];
    return '<div class="fila-cas' + (opciones.grande ? " grande" : "") + '">' + v.v.map((x, i) =>
      '<span class="cas' + (cambia(i) ? " cambia" : "") + (opciones.foco === i + 1 ? " foco" : "") + '"><span class="v">' + esc(x) + '</span><span class="idx">' + esc(v.n ? v.n[i] : "[" + (i + 1) + "]") + "</span></span>").join("") +
      (opciones.foco ? '<span class="puntero"><span class="et">' + esc(opciones.puntero) + " = " + opciones.foco + '</span><span class="flecha"></span></span>' : "") + "</div>";
  }

  function memoria(p, prev) {
    const nombres = Object.keys(p.estado);
    if (!nombres.length) return '<p class="tz-vacio">Todavía no hay ninguna variable.</p>';
    const orden = C.foco && nombres.includes(C.foco) ? [C.foco].concat(nombres.filter(n => n !== C.foco)) : nombres;
    let html = "";
    if (p.tipo === "condicion") html += '<div class="tz-cond"><span>' + esc(p.cond.texto) + '</span><span style="color:var(--banda)">' + esc(p.cond.valores) + '</span><span class="res ' + (p.cond.valor === "TRUE" ? "si" : "no") + '">' + p.cond.valor + "</span></div>";
    for (const n of orden) {
      const v = p.estado[n], a = prev && prev.estado[n];
      const cambio = !a || !igual(a, v);
      html += '<div class="vec' + (cambio && p.tipo !== "inicio" ? " cambia" : "") + '"><div class="vec-cab"><span class="nom">' + esc(n) + '</span><span class="tipo">' + esc(v.t) + "</span>" +
        (v.v ? '<span class="lon">longitud ' + v.v.length + "</span>" : "") + "</div>";
      if (v.v) {
        const foco = n === C.foco && C.puntero && p.estado[C.puntero] && p.estado[C.puntero].v ? Number(p.estado[C.puntero].v[0]) : null;
        html += casillas(v, a, { grande: n === C.foco, foco: foco >= 1 && foco <= v.v.length ? foco : null, puntero: C.puntero });
      } else if (v.r) html += '<div class="otro">' + esc(v.r) + "</div>";
      else html += '<div class="otro">' + esc(v.t) + "</div>";
      html += "</div>";
    }
    if (p.avisos) html += '<div class="tz-aviso"><b>Aviso de R</b><br>' + p.avisos.map(esc).join("<br>") + "</div>";
    if (p.tipo === "error") html += '<div class="tz-error"><b>Error de R</b><br>' + esc(p.error) + "</div>";
    return html;
  }

  function coloca() {                          // el puntero, sobre su casilla
    const f = el.querySelector(".grande"); if (!f) return;
    const c = f.querySelector(".cas.foco"), pt = f.querySelector(".puntero");
    if (c && pt) pt.style.left = (c.offsetLeft + c.offsetWidth / 2) + "px";
  }

  function pinta() {
    const p = P[k], prev = P[Math.max(0, k - 1)];
    el.querySelectorAll(".ln").forEach(n => n.classList.remove("hecha", "error"));
    if (p.linea) { const ln = el.querySelector('.ln[data-n="' + p.linea + '"]'); ln.classList.add("hecha"); if (p.tipo === "error") ln.classList.add("error"); }
    q(".tz-lin").textContent = p.linea ? "línea " + p.linea : "";
    q(".tz-narr").innerHTML = narra(p, prev);
    q(".tz-mem").innerHTML = memoria(p, k ? prev : null);
    q(".tz-consola").textContent = p.salida || "";
    q(".tz-cuenta").textContent = "paso " + k + " de " + (P.length - 1);
    q(".tz-ant").disabled = k === 0; q(".tz-sig").disabled = k === P.length - 1;
    const filas = (D.filas || []).slice(0, p.nfilas || 0);
    q(".tz-tabla").querySelector("tbody").innerHTML = filas.map((f, i) => '<tr class="' + (i === filas.length - 1 && p.nfilas > (prev.nfilas || 0) ? "nueva" : "") + '">' +
      cols.map(c => "<td>" + esc(f[c] ?? "") + "</td>").join("") + "</tr>").join("");
    requestAnimationFrame(coloca);
  }
  const para = () => { if (timer) { clearInterval(timer); timer = null; q(".tz-play").textContent = "Reproducir"; } };
  q(".tz-sig").addEventListener("click", () => { para(); if (k < P.length - 1) { k++; pinta(); } });
  q(".tz-ant").addEventListener("click", () => { para(); if (k > 0) { k--; pinta(); } });
  q(".tz-reset").addEventListener("click", () => { para(); k = 0; pinta(); });
  q(".tz-play").addEventListener("click", () => {
    if (timer) return para();
    if (k === P.length - 1) k = 0;
    q(".tz-play").textContent = "Pausa";
    timer = setInterval(() => { if (k >= P.length - 1) return para(); k++; pinta(); }, 1100);
  });
  pinta();
  return () => para();
}

export default { render };
