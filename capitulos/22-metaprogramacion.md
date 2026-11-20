---
title: "Metaprogramación: código que trabaja con código"
subtitle: Capturar una expresión, mirarla por dentro y decidir dónde se evalúa
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En la pizarra, $(a + b)^2$ se puede hacer de dos maneras. Se puede **calcular**: si $a = 2$ y $b = 3$, sale 25. O se puede **trabajar con la expresión misma**, sin darle valores: desarrollarla como $a^2 + 2ab + b^2$, derivarla respecto de $a$ o sustituir $b$ por otra cosa. En el segundo caso, la expresión es el objeto con el que se trabaja, no una orden de cálculo. Los programas de cálculo simbólico, como los que derivan e integran, viven de esa diferencia.

## La pregunta

Al cerrar el capítulo anterior, un modelo imprimía `Call:` con el código que habíamos escrito, `lm(formula = masa_corporal_g ~ largo_aleta_mm, data = pinguinos)`: no solo recuerda los números, también el código. Y desde el capítulo 19 quedaba pendiente cómo `filter()` recibe `masa_corporal_g > umbral` sin que R intente calcularlo antes, lo que daría `objeto 'masa_corporal_g' no encontrado`. ¿Cómo se queda una función con el código que le pasan, en lugar de con su valor? ¿Se puede guardar código en una variable, mirarlo por dentro y cambiarlo antes de ejecutarlo?

## La idea

En R, el código también es un dato. `quote()` **captura** una expresión sin evaluarla y la guarda como un objeto, y `eval()` la **evalúa** cuando se quiera y en el entorno que se quiera.

Una expresión guardada es un **árbol**, con tres clases de piezas:

- las **llamadas** (clase `call`): una función con sus argumentos. Hasta `x * 10 + 1` es una llamada: la función `+`, con dos argumentos, `x * 10` y `1`;
- los **símbolos** (clase `name`): nombres, como `x`, guardados como tales, sin buscar su valor;
- las **constantes**: números, textos, `TRUE`…

Dentro de una función, `substitute()` captura el **código** que se pasó como argumento, y `match.call()`, la llamada entera. Con esas piezas se escriben las funciones que trabajan con código, como `filter()`, `aes()` o `lm()`. Escribir código que trabaja con código es la **metaprogramación**.

:::{important} Tres funciones para empezar
| Función | Qué hace | Ejemplo |
|---|---|---|
| `quote(expr)` | guarda el código sin evaluarlo | `quote(x * 10 + 1)` |
| `eval(expr, entorno)` | evalúa un código guardado en un entorno, que puede ser una tabla | `eval(e, list(x = 100))` |
| `substitute(arg)` | dentro de una función, devuelve el código que se pasó en `arg` | `substitute(condicion)` |

Desde este capítulo, el visualizador dibuja el código guardado como un árbol, con la función arriba y sus argumentos colgando.
:::

## Construcción

### 1 · Guardar código y evaluarlo después

Este es el programa estrella del capítulo. `quote()` guarda una expresión en `e`, y `eval()` la evalúa tres veces, en momentos y entornos distintos.

:::{tip} Predice
`e` guarda `x * 10 + 1` cuando `x` vale 2. Después, `x` pasa a valer 5. ¿Qué dará `eval(e)`: 21 o 51?
:::

```{code-cell} r
x <- 2
e <- quote(x * 10 + 1)
e
eval(e)
x <- 5
eval(e)
eval(e, list(x = 100))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Código en una variable","etiqueta":"quote · eval","idea":"e no guarda un número: guarda el código x * 10 + 1, dibujado como un árbol. Cada eval() lo calcula en ese momento, con el x que haya. Con una lista, eval() busca x primero en la lista."},"archivo":"datos/trazas/22-metaprogramacion-1.json"}
```

- `quote(x * 10 + 1)` no calcula nada. Guarda en `e` el **código**, que en la memoria se dibuja como un árbol: arriba la función `+`, con dos argumentos; el primero es otra llamada, `*`, con `x` y `10`, y el segundo, la constante `1`.
- Escribir `e` lo muestra tal cual: `x * 10 + 1`.
- `eval(e)` lo evalúa en el entorno del programa, con `x = 2`: **21**.
- Después de `x <- 5`, `eval(e)` da **51**. El código es el mismo; el valor de `x`, no. Como en el capítulo 19, R busca `x` en el momento de evaluar.
- `eval(e, list(x = 100))` evalúa el código en otro entorno: una lista con sus propios nombres. R encuentra `x` en la lista antes que en el programa: **1001**.

Esa última línea es el *data masking* del capítulo 19. Si en lugar de una lista se le da a `eval()` una tabla, las columnas se convierten en nombres.

### 2 · El código es un árbol

Una llamada guardada se puede mirar por dentro como una lista: su primer elemento es la función y los siguientes, sus argumentos. Y se puede cambiar, o construir pieza a pieza con `call()`.

```{code-cell} r
e <- quote(x * 10 + 1)
e[[1]]
e[[2]]
e[[1]] <- as.name("-")
e
redondeo <- call("round", 3.14159, 2)
redondeo
eval(redondeo)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Mirar y cambiar el árbol","etiqueta":"e[[1]] · call()","idea":"e[[1]] es la función de arriba del árbol, `+`, y e[[2]] su primer argumento, x * 10. Al cambiar e[[1]] por `-`, el árbol cambia de raíz. call() construye una llamada nueva desde sus piezas."},"archivo":"datos/trazas/22-metaprogramacion-2.json"}
```

- `e[[1]]` es la raíz del árbol, la función `` `+` ``. Las comillas invertidas dicen que es un nombre de función que no se puede escribir de otra manera.
- `e[[2]]` es su primer argumento, otra llamada: `x * 10`.
- `e[[1]] <- as.name("-")` cambia la raíz: el árbol pasa a ser `x * 10 - 1`. Se ha modificado un programa sin ejecutarlo. `as.name()` convierte un texto en un símbolo.
- `call("round", 3.14159, 2)` **construye** una llamada a partir de sus piezas: el nombre de la función y los argumentos. Sale `round(3.14159, 2)`, y `eval()` la ejecuta: **3.14**.

Un símbolo es de clase `name`, una llamada de clase `call`, y las dos son tipos de código (`typeof()` dice `"language"`). Las constantes, en cambio, son los propios valores: `quote(1)` es simplemente el número 1.

### 3 · Funciones que ven el código: `substitute()`

R no evalúa los argumentos de una función en el momento de llamarla. Los guarda como **promesas**: el código, junto con el entorno donde se escribió. Solo los evalúa cuando la función los usa. Por eso una función puede, en lugar de usar un argumento, mirar su código con `substitute()`. Con eso ya se puede escribir un `filter()` propio.

```{code-cell} r
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
mi_filtro <- function(datos, condicion) {
  cond <- substitute(condicion)
  filas <- eval(cond, datos, parent.frame())
  datos[filas, ]
}
umbral <- 6000
pesados <- mi_filtro(pinguinos, masa_corporal_g > umbral)
nrow(pesados)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Un filter() hecho a mano","etiqueta":"substitute · eval","idea":"condicion llega como una promesa: código sin evaluar. Si se evaluara, fallaría, porque masa_corporal_g no es una variable. substitute() la captura como código, y eval() la evalúa con las columnas de la tabla como nombres, y el programa como entorno padre para encontrar umbral."},"archivo":"datos/trazas/22-metaprogramacion-3.json"}
```

- Al llamar a `mi_filtro()`, el argumento `condicion` llega como una **promesa**: el código `masa_corporal_g > umbral`, sin evaluar. En el marco de la llamada se ve como código, no como un valor. Si la función lo usara directamente, R lo evaluaría en el programa principal y se pararía, porque allí no hay ninguna `masa_corporal_g`.
- `substitute(condicion)` no evalúa la promesa: devuelve su código. `cond` guarda el árbol `>` con dos ramas, `masa_corporal_g` y `umbral`.
- `eval(cond, datos, parent.frame())` evalúa ese código con la tabla como entorno: `masa_corporal_g` es una columna. El tercer argumento dice dónde seguir buscando lo que no esté en la tabla: `parent.frame()`, el entorno desde el que se llamó a `mi_filtro()`, el programa principal, donde `umbral` vale 6000. Sale un vector lógico, `TRUE` en las filas que cumplen la condición.
- `datos[filas, ]` se queda con esas filas: **2** pingüinos de más de 6000 g.

Es exactamente lo que hace `filter()`, con más cuidado y más rápido. Esta técnica de capturar el código de un argumento y evaluarlo en otro sitio se llama **evaluación no estándar**, y es la que hace que el tidyverse sea tan cómodo de escribir.

### 4 · La llamada entera: `match.call()`

`match.call()` captura la llamada con la que se ejecuta una función, con el nombre de cada argumento escrito delante. Así es como `lm()` recuerda el código que la creó.

```{code-cell} r
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
ajusta <- function(formula, data) {
  llamada <- match.call()
  llamada
}
ajusta(masa_corporal_g ~ largo_aleta_mm, pinguinos)
modelo <- lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos)
modelo$call
f <- masa_corporal_g ~ largo_aleta_mm
all.vars(f)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Recordar cómo te llamaron","etiqueta":"match.call · fórmulas","idea":"match.call() devuelve la llamada como código, con los nombres de los argumentos completados. lm() hace lo mismo y lo guarda en modelo$call. Una fórmula también es código guardado: all.vars() saca sus variables."},"archivo":"datos/trazas/22-metaprogramacion-4.json"}
```

- Dentro de `ajusta()`, `match.call()` devuelve la llamada como código: `ajusta(formula = masa_corporal_g ~ largo_aleta_mm, data = pinguinos)`. La llamada se escribió sin decir `data =`, y `match.call()` completa el nombre de cada argumento.
- `lm()` hace lo mismo al empezar y guarda el resultado dentro del modelo. `modelo$call` es ese código, y es lo que `print.lm()` enseña después de `Call:`. La respuesta a la pregunta del principio: el modelo no recuerda el texto, recuerda el **árbol** de su llamada.
- Una **fórmula** es otra manera de guardar código sin evaluarlo: la tilde es como un `quote()` con forma de ecuación. `all.vars(f)` saca las variables que aparecen en ella: `"masa_corporal_g"` y `"largo_aleta_mm"`. `lm()` las busca después como columnas de `data`.

::::{div}
:class: afondo
### 5 · Derivar con R, y otras herramientas

**Derivadas simbólicas.** Como las expresiones son árboles, se pueden transformar con reglas, igual que se deriva a mano. R trae una función que lo hace, `D()`:

```{code-cell} r
f <- quote(x^2 + 3 * x)
df <- D(f, "x")
df
eval(df, list(x = 2))
D(quote(sin(x) * x), "x")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Derivar un árbol","etiqueta":"a fondo · D()","idea":"D() recorre el árbol de f y aplica las reglas de derivación a cada rama: el resultado es otro árbol, 2 * x + 3. Con eval() se calcula su valor en x = 2. Con sin(x) * x aplica la regla del producto."},"archivo":"datos/trazas/22-metaprogramacion-5.json"}
```

`D(f, "x")` recibe el árbol de $x^2 + 3x$ y devuelve **otro árbol**: `2 * x + 3`. Lo que hace es recorrer las ramas aplicando las reglas de derivación (la de la suma, la de la potencia, la de la constante por función), como se haría a mano. `eval(df, list(x = 2))` evalúa la derivada en $x = 2$: 7. Y con `sin(x) * x` aplica la regla del producto: `cos(x) * x + sin(x)`. `D()` solo conoce las funciones elementales; para cálculo simbólico de verdad hay paquetes como Ryacas, o, en Python, SymPy.

**Meter valores en el código: `bquote()`.** A veces se quiere construir código con una parte fija y otra que viene de una variable. `bquote()` es un `quote()` en el que lo que va dentro de `.()` sí se evalúa: con `n <- 5`, `bquote(.(n) + y)` da `5 + y`.

**Funciones que usan dplyr: `{{ }}`.** Si escribes una función que pasa una columna a `group_by()` o a `summarise()`, falla con `group_by(grupo)`: dplyr busca una columna llamada `grupo` (y se para con el mensaje, en inglés, de que no la encuentra). El paquete rlang, en el que se apoya el tidyverse, tiene un operador para eso, las dobles llaves, que en inglés se llaman *curly-curly*: `{{ grupo }}` le dice a dplyr que use el código que el usuario pasó en `grupo`.

```r
media_por <- function(datos, grupo, variable) {
  datos |> group_by({{ grupo }}) |> summarise(media = mean({{ variable }}))
}
media_por(pinguinos, especie, masa_corporal_g)
#> especie  media
#> Adelia   3706.
#> Barbijo  3733.
#> Papúa    5092.
```

Por dentro, `{{ }}` es `enquo()` y `!!`, las versiones de rlang de `substitute()` y de la sustitución de `bquote()`, que además se llevan el entorno donde se escribió el código (lo que rlang llama una *quosure*).

**Un aviso.** `eval(parse(text = "..."))` convierte un texto en código y lo ejecuta. Es potente y peligroso: si el texto viene de fuera (un archivo, un formulario), se ejecuta lo que sea que diga. Casi siempre hay una manera mejor, con `call()`, `bquote()` o una función normal. Y la evaluación no estándar tiene un precio: una función como `mi_filtro()` es cómoda de escribir a mano, pero más difícil de usar desde otras funciones, como acabamos de ver con `group_by()`.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Guardar `x * 10 + 1` como código, mirarlo y evaluarlo con `x = 5`. En R, en Python y en Julia:

```r
e <- quote(x * 10 + 1)
e[[1]]                       # `+`
eval(e, list(x = 5))         # 51
```

```python
import ast
e = ast.parse("x * 10 + 1", mode="eval")
ast.dump(e.body)             # BinOp(left=BinOp(...), op=Add(), right=Constant(value=1))
eval(compile(e, "<cadena>", "eval"), {"x": 5})   # 51
```

```julia
e = :(x * 10 + 1)
e.args[1]                    # :+
x = 5; eval(e)               # 51
```

R y Julia tratan el código como un dato más, con la misma idea de árbol: una llamada es su función y sus argumentos. Julia lo lleva más lejos con sus **macros** (`@time`, `@show`), funciones que reciben código y devuelven otro código antes de ejecutarlo. Python también puede ver su propio árbol con el módulo `ast`, pero se usa mucho menos: allí casi nadie escribe funciones que capturen el código de sus argumentos.
:::

## Conexiones

- El *data masking* del **capítulo 19** queda explicado del todo: `filter()`, `aes()` y `lm()` capturan el código de sus argumentos y lo evalúan con las columnas como nombres.
- Las **fórmulas** de `lm()`, `facet_wrap(~isla)` y `geom_smooth(formula = y ~ x)` son código guardado: cada función decide qué hacer con él.
- `match.call()` es la razón de que los objetos del **capítulo 21**, como los modelos, puedan imprimir la llamada que los creó.
- En la parte V, los **informes con Quarto** mezclan texto y código que se ejecuta al construir el documento: código tratado como dato, otra vez.

## La grieta

A estas alturas sabemos escribir el mismo cálculo de muchas maneras: con un bucle `for`, con `map()`, con una operación con vectores, con `Reduce()`, a mano o con dplyr. Todas dan el mismo resultado. Pero ¿tardan lo mismo? Con 333 pingüinos no se nota la diferencia; con diez millones de filas, puede ser la diferencia entre un segundo y una hora. ¿Cómo se mide cuánto tarda un trozo de código, y cómo se averigua en qué se va el tiempo? Es el [**rendimiento**](23-rendimiento.md).

## Ejercicios

1. **Desmontar un árbol.** Con `e <- quote(a + b * c)`, ¿qué son `e[[1]]`, `e[[2]]` y `e[[3]]`? ¿De qué clase es cada uno? Dibuja el árbol a mano.

2. **Evaluar en una lista.** ¿Qué devuelve `eval(quote(a + b), list(a = 1, b = 2))`? ¿Y si en el programa hay una `a <- 100`?

3. **Cambiar la operación.** Con `e <- quote(3 + 4)`, cambia la suma por una multiplicación modificando `e[[1]]`. ¿Qué devuelve `eval(e)`?

4. **El código, no el valor.** Escribe `muestra_codigo <- function(arg) paste("Me has pasado:", deparse(substitute(arg)))`. ¿Qué devuelve `muestra_codigo(1 + 1)`? ¿Por qué no dice 2?

5. **Tu propio filtro.** Con el `mi_filtro()` del apartado 3, ¿cuántas filas devuelve `mi_filtro(pinguinos, isla == "Torgersen")`? ¿Qué pasaría si en `eval()` se quitara el tercer argumento, `parent.frame()`, y se usara `umbral`?

6. **De texto a código.** ¿Qué es `parse(text = "2 * 3")[[1]]`? ¿Qué da `eval()` sobre eso? ¿Por qué hay que tener cuidado con `parse()` cuando el texto lo escribe otra persona?

:::{div}
:class: afondo
7. **Derivar.** ¿Qué devuelve `D(quote(x^3), "x")`? ¿Cuánto vale esa derivada en $x = 2$?

8. **Código con un hueco.** Con `n <- 5`, ¿qué devuelve `bquote(.(n) + y)`? ¿Y `quote(n + y)`? ¿Qué diferencia hay?
:::

## Solucionario

1. `e[[1]]` es el símbolo `` `+` ``, de clase `name`; `e[[2]]` es el símbolo `a`, también `name`; y `e[[3]]` es la llamada `b * c`, de clase `call`. El árbol tiene `+` arriba, con `a` a la izquierda, y a la derecha otra llamada, `*`, con `b` y `c` colgando. La multiplicación queda más abajo porque se hace antes.
2. Devuelve 3: `eval()` encuentra `a` y `b` en la lista. Aunque en el programa haya `a <- 100`, la lista se mira primero, y sigue dando 3.
3. `e[[1]] <- as.name("*")` convierte `e` en `3 * 4`, y `eval(e)` da 12.
4. Devuelve `"Me has pasado: 1 + 1"`. `substitute(arg)` no evalúa la promesa: devuelve su código, la llamada `1 + 1`, y `deparse()` la convierte en texto.
5. 47: todas las adelias de Torgersen, la única especie de esa isla. Sin el tercer argumento, `eval()` usa como entorno padre el marco de la propia `mi_filtro()`; desde ahí, R sube al programa principal, donde se definió la función, y en este programa también encontraría `umbral`. La diferencia aparece si a `mi_filtro()` se la llama desde dentro de otra función que tenga su propio `umbral`: sin `parent.frame()`, ese `umbral` no se vería; con él, sí, porque R busca donde se escribió la condición.
6. Es una llamada, `2 * 3`, de clase `call`, y `eval()` da 6. Con `parse()`, cualquier texto se convierte en código que se puede ejecutar: si lo escribe otra persona, podría contener órdenes para borrar archivos o leer datos privados.

:::{div}
:class: afondo
7. `3 * x^2`, la derivada de $x^3$. En $x = 2$ vale $3 \cdot 4 = 12$: `eval(D(quote(x^3), "x"), list(x = 2))` lo confirma.
8. `bquote(.(n) + y)` da `5 + y`: lo que va dentro de `.()` se evalúa y su valor se mete en el código. `quote(n + y)` da `n + y`, con el símbolo `n` sin evaluar, que tomará el valor que tenga `n` cuando se evalúe.
:::
