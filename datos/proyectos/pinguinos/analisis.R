# El análisis entero, de los datos crudos a la tabla limpia y al informe.
# Se ejecuta desde la carpeta del proyecto.
library(dplyr)
source("R/limpiar.R")
source("R/diferencia_sexos.R")

crudo <- read.csv("datos/pinguinos_crudo.csv", check.names = FALSE)
pinguinos <- limpiar_pinguinos(crudo)
write.csv(pinguinos, "datos/pinguinos.csv", row.names = FALSE, na = "NA")

testthat::test_dir("tests")

for (sp in c("Adelia", "Barbijo", "Papúa")) {
  quarto::quarto_render("informe.qmd", execute_params = list(especie = sp),
                        output_file = paste0("informe-", sp, ".html"))
}
