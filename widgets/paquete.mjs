// paquete.mjs · Visualizador de la construcción de un paquete de R (AC Institut · anywidget para MyST)
// A la izquierda, las órdenes que se escriben en la consola, una por paso; a la derecha, la carpeta del
// paquete, con los archivos nuevos y los que han cambiado, el contenido del archivo que importa en cada
// paso y lo que escribe la consola. Los datos los escribe herramientas/paquete.R, que ejecuta de verdad
// las órdenes de usethis y devtools en una carpeta temporal (datos/paquetes/<guion>.json).

const ESTILOS = `
.pq{ --acento:#7A1F36; --suave:#F6F0EE; --banda:#6B6B6B; --filete:#9A9A9A; --fila:#D4D4D4; --fondo:#F4F4F4; --tinta:#111; --sub:#333; --nuevo:#2D5A48;
  --titulo:"Montserrat","Helvetica Neue",Arial,sans-serif; --texto:"Arimo","Liberation Sans",Arial,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  font:400 15px/1.55 var(--texto); color:var(--tinta); background:#fff; display:flex; flex-direction:column; gap:16px;
  padding:16px; border:1px solid var(--fila); border-radius:10px; margin:1.25rem 0; }
.pq *{ box-sizing:border-box; min-width:0; }
.pq p{ margin:0; }
.pq-cab{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; flex-wrap:wrap; }
.pq-tit{ font:700 18px/1.2 var(--titulo); }
.pq-etq{ font:600 10.5px/1 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--acento); border:1.5px solid var(--acento); border-radius:6px; padding:5px 8px; }
.pq-idea{ border-left:4px solid var(--acento); padding:2px 0 2px 12px; color:var(--sub); }
.pq-escena{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:16px; align-items:start; }
.pq-col{ display:flex; flex-direction:column; gap:12px; }
.pq-caja{ border:2px solid var(--tinta); background:#fff; }
.pq-barra{ background:var(--acento); color:#fff; padding:6px 12px; font:600 10.5px/1.2 var(--titulo); letter-spacing:.12em; text-transform:uppercase; display:flex; justify-content:space-between; gap:2px 8px; flex-wrap:wrap; }
.pq-barra.negro{ background:var(--tinta); }
.pq-barra .arch{ font:600 12px/1.2 var(--mono); letter-spacing:0; text-transform:none; }
.pq-ordenes{ margin:0; padding:6px 0; background:var(--fondo); font:400 13.5px/1.7 var(--mono); }
.pq-ordenes li{ list-style:none; display:flex; gap:10px; padding:3px 12px 3px 8px; border-left:4px solid transparent; }
.pq-ordenes li .n{ flex:none; width:2.2ch; text-align:right; color:var(--filete); }
.pq-ordenes li pre{ margin:0; font:inherit; white-space:pre-wrap; overflow-wrap:anywhere; background:transparent; padding:0; border:0; }
.pq-ordenes li.hecha{ color:#555; }
.pq-ordenes li.activa{ border-left-color:var(--acento); background:var(--suave); color:var(--tinta); }
.pq-ordenes li.futura{ opacity:.45; }
.pq-ordenes .com{ color:var(--filete); font-style:italic; }
.pq-narr{ background:var(--suave); border-left:4px solid var(--acento); padding:12px 14px; font-size:15px; }
.pq-narr code{ font:500 13px/1.3 var(--mono); background:#fff; padding:1px 4px; border-radius:3px; }
.pq-mandos{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.pq-mandos button{ font:600 14px/1 var(--titulo); min-height:44px; padding:0 16px; border:2px solid var(--tinta); background:#fff; color:var(--tinta); border-radius:6px; cursor:pointer; }
.pq-mandos button.pri{ background:var(--acento); border-color:var(--acento); color:#fff; }
.pq-mandos button:disabled{ opacity:.4; cursor:default; }
.pq-mandos button:focus-visible{ outline:3px solid var(--acento); outline-offset:2px; }
.pq-cuenta{ margin-left:auto; font:500 12.5px/1 var(--mono); color:var(--banda); }
.pq-arbol{ margin:0; padding:8px 12px; font:400 13.5px/1.7 var(--mono); }
.pq-arbol div{ display:flex; gap:8px; align-items:baseline; white-space:pre; }
.pq-arbol .dir{ font-weight:600; }
.pq-arbol .marca{ font:600 9.5px/1 var(--titulo); letter-spacing:.06em; text-transform:uppercase; border-radius:4px; padding:3px 5px; }
.pq-arbol .nuevo .marca{ background:var(--nuevo); color:#fff; }
.pq-arbol .cambia .marca{ background:var(--acento); color:#fff; }
.pq-arbol .nuevo .nom, .pq-arbol .cambia .nom{ font-weight:600; }
.pq-arbol .visto .nom{ text-decoration:underline; text-decoration-color:var(--acento); text-underline-offset:3px; }
.pq-vacio{ padding:10px 12px; color:var(--banda); font-style:italic; }
pre.pq-archivo{ margin:0; padding:8px 12px; font:400 12.5px/1.6 var(--mono); background:var(--fondo); overflow-x:auto; white-space:pre; max-height:420px; overflow-y:auto; border:0; }
pre.pq-archivo .no{ display:inline-block; width:2.4ch; text-align:right; margin-right:10px; color:var(--filete); user-select:none; }
pre.pq-archivo .fa.res{ background:#F3E3E6; box-shadow:-12px 0 0 #F3E3E6, 12px 0 0 #F3E3E6; }
pre.pq-archivo .fa.res .no{ color:var(--acento); font-weight:700; }
pre.pq-consola{ margin:0; padding:10px 12px; font:400 13px/1.55 var(--mono); background:var(--tinta); color:#EDEDED; overflow-x:auto; white-space:pre; min-height:2.6em; border:0; }
.pq:fullscreen{ overflow:auto; padding:24px 4vw; border:0; border-radius:0; margin:0; }
.pq:fullscreen > *{ zoom:1.2; }
@media (max-width:760px){ .pq-escena{ grid-template-columns:minmax(0,1fr); } }
`;

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// las notas de los guiones vienen con `código` y **negrita**
const md = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

function render({ model, el }) {
  const C = model.get("config") || {}, archivo = model.get("archivo");
  if (!archivo) { el.textContent = "Faltan los datos: ejecuta herramientas/paquete.R sobre este capítulo."; return; }
  el.innerHTML = '<p style="font:500 13px/1.4 sans-serif;color:#6B6B6B;margin:0;padding:12px 0">Cargando el visualizador…</p>';
  return fetch(new URL("../" + archivo, import.meta.url))
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => dibuja(el, C, d))
    .catch(() => { el.textContent = "No se ha podido cargar el visualizador (" + archivo + ")."; });
}

function dibuja(el, C, D) {
  el.innerHTML = "<style>" + ESTILOS + '</style><div class="pq">' +
    '<div class="pq-cab"><span class="pq-tit"></span><span class="pq-etq"></span></div><p class="pq-idea"></p>' +
    '<div class="pq-escena"><div class="pq-col">' +
      '<div class="pq-caja"><div class="pq-barra"><span>Lo que escribes</span><span class="pq-paso"></span></div><ol class="pq-ordenes"></ol></div>' +
      '<div class="pq-narr" aria-live="polite"></div>' +
      '<div class="pq-mandos"><button class="pq-ant" aria-label="Paso anterior">◀</button><button class="pq-sig pri">Paso ▶</button>' +
      '<button class="pq-play">Reproducir</button><button class="pq-reset">Reiniciar</button><button class="pq-proy">Proyectar</button><span class="pq-cuenta"></span></div>' +
    '</div><div class="pq-col">' +
      '<div class="pq-caja"><div class="pq-barra negro"><span>La carpeta del paquete</span><span class="arch pq-raiz"></span></div><div class="pq-arbol"></div></div>' +
      '<div class="pq-caja pq-caja-arch"><div class="pq-barra negro"><span class="pq-rot">Archivo</span><span class="arch pq-nom"></span></div><pre class="pq-archivo"></pre></div>' +
      '<div class="pq-caja"><div class="pq-barra negro"><span>Consola</span></div><pre class="pq-consola"></pre></div>' +
    "</div></div></div>";
  const q = s => el.querySelector(s);
  const P = D.pasos;
  let k = -1, timer = null;   // k = -1: antes de empezar
  q(".pq-tit").textContent = C.titulo || "";
  q(".pq-etq").textContent = C.etiqueta || "";
  q(".pq-idea").textContent = C.idea || "";
  if (!C.idea) q(".pq-idea").style.display = "none";
  q(".pq-ordenes").innerHTML = P.map((p, i) => '<li data-i="' + i + '"><span class="n">' + (i + 1) + "</span><pre>" +
    esc(p.orden).split("\n").map(l => /^#/.test(l) ? '<span class="com">' + l + "</span>" : l).join("\n") + "</pre></li>").join("");

  function pinta() {
    const p = k >= 0 ? P[k] : null;
    el.querySelectorAll(".pq-ordenes li").forEach(li => {
      const i = +li.dataset.i; li.className = i < k ? "hecha" : i === k ? "activa" : "futura";
    });
    q(".pq-paso").textContent = p ? "paso " + (k + 1) : "";
    q(".pq-narr").innerHTML = p ? md(p.nota) : "Cada paso es una orden que escribes en la consola de R. Pulsa «Paso ▶» y mira qué archivos aparecen en la carpeta del paquete.";
    const arbol = p ? p.arbol : [];
    q(".pq-raiz").textContent = p && arbol.length ? p.raiz + "/" : "";
    if (!arbol.length) q(".pq-arbol").innerHTML = '<p class="pq-vacio">Todavía no hay carpeta.</p>';
    else q(".pq-arbol").innerHTML = arbol.map(f => {
      const dir = /\/$/.test(f), partes = f.replace(/\/$/, "").split("/"), prof = partes.length - 1, nombre = partes[prof] + (dir ? "/" : "");
      const nuevo = dir ? !(k > 0 && P[k - 1].arbol.includes(f)) : p.nuevos.includes(f);
      const cambia = p.cambiados.includes(f);
      const visto = p.mostrar === f;
      return '<div class="' + (nuevo ? "nuevo" : cambia ? "cambia" : "") + (visto ? " visto" : "") + '"><span class="nom' + (dir ? " dir" : "") + '">' + "  ".repeat(prof) + esc(nombre) + "</span>" +
        (nuevo ? '<span class="marca">nuevo</span>' : cambia ? '<span class="marca">cambia</span>' : "") + "</div>";
    }).join("");
    const caja = q(".pq-caja-arch");
    if (p && p.contenido != null) {
      caja.style.display = "";
      q(".pq-rot").textContent = p.rotulo || "Archivo";
      q(".pq-nom").textContent = p.rotulo ? "" : p.mostrar;
      // el archivo con sus números de línea; las que señala el guion (las que no prueba nadie), marcadas
      const res = p.resaltar || [];
      q(".pq-archivo").innerHTML = p.contenido === "" ? "(vacío)" : p.rotulo ? esc(p.contenido) :
        p.contenido.split("\n").map((l, i) => '<span class="fa' + (res.includes(i + 1) ? " res" : "") + '"><span class="no">' + (i + 1) + "</span>" + esc(l) + "</span>").join("\n");
    } else caja.style.display = "none";
    q(".pq-consola").textContent = p ? p.consola : "";
    q(".pq-cuenta").textContent = "paso " + (k + 1) + " de " + P.length;
    q(".pq-ant").disabled = k < 0; q(".pq-sig").disabled = k === P.length - 1;
  }
  const para = () => { if (timer) { clearInterval(timer); timer = null; q(".pq-play").textContent = "Reproducir"; } };
  q(".pq-sig").addEventListener("click", () => { para(); if (k < P.length - 1) { k++; pinta(); } });
  q(".pq-ant").addEventListener("click", () => { para(); if (k > -1) { k--; pinta(); } });
  q(".pq-reset").addEventListener("click", () => { para(); k = -1; pinta(); });
  q(".pq-play").addEventListener("click", () => {
    if (timer) return para();
    if (k === P.length - 1) k = -1;
    q(".pq-play").textContent = "Pausa";
    timer = setInterval(() => { if (k >= P.length - 1) return para(); k++; pinta(); }, 2200);
  });
  const raiz = q(".pq"), proy = q(".pq-proy");
  raiz.tabIndex = -1;
  const proyectando = () => ((raiz.getRootNode().fullscreenElement || document.fullscreenElement) === raiz);
  if (!document.fullscreenEnabled || !raiz.requestFullscreen) proy.remove();
  else proy.addEventListener("click", () => { if (proyectando()) document.exitFullscreen(); else raiz.requestFullscreen().then(() => raiz.focus()).catch(() => {}); });
  const alCambiar = () => { proy.textContent = proyectando() ? "Salir de la proyección" : "Proyectar"; };
  document.addEventListener("fullscreenchange", alCambiar);
  raiz.addEventListener("keydown", e => {
    const acc = { ArrowRight: ".pq-sig", PageDown: ".pq-sig", ArrowLeft: ".pq-ant", PageUp: ".pq-ant", Home: ".pq-reset", p: ".pq-play", P: ".pq-play", f: ".pq-proy", F: ".pq-proy" };
    const b = acc[e.key] && q(acc[e.key]);
    if (b && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); b.click(); }
  });
  pinta();
  return () => { para(); document.removeEventListener("fullscreenchange", alCambiar); };
}

export default { render };
