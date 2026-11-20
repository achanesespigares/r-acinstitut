---
title: "Listas: un contenedor para todo"
subtitle: Piezas de tipos distintos, juntas y con nombre
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En secretaría, cada alumno tiene una carpeta. Dentro hay de todo: una hoja con su nombre, el boletín con las notas de las tres evaluaciones, un papel que dice si repite curso y, a veces, otra carpeta más pequeña con los justificantes de faltas. Cada cosa es de un tipo distinto, pero todas van juntas, y cada una tiene su etiqueta para encontrarla sin vaciar la carpeta.

## La pregunta

Un vector guarda un solo tipo de dato. Si juntas con `c()` un nombre, unas notas y un `FALSE`, R lo convierte todo en texto (capítulo 2). ¿Cómo se guarda la ficha de un alumno, con sus piezas de tipos distintos, sin que se mezclen?

## La idea

Una **lista** es una fila de casillas como un vector, con una diferencia: **cada casilla puede guardar cualquier cosa**. Un texto, un vector de números, un factor, una función, e incluso otra lista. Se crea con `list()`, y lo normal es dar un nombre a cada elemento:

```r
alumno <- list(nombre = "Marta", notas = c(7, 8.5, 6), repite = FALSE)
```

Un elemento se saca con `$` y su nombre, `alumno$notas`, o con dos corchetes, `alumno[["notas"]]`.

:::{important} Un corchete o dos
`alumno["notas"]`, con un corchete, devuelve **otra lista** con ese elemento dentro: es la carpeta pequeña con el boletín. `alumno[["notas"]]`, con dos, devuelve **lo que hay dentro**: el boletín mismo, el vector de notas. Para trabajar con el contenido casi siempre quieres dos corchetes, o `$`.
:::

## Construcción

### 1 · Crear una lista y sacar sus piezas

```{code-cell} r
alumno <- list(nombre = "Marta", notas = c(7, 8.5, 6), repite = FALSE)
str(alumno)
alumno$nombre
alumno[["notas"]]
alumno$notas[2]
```

`str()`, de *structure*, es la mejor manera de mirar una lista. Da una línea por elemento, con su nombre, su tipo y su contenido: `$ nombre: chr "Marta"`, `$ notas : num [1:3] 7 8.5 6` y `$ repite: logi FALSE`.

`alumno$nombre` da `"Marta"`, y `alumno[["notas"]]` da el vector `7.0 8.5 6.0`. Como lo que sale es un vector normal, se le pueden poner sus propios corchetes: `alumno$notas[2]` es la segunda nota, `8.5`.

### 2 · Un corchete frente a dos

:::{tip} Predice
¿Qué tipo de dato es `a`? ¿Y `b`? ¿Cuál de los dos podrías pasarle a `mean()` para calcular la media?
:::

```{code-cell} r
alumno <- list(nombre = "Marta", notas = c(7, 8.5, 6), repite = FALSE)
a <- alumno["notas"]
b <- alumno[["notas"]]
alumno$notas[2] <- 9
alumno$grupo <- "1ºB"
alumno$repite <- NULL
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La carpeta del alumno","etiqueta":"lista · [ ] y [[ ]]","idea":"Cada elemento de la lista es una caja con su nombre. a es una lista con una sola caja dentro; b es el vector de notas, sin caja. Después, la lista cambia una nota, gana un elemento y pierde otro."},"archivo":"datos/trazas/07-listas-1.json"}
```

En la memoria se ve la diferencia: `a` es una **lista** de un elemento, `$notas`, y `b` es directamente un vector `numeric` de longitud 3. Por eso `mean(b)` da 7.17, y `mean(a)` da `NA` y un aviso: «argument is not numeric or logical: returning NA» (R no lo traduce). A `mean()` le has dado una carpeta, no las notas.

Las tres últimas líneas muestran cómo se cambia una lista:

- **cambiar** una pieza: `alumno$notas[2] <- 9` cambia la segunda nota dentro de la lista;
- **añadir** una pieza: basta con dar un valor a un nombre nuevo, `alumno$grupo <- "1ºB"`;
- **quitar** una pieza: se le asigna `NULL`, `alumno$repite <- NULL`.

La lista acaba con tres elementos, `nombre`, `notas` y `grupo`.

### 3 · Listas dentro de listas

Una lista puede guardar otras listas. Así se representa una clase entera: una lista con una ficha por alumno. Este es el programa estrella del capítulo. Recorre la clase y calcula la media de cada alumno.

```{code-cell} r
clase <- list(
  list(nombre = "Marta", notas = c(7, 8.5, 6)),
  list(nombre = "Pau", notas = c(4, 5.5, 3)),
  list(nombre = "Sara", notas = c(9, 9.5, 10))
)
medias <- numeric(length(clase))
for (i in seq_along(clase)) {
  medias[i] <- mean(clase[[i]]$notas)
}
medias
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Una clase en una lista","etiqueta":"listas anidadas","idea":"clase es una lista de tres listas, una por alumno. En cada vuelta, clase[[i]] saca la ficha completa de un alumno, y $notas, su vector de notas. El puntero recorre medias.","foco":"medias","puntero":"i","columnas":["i","clase[[i]]$nombre","medias[i]"],"fila_en":"fin_iteracion"},"archivo":"datos/trazas/07-listas-2.json"}
```

Las cajas se leen de fuera adentro: `clase[[2]]` es la ficha de Pau, `clase[[2]]$notas` es su vector de notas y `clase[[2]]$notas[1]` es su primera nota, el 4. En la traza, cada vuelta saca una ficha y apunta su media: `7.166667 4.166667 9.500000`.

Las listas de la clase no tienen nombre, solo posición. Por eso la memoria las enseña como `[[1]]`, `[[2]]` y `[[3]]`, igual que R.

### 4 · Una función que devuelve varias cosas

Una función devuelve un solo valor. Si necesitas que devuelva varios resultados, se juntan en una lista:

```{code-cell} r
estadisticas <- function(x) {
  list(media = mean(x), rango = range(x))
}
e <- estadisticas(c(4, 8, 6))
e$media
e$rango
```

`e$media` da `6`, y `e$rango` da `4 8`, la nota más baja y la más alta. Muchas funciones de R hacen lo mismo. Por ejemplo, el resultado de un modelo estadístico es una lista con los coeficientes, los residuos y todo lo demás, cada cosa con su nombre.

:::{div}
:class: afondo
### 5 · Lo que conviene saber de las listas

**Una lista también es un vector.** `is.vector(alumno)` da `TRUE`. R distingue los vectores **atómicos** (números, textos, lógicos), con un solo tipo, de los vectores **recursivos**, las listas, que pueden contener otros vectores. Por eso `length()`, los nombres y los corchetes funcionan igual en los dos.

**Aplanar una lista.** `unlist()` deshace las cajas y junta todo en un vector atómico. Como un vector solo admite un tipo, todo pasa al más general. `unlist(list(a = 1, b = "x", c = TRUE))` da tres textos: `"1" "x" "TRUE"`.

**Un nombre que no existe.** En una lista, `l$z` o `l[["z"]]` dan `NULL` si no hay ningún elemento `z`, sin error. En un vector atómico con nombres, `x[["z"]]` sí da error: «subíndice fuera de los límites». Un `NULL` callado puede esconder una errata en el nombre, así que conviene comprobarlo, por ejemplo con `"z" %in% names(l)`.

**Guardar un `NULL` de verdad.** Como `l$b <- NULL` borra el elemento, para que la lista guarde un `NULL` hay que envolverlo: `l["b"] <- list(NULL)`. El elemento sigue ahí, con `NULL` dentro.
:::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La ficha de un alumno, con nombres:

| R | Python | Julia |
|---|---|---|
| `list(nombre = "Marta", notas = c(7, 8.5))` | `{"nombre": "Marta", "notas": [7, 8.5]}` | `(nombre = "Marta", notas = [7, 8.5])` |
| `alumno$nombre` | `alumno["nombre"]` | `alumno.nombre` |

Una lista de R hace a la vez dos papeles que Python separa: la lista por posición (`list`) y el diccionario por nombre (`dict`). En Julia, lo más parecido es la tupla con nombres, que no se puede modificar, o el diccionario (`Dict`).
:::

## Conexiones

- Un **data frame**, la tabla de datos de R, es una lista de columnas que tienen todas la misma longitud. Todo lo de este capítulo vale para él: `datos$edad` saca una columna.
- `lapply()` y `sapply()` aplican una función a cada elemento de una lista. `sapply(clase, function(a) a$nombre)` da los tres nombres sin escribir el bucle. Volverán en la programación funcional de la parte IV.
- Los datos que llegan de internet en formato **JSON** se leen en R como listas dentro de listas.

## La grieta

Ahora queremos las notas de toda la clase en las tres evaluaciones. Con una lista de alumnos funciona, pero para calcular la media de la segunda evaluación hay que entrar en cada ficha, una a una. Esos datos son todos del mismo tipo y forman un rectángulo: una fila por alumno y una columna por evaluación. Hace falta una estructura que entienda las filas y las columnas: las [**matrices**](08-matrices.md).

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   l <- list(a = 1:3, b = "hola")
   length(l)
   l$a[2]
   ```

2. **Tu ficha.** Crea una lista `yo` con tu nombre, tu año de nacimiento y un vector con tres asignaturas que te gusten. Mírala con `str()` y saca la segunda asignatura en una sola línea.

3. **Uno o dos corchetes.** Con la `l` del ejercicio 1, ¿qué dan `class(l["a"])` y `class(l[["a"]])`?

4. **Poner y quitar.** Con la misma `l`, ejecuta `l$c <- TRUE` y después `l$b <- NULL`. ¿Qué da `names(l)`?

5. **Dentro de la clase.** Con la lista `clase` del programa estrella, ¿qué da `clase[[3]]$notas[1]`? Escribe la línea que da el nombre del segundo alumno.

6. **Varios resultados.** Con la función `estadisticas()` del apartado 4, ¿qué da `estadisticas(c(10, 2, 7))$rango`? Añade a la lista que devuelve un elemento `n` con el número de notas.

:::{div}
:class: afondo
7. **Aplanar.** ¿Qué da `unlist(list(a = 1, b = "x", c = TRUE))`? ¿De qué tipo es?

8. **El nombre que falta.** Con `x <- c(a = 1)` y `l2 <- list(a = 1)`, ¿qué dan `x[["z"]]` y `l2[["z"]]`?
:::

## Solucionario

1. `2`, porque la lista tiene dos elementos, aunque el primero sea un vector de tres. Y `2`, el segundo número de `1:3`.
2. Por ejemplo, `yo <- list(nombre = "Lucía", nacimiento = 2009, asignaturas = c("Física", "Música", "Historia"))`. La segunda asignatura es `yo$asignaturas[2]`.
3. `"list"`, porque un corchete devuelve otra lista, y `"integer"`, porque dos corchetes devuelven el vector `1:3`.
4. `"a" "c"`: se añade `c` y se quita `b`.
5. `9`, la primera nota de Sara. El nombre del segundo alumno es `clase[[2]]$nombre`, que da `"Pau"`.
6. `2 10`. Con `list(media = mean(x), rango = range(x), n = length(x))`, `estadisticas(c(10, 2, 7))$n` da `3`.

:::{div}
:class: afondo
7. `"1" "x" "TRUE"`, con los nombres `a`, `b` y `c`. Es un vector de texto: al juntarlo todo, gana el tipo más general.
8. `x[["z"]]` da el error «subíndice fuera de los límites». `l2[["z"]]` da `NULL`, sin error.
:::
