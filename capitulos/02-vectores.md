---
title: "Vectores: en R todo es un vector"
subtitle: La idea que hace distinto a R
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Una profesora tiene las notas del examen en una columna de su hoja de cálculo. Decide subir medio punto a todo el mundo. No va alumno por alumno: escribe la fórmula en la primera casilla, la arrastra hasta abajo y la columna entera cambia de golpe.

## La pregunta

En casi todos los lenguajes, para subir medio punto a cada nota hay que escribir un bucle que las visite una a una. ¿Se puede trabajar con la columna entera, como en la hoja de cálculo, y que el ordenador se encargue de ir casilla por casilla?

## La idea

En R, la pieza básica no es el número suelto sino el **vector**: una fila de casillas numeradas **desde 1**, todas del mismo tipo. Un número suelto es un vector de longitud 1. Por eso las operaciones de R trabajan con vectores enteros: `notas + 0.5` suma medio punto a todas las casillas a la vez. Esto se llama **vectorizar**.

:::{important} Un vector, un tipo
Todas las casillas de un vector son del mismo tipo: números, textos o valores lógicos. Si mezclas tipos, R los convierte todos al más general, sin avisar.
:::

## Construcción

### 1 · Crear vectores

La función `c()` (de *combinar*) junta valores en un vector. Para secuencias hay atajos: `:` cuenta de uno en uno, `seq()` da pasos de cualquier tamaño y `rep()` repite.

```{code-cell} r
notas <- c(4.2, 7, 3.5, 8)
1:5
seq(0, 1, by = 0.25)
rep(c("a", "b"), times = 2)
rep(c("a", "b"), each = 2)
length(notas)
```

`1:5` da `1 2 3 4 5`, y `seq(0, 1, by = 0.25)` da `0.00 0.25 0.50 0.75 1.00`. Con `times`, `rep()` repite el vector entero (`"a" "b" "a" "b"`); con `each`, repite cada elemento (`"a" "a" "b" "b"`).

Si mezclas tipos, gana el más general: `c(1, "a", TRUE)` da tres textos, `"1" "a" "TRUE"`. Y `c(1, TRUE, FALSE)` da tres números, `1 1 0`, porque `TRUE` vale 1 y `FALSE` vale 0.

### 2 · Vectorizar: operar sin escribir bucles

:::{tip} Predice
Antes de ejecutar: ¿cuántos elementos tendrá `aprobado`? ¿Qué hay en sus casillas: números o algo distinto?
:::

```{code-cell} r
notas <- c(4.2, 7, 3.5, 8)
subidas <- notas + 0.5
aprobado <- subidas >= 5
sum(aprobado)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Medio punto para todos","etiqueta":"vectorización","idea":"Cada línea trabaja con el vector entero: la suma y la comparación se hacen casilla a casilla, sin escribir ningún bucle."},"archivo":"datos/trazas/02-vectores-1.json"}
```

La comparación `subidas >= 5` también se vectoriza: devuelve un vector **lógico**, con un `TRUE` o un `FALSE` por casilla. Y como `TRUE` cuenta como 1, `sum(aprobado)` cuenta los aprobados. Con `mean(aprobado)` tendrías la proporción.

### 3 · El reciclado

¿Qué pasa si sumas dos vectores de longitudes distintas? R no se queja: **recicla** el corto, es decir, lo repite desde el principio hasta igualar la longitud del largo. `1:6 + c(10, 20)` da `11 22 13 24 15 26`.

Este es el programa estrella del capítulo. Hace a mano, con un bucle, lo mismo que R hace por dentro al sumar `x + y`. La posición del vector corto la da `(i - 1) %% length(y) + 1`, que vuelve a 1 cada vez que `y` se acaba (`%%` es el resto de la división).

:::{tip} Predice
`x` tiene 5 elementos e `y` tiene 2. ¿Qué elemento de `y` se suma a `x[5]`? ¿Le gustará eso a R?
:::

```{code-cell} r
x <- c(10, 20, 30, 40, 50)
y <- c(1, 2)
z <- numeric(length(x))
for (i in seq_along(x)) {
  j <- (i - 1) %% length(y) + 1
  z[i] <- x[i] + y[j]
}
z
x + y
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Lo que hace R al sumar dos vectores","etiqueta":"reciclado · por dentro","idea":"El puntero recorre z. En cada vuelta, j dice qué casilla de y toca: 1, 2, 1, 2, 1. El vector corto se recicla. Al final, x + y da lo mismo, pero con un aviso.","foco":"z","puntero":"i","columnas":["i","j","x[i]","y[j]","z[i]"],"fila_en":"fin_iteracion"},"archivo":"datos/trazas/02-vectores-2.json"}
```

Al llegar a `x[5]`, a `y` le toca empezar otra vuelta y solo le da tiempo a poner su primer elemento. Como 5 no es múltiplo de 2, R hace la suma de todos modos, pero **avisa**: «longitud de objeto mayor no es múltiplo de la longitud de uno menor». Un aviso no es un error. El resultado está ahí, pero casi siempre significa que algo no es lo que pensabas.

El reciclado más frecuente ni se nota: en `notas + 0.5`, el `0.5` es un vector de longitud 1 que se recicla hasta cubrir todas las notas.

:::{div}
:class: afondo
### 4 · Copiar al modificar

¿Qué pasa en la memoria cuando escribes `y <- x`? R no copia el vector: `x` e `y` pasan a ser dos nombres para el **mismo** vector. La copia se hace más tarde, solo si uno de los dos se modifica. Así R ahorra memoria, y cada nombre se comporta como si tuviera su propio vector. Esta estrategia se llama **copiar al modificar** (*copy-on-modify*).

```{code-cell} r
x <- c(1, 2, 3)
y <- x
y[1] <- 99
x
y
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Dos nombres, un vector… hasta que uno cambia","etiqueta":"a fondo · memoria","idea":"Después de y <- x los dos nombres ven el mismo vector. Al cambiar y[1], R hace una copia para y, y x se queda como estaba."},"archivo":"datos/trazas/02-vectores-3.json"}
```

La copia se puede ver con `tracemem()`, que avisa cada vez que R copia un vector:

```r
x <- c(1, 2, 3)
tracemem(x)    # "<0x556b2e7c1858>": la dirección del vector en memoria
y <- x         # nada: y apunta al mismo sitio
y[1] <- 99     # tracemem[0x556b2e7c1858 -> 0x556b2e7c17b8]: aquí se copia
```

Las direcciones cambian en cada ordenador y en cada sesión. Lo que importa es que la copia aparece en la tercera línea, no en la segunda. Esto explica por qué hacer crecer un vector dentro de un bucle es lento: cada `z <- c(z, nuevo)` crea un vector nuevo y copia todo lo anterior. Por eso en el programa del reciclado `z` se crea entero desde el principio, con `numeric(length(x))`.
:::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Sumar 1 a cada elemento de `x`:

| R | Python | Julia |
|---|---|---|
| `x + 1` | `[v + 1 for v in x]` | `x .+ 1` |

R vectoriza siempre, sin pedirlo. Python, con sus listas, necesita recorrerlas (o la biblioteca NumPy, que vectoriza como R). Julia lo pide de forma explícita con el punto: `.+` significa «suma elemento a elemento».
:::

## Conexiones

- La vectorización lleva a los **filtros**: `notas[notas >= 5]` elige las casillas que cumplen una condición. Es el [siguiente capítulo](03-indices-filtros.md).
- El vector lógico que da una comparación es la base de `sum()` y `mean()` para contar y para calcular proporciones, que usarás en toda la parte de análisis de datos.
- Las columnas de un **data frame** son vectores: todo lo de este capítulo vale para cada columna de una tabla.

## La grieta

Ya sabes operar con todas las casillas a la vez. Pero ¿y si solo quieres algunas: las notas aprobadas, el tercer elemento o todos menos el primero? Para eso hacen falta los **índices**.

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   x <- c(2, 4, 6)
   x * c(1, 10, 100)
   ```

2. **Reciclado a mano.** ¿Qué da `1:6 * c(1, -1)`? ¿Da aviso?

3. **Tipos que se mezclan.** ¿Qué devuelven `c(1, "2", 3)` y `sum(c(TRUE, FALSE, TRUE, TRUE))`?

4. **El IVA.** Con `precios <- c(10, 25.5, 8)`, escribe una sola línea que dé los precios con un 21 % de IVA.

5. **La proporción.** Con `notas <- c(4.2, 7, 3.5, 8)`, calcula en una línea qué proporción de alumnos aprobó (nota ≥ 5) sin subir el medio punto.

:::{div}
:class: afondo
6. **Dos nombres.** Predice qué imprimen las dos últimas líneas y explica en qué momento se copia el vector.

   ```r
   a <- 1:3
   b <- a
   a[2] <- 10L
   a
   b
   ```
:::

## Solucionario

1. `2 40 600`. Los dos vectores tienen la misma longitud: se multiplica casilla a casilla.
2. `1 -2 3 -4 5 -6`. No da aviso, porque 6 es múltiplo de 2.
3. `"1" "2" "3"`: el texto gana y los números se convierten en texto. Y `3`, porque cada `TRUE` cuenta como 1.
4. `precios * 1.21`, que da `12.100 30.855 9.680`.
5. `mean(notas >= 5)`, que da `0.5`: aprueban 2 de 4.

:::{div}
:class: afondo
6. `a` vale `1 10 3` y `b` vale `1 2 3`. Después de `b <- a` los dos nombres ven el mismo vector. La copia se hace en `a[2] <- 10L`, cuando uno de los dos se modifica, y desde ese momento cada uno tiene el suyo.
:::
