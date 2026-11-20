---
title: "Factores: categorías con lista cerrada"
subtitle: Cuando un texto es, en realidad, una categoría
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El instituto encarga camisetas para la excursión. Cada alumno apunta su talla en una hoja: S, M, L o XL. Para hacer el pedido hay que contar cuántas hay de cada una, presentarlas de la más pequeña a la más grande y comprobar que nadie ha escrito una talla que no existe. La hoja de la tienda ya trae las cuatro casillas impresas: solo se puede marcar una de ellas.

## La pregunta

Al final del capítulo anterior, `sort()` ordenaba las calificaciones por orden alfabético: `"aprobado" "sobresaliente" "suspendido"`. Para R eran textos sueltos. ¿Cómo se le dice que esos textos son **categorías**, con una lista cerrada de valores posibles y un orden propio?

## La idea

Un **factor** es un vector de categorías. Se crea con `factor()`, y sus **niveles** (*levels*) son la lista cerrada de categorías posibles, en el orden que tú elijas. Lo que no está en esa lista no puede entrar.

Por dentro, un factor no guarda los textos. Guarda **un número entero en cada casilla**: la posición de su categoría en la lista de niveles. La etiqueta que ves se busca en esa lista cada vez que R enseña el factor.

:::{important} Un factor son dos cosas
Un vector de números enteros, uno por casilla, y la lista de niveles que traduce cada número a su etiqueta. Si la lista es `suspendido, aprobado, sobresaliente`, un 2 en una casilla significa «aprobado».
:::

## Construcción

### 1 · Crear un factor y elegir sus niveles

Si no se dice nada, `factor()` toma como niveles los valores distintos que encuentra, por orden alfabético. Con el argumento `levels` eliges tú cuáles son y en qué orden.

```{code-cell} r
calif <- c("aprobado", "suspendido", "aprobado", "sobresaliente", "aprobado")
factor(calif)
f <- factor(calif, levels = c("suspendido", "aprobado", "sobresaliente"))
f
sort(f)
table(f)
```

R enseña un factor sin comillas y con una línea más, `Levels:`, que da la lista de niveles. Con los niveles por defecto sale `aprobado sobresaliente suspendido`, el orden alfabético de siempre. Con los niveles elegidos, `sort(f)` ya ordena de peor a mejor: `suspendido aprobado aprobado aprobado sobresaliente`. Y `table(f)` cuenta cuántos hay de cada nivel, en ese mismo orden: 1 suspenso, 3 aprobados y 1 sobresaliente.

### 2 · Un factor por dentro

Este es el programa estrella del capítulo. Construye a mano los números que R guarda dentro de un factor y después comprueba que `factor()` guarda los mismos.

:::{tip} Predice
Con la lista de niveles `suspendido, aprobado, sobresaliente`, ¿qué número guarda R en la casilla de `"sobresaliente"`? ¿Y en las de `"aprobado"`?
:::

```{code-cell} r
calif <- c("aprobado", "suspendido", "aprobado", "sobresaliente")
niveles <- c("suspendido", "aprobado", "sobresaliente")
codigos <- integer(length(calif))
for (i in seq_along(calif)) {
  codigos[i] <- which(niveles == calif[i])
}
f <- factor(calif, levels = niveles)
as.integer(f)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Lo que guarda un factor","etiqueta":"factor · por dentro","idea":"El puntero recorre codigos. En cada vuelta, which() busca la categoría en la lista de niveles y apunta su posición. Al final, el factor f guarda esos mismos números: el pequeño de cada casilla.","foco":"codigos","puntero":"i","columnas":["i","calif[i]","codigos[i]"],"fila_en":"fin_iteracion"},"traza":{"codigo":"calif <- c(\"aprobado\", \"suspendido\", \"aprobado\", \"sobresaliente\")\nniveles <- c(\"suspendido\", \"aprobado\", \"sobresaliente\")\ncodigos <- integer(length(calif))\nfor (i in seq_along(calif)) {\n  codigos[i] <- which(niveles == calif[i])\n}\nf <- factor(calif, levels = niveles)\nas.integer(f)","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]}},"salida":"","nfilas":0},{"linea":3,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["0","0","0","0"]}},"salida":"","nfilas":0},{"linea":4,"tipo":"vuelta","vuelta":1,"estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["0","0","0","0"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":5,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","0","0","0"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":4,"tipo":"vuelta","vuelta":2,"estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","0","0","0"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":5,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","1","0","0"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":4,"tipo":"vuelta","vuelta":3,"estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","1","0","0"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":5,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","1","2","0"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":4,"tipo":"vuelta","vuelta":4,"estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","1","2","0"]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":3},{"linea":5,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","1","2","3"]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":3},{"linea":4,"tipo":"fin","vuelta":4,"estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","1","2","3"]},"i":{"t":"integer","v":["4"]}},"salida":"","nfilas":4},{"linea":7,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","1","2","3"]},"i":{"t":"integer","v":["4"]},"f":{"t":"factor","v":["aprobado","suspendido","aprobado","sobresaliente"],"k":["2","1","2","3"],"niveles":["suspendido","aprobado","sobresaliente"]}},"salida":"","nfilas":4},{"linea":8,"tipo":"linea","estado":{"calif":{"t":"character","v":["\"aprobado\"","\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"codigos":{"t":"integer","v":["2","1","2","3"]},"i":{"t":"integer","v":["4"]},"f":{"t":"factor","v":["aprobado","suspendido","aprobado","sobresaliente"],"k":["2","1","2","3"],"niveles":["suspendido","aprobado","sobresaliente"]}},"salida":"[1] 2 1 2 3\n","nfilas":4}],"filas":[{"i":"1","calif[i]":"\"aprobado\"","codigos[i]":"2"},{"i":"2","calif[i]":"\"suspendido\"","codigos[i]":"1"},{"i":"3","calif[i]":"\"aprobado\"","codigos[i]":"2"},{"i":"4","calif[i]":"\"sobresaliente\"","codigos[i]":"3"}]}}
```

`which(niveles == calif[i])` da la posición de cada categoría en la lista: `"aprobado"` está en la 2, `"suspendido"` en la 1 y `"sobresaliente"` en la 3. Así, `codigos` acaba valiendo `2 1 2 3`. Cuando se crea `f`, el visualizador dibuja cada etiqueta con su número pequeño encima y, debajo, la lista de niveles numerada: son los mismos `2 1 2 3`, como confirma `as.integer(f)`.

Por eso los factores ocupan poco: cada etiqueta se escribe una sola vez, en la lista de niveles, aunque se repita miles de veces en los datos.

### 3 · Una lista cerrada

Lo que no está entre los niveles no puede entrar en el factor. Un valor desconocido se convierte en `NA`:

- al **crear** el factor, sin avisar;
- al **cambiar** una casilla, con un aviso.

```{code-cell} r
niveles <- c("suspendido", "aprobado", "sobresaliente")
g <- factor(c("aprobado", "suspendido", "aprovado"), levels = niveles)
g[2] <- "notable"
g
table(g)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Lo que no está en la lista","etiqueta":"niveles · lista cerrada","idea":"«aprovado», con v, no es ningún nivel: entra como NA, sin aviso. Al guardar «notable» en la casilla 2, R avisa y también pone NA. Las casillas NA no tienen número."},"traza":{"codigo":"niveles <- c(\"suspendido\", \"aprobado\", \"sobresaliente\")\ng <- factor(c(\"aprobado\", \"suspendido\", \"aprovado\"), levels = niveles)\ng[2] <- \"notable\"\ng\ntable(g)","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"g":{"t":"factor","v":["aprobado","suspendido","NA"],"k":["2","1","NA"],"niveles":["suspendido","aprobado","sobresaliente"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"linea","estado":{"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"g":{"t":"factor","v":["aprobado","NA","NA"],"k":["2","NA","NA"],"niveles":["suspendido","aprobado","sobresaliente"]}},"salida":"","nfilas":0,"avisos":["invalid factor level, NA generated"]},{"linea":4,"tipo":"linea","estado":{"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"g":{"t":"factor","v":["aprobado","NA","NA"],"k":["2","NA","NA"],"niveles":["suspendido","aprobado","sobresaliente"]}},"salida":"[1] aprobado <NA>     <NA>    \nLevels: suspendido aprobado sobresaliente\n","nfilas":0},{"linea":5,"tipo":"linea","estado":{"niveles":{"t":"character","v":["\"suspendido\"","\"aprobado\"","\"sobresaliente\""]},"g":{"t":"factor","v":["aprobado","NA","NA"],"k":["2","NA","NA"],"niveles":["suspendido","aprobado","sobresaliente"]}},"salida":"[1] aprobado <NA>     <NA>    \nLevels: suspendido aprobado sobresaliente\ng\n   suspendido      aprobado sobresaliente \n            0             1             0 \n","nfilas":0}],"filas":[]}}
```

La errata `"aprovado"` entra como `NA` sin decir nada. Al guardar `"notable"`, que tampoco es un nivel, R avisa: «invalid factor level, NA generated» (este aviso R no lo traduce). Al final, `g` vale `aprobado <NA> <NA>`, y `table(g)` cuenta 0 suspensos, 1 aprobado y 0 sobresalientes. Los `NA` no se cuentan. Y los niveles vacíos sí aparecen, con un 0: para un pedido de camisetas, saber que nadie ha pedido la XL también es información.

Esa lista cerrada es una ventaja: los errores de tecleo salen a la luz como `NA` en lugar de colarse como una categoría nueva.

### 4 · Categorías con orden

Las calificaciones y las tallas tienen un orden natural; los colores o los medios de transporte, no. Con `ordered = TRUE`, el orden de los niveles pasa a significar «menor que», y el factor se puede comparar.

```{code-cell} r
calif <- c("aprobado", "suspendido", "aprobado", "sobresaliente", "aprobado")
o <- factor(calif, levels = c("suspendido", "aprobado", "sobresaliente"), ordered = TRUE)
o
o >= "aprobado"
max(o)
```

Un factor ordenado enseña sus niveles con el signo `<`: `suspendido < aprobado < sobresaliente`. `o >= "aprobado"` da `TRUE FALSE TRUE TRUE TRUE`, y `max(o)` da `sobresaliente`. Con un factor sin orden, la misma comparación da cinco `NA` y el aviso «‘>=’ not meaningful for factors»: R no se inventa un orden que no le has dado.

### 5 · De números a categorías: `cut()`

En el capítulo 4 convertíamos notas en palabras con dos `ifelse()` anidados. `cut()` lo hace de una vez: parte la recta de los números en tramos y devuelve un factor con una etiqueta por tramo.

```{code-cell} r
notas <- c(4.2, 7, 3.5, 9.1, 10, 5)
calif <- cut(notas, breaks = c(0, 5, 9, 10),
             labels = c("suspendido", "aprobado", "sobresaliente"),
             right = FALSE, include.lowest = TRUE)
calif
table(calif)
```

Los cortes `0, 5, 9, 10` hacen tres tramos. Con `right = FALSE`, cada tramo incluye su extremo izquierdo y no el derecho: el 5 cae en «aprobado» y el 9, en «sobresaliente». Sin `include.lowest = TRUE`, el 10, extremo derecho del último tramo, se quedaría fuera y saldría `NA`. El resultado es `suspendido aprobado suspendido sobresaliente sobresaliente aprobado`, y `table()` cuenta 2 de cada.

:::{div}
:class: afondo
### 6 · Las trampas de los factores

**Los números que son categorías.** Si un factor tiene números como etiquetas, como los años, `as.numeric()` no devuelve los años: devuelve los códigos internos.

```{code-cell} r
anios <- factor(c("2024", "2022", "2024"))
as.numeric(anios)
as.numeric(as.character(anios))
```

`as.numeric(anios)` da `2 1 2`, las posiciones en la lista de niveles `2022 2024`. Para recuperar los años hay que pasar antes por el texto: `as.numeric(as.character(anios))` da `2024 2022 2024`.

**Cambiar el nombre de un nivel** se hace en la lista, no en los datos. `levels(f)[levels(f) == "aprobado"] <- "apto"` cambia la etiqueta de todas las casillas a la vez, porque todas guardan el mismo número y solo cambia su traducción.

**Los niveles vacíos** se quedan en la lista aunque no quede ninguna casilla con ellos. Es lo que hace que `table()` cuente ceros, y casi siempre es lo que quieres. Si no, `droplevels()` los quita.

**Un poco de historia.** Hasta R 4.0, de 2020, al leer una tabla de datos R convertía en factor cualquier columna de texto, sin preguntar. Muchos programas antiguos llevan `stringsAsFactors = FALSE` para evitarlo. Hoy los textos se quedan como textos, y el factor se crea a propósito cuando una columna es una categoría.
:::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Las calificaciones como categoría ordenada:

| R | Python (pandas) | Julia (CategoricalArrays) |
|---|---|---|
| `factor(x, levels = niv, ordered = TRUE)` | `pd.Categorical(x, categories=niv, ordered=True)` | `categorical(x, levels=niv, ordered=true)` |

R trae los factores de serie, porque nació para la estadística, donde las variables categóricas están en todas partes. Python y Julia necesitan un paquete: pandas en Python y CategoricalArrays en Julia. La idea es la misma en los tres: códigos enteros más una lista de categorías.
:::

## Conexiones

- En la parte III, **ggplot2** dibuja las barras de un gráfico en el orden de los niveles. Cambiar el orden de los niveles es la manera de ordenar un gráfico.
- Los **modelos** estadísticos convierten un factor en una variable indicadora por categoría. Por eso es importante que una categoría sea un factor y no un número suelto.
- El paquete **forcats** de la parte III reúne funciones para reordenar, agrupar y renombrar niveles.

## La grieta

Todos los vectores que hemos visto guardan un solo tipo de dato: números, textos, lógicos o categorías. Pero la ficha de un alumno lo mezcla todo: su nombre es un texto, sus notas son un vector de números, su calificación es una categoría y «repite curso» es un `TRUE` o un `FALSE`. Un vector no puede guardar todo eso junto sin convertirlo en texto. Hace falta un contenedor que admita piezas de tipos distintos: las [**listas**](07-listas.md).

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   tallas <- factor(c("M", "S", "L", "M"))
   levels(tallas)
   ```

2. **El pedido de camisetas.** Crea el factor de las tallas del ejercicio 1 con los niveles `S`, `M`, `L` y `XL`, en ese orden, y cuenta cuántas hay de cada una con `table()`.

3. **¿Cómo vienes al instituto?** Con `t <- c("bus", "bici", "bus", "a pie", "bus")`, ¿qué da `table(t)`? ¿Qué línea da el nombre del transporte más usado?

4. **Tallas que se comparan.** Con `t3 <- factor(c("M", "S", "L", "XL", "S"), levels = c("S", "M", "L", "XL"), ordered = TRUE)`, ¿qué da `t3 >= "M"`?

5. **Grupos de edad.** Con `cut()`, convierte las edades `c(12, 17, 18, 40, 70)` en las categorías `"menor"` (menos de 18), `"adulto"` (de 18 a 64) y `"mayor"` (65 o más).

6. **La tilde.** ¿Qué da `factor(c("si", "no", "sí"), levels = c("sí", "no"))`? ¿Por qué?

:::{div}
:class: afondo
7. **Los años.** Con `anios <- factor(c("2024", "2022", "2024"))`, ¿qué da `as.numeric(anios)`? Escribe la línea que devuelve los años de verdad.

8. **El nivel vacío.** Con `f <- factor(c("b", "a"), levels = c("a", "b", "c"))`, ¿qué da `table(f)`? ¿Qué niveles quedan después de `droplevels(f)`?
:::

## Solucionario

1. `"L" "M" "S"`: sin `levels`, los niveles se ordenan alfabéticamente.
2. `factor(c("M", "S", "L", "M"), levels = c("S", "M", "L", "XL"))`. `table()` da S 1, M 2, L 1 y XL 0: la talla que nadie ha pedido también aparece.
3. `table(t)` da `a pie` 1, `bici` 1 y `bus` 3, por orden alfabético. `names(which.max(table(t)))` da `"bus"`.
4. `TRUE FALSE TRUE TRUE FALSE`: la M, la L y la XL son de la M para arriba.
5. `cut(c(12, 17, 18, 40, 70), breaks = c(0, 18, 65, Inf), labels = c("menor", "adulto", "mayor"), right = FALSE)` da `menor menor adulto adulto mayor`. Con `right = FALSE`, el 18 ya es adulto y el 65 ya es mayor.
6. `<NA> no sí`. `"si"` sin tilde no es ninguno de los niveles, así que entra como `NA`, sin aviso.

:::{div}
:class: afondo
7. `2 1 2`, los códigos: la lista de niveles es `2022 2024`. Los años se recuperan con `as.numeric(as.character(anios))`, que da `2024 2022 2024`.
8. `table(f)` da a 1, b 1 y c 0. Después de `droplevels(f)` quedan los niveles `a` y `b`.
:::
