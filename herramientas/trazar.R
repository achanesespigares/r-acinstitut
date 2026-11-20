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
# alumno también se recorren paso a paso: cada llamada abre su marco (sus argumentos y sus variables
# locales), y al salir se anota lo que devuelve y la línea a la que vuelve el programa.
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
SIN_VALOR <- structure(list(), class = "sin_valor")   # marca de «la función no ha terminado bien»

# ── Cómo se describe un valor ────────────────────────────────────────────
un_valor <- function(e) {
  if (is.na(e)) return("NA")
  if (inherits(e, c("Date", "POSIXt"))) return(format(e))
  if (inherits(e, "difftime")) return(format(as.numeric(e), digits = 7))
  if (is.character(e)) return(paste0('"', e, '"'))
  if (is.logical(e)) return(if (e) "TRUE" else "FALSE")
  format(e, digits = 7)
}

describe <- function(x, prof = 0) {
  if (is.function(x)) return(list(t = "function"))
  if (is.data.frame(x) && nrow(x) <= 40 && ncol(x) <= 12) {
    # un data frame: sus columnas, cada una descrita como el vector (o factor) que es, y los nombres de las filas
    cols <- lapply(names(x), function(n) list(nombre = n, v = describe(x[[n]], prof + 1)))
    return(list(t = "data.frame", nf = nrow(x), cols = cols, filas = as.list(rownames(x))))
  }
  if (is.list(x) && !is.data.frame(x) && is.null(attr(x, "class", exact = TRUE)) && prof < 4 && length(x) <= 30) {
    # una lista: cada elemento con su nombre (o su posición) y su valor, que puede ser otra lista
    nom <- names(x)
    el <- lapply(seq_along(x), function(i) {
      e <- list(v = describe(x[[i]], prof + 1))
      if (!is.null(nom) && !is.na(nom[i]) && nzchar(nom[i])) e$nombre <- nom[i]
      e
    })
    return(list(t = "list", el = el))
  }
  if (inherits(x, "Date")) {                 # una fecha: el día, y por dentro los días desde el 1-1-1970
    num <- as.numeric(x)
    return(list(t = "Date", v = as.list(ifelse(is.na(x), "NA", format(x))), k = as.list(ifelse(is.na(num), "NA", format(num, scientific = FALSE, trim = TRUE)))))
  }
  if (inherits(x, "difftime"))               # una diferencia de tiempos, con su unidad
    return(list(t = "difftime", v = as.list(vapply(unclass(x), un_valor, "", USE.NAMES = FALSE)), u = units(x)))
  if (is.factor(x)) {                       # un factor: las etiquetas, los códigos enteros y los niveles
    etq <- as.character(x); cod <- as.integer(x)
    out <- list(t = "factor", v = as.list(ifelse(is.na(etq), "NA", etq)), k = as.list(ifelse(is.na(cod), "NA", as.character(cod))),
                niveles = as.list(levels(x)))
    if (is.ordered(x)) out$ord <- TRUE
    return(out)
  }
  if (is.atomic(x) && is.null(dim(x))) {
    out <- list(t = class(x)[1], v = as.list(vapply(x, un_valor, "", USE.NAMES = FALSE)))
    if (!is.null(names(x))) out$n <- as.list(names(x))
    return(out)
  }
  if (is.array(x) && length(dim(x)) %in% 2:3 && is.atomic(x) && length(x) <= 400) {
    # una matriz o un array de 3 dimensiones: los valores (por columnas, como los guarda R), las
    # dimensiones, el tipo de los elementos y los nombres de filas y columnas, si los tiene
    out <- list(t = if (length(dim(x)) == 2) "matrix" else "array", tipo = typeof(x), d = as.list(dim(x)),
                v = as.list(vapply(as.vector(x), un_valor, "", USE.NAMES = FALSE)))
    dn <- dimnames(x)
    if (!is.null(dn)) out$dn <- lapply(dn, function(n) if (is.null(n)) list() else as.list(n))
    return(out)
  }
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
# Una función del alumno: su cuerpo se reescribe igual que el programa, y al entrar y al salir se
# fotografía su espacio de memoria (el marco). La última línea, si es una expresión, se deja sin paso
# propio: su valor es lo que la función devuelve, y eso lo cuenta el paso de salida.
es_funcion <- function(x) is.call(x) && identical(x[[1]], as.name("function"))
instrumenta <- function(fn, nombre, linea) {
  b <- fn[[3]]
  if (!(is.call(b) && identical(b[[1]], as.name("{")))) b <- call("{", b)
  refs <- attr(b, "srcref")
  partes <- list(as.name("{"), call(".entra", nombre, linea), quote(on.exit(.sale())))
  n <- length(b)
  for (j in seq_along(b)[-1]) {
    l <- if (!is.null(refs) && length(refs) >= j) refs[[j]][1] else linea
    x <- b[[j]]
    control <- is.call(x) && as.character(x[[1]])[1] %in% c("for", "while", "if", "repeat", "<-", "=", "<<-", "{", "return", "print", "cat", "message")
    partes[[length(partes) + 1]] <- if (j == n && !control) call("{", call(".va", l), x) else reescribe(x, l, 1)
  }
  fn[[3]] <- as.call(partes)
  fn
}

reescribe <- function(e, linea, nivel) {
  if (is.call(e)) {
    f <- as.character(e[[1]])[1]
    if (f %in% c("<-", "=") && length(e) == 3 && is.symbol(e[[2]]) && es_funcion(e[[3]]))
      e[[3]] <- instrumenta(e[[3]], as.character(e[[2]]), linea)
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
  # dentro de un bloque, la sentencia conserva su valor (lo necesita la última línea de una función)
  call("{", call(".va", linea), call("<-", as.name(".valor"), e), call(".paso", linea), as.name(".valor"))
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
  pila <- list()                             # las llamadas en curso: un marco por llamada
  nmarcos <- 0
  aqui <- function() if (length(pila)) pila[[length(pila)]]$env else env
  lee <- function(n, donde) tryCatch(describe(get(n, envir = donde)),
                                     error = function(err) list(t = "sin valor", r = "(todavía sin valor)"))
  foto <- function() {
    nombres <- setdiff(ls(env), ocultar)
    orden <<- c(orden, setdiff(nombres, orden))
    nombres <- intersect(orden, nombres)
    estado <- lapply(nombres, lee, donde = env)
    names(estado) <- nombres
    estado
  }
  foto_marcos <- function() lapply(seq_along(pila), function(k) {
    m <- pila[[k]]
    nombres <- ls(m$env)
    pila[[k]]$orden <<- c(m$orden, setdiff(nombres, m$orden))
    nombres <- intersect(pila[[k]]$orden, nombres)
    vars <- lapply(nombres, lee, donde = m$env)
    names(vars) <- nombres
    list(id = m$id, nombre = m$nombre, llamada = m$llamada, desde = m$desde, vars = vars)
  })
  anota <- function(paso) {
    if (length(pasos) >= LIMITE && paso$tipo != "error") stop("el programa da demasiados pasos (más de ", LIMITE, ")")
    paso$estado <- foto()
    if (length(pila)) paso$marcos <- foto_marcos()
    paso$salida <- lee_pantalla()
    paso$nfilas <- length(filas)
    if (length(avisos)) { paso$avisos <- as.list(avisos); avisos <<- character(0) }
    pasos[[length(pasos) + 1]] <<- paso
  }
  fila <- function() {
    donde <- aqui()
    filas[[length(filas) + 1]] <<- as.list(vapply(columnas, function(cx)
      tryCatch(corto(eval(str2lang(cx), donde)), error = function(err) ""), ""))
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
  ayudas$.entra <- function(nombre, l) {
    marco <- parent.frame()
    args <- names(formals(sys.function(sys.parent())))
    vals <- vapply(args, function(a) tryCatch(corto(get(a, envir = marco)), error = function(err) "?"), "")
    nmarcos <<- nmarcos + 1
    pila[[length(pila) + 1]] <<- list(id = nmarcos, nombre = nombre, env = marco, orden = args, desde = actual,
      llamada = paste0(nombre, "(", paste(if (length(args)) paste(args, "=", vals) else character(0), collapse = ", "), ")"))
    anota(list(linea = l, tipo = "llamada", funcion = nombre))
  }
  ayudas$.sale <- function() {
    v <- returnValue(SIN_VALOR)
    m <- pila[[length(pila)]]
    if (!identical(v, SIN_VALOR))
      anota(list(linea = actual, tipo = "devuelve", funcion = m$nombre, desde = m$desde, valor = corto(v)))
    pila[[length(pila)]] <<- NULL
    actual <<- m$desde
  }
  ayudas$.cond <- function(l, c, texto) {
    con_valores <- sustituye(str2lang(texto), aqui())
    r <- c
    anota(list(linea = l, tipo = "condicion", cond = list(texto = texto, valores = con_valores,
                                                          valor = if (isTRUE(r)) "TRUE" else "FALSE")))
    r
  }

  exprs <- parse(text = codigo, keep.source = TRUE)
  refs <- attr(exprs, "srcref")
  pasos[[1]] <- list(linea = NULL, tipo = "inicio", estado = setNames(list(), character(0)), salida = "", nfilas = 0)
  sink(pantalla)
  momento <- NULL                            # dónde estaba el programa al saltar el último error
  error <- tryCatch({
    withCallingHandlers({
      for (j in seq_along(exprs)) eval(reescribe(exprs[[j]], refs[[j]][1], 0), env)
      NULL
    }, warning = function(w) {
      avisos <<- c(avisos, conditionMessage(w))
      invokeRestart("muffleWarning")
    }, error = function(err) {
      # se ejecuta antes de deshacer las llamadas: así el error se ve dentro de la función, con su marco
      momento <<- list(linea = actual, estado = foto(), marcos = if (length(pila)) foto_marcos())
    })
  }, error = function(err) conditionMessage(err))
  sink()
  if (!is.null(error)) {
    paso <- list(linea = if (is.null(momento)) actual else momento$linea, tipo = "error", error = error,
                 estado = if (is.null(momento)) foto() else momento$estado, salida = lee_pantalla(), nfilas = length(filas))
    if (!is.null(momento$marcos)) paso$marcos <- momento$marcos
    if (length(avisos)) paso$avisos <- as.list(avisos)
    pasos[[length(pasos) + 1]] <- paso
  }
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
