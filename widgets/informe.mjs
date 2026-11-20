// informe.mjs · Visualizador de informes de Quarto (AC Institut · anywidget para MyST / Jupyter Book 2)
// A la izquierda, el documento .qmd; a la derecha, el informe que se va construyendo, trozo a trozo,
// y la sesión de R que lo acompaña. Quarto ejecuta el R con knitr, bloque a bloque y en orden, en una
// sesión nueva; el texto pasa tal cual, con el código en línea ya calculado. Los datos de cada paso
// los escribe herramientas/informe.R en datos/informes/. Si el informe tiene un parámetro, unos
// botones permiten generarlo con otro valor, como quarto render informe.qmd -P isla:Dream.

const ESTILOS = `
.qi{ --acento:#7A1F36; --suave:#F6F0EE; --banda:#6B6B6B; --filete:#9A9A9A; --fila:#D4D4D4; --fondo:#F4F4F4; --tinta:#111; --sub:#333;
  --titulo:"Montserrat","Helvetica Neue",Arial,sans-serif; --texto:"Arimo","Liberation Sans",Arial,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  font:400 15px/1.55 var(--texto); color:var(--tinta); background:#fff; display:flex; flex-direction:column; gap:16px;
  padding:16px; border:1px solid var(--fila); border-radius:10px; margin:1.25rem 0; }
.qi *{ box-sizing:border-box; min-width:0; }
.qi p{ margin:0; }
.qi-cab{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; flex-wrap:wrap; }
.qi-tit{ font:700 18px/1.2 var(--titulo); }
.qi-etq{ font:600 10.5px/1 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--acento); border:1.5px solid var(--acento); border-radius:6px; padding:5px 8px; }
.qi-idea{ border-left:4px solid var(--acento); padding:2px 0 2px 12px; color:var(--sub); }
.qi-param[hidden]{ display:none; }
.qi-param{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; background:var(--fondo); border-radius:8px; padding:10px 12px; }
.qi-param .que{ font:600 13px/1.3 var(--mono); }
.qi-param button{ font:600 13.5px/1 var(--mono); min-height:38px; padding:0 12px; border:2px solid var(--acento); background:#fff; color:var(--acento); border-radius:999px; cursor:pointer; }
.qi-param button[aria-pressed=true]{ background:var(--acento); color:#fff; }
.qi-param .orden{ flex-basis:100%; font:500 12.5px/1.4 var(--mono); color:var(--banda); }
.qi-escena{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:16px; align-items:start; }
.qi-col{ display:flex; flex-direction:column; gap:12px; }
.qi-caja{ border:2px solid var(--tinta); background:#fff; }
.qi-barra{ background:var(--acento); color:#fff; padding:6px 12px; font:600 10.5px/1.2 var(--titulo); letter-spacing:.12em; text-transform:uppercase; display:flex; justify-content:space-between; gap:2px 8px; flex-wrap:wrap; }
.qi-barra.negro{ background:var(--tinta); }
pre.qi-qmd{ margin:0; font:400 13.5px/1.8 var(--mono); overflow-x:auto; background:var(--fondo); padding:6px 0; border:0; }
.qi .ln{ display:flex; white-space:pre; padding-right:12px; border-left:4px solid transparent; min-width:max-content; }
.qi .ln .no{ width:2.4ch; flex:none; text-align:right; color:var(--filete); margin:0 12px 0 6px; }
.qi .ln.activa{ border-left-color:var(--acento); background:var(--suave); }
.qi .ln.hecha{ color:#555; }
.qi .ln.fallo{ background:#F3E3E6; border-left-color:var(--acento); }
.qi .yml{ color:#1E4A6B; } .qi .valla{ color:var(--acento); font-weight:600; } .qi .opc{ color:#2D5A48; font-style:italic; }
.qi .enl{ background:#FBF3E2; color:#4A3000; border-radius:3px; }
.qi-narr{ background:var(--suave); border-left:4px solid var(--acento); padding:12px 14px; font-size:15px; }
.qi-narr code{ font:500 13px/1.3 var(--mono); background:#fff; padding:1px 4px; border-radius:3px; }
.qi-mandos{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.qi-mandos button{ font:600 14px/1 var(--titulo); min-height:44px; padding:0 16px; border:2px solid var(--tinta); background:#fff; color:var(--tinta); border-radius:6px; cursor:pointer; }
.qi-mandos button.pri{ background:var(--acento); border-color:var(--acento); color:#fff; }
.qi-mandos button:disabled{ opacity:.4; cursor:default; }
.qi-mandos button:focus-visible, .qi-param button:focus-visible{ outline:3px solid var(--acento); outline-offset:2px; }
.qi-cuenta{ margin-left:auto; font:500 12.5px/1 var(--mono); color:var(--banda); }
.qi-doc{ padding:18px 20px 22px; font:400 15px/1.6 Georgia,"Times New Roman",serif; min-height:120px; }
.qi-doc .doc-tit{ font:700 24px/1.2 var(--titulo); margin:0 0 14px; padding-bottom:10px; border-bottom:1px solid var(--fila); }
.qi-doc .trozo{ margin:0 0 12px; padding:2px 0 2px 0; border-left:4px solid transparent; transition:background .25s; }
.qi-doc .trozo.nuevo{ border-left-color:var(--acento); background:var(--suave); padding-left:10px; margin-left:-14px; }
.qi-doc h1, .qi-doc h2, .qi-doc h3{ font-family:var(--titulo); margin:6px 0 6px; line-height:1.25; }
.qi-doc h2{ font-size:19px; } .qi-doc h3{ font-size:16px; }
.qi-doc p{ margin:0 0 8px; }
.qi-doc pre{ margin:6px 0; padding:8px 10px; font:400 13px/1.55 var(--mono); overflow-x:auto; white-space:pre; }
.qi-doc pre:has(code.language-r){ background:var(--fondo); border-left:3px solid var(--filete); }
.qi-doc pre:not(:has(code.language-r)){ background:#fff; border:1px solid var(--fila); }
.qi-doc code{ font-family:var(--mono); font-size:.9em; }
.qi-doc figure{ margin:8px 0; } .qi-doc figure img{ width:100%; height:auto; display:block; border:1px solid var(--fila); }
.qi-doc figcaption{ font:500 13px/1.4 var(--texto); color:var(--sub); margin-top:6px; text-align:center; }
.qi-doc table{ border-collapse:collapse; font:500 13.5px/1.3 var(--texto); margin:6px 0; }
.qi-doc th, .qi-doc td{ border-bottom:1px solid var(--fila); padding:4px 10px; text-align:left; }
.qi-doc th{ border-bottom:1.5px solid var(--tinta); font-family:var(--titulo); font-size:12px; }
.qi-doc caption{ caption-side:top; font:500 13px/1.4 var(--texto); color:var(--sub); padding-bottom:6px; text-align:left; }
.qi-doc .inl{ background:#FBF3E2; border-bottom:2px solid #8A5A00; padding:0 2px; }
.qi-doc .ref{ color:var(--acento); text-decoration:underline; }
.qi-doc .vacio{ font:italic 400 14px/1.4 var(--texto); color:var(--banda); }
.qi-doc .roto{ border:2px solid var(--acento); background:var(--suave); border-radius:8px; padding:10px 12px; font:400 14px/1.45 var(--texto); }
.qi-doc .roto b{ font-family:var(--titulo); }
.qi-ses{ padding:8px 12px 10px; display:flex; flex-direction:column; gap:6px; font-size:14px; }
.qi-ses .var{ display:flex; gap:8px; align-items:baseline; flex-wrap:wrap; }
.qi-ses .var b{ font:600 13.5px/1.3 var(--mono); }
.qi-ses .var span{ color:var(--sub); }
.qi-ses .var.nueva{ background:var(--suave); margin:0 -6px; padding:2px 6px; border-radius:4px; }
.qi-ses .vacio{ color:var(--banda); font-style:italic; }
.qi:fullscreen{ overflow:auto; padding:24px 4vw; border:0; border-radius:0; margin:0; }
.qi:fullscreen > *{ zoom:1.2; }
@media (max-width:760px){ .qi-escena{ grid-template-columns:minmax(0,1fr); } }
@media (prefers-reduced-motion:reduce){ .qi *{ transition:none !important; } }
`;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const code = s => "<code>" + esc(s) + "</code>";
const lista = xs => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " y " + xs[xs.length - 1];

function render({ model, el }) {
  const C = model.get("config") || {}, archivo = model.get("archivo");
  if (!archivo) { el.textContent = "Faltan los datos del informe: ejecuta herramientas/informe.R sobre este capítulo."; return; }
  el.innerHTML = '<p style="font:500 13px/1.4 sans-serif;color:#6B6B6B;margin:0;padding:12px 0">Cargando el visualizador…</p>';
  return fetch(new URL("../" + archivo, import.meta.url))
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => dibuja(el, C, d))
    .catch(() => { el.textContent = "No se ha podido cargar el visualizador (" + archivo + ")."; });
}

function dibuja(el, C, D) {
  el.innerHTML = "<style>" + ESTILOS + '</style><div class="qi">' +
    '<div class="qi-cab"><span class="qi-tit"></span><span class="qi-etq"></span></div><p class="qi-idea"></p>' +
    '<div class="qi-param" hidden></div>' +
    '<div class="qi-escena"><div class="qi-col">' +
      '<div class="qi-caja"><div class="qi-barra"><span>informe.qmd</span><span class="qi-lin"></span></div><pre class="qi-qmd"></pre></div>' +
      '<div class="qi-narr" aria-live="polite"></div>' +
      '<div class="qi-mandos"><button class="qi-ant" aria-label="Paso anterior">◀</button><button class="qi-sig pri">Paso ▶</button>' +
      '<button class="qi-play">Reproducir</button><button class="qi-reset">Reiniciar</button><button class="qi-proy">Proyectar</button><span class="qi-cuenta"></span></div>' +
    '</div><div class="qi-col">' +
      '<div class="qi-caja"><div class="qi-barra negro"><span>El informe</span><span class="qi-fmt"></span></div><div class="qi-doc"></div></div>' +
      '<div class="qi-caja"><div class="qi-barra negro"><span>Sesión de R</span><span>la del documento</span></div><div class="qi-ses"></div></div>' +
    "</div></div></div>";
  const q = s => el.querySelector(s);
  const L = D.qmd.split("\n");
  const nombres = Object.keys(D.versiones);
  let ver = nombres[0], P = [], k = 0, timer = null;

  q(".qi-tit").textContent = C.titulo || "";
  q(".qi-etq").textContent = C.etiqueta || "";
  q(".qi-idea").textContent = C.idea || "";
  if (!C.idea) q(".qi-idea").style.display = "none";

  // el .qmd coloreado: la cabecera YAML, las vallas de los bloques, las opciones #| y el código en línea
  let enYaml = false, enBloque = false, nY = 0;
  q(".qi-qmd").innerHTML = L.map((l, i) => {
    let h;
    if (l === "---") { nY++; enYaml = nY === 1; h = '<span class="valla">---</span>'; }
    else if (enYaml) h = '<span class="yml">' + esc(l) + "</span>";
    else if (/^```\{r/.test(l)) { enBloque = true; h = '<span class="valla">' + esc(l) + "</span>"; }
    else if (enBloque && /^```\s*$/.test(l)) { enBloque = false; h = '<span class="valla">```</span>'; }
    else if (enBloque && /^#\|/.test(l)) h = '<span class="opc">' + esc(l) + "</span>";
    else if (enBloque) h = esc(l);
    else h = esc(l).replace(/(`\{?r\}? [^`]+`)/g, '<span class="enl">$1</span>');
    return '<span class="ln" data-n="' + (i + 1) + '"><span class="no">' + (i + 1) + "</span>" + (h || " ") + "</span>";
  }).join("");

  // las imágenes de los gráficos están en datos/graficos/, en la raíz del sitio
  const fija = html => html.replace(/src="(datos\/[^"]+)"/g, (m, s) => 'src="' + new URL("../" + s, import.meta.url).href + '"');

  function carga(v) {
    ver = v;
    const R = D.versiones[v];
    P = R.pasos.slice();
    if (R.final) P.push({ tipo: "fin", sesion: P[P.length - 1].sesion });
    const fmt = (P[0].cabecera && P[0].cabecera.format) || "html";
    q(".qi-fmt").textContent = typeof fmt === "string" ? fmt : Object.keys(fmt)[0];
  }

  if (nombres.length > 1) {
    const par = D.parametro, caja = q(".qi-param");
    caja.hidden = false;
    caja.innerHTML = '<span class="que">params$' + esc(par) + ' =</span>' + nombres.map(n => '<button data-v="' + esc(n) + '" aria-pressed="false">' + esc(n) + "</button>").join("") + '<span class="orden"></span>';
    const pinta1 = () => {
      caja.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === ver));
      caja.querySelector(".orden").textContent = "Es como escribir en la terminal: quarto render informe.qmd -P " + par + ":" + ver;
    };
    caja.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { para(); carga(b.dataset.v); k = P.length - 1; pinta1(); pinta(); }));
    carga(ver); pinta1();
  } else carga(ver);

  function opcionesTexto(o) {
    const f = [];
    if (o.include === false) f.push(code("#| include: false") + ": el código se ejecuta, pero no entra nada en el informe, ni el código ni lo que escribe. Sirve para preparar lo que se usará después: cargar paquetes, leer los datos, calcular valores para el texto");
    else {
      if (o.eval === false) f.push(code("#| eval: false") + ": el código entra en el informe, pero no se ejecuta");
      if (o.echo === false) f.push(code("#| echo: false") + ": en el informe entra el resultado, pero no el código");
      if (o.output === false) f.push(code("#| output: false") + ": se ejecuta y se enseña el código, pero no lo que escribe");
      if (o.warning === false) f.push(code("#| warning: false") + ": si R da un aviso, no entra en el informe");
      if (o.message === false) f.push(code("#| message: false") + ": los mensajes de R no entran en el informe");
    }
    if (o.label && /^tbl-/.test(o.label)) f.push(code("#| label: " + o.label) + " y " + code("#| tbl-cap") + ": la tabla lleva número y pie, encima, y el texto puede citarla con " + code("@" + o.label));
    if (o.label && /^fig-/.test(o.label)) f.push(code("#| label: " + o.label) + " y " + code("#| fig-cap") + ": el gráfico lleva número y pie, y el texto puede citarlo con " + code("@" + o.label));
    return f;
  }

  function narra(p, i) {
    const S = p.sesion || [], antes = i > 0 ? (P[i - 1].sesion || []).map(x => x.nombre) : [];
    const nuevas = S.filter(x => !antes.includes(x.nombre)).map(x => code(x.nombre));
    const lineas = p.ini === p.fin ? "la línea " + p.ini : "las líneas " + p.ini + " a " + p.fin;
    if (p.tipo === "yaml") {
      const c = p.cabecera || {}, prm = p.params ? Object.entries(p.params).map(([n, v]) => code(n) + " vale " + code(JSON.stringify(v))) : [];
      return "Quarto empieza por la <b>cabecera YAML</b>, entre las dos líneas " + code("---") + ": el título" + (c.title ? ", «" + esc(c.title) + "»" : "") +
        (c.lang ? ", el idioma (" + code("lang: " + c.lang) + ")" : "") + (c.format ? ", el formato del informe (" + code(typeof c.format === "string" ? c.format : Object.keys(c.format)[0]) + ")" : "") +
        (prm.length ? " y los parámetros: " + lista(prm) + "." : ".") +
        " Después arranca una <b>sesión de R nueva</b>, vacía" + (prm.length ? ": solo existe " + code("params") + ", la lista con los parámetros." : ": no existe ninguna variable, aunque las tengas en tu consola.");
    }
    if (p.tipo === "bloque") {
      const o = p.opciones || {}, op = opcionesTexto(o);
      const sale = p.figuras ? "el gráfico" : /<table/.test(p.html || "") ? "la tabla" : /<pre><code>/.test(p.html || "") ? "lo que escribe" : "";
      const entra = o.include === false || !p.html ? "" : o.eval === false ? " En el informe aparece solo el código, sin ejecutar." :
        o.echo === false ? (sale ? " En el informe aparece " + sale + "." : "") :
        sale ? " En el informe aparecen el código y " + sale + (sale === "lo que escribe" ? ", uno debajo del otro." : ".") : " En el informe aparece el código; no escribe nada.";
      return "Quarto le pasa a R el <b>bloque de código</b> de " + lineas + (o.eval === false ? "." : ", y R lo ejecuta en la sesión del documento.") +
        (op.length ? " Sus opciones, las líneas que empiezan por " + code("#|") + ", dicen qué hacer con él. " + op.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(". ") + "." : " No tiene opciones.") +
        entra + (nuevas.length ? " En la sesión " + (nuevas.length === 1 ? "aparece " : "aparecen ") + lista(nuevas) + "." : "");
    }
    if (p.tipo === "texto") {
      const inl = p.inline || [];
      return (p.titulo ? "Un <b>título</b> en Markdown: " + code("##") + " es un título de segundo nivel." : "Un <b>párrafo de texto</b> en Markdown: pasa al informe tal cual, con su formato.") +
        (inl.length ? " Pero antes, Quarto calcula el <b>código en línea</b>: " + lista(inl.map(x => code("{r} " + x.codigo) + " vale " + code(x.valor))) + ". En el informe se escribe el valor, no el código." : "") +
        (/class="ref"/.test(p.html || "") ? " Y la referencia " + code("@" + ((L.slice(p.ini - 1, p.fin).join(" ").match(/@((?:fig|tbl)-[\w-]+)/) || [])[1] || "")) + " se convierte en «" + ((p.html.match(/class="ref">([^<]+)</) || [])[1] || "") + "», con su número." : "");
    }
    if (p.tipo === "error")
      return "R da un <b>error</b> en " + lineas + ": «" + esc(p.error) + "». Quarto se detiene: escribe en la terminal en qué líneas estaba y cuál es el error, y <b>no genera el informe</b>. Lo que había hasta aquí no se guarda.";
    if (p.tipo === "fin")
      return "Ya está todo. Quarto le pasa el resultado a <b>pandoc</b>, que lo convierte en el formato pedido: una página HTML, que se abre en cualquier navegador. Si cambian los datos, basta con volver a generarlo." +
        (nombres.length > 1 ? " Prueba a cambiar el parámetro con los botones de arriba: el mismo documento da otro informe." : "");
    return "";
  }

  function pinta() {
    const p = P[k];
    el.querySelectorAll(".ln").forEach(n => n.classList.remove("activa", "hecha", "fallo"));
    for (let i = 1; i <= k; i++) { const x = P[i]; if (!x.ini) continue; for (let n = x.ini; n <= x.fin; n++) { const ln = q('.ln[data-n="' + n + '"]'); if (ln) ln.classList.add("hecha"); } }
    if (p.ini) for (let n = p.ini; n <= p.fin; n++) { const ln = q('.ln[data-n="' + n + '"]'); if (ln) ln.classList.add(p.tipo === "error" ? "fallo" : "activa"); }
    q(".qi-lin").textContent = p.ini ? (p.ini === p.fin ? "línea " + p.ini : "líneas " + p.ini + "-" + p.fin) : "";
    // el informe: el título del YAML y lo que ha entrado hasta este paso
    const cab = P[0].cabecera || {};
    let html = k === 0 ? '<p class="vacio">Todavía no hay nada: Quarto acaba de leer la cabecera.</p>' : "";
    if (k > 0 && cab.title) html = '<h1 class="doc-tit">' + esc(cab.title) + "</h1>";
    for (let i = 1; i <= k; i++) {
      const x = P[i];
      if (x.tipo === "error") { html += '<div class="roto"><b>Error</b>: ' + esc(x.error) + "<br>Quarto se ha detenido y no hay informe.</div>"; continue; }
      if (!x.html) continue;
      html += '<div class="trozo' + (i === k ? " nuevo" : "") + '">' + fija(x.html) + "</div>";
    }
    if (k > 0 && !P.slice(1, k + 1).some(x => x.html || x.tipo === "error")) html += '<p class="vacio">El informe aún no tiene contenido.</p>';
    q(".qi-doc").innerHTML = html;
    const S = p.sesion || [], antes = k > 0 ? (P[k - 1].sesion || []).map(x => x.nombre) : [];
    q(".qi-ses").innerHTML = S.length ? S.map(x => '<div class="var' + (k > 0 && !antes.includes(x.nombre) ? " nueva" : "") + '"><b>' + esc(x.nombre) + "</b><span>" + esc(x.desc) + "</span></div>").join("")
      : '<p class="vacio">Sesión vacía.</p>';
    q(".qi-narr").innerHTML = narra(p, k);
    q(".qi-cuenta").textContent = "paso " + k + " de " + (P.length - 1);
    q(".qi-ant").disabled = k === 0; q(".qi-sig").disabled = k === P.length - 1;
  }
  const para = () => { if (timer) { clearInterval(timer); timer = null; q(".qi-play").textContent = "Reproducir"; } };
  q(".qi-sig").addEventListener("click", () => { para(); if (k < P.length - 1) { k++; pinta(); } });
  q(".qi-ant").addEventListener("click", () => { para(); if (k > 0) { k--; pinta(); } });
  q(".qi-reset").addEventListener("click", () => { para(); k = 0; pinta(); });
  q(".qi-play").addEventListener("click", () => {
    if (timer) return para();
    if (k === P.length - 1) k = 0;
    q(".qi-play").textContent = "Pausa";
    timer = setInterval(() => { if (k >= P.length - 1) return para(); k++; pinta(); }, 1600);
  });
  const raiz = q(".qi"), proy = q(".qi-proy");
  raiz.tabIndex = -1;
  const proyectando = () => ((raiz.getRootNode().fullscreenElement || document.fullscreenElement) === raiz);
  if (!document.fullscreenEnabled || !raiz.requestFullscreen) proy.remove();
  else proy.addEventListener("click", () => { if (proyectando()) document.exitFullscreen(); else raiz.requestFullscreen().then(() => raiz.focus()).catch(() => {}); });
  const alCambiar = () => { proy.textContent = proyectando() ? "Salir de la proyección" : "Proyectar"; };
  document.addEventListener("fullscreenchange", alCambiar);
  raiz.addEventListener("keydown", e => {
    const acc = { ArrowRight: ".qi-sig", PageDown: ".qi-sig", ArrowLeft: ".qi-ant", PageUp: ".qi-ant", Home: ".qi-reset", p: ".qi-play", P: ".qi-play", f: ".qi-proy", F: ".qi-proy" };
    const b = acc[e.key] && q(acc[e.key]);
    if (b && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); b.click(); }
  });
  pinta();
  return () => { para(); document.removeEventListener("fullscreenchange", alCambiar); };
}

export default { render };
