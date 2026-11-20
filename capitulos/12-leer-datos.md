---
title: "Leer datos: de un archivo a una tabla"
subtitle: Los datos de verdad llegan en archivos
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Entre 2007 y 2009, la ecóloga Kristen Gorman y su equipo de la estación Palmer, en la Antártida, midieron 344 pingüinos de tres especies en tres islas. Para cada uno apuntaron la especie, la isla, el largo y el alto del pico, el largo de la aleta, la masa corporal, el sexo y el año. Esos datos son públicos y cualquiera puede descargarlos. Nadie va a teclear 344 filas a mano: llegan en un archivo.

:::{admonition} Los datos de este capítulo
:class: note
Usamos el archivo [`pinguinos.csv`](https://achanesespigares.github.io/r-acinstitut/datos/pinguinos.csv): los datos de pingüinos de la estación Palmer (Horst, Hill y Gorman, paquete *palmerpenguins*), con los nombres de las columnas y de las categorías en español, como los publica el paquete *datos* de Riva Quiroga y colaboradores. Son de dominio público (licencia CC0). Descárgalo y guárdalo en una carpeta `datos` dentro de la carpeta donde trabajas con R. En el laboratorio del libro ya está disponible con ese mismo nombre.
:::

## La pregunta

Hasta ahora, todos los datos los hemos escrito dentro del programa. ¿Cómo se pasa una tabla de un archivo a un data frame de R? ¿Y cómo se comprueba que ha llegado entera y con cada columna del tipo que toca?

## La idea

El formato más común para compartir tablas es el **CSV** (*comma-separated values*, valores separados por comas). Un CSV es un archivo de texto plano: cada línea es una fila, y dentro de cada línea, las columnas van separadas por comas. La primera línea suele llevar los nombres de las columnas.

`read.csv()` lee un CSV y devuelve un data frame. Pero leer es solo la mitad del trabajo. La otra mitad es **mirar** lo que ha llegado: cuántas filas y columnas hay, de qué tipo es cada una y cuántos datos faltan.

:::{important} La ruta del archivo
`read.csv("datos/pinguinos.csv")` busca el archivo a partir de la **carpeta de trabajo** de R: dentro de ella, en la subcarpeta `datos`. `getwd()` dice cuál es la carpeta de trabajo. Si R no encuentra el archivo, se detiene con el error «no se puede abrir la conexión» y el aviso «No such file or directory».
:::

## Construcción

### 1 · De archivo a tabla

Este es el programa estrella del capítulo. Primero mira el archivo tal como es, texto, y después lo lee como tabla.

:::{tip} Predice
El archivo tiene 345 líneas. ¿Cuántas filas tendrá el data frame? ¿De qué tipo será la columna `especie`?
:::

```{code-cell} r
lineas <- readLines("datos/pinguinos.csv", n = 3)
pinguinos <- read.csv("datos/pinguinos.csv")
dim(pinguinos)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"De archivo a tabla","etiqueta":"read.csv","idea":"lineas son las tres primeras líneas del archivo, tal cual: texto con comas y comillas. read.csv() corta cada línea por las comas, usa la primera para los nombres de las columnas y decide el tipo de cada una."},"archivo":"datos/trazas/12-leer-datos-1.json"}
```

`readLines()` lee líneas de texto, sin interpretarlas: `lineas` es un vector de tres textos, con las comas y las comillas del archivo. La primera línea son los nombres de las columnas; las demás, los datos de cada pingüino.

`read.csv()` hace el trabajo de verdad: corta cada línea por las comas, usa la primera para los nombres y decide el tipo de cada columna mirando su contenido. El resultado tiene **344 filas**, una menos que líneas el archivo, porque la primera línea es la cabecera, y **8 columnas**. En la memoria se ven solo las primeras filas de la tabla, con las demás contadas al final.

`especie` llega como `character`, no como factor. Desde R 4.0, `read.csv()` deja los textos como textos. Si una columna es una categoría, la conviertes tú: `pinguinos$especie <- factor(pinguinos$especie)` (capítulo 6).

### 2 · Mirar lo que ha llegado

Antes de analizar nada, se mira la tabla. Estas cinco funciones responden casi todas las preguntas:

```{code-cell} r
pinguinos <- read.csv("datos/pinguinos.csv")
str(pinguinos)
summary(pinguinos$masa_corporal_g)
colSums(is.na(pinguinos))
table(pinguinos$isla)
```

- `str()` da una línea por columna con su tipo y sus primeros valores. Las medidas son `num` o `int`, y la especie, la isla y el sexo, `chr`.
- `summary()` resume una columna numérica. La masa va de 2700 a 6300 gramos, con una media de 4202, y tiene 2 `NA`.
- `colSums(is.na(pinguinos))` cuenta los datos que faltan en cada columna. `is.na()` da una tabla de `TRUE` y `FALSE`, y `colSums()` suma cada columna (capítulo 8). Faltan 2 valores en cada medida y 11 en el sexo.
- `table()` cuenta las categorías: 168 pingüinos en Biscoe, 124 en Dream y 52 en Torgersen.

Faltan datos en casi todas las tablas reales. Por eso, al calcular, hay que decidir qué hacer con ellos: `mean(pinguinos$masa_corporal_g)` da `NA`, y con `na.rm = TRUE` da `4201.754`.

### 3 · El CSV a la española

En España, la coma es el separador decimal. Por eso Excel, configurado en español, guarda los CSV con **punto y coma** entre columnas y **coma** en los decimales. Para leerlos está `read.csv2()`, que usa esa convención:

```{code-cell} r
notas <- read.csv2(text = "nombre;nota\nMarta;7,5\nPau;4,25")
str(notas)
mean(notas$nota)
```

Aquí el CSV viene escrito dentro del propio programa, con `text =`, para que se vea entero. `\n` es el salto de línea. `read.csv2()` corta por los punto y coma y entiende `7,5` como el número 7.5: la media es `5.875`. Con `read.csv()`, la nota llegaría como texto, `"7,5"`, y no se podría operar con ella.

Otras opciones útiles de `read.csv()`:

- `sep` y `dec`: el separador de columnas y el de decimales, para cualquier otra combinación;
- `na.strings`: cómo están marcados los datos que faltan, si no es con `NA` (por ejemplo, `na.strings = c("", "-")`);
- `fileEncoding = "latin1"`: para archivos antiguos con tildes que salen mal (capítulo 10).

### 4 · Preparar los datos con una tubería

Muchas veces, después de leer hay que hacer varios pasos seguidos: quitar las filas sin dato, quedarse con algunas, elegir columnas. Escritos uno dentro de otro, se leen del revés. La **tubería** `|>` los escribe en el orden en que pasan: `x |> f(y)` significa `f(x, y)`, y lo que sale de cada paso entra como primer argumento en el siguiente.

```{code-cell} r
pinguinos <- read.csv("datos/pinguinos.csv")
grandes <- pinguinos |>
  subset(!is.na(masa_corporal_g)) |>
  subset(masa_corporal_g >= 5500) |>
  subset(select = c(especie, isla, masa_corporal_g))
nrow(grandes)
table(grandes$especie)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Una tubería, etapa a etapa","etiqueta":"|>","idea":"La tabla entra por la izquierda y pasa por tres etapas. En cada una se ve lo que sale: primero quedan 342 filas, después solo los pingüinos de 5500 gramos o más, y al final, tres columnas."},"archivo":"datos/trazas/12-leer-datos-2.json"}
```

La tubería se lee de arriba abajo, como una receta: toma `pinguinos`, quita las filas sin masa (quedan 342), quédate con las de 5500 gramos o más (quedan 33) y elige tres columnas. `subset()` filtra filas con una condición, y con `select`, elige columnas. Los 33 pingüinos de más de 5,5 kilos son todos de la especie Papúa.

Sin tubería, lo mismo se escribe `subset(subset(subset(pinguinos, !is.na(masa_corporal_g)), masa_corporal_g >= 5500), select = c(especie, isla, masa_corporal_g))`, y hay que leerlo de dentro afuera. En el próximo capítulo, la tubería será la forma natural de trabajar con dplyr.

### 5 · Guardar los resultados

`write.csv()` hace el camino contrario: guarda un data frame como CSV.

```r
write.csv(grandes, "datos/grandes.csv", row.names = FALSE)
```

Con `row.names = FALSE` no se guardan los nombres de las filas, que casi nunca hacen falta. `write.csv2()` lo guarda a la española, listo para abrir en Excel en español. Y para guardar cualquier objeto de R tal cual, con sus factores y sus tipos, está `saveRDS(objeto, "archivo.rds")`, que se recupera con `readRDS()`.

::::{div}
:class: afondo
### 6 · Leer como un profesional

**readr.** El paquete readr, del tidyverse, tiene su propia función, `read_csv()`, con guion bajo. Es más rápida con archivos grandes, devuelve un **tibble** (capítulo 9) e informa del tipo que ha decidido para cada columna.

```{code-cell} r
library(readr)
pinguinos <- read_csv("datos/pinguinos.csv", show_col_types = FALSE)
class(pinguinos)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Un tibble","etiqueta":"a fondo · readr","idea":"read_csv() da la misma tabla, pero como tibble: un data frame con algunas costumbres modernas. Fíjate en el tipo de las columnas: readr lee todos los números como numeric."},"archivo":"datos/trazas/12-leer-datos-3.json"}
```

`class(pinguinos)` da `"spec_tbl_df" "tbl_df" "tbl" "data.frame"`: es un tibble, y por debajo, un data frame. Sin `show_col_types = FALSE`, `read_csv()` enseña al leer el tipo de cada columna. Si algo no encaja, como un texto en una columna de números, lo deja en `NA` y lo apunta: `problems(pinguinos)` dice en qué filas.

**La carpeta de trabajo.** Cambiar de carpeta con `setwd()` dentro de un programa lo ata a tu ordenador: en otro, la ruta no existe. Lo profesional es trabajar en un **proyecto** de RStudio, que fija la carpeta de trabajo en la carpeta del proyecto, y usar rutas relativas, como `datos/pinguinos.csv`. Así el programa funciona en cualquier ordenador que tenga la misma carpeta.

**Otros formatos.** Para Excel está el paquete readxl (`read_excel()`), y para archivos enormes, `fread()` del paquete data.table o el paquete arrow, que leen millones de filas en segundos. `read.csv()` también lee directamente de internet si le das una dirección web en lugar de una ruta.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
| | R | Python (pandas) | Julia (CSV y DataFrames) |
|---|---|---|---|
| Leer un CSV | `read.csv("f.csv")` | `pd.read_csv("f.csv")` | `CSV.read("f.csv", DataFrame)` |
| CSV a la española | `read.csv2("f.csv")` | `pd.read_csv("f.csv", sep=";", decimal=",")` | `CSV.read("f.csv", DataFrame; delim=';', decimal=',')` |
| Guardar | `write.csv(df, "f.csv")` | `df.to_csv("f.csv")` | `CSV.write("f.csv", df)` |

Los tres leen el CSV en una tabla de columnas con su tipo. Lo que cambia es el nombre de las opciones para el separador y los decimales.
:::

## Conexiones

- Hay muchísimos datos públicos en CSV: el portal de datos abiertos del Gobierno de España, el INE, el Idescat o el Open Data de Barcelona. Con lo de este capítulo ya puedes descargarlos y abrirlos en R.
- Contar los `NA` de cada columna es el primer paso de la **limpieza de datos**, que volverá en tidyr.
- La tubería `|>` es la columna vertebral de la parte III: dplyr, tidyr y ggplot2 están pensados para encadenarse con ella.

## La grieta

Ya tenemos los datos dentro de R. Ahora vienen las preguntas: ¿cuál es la masa media de cada especie, separando machos y hembras, de mayor a menor? Con lo que sabemos se puede responder mezclando `subset()`, `tapply()` y `order()`, pero cada pregunta exige una receta distinta. Hace falta un pequeño vocabulario de verbos para tablas que encajen en una tubería: filtrar, ordenar, crear columnas, agrupar y resumir. Eso es [**dplyr**](13-dplyr.md).

## Ejercicios

1. **Líneas y filas.** `length(readLines("datos/pinguinos.csv"))` da 345, y `nrow(pinguinos)` da 344. ¿Por qué no coinciden?

2. **Por especies.** Escribe una línea que cuente cuántos pingüinos hay de cada especie.

3. **El sexo que falta.** ¿Cuántos pingüinos no tienen el sexo apuntado?

4. **La masa media.** Calcula la masa media de todos los pingüinos, sin que los `NA` lo impidan.

5. **Notas a la española.** Lee con `read.csv2(text = "nombre;nota\nMarta;7,5\nPau;4,25")` y calcula la nota media. ¿Qué tipo tendría la columna `nota` si la leyeras con `read.csv(text = ...)` y `sep = ";"`?

6. **Con tubería.** Reescribe `head(subset(pinguinos, isla == "Dream"), 2)` con `|>`.

:::{div}
:class: afondo
7. **¿Qué clase?** ¿Qué da `class(read_csv("datos/pinguinos.csv", show_col_types = FALSE))`?

8. **El archivo perdido.** ¿Qué pasa con `read.csv("pinguinos.csv")` si el archivo está dentro de la carpeta `datos`? ¿Cómo lo arreglas sin mover el archivo?
:::

## Solucionario

1. Porque la primera línea del archivo es la cabecera, con los nombres de las columnas: no es un pingüino.
2. `table(pinguinos$especie)`, que da Adelia 152, Barbijo 68 y Papúa 124.
3. `sum(is.na(pinguinos$sexo))`, que da `11`.
4. `mean(pinguinos$masa_corporal_g, na.rm = TRUE)`, que da `4201.754`.
5. La media es `5.875`. Con `read.csv()` y `sep = ";"`, la columna llegaría como `character` (`"7,5"`), porque `read.csv()` espera el punto decimal.
6. `pinguinos |> subset(isla == "Dream") |> head(2)`.

:::{div}
:class: afondo
7. `"spec_tbl_df" "tbl_df" "tbl" "data.frame"`: un tibble, que también es un data frame.
8. R no encuentra el archivo: da el error «no se puede abrir la conexión» y el aviso «No such file or directory». Se arregla dando la ruta completa desde la carpeta de trabajo: `read.csv("datos/pinguinos.csv")`.
:::
