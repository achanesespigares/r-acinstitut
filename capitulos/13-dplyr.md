---
title: "dplyr: verbos para tablas"
subtitle: Filtrar, elegir, crear, ordenar, agrupar y resumir
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En una cocina profesional, cada cocinero sabe hacer un gesto: uno pela, otro corta, otro sofríe, otro emplata. Ninguno hace el plato entero, pero en cadena, cada uno recibe lo que le pasa el anterior y entrega su parte al siguiente. Con media docena de gestos bien hechos sale cualquier receta de la carta.

## La pregunta

Al final del capítulo anterior quedó una pregunta: ¿cuál es la masa media de los pingüinos de cada especie, separando machos y hembras, de mayor a menor? Con `subset()`, `tapply()` y `order()` se puede responder, pero cada pregunta exige combinarlos de una manera distinta. ¿Hay un vocabulario pequeño de operaciones con tablas que encajen en una tubería, como los gestos de la cocina?

## La idea

El paquete **dplyr** reúne los gestos básicos del trabajo con tablas en seis **verbos**:

| Verbo | Qué hace | Ejemplo |
|---|---|---|
| `filter()` | se queda con las filas que cumplen una condición | `filter(especie == "Papúa")` |
| `select()` | elige columnas | `select(especie, sexo)` |
| `mutate()` | crea o cambia columnas | `mutate(masa_kg = masa_corporal_g / 1000)` |
| `arrange()` | ordena las filas | `arrange(desc(masa_kg))` |
| `summarise()` | resume muchas filas en una | `summarise(media = mean(masa_kg))` |
| `group_by()` | agrupa las filas, para que lo siguiente se haga grupo a grupo | `group_by(especie)` |

Los seis siguen las mismas reglas. Reciben una tabla como primer argumento y devuelven otra tabla, así que encajan en una tubería. Además, dentro de ellos las columnas se nombran sin `$`: en `filter(pinguinos, especie == "Papúa")`, R busca `especie` entre las columnas de la tabla.

:::{important} Una tubería es una frase
Con dplyr, un análisis se lee como una frase: «toma los pingüinos, quédate con los que tienen el sexo apuntado, agrúpalos por especie y sexo, resume la masa media y ordena de mayor a menor». Cada verbo es un gesto, y la tubería `|>` los encadena en el mismo orden en que se dicen.
:::

## Construcción

### 1 · Filas y columnas: `filter()` y `select()`

```{code-cell} r
library(dplyr)
pinguinos <- read.csv("datos/pinguinos.csv")
pinguinos |>
  filter(especie == "Barbijo") |>
  select(especie, isla, sexo, masa_corporal_g) |>
  head(3)
```

`filter()` se queda con las 68 filas de la especie Barbijo, y `select()` con cuatro columnas. `head(3)` enseña las tres primeras: todas de la isla Dream. Al cargar dplyr, R da también un mensaje, en inglés («Attaching package: 'dplyr'»): avisa de que algunas funciones de dplyr tapan a otras de R con el mismo nombre, como `filter()`. Es normal.

`filter()` admite varias condiciones separadas por comas, y tienen que cumplirse todas: `filter(especie == "Papúa", masa_corporal_g > 6000)` da los dos papúas de más de 6 kilos. `select()` admite rangos y ayudas: `select(especie, ends_with("_mm"))` elige la especie y las tres columnas cuyo nombre acaba en `_mm`.

### 2 · Crear y ordenar: `mutate()` y `arrange()`

```{code-cell} r
library(dplyr)
pinguinos <- read.csv("datos/pinguinos.csv")
pinguinos |>
  mutate(masa_kg = masa_corporal_g / 1000) |>
  arrange(desc(masa_kg)) |>
  select(especie, sexo, masa_kg) |>
  head(3)
```

`mutate()` crea la columna `masa_kg` a partir de otra, como `pinguinos$masa_kg <- ...` en el capítulo 9, pero dentro de la tubería. `arrange()` ordena de menor a mayor; con `desc()`, de mayor a menor. Los tres pingüinos más pesados son machos de la especie Papúa: 6.30, 6.05 y 6.00 kilos.

Dentro de `mutate()` vale todo lo que ya sabes, como las decisiones del capítulo 4. `case_when()` es el `ifelse()` anidado de dplyr, más fácil de leer:

```r
pinguinos |>
  mutate(tamano = case_when(
    masa_corporal_g >= 5000 ~ "grande",
    masa_corporal_g >= 3500 ~ "mediano",
    masa_corporal_g <  3500 ~ "pequeño"
  )) |>
  count(tamano)
```

Cada línea dice «condición `~` valor», y gana la primera que se cumple. Salen 67 pingüinos grandes, 204 medianos, 71 pequeños y 2 `NA`: los dos sin masa apuntada no cumplen ninguna condición.

### 3 · Agrupar y resumir: la pregunta del capítulo

Este es el programa estrella del capítulo. Responde a la pregunta del principio con una sola tubería de cuatro verbos.

:::{tip} Predice
¿Cuántas filas tendrá la tabla final? ¿Qué especie y sexo irán primero?
:::

```{code-cell} r
library(dplyr)
pinguinos <- read.csv("datos/pinguinos.csv")
resumen <- pinguinos |>
  filter(!is.na(sexo)) |>
  group_by(especie, sexo) |>
  summarise(media = mean(masa_corporal_g), n = n(), .groups = "drop") |>
  arrange(desc(media))
resumen
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Masa media por especie y sexo","etiqueta":"group_by + summarise","idea":"Sigue la tabla etapa a etapa: 344 filas, 333 con el sexo apuntado, las mismas 333 agrupadas en 6 grupos, una fila por grupo y, al final, ordenadas. group_by() no cambia nada a la vista: cambia lo que hace el verbo siguiente."},"archivo":"datos/trazas/13-dplyr-1.json"}
```

Etapa a etapa:

1. `filter(!is.na(sexo))` quita los 11 pingüinos sin sexo: quedan 333.
2. `group_by(especie, sexo)` no cambia ninguna fila. Marca la tabla como **agrupada**: 3 especies por 2 sexos son 6 grupos. En la memoria aparece la etiqueta «agrupada por especie, sexo · 6 grupos».
3. `summarise()` resume **cada grupo** en una fila: la masa media y `n()`, el número de pingüinos del grupo. Salen 6 filas. `.groups = "drop"` quita la agrupación al terminar.
4. `arrange(desc(media))` ordena de mayor a menor.

El resultado tiene **6 filas**. Primero van los machos papúa, con 5484.8 gramos de media; después, las hembras papúa (4679.7), los machos adelia (4043.5), los machos barbijo (3939.0), las hembras barbijo (3527.2) y las hembras adelia (3368.8). En las tres especies, los machos pesan más que las hembras.

Es el mismo «separar, calcular, juntar» del capítulo 9, pero escrito como una frase: `group_by()` separa y `summarise()` calcula y junta.

### 4 · Contar

Contar cuántas filas hay de cada categoría es tan frecuente que tiene su propio verbo, `count()`, que equivale a `group_by()` seguido de `summarise(n = n())`:

```{code-cell} r
library(dplyr)
pinguinos <- read.csv("datos/pinguinos.csv")
pinguinos |> count(especie)
pinguinos |> count(isla, especie)
```

La primera línea da 152 adelias, 68 barbijos y 124 papúas. La segunda cuenta las combinaciones de isla y especie: los adelia viven en las tres islas, pero los papúa solo aparecen en Biscoe y los barbijo solo en Dream. Una tabla de cinco filas lo cuenta mejor que muchas palabras.

::::{div}
:class: afondo
### 5 · Más allá de los seis verbos

**Unir tablas.** A menudo, la información está repartida en dos tablas que comparten una columna. `left_join()` las une por esa columna: a cada fila de la primera le añade las columnas de la fila que le corresponde en la segunda.

```{code-cell} r
library(dplyr)
pinguinos <- read.csv("datos/pinguinos.csv")
especies <- data.frame(
  especie = c("Adelia", "Barbijo", "Papúa"),
  cientifico = c("Pygoscelis adeliae", "Pygoscelis antarcticus", "Pygoscelis papua")
)
unida <- pinguinos |> left_join(especies, by = "especie")
unida |> count(cientifico)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Dos tablas que se unen","etiqueta":"a fondo · left_join","idea":"especies tiene una fila por especie. left_join() busca la especie de cada pingüino en esa tabla y le añade su nombre científico. unida tiene las mismas 344 filas y una columna más."},"archivo":"datos/trazas/13-dplyr-2.json"}
```

`unida` tiene las mismas 344 filas que `pinguinos` y una columna más, `cientifico`. La tubería de la última línea cuenta por nombre científico: 152, 68 y 124. Si una especie no estuviera en la segunda tabla, su nombre científico quedaría en `NA`. Hay otras uniones (`inner_join()`, `full_join()`…) que se diferencian en qué hacen con las filas que no encuentran pareja.

**La misma operación en muchas columnas.** `across()` aplica una función a varias columnas a la vez:

```r
pinguinos |>
  group_by(especie) |>
  summarise(across(ends_with("_mm"), \(x) mean(x, na.rm = TRUE)))
```

Da la media de las tres medidas en milímetros para cada especie. `\(x) mean(x, na.rm = TRUE)` es una función sin nombre, escrita en corto: `\(x)` es lo mismo que `function(x)` (capítulo 5).

**Agrupar sin resumir.** `group_by()` seguido de `mutate()` calcula grupo a grupo, pero conserva todas las filas: `group_by(especie) |> mutate(dif = masa_corporal_g - mean(masa_corporal_g))` compara a cada pingüino con la media de **su** especie. Después conviene `ungroup()`, para que los verbos siguientes vuelvan a trabajar con la tabla entera.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La masa media por especie y sexo, en R con dplyr, en Python con pandas y en Julia con DataFrames:

```r
df |> group_by(especie, sexo) |> summarise(media = mean(masa))
```

```python
df.groupby(["especie", "sexo"]).agg(media=("masa", "mean"))
```

```julia
combine(groupby(df, [:especie, :sexo]), :masa => mean => :media)
```

Los tres lenguajes separan, calculan y juntan. dplyr lo escribe con verbos encadenados por una tubería; pandas, con métodos encadenados por puntos; y Julia, con funciones que se anidan. Las ideas de dplyr vienen del lenguaje SQL de las bases de datos, donde `filter()` es `WHERE`, `group_by()` es `GROUP BY` y `arrange()` es `ORDER BY`.
:::

## Conexiones

- **ggplot2**, dos capítulos más adelante, dibuja a partir de tablas como `resumen`: cada fila, una barra.
- Con el paquete dbplyr, los mismos verbos trabajan sobre una **base de datos** sin descargarla: dplyr los traduce a SQL.
- En la parte IV verás qué hay detrás de `filter(especie == "Papúa")`: cómo R busca `especie` entre las columnas en lugar de entre las variables. Se llama **evaluación no estándar**.

## La grieta

La tabla `resumen` está en formato **largo**: una fila por cada combinación de especie y sexo. Para un informe, lo natural sería una tabla **ancha**: una fila por especie y una columna para los machos y otra para las hembras. Y al revés, muchos datos públicos llegan anchos, con una columna por año, cuando para analizarlos hacen falta largos. Cambiar la forma de una tabla, sin cambiar sus datos, es el trabajo de [**tidyr**](14-tidyr.md).

## Ejercicios

1. **Biscoe.** ¿Cuántos pingüinos hay en la isla Biscoe? Escríbelo con `filter()` y `nrow()`.

2. **Las medidas.** ¿Qué columnas quedan después de `select(especie, ends_with("_mm"))`?

3. **Centímetros.** Añade una columna `largo_aleta_cm` con el largo de la aleta en centímetros.

4. **El más pesado.** Con `arrange()` y `head()`, encuentra el pingüino más pesado. ¿De qué especie, isla y sexo es?

5. **Islas y especies.** ¿Qué da `pinguinos |> count(isla, especie)`? ¿Qué especie vive en las tres islas?

6. **El pico por islas.** Calcula el largo medio del pico en cada isla, sin que los `NA` lo impidan.

:::{div}
:class: afondo
7. **La unión.** Después del `left_join()` del apartado 5, ¿cuántas filas tiene `unida`? ¿Y si la tabla `especies` solo tuviera la fila de Adelia?

8. **Todas las medias.** Con `across()`, calcula la media de las tres columnas `_mm` para cada especie. ¿Qué especie tiene el pico más largo?
:::

## Solucionario

1. `pinguinos |> filter(isla == "Biscoe") |> nrow()`, que da `168`.
2. `especie`, `largo_pico_mm`, `alto_pico_mm` y `largo_aleta_mm`.
3. `pinguinos |> mutate(largo_aleta_cm = largo_aleta_mm / 10)`. El primer pingüino pasa de 181 mm a 18.1 cm.
4. `pinguinos |> arrange(desc(masa_corporal_g)) |> head(1)`: un macho papúa de la isla Biscoe, de 6300 gramos.
5. Cinco filas: Biscoe con 44 adelias y 124 papúas, Dream con 56 adelias y 68 barbijos, y Torgersen con 52 adelias. La especie Adelia vive en las tres islas.
6. `pinguinos |> group_by(isla) |> summarise(media = mean(largo_pico_mm, na.rm = TRUE))`: Biscoe 45.26, Dream 44.17 y Torgersen 38.95 milímetros.

:::{div}
:class: afondo
7. 344, las mismas que `pinguinos`: `left_join()` conserva todas las filas de la primera tabla. Si `especies` solo tuviera a Adelia, seguiría teniendo 344 filas, pero los barbijos y los papúas tendrían `NA` en `cientifico`.
8. `pinguinos |> group_by(especie) |> summarise(across(ends_with("_mm"), \(x) mean(x, na.rm = TRUE)))`. La especie Barbijo tiene el pico más largo, con 48.8 milímetros de media.
:::
