---
title: "Proyecto 2 · Una herramienta para el aula"
subtitle: Del cálculo a la app, pasando por las pruebas, el paquete y la documentación
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

A mitad de trimestre, en todas las clases se oye la misma pregunta: «¿Qué necesito sacar en el último examen para aprobar?». Cada alumno lo calcula a su manera, con la calculadora del móvil, y no siempre bien: se olvida de que el último examen vale más, o suma las notas sin los pesos. La profesora de los capítulos 25 y 27 quiere darles una herramienta que lo haga bien, para todos y siempre igual.

En el proyecto anterior la meta era responder una pregunta y contarlo. Aquí la meta es otra: construir algo que **usen otros**. Y eso pide más cuidado, porque otros lo usarán de maneras que no hemos previsto.

## La pregunta

Si un alumno ya tiene las notas de algunos exámenes y sabe cuánto pesa cada uno, ¿qué nota necesita en el último para llegar a un 5, o a la nota que quiera? ¿Cómo se convierte ese cálculo en una herramienta fiable, documentada y que cualquiera pueda usar, también sin saber R?

## El plan

Partimos del paquete `notas` del capítulo 26, que ya tiene `nota_final()` con su ayuda y sus pruebas, y lo convertimos en la herramienta en cinco pasos:

1. **El cálculo.** La cuenta, a mano, y cómo se despeja la nota que falta.
2. **Las pruebas, primero.** Antes de escribir la función, escribir lo que tiene que cumplir (capítulo 24).
3. **La función, en el paquete.** `nota_necesaria()`, con su documentación (capítulo 26).
4. **La app.** Una calculadora con deslizadores, dentro del paquete (capítulo 27).
5. **La documentación y la revisión.** Una viñeta, `check()` sin avisos y la app publicada en la web con Shinylive.

:::{important} Una herramienta se diseña desde quien la usa
Antes de escribir código hay que decidir qué pasa en los casos raros, porque son los primeros que encontrará alguien. ¿Y si el alumno ya ha aprobado aunque saque un 0? ¿Y si no puede aprobar ni con un 10? ¿Y si se equivoca al escribir los pesos? Cada respuesta es una decisión de diseño, y cada decisión, una prueba.
:::

## Construcción

### 1 · El cálculo

Con tres exámenes que pesan un 30 %, un 30 % y un 40 %, la nota final es

$$\text{final} = 0.3 \cdot e_1 + 0.3 \cdot e_2 + 0.4 \cdot e_3.$$

Si ya conocemos $e_1$ y $e_2$, la parte hecha es $0.3 \cdot e_1 + 0.3 \cdot e_2$, y para llegar a un objetivo, el último examen tiene que aportar lo que falta. Despejando:

$$e_3 = \frac{\text{objetivo} - (0.3 \cdot e_1 + 0.3 \cdot e_2)}{0.4}.$$

Con un 6 y un 4, la parte hecha es $1.8 + 1.2 = 3$, y para aprobar hacen falta $(5 - 3) / 0.4 = 5$ puntos en el último examen. Con un 3 y un 2, la parte hecha es 1.5, y hace falta un 8.75. Con un 2 y un 1, la parte hecha es 0.9, y harían falta 10.25 puntos: ni con un 10. Y con un 9 y un 8, la parte hecha ya es 5.1: el resultado sale negativo, $-0.25$, y en realidad significa que el alumno ya ha aprobado, saque lo que saque.

Tres decisiones de diseño salen de aquí:

- si el resultado es negativo, la función devuelve **0**: no hace falta nada;
- si pasa de 10, lo devuelve tal cual, **más de 10**: quien lo use sabrá que no se puede llegar, y cuánto falta;
- si los pesos no cuadran (no hay uno más que notas, o no suman 1), **se para con un error claro**, como `nota_final()` en el capítulo 24.

### 2 · Las pruebas, primero, y la función

En el paquete, escribimos primero las pruebas, una por cada decisión, y después la función. El visualizador enseña cada paso de verdad, ejecutado en una carpeta de prueba: las pruebas que fallan porque la función todavía no existe, la función que las hace pasar, la app, la viñeta y la revisión de `check()`.

:::{tip} Predice
En el paso 3 se pasan las pruebas antes de que exista la función. ¿Cuántas fallan? ¿Siguen pasando las de `nota_final()`? Y en el paso 8, `check()` encuentra un problema en un código que funciona perfectamente. ¿Qué podrá ser?
:::

```{anywidget} ../widgets/paquete.mjs
{"config":{"titulo":"De la prueba a la herramienta","etiqueta":"paquete notas","idea":"Primero las pruebas, que fallan; después la función, que las hace pasar; después la app y la viñeta. check() encuentra un problema que no se ve al usar el paquete, y se arregla antes de instalarlo.","guion":"29-proyecto-aula-1"},"archivo":"datos/paquetes/29-proyecto-aula-1.json"}
```

Las pruebas, en `tests/testthat/test-nota_necesaria.R`, dicen con código lo mismo que el apartado 1:

```r
test_that("nota_necesaria calcula lo que falta", {
  expect_equal(nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4)), 5)
  expect_equal(nota_necesaria(c(3, 2), c(0.3, 0.3, 0.4)), 8.75)
  expect_equal(nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4), objetivo = 7), 10)
})

test_that("nota_necesaria no baja de 0 y puede pasar de 10", {
  expect_equal(nota_necesaria(c(9, 8), c(0.3, 0.3, 0.4)), 0)
  expect_gt(nota_necesaria(c(2, 1), c(0.3, 0.3, 0.4)), 10)
})

test_that("nota_necesaria se para si faltan o sobran pesos", {
  expect_error(nota_necesaria(c(6, 4), c(0.5, 0.5)), "un peso más")
  expect_error(nota_necesaria(c(6, 4), c(0.3, 0.3, 0.3)), "no 1")
})
```

Al pasarlas sin la función, las tres pruebas nuevas fallan, y las de `nota_final()` siguen en verde. Es la manera de trabajar que se llama **desarrollo guiado por pruebas**: primero la prueba, que falla; después el código mínimo que la hace pasar. Así cada línea de la función existe porque una prueba la pide.

La función, ya con las pruebas pasando, hace esto paso a paso:

```{code-cell} r
nota_necesaria <- function(notas, pesos, objetivo = 5) {
  if (length(pesos) != length(notas) + 1) {
    stop("tiene que haber un peso más que notas: el del último examen")
  }
  if (abs(sum(pesos) - 1) > 1e-8) {
    stop("los pesos suman ", sum(pesos), ", no 1")
  }
  hecho <- sum(notas * pesos[seq_along(notas)])
  falta <- (objetivo - hecho) / pesos[length(pesos)]
  max(falta, 0)
}
nota_necesaria(c(6, 4), c(0.3, 0.3, 0.4))
nota_necesaria(c(9, 8), c(0.3, 0.3, 0.4))
nota_necesaria(c(6, 4), c(0.5, 0.5))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La nota que falta","etiqueta":"nota_necesaria()","idea":"Con un 6 y un 4, la parte hecha es 3 y hacen falta 5 puntos en el último examen. Con un 9 y un 8 la cuenta sale negativa, y max() la deja en 0: ya está aprobado. Con dos pesos para dos notas falta el del último examen, y la función se para."},"archivo":"datos/trazas/29-proyecto-aula-1.json"}
```

- `pesos[seq_along(notas)]` son los pesos de los exámenes ya hechos: los dos primeros. `pesos[length(pesos)]`, el del último.
- `hecho` es la parte de la nota final que ya se tiene, y `falta`, la nota que tiene que sacar en el último examen.
- `max(falta, 0)` es la primera decisión de diseño: con un 9 y un 8, la cuenta da $-0.25$, y la función devuelve 0.
- Con dos pesos para dos notas, la primera comprobación se cumple y la función se para con su mensaje: falta el peso del último examen.

### 3 · La app

Para que la use cualquiera, sin escribir código, la app de Shiny. En el paquete vive dentro de la función `calculadora()`, con `shiny::` delante de cada función de Shiny. Aquí está como un `app.R` suelto, con `nota_necesaria()` dentro, reducida al cálculo, para que se pueda abrir en el navegador con Shinylive:

```r
library(shiny)

nota_necesaria <- function(notas, pesos, objetivo = 5) {
  hecho <- sum(notas * pesos[seq_along(notas)])
  max((objetivo - hecho) / pesos[length(pesos)], 0)
}

ui <- fluidPage(
  titlePanel("¿Qué nota necesito?"),
  sliderInput("examen1", "Primer examen (30 %)", min = 0, max = 10, value = 6, step = 0.5),
  sliderInput("examen2", "Segundo examen (30 %)", min = 0, max = 10, value = 4, step = 0.5),
  sliderInput("objetivo", "Nota final que quiero", min = 5, max = 10, value = 5, step = 0.5),
  textOutput("necesito"),
  textOutput("consejo")
)

server <- function(input, output, session) {
  falta <- reactive({
    nota_necesaria(c(input$examen1, input$examen2), c(0.3, 0.3, 0.4), input$objetivo)
  })
  output$necesito <- renderText({
    paste("En el último examen (40 %) necesitas un", round(falta(), 2))
  })
  output$consejo <- renderText({
    if (falta() > 10) "Ni con un 10: este trimestre no llega."
    else if (falta() == 0) "Ya lo tienes, pase lo que pase."
    else "Se puede."
  })
}

shinyApp(ui, server)
```

```{anywidget} ../widgets/reactivo.mjs
{"config":{"titulo":"¿Qué nota necesito?","etiqueta":"la app","idea":"Las tres entradas alimentan una sola expresión reactiva, falta(), y las dos salidas la usan. Cada cambio hace caducar todo, y falta() se recalcula una sola vez. El consejo cambia según la nota necesaria pase de 10, sea 0 o quede entre medias.","cambios":[{"examen2":2},{"objetivo":8},{"examen1":10},{"objetivo":5}]},"archivo":"datos/reactivo/29-proyecto-aula-1.json"}
```

- Con un 6 y un 2, la nota necesaria sube a 6.5: «Se puede».
- Si el alumno quiere un 8, harían falta 14 puntos: «Ni con un 10».
- Con un 10 en el primer examen, sigue sin llegar al 8 (haría falta un 11).
- Y si se conforma con aprobar, le basta un 3.5.

Las dos salidas usan `falta()`, y el consejo traduce las decisiones de diseño a palabras: más de 10, imposible; 0, ya aprobado. El botón de abajo abre la app en tu navegador, para que pruebes tus propias notas.

### 4 · Documentarla y revisarla

Una herramienta que nadie sabe usar no sirve. El paquete lleva tres capas de documentación:

- la **ayuda** de cada función, `?nota_necesaria`, que roxygen2 escribe a partir de los comentarios `#'`;
- una **viñeta**, `vignette("notas")`, que cuenta en una página qué hace el paquete, con ejemplos que se ejecutan al construirla;
- y la propia **app**, que explica el resultado con palabras.

Y antes de darlo por terminado, `check()`. En este proyecto encontró un problema que no se ve al usar el paquete en nuestro ordenador: el código tenía caracteres que no son ASCII, la «ú» de «último» y la «¿» del título de la app. En un ordenador con otra codificación de caracteres podrían salir mal, y por eso un paquete los escribe con su código, `ú` y `¿`, que R convierte al leerlos. Con ese cambio, `check()` da 0 errores, 0 avisos y 0 notas. Es exactamente para lo que sirve: encontrar lo que el autor no ve.

Para compartirla, el paquete se instala desde GitHub con `pak::pak("usuario/notas")`, y la app, convertida con Shinylive, se cuelga en cualquier web, sin servidor: es lo que hace el botón del apartado anterior.

::::{div}
:class: afondo
### 5 · Lo que haría falta para un uso de verdad

**Más exámenes.** La app tiene tres exámenes y los pesos fijos, 30, 30 y 40. `nota_necesaria()` ya sirve para cualquier número de exámenes; la app podría pedir cuántos hay, con `numericInput()`, y crear un deslizador para cada uno con `renderUI()`, que fabrica entradas desde el servidor.

**Una prueba para la app.** Las pruebas de la función no prueban la app. `testServer()` (capítulo 27) sí:

```r
testServer(server, {
  session$setInputs(examen1 = 6, examen2 = 4, objetivo = 5)
  expect_equal(falta(), 5)
  session$setInputs(objetivo = 8)
  expect_equal(output$consejo, "Ni con un 10: este trimestre no llega.")
})
```

Con 6 y 4 y el objetivo en 8 harían falta $(8 - 3) / 0.4 = 12.5$ puntos, y el consejo es el de «Ni con un 10». En el paquete, esta prueba iría en `tests/testthat/test-calculadora.R`, con el servidor sacado de `calculadora()` a una función propia.

**Accesibilidad.** Un deslizador es difícil de manejar con el teclado o con un lector de pantalla. Para que la use todo el mundo conviene ofrecer también casillas para escribir la nota (`numericInput()`), etiquetas claras y un contraste de colores suficiente.

**Una web para el paquete.** `usethis::use_pkgdown()` y `pkgdown::build_site()` construyen una web con la ayuda de cada función, la viñeta y las novedades, que se puede publicar en GitHub Pages, como este libro.

**Los dos proyectos, juntos.** El proyecto 1 respondía una pregunta y la contaba en un informe; este construye una herramienta. Muchos trabajos reales son las dos cosas: un paquete con las funciones del análisis, sus pruebas, un informe que lo usa y una app para explorarlo.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La función del proyecto, con sus casos raros, en R, Python y Julia:

```r
nota_necesaria <- function(notas, pesos, objetivo = 5) {
  hecho <- sum(notas * pesos[seq_along(notas)])
  max((objetivo - hecho) / pesos[length(pesos)], 0)
}
```

```python
def nota_necesaria(notas, pesos, objetivo=5):
    hecho = sum(n * p for n, p in zip(notas, pesos))
    return max((objetivo - hecho) / pesos[-1], 0)
```

```julia
function nota_necesaria(notas, pesos; objetivo = 5)
    hecho = sum(notas .* pesos[1:length(notas)])
    max((objetivo - hecho) / pesos[end], 0)
end
```

En Python, `zip()` empareja cada nota con su peso y se para en la lista más corta, así que el peso del último examen queda fuera solo; `pesos[-1]` es el último. En Julia, `.*` multiplica elemento a elemento, como `*` con vectores en R, y `pesos[end]` es el último; el objetivo va después del punto y coma, como argumento con nombre. Con un 6 y un 4, las tres dan 5.
:::

## Conexiones

- **Funciones y errores** (capítulos 5 y 24): `nota_necesaria()` comprueba sus argumentos y se para con un mensaje claro.
- **Pruebas** (capítulo 24): esta vez, escritas antes que la función.
- **Paquetes** (capítulo 26): la función, su ayuda, sus pruebas, la viñeta y la app, en el paquete `notas`, con `check()` sin avisos.
- **Informes** (capítulo 25): la viñeta es un documento de R Markdown que se ejecuta al construir el paquete.
- **Shiny** (capítulo 27): la calculadora, con una expresión reactiva, y publicada con Shinylive.
- **Decimales** (capítulo 1): `expect_equal()` compara con tolerancia, porque $(5 - 3)/0.4$ puede no dar 5 exacto en coma flotante.

## Y ahora

Aquí termina el libro. Empezó con R como calculadora, `2 + 3`, y termina con una herramienta probada, documentada y publicada que cualquiera puede usar desde el navegador. Por el camino, cada programa se ha visto ejecutarse, paso a paso, con su memoria a la vista: la idea de toda la colección es que programar se entiende mirando cómo piensa el código.

Lo que viene ya no está en un libro: tus propias preguntas, con tus propios datos. Y para practicar, el **laboratorio**, donde puedes escribir cualquier programa de R y verlo ejecutarse igual que los del libro.

## Ejercicios

1. **A mano.** Con un 7 en el primer examen y un 5 en el segundo (30 % cada uno), ¿qué nota hace falta en el último (40 %) para aprobar? ¿Y para sacar un 7?

2. **Una prueba más.** Escribe una comprobación que vigile que, si el alumno ya ha sacado 10 en los dos primeros exámenes, `nota_necesaria()` devuelve 0 para cualquier objetivo hasta 6.

3. **Cuatro exámenes.** Con cuatro exámenes de pesos 0.2, 0.2, 0.2 y 0.4, y notas 5, 6 y 7 en los tres primeros, ¿qué devuelve `nota_necesaria(c(5, 6, 7), c(0.2, 0.2, 0.2, 0.4))`?

4. **El orden de las comprobaciones.** ¿Qué pasaría si `nota_necesaria()` comprobara que los pesos suman 1 antes de comprobar cuántos hay? Pista: prueba con `c(6, 4)` y `c(0.5, 0.5)`.

5. **Otro consejo.** Cambia la app para que, si la nota necesaria está entre 8 y 10, diga «Se puede, pero hay que apretar».

6. **¿Por qué no `==`?** En la app, `falta() == 0` compara un decimal con `==`, algo que en el capítulo 1 aprendimos a evitar. ¿Por qué aquí no hay problema?

:::{div}
:class: afondo
7. **La prueba de la app.** Con `testServer()`, comprueba que, con un 10 y un 10 en los dos primeros exámenes y el objetivo en 5, el consejo es «Ya lo tienes, pase lo que pase».

8. **Sin `max()`.** Si quitáramos el `max(falta, 0)` de `nota_necesaria()`, ¿qué prueba fallaría? ¿Y qué diría la app con un 9 y un 8?
:::

## Solucionario

1. La parte hecha es $0.3 \cdot 7 + 0.3 \cdot 5 = 3.6$. Para aprobar, $(5 - 3.6) / 0.4 = 3.5$. Para un 7, $(7 - 3.6) / 0.4 = 8.5$.
2. Por ejemplo, `expect_equal(nota_necesaria(c(10, 10), c(0.3, 0.3, 0.4), objetivo = 6), 0)`: la parte hecha ya es 6, así que para un objetivo de 6, o menos, no hace falta nada.
3. La parte hecha es $0.2 \cdot 5 + 0.2 \cdot 6 + 0.2 \cdot 7 = 3.6$, y hace falta $(5 - 3.6) / 0.4 = 3.5$.
4. Con `c(0.5, 0.5)`, los pesos suman 1, así que esa comprobación pasaría; la otra, la del número de pesos, se seguiría ejecutando después y pararía la función igual. Pero con `c(0.5, 0.6)`, el mensaje sería «los pesos suman 1.1, no 1», que no dice cuál es el problema de verdad: que falta el peso del último examen. Por eso se comprueba primero lo más básico, cuántos pesos hay, y después sus valores.
5. Añadiendo un caso antes del último: `else if (falta() >= 8) "Se puede, pero hay que apretar."`. Como los casos se comprueban en orden, el de «más de 10» va primero, y el de 0, antes que este.
6. Porque, cuando el alumno ya ha llegado, `falta()` no es el resultado de una cuenta con decimales: es el 0 exacto que pone `max()`. El caso delicado sería que la parte hecha fuera justo el objetivo: entonces la cuenta podría dar un número diminuto en lugar de 0, como en el capítulo 1, y la app diría «Se puede» con una nota necesaria de 0 al redondear. Una prueba en esa frontera lo descubriría.

:::{div}
:class: afondo
7. Por ejemplo:

   ```r
   testServer(server, {
     session$setInputs(examen1 = 10, examen2 = 10, objetivo = 5)
     expect_equal(falta(), 0)
     expect_equal(output$consejo, "Ya lo tienes, pase lo que pase.")
   })
   ```

   La parte hecha es 6, más que el objetivo, así que `falta()` es 0.
8. Fallaría la prueba de «no baja de 0»: con un 9 y un 8 la función devolvería $-0.25$. Y la app diría «En el último examen (40 %) necesitas un -0.25» y «Se puede.»: un resultado absurdo para quien la usa. La prueba existe justamente para que ese cambio no pase desapercibido.
:::
