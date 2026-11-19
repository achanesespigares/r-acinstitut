---
title: "Índices y filtros: elegir casillas"
subtitle: Pedir a un vector solo lo que te interesa
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

La profesora del capítulo anterior ya ha subido medio punto a toda la clase. Ahora quiere escribir a los alumnos que siguen suspendidos. En la hoja de cálculo no repasa la columna con el dedo: pone un filtro, elige «menor que 5» y la hoja le enseña solo esas filas.

## La pregunta

Con los vectores sabemos trabajar con todas las casillas a la vez. Pero muchas veces solo interesan algunas: la tercera nota, todas menos la primera, la nota de Marta o las notas suspendidas. ¿Cómo se le pide a R una parte de un vector?

## La idea

Entre corchetes, detrás del nombre del vector, se escribe **qué casillas quieres**: `notas[...]`. R entiende tres maneras de decirlo:

- con **posiciones**, contando desde 1: `notas[3]` es la tercera casilla, y un número negativo quita casillas en lugar de elegirlas;
- con **nombres**, si las casillas los tienen: `notas["Marta"]`;
- con un vector **lógico**, un `TRUE` por cada casilla que quieres y un `FALSE` por cada una que no: `notas[notas < 5]`. Esto es un **filtro**.

:::{important} Lo que sale de los corchetes es otro vector
Pidas una casilla o veinte, `notas[...]` devuelve un vector nuevo con las casillas elegidas, en el orden en que las pediste. El vector original no cambia.
:::

## Construcción

### 1 · Índices por posición

Un número entre corchetes es una posición. Un vector de números son varias posiciones, en el orden que quieras, y se pueden repetir. Un número negativo hace lo contrario: **quita** esa casilla y devuelve todas las demás.

```{code-cell} r
notas <- c(4.2, 7, 3.5, 8, 5)
notas[3]
notas[c(1, 3)]
notas[2:4]
notas[-1]
notas[-c(1, 2)]
notas[c(1, 1, 2)]
```

`notas[3]` da `3.5`, y `notas[c(1, 3)]` da `4.2 3.5`. `notas[2:4]` da las casillas de la 2 a la 4: `7.0 3.5 8.0`. `notas[-1]` da todas menos la primera, `7.0 3.5 8.0 5.0`, y `notas[-c(1, 2)]` todas menos las dos primeras, `3.5 8.0 5.0`. Pedir una casilla dos veces la repite: `notas[c(1, 1, 2)]` da `4.2 4.2 7.0`.

Lo que no se puede hacer es mezclar posiciones positivas y negativas. `notas[c(-1, 2)]` da un error: «solamente 0's pueden ser mezclados con subscritos negativos». R no sabe si le pides que elija o que quite.

Para la última casilla no hay atajo: `notas[length(notas)]` da `5`, porque `length(notas)` vale 5.

### 2 · Índices por nombre

Las casillas de un vector pueden tener nombre. Se lo pones con `names()`, y desde ese momento R lo enseña encima de cada valor.

```{code-cell} r
notas <- c(4.2, 7, 3.5, 8, 5)
names(notas) <- c("Ana", "Luis", "Marta", "Pau", "Sara")
notas
notas["Marta"]
notas[c("Ana", "Pau")]
```

`notas["Marta"]` da `3.5` con su nombre encima, y `notas[c("Ana", "Pau")]` da `4.2 8.0`. Un nombre es más claro que una posición: `notas["Marta"]` se entiende sin contar casillas y sigue funcionando aunque cambies el orden del vector.

### 3 · Filtros lógicos

Aquí se juntan los dos capítulos. Una comparación como `notas < 5` da un vector lógico, con un `TRUE` o un `FALSE` por casilla (capítulo 2). Y un vector lógico entre corchetes elige las casillas que tienen `TRUE`. Por eso `notas[notas < 5]` se lee «las notas que son menores que 5».

:::{tip} Predice
`notas` vale `4.2 7 3.5 8 5`. ¿Cuántas notas da `notas[notas >= 5]`? ¿Entra el 5?
:::

Este es el programa estrella del capítulo. Hace a mano, con un bucle, lo que R hace por dentro en `notas[notas >= 5]`: primero construye el vector de `TRUE` y `FALSE`, casilla a casilla, y después lo usa para elegir.

```{code-cell} r
notas <- c(4.2, 7, 3.5, 8, 5)
cumple <- logical(length(notas))
for (i in seq_along(notas)) {
  cumple[i] <- notas[i] >= 5
}
cumple
notas[cumple]
notas[notas >= 5]
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Un filtro, por dentro","etiqueta":"filtro · por dentro","idea":"El puntero recorre cumple. En cada vuelta se compara una nota con 5 y se apunta TRUE o FALSE. Al final, notas[cumple] se queda con las casillas que tienen TRUE: lo mismo que da notas[notas >= 5] en una sola línea.","foco":"cumple","puntero":"i","columnas":["i","notas[i]","cumple[i]"],"fila_en":"fin_iteracion"},"traza":{"codigo":"notas <- c(4.2, 7, 3.5, 8, 5)\ncumple <- logical(length(notas))\nfor (i in seq_along(notas)) {\n  cumple[i] <- notas[i] >= 5\n}\ncumple\nnotas[cumple]\nnotas[notas >= 5]","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","FALSE","FALSE","FALSE","FALSE"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"vuelta","vuelta":1,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","FALSE","FALSE","FALSE","FALSE"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":4,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","FALSE","FALSE","FALSE","FALSE"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"vuelta","vuelta":2,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","FALSE","FALSE","FALSE","FALSE"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":4,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","FALSE","FALSE"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":3,"tipo":"vuelta","vuelta":3,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","FALSE","FALSE"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":4,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","FALSE","FALSE"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":3,"tipo":"vuelta","vuelta":4,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","FALSE","FALSE"]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":3},{"linea":4,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","TRUE","FALSE"]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":3},{"linea":3,"tipo":"vuelta","vuelta":5,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","TRUE","FALSE"]},"i":{"t":"integer","v":["5"]}},"salida":"","nfilas":4},{"linea":4,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","TRUE","TRUE"]},"i":{"t":"integer","v":["5"]}},"salida":"","nfilas":4},{"linea":3,"tipo":"fin","vuelta":5,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","TRUE","TRUE"]},"i":{"t":"integer","v":["5"]}},"salida":"","nfilas":5},{"linea":6,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","TRUE","TRUE"]},"i":{"t":"integer","v":["5"]}},"salida":"[1] FALSE  TRUE FALSE  TRUE  TRUE\n","nfilas":5},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","TRUE","TRUE"]},"i":{"t":"integer","v":["5"]}},"salida":"[1] FALSE  TRUE FALSE  TRUE  TRUE\n[1] 7 8 5\n","nfilas":5},{"linea":8,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","8","5"]},"cumple":{"t":"logical","v":["FALSE","TRUE","FALSE","TRUE","TRUE"]},"i":{"t":"integer","v":["5"]}},"salida":"[1] FALSE  TRUE FALSE  TRUE  TRUE\n[1] 7 8 5\n[1] 7 8 5\n","nfilas":5}],"filas":[{"i":"1","notas[i]":"4.2","cumple[i]":"FALSE"},{"i":"2","notas[i]":"7","cumple[i]":"TRUE"},{"i":"3","notas[i]":"3.5","cumple[i]":"FALSE"},{"i":"4","notas[i]":"8","cumple[i]":"TRUE"},{"i":"5","notas[i]":"5","cumple[i]":"TRUE"}]}}
```

`logical(length(notas))` crea un vector lógico de 5 casillas, todas `FALSE`, y el bucle lo va rellenando. Al final, `cumple` vale `FALSE TRUE FALSE TRUE TRUE` y `notas[cumple]` da `7 8 5`. El 5 entra porque la condición es `>=`.

Las condiciones se combinan con `&` (y) y `|` (o), que también trabajan casilla a casilla. Y hay tres funciones que responden preguntas sobre un vector lógico:

- `which()` dice **en qué posiciones** está el `TRUE`;
- `any()` dice si hay **al menos un** `TRUE`;
- `all()` dice si **todos** son `TRUE`.

```{code-cell} r
notas <- c(4.2, 7, 3.5, 8, 5)
notas[notas >= 5 & notas < 8]
which(notas < 5)
any(notas < 4)
all(notas >= 3.5)
```

`notas[notas >= 5 & notas < 8]` da `7 5`: aprobadas, pero sin llegar al 8. `which(notas < 5)` da `1 3`, las posiciones de los suspensos. `any(notas < 4)` da `TRUE`, porque el 3.5 es menor que 4. Y `all(notas >= 3.5)` también da `TRUE`: ninguna nota baja de 3.5.

Un filtro también sirve para **cambiar** casillas. Si pones el filtro a la izquierda de `<-`, el valor nuevo va solo a las casillas elegidas: con `notas[notas < 5] <- 5`, quien tenía menos de un 5 pasa a tener un 5, y el resto no se toca. El vector queda en `5 7 5 8 5`.

:::{div}
:class: afondo
### 4 · Casillas que no existen y los `NA` que se cuelan

Pedir una casilla que no existe no da error: da `NA`, el valor que falta (capítulo 1). Con `notas` de 5 casillas, `notas[10]` da `NA`. Y si **guardas** algo en una casilla que no existe, R alarga el vector y rellena el hueco con `NA`.

Los `NA` también se cuelan en los filtros. Si una nota falta, `NA >= 5` no es ni `TRUE` ni `FALSE`: es `NA`, porque R no sabe qué nota es. Y un `NA` entre corchetes da una casilla `NA` en el resultado.

```{code-cell} r
x <- c(1, 2, 3)
x[10]
x[6] <- 9
x
y <- c(4.2, NA, 7, 3.5)
y >= 5
y[y >= 5]
y[which(y >= 5)]
y[!is.na(y) & y >= 5]
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"El hueco se rellena con NA","etiqueta":"a fondo · NA","idea":"Al guardar en x[6] un vector de 3 casillas, R lo alarga hasta 6 y rellena las casillas 4 y 5 con NA. Después, el NA de y pasa a través del filtro y >= 5 y aparece en el resultado."},"traza":{"codigo":"x <- c(1, 2, 3)\nx[10]\nx[6] <- 9\nx\ny <- c(4.2, NA, 7, 3.5)\ny >= 5\ny[y >= 5]\ny[which(y >= 5)]\ny[!is.na(y) & y >= 5]","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3"]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3"]}},"salida":"[1] NA\n","nfilas":0},{"linea":3,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3","NA","NA","9"]}},"salida":"[1] NA\n","nfilas":0},{"linea":4,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3","NA","NA","9"]}},"salida":"[1] NA\n[1]  1  2  3 NA NA  9\n","nfilas":0},{"linea":5,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3","NA","NA","9"]},"y":{"t":"numeric","v":["4.2","NA","7","3.5"]}},"salida":"[1] NA\n[1]  1  2  3 NA NA  9\n","nfilas":0},{"linea":6,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3","NA","NA","9"]},"y":{"t":"numeric","v":["4.2","NA","7","3.5"]}},"salida":"[1] NA\n[1]  1  2  3 NA NA  9\n[1] FALSE    NA  TRUE FALSE\n","nfilas":0},{"linea":7,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3","NA","NA","9"]},"y":{"t":"numeric","v":["4.2","NA","7","3.5"]}},"salida":"[1] NA\n[1]  1  2  3 NA NA  9\n[1] FALSE    NA  TRUE FALSE\n[1] NA  7\n","nfilas":0},{"linea":8,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3","NA","NA","9"]},"y":{"t":"numeric","v":["4.2","NA","7","3.5"]}},"salida":"[1] NA\n[1]  1  2  3 NA NA  9\n[1] FALSE    NA  TRUE FALSE\n[1] NA  7\n[1] 7\n","nfilas":0},{"linea":9,"tipo":"linea","estado":{"x":{"t":"numeric","v":["1","2","3","NA","NA","9"]},"y":{"t":"numeric","v":["4.2","NA","7","3.5"]}},"salida":"[1] NA\n[1]  1  2  3 NA NA  9\n[1] FALSE    NA  TRUE FALSE\n[1] NA  7\n[1] 7\n[1] 7\n","nfilas":0}],"filas":[]}}
```

`x[10]` da `NA`. Después de `x[6] <- 9`, `x` vale `1 2 3 NA NA 9`. En el filtro, `y >= 5` da `FALSE NA TRUE FALSE`, y `y[y >= 5]` da `NA 7`: la nota que falta se ha colado. Hay dos maneras de evitarlo:

- `which()` solo devuelve las posiciones con `TRUE` y deja fuera los `NA`, así que `y[which(y >= 5)]` da `7`;
- `!is.na(y)` vale `TRUE` donde hay dato, y combinado con `&` también da `7`.

Un último detalle: un índice lógico más corto que el vector **se recicla**, como en el capítulo 2. `notas[c(TRUE, FALSE)]` no da solo la primera nota: da las casillas 1, 3 y 5, porque `TRUE FALSE` se repite hasta cubrir las 5 casillas. Aquí R no avisa, ni siquiera cuando la longitud no es múltiplo.
:::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La primera casilla, la última y todas menos la primera:

| | R | Python | Julia |
|---|---|---|---|
| Primera | `x[1]` | `x[0]` | `x[1]` |
| Última | `x[length(x)]` | `x[-1]` | `x[end]` |
| Todas menos la primera | `x[-1]` | `x[1:]` | `x[2:end]` |

R y Julia cuentan desde 1, como contamos las personas. Python cuenta desde 0: su posición dice cuántas casillas hay **antes**. Cuidado con `x[-1]`, que en R y en Python significa cosas distintas: en R quita la primera casilla, y en Python es la última.
:::

## Conexiones

- Los filtros son la base de casi todo el análisis de datos: en la parte III, `filter()` de dplyr hace lo mismo que `notas[notas >= 5]`, pero con las filas de una tabla.
- `which()`, `any()` y `all()` vuelven en el próximo capítulo, dentro de las condiciones de `if`.
- Los nombres de las casillas son la semilla de las **listas** y de las columnas de un data frame, que también se piden por nombre.

## La grieta

Un filtro elige casillas, pero el programa hace siempre lo mismo con ellas. ¿Y si quieres que el programa tome caminos distintos: escribir «aprobado» o «suspendido» según la nota, o repetir algo hasta que se cumpla una condición? Para eso hace falta **decidir y repetir**.

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   x <- c(10, 20, 30, 40, 50)
   x[c(2, 4)]
   x[-c(2, 4)]
   ```

2. **La última y la penúltima.** Con `x <- c(10, 20, 30, 40, 50)`, escribe una línea que dé las dos últimas casillas y que siga funcionando aunque `x` cambie de longitud.

3. **Las temperaturas.** Con `temps <- c(12, 15, 9, 18, 21, 7)`, escribe una línea que dé las temperaturas que superan la media, y otra que diga en qué posiciones están.

4. **Por nombre.** Con `edades <- c(Ana = 17, Luis = 18, Marta = 16)`, ¿qué dan `edades["Luis"]` y `edades[edades >= 17]`?

5. **¿Hay alguno?** Con `notas <- c(4.2, 7, 3.5, 8, 5)`, ¿qué dan `any(notas == 10)` y `all(notas > 3)`?

6. **El suelo.** Con `notas <- c(4.2, 7, 3.5, 8, 5)`, escribe una línea que ponga un 4 a quien tenga menos de un 4 y deje el resto igual. ¿Qué vale `notas` después?

:::{div}
:class: afondo
7. **El índice corto.** Predice qué dan las dos líneas y explica por qué la segunda no avisa.

   ```r
   x <- c(10, 20, 30, 40, 50)
   x[c(FALSE, TRUE)]
   x[8]
   ```

8. **El NA escondido.** Con `y <- c(6, NA, 3, 9)`, ¿qué dan `y[y > 5]` y `sum(y > 5)`? Corrige las dos para que el `NA` no moleste.
:::

## Solucionario

1. `20 40`, las casillas 2 y 4. Y `10 30 50`, todas menos esas dos.
2. `x[c(length(x) - 1, length(x))]`, que da `40 50`. También vale `x[(length(x) - 1):length(x)]`.
3. `temps[temps > mean(temps)]` da `15 18 21`, porque la media es 13.67. `which(temps > mean(temps))` da `2 4 5`.
4. `edades["Luis"]` da `18` con el nombre `Luis` encima. `edades[edades >= 17]` da Ana y Luis: `17 18`.
5. `FALSE`, porque nadie tiene un 10. Y `TRUE`, porque la nota más baja es 3.5.
6. `notas[notas < 4] <- 4`. Solo cambia el 3.5, y `notas` queda en `4.2 7.0 4.0 8.0 5.0`.

:::{div}
:class: afondo
7. `20 40`: `FALSE TRUE` se recicla en `FALSE TRUE FALSE TRUE FALSE` y elige las casillas pares. Con índices lógicos, R recicla sin avisar aunque 5 no sea múltiplo de 2. `x[8]` da `NA`, porque la casilla 8 no existe.
8. `y[y > 5]` da `6 NA 9`, y `sum(y > 5)` da `NA`. Corregidas: `y[which(y > 5)]` da `6 9`, y `sum(y > 5, na.rm = TRUE)` da `2`.
:::
