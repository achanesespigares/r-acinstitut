---
title: "Data frames: la tabla de datos"
subtitle: Filas que son casos, columnas que son variables
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

La hoja de cálculo de secretaría tiene una fila por alumno y una columna por dato: el nombre, el grupo, la nota final. Cada columna tiene su tipo (los nombres son texto, las notas son números), pero todas tienen el mismo número de casillas, porque cada fila es una persona. Con esa hoja se filtra a los aprobados, se ordena de mayor a menor nota y se calcula la media de cada grupo.

## La pregunta

Una matriz no puede mezclar tipos: al añadirle una columna de texto, todas las notas se volvían texto. Una lista sí admite tipos distintos, pero no sabe nada de filas. ¿Hay una estructura que tenga lo mejor de las dos: columnas de tipos distintos y filas que se pueden elegir como en una matriz?

## La idea

Un **data frame** es la tabla de datos de R. Por dentro es una **lista de columnas**, y cada columna es un vector (o un factor) con su propio tipo. La única condición es que todas las columnas tengan la misma longitud, que es el número de filas. Cada fila es un caso (un alumno) y cada columna, una variable (su nota).

Como es una lista, una columna se saca con `$`: `clase$nota`. Como tiene filas y columnas, también admite los dos índices de una matriz: `clase[2, "nota"]`.

:::{important} Una fila es un caso; una columna es una variable
Esta forma de organizar los datos se llama **datos ordenados** (*tidy data*). Casi todo el análisis de datos con R, desde los gráficos hasta los modelos, da por hecho que los datos tienen esta forma.
:::

## Construcción

### 1 · Crear un data frame y mirarlo

`data.frame()` recibe las columnas con su nombre, igual que `list()`:

```{code-cell} r
clase <- data.frame(
  nombre = c("Marta", "Pau", "Sara", "Joan"),
  grupo = factor(c("A", "B", "A", "B")),
  nota = c(7.2, 4.1, 9.5, 5.8)
)
clase
str(clase)
summary(clase)
```

R enseña la tabla con el nombre de cada fila a la izquierda (de momento, `1`, `2`, `3` y `4`). `str()` da una línea por columna con su tipo: `chr` para el nombre, `Factor w/ 2 levels` para el grupo y `num` para la nota. `summary()` resume cada columna según su tipo: los niveles con su recuento para el factor, y el mínimo, la media, la mediana y el máximo para los números. La media de la clase es `6.650`.

Otras funciones para mirar una tabla: `nrow()` y `ncol()` dan el número de filas y de columnas, `names()` da los nombres de las columnas y `head()` enseña las primeras filas, muy útil cuando la tabla tiene miles.

### 2 · Trabajar con una tabla

:::{tip} Predice
Después de filtrar a los aprobados, ¿qué nombres tendrán las filas de `aprobados`: `1 2 3` o los que tenían en `clase`? ¿Qué fila irá primera en `ranking`?
:::

```{code-cell} r
clase <- data.frame(
  nombre = c("Marta", "Pau", "Sara", "Joan"),
  grupo = factor(c("A", "B", "A", "B")),
  nota = c(7.2, 4.1, 9.5, 5.8)
)
clase$aprobado <- clase$nota >= 5
aprobados <- clase[clase$aprobado, ]
ranking <- clase[order(clase$nota, decreasing = TRUE), ]
mean(clase$nota)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Tres operaciones con una tabla","etiqueta":"data frame","idea":"Cada columna lleva su tipo debajo del nombre. Primero la tabla gana una columna lógica; después, un filtro se queda con tres filas y order() las reordena. Fíjate en los nombres de las filas: viajan con ellas."},"traza":{"codigo":"clase <- data.frame(\n  nombre = c(\"Marta\", \"Pau\", \"Sara\", \"Joan\"),\n  grupo = factor(c(\"A\", \"B\", \"A\", \"B\")),\n  nota = c(7.2, 4.1, 9.5, 5.8)\n)\nclase$aprobado <- clase$nota >= 5\naprobados <- clase[clase$aprobado, ]\nranking <- clase[order(clase$nota, decreasing = TRUE), ]\nmean(clase$nota)","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]}},"salida":"","nfilas":0},{"linea":6,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","FALSE","TRUE","TRUE"]}}],"filas":["1","2","3","4"]}},"salida":"","nfilas":0},{"linea":7,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","FALSE","TRUE","TRUE"]}}],"filas":["1","2","3","4"]},"aprobados":{"t":"data.frame","nf":3,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","A","B"],"k":["1","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","9.5","5.8"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","TRUE","TRUE"]}}],"filas":["1","3","4"]}},"salida":"","nfilas":0},{"linea":8,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","FALSE","TRUE","TRUE"]}}],"filas":["1","2","3","4"]},"aprobados":{"t":"data.frame","nf":3,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","A","B"],"k":["1","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","9.5","5.8"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","TRUE","TRUE"]}}],"filas":["1","3","4"]},"ranking":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Sara\"","\"Marta\"","\"Joan\"","\"Pau\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","A","B","B"],"k":["1","1","2","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["9.5","7.2","5.8","4.1"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","TRUE","TRUE","FALSE"]}}],"filas":["3","1","4","2"]}},"salida":"","nfilas":0},{"linea":9,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","FALSE","TRUE","TRUE"]}}],"filas":["1","2","3","4"]},"aprobados":{"t":"data.frame","nf":3,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","A","B"],"k":["1","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","9.5","5.8"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","TRUE","TRUE"]}}],"filas":["1","3","4"]},"ranking":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Sara\"","\"Marta\"","\"Joan\"","\"Pau\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","A","B","B"],"k":["1","1","2","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["9.5","7.2","5.8","4.1"]}},{"nombre":"aprobado","v":{"t":"logical","v":["TRUE","TRUE","TRUE","FALSE"]}}],"filas":["3","1","4","2"]}},"salida":"[1] 6.65\n","nfilas":0}],"filas":[]}}
```

Este es el programa estrella del capítulo. En cuatro líneas hace las tres operaciones básicas con una tabla:

- **Añadir una columna.** `clase$aprobado <- clase$nota >= 5` crea una columna lógica a partir de otra. Es la vectorización del capítulo 2, aplicada a una columna entera.
- **Filtrar filas.** `clase[clase$aprobado, ]` es un filtro lógico del capítulo 3, puesto en el hueco de las filas. El hueco de las columnas queda vacío: todas. Quedan Marta, Sara y Joan.
- **Ordenar filas.** `order()` da las posiciones de las filas en el orden que pides; puestas en el hueco de las filas, reordenan la tabla. Sara va primera, con su 9.5.

Las filas **conservan su nombre original**: en `aprobados` se llaman `1`, `3` y `4`, y en `ranking`, `3`, `1`, `4` y `2`. Así siempre se sabe de qué fila de la tabla original viene cada una.

Para elegir filas y columnas a la vez, se llenan los dos huecos: `clase[clase$grupo == "A", c("nombre", "nota")]` da el nombre y la nota de Marta y de Sara. Y para quitar una columna, como en una lista: `clase$aprobado <- NULL`.

### 3 · Resumir por grupos

Una pregunta muy frecuente es «¿cuál es la media de cada grupo?». Por dentro son tres pasos: **separar** la tabla por grupos, **calcular** en cada trozo y **juntar** los resultados. Este programa los hace a mano, con un bucle sobre los niveles del grupo:

```{code-cell} r
clase <- data.frame(
  nombre = c("Marta", "Pau", "Sara", "Joan"),
  grupo = factor(c("A", "B", "A", "B")),
  nota = c(7.2, 4.1, 9.5, 5.8)
)
medias <- numeric(nlevels(clase$grupo))
names(medias) <- levels(clase$grupo)
for (g in levels(clase$grupo)) {
  medias[g] <- mean(clase$nota[clase$grupo == g])
}
medias
tapply(clase$nota, clase$grupo, mean)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La media de cada grupo","etiqueta":"separar · calcular · juntar","idea":"En cada vuelta, g es un grupo. El filtro clase$grupo == g se queda con las notas de ese grupo, mean() las resume y el resultado se guarda en medias[g], por su nombre.","columnas":["g","clase$nota[clase$grupo == g]","medias[g]"],"fila_en":"fin_iteracion"},"traza":{"codigo":"clase <- data.frame(\n  nombre = c(\"Marta\", \"Pau\", \"Sara\", \"Joan\"),\n  grupo = factor(c(\"A\", \"B\", \"A\", \"B\")),\n  nota = c(7.2, 4.1, 9.5, 5.8)\n)\nmedias <- numeric(nlevels(clase$grupo))\nnames(medias) <- levels(clase$grupo)\nfor (g in levels(clase$grupo)) {\n  medias[g] <- mean(clase$nota[clase$grupo == g])\n}\nmedias\ntapply(clase$nota, clase$grupo, mean)","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]}},"salida":"","nfilas":0},{"linea":6,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["0","0"]}},"salida":"","nfilas":0},{"linea":7,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["0","0"],"n":["A","B"]}},"salida":"","nfilas":0},{"linea":8,"tipo":"vuelta","vuelta":1,"estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["0","0"],"n":["A","B"]},"g":{"t":"character","v":["\"A\""]}},"salida":"","nfilas":0},{"linea":9,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["8.35","0"],"n":["A","B"]},"g":{"t":"character","v":["\"A\""]}},"salida":"","nfilas":0},{"linea":8,"tipo":"vuelta","vuelta":2,"estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["8.35","0"],"n":["A","B"]},"g":{"t":"character","v":["\"B\""]}},"salida":"","nfilas":1},{"linea":9,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["8.35","4.95"],"n":["A","B"]},"g":{"t":"character","v":["\"B\""]}},"salida":"","nfilas":1},{"linea":8,"tipo":"fin","vuelta":2,"estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["8.35","4.95"],"n":["A","B"]},"g":{"t":"character","v":["\"B\""]}},"salida":"","nfilas":2},{"linea":11,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["8.35","4.95"],"n":["A","B"]},"g":{"t":"character","v":["\"B\""]}},"salida":"   A    B \n8.35 4.95 \n","nfilas":2},{"linea":12,"tipo":"linea","estado":{"clase":{"t":"data.frame","nf":4,"cols":[{"nombre":"nombre","v":{"t":"character","v":["\"Marta\"","\"Pau\"","\"Sara\"","\"Joan\""]}},{"nombre":"grupo","v":{"t":"factor","v":["A","B","A","B"],"k":["1","2","1","2"],"niveles":["A","B"]}},{"nombre":"nota","v":{"t":"numeric","v":["7.2","4.1","9.5","5.8"]}}],"filas":["1","2","3","4"]},"medias":{"t":"numeric","v":["8.35","4.95"],"n":["A","B"]},"g":{"t":"character","v":["\"B\""]}},"salida":"   A    B \n8.35 4.95 \n   A    B \n8.35 4.95 \n","nfilas":2}],"filas":[{"g":"\"A\"","clase$nota[clase$grupo == g]":"7.2 9.5","medias[g]":"8.35"},{"g":"\"B\"","clase$nota[clase$grupo == g]":"4.1 5.8","medias[g]":"4.95"}]}}
```

En la vuelta del grupo A, el filtro se queda con 7.2 y 9.5, y su media es 8.35. En la del B, con 4.1 y 5.8, que dan 4.95. `tapply(clase$nota, clase$grupo, mean)` hace los tres pasos en una línea y da lo mismo: `A 8.35` y `B 4.95`.

Otras dos maneras de resumir por grupos:

- `aggregate(nota ~ grupo, data = clase, FUN = mean)` devuelve el resultado como otra tabla, con una fila por grupo. La fórmula `nota ~ grupo` se lee «la nota según el grupo».
- `table(clase$grupo, clase$aprobado)` cuenta cuántos hay de cada combinación. En el grupo A aprueban los 2; en el B, 1 de 2.

::::{div}
:class: afondo
### 4 · Un data frame es una lista

`is.list(clase)` da `TRUE`, y `length(clase)` da el número de **columnas**, no de filas. Por eso todo lo de las listas funciona con las columnas: `clase[[3]]` es el vector de notas, y `clase[3]`, con un corchete, es otro data frame con esa única columna.

**La columna que pierde su forma.** Con dos huecos pasa como en las matrices: `clase[, 3]` devuelve un vector, no una tabla, porque solo queda una columna. Con `clase[, 3, drop = FALSE]`, o con `clase[3]`, sigue siendo un data frame.

**Columnas de la misma longitud.** `data.frame(a = 1:3, b = 1:2)` da un error: «arguments imply differing number of rows: 3, 2» (R no lo traduce). Pero `data.frame(a = 1:4, b = 1:2)` funciona, y en silencio: 4 es múltiplo de 2, así que `b` se recicla en `1 2 1 2`, como en el capítulo 2.

**`subset()`.** Para filtrar y elegir columnas sin repetir el nombre de la tabla, existe `subset(clase, nota >= 5, select = c(nombre, nota))`. Dentro de `subset()`, `nota` se refiere a la columna de `clase`. Es cómodo para trabajar en la consola. En la parte III, dplyr llevará esta idea mucho más lejos.

:::{tip} Para saber más
En la parte III aparecerá el **tibble**, la versión moderna del data frame que usan dplyr y los demás paquetes del tidyverse. Por dentro es un data frame con algunos cambios: no pone nombre a las filas, no recicla columnas y enseña la tabla de forma más compacta.
:::
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
| | R | Python (pandas) | Julia (DataFrames) |
|---|---|---|---|
| Crear | `data.frame(nombre = n, nota = x)` | `pd.DataFrame({"nombre": n, "nota": x})` | `DataFrame(nombre = n, nota = x)` |
| Una columna | `df$nota` | `df["nota"]` | `df.nota` |
| Filtrar filas | `df[df$nota >= 5, ]` | `df[df["nota"] >= 5]` | `df[df.nota .>= 5, :]` |

R trae el data frame de serie, desde sus orígenes en la estadística. Python lo tiene en el paquete pandas, que se inspiró en R, y Julia en el paquete DataFrames. La idea es la misma en los tres: una tabla de columnas, cada una con su tipo.
:::

## Conexiones

- La parte III empieza leyendo tablas desde archivos: `read.csv()` devuelve un data frame.
- **dplyr** convierte las operaciones de este capítulo en verbos: `mutate()` añade columnas, `filter()` filtra filas, `arrange()` ordena, y `group_by()` con `summarise()` resume por grupos.
- **ggplot2** dibuja a partir de un data frame: cada columna puede ir a un eje, a un color o a un tamaño.

## La grieta

En una tabla real, la columna de los nombres casi nunca está limpia: `"marta"`, `"MARTA"` y `"Marta "` (con un espacio al final) son la misma persona, pero `==` dice que no. Y a veces hace falta algo más que comparar: los alumnos cuyo nombre empieza por M, o el apellido que va detrás de la coma. Para eso hay que saber trabajar con el texto por dentro: las **cadenas**.

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   df <- data.frame(x = 1:3, y = c("a", "b", "c"))
   nrow(df)
   df$y[2]
   ```

2. **Tus películas.** Crea un data frame con tres películas que te gusten y tres columnas: `titulo`, `anio` y `nota` (del 1 al 10). Míralo con `str()`.

3. **El grupo A.** Con la tabla `clase` del capítulo, escribe una línea que dé los nombres de los alumnos del grupo A.

4. **La nota final.** Añade a `clase` una columna `final` con la nota más medio punto, sin pasar de 10. Pista: `pmin(x, 10)` se queda, casilla a casilla, con el menor de los dos.

5. **Por orden alfabético.** Escribe una línea que dé los nombres de la clase ordenados alfabéticamente.

6. **La media de cada grupo.** Calcula la media de cada grupo con `tapply()` y con `aggregate()`. ¿En qué se diferencian los dos resultados?

:::{div}
:class: afondo
7. **Una lista disfrazada.** Con la tabla `clase` recién creada, ¿qué dan `length(clase)`, `class(clase[[3]])` y `class(clase[3])`?

8. **Columnas desiguales.** ¿Qué pasa con `data.frame(a = 1:3, b = 1:2)`? ¿Y con `data.frame(a = 1:4, b = 1:2)`?
:::

## Solucionario

1. `3`, porque hay tres filas. Y `"b"`: `df$y` es un vector de texto, y `[2]` es su segundo elemento.
2. Por ejemplo, `data.frame(titulo = c("Coco", "Up", "Wall-E"), anio = c(2017, 2009, 2008), nota = c(9, 8, 8.5))`. `str()` da `chr` para el título y `num` para las otras dos columnas.
3. `clase$nombre[clase$grupo == "A"]`, que da `"Marta" "Sara"`.
4. `clase$final <- pmin(clase$nota + 0.5, 10)`, que da `7.7 4.6 10.0 6.3`: el 9.5 de Sara no pasa de 10.
5. `clase$nombre[order(clase$nombre)]` o `clase[order(clase$nombre), "nombre"]`, que dan `"Joan" "Marta" "Pau" "Sara"`.
6. Los dos dan A 8.35 y B 4.95. `tapply()` devuelve un vector con nombres; `aggregate()` devuelve un data frame con una columna `grupo` y otra `nota`.

:::{div}
:class: afondo
7. `3`, el número de columnas. `"numeric"`, porque `clase[[3]]` es el vector de notas. Y `"data.frame"`, porque un solo corchete devuelve otra tabla con esa columna.
8. La primera da el error «arguments imply differing number of rows: 3, 2». La segunda funciona: `b` se recicla en `1 2 1 2` porque 4 es múltiplo de 2.
:::
