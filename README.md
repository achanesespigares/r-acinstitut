# Programación en R · AC Institut

*Ver el código pensar*: aprender R viendo cómo se ejecuta cada programa, línea a línea y con la memoria a la vista. Es el hermano del libro de Python de la colección. Está hecho con Jupyter Book 2 (motor MyST) y publicado en GitHub Pages.

## Las dos rutas

Cada capítulo tiene una **ruta base** (para el aula y el autoestudio) y apartados **A fondo** (cómo funciona R por dentro y cómo se trabaja como profesional), como los niveles SL y HL del IB. Un apartado «A fondo» se escribe así:

```markdown
:::{div}
:class: afondo
### 4 · Copiar al modificar
…
:::
```

El interruptor `widgets/rutas.mjs`, al principio de cada capítulo, oculta o muestra esos bloques. La elección se recuerda en el navegador.

## Estructura

```
myst.yml                  configuración e índice del libro
index.md                  portada
capitulos/                un fichero por capítulo
widgets/traza-r.mjs       el visualizador de trazas de R y el laboratorio (webR, R en el navegador)
widgets/rutas.mjs         el interruptor de las dos rutas
herramientas/trazar.R     ejecuta los programas paso a paso y escribe las trazas en los capítulos
estilo/ac-institut.css    piel AC Institut (vino, Montserrat, Arimo, IBM Plex Mono) y cápsulas «A fondo»
.github/workflows/        publicación automática en GitHub Pages
```

## Trabajar con el libro

Requisitos: Node 18 o superior, R 4.3 o superior y el paquete `jsonlite`.

```bash
npm ci              # instala MyST en la versión fijada
npm run trazas      # regenera las trazas (con el locale es_ES.UTF-8, para que los avisos de R salgan en español)
npm start           # vista previa en http://localhost:3000
npm run build       # versión estática en _build/html
```

Las trazas se generan en local y se guardan en los capítulos: la publicación no necesita R. El laboratorio carga webR 0.6.0 desde su CDN y ejecuta en el navegador `herramientas/trazar.R` (la publicación lo copia a `datos/`), con la función `laboratorio()`.

## Añadir un programa visualizado

Detrás de una celda `{code-cell} r`, una directiva con su configuración:

````markdown
```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"…","etiqueta":"…","idea":"…","foco":"z","puntero":"i","columnas":["i","z[i]"],"fila_en":"fin_iteracion"}}
```
````

Después, `npm run trazas`. Las claves de `config` están explicadas al principio de `herramientas/trazar.R`.

## Licencia

Antonio Chanes Espigares · CC BY-NC-SA 4.0
