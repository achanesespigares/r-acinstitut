# Convierte los datos crudos de la estación Palmer en la tabla limpia:
# columnas en español, especies y sexo traducidos, y el año en lugar de la fecha.
limpiar_pinguinos <- function(crudo) {
  crudo |>
    rename(isla = Island, largo_pico_mm = `Culmen Length (mm)`,
           alto_pico_mm = `Culmen Depth (mm)`, largo_aleta_mm = `Flipper Length (mm)`,
           masa_corporal_g = `Body Mass (g)`) |>
    mutate(especie = case_when(startsWith(Species, "Adelie") ~ "Adelia",
                               startsWith(Species, "Chinstrap") ~ "Barbijo",
                               startsWith(Species, "Gentoo") ~ "Papúa"),
           sexo = case_when(Sex == "MALE" ~ "macho", Sex == "FEMALE" ~ "hembra"),
           anio = as.integer(substr(`Date Egg`, 1, 4))) |>
    select(especie, isla, largo_pico_mm, alto_pico_mm, largo_aleta_mm,
           masa_corporal_g, sexo, anio)
}
