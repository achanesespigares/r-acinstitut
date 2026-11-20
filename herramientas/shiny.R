# shiny.R · Genera los datos del visualizador de reactividad (widgets/reactivo.mjs)
#
# Una app de Shiny es un grafo: las entradas (los deslizadores) alimentan expresiones reactivas, y
# estas, las salidas (textos, gráficos). Cuando cambia una entrada, Shiny marca como caducado todo lo
# que depende de ella y lo vuelve a calcular, y nada más. Este script ejecuta de verdad la app del
# capítulo con shiny::testServer(): le cambia las entradas como haría el lector y apunta qué se vuelve
# a ejecutar, en qué orden, y qué valen las salidas. Los gráficos se guardan en datos/graficos/.
#
# Uso (desde la raíz del libro):
#   LANG=es_ES.UTF-8 LC_ALL=es_ES.UTF-8 Rscript herramientas/shiny.R capitulos/27-shiny.md
#
# En el capítulo, el visualizador va justo después del bloque ```r con app.R, y dice qué cambios hace:
#   ```{anywidget} ../widgets/reactivo.mjs
#   {"config":{"titulo":"…","cambios":[{"peso":0.7},{"examen2":3}]}}
#   ```

suppressPackageStartupMessages({ library(shiny); library(jsonlite) })
CARPETA <- "datos/reactivo"
GRAFICOS <- "datos/graficos"

# Las piezas de la interfaz: el título, los deslizadores y las salidas, leídos del código de ui
piezas_ui <- function(e) {
  out <- list(titulo = NULL, entradas = list(), salidas = list())
  rec <- function(x) {
    if (!is.call(x)) return()
    f <- as.character(x[[1]])[1]
    a <- as.list(x)[-1]
    if (f == "titlePanel") out$titulo <<- eval(a[[1]])
    if (f %in% c("sliderInput", "numericInput")) {
      v <- lapply(match.call(get(f, asNamespace("shiny")), x)[-1], eval)
      out$entradas[[length(out$entradas) + 1]] <<- list(id = v$inputId, etiqueta = v$label, min = v$min, max = v$max, valor = v$value, paso = v$step, tipo = f)
    }
    if (grepl("Output$", f)) out$salidas[[length(out$salidas) + 1]] <<- list(id = eval(a[[1]]), tipo = sub("Output$", "", f))
    for (y in a) rec(y)
  }
  rec(e)
  out
}

# De qué lee cada pieza del servidor: input$x y las expresiones reactivas que llama, nombre()
lee_de <- function(e, reactivas) {
  n <- character(0)
  rec <- function(x) {
    if (!is.call(x)) return()
    if (identical(x[[1]], as.name("$")) && identical(x[[2]], as.name("input"))) n <<- c(n, paste0("input$", as.character(x[[3]])))
    f <- x[[1]]
    if (is.name(f) && as.character(f) %in% reactivas && length(x) == 1) n <<- c(n, as.character(f))
    for (y in as.list(x)[-1]) rec(y)
  }
  rec(e)
  unique(n)
}

procesa_app <- function(codigo, cambios, base) {
  exprs <- parse(text = codigo, keep.source = TRUE)
  refs <- attr(exprs, "srcref")
  env <- new.env(parent = globalenv())
  ui_expr <- NULL; server_expr <- NULL
  for (j in seq_along(exprs)) {
    e <- exprs[[j]]
    if (is.call(e) && identical(e[[1]], as.name("shinyApp"))) next
    if (is.call(e) && identical(e[[1]], as.name("<-")) && identical(e[[2]], as.name("ui"))) ui_expr <- e[[3]]
    if (is.call(e) && identical(e[[1]], as.name("<-")) && identical(e[[2]], as.name("server"))) { server_expr <- e[[3]]; server_ini <- refs[[j]][1] }
    eval(e, env)
  }
  ui <- piezas_ui(ui_expr)
  # el cuerpo del servidor: cada expresión reactiva y cada salida apunta en el registro cuándo se ejecuta
  cuerpo <- server_expr[[3]]
  sr <- attr(cuerpo, "srcref")
  nodos <- list(); reactivas <- character(0)
  for (k in seq_along(cuerpo)[-1]) {
    x <- cuerpo[[k]]
    if (!(is.call(x) && identical(x[[1]], as.name("<-")) && is.call(x[[3]]))) next
    lineas <- if (!is.null(sr) && length(sr) >= k) c(sr[[k]][1], sr[[k]][3]) else c(NA, NA)
    if (identical(x[[3]][[1]], as.name("reactive"))) {
      nombre <- as.character(x[[2]]); reactivas <- c(reactivas, nombre)
      nodos[[nombre]] <- list(id = nombre, clase = "reactiva", expr = x[[3]][[2]], lineas = lineas)
      cuerpo[[k]][[3]][[2]] <- call("{", call(".apunta", nombre), x[[3]][[2]])
    } else if (is.call(x[[2]]) && identical(x[[2]][[2]], as.name("output")) && grepl("^render", as.character(x[[3]][[1]]))) {
      nombre <- paste0("output$", as.character(x[[2]][[3]]))
      nodos[[nombre]] <- list(id = nombre, clase = "salida", tipo = sub("^render", "", as.character(x[[3]][[1]])), expr = x[[3]][[2]], lineas = lineas)
      cuerpo[[k]][[3]][[2]] <- call("{", call(".apunta", nombre), x[[3]][[2]])
    }
  }
  for (n in names(nodos)) { nodos[[n]]$lee <- as.list(lee_de(nodos[[n]]$expr, reactivas)); nodos[[n]]$expr <- NULL }
  server_expr[[3]] <- cuerpo
  registro <- character(0)
  env$.apunta <- function(n) registro <<- c(registro, n)
  servidor <- eval(server_expr, env)

  ids_salida <- vapply(ui$salidas, `[[`, "", "id")
  valores <- vapply(ui$entradas, function(x) x$valor, 0); names(valores) <- vapply(ui$entradas, `[[`, "", "id")
  estados <- list(); n_img <- 0
  foto <- function() {
    out <- list()
    for (s in ids_salida) {
      v <- salida(s)
      if (is.list(v) && !is.null(v$src)) {
        n_img <<- n_img + 1
        f <- file.path(GRAFICOS, paste0(base, "-", n_img, ".png"))
        writeBin(base64enc_decode(sub("^data:image/png;base64,", "", v$src)), f)
        out[[s]] <- list(imagen = f)
      } else out[[s]] <- list(texto = v)
    }
    out
  }
  salida <- NULL
  corre <- function(session) {
    do.call(session$setInputs, as.list(valores))
    estados[[1]] <<- list(cambio = NULL, entradas = as.list(valores), registro = as.list(registro), salidas = foto())
    for (c in cambios) {
      registro <<- character(0)
      valores[names(c)] <<- unlist(c)
      do.call(session$setInputs, c)
      estados[[length(estados) + 1]] <<- list(cambio = c, entradas = as.list(valores), registro = as.list(registro), salidas = foto())
    }
  }
  # el bloque de testServer() ve este marco: desde él se leen las salidas y se hacen los cambios
  testServer(servidor, { salida <<- function(s) output[[s]]; corre(session) })
  # comprobación: lo que se vuelve a ejecutar tiene que ser justo lo que depende de la entrada cambiada
  abajo <- function(desde) {
    r <- character(0); f <- desde
    repeat { nuevos <- setdiff(names(nodos)[vapply(nodos, function(n) any(n$lee %in% f), NA)], r); if (!length(nuevos)) break; r <- c(r, nuevos); f <- nuevos }
    r
  }
  for (k in seq_along(estados)[-1]) {
    esperado <- sort(abajo(paste0("input$", names(estados[[k]]$cambio))))
    real <- sort(unique(unlist(estados[[k]]$registro)))
    if (!identical(esperado, real)) warning("el cambio ", k - 1, ": se esperaba ", paste(esperado, collapse = ", "), " y se ejecutó ", paste(real, collapse = ", "))
    estados[[k]]$caducan <- as.list(esperado)
  }
  # el enlace de Shinylive, para abrir la app de verdad en el navegador (con su código, editable)
  tmp <- tempfile(fileext = ".R"); writeLines(codigo, tmp, useBytes = TRUE)
  url <- tryCatch(system2("node", c("herramientas/shinylive-url.mjs", tmp, "editor"), stdout = TRUE), error = function(e) NULL, warning = function(w) NULL)
  list(codigo = codigo, ui = ui, nodos = unname(nodos), estados = estados, shinylive = if (length(url)) paste(url, collapse = "") else NULL)
}

base64enc_decode <- function(s) jsonlite::base64_dec(s)

procesa <- function(fichero) {
  lineas <- readLines(fichero, encoding = "UTF-8", warn = FALSE)
  base <- sub("\\.md$", "", basename(fichero))
  dir.create(CARPETA, recursive = TRUE, showWarnings = FALSE)
  unlink(Sys.glob(file.path(GRAFICOS, paste0(base, "-r*.png"))))
  n <- 0
  for (i in seq_along(lineas)) {
    if (!grepl("^```\\{anywidget\\} .*reactivo\\.mjs", lineas[i])) next
    datos <- fromJSON(lineas[i + 1], simplifyVector = FALSE)
    fin <- max(which(seq_along(lineas) < i & lineas == "```"))
    ini <- max(which(seq_along(lineas) < fin & lineas == "```r"))
    codigo <- paste(lineas[(ini + 1):(fin - 1)], collapse = "\n")
    n <- n + 1
    d <- procesa_app(codigo, datos$config$cambios, paste0(base, "-r", n))
    archivo <- file.path(CARPETA, paste0(base, "-", n, ".json"))
    writeLines(as.character(toJSON(d, auto_unbox = TRUE, null = "null", digits = NA)), archivo, useBytes = TRUE)
    lineas[i + 1] <- as.character(toJSON(list(config = datos$config, archivo = archivo), auto_unbox = TRUE, null = "null"))
  }
  if (n) { writeLines(lineas, fichero, useBytes = TRUE); message(fichero, ": ", n, " apps") }
}

if (!interactive()) for (f in commandArgs(trailingOnly = TRUE)) procesa(f)
