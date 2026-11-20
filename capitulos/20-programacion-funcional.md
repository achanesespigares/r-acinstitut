---
title: "Programación funcional: funciones que trabajan con funciones"
subtitle: Aplicar, filtrar y acumular sin escribir bucles
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En matemáticas hay funciones que trabajan con funciones. La derivada recibe una función, $f(x) = x^2$, y devuelve otra, $f'(x) = 2x$. La composición recibe dos funciones, $f$ y $g$, y devuelve una tercera, $f \circ g$, que aplica primero $g$ y después $f$. Y una instrucción como «eleva al cuadrado cada uno de estos números» separa dos cosas: qué se hace (elevar al cuadrado) y a qué se le hace (cada número).

## La pregunta

En el capítulo anterior, las funciones se comportaron como cualquier otro valor: se guardaron en variables, se devolvieron desde otras funciones y se pasaron como argumentos. Si una función es un valor, ¿se puede guardar en una lista? ¿Se puede aplicar una función a cada elemento de una lista sin escribir un bucle? ¿Se pueden combinar funciones para formar otras nuevas?

## La idea

En R, las funciones son **ciudadanas de primera clase**: valores como los números o los textos. Una función que recibe o devuelve otras funciones es una **función de orden superior**. Con ellas se escriben tres patrones que sustituyen a la mayoría de los bucles:

- **aplicar** una función a cada elemento y recoger los resultados: `map()` del paquete purrr, o `lapply()` y `sapply()` en R base;
- **filtrar**, quedarse con los elementos que cumplen una condición: `Filter()`, o `keep()` y `discard()` en purrr;
- **acumular**, combinar los elementos de dos en dos hasta quedarse con uno: `Reduce()`, o `reduce()` en purrr.

Muchas veces la función que se pasa es tan corta que no merece nombre. Una **función anónima** se escribe en el sitio: `function(x) x + 10`, o, desde R 4.1, más corto, `\(x) x + 10`.

:::{important} El bucle, escondido
Un bucle `for` que aplica algo a cada elemento siempre repite lo mismo: preparar un vector para los resultados, recorrer los índices, calcular y guardar. `map()` se encarga de todo eso y deja a la vista solo lo que cambia de un programa a otro: **qué** se hace con cada elemento.

```r
resultado <- numeric(length(numeros))
for (i in seq_along(numeros)) {
  resultado[i] <- cuadrado(numeros[[i]])
}
```

es lo mismo que `resultado <- map_dbl(numeros, cuadrado)`.
:::

## Construcción

### 1 · Aplicar una función a cada elemento

Este es el programa estrella del capítulo. `map()` recibe una lista y una función, y llama a la función con cada elemento.

:::{tip} Predice
`map(numeros, cuadrado)` llama a `cuadrado()` con cada número. ¿Qué crees que devuelve: un vector de números, o una lista?
:::

```{code-cell} r
library(purrr)
cuadrado <- function(x) x^2
numeros <- list(1, 2, 3)
map(numeros, cuadrado)
map_dbl(numeros, cuadrado)
map_dbl(numeros, \(x) x + 10)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Una llamada por elemento","etiqueta":"map · map_dbl","idea":"map() no hace ningún cálculo: llama a la función que le das, una vez por elemento, y recoge lo que devuelve. Fíjate en los marcos: cuadrado(x = 1), cuadrado(x = 2), cuadrado(x = 3). Con la función anónima, lo mismo."},"archivo":"datos/trazas/20-programacion-funcional-1.json"}
```

- `map(numeros, cuadrado)` llama tres veces a `cuadrado()`: con `x = 1`, con `x = 2` y con `x = 3`. Cada llamada abre su marco, devuelve su resultado y desaparece. `map()` los recoge en una **lista**: `map()` siempre devuelve una lista, porque cada resultado podría ser de un tipo distinto.
- `map_dbl()` hace lo mismo, pero promete que cada resultado es un único número (*double*) y los junta en un **vector**: `1 4 9`. Hay una versión por tipo: `map_chr()` para textos, `map_lgl()` para lógicos y `map_int()` para enteros.
- `map_dbl(numeros, \(x) x + 10)` usa una **función anónima**: no tiene nombre, se escribe donde se usa y desaparece después. El visualizador la llama *anónima*. Da `11 12 13`.

Ojo: para elevar al cuadrado un vector de números no hace falta `map()`, porque `x^2` ya funciona con vectores (capítulo 2). `map()` es para lo que no funciona con vectores: listas, tablas, modelos y funciones que solo saben trabajar con un elemento cada vez.

### 2 · Una tabla es una lista de columnas

Un data frame es una lista de columnas, todas de la misma longitud (capítulo 9). Por eso `map()` sirve para recorrer las columnas de una tabla.

```{code-cell} r
library(purrr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
map_chr(pinguinos, class)
medidas <- pinguinos[3:6]
map_dbl(medidas, mean)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Recorrer las columnas","etiqueta":"map_chr · map_dbl","idea":"map_chr() aplica class() a cada columna de pinguinos y junta los ocho textos. map_dbl() aplica mean() a cada una de las cuatro medidas. El resultado tiene los nombres de las columnas."},"archivo":"datos/trazas/20-programacion-funcional-2.json"}
```

- `map_chr(pinguinos, class)` aplica `class()` a cada una de las ocho columnas: `especie`, `isla` y `sexo` son `"character"`; los picos, `"numeric"`; la aleta, la masa y el año, `"integer"`. El resultado conserva los nombres de las columnas.
- `pinguinos[3:6]` se queda con las cuatro medidas, y `map_dbl(medidas, mean)` calcula la media de cada una: 43.99 mm de largo de pico, 17.16 mm de alto, 200.97 mm de aleta y 4207.06 g de masa.

`mean` se pasa **sin paréntesis**. Con paréntesis, `mean()`, se llamaría a la función en ese momento; sin ellos, se entrega la función misma, para que `map_dbl()` la llame cuando toque. Es la diferencia entre darle a alguien una receta y darle el plato ya cocinado.

### 3 · Filtrar y acumular

Los otros dos patrones: quedarse con algunos elementos y combinarlos todos en uno.

```{code-cell} r
notas <- c(4.5, 7, 9.2, 5)
Filter(\(x) x >= 5, notas)
v <- c(3, -1, 4, -1, 5)
Reduce(\(a, b) a + b, v)
Reduce(\(a, b) a + b, v, accumulate = TRUE)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Filter y Reduce","etiqueta":"filtrar · acumular","idea":"Filter() pregunta a la función anónima por cada nota y se queda con las que reciben TRUE. Reduce() llama a su función con dos valores: el acumulado y el siguiente elemento. Mira cómo a lleva la suma de lo que va saliendo."},"archivo":"datos/trazas/20-programacion-funcional-3.json"}
```

- `Filter(\(x) x >= 5, notas)` llama a la función anónima con cada nota. La función responde `TRUE` o `FALSE`, y `Filter()` se queda con las que dicen `TRUE`: `7 9.2 5`. Una función que responde sí o no se llama **predicado**.
- `Reduce(\(a, b) a + b, v)` combina los elementos de dos en dos. Primero llama a la función con los dos primeros, `a = 3` y `b = -1`, que dan 2; después, con ese resultado y el siguiente elemento, `a = 2` y `b = 4`, que dan 6; y así hasta el final: **10**. `a` lleva lo acumulado y `b` es el elemento nuevo.
- Con `accumulate = TRUE`, `Reduce()` devuelve también los pasos intermedios: `3 2 6 5 10`. Es la suma acumulada, la que hace `cumsum()` (capítulo 17).

Con `Reduce()` se escriben muchas operaciones que combinan cosas: `` Reduce(`*`, 1:5) `` es el factorial de 5, y `Reduce(intersect, lista_de_vectores)` los elementos comunes a todos los vectores. Los operadores son funciones, y entre comillas invertidas se pueden pasar como cualquier otra: `` `+` ``, `` `*` ``.

### 4 · Funciones en listas, funciones que fabrican funciones

Si las funciones son valores, se pueden guardar en una lista. Y una función puede recibir dos funciones y devolver una nueva, como la composición $f \circ g$.

```{code-cell} r
library(purrr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
resumenes <- list(media = mean, mediana = median, maximo = max)
map_dbl(resumenes, \(f) f(pinguinos$masa_corporal_g))
compone <- function(f, g) {
  compuesta <- function(x) {
    f(g(x))
  }
  compuesta
}
media_redondeada <- compone(round, mean)
media_redondeada(pinguinos$masa_corporal_g)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Funciones como datos","etiqueta":"listas de funciones · composición","idea":"resumenes es una lista de tres funciones. La función anónima recibe cada una como f y la aplica a la masa. Después, compone() recibe round y mean y devuelve compuesta, que las recuerda en su entorno: aplica primero mean y después round."},"archivo":"datos/trazas/20-programacion-funcional-4.json"}
```

- `resumenes` es una lista con tres **funciones**, cada una con su nombre. `map_dbl()` recorre la lista y pasa cada función a la anónima como `f`; la anónima la aplica a la masa. Salen la media, 4207.1 g; la mediana, 4050 g; y el máximo, 6300 g. Es al revés de lo habitual: los datos son fijos y lo que va cambiando es la función.
- `compone(round, mean)` es la composición: abre un marco con `f = round` y `g = mean`, define `compuesta` y la devuelve. Como en el capítulo anterior, `compuesta` recuerda ese entorno.
- `media_redondeada(...)` llama a `compuesta`: no encuentra `f` ni `g` en su marco, las busca en el entorno recordado y calcula `round(mean(x))`: **4207**.

::::{div}
:class: afondo
### 5 · Dividir, aplicar, combinar

Un patrón muy frecuente en el análisis de datos: **dividir** una tabla en grupos, **aplicar** lo mismo a cada grupo y **combinar** los resultados. Con funciones de orden superior cabe en una tubería. Por ejemplo, para ajustar una recta por especie (capítulo 18) y quedarse con las tres pendientes:

```{code-cell} r
library(purrr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
pendientes <- pinguinos |>
  split(~especie) |>
  map(\(d) lm(masa_corporal_g ~ largo_aleta_mm, data = d)) |>
  map_dbl(\(m) coef(m)[2])
pendientes
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Una recta por especie","etiqueta":"a fondo · split · map","idea":"split() divide la tabla en una lista de tres tablas, una por especie. map() ajusta un modelo a cada una y devuelve una lista de tres modelos. map_dbl() saca de cada modelo su pendiente."},"archivo":"datos/trazas/20-programacion-funcional-5.json"}
```

`split(~especie)` devuelve una lista de tres data frames, uno por especie; `map()` ajusta un modelo a cada uno y devuelve una lista de tres modelos; y `map_dbl()` saca la pendiente de cada modelo. Salen 32.7 g/mm en adelias, 34.6 en barbijos y 54.2 en papúas: las tres pendientes del modelo con interacción del capítulo 18, sin un solo bucle.

**Más variantes de `map()`.** `map2(x, y, f)` recorre dos listas a la vez y llama a `f(x[[i]], y[[i]])`: `map2_dbl(c(1, 2, 3), c(10, 20, 30), \(a, b) a * b)` da `10 40 90`. `pmap()` recorre tantas listas como haga falta, e `imap()` pasa también el nombre o la posición de cada elemento. `walk()` es como `map()` para funciones que no devuelven nada útil, como las que escriben archivos o dibujan.

**El problema de `sapply()`.** `sapply()` intenta simplificar el resultado, y no siempre puede: devuelve un vector, una matriz o una lista según lo que salga. Con una lista vacía, `sapply(list(), length)` devuelve `list()`, no un vector. Un programa que espera números se rompe más adelante, lejos del sitio del problema. `vapply(x, f, numeric(1))` y `map_dbl()` prometen el tipo y se paran en el sitio si no se cumple: `vapply(1:3, \(x) "a", numeric(1))` dice que los valores deben ser del tipo `'double'`, pero el resultado es del tipo `'character'`; y `map_dbl(list(1, "a"), \(x) x)` se para con `Can't coerce from a string to a double`, en inglés.

**Funciones puras.** Una función que solo depende de sus argumentos y no cambia nada fuera (sin `<<-`, sin escribir archivos) se llama **pura**. Con funciones puras, `map()` puede repartir el trabajo entre varios procesadores sin que los resultados se mezclen: es lo que hacen paquetes como furrr, que cambian `map()` por `future_map()` y no hay que tocar nada más.

**R base y purrr.** Las dos familias hacen lo mismo con nombres distintos: `lapply()` es `map()`, `vapply()` es `map_dbl()` y compañía, `Map()` es `map2()`, `Filter()` es `keep()`, y `Reduce()` es `reduce()`. purrr añade nombres coherentes, tipos garantizados y mensajes de error más claros.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Aplicar, filtrar y acumular, en R, en Python y en Julia:

```r
map_dbl(1:5, \(x) x^2)          # 1 4 9 16 25
Filter(\(x) x > 0, c(3, -1, 4, -1, 5))
Reduce(`+`, c(3, -1, 4, -1, 5))
```

```python
list(map(lambda x: x**2, range(1, 6)))
list(filter(lambda x: x > 0, [3, -1, 4, -1, 5]))
reduce(lambda a, b: a + b, [3, -1, 4, -1, 5])   # from functools import reduce
```

```julia
map(x -> x^2, 1:5)
filter(x -> x > 0, [3, -1, 4, -1, 5])
reduce(+, [3, -1, 4, -1, 5])
```

Los tres lenguajes tienen los mismos tres patrones con casi los mismos nombres, y una forma corta de escribir funciones anónimas: `\(x)` en R, `lambda x:` en Python y `x ->` en Julia. En Python es más habitual la lista por comprensión, `[x**2 for x in range(1, 6)]`; en Julia, el punto de difusión, `(1:5) .^ 2`, que aplica la operación a cada elemento como hace R con los vectores.
:::

## Conexiones

- El patrón dividir-aplicar-combinar es el mismo de `group_by()` y `summarise()` del **capítulo 13**: dplyr lo hace para tablas, y `map()` para cualquier cosa, también modelos.
- Las **clausuras** del capítulo 19 son las que permiten fabricar funciones como `compuesta`: recuerdan lo que necesitan en su entorno.
- El **rendimiento**, al final de esta parte: cuándo un bucle, un `map()` o una operación con vectores es más rápido, y cómo medirlo.
- En la parte V, las funciones puras son las más fáciles de **probar**: con los mismos argumentos, dan siempre lo mismo.

## La grieta

En este capítulo, `map_dbl(medidas, mean)` dio un vector con nombres, `split()` una lista de tablas, y `map()` una lista de modelos. Y cada cosa se imprime a su manera: un data frame como una tabla, un factor con sus niveles, un modelo con su fórmula y sus coeficientes. Con `summary()` pasa lo mismo: de una tabla da un resumen de cada columna; de un modelo, la tabla de coeficientes; de un factor, un recuento. Es la misma función. ¿Cómo sabe `print()` o `summary()` qué hacer con cada cosa? La respuesta está en los **objetos** y sus clases.

## Ejercicios

1. **¿Hace falta `map()`?** Compara `map_dbl(1:5, \(n) n^2)` con `(1:5)^2`. ¿Dan lo mismo? ¿Cuál usarías, y por qué? ¿En qué caso no te quedaría más remedio que usar `map()`?

2. **Pingüinos por isla.** ¿Qué hace `map_int(split(pinguinos, ~isla), nrow)`? ¿Qué devuelve?

3. **Aprobados y suspensos.** Con `notas <- c(4.5, 7, 9.2, 5)`, usa `keep()` y `discard()` de purrr para separar los aprobados de los suspensos.

4. **Reducir con operadores.** ¿Qué devuelve `` Reduce(`+`, 1:5, accumulate = TRUE) ``? ¿Y `` Reduce(`*`, 1:5) ``?

5. **Lo común.** ¿Qué devuelve `Reduce(intersect, list(c(1, 2, 3, 4), c(2, 3, 4, 5), c(3, 4, 5, 6)))`? Explica qué hace `Reduce()` en cada paso.

6. **Una función, no su resultado.** ¿Qué diferencia hay entre `map_dbl(medidas, mean)` y `map_dbl(medidas, mean())`? ¿Qué pasa con la segunda?

:::{div}
:class: afondo
7. **Tipos garantizados.** ¿Qué devuelve `sapply(list(), length)`? ¿Y `map_dbl(list(), length)`? ¿Por qué la segunda es más segura dentro de un programa?

8. **Dos listas a la vez.** Usa `map2_dbl()` para multiplicar elemento a elemento `c(1, 2, 3)` y `c(10, 20, 30)`. ¿Habría bastado con `*`?
:::

## Solucionario

1. Dan lo mismo, `1 4 9 16 25`. Mejor `(1:5)^2`: es más corto, más claro y mucho más rápido, porque `^` ya trabaja con vectores. `map()` es imprescindible cuando la función solo sabe trabajar con un elemento cada vez, o cuando los elementos son listas, tablas o modelos, como en el apartado 5.
2. Divide la tabla en una lista de tres tablas, una por isla, y aplica `nrow()` a cada una. Devuelve un vector de enteros con nombres: Biscoe 163, Dream 123 y Torgersen 47.
3. `keep(notas, \(x) x >= 5)` da `7.0 9.2 5.0`, y `discard(notas, \(x) x >= 5)` da `4.5`. `keep()` es el `Filter()` de purrr, y `discard()` se queda con las que el predicado rechaza.
4. `` Reduce(`+`, 1:5, accumulate = TRUE) `` da `1 3 6 10 15`, la suma acumulada. `` Reduce(`*`, 1:5) `` da 120, el producto de 1 a 5: el factorial de 5.
5. `3 4`. Primero hace la intersección de los dos primeros vectores, `2 3 4`; después, la de ese resultado con el tercero, `3 4`. Son los números que están en los tres.
6. La primera pasa la función `mean` y `map_dbl()` la llama con cada columna. La segunda llama a `mean()` en ese momento, sin argumentos, y R se para antes de que `map_dbl()` empiece: `mean()` necesita un argumento `x`.

:::{div}
:class: afondo
7. `sapply(list(), length)` devuelve `list()`, una lista vacía, y `map_dbl(list(), length)` devuelve `numeric(0)`, un vector numérico vacío. La segunda siempre devuelve un vector de números, haya los elementos que haya, así que el código que viene detrás no se encuentra una lista por sorpresa.
8. `map2_dbl(c(1, 2, 3), c(10, 20, 30), \(a, b) a * b)` da `10 40 90`. Aquí bastaba con `c(1, 2, 3) * c(10, 20, 30)`, porque `*` trabaja con vectores. `map2()` hace falta cuando la función no está vectorizada.
:::
