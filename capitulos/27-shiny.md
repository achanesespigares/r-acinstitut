---
title: "Shiny: un análisis que responde"
subtitle: Aplicaciones web interactivas con R, sin saber HTML ni JavaScript
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Una hoja de cálculo tiene algo que los informes del capítulo 25 no tienen: cambias una celda y todas las que dependen de ella se recalculan solas, al momento. La celda de la nota final usa las de los exámenes; si corriges un examen, la nota final cambia, y con ella la celda que dice «aprobado» o «suspendido». Y las celdas que no dependen del examen ni se mueven.

Un informe, en cambio, es una foto: para ver otra isla hay que volver a generarlo. La profesora del capítulo 25 quería otra cosa: una página donde cada alumno mueva un deslizador con la nota de cada examen y vea al momento su nota final, como en una hoja de cálculo, pero sin ver ni una fórmula.

## La pregunta

¿Se puede convertir un análisis de R en una página web con deslizadores, botones y gráficos que respondan al momento? ¿Cómo se escribe, sin saber HTML ni JavaScript? Y cuando quien la usa mueve un deslizador, ¿qué parte del código vuelve a ejecutarse, y cómo sabe R cuál?

## La idea

**Shiny** es un paquete de R para hacer aplicaciones web. Una app tiene dos partes:

- la **interfaz** (`ui`): lo que se ve. Las **entradas**, como `sliderInput()`, recogen lo que hace quien la usa; las **salidas**, como `textOutput()` o `plotOutput()`, reservan el sitio donde aparecerán los resultados;
- el **servidor** (`server`): una función que calcula esos resultados. Lee las entradas en `input$examen1` y escribe las salidas en `output$nota`, con una función `render…()` para cada tipo: `renderText()`, `renderPlot()`, `renderTable()`.

`shinyApp(ui, server)` junta las dos partes y pone la app en marcha.

Lo nuevo es cómo se ejecuta el servidor. No va de arriba abajo, como un programa: es una lista de **relaciones**. `output$nota` depende de `input$examen1`; Shiny lo apunta, y cada vez que esa entrada cambia, vuelve a calcular esa salida, y solo esa. Es la **reactividad**, como en la hoja de cálculo. Y cuando un mismo cálculo lo necesitan varias salidas, se escribe una vez con `reactive()`, una **expresión reactiva**: una celda intermedia que se calcula una vez y que las demás reutilizan.

:::{important} Una app es un grafo, no un guion
Las entradas alimentan expresiones reactivas, y estas, las salidas. Cuando cambia una entrada, Shiny hace dos cosas: primero marca como **caducado** todo lo que depende de ella; después vuelve a calcular lo caducado, y nada más. Por eso una app con decenas de salidas responde rápido: solo se recalcula lo que ha cambiado.
:::

## Construcción

### 1 · La calculadora de notas

Este es el programa estrella del capítulo: la app que pedía la profesora. Tres deslizadores (los dos exámenes y el peso del primero), una expresión reactiva con la nota, dos textos y un gráfico de barras con los dos exámenes.

:::{tip} Predice
Mira el gráfico: dibuja los dos exámenes, pero no la nota final. Si mueves el deslizador del **peso**, ¿se vuelve a dibujar el gráfico? ¿Y si mueves el del segundo examen? ¿Cuántas veces se calcula la nota cuando cambia un examen, si la usan dos salidas?
:::

```r
library(shiny)

nota_final <- function(notas, pesos) sum(notas * pesos)

ui <- fluidPage(
  titlePanel("Mi nota final"),
  sliderInput("examen1", "Primer examen", min = 0, max = 10, value = 6, step = 0.5),
  sliderInput("examen2", "Segundo examen", min = 0, max = 10, value = 8, step = 0.5),
  sliderInput("peso", "Peso del primer examen", min = 0, max = 1, value = 0.4, step = 0.1),
  textOutput("nota"),
  textOutput("veredicto"),
  plotOutput("barras", height = "250px")
)

server <- function(input, output, session) {
  nota <- reactive({
    nota_final(c(input$examen1, input$examen2), c(input$peso, 1 - input$peso))
  })
  output$nota <- renderText({
    paste("Tu nota final es", round(nota(), 2))
  })
  output$veredicto <- renderText({
    if (nota() >= 5) "Apruebas" else "Suspendes"
  })
  output$barras <- renderPlot({
    barplot(c(input$examen1, input$examen2), names.arg = c("Examen 1", "Examen 2"),
            ylim = c(0, 10), col = "#7A1F36")
  })
}

shinyApp(ui, server)
```

```{anywidget} ../widgets/reactivo.mjs
{"config":{"titulo":"La calculadora de notas","etiqueta":"reactividad","idea":"Cada cambio de un deslizador se ve en dos pasos. Primero, todo lo que depende de él se marca como caducado; después, Shiny lo vuelve a calcular, en el orden que marcan los números. Lo que no depende de esa entrada no se toca.","cambios":[{"peso":0.7},{"examen2":3},{"examen1":2}]},"archivo":"datos/reactivo/27-shiny-1.json"}
```

La función `nota_final()` es la del capítulo 24, reducida a su cálculo. Después, paso a paso:

- **La interfaz** tiene un título, tres deslizadores y tres huecos para salidas. Cada pieza tiene un nombre, su **identificador**: `"examen1"`, `"nota"`… Con él se conectan las dos partes: el deslizador `"examen1"` se lee en el servidor como `input$examen1`, y lo que el servidor escribe en `output$nota` aparece en el hueco `textOutput("nota")`.
- **`nota <- reactive({...})`** es la expresión reactiva. Lee las tres entradas y calcula la nota. Se usa como una función, `nota()`, y guarda su resultado hasta que alguna de sus entradas cambia.
- **Las tres salidas.** `output$nota` y `output$veredicto` usan `nota()`; `output$barras` lee directamente los dos exámenes.

En el visualizador se ve el **grafo reactivo** de la app: las tres entradas a la izquierda, `nota()` en medio y las tres salidas a la derecha, con flechas que dicen quién depende de quién. Y se ve qué pasa con cada cambio:

- **Al arrancar**, Shiny calcula todas las salidas. La primera que necesita `nota()` la calcula; la segunda la encuentra calculada.
- **El peso pasa a 0.7.** Caducan `nota()`, `output$nota` y `output$veredicto`, pero no `output$barras`: el gráfico no lee el peso, así que no se vuelve a dibujar. La nota pasa a $6 \cdot 0.7 + 8 \cdot 0.3 = 6.6$.
- **El segundo examen pasa a 3.** Ahora caduca todo, también el gráfico, que lee ese examen. Nota: 5.1, todavía «Apruebas».
- **El primer examen pasa a 2.** Otra vez todo: 2.3, «Suspendes».

En los tres cambios, `nota()` se calcula **una sola vez**, aunque la usen dos salidas: esa es la ventaja de una expresión reactiva. El visualizador no se lo inventa: estos datos salen de ejecutar la app de verdad, cambiándole los deslizadores, y apuntar qué se ejecutaba. Y el botón de debajo abre la app funcionando, en tu navegador, para que la muevas tú.

### 2 · Entradas y salidas

Shiny trae entradas para casi todo, y cada una da un tipo de valor en `input$…`:

| Entrada | Qué es | Qué da en `input$` |
|---|---|---|
| `sliderInput()` | un deslizador | un número |
| `numericInput()` | una casilla para escribir un número | un número |
| `selectInput()` | una lista desplegable | un texto (la opción elegida) |
| `checkboxInput()` | una casilla de verificación | `TRUE` o `FALSE` |
| `dateInput()` | un calendario | una fecha |
| `actionButton()` | un botón | cuántas veces se ha pulsado |

Y cada salida va en pareja: un hueco en la interfaz y una función `render…()` en el servidor, con el mismo identificador.

| En la interfaz | En el servidor | Qué enseña |
|---|---|---|
| `textOutput("x")` | `output$x <- renderText(...)` | un texto |
| `plotOutput("x")` | `output$x <- renderPlot(...)` | un gráfico, también de ggplot2 |
| `tableOutput("x")` | `output$x <- renderTable(...)` | una tabla (un data frame) |
| `verbatimTextOutput("x")` | `output$x <- renderPrint(...)` | lo que escribiría la consola |

El error más común al empezar es que el identificador no coincida: `textOutput("nota")` en la interfaz y `output$notas` en el servidor. Shiny no da ningún error: el hueco se queda vacío.

### 3 · ¿Por qué `reactive()`?

Se podría escribir la app sin `reactive()`, calculando la nota dentro de cada salida:

```r
library(shiny)

nota_final <- function(notas, pesos) sum(notas * pesos)

ui <- fluidPage(
  sliderInput("examen1", "Primer examen", min = 0, max = 10, value = 6, step = 0.5),
  sliderInput("examen2", "Segundo examen", min = 0, max = 10, value = 8, step = 0.5),
  sliderInput("peso", "Peso del primer examen", min = 0, max = 1, value = 0.4, step = 0.1),
  textOutput("nota"),
  textOutput("veredicto")
)

server <- function(input, output, session) {
  output$nota <- renderText({
    nota <- nota_final(c(input$examen1, input$examen2), c(input$peso, 1 - input$peso))
    paste("Tu nota final es", round(nota, 2))
  })
  output$veredicto <- renderText({
    nota <- nota_final(c(input$examen1, input$examen2), c(input$peso, 1 - input$peso))
    if (nota >= 5) "Apruebas" else "Suspendes"
  })
}

shinyApp(ui, server)
```

```{anywidget} ../widgets/reactivo.mjs
{"config":{"titulo":"Sin expresión reactiva","etiqueta":"repetir el cálculo","idea":"Funciona igual, pero cada salida lee las tres entradas y calcula la nota por su cuenta: al mover el peso, la nota se calcula dos veces, una dentro de cada salida.","cambios":[{"peso":0.7}]},"archivo":"datos/reactivo/27-shiny-2.json"}
```

Funciona igual: mismos textos, mismos resultados. Pero el grafo es distinto: cada salida depende de las tres entradas y hace el cálculo por su cuenta, así que al mover el peso la nota se calcula **dos veces**. Con una suma no se nota; con un modelo que tarda un segundo, la app tardaría el doble. Y hay otro problema, el de siempre: el mismo cálculo escrito dos veces. Si un día cambia la fórmula, hay que acordarse de cambiarla en los dos sitios. `reactive()` es a Shiny lo que una función es a un programa (capítulo 5): escribir una vez, usar muchas.

### 4 · Ponerla en marcha y compartirla

En tu ordenador, una app se pone en marcha ejecutando `shinyApp(ui, server)` en la consola, o con el botón **Run App** de RStudio si está en un archivo `app.R`. R abre la app en el navegador y se queda esperando: es el servidor, y mientras la app esté abierta, cada movimiento de un deslizador viaja a R, que calcula y devuelve los resultados.

Para que la use otra gente, la app tiene que estar en un servidor con R. Hay servicios que lo hacen por ti, como shinyapps.io, de Posit, y también se puede montar un servidor propio con Shiny Server.

Hay un tercer camino, el del botón del apartado 1: **Shinylive**. La app se ejecuta entera en el navegador, con webR, la misma versión de R para el navegador que usa el laboratorio de este libro, así que no hace falta ningún servidor con R detrás: basta con una página web. El paquete shinylive convierte una app en una página así con `shinylive::export("miapp", "sitio")`. A cambio, la primera vez tarda unos segundos en cargar R, y no todos los paquetes funcionan en el navegador.

::::{div}
:class: afondo
### 5 · Botones, efectos y pruebas

**Calcular solo al pulsar.** A veces no conviene recalcular con cada movimiento: si el cálculo tarda, la app se atasca mientras el usuario arrastra el deslizador. Con un botón, `actionButton("calcular", "Calcular")`, y `eventReactive()` en lugar de `reactive()`, la nota solo se recalcula al pulsar:

```r
nota <- eventReactive(input$calcular, {
  nota_final(c(input$examen1, input$examen2), c(input$peso, 1 - input$peso))
})
```

`eventReactive()` depende únicamente de su primer argumento, el botón: mover los deslizadores ya no hace caducar `nota()`. Con 6 y 8 y peso 0.4, al pulsar sale 7.2; si se mueve el primer examen a 2, sigue diciendo 7.2 hasta que se vuelve a pulsar, y entonces dice 5.6.

**Hacer cosas, no calcular valores.** `reactive()` y `render…()` calculan algo para enseñarlo. Para hacer algo con un efecto, como guardar un archivo o enviar un aviso cuando se pulsa un botón, están `observe()` y `observeEvent()`: se ejecutan cuando cambian sus entradas, pero no devuelven nada. Y dos ayudas que se usan mucho: `req(input$x)` para que una salida espere a que haya un valor, y `isolate()` para leer una entrada sin depender de ella.

**Probar una app.** Una app también se prueba, con las ideas del capítulo 24. `shiny::testServer()` ejecuta el servidor sin navegador: se le cambian las entradas con `session$setInputs()` y se comprueban las expresiones reactivas y las salidas:

```r
library(testthat)
testServer(server, {
  session$setInputs(examen1 = 6, examen2 = 8, peso = 0.4)
  expect_equal(nota(), 7.2)
  expect_equal(output$nota, "Tu nota final es 7.2")
  session$setInputs(examen2 = 2)
  expect_equal(output$veredicto, "Suspendes")
})
```

Con el segundo examen en 2, la nota es $6 \cdot 0.4 + 2 \cdot 0.6 = 3.6$, y el veredicto, «Suspendes»: la prueba pasa. Con `testServer()` se han generado los datos del visualizador de este capítulo: cambiando entradas y apuntando qué se ejecutaba.

**Apps grandes.** Cuando una app crece, se parte en **módulos**, trozos de interfaz y de servidor que se reutilizan, como funciones; y se puede meter en un paquete (capítulo 26), con sus pruebas. Para el aspecto, el paquete bslib trae diseños modernos, como `page_sidebar()`, con los controles en una barra lateral, y temas de colores.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Shiny existe también para Python, con el mismo modelo reactivo y otros nombres. La calculadora, reducida a un texto:

```r
nota <- reactive({
  input$examen1 * input$peso + input$examen2 * (1 - input$peso)
})
output$texto <- renderText({
  paste("Tu nota final es", round(nota(), 2))
})
```

```python
@reactive.calc
def nota():
    return input.examen1() * input.peso() + input.examen2() * (1 - input.peso())

@render.text
def texto():
    return f"Tu nota final es {round(nota(), 2)}"
```

En R, las entradas se leen como `input$examen1`; en Python, se llaman como funciones, `input.examen1()`. La expresión reactiva es una función con el decorador `@reactive.calc`, y cada salida, una función con `@render.text`, cuyo nombre es el identificador del hueco en la interfaz. En Julia, uno de los entornos más conocidos para apps web interactivas es Genie, que sigue la misma idea de entradas y salidas reactivas, con su propia sintaxis.
:::

## Conexiones

- La reactividad es la idea de las **funciones** (capítulo 5) llevada al tiempo: `reactive()` es un cálculo escrito una vez, que se repite solo cuando cambian sus datos.
- Las salidas de una app son las de siempre: textos, tablas de **dplyr** (capítulo 13) y gráficos de **ggplot2** (capítulo 15), dentro de una función `render…()`.
- Una app se **prueba** con `testServer()` y las expectativas de testthat (capítulo 24), y se puede **empaquetar** (capítulo 26).
- Un **informe** de Quarto (capítulo 25) es una foto que se regenera; una app de Shiny responde en directo. Y Quarto puede llevar dentro trozos de Shiny, para documentos que mezclan las dos cosas.
- Shinylive usa webR, el mismo R para el navegador que el **laboratorio** del libro.

## La grieta

Con este capítulo se cierra la parte V, y con ella el recorrido por R: de la calculadora del capítulo 1 a una aplicación web que responde al momento, pasando por los vectores, las tablas, los gráficos, los modelos, los entornos, las funciones que avisan, los informes y los paquetes. Pero cada capítulo ha mirado una pieza. ¿Qué pasa cuando hay que juntarlas todas para responder una pregunta de verdad, desde unos datos crudos hasta un resultado que otra persona pueda usar? Eso es un [**proyecto**](28-proyecto-pinguinos.md), y es lo que viene ahora.

## Ejercicios

1. **Quién depende de quién.** En la app del apartado 1, si añades una salida `output$media <- renderText(mean(c(input$examen1, input$examen2)))`, ¿qué entradas la hacen caducar? ¿Y el peso?

2. **El hueco vacío.** Una app tiene `textOutput("resultado")` en la interfaz y `output$resultados <- renderText(...)` en el servidor. ¿Qué se ve en la página? ¿Por qué no da ningún error?

3. **Predice el veredicto.** En la app del apartado 1, con los deslizadores en 6, 8 y 0.4, mueves el peso a 1. ¿Qué dicen los dos textos? ¿Se vuelve a dibujar el gráfico?

4. **Una entrada nueva.** Añade a la app un `numericInput("aprobado", "Nota para aprobar", value = 5)`, y haz que el veredicto use ese valor en lugar del 5. ¿Qué salidas caducan ahora al cambiar ese número?

5. **Sin `reactive()`, ¿cuántas veces?** En la app del apartado 3, sin expresión reactiva, ¿cuántas veces se ejecuta `nota_final()` al arrancar? ¿Y en la del apartado 1?

6. **Compartir.** Quieres que tus alumnos usen la app desde casa, sin instalar R. Explica dos maneras de conseguirlo y una ventaja de cada una.

:::{div}
:class: afondo
7. **Con botón.** En la versión con `eventReactive()` del apartado 5, con 6, 8 y 0.4 y un primer clic en «Calcular», mueves el segundo examen a 10 y el peso a 0.5, sin pulsar. ¿Qué dice la app? ¿Y después de pulsar?

8. **Una prueba en la frontera.** Escribe con `testServer()` una prueba que compruebe que, con 5, 5 y peso 0.3, la app dice «Apruebas». ¿Por qué es una prueba especialmente útil?
:::

## Solucionario

1. Los dos exámenes: `output$media` lee `input$examen1` e `input$examen2`. El peso no le afecta, porque no lo lee; al moverlo, `output$media` no se vuelve a calcular.
2. El hueco se queda vacío. Shiny conecta las dos partes por el identificador, y `"resultado"` no es `"resultados"`: el servidor calcula una salida que nadie enseña, y el hueco no recibe nada. No es un error de R, así que no hay mensaje; por eso conviene revisar los identificadores con cuidado.
3. Con peso 1 cuenta solo el primer examen: «Tu nota final es 6» y «Apruebas». El gráfico no se vuelve a dibujar, porque no lee el peso.
4. En el servidor, `if (nota() >= input$aprobado) "Apruebas" else "Suspendes"`. Al cambiar ese número solo caduca `output$veredicto`: ni `nota()` ni las otras salidas lo leen.
5. Al arrancar, dos veces en la app sin `reactive()`, una por cada salida que la calcula; en la del apartado 1, una sola vez, dentro de `nota()`, que las dos salidas comparten.
6. Por ejemplo: publicarla en un servidor con R, como shinyapps.io, que funciona con cualquier paquete y carga rápido; o convertirla en una página con Shinylive, que no necesita ningún servidor con R y se puede colgar en cualquier web, a cambio de tardar unos segundos en cargar la primera vez.

:::{div}
:class: afondo
7. Sigue diciendo 7.2: sin pulsar, `nota()` no caduca, aunque los deslizadores hayan cambiado. Al pulsar, $6 \cdot 0.5 + 10 \cdot 0.5 = 8$: «Tu nota final es 8».
8. Por ejemplo:

   ```r
   testServer(server, {
     session$setInputs(examen1 = 5, examen2 = 5, peso = 0.3)
     expect_equal(nota(), 5)
     expect_equal(output$veredicto, "Apruebas")
   })
   ```

   Es una prueba en la **frontera**, como la de `aprobado()` en el capítulo 24: la nota es exactamente 5, y el veredicto depende de que la app use `>=` y no `>`. Además, la nota sale de multiplicar y sumar decimales, $5 \cdot 0.3 + 5 \cdot 0.7$: aquí da 5 exacto, porque `sum()` suma con mucho cuidado, pero con otras operaciones podría quedar a un pelo por debajo (capítulo 1), y la prueba lo descubriría.
:::
