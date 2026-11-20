---
title: "Modelos: una recta que predice"
subtitle: Ajustar, medir la incertidumbre y predecir
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En la práctica de la ley de Hooke se cuelgan pesas de un muelle y se mide cuánto se alarga. Los puntos caen casi en línea recta, y con una regla se traza la recta que mejor pasa entre ellos. Su pendiente es la constante del muelle, y con la recta se puede predecir el alargamiento con una pesa que nadie ha colgado todavía. Pero si dos alumnos trazan la recta a ojo, salen dos rectas un poco distintas. ¿Cuál es la buena?

## La pregunta

En el capítulo 15, `geom_smooth(method = "lm")` dibujó una recta entre los pingüinos que subía unos 50 gramos por cada milímetro de aleta. ¿De dónde sale exactamente esa recta? ¿Cómo de seguros podemos estar de esos 50 gramos? ¿Y se puede usar para predecir cuánto pesará un pingüino del que solo conocemos la aleta?

## La idea

Un **modelo lineal** describe una variable como una recta de otra, más un error:

$$\text{masa} = b_0 + b_1 \cdot \text{aleta} + \text{error}$$

$b_0$ es la ordenada en el origen, $b_1$ la pendiente, y el error recoge todo lo que la aleta no explica. La recta buena es la de **mínimos cuadrados**: de todas las rectas posibles, la que hace más pequeña la suma de los cuadrados de los **residuos**, las distancias verticales entre cada punto y la recta. No depende del pulso de nadie: con los mismos datos, sale siempre la misma.

En R, la función es `lm()` (*linear model*), con una **fórmula**: `lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos)` se lee «la masa en función de la aleta, con los datos de `pinguinos`». Es la misma tilde de `y ~ x` en `geom_smooth()` y de `facet_wrap(~isla)`.

:::{important} Un modelo, cinco preguntas
| Pregunta | Función |
|---|---|
| ¿Qué recta ha salido? | `coef(modelo)` |
| ¿Qué predice para un caso nuevo? | `predict(modelo, newdata = ...)` |
| ¿Cuánto se equivoca en cada dato? | `residuals(modelo)` |
| ¿Cuánto explica, y es fiable la pendiente? | `summary(modelo)` |
| ¿Entre qué valores está la pendiente de verdad? | `confint(modelo)` |
:::

## Construcción

### 1 · La recta de los pingüinos

Este es el programa estrella del capítulo. Ajusta el modelo, pide sus coeficientes, predice la masa de un pingüino con 200 mm de aleta y mide cuánto explica la recta.

:::{tip} Predice
Mira el gráfico del capítulo 15. ¿Cuánto crees que pesa, más o menos, un pingüino con 200 mm de aleta?
:::

```{code-cell} r
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
modelo <- lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos)
coef(modelo)
predict(modelo, newdata = data.frame(largo_aleta_mm = 200))
summary(modelo)$r.squared
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La recta de los pingüinos","etiqueta":"lm","idea":"lm() calcula la recta de mínimos cuadrados y la guarda en modelo. Después, cada línea le hace una pregunta: sus coeficientes, su predicción para 200 mm de aleta y cuánto explica de la masa."},"archivo":"datos/trazas/18-modelos-1.json"}
```

- `coef(modelo)` da la recta: una ordenada en el origen de **−5872.1** g y una pendiente de **50.15** g por milímetro. Es la recta del capítulo 15, con sus números.
- `predict()` calcula la masa para una aleta de 200 mm: $-5872.1 + 50.15 \cdot 200 = $ **4158.6** g. `newdata` tiene que ser un data frame con una columna que se llame igual que la de la fórmula.
- `summary(modelo)$r.squared` es el **coeficiente de determinación**, $R^2$: **0.762**. La aleta explica el 76 % de la variación de la masa entre pingüinos; el 24 % restante depende de otras cosas. En una recta con una sola variable, $R^2$ es el cuadrado de la correlación: $0.873^2 = 0.762$.

La ordenada en el origen no tiene sentido por sí sola: es la masa de un pingüino con aleta de 0 mm, que pesaría −5872 g. La recta solo vale cerca de los datos, entre 172 y 231 mm de aleta. Fuera de ahí, predecir es **extrapolar**, y una recta no sabe que la masa no puede ser negativa.

### 2 · Por qué esa recta: mínimos cuadrados

¿Qué hace especial a la pendiente 50.15? La función `sc()` calcula la suma de los cuadrados de los residuos para una pendiente cualquiera (con la ordenada que hace pasar la recta por el centro de los datos). Se prueba con cinco pendientes:

```{code-cell} r
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
x <- pinguinos$largo_aleta_mm
y <- pinguinos$masa_corporal_g
sc <- function(b1) {
  b0 <- mean(y) - b1 * mean(x)
  sum((y - b0 - b1 * x)^2)
}
sapply(c(40, 45, 50.15, 55, 60), sc)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La recta que menos se equivoca","etiqueta":"mínimos cuadrados","idea":"sapply() llama a sc() con cinco pendientes. Cada llamada calcula la ordenada b0 y la suma de los cuadrados de los residuos. La más pequeña es la de 50.15, la pendiente de lm()."},"archivo":"datos/trazas/18-modelos-2.json"}
```

Las cinco sumas, en millones de gramos al cuadrado: 57.9 con pendiente 40, 52.9 con 45, **51.2** con 50.15, 52.7 con 55 y 57.5 con 60. La más pequeña es la de 50.15: ninguna otra recta se equivoca menos, medido así. `lm()` no prueba pendientes una a una: la calcula de golpe con una fórmula, $b_1 = \dfrac{\text{cov}(x, y)}{\text{var}(x)}$, y `cov(x, y) / var(x)` da exactamente 50.15.

¿Por qué los cuadrados? Porque así los residuos positivos y negativos no se anulan, los errores grandes pesan más que los pequeños, y la recta óptima sale con una fórmula sencilla.

Los **residuos** son lo que el modelo no explica. El primer pingüino de la tabla tiene 181 mm de aleta y pesa 3750 g; la recta le predice 3205.6 g, así que su residuo es **+544.4** g: pesa más de lo que diría su aleta. Los residuos de mínimos cuadrados siempre suman 0, y su dispersión, `sigma(modelo)`, es de **393.3** g: es el error típico de una predicción, lo que se equivoca la recta en un pingüino normal.

### 3 · ¿Cómo de segura es la pendiente?

La pendiente sale de 333 pingüinos. Con otros 333, saldría algo distinta. `summary()` y `confint()` dicen cuánto podría cambiar, y el *bootstrap* del capítulo 17 permite comprobarlo sin fórmulas.

```{code-cell} r
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
modelo <- lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos)
summary(modelo)$coefficients
confint(modelo)
set.seed(2026)
pendientes <- replicate(10000, coef(lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos[sample(nrow(pinguinos), replace = TRUE), ]))[2])
quantile(pendientes, c(0.025, 0.975))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La incertidumbre de la pendiente","etiqueta":"summary · confint · bootstrap","idea":"La tabla de coeficientes da, para cada uno, su estimación, su error típico, el valor t y el valor p. confint() da el intervalo del 95 % con una fórmula; el bootstrap lo calcula remuestreando los pingüinos 10 000 veces."},"archivo":"datos/trazas/18-modelos-3.json"}
```

La tabla de coeficientes tiene una fila por coeficiente y cuatro columnas:

- `Estimate`: la estimación, 50.15 g/mm para la pendiente;
- `Std. Error`: su **error típico**, 1.54 g/mm, lo que cambiaría la pendiente de una muestra a otra;
- `t value`: la estimación dividida entre su error típico, 32.6. La pendiente está a 32 errores típicos de 0;
- `Pr(>|t|)`: el **valor p**, la probabilidad de encontrar una pendiente así de grande si la aleta no tuviera nada que ver con la masa. Aquí es 3 · 10⁻¹⁰⁵, prácticamente 0: la relación no es casualidad.

`confint(modelo)` da el **intervalo de confianza** del 95 %: la pendiente de verdad está, con mucha seguridad, entre **47.1** y **53.2** g/mm. El *bootstrap* remuestrea los 333 pingüinos 10 000 veces, ajusta la recta en cada muestra y da el 95 % central de las pendientes: de **47.3** a **53.0**. Dos caminos muy distintos, una fórmula y una simulación, llegan casi al mismo sitio.

:::{note} La t de Student
El intervalo de `confint()` no usa la normal, sino la **t de Student**, una campana con las colas más gruesas que tiene en cuenta que el error típico también es una estimación. Con muchos datos, la t casi no se distingue de la normal. Es la misma idea que hay detrás de `t.test()`: para la masa media de las adelias, `t.test(adelias$masa_corporal_g)` da un intervalo de 3631.1 a 3781.2 g, y el *bootstrap* del capítulo 17 daba de 3633.0 a 3782.4 g.
:::

### 4 · Predecir, con su incertidumbre

Una predicción sin margen de error dice poco. `predict()` da dos intervalos muy distintos, según la pregunta:

```{code-cell} r
library(tidyr)
library(ggplot2)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
modelo <- lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos)
nuevo <- data.frame(largo_aleta_mm = 200)
predict(modelo, newdata = nuevo, interval = "confidence")
predict(modelo, newdata = nuevo, interval = "prediction")
ggplot(pinguinos, aes(x = largo_aleta_mm, y = masa_corporal_g)) +
  geom_point(color = "grey60") +
  geom_smooth(method = "lm", formula = y ~ x) +
  geom_vline(xintercept = 200, linetype = "dashed")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Dos intervalos","etiqueta":"predict","idea":"El intervalo de confianza dice dónde está la recta: es estrecho. El de predicción dice dónde caerá un pingüino concreto: es mucho más ancho. La banda gris de geom_smooth() es el primero."},"archivo":"datos/trazas/18-modelos-4.json"}
```

Los dos están centrados en 4158.6 g, pero responden a preguntas distintas:

- `interval = "confidence"`: ¿cuánto pesan **de media** los pingüinos con 200 mm de aleta? Entre **4116.1** y **4201.1** g. Es estrecho, porque con 333 pingüinos la recta está muy bien situada.
- `interval = "prediction"`: ¿cuánto pesará **un** pingüino concreto con 200 mm de aleta? Entre **3383.6** y **4933.5** g. Es mucho más ancho, porque a la incertidumbre de la recta se suma la variación de un pingüino a otro, los 393 g de `sigma(modelo)`.

En el gráfico, la banda gris de `geom_smooth()` es el intervalo de **confianza**: dónde está la recta, no dónde caen los pingüinos. Por eso casi todos los puntos quedan fuera de ella. Confundir los dos intervalos es uno de los errores más frecuentes al leer un modelo.

### 5 · Más de una variable

La masa no depende solo de la aleta. En `lm()`, las variables se suman en la fórmula con `+`. Y si una es de texto, como la especie o el sexo, R la trata como un factor (capítulo 6).

```{code-cell} r
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
completo <- lm(masa_corporal_g ~ largo_aleta_mm + especie + sexo, data = pinguinos)
coef(completo)
summary(completo)$r.squared
predict(completo, newdata = data.frame(largo_aleta_mm = 200, especie = "Adelia", sexo = c("hembra", "macho")))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Aleta, especie y sexo","etiqueta":"lm con varias variables","idea":"Ahora hay un coeficiente por cada variable numérica y uno por cada nivel de los factores, salvo el primero, que es la referencia. La predicción compara una hembra y un macho de adelia con la misma aleta."},"archivo":"datos/trazas/18-modelos-5.json"}
```

Hay cinco coeficientes. El de cada nivel de un factor compara con el **nivel de referencia**, el primero en orden alfabético: adelia para la especie y hembra para el sexo.

- `largo_aleta_mm`: **20.0** g por milímetro, a igual especie y sexo.
- `especieBarbijo`: **−87.6** g respecto a una adelia con la misma aleta y el mismo sexo; `especiePapúa`: **+836.3** g.
- `sexomacho`: **+530.4** g respecto a una hembra de la misma especie y la misma aleta.

$R^2$ sube de 0.762 a **0.867**: con especie y sexo, el modelo explica casi el 87 % de la variación. Y la pendiente de la aleta baja de 50 a 20 g/mm. No es una contradicción: en el modelo simple, la aleta se llevaba también el mérito de la especie y del sexo, porque los papúas y los machos tienen a la vez más aleta y más masa. Ahora cada variable tiene su propio coeficiente, y la aleta se queda solo con lo suyo.

La predicción lo enseña en números: con 200 mm de aleta, una adelia hembra pesaría **3639.2** g, y un macho, **4169.5** g, justo 530.4 g más.

::::{div}
:class: afondo
### 6 · Más allá de la recta

**Una recta por especie.** Con `+`, las tres especies comparten la pendiente de la aleta y solo se desplazan arriba o abajo. Con `*`, cada especie tiene su propia pendiente: `lm(masa_corporal_g ~ largo_aleta_mm * especie, data = pinguinos)` añade los términos de **interacción** `largo_aleta_mm:especieBarbijo` y `largo_aleta_mm:especiePapúa`. Las pendientes salen de 32.7 g/mm en adelias, 34.6 en barbijos (32.7 + 1.9) y 54.2 en papúas (32.7 + 21.5): son las tres rectas de color del capítulo 15. En los papúas, cada milímetro de aleta pesa mucho más.

**Mirar los residuos.** Un modelo lineal supone que los residuos no tienen forma: que no siguen ninguna curva, que su dispersión es parecida en todo el rango y que son aproximadamente normales (capítulo 16). `plot(modelo)` dibuja cuatro gráficos para comprobarlo, y con ggplot2 se puede hacer el principal: `ggplot(data.frame(ajustado = fitted(modelo), residuo = residuals(modelo)), aes(ajustado, residuo)) + geom_point() + geom_hline(yintercept = 0)`. Si los puntos dibujan una curva, la relación no es una recta.

**Un factor solo es una prueba t.** `lm(masa_corporal_g ~ sexo, data = pinguinos)` da una ordenada de 3862.3 g, la masa media de las hembras, y un coeficiente `sexomacho` de 683.4 g, la diferencia con la media de los machos (4545.7 g). Su valor p es el mismo que el de `t.test(masa_corporal_g ~ sexo, data = pinguinos, var.equal = TRUE)`. Muchas pruebas clásicas son modelos lineales disfrazados.

**Correlación no es causalidad.** El modelo dice que los pingüinos con más aleta pesan más, no que alargar la aleta de un pingüino lo haga más pesado. Las dos cosas crecen juntas porque un pingüino más grande tiene más de todo. Un modelo con datos observados describe asociaciones; para hablar de causas hace falta un experimento, o un razonamiento mucho más cuidadoso.

**Extrapolar es peligroso.** `predict(modelo, newdata = data.frame(largo_aleta_mm = c(0, 260)))` da −5872 g y 7168 g. Ningún pingüino del estudio tenía la aleta fuera del intervalo de 172 a 231 mm, y la recta no sabe nada de lo que pasa fuera.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
El modelo de la masa en función de la aleta. En R, en Python con statsmodels y en Julia con GLM:

```r
lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos)
```

```python
smf.ols("masa_corporal_g ~ largo_aleta_mm", data=pinguinos).fit()
```

```julia
lm(@formula(masa_corporal_g ~ largo_aleta_mm), pinguinos)
```

Los tres usan la misma fórmula, que nació en S y R y han copiado los demás: en Python, statsmodels la lee de un texto (`import statsmodels.formula.api as smf`); en Julia, la macro `@formula` de GLM. Y los tres dan −5872.1 y 50.15.
:::

## Conexiones

- `lm()` es la puerta de los **modelos lineales generalizados**, con `glm()`: la regresión logística predice una probabilidad (¿aprobará?) en lugar de una cantidad.
- El modelo es un **objeto** de R: una lista con clase `lm`. Por eso `print(modelo)` y `summary(modelo)` enseñan cosas distintas del mismo objeto. Cómo funciona eso por dentro es el tema del capítulo de objetos, en la parte IV.
- Los intervalos de confianza y los valores p son los de las **pruebas de hipótesis** de la estadística clásica, y el *bootstrap* del capítulo 17 permite comprobarlos sin fórmulas.
- Las **distribuciones** del capítulo 16 están en el centro: los errores se suponen normales, y la t de Student da los intervalos.

## La grieta

Con este capítulo se cierra la parte III: leer datos, transformarlos, dibujarlos y modelarlos. Pero hay algo que llevamos tiempo usando sin preguntarnos cómo funciona. En `lm(masa_corporal_g ~ largo_aleta_mm, data = pinguinos)`, en `aes(x = largo_aleta_mm)` o en `filter(especie == "Adelia")`, escribimos nombres de columnas sin comillas, como si fueran variables. Pero `largo_aleta_mm` no es ninguna variable del programa: si la escribes sola, R dice `objeto 'largo_aleta_mm' no encontrado`. ¿Cómo la encuentran entonces esas funciones? ¿Dónde busca R los nombres? La respuesta son los **entornos**, y con ellos empieza la parte IV, R por dentro.

## Ejercicios

1. **El pico.** Ajusta un modelo de la masa en función del largo del pico. ¿Cuánto vale la pendiente? ¿Qué $R^2$ tiene? ¿Predice mejor o peor que la aleta?

2. **A mano.** Con los coeficientes del apartado 1, calcula a mano la masa que predice el modelo para un pingüino con 190 mm de aleta. Comprueba el resultado con `predict()`.

3. **Un residuo.** El tercer pingüino de la tabla tiene 195 mm de aleta y pesa 3250 g. ¿Qué le predice el modelo? ¿Cuál es su residuo? ¿Pesa más o menos de lo que diría su aleta?

4. **La pendiente nula.** Si la aleta no tuviera nada que ver con la masa, ¿cuánto valdría la pendiente de verdad? ¿Está ese valor dentro del intervalo de `confint()`? ¿Qué significa?

5. **Dos intervalos.** Explica con tus palabras por qué el intervalo de predicción para 200 mm (de 3383.6 a 4933.5 g) es mucho más ancho que el de confianza (de 4116.1 a 4201.1 g).

6. **El nivel de referencia.** En el modelo del apartado 5, ¿cuánto pesaría de más un papúa macho respecto a una adelia hembra con la misma aleta?

:::{div}
:class: afondo
7. **Pendientes por especie.** Con el modelo con interacción del apartado 6, ¿cuál es la pendiente de la aleta en los barbijos? ¿Coincide con la del capítulo 15?

8. **Un factor solo.** En `lm(masa_corporal_g ~ sexo, data = pinguinos)`, ¿qué significan la ordenada en el origen y el coeficiente `sexomacho`? Compruébalo con `tapply(pinguinos$masa_corporal_g, pinguinos$sexo, mean)`.
:::

## Solucionario

1. `lm(masa_corporal_g ~ largo_pico_mm, data = pinguinos)` da una pendiente de 86.8 g por milímetro de pico y un $R^2$ de 0.347. Predice bastante peor que la aleta, que explicaba el 76 %: el pico solo explica el 35 % de la variación de la masa.
2. $-5872.09 + 50.153 \cdot 190 = 3657.0$ g. `predict(modelo, newdata = data.frame(largo_aleta_mm = 190))` da lo mismo.
3. El modelo le predice $-5872.09 + 50.153 \cdot 195 = 3907.8$ g. Su residuo es $3250 - 3907.8 = -657.8$ g: pesa bastante menos de lo que diría su aleta.
4. Valdría 0. El intervalo de `confint()`, de 47.1 a 53.2, está muy lejos de 0, así que la relación entre la aleta y la masa no es casualidad. Es lo mismo que dice el valor p, prácticamente 0.
5. El intervalo de confianza solo tiene en cuenta dónde está la recta, que con 333 pingüinos está muy bien medida. El de predicción añade la variación de un pingüino a otro: dos pingüinos con la misma aleta pueden pesar cientos de gramos de diferencia, y eso no se reduce con más datos.
6. $836.3 + 530.4 = 1366.7$ g: el coeficiente de papúa más el de macho, porque los dos se comparan con la referencia, adelia y hembra.

:::{div}
:class: afondo
7. $32.69 + 1.88 = 34.6$ g por milímetro: la pendiente de las adelias más el término de interacción de los barbijos. Coincide con la recta de los barbijos del capítulo 15, que da lo mismo ajustando solo con los barbijos.
8. La ordenada, 3862.3 g, es la masa media de las hembras, el nivel de referencia. El coeficiente `sexomacho`, 683.4 g, es lo que pesan de más los machos de media: 4545.7 − 3862.3. `tapply()` da 3862.3 para las hembras y 4545.7 para los machos.
:::
