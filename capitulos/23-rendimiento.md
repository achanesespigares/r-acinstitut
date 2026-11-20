---
title: "Rendimiento: medir antes de acelerar"
subtitle: Dónde se va el tiempo, y cómo dejar de perderlo
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Para ordenar una biblioteca de mil libros hay métodos y métodos. Uno coloca cada libro nuevo en su sitio y, para hacerle hueco, corre todos los que van detrás: con los primeros libros va bien, pero al final cada libro obliga a mover cientos. Otro empieza por decidir cuántos estantes hacen falta y deja el espacio preparado, así que cada libro va directo a su hueco. Los dos acaban con la biblioteca ordenada, pero uno tarda una tarde y el otro, una semana. Y antes de buscar un método mejor conviene cronometrar: a lo mejor el tiempo no se va donde parece.

## La pregunta

A estas alturas sabemos hacer el mismo cálculo de muchas maneras: con un bucle, con `map()`, con una operación con vectores, con `Reduce()`, con funciones que se llaman a sí mismas. Todas dan el mismo resultado. Con 333 pingüinos la diferencia no se nota; con diez millones de filas, puede ser la diferencia entre un segundo y una hora. ¿Cómo se mide cuánto tarda un trozo de código? ¿Dónde se va el tiempo? ¿Y qué se puede hacer para que vaya más rápido?

## La idea

La regla de oro es **medir antes de acelerar**: la intuición falla mucho sobre qué parte de un programa es la lenta. Las herramientas son tres:

- `system.time(expr)` mide cuánto tarda una expresión;
- `bench::mark()` compara varias versiones del mismo cálculo: las repite muchas veces, comprueba que dan lo mismo y dice cuánto tarda cada una y cuánta memoria pide;
- un **perfilador**, `Rprof()` o el paquete profvis, dice en qué funciones se va el tiempo de un programa largo.

Y los motivos más frecuentes por los que un programa de R es lento también son pocos:

- **pedir memoria una y otra vez**: hacer crecer un vector elemento a elemento obliga a copiarlo entero en cada paso;
- **bucles donde podría haber vectores**: cada vuelta de un bucle la interpreta R paso a paso; una operación con vectores la hace de golpe el código compilado que hay debajo de R;
- **repetir trabajo**: calcular muchas veces lo mismo. Ahí lo que hay que cambiar es el algoritmo, no el código.

:::{important} Los tiempos de este capítulo
Los tiempos cambian de un ordenador a otro, y de un día a otro en el mismo ordenador. Los de este capítulo se midieron con `bench::mark()` en el ordenador donde se escribió el libro. Lo que importa no son los milisegundos, sino las **proporciones**: si una versión es diez veces más rápida que otra, lo seguirá siendo en tu ordenador, más o menos. Por eso los visualizadores enseñan cómo trabaja cada versión, con pocos datos, y los tiempos van aparte.
:::

## Construcción

### 1 · Hacer crecer un vector, o reservarlo

Este es el programa estrella del capítulo. Dos bucles calculan los mismos cuadrados. El primero va alargando el vector con `c()`; el segundo lo crea primero, lleno de ceros, y después rellena cada casilla.

:::{tip} Predice
Con 5 elementos, los dos bucles tardan lo mismo, nada. Con 100 000, ¿cuántas veces más lento crees que es el primero: el doble, diez veces, mil veces?
:::

```{code-cell} r
n <- 5
crece <- c()
for (i in 1:n) {
  crece <- c(crece, i^2)
}
reserva <- numeric(n)
for (i in 1:n) {
  reserva[i] <- i^2
}
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Crecer o reservar","etiqueta":"memoria","idea":"En el primer bucle, crece se vuelve a crear en cada vuelta, un elemento más largo: R copia los anteriores y añade uno. En el segundo, reserva ya tiene sus cinco casillas desde el principio, y cada vuelta solo cambia una."},"archivo":"datos/trazas/23-rendimiento-1.json"}
```

- En el primer bucle, `crece <- c(crece, i^2)` no añade un elemento al vector que había: **crea uno nuevo**, un elemento más largo, copia en él los anteriores y pone el nuevo al final. El visualizador lo cuenta en cada vuelta: «`crece` se crea de nuevo, un elemento más largo: R copia los 2 elementos anteriores en un vector nuevo y añade 9 al final».
- En el segundo, `numeric(n)` crea de una vez un vector con cinco ceros. Cada vuelta cambia **una casilla**, sin copiar nada: «Cambia `reserva[2]`: valía 0 y ahora vale 4».

Con cinco elementos no hay diferencia. Pero la versión que crece copia 1 elemento en la primera vuelta, 2 en la segunda, 3 en la tercera… Con $n$ elementos copia en total unos $n^2/2$: con 100 000, unos cinco mil millones de copias. Medido con `bench::mark()`:

| Versión | Tiempo, con n = 100 000 | Memoria pedida |
|---|---|---|
| hacer crecer el vector con `c()` | 7 s | 37 GB |
| reservar con `numeric(n)` y rellenar | 3.4 ms | 0.8 MB |
| `(1:n)^2`, con vectores | 0.25 ms | 1.1 MB |

Hacer crecer el vector es unas **2000 veces** más lento que reservarlo, y pide en total 37 GB de memoria para un resultado que ocupa menos de 1 MB. Y la versión con vectores, sin bucle, es otras 14 veces más rápida.

### 2 · Bucles y vectores

¿Por qué es más rápido `sum(x)` que un bucle que vaya sumando? Los dos hacen las mismas sumas, pero de manera distinta.

```{code-cell} r
x <- c(4, 8, 15, 16, 23, 42)
total <- 0
for (v in x) {
  total <- total + v
}
total
sum(x)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Seis vueltas o una línea","etiqueta":"vectorizar","idea":"El bucle da seis vueltas, y en cada una R tiene que leer la línea, buscar total y v, comprobar sus tipos y hacer una suma. sum(x) hace las seis sumas de golpe, dentro de una función escrita en C."},"archivo":"datos/trazas/23-rendimiento-2.json"}
```

- El bucle da **una vuelta por elemento**. En cada vuelta, R lee la instrucción, busca `total` y `v`, comprueba de qué tipo son, suma y guarda el resultado. Todo ese trabajo de interpretar se repite seis veces, o un millón.
- `sum(x)` es **una sola llamada**. Las sumas las hace una función escrita en C, el lenguaje en el que está hecho R por dentro, que recorre el vector sin preguntar nada en cada paso.

Con un millón de números, el bucle tarda unos 14 ms y `sum()`, 1 ms: unas **14 veces** menos. Por eso en R se prefiere **vectorizar**: escribir las operaciones sobre vectores enteros (capítulo 2), con `sum()`, `mean()`, `cumsum()`, `ifelse()` y compañía. Los bucles no son malos, y muchas veces son la manera más clara de escribir algo; pero si un bucle hace con cada elemento algo que ya existe para vectores, merece la pena cambiarlo.

¿Y `map()`? `map()` y `vapply()` también llaman a una función de R por cada elemento, así que tardan como un bucle, más o menos: con 100 000 elementos, `map_dbl(1:1e5, \(i) i^2)` tarda unos 45 ms, y `(1:1e5)^2`, 0.2 ms. `map()` hace el código más claro (capítulo 20), no más rápido.

### 3 · Repetir trabajo

Hay programas lentos que no se arreglan reservando memoria ni vectorizando, porque el problema es el **algoritmo**. El ejemplo clásico es la sucesión de Fibonacci, en la que cada número es la suma de los dos anteriores: 1, 1, 2, 3, 5, 8, 13… Escrita tal cual se define, con una función que se llama a sí misma (capítulo 5):

```{code-cell} r
fib <- function(n) {
  if (n <= 2) return(1)
  fib(n - 1) + fib(n - 2)
}
fib(5)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"El mismo cálculo, una y otra vez","etiqueta":"recursión","idea":"Cuenta los marcos: fib(5) llama a fib(4) y a fib(3); fib(4) vuelve a llamar a fib(3)… Para calcular fib(5) hacen falta 9 llamadas, y fib(3) se calcula dos veces desde cero."},"archivo":"datos/trazas/23-rendimiento-3.json"}
```

`fib(5)` necesita `fib(4)` y `fib(3)`. Pero `fib(4)` necesita a su vez `fib(3)` y `fib(2)`: `fib(3)` se calcula **dos veces**, cada una desde cero. El visualizador enseña los marcos apilándose y deshaciéndose: hacen falta **9 llamadas** para llegar a 5.

Cada número cuesta más o menos lo que los dos anteriores juntos, así que el número de llamadas crece como la propia sucesión. Para `fib(30)` hacen falta **1 664 079** llamadas, y cada `fib(n)` tarda unas 1.6 veces más que el anterior. Ningún truco de código arregla eso; hay que dejar de repetir trabajo.

### 4 · Recordar lo ya calculado

La solución es **memorizar** cada resultado la primera vez que se calcula, y consultarlo después. Se llama *memoización*, y en R se escribe con un vector fuera de la función y la flecha doble del capítulo 19:

```{code-cell} r
memo <- c(1, 1)
fib_memo <- function(n) {
  if (n <= length(memo) && !is.na(memo[n])) return(memo[n])
  r <- fib_memo(n - 1) + fib_memo(n - 2)
  memo[n] <<- r
  r
}
fib_memo(5)
memo
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Calcular cada número una vez","etiqueta":"memoización","idea":"memo guarda los números ya calculados. Cada vez que fib_memo() calcula uno nuevo, lo apunta con <<-. Cuando lo vuelve a necesitar, lo lee de memo y no llama a nadie: fib(5) solo necesita 7 llamadas."},"archivo":"datos/trazas/23-rendimiento-4.json"}
```

- `memo` empieza con los dos primeros números, 1 y 1.
- `fib_memo(n)` mira primero si `memo[n]` ya existe; si existe, lo devuelve sin calcular nada.
- Si no, lo calcula con las dos llamadas de siempre, lo **apunta** en `memo` con `memo[n] <<- r` y lo devuelve.

Para `fib(5)` hacen falta 7 llamadas en lugar de 9, y al final `memo` guarda `1 1 2 3 5`. La diferencia de verdad aparece con números grandes: para `fib(30)`, **57** llamadas en lugar de 1 664 079. En el ordenador del libro, `fib(25)` tarda unos 40 ms sin memoria y unos 0.06 ms con ella: unas **700 veces** menos. Ninguna optimización de código da tanto como cambiar un algoritmo que repite trabajo por uno que no.

El paquete memoise lo hace por ti: `fib_rapida <- memoise::memoise(fib)` devuelve una versión de cualquier función que recuerda sus resultados (una clausura, capítulo 19).

::::{div}
:class: afondo
### 5 · Memoria, perfiles y otros lenguajes

**Cuánto ocupa cada cosa.** `object.size()` dice la memoria que ocupa un objeto. No todos los tipos ocupan lo mismo:

```{code-cell} r
enteros <- 1:1000
reales <- as.numeric(enteros)
textos <- as.character(enteros)
object.size(enteros)
object.size(reales)
object.size(textos)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Mil números, tres tamaños","etiqueta":"a fondo · object.size","idea":"Los mismos mil números ocupan unos 4 KB como enteros, 8 KB como reales (cada uno usa 8 bytes) y 64 KB como textos, porque cada texto distinto se guarda aparte."},"archivo":"datos/trazas/23-rendimiento-5.json"}
```

Mil enteros ocupan 4048 bytes: 4 bytes cada uno, más una cabecera. Como reales, 8048: 8 bytes cada uno. Como textos, 64 048, porque cada texto distinto se guarda aparte, en una tabla de cadenas, y el vector solo guarda dónde está cada uno. Con mil textos iguales, `rep("a", 1000)`, son solo 8104 bytes: el texto se guarda una vez. Por eso una columna de categorías ocupa menos como factor (capítulo 6) que como texto, si se repite mucho.

**Copiar al modificar.** R copia un objeto cuando se modifica desde otro nombre (capítulo 19). `tracemem(x)` avisa cada vez que se copia `x`: después de `y <- x`, la primera vez que se cambia `y[1]`, R hace la copia y `tracemem()` lo anuncia. Las copias son la causa escondida de muchos programas lentos con tablas grandes.

**El perfilador.** En un programa largo, `Rprof("perfil.out")` empieza a anotar, cada pocos milisegundos, qué función se está ejecutando; `Rprof(NULL)` para, y `summaryRprof("perfil.out")` resume en qué funciones se fue el tiempo. Más cómodo: `profvis::profvis({ ... })` lo dibuja como un gráfico interactivo, línea a línea.

**C++ con Rcpp.** Cuando un bucle no se puede vectorizar, se puede escribir en C++ y llamarlo desde R con el paquete Rcpp:

```r
Rcpp::cppFunction("double suma_cpp(NumericVector x) {
  double total = 0;
  for (int i = 0; i < x.size(); i++) total += x[i];
  return total;
}")
suma_cpp(runif(1e6))
```

La primera vez hay que compilarlo, unos segundos. Después, la suma en C++ de un millón de números tarda unos 2.5 ms, cinco veces menos que el bucle de R (12.5 ms). Y `sum()` sigue tardando menos de 1 ms: las funciones de R base ya están escritas en C y muy pulidas. Rcpp es para lo que R no trae hecho.

**En paralelo.** Si un cálculo se puede partir en trozos independientes, se pueden repartir entre los núcleos del procesador: `parallel::mclapply(1:4, f, mc.cores = 2)` es como `lapply()`, pero con dos procesos a la vez (en Windows, `parLapply()`). Con funciones puras (capítulo 20), el resultado es el mismo. Repartir tiene un coste, así que solo compensa con trozos que tarden bastante.

**R ya hace trampas, de las buenas.** `1:1e6` no guarda un millón de números: R se apunta solo el principio y el final, y genera cada número cuando hace falta. `lobstr::obj_size(1:1e6)` dice 680 bytes, aunque `object.size()` cuente los 4 MB que ocuparía. Se llama ALTREP, y es una de las razones por las que conviene medir en lugar de suponer.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Sumar un millón de números con un bucle o con la función de la biblioteca. En R, en Python y en Julia:

```r
total <- 0; for (v in x) total <- total + v      # lento: R interpreta cada vuelta
sum(x)                                            # rápido: C por dentro
```

```python
total = 0
for v in x: total += v                            # lento
np.sum(x)                                         # rápido: NumPy, en C
```

```julia
total = 0.0; for v in x; total += v; end          # rápido, dentro de una función
sum(x)                                            # igual de rápido
```

R y Python son lenguajes **interpretados**: un bucle se ejecuta paso a paso, y lo rápido es delegar en funciones escritas en C (las de R base, las de NumPy). Julia **compila** cada función a código máquina la primera vez que se usa: allí un bucle bien escrito, dentro de una función, es tan rápido como `sum()`. Es la razón de ser de Julia, y uno de los motivos por los que esta colección tendrá un libro dedicado a él.
:::

## Conexiones

- **Vectorizar** es la idea del capítulo 2, «en R todo es un vector», vista desde la velocidad.
- La memoización usa una variable fuera de la función y `<<-`, del capítulo 19, o una **clausura**, como hace memoise.
- Las funciones puras del capítulo 20 son las que se pueden **paralelizar** sin miedo.
- En la parte V, las **pruebas** comprueban que una versión rápida da lo mismo que la lenta, que es lo que hace `bench::mark()` antes de medir.

## La grieta

Con este capítulo se cierra la parte IV, R por dentro: entornos, funciones, objetos, código y velocidad. Pero hasta ahora los programas los hemos escrito para nosotros, y casi siempre han funcionado a la primera. En el mundo real, los programas los usa otra gente, reciben datos que no esperábamos y fallan. Una función que divide entre cero, una tabla sin la columna que se esperaba, un archivo que no existe. ¿Cómo se escribe un programa que, cuando algo va mal, avise con claridad en lugar de fallar en silencio, o de seguir adelante con un resultado equivocado? ¿Y cómo se comprueba que una función hace lo que debe, hoy y después de cambiarla? Son los [**errores y las pruebas**](24-errores-pruebas.md), el primer paso para trabajar como profesional.

## Ejercicios

1. **Medir tú mismo.** Copia las tres versiones del apartado 1 en funciones y compáralas con `bench::mark()` para `n <- 10000`. ¿Se mantienen las proporciones en tu ordenador?

2. **¿Cuántas copias?** Si un vector crece con `c()` hasta tener 1000 elementos, ¿cuántos elementos copia R en total, aproximadamente? ¿Y con 2000? ¿Qué pasa con el tiempo al duplicar el tamaño?

3. **Vectorizar.** Reescribe sin bucle: `r <- numeric(length(x)); for (i in seq_along(x)) r[i] <- if (x[i] > 0) x[i] else 0`. Pista: `ifelse()` o `pmax()`.

4. **Contar llamadas.** ¿Cuántas llamadas hacen falta para calcular `fib(6)` con la versión sin memoria? Usa que el número de llamadas para `fib(n)` es 1 más las de `fib(n - 1)` más las de `fib(n - 2)`, con 1 llamada para `fib(1)` y para `fib(2)`.

5. **La memoria se queda.** Después de ejecutar `fib_memo(5)`, ¿cuántas llamadas hace `fib_memo(6)`? ¿Por qué tan pocas?

6. **No adivines.** Un programa lee un archivo, limpia los datos con dplyr, ajusta veinte modelos y dibuja un gráfico, y tarda un minuto. Antes de cambiar nada, ¿qué harías para saber qué parte acelerar?

:::{div}
:class: afondo
7. **Textos y factores.** Crea `colores <- sample(c("rojo", "verde", "azul"), 1e5, replace = TRUE)` y compara `object.size(colores)` con `object.size(factor(colores))`. ¿Cuál ocupa menos, y por qué?

8. **¿Compensa C++?** Rcpp tardó unos segundos en compilar la suma, y después la hacía en 2.5 ms frente a los 12.5 ms del bucle de R. ¿Cuántas sumas de un millón de números hay que hacer para que compense? ¿Y si se usa `sum()`?
:::

## Solucionario

1. Las proporciones deberían parecerse: hacer crecer el vector, mucho más lento; reservar, rápido; con vectores, más rápido todavía. Con `n <- 10000`, la versión que crece es mucho menos dramática que con 100 000, porque el coste crece con el cuadrado de `n`: con diez veces menos elementos, unas cien veces menos copias.
2. Unos $1000^2/2 = 500\,000$ elementos copiados; con 2000, unos 2 millones. Al duplicar el tamaño, las copias, y con ellas el tiempo, se multiplican por cuatro: el coste es cuadrático.
3. `r <- ifelse(x > 0, x, 0)`, o más corto y rápido, `r <- pmax(x, 0)`.
4. 15 llamadas: `fib(3)` hace 3; `fib(4)`, $1 + 3 + 1 = 5$; `fib(5)`, $1 + 5 + 3 = 9$; y `fib(6)`, $1 + 9 + 5 = 15$.
5. 3 llamadas: `fib_memo(6)`, que necesita `fib_memo(5)` y `fib_memo(4)`, y las dos están ya en `memo`, así que cada una devuelve su valor sin llamar a nadie. Después, `memo` guarda también el 8.
6. Medir. Envolver el programa en `profvis::profvis({ ... })`, o medir cada parte con `system.time()`, y ver dónde se va el tiempo. Puede que los veinte modelos tarden 55 segundos y todo lo demás, 5; entonces, acelerar la lectura del archivo no serviría de casi nada.

:::{div}
:class: afondo
7. El factor ocupa menos, unos 400 KB frente a unos 800 KB: cada casilla del factor es un entero de 4 bytes, y los tres textos se guardan una sola vez, en los niveles. El vector de textos guarda en cada casilla una referencia de 8 bytes a su texto.
8. Cada suma ahorra unos 10 ms frente al bucle de R. Si compilar tarda unos 7 segundos, hacen falta unas 700 sumas para recuperar ese tiempo. Frente a `sum()` no compensa nunca: `sum()` ya es más rápida que la versión en C++ y no hay que compilar nada.
:::
