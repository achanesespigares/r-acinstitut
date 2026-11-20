# Guion del proyecto 2: el paquete notas se convierte en una herramienta para el aula.
# Parte del paquete del capítulo 26 (que se monta de una vez en el primer paso) y le añade
# nota_necesaria(), escribiendo las pruebas antes que la función, una app de Shiny y una viñeta.

sys.source(file.path(RAIZ, "herramientas", "guiones", "26-paquetes-1.R"), envir = environment())
p1 <- pasos

PRUEBAS_NN <- c(
'test_that("nota_necesaria calcula lo que falta", {',
'  expect_equal(nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4)), 5)',
'  expect_equal(nota_necesaria(c(3, 2), c(0.3, 0.3, 0.4)), 8.75)',
'  expect_equal(nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4), objetivo = 7), 10)',
'})',
'',
'test_that("nota_necesaria no baja de 0 y puede pasar de 10", {',
'  expect_equal(nota_necesaria(c(9, 8), c(0.3, 0.3, 0.4)), 0)',
'  expect_gt(nota_necesaria(c(2, 1), c(0.3, 0.3, 0.4)), 10)',
'})',
'',
'test_that("nota_necesaria se para si faltan o sobran pesos", {',
'  expect_error(nota_necesaria(c(6, 4), c(0.5, 0.5)), "un peso más")',
'  expect_error(nota_necesaria(c(6, 4), c(0.3, 0.3, 0.3)), "no 1")',
'})')

FUNCION_NN <- c(
"#' Nota necesaria en el último examen",
"#'",
"#' Calcula qué nota hace falta en el último examen para llegar a una nota final.",
"#'",
"#' @param notas Las notas de los exámenes ya hechos.",
"#' @param pesos Los pesos de todos los exámenes: uno más que `notas`, el del último.",
"#' @param objetivo La nota final a la que se quiere llegar. Por defecto, 5.",
"#' @return La nota necesaria. Si es 0, ya se ha llegado; si pasa de 10, no se puede llegar.",
"#' @export",
"#' @examples",
"#' nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4))",
"nota_necesaria <- function(notas, pesos, objetivo = 5) {",
"  if (length(pesos) != length(notas) + 1) {",
"    stop(\"tiene que haber un peso más que notas: el del último examen\")",
"  }",
"  if (abs(sum(pesos) - 1) > 1e-8) {",
"    stop(\"los pesos suman \", sum(pesos), \", no 1\")",
"  }",
"  hecho <- sum(notas * pesos[seq_along(notas)])",
"  falta <- (objetivo - hecho) / pesos[length(pesos)]",
"  max(falta, 0)",
"}")

APP <- c(
"#' Calculadora de notas",
"#'",
"#' Abre una app de Shiny para calcular qué nota hace falta en el último examen.",
"#'",
"#' @export",
"calculadora <- function() {",
"  ui <- shiny::fluidPage(",
"    shiny::titlePanel(\"¿Qué nota necesito?\"),",
"    shiny::sliderInput(\"examen1\", \"Primer examen (30 %)\", min = 0, max = 10, value = 6, step = 0.5),",
"    shiny::sliderInput(\"examen2\", \"Segundo examen (30 %)\", min = 0, max = 10, value = 4, step = 0.5),",
"    shiny::sliderInput(\"objetivo\", \"Nota final que quiero\", min = 5, max = 10, value = 5, step = 0.5),",
"    shiny::textOutput(\"necesito\"),",
"    shiny::textOutput(\"consejo\")",
"  )",
"  server <- function(input, output, session) {",
"    falta <- shiny::reactive({",
"      nota_necesaria(c(input$examen1, input$examen2), c(0.3, 0.3, 0.4), input$objetivo)",
"    })",
"    output$necesito <- shiny::renderText({",
"      paste(\"En el último examen (40 %) necesitas un\", round(falta(), 2))",
"    })",
"    output$consejo <- shiny::renderText({",
"      if (falta() > 10) \"Ni con un 10: este trimestre no llega.\"",
"      else if (falta() == 0) \"Ya lo tienes, pase lo que pase.\"",
"      else \"Se puede.\"",
"    })",
"  }",
"  shiny::shinyApp(ui, server)",
"}")

VINETA <- c(
"---",
"title: \"Calcular notas con notas\"",
"output: rmarkdown::html_vignette",
"vignette: >",
"  %\\VignetteIndexEntry{Calcular notas con notas}",
"  %\\VignetteEngine{knitr::rmarkdown}",
"  %\\VignetteEncoding{UTF-8}",
"---",
"",
"```{r, include = FALSE}",
"knitr::opts_chunk$set(collapse = TRUE, comment = \"#>\")",
"```",
"",
"El paquete notas hace dos cuentas que todo estudiante hace alguna vez.",
"",
"```{r}",
"library(notas)",
"```",
"",
"La nota final de una asignatura, a partir de las notas y sus pesos:",
"",
"```{r}",
"nota_final(c(6, 4, 5), c(0.3, 0.3, 0.4))",
"```",
"",
"Y qué nota hace falta en el último examen para aprobar, o para llegar a otra nota:",
"",
"```{r}",
"nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4))",
"nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4), objetivo = 7)",
"```",
"",
"Para no escribir código, `calculadora()` abre una app con deslizadores.")

# R CMD check pide que el código (no los comentarios) sea ASCII: los caracteres como «ú» o «¿»,
# dentro de los textos, se escriben con su código, \\u00fa o \\u00bf
ascii <- function(x) {
  x <- gsub("\u00fa", "\\u00fa", x, fixed = TRUE); x <- gsub("\u00bf", "\\u00bf", x, fixed = TRUE)
  x <- gsub("\u00e1", "\\u00e1", x, fixed = TRUE)
  gsub("\u00e9", "\\u00e9", x, fixed = TRUE)
}
codigo_ascii <- function(lineas) ifelse(grepl("^#'", lineas), lineas, ascii(lineas))

pasos <- list(
  list(orden = "# el paquete notas del capítulo 26: nota_final(), su ayuda y sus pruebas", mostrar = NULL,
       nota = "Partimos del paquete `notas` del capítulo 26, terminado: `nota_final()`, su documentación y sus pruebas.",
       hacer = function() { invisible(capture.output(for (k in c(1:4, 6:8)) suppressMessages(p1[[k]]$hacer()))) }),
  list(orden = 'usethis::use_test("nota_necesaria")\n# escribes las pruebas ANTES que la función', mostrar = "tests/testthat/test-nota_necesaria.R",
       nota = "Esta vez escribimos las **pruebas antes que la función**. Dicen lo que tiene que hacer `nota_necesaria()`: con un 6 y un 4 en los dos primeros exámenes (30 % cada uno), para aprobar hace falta un 5 en el último (40 %); con un 3 y un 2, un 8.75; si ya se ha llegado, 0; si no se puede llegar, más de 10; y si los pesos no cuadran, un error.",
       hacer = function() { usethis::use_test("nota_necesaria", open = FALSE); writeLines(PRUEBAS_NN, "tests/testthat/test-nota_necesaria.R"); invisible() }),
  list(orden = "devtools::test()", mostrar = NULL, nota = "Las pruebas nuevas fallan las tres: `could not find function \"nota_necesaria\"`, porque la función todavía no existe. Es lo esperado. Las de `nota_final()` siguen pasando: el paquete no se ha roto. Ahora sabemos exactamente qué hay que escribir para que todo esté en verde.",
       hacer = function() { r <- devtools::test(stop_on_failure = FALSE); invisible() }),
  list(orden = 'usethis::use_r("nota_necesaria")\n# escribes la función, con su ayuda', mostrar = "R/nota_necesaria.R", nota = "`nota_necesaria()` comprueba primero los datos (un peso más que notas, y que sumen 1), calcula lo que ya se tiene, `hecho`, y despeja la nota del último examen: lo que falta hasta el objetivo, dividido entre el peso del último. Si ya se ha llegado, el resultado sería negativo, y `max(falta, 0)` lo deja en 0.",
       hacer = function() { usethis::use_r("nota_necesaria", open = FALSE); writeLines(FUNCION_NN, "R/nota_necesaria.R"); invisible() }),
  list(orden = "devtools::test()", mostrar = NULL, nota = "Ahora pasan las once comprobaciones: las cuatro de `nota_final()` y las siete nuevas. Escribir las pruebas primero tiene una ventaja: obliga a pensar qué debe hacer la función, casos raros incluidos, antes de pensar cómo.",
       hacer = function() { devtools::test(); invisible() }),
  list(orden = 'usethis::use_package("shiny")\nusethis::use_r("calculadora")\n# escribes la app', mostrar = "R/calculadora.R", nota = "La app de Shiny va dentro del paquete, en una función: `calculadora()` construye la interfaz y el servidor y devuelve la app. Como usa Shiny, `use_package(\"shiny\")` lo añade a `Imports` en el `DESCRIPTION`, y en el código cada función de Shiny se escribe con `shiny::`. La app llama a `nota_necesaria()`, la del propio paquete.",
       hacer = function() { usethis::use_package("shiny"); usethis::use_r("calculadora", open = FALSE); writeLines(APP, "R/calculadora.R"); invisible() }),
  list(orden = 'usethis::use_vignette("notas")\n# escribes la viñeta', mostrar = "vignettes/notas.Rmd", nota = "La **viñeta** cuenta cómo se usa el paquete entero, con ejemplos que se ejecutan al construirla. `use_vignette()` la crea y apunta en el `DESCRIPTION` lo que hace falta para construirla, knitr y rmarkdown.",
       hacer = function() { usethis::use_vignette("notas", "Calcular notas con notas"); writeLines(VINETA, "vignettes/notas.Rmd"); invisible() }),
  list(orden = "devtools::document()\ndevtools::check()", mostrar = NULL, nota = "`check()` da un **aviso**: el código tiene caracteres que no son ASCII, la «ú» de «último», la «á» de «más», la «¿» del título de la app. Un paquete tiene que funcionar en cualquier ordenador, también en los que no usan la misma codificación de caracteres, y por eso CRAN exige que el código sea ASCII. Los comentarios, como la documentación `#'`, sí pueden llevar tildes.",
       hacer = function() { suppressMessages(devtools::document()); r <- devtools::check(manual = FALSE, quiet = TRUE, error_on = "never"); print(r); invisible() }),
  list(orden = "# cambias «á», «é», «ú» y «¿» de los textos del código por \\u00e1, \\u00e9, \\u00fa y \\u00bf\ndevtools::check()", mostrar = "R/calculadora.R", nota = "Dentro de los textos del código, cada carácter no ASCII se escribe con su código: `\\u00fa` es la «ú», `\\u00e1` la «á», `\\u00e9` la «é» y `\\u00bf` la «¿». R los convierte al leer el código, así que la app enseña «¿Qué nota necesito?» igual que antes. Ahora `check()` da 0 errores, 0 avisos y 0 notas.",
       hacer = function() {
         writeLines(codigo_ascii(APP), "R/calculadora.R"); writeLines(codigo_ascii(FUNCION_NN), "R/nota_necesaria.R")
         r <- devtools::check(manual = FALSE, quiet = TRUE, error_on = "never"); print(r); invisible()
       }),
  list(orden = 'devtools::install(build_vignettes = TRUE)\nlibrary(notas)\nnota_necesaria(c(6, 4), c(0.3, 0.3, 0.4))\nnota_necesaria(c(2, 1), c(0.3, 0.3, 0.4))\n# calculadora() abre la app', mostrar = NULL, nota = "Instalado, con la viñeta construida: `nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4))` da 5, y con un 2 y un 1, 10.25, más de 10: ese trimestre ya no se puede aprobar. `vignette(\"notas\")` abre la viñeta y `calculadora()`, la app.",
       hacer = function() {
         devtools::install(quiet = TRUE, upgrade = "never", dependencies = FALSE, build_vignettes = TRUE)
         try(pkgload::unload("notas"), silent = TRUE)
         library(notas, lib.loc = LIB)
         cat("✔ notas instalado, con su viñeta\n")
         print(nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4)))
         print(nota_necesaria(c(2, 1), c(0.3, 0.3, 0.4)))
         invisible()
       })
)
PAQUETE <- NULL
