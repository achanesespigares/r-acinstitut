# Guion del capítulo 26, apartado «A fondo»: funciones internas, versiones y cobertura de las pruebas.
# Parte del paquete del apartado 1, que se monta de una vez en el primer paso.

sys.source(file.path(RAIZ, "herramientas", "guiones", "26-paquetes-1.R"), envir = environment())
p1 <- pasos

FUNCION2 <- c(FUNCION[1:14], "  comprueba_pesos(pesos)", FUNCION[15:length(FUNCION)])
AYUDANTE <- c(
"# Comprueba que los pesos suman 1. Es una función interna: no se exporta.",
"#' @noRd",
"comprueba_pesos <- function(pesos) {",
"  if (abs(sum(pesos) - 1) > 1e-8) {",
"    stop(\"los pesos suman \", sum(pesos), \", no 1\")",
"  }",
"  invisible(TRUE)",
"}")

pasos <- list(
  list(orden = "# el paquete del apartado 1: función, documentación y pruebas", mostrar = NULL, rotulo = NULL,
       nota = "Partimos del paquete del apartado 1, ya terminado: `nota_final()`, su documentación y sus cuatro pruebas.",
       hacer = function() {
         invisible(capture.output(for (k in c(1:4, 6:8)) suppressMessages(p1[[k]]$hacer())))
         invisible()
       }),
  list(orden = "# añades R/utils.R, con una función interna,\n# y nota_final() la llama", mostrar = "R/utils.R",
       nota = "Una función **interna**: `comprueba_pesos()` ayuda a `nota_final()`, pero no es para quien use el paquete. Su documentación lleva `@noRd` y no lleva `@export`. En `R/nota_final.R`, `nota_final()` la llama después de comprobar las longitudes.",
       hacer = function() { writeLines(AYUDANTE, "R/utils.R"); writeLines(FUNCION2, "R/nota_final.R"); invisible() }),
  list(orden = "devtools::document()", mostrar = "NAMESPACE",
       nota = "`document()` vuelve a leer los comentarios. El `NAMESPACE` no cambia: sigue exportando solo `nota_final()`. Y `@noRd` evita que `comprueba_pesos()` tenga página de ayuda.",
       hacer = function() invisible(devtools::document())),
  list(orden = 'usethis::use_news_md()\nusethis::use_version("minor")', mostrar = "DESCRIPTION",
       nota = "Antes de compartir el paquete, se le pone **versión** y se apuntan los cambios. `use_news_md()` crea `NEWS.md`, el diario de cambios, y `use_version(\"minor\")` sube la versión de `0.0.0.9000` a `0.1.0`. Las versiones tienen tres números: el primero cambia cuando algo deja de funcionar como antes; el segundo, cuando se añade algo nuevo; el tercero, cuando se arregla un fallo.",
       hacer = function() { usethis::use_news_md(open = FALSE); usethis::use_version("minor", push = FALSE); invisible() }),
  list(orden = 'devtools::install()\nlibrary(notas)\nnota_final(c(6, 8), c(0.5, 0.6))\ncomprueba_pesos(c(0.5, 0.6))\nnotas:::comprueba_pesos(c(0.5, 0.6))', mostrar = NULL,
       nota = "Instalado el paquete, `nota_final()` con pesos que suman 1.1 se para: el error lo lanza `comprueba_pesos(pesos)`, que trabaja por dentro. Pero `comprueba_pesos()` no se puede llamar directamente: no está exportada, y R no la encuentra. Con tres puntos, `notas:::comprueba_pesos()`, se llega a ella igualmente: sirve para investigar, pero no para usarla en un programa, porque una función interna puede cambiar sin aviso.",
       hacer = function() {
         devtools::install(quiet = TRUE, upgrade = "never", dependencies = FALSE)
         try(pkgload::unload("notas"), silent = TRUE)
         library(notas, lib.loc = LIB)
         # cada orden, como en la consola: el error, con la llamada que guarda (la escribe R, no nosotros)
         consola <- function(txt) {
           cat(">", txt, "\n")
           tryCatch(print(eval(str2lang(txt), globalenv())), error = function(e)
             cat("Error in ", paste(deparse(conditionCall(e)), collapse = " "), " : ", conditionMessage(e), "\n", sep = ""))
         }
         consola("nota_final(c(6, 8), c(0.5, 0.6))")
         consola("comprueba_pesos(c(0.5, 0.6))")
         consola("notas:::comprueba_pesos(c(0.5, 0.6))")
         invisible()
       }),
  list(orden = "covr::package_coverage()", mostrar = "R/utils.R", resaltar = 5,
       nota = "`package_coverage()`, del paquete covr, pasa las pruebas y apunta qué líneas del código se han ejecutado. `nota_final.R` está cubierto al 100 %, pero `utils.R`, solo al 66.67 %: la línea 5, el `stop()` de los pesos que no suman 1, no la ejecuta ninguna prueba. Es justo el sitio donde podría esconderse un error que nadie ha buscado. Falta una prueba como `expect_error(nota_final(c(6, 8), c(0.5, 0.6)), \"no 1\")`.",
       hacer = function() {
         cob <- covr::package_coverage(PAQUETE, quiet = TRUE)
         print(cob)
         z <- covr::zero_coverage(cob)
         cat("\nLíneas que ninguna prueba ejecuta:\n")
         for (k in seq_len(nrow(z))) cat("  ", z$filename[k], ", línea ", z$line[k], "\n", sep = "")
         invisible()
       })
)
PAQUETE <- NULL
