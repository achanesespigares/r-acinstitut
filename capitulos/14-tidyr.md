---
title: "tidyr: la forma de una tabla"
subtitle: Los mismos datos, a lo largo o a lo ancho
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Las notas de una clase se pueden apuntar de dos maneras. En una lista, con una línea por alumno y evaluación: «Marta, 1ª, 7», «Marta, 2ª, 8.5»… O en un cuadro, con una fila por alumno y una columna por evaluación. Los números son exactamente los mismos. La lista es cómoda para ir añadiendo notas y para calcular; el cuadro, para leerlo de un vistazo. Pasar de una forma a la otra es copiar números con cuidado.

## La pregunta

Al final del capítulo anterior, la tabla `resumen` tenía una fila por cada combinación de especie y sexo: seis filas. Para un informe, lo natural es una fila por especie, con una columna para las hembras y otra para los machos. Y al revés: muchos datos llegan con una columna por año, cuando para analizarlos haría falta una sola columna `anio`. ¿Cómo se cambia la forma de una tabla sin tocar sus datos?

## La idea

Una tabla puede estar en formato **largo** (más filas, pocas columnas) o **ancho** (menos filas, más columnas) sin que cambie ni un dato. El paquete **tidyr** tiene dos funciones para ir de una forma a otra:

- `pivot_wider()` **ensancha**: los valores de una columna pasan a ser nombres de columnas nuevas;
- `pivot_longer()` **alarga**: varias columnas se juntan en dos, una con los antiguos nombres y otra con los valores.

Para analizar con dplyr y dibujar con ggplot2, la forma buena es la de los **datos ordenados** (*tidy data*), que cumple tres reglas:

:::{important} Las tres reglas de los datos ordenados
1. Cada **variable** tiene su columna.
2. Cada **observación** tiene su fila.
3. Cada **valor** tiene su casilla.

Una tabla con columnas `2007`, `2008` y `2009` rompe la primera regla: el año es una variable, y está repartido entre los nombres de tres columnas.
:::

## Construcción

### 1 · De largo a ancho: `pivot_wider()`

Este es el programa estrella del capítulo. Repite la tubería del capítulo anterior y le añade dos etapas: ensanchar la tabla y calcular la diferencia entre machos y hembras.

:::{tip} Predice
Después de `pivot_wider()`, ¿cuántas filas y cuántas columnas tendrá la tabla? ¿Cómo se llamarán las columnas nuevas?
:::

```{code-cell} r
library(dplyr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv")
ancha <- pinguinos |>
  filter(!is.na(sexo)) |>
  group_by(especie, sexo) |>
  summarise(media = mean(masa_corporal_g), .groups = "drop") |>
  pivot_wider(names_from = sexo, values_from = media) |>
  mutate(diferencia = macho - hembra)
ancha
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"De largo a ancho","etiqueta":"pivot_wider","idea":"Mira la tabla antes y después de pivot_wider(): de 6 filas y 3 columnas pasa a 3 filas y 3 columnas. Los valores de sexo (hembra, macho) se convierten en nombres de columnas, y las medias se colocan debajo."},"archivo":"datos/trazas/14-tidyr-1.json"}
```

La etapa de `summarise()` devuelve la tabla larga: 6 filas, una por especie y sexo, con las columnas `especie`, `sexo` y `media`. `pivot_wider()` la ensancha con dos argumentos:

- `names_from = sexo`: los valores de `sexo`, `hembra` y `macho`, se convierten en **nombres** de columnas nuevas;
- `values_from = media`: los valores de `media` van a parar a esas columnas.

Quedan **3 filas y 3 columnas**: `especie`, `hembra` y `macho`. Ahora, comparar es una resta entre dos columnas, y `mutate()` calcula la diferencia: los machos pesan de media 674.7 gramos más en Adelia, 411.8 en Barbijo y 805.1 en Papúa. En la tabla larga, esa resta habría necesitado bastante más trabajo.

### 2 · De ancho a largo: `pivot_longer()`

Ahora el camino contrario. La tabla `por_anio` cuenta los pingüinos de cada especie medidos cada año, con una columna por año, como suelen llegar muchos datos públicos.

```{code-cell} r
library(dplyr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv")
por_anio <- pinguinos |>
  count(especie, anio) |>
  pivot_wider(names_from = anio, values_from = n)
larga <- por_anio |>
  pivot_longer(cols = -especie, names_to = "anio", values_to = "n")
nrow(larga)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"De ancho a largo","etiqueta":"pivot_longer","idea":"por_anio tiene una columna por año: el año está escondido en los nombres de las columnas. pivot_longer() lo saca a una columna propia, anio, y los recuentos a otra, n. De 3 filas pasa a 9."},"archivo":"datos/trazas/14-tidyr-2.json"}
```

`por_anio` tiene 3 filas y 4 columnas: `especie`, `2007`, `2008` y `2009`. Se lee bien, pero rompe la primera regla. `pivot_longer()` lo arregla con tres argumentos:

- `cols = -especie`: las columnas que se juntan, en este caso todas menos `especie`;
- `names_to = "anio"`: el nombre de la columna nueva que recibe los antiguos nombres (`2007`, `2008`, `2009`);
- `values_to = "n"`: el nombre de la columna nueva que recibe los valores.

`larga` tiene **9 filas**, una por especie y año, y ya está ordenada: cada variable, especie, año y recuento, en su columna. Un detalle: la columna `anio` sale como texto, porque venía de nombres de columnas. Con `names_transform = as.integer` dentro de `pivot_longer()`, se convierte en número al pasar.

Las dos funciones son inversas: `pivot_longer()` deshace lo que hizo `pivot_wider()`, y al revés. Ningún dato se pierde ni se inventa por el camino.

### 3 · Los datos que faltan

Los `NA` también son un asunto de forma: ¿se quitan, se rellenan o se cambian por otra cosa? tidyr tiene una herramienta para cada caso:

```{code-cell} r
library(dplyr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv")
pinguinos |> drop_na(sexo) |> nrow()
pinguinos |> mutate(sexo = replace_na(sexo, "desconocido")) |> count(sexo)
pinguinos |> count(isla, especie) |> pivot_wider(names_from = especie, values_from = n, values_fill = 0)
```

- `drop_na(sexo)` quita las filas sin sexo: quedan 333. Sin argumentos, `drop_na()` quita las filas con algún `NA` en cualquier columna.
- `replace_na()` cambia los `NA` por un valor: los 11 pingüinos sin sexo pasan a tener `"desconocido"`, junto a 165 hembras y 168 machos.
- Al ensanchar, las combinaciones que no existen salen como `NA`: no hay papúas en Dream. `values_fill = 0` las rellena con 0, que en un recuento es lo correcto: en Dream se contaron **cero** papúas.

::::{div}
:class: afondo
### 4 · Más herramientas para dar forma

**Juntar y separar columnas.** `unite()` junta varias columnas en una, y `separate_wider_delim()` hace lo contrario, cortando por un separador:

```r
pinguinos |> unite("lugar", especie, isla, sep = "-")        # una columna lugar: "Adelia-Torgersen"…
tabla |> separate_wider_delim(lugar, delim = "-", names = c("especie", "isla"))   # y de vuelta a dos
```

Separar es muy frecuente con datos reales, donde una columna trae dos cosas pegadas: «Barcelona (Barcelonès)», «2024-T3», «García, Marta» (capítulo 10).

**Completar las combinaciones.** `complete()` añade las filas de las combinaciones que faltan. `pinguinos |> count(isla, especie) |> complete(isla, especie, fill = list(n = 0))` pasa de 5 filas a 9, con un 0 para cada especie que no vive en una isla. Así, un gráfico de barras enseña también los huecos.

**Rellenar hacia abajo.** En las hojas de cálculo hechas a mano, un valor se escribe una vez y las filas de debajo se dejan vacías, como si se sobrentendiera. `fill()` copia cada valor hacia abajo hasta el siguiente:

```{code-cell} r
library(tidyr)
lecturas <- data.frame(dia = 1:4, temp = c(12, NA, NA, 15))
rellenas <- lecturas |> fill(temp)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Rellenar hacia abajo","etiqueta":"a fondo · fill","idea":"Los días 2 y 3 no tienen temperatura. fill() copia hacia abajo el último valor conocido, el 12, hasta encontrar el siguiente."},"archivo":"datos/trazas/14-tidyr-3.json"}
```

`rellenas` tiene la temperatura 12 en los días 2 y 3. Úsalo solo cuando los huecos signifiquen «lo mismo que arriba»: si son datos que faltan de verdad, rellenarlos es inventárselos.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Ensanchar la tabla de medias por sexo, en R con tidyr, en Python con pandas y en Julia con DataFrames:

```r
larga |> pivot_wider(names_from = sexo, values_from = media)
```

```python
larga.pivot(index="especie", columns="sexo", values="media")
```

```julia
unstack(larga, :especie, :sexo, :media)
```

Y para alargar, `pivot_longer()` en R, `melt()` en pandas y `stack()` en Julia. Los tres lenguajes tienen la misma pareja de operaciones, con nombres distintos.
:::

## Conexiones

- **ggplot2**, en el próximo capítulo, necesita datos largos: para colorear por año, el año tiene que ser una columna, no tres.
- Las tablas dinámicas de las hojas de cálculo hacen `pivot_wider()` con un resumen dentro. Ahora sabes hacerlas con código, y repetirlas con datos nuevos sin volver a arrastrar nada.
- Muchas estadísticas públicas, como las del INE o las de Eurostat, llegan anchas, con una columna por año o por territorio. `pivot_longer()` es casi siempre lo primero que se les hace.

## La grieta

Las tablas ya dicen mucho: los machos pesan más, los papúas son los más grandes, cada especie vive en sus islas. Pero una tabla de números obliga a leer fila a fila, y hay preguntas que no se responden con medias: ¿la masa crece con el largo de la aleta? ¿Hay pingüinos raros, lejos de los demás? ¿Las tres especies se separan o se mezclan? Para ver la forma de los datos de un vistazo hace falta dibujarlos: [**ggplot2**](15-ggplot2.md).

## Ejercicios

1. **¿Larga o ancha?** Una tabla tiene las columnas `alumno`, `eval1`, `eval2` y `eval3`. ¿Está ordenada? ¿Qué regla rompe?

2. **Ensanchar.** Con `pinguinos |> count(especie, sexo)`, escribe la tubería que da una fila por especie y una columna por sexo. ¿Cuántas columnas salen?

3. **Alargar.** Con la tabla `ancha` del apartado 1, escribe la línea que vuelve a ponerla larga, con las columnas `especie`, `sexo` y `media`. Pista: deja fuera la columna `diferencia`.

4. **El año como número.** Repite el `pivot_longer()` del apartado 2 con `names_transform = as.integer`. ¿De qué tipo es ahora la columna `anio`?

5. **Sin sexo.** ¿Cuántos pingüinos quedan con `drop_na(sexo)`? ¿Y con `drop_na()`, sin argumentos?

6. **Ceros donde no hay.** Ensancha `pinguinos |> count(isla, especie)` con una columna por especie y ceros donde no hay pingüinos. ¿Qué isla tiene las tres especies?

:::{div}
:class: afondo
7. **Completar.** ¿Cuántas filas tiene `pinguinos |> count(isla, especie) |> complete(isla, especie, fill = list(n = 0))`? ¿Por qué?

8. **Rellenar o no.** Un sensor no envía datos durante dos horas. ¿Está bien usar `fill()` para rellenar ese hueco? ¿Y en una hoja donde la fecha solo se escribe en la primera fila de cada día?
:::

## Solucionario

1. No está ordenada. Rompe la primera regla: la evaluación es una variable, y está repartida entre los nombres de tres columnas. Ordenada tendría las columnas `alumno`, `evaluacion` y `nota`.
2. `pinguinos |> count(especie, sexo) |> pivot_wider(names_from = sexo, values_from = n)`. Salen cuatro columnas: `especie`, `hembra`, `macho` y `NA`, la de los pingüinos sin sexo. Con `drop_na(sexo)` antes de `count()`, serían tres.
3. `ancha |> select(-diferencia) |> pivot_longer(cols = c(hembra, macho), names_to = "sexo", values_to = "media")`, que da 6 filas. Sin el `select()`, la diferencia se repetiría en las dos filas de cada especie.
4. `integer`: el texto `"2007"` pasa a ser el número 2007.
5. 333 en los dos casos: los pingüinos con alguna medida que falta tampoco tienen el sexo apuntado.
6. `pinguinos |> count(isla, especie) |> pivot_wider(names_from = especie, values_from = n, values_fill = 0)`. Ninguna isla tiene las tres: Biscoe tiene adelias y papúas, Dream adelias y barbijos, y Torgersen solo adelias.

:::{div}
:class: afondo
7. 9 filas: 3 islas por 3 especies. `complete()` añade las 4 combinaciones que no estaban, con `n` igual a 0.
8. En el sensor, no: las dos horas son datos que faltan de verdad, y rellenarlas sería inventarse la temperatura. En la hoja de las fechas, sí: el hueco significa «la misma fecha que arriba».
:::
