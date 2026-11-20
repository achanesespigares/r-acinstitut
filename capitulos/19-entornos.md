---
title: "Entornos: dónde busca R los nombres"
subtitle: Cada nombre vive en un sitio, y cada sitio tiene un padre
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Si en clase alguien dice «pásame el libro», todos entienden que habla del libro de esa asignatura, el que hay encima de la mesa. Si en la mesa no hay ninguno, se busca en la estantería de la clase; si tampoco, en la biblioteca del instituto. La misma palabra, «el libro», se resuelve mirando primero lo más cercano y después cada vez más lejos, hasta encontrarlo o hasta que no queda dónde mirar.

## La pregunta

Al cerrar la parte III quedó una pregunta pendiente. En `lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos)`, en `aes(x = largo_aleta_mm)` o en `filter(pinguinos, especie == "Adelia")` escribimos nombres de columnas sin comillas, como si fueran variables. Pero si escribes `largo_aleta_mm` solo, R contesta `objeto 'largo_aleta_mm' no encontrado`. ¿Dónde busca R los nombres? ¿Y cómo los encuentran esas funciones?

## La idea

Un **entorno** es un conjunto de nombres, cada uno con su valor, más un enlace a otro entorno, su **padre**. Cuando R encuentra un nombre, lo busca en el entorno actual; si no está, sigue en el padre, y después en el padre del padre, hasta que lo encuentra o llega al final de la cadena, el entorno vacío. Entonces se para con `objeto '…' no encontrado`.

En un programa hay varios entornos a la vez:

- el **entorno global**, el del programa principal, donde viven las variables que creas tú;
- un entorno **por cada llamada** a una función, que R crea al llamarla y que guarda sus argumentos y sus variables. Es el marco que el visualizador dibuja desde el capítulo 5;
- los entornos de los **paquetes** cargados, y el de **base**, al final.

La regla clave, el **alcance léxico**: el padre del entorno de una llamada es el entorno donde se **definió** la función, no el de donde se llama.

:::{important} La búsqueda de un nombre
1. ¿Está en el entorno de la llamada en curso? Se usa ese.
2. Si no, ¿en su entorno padre, el de donde se definió la función? Se usa ese.
3. Si no, se sigue subiendo: el entorno global, los paquetes cargados y `base`.
4. Si se llega al entorno vacío sin encontrarlo: `objeto '…' no encontrado`.

Desde este capítulo, cada marco del visualizador dice cuál es su **entorno padre**: el sitio donde R seguirá buscando.
:::

## Construcción

### 1 · Un nombre que no está en la función

Este es el programa estrella del capítulo. La función `suma_x()` usa `x`, que no es ni un argumento ni una variable suya.

:::{tip} Predice
La función se llama dos veces con el mismo argumento, `suma_x(1)`. Entre una llamada y otra, `x` pasa de 10 a 100. ¿Darán las dos lo mismo?
:::

```{code-cell} r
x <- 10
suma_x <- function(y) {
  z <- x + y
  z * 2
}
suma_x(1)
x <- 100
suma_x(1)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"¿Dónde está x?","etiqueta":"búsqueda","idea":"Dentro de suma_x() solo existen y y z. Cuando la función necesita x, R no lo encuentra en el marco de la llamada y sube a su entorno padre, el programa principal, donde x vale lo que valga en ese momento."},"archivo":"datos/trazas/19-entornos-1.json"}
```

En la primera llamada, el marco de `suma_x(1)` tiene `y = 1`. En la línea 3, R necesita `x`:

1. busca `x` en el marco de la llamada, y no está;
2. sube al **entorno padre** del marco, el programa principal, porque ahí se definió la función;
3. allí `x` vale 10, así que `z` vale 11 y la función devuelve **22**.

En la segunda llamada, el camino es el mismo, pero `x` ya vale 100: `z` vale 101 y la función devuelve **202**. R busca el valor **en el momento de usarlo**, no en el de definir la función. Por eso depender de variables globales es arriesgado: la función da resultados distintos con los mismos argumentos, según lo que haya pasado fuera.

### 2 · Lo que pasa en la función se queda en la función

Si una función asigna una variable con `<-`, la crea en **su** marco, aunque fuera haya otra con el mismo nombre. Para cambiar una variable de fuera hace falta otra flecha, `<<-`.

```{code-cell} r
x <- 10
cambia <- function() {
  x <- 99
  x
}
cambia()
x
contador <- 0
suma_uno <- function() {
  contador <<- contador + 1
}
suma_uno()
suma_uno()
contador
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"<- y <<-","etiqueta":"local · <<-","idea":"La x de cambia() es otra x, local, que desaparece al terminar la llamada: la del programa principal sigue valiendo 10. En cambio, <<- busca contador en los entornos padre y lo cambia allí."},"archivo":"datos/trazas/19-entornos-2.json"}
```

- Dentro de `cambia()`, `x <- 99` crea una `x` **nueva**, en el marco de la llamada. Mientras la función se ejecuta, hay dos `x` a la vez: la local, que vale 99, y la del programa principal, que vale 10. La local **tapa** a la otra: dentro de la función, `x` es 99, porque R la encuentra en el primer sitio donde mira.
- La función devuelve 99 y su marco desaparece. Fuera, `x` sigue valiendo **10**: la función no la ha tocado.
- `contador <<- contador + 1` es distinto. La flecha doble no crea una variable local: busca `contador` en los entornos padre y la cambia **allí**. Después de dos llamadas, `contador` vale **2** en el programa principal.

:::{warning} `<<-`, con cuidado
Una función que cambia variables de fuera es difícil de seguir: para saber qué hace, hay que mirar todo lo que la rodea. Lo normal en R es que una función reciba lo que necesita como argumentos y devuelva un resultado. `<<-` tiene un uso limpio, el del apartado 6: guardar un estado dentro de una clausura.
:::

### 3 · Funciones que recuerdan: clausuras

Una función se puede definir dentro de otra, y devolverla. Como su padre es el entorno donde se definió, la función devuelta **recuerda** ese entorno aunque la llamada que lo creó ya haya terminado. Una función con su entorno recordado se llama **clausura**.

```{code-cell} r
potencia <- function(n) {
  eleva <- function(x) {
    x^n
  }
  eleva
}
cuadrado <- potencia(2)
cubo <- potencia(3)
cuadrado(5)
cubo(5)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Una fábrica de funciones","etiqueta":"clausuras","idea":"potencia(2) crea eleva dentro de su marco, donde n vale 2, y la devuelve. Ese marco no desaparece: cuadrado lo recuerda. Cuando se llama a cuadrado(5), el marco de la llamada tiene x = 5, y n se encuentra en el entorno recordado."},"archivo":"datos/trazas/19-entornos-3.json"}
```

- `potencia(2)` abre un marco con `n = 2`, define dentro la función `eleva` y la devuelve. Esta vez el marco **no desaparece**: `eleva` nació ahí y lo recuerda. En la memoria, `cuadrado` es una función que *recuerda el entorno de* `potencia(n = 2)`.
- `potencia(3)` abre otro marco, con `n = 3`, y devuelve otra `eleva`, que recuerda ese otro entorno: es `cubo`.
- `cuadrado(5)` abre un marco con `x = 5`. Para calcular `x^n`, R no encuentra `n` en el marco y sube a su padre, el entorno recordado de `potencia(n = 2)`: devuelve **25**. Con `cubo(5)`, el padre es el de `potencia(n = 3)`: **125**.

`cuadrado` y `cubo` tienen exactamente el mismo código, el de `eleva`. Lo que las distingue es el entorno que recuerdan. Es la idea que hay detrás de muchas funciones de R que fabrican funciones, como las que convierten números en etiquetas de los ejes en ggplot2.

### 4 · Columnas sin comillas

Ya se puede responder a la pregunta del principio. `filter()`, `aes()`, `lm()` y `with()` no evalúan sus argumentos como lo haría R por su cuenta: primero construyen un **entorno con las columnas de la tabla**, cuyo padre es el entorno desde el que se las llama, y evalúan la expresión allí. Las columnas pasan a ser nombres, y lo que no es una columna se sigue buscando fuera, por la cadena de siempre.

```{code-cell} r
library(dplyr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
umbral <- 5500
pesados <- filter(pinguinos, masa_corporal_g > umbral)
nrow(pesados)
with(pinguinos, mean(masa_corporal_g))
mean(masa_corporal_g)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Las columnas, como variables","etiqueta":"filter · with","idea":"Dentro de filter() y de with(), masa_corporal_g es una columna convertida en nombre, y umbral se encuentra en el programa principal. Fuera de ellas, masa_corporal_g no es nada: R la busca por la cadena de siempre y no la encuentra."},"archivo":"datos/trazas/19-entornos-4.json"}
```

- En `filter(pinguinos, masa_corporal_g > umbral)`, `masa_corporal_g` se encuentra en el entorno de las columnas. `umbral` no es una columna, así que R sube al padre, el programa principal, y allí vale 5500. Pasan **28** pingüinos, todos papúas.
- `with(pinguinos, mean(masa_corporal_g))` es lo mismo en R base: evalúa `mean(masa_corporal_g)` con las columnas como nombres. Da **4207.1** g.
- La última línea, `mean(masa_corporal_g)`, está fuera de cualquier función que construya ese entorno. R busca `masa_corporal_g` en el programa principal, en los paquetes y en `base`, y se para: `objeto 'masa_corporal_g' no encontrado`.

A esta técnica se le llama ***data masking***, enmascarar con los datos: las columnas tapan a las variables que se llamen igual. Si en el programa hubiera una variable `masa_corporal_g <- 0`, `filter(pinguinos, masa_corporal_g > 6000)` seguiría usando la columna, porque es lo primero que mira, y daría los 2 pingüinos de más de 6000 g.

### 5 · La ruta de búsqueda

Por encima del entorno global hay una fila de entornos, uno por paquete cargado. `search()` la enseña en orden. En una sesión nueva, después de `library(dplyr)` y `library(tidyr)`:

```r
search()
#>  [1] ".GlobalEnv"        "package:tidyr"     "package:dplyr"
#>  [4] "package:stats"     "package:graphics"  "package:grDevices"
#>  [7] "package:utils"     "package:datasets"  "package:methods"
#> [10] "Autoloads"         "package:base"
```

Es la cadena por la que sube R cuando un nombre no está en el programa principal. Cada `library()` mete el paquete justo detrás del entorno global, delante de los que ya había. Por eso, al cargar dplyr, R avisa:

```
The following objects are masked from ‘package:stats’:

    filter, lag
```

El aviso está en inglés aunque el resto de R esté en español. Quiere decir que hay dos funciones `filter()`: la de dplyr y la de stats, que filtra series temporales. Como dplyr está antes en la ruta, cuando escribes `filter`, R encuentra primero la suya. Para usar la otra, se dice de qué paquete se quiere con `::`: `stats::filter()`. Y `find("filter")` dice en qué paquetes hay una: `"package:dplyr" "package:stats"`.

Lo mismo pasa con tus variables: si llamas `sd` a una función tuya, tapa a la `sd()` de stats, que está más lejos. `stats::sd()` sigue funcionando, y al borrar la tuya con `rm(sd)`, `sd` vuelve a ser la de siempre.

::::{div}
:class: afondo
### 6 · Los entornos por dentro

**Un contador que recuerda.** Una clausura con `<<-` puede guardar un estado entre llamadas, sin ninguna variable global:

```{code-cell} r
crea_contador <- function() {
  cuenta <- 0
  suma <- function() {
    cuenta <<- cuenta + 1
    cuenta
  }
  suma
}
c1 <- crea_contador()
c1()
c1()
c2 <- crea_contador()
c2()
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Un contador con memoria","etiqueta":"a fondo · clausura con estado","idea":"Cada llamada a crea_contador() crea un entorno con su propia cuenta. c1 y c2 recuerdan entornos distintos: c1 va por 2 cuando c2 empieza en 1. El <<- cambia la cuenta en el entorno recordado, no en el programa principal."},"archivo":"datos/trazas/19-entornos-5.json"}
```

`cuenta <<- cuenta + 1` sube desde el marco de `suma()` y encuentra `cuenta` en el entorno recordado de `crea_contador()`: la cambia allí, y la próxima llamada la encuentra con el valor nuevo. `c1()` devuelve 1 y luego 2. `c2` viene de **otra** llamada a `crea_contador()`, con su propio entorno, y empieza en 1. Es estado privado: nadie fuera de `c1` puede tocar su cuenta.

**Los entornos son objetos.** Se pueden crear y manejar directamente: `e <- new.env()` crea uno vacío; `assign("a", 5, envir = e)` y `e$a <- 5` guardan un nombre; `get("a", envir = e)` y `e$a` lo leen; `exists("a", envir = e)` pregunta si está. `environment(cuadrado)` devuelve el entorno que recuerda una función, `globalenv()` el global, `parent.env(e)` el padre de un entorno y `emptyenv()` el vacío, el final de toda cadena. `environmentName(environment(filter))` dice `"dplyr"`.

**Los entornos no se copian.** En R, un valor se copia en cuanto se modifica desde otro nombre: si una función cambia una lista que recibe, cambia su propia copia, y la de fuera queda igual. Los entornos son la gran excepción. Si una función hace `ent$a <- 1` con un entorno que ha recibido, el cambio se ve fuera, porque solo hay un entorno y los dos nombres apuntan a él. Por eso los entornos sirven para guardar cosas que muchas funciones comparten.

**Pronombres para las columnas.** Dentro de `filter()`, `mutate()` o `aes()`, `.data$masa_corporal_g` dice «la columna, seguro» y `.env$umbral` dice «la variable de fuera, seguro, aunque haya una columna que se llame igual». Con ellos, el *data masking* deja de ser ambiguo: `filter(pinguinos, .data$masa_corporal_g > .env$umbral)`.

**Léxico, no dinámico.** El alcance léxico mira dónde se definió una función, nunca quién la llama. Algunos lenguajes antiguos hacían lo contrario, el alcance dinámico. En R, si `g <- function() y` se define en el programa principal, `g()` busca `y` allí aunque la llame una función que tenga su propia `y` (ejercicio 1).
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La fábrica de potencias, en R, en Python y en Julia:

```r
potencia <- function(n) function(x) x^n
cuadrado <- potencia(2)
cuadrado(5)   # 25
```

```python
def potencia(n):
    def eleva(x):
        return x ** n
    return eleva
cuadrado = potencia(2)
cuadrado(5)   # 25
```

```julia
potencia(n) = x -> x^n
cuadrado = potencia(2)
cuadrado(5)   # 25
```

Los tres tienen alcance léxico y clausuras. Para cambiar una variable de fuera, como hace `<<-`, Python pide declararla antes con `nonlocal` (o `global`, si es del programa principal), y Julia, con `global` para las del programa principal; las de una función que rodea a otra se pueden cambiar sin más.
:::

## Conexiones

- El **marco** de cada llamada, que el visualizador dibuja desde el capítulo 5, es el entorno de esa llamada. Ahora sabemos también de quién es hijo.
- Las funciones que recibían funciones, como `sapply(..., sc)` en el capítulo 18 o `stat_function(fun = dnorm)` en el 16, y las que las devuelven, como `potencia()`, son la base de la **programación funcional**, el capítulo siguiente.
- El *data masking* de `filter()`, `aes()` y `lm()` es metaprogramación: funciones que reciben una expresión sin evaluar y deciden dónde evaluarla. El capítulo de **metaprogramación** abrirá esa caja.
- La ruta de búsqueda explica los avisos de `library()` y por qué a veces hay que escribir `paquete::función()`. Cuando hagamos nuestro propio **paquete**, en la parte V, tendrá su propio entorno.

## La grieta

En este capítulo, las funciones se han comportado como cualquier otro valor: se guardan en variables (`cuadrado <- potencia(2)`), se devuelven desde otras funciones y se pasan como argumentos (`sapply(c(40, 45, 50.15, 55, 60), sc)` en el capítulo 18). Si una función es un valor como un número, ¿se puede hacer con ellas lo que se hace con los números? ¿Guardar varias en una lista, aplicar una a cada elemento de otra lista, combinarlas para formar funciones nuevas? Escribir programas a base de funciones que reciben y devuelven funciones es la [**programación funcional**](20-programacion-funcional.md).

## Ejercicios

1. **¿Quién llama o dónde nace?** ¿Qué devuelve `f()`? Piénsalo antes de ejecutarlo.

   ```r
   y <- 1
   g <- function() y
   f <- function() {
     y <- 2
     g()
   }
   f()
   ```

2. **Argumento y variable.** Después de `x <- 10` y `h <- function(x) x * 2`, ¿qué dan `h(3)` y después `x`? ¿Por qué no se mezclan las dos `x`?

3. **Potencias.** Con la `potencia()` del apartado 3, ¿cuánto vale `potencia(10)(2)`? ¿Qué hace esa doble pareja de paréntesis?

4. **Una tapadera.** Escribe `mean <- function(x) "no"` y después `mean(1:10)`. ¿Qué sale? ¿Cómo se usa la `mean()` de siempre sin borrar la tuya? ¿Y cómo se recupera del todo?

5. **Columna o variable.** Si en el programa hay una variable `isla <- "Dream"`, ¿qué hace `filter(pinguinos, isla == isla)`? ¿Cuántas filas devuelve? ¿Cómo se escribe para que compare la columna con la variable?

6. **El contador global.** Con el `suma_uno()` del apartado 2, ¿qué pasa si alguien escribe `contador <- 100` entre dos llamadas? ¿Qué problema de diseño enseña?

:::{div}
:class: afondo
7. **Entornos que no se copian.** Escribe `pon <- function(ent) ent$a <- 1`, crea `e <- new.env()` y llama a `pon(e)`. ¿Qué vale `e$a` después? Haz lo mismo con una lista, `l <- list()`, y `pon2 <- function(li) li$a <- 1`. ¿Qué diferencia hay?

8. **Dos contadores.** En el apartado 6, después de `c1()`, `c1()` y `c2()`, ¿qué devuelve la siguiente llamada a `c1()`? ¿Y a `c2()`?
:::

## Solucionario

1. Devuelve **1**. `g` se definió en el programa principal, así que su entorno padre es el programa principal, no el marco de `f()`. Cuando `g()` busca `y`, no la encuentra en su marco y sube al programa principal, donde vale 1. La `y <- 2` de `f()` vive en otro entorno, que `g` no ve. Es el alcance léxico: importa dónde nace la función, no quién la llama.
2. `h(3)` da 6 y `x` sigue valiendo 10. El argumento `x` de `h` es una variable del marco de la llamada, que tapa a la global mientras la función se ejecuta y desaparece al terminar.
3. 1024. `potencia(10)` devuelve una función (la que eleva a la décima), y el segundo par de paréntesis la llama con `2`: $2^{10} = 1024$.
4. Sale `"no"`: tu `mean` está en el entorno global, que R mira antes que el de `base`. `base::mean(1:10)` da 5.5 sin tocar la tuya. Con `rm(mean)`, la tuya desaparece y `mean` vuelve a ser la de `base`.
5. Las dos `isla` se encuentran en el entorno de las columnas, así que compara cada isla consigo misma: siempre `TRUE`, y devuelve las 333 filas. Para comparar con la variable: `filter(pinguinos, isla == .env$isla)`, o mejor, usar otro nombre para la variable.
6. La siguiente llamada sigue desde 100: devuelve 101. El valor de `suma_uno()` depende de algo que cualquiera puede cambiar desde fuera. Una clausura como la de `crea_contador()` guarda la cuenta donde nadie más llega.

:::{div}
:class: afondo
7. `e$a` vale 1: el entorno no se copia, y `ent` y `e` son el mismo. Con la lista, `pon2(l)` cambia una copia, y `l` sigue vacía: `length(l)` es 0.
8. `c1()` devuelve 3, porque su entorno iba por 2. `c2()` devuelve 2, porque el suyo iba por 1. Cada uno lleva su propia cuenta.
:::
