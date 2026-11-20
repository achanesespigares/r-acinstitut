# paquete.R · Genera los datos del visualizador de paquetes (widgets/paquete.mjs)
#
# Un paquete de R se construye con unas pocas órdenes de usethis y devtools, y cada una crea o cambia
# archivos en la carpeta del paquete. Este script ejecuta de verdad un guion de esas órdenes en una
# carpeta temporal y apunta, después de cada paso, qué escribe la consola, cómo queda el árbol de
# archivos, qué archivos son nuevos o han cambiado y el contenido del que conviene enseñar.
#
# Uso (desde la raíz del libro):
#   LANG=es_ES.UTF-8 LC_ALL=es_ES.UTF-8 Rscript herramientas/paquete.R capitulos/26-paquetes.md
#
# En el capítulo, cada visualizador lleva el nombre de su guion, que está en herramientas/guiones/:
#   ```{anywidget} ../widgets/paquete.mjs
#   {"config":{"titulo":"…","guion":"26-paquetes-1"}}
#   ```
# Un guion es un archivo de R que crea la lista `pasos`. Cada paso tiene `orden` (lo que se escribe
# en la consola, o un comentario si es editar un archivo), `hacer` (una función sin argumentos que lo
# hace), `mostrar` (el archivo que se enseña después) y `nota` (lo que cuenta el visualizador).

suppressPackageStartupMessages(library(jsonlite))
CARPETA <- "datos/paquetes"
RAIZ <- normalizePath(".")

arbol <- function(dir) {
  f <- list.files(dir, recursive = TRUE, all.files = TRUE, include.dirs = TRUE, no.. = TRUE)
  f <- f[!grepl("(^|/)\\.git(/|$)|(^|/)\\.Rproj\\.user|\\.Rcheck", f)]
  sort(ifelse(dir.exists(file.path(dir, f)), paste0(f, "/"), f))
}
huellas <- function(dir) {
  f <- arbol(dir); f <- f[!grepl("/$", f)]
  setNames(as.character(tools::md5sum(file.path(dir, f))), f)
}
# la consola, limpia: sin los giros del indicador de progreso de testthat ni líneas en blanco repetidas
limpia <- function(x) {
  x <- gsub("\033\\[[0-9;]*[A-Za-z]", "", x)
  x <- x[!grepl("^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏] ", x) & !grepl("^Duration: ", x)]   # sin tiempos: cambian en cada ejecución
  x <- sub("\\s+$", "", x)
  x <- x[!(x == "" & c(FALSE, head(x, -1) == ""))]
  paste(x, collapse = "\n")
}

ejecuta <- function(guion) {
  base <- tempfile("paquete"); dir.create(base)
  lib <- file.path(base, "biblioteca"); dir.create(lib)
  old <- setwd(base); on.exit(setwd(old), add = TRUE)
  options(usethis.quiet = FALSE, cli.num_colors = 1, crayon.enabled = FALSE, cli.dynamic = FALSE,
          cli.unicode = TRUE, width = 72, usethis.allow_nested_project = TRUE)
  Sys.setenv(`_R_CHECK_SYSTEM_CLOCK_` = "0", R_LIBS_USER = lib)
  .libPaths(c(lib, .libPaths()))
  entorno <- new.env()
  entorno$BASE <- base; entorno$LIB <- lib; entorno$RAIZ <- RAIZ
  sys.source(file.path(RAIZ, "herramientas", "guiones", paste0(guion, ".R")), envir = entorno)
  pasos <- list(); antes <- character(0); dir_paq <- base
  for (p in entorno$pasos) {
    salida <- character(0)
    tc <- textConnection("salida", "w", local = TRUE)
    sink(tc); sink(tc, type = "message")
    r <- tryCatch(withVisible(p$hacer()), error = function(e) { message("Error: ", conditionMessage(e)); list(visible = FALSE) })
    if (isTRUE(r$visible)) print(r$value)
    sink(type = "message"); sink(); close(tc)
    if (!is.null(entorno$PAQUETE) && dir.exists(entorno$PAQUETE)) dir_paq <- entorno$PAQUETE
    ahora <- if (dir_paq != base) huellas(dir_paq) else character(0)
    nuevos <- setdiff(names(ahora), names(antes))
    cambiados <- names(ahora)[names(ahora) %in% names(antes) & ahora != antes[names(ahora)]]
    contenido <- if (!is.null(p$mostrar) && file.exists(file.path(dir_paq, p$mostrar))) paste(readLines(file.path(dir_paq, p$mostrar), warn = FALSE), collapse = "\n") else NULL
    if (!is.null(p$texto_mostrar)) contenido <- p$texto_mostrar()
    # las rutas de la carpeta temporal, fuera: en tu ordenador serían otras
    cons <- limpia(salida)
    for (b in unique(c(normalizePath(base), base))) cons <- gsub(paste0(b, "/"), "", cons, fixed = TRUE)
    pasos[[length(pasos) + 1]] <- list(orden = p$orden, nota = p$nota, consola = cons,
      arbol = if (dir_paq != base) as.list(arbol(dir_paq)) else list(), nuevos = as.list(nuevos), cambiados = as.list(cambiados),
      mostrar = p$mostrar, rotulo = p$rotulo, resaltar = as.list(p$resaltar), contenido = contenido, raiz = basename(dir_paq))
    antes <- ahora
  }
  pasos
}

procesa <- function(fichero) {
  lineas <- readLines(fichero, encoding = "UTF-8", warn = FALSE)
  base <- sub("\\.md$", "", basename(fichero))
  dir.create(CARPETA, recursive = TRUE, showWarnings = FALSE)
  n <- 0
  for (i in seq_along(lineas)) {
    if (!grepl("^```\\{anywidget\\} .*paquete\\.mjs", lineas[i])) next
    datos <- fromJSON(lineas[i + 1], simplifyVector = FALSE)
    n <- n + 1
    pasos <- ejecuta(datos$config$guion)
    archivo <- file.path(CARPETA, paste0(datos$config$guion, ".json"))
    writeLines(as.character(toJSON(list(pasos = pasos), auto_unbox = TRUE, null = "null")), archivo, useBytes = TRUE)
    lineas[i + 1] <- as.character(toJSON(list(config = datos$config, archivo = archivo), auto_unbox = TRUE, null = "null"))
  }
  if (n) { writeLines(lineas, fichero, useBytes = TRUE); message(fichero, ": ", n, " paquetes") }
}

if (!interactive()) for (f in commandArgs(trailingOnly = TRUE)) procesa(f)
