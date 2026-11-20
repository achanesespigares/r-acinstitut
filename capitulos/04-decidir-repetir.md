---
title: "Decidir y repetir: if, for y while"
subtitle: Programas que eligen camino y que insisten
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

La profesora ya no quiere solo números. Al lado de cada nota quiere una palabra: «sobresaliente» si llega al 9, «aprobado» si llega al 5 y «suspendido» si no. En la hoja de cálculo escribe una fórmula con un `SI` dentro de otro `SI` y la arrastra hasta abajo.

Su compañero de Economía tiene otra pregunta: si deja 1000 € al 10 % de interés anual, ¿cuántos años tardan en convertirse en 2000 €? No sabe cuántas veces tendrá que multiplicar. Sabe cuándo parar.

## La pregunta

Hasta ahora, los programas hacen siempre lo mismo, línea tras línea, de arriba abajo. ¿Cómo se escribe un programa que elija qué hacer según los datos, y que repita algo tantas veces como haga falta?

## La idea

Hay tres piezas, y con ellas se escribe cualquier programa:

- `if` y `else` **eligen** entre dos caminos según una condición;
- `for` **repite** un bloque una vez por cada elemento de un vector;
- `while` **repite** un bloque mientras una condición sea `TRUE`.

Las tres llevan su bloque entre llaves, `{ }`. Y R añade una cuarta, muy suya: `ifelse()` decide casilla a casilla en un vector entero, sin escribir ningún bucle.

:::{important} `if` pide un solo `TRUE` o `FALSE`
La condición de un `if` tiene que ser **un único** valor lógico. Si le das un vector, como `notas >= 5`, R se detiene con un error («the condition has length > 1»; este mensaje R no lo traduce). Para decidir en cada casilla de un vector se usa `ifelse()`, o un `for` con un `if` dentro.
:::

## Construcción

### 1 · Elegir un camino: `if`, `else if` y `else`

`if` comprueba su condición. Si es `TRUE`, ejecuta su bloque. Si no, pasa al `else`, que puede ser otro `if`. R prueba las condiciones **en orden** y se queda con la primera que se cumple.

```{code-cell} r
nota <- 6.5
if (nota >= 9) {
  "sobresaliente"
} else if (nota >= 5) {
  "aprobado"
} else {
  "suspendido"
}
```

Con un 6.5, la primera condición es `FALSE` y la segunda es `TRUE`: el resultado es `"aprobado"`, y el último bloque ni se mira. El orden importa. Si la pregunta por el 5 fuera la primera, un 9.5 saldría «aprobado».

:::{warning} El `else`, en la misma línea que la llave
Escribe siempre `} else {` en una sola línea. Si pones el `else` en una línea nueva, R puede dar por acabado el `if` al ver la llave de cierre, y el `else` suelto da un error: «inesperado 'else'».
:::

### 2 · Decidir en todo el vector: `ifelse()`

`ifelse(condición, sí, no)` hace lo mismo que el `SI` de la hoja de cálculo: mira la condición casilla a casilla y en cada una pone el valor del «sí» o el del «no».

```{code-cell} r
notas <- c(4.2, 7, 3.5, 9.1)
ifelse(notas >= 5, "aprobado", "suspendido")
ifelse(notas >= 9, "sobresaliente", ifelse(notas >= 5, "aprobado", "suspendido"))
```

La primera línea da `"suspendido" "aprobado" "suspendido" "aprobado"`. Para tres categorías, se mete un `ifelse()` dentro de otro, como los `SI` anidados: la segunda línea da `"suspendido" "aprobado" "suspendido" "sobresaliente"`.

### 3 · Repetir con `for`, decidiendo en cada vuelta

`ifelse()` lo resuelve en una línea, pero esconde lo que pasa por dentro. Este es el programa estrella del capítulo: un `for` visita las notas una a una y, en cada vuelta, un `if` elige la palabra.

:::{tip} Predice
¿Cuántas condiciones comprueba R con la nota 9.1? ¿Y con la nota 4.2?
:::

```{code-cell} r
notas <- c(4.2, 7, 3.5, 9.1)
calif <- character(length(notas))
for (i in seq_along(notas)) {
  if (notas[i] >= 9) {
    calif[i] <- "sobresaliente"
  } else if (notas[i] >= 5) {
    calif[i] <- "aprobado"
  } else {
    calif[i] <- "suspendido"
  }
}
calif
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Una palabra para cada nota","etiqueta":"for + if","idea":"El puntero recorre calif. En cada vuelta, R prueba las condiciones en orden y se queda con la primera que se cumple. Fíjate en cuántas comprueba con cada nota.","foco":"calif","puntero":"i","columnas":["i","notas[i]","calif[i]"],"fila_en":"fin_iteracion"},"traza":{"codigo":"notas <- c(4.2, 7, 3.5, 9.1)\ncalif <- character(length(notas))\nfor (i in seq_along(notas)) {\n  if (notas[i] >= 9) {\n    calif[i] <- \"sobresaliente\"\n  } else if (notas[i] >= 5) {\n    calif[i] <- \"aprobado\"\n  } else {\n    calif[i] <- \"suspendido\"\n  }\n}\ncalif","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"\"","\"\"","\"\"","\"\""]}},"salida":"","nfilas":0},{"linea":3,"tipo":"vuelta","vuelta":1,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"\"","\"\"","\"\"","\"\""]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":4,"tipo":"condicion","cond":{"texto":"notas[i] >= 9","valores":"4.2 >= 9","valor":"FALSE"},"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"\"","\"\"","\"\"","\"\""]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":6,"tipo":"condicion","cond":{"texto":"notas[i] >= 5","valores":"4.2 >= 5","valor":"FALSE"},"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"\"","\"\"","\"\"","\"\""]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":9,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"\"","\"\"","\"\""]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"vuelta","vuelta":2,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"\"","\"\"","\"\""]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":4,"tipo":"condicion","cond":{"texto":"notas[i] >= 9","valores":"7 >= 9","valor":"FALSE"},"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"\"","\"\"","\"\""]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":6,"tipo":"condicion","cond":{"texto":"notas[i] >= 5","valores":"7 >= 5","valor":"TRUE"},"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"\"","\"\"","\"\""]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"\"","\"\""]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":3,"tipo":"vuelta","vuelta":3,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"\"","\"\""]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":4,"tipo":"condicion","cond":{"texto":"notas[i] >= 9","valores":"3.5 >= 9","valor":"FALSE"},"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"\"","\"\""]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":6,"tipo":"condicion","cond":{"texto":"notas[i] >= 5","valores":"3.5 >= 5","valor":"FALSE"},"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"\"","\"\""]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":9,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"suspendido\"","\"\""]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":3,"tipo":"vuelta","vuelta":4,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"suspendido\"","\"\""]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":3},{"linea":4,"tipo":"condicion","cond":{"texto":"notas[i] >= 9","valores":"9.1 >= 9","valor":"TRUE"},"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"suspendido\"","\"\""]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":3},{"linea":5,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"suspendido\"","\"sobresaliente\""]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":3},{"linea":3,"tipo":"fin","vuelta":4,"estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"suspendido\"","\"sobresaliente\""]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":4},{"linea":12,"tipo":"linea","estado":{"notas":{"t":"numeric","v":["4.2","7","3.5","9.1"]},"calif":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"suspendido\"","\"sobresaliente\""]},"i":{"t":"integer","v":["4"]}},"salida":"[1] \"suspendido\"    \"aprobado\"      \"suspendido\"    \"sobresaliente\"\n","nfilas":4}],"filas":[{"i":"1","notas[i]":"4.2","calif[i]":"\"suspendido\""},{"i":"2","notas[i]":"7","calif[i]":"\"aprobado\""},{"i":"3","notas[i]":"3.5","calif[i]":"\"suspendido\""},{"i":"4","notas[i]":"9.1","calif[i]":"\"sobresaliente\""}]}}
```

Con el 9.1 basta **una** comprobación: la primera ya es `TRUE`. Con el 4.2 hacen falta **dos**, y como ninguna se cumple, el programa acaba en el `else`. `character(length(notas))` crea un vector de 4 textos vacíos, `""`, que el bucle va rellenando. Al final, `calif` vale lo mismo que el `ifelse()` anidado.

### 4 · Repetir mientras haga falta: `while`

El `for` sabe desde el principio cuántas vueltas dará: una por elemento. Cuando no lo sabes y solo sabes **cuándo parar**, se usa `while`. Antes de cada vuelta comprueba su condición. Si es `TRUE`, da la vuelta; si es `FALSE`, el bucle termina.

:::{tip} Predice
Cada año el dinero se multiplica por 1.10. ¿Cuántos años tardan 1000 € en llegar a 2000 €: menos de 10 o más de 10?
:::

```{code-cell} r
dinero <- 1000
anios <- 0
while (dinero < 2000) {
  dinero <- dinero * 1.10
  anios <- anios + 1
}
anios
round(dinero, 2)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"¿Cuándo se duplica el ahorro?","etiqueta":"while","idea":"Antes de cada vuelta, el while mira si dinero sigue por debajo de 2000. El bucle no sabe cuántas vueltas dará: se detiene la primera vez que la condición es FALSE.","columnas":["anios","dinero"],"fila_en":"fin_iteracion"},"traza":{"codigo":"dinero <- 1000\nanios <- 0\nwhile (dinero < 2000) {\n  dinero <- dinero * 1.10\n  anios <- anios + 1\n}\nanios\nround(dinero, 2)","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1000"]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1000"]},"anios":{"t":"numeric","v":["0"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"1000 < 2000","valor":"TRUE"},"estado":{"dinero":{"t":"numeric","v":["1000"]},"anios":{"t":"numeric","v":["0"]}},"salida":"","nfilas":0},{"linea":4,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1100"]},"anios":{"t":"numeric","v":["0"]}},"salida":"","nfilas":0},{"linea":5,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1100"]},"anios":{"t":"numeric","v":["1"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"1100 < 2000","valor":"TRUE"},"estado":{"dinero":{"t":"numeric","v":["1100"]},"anios":{"t":"numeric","v":["1"]}},"salida":"","nfilas":1},{"linea":4,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1210"]},"anios":{"t":"numeric","v":["1"]}},"salida":"","nfilas":1},{"linea":5,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1210"]},"anios":{"t":"numeric","v":["2"]}},"salida":"","nfilas":1},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"1210 < 2000","valor":"TRUE"},"estado":{"dinero":{"t":"numeric","v":["1210"]},"anios":{"t":"numeric","v":["2"]}},"salida":"","nfilas":2},{"linea":4,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1331"]},"anios":{"t":"numeric","v":["2"]}},"salida":"","nfilas":2},{"linea":5,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1331"]},"anios":{"t":"numeric","v":["3"]}},"salida":"","nfilas":2},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"1331 < 2000","valor":"TRUE"},"estado":{"dinero":{"t":"numeric","v":["1331"]},"anios":{"t":"numeric","v":["3"]}},"salida":"","nfilas":3},{"linea":4,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1464.1"]},"anios":{"t":"numeric","v":["3"]}},"salida":"","nfilas":3},{"linea":5,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1464.1"]},"anios":{"t":"numeric","v":["4"]}},"salida":"","nfilas":3},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"1464.1 < 2000","valor":"TRUE"},"estado":{"dinero":{"t":"numeric","v":["1464.1"]},"anios":{"t":"numeric","v":["4"]}},"salida":"","nfilas":4},{"linea":4,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1610.51"]},"anios":{"t":"numeric","v":["4"]}},"salida":"","nfilas":4},{"linea":5,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1610.51"]},"anios":{"t":"numeric","v":["5"]}},"salida":"","nfilas":4},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"1610.51 < 2000","valor":"TRUE"},"estado":{"dinero":{"t":"numeric","v":["1610.51"]},"anios":{"t":"numeric","v":["5"]}},"salida":"","nfilas":5},{"linea":4,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1771.561"]},"anios":{"t":"numeric","v":["5"]}},"salida":"","nfilas":5},{"linea":5,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1771.561"]},"anios":{"t":"numeric","v":["6"]}},"salida":"","nfilas":5},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"1771.561 < 2000","valor":"TRUE"},"estado":{"dinero":{"t":"numeric","v":["1771.561"]},"anios":{"t":"numeric","v":["6"]}},"salida":"","nfilas":6},{"linea":4,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1948.717"]},"anios":{"t":"numeric","v":["6"]}},"salida":"","nfilas":6},{"linea":5,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["1948.717"]},"anios":{"t":"numeric","v":["7"]}},"salida":"","nfilas":6},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"1948.717 < 2000","valor":"TRUE"},"estado":{"dinero":{"t":"numeric","v":["1948.717"]},"anios":{"t":"numeric","v":["7"]}},"salida":"","nfilas":7},{"linea":4,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["2143.589"]},"anios":{"t":"numeric","v":["7"]}},"salida":"","nfilas":7},{"linea":5,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["2143.589"]},"anios":{"t":"numeric","v":["8"]}},"salida":"","nfilas":7},{"linea":3,"tipo":"condicion","cond":{"texto":"dinero < 2000","valores":"2143.589 < 2000","valor":"FALSE"},"estado":{"dinero":{"t":"numeric","v":["2143.589"]},"anios":{"t":"numeric","v":["8"]}},"salida":"","nfilas":8},{"linea":3,"tipo":"fin","vuelta":0,"estado":{"dinero":{"t":"numeric","v":["2143.589"]},"anios":{"t":"numeric","v":["8"]}},"salida":"","nfilas":8},{"linea":7,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["2143.589"]},"anios":{"t":"numeric","v":["8"]}},"salida":"[1] 8\n","nfilas":8},{"linea":8,"tipo":"linea","estado":{"dinero":{"t":"numeric","v":["2143.589"]},"anios":{"t":"numeric","v":["8"]}},"salida":"[1] 8\n[1] 2143.59\n","nfilas":8}],"filas":[{"anios":"1","dinero":"1100"},{"anios":"2","dinero":"1210"},{"anios":"3","dinero":"1331"},{"anios":"4","dinero":"1464.1"},{"anios":"5","dinero":"1610.51"},{"anios":"6","dinero":"1771.561"},{"anios":"7","dinero":"1948.717"},{"anios":"8","dinero":"2143.589"}]}}
```

Hacen falta **8 años**: al séptimo hay 1948.72 €, todavía por debajo de 2000, y al octavo, 2143.59 €. En ese momento la condición pasa a ser `FALSE` y el bucle se detiene.

Un `while` necesita que algo dentro del bloque acerque la condición a `FALSE`. Si el interés fuera del 0 %, `dinero` no cambiaría nunca y el bucle no terminaría: es un **bucle infinito**. En RStudio se para con el botón rojo de la consola, o con la tecla Esc.

### 5 · Cortar a tiempo: `break` y `next`

Dentro de un bucle hay dos órdenes que cambian el camino:

- `break` **corta** el bucle en ese mismo momento, sin dar las vueltas que quedaban;
- `next` **salta** al final de la vuelta actual y pasa a la siguiente.

Un sensor manda lecturas, y una lectura negativa significa que se ha estropeado. A partir de ella, nada es fiable:

```{code-cell} r
lecturas <- c(3, 8, -1, 5)
for (v in lecturas) {
  if (v < 0) {
    break
  }
  print(v)
}
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"El sensor se estropea","etiqueta":"break","idea":"En la tercera vuelta, v vale -1 y el break corta el bucle. El 5 no llega a imprimirse.","columnas":["v"],"fila_en":"fin_iteracion"},"traza":{"codigo":"lecturas <- c(3, 8, -1, 5)\nfor (v in lecturas) {\n  if (v < 0) {\n    break\n  }\n  print(v)\n}","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]}},"salida":"","nfilas":0},{"linea":2,"tipo":"vuelta","vuelta":1,"estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["3"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"condicion","cond":{"texto":"v < 0","valores":"3 < 0","valor":"FALSE"},"estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["3"]}},"salida":"","nfilas":0},{"linea":6,"tipo":"linea","estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["3"]}},"salida":"[1] 3\n","nfilas":0},{"linea":2,"tipo":"vuelta","vuelta":2,"estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["8"]}},"salida":"[1] 3\n","nfilas":1},{"linea":3,"tipo":"condicion","cond":{"texto":"v < 0","valores":"8 < 0","valor":"FALSE"},"estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["8"]}},"salida":"[1] 3\n","nfilas":1},{"linea":6,"tipo":"linea","estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["8"]}},"salida":"[1] 3\n[1] 8\n","nfilas":1},{"linea":2,"tipo":"vuelta","vuelta":3,"estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["-1"]}},"salida":"[1] 3\n[1] 8\n","nfilas":2},{"linea":3,"tipo":"condicion","cond":{"texto":"v < 0","valores":"-1 < 0","valor":"TRUE"},"estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["-1"]}},"salida":"[1] 3\n[1] 8\n","nfilas":2},{"linea":4,"tipo":"linea","estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["-1"]}},"salida":"[1] 3\n[1] 8\n","nfilas":2},{"linea":2,"tipo":"fin","vuelta":3,"estado":{"lecturas":{"t":"numeric","v":["3","8","-1","5"]},"v":{"t":"numeric","v":["-1"]}},"salida":"[1] 3\n[1] 8\n","nfilas":2}],"filas":[{"v":"3"},{"v":"8"}]}}
```

Se imprimen el 3 y el 8. Al llegar el -1, `break` saca al programa del bucle, y el 5 ya no se mira. Con `next` en lugar de `break`, el -1 se saltaría y el 5 sí se imprimiría. `next` es lo habitual para saltarse los datos que faltan: `if (is.na(v)) next`.

:::{div}
:class: afondo
### 6 · Tres trampas de los bucles en R

**El vector vacío.** `1:length(x)` parece lo mismo que `seq_along(x)`, pero no lo es cuando `x` está vacío. `length(x)` vale 0, y `1:0` no es «nada»: es el vector `1 0`, que cuenta hacia atrás. El bucle da dos vueltas que no debería dar.

```{code-cell} r
x <- c()
1:length(x)
seq_along(x)
for (i in 1:length(x)) {
  print(x[i])
}
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"El bucle que no debía empezar","etiqueta":"a fondo · 1:length(x)","idea":"x está vacío, pero 1:length(x) vale 1 0. El for da dos vueltas, con i = 1 y con i = 0, y en cada una imprime NULL. Con seq_along(x) no daría ninguna.","columnas":["i"],"fila_en":"fin_iteracion"},"traza":{"codigo":"x <- c()\n1:length(x)\nseq_along(x)\nfor (i in 1:length(x)) {\n  print(x[i])\n}","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"x":{"t":"NULL","v":[]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"x":{"t":"NULL","v":[]}},"salida":"[1] 1 0\n","nfilas":0},{"linea":3,"tipo":"linea","estado":{"x":{"t":"NULL","v":[]}},"salida":"[1] 1 0\ninteger(0)\n","nfilas":0},{"linea":4,"tipo":"vuelta","vuelta":1,"estado":{"x":{"t":"NULL","v":[]},"i":{"t":"integer","v":["1"]}},"salida":"[1] 1 0\ninteger(0)\n","nfilas":0},{"linea":5,"tipo":"linea","estado":{"x":{"t":"NULL","v":[]},"i":{"t":"integer","v":["1"]}},"salida":"[1] 1 0\ninteger(0)\nNULL\n","nfilas":0},{"linea":4,"tipo":"vuelta","vuelta":2,"estado":{"x":{"t":"NULL","v":[]},"i":{"t":"integer","v":["0"]}},"salida":"[1] 1 0\ninteger(0)\nNULL\n","nfilas":1},{"linea":5,"tipo":"linea","estado":{"x":{"t":"NULL","v":[]},"i":{"t":"integer","v":["0"]}},"salida":"[1] 1 0\ninteger(0)\nNULL\nNULL\n","nfilas":1},{"linea":4,"tipo":"fin","vuelta":2,"estado":{"x":{"t":"NULL","v":[]},"i":{"t":"integer","v":["0"]}},"salida":"[1] 1 0\ninteger(0)\nNULL\nNULL\n","nfilas":2}],"filas":[{"i":"1"},{"i":"0"}]}}
```

`1:length(x)` da `1 0`, y `seq_along(x)` da `integer(0)`, un vector vacío de enteros. El bucle imprime `NULL` dos veces. Con `seq_along()`, que es lo que usan todos los programas de este libro, no habría dado ninguna vuelta.

**El `NA` en la condición.** `if (NA > 5)` no sabe qué camino tomar y se detiene: «valor ausente donde TRUE/FALSE es necesario». Si los datos pueden traer `NA`, compruébalo antes con `is.na()`, como en el `next` del apartado anterior.

**`&&` frente a `&`.** `&` y `|` trabajan casilla a casilla y devuelven un vector: son los de los filtros. `&&` y `||` exigen **un solo** valor a cada lado y devuelven un solo valor: son los de los `if`. Además, `&&` no mira la parte derecha si la izquierda ya es `FALSE`. Por eso esta condición es segura con un vector vacío:

```r
x <- c()
length(x) > 0 && x[1] > 5    # FALSE: la parte derecha ni se evalúa
length(x) > 0 &  x[1] > 5    # logical(0): un if con esto da error
```

`if (length(x) > 0 & x[1] > 5)` se detiene con «argumento tiene longitud cero». Con `&&` funciona.

Y una costumbre de R: si una operación se puede vectorizar, no se escribe un bucle. `ifelse(notas >= 5, ...)` hace por dentro el mismo recorrido que el `for` del apartado 3, pero en código compilado. Con millones de casillas es mucho más rápido. Los bucles quedan para lo que no se puede vectorizar: un `while` como el del ahorro, en el que cada vuelta depende de la anterior.
:::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
| | R | Python | Julia |
|---|---|---|---|
| Elegir | `if (x > 0) { … } else if (x < 0) { … } else { … }` | `if x > 0:` … `elif x < 0:` … `else:` … | `if x > 0` … `elseif x < 0` … `else` … `end` |
| Recorrer | `for (v in x) { … }` | `for v in x:` … | `for v in x` … `end` |
| Mientras | `while (cond) { … }` | `while cond:` … | `while cond` … `end` |

Las tres piezas son las mismas en los tres lenguajes. Lo que cambia es cómo se marca dónde acaba el bloque: R usa llaves, Python usa la sangría y Julia cierra cada bloque con `end`. El `else if` de R es `elif` en Python y `elseif`, todo junto, en Julia.
:::

## Conexiones

- En la parte III, `case_when()` de dplyr hace lo que el `ifelse()` anidado, pero se lee mejor cuando hay muchas categorías.
- La **simulación** repite un experimento miles de veces, como lanzar una moneda, con un `for` o con funciones que lo vectorizan.
- `which()`, `any()` y `all()`, del capítulo anterior, son las condiciones de muchos `if`: `if (any(notas < 5))` pregunta si hay algún suspenso.

## La grieta

El bloque que pone «sobresaliente», «aprobado» o «suspendido» ya funciona. Pero si lo necesitas en tres programas, ¿lo copias tres veces? ¿Y si mañana el aprobado pasa a estar en el 6? Tendrías que cambiarlo en los tres sitios sin olvidarte de ninguno. Hace falta poner un nombre a un trozo de código y reutilizarlo: hacen falta las [**funciones**](05-funciones.md).

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   x <- 7
   if (x %% 2 == 0) "par" else "impar"
   ```

2. **El termómetro.** Con `t <- c(-2, 15, 31)`, escribe una línea con `ifelse()` que dé `"hielo"` por debajo de 0, `"calor"` por encima de 30 y `"normal"` en el resto.

3. **Sumar con un bucle.** Escribe un `for` que sume los números del 1 al 10 en una variable `total`. Comprueba el resultado con `sum(1:10)`.

4. **El ahorro al 5 %.** Cambia el programa del ahorro para un interés del 5 %. ¿Cuántos años tardan 1000 € en llegar a 2000 €?

5. **La conjetura de Collatz.** Empieza con `n <- 6`. Mientras `n` no valga 1: si es par, divídelo entre 2; si es impar, cámbialo por `3 * n + 1`. Cuenta los pasos con un `while`. ¿Cuántos son?

6. **El primer suspenso.** Con `notas <- c(6, 7.5, 4, 9)`, escribe un `for` que imprima la posición del primer suspenso y salga del bucle con `break`. ¿Qué línea, con una función del capítulo 3, da lo mismo?

:::{div}
:class: afondo
7. **El bucle vacío.** Predice qué imprime este programa y corrígelo para que no imprima nada.

   ```r
   x <- c()
   for (i in 1:length(x)) {
     print(x[i])
   }
   ```

8. **Dos «y».** Con `x <- c()`, ¿qué dan `length(x) > 0 && x[1] > 5` y `length(x) > 0 & x[1] > 5`? ¿Cuál de las dos puedes poner en un `if` sin que dé error?
:::

## Solucionario

1. `"impar"`: 7 entre 2 da resto 1, así que la condición es `FALSE` y se ejecuta el `else`.
2. `ifelse(t < 0, "hielo", ifelse(t > 30, "calor", "normal"))`, que da `"hielo" "normal" "calor"`.
3. Con `total <- 0` y `for (k in 1:10) total <- total + k`, `total` vale `55`, lo mismo que `sum(1:10)`.
4. Con `dinero * 1.05`, hacen falta **15 años**: al final hay 2078.93 €.
5. **8 pasos**: 6, 3, 10, 5, 16, 8, 4, 2, 1.
6. `for (i in seq_along(notas)) { if (notas[i] < 5) { print(i); break } }` imprime `3`. Con una sola línea, `which(notas < 5)[1]`.

:::{div}
:class: afondo
7. Imprime `NULL` dos veces: `1:length(x)` vale `1 0`. Con `for (i in seq_along(x))` el bucle no da ninguna vuelta.
8. La primera da `FALSE`, porque `&&` ni mira la parte derecha. La segunda da `logical(0)`, un vector vacío, y en un `if` da el error «argumento tiene longitud cero». En un `if` va la de `&&`.
:::
