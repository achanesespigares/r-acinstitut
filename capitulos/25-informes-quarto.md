---
title: "Informes con Quarto: el análisis que se escribe solo"
subtitle: Texto, código y resultados en un mismo documento, que se vuelve a generar cuando cambian los datos
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Una profesora prepara cada trimestre el informe de su grupo: la media de la clase, cuántos han aprobado, un gráfico con las notas. Lo hace así: calcula en R, copia los números a un documento de texto, exporta el gráfico como imagen y lo pega. Una tarde de trabajo. Y entonces un alumno reclama un examen, la nota cambia, y hay que repetirlo todo: calcular, copiar, exportar, pegar. Peor aún: si se olvida de cambiar un número, el informe dice una cosa y los datos, otra.

Un recetario impreso tiene el mismo problema: si cambias la receta, hay que reimprimir. Pero imagina una receta que se cocinara sola al abrirla, con los ingredientes que tienes hoy en la nevera. Eso es un informe **reproducible**.

## La pregunta

Hasta ahora, el código vivía en un sitio (la consola, un archivo `.R`) y las explicaciones, en otro. ¿Se puede escribir un único documento que tenga **a la vez** el texto que explica, el código que calcula y los resultados, números y gráficos? ¿Que se vuelva a generar con una orden cuando cambian los datos, sin copiar nada a mano? ¿Y que sirva igual para Biscoe que para Dream, cambiando solo el nombre de la isla?

## La idea

**Quarto** es un programa que convierte un documento `.qmd` en un informe: una página web, un PDF, un documento de Word, unas diapositivas. Un `.qmd` tiene tres ingredientes:

- una **cabecera YAML**, entre dos líneas `---`, con el título, el formato y otras opciones;
- **texto en Markdown**, el formato sencillo de siempre: `##` para un título, `**negrita**`, listas con guiones;
- **bloques de código**, que empiezan por ` ```{r} ` y terminan con ` ``` `. Al principio de cada bloque, las líneas que empiezan por `#|` son sus **opciones**: si se enseña el código, si se ejecuta, qué pie lleva el gráfico.

Y dentro del texto, el **código en línea**: `` `{r} nrow(isla)` `` se sustituye por su valor, 168, al generar el informe.

Para generarlo, Quarto le pasa el R a **knitr**, que ejecuta los bloques uno detrás de otro, en orden, y recoge lo que escriben y lo que dibujan. Después, el programa **pandoc** lo junta todo en el formato pedido. Desde la terminal, la orden es `quarto render informe.qmd`; en RStudio o en Positron, el botón **Render**.

:::{important} Un documento empieza de cero
Cada vez que Quarto genera un informe, abre una **sesión de R nueva y vacía**, y ejecuta los bloques **de arriba abajo**. No ve nada de lo que tengas en tu consola. Por eso un informe es reproducible: todo lo que necesita está escrito en él. Y por eso, si funciona, funcionará igual mañana, en otro ordenador o con otros datos.
:::

## Construcción

### 1 · Un informe que se escribe solo

Este es el documento estrella del capítulo: un informe sobre los pingüinos de una isla. Tiene la cabecera, un bloque que prepara los datos y no enseña nada, un título y un párrafo con código en línea, una tabla de especies, un gráfico con su pie y un párrafo final que cita el gráfico.

:::{tip} Predice
Hay cuatro bloques de código, pero no todos dejan lo mismo en el informe. ¿Qué entra en el informe del primer bloque, el que tiene `#| include: false`? ¿Y del bloque del gráfico, que tiene `#| echo: false`? ¿En qué orden aparecen las cosas?
:::

````qmd
---
title: "Los pingüinos de una isla"
lang: es
format: html
params:
  isla: "Biscoe"
---

```{r}
#| include: false
library(dplyr)
library(ggplot2)
pinguinos <- read.csv("datos/pinguinos.csv")
isla <- filter(pinguinos, isla == params$isla)
```

## La isla `{r} params$isla`

En la isla `{r} params$isla` se midieron `{r} nrow(isla)` pingüinos. Estas son sus especies:

```{r}
count(isla, especie)
```

```{r}
#| label: fig-masa
#| fig-cap: "Masa corporal por especie"
#| echo: false
#| warning: false
ggplot(isla, aes(especie, masa_corporal_g)) +
  geom_boxplot()
```

La masa media es de `{r} round(mean(isla$masa_corporal_g, na.rm = TRUE))` gramos, y cada especie se reparte como en la @fig-masa.
````

```{anywidget} ../widgets/informe.mjs
{"config":{"titulo":"Un informe que se escribe solo","etiqueta":"quarto render","idea":"Quarto lee la cabecera, abre una sesión de R vacía y recorre el documento de arriba abajo. Cada bloque de código se ejecuta en esa sesión; sus opciones deciden qué entra en el informe. El texto pasa tal cual, con el código en línea ya convertido en su valor."},"archivo":"datos/informes/25-informes-quarto-1.json"}
```

Paso a paso, el informe se construye así:

- **La cabecera** dice el título, el idioma (`lang: es`, para que ponga «Figura» y no «Figure»), el formato (`html`) y un **parámetro**, `isla`, que vale `"Biscoe"`. En el código se lee como `params$isla`.
- **El primer bloque** carga los paquetes, lee los datos y se queda con los pingüinos de la isla. Tiene `#| include: false`: se ejecuta, y en la sesión aparecen `pinguinos` e `isla`, pero en el informe **no entra nada**.
- **El título y el párrafo** son Markdown. Antes de pasarlos al informe, Quarto calcula el código en línea: `` `{r} nrow(isla)` `` se convierte en 168. En el `.qmd` no hay ningún número escrito a mano.
- **El bloque de `count()`** no tiene opciones: en el informe entran el código y la tabla que escribe.
- **El bloque del gráfico** tiene cuatro opciones. `echo: false` deja el gráfico sin el código; `label: fig-masa` y `fig-cap` le dan número y pie, «Figura 1: Masa corporal por especie»; y `warning: false` quita un aviso de ggplot2, que se queja de un pingüino sin dato de masa. Sin esa opción, el aviso aparecería en el informe, encima del gráfico.
- **El último párrafo** calcula la masa media, 4716 gramos, y cita el gráfico con `@fig-masa`, que en el informe se convierte en «Figura 1».

Al final, pandoc lo convierte todo en una página web, `informe.html`. Si mañana se corrige un dato del archivo, basta con volver a ejecutar `quarto render informe.qmd`: los números, la tabla y el gráfico se recalculan solos.

### 2 · Cada bloque, con sus opciones

Las opciones `#|` deciden, bloque a bloque, qué se ejecuta y qué se ve. Las más usadas son cuatro:

| Opción | Se ejecuta | Entra el código | Entra lo que escribe |
|---|---|---|---|
| ninguna | sí | sí | sí |
| `#| echo: false` | sí | no | sí |
| `#| eval: false` | no | sí | no |
| `#| include: false` | sí | no | no |

Este informe las prueba todas:

````qmd
---
title: "Opciones de los bloques"
lang: es
format: html
---

```{r}
notas <- c(6, 8, 4.5, 9)
mean(notas)
```

```{r}
#| echo: false
max(notas)
```

```{r}
#| eval: false
install.packages("quarto")
```

```{r}
#| include: false
aprobadas <- sum(notas >= 5)
```

Aprobaron `{r} aprobadas` de `{r} length(notas)` alumnos.
````

```{anywidget} ../widgets/informe.mjs
{"config":{"titulo":"Qué entra en el informe","etiqueta":"opciones #|","idea":"El primer bloque deja código y resultado; el segundo, solo el resultado; el tercero, solo el código, porque no se ejecuta; el cuarto no deja nada, pero crea aprobadas, que el texto usa después."},"archivo":"datos/informes/25-informes-quarto-2.json"}
```

- El primer bloque, sin opciones, deja en el informe su código y lo que escribe: `[1] 6.875`.
- `echo: false` deja solo el resultado, `[1] 9`. Es lo habitual en un informe para gente que no programa: los resultados, sin el código.
- `eval: false` hace lo contrario: el código entra en el informe, pero **no se ejecuta**. Sirve para enseñar código que no conviene ejecutar al generar el informe, como una instalación.
- `include: false` se ejecuta y no deja nada. Pero lo que crea se queda en la sesión: el texto final usa `aprobadas`, que vale 3.

Si casi todos los bloques llevan la misma opción, se puede poner una sola vez en la cabecera, para todo el documento. Con `execute:` y, debajo, `echo: false`, ningún bloque enseña su código, salvo los que digan `#| echo: true`.

### 3 · Un documento empieza de cero

Este informe funciona en la consola de su autora, pero Quarto no consigue generarlo:

````qmd
---
title: "Notas del grupo"
lang: es
format: html
---

La media del grupo es `{r} mean(notas)`.

```{r}
notas <- c(6, 8, 4.5, 9)
```
````

```{anywidget} ../widgets/informe.mjs
{"config":{"titulo":"Quarto se detiene","etiqueta":"orden","idea":"El párrafo usa notas antes de que el bloque de abajo la cree. En la consola de la autora notas existía, porque la había creado antes; pero Quarto empieza con una sesión vacía y recorre el documento en orden. Al llegar al párrafo, notas todavía no existe."},"archivo":"datos/informes/25-informes-quarto-3.json"}
```

La autora había creado `notas` en su consola, así que al probar el código en línea, todo funcionaba. Pero Quarto abre una sesión **vacía** y avanza **en orden**: al llegar al párrafo, `notas` todavía no existe, porque el bloque que la crea está más abajo. R da el error «objeto 'notas' no encontrado» y Quarto se detiene sin generar el informe.

El arreglo es poner el bloque **antes** del párrafo que lo usa. Y la lección vale para cualquier informe: si funciona en tu consola pero no al generarlo, casi siempre es porque usa algo que no está escrito en el documento, o que está escrito más abajo. Para comprobarlo antes, en RStudio se puede reiniciar R y ejecutar los bloques en orden, de arriba abajo, igual que hará Quarto.

### 4 · El mismo informe para cada isla

El informe del apartado 1 tiene un parámetro, `isla`. Para generarlo con otra isla no hace falta tocar el `.qmd`: el valor se cambia al generarlo. Desde la terminal:

```text
quarto render informe.qmd -P isla:Dream
```

Y desde R, con el paquete quarto:

```r
quarto::quarto_render("informe.qmd", execute_params = list(isla = "Dream"))
```

:::{dropdown} El documento, otra vez
````qmd
---
title: "Los pingüinos de una isla"
lang: es
format: html
params:
  isla: "Biscoe"
---

```{r}
#| include: false
library(dplyr)
library(ggplot2)
pinguinos <- read.csv("datos/pinguinos.csv")
isla <- filter(pinguinos, isla == params$isla)
```

## La isla `{r} params$isla`

En la isla `{r} params$isla` se midieron `{r} nrow(isla)` pingüinos. Estas son sus especies:

```{r}
count(isla, especie)
```

```{r}
#| label: fig-masa
#| fig-cap: "Masa corporal por especie"
#| echo: false
#| warning: false
ggplot(isla, aes(especie, masa_corporal_g)) +
  geom_boxplot()
```

La masa media es de `{r} round(mean(isla$masa_corporal_g, na.rm = TRUE))` gramos, y cada especie se reparte como en la @fig-masa.
````
:::

```{anywidget} ../widgets/informe.mjs
{"config":{"titulo":"Un documento, tres informes","etiqueta":"parámetros","idea":"Cambia la isla con los botones: es el mismo .qmd, generado con otro valor de params$isla. El número de pingüinos, la tabla, el gráfico y la masa media cambian solos.","parametros":{"isla":["Biscoe","Dream","Torgersen"]}},"archivo":"datos/informes/25-informes-quarto-4.json"}
```

Con Dream, el informe dice que hay 124 pingüinos, de dos especies, Adelia y Barbijo, con una masa media de 3713 gramos. Con Torgersen, 52 pingüinos, todos Adelia, y 3706 gramos. Ningún número está escrito en el `.qmd`: todos salen de los datos.

Con un bucle, se generan los tres de una vez, cada uno en su archivo:

```r
for (i in c("Biscoe", "Dream", "Torgersen")) {
  quarto::quarto_render("informe.qmd", execute_params = list(isla = i),
                        output_file = paste0("informe-", i, ".html"))
}
```

Es la idea de las funciones (capítulo 5), llevada a los documentos: un informe con parámetros es una plantilla que se rellena con cada valor.

::::{div}
:class: afondo
### 5 · Tablas, formatos, caché y proyectos

**Tablas de verdad.** En el informe del apartado 1, `count()` escribe la tabla como en la consola, en letra de máquina de escribir. Para un informe es mejor una tabla con formato: `knitr::kable()` convierte un data frame en una tabla de Markdown, que pandoc dibuja como una tabla de verdad. Con `label: tbl-…` y `tbl-cap`, lleva número y pie, que Quarto pone encima:

````qmd
---
title: "Masa por especie"
lang: es
format: html
---

```{r}
#| echo: false
#| label: tbl-masa
#| tbl-cap: "Masa media por especie"
pinguinos <- read.csv("datos/pinguinos.csv")
masa <- aggregate(masa_corporal_g ~ especie, data = pinguinos, FUN = mean)
knitr::kable(masa, digits = 0, col.names = c("Especie", "Masa media (g)"))
```

Los papúa son, con diferencia, los más pesados (@tbl-masa).
````

```{anywidget} ../widgets/informe.mjs
{"config":{"titulo":"Una tabla con número y pie","etiqueta":"a fondo · kable","idea":"knitr::kable() escribe la tabla en Markdown, y en el informe es una tabla de verdad, con su pie encima: «Tabla 1: Masa media por especie». El texto la cita con @tbl-masa."},"archivo":"datos/informes/25-informes-quarto-5.json"}
```

`digits = 0` redondea a gramos enteros: 3701, 3733 y 5076. Para tablas más elaboradas, con colores, grupos de filas o notas al pie, están los paquetes gt y flextable.

**Otros formatos.** El mismo `.qmd` sirve para otros formatos: basta con cambiar `format:` en la cabecera, o con `quarto render informe.qmd --to docx`. Algunos útiles:

- `html`, una página web, con los gráficos dentro;
- `docx`, un documento de Word, para quien tenga que editarlo después;
- `typst`, un PDF hecho con Typst, un sistema de maquetación moderno que Quarto ya trae dentro, sin instalar nada más;
- `pdf`, un PDF hecho con LaTeX (hace falta instalarlo; `quarto install tinytex` instala una versión ligera);
- `revealjs`, unas diapositivas para el navegador: cada título `##` empieza una diapositiva.

Bajo `format:` se pueden poner varios, y `quarto render` los genera todos.

**Mientras escribes.** `quarto preview informe.qmd` abre el informe en el navegador y lo vuelve a generar cada vez que guardas el archivo. Y con `#| echo: fenced`, un bloque se enseña con sus vallas y sus opciones, tal como está escrito: es lo que conviene para enseñar Quarto a otros.

**No repetir lo que tarda.** Si un bloque tarda mucho (un modelo, una simulación con miles de repeticiones), `#| cache: true` hace que knitr guarde su resultado y no lo vuelva a ejecutar mientras no cambie el código del bloque. Hay que usarlo con cuidado: si cambian los datos del archivo pero no el código, la caché no se entera, y el informe enseña resultados viejos.

**Muchos documentos juntos.** Un **proyecto** de Quarto, con un archivo `_quarto.yml`, reúne varios documentos: una web, un blog o un libro entero, con su índice y sus referencias cruzadas. Los artículos de muchas revistas científicas, y muchos libros sobre R, se escriben así. Este mismo libro está hecho con un primo de Quarto, MyST, que funciona con la misma idea: texto, código y resultados en un mismo documento.

**De dónde viene.** Antes de Quarto, en R se usaba R Markdown, con archivos `.Rmd` y el mismo knitr por debajo. Quarto, publicado por Posit en 2022, es su sucesor: funciona igual con R, con Python y con Julia, y no necesita R para los documentos que no lo usan. Los `.Rmd` antiguos siguen funcionando, y Quarto también sabe generarlos.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Un mismo `.qmd` puede llevar bloques de R, de Python o de Julia. Lo que cambia es quién ejecuta el código:

````text
```{r}
isla <- subset(pinguinos, isla == "Biscoe")
```
En Biscoe hay `{r} nrow(isla)` pingüinos.
````

````text
```{python}
isla = pinguinos[pinguinos["isla"] == "Biscoe"]
```
En Biscoe hay `{python} len(isla)` pingüinos.
````

````text
```{julia}
isla = filter(:isla => ==("Biscoe"), pinguinos)
```
En Biscoe hay `{julia} nrow(isla)` pingüinos.
````

Con R, Quarto usa **knitr**; con Python, un núcleo de **Jupyter**, el mismo de los cuadernos `.ipynb`; con Julia, también Jupyter, o el motor propio de Julia si la cabecera dice `engine: julia`. El código en línea se escribe igual en los tres, con el nombre del lenguaje entre llaves. Y en los tres casos, el documento empieza con una sesión nueva y avanza en orden. El ejemplo de Julia usa el paquete DataFrames.
:::

## Conexiones

- Un informe con parámetros es una **función** (capítulo 5) para documentos: el mismo `.qmd` con otro valor de `params` da otro informe.
- Los datos son los **pingüinos** de la parte III, y el informe usa lo aprendido allí: leer con `read.csv()` (capítulo 12), filtrar y contar con dplyr (capítulo 13) y dibujar con ggplot2 (capítulo 15).
- «Un documento empieza de cero» es la idea de los **entornos** (capítulo 19): Quarto ejecuta el documento en un entorno nuevo, que no ve el de tu consola.
- Un informe que se vuelve a generar con los datos nuevos es una **prueba** de que el análisis sigue funcionando, como las del capítulo 24: si algo se rompe, Quarto se detiene y dice dónde.
- En el capítulo 26, las funciones y los datos de un análisis se empaquetan, y un **paquete** puede llevar sus propios documentos de Quarto, las viñetas, que explican cómo usarlo.

## La grieta

Ya sabemos escribir funciones que avisan cuando algo va mal, probarlas y contar los resultados en un informe que se escribe solo. Pero las funciones siguen viviendo dentro de cada proyecto: si escribimos `nota_final()` para un informe y la queremos usar en otro, la copiamos y la pegamos. Y si un día la corregimos, hay que acordarse de corregir todas las copias. Con los informes nos libramos de copiar números; ¿cómo nos libramos de copiar funciones? ¿Cómo se juntan las funciones, sus pruebas y su documentación en algo que se instale con una orden, como dplyr o ggplot2, y que cualquiera pueda usar? Son los [**paquetes**](26-paquetes.md), el siguiente capítulo.

## Ejercicios

1. **¿Qué entra?** Un bloque tiene `#| echo: false` y dentro `summary(c(4, 6, 8))`. ¿Qué aparece en el informe? ¿Y si la opción fuera `#| eval: false`?

2. **Código en línea.** Escribe una frase para el informe del apartado 1 que diga cuánto mide la aleta más larga de la isla, sin escribir el número a mano. ¿Qué valor sale con Biscoe?

3. **En mi consola funciona.** Un compañero tiene un informe que empieza por `library(ggplot2)` y después dibuja con `ggplot(datos, ...)`. En su consola funciona; al generar el informe, Quarto se detiene con «objeto 'datos' no encontrado». ¿Qué ha pasado y cómo se arregla?

4. **Otra isla.** Escribe la orden de la terminal que genera el informe del apartado 1 para Torgersen. ¿Qué número de pingüinos dirá el primer párrafo? ¿Y qué especies saldrán en la tabla?

5. **Sin código a la vista.** El informe es para el equipo de dirección, que no programa. ¿Qué escribirías en la cabecera para que ningún bloque enseñe su código, sin tocar los bloques uno a uno?

6. **El informe que no avisa.** En el bloque del gráfico del apartado 1, quitamos `#| warning: false`. ¿Qué cambia en el informe de Biscoe? ¿Y en el de Dream? Pista: el aviso habla de pingüinos sin dato de masa; mira cuántos hay en cada isla con `tapply(pinguinos$masa_corporal_g, pinguinos$isla, function(x) sum(is.na(x)))`.

:::{div}
:class: afondo
7. **La tabla, a mano.** ¿Qué tres números enseña la tabla del apartado 5? ¿Y qué cambiaría con `digits = 1`?

8. **Una caché engañosa.** El bloque que lee el archivo y calcula la tabla del apartado 5 tiene `#| cache: true`. Alguien corrige la masa de un pingüino en el archivo CSV y vuelve a generar el informe, sin tocar el `.qmd`. ¿Qué masa media enseñará la tabla? ¿Cómo se evita?
:::

## Solucionario

1. Con `echo: false`, solo lo que escribe `summary()`, el resumen de los tres números: mínimo 4, mediana 6, media 6, máximo 8, con sus cuartiles. Con `eval: false`, solo el código, `summary(c(4, 6, 8))`, sin resultado, porque no se ejecuta.
2. Por ejemplo: «La aleta más larga mide `` `{r} max(isla$largo_aleta_mm, na.rm = TRUE)` `` mm.». Con Biscoe sale 231. El `na.rm = TRUE` hace falta porque un pingüino no tiene ese dato.
3. Su compañero creó `datos` en la consola, pero el informe no lo crea en ningún bloque. Quarto empieza con una sesión vacía y no ve la consola. El arreglo es escribir en un bloque, antes del gráfico, cómo se obtiene `datos`: por ejemplo, `datos <- read.csv("datos/pinguinos.csv")`.
4. `quarto render informe.qmd -P isla:Torgersen`. Dirá que se midieron 52 pingüinos, y la tabla tendrá una sola fila: Adelia, 52.
5. En la cabecera:

   ```yaml
   execute:
     echo: false
   ```

   Todos los bloques enseñan sus resultados y ninguno su código, salvo los que digan `#| echo: true`.
6. En el informe de Biscoe aparece, encima del gráfico, el aviso de ggplot2 de que ha quitado una fila sin dato: en Biscoe hay un pingüino sin masa. En el de Dream no cambia nada, porque allí todos los pingüinos tienen su masa. En Torgersen también hay uno sin dato, así que aparece el aviso.

:::{div}
:class: afondo
7. Adelia 3701, Barbijo 3733 y Papúa 5076 gramos. Con `digits = 1`: 3700.7, 3733.1 y 5076.0.
8. La de antes: knitr ve que el código del bloque no ha cambiado, no lo ejecuta y usa el resultado guardado. Para evitarlo, se puede borrar la caché antes de generar el informe, o no poner `cache: true` en un bloque que lee datos que pueden cambiar. knitr también tiene la opción `cache.extra`, para que la caché dependa de algo más, como la fecha de modificación del archivo.
:::
