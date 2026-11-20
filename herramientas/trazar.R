# trazar.R · genera las trazas de los visualizadores de un capítulo del libro de R
#
# Uso (desde la raíz del libro, con el locale español para que los avisos de R salgan en español):
#   LANG=es_ES.UTF-8 LC_ALL=es_ES.UTF-8 Rscript herramientas/trazar.R capitulos/*.md
#
# Busca cada directiva {anywidget} que carga traza-r.mjs, toma la celda {code-cell} r que la precede,
# ejecuta ese código paso a paso y escribe la traza en el cuerpo JSON de la directiva. La parte
# "config" la escribes tú y se conserva tal cual. Si cambias el código, vuelve a ejecutar el script.
#
# Cómo se ejecuta paso a paso: el programa se reescribe antes de ejecutarlo. Detrás de cada línea se
# añade una llamada que fotografía las variables y la pantalla; en cada vuelta de un for se fotografía
# la cabecera, y cada condición de un if o un while se fotografía con su resultado. Las funciones del
# alumno se ejecutan de una vez (todavía no se entra en ellas).
#
# Claves de "config":
#   titulo, etiqueta, idea   textos del visualizador
#   foco                     (opcional) vector que se dibuja grande, con su puntero
#   puntero                  (opcional) variable que señala la casilla del foco (i, k…)
#   columnas                 expresiones de la tabla de traza, p. ej. ["i", "x[i]", "total"]
#   fila_en                  "cada_linea" o "fin_iteracion"
#   ocultar                  (opcional) variables que no se dibujan
suppressMessages(library(jsonlite))

LIMITE <- 2000

# ── Cómo se describe un valor ────────────────────────────────────────────
un_valor <- function(e) {
  if (is.na(e)) return("NA")
  if (is.character(e)) return(paste0('"', e, '"'))
  if (is.logical(e)) return(if (e) "TRUE" else "FALSE")
  format(e, digits = 7)
}

describe <- function(x) {
  if (is.function(x)) return(list(t = "function"))
  if (is.factor(x)) return(list(t = "factor", v = as.list(as.character(x)), niveles = as.list(levels(x))))
  if (is.atomic(x) && is.null(dim(x))) {
    out <- list(t = class(x)[1], v = as.list(vapply(x, un_valor, "", USE.NAMES = FALSE)))
    if (!is.null(names(x))) out$n <- as.list(names(x))
    return(out)
  }
  if (is.matrix(x)) return(list(t = "matrix", d = as.list(dim(x)), v = as.list(vapply(as.vector(x), un_valor, ""))))
  list(t = class(x)[1], r = paste(utils::capture.output(print(x)), collapse = "\n"))
}

corto <- function(x) {                       # para la tabla de traza
  if (is.atomic(x) && is.null(dim(x)) && length(x) <= 12) {
    v <- vapply(x, un_valor, "", USE.NAMES = FALSE)
    return(if (length(v) == 1) v else paste(v, collapse = " "))
  }
  paste(utils::capture.output(print(x)), collapse = " ")
}

# ── La condición con sus valores: x[i] > 3  →  7 > 3 ─────────────────────
sustituye <- function(e, env) {
  valor_simple <- function(v) is.atomic(v) && is.null(dim(v)) && length(v) == 1
  rec <- function(e) {
    if (is.symbol(e)) {
      nom <- as.character(e)
      if (nzchar(nom) && exists(nom, envir = env, inherits = FALSE)) {
        v <- get(nom, envir = env)
        if (valor_simple(v)) return(str2lang(un_valor(v)))
      }
      return(e)
    }
    if (is.call(e)) {
      f <- as.character(e[[1]])[1]
      if (f %in% c("[", "[[", "length", "sum", "max", "min", "nchar")) {
        v <- tryCatch(eval(e, env), error = function(err) NULL)
        if (!is.null(v) && valor_simple(v)) return(str2lang(un_valor(v)))
      }
      for (j in seq_along(e)[-1]) if (!is.null(e[[j]])) e[[j]] <- rec(e[[j]])
    }
    e
  }
  paste(deparse(rec(e), width.cutoff = 500L), collapse = " ")
}

# ── Reescribir el programa ───────────────────────────────────────────────
reescribe <- function(e, linea, nivel) {
  if (is.call(e)) {
    f <- as.character(e[[1]])[1]
    if (f == "for") {
      e[[4]] <- call("{", call(".cabecera", linea), cuerpo(e[[4]], linea, nivel + 1), call(".fin_vuelta", linea))
      return(call("{", call(".va", linea), e, call(".fin_bucle", linea)))
    }
    if (f == "while") {
      e[[2]] <- call(".cond", linea, e[[2]], deparse1(e[[2]]))
      e[[3]] <- call("{", cuerpo(e[[3]], linea, nivel + 1), call(".fin_vuelta", linea))
      return(call("{", call(".va", linea), e, call(".fin_bucle", linea)))
    }
    if (f == "if") {
      e[[2]] <- call(".cond", linea, e[[2]], deparse1(e[[2]]))
      e[[3]] <- cuerpo(e[[3]], linea, nivel + 1)
      if (length(e) == 4) {
        otro <- e[[4]]
        if (is.call(otro) && identical(otro[[1]], as.name("if"))) {
          # else if: su línea es la de la llave que abre su bloque (} else if (...) {)
          r <- attr(otro[[3]], "srcref")
          l2 <- if (!is.null(r)) r[[1]][1] else linea
          e[[4]] <- reescribe(otro, l2, nivel + 1)
        } else e[[4]] <- cuerpo(otro, linea, nivel + 1)
      }
      return(call("{", call(".va", linea), e))
    }
    if (f == "{") return(cuerpo(e, linea, nivel))
    if (f %in% c("break", "next")) return(call("{", call(".va", linea), call(".paso", linea), e))   # se fotografía antes de saltar
  }
  if (nivel == 0) return(call("{", call(".va", linea), call(".muestra", e), call(".paso", linea)))
  call("{", call(".va", linea), e, call(".paso", linea))
}

cuerpo <- function(b, linea, nivel) {
  if (!(is.call(b) && identical(b[[1]], as.name("{")))) return(reescribe(b, linea, nivel))
  refs <- attr(b, "srcref")
  partes <- list(as.name("{"))
  for (j in seq_along(b)[-1]) {
    l <- if (!is.null(refs) && length(refs) >= j) refs[[j]][1] else linea
    partes[[length(partes) + 1]] <- reescribe(b[[j]], l, nivel)
  }
  as.call(partes)
}

# ── Ejecutar y fotografiar ───────────────────────────────────────────────
traza <- function(codigo, config) {
  pasos <- list(); filas <- list(); avisos <- character(0)
  vueltas <- list(); actual <- NA_integer_
  ocultar <- unlist(config$ocultar)
  columnas <- unlist(config$columnas)
  por_linea <- identical(config$fila_en, "cada_linea")

  ayudas <- new.env(parent = globalenv())
  env <- new.env(parent = ayudas)
  pantalla <- textConnection("salida_txt", "w", local = TRUE)
  on.exit(close(pantalla))
  lee_pantalla <- function() paste(c(textConnectionValue(pantalla), ""), collapse = "\n")

  orden <- character(0)                      # las variables, en el orden en que aparecen
  foto <- function() {
    nombres <- setdiff(ls(env), ocultar)
    orden <<- c(orden, setdiff(nombres, orden))
    nombres <- intersect(orden, nombres)
    estado <- lapply(nombres, function(n) describe(get(n, envir = env)))
    names(estado) <- nombres
    estado
  }
  anota <- function(paso) {
    if (length(pasos) >= LIMITE && paso$tipo != "error") stop("el programa da demasiados pasos (más de ", LIMITE, ")")
    paso$estado <- foto()
    paso$salida <- lee_pantalla()
    paso$nfilas <- length(filas)
    if (length(avisos)) { paso$avisos <- as.list(avisos); avisos <<- character(0) }
    pasos[[length(pasos) + 1]] <<- paso
  }
  fila <- function() {
    filas[[length(filas) + 1]] <<- as.list(vapply(columnas, function(cx)
      tryCatch(corto(eval(str2lang(cx), env)), error = function(err) ""), ""))
  }

  ayudas$.va <- function(l) actual <<- l
  ayudas$.paso <- function(l) { if (por_linea) fila(); anota(list(linea = l, tipo = "linea")) }
  ayudas$.muestra <- function(e) {
    v <- withVisible(eval(substitute(e), env))
    if (v$visible) print(v$value)
    invisible()
  }
  ayudas$.cabecera <- function(l) {
    k <- (if (is.null(vueltas[[as.character(l)]])) 0 else vueltas[[as.character(l)]]) + 1
    vueltas[[as.character(l)]] <<- k
    anota(list(linea = l, tipo = "vuelta", vuelta = k))
  }
  ayudas$.fin_vuelta <- function(l) if (!por_linea) fila()
  ayudas$.fin_bucle <- function(l) {
    anota(list(linea = l, tipo = "fin", vuelta = if (is.null(vueltas[[as.character(l)]])) 0 else vueltas[[as.character(l)]]))
    vueltas[[as.character(l)]] <<- NULL
  }
  ayudas$.cond <- function(l, c, texto) {
    con_valores <- sustituye(str2lang(texto), env)
    r <- c
    anota(list(linea = l, tipo = "condicion", cond = list(texto = texto, valores = con_valores,
                                                          valor = if (isTRUE(r)) "TRUE" else "FALSE")))
    r
  }

  exprs <- parse(text = codigo, keep.source = TRUE)
  refs <- attr(exprs, "srcref")
  pasos[[1]] <- list(linea = NULL, tipo = "inicio", estado = setNames(list(), character(0)), salida = "", nfilas = 0)
  sink(pantalla)
  error <- tryCatch({
    withCallingHandlers({
      for (j in seq_along(exprs)) eval(reescribe(exprs[[j]], refs[[j]][1], 0), env)
      NULL
    }, warning = function(w) {
      avisos <<- c(avisos, conditionMessage(w))
      invokeRestart("muffleWarning")
    })
  }, error = function(err) conditionMessage(err))
  sink()
  if (!is.null(error)) anota(list(linea = actual, tipo = "error", error = error))
  list(codigo = codigo, pasos = pasos, filas = filas)
}

# ── Leer y escribir los capítulos ────────────────────────────────────────
procesa <- function(fichero) {
  lineas <- readLines(fichero, encoding = "UTF-8", warn = FALSE)
  n <- 0
  for (i in seq_along(lineas)) {
    if (!grepl("^```\\{anywidget\\} .*traza-r\\.mjs", lineas[i])) next
    datos <- fromJSON(lineas[i + 1], simplifyVector = FALSE)
    # la celda de código que precede a la directiva
    fin <- max(which(seq_along(lineas) < i & lineas == "```"))
    ini <- max(which(seq_along(lineas) < fin & grepl("^```\\{code-cell\\} r", lineas)))
    codigo <- paste(lineas[(ini + 1):(fin - 1)], collapse = "\n")
    datos$traza <- traza(codigo, datos$config)
    lineas[i + 1] <- as.character(toJSON(datos, auto_unbox = TRUE, null = "null"))
    n <- n + 1
  }
  writeLines(lineas, fichero, useBytes = TRUE)
  message(fichero, ": ", n, " trazas")
}

if (!interactive()) for (f in commandArgs(trailingOnly = TRUE)) procesa(f)

# ── El laboratorio: el navegador (webR) llama a esta función con el código del lector ──
# Elige sola qué dibujar: si hay un for (i in seq_along(v)), el vector v con el puntero i.
laboratorio <- function(codigo) {
  cfg <- list(titulo = "Tu programa", etiqueta = "laboratorio", idea = "", fila_en = "fin_iteracion")
  m <- regmatches(codigo, regexec("for\\s*\\(\\s*([A-Za-z.][A-Za-z0-9._]*)\\s+in\\s+seq_along\\(\\s*([A-Za-z.][A-Za-z0-9._]*)\\s*\\)", codigo))[[1]]
  if (length(m) == 3) { cfg$foco <- m[3]; cfg$puntero <- m[2]; cfg$columnas <- list(m[2], paste0(m[3], "[", m[2], "]")) }
  res <- tryCatch(list(config = cfg, traza = traza(codigo, cfg)),
                  error = function(e) list(error = conditionMessage(e)))
  as.character(toJSON(res, auto_unbox = TRUE, null = "null"))
}
