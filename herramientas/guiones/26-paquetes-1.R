# Guion del capítulo 26, apartado 1: un paquete de principio a fin.
# Lo ejecuta herramientas/paquete.R en una carpeta temporal; BASE es esa carpeta y LIB, una biblioteca
# vacía donde se instala el paquete al final.

FUNCION <- c(
"#' Nota final ponderada",
"#'",
"#' Multiplica cada nota por su peso y suma los resultados.",
"#'",
"#' @param notas Un vector de notas, de 0 a 10.",
"#' @param pesos Un vector de pesos, tan largo como `notas`.",
"#' @return Un número: la nota final.",
"#' @export",
"#' @examples",
"#' nota_final(c(6, 8), c(0.4, 0.6))",
"nota_final <- function(notas, pesos) {",
"  if (length(notas) != length(pesos)) {",
"    stop(\"hay \", length(notas), \" notas y \", length(pesos), \" pesos\")",
"  }",
"  if (any(notas < 0 | notas > 10)) {",
"    warning(\"hay notas fuera de 0-10\")",
"  }",
"  sum(notas * pesos)",
"}")

PRUEBAS <- c(
'test_that("nota_final hace la media ponderada", {',
'  expect_equal(nota_final(c(6, 8), c(0.4, 0.6)), 7.2)',
'  expect_equal(nota_final(c(6, 7), c(0.3, 0.7)), 6.7)',
'})',
'',
'test_that("nota_final avisa y se para cuando debe", {',
'  expect_warning(nota_final(c(6, 11), c(0.4, 0.6)), "fuera de 0-10")',
'  expect_error(nota_final(c(6, 8), c(0.2, 0.3, 0.5)), "2 notas y 3 pesos")',
'})')

pasos <- list(
  list(orden = 'usethis::create_package("notas")', mostrar = "DESCRIPTION",
       nota = "`create_package()` crea la carpeta `notas/` con el esqueleto mínimo de un paquete: la carpeta `R/`, vacía, donde irá el código; el `DESCRIPTION`, la ficha del paquete (nombre, título, versión, autora, licencia); y el `NAMESPACE`, que dirá qué funciones ve quien use el paquete. La versión, `0.0.0.9000`, indica que está en desarrollo.",
       hacer = function() {
         usethis::create_package(file.path(BASE, "notas"), open = FALSE, rstudio = FALSE, fields = list(
           Title = "Notas Ponderadas", Description = "Calcula notas finales a partir de notas y pesos.",
           `Authors@R` = 'person("Ana", "García", email = "ana@example.com", role = c("aut", "cre"))'))
         PAQUETE <<- file.path(BASE, "notas"); setwd(PAQUETE); usethis::proj_set(PAQUETE)
         invisible()
       }),
  list(orden = 'usethis::use_mit_license("Ana García")', mostrar = "LICENSE", nota = "Todo paquete necesita una **licencia**, que dice qué puede hacer otra gente con él. `use_mit_license()` elige la MIT, muy permisiva: cualquiera puede usarlo y modificarlo si mantiene el aviso de autoría. Escribe el archivo `LICENSE` y apunta la licencia en el `DESCRIPTION`.",
       hacer = function() invisible(usethis::use_mit_license("Ana García"))),
  list(orden = 'usethis::use_r("nota_final")', mostrar = "R/nota_final.R", nota = "`use_r(\"nota_final\")` crea el archivo `R/nota_final.R`, vacío. El código de un paquete vive en archivos `.R` dentro de `R/`, uno por tema, y no se ejecuta como un guion: cada archivo define funciones.",
       hacer = function() invisible(usethis::use_r("nota_final", open = FALSE))),
  list(orden = "# escribes la función, con su documentación, en R/nota_final.R", mostrar = "R/nota_final.R", nota = "Escribimos la función del capítulo 24 y, encima, su **documentación**: las líneas que empiezan por `#'` son comentarios especiales de roxygen2. `@param` describe cada argumento; `@return`, lo que devuelve; `@examples`, un ejemplo; y `@export` dice que la función es para quien use el paquete.",
       hacer = function() writeLines(FUNCION, "R/nota_final.R")),
  list(orden = 'devtools::load_all()\nnota_final(c(6, 8), c(0.4, 0.6))', mostrar = NULL, nota = "`load_all()` carga el paquete tal como está, sin instalarlo, para probarlo mientras se escribe: es como hacer `source()` de todos los archivos de `R/`, pero dentro del espacio del paquete. `nota_final()` ya funciona: 7.2.",
       hacer = function() { devtools::load_all(quiet = FALSE); print(nota_final(c(6, 8), c(0.4, 0.6))); invisible() }),
  list(orden = "devtools::document()", mostrar = "NAMESPACE", nota = "`document()` lee los comentarios `#'` y escribe dos cosas. La página de ayuda, `man/nota_final.Rd`, en el formato que entiende R. Y el `NAMESPACE`, que ahora dice `export(nota_final)`: esa es la función que verá quien cargue el paquete. Esos dos archivos no se tocan a mano; se regeneran con `document()` cada vez que cambian los comentarios.",
       hacer = function() invisible(devtools::document())),
  list(orden = "usethis::use_testthat(3)", mostrar = "tests/testthat.R", nota = "`use_testthat(3)` prepara las pruebas: crea `tests/testthat/`, donde irán, y `tests/testthat.R`, que las pone en marcha durante la comprobación del paquete. También apunta testthat en el `DESCRIPTION`, en `Suggests`: hace falta para probar el paquete, no para usarlo.",
       hacer = function() invisible(usethis::use_testthat(3))),
  list(orden = 'usethis::use_test("nota_final")\n# escribes las pruebas del capítulo 24', mostrar = "tests/testthat/test-nota_final.R", nota = "`use_test(\"nota_final\")` crea el archivo de pruebas de `nota_final.R`, con un ejemplo que hay que cambiar. Ponemos en él las dos pruebas del capítulo 24, con sus cuatro comprobaciones. Cada archivo de `R/` tiene su archivo de pruebas con el mismo nombre.",
       hacer = function() { usethis::use_test("nota_final", open = FALSE); writeLines(PRUEBAS, "tests/testthat/test-nota_final.R"); invisible() }),
  list(orden = "devtools::test()", mostrar = NULL, nota = "`test()` carga el paquete y pasa todas las pruebas de `tests/testthat/`. Las cuatro comprobaciones pasan: `[ FAIL 0 | WARN 0 | SKIP 0 | PASS 4 ]`. Esta es la orden que se repite cada vez que se cambia algo.",
       hacer = function() invisible(devtools::test())),
  list(orden = "devtools::check()", mostrar = NULL, nota = "`check()` es la revisión completa, la que pide CRAN, el gran almacén de paquetes de R: construye el paquete, comprueba que el `DESCRIPTION` está bien, que cada función exportada tiene su ayuda, que los ejemplos funcionan y que las pruebas pasan. Son decenas de comprobaciones. Resultado: 0 errores, 0 avisos y 0 notas.",
       hacer = function() { r <- devtools::check(manual = FALSE, quiet = TRUE, error_on = "never"); print(r); invisible() }),
  list(orden = 'devtools::install()\nlibrary(notas)\nnota_final(c(6, 8), c(0.4, 0.6))\n?nota_final', mostrar = "man/nota_final.Rd", rotulo = "La ayuda: ?nota_final", nota = "`install()` instala el paquete en la biblioteca de R, como si fuera dplyr. Desde ahora, en cualquier proyecto, `library(notas)` lo carga y `nota_final()` funciona, sin copiar nada. Y `?nota_final` abre la página de ayuda que roxygen2 escribió a partir de los comentarios.",
       hacer = function() {
         devtools::install(quiet = TRUE, upgrade = "never", dependencies = FALSE)
         cat("✔ notas instalado\n")
         try(pkgload::unload("notas"), silent = TRUE)
         library(notas, lib.loc = LIB)
         print(nota_final(c(6, 8), c(0.4, 0.6)))
         invisible()
       },
       texto_mostrar = function() {
         t <- capture.output(tools::Rd2txt(file.path(PAQUETE, "man", "nota_final.Rd"), options = list(underline_titles = FALSE)))
         paste(gsub("_\b", "", t), collapse = "\n")
       })
)
PAQUETE <- NULL
