---
title: "Proyecto 1 · Machos y hembras"
subtitle: Un análisis de principio a fin, de los datos crudos al informe
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Desde el capítulo 12 trabajamos con `pinguinos.csv`, una tabla limpia y ordenada: columnas en español, una fila por pingüino, el sexo escrito como «macho» o «hembra». Pero los datos no nacieron así. Los midieron entre 2007 y 2009 Kristen Gorman y su equipo en la estación Palmer, en la Antártida, y los publicaron en una hoja enorme, en inglés, con diecisiete columnas, nombres como `Culmen Length (mm)` y casillas vacías. Alguien tuvo que limpiarlos. En este proyecto lo hacemos nosotros, y seguimos hasta el final: una pregunta, una respuesta y un informe que se escribe solo.

## La pregunta

¿Pesan lo mismo los machos y las hembras de cada especie? Y si no, ¿cuánto más pesan unos que otros, y es una diferencia real o fruto del azar? Para responder hay que juntar casi todo el libro: leer datos, limpiarlos, comprobar que la limpieza está bien, resumir, dibujar, hacer una prueba estadística y contarlo.

## El plan

Un análisis de verdad se organiza en una **carpeta de proyecto**, con un sitio para cada cosa:

```text
pinguinos/
├─ datos/
│  ├─ pinguinos_crudo.csv   los datos tal como se publicaron
│  └─ pinguinos.csv         la tabla limpia (la escribe el análisis)
├─ R/
│  ├─ limpiar.R             limpiar_pinguinos()
│  └─ diferencia_sexos.R    diferencia_sexos()
├─ tests/                   las pruebas de las dos funciones
├─ informe.qmd              el informe, con un parámetro: la especie
└─ analisis.R               todo de una vez
```

Y se avanza en seis etapas, cada una con lo que aprendimos en un capítulo: **mirar** los datos crudos (capítulo 12), **limpiarlos** con dplyr (capítulo 13), **comprobar** la limpieza con pruebas (capítulo 24), **explorar** con resúmenes y gráficos (capítulos 13 y 15), **responder** con una prueba estadística (capítulo 18) y **contarlo** en un informe de Quarto (capítulo 25).

:::{important} Los datos crudos no se tocan
El archivo original no se edita nunca, ni a mano ni desde R. Toda la limpieza está escrita en código, que lee el crudo y escribe un archivo nuevo. Así cualquiera puede repetir el análisis desde el principio, comprobar cada decisión y, si aparece un error, corregirlo y volver a generarlo todo.
:::

La carpeta entera se puede descargar: [pinguinos.zip](https://achanesespigares.github.io/r-acinstitut/datos/proyectos/pinguinos.zip). Los programas de este capítulo se ejecutan desde ella.

## Construcción

### 1 · Mirar los datos crudos

Antes de cambiar nada, hay que saber qué hay. El archivo tiene nombres de columnas con espacios y paréntesis; `check.names = FALSE` le dice a `read.csv()` que los deje tal cual, en lugar de convertirlos en `Culmen.Length..mm.`.

:::{tip} Predice
La columna `Sex` tiene 344 casillas: 165 dicen `FEMALE` y 168, `MALE`. ¿Qué hay en las otras 11? ¿Y cómo crees que aparecen en `table()`?
:::

```{code-cell} r
crudo <- read.csv("datos/pinguinos_crudo.csv", check.names = FALSE)
dim(crudo)
crudo$Species[c(1, 153, 277)]
table(crudo$Sex)
crudo$`Date Egg`[1:3]
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Mirar antes de tocar","etiqueta":"datos crudos","idea":"344 pingüinos y 17 columnas. Las especies vienen con su nombre en inglés y en latín, el sexo en mayúsculas y la fecha completa del primer huevo. Y 11 casillas del sexo están vacías: read.csv() las lee como textos vacíos, \"\", no como NA."},"archivo":"datos/trazas/28-proyecto-pinguinos-1.json"}
```

Cuatro cosas que habrá que arreglar:

- **Los nombres de las columnas**, en inglés y con unidades entre paréntesis. En el código hay que escribirlos entre comillas invertidas: `` crudo$`Date Egg` ``.
- **Las especies**, con su nombre largo: «Adelie Penguin (Pygoscelis adeliae)». Queremos «Adelia», «Barbijo» y «Papúa».
- **El sexo**, en mayúsculas y en inglés, con 11 casillas vacías. `table()` las cuenta en una columna sin nombre: `read.csv()` lee una casilla vacía de una columna de texto como `""`, un texto vacío, no como `NA`. Es un detalle que conviene descubrir ahora y no en mitad del análisis.
- **La fecha** del primer huevo, cuando solo nos interesa el año.

Además, hay columnas que no vamos a usar: el código de cada nido, los isótopos de la sangre, los comentarios de campo. Se quedan en el archivo crudo, por si otro análisis las necesita.

### 2 · Limpiar

La limpieza es una tubería de tres pasos: cambiar los nombres de las columnas con `rename()`, crear las columnas nuevas con `mutate()` y quedarse con las que interesan, en orden, con `select()`.

```{code-cell} r
library(dplyr)
crudo <- read.csv("datos/pinguinos_crudo.csv", check.names = FALSE)
pinguinos <- crudo |>
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
all.equal(pinguinos, read.csv("datos/pinguinos.csv"))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"De 17 columnas a 8","etiqueta":"limpieza","idea":"La tabla cruda entra en la tubería y sale limpia: rename() cambia cinco nombres, mutate() crea especie, sexo y anio, y select() se queda con ocho columnas. Al final, all.equal() la compara con la tabla del libro: son iguales."},"archivo":"datos/trazas/28-proyecto-pinguinos-2.json"}
```

- `case_when()` traduce por casos: si el nombre de la especie empieza por «Adelie», «Adelia»; si empieza por «Chinstrap», «Barbijo»; si por «Gentoo», «Papúa». Para el sexo, lo mismo. Las casillas vacías no cumplen ningún caso, y `case_when()` les pone `NA`: el problema del apartado anterior se arregla solo.
- `substr(`` `Date Egg` ``, 1, 4)` toma los cuatro primeros caracteres de la fecha, el año, y `as.integer()` lo convierte en número.
- `all.equal()` compara el resultado con `pinguinos.csv`, la tabla que usamos desde el capítulo 12, y responde `TRUE`. Y no solo se parecen: guardada con `write.csv()`, nuestra tabla es idéntica, byte a byte, a la del libro. Ya sabemos de dónde salió.

Esa tubería, metida en una función, es `limpiar_pinguinos()`, en `R/limpiar.R`: recibe la tabla cruda y devuelve la limpia. Una función se puede probar, y se puede volver a usar si un día llegan datos nuevos de otra temporada.

### 3 · Comprobar la limpieza

Que la tabla limpia coincida con la del libro es una comprobación excelente, pero solo la tenemos porque alguien ya la limpió antes. En un proyecto nuevo no hay con qué comparar: hay que decir qué tiene que cumplir el resultado. Son las pruebas del capítulo 24, en `tests/test-limpiar.R`:

```r
test_that("limpiar_pinguinos conserva las filas y traduce las categorías", {
  crudo <- read.csv("../datos/pinguinos_crudo.csv", check.names = FALSE)
  limpio <- limpiar_pinguinos(crudo)
  expect_equal(nrow(limpio), nrow(crudo))
  expect_setequal(unique(limpio$especie), c("Adelia", "Barbijo", "Papúa"))
  expect_setequal(unique(limpio$sexo), c("macho", "hembra", NA))
  expect_true(all(limpio$anio %in% 2007:2009))
})
```

Cada comprobación vigila un error típico de limpieza: perder filas por el camino, dejar una especie sin traducir (que saldría como `NA`), que aparezca una categoría rara en el sexo o un año imposible. `expect_setequal()` compara conjuntos: da igual el orden y las repeticiones. Las pruebas viven en la carpeta `tests/`, por eso las rutas empiezan por `../`; `testthat::test_dir("tests")` las pasa todas, y con las de `diferencia_sexos()` dan `[ FAIL 0 | WARN 0 | SKIP 0 | PASS 8 ]`.

### 4 · Explorar

Con la tabla limpia, la primera mirada: la masa media de cada especie y sexo, y un gráfico.

```{code-cell} r
library(dplyr)
library(ggplot2)
pinguinos <- read.csv("datos/pinguinos.csv")
con_sexo <- filter(pinguinos, !is.na(sexo))
con_sexo |>
  group_by(especie, sexo) |>
  summarise(masa = mean(masa_corporal_g), n = n(), .groups = "drop")
ggplot(con_sexo, aes(especie, masa_corporal_g, fill = sexo)) +
  geom_boxplot() +
  labs(x = NULL, y = "Masa (g)", fill = "Sexo")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Seis medias y un gráfico","etiqueta":"exploración","idea":"La tubería agrupa por especie y sexo y calcula seis medias. El gráfico pone, para cada especie, la caja de las hembras y la de los machos lado a lado: en las tres, la de los machos está más arriba."},"archivo":"datos/trazas/28-proyecto-pinguinos-3.json"}
```

Quitamos los 11 pingüinos sin sexo, porque no sirven para comparar machos y hembras. En las tres especies, los machos pesan más: unos 4043 g frente a 3369 g en las adelias, 3939 g frente a 3527 g en las barbijo y 5485 g frente a 4680 g en las papúa. El gráfico lo confirma, y enseña algo más: las cajas de machos y hembras apenas se solapan.

### 5 · Responder

Las medias dicen que hay diferencia en estos pingüinos. La pregunta estadística es si esa diferencia podría deberse al azar de qué pingüinos se midieron. La prueba t del capítulo 18 lo responde. Lo escribimos como una función, `diferencia_sexos()`, para usarla con cada especie:

```{code-cell} r
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
pinguinos <- read.csv("datos/pinguinos.csv")
adelia <- diferencia_sexos(pinguinos, "Adelia")
adelia$diferencia
adelia$p < 0.001
diferencia_sexos(pinguinos, "Emperador")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Una función para cada especie","etiqueta":"prueba t","idea":"diferencia_sexos() filtra la especie, calcula las dos medias con tapply(), hace la prueba t y lo devuelve todo en una lista. Con «Emperador» no encuentra ningún pingüino y se para con un error claro, como en el capítulo 24."},"archivo":"datos/trazas/28-proyecto-pinguinos-4.json"}
```

- La función devuelve una **lista con nombres**: las dos medias, la diferencia y el valor p. Así el informe puede usar cada dato por separado.
- Para las adelias, la diferencia es de 674.7 g, y el valor p es menor que 0.001: con la variabilidad que hay, una diferencia así sería rarísima si machos y hembras pesaran lo mismo de media. Para las barbijo, 411.8 g, con un valor p de 0.000002; para las papúa, 805.1 g, y un valor p todavía más pequeño.
- Con una especie que no está en los datos, la función se para con un mensaje claro, en lugar de devolver medias vacías. Esa es la otra prueba de `tests/test-diferencia.R`.

La respuesta a la pregunta: **sí, los machos pesan más que las hembras en las tres especies**, entre 400 y 800 g, y la diferencia no se explica por el azar.

### 6 · Contarlo

El último paso es un informe de Quarto con un parámetro, la especie, como el del capítulo 25. Usa las dos piezas del proyecto: lee la tabla limpia y llama a `diferencia_sexos()`, que trae de `R/` con `source()`.

```{literalinclude} ../datos/proyectos/pinguinos/informe.qmd
:language: markdown
```

```{anywidget} ../widgets/informe.mjs
{"config":{"titulo":"Un informe para cada especie","etiqueta":"informe","idea":"El informe se ejecuta desde la carpeta del proyecto: carga la función con source(), lee la tabla limpia y escribe las cifras de la especie del parámetro. Cambia la especie con los botones.","qmd":"datos/proyectos/pinguinos/informe.qmd","carpeta":"datos/proyectos/pinguinos","parametros":{"especie":["Adelia","Barbijo","Papúa"]}},"archivo":"datos/informes/28-proyecto-pinguinos-1.json"}
```

Y `analisis.R` lo encadena todo: limpia los datos y escribe la tabla limpia, pasa las pruebas y genera los tres informes, uno por especie, con el bucle del capítulo 25. Una sola orden, `source("analisis.R")`, repite el proyecto entero desde los datos crudos.

::::{div}
:class: afondo
### 7 · Para que el proyecto funcione mañana

**Las rutas.** Todas las rutas del proyecto son relativas a su carpeta: `datos/pinguinos.csv`, no `C:/Users/ana/Escritorio/…`. Así funciona en cualquier ordenador. En RStudio, un **proyecto** (un archivo `.Rproj` en la carpeta) abre R directamente en ella. El paquete here ayuda cuando hay subcarpetas: `here::here("datos", "pinguinos.csv")` construye la ruta desde la raíz del proyecto, se ejecute el código desde donde se ejecute.

**Las versiones de los paquetes.** Dentro de dos años, dplyr habrá cambiado, y quizá algo del análisis deje de funcionar igual. El paquete renv guarda las versiones exactas de los paquetes que usa el proyecto en un archivo, `renv.lock`: `renv::init()` lo crea, `renv::snapshot()` lo actualiza y, en otro ordenador, `renv::restore()` instala justo esas versiones. Y `sessionInfo()` escribe la versión de R y de cada paquete cargado: conviene ponerla al final del informe.

**La historia.** Con Git, cada cambio del proyecto queda guardado, con quién lo hizo y por qué, y se puede volver atrás. Si además se sube a GitHub, el proyecto entero se puede compartir y revisar.

**Cuando el análisis crece.** Si limpiar tarda mucho, o hay muchos informes, el paquete targets ejecuta solo las partes que han cambiado desde la última vez, como hace Shiny con su grafo reactivo (capítulo 27), pero con los pasos de un análisis.

**Lo que dejamos fuera.** Los datos crudos tienen columnas que no hemos usado: los isótopos de nitrógeno y de carbono de la sangre, que dicen qué comía cada pingüino, o si el nido llegó a tener dos huevos. Hay preguntas para otros proyectos.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La limpieza, en pequeño (especie, isla, masa y sexo), en R con dplyr y en Python con pandas:

```r
crudo |>
  rename(isla = Island, masa_corporal_g = `Body Mass (g)`) |>
  mutate(especie = recode(word(Species, 1), Adelie = "Adelia", Chinstrap = "Barbijo", Gentoo = "Papúa"),
         sexo = case_when(Sex == "MALE" ~ "macho", Sex == "FEMALE" ~ "hembra"))
```

```python
especies = {"Adelie": "Adelia", "Chinstrap": "Barbijo", "Gentoo": "Papúa"}
(crudo
  .rename(columns={"Island": "isla", "Body Mass (g)": "masa_corporal_g"})
  .assign(especie=lambda d: d["Species"].str.split().str[0].map(especies),
          sexo=lambda d: d["Sex"].map({"MALE": "macho", "FEMALE": "hembra"})))
```

En R, `word(Species, 1)` (del paquete stringr) toma la primera palabra, y `recode()`, de dplyr, la traduce, como `map()` con un diccionario en pandas. Las dos versiones encadenan pasos: `|>` en R, los métodos con punto en pandas. En Julia, el paquete DataFramesMeta da una sintaxis parecida a dplyr, con `@rename`, `@transform` y `@chain`. La estructura del proyecto (datos, código, pruebas, informe) es la misma en los tres lenguajes.
:::

## Conexiones

- **Leer** (capítulo 12): `read.csv()` con `check.names = FALSE`, y el detalle de las casillas vacías que llegan como `""`.
- **Limpiar** (capítulos 10 y 13): `rename()`, `mutate()`, `case_when()`, `select()` y `substr()`, encadenados en una tubería.
- **Funciones y pruebas** (capítulos 5 y 24): `limpiar_pinguinos()` y `diferencia_sexos()`, con sus pruebas y con un error claro si se usan mal.
- **Explorar y responder** (capítulos 13, 15 y 18): `group_by()` y `summarise()`, un gráfico de cajas y una prueba t.
- **Contarlo** (capítulo 25): un informe con parámetros que se genera para cada especie.

## La grieta

Este proyecto responde una pregunta y la cuenta. El resultado es un informe: algo que se lee. Pero muchas veces lo que hay que entregar no es una respuesta, sino una **herramienta** que otros usen: la profesora de los capítulos 25 y 27 no quiere un informe sobre las notas de su clase, quiere que cada alumno pueda calcular la suya. ¿Cómo se construye una herramienta así, de principio a fin, con todo lo que sabemos? Es el [segundo proyecto](29-proyecto-aula.md).

## Ejercicios

1. **Otra casilla vacía.** La columna `Body Mass (g)` también tiene casillas vacías. ¿Por qué esas sí llegan como `NA` y no como `""`? Pista: ¿de qué tipo es esa columna?

2. **Otra traducción.** Añade a la limpieza una columna `nido_completo`, con `TRUE` si `Clutch Completion` es `"Yes"` y `FALSE` si es `"No"`. Escribe la línea de `mutate()`.

3. **Una prueba más.** Escribe una comprobación para `test-limpiar.R` que vigile que ninguna masa corporal es negativa ni mayor de 7000 g, sin que fallen los `NA`.

4. **La isla.** Cambia la pregunta: ¿pesan lo mismo las adelias de las tres islas? ¿Qué parte del proyecto reutilizarías tal cual y cuál tendrías que cambiar?

5. **Sin parámetros.** ¿Qué tendrías que cambiar en `informe.qmd` si quisieras un único informe con las tres especies, en lugar de uno por especie?

6. **De principio a fin.** Si mañana llegaran los datos de la temporada 2010, en otro archivo con el mismo formato, ¿qué tendrías que hacer para tener los informes actualizados?

:::{div}
:class: afondo
7. **Isótopos.** Limpia también las columnas `Delta 15 N (o/oo)` y `Delta 13 C (o/oo)`, con los nombres `delta_15n` y `delta_13c`. ¿Cuántos pingüinos no tienen esos datos?

8. **Reproducible de verdad.** Un compañero descarga el proyecto, ejecuta `source("analisis.R")` y le falla con «there is no package called 'quarto'». ¿Qué le dirías? ¿Qué habría evitado el problema?
:::

## Solucionario

1. Porque `Body Mass (g)` es una columna numérica: `read.csv()` lee las casillas vacías de una columna de números como `NA`. Solo en las columnas de texto se quedan como `""`.
2. `nido_completo = ` `` `Clutch Completion` `` `== "Yes"`, dentro del `mutate()`. Da `TRUE` con `"Yes"` y `FALSE` con `"No"`; y añade `nido_completo` al `select()`.
3. Por ejemplo, `expect_true(all(limpio$masa_corporal_g > 0 & limpio$masa_corporal_g < 7000, na.rm = TRUE))`. El `na.rm = TRUE` hace que `all()` no tenga en cuenta los dos pingüinos sin masa.
4. La limpieza y sus pruebas valen tal cual: los datos son los mismos. Cambia la parte de responder: en lugar de comparar dos sexos con una prueba t, hay que comparar tres islas, con una función nueva que filtre las adelias y compare la masa por isla (por ejemplo, con un modelo lineal `lm(masa_corporal_g ~ isla)`, capítulo 18). Y el informe, con la isla en lugar del sexo.
5. Quitar el parámetro y, en lugar de una especie, recorrer las tres: por ejemplo, calcular `diferencia_sexos()` para cada especie con `lapply()` o `map()` (capítulo 20) y enseñar una tabla con las tres filas, y un gráfico con las tres especies, como el del apartado 4.
6. Añadir el archivo nuevo a `datos/`, juntar los dos archivos crudos en `analisis.R` (por ejemplo, con `rbind()` antes de limpiar), revisar si las pruebas siguen pasando (habría que cambiar la de los años, `2007:2010`) y volver a ejecutar `source("analisis.R")`. Nada se hace a mano.

:::{div}
:class: afondo
7. En el `rename()`: `delta_15n = ` `` `Delta 15 N (o/oo)` ``, `delta_13c = ` `` `Delta 13 C (o/oo)` ``, y las dos columnas en el `select()`. Sin dato de nitrógeno hay 14 pingüinos, y sin dato de carbono, 13: `sum(is.na(pinguinos$delta_15n))` y `sum(is.na(pinguinos$delta_13c))`.
8. Que instale el paquete, `install.packages("quarto")`, y el programa Quarto, si no lo tiene. Lo habría evitado renv: con un `renv.lock` en el proyecto, `renv::restore()` instala todos los paquetes que hacen falta, en sus versiones; y el `README.md` del proyecto, que dice qué hace falta para ejecutarlo.
:::
