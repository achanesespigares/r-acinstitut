---
title: "Matrices y arrays: datos en filas y columnas"
subtitle: Un vector que sabe que es un rectángulo
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

La tutora tiene en su hoja de cálculo las notas de la clase: una fila por alumno y una columna por evaluación. Para saber cómo ha ido la segunda evaluación, selecciona esa columna y calcula la media. Para saber cómo va un alumno, hace lo mismo con su fila. Las filas y las columnas no son un adorno: son la manera de preguntar.

## La pregunta

En el capítulo anterior guardamos la clase como una lista de fichas. Para calcular la media de la segunda evaluación había que entrar en cada ficha, una a una. Pero estos datos son todos números y forman un rectángulo perfecto. ¿Puede R entenderlos como filas y columnas, y responder preguntas por filas o por columnas sin bucles?

## La idea

Una **matriz** es un vector con **dimensiones**: el número de filas y el de columnas. Como un vector, guarda un solo tipo de dato. Se crea con `matrix()`, y cada casilla se señala con dos índices, primero la fila y después la columna:

- `notas[2, 3]` es la casilla de la fila 2 y la columna 3;
- `notas[2, ]`, con la columna vacía, es la fila 2 entera;
- `notas[, 3]`, con la fila vacía, es la columna 3 entera.

Un **array** es lo mismo con más dimensiones. Uno de tres dimensiones es un montón de matrices iguales, una encima de otra, como las hojas de un libro de cálculo.

:::{important} R rellena por columnas
`matrix(1:6, nrow = 2)` coloca los números de arriba abajo y de izquierda a derecha: primero llena la columna 1, después la 2. Es el orden en que R guarda los valores en la memoria. Si los datos vienen por filas, se añade `byrow = TRUE`.
:::

## Construcción

### 1 · Crear una matriz

```{code-cell} r
matrix(1:6, nrow = 2)
matrix(1:6, nrow = 2, byrow = TRUE)
notas <- matrix(c(7, 4, 9, 8.5, 5.5, 9.5, 6, 3, 10), nrow = 3,
                dimnames = list(c("Marta", "Pau", "Sara"), c("1ª", "2ª", "3ª")))
notas
dim(notas)
```

La primera matriz tiene `1 3 5` en la fila de arriba y `2 4 6` en la de abajo: se ha rellenado por columnas. Con `byrow = TRUE`, las filas son `1 2 3` y `4 5 6`.

En `notas`, los nueve números van por columnas: primero las tres notas de la 1ª evaluación, después las de la 2ª y al final las de la 3ª. `dimnames` pone nombre a las filas y a las columnas, y R los usa al enseñar la matriz. `dim(notas)` da `3 3`: tres filas y tres columnas.

### 2 · Elegir filas, columnas y casillas

Los corchetes de una matriz llevan dos huecos, separados por una coma. En cada hueco vale todo lo del capítulo 3: posiciones, nombres y filtros lógicos.

```{code-cell} r
notas <- matrix(c(7, 4, 9, 8.5, 5.5, 9.5, 6, 3, 10), nrow = 3,
                dimnames = list(c("Marta", "Pau", "Sara"), c("1ª", "2ª", "3ª")))
notas[2, 3]
notas["Pau", ]
notas[, "2ª"]
notas[notas < 5]
```

`notas[2, 3]` da `3`, la nota de Pau en la 3ª evaluación. `notas["Pau", ]` da su fila entera, `4.0 5.5 3.0`, y `notas[, "2ª"]` da la columna de la segunda evaluación, `8.5 5.5 9.5`, cada nota con el nombre de su alumno.

Un filtro lógico sin coma trata la matriz como el vector que es por dentro: `notas[notas < 5]` da `4 3`, los dos suspensos, en el orden en que R guarda las casillas, por columnas.

### 3 · La media de cada evaluación, por dentro

Este es el programa estrella del capítulo. Calcula a mano la media de cada columna con dos bucles, uno dentro del otro: el de fuera recorre las columnas y el de dentro, las filas de cada columna. `seq_len(n)` da los números del 1 al `n`, como `seq_along()`, pero a partir de un número.

:::{tip} Predice
¿En qué orden visita el programa las nueve casillas: fila a fila o columna a columna? ¿Cuántas veces se ejecuta la línea `suma <- suma + notas[i, j]`?
:::

```{code-cell} r
notas <- matrix(c(7, 4, 9, 8.5, 5.5, 9.5, 6, 3, 10), nrow = 3,
                dimnames = list(c("Marta", "Pau", "Sara"), c("1ª", "2ª", "3ª")))
medias <- numeric(ncol(notas))
for (j in seq_len(ncol(notas))) {
  suma <- 0
  for (i in seq_len(nrow(notas))) {
    suma <- suma + notas[i, j]
  }
  medias[j] <- suma / nrow(notas)
}
medias
colMeans(notas)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Columna a columna","etiqueta":"matriz · doble bucle","idea":"La casilla marcada es notas[i, j]. El bucle de fuera fija la columna j; el de dentro baja por sus filas, sumando. Al acabar cada columna, su media pasa a medias[j].","foco":"notas","puntero":["i","j"]},"traza":{"codigo":"notas <- matrix(c(7, 4, 9, 8.5, 5.5, 9.5, 6, 3, 10), nrow = 3,\n                dimnames = list(c(\"Marta\", \"Pau\", \"Sara\"), c(\"1ª\", \"2ª\", \"3ª\")))\nmedias <- numeric(ncol(notas))\nfor (j in seq_len(ncol(notas))) {\n  suma <- 0\n  for (i in seq_len(nrow(notas))) {\n    suma <- suma + notas[i, j]\n  }\n  medias[j] <- suma / nrow(notas)\n}\nmedias\ncolMeans(notas)","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]}},"salida":"","nfilas":0},{"linea":3,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]}},"salida":"","nfilas":0},{"linea":4,"tipo":"vuelta","vuelta":1,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":5,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["0"]}},"salida":"","nfilas":0},{"linea":6,"tipo":"vuelta","vuelta":1,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["0"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["7"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":6,"tipo":"vuelta","vuelta":2,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["7"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["11"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":6,"tipo":"vuelta","vuelta":3,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["11"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["20"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":6,"tipo":"fin","vuelta":3,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["0","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["20"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":3},{"linea":9,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["1"]},"suma":{"t":"numeric","v":["20"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":3},{"linea":4,"tipo":"vuelta","vuelta":2,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["20"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":4},{"linea":5,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["0"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":4},{"linea":6,"tipo":"vuelta","vuelta":1,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["0"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":4},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["8.5"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":4},{"linea":6,"tipo":"vuelta","vuelta":2,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["8.5"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":5},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["14"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":5},{"linea":6,"tipo":"vuelta","vuelta":3,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["14"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":6},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["23.5"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":6},{"linea":6,"tipo":"fin","vuelta":3,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","0","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["23.5"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":7},{"linea":9,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["2"]},"suma":{"t":"numeric","v":["23.5"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":7},{"linea":4,"tipo":"vuelta","vuelta":3,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["23.5"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":8},{"linea":5,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["0"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":8},{"linea":6,"tipo":"vuelta","vuelta":1,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["0"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":8},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["6"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":8},{"linea":6,"tipo":"vuelta","vuelta":2,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["6"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":9},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["9"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":9},{"linea":6,"tipo":"vuelta","vuelta":3,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["9"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":10},{"linea":7,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["19"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":10},{"linea":6,"tipo":"fin","vuelta":3,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","0"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["19"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":11},{"linea":9,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","6.333333"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["19"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":11},{"linea":4,"tipo":"fin","vuelta":3,"estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","6.333333"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["19"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":12},{"linea":11,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","6.333333"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["19"]},"i":{"t":"integer","v":["3"]}},"salida":"[1] 6.666667 7.833333 6.333333\n","nfilas":12},{"linea":12,"tipo":"linea","estado":{"notas":{"t":"matrix","tipo":"double","d":[3,3],"v":["7","4","9","8.5","5.5","9.5","6","3","10"],"dn":[["Marta","Pau","Sara"],["1ª","2ª","3ª"]]},"medias":{"t":"numeric","v":["6.666667","7.833333","6.333333"]},"j":{"t":"integer","v":["3"]},"suma":{"t":"numeric","v":["19"]},"i":{"t":"integer","v":["3"]}},"salida":"[1] 6.666667 7.833333 6.333333\n      1ª       2ª       3ª \n6.666667 7.833333 6.333333 \n","nfilas":12}],"filas":[[],[],[],[],[],[],[],[],[],[],[],[]]}}
```

El programa recorre la matriz **columna a columna**: para cada `j`, el bucle de dentro baja por las tres filas. La suma se ejecuta 3 × 3 = **9 veces**, una por casilla. Al final, `medias` vale `6.666667 7.833333 6.333333`, lo mismo que `colMeans(notas)`, que hace todo esto en una línea y además conserva los nombres de las columnas.

### 4 · Operar con matrices

Las operaciones de los vectores funcionan en las matrices casilla a casilla: `notas + 0.5` sube medio punto a las nueve notas. Además, hay funciones que trabajan por filas o por columnas:

```{code-cell} r
notas <- matrix(c(7, 4, 9, 8.5, 5.5, 9.5, 6, 3, 10), nrow = 3,
                dimnames = list(c("Marta", "Pau", "Sara"), c("1ª", "2ª", "3ª")))
rowMeans(notas)
apply(notas, 2, max)
t(notas)
```

- `rowMeans()` y `colMeans()` dan la media de cada fila y de cada columna, y `rowSums()` y `colSums()`, las sumas. `rowMeans(notas)` da la media de cada alumno: `7.166667 4.166667 9.500000`.
- `apply(matriz, margen, función)` aplica cualquier función a cada fila (margen 1) o a cada columna (margen 2). `apply(notas, 2, max)` da la nota más alta de cada evaluación: `9.0 9.5 10.0`.
- `t()` traspone la matriz: las filas pasan a ser columnas.

En matemáticas, el producto de matrices no es casilla a casilla. Para el producto de matrices, R tiene su propio operador, `%*%`. Con `A <- matrix(c(1, 2, 3, 4), nrow = 2)`, `A * A` da `1 9` y `4 16`, cada casilla al cuadrado, mientras que `A %*% A` da el producto de matrices: `7 15` y `10 22`.

::::{div}
:class: afondo
### 5 · Lo que hay debajo de una matriz

**Una matriz es un vector con un atributo.** Si a un vector le pones dimensiones, se convierte en matriz, sin copiar nada:

```r
v <- 1:6
dim(v) <- c(3, 2)    # ahora v es una matriz de 3 filas y 2 columnas: 1 2 3 y 4 5 6 por columnas
```

Por eso un filtro lógico devuelve un vector, y por eso R rellena por columnas: es el orden de las casillas en la memoria. La casilla `[i, j]` es el elemento `i + (j - 1) · filas` del vector.

**Las dimensiones que se pierden.** Si al elegir te queda una sola fila o una sola columna, R quita las dimensiones y devuelve un vector: `dim(m[1, ])` da `NULL`. Casi siempre es cómodo, pero dentro de una función puede romper el código que espera una matriz. Con `drop = FALSE` se conservan: `dim(m[1, , drop = FALSE])` da `1 3`.

**Arrays de tres dimensiones.** Un array se crea con `array()` y su vector de dimensiones. Uno de 2 × 3 × 2 es un montón de dos matrices de 2 × 3, y cada casilla lleva tres índices: fila, columna y capa.

:::{tip} Predice
En `array(1:12, dim = c(2, 3, 2))`, ¿qué número queda en la casilla `[2, 3, 1]`?
:::

```{code-cell} r
a <- array(1:12, dim = c(2, 3, 2))
a[2, 3, 1]
a[2, 3, 2]
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Dos capas","etiqueta":"a fondo · array","idea":"Los 12 números llenan primero las columnas de la capa 1 y después las de la capa 2. Cada casilla tiene tres índices: fila, columna y capa."},"traza":{"codigo":"a <- array(1:12, dim = c(2, 3, 2))\na[2, 3, 1]\na[2, 3, 2]","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"a":{"t":"array","tipo":"integer","d":[2,3,2],"v":["1","2","3","4","5","6","7","8","9","10","11","12"]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"a":{"t":"array","tipo":"integer","d":[2,3,2],"v":["1","2","3","4","5","6","7","8","9","10","11","12"]}},"salida":"[1] 6\n","nfilas":0},{"linea":3,"tipo":"linea","estado":{"a":{"t":"array","tipo":"integer","d":[2,3,2],"v":["1","2","3","4","5","6","7","8","9","10","11","12"]}},"salida":"[1] 6\n[1] 12\n","nfilas":0}],"filas":[]}}
```

`a[2, 3, 1]` da `6`, y `a[2, 3, 2]` da `12`: la misma posición en la segunda capa. Los arrays aparecen, por ejemplo, con las notas por alumno, evaluación y asignatura, o con las imágenes en color, que tienen una capa por cada color (rojo, verde y azul).
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
| | R | Python (NumPy) | Julia |
|---|---|---|---|
| Crear | `matrix(1:6, nrow = 2)` | `np.array([[1, 3, 5], [2, 4, 6]])` | `[1 3 5; 2 4 6]` |
| Casilla de la fila 2 y la columna 3 | `m[2, 3]` | `m[1, 2]` | `m[2, 3]` |
| Producto de matrices | `A %*% B` | `A @ B` | `A * B` |

R y Julia guardan las matrices por columnas y cuentan desde 1. NumPy las guarda por filas y cuenta desde 0. Cuidado con el producto: en Julia, `*` entre matrices es el producto de matrices, y para multiplicar casilla a casilla se escribe `.*`. En R es al revés: `*` es casilla a casilla, y el producto de matrices es `%*%`.
:::

## Conexiones

- El **álgebra lineal** de R trabaja con matrices: `solve()` resuelve sistemas de ecuaciones, y los modelos de regresión de la parte III se calculan por dentro con productos de matrices.
- Una **imagen** en escala de grises es una matriz de números, uno por píxel. Con `apply()` y los filtros lógicos se pueden retocar imágenes.
- `apply()` es la primera de la familia de funciones que aplican otra función por partes. Volverá en la programación funcional de la parte IV.

## La grieta

Una matriz guarda un solo tipo de dato. Prueba a añadir a `notas` una columna con el grupo de cada alumno: `cbind(notas, c("A", "B", "A"))`. Las notas se vuelven texto, `"7"`, `"8.5"`, y ya no se puede calcular ninguna media. Una tabla de datos de verdad tiene columnas de tipos distintos: el nombre es un texto, el grupo es una categoría y las notas son números. Hace falta una tabla en la que cada columna tenga su tipo: el **data frame**.

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   m <- matrix(1:6, nrow = 2)
   m[2, 3]
   m[, 2]
   ```

2. **Por filas.** ¿Cómo queda `matrix(1:6, nrow = 2, byrow = TRUE)`? Escribe sus dos filas.

3. **La media de cada alumno.** Con la matriz `notas` del capítulo, calcula en una línea la media de cada alumno.

4. **¿Quién suspendió?** Escribe una línea que dé el nombre de los alumnos que suspendieron la 3ª evaluación.

5. **Medio punto en la 2ª.** Sube medio punto a todos los alumnos solo en la 2ª evaluación, cambiando la matriz `notas`.

6. **Dos productos.** Con `A <- matrix(c(1, 2, 3, 4), nrow = 2)`, calcula a mano `A * A` y `A %*% A`, y compruébalo en R.

:::{div}
:class: afondo
7. **Un vector que se dobla.** ¿Qué matriz queda después de `v <- 1:6` y `dim(v) <- c(3, 2)`?

8. **La fila que pierde su forma.** Con `m <- matrix(1:6, nrow = 2)`, ¿qué dan `dim(m[1, ])` y `dim(m[1, , drop = FALSE])`?
:::

## Solucionario

1. `6`: la fila 2 de la columna 3. Y `3 4`, la columna 2.
2. La primera fila es `1 2 3` y la segunda, `4 5 6`.
3. `rowMeans(notas)`, que da Marta 7.166667, Pau 4.166667 y Sara 9.5.
4. `names(which(notas[, "3ª"] < 5))`, que da `"Pau"`.
5. `notas[, "2ª"] <- notas[, "2ª"] + 0.5`. La columna de la 2ª queda en `9 6 10`.
6. `A` tiene las filas `1 3` y `2 4`. `A * A` da las filas `1 9` y `4 16`. `A %*% A` da las filas `7 15` y `10 22`: por ejemplo, el 7 es 1 · 1 + 3 · 2.

:::{div}
:class: afondo
7. Una matriz de 3 filas y 2 columnas, rellenada por columnas: las filas son `1 4`, `2 5` y `3 6`.
8. `dim(m[1, ])` da `NULL`, porque la fila sola se convierte en vector. `dim(m[1, , drop = FALSE])` da `1 3`: sigue siendo una matriz de una fila y tres columnas.
:::
