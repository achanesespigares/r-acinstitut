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
.tz.amplio .tz-escena{ grid-template-columns:minmax(0,1fr); }   /* tuberías y gráficos: una sola columna, más ancha */
.tz-caja{ border:2px solid var(--tinta); background:#fff; }
.tz-barra{ background:var(--acento); color:#fff; padding:6px 12px; font:600 10.5px/1.2 var(--titulo); letter-spacing:.12em;
  text-transform:uppercase; display:flex; justify-content:space-between; gap:2px 8px; flex-wrap:wrap; }
.tz-barra > *{ white-space:nowrap; }
.tz-barra.negro{ background:var(--tinta); }
pre.tz-codigo{ margin:0; font:400 14px/1.85 var(--mono); overflow-x:auto; background:var(--fondo); padding:6px 0; border:0; }
.tz .ln{ display:flex; align-items:center; white-space:pre; padding-right:12px; border-left:4px solid transparent; min-width:max-content; }
.tz .ln > span{ flex:none; min-width:auto; }   /* que el coloreado no se encoja si la línea no cabe: el código se desplaza */
.tz .ln .fl{ width:20px; flex:none; text-align:center; font-size:11px; color:transparent; }
.tz .ln .no{ width:2.4ch; flex:none; text-align:right; color:var(--filete); margin-right:12px; }
.tz .ln.hecha{ border-left-color:var(--acento); background:var(--suave); }
.tz .ln.hecha .fl{ color:var(--acento); }
.tz .ln.error{ background:#F3E3E6; }
.tz .ln.espera{ border-left:4px dashed var(--acento); }
.tz .ln.espera .fl{ color:var(--acento); opacity:.45; }
.tz-ambito{ font:600 10px/1 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--banda); }
.tz .marco{ border:2px solid var(--filete); border-left:5px solid var(--filete); padding:8px 10px 10px; display:flex; flex-direction:column; gap:10px; background:#fff; }
.tz .marco.activo{ border-color:var(--acento); background:var(--suave); }
.tz .marco-cab{ display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; font:600 13.5px/1.3 var(--mono); }
.tz .marco-cab .que{ font:600 9.5px/1 var(--titulo); letter-spacing:.08em; text-transform:uppercase; color:var(--banda); }
.tz .marco.activo .marco-cab .que{ color:var(--acento); }
.tz .devuelve{ align-self:flex-start; font:600 13.5px/1 var(--mono); color:#fff; background:var(--acento); border-radius:5px; padding:6px 9px; }
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
.tz .cas .v{ position:relative; white-space:pre; }
.tz .fila-vert{ display:flex; flex-direction:column; border:2px solid var(--tinta); overflow-x:auto; }
.tz .cas-v{ display:flex; gap:10px; align-items:baseline; padding:6px 8px; border-top:1px solid var(--filete); background:#fff; }
.tz .cas-v:first-child{ border-top:0; }
.tz .cas-v .idx{ font:500 11.5px/1 var(--mono); color:var(--banda); flex:none; min-width:2.6em; }
.tz .cas-v .v{ font:600 13.5px/1.35 var(--mono); white-space:pre-wrap; word-break:break-all; }
.tz .cas-v.cambia{ background:var(--suave); }   /* los espacios de un texto se ven, como en R */
.tz .cas .cod{ position:absolute; top:2px; left:3px; font:600 9.5px/1 var(--mono); color:var(--acento); }
.tz .cas.na .v{ color:var(--banda); font-style:italic; }
.tz .niveles{ display:flex; flex-wrap:wrap; align-items:center; gap:4px 6px; font:500 12.5px/1.2 var(--mono); color:var(--sub); margin-top:2px; }
.tz .niveles .que{ font:600 9.5px/1 var(--titulo); letter-spacing:.08em; text-transform:uppercase; color:var(--banda); }
.tz .niveles .nv{ border:1.5px solid var(--acento); border-radius:4px; padding:3px 6px; background:#fff; }
.tz .niveles .nv b{ color:var(--acento); margin-right:4px; }
.tz .niveles .menor{ color:var(--acento); font-weight:700; }
.tz .lista{ display:flex; flex-direction:column; gap:8px; border-left:3px solid var(--tinta); padding:2px 0 2px 10px; }
.tz .elem{ display:flex; flex-direction:column; gap:4px; }
.tz .elem-cab{ display:flex; gap:8px; align-items:baseline; flex-wrap:wrap; font:600 13.5px/1.2 var(--mono); }
.tz .elem-cab .tipo{ font:600 9.5px/1 var(--titulo); letter-spacing:.06em; text-transform:uppercase; color:var(--acento); border:1px solid var(--acento); border-radius:3px; padding:2px 4px; }
.tz .elem-cab .lon{ font:400 12px/1 var(--texto); color:var(--banda); }
.tz .elem.cambia > .elem-cab .nom{ color:var(--acento); }
.tz .elem .lista{ border-left-color:var(--filete); }
.tz .rejilla{ overflow-x:auto; padding-bottom:2px; }
.tz table.mat{ border-collapse:collapse; font:600 15px/1 var(--mono); }
.tz table.mat td{ border:2px solid var(--tinta); min-width:46px; height:36px; padding:0 7px; text-align:center; background:#fff; transition:background .25s; }
.tz table.mat th{ font:500 11.5px/1 var(--mono); color:var(--banda); padding:3px 6px; white-space:nowrap; }
.tz table.mat thead th{ text-align:center; }
.tz table.mat tbody th{ text-align:right; }
.tz table.mat td.cambia{ background:var(--suave); border-color:var(--acento); }
.tz table.mat td.foco{ outline:3px solid var(--acento); outline-offset:-3px; background:var(--suave); }
.tz table.mat th.foco{ color:var(--acento); font-weight:700; }
.tz table.df{ border-collapse:collapse; font:500 13.5px/1.2 var(--mono); }
.tz table.df th, .tz table.df td{ border-bottom:1px solid var(--filete); padding:6px 7px; text-align:left; white-space:nowrap; }
.tz table.df thead th{ border-bottom:2px solid var(--tinta); vertical-align:bottom; font-weight:700; }
.tz table.df thead th .tipo{ display:block; margin-top:3px; font:600 9px/1 var(--titulo); letter-spacing:.06em; text-transform:uppercase; color:var(--acento); }
.tz table.df tbody th{ color:var(--banda); font-weight:500; font-size:12px; text-align:right; }
.tz table.df td.dcha{ text-align:right; }
.tz table.df td.na{ color:var(--banda); font-style:italic; }
.tz table.df .nueva{ background:var(--suave); }
.tz table.df td.cambia{ background:var(--suave); color:var(--acento); font-weight:700; }
.tz table.df tr.foco th, .tz table.df tr.foco td{ background:var(--suave); }
.tz table.df tr.foco th{ color:var(--acento); font-weight:700; box-shadow:inset 4px 0 0 var(--acento); }
.tz .tuberia{ border:2px solid var(--tinta); background:#fff; padding:10px; display:flex; flex-direction:column; gap:8px; }
.tz .tub-cab{ font:600 10px/1 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--banda); }
.tz .tub-etapas{ display:flex; flex-wrap:wrap; align-items:center; gap:4px 6px; font:500 12.5px/1.3 var(--mono); }
.tz .tub-etapas .et{ border:1.5px solid var(--filete); border-radius:5px; padding:4px 7px; background:var(--fondo); color:var(--sub); }
.tz .tub-etapas .et.hecha{ border-color:var(--tinta); color:var(--tinta); background:#fff; }
.tz .tub-etapas .et.ahora{ border-color:var(--acento); background:var(--suave); color:var(--acento); font-weight:700; }
.tz .tub-etapas .flecha-t{ color:var(--banda); font-weight:700; }
.tz .tub-sale{ font:600 10px/1 var(--titulo); letter-spacing:.08em; text-transform:uppercase; color:var(--acento); margin-top:2px; }
.tz .grafico{ border:2px solid var(--tinta); background:#fff; padding:6px; }
.tz .grafico img{ display:block; width:100%; height:auto; }
.tz table.df tr.mas td{ color:var(--banda); font-style:italic; text-align:left; border-bottom:0; }
.tz .capa{ font:600 11.5px/1 var(--mono); color:var(--banda); margin:6px 0 3px; }
.tz .cas.cambia .v{ background:var(--suave); border-color:var(--acento); position:relative; z-index:1; }
.tz .cas.foco .v{ border:3px solid var(--acento); background:var(--suave); position:relative; z-index:2; }
.tz .cas.foco .idx{ color:var(--acento); font-weight:600; }
.tz .grande .cas .v{ min-width:54px; height:52px; font-size:19px; }
.tz .grande{ padding-top:34px; }
.tz .grande.largo .cas .v{ min-width:40px; font-size:14px; padding:0 3px; }
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
.tz-consola{ background:var(--tinta); color:#EDEDED; font:400 14px/1.6 var(--mono); padding:10px 12px; min-height:2.6em; white-space:pre; overflow-x:auto; margin:0; }   /* como la consola de R: las columnas no se parten */
.tz-tabla{ border-collapse:collapse; font:500 14px/1.2 var(--mono); width:100%; }
.tz-tabla th{ font:600 10.5px/1.2 var(--titulo); letter-spacing:.06em; text-align:left; color:var(--banda); padding:6px 10px; border-bottom:1.5px solid var(--tinta); }
.tz-tabla td{ padding:6px 10px; border-bottom:1px solid var(--fila); }
.tz-tabla tr.nueva td{ background:var(--suave); }
.tz-nota{ font-size:12.5px; color:var(--banda); padding:8px 12px 10px; }
.tz-teclas{ display:none; font:500 12.5px/1.3 var(--mono); color:var(--banda); flex-basis:100%; }
.tz:fullscreen{ overflow:auto; padding:24px 4vw; border:0; border-radius:0; margin:0; }
.tz:fullscreen > *{ zoom:1.25; }
.tz:fullscreen .tz-teclas{ display:block; }
.tz:focus{ outline:none; }
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
      <button class="tz-proy" aria-pressed="false" title="Pantalla completa para proyectar en clase (tecla F)">Proyectar</button>
      <span class="tz-cuenta"></span>
      <span class="tz-teclas">→ paso · ← atrás · P reproducir · Inicio reiniciar · Esc salir</span>
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
  if (C.tipo === "laboratorio") return renderLaboratorio(el, C);
  const D = model.get("traza");
  if (!D || !D.pasos) { el.textContent = "Falta la traza: ejecuta herramientas/trazar.R sobre este capítulo."; return; }
  return dibujaTraza(el, C, D);
}

function dibujaTraza(el, C, D) {
  el.innerHTML = '<style>' + ESTILOS + '</style><div class="tz">' + PLANTILLA + "</div>";
  const q = s => el.querySelector(s);
  const P = D.pasos, L = D.codigo.split("\n"), cols = C.columnas || [];
  if (P.some(p => p.tipo === "etapa" || p.tipo === "capa" || p.imagen)) q(".tz").classList.add("amplio");
  const porLinea = C.fila_en === "cada_linea";
  let k = 0, timer = null;

  q(".tz-tit").textContent = C.titulo || "";
  q(".tz-etq").textContent = C.etiqueta || "";
  q(".tz-idea").textContent = C.idea || "";
  if (!C.idea) q(".tz-idea").style.display = "none";
  q(".tz-codigo").innerHTML = L.map((l, i) => '<span class="ln" data-n="' + (i + 1) + '"><span class="fl">▶</span><span class="no">' + (i + 1) + "</span>" + '<span class="tx">' + (colorea(l) || " ") + "</span></span>").join("");
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
    if (p.tipo === "error") return "R se detiene en la línea " + p.linea + " con un error" + (p.marcos && p.marcos.length ? ", dentro de " + code(p.marcos[p.marcos.length - 1].llamada) : "") + ". Lo que viene detrás ya no se ejecuta.";
    if (p.tipo === "vuelta") {
      const [, v, sec] = varDelFor(p.linea);
      return v ? "Vuelta " + p.vuelta + " del <code>for</code>: " + code(v) + " toma el elemento " + p.vuelta + " de " + code(sec) + ", que vale " + esc(muestra(vec(p, v))) + "."
        : "Vuelta " + p.vuelta + " del bucle.";
    }
    if (p.tipo === "fin") {
      const lp = prev && prev.linea ? (L[prev.linea - 1] || "").trim() : "";
      if (/^break\b/.test(lp)) return "El <code>break</code> ha cortado el bucle" + (p.vuelta ? " en la vuelta " + p.vuelta : "") + ": las vueltas que quedaban ya no se dan y el programa sigue después del bucle.";
      if (/^\s*while\b/.test(L[p.linea - 1] || "")) return "La condición del <code>while</code> ya es <code>FALSE</code>: el bucle termina" + (p.vuelta ? " después de " + p.vuelta + (p.vuelta === 1 ? " vuelta" : " vueltas") : "") + " y el programa sigue después de él.";
      return p.vuelta ? "El <code>for</code> ya ha recorrido todos los elementos (" + p.vuelta + (p.vuelta === 1 ? " vuelta" : " vueltas") + "): el programa sigue después del bucle."
        : "El bucle termina: el programa sigue después de él.";
    }
    { const lt = (L[p.linea - 1] || "").trim();
      if (/^break\b/.test(lt)) return "Se ejecuta <code>break</code>: R sale del bucle en este mismo momento, sin terminar la vuelta.";
      if (/^next\b/.test(lt)) return "Se ejecuta <code>next</code>: R deja esta vuelta a medias y salta a la siguiente."; }
    if (p.tipo === "etapa") {
      if (p.etapa === 0) return "Empieza una tubería de " + p.total + (p.total === 1 ? " etapa" : " etapas") + ". Entra " + code(p.texto) + ": " + resumen(p.valor) + ".";
      return "Etapa " + p.etapa + " de " + p.total + ": " + code(p.texto) + " recibe lo que sale de la etapa anterior y devuelve " + resumen(p.valor) + "." +
        (p.etapa === p.total ? " Es el resultado de la tubería." : "");
    }
    if (p.tipo === "capa") {
      if (p.etapa === 0) return code(p.texto) + " prepara el lienzo: los datos y qué columna va a cada eje. Todavía no hay nada dibujado; cada capa que se suma con " + code("+") + " añade algo.";
      return "Capa " + p.etapa + " de " + p.total + ": se suma " + code(p.texto) + "." + (p.etapa === p.total ? " El gráfico está completo." : "");
    }
    if (p.tipo === "llamada") {
      const m = p.marcos[p.marcos.length - 1], args = Object.keys(m.vars);
      return "Se llama a " + code(m.llamada) + ". R le da a la función un espacio propio en la memoria" +
        (args.length ? ", con sus argumentos: " + args.map(a => code(a) + " vale " + esc(muestra(m.vars[a]))).join(", ") : "") +
        ". El programa salta a la función" + (m.desde ? " y la línea " + m.desde + " se queda esperando el resultado." : ".");
    }
    if (p.tipo === "devuelve")
      return code(p.funcion) + " termina y devuelve " + code(p.valor) + ". Su espacio en la memoria desaparece, con todas sus variables, y el programa vuelve a la línea " + p.desde + ", que usa ese resultado.";
    if (p.tipo === "condicion") {
      const si = p.cond.valor === "TRUE", esWhile = /^\s*while\b/.test(L[p.linea - 1]);
      return "Se comprueba " + code(p.cond.texto) + (p.cond.valores !== p.cond.texto ? ": con los valores de ahora, " + code(p.cond.valores) : "") + ", que es " + code(p.cond.valor) + ". " +
        (esWhile ? (si ? "El <code>while</code> da otra vuelta." : "El <code>while</code> se detiene.") : (si ? "Se entra en el bloque del <code>if</code>." : "Se salta el bloque del <code>if</code>" + (/else/.test(L.slice(p.linea - 1).join(" ")) ? " y se va al <code>else</code>." : ".")));
    }
    const frases = [];
    // se comparan las variables del ámbito que se está ejecutando: la llamada en curso o el programa principal
    const marco = x => x.marcos && x.marcos.length ? x.marcos[x.marcos.length - 1] : null;
    const mp = marco(p), ma = marco(prev);
    const ahora = mp ? mp.vars : p.estado, antes = mp ? (ma && ma.id === mp.id ? ma.vars : {}) : prev.estado;
    for (const n of Object.keys(ahora)) {
      const a = antes[n], b = ahora[n];
      if (b.cols) {
        const tip = c => c.nombre + " (" + tipoCol(c) + ")";
        const y = arr => arr.join(", ").replace(/, ([^,]*)$/, " y $1");
        const forma = b.nf + (b.nf === 1 ? " fila" : " filas") + " y " + b.cols.length + (b.cols.length === 1 ? " columna" : " columnas");
        if (!a || !a.cols) { frases.push("Se crea " + code(n) + ", " + (b.tibble ? "un tibble (un data frame a la manera del tidyverse)" : "un data frame") + " de " + forma + (b.cols.length <= 5 ? ": " + y(b.cols.map(tip)) : "") + ". Cada columna es un vector con su propio tipo."); continue; }
        const nA = new Set(a.cols.map(c => c.nombre)), nB = new Set(b.cols.map(c => c.nombre));
        const nuevas = b.cols.filter(c => !nA.has(c.nombre)), idas = a.cols.filter(c => !nB.has(c.nombre));
        if (nuevas.length) frases.push(code(n) + " gana " + (nuevas.length === 1 ? "la columna " : "las columnas ") + y(nuevas.map(c => code(c.nombre) + " (" + tipoCol(c) + ")")) + ".");
        if (idas.length) frases.push(code(n) + " pierde " + (idas.length === 1 ? "la columna " : "las columnas ") + y(idas.map(c => code(c.nombre))) + ".");
        if (b.nf !== a.nf) frases.push(code(n) + " pasa de " + a.nf + " a " + b.nf + (b.nf === 1 ? " fila." : " filas."));
        else if (b.filas && a.filas && b.filas.join() !== a.filas.join() && [...b.filas].sort().join() === [...a.filas].sort().join()) frases.push("Las filas de " + code(n) + " cambian de orden.");
        else if (!nuevas.length && !idas.length) {
          for (const c of b.cols) {
            const ca = a.cols.find(x => x.nombre === c.nombre); if (!ca || igual(ca, c)) continue;
            const k = c.v.v.findIndex((x, i) => x !== ca.v.v[i]);
            frases.push("Cambia " + code(n + "$" + c.nombre + "[" + (k + 1) + "]") + ": valía " + esc(ca.v.v[k]) + " y ahora vale " + esc(c.v.v[k]) + "."); break;
          }
        }
        continue;
      }
      if (b.d) {
        const desc = (b.t === "matrix" ? "una matriz de " + b.d[0] + (b.d[0] === 1 ? " fila" : " filas") + " y " + b.d[1] + (b.d[1] === 1 ? " columna" : " columnas")
          : "un array de " + b.d.join(" × ")) + " (" + (TIPOS[b.tipo] || b.tipo) + ")";
        if (!a || !a.d) { frases.push("Se crea " + code(n) + ", " + desc + "."); continue; }
        if (a.d.join() !== b.d.join()) { frases.push(code(n) + " cambia de forma: ahora es " + desc + "."); continue; }
        const camb = b.v.map((x, i) => x !== a.v[i] ? i : -1).filter(i => i >= 0);
        const pos = x => b.d.length === 2 ? "[" + (x % b.d[0] + 1) + ", " + (Math.floor(x / b.d[0]) + 1) + "]"
          : "[" + (x % b.d[0] + 1) + ", " + (Math.floor(x / b.d[0]) % b.d[1] + 1) + ", " + (Math.floor(x / (b.d[0] * b.d[1])) + 1) + "]";
        if (camb.length === 1) frases.push("Cambia " + code(n + pos(camb[0])) + ": valía " + esc(a.v[camb[0]]) + " y ahora vale " + esc(b.v[camb[0]]) + ".");
        else if (camb.length) frases.push("Cambian " + camb.length + " casillas de " + code(n) + ".");
        continue;
      }
      if (!a && b.el) {
        const noms = b.el.map((e, i) => e.nombre ? "$" + e.nombre : "[[" + (i + 1) + "]]");
        const lista = noms.length <= 4 ? noms.map(code).join(", ").replace(/, ([^,]*)$/, " y $1") : "";
        frases.push("Se crea " + code(n) + ", una lista " + (b.el.length === 1 ? "con un solo elemento" + (lista ? ", " + lista : "") + "."
          : "de " + b.el.length + " elementos" + (lista ? ": " + lista : "") + ". Cada uno puede ser de un tipo distinto."));
        continue;
      }
      if (a && a.el && b.el && !igual(a, b)) {
        const nom = (e, i) => e.nombre ? "$" + e.nombre : "[[" + (i + 1) + "]]";
        const ya = new Set(a.el.map(nom)), ahora2 = new Set(b.el.map(nom));
        const nuevos = b.el.map(nom).filter(x => !ya.has(x)), idos = a.el.map(nom).filter(x => !ahora2.has(x));
        if (nuevos.length) frases.push(code(n) + " gana " + nuevos.map(x => code(x)).join(" y ") + ": ahora tiene " + b.el.length + (b.el.length === 1 ? " elemento." : " elementos."));
        if (idos.length) frases.push(code(n) + " pierde " + idos.map(x => code(x)).join(" y ") + ": ahora tiene " + b.el.length + (b.el.length === 1 ? " elemento." : " elementos."));
        if (!nuevos.length && !idos.length) {
          const k = b.el.findIndex((e, i) => !igual(e, a.el[i])), ev = b.el[k].v, av = a.el[k].v;
          const ruta = n + nom(b.el[k], k);
          const camb = ev.v && av.v && ev.v.length === av.v.length ? ev.v.map((x, i) => x !== av.v[i] ? i : -1).filter(i => i >= 0) : [];
          frases.push(camb.length === 1 ? "Cambia " + code(ruta + (ev.v.length > 1 ? "[" + (camb[0] + 1) + "]" : "")) + ": valía " + esc(av.v[camb[0]]) + " y ahora vale " + esc(ev.v[camb[0]]) + "."
            : "Cambia " + code(ruta) + ".");
        }
        continue;
      }
      if (!a && b.t === "Date" && b.k) {
        frases.push(b.v.length === 1 ? "Se crea " + code(n) + ", una fecha (" + code("Date") + "). Por dentro es un número, " + esc(b.k[0]) + ": los días que han pasado desde el 1 de enero de 1970."
          : "Se crea " + code(n) + ", un vector de " + b.v.length + " fechas (" + code("Date") + "). Por dentro, cada fecha es un número: los días que han pasado desde el 1 de enero de 1970 (el número pequeño de cada casilla).");
        continue;
      }
      if (!a && b.u) { frases.push("Se crea " + code(n) + ", una diferencia de tiempos (" + code("difftime") + ") medida " + ({ days: "en días", weeks: "en semanas", hours: "en horas", mins: "en minutos", secs: "en segundos" }[b.u] || "en " + b.u) + "."); continue; }
      if (!a && b.niveles) { frases.push("Se crea " + code(n) + ", un factor de " + (b.v.length === 1 ? "un elemento" : b.v.length + " elementos") + " con " + b.niveles.length + " niveles" + (b.ord ? " ordenados" : "") + ". Por dentro guarda un número en cada casilla, el de su nivel (el número pequeño de cada casilla)."); continue; }
      if (!a) { frases.push("Se crea " + code(n) + (b.v ? ", un vector " + code(b.t) + " de " + (b.v.length === 1 ? "un elemento" : b.v.length + " elementos") : ", de tipo " + code(b.t)) + "."); continue; }
      if (igual(a, b)) continue;
      if (a.v && b.v && a.v.length === b.v.length) {
        const camb = b.v.map((x, i) => x !== a.v[i] ? i : -1).filter(i => i >= 0);
        const pos = i => b.n ? '"' + b.n[i] + '"' : String(i + 1);
        if (!camb.length && b.n && !igual(a.n, b.n)) { frases.push(code(n) + " recibe nombres: " + b.n.map(x => code(x)).join(", ").replace(/, ([^,]*)$/, " y $1") + ". Los valores no cambian; ahora cada casilla se puede pedir por su nombre."); continue; }
        if (camb.length === 1 && b.v.length > 1) frases.push("Cambia " + code(n + "[" + pos(camb[0]) + "]") + ": valía " + esc(a.v[camb[0]]) + " y ahora vale " + esc(b.v[camb[0]]) + ".");
        else if (b.v.length === 1) frases.push(code(n) + " valía " + esc(a.v[0]) + " y ahora vale " + esc(b.v[0]) + ".");
        else frases.push("Cambian " + camb.length + " elementos de " + code(n) + ".");
      } else frases.push(code(n) + " cambia" + (b.v ? ": ahora tiene " + b.v.length + " elementos." : "."));
    }
    if (p.salida.length > prev.salida.length) {
      const nueva = p.salida.slice(prev.salida.length).trim().split("\n");
      const linea = (L[p.linea - 1] || "").trim();
      const muestra1 = nueva.length === 1 ? code(nueva[0]) : "varias líneas";
      if (/^[\w.]+$/.test(linea) && ahora[linea]) frases.push("Escribir solo " + code(linea) + " hace que R muestre su valor en la consola: " + muestra1 + "." +
        (/^\[1\]/.test(nueva[0]) && prev.salida === "" ? " El <code>[1]</code> del principio indica que la fila empieza en el elemento 1." : ""));
      else frases.push("R escribe en la consola " + muestra1 + ".");
    }
    { const m = (L[p.linea - 1] || "").trim().match(/^(?:library|require)\(\s*["']?([\w.]+)/);
      if (m && !frases.length) frases.push("Se carga el paquete " + code(m[1]) + ": desde ahora, sus funciones se pueden usar en el programa."); }
    if (p.imagen && prev && prev.tipo !== "capa") frases.push("R dibuja el gráfico.");
    if (p.avisos) frases.push("Y R da un <b>aviso</b>: el cálculo se hace, pero algo no encaja.");
    if (!frases.length && prev && (prev.tipo === "etapa" || prev.tipo === "capa")) return prev.tipo === "capa" ? "El gráfico terminado." : "La tubería ha terminado.";
    return frases.length ? frases.join(" ") : "Se ejecuta la línea " + p.linea + ".";
  }

  function casillas(v, previo, opciones = {}) {
    const cambia = i => previo && previo.v && previo.v.length === v.v.length && previo.v[i] !== v.v[i];
    // textos largos (por ejemplo, líneas de un archivo): una casilla por fila, para que se lean enteros
    if (!opciones.grande && v.v.some(x => String(x).length > 24))
      return '<div class="fila-vert">' + v.v.map((x, i) => '<div class="cas-v' + (cambia(i) ? " cambia" : "") + '"><span class="idx">' + esc(v.n ? v.n[i] : "[" + (i + 1) + "]") + '</span><span class="v">' + esc(x) + "</span></div>").join("") + "</div>";
    return '<div class="fila-cas' + (opciones.grande ? " grande" + (v.v.some(x => String(x).length > 4) ? " largo" : "") : "") + '">' + v.v.map((x, i) =>
      '<span class="cas' + (cambia(i) ? " cambia" : "") + (opciones.foco === i + 1 ? " foco" : "") + (v.k && x === "NA" ? " na" : "") + '"><span class="v">' +
      (v.k && v.k[i] !== "NA" ? '<span class="cod">' + esc(v.k[i]) + "</span>" : "") + esc(x) + '</span><span class="idx">' + esc(v.n ? v.n[i] : "[" + (i + 1) + "]") + "</span></span>").join("") +
      (opciones.foco ? '<span class="puntero"><span class="et">' + esc(opciones.puntero) + " = " + opciones.foco + '</span><span class="flecha"></span></span>' : "") + "</div>";
  }

  const condicion = p => '<div class="tz-cond"><span>' + esc(p.cond.texto) + '</span><span style="color:var(--banda)">' + esc(p.cond.valores) + '</span><span class="res ' + (p.cond.valor === "TRUE" ? "si" : "no") + '">' + p.cond.valor + "</span></div>";

  // Cabecera de un valor: su tipo y su tamaño
  const TIPOS = { double: "numeric", integer: "integer", character: "character", logical: "logical", complex: "complex" };
  function cabecera(v) {
    if (v.cols) return '<span class="tipo">' + (v.tibble ? "tibble" : "data.frame") + '</span><span class="lon">' + v.nf + (v.nf === 1 ? " fila" : " filas") + " × " + v.cols.length + (v.cols.length === 1 ? " columna" : " columnas") + "</span>";
    if (v.d) return '<span class="tipo">' + esc(v.t) + '</span><span class="lon">' + v.d.join(" × ") +
      (v.d.length === 2 ? " (filas × columnas)" : " (filas × columnas × capas)") + " · " + esc(TIPOS[v.tipo] || v.tipo) + "</span>";
    const UNID = { days: "en días", weeks: "en semanas", hours: "en horas", mins: "en minutos", secs: "en segundos" };
    const lon = v.el ? v.el.length + (v.el.length === 1 ? " elemento" : " elementos")
      : v.v ? "longitud " + v.v.length + (v.u ? " · " + (UNID[v.u] || v.u) : "") + (v.niveles ? " · " + v.niveles.length + (v.niveles.length === 1 ? " nivel" : " niveles") + (v.ord ? ", ordenados" : "") : "") : "";
    return '<span class="tipo">' + esc(v.t) + "</span>" + (lon ? '<span class="lon">' + lon + "</span>" : "");
  }

  // El dibujo de un valor: casillas para un vector, casillas y niveles para un factor,
  // y para una lista, una caja por elemento con su nombre ($nombre) o su posición ([[i]])
  function valor(v, a, op = {}) {
    if (v.cols) return tablaDF(v, a, op.fila);
    if (v.d) return rejilla(v, a, op.celda);
    if (v.el) {
      const ant = a && a.el ? a.el : null;
      return '<div class="lista">' + v.el.map((e, i) => {
        const ea = ant && ant[i] && ant[i].nombre === e.nombre ? ant[i].v : null;
        const cambio = a && (!ea || !igual(ea, e.v));
        return '<div class="elem' + (cambio ? " cambia" : "") + '"><div class="elem-cab"><span class="nom">' + (e.nombre ? "$" + esc(e.nombre) : "[[" + (i + 1) + "]]") + "</span>" + cabecera(e.v) + "</div>" +
          valor(e.v, ea) + "</div>";
      }).join("") + (v.el.length ? "" : '<p class="tz-vacio">Lista vacía.</p>') + "</div>";
    }
    if (v.v) {
      if (!v.v.length) return '<div class="otro">' + (v.t === "NULL" ? "NULL" : esc(v.t) + "(0), vacío") + "</div>";
      let html = casillas(v, a, op);
      if (v.niveles) html += '<div class="niveles"><span class="que">niveles</span>' +
        v.niveles.map((l, j) => '<span class="nv"><b>' + (j + 1) + "</b>" + esc(l) + "</span>").join(v.ord ? '<span class="menor">&lt;</span>' : "") + "</div>";
      return html;
    }
    return '<div class="otro">' + esc(v.r || v.t) + "</div>";
  }

  // Una matriz: rejilla con los nombres (o los índices) de filas y columnas. R guarda los valores por
  // columnas, así que la casilla [i, j] de la capa k es v[i + j·filas + k·filas·columnas].
  function rejilla(v, a, celda) {
    const [nf, nc, nk = 1] = v.d, dn = v.dn || [];
    const nomF = i => dn[0] && dn[0].length ? dn[0][i] : "[" + (i + 1) + ",]";
    const nomC = j => dn[1] && dn[1].length ? dn[1][j] : "[," + (j + 1) + "]";
    const mismo = a && a.d && a.d.join() === v.d.join();
    let html = "";
    for (let k = 0; k < nk; k++) {
      if (v.d.length === 3) html += '<div class="capa">' + (dn[2] && dn[2].length ? esc(dn[2][k]) : ", , " + (k + 1)) + "</div>";
      html += '<div class="rejilla"><table class="mat"><thead><tr><th></th>' +
        Array.from({ length: nc }, (_, j) => '<th class="' + (celda && v.d.length === 2 && celda[1] === j + 1 ? "foco" : "") + '">' + esc(nomC(j)) + "</th>").join("") + "</tr></thead><tbody>";
      for (let i = 0; i < nf; i++) {
        html += '<tr><th class="' + (celda && v.d.length === 2 && celda[0] === i + 1 ? "foco" : "") + '">' + esc(nomF(i)) + "</th>";
        for (let j = 0; j < nc; j++) {
          const x = i + j * nf + k * nf * nc;
          const cl = (mismo && a.v[x] !== v.v[x] ? " cambia" : "") + (celda && v.d.length === 2 && celda[0] === i + 1 && celda[1] === j + 1 ? " foco" : "");
          html += '<td class="' + cl.trim() + '">' + esc(v.v[x]) + "</td>";
        }
        html += "</tr>";
      }
      html += "</tbody></table></div>";
    }
    return html;
  }

  // Un data frame: una tabla con el nombre y el tipo de cada columna, y el nombre de cada fila.
  // Los textos van sin comillas, como los enseña R.
  const tipoCol = c => c.v.niveles ? "factor" : (c.v.t || "");
  function tablaDF(v, a, filaFoco) {
    const sinComillas = x => /^".*"$/.test(x) ? x.slice(1, -1) : x;
    const antes = a && a.cols ? Object.fromEntries(a.cols.map(c => [c.nombre, c])) : null;
    const filasA = a && a.filas ? a.filas : [];
    let html = '<div class="rejilla"><table class="df"><thead><tr><th></th>' + v.cols.map(c =>
      '<th class="' + (antes && !antes[c.nombre] ? "nueva" : "") + '">' + esc(c.nombre) + '<span class="tipo">' + esc(tipoCol(c)) + "</span></th>").join("") + "</tr></thead><tbody>";
    const mostradas = v.filas ? v.filas.length : v.nf;
    for (let i = 0; i < mostradas; i++) {
      const nom = v.filas ? v.filas[i] : String(i + 1), iA = filasA.indexOf(nom);
      html += '<tr class="' + (filaFoco === i + 1 ? "foco" : "") + '"><th>' + esc(nom) + "</th>" + v.cols.map(c => {
        const x = (c.v.v || [])[i] ?? "", ca = antes && antes[c.nombre];
        const prev = ca && iA >= 0 ? (ca.v.v || [])[iA] : undefined;
        const cl = [c.v.t === "numeric" || c.v.t === "integer" ? "dcha" : "", x === "NA" ? "na" : "", antes && !ca ? "nueva" : "", prev !== undefined && prev !== x ? "cambia" : ""].filter(Boolean).join(" ");
        return '<td class="' + cl + '">' + esc(sinComillas(x)) + "</td>";
      }).join("") + "</tr>";
    }
    if (v.nf > mostradas) html += '<tr class="mas"><th></th><td colspan="' + v.cols.length + '">… y ' + (v.nf - mostradas).toLocaleString("es-ES") + " filas más</td></tr>";
    return html + "</tbody></table></div>";
  }

  // Las imágenes de los gráficos: en el laboratorio vienen dentro de la traza (data:); en el libro son
  // archivos de datos/graficos/, en la raíz del sitio (la misma carpeta de la que sale trazar.R).
  const img = src => !src ? "" : /^data:/.test(src) ? src : new URL("../" + src, import.meta.url).href;

  // Lo que es un valor, en pocas palabras (para la narración de las tuberías)
  function resumen(v) {
    if (!v) return "algo";
    if (v.cols) return "una tabla de " + v.nf.toLocaleString("es-ES") + (v.nf === 1 ? " fila" : " filas") + " y " + v.cols.length + (v.cols.length === 1 ? " columna" : " columnas");
    if (v.t === "ggplot") return "un gráfico";
    if (v.d) return "una matriz de " + v.d.join(" × ");
    if (v.el) return "una lista de " + v.el.length + (v.el.length === 1 ? " elemento" : " elementos");
    if (v.v) return v.v.length === 1 ? "el valor " + code(v.v[0]) : "un vector " + code(v.t) + " de " + v.v.length + " elementos";
    return "un valor de tipo " + code(v.t);
  }

  // Una tubería o un gráfico por capas: la cadena de etapas, con la actual resaltada
  function cadena(p, prev) {
    const sep = p.tipo === "capa" ? "+" : "|>";
    // las etapas de esta sentencia: se reconstruyen con los pasos de la misma línea que la rodean
    const ini = P.indexOf(p) - p.etapa, textos = [];
    for (let j = 0; j <= p.total; j++) { const q = P[ini + j]; textos.push(q && q.tipo === p.tipo ? q.texto : "…"); }
    let html = '<div class="tuberia"><span class="tub-cab">' + (p.tipo === "capa" ? "Gráfico por capas · capa " : "Tubería · etapa ") + p.etapa + " de " + p.total + '</span><div class="tub-etapas">' +
      textos.map((t, j) => '<span class="et' + (j < p.etapa ? " hecha" : j === p.etapa ? " ahora" : "") + '">' + esc(t) + "</span>").join('<span class="flecha-t">' + sep + "</span>") + "</div>";
    if (p.tipo === "capa") html += '<div class="grafico"><img alt="El gráfico después de esta capa" src="' + img(p.imagen) + '"></div>';
    else html += '<span class="tub-sale">Lo que sale de esta etapa</span>' + valor(p.valor, null);
    return html + "</div>";
  }

  // Las variables de un ámbito (el programa principal o una llamada)
  function variables(est, ant, conFoco) {
    let html = "";
    const nombres = Object.keys(est);
    const orden = conFoco && C.foco && nombres.includes(C.foco) ? [C.foco].concat(nombres.filter(n => n !== C.foco)) : nombres;
    for (const n of orden) {
      const v = est[n], a = ant && ant[n];
      const cambio = !a || !igual(a, v);
      const pp = C.puntero;
      const foco = conFoco && n === C.foco && v.v && !v.d && pp && !Array.isArray(pp) && est[pp] && est[pp].v ? Number(est[pp].v[0]) : null;
      const fila = conFoco && n === C.foco && v.cols && pp && !Array.isArray(pp) && est[pp] && est[pp].v ? Number(est[pp].v[0]) : null;
      const celda = conFoco && n === C.foco && v.d && Array.isArray(pp) && pp.every(x => est[x] && est[x].v) ? pp.map(x => Number(est[x].v[0])) : null;
      html += '<div class="vec' + (cambio && ant ? " cambia" : "") + '"><div class="vec-cab"><span class="nom">' + esc(n) + "</span>" + cabecera(v) + "</div>" +
        valor(v, a, { grande: conFoco && n === C.foco && !v.d, foco: foco >= 1 && foco <= (v.v || []).length ? foco : null, puntero: C.puntero, celda, fila }) + "</div>";
    }
    return html;
  }


  function memoria(p, prev) {
    const M = p.marcos || [];
    let html = p.tipo === "condicion" ? condicion(p) : "";
    if (p.tipo === "etapa" || p.tipo === "capa") html += cadena(p, prev);
    else if (p.imagen) html += '<div class="grafico"><img alt="El gráfico que dibuja esta línea" src="' + img(p.imagen) + '"></div>';
    const hayGlobal = Object.keys(p.estado).length;
    if (!M.length && !hayGlobal) html += '<p class="tz-vacio">Todavía no hay ninguna variable.</p>';
    if (M.length) html += '<span class="tz-ambito">Programa principal</span>' + (hayGlobal ? "" : '<p class="tz-vacio">Sin variables.</p>');
    html += variables(p.estado, prev && prev.estado, true);
    // una caja por cada llamada en curso; la última es la que se está ejecutando
    const antes = prev && prev.marcos ? Object.fromEntries(prev.marcos.map(m => [m.id, m.vars])) : {};
    M.forEach((m, i) => {
      const activo = i === M.length - 1;
      html += '<div class="marco' + (activo ? " activo" : "") + '"><div class="marco-cab"><span>' + esc(m.llamada) + '</span><span class="que">' +
        (activo ? "llamada en curso" : "esperando a " + esc(M[i + 1].nombre)) + "</span></div>" +
        (Object.keys(m.vars).length ? variables(m.vars, antes[m.id], false) : '<p class="tz-vacio">Sin variables.</p>') +
        (activo && p.tipo === "devuelve" ? '<span class="devuelve">devuelve ' + esc(p.valor) + "</span>" : "") + "</div>";
    });
    if (p.avisos) html += '<div class="tz-aviso"><b>Aviso de R</b><br>' + p.avisos.map(esc).join("<br>") + "</div>";
    if (p.tipo === "error") html += '<div class="tz-error"><b>Error de R</b><br>' + esc(p.error) + "</div>";
    return html;
  }


  function coloca() {                          // el puntero, sobre su casilla
    const f = el.querySelector(".grande"); if (!f) return;
    const c = f.querySelector(".cas.foco"), pt = f.querySelector(".puntero");
    if (c && pt) pt.style.left = (c.offsetLeft + c.offsetWidth / 2) + "px";
    if (c && f.scrollWidth > f.clientWidth) {   // si la fila no cabe, se desplaza para que se vea la casilla del puntero
      const izq = c.offsetLeft, der = izq + c.offsetWidth;
      if (izq < f.scrollLeft) f.scrollLeft = izq - 8;
      else if (der > f.scrollLeft + f.clientWidth) f.scrollLeft = der - f.clientWidth + 8;
    }
  }

  function pinta() {
    const p = P[k], prev = P[Math.max(0, k - 1)];
    el.querySelectorAll(".ln").forEach(n => n.classList.remove("hecha", "error", "espera"));
    (p.marcos || []).forEach(m => { const ln = m.desde && el.querySelector('.ln[data-n="' + m.desde + '"]'); if (ln && m.desde !== p.linea) ln.classList.add("espera"); });
    let lineaVis = p.linea;
    if ((p.tipo === "etapa" || p.tipo === "capa") && p.etapa > 0 && p.texto) {
      // en una tubería escrita en varias líneas, se marca la línea donde está la etapa que se ejecuta
      const trozo = p.texto.slice(0, 14);
      for (let j = p.linea - 1; j < L.length && j < p.linea + 30; j++) if (L[j].includes(trozo)) { lineaVis = j + 1; break; }
    }
    if (lineaVis) { const ln = el.querySelector('.ln[data-n="' + lineaVis + '"]'); ln.classList.add("hecha"); if (p.tipo === "error") ln.classList.add("error"); }
    q(".tz-lin").textContent = lineaVis ? "línea " + lineaVis : "";
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
  // Proyectar: a pantalla completa con letra grande; teclado o mando de presentaciones (Av Pág / Re Pág)
  const raiz = q(".tz"), proy = q(".tz-proy");
  raiz.tabIndex = -1;
  const proyectando = () => ((raiz.getRootNode().fullscreenElement || document.fullscreenElement) === raiz);
  if (!document.fullscreenEnabled || !raiz.requestFullscreen) proy.remove();
  else proy.addEventListener("click", () => { if (proyectando()) document.exitFullscreen(); else raiz.requestFullscreen().then(() => raiz.focus()).catch(() => {}); });
  const alCambiarPantalla = () => {
    const on = proyectando();
    proy.setAttribute("aria-pressed", on ? "true" : "false");
    proy.textContent = on ? "Salir de la proyección" : "Proyectar";
    requestAnimationFrame(coloca);
  };
  document.addEventListener("fullscreenchange", alCambiarPantalla);
  raiz.addEventListener("keydown", e => {
    if (e.target.matches && e.target.matches("input, textarea, select")) return;
    const acciones = { ArrowRight: ".tz-sig", PageDown: ".tz-sig", ArrowLeft: ".tz-ant", PageUp: ".tz-ant", Home: ".tz-reset", p: ".tz-play", P: ".tz-play", f: ".tz-proy", F: ".tz-proy" };
    const b = acciones[e.key] && q(acciones[e.key]);
    if (b && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); b.click(); }
  });
  pinta();
  return () => { para(); document.removeEventListener("fullscreenchange", alCambiarPantalla); };
}



// ── El laboratorio: el lector escribe R y lo ve ejecutarse, con R funcionando en el navegador (webR) ──
const WEBR = "https://webr.r-wasm.org/v0.6.0/webr.mjs";
const CLAVE_LAB = "acinstitut-laboratorio-r";
const EJEMPLOS = [
  { nombre: "Vectorizar", codigo: 'notas <- c(4.2, 7, 3.5, 8)\nsubidas <- notas + 0.5\naprobado <- subidas >= 5\nsum(aprobado)' },
  { nombre: "El reciclado", codigo: 'x <- c(10, 20, 30, 40, 50)\ny <- c(1, 2)\nz <- numeric(length(x))\nfor (i in seq_along(x)) {\n  j <- (i - 1) %% length(y) + 1\n  z[i] <- x[i] + y[j]\n}\nz' },
  { nombre: "Sumar con un for", codigo: 'notas <- c(7, 4, 9, 6)\ntotal <- 0\nfor (k in seq_along(notas)) {\n  total <- total + notas[k]\n}\ntotal / length(notas)' },
  { nombre: "Un while que cuenta", codigo: 'n <- 1\npasos <- 0\nwhile (n < 100) {\n  n <- n * 3\n  pasos <- pasos + 1\n}\npasos' },
  { nombre: "Una función", codigo: 'iva <- function(precio, tipo = 0.21) {\n  impuesto <- precio * tipo\n  precio + impuesto\n}\np <- iva(100)\nq <- iva(50, tipo = 0.10)\np + q' },
  { nombre: "Recursión", codigo: 'factorial <- function(n) {\n  if (n <= 1) {\n    return(1)\n  }\n  n * factorial(n - 1)\n}\nfactorial(4)' },
  { nombre: "Una lista", codigo: 'alumno <- list(nombre = "Marta", notas = c(7, 8.5, 6))\nalumno$notas[2] <- 9\nalumno$grupo <- "1ºB"\nmedia <- mean(alumno$notas)\nstr(alumno)' },
  { nombre: "Una tabla", codigo: 'clase <- data.frame(\n  nombre = c("Marta", "Pau", "Sara"),\n  nota = c(7.2, 4.1, 9.5)\n)\nclase$aprobado <- clase$nota >= 5\nmejores <- clase[order(clase$nota, decreasing = TRUE), ]\nmean(clase$nota)' },
  { nombre: "Limpiar textos", codigo: 'nombres <- c("marta", "MARTA ", " Pau")\nx <- trimws(nombres)\nlimpios <- paste0(toupper(substr(x, 1, 1)), tolower(substr(x, 2, nchar(x))))\nunique(limpios)' },
  { nombre: "Fechas", codigo: 'entregas <- as.Date(c("2024-10-15", "2024-11-04", "2024-12-20"))\nhoy <- as.Date("2024-11-01")\nfaltan <- as.integer(entregas - hoy)\nentregas[faltan >= 0]' },
  { nombre: "Leer datos", codigo: 'pinguinos <- read.csv("datos/pinguinos.csv")\ndim(pinguinos)\nsummary(pinguinos$masa_corporal_g)' },
  { nombre: "Una tubería", codigo: 'library(dplyr)\npinguinos <- read.csv("datos/pinguinos.csv")\npinguinos |>\n  filter(!is.na(masa_corporal_g)) |>\n  group_by(especie) |>\n  summarise(media = mean(masa_corporal_g))' },
  { nombre: "Un gráfico por capas", codigo: 'library(ggplot2)\npinguinos <- read.csv("datos/pinguinos.csv")\nggplot(pinguinos, aes(largo_aleta_mm, masa_corporal_g, colour = especie)) +\n  geom_point() +\n  labs(x = "Aleta (mm)", y = "Masa (g)")' },
  { nombre: "Tipos y conversión", codigo: 'edad <- 17L\naltura <- 1.74\nnombre <- "Lucía"\nmayor <- edad >= 18\nas.numeric("hola")' },
];
const ESTILOS_LAB = `
.lab{ --acento:#7A1F36; --suave:#F6F0EE; --tinta:#111; --banda:#6B6B6B; --fila:#D4D4D4; --fondo:#F4F4F4;
  font:400 15px/1.55 "Arimo","Liberation Sans",Arial,sans-serif; color:var(--tinta); background:#fff; border:1px solid var(--fila);
  border-radius:10px; padding:16px; display:flex; flex-direction:column; gap:12px; margin:1.25rem 0; }
.lab *{ box-sizing:border-box; }
.lab-fila{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.lab-tit{ font:700 18px/1.2 "Montserrat",Arial,sans-serif; margin-right:auto; }
.lab select,.lab button{ font:600 14px/1 "Montserrat",Arial,sans-serif; min-height:40px; padding:0 12px; border:2px solid var(--tinta); background:#fff; border-radius:6px; color:var(--tinta); }
.lab button.pri{ background:var(--acento); border-color:var(--acento); color:#fff; cursor:pointer; }
.lab button:disabled{ opacity:.5; cursor:default; }
.lab-ed{ display:flex; border:2px solid var(--tinta); background:var(--fondo); }
.lab-num{ font:400 14px/1.7 "IBM Plex Mono",monospace; color:#9A9A9A; text-align:right; padding:10px 8px; user-select:none; white-space:pre; overflow:hidden; }
.lab textarea{ flex:1; min-width:0; font:400 14px/1.7 "IBM Plex Mono",monospace; border:0; background:transparent; padding:10px 10px 10px 4px; resize:vertical; min-height:200px; outline:none; white-space:pre; overflow:auto; tab-size:2; }
.lab-estado{ font-size:14px; color:var(--banda); min-height:1.4em; }
.lab-error{ border:2px solid var(--acento); background:var(--suave); border-radius:8px; padding:10px 12px; }
.lab-error code{ font:500 13px/1.4 "IBM Plex Mono",monospace; white-space:pre-wrap; display:block; margin-top:6px; color:#5A1628; }
`;

let webRPromesa = null, trazarTexto = null;
// Paquetes que el laboratorio sabe instalar, y archivos de datos del libro que puede usar
const PAQUETES = ["dplyr", "readr", "tidyr", "ggplot2", "tibble", "stringr", "lubridate", "forcats", "purrr"];
const DATOS = ["pinguinos.csv"];
const instalados = new Set(), copiados = new Set();

async function preparaR(avisa) {
  if (!webRPromesa) webRPromesa = (async () => {
    avisa("Descargando R para el navegador. La primera vez tarda un poco; después queda en caché.");
    const { WebR } = await import(WEBR);
    const webR = new WebR();
    await webR.init();
    avisa("Instalando jsonlite…");
    await webR.installPackages(["jsonlite"], { quiet: true });
    if (!trazarTexto) {
      const r = await fetch(new URL("../datos/trazar.R", import.meta.url));
      if (!r.ok) throw new Error("No encuentro herramientas/trazar.R en la web");
      trazarTexto = await r.text();
    }
    await webR.FS.writeFile("/home/web_user/trazar.R", new TextEncoder().encode(trazarTexto));
    await webR.evalRVoid('source("/home/web_user/trazar.R")');
    return webR;
  })().catch(e => { webRPromesa = null; throw e; });
  return webRPromesa;
}

const PISTAS = [
  [/unexpected end of input|final inesperado/i, "El código termina antes de tiempo: falta cerrar un paréntesis, una llave o unas comillas."],
  [/unexpected symbol|símbolo inesperado/i, "Hay dos cosas seguidas sin nada entre ellas. ¿Falta un operador, una coma o un paréntesis?"],
  [/unexpected '\)'|unexpected '\}'|unexpected ','/i, "Sobra un paréntesis, una llave o una coma (o falta lo que debería ir antes)."],
  [/unexpected/i, "R no entiende esta parte del código: revisa la línea que marca el mensaje."],
  [/object '(.+)' not found|objeto '(.+)' no encontrado/i, m => "R no encuentra la variable «" + (m[1] || m[2]) + "». ¿Está bien escrita? ¿La has creado antes de usarla?"],
  [/could not find function "(.+)"|no se pudo encontrar la función "(.+)"/i, m => "R no conoce la función «" + (m[1] || m[2]) + "». ¿Está bien escrita?"],
  [/non-numeric argument|argumento no-numérico/i, "Estás operando con algo que no es un número. ¿Hay un texto entre comillas?"],
  [/demasiados pasos/i, "El programa no termina (o da muchísimas vueltas). ¿La condición del while llega a ser FALSE alguna vez?"],
];
function pista(msg) {
  for (const [re, t] of PISTAS) { const m = msg.match(re); if (m) return typeof t === "function" ? t(m) : t; }
  return "";
}

function renderLaboratorio(el, C) {
  el.innerHTML = "<style>" + ESTILOS_LAB + '</style><div class="lab"><div class="lab-fila"><span class="lab-tit">' + esc(C.titulo || "Laboratorio de R") + "</span>" +
    '<select aria-label="Ejemplos"><option value="">Ejemplos…</option>' + EJEMPLOS.map((e, i) => '<option value="' + i + '">' + esc(e.nombre) + "</option>").join("") + "</select></div>" +
    '<div class="lab-ed"><div class="lab-num" aria-hidden="true"></div><textarea spellcheck="false" aria-label="Tu código de R" autocapitalize="off" autocorrect="off"></textarea></div>' +
    '<div class="lab-fila"><button class="pri lab-run">Ejecutar paso a paso</button><span class="lab-estado" aria-live="polite"></span></div>' +
    '<div class="lab-salida"></div></div>';
  const ta = el.querySelector("textarea"), num = el.querySelector(".lab-num"), estado = el.querySelector(".lab-estado");
  const btn = el.querySelector(".lab-run"), salida = el.querySelector(".lab-salida");
  let limpia = null;
  const numera = () => { num.textContent = ta.value.split("\n").map((_, i) => i + 1).join("\n"); num.scrollTop = ta.scrollTop; };
  let guardado = null; try { guardado = localStorage.getItem(CLAVE_LAB); } catch (e) {}
  ta.value = guardado || EJEMPLOS[1].codigo; numera();
  ta.addEventListener("input", () => { numera(); try { localStorage.setItem(CLAVE_LAB, ta.value); } catch (e) {} });
  ta.addEventListener("scroll", () => { num.scrollTop = ta.scrollTop; });
  ta.addEventListener("keydown", e => {
    if (e.key === "Tab") { e.preventDefault(); ta.setRangeText("  ", ta.selectionStart, ta.selectionEnd, "end"); numera(); }
    if (e.key === "Enter") {                    // mantener la sangría de la línea
      const ini = ta.value.lastIndexOf("\n", ta.selectionStart - 1) + 1;
      const sangria = ta.value.slice(ini).match(/^ */)[0] + (/\{\s*$/.test(ta.value.slice(ini, ta.selectionStart)) ? "  " : "");
      e.preventDefault(); ta.setRangeText("\n" + sangria, ta.selectionStart, ta.selectionEnd, "end"); numera();
    }
  });
  el.querySelector("select").addEventListener("change", e => {
    if (e.target.value === "") return;
    ta.value = EJEMPLOS[+e.target.value].codigo; numera(); e.target.value = "";
    try { localStorage.setItem(CLAVE_LAB, ta.value); } catch (er) {}
  });
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    if (limpia) { limpia(); limpia = null; }
    salida.innerHTML = "";
    try {
      const webR = await preparaR(t => { estado.textContent = t; });
      // los paquetes que pide el programa (library(), require() o paquete::) se instalan la primera vez
      const pedidos = [...ta.value.matchAll(/(?:library|require)\(\s*["']?([A-Za-z][\w.]*)["']?\s*\)|\b([A-Za-z][\w.]*)::/g)].map(m => m[1] || m[2]);
      for (const p of new Set(pedidos)) {
        if (!PAQUETES.includes(p) || instalados.has(p)) continue;
        estado.textContent = "Instalando " + p + " (solo la primera vez, tarda unos segundos)…";
        await webR.installPackages([p], { quiet: true });
        instalados.add(p);
      }
      // los datos del libro: si el programa los usa, se copian a la carpeta datos/ del R del navegador
      for (const f of DATOS) if (ta.value.includes(f) && !copiados.has(f)) {
        const r = await fetch(new URL("../datos/" + f, import.meta.url));
        if (r.ok) {
          try { await webR.FS.mkdir("/home/web_user/datos"); } catch (er) {}
          await webR.FS.writeFile("/home/web_user/datos/" + f, new Uint8Array(await r.arrayBuffer()));
          copiados.add(f);
        }
      }
      estado.textContent = "Ejecutando…";
      await webR.FS.writeFile("/home/web_user/lab.R", new TextEncoder().encode(ta.value));
      const tiempo = new Promise((_, no) => setTimeout(() => no(new Error("TIEMPO")), 15000));
      const json = await Promise.race([webR.evalRString('laboratorio(paste(readLines("/home/web_user/lab.R", warn = FALSE, encoding = "UTF-8"), collapse = "\\n"))'), tiempo]);
      const R = JSON.parse(json);
      if (R.error) {
        const p = pista(R.error);
        salida.innerHTML = '<div class="lab-error"><b>R no ha podido ejecutar el programa.</b> ' + esc(p) + "<code>" + esc(R.error) + "</code></div>";
        estado.textContent = "";
      } else {
        const cont = document.createElement("div"); salida.appendChild(cont);
        const fin = R.traza.pasos[R.traza.pasos.length - 1];
        if (fin.tipo === "error") R.config.idea = "R se ha detenido con un error. " + pista(fin.error);
        limpia = dibujaTraza(cont, R.config, R.traza);
        estado.textContent = (R.traza.pasos.length - 1) + " pasos. Pulsa «Paso ▶» o «Reproducir».";
      }
    } catch (e) {
      if (e.message === "TIEMPO") {
        estado.textContent = "";
        salida.innerHTML = '<div class="lab-error"><b>El programa tarda demasiado.</b> Puede que tenga un bucle que no termina. He reiniciado R: revisa el código y vuelve a probar.</div>';
        try { (await webRPromesa).close(); } catch (er) {}
        webRPromesa = null; instalados.clear(); copiados.clear();
      } else {
        estado.textContent = "";
        salida.innerHTML = '<div class="lab-error"><b>No he podido arrancar R en este navegador.</b> Comprueba la conexión y vuelve a probar.<code>' + esc(e.message || e) + "</code></div>";
      }
    }
    btn.disabled = false;
  });
  return () => { if (limpia) limpia(); };
}

export default { render };
