# Compara la masa de machos y hembras de una especie: las dos medias, su diferencia
# y el valor p de la prueba t de Welch (capítulo 18).
diferencia_sexos <- function(datos, sp) {
  d <- datos[datos$especie == sp & !is.na(datos$sexo) & !is.na(datos$masa_corporal_g), ]
  if (nrow(d) == 0) stop("no hay pingüinos de la especie ", sp)
  medias <- tapply(d$masa_corporal_g, d$sexo, mean)
  prueba <- t.test(masa_corporal_g ~ sexo, data = d)
  list(especie = sp,
       machos = unname(medias["macho"]),
       hembras = unname(medias["hembra"]),
       diferencia = unname(medias["macho"] - medias["hembra"]),
       p = prueba$p.value)
}
