---
title: "Fechas: el calendario dentro de R"
subtitle: Días que se suman, se restan y se ordenan
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En la agenda del profesor están las fechas de entrega del trimestre. Hoy es 1 de noviembre, y lo primero que quiere saber es cuántos días faltan para cada entrega y cuáles ya han pasado. En un calendario de papel lo contaría con el dedo, casilla a casilla. Y si un alumno pregunta qué día de la semana cae la última entrega, vuelve a contar.

## La pregunta

Al final del capítulo anterior, `"10/1/2024" < "9/12/2023"` daba `TRUE`: como texto, una fecha es solo una fila de caracteres. ¿Cómo se le explica a R que una fecha es un día del calendario, que se puede sumar, restar y ordenar?

## La idea

R tiene un tipo de dato para los días: la clase **`Date`**. Por dentro, una fecha es **un número**: los días que han pasado desde el 1 de enero de 1970. El 10 de enero de 2024 es el día 19732. Por eso las fechas se ordenan, se comparan y se restan como los números que son. Al enseñarlas, R las traduce a la forma que entendemos las personas, `"2024-01-10"`.

- **De texto a fecha**: `as.Date()` lee un texto. Si no está en el formato año-mes-día, se le dice cómo leerlo con `format`.
- **De fecha a texto**: `format()` la escribe como quieras.
- **Operar**: una fecha más un número es otra fecha, y una fecha menos otra es una **diferencia de tiempos** (`difftime`), en días.

:::{important} Año-mes-día
El formato `2024-01-10` es la norma internacional ISO 8601, y es el que R entiende sin ayuda. Tiene una ventaja: ordenado como texto, queda también en orden de fechas. `10/1/2024` es ambiguo, porque en Estados Unidos sería el 1 de octubre, y por eso R no lo lee si no le das el formato.
:::

## Construcción

### 1 · Crear y escribir fechas

```{code-cell} r
d <- as.Date("2024-01-10")
d
as.numeric(d)
as.Date("10/1/2024", format = "%d/%m/%Y")
format(d, "%d/%m/%Y")
format(d, "%Y")
weekdays(d)
```

`d` se enseña como `"2024-01-10"`, pero `as.numeric(d)` descubre el número que guarda: `19732`. Para leer `"10/1/2024"`, el formato `"%d/%m/%Y"` explica que primero va el día, después el mes y al final el año con cuatro cifras. El resultado es la misma fecha.

`format()` hace el camino contrario: `format(d, "%d/%m/%Y")` da `"10/01/2024"`, y `format(d, "%Y")` da el año, `"2024"`. Las piezas más usadas son:

| Pieza | Significa | En el 10 de enero de 2024 |
|---|---|---|
| `%d` | el día, con dos cifras | `10` |
| `%m` | el mes, con dos cifras | `01` |
| `%Y` | el año, con cuatro cifras | `2024` |
| `%y` | el año, con dos cifras | `24` |
| `%B` | el nombre del mes | `enero` |
| `%A` | el nombre del día de la semana | `miércoles` |

`weekdays(d)` da el día de la semana: `"miércoles"`. Los nombres de los días y de los meses salen en el idioma de tu instalación de R. En el laboratorio, que usa el R del navegador, saldrán en inglés.

### 2 · Contar los días que faltan

Este es el programa estrella del capítulo. Calcula cuántos días faltan para cada entrega, contando desde hoy.

:::{tip} Predice
Hoy es 1 de noviembre. ¿Qué signo tendrá el resultado para la entrega del 15 de octubre? ¿Qué número guarda R, por dentro, para el 1 de noviembre de 2024?
:::

```{code-cell} r
entregas <- as.Date(c("2024-10-15", "2024-11-04", "2024-12-20"))
hoy <- as.Date("2024-11-01")
faltan <- integer(length(entregas))
for (i in seq_along(entregas)) {
  faltan[i] <- as.integer(entregas[i] - hoy)
}
faltan
entregas[faltan >= 0]
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"¿Cuántos días faltan?","etiqueta":"fechas · por dentro","idea":"Cada fecha lleva encima, en pequeño, el número que R guarda: los días desde el 1 de enero de 1970. Restar dos fechas es restar esos dos números.","foco":"faltan","puntero":"i","columnas":["i","entregas[i]","faltan[i]"],"fila_en":"fin_iteracion"},"traza":{"codigo":"entregas <- as.Date(c(\"2024-10-15\", \"2024-11-04\", \"2024-12-20\"))\nhoy <- as.Date(\"2024-11-01\")\nfaltan <- integer(length(entregas))\nfor (i in seq_along(entregas)) {\n  faltan[i] <- as.integer(entregas[i] - hoy)\n}\nfaltan\nentregas[faltan >= 0]","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"linea","estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["0","0","0"]}},"salida":"","nfilas":0},{"linea":4,"tipo":"vuelta","vuelta":1,"estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["0","0","0"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":5,"tipo":"linea","estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["-17","0","0"]},"i":{"t":"integer","v":["1"]}},"salida":"","nfilas":0},{"linea":4,"tipo":"vuelta","vuelta":2,"estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["-17","0","0"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":5,"tipo":"linea","estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["-17","3","0"]},"i":{"t":"integer","v":["2"]}},"salida":"","nfilas":1},{"linea":4,"tipo":"vuelta","vuelta":3,"estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["-17","3","0"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":5,"tipo":"linea","estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["-17","3","49"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":2},{"linea":4,"tipo":"fin","vuelta":3,"estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["-17","3","49"]},"i":{"t":"integer","v":["3"]}},"salida":"","nfilas":3},{"linea":7,"tipo":"linea","estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["-17","3","49"]},"i":{"t":"integer","v":["3"]}},"salida":"[1] -17   3  49\n","nfilas":3},{"linea":8,"tipo":"linea","estado":{"entregas":{"t":"Date","v":["2024-10-15","2024-11-04","2024-12-20"],"k":["20011","20031","20077"]},"hoy":{"t":"Date","v":["2024-11-01"],"k":["20028"]},"faltan":{"t":"integer","v":["-17","3","49"]},"i":{"t":"integer","v":["3"]}},"salida":"[1] -17   3  49\n[1] \"2024-11-04\" \"2024-12-20\"\n","nfilas":3}],"filas":[{"i":"1","entregas[i]":"2024-10-15","faltan[i]":"-17"},{"i":"2","entregas[i]":"2024-11-04","faltan[i]":"3"},{"i":"3","entregas[i]":"2024-12-20","faltan[i]":"49"}]}}
```

Encima de cada fecha se ve su número. `hoy` es el día 20028, y la primera entrega, el 20011. Por eso `entregas[1] - hoy` da `-17`: la entrega fue hace 17 días. Para las otras dos faltan `3` y `49`. `as.integer()` convierte la diferencia de tiempos en un número normal.

El filtro de la última línea es el del capítulo 3: `entregas[faltan >= 0]` se queda con las que aún no han pasado, `"2024-11-04" "2024-12-20"`. Sin bucle, `as.integer(entregas - hoy)` hace la resta con las tres fechas a la vez.

### 3 · Ordenar y medir

Ya podemos arreglar el problema del capítulo anterior. Con las fechas leídas como fechas, ordenar y medir funcionan como se espera:

```{code-cell} r
textos <- c("10/1/2024", "9/12/2023", "25/3/2024")
fechas <- as.Date(textos, format = "%d/%m/%Y")
sort(textos)
sort(fechas)
diff(sort(fechas))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"De texto a fecha","etiqueta":"as.Date","idea":"textos son caracteres, y se ordenan como palabras. fechas son días: cada casilla guarda su número, y ordenar es ordenar esos números."},"traza":{"codigo":"textos <- c(\"10/1/2024\", \"9/12/2023\", \"25/3/2024\")\nfechas <- as.Date(textos, format = \"%d/%m/%Y\")\nsort(textos)\nsort(fechas)\ndiff(sort(fechas))","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"textos":{"t":"character","v":["\"10/1/2024\"","\"9/12/2023\"","\"25/3/2024\""]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"textos":{"t":"character","v":["\"10/1/2024\"","\"9/12/2023\"","\"25/3/2024\""]},"fechas":{"t":"Date","v":["2024-01-10","2023-12-09","2024-03-25"],"k":["19732","19700","19807"]}},"salida":"","nfilas":0},{"linea":3,"tipo":"linea","estado":{"textos":{"t":"character","v":["\"10/1/2024\"","\"9/12/2023\"","\"25/3/2024\""]},"fechas":{"t":"Date","v":["2024-01-10","2023-12-09","2024-03-25"],"k":["19732","19700","19807"]}},"salida":"[1] \"10/1/2024\" \"25/3/2024\" \"9/12/2023\"\n","nfilas":0},{"linea":4,"tipo":"linea","estado":{"textos":{"t":"character","v":["\"10/1/2024\"","\"9/12/2023\"","\"25/3/2024\""]},"fechas":{"t":"Date","v":["2024-01-10","2023-12-09","2024-03-25"],"k":["19732","19700","19807"]}},"salida":"[1] \"10/1/2024\" \"25/3/2024\" \"9/12/2023\"\n[1] \"2023-12-09\" \"2024-01-10\" \"2024-03-25\"\n","nfilas":0},{"linea":5,"tipo":"linea","estado":{"textos":{"t":"character","v":["\"10/1/2024\"","\"9/12/2023\"","\"25/3/2024\""]},"fechas":{"t":"Date","v":["2024-01-10","2023-12-09","2024-03-25"],"k":["19732","19700","19807"]}},"salida":"[1] \"10/1/2024\" \"25/3/2024\" \"9/12/2023\"\n[1] \"2023-12-09\" \"2024-01-10\" \"2024-03-25\"\nTime differences in days\n[1] 32 75\n","nfilas":0}],"filas":[]}}
```

`sort(textos)` da `"10/1/2024" "25/3/2024" "9/12/2023"`, por orden alfabético: el 9 de diciembre de 2023 queda el último. `sort(fechas)` da `"2023-12-09" "2024-01-10" "2024-03-25"`, el orden del calendario. `diff()` resta cada fecha de la siguiente: entre la primera y la segunda hay 32 días, y entre la segunda y la tercera, 75.

Otras operaciones útiles:

- `seq(d, by = "week", length.out = 4)` da cuatro fechas seguidas, una por semana. También vale `by = "day"`, `"month"` o `"year"`.
- `difftime(fin, inicio, units = "weeks")` mide la diferencia en la unidad que quieras: entre el 10 de enero y el 1 de marzo de 2024 hay 7.285714 semanas.
- `range()`, `min()` y `max()` dan la primera y la última fecha, y las comparaciones (`fechas > as.Date("2024-01-01")`) dan vectores lógicos, como siempre.

::::{div}
:class: afondo
### 4 · Lo que esconde el calendario

**Los años bisiestos y los meses desiguales.** R conoce el calendario: `as.Date("2024-03-01") - 1` da `"2024-02-29"`, y el mismo cálculo en 2023 da `"2023-02-28"`. Pero «un mes después» no siempre está claro. `seq(as.Date("2024-01-31"), by = "month", length.out = 3)` da el 31 de enero, el **2 de marzo** y el 31 de marzo: como el 31 de febrero no existe, R pasa al día que tocaría contando desde el 1 de febrero.

**Fechas que no existen.** `as.Date("2023-02-29")` da un error, porque ese día no existió. Con un formato explícito, `as.Date("2023-02-29", format = "%Y-%m-%d")` da `NA`, sin error. Si lees muchas fechas, cuenta los `NA` después: cada uno es una fecha mal escrita.

**El origen.** El día 0 es el 1 de enero de 1970, y antes los números son negativos. Es la misma referencia que usan casi todos los ordenadores. `as.numeric(as.Date("1970-01-10"))` da `9`.

**Fechas con hora.** Para la hora, R tiene la clase `POSIXct`, que guarda los **segundos** desde el 1 de enero de 1970 y necesita saber la zona horaria:

```r
t1 <- as.POSIXct("2024-11-20 08:30:00", tz = "Europe/Madrid")
t1 + 3600                                  # una hora después: "2024-11-20 09:30:00 CET"
format(t1, tz = "UTC", usetz = TRUE)       # la misma hora en UTC: "2024-11-20 07:30:00 UTC"
```

Las zonas horarias y los cambios de hora son la fuente de errores más famosa del trabajo con tiempos. Si solo necesitas días, usa `Date`.

**Edad en años.** Dividir los días entre 365.25 da una buena aproximación: `floor(as.numeric(hoy - nacimiento) / 365.25)`. Para la edad exacta hay que comparar el mes y el día del cumpleaños con los de hoy.

:::{tip} Para saber más
En la parte III aparecerá **lubridate**, el paquete del tidyverse para fechas. Lee fechas sin escribir formatos (`dmy("10/1/2024")` entiende día-mes-año) y suma meses de verdad, con `%m+%`, sin los saltos del 31 de enero.
:::
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
| | R | Python | Julia |
|---|---|---|---|
| Crear | `as.Date("2024-01-10")` | `date(2024, 1, 10)` | `Date(2024, 1, 10)` |
| Leer un texto | `as.Date(x, format = "%d/%m/%Y")` | `datetime.strptime(x, "%d/%m/%Y")` | `Date(x, dateformat"d/m/y")` |
| Diferencia | `d2 - d1` (un `difftime`) | `d2 - d1` (un `timedelta`) | `d2 - d1` (un `Day`) |

Los tres guardan una fecha como un número de días a partir de un día de referencia. Python la tiene en el módulo `datetime` y Julia en `Dates`, los dos de serie. Las piezas de formato de R (`%d`, `%m`, `%Y`) son las mismas que las de Python, que vienen del lenguaje C.
:::

## Conexiones

- Los datos con fechas forman **series temporales**: las ventas de cada día, la temperatura de cada hora. Agrupar por mes o por semana es `cut(fechas, "month")` o `format(fechas, "%Y-%m")`, y después, resumir por grupos como en el capítulo 9.
- **ggplot2** entiende las fechas y pone el eje horizontal con meses o años.
- **lubridate**, en la parte III, hará fácil todo lo de este capítulo.

## La grieta

Con este capítulo se cierra la parte II: ya sabes guardar y manejar números, textos, categorías, fechas, listas, matrices y tablas. Pero todos los datos los hemos escrito a mano, dentro del programa. Los datos de verdad llegan en archivos: un CSV descargado de una web pública, una hoja de Excel de secretaría, miles de filas que nadie va a teclear. La parte III empieza por ahí: [**leer datos**](12-leer-datos.md).

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   d <- as.Date("2024-03-01")
   d - 1
   ```

2. **Navidad.** Escribe una línea que lea `"25/12/2024"` como fecha.

3. **El final de curso.** ¿Cuántos días hay del 20 de noviembre de 2024 al 20 de junio de 2025?

4. **Los lunes del trimestre.** Escribe una línea que dé las cuatro primeras fechas de una serie que empieza el lunes 16 de septiembre de 2024 y avanza de semana en semana.

5. **Ordenar textos.** Con `x <- c("3/2/2024", "1/12/2023")`, escribe una línea que dé las dos fechas ordenadas.

6. **La edad.** Con `nacimiento <- as.Date("2009-05-10")` y `hoy <- as.Date("2024-11-20")`, calcula la edad en años con la aproximación de los 365.25 días.

:::{div}
:class: afondo
7. **El origen.** ¿Qué dan `as.numeric(as.Date("1970-01-10"))` y `as.Date(0)`?

8. **Un mes después.** ¿Qué fechas da `seq(as.Date("2024-01-31"), by = "month", length.out = 3)`? ¿Por qué la segunda no es de febrero?
:::

## Solucionario

1. `"2024-02-29"`: 2024 es bisiesto.
2. `as.Date("25/12/2024", format = "%d/%m/%Y")`, que da `"2024-12-25"`.
3. `as.Date("2025-06-20") - as.Date("2024-11-20")` da `Time difference of 212 days`.
4. `seq(as.Date("2024-09-16"), by = "week", length.out = 4)`, que da el 16, el 23 y el 30 de septiembre y el 7 de octubre.
5. `sort(as.Date(x, format = "%d/%m/%Y"))`, que da `"2023-12-01" "2024-02-03"`.
6. `floor(as.numeric(hoy - nacimiento) / 365.25)`, que da `15`.

:::{div}
:class: afondo
7. `9`, porque el 10 de enero es nueve días después del día 0. Y `"1970-01-01"`, el día 0.
8. `"2024-01-31" "2024-03-02" "2024-03-31"`. El 31 de febrero no existe, así que R cuenta 31 días desde el 1 de febrero y llega al 2 de marzo.
:::
