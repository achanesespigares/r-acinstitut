---
title: "Simulación: repetir para saber"
subtitle: Cuando no hay fórmula, se cuenta
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

¿Qué probabilidad hay de sacar al menos un seis tirando cuatro dados? Se puede calcular con una fórmula. Pero también se pueden tirar los cuatro dados mil veces, apuntar en cuántas sale algún seis y dividir entre mil. A mano lleva una tarde; un ordenador lo hace en una fracción de segundo, y puede repetirlo un millón de veces. La idea tiene un nombre de casino, el **método de Montecarlo**: el matemático Stanisław Ulam lo pensó en los años cuarenta, jugando a los solitarios.

## La pregunta

El capítulo anterior terminó con dos preguntas sin una distribución con nombre que las responda. En una clase de 30 alumnos, ¿qué probabilidad hay de que dos cumplan años el mismo día? Si un test resta puntos por cada fallo, ¿qué nota se saca de media contestando al azar, y qué probabilidad hay de aprobar? ¿Se puede responder sin una fórmula?

## La idea

**Simular** es repetir un experimento aleatorio muchas veces con el ordenador y contar cuántas veces pasa lo que te interesa. Por la ley de los grandes números, la proporción que sale se acerca a la probabilidad de verdad cuantas más veces se repite.

:::{important} La receta de la simulación
1. **Un experimento.** Escribe el experimento una vez, con números al azar: `sample()` para sortear entre unos valores, `rbinom()`, `rnorm()` o `runif()` para las distribuciones del capítulo anterior.
2. **Muchas veces.** Repítelo con `replicate(10000, experimento)`. Si el experimento es una sola función `r…()`, basta con pedirle 10 000 números de golpe.
3. **Contar.** Resume los resultados. La proporción de veces que pasa algo es la media de un vector lógico, `mean(resultados)`, porque `TRUE` cuenta como 1 y `FALSE` como 0 (capítulo 3).

Y antes de empezar, `set.seed()`, para que cualquiera pueda repetir exactamente tus números.
:::

Una simulación no da la respuesta exacta, sino una **estimación**, con un error que se puede medir. Ese error baja con la raíz cuadrada del número de repeticiones: para dividirlo entre 10, hacen falta 100 veces más repeticiones.

## Construcción

### 1 · El problema del cumpleaños

Este es el programa estrella del capítulo. Sortea los cumpleaños de una clase de 30, mira si se repite alguno, y después repite el experimento con 10 000 clases.

:::{tip} Predice
En una clase de 30 alumnos, ¿qué probabilidad crees que hay de que al menos dos cumplan años el mismo día? Apunta un número antes de seguir.
:::

```{code-cell} r
set.seed(2026)
clase <- sample(1:365, size = 30, replace = TRUE)
any(duplicated(clase))
coincide <- replicate(10000, any(duplicated(sample(1:365, size = 30, replace = TRUE))))
mean(coincide)
1 - prod((365:336) / 365)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"El problema del cumpleaños","etiqueta":"sample · replicate","idea":"clase es una clase inventada: 30 cumpleaños sorteados entre los 365 días del año. coincide guarda, para 10 000 clases, si en cada una se repite algún día. Su media es la proporción de clases con coincidencia."},"archivo":"datos/trazas/17-simulacion-1.json"}
```

Paso a paso:

- `sample(1:365, size = 30, replace = TRUE)` sortea 30 días del año: los cumpleaños de una clase inventada. `replace = TRUE` permite que salga un día más de una vez, que es justo lo que se busca. El modelo supone que todos los días son igual de probables y se olvida del 29 de febrero.
- `duplicated(clase)` marca con `TRUE` los días que ya habían salido antes, y `any()` dice si hay alguno. En esta clase, sí: dos alumnos cumplen años el día 12 del año, el 12 de enero.
- `replicate(10000, ...)` repite el experimento entero con 10 000 clases distintas y guarda en `coincide` un vector lógico con un `TRUE` o un `FALSE` por clase.
- `mean(coincide)` da la proporción de clases con algún cumpleaños repetido: **0.7116**.

Más del 70 %. Casi todo el mundo apuesta por bastante menos, porque piensa en su propio cumpleaños. Pero no hace falta que alguien coincida contigo: basta con que coincidan dos alumnos cualesquiera, y en una clase de 30 hay 435 parejas posibles.

La última línea es la fórmula exacta. La probabilidad de que los 30 cumpleaños sean todos distintos es $\frac{365}{365} \cdot \frac{364}{365} \cdots \frac{336}{365}$, y lo que se busca es lo contrario: **0.7063**. La simulación se desvía en cinco milésimas. No ha hecho falta saber la fórmula para acercarse tanto.

### 2 · Un test que resta

Un test tiene 10 preguntas de 4 opciones. Cada acierto suma 1 punto y cada fallo resta 0.25. Si un alumno contesta todo al azar, ¿qué nota saca de media, y qué probabilidad tiene de llegar a 5?

```{code-cell} r
set.seed(2026)
aciertos <- rbinom(10000, size = 10, prob = 0.25)
notas <- aciertos - 0.25 * (10 - aciertos)
mean(notas)
mean(notas >= 5)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"10 000 alumnos al azar","etiqueta":"rbinom","idea":"Aquí no hace falta replicate(): rbinom() da de golpe los aciertos de 10 000 alumnos, y una sola operación con vectores calcula sus 10 000 notas."},"archivo":"datos/trazas/17-simulacion-2.json"}
```

Esta vez no hace falta `replicate()`. El número de aciertos de un alumno que contesta al azar es una binomial de 10 intentos y probabilidad 0.25 (capítulo 16), y `rbinom(10000, ...)` da de golpe los aciertos de **10 000 alumnos**. La nota es una operación con vectores (capítulo 2): los aciertos menos 0.25 por cada fallo, y los fallos son `10 - aciertos`.

- La nota media sale **0.62**. La penalización de 0.25 no basta para que adivinar salga gratis: contestando al azar, cada pregunta aporta de media $0.25 \cdot 1 - 0.75 \cdot 0.25 = 0.0625$ puntos, y las 10 preguntas, 0.625.
- La probabilidad de aprobar es **0.0196**: aprueban 196 de los 10 000 alumnos simulados. Para llegar a 5 hacen falta 6 aciertos, y el capítulo anterior lo calcula exacto: `pbinom(5, size = 10, prob = 0.25, lower.tail = FALSE)` da 0.0197.

La simulación coincide con la fórmula, y además tiene una ventaja: si las reglas del test cambian (una nota mínima, un máximo de preguntas contestadas, un descuento distinto por pregunta), basta con cambiar una línea. La fórmula habría que volver a pensarla.

### 3 · Un experimento con un bucle

Algunos experimentos no se pueden escribir en una sola línea. ¿Cuántas veces hay que tirar un dado hasta que sale un seis? Depende de la suerte, y el experimento es un bucle `while` (capítulo 4): tirar mientras no salga el seis.

```{code-cell} r
set.seed(8)
tiradas <- 0
dado <- 0
while (dado != 6) {
  dado <- sample(1:6, size = 1)
  tiradas <- tiradas + 1
}
tiradas
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Tirar hasta sacar un seis","etiqueta":"while","idea":"En cada vuelta se tira el dado con sample(1:6, size = 1) y se suma una tirada. El while vuelve a preguntar si dado es distinto de 6; la primera vez que sale el seis, se detiene.","columnas":["tiradas","dado"],"fila_en":"fin_iteracion"},"archivo":"datos/trazas/17-simulacion-3.json"}
```

Con esta semilla, el seis sale a la **quinta** tirada. Para saber cuántas tiradas hacen falta **de media**, el experimento se mete en una función (capítulo 5) y se repite:

```r
hasta_seis <- function() {
  tiradas <- 0
  dado <- 0
  while (dado != 6) {
    dado <- sample(1:6, size = 1)
    tiradas <- tiradas + 1
  }
  tiradas
}
set.seed(2026)
r <- replicate(10000, hasta_seis())
mean(r)        # 6.0688
max(r)         # 57
mean(r >= 20)  # 0.032
```

De media hacen falta unas **6** tiradas, lo que dice la intuición para un suceso que pasa una vez de cada 6. Pero la media esconde mucho: en una de las 10 000 rondas hicieron falta 57 tiradas, y en un 3.2 % de las rondas, 20 o más. La simulación da la distribución entera, no solo la media.

### 4 · ¿Cuántas repeticiones hacen falta?

Una simulación con pocas repeticiones engaña. Para verlo, se puede dibujar cómo cambia la estimación del cumpleaños a medida que se añaden clases.

```{code-cell} r
library(ggplot2)
set.seed(2026)
coincide <- replicate(10000, any(duplicated(sample(1:365, size = 30, replace = TRUE))))
camino <- data.frame(n = 1:10000, estimacion = cumsum(coincide) / (1:10000))
ggplot(camino, aes(x = n, y = estimacion)) +
  geom_line() +
  geom_hline(yintercept = 0.7063, color = "#7A1F36") +
  scale_x_log10()
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La estimación se estabiliza","etiqueta":"cumsum · geom_line","idea":"Cada punto de la línea es la proporción de clases con coincidencia contando solo las n primeras. Al principio salta mucho; con miles de clases, se pega a la respuesta exacta, la línea granate."},"archivo":"datos/trazas/17-simulacion-4.json"}
```

`cumsum(coincide)` cuenta las coincidencias acumuladas, y al dividir entre `1:10000` sale la estimación tras cada número de clases. El eje horizontal va en escala logarítmica (`scale_x_log10()`), para que se vean bien a la vez las primeras clases y las últimas.

- Con **1** clase, la estimación es 1: esa clase tenía coincidencia, y no hay más información.
- Con **10**, sale 0.70; con **100**, 0.65, todavía lejos de la respuesta.
- Con **1000**, 0.707, y con **10 000**, 0.7116, ya muy cerca de la línea granate, la respuesta exacta.

El error típico de una proporción estimada con $n$ repeticiones es $\sqrt{p(1-p)/n}$. Con $p = 0.7$ y 10 000 repeticiones, sale 0.0046: la diferencia entre 0.7116 y 0.7063 es justo de ese tamaño. Para ganar una cifra decimal más de precisión harían falta un millón de clases.

::::{div}
:class: afondo
### 5 · Remuestrear los datos: el *bootstrap*

La simulación también sirve para medir la incertidumbre de los datos reales. La masa media de las 146 adelias es 3706.2 g. Pero si los investigadores hubieran medido otras 146 adelias, la media habría salido algo distinta. ¿Cuánto?

El ***bootstrap*** responde sin fórmulas. Trata la muestra como si fuera la población: saca de ella 146 adelias **con reemplazamiento** (unas saldrán dos veces y otras ninguna), calcula su media, y repite. La variación de esas medias imita la que habría entre muestras distintas.

```{code-cell} r
library(dplyr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
adelias <- pinguinos |> filter(especie == "Adelia")
set.seed(2026)
medias <- replicate(10000, mean(sample(adelias$masa_corporal_g, replace = TRUE)))
quantile(medias, c(0.025, 0.975))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Remuestrear 10 000 veces","etiqueta":"a fondo · bootstrap","idea":"Cada valor de medias es la media de una muestra inventada, sacada de las 146 adelias con reemplazamiento. El 95 % central de esas medias es el intervalo de confianza."},"archivo":"datos/trazas/17-simulacion-5.json"}
```

`sample(x, replace = TRUE)` sin `size` saca tantos valores como tiene `x`, con reemplazamiento. El 95 % central de las 10 000 medias va de **3633.0** a **3782.4** g: es un **intervalo de confianza** del 95 % para la masa media de las adelias. En el capítulo de modelos, la fórmula clásica, `t.test(adelias$masa_corporal_g)`, dará de 3631.1 a 3781.2 g, casi lo mismo. La ventaja del *bootstrap* es que funciona igual con cualquier estadístico: la mediana, una correlación, la pendiente de una recta.

**Los números al azar no lo son.** R genera números **pseudoaleatorios**: una fórmula, el algoritmo Mersenne-Twister (`RNGkind()` lo dice), que produce una secuencia que parece al azar pero que está completamente determinada por su punto de partida, la semilla. Por eso `set.seed()` hace los resultados repetibles. Sin semilla, R parte de la hora y del número de proceso, y cada ejecución da números distintos.

**Vectorizar o repetir.** `rbinom(10000, ...)` es mucho más rápido que `replicate(10000, rbinom(1, ...))`, porque hace todo el trabajo de una vez. `replicate()` es para cuando el experimento no cabe en una sola función `r…()`, como el del cumpleaños o el del dado.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
El problema del cumpleaños con 10 000 clases de 30, en R, en Python con NumPy y en Julia:

```r
mean(replicate(10000, any(duplicated(sample(1:365, size = 30, replace = TRUE)))))
```

```python
clases = np.random.default_rng(2026).integers(1, 366, size=(10000, 30))
np.mean([len(set(c)) < 30 for c in clases])
```

```julia
mean(length(unique(rand(1:365, 30))) < 30 for _ in 1:10_000)
```

NumPy sortea de una vez una matriz de 10 000 filas, una por clase, y en cada fila compara cuántos días distintos hay con los 30 alumnos. Julia escribe el experimento dentro de un generador, `for _ in 1:10_000`, y le saca la media (con `using Statistics`). En Python sale 0.7066; cada lenguaje tiene su propio generador de números al azar, así que con la misma semilla no salen los mismos números, pero todos se acercan a 0.7063.
:::

## Conexiones

- Las funciones `r` de las **distribuciones** del capítulo anterior son el motor de la simulación, y la simulación permite comprobar sus fórmulas.
- En los **modelos**, el *bootstrap* dará la incertidumbre de la pendiente de una recta, y se comparará con la que calcula `lm()`.
- Los bucles del capítulo 4, las funciones del capítulo 5 y la media de un vector lógico del capítulo 3 son exactamente las piezas de una simulación.
- Fuera de la estadística, simular es la manera de estudiar lo que no tiene fórmula: colas en un supermercado, epidemias, carteras de inversión, el tráfico de una ciudad.

## La grieta

En el capítulo 15, una recta pasaba entre los pingüinos y subía unos 50 gramos por cada milímetro de aleta. Pero ¿de dónde sale exactamente esa recta? ¿Cómo de seguros podemos estar de esos 50 gramos? Y, sobre todo, ¿se puede usar para predecir cuánto pesará un pingüino del que solo conocemos la aleta? Ajustar una recta a unos datos, medir su incertidumbre y predecir con ella es construir un [**modelo**](18-modelos.md).

## Ejercicios

1. **El número mágico.** Repite la simulación del cumpleaños con una clase de 23. ¿Qué probabilidad sale? Compárala con la fórmula, `1 - prod((365:343) / 365)`.

2. **Un descuento justo.** Repite la simulación del test, pero restando un tercio de punto por fallo: `notas <- aciertos - (10 - aciertos) / 3`. ¿Qué nota media sale? ¿Por qué?

3. **Descartar una opción.** Un alumno sabe descartar una opción en cada pregunta y elige al azar entre las otras tres. Con el descuento de 0.25, ¿qué nota media saca? ¿Le compensa contestar, o es mejor dejar las preguntas en blanco?

4. **Dos dados.** Simula 10 000 tiradas de dos dados con `replicate()` y estima la probabilidad de que sumen 7. ¿Cuánto vale exactamente?

5. **Un seis de media.** Sin simular, ¿por qué la media de tiradas hasta sacar un seis tiene que estar cerca de 6?

6. **Sin semilla.** Ejecuta dos veces `mean(rbinom(100, size = 10, prob = 0.25))` sin `set.seed()`. ¿Salen los mismos números? ¿Qué cambia si pones `set.seed(1)` delante de cada una?

:::{div}
:class: afondo
7. **Monty Hall.** En un concurso hay tres puertas, y detrás de una hay un coche. Eliges una; el presentador, que sabe dónde está el coche, abre otra de las dos que quedan, con una cabra detrás, y te ofrece cambiar. Si cambias, ganas justo cuando tu primera elección era una cabra. Simúlalo: `replicate(10000, { premio <- sample(1:3, 1); eleccion <- sample(1:3, 1); premio != eleccion })`. ¿Compensa cambiar?

8. **La mediana.** Haz el *bootstrap* de la **mediana** de la masa de las adelias. ¿Qué intervalo del 95 % sale? ¿Por qué las medianas remuestreadas van a saltos de 25 g?
:::

## Solucionario

1. Con `set.seed(2026)` y 10 000 clases de 23, sale 0.5052. La fórmula da 0.5073. Con solo 23 alumnos, ya es más probable que haya una coincidencia que que no la haya: por eso 23 es el número famoso del problema.
2. La media sale prácticamente 0: −0.003 con `set.seed(2026)`. Con 4 opciones y un descuento de un tercio, cada pregunta contestada al azar aporta de media $0.25 \cdot 1 - 0.75 \cdot \frac{1}{3} = 0$. Es el descuento que hace que adivinar no gane ni pierda nada.
3. `aciertos <- rbinom(10000, size = 10, prob = 1/3)` y la misma fórmula de la nota: la media sale 1.66 puntos con `set.seed(2026)`. Le compensa contestar: cada pregunta aporta de media $\frac{1}{3} - \frac{2}{3} \cdot 0.25 = \frac{1}{6}$ de punto, más que el 0 de dejarla en blanco.
4. `mean(replicate(10000, sum(sample(1:6, 2, replace = TRUE)) == 7))` da 0.1654 con `set.seed(2026)`. Exactamente es $\frac{6}{36} = \frac{1}{6} = 0.1667$: hay 6 parejas que suman 7 entre las 36 posibles.
5. Porque el seis sale, de media, una vez de cada 6 tiradas. En 6000 tiradas habrá unos 1000 seises, separados de media por 6 tiradas. Las rachas largas (hasta 57 en la simulación) se compensan con los seises que salen a la primera.
6. Sin semilla, cada ejecución da un número distinto, porque R parte cada vez de un sitio distinto de su secuencia. Con `set.seed(1)` delante, las dos dan exactamente el mismo número.

:::{div}
:class: afondo
7. Con `set.seed(2026)`, cambiar gana en un 67.4 % de las veces. Exactamente, en $\frac{2}{3}$: tu primera elección acierta una vez de cada 3, y cambiar gana las otras 2. Compensa cambiar. Es uno de los problemas en los que la intuición falla más, y la simulación lo zanja en una línea.
8. `replicate(10000, median(sample(adelias$masa_corporal_g, replace = TRUE)))` y después `quantile(..., c(0.025, 0.975))`: con `set.seed(2026)`, de 3550 a 3800 g. Las masas están redondeadas a 25 g, y con 146 datos, un número par, la mediana es la media de los dos valores centrales; por eso solo toma unos pocos valores, en múltiplos de 12.5 g, y casi siempre de 25 g.
:::
