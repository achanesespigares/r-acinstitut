# informe.R · Genera los datos del visualizador de informes (widgets/informe.mjs)
#
# Quarto ejecuta el R de un documento .qmd con knitr: bloque a bloque, en orden, en una sesión nueva,
# y después pandoc convierte el resultado en HTML, PDF o Word. Este script hace lo mismo paso a paso
# con knitr, y apunta, para cada trozo del documento, qué líneas del .qmd son, qué entra en el
# documento final y qué variables hay en la sesión. Así el visualizador puede enseñar cómo se va
# construyendo el informe.
#
# Uso (desde la raíz del libro, con el locale español):
#   LANG=es_ES.UTF-8 LC_ALL=es_ES.UTF-8 Rscript herramientas/informe.R capitulos/25-informes-quarto.md
#
# En el capítulo, cada visualizador va justo después de un bloque ````qmd con el documento:
#   ```{anywidget} ../widgets/informe.mjs
#   {"config":{"titulo":"…"}}
#   ```
# El script escribe datos/informes/<capítulo>-<n>.json y los gráficos en datos/graficos/, y pone en la
# directiva el nombre del archivo. Con "parametros": {"isla": ["Biscoe", "Dream"]} genera una versión del
# informe por cada valor del parámetro, como haría quarto render informe.qmd -P isla:Dream.

suppressPackageStartupMessages({ library(knitr); library(jsonlite); library(yaml); library(commonmark) })
CARPETA <- "datos/informes"
GRAFICOS <- "datos/graficos"

esc <- function(s) { s <- gsub("&", "&amp;", s, fixed = TRUE); s <- gsub("<", "&lt;", s, fixed = TRUE); gsub(">", "&gt;", s, fixed = TRUE) }

# Qué es una variable, en pocas palabras (para el panel de la sesión)
describe <- function(x) {
  if (is.data.frame(x)) return(sprintf("una tabla de %d %s y %d columnas", nrow(x), if (nrow(x) == 1) "fila" else "filas", ncol(x)))
  if (is.function(x)) return("una función")
  if (inherits(x, "ggplot")) return("un gráfico de ggplot2")
  if (is.list(x)) return(sprintf("una lista de %d %s", length(x), if (length(x) == 1) "elemento" else "elementos"))
  if (is.atomic(x) && length(x) == 1) return(paste0(if (is.character(x)) paste0('"', x, '"') else format(x, digits = 7)))
  if (is.atomic(x)) return(sprintf("un vector %s de %d elementos", class(x)[1], length(x)))
  paste("un objeto de clase", class(x)[1])
}
sesion <- function(env) {
  n <- ls(env)
  lapply(n, function(k) {
    x <- get(k, envir = env)
    list(nombre = k, desc = if (k == "params") paste0("los parámetros: ", paste(names(x), "=", vapply(x, function(v) deparse(v), ""), collapse = ", ")) else describe(x))
  })
}

# Las opciones #| de un bloque, como lista con nombre (fig-cap, echo…)
opciones <- function(lineas) {
  op <- grep("^#\\|", lineas, value = TRUE)
  if (!length(op)) return(list())
  yaml.load(paste(sub("^#\\|\\s?", "", op), collapse = "\n"))
}

# Trozos del cuerpo: bloques de código ```{r} y párrafos de texto (separados por líneas en blanco)
trozos <- function(L, desde) {
  out <- list(); i <- desde
  while (i <= length(L)) {
    if (grepl("^\\s*$", L[i])) { i <- i + 1; next }
    if (grepl("^```\\{r.*\\}\\s*$", L[i])) {
      j <- i + 1; while (j <= length(L) && !grepl("^```\\s*$", L[j])) j <- j + 1
      out[[length(out) + 1]] <- list(tipo = "bloque", ini = i, fin = j, codigo = L[(i + 1):(j - 1)])
      i <- j + 1
    } else {
      j <- i; while (j < length(L) && !grepl("^\\s*$", L[j + 1]) && !grepl("^```", L[j + 1])) j <- j + 1
      out[[length(out) + 1]] <- list(tipo = "texto", ini = i, fin = j, texto = L[i:j])
      i <- j + 1
    }
  }
  out
}

md_html <- function(md) markdown_html(md, extensions = c("table", "strikethrough"))

# Un render completo del documento con unos valores de los parámetros
genera <- function(qmd, valores, prefijo, carpeta = NULL) {
  L <- strsplit(qmd, "\n", fixed = TRUE)[[1]]
  fy <- which(L == "---")
  cab <- yaml.load(paste(L[(fy[1] + 1):(fy[2] - 1)], collapse = "\n"))
  params <- cab$params
  for (n in names(valores)) params[[n]] <- valores[[n]]
  env <- new.env(parent = globalenv())
  if (!is.null(params)) assign("params", params, envir = env)
  # Quarto ejecuta el documento desde su carpeta: con "carpeta" en la configuración, los bloques se
  # ejecutan allí (las rutas del documento son relativas a ella); los gráficos siguen yendo al libro
  opts_knit$set(progress = FALSE, verbose = FALSE, root.dir = if (is.null(carpeta)) NULL else normalizePath(carpeta))
  # las opciones que pone Quarto a knitr (comment = NA; los avisos y mensajes, a la vista), y las del documento
  ex <- cab$execute
  opts_chunk$restore()
  opts_chunk$set(comment = NA, error = FALSE, dev = "png", dpi = 96, fig.width = 7, fig.height = 5,
                 echo = !isFALSE(ex$echo), warning = !isFALSE(ex$warning), message = !isFALSE(ex$warning))
  T <- trozos(L, fy[2] + 1)
  # números de las figuras con etiqueta fig-…, en orden, para las referencias @fig-…
  figs <- character(0); tbls <- character(0)
  for (t in T) if (t$tipo == "bloque") {
    o <- opciones(t$codigo)
    if (!is.null(o$label) && grepl("^fig-", o$label)) figs <- c(figs, o$label)
    if (!is.null(o$label) && grepl("^tbl-", o$label)) tbls <- c(tbls, o$label)
  }
  ref <- function(html) {
    for (k in seq_along(figs)) html <- gsub(paste0("@", figs[k], "\\b"), sprintf('<a class="ref">Figura %d</a>', k), html, perl = TRUE)
    for (k in seq_along(tbls)) html <- gsub(paste0("@", tbls[k], "\\b"), sprintf('<a class="ref">Tabla %d</a>', k), html, perl = TRUE)
    html
  }
  pasos <- list(list(tipo = "yaml", ini = 1, fin = fy[2], cabecera = cab, params = params, sesion = sesion(env)))
  nb <- 0
  for (t in T) {
    if (t$tipo == "texto") {
      md <- paste(t$texto, collapse = "\n")
      # el código en línea, `{r} expr` (y el estilo antiguo `r expr`): se calcula con knitr, como hace Quarto
      pat <- "`\\{?r\\}? ([^`]+)`"
      m <- regmatches(md, gregexpr(pat, md))[[1]]
      inl <- list()
      for (k in seq_along(m)) {
        ex1 <- sub(pat, "\\1", m[k])
        val <- tryCatch(trimws(knit(text = paste0("`r ", ex1, "`"), envir = env, quiet = TRUE)), error = function(e) structure(conditionMessage(e), class = "fallo"))
        if (inherits(val, "fallo")) return(list(pasos = c(pasos, list(list(tipo = "error", ini = t$ini, fin = t$fin, error = unclass(val), sesion = sesion(env)))), final = FALSE))
        inl[[k]] <- list(codigo = ex1, valor = val)
        md <- sub(m[k], paste0("§", k, "§"), md, fixed = TRUE)
      }
      html <- ref(md_html(md))
      for (k in seq_along(inl)) html <- sub(paste0("§", k, "§"), paste0('<span class="inl">', inl[[k]]$valor, "</span>"), html, fixed = TRUE)
      pasos[[length(pasos) + 1]] <- list(tipo = "texto", ini = t$ini, fin = t$fin, html = html, inline = inl,
                                         titulo = grepl("^#", t$texto[1]), sesion = sesion(env))
    } else {
      nb <- nb + 1
      o <- opciones(t$codigo)
      antes <- ls(env)
      opts_chunk$set(fig.path = paste0(GRAFICOS, "/", prefijo, "-b", nb, "-"))
      txt <- paste(c("```{r}", t$codigo, "```"), collapse = "\n")
      out <- tryCatch(knit(text = txt, envir = env, quiet = TRUE), error = function(e) structure(conditionMessage(e), class = "fallo"))
      if (inherits(out, "fallo"))
        return(list(pasos = c(pasos, list(list(tipo = "error", ini = t$ini, fin = t$fin, opciones = o, error = unclass(out), sesion = sesion(env)))), final = FALSE))
      # las figuras: con su número y su pie, como las pone Quarto («Figura 1: …»)
      imgs <- regmatches(out, gregexpr("!\\[[^]]*\\]\\([^)]+\\)", out))[[1]]
      figuras <- list()
      for (im in imgs) {
        src <- sub("^!\\[[^]]*\\]\\(([^)]+)\\)$", "\\1", im)
        cap <- if (!is.null(o$`fig-cap`)) o$`fig-cap` else ""
        num <- if (!is.null(o$label) && o$label %in% figs) match(o$label, figs) else NA
        pie <- if (!is.na(num)) paste0("Figura ", num, if (nzchar(cap)) paste0(": ", cap) else "") else cap
        figuras[[length(figuras) + 1]] <- list(src = src, pie = pie)
        out <- sub(im, paste0("§F", length(figuras), "§"), out, fixed = TRUE)
      }
      html <- md_html(out)
      for (k in seq_along(figuras)) {
        f <- figuras[[k]]
        fig <- paste0('<figure><img src="', f$src, '" alt="', esc(f$pie), '">', if (nzchar(f$pie)) paste0("<figcaption>", esc(f$pie), "</figcaption>"), "</figure>")
        html <- sub(paste0("<p>§F", k, "§</p>"), fig, html, fixed = TRUE)
      }
      # una tabla con etiqueta tbl-…: su pie va encima, «Tabla 1: …», como lo pone Quarto
      if (!is.null(o$label) && o$label %in% tbls) {
        cap <- if (!is.null(o$`tbl-cap`)) paste0(": ", o$`tbl-cap`) else ""
        html <- sub("<table>", paste0('<table><caption>Tabla ', match(o$label, tbls), esc(cap), "</caption>"), html, fixed = TRUE)
      }
      pasos[[length(pasos) + 1]] <- list(tipo = "bloque", ini = t$ini, fin = t$fin, opciones = o, html = trimws(html),
                                         nuevas = as.list(setdiff(ls(env), antes)), figuras = length(figuras), sesion = sesion(env))
    }
  }
  list(pasos = pasos, final = TRUE)
}

procesa <- function(fichero) {
  lineas <- readLines(fichero, encoding = "UTF-8", warn = FALSE)
  base <- sub("\\.md$", "", basename(fichero))
  dir.create(CARPETA, recursive = TRUE, showWarnings = FALSE)
  unlink(Sys.glob(file.path(CARPETA, paste0(base, "-*.json"))))
  unlink(Sys.glob(file.path(GRAFICOS, paste0(base, "-i*"))))
  n <- 0
  for (i in seq_along(lineas)) {
    if (!grepl("^```\\{anywidget\\} .*informe\\.mjs", lineas[i])) next
    datos <- fromJSON(lineas[i + 1], simplifyVector = FALSE)
    # el documento: el archivo que dice "qmd" en la configuración, o el bloque ````qmd de antes
    if (!is.null(datos$config$qmd)) qmd <- paste(readLines(datos$config$qmd, encoding = "UTF-8", warn = FALSE), collapse = "\n") else {
      fin <- max(which(seq_along(lineas) < i & lineas == "````"))
      ini <- max(which(seq_along(lineas) < fin & grepl("^````qmd", lineas)))
      qmd <- paste(lineas[(ini + 1):(fin - 1)], collapse = "\n")
    }
    n <- n + 1
    # los valores que se pueden probar del parámetro: config$parametros = {"isla": ["Biscoe", "Dream"]}
    vals <- datos$config$parametros
    combos <- if (length(vals)) unlist(vals[[1]]) else NA
    versiones <- list()
    for (v in combos) {
      valores <- if (is.na(v)) list() else setNames(list(v), names(vals)[1])
      versiones[[if (is.na(v)) "unica" else v]] <- genera(qmd, valores, paste0(base, "-i", n, if (!is.na(v)) paste0("-", gsub("[^A-Za-z0-9]", "", iconv(v, to = "ASCII//TRANSLIT")))), datos$config$carpeta)
    }
    archivo <- file.path(CARPETA, paste0(base, "-", n, ".json"))
    writeLines(as.character(toJSON(list(qmd = qmd, parametro = if (length(vals)) names(vals)[1] else NULL,
                                        versiones = versiones), auto_unbox = TRUE, null = "null")), archivo, useBytes = TRUE)
    lineas[i + 1] <- as.character(toJSON(list(config = datos$config, archivo = archivo), auto_unbox = TRUE, null = "null"))
  }
  if (n) { writeLines(lineas, fichero, useBytes = TRUE); message(fichero, ": ", n, " informes") }
}

if (!interactive()) for (f in commandArgs(trailingOnly = TRUE)) procesa(f)
