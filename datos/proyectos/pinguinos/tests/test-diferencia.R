source("../R/diferencia_sexos.R")

test_that("diferencia_sexos compara machos y hembras", {
  pinguinos <- read.csv("../datos/pinguinos.csv")
  d <- diferencia_sexos(pinguinos, "Adelia")
  expect_equal(d$diferencia, d$machos - d$hembras)
  expect_gt(d$diferencia, 0)
  expect_lt(d$p, 0.05)
})

test_that("diferencia_sexos se para con una especie que no existe", {
  pinguinos <- read.csv("../datos/pinguinos.csv")
  expect_error(diferencia_sexos(pinguinos, "Emperador"), "no hay pingüinos")
})
