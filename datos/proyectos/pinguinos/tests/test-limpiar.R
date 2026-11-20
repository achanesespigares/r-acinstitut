source("../R/limpiar.R")

test_that("limpiar_pinguinos conserva las filas y traduce las categorías", {
  crudo <- read.csv("../datos/pinguinos_crudo.csv", check.names = FALSE)
  limpio <- limpiar_pinguinos(crudo)
  expect_equal(nrow(limpio), nrow(crudo))
  expect_setequal(unique(limpio$especie), c("Adelia", "Barbijo", "Papúa"))
  expect_setequal(unique(limpio$sexo), c("macho", "hembra", NA))
  expect_true(all(limpio$anio %in% 2007:2009))
})
