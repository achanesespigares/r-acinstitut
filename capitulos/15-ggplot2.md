---
title: "ggplot2: dibujar por capas"
subtitle: Un gráfico se construye como una frase, pieza a pieza
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En el laboratorio de Física, un gráfico se hace siempre en el mismo orden. Primero se decide qué magnitud va en cada eje y se dibujan los ejes con su escala. Después se marcan los puntos, uno por medida. Si los puntos se alinean, se traza la recta que mejor pasa entre ellos. Al final se escriben el título y las unidades. Cada paso se dibuja encima del anterior, y nadie empieza por la recta.

## La pregunta

Al final del capítulo anterior quedaron preguntas que una tabla no responde bien: ¿la masa de un pingüino crece con el largo de su aleta? ¿Hay pingüinos raros, lejos de los demás? ¿Las tres especies se separan o se mezclan? Para verlo hay que dibujar 333 pingüinos. ¿Cómo se le explica a R un dibujo sin decirle punto por punto dónde va cada cosa?

## La idea

El paquete **ggplot2** construye los gráficos siguiendo la **gramática de los gráficos**, una idea del estadístico Leland Wilkinson: todo gráfico estadístico, por distinto que parezca, se describe con las mismas piezas. Las tres imprescindibles son:

- los **datos**: un data frame, con una fila por observación (los datos ordenados del capítulo anterior);
- las **estéticas**, dentro de `aes()`: qué columna va a cada propiedad visual, como la posición horizontal (`x`), la vertical (`y`), el color o el tamaño;
- las **geometrías**, las funciones `geom_…()`: qué marca se dibuja, como puntos, barras, líneas o cajas.

Las piezas se suman con `+`, como las capas del gráfico de laboratorio. Después pueden venir más capas: títulos (`labs()`), paneles (`facet_wrap()`), escalas (`scale_…()`) y temas (`theme_…()`).

:::{important} Un gráfico, tres preguntas
1. ¿Qué **datos** se dibujan?
2. ¿Qué **columna** va a cada propiedad visual?
3. ¿Con qué **marca** se dibuja cada fila?

`ggplot(pinguinos, aes(x = largo_aleta_mm, y = masa_corporal_g)) + geom_point()` responde a las tres: los pingüinos; la aleta en horizontal y la masa en vertical; un punto por pingüino.
:::

## Construcción

### 1 · Un gráfico capa a capa

Este es el programa estrella del capítulo. Quita las filas con algún dato que falta (con `drop_na()`, del capítulo anterior) y dibuja la masa frente a la aleta en cuatro pasos.

:::{tip} Predice
La primera línea del gráfico, `ggplot(...)`, todavía no tiene ninguna `geom_…()`. Si R dibujara el gráfico justo ahí, ¿qué se vería?
:::

```{code-cell} r
library(ggplot2)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
ggplot(pinguinos, aes(x = largo_aleta_mm, y = masa_corporal_g)) +
  geom_point(aes(color = especie)) +
  geom_smooth(method = "lm", formula = y ~ x, color = "black") +
  labs(x = "Largo de la aleta (mm)", y = "Masa corporal (g)", color = "Especie")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Un gráfico capa a capa","etiqueta":"ggplot","idea":"Mira el dibujo después de cada +. ggplot() solo prepara el lienzo con los ejes; geom_point() pone un punto por pingüino, coloreado por especie; geom_smooth() añade la recta; labs() cambia los títulos. Ninguna capa borra las anteriores."},"archivo":"datos/trazas/15-ggplot2-1.json"}
```

Capa a capa:

- `ggplot(pinguinos, aes(x = largo_aleta_mm, y = masa_corporal_g))` prepara el **lienzo**: los datos y qué columna va a cada eje. R ya sabe la escala, de 172 a 231 mm de aleta y de 2700 a 6300 g de masa, y dibuja los ejes. Pero todavía no hay ninguna marca: el lienzo sale vacío.
- `geom_point(aes(color = especie))` dibuja un **punto por fila**: 333 puntos. Su `aes()` conecta otra columna, `especie`, con el color, y ggplot2 añade solo la leyenda.
- `geom_smooth(method = "lm", formula = y ~ x, color = "black")` calcula la **recta** que mejor se ajusta a los puntos y la dibuja con una banda gris de incertidumbre. `formula = y ~ x` dice «la `y` en función de la `x`»; si no la escribes, ggplot2 la usa igual y lo avisa con un mensaje.
- `labs()` cambia los títulos de los ejes y de la leyenda. No toca ningún dato.

El gráfico responde a las tres preguntas de golpe. La masa **crece** con la aleta: la recta sube unos 50 gramos por cada milímetro de aleta. Hay pocos pingüinos raros: casi todos están cerca de la nube de su especie. Y las especies **se separan**: los papúas forman una nube aparte, arriba a la derecha, mientras que adelias y barbijos se mezclan abajo a la izquierda.

:::{note} El `+` va al final de la línea
Un gráfico de varias líneas debe terminar cada línea con `+`. Así R sabe que la frase sigue. Si el `+` se pone al principio de la línea siguiente, R da por terminado el gráfico en la línea anterior, lo dibuja sin esa capa y después protesta con ``Cannot use `+` with a single argument``. El mensaje de ggplot2 está en inglés y ayuda: pregunta si has puesto el `+` en una línea nueva sin querer.
:::

:::{warning} Dentro o fuera de `aes()`
- **Dentro** de `aes()` va lo que depende de una columna: `aes(color = especie)` pinta cada punto según su especie.
- **Fuera** de `aes()` va lo que es igual para todos: `color = "black"` pinta toda la recta de negro.

Si se cambia de sitio, sale mal. Con `geom_point(aes(color = "azul"))`, ggplot2 cree que `"azul"` es una columna con un único valor: todos los puntos salen del primer color de su paleta, un salmón, y aparece una leyenda que dice «azul». Y con `geom_point(color = especie)`, sin `aes()`, R busca una variable `especie` fuera de la tabla y se para: `objeto 'especie' no encontrado`.
:::

### 2 · Una variable: barras e histogramas

Para ver cómo se reparte una sola variable, basta con una estética. Si la variable es de texto, como `especie`, se cuentan las filas de cada valor. Si es numérica, como la masa, se reparten los valores en intervalos.

```{code-cell} r
library(ggplot2)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
ggplot(pinguinos, aes(x = especie)) +
  geom_bar()
ggplot(pinguinos, aes(x = masa_corporal_g)) +
  geom_histogram(aes(fill = especie), binwidth = 250)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Barras e histograma","etiqueta":"geom_bar · geom_histogram","idea":"geom_bar() hace el recuento por su cuenta: no hace falta count(). geom_histogram() corta la masa en intervalos de 250 g y levanta una barra en cada uno. El relleno por especie enseña de quién es cada trozo de la montaña."},"archivo":"datos/trazas/15-ggplot2-2.json"}
```

- `geom_bar()` **cuenta** por su cuenta: no hace falta `count()`. Salen tres barras con 146 adelias, 68 barbijos y 119 papúas.
- `geom_histogram(binwidth = 250)` corta el eje de la masa en **intervalos** de 250 gramos y levanta en cada uno una barra tan alta como los pingüinos que caen dentro. El intervalo con más pingüinos es el que va de 3375 a 3625 g, con 47.
- `aes(fill = especie)` rellena cada barra por especie, apilando los trozos. Sin el relleno se vería una sola montaña, con el grueso de los pingüinos entre 3250 y 4000 g y una cola larga hacia la derecha. Con el relleno se ve de quién es la cola: de los papúas.

La anchura de los intervalos, `binwidth`, se elige a ojo, y cambia el dibujo. Con intervalos muy estrechos, el histograma sale lleno de dientes; con intervalos muy anchos, se borra la forma. Prueba varios antes de quedarte con uno.

### 3 · Comparar grupos: cajas y barras

Para comparar la masa entre especies hay dos gráficos clásicos. El **diagrama de caja** resume cada grupo en cinco números. El de **barras** dibuja una tabla ya resumida, como la tabla `resumen` del capítulo 13.

```{code-cell} r
library(ggplot2)
library(dplyr)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
ggplot(pinguinos, aes(x = especie, y = masa_corporal_g)) +
  geom_boxplot()
resumen <- pinguinos |>
  group_by(especie, sexo) |>
  summarise(media = mean(masa_corporal_g), .groups = "drop")
ggplot(resumen, aes(x = especie, y = media, fill = sexo)) +
  geom_col(position = "dodge")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Cajas y barras","etiqueta":"geom_boxplot · geom_col","idea":"En cada caja, la raya es la mediana y la caja abarca la mitad central de los pingüinos. Después, geom_col() dibuja la tabla resumen tal cual: una barra por fila, y position = \"dodge\" pone las de hembras y machos una al lado de la otra."},"archivo":"datos/trazas/15-ggplot2-3.json"}
```

En el **diagrama de caja**:

- la raya de dentro es la **mediana**: 3700 g en adelias y en barbijos, 5050 g en papúas;
- la caja va del primer al tercer cuartil y abarca **la mitad central** de los pingüinos: en las adelias, de 3362.5 a 4000 g;
- los bigotes llegan hasta el pingüino más extremo que no esté demasiado lejos de la caja, y los que quedan más allá se dibujan sueltos, como **atípicos**. Solo los barbijos tienen dos.

En el de **barras**, `geom_col()` no cuenta nada: dibuja **una barra por fila**, con la altura que ya trae la columna `media`. Esa es la diferencia con `geom_bar()`, que cuenta las filas. `position = "dodge"` pone las barras de hembras y machos **una al lado de la otra**; sin él, se apilarían una encima de otra, y la altura total sería la suma de las dos medias, que no significa nada.

Los dos gráficos se complementan. Las barras dicen que los machos pesan más en las tres especies; la caja enseña además cuánto varían los pingüinos dentro de cada especie.

### 4 · Paneles

Cuando un gráfico mezcla demasiado, se puede partir en **paneles**, uno por cada valor de una variable. Todos los paneles comparten los ejes, así que se comparan de un vistazo.

```{code-cell} r
library(ggplot2)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
ggplot(pinguinos, aes(x = largo_aleta_mm, y = masa_corporal_g, color = especie)) +
  geom_point() +
  facet_wrap(~isla)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Un panel por isla","etiqueta":"facet_wrap","idea":"facet_wrap(~isla) parte el gráfico en tres paneles, uno por isla, con los mismos ejes. Así se ve qué especies viven en cada isla."},"archivo":"datos/trazas/15-ggplot2-4.json"}
```

Esta vez el color va en el `aes()` de `ggplot()`, no en el de la geometría: así vale para **todas** las capas del gráfico. `facet_wrap(~isla)` se lee «un panel por cada isla». La tilde `~` es la de las fórmulas de R, la misma de `y ~ x`.

Los paneles enseñan lo que en el capítulo anterior decía la tabla de ceros. En Torgersen solo hay adelias; en Biscoe, adelias y papúas; en Dream, adelias y barbijos. Y las adelias son iguales en las tres islas: su nube cae en el mismo sitio en los tres paneles, alrededor de 190 mm de aleta y 3700 g de masa.

::::{div}
:class: afondo
### 5 · Lo que esconde un gráfico sin color

Un gráfico de puntos sin grupos puede engañar. Estas cuatro capas dibujan el largo del pico frente a su alto, primero con una recta para todos los pingüinos y después con una recta para cada especie:

```{code-cell} r
library(ggplot2)
library(tidyr)
pinguinos <- read.csv("datos/pinguinos.csv") |> drop_na()
ggplot(pinguinos, aes(x = largo_pico_mm, y = alto_pico_mm)) +
  geom_point(aes(color = especie)) +
  geom_smooth(method = "lm", formula = y ~ x, color = "black") +
  geom_smooth(aes(color = especie), method = "lm", formula = y ~ x)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Una recta o tres","etiqueta":"a fondo · Simpson","idea":"La recta negra, para todos los pingüinos juntos, baja. Las tres rectas de color, una por especie, suben. Las dos cosas son verdad a la vez: es la paradoja de Simpson."},"archivo":"datos/trazas/15-ggplot2-5.json"}
```

La recta negra **baja**: con todos los pingüinos juntos, a más largo de pico, menos alto (la correlación es −0.23). Pero las tres rectas de color **suben**: dentro de cada especie, a más largo, más alto (correlaciones de 0.39 en adelias y de 0.65 en barbijos y papúas). Las dos cosas son ciertas a la vez. Los papúas tienen el pico largo y estrecho, y las adelias corto y alto: al juntarlos, la diferencia entre especies tapa la relación de dentro de cada una. Es la **paradoja de Simpson**, y solo se ve cuando se colorea por grupo.

**Un gráfico es un objeto.** `ggplot()` no dibuja nada: devuelve un objeto de clase `ggplot`, una lista con los datos, las estéticas, las capas y el tema. R lo dibuja cuando lo imprime, como cualquier otro valor. Por eso se puede guardar y seguir retocando:

```r
p <- ggplot(pinguinos, aes(x = largo_aleta_mm, y = masa_corporal_g)) + geom_point()
p + theme_minimal()                                   # el mismo gráfico, con otro tema
ggsave("aleta.png", p, width = 16, height = 10, units = "cm", dpi = 300)
```

`p$layers` es la lista de capas: aquí, una sola. `labs()`, los temas y las escalas no son capas: cambian otras partes del objeto.

**Escalas propias.** Cada estética tiene su escala, y `scale_…()` la cambia. Con `scale_color_manual(values = c(Adelia = "#7A1F36", Barbijo = "#C9A227", Papúa = "#2E6E8E"))`, cada especie lleva el color que tú eliges; con `scale_y_log10()`, el eje vertical pasa a escala logarítmica.

**El orden de las barras** es el de los niveles del factor (capítulo 6). Con texto, ggplot2 ordena alfabéticamente; para otro orden, convierte la columna en factor con los niveles en el orden que quieras: `mutate(especie = factor(especie, levels = c("Papúa", "Adelia", "Barbijo")))`.

**`+` no es `|>`.** La tubería pasa datos de una función a la siguiente; el `+` suma capas a un gráfico. Se puede empezar con una tubería y terminar con capas, `pinguinos |> filter(isla == "Dream") |> ggplot(aes(x = especie)) + geom_bar()`, pero entre capas siempre va `+`. Si se pone `|>`, ggplot2 se queja: `` `mapping` must be created by `aes()` `` y pregunta si querías decir `+`.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
El gráfico de la aleta y la masa, coloreado por especie. En R con ggplot2, en Python con plotnine y en Julia con AlgebraOfGraphics:

```r
ggplot(pinguinos, aes(x = largo_aleta_mm, y = masa_corporal_g, color = especie)) + geom_point()
```

```python
ggplot(pinguinos, aes("largo_aleta_mm", "masa_corporal_g", color="especie")) + geom_point()
```

```julia
draw(data(pinguinos) * mapping(:largo_aleta_mm, :masa_corporal_g, color = :especie) * visual(Scatter))
```

plotnine copia la gramática de ggplot2 casi palabra por palabra; la diferencia es que en Python los nombres de las columnas van entre comillas. AlgebraOfGraphics usa las mismas piezas, datos, estéticas y geometría, pero las combina con `*`. En Python, lo más habitual son matplotlib y seaborn, que no siguen la gramática: allí se dice directamente qué dibujar, no cómo traducir columnas a marcas.
:::

## Conexiones

- En el capítulo de **modelos**, la recta de `geom_smooth(method = "lm")` saldrá de `lm()`, con sus números: la pendiente de unos 50 gramos por milímetro y la fuerza de la relación.
- El histograma es la puerta de las **distribuciones**, en el capítulo siguiente: la forma de la montaña tiene nombre.
- **dplyr y tidyr** preparan los datos y ggplot2 los dibuja. Casi todo gráfico empieza con una tubería que filtra, resume o alarga la tabla.
- Los **factores** del capítulo 6 deciden el orden de las barras y de los paneles, y las **fechas** del capítulo 11 dan ejes con meses y años.

## La grieta

Dibuja el histograma de las adelias solas, `pinguinos |> filter(especie == "Adelia") |> ggplot(aes(x = masa_corporal_g)) + geom_histogram(binwidth = 250)`, y sale una campana: muchos pingüinos alrededor de 3700 g, cada vez menos según te alejas por los dos lados, y casi simétrica. ¿Es casualidad? Si una curva conocida describiera esa campana, se podría responder sin contar pingüinos uno a uno a preguntas como esta: ¿qué proporción de adelias pesa más de 4500 g? Las curvas que describen cómo se reparten los datos son las **distribuciones**.

## Ejercicios

1. **Mapear o fijar.** Escribe el gráfico de la aleta y la masa con todos los puntos de color gris. ¿Va `color = "grey50"` dentro o fuera de `aes()`? ¿Qué saldría con el otro?

2. **La anchura de los intervalos.** Dibuja el histograma de la masa, sin relleno, con `binwidth = 50` y con `binwidth = 1000`. ¿Qué se pierde en cada caso?

3. **Pingüinos por isla.** Dibuja con `geom_bar()` cuántos pingüinos hay en cada isla, con las barras rellenas por especie. ¿Qué isla tiene más pingüinos?

4. **El `+` perdido.** ¿Qué pasa si escribes el gráfico así? ¿Qué dibuja R, y qué mensaje sale?

   ```r
   ggplot(pinguinos, aes(x = especie))
     + geom_bar()
   ```

5. **Aletas por especie.** Dibuja un diagrama de caja del largo de la aleta por especie. ¿Qué especie tiene la mediana más alta, y cuánto vale?

6. **Largo para dibujar.** En el capítulo anterior, `larga` tenía una fila por especie y año, con las columnas `especie`, `anio` y `n`. Dibuja con `geom_col()` cuántos pingüinos se midieron cada año, con las barras rellenas por especie. ¿Por qué no se puede hacer con la tabla ancha `por_anio`?

:::{div}
:class: afondo
7. **Simpson.** En el apartado 5, ¿por qué la recta de todos los pingüinos baja si las tres rectas de las especies suben? ¿Qué especie tiene el pico más corto, y cuál el menos alto?

8. **Capas y no capas.** `p <- ggplot(pinguinos, aes(x = largo_aleta_mm, y = masa_corporal_g)) + geom_point() + geom_smooth(method = "lm", formula = y ~ x) + labs(x = "Aleta")`. ¿Cuánto vale `length(p$layers)`? ¿Por qué no es 3?
:::

## Solucionario

1. Fuera: `geom_point(color = "grey50")`, porque el color es el mismo para todos los puntos y no depende de ninguna columna. Dentro, `geom_point(aes(color = "grey50"))`, los puntos saldrían del primer color de la paleta, un salmón, con una leyenda que dice «grey50».
2. Con `binwidth = 50`, el histograma sale lleno de dientes: hay pocos pingüinos en cada intervalo y la forma se pierde entre el ruido. Con `binwidth = 1000`, quedan unas pocas barras anchas y se pierde la forma: la cola de los papúas se funde con el resto.
3. `ggplot(pinguinos, aes(x = isla)) + geom_bar(aes(fill = especie))`. Biscoe, con 163 pingüinos: 44 adelias y 119 papúas. Después vienen Dream, con 123, y Torgersen, con 47.
4. R da por terminado el gráfico en la primera línea y lo dibuja: un lienzo con las especies en el eje horizontal y ninguna barra. Después ejecuta `+ geom_bar()` sola y se para con ``Cannot use `+` with a single argument``, que pregunta si has puesto el `+` en una línea nueva sin querer.
5. `ggplot(pinguinos, aes(x = especie, y = largo_aleta_mm)) + geom_boxplot()`. Los papúas, con una mediana de 216 mm, frente a 190 mm en las adelias y 196 mm en los barbijos.
6. `ggplot(larga, aes(x = anio, y = n, fill = especie)) + geom_col()`. Cada estética necesita **una** columna: para poner el año en el eje horizontal, el año tiene que ser una columna. En `por_anio` está repartido entre los nombres de tres columnas, `2007`, `2008` y `2009`. Con la tabla del capítulo anterior, se midieron 110 pingüinos en 2007, 114 en 2008 y 120 en 2009.

:::{div}
:class: afondo
7. Porque las especies ocupan sitios distintos del gráfico. Las adelias tienen el pico más corto (38.8 mm de media) y alto (18.3 mm); los papúas, largo (47.6 mm) y el menos alto (15.0 mm). La recta de todos va de la nube de las adelias, arriba a la izquierda, a la de los papúas, abajo a la derecha, y por eso baja. Dentro de cada nube, en cambio, la relación sube.
8. 2. Solo `geom_point()` y `geom_smooth()` son capas: dibujan marcas. `labs()` cambia los títulos, que se guardan en otra parte del objeto, `p$labels`.
:::
