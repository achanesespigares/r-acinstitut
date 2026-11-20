---
title: "Distribuciones: la forma de los datos"
subtitle: Curvas con nombre que responden sin contar
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Mide la altura de los alumnos de una clase y dibuja el histograma. La mayoría está cerca de la media; hay pocos muy altos y pocos muy bajos. Mide a mil alumnos y el histograma se suaviza hasta parecer una campana. Tira diez monedas muchas veces y apunta cuántas caras salen: lo más frecuente es cinco, y diez caras casi nunca salen. Son regularidades que aparecen en sitios muy distintos, una y otra vez, y por eso tienen nombre.

## La pregunta

La grieta del capítulo anterior terminaba con una campana: la masa de las adelias, alrededor de 3700 g y casi simétrica. ¿Qué proporción de adelias pesa más de 4500 g? Se puede contar, claro. Pero ¿se puede calcular sin contar, a partir de la forma? Y si se puede, también se podrán calcular probabilidades de cosas que todavía no han pasado. Por ejemplo: ¿qué probabilidad hay de aprobar un test respondiendo al azar?

## La idea

Una **distribución de probabilidad** es un modelo de cómo se reparten los valores de una variable. Hay dos clases:

- las **continuas**, como la **normal**, se describen con una curva de densidad, y la probabilidad de un intervalo es el **área** bajo la curva en ese intervalo;
- las **discretas**, como la **binomial**, dan una probabilidad a cada valor posible: 0 aciertos, 1 acierto, 2 aciertos…

La normal queda fijada por dos números: su **media**, que dice dónde está el centro de la campana, y su **desviación típica**, que dice lo ancha que es. La binomial cuenta los éxitos en un número fijo de intentos independientes, y queda fijada por el número de intentos y la probabilidad de éxito en cada uno.

En R, cada distribución tiene **cuatro funciones**, con el mismo esquema de nombres: una letra delante del nombre de la distribución.

:::{important} Las cuatro letras: `d`, `p`, `q`, `r`
| Letra | Qué devuelve | Normal | Binomial |
|---|---|---|---|
| `d` | la densidad: la altura de la curva (o la probabilidad de un valor, si es discreta) | `dnorm()` | `dbinom()` |
| `p` | la probabilidad acumulada: el área a la izquierda, P(X ≤ x) | `pnorm()` | `pbinom()` |
| `q` | el cuantil: el valor que deja a su izquierda una probabilidad dada (la inversa de `p`) | `qnorm()` | `qbinom()` |
| `r` | números al azar que siguen la distribución | `rnorm()` | `rbinom()` |

El esquema vale para todas: la uniforme (`unif`), la de Poisson (`pois`), la exponencial (`exp`), la t de Student (`t`)… Aprendes cuatro letras, y te sirven para todas.
:::

## Construcción

### 1 · ¿Cuántas adelias pesan más de 4500 g?

Este es el programa estrella del capítulo. Calcula la media y la desviación típica de la masa de las adelias, y con ellas pide a la normal la proporción que pasa de 4500 g. Después cuenta las adelias de verdad, para comparar.

:::{tip} Predice
La normal es un modelo, no los datos. ¿Crees que la proporción que calcula coincidirá con la que se cuenta? ¿Será mayor o menor?
:::

```{code-cell} r
library(dplyr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
adelias <- pinguinos |> filter(especie == "Adelia")
m <- mean(adelias$masa_corporal_g)
s <- sd(adelias$masa_corporal_g)
pnorm(4500, mean = m, sd = s, lower.tail = FALSE)
mean(adelias$masa_corporal_g > 4500)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La normal frente a la cuenta","etiqueta":"pnorm","idea":"Con solo dos números, la media m y la desviación típica s, la normal calcula la proporción de adelias por encima de 4500 g. La última línea las cuenta de verdad. Compara las dos respuestas en la consola."},"archivo":"datos/trazas/16-distribuciones-1.json"}
```

Las 146 adelias tienen una masa media `m` de 3706.2 g y una desviación típica `s` de 458.6 g. Con esos dos números, `pnorm()` da el área de la campana:

- `pnorm(4500, mean = m, sd = s)` sería el área **a la izquierda** de 4500, la proporción de adelias que pesan 4500 g o menos;
- `lower.tail = FALSE` pide el área **a la derecha**, la de las que pesan más: **0.0417**, un 4.2 %.

Contándolas, `mean(adelias$masa_corporal_g > 4500)` da **0.0479**: son 7 de 146. La normal se queda un poco corta, pero no mucho: el 4.2 % de 146 son unas 6 adelias, y hay 7. Un modelo de dos números acierta casi exactamente. Y lo mismo serviría para cualquier otro peso, sin volver a contar.

:::{note} La tabla de la normal, sin tabla
En Bachillerato, este cálculo se hace tipificando y buscando en la tabla: $z = (4500 - 3706.2)/458.6 = 1.73$, la tabla da $P(Z \le 1.73) = 0.9582$, y la respuesta es $1 - 0.9582 = 0.0418$. `pnorm()` hace lo mismo sin tabla y sin redondear $z$ a dos decimales. Por eso da 0.0417.
:::

### 2 · La curva sobre el histograma

¿Se parece la campana de la normal al histograma de verdad? Se puede comprobar dibujando la curva encima.

```{code-cell} r
library(dplyr)
library(tidyr)
library(ggplot2)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
adelias <- pinguinos |> filter(especie == "Adelia")
m <- mean(adelias$masa_corporal_g)
s <- sd(adelias$masa_corporal_g)
ggplot(adelias, aes(x = masa_corporal_g)) +
  geom_histogram(aes(y = after_stat(density)), binwidth = 250) +
  stat_function(fun = dnorm, args = list(mean = m, sd = s), color = "#7A1F36", linewidth = 1)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La campana sobre el histograma","etiqueta":"dnorm · stat_function","idea":"El histograma, en escala de densidad, y encima la curva de la normal con la media y la desviación típica de las adelias. Si el modelo es bueno, la curva sigue el perfil de las barras."},"archivo":"datos/trazas/16-distribuciones-2.json"}
```

Dos detalles hacen que histograma y curva se puedan comparar:

- `aes(y = after_stat(density))` cambia la altura de las barras: en lugar de contar pingüinos, cada barra mide su **densidad**, de modo que el área de todas juntas vale 1, igual que el área bajo la curva;
- `stat_function(fun = dnorm, args = list(mean = m, sd = s))` dibuja la función `dnorm()` con la media y la desviación típica de las adelias. `dnorm()` es la `d` de la normal: la altura de la campana en cada punto.

La curva sigue bien el perfil de las barras: centrada en 3700 g, simétrica, y con colas que se apagan hacia 2800 y 4800 g. Hay un detalle más: la última barra, la de la derecha, queda por encima de la curva. Ahí hay algunas adelias más de las que espera la normal, y por eso, en el apartado anterior, el modelo se quedaba un poco corto.

### 3 · Las cuatro funciones

Las cuatro letras se ven mejor con la **normal estándar**, la de media 0 y desviación típica 1, que es la que usa R si no se le dan `mean` ni `sd`.

```{code-cell} r
dnorm(0)
pnorm(1.96)
qnorm(0.975)
pnorm(c(1, 2, 3)) - pnorm(c(-1, -2, -3))
set.seed(2026)
rnorm(3)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"d, p, q y r","etiqueta":"normal estándar","idea":"Cada línea usa una letra. Fíjate en que pnorm() y qnorm() son inversas: una va de 1.96 a 0.975, y la otra vuelve. Y en que rnorm() da los mismos números cada vez que se repite set.seed(2026)."},"archivo":"datos/trazas/16-distribuciones-3.json"}
```

- `dnorm(0)` es la **altura** de la campana en el centro: 0.399. No es una probabilidad: en una distribución continua, la probabilidad de un valor exacto es 0, y lo que tiene probabilidad son los intervalos.
- `pnorm(1.96)` es el **área a la izquierda** de 1.96: 0.975.
- `qnorm(0.975)` hace el camino inverso: el valor que deja a su izquierda un 97.5 % del área, **1.96**. `p` va de un valor a una probabilidad; `q`, de una probabilidad a un valor.
- La resta de áreas da la probabilidad de un intervalo, y con vectores salen tres de golpe (capítulo 2): entre −1 y 1 queda un **68.3 %** del área; entre −2 y 2, un **95.4 %**; entre −3 y 3, un **99.7 %**. Es la regla del 68-95-99.7: en cualquier normal, casi todo cae a menos de tres desviaciones típicas de la media.
- `rnorm(3)` da tres números **al azar** con distribución normal: 0.521, −1.080 y 0.139. `set.seed(2026)` fija la **semilla** del generador: con la misma semilla salen siempre los mismos números, y cualquiera puede repetir tu resultado.

### 4 · La binomial: aprobar un test al azar

Un test tiene 10 preguntas con 4 opciones cada una, y una sola correcta. Si respondes todas al azar, cada pregunta es un intento con probabilidad 0.25 de acertar, y el número de aciertos sigue una **binomial** de 10 intentos y probabilidad 0.25. ¿Qué probabilidad hay de acertar 5 o más?

```{code-cell} r
library(ggplot2)
aciertos <- data.frame(k = 0:10, p = dbinom(0:10, size = 10, prob = 0.25))
sum(aciertos$p)
pbinom(4, size = 10, prob = 0.25, lower.tail = FALSE)
ggplot(aciertos, aes(x = k, y = p)) +
  geom_col() +
  scale_x_continuous(breaks = 0:10)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Aciertos al azar","etiqueta":"dbinom · pbinom","idea":"La tabla aciertos tiene la probabilidad de cada número de aciertos, de 0 a 10. Las probabilidades suman 1, y la barra más alta está en 2: lo más probable, contestando al azar, es acertar 2."},"archivo":"datos/trazas/16-distribuciones-4.json"}
```

- `dbinom(0:10, size = 10, prob = 0.25)` da la probabilidad de **cada** número de aciertos, de 0 a 10. En una distribución discreta, la `d` sí es una probabilidad. Lo más probable es acertar **2** (0.282), y acertar 8 o más es tan improbable que la barra ni se ve.
- `sum(aciertos$p)` vale **1**: entre 0 y 10 aciertos tiene que salir alguno.
- `pbinom(4, ..., lower.tail = FALSE)` da la probabilidad de **más de 4** aciertos, es decir, de 5 o más: **0.0781**. Aprobar contestando al azar pasa menos de 8 veces de cada 100.
- En el gráfico, `scale_x_continuous(breaks = 0:10)` pone una marca en cada número entero de aciertos. Sin ella, ggplot2 marcaría 2.5, 5 y 7.5, que no tienen sentido para contar aciertos.

:::{warning} En las discretas, ojo con el «o más»
`pbinom(4, ...)` es P(X ≤ 4), y con `lower.tail = FALSE` es P(X > 4), que en números enteros es lo mismo que P(X ≥ 5). Para «5 o más» se escribe un **4**, no un 5. Con `pbinom(5, ..., lower.tail = FALSE)` saldría P(X ≥ 6). En las continuas no pasa: P(X > 4500) y P(X ≥ 4500) son iguales, porque un valor exacto tiene probabilidad 0.
:::

::::{div}
:class: afondo
### 5 · ¿Es normal de verdad?

La curva encaja con el histograma, pero un histograma depende de la anchura de los intervalos. Una prueba más fina es el **gráfico de cuantiles**, o gráfico Q-Q: coloca cada dato frente al valor que le tocaría si la distribución fuera exactamente normal. Si lo es, los puntos caen sobre una recta.

```{code-cell} r
library(dplyr)
library(tidyr)
library(ggplot2)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
adelias <- pinguinos |> filter(especie == "Adelia")
ggplot(adelias, aes(sample = masa_corporal_g)) +
  geom_qq() +
  geom_qq_line()
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"El gráfico Q-Q","etiqueta":"a fondo · geom_qq","idea":"Cada punto es una adelia: en horizontal, dónde caería si la masa fuera normal; en vertical, su masa real. Cuanto más pegados a la recta, más normal es la distribución."},"archivo":"datos/trazas/16-distribuciones-5.json"}
```

La estética aquí es `sample`, no `x`: el gráfico ordena los datos y los coloca frente a los cuantiles de la normal estándar. En el centro, los puntos siguen la recta. A la izquierda quedan por encima: las adelias más ligeras pesan más de lo que diría la normal, así que esa cola es más corta que la de la campana. Los escalones se deben a que las masas están redondeadas a 25 g. La prueba de Shapiro-Wilk, `shapiro.test(adelias$masa_corporal_g)`, da un valor p de 0.042: con 146 datos, detecta que la masa **no es exactamente** normal. Y aun así, el apartado 1 enseñó que el modelo acierta casi a la unidad. Ningún dato real es exactamente normal; la pregunta útil es si la normal es una aproximación suficiente para lo que quieres calcular.

**Densidad no es probabilidad.** `dnorm(0, sd = 0.1)` vale 3.99, más que 1. No es un error: una campana muy estrecha tiene que ser muy alta para que su área siga valiendo 1. Las alturas pueden pasar de 1; las áreas, nunca.

**La binomial, aproximada por la normal.** Con muchos intentos, la binomial se parece a una normal con la misma media, $np$, y la misma desviación típica, $\sqrt{npq}$. La regla habitual es usarla cuando $np > 5$ y $nq > 5$, y con la **corrección de continuidad**: como la binomial salta de entero en entero, «30 o más» se convierte en «más de 29.5». Con un test de 100 preguntas de 4 opciones, $np = 25$ y $nq = 75$:

```r
pbinom(29, size = 100, prob = 0.25, lower.tail = FALSE)                 # exacta: 0.1495
pnorm(29.5, mean = 25, sd = sqrt(100 * 0.25 * 0.75), lower.tail = FALSE)  # con corrección: 0.1493
pnorm(30, mean = 25, sd = sqrt(100 * 0.25 * 0.75), lower.tail = FALSE)    # sin corrección: 0.1241
```

Con la corrección, la aproximación acierta a la tercera cifra; sin ella, se equivoca en 2.5 puntos. Con R, la aproximación ya no hace falta para calcular, porque `pbinom()` da la exacta, pero explica por qué tantas cosas acaban siendo normales.

**Otras distribuciones con nombre.** La de **Poisson** cuenta sucesos raros en un intervalo, como los correos que llegan en una hora; la **exponencial** mide el tiempo de espera entre ellos; la **t de Student** es una normal con las colas más gruesas, y aparecerá en el capítulo de modelos. Todas con sus cuatro letras: `dpois()`, `pexp()`, `qt()`…
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La proporción de adelias por encima de 4500 g según la normal. En R, en Python con SciPy y en Julia con Distributions:

```r
pnorm(4500, mean = 3706.2, sd = 458.6, lower.tail = FALSE)
```

```python
from scipy.stats import norm
norm.sf(4500, loc=3706.2, scale=458.6)
```

```julia
using Distributions
ccdf(Normal(3706.2, 458.6), 4500)
```

Las tres dan 0.0417. En Python y en Julia, la distribución es un objeto con sus métodos: `cdf` es la `p` de R, `pdf` la `d`, `ppf` o `quantile` la `q`. Y el área de la derecha tiene nombre propio: `sf` (*survival function*) en SciPy y `ccdf` (la acumulada complementaria) en Julia.
:::

## Conexiones

- Las funciones `r` son el motor de la **simulación**, en el capítulo siguiente: con `rnorm()`, `rbinom()` o `sample()` se repite un experimento miles de veces en un segundo.
- En el capítulo de **modelos**, los errores de una recta se suponen normales, y la t de Student dirá si una pendiente es de verdad distinta de cero.
- Los problemas de normal y binomial de **Bachillerato y de la PAU** se resuelven con `pnorm()`, `qnorm()` y `pbinom()`, sin tablas. Sirven para comprobar las soluciones hechas a mano.
- `ggplot2` dibuja cualquier curva con `stat_function()`, y `after_stat(density)` pone el histograma en la misma escala.

## La grieta

Para la normal y la binomial hay una fórmula y una función de R que la calcula. Pero muchas preguntas no encajan en ninguna distribución con nombre. Si un test resta puntos por cada fallo, ¿qué nota se saca de media contestando al azar, y qué probabilidad hay de aprobar? En una clase de 30, ¿qué probabilidad hay de que dos alumnos cumplan años el mismo día? Hay una manera de responder sin fórmula: repetir el experimento miles de veces con números al azar y contar cuántas veces pasa. Es la [**simulación**](17-simulacion.md).

## Ejercicios

1. **Los machos.** Repite el apartado 1 solo con las adelias macho. ¿Qué proporción pasa de 4500 g según la normal? ¿Y contándolos?

2. **El 10 % más pesado.** ¿A partir de qué masa está el 10 % de adelias más pesadas, según la normal? Usa `qnorm()`. Compáralo con `quantile(adelias$masa_corporal_g, 0.9)`.

3. **La regla del 68-95-99.7.** ¿Qué proporción de adelias está a menos de una desviación típica de la media? ¿Y a menos de dos y de tres? Pista: `mean(abs(adelias$masa_corporal_g - m) <= s)`.

4. **Un test más largo.** Un test tiene 20 preguntas de 4 opciones. ¿Qué probabilidad hay de acertar 10 o más contestando al azar?

5. **Suman 1.** ¿Por qué `sum(dbinom(0:10, size = 10, prob = 0.25))` vale exactamente 1? ¿Valdría 1 la suma de `dnorm()` en muchos puntos?

6. **Pocos o muchos.** Con `set.seed(1)`, calcula la media de `rnorm(5, mean = m, sd = s)`. Repite con `set.seed(1)` y 10 000 números. ¿Cuál se acerca más a `m`, y por qué?

:::{div}
:class: afondo
7. **Más de 1.** `dnorm(0, sd = 0.1)` vale 3.99. ¿Cómo puede una densidad pasar de 1, si las probabilidades no pueden?

8. **Corrección de continuidad.** En el test de 100 preguntas del apartado 5, ¿por qué se usa 29.5 en la aproximación normal de «30 o más», y no 30?
:::

## Solucionario

1. Los 73 machos tienen una media de 4043.5 g y una desviación típica de 346.8 g. `pnorm(4500, mean = 4043.5, sd = 346.8, lower.tail = FALSE)` da 0.094, y contándolos sale 0.096: 7 de 73. Entre los machos, pasar de 4500 g es el doble de frecuente que entre todas las adelias, porque las 7 adelias de más de 4500 g son machos.
2. `qnorm(0.9, mean = m, sd = s)` da 4293.9 g. El cuantil real, `quantile(adelias$masa_corporal_g, 0.9)`, es 4325 g: el modelo se desvía unos 30 g.
3. Un 65.8 % a menos de una desviación típica, un 96.6 % a menos de dos y el 100 % a menos de tres. La regla dice 68.3 %, 95.4 % y 99.7 %: las adelias la cumplen bastante bien.
4. `pbinom(9, size = 20, prob = 0.25, lower.tail = FALSE)` da 0.0139, algo más de una vez de cada 100. Con más preguntas, aprobar al azar es mucho más difícil que con 10 (0.0781).
5. Porque 0, 1, …, 10 son todos los resultados posibles, y alguno tiene que salir. La suma de `dnorm()` no: las densidades son alturas, y lo que vale 1 es el área bajo la curva, no la suma de alturas.
6. Con 5 números, la media sale 3765.5 g, a 59 g de `m`; con 10 000, sale 3703.2 g, a solo 3 g. Con más datos, los valores grandes y pequeños se compensan mejor, y la media se acerca a la de la distribución. Es la ley de los grandes números, que el próximo capítulo usará a fondo.

:::{div}
:class: afondo
7. Porque la densidad no es una probabilidad: es una altura. Lo que debe valer como máximo 1 es el área bajo la curva. Una normal con desviación típica 0.1 es muy estrecha, y para que su área valga 1 tiene que ser muy alta.
8. Porque la binomial solo toma valores enteros, y la normal es continua. El valor 30 de la binomial se reparte en la normal por el intervalo de 29.5 a 30.5; para incluir el 30 entero, «30 o más» empieza en 29.5. Con 30 se perdería la mitad de esa barra, y por eso sin corrección sale 0.1241 en lugar de 0.1495.
:::
