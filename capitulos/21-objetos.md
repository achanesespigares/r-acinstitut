---
title: "Objetos: cada cosa sabe cómo comportarse"
subtitle: Clases, funciones genéricas y métodos
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En una copistería, el botón de «imprimir» es el mismo para todo. Pero una foto sale en papel brillante y a todo color, un documento de texto sale a doble cara y una hoja de cálculo sale apaisada, con sus cuadrículas. Quien pulsa el botón no tiene que saber cómo se imprime cada cosa: cada tipo de archivo trae su manera de imprimirse, y la impresora la consulta.

## La pregunta

En el capítulo anterior, cada resultado se mostraba a su manera: un data frame como una tabla, un factor con sus niveles, un modelo con su fórmula y sus coeficientes. Y `summary()` resumía las columnas de una tabla, daba la tabla de coeficientes de un modelo y hacía un recuento de un factor. Es siempre la misma función. ¿Cómo sabe `print()` o `summary()` qué hacer con cada cosa? ¿Y se le puede enseñar a tratar algo nuevo, algo que hayamos inventado nosotros?

## La idea

Cualquier valor de R puede llevar **atributos**: datos sobre el dato, como los nombres (`names`), las dimensiones de una matriz (`dim`) o los niveles de un factor (`levels`). Uno de ellos es especial, la **clase** (`class`): una etiqueta que dice qué tipo de objeto es.

El sistema de objetos más usado en R se llama **S3**, y se basa en dos piezas:

- una **función genérica**, como `print()` o `summary()`, no hace el trabajo ella misma: mira la clase de su argumento y llama a la función adecuada;
- un **método** es la función que hace el trabajo para una clase concreta, y se llama como la genérica, un punto y la clase: `print.data.frame()`, `summary.lm()`, `print.factor()`.

A ese reparto se le llama **despacho**. Si un objeto no tiene método para su clase, se usa el método por defecto, `print.default()`. Y como la clase es solo una etiqueta, cualquiera puede crear una clase nueva y escribirle sus métodos.

:::{important} El despacho de S3
Cuando se llama a `print(x)`:

1. `print()` mira `class(x)`. Supongamos que es `"alumno"`.
2. Busca una función que se llame `print.alumno()`. Si la encuentra, le pasa `x`.
3. Si `x` tiene varias clases, `c("delegado", "alumno")`, las prueba en orden: primero `print.delegado()`, después `print.alumno()`.
4. Si no encuentra ningún método, usa `print.default()`.

`print()` tiene casi 200 métodos en una sesión de R recién abierta; `summary()`, más de 30. `methods(print)` los enseña.
:::

## Construcción

### 1 · Una clase propia

Este es el programa estrella del capítulo. Una función **constructora**, `alumno()`, fabrica objetos de una clase nueva: una lista con el nombre y las notas, con la etiqueta `"alumno"`. Después se le enseña a `print()` a mostrarlos.

:::{tip} Predice
La línea 7 escribe `ana` sola, y R la muestra con `print()`. La línea 12 hace lo mismo, pero después de definir `print.alumno()`. ¿Saldrá lo mismo en las dos?
:::

```{code-cell} r
alumno <- function(nombre, notas) {
  obj <- list(nombre = nombre, notas = notas)
  class(obj) <- "alumno"
  obj
}
ana <- alumno("Ana", c(7, 8.5, 9))
ana
print.alumno <- function(x, ...) {
  cat("Alumno:", x$nombre, "· media", round(mean(x$notas), 2), "\n")
  invisible(x)
}
ana
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Enseñar a print() una clase nueva","etiqueta":"S3 · print","idea":"ana es una lista con la etiqueta de clase alumno. La primera vez que se muestra, print() no encuentra ningún método para esa clase y la enseña como una lista. Después de definir print.alumno(), la misma línea llama a ese método."},"archivo":"datos/trazas/21-objetos-1.json"}
```

- La constructora crea una lista y le pone la etiqueta con `class(obj) <- "alumno"`. En la memoria, `ana` es una lista de dos elementos con su **clase** encima.
- La primera vez que se escribe `ana`, R llama a `print()`. No hay ningún `print.alumno()`, así que se usa el método por defecto: la consola enseña la lista entera y, al final, `attr(,"class")` y `"alumno"`.
- `print.alumno()` es un **método**: se llama como la genérica, un punto y la clase. Recibe el objeto como `x` (y `...`, que todos los métodos de `print()` aceptan) y escribe una línea con `cat()`.
- La segunda vez que se escribe `ana`, `print()` encuentra `print.alumno()` y le pasa el trabajo. En el visualizador se abre su marco, y la consola escribe `Alumno: Ana · media 8.17`.

El método termina con `invisible(x)`: devuelve el objeto, como hacen todos los métodos de `print()`, pero sin volver a mostrarlo. Así se puede escribir `print(ana)` dentro de una tubería sin romperla.

### 2 · Por dentro, todo son atributos

Los objetos de R que ya conocemos están hechos de la misma manera: un valor de base, como un vector o una lista, con atributos encima. `attributes()` los enseña todos, y `unclass()` quita la clase y deja ver lo que hay debajo.

```{code-cell} r
nivel <- factor(c("bien", "notable", "bien"))
attributes(nivel)
unclass(nivel)
tabla <- data.frame(x = 1:2, y = c("a", "b"))
attributes(tabla)
unclass(tabla)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Lo que hay debajo de la clase","etiqueta":"attributes · unclass","idea":"Un factor es un vector de enteros con dos atributos, los niveles y la clase. Un data frame es una lista de columnas con tres atributos: los nombres, la clase y los nombres de las filas. Sin la clase, print() ya no los reconoce."},"archivo":"datos/trazas/21-objetos-2.json"}
```

- Un **factor** (capítulo 6) es un vector de enteros, `1 2 1`, con dos atributos: `levels`, los niveles, y `class`, `"factor"`. Sin la clase, `unclass(nivel)` enseña los códigos con los niveles colgando: `print.factor()` era quien traducía cada código a su etiqueta.
- Un **data frame** (capítulo 9) es una lista de columnas con tres atributos: `names`, los nombres de las columnas; `class`, `"data.frame"`; y `row.names`, los nombres de las filas. Sin la clase, `unclass(tabla)` se imprime como una lista corriente: `print.data.frame()` era quien la dibujaba como tabla.
- Un **modelo** `lm` (capítulo 18) es una lista con `coefficients`, `residuals` y diez elementos más, con la clase `"lm"`. `print(modelo)` llama a `print.lm()`, y `summary(modelo)` a `summary.lm()`, que devuelve otro objeto, de clase `"summary.lm"`, con su propio `print()`.

Esa es la respuesta a la grieta: `print()` y `summary()` no saben nada de tablas, factores ni modelos. Cada clase trae sus propios métodos, y la genérica solo despacha.

### 3 · Funciones genéricas

Una genérica nueva se escribe con `UseMethod()`: una función de una línea que solo despacha. Y a las genéricas que ya existen, como `summary()`, se les pueden añadir métodos para una clase nueva.

```{code-cell} r
alumno <- function(nombre, notas) {
  obj <- list(nombre = nombre, notas = notas)
  class(obj) <- "alumno"
  obj
}
saluda <- function(x) UseMethod("saluda")
saluda.alumno <- function(x) paste("Hola,", x$nombre)
saluda.default <- function(x) "Hola, desconocido"
ana <- alumno("Ana", c(7, 8.5, 9))
saluda(ana)
saluda(42)
summary.alumno <- function(object, ...) {
  c(minima = min(object$notas), media = mean(object$notas), maxima = max(object$notas))
}
summary(ana)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Despachar","etiqueta":"UseMethod","idea":"saluda() solo despacha: mira la clase de x y pasa el trabajo al método. Con ana va a saluda.alumno(); con 42, que no tiene método propio, a saluda.default(). Y summary(), que ya existía, encuentra el método nuevo, summary.alumno()."},"archivo":"datos/trazas/21-objetos-3.json"}
```

- `saluda <- function(x) UseMethod("saluda")` crea una **genérica**. `UseMethod("saluda")` mira la clase de `x` y busca `saluda.<clase>()`.
- `saluda(ana)`: la clase es `"alumno"`, así que el trabajo va a `saluda.alumno()`. En el visualizador, el marco de `saluda()` se queda esperando mientras trabaja el del método: `"Hola, Ana"`.
- `saluda(42)`: la clase de 42 es `"numeric"`, y no hay `saluda.numeric()`. Se usa `saluda.default()`: `"Hola, desconocido"`. Sin método por defecto, R se pararía con un error que avisa de que no hay ningún método aplicable.
- `summary.alumno()` añade un método a una genérica que ya existía. `summary(ana)` lo encuentra y devuelve las notas mínima, media y máxima: 7, 8.17 y 9.

Los argumentos de un método se llaman como los de su genérica: `x` en `print()`, `object` en `summary()`. Con `args(summary)` se ve qué nombre espera cada una.

### 4 · Herencia

Un objeto puede tener **varias clases**, de la más concreta a la más general. Si un delegado es un alumno con algo más, su clase puede ser `c("delegado", "alumno")`: lo que no tenga método propio de delegado, se resolverá como alumno.

```{code-cell} r
alumno <- function(nombre, notas) {
  obj <- list(nombre = nombre, notas = notas)
  class(obj) <- "alumno"
  obj
}
print.alumno <- function(x, ...) {
  cat("Alumno:", x$nombre, "· media", round(mean(x$notas), 2), "\n")
  invisible(x)
}
print.delegado <- function(x, ...) {
  cat("Delegado de clase\n")
  NextMethod()
}
pedro <- alumno("Pedro", c(6, 7))
class(pedro) <- c("delegado", class(pedro))
pedro
inherits(pedro, "alumno")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Un delegado también es alumno","etiqueta":"herencia · NextMethod","idea":"pedro tiene dos clases. print() encuentra primero print.delegado(), que escribe su línea y, con NextMethod(), pasa el trabajo al método de la clase siguiente, print.alumno()."},"archivo":"datos/trazas/21-objetos-4.json"}
```

- `class(pedro) <- c("delegado", class(pedro))` le pone a `pedro` una clase más, delante de la que tenía: ahora es `c("delegado", "alumno")`.
- Al mostrar `pedro`, `print()` prueba las clases en orden y encuentra primero `print.delegado()`, que escribe `Delegado de clase`.
- `NextMethod()` llama al **método siguiente** de la lista de clases, `print.alumno()`, con el mismo objeto: `Alumno: Pedro · media 6.5`. Así el delegado no repite el trabajo del alumno: lo amplía.
- `inherits(pedro, "alumno")` pregunta si `pedro` es un alumno, aunque su primera clase sea otra: `TRUE`. Es la manera correcta de comprobar una clase; comparar `class(x) == "alumno"` fallaría con `pedro`, porque daría dos respuestas, `FALSE` y `TRUE`.

Es lo mismo que pasa con las tablas de dplyr: un tibble tiene las clases `c("tbl_df", "tbl", "data.frame")`. Tiene su propio `print()`, más compacto, pero para todo lo demás sigue siendo un data frame.

::::{div}
:class: afondo
### 5 · Otros sistemas de objetos: S4 y R6

S3 es sencillo y flexible, pero no comprueba nada: cualquiera puede ponerle la clase `"alumno"` a un número. R tiene otros dos sistemas para cuando hace falta más.

**R6: objetos que no se copian.** El paquete R6 crea objetos parecidos a los de Python o Java: cada objeto lleva sus campos y sus métodos dentro, y se usan con `$`. Su gran diferencia con S3 es que **no se copian**, porque por dentro son entornos (capítulo 19).

```{code-cell} r
library(R6)
Contador <- R6Class("Contador", public = list(
  cuenta = 0,
  suma = function() {
    self$cuenta <- self$cuenta + 1
    invisible(self)
  }
))
c1 <- Contador$new()
c2 <- c1
c1$suma()
c2$cuenta
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Un objeto, dos nombres","etiqueta":"a fondo · R6","idea":"Contador$new() crea un objeto, el nº 1. c2 <- c1 no lo copia: los dos nombres apuntan al mismo objeto. Cuando c1$suma() cambia la cuenta con self$, el cambio se ve también en c2."},"archivo":"datos/trazas/21-objetos-5.json"}
```

`R6Class()` define la clase, con un campo, `cuenta`, y un método, `suma()`. Dentro del método, `self` es el propio objeto, y `self$cuenta <- self$cuenta + 1` cambia su campo. `c2 <- c1` no hace una copia, como haría con una lista: `c1` y `c2` son dos nombres del **mismo** objeto, el nº 1. Por eso, después de `c1$suma()`, `c2$cuenta` vale 1. Si de verdad se quiere una copia, se pide: `c2 <- c1$clone()`. Como `suma()` devuelve `invisible(self)`, se pueden encadenar llamadas: `c1$suma()$suma()`.

R6 es útil para cosas que tienen estado y cambian con el tiempo: una conexión a una base de datos, una partida de un juego, la sesión de una aplicación Shiny (parte V).

**S4: clases con reglas.** El sistema S4, del paquete methods, declara cada clase con sus campos (*slots*) y sus tipos, y puede comprobar que un objeto es válido al crearlo:

```r
setClass("Alumna", representation(nombre = "character", notas = "numeric"),
  validity = function(object) if (any(object@notas < 0 | object@notas > 10)) "las notas van de 0 a 10" else TRUE)
eva <- new("Alumna", nombre = "Eva", notas = c(9, 10))
eva@nombre                                        # "Eva"
new("Alumna", nombre = "X", notas = 12)           # error: invalid class “Alumna” object: las notas van de 0 a 10
setGeneric("media", function(x) standardGeneric("media"))
setMethod("media", "Alumna", function(x) mean(x@notas))
media(eva)                                        # 9.5
```

Los campos se leen con `@`, no con `$`; `new()` crea los objetos y comprueba los tipos y la validez (el error sale en inglés, con la frase de `validity` al final); `setGeneric()` y `setMethod()` hacen el papel de `UseMethod()` y de los métodos de S3. S4 se usa mucho en Bioconductor, la gran colección de paquetes de bioinformática, donde los objetos son grandes y conviene que no se puedan construir mal.

**El patrón de las tres funciones.** En S3, una clase bien hecha suele tener tres funciones: una constructora interna, que crea el objeto sin preguntas (`new_alumno()`); una validadora, que comprueba que tiene sentido (que las notas estén entre 0 y 10); y una función de ayuda para el usuario (`alumno()`), que llama a las otras dos. Es lo que hacen los paquetes del tidyverse con sus propias clases.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La clase `alumno`, con su manera de mostrarse. En R con S3, en Python y en Julia:

```r
alumno <- function(nombre, notas) structure(list(nombre = nombre, notas = notas), class = "alumno")
print.alumno <- function(x, ...) cat("Alumno:", x$nombre, "· media", mean(x$notas), "\n")
```

```python
class Alumno:
    def __init__(self, nombre, notas):
        self.nombre, self.notas = nombre, notas
    def __repr__(self):
        return f"Alumno: {self.nombre} · media {sum(self.notas) / len(self.notas)}"
```

```julia
struct Alumno
    nombre::String
    notas::Vector{Float64}
end
Base.show(io::IO, a::Alumno) = print(io, "Alumno: ", a.nombre, " · media ", sum(a.notas) / length(a.notas))
```

En Python, los métodos pertenecen a la **clase**: se escriben dentro de ella y se llaman con un punto, `ana.metodo()`. En R con S3 y en Julia, los métodos pertenecen a la **función genérica**, `print()` o `show()`, y se eligen según el tipo del argumento. Julia lleva la idea más lejos: elige el método según el tipo de **todos** los argumentos, no solo del primero. Se llama despacho múltiple, y es la idea central de ese lenguaje. R6, en cambio, se parece al estilo de Python.
:::

## Conexiones

- Los **factores** del capítulo 6, los **data frames** del 9, las **fechas** del 11 y los **modelos** del 18 son objetos S3: un vector o una lista con una clase y sus métodos.
- Los objetos R6 son **entornos** (capítulo 19): por eso no se copian y `self` funciona como funciona.
- Los paquetes que hagamos en la parte V **exportarán** sus métodos, para que cualquiera que los cargue pueda imprimir y resumir sus objetos.
- Los tibbles de **dplyr** heredan de data.frame: tienen su propio `print()`, pero todo lo demás lo hacen como un data frame.

## La grieta

Hay un objeto que imprime algo sorprendente. Al mostrar un modelo, la primera línea es `Call:` y debajo aparece el código que escribimos, `lm(formula = masa_corporal_g ~ largo_aleta_mm, data = pinguinos)`. El modelo recuerda el código, no solo los números. Y en el capítulo 19 quedó pendiente cómo `filter()` recibe `masa_corporal_g > umbral` sin que R intente calcularlo antes. ¿Cómo puede una función quedarse con el código que le pasan, en lugar de con su valor? ¿Se puede guardar código en una variable, mirarlo por dentro y cambiarlo antes de ejecutarlo? Escribir código que trabaja con código es la [**metaprogramación**](22-metaprogramacion.md).

## Ejercicios

1. **Un resumen mejor.** Cambia `summary.alumno()` para que devuelva también cuántas notas tiene el alumno. Pruébalo con `ana`.

2. **Temperaturas.** Crea un objeto `t1 <- structure(25, class = "celsius")` y escribe un `print.celsius()` que lo muestre como `25 °C`. ¿Qué sale al escribir `t1` antes de definir el método?

3. **Debajo de un factor.** ¿Qué devuelve `unclass(factor(c("b", "a", "b")))`? ¿Por qué los códigos no siguen el orden en que aparecen las letras?

4. **¿Quién trabaja?** Un objeto tiene la clase `c("b", "a")`, y solo existe `saluda.a()`. ¿Qué método se usa en `saluda(objeto)`? ¿Y si existiera también `saluda.b()`?

5. **Sin clase.** ¿Qué sale con `print(unclass(ana))`? ¿Y con `print.default(ana)`? ¿Qué diferencia hay?

6. **Preguntar bien.** ¿Qué da `class(pedro) == "alumno"`? ¿Y `inherits(pedro, "alumno")`? ¿Por qué la segunda es mejor dentro de un `if`?

:::{div}
:class: afondo
7. **Copiar de verdad.** Con el `Contador` del apartado 5, ¿qué valen `c1$cuenta` y `c3$cuenta` después de `c3 <- c1$clone()` y `c3$suma()`, si antes `c1$cuenta` valía 2?

8. **Una alumna imposible.** ¿Qué pasa con `new("Alumna", nombre = "X", notas = 12)`? ¿Y con `alumno("X", 12)`, la constructora de S3? ¿Qué le falta a la versión S3?
:::

## Solucionario

1. Por ejemplo, `summary.alumno <- function(object, ...) c(n = length(object$notas), minima = min(object$notas), media = mean(object$notas), maxima = max(object$notas))`. Con `ana` da `n = 3`, mínima 7, media 8.17 y máxima 9.
2. `print.celsius <- function(x, ...) cat(unclass(x), "°C\n")`. Antes de definirlo, `t1` se muestra con `print.default()`: `[1] 25`, y debajo `attr(,"class")` y `"celsius"`. Con el método, sale `25 °C`. `unclass()` hace falta para que `cat()` reciba el número sin la clase.
3. `2 1 2`, con el atributo `levels` igual a `"a" "b"`. Los niveles se ordenan alfabéticamente (capítulo 6), así que `"a"` es el nivel 1 y `"b"` el 2, aunque la `"b"` aparezca primero: por eso el primer código es un 2.
4. `saluda.a()`: `UseMethod()` prueba `saluda.b()`, no lo encuentra y pasa a la clase siguiente, `"a"`. Si existiera `saluda.b()`, se usaría ese, porque es la primera clase de la lista.
5. `print(unclass(ana))` enseña la lista sin la línea `attr(,"class")`, porque ya no tiene clase. `print.default(ana)` enseña la lista con esa línea al final: llama directamente al método por defecto, pero el objeto sigue teniendo su clase.
6. `class(pedro) == "alumno"` da dos valores, `FALSE TRUE`, porque `pedro` tiene dos clases. Dentro de un `if`, eso es un error (capítulo 4: la condición tiene más de un elemento). `inherits()` da una sola respuesta, `TRUE`, y tiene en cuenta todas las clases.

:::{div}
:class: afondo
7. `c1$cuenta` sigue en 2 y `c3$cuenta` vale 3. `clone()` crea un objeto nuevo con los mismos valores, y desde entonces cada uno lleva su cuenta.
8. `new()` se para con un error, `invalid class “Alumna” object: las notas van de 0 a 10`, porque la validez de la clase lo comprueba. `alumno("X", 12)` crea el objeto sin protestar: a la versión S3 le falta una función validadora, como la del patrón de las tres funciones.
:::
