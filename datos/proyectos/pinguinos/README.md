# Proyecto 1 · Machos y hembras

Un análisis completo con R, de los datos crudos a un informe, del libro
*Mirar y ver tu código pensar · Entendiendo R, desde dentro* (AC Institut).

La pregunta: ¿pesan lo mismo los machos y las hembras de cada especie de pingüino?

## Qué hay en la carpeta

- `datos/pinguinos_crudo.csv`: los datos originales de la estación Palmer (Gorman, Williams y Fraser, 2014; paquete palmerpenguins, licencia CC0), tal como se publicaron.
- `datos/pinguinos.csv`: la tabla limpia, la que escribe `analisis.R`.
- `R/limpiar.R`: la función `limpiar_pinguinos()`, que pasa de los datos crudos a la tabla limpia.
- `R/diferencia_sexos.R`: la función `diferencia_sexos()`, que compara machos y hembras de una especie.
- `tests/`: las pruebas de las dos funciones (testthat).
- `informe.qmd`: el informe de Quarto, con un parámetro, la especie.
- `analisis.R`: todo el análisis de una vez: limpia, prueba y genera un informe por especie.

## Cómo se usa

Abre R en esta carpeta (o el proyecto en RStudio) y ejecuta `source("analisis.R")`.
Hacen falta los paquetes dplyr, ggplot2, testthat y quarto, y el programa Quarto.
