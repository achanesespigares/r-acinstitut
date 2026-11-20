---
title: "Errores y pruebas: cuando algo va mal"
subtitle: Avisar con claridad, atrapar lo que falla y comprobar que todo funciona
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Una calculadora de bolsillo, si le pides que divida entre cero, no se inventa un número: enseña una «E» y se para. Prefiere quedarse callada a darte una respuesta falsa. Un horno que no llega a la temperatura enciende un piloto; un coche con poco aceite enciende una luz, pero sigue andando. Son tres maneras de avisar: pararse, avisar y seguir, o simplemente informar.

Y antes de que esa calculadora salga de la fábrica, alguien la prueba: comprueba que 2 + 2 da 4, que 1 entre 3 da 0.3333333 y que dividir entre cero enseña la «E». No una vez, sino a cada calculadora de la cadena, y otra vez cada vez que se cambia el diseño.

## La pregunta

Hasta ahora nuestras funciones han recibido siempre los datos que esperaban. En el mundo real no pasa: alguien escribe una nota de 11, pasa tres pesos para dos notas o escribe «tres» donde iba un número. ¿Cómo hace una función para **avisar** de que la están usando mal? ¿Qué puede hacer el programa que la llama cuando algo falla: pararse, o **atraparlo** y seguir? ¿Y cómo comprobamos, de una vez y cada vez que cambiemos algo, que nuestras funciones hacen lo que deben?

## La idea

R tiene tres maneras de avisar, de menos a más grave:

- `message()` **informa**: escribe un mensaje en la consola y el programa sigue como si nada;
- `warning()` **avisa**: algo no encaja, pero el cálculo se termina; R enseña el aviso en la consola;
- `stop()` **para**: lanza un **error**, y R deja de ejecutar todo lo que venía detrás.

Las tres lanzan lo que R llama una **condición**. Un error que nadie atrapa detiene el programa. Pero se puede atrapar: `tryCatch()` ejecuta un trozo de código y, si salta un error o un aviso, llama a una función que decide qué hacer con él, su **manejador**.

Y para comprobar que una función hace lo que debe están las **pruebas**. Con el paquete testthat, cada prueba es un `test_that()` con varias comprobaciones: `expect_equal()` (este resultado vale esto), `expect_error()` (esto tiene que fallar), `expect_warning()` (esto tiene que avisar).

:::{important} Fallar pronto y con claridad
Una función que recibe datos imposibles no debe seguir adelante y devolver un resultado equivocado: debe **pararse enseguida** con un mensaje que diga qué ha pasado. Un error claro en la primera línea se arregla en un minuto; un número falso que nadie detecta puede acabar en un informe, en una nota o en una decisión.
:::

## Construcción

### 1 · Avisar o pararse

Este es el programa estrella del capítulo. `nota_final()` calcula una media ponderada: cada nota por su peso, y todo sumado. Antes de calcular, comprueba dos cosas. Si hay distinto número de notas que de pesos, el cálculo no tiene sentido: se para con `stop()`. Si alguna nota está fuera de 0-10, el cálculo se puede hacer, pero algo raro pasa: avisa con `warning()` y sigue.

:::{tip} Predice
Hay cuatro llamadas. ¿Qué escribe R en la consola con cada una? En particular: ¿qué pasa con la segunda, que tiene un 11? ¿Y con la cuarta, `nota_final(c(5, 5), c(0.5, 0.5))`, que no tiene nada raro?
:::

```{code-cell} r
nota_final <- function(notas, pesos) {
  if (length(notas) != length(pesos)) {
    stop("hay ", length(notas), " notas y ", length(pesos), " pesos")
  }
  if (any(notas < 0 | notas > 10)) {
    warning("hay notas fuera de 0-10")
  }
  sum(notas * pesos)
}
nota_final(c(6, 8), c(0.4, 0.6))
nota_final(c(6, 11), c(0.4, 0.6))
nota_final(c(6, 8), c(0.2, 0.3, 0.5))
nota_final(c(5, 5), c(0.5, 0.5))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Avisar o pararse","etiqueta":"stop · warning","idea":"La primera llamada pasa las dos comprobaciones y devuelve 7.2. La segunda avisa del 11, pero termina y devuelve 9. La tercera se para en el stop(): R abandona la función y el programa entero, y la cuarta línea ya no se ejecuta."},"archivo":"datos/trazas/24-errores-pruebas-1.json"}
```

- **La primera llamada** pasa las dos comprobaciones y devuelve $6 \cdot 0.4 + 8 \cdot 0.6 = 7.2$.
- **La segunda** tiene un 11. La primera comprobación pasa, la segunda no: `warning()` lanza un aviso, pero la función **sigue** y devuelve 9. El visualizador enseña el aviso en el paso en que salta.
- **La tercera** tiene dos notas y tres pesos. `stop()` lanza un error y R **abandona** todo: la función, que no llega a calcular nada, y el programa entero.
- **La cuarta** no llega a ejecutarse. No tenía nada malo, pero el programa ya se había detenido en la línea anterior.

En la consola de R, el resultado es este:

```text
[1] 7.2
[1] 9
Warning message:
In nota_final(c(6, 11), c(0.4, 0.6)) : hay notas fuera de 0-10
Error in nota_final(c(6, 8), c(0.2, 0.3, 0.5)) : hay 2 notas y 3 pesos
```

R dice **en qué llamada** ha saltado el aviso o el error, y después el mensaje que escribimos. (Esas cabeceras, `Warning message` y `Error in`, R las deja en inglés aunque esté en español.) `stop()` y `warning()` pegan todo lo que reciben, como `paste0()`: por eso el mensaje dice «hay 2 notas y 3 pesos» con los números de verdad. Un buen mensaje de error dice qué ha pasado con los datos concretos, no solo «algo va mal».

### 2 · Atrapar un error

A veces un error no tiene que detener el programa. Si procesamos cien archivos y uno está estropeado, queremos apuntarlo y seguir con los demás. Para eso está `tryCatch()`: ejecuta una expresión y, si salta un error, llama a su manejador.

```{code-cell} r
divide <- function(a, b) {
  if (b == 0) stop("no se puede dividir entre cero")
  a / b
}
seguro <- function(a, b) {
  tryCatch(
    divide(a, b),
    error = function(e) {
      message("No se ha podido: ", conditionMessage(e))
      NA
    },
    finally = cat("división terminada\n")
  )
}
seguro(6, 3)
seguro(1, 0)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"tryCatch atrapa el error","etiqueta":"tryCatch","idea":"Con seguro(6, 3) no salta nada: tryCatch() devuelve lo que devuelve divide(). Con seguro(1, 0), el stop() salta dentro de divide(); R deshace esa llamada, que se queda a medias, y llama al manejador error, que avisa y devuelve NA. Pase lo que pase, finally se ejecuta al final."},"archivo":"datos/trazas/24-errores-pruebas-2.json"}
```

`tryCatch()` tiene tres partes:

- **la expresión** que se intenta, aquí `divide(a, b)`;
- **los manejadores**, uno por tipo de condición: `error = function(e) ...` se llama si salta un error. Recibe el error en su argumento `e`, un objeto del que `conditionMessage(e)` saca el mensaje. Lo que devuelva el manejador es lo que devuelve `tryCatch()`;
- **`finally`**, que se ejecuta siempre al final, haya habido error o no.

Con `seguro(6, 3)` no salta nada: `tryCatch()` devuelve el 2 de `divide()`, y `finally` escribe «división terminada». Con `seguro(1, 0)`, el visualizador enseña el momento exacto en que salta el error, todavía **dentro** de `divide(a = 1, b = 0)`. En el paso siguiente, el marco de `divide()` ya no está: R ha deshecho la llamada, que no va a terminar nunca, y ha saltado al manejador. El programa no se detiene: `seguro(1, 0)` devuelve `NA`.

```text
división terminada
[1] 2
No se ha podido: no se puede dividir entre cero
división terminada
[1] NA
```

### 3 · Atrapar un aviso

Los avisos también se atrapan, con un manejador `warning`. `as.numeric()` convierte un texto en un número; si el texto no es un número, devuelve `NA` y da un aviso. `lee_numero()` lo atrapa para dar un mensaje más útil:

```{code-cell} r
lee_numero <- function(texto) {
  tryCatch(
    as.numeric(texto),
    warning = function(w) {
      message("«", texto, "» no es un número")
      NA
    }
  )
}
lee_numero("3.5")
lee_numero("tres")
as.numeric("tres")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"tryCatch atrapa un aviso","etiqueta":"tryCatch · warning","idea":"as.numeric(\"tres\") da un aviso. Dentro de lee_numero(), tryCatch() lo atrapa y su manejador escribe un mensaje claro. En la última línea nadie lo atrapa: R devuelve NA y enseña su propio aviso."},"archivo":"datos/trazas/24-errores-pruebas-3.json"}
```

Con `"3.5"` no salta nada. Con `"tres"`, `as.numeric()` lanza el aviso «NAs introducidos por coerción», y el manejador lo cambia por un mensaje que dice qué texto ha fallado. En la última línea, sin `tryCatch()`, el aviso llega a la consola tal cual: el cálculo termina, devuelve `NA`, y R enseña su aviso.

Atrapar un aviso **corta** la expresión: `as.numeric()` ya no termina, y el valor es el que devuelva el manejador. Si solo se quiere apuntar el aviso y dejar que el cálculo siga, se usa `withCallingHandlers()`, en el apartado «A fondo».

### 4 · Probar que una función hace lo que debe

Para comprobar `nota_final()` podríamos llamarla con unos cuantos datos y mirar los resultados. Pero habría que volver a mirarlos cada vez que cambiemos la función, y mirar es lento y se olvida. Una **prueba** escribe esas comprobaciones en código, para que R las haga solo.

```{code-cell} r
library(testthat)
nota_final <- function(notas, pesos) {
  if (length(notas) != length(pesos)) {
    stop("hay ", length(notas), " notas y ", length(pesos), " pesos")
  }
  if (any(notas < 0 | notas > 10)) {
    warning("hay notas fuera de 0-10")
  }
  sum(notas * pesos)
}
test_that("nota_final hace la media ponderada", {
  expect_equal(nota_final(c(6, 8), c(0.4, 0.6)), 7.2)
  expect_equal(nota_final(c(6, 7), c(0.3, 0.7)), 6.7)
})
test_that("nota_final avisa y se para cuando debe", {
  expect_warning(nota_final(c(6, 11), c(0.4, 0.6)), "fuera de 0-10")
  expect_error(nota_final(c(6, 8), c(0.2, 0.3, 0.5)), "2 notas y 3 pesos")
})
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Dos pruebas que pasan","etiqueta":"testthat","idea":"Cada test_that() llama a nota_final() con datos de los que sabemos la respuesta. La primera prueba comprueba dos resultados; la segunda, que la función avisa y que se para, con el mensaje que toca. Todo pasa, y testthat lo celebra."},"archivo":"datos/trazas/24-errores-pruebas-4.json"}
```

Cada `test_that()` tiene una descripción, que dice qué se prueba, y un bloque de comprobaciones:

- `expect_equal(x, y)` comprueba que `x` vale `y`, **con una tolerancia** pequeña. No es un capricho: $6 \cdot 0.3 + 7 \cdot 0.7$ da `6.6999999999999993` (los decimales en binario, capítulo 1), así que `nota_final(c(6, 7), c(0.3, 0.7)) == 6.7` es `FALSE`. `expect_equal()` lo da por bueno, porque la diferencia es mínima;
- `expect_warning(x, "texto")` comprueba que `x` da un aviso, y que su mensaje contiene ese texto;
- `expect_error(x, "texto")` comprueba que `x` lanza un error con ese texto. Aquí el error es **lo que queremos**: una prueba también comprueba que la función se para cuando debe.

Si todo va bien, testthat escribe «Test passed» con un emoji que cambia cada vez. Las pruebas parecen poca cosa con una función de seis líneas, pero son las que permiten cambiarla sin miedo: si un día reescribimos `nota_final()` para que vaya más rápida, basta con volver a pasar las pruebas para saber si sigue haciendo lo mismo.

### 5 · Una prueba que falla

Las pruebas valen sobre todo cuando fallan. `aprobado()` debería decir si una nota aprueba, es decir, si llega a 5. Tiene un error, pequeño y muy común:

```{code-cell} r
library(testthat)
aprobado <- function(nota) nota > 5
test_that("un 7 aprueba", {
  expect_true(aprobado(7))
})
test_that("un 5 aprueba", {
  expect_true(aprobado(5))
})
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La prueba encuentra el error","etiqueta":"testthat · fallo","idea":"Con un 7, aprobado() dice TRUE y la prueba pasa. Con un 5, dice FALSE: la prueba falla, testthat explica qué esperaba y qué ha recibido, y se para con un error."},"archivo":"datos/trazas/24-errores-pruebas-5.json"}
```

La primera prueba pasa: 7 es mayor que 5. La segunda falla, y testthat lo explica:

```text
── Failure: un 5 aprueba ───────────────────────────────────────
aprobado(5) is not TRUE

`actual`:   FALSE
`expected`: TRUE

Error: Test failed
```

Dice **qué** ha fallado (`aprobado(5)`), qué valor ha recibido (`FALSE`) y cuál esperaba (`TRUE`). El fallo está en `>`: un 5 no es mayor que 5. Hacía falta `>=`. Con `aprobado <- function(nota) nota >= 5`, las dos pruebas pasan.

Fíjate en qué nota encontró el error: el 5, justo **en la frontera**. Un 7 o un 3 nunca lo habrían encontrado. Las buenas pruebas buscan los bordes: el valor justo en el límite, los extremos (0 y 10), un vector vacío, un `NA`.

::::{div}
:class: afondo
### 6 · Condiciones con nombre propio, limpieza y depuración

**Errores con clase.** Un error es un objeto de R, con su clase, como los del capítulo 21: el de `stop("…")` es de clase `simpleError`, `error` y `condition`. Podemos crear errores con una **clase propia**, y así el que los atrapa puede distinguir un tipo de fallo de otro. `errorCondition()` construye el error, con su clase y con los datos que queramos añadirle:

```{code-cell} r
comprueba <- function(nota) {
  if (nota < 0 || nota > 10) {
    stop(errorCondition(paste("nota imposible:", nota),
                        class = "nota_invalida", nota = nota, call = sys.call()))
  }
  nota
}
arregla <- function(nota) {
  tryCatch(
    comprueba(nota),
    nota_invalida = function(e) {
      message("La nota ", e$nota, " no es posible: la recorto")
      min(max(e$nota, 0), 10)
    },
    error = function(e) NA
  )
}
arregla(7)
arregla(12)
arregla(NA)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Cada error, a su manejador","etiqueta":"a fondo · clases","idea":"El 12 lanza un error de clase nota_invalida, que atrapa su manejador propio: lo recorta a 10. El NA hace fallar el if por otro motivo, con un error corriente, y ese va al manejador error, que devuelve NA."},"archivo":"datos/trazas/24-errores-pruebas-6.json"}
```

Con un 12, el error es de clase `nota_invalida`, y `tryCatch()` busca el primer manejador que coincida con alguna de sus clases: el de `nota_invalida`. Ese manejador lee `e$nota`, el dato que guardamos en el error, y devuelve la nota recortada, 10. Con `NA`, el error es otro: `NA < 0` es `NA`, y el `if` no sabe qué hacer con él («valor ausente donde TRUE/FALSE es necesario»). Es un error corriente, sin la clase `nota_invalida`, así que va al manejador `error`. Los paquetes serios lanzan errores con clase para que quien los use pueda decidir qué atrapar; el paquete rlang lo hace con `rlang::abort("…", class = "…")`.

**Limpiar al salir, pase lo que pase.** Una función que abre un archivo o una conexión tiene que cerrarla, termine bien o mal. `on.exit()` apunta algo que R hará al salir de la función, **también si sale por un error**:

```{code-cell} r
abre_y_lee <- function(archivo) {
  cat("abro", archivo, "\n")
  on.exit(cat("cierro", archivo, "\n"))
  if (archivo == "roto.csv") stop("el archivo está estropeado")
  cat("leo", archivo, "\n")
  "leído"
}
abre_y_lee("notas.csv")
r <- try(abre_y_lee("roto.csv"))
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"on.exit: cerrar siempre","etiqueta":"a fondo · on.exit","idea":"Con notas.csv, la función lee y, al salir, cierra. Con roto.csv salta el error antes de leer, pero al deshacer la llamada R ejecuta igualmente lo que apuntó on.exit(): «cierro roto.csv» sale antes que el mensaje del error."},"archivo":"datos/trazas/24-errores-pruebas-7.json"}
```

`try()` es la versión corta de `tryCatch()`: ejecuta la expresión y, si falla, escribe el error en la consola y devuelve un objeto de clase `try-error` en lugar de detener el programa. Fíjate en el orden de la consola: «cierro roto.csv» sale **antes** que el mensaje del error, porque R ejecuta lo que apuntó `on.exit()` mientras deshace la llamada.

**Mirar sin cortar.** `tryCatch()` atrapa y corta: la expresión ya no termina. `withCallingHandlers()` deja que el manejador mire la condición y la apunte, y después la condición sigue su camino. Con `invokeRestart("muffleWarning")`, además, el aviso no llega a la consola y el cálculo termina:

```r
withCallingHandlers(
  nota_final(c(6, 11), c(0.4, 0.6)),
  warning = function(w) {
    message("visto: ", conditionMessage(w))
    invokeRestart("muffleWarning")
  }
)
#> visto: hay notas fuera de 0-10
#> [1] 9
```

Con `tryCatch(..., warning = function(w) NA)` el resultado sería `NA`, porque el cálculo se corta en el aviso. Para el caso sencillo de callar avisos que ya conocemos está `suppressWarnings()`, que conviene usar poco: un aviso callado es un aviso que nadie lee.

**Encontrar dónde falla.** Cuando un error salta en lo hondo de varias llamadas, `traceback()`, justo después del error, enseña la pila de llamadas que había en ese momento, como los marcos del visualizador. `debugonce(f)` hace que la próxima llamada a `f()` se detenga en su primera línea, para avanzar paso a paso y mirar las variables; `browser()`, escrito dentro de una función, la detiene en ese punto. Es lo que hace el visualizador de este libro, pero con tu propio código y en tu consola.

**Pruebas de verdad.** En un proyecto, las pruebas no van mezcladas con el código: van en archivos aparte, `tests/testthat/test-notas.R`, uno por tema, y `testthat::test_dir("tests/testthat")` las pasa todas de una vez. En un paquete (capítulo 26) se pasan con `devtools::test()`, y `covr::package_coverage()` dice qué líneas del código no ha ejecutado ninguna prueba: ahí es donde se esconden los errores que nadie ha buscado.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Lanzar un error, atraparlo y probar una función. En R, en Python y en Julia:

```r
divide <- function(a, b) {
  if (b == 0) stop("no se puede dividir entre cero")
  a / b
}
tryCatch(divide(1, 0), error = function(e) conditionMessage(e))
testthat::expect_error(divide(1, 0), "entre cero")
```

```python
def divide(a, b):
    if b == 0:
        raise ValueError("no se puede dividir entre cero")
    return a / b

try:
    divide(1, 0)
except ValueError as e:
    print(e)

with pytest.raises(ValueError, match="entre cero"):   # con pytest
    divide(1, 0)
```

```julia
function divide(a, b)
    b == 0 && error("no se puede dividir entre cero")
    a / b
end

try
    divide(1, 0)
catch e
    println(e.msg)
end

using Test
@test_throws ErrorException divide(1, 0)
```

Los tres lenguajes tienen lo mismo con otros nombres: R **lanza** con `stop()` y **atrapa** con `tryCatch()`; Python, con `raise` y `try … except`; Julia, con `error()` o `throw()` y `try … catch`. Los tres tienen también `finally`. Python y Julia clasifican los errores por su tipo (`ValueError`, `ErrorException`), como las clases de condición de R. Y una diferencia curiosa: sin nuestra comprobación, en R y en Julia `1 / 0` da `Inf`, sin error; en Python lanza `ZeroDivisionError`.

Para las pruebas, R tiene testthat; Python, pytest, con `assert` y `pytest.approx()` para comparar decimales; y Julia trae la biblioteca `Test`, con `@test` y `≈` para comparar con tolerancia.
:::

## Conexiones

- Las comprobaciones con `if` y `stop()` al principio de una función completan las **funciones** del capítulo 5: una función bien escrita se defiende de los argumentos que no tienen sentido.
- `expect_equal()` compara con tolerancia por lo que vimos de los **decimales** en el capítulo 1: $0.1 + 0.2$ no es exactamente $0.3$.
- El manejador de un `tryCatch()` es una **función anónima** (capítulo 20), y cada error es un **objeto con clase** (capítulo 21): por eso hay errores de clases distintas, y manejadores para cada una.
- `bench::mark()`, en el capítulo 23, comprueba que todas las versiones dan lo mismo antes de medirlas: es una **prueba**, de las que permiten acelerar un código sin romperlo.
- En el capítulo 26, las pruebas viven dentro de los **paquetes**, en `tests/testthat`.

## La grieta

Nuestras funciones ya avisan cuando algo va mal, y las pruebas nos dicen que hacen lo que deben. Pero todo ese trabajo sigue dentro de la consola y de nuestros archivos de código. Al final de un análisis hay que **contarlo**: a un profesor, a un equipo, a quien tenga que decidir. Y copiar a mano números y gráficos a un documento es lento, y peligroso: si cambian los datos, el documento se queda viejo, y nadie sabe qué cifra salió de dónde. ¿Se puede escribir un documento que mezcle el texto, el código y sus resultados, y que se vuelva a generar solo cuando cambian los datos? Es lo que hace [**Quarto**](25-informes-quarto.md), el siguiente capítulo.

## Ejercicios

1. **Predice el error.** ¿Qué escribe R con `nota_final(c(6, 8, 10), c(0.5, 0.5))`? ¿Llega a ejecutarse la comprobación de las notas?

2. **Comprobar en una línea.** `stopifnot(length(notas) == length(pesos))` se para si la condición no es `TRUE`. Cambia el primer `if` de `nota_final()` por esa línea. ¿Qué mensaje da ahora con tres pesos para dos notas? ¿Es mejor o peor que el nuestro?

3. **Los pesos suman 1.** Añade a `nota_final()` una comprobación de que los pesos suman 1. ¿Por qué es mejor `if (abs(sum(pesos) - 1) > 1e-8)` que `if (sum(pesos) != 1)`? Pista: prueba en la consola `0.3 + 0.6 + 0.1 == 1`.

4. **¿Qué manejador?** ¿Qué devuelve `tryCatch(log(-1), warning = function(w) "aviso", error = function(e) "error")`? ¿Y si cambias `log(-1)` por `log("a")`?

5. **El orden de las cosas.** ¿Qué escribe este código, y en qué orden?

   ```r
   tryCatch({
     cat("a\n")
     stop("b")
     cat("c\n")
   }, error = function(e) cat("d\n"), finally = cat("e\n"))
   ```

6. **Pruebas para la frontera.** Ya arreglada, `aprobado <- function(nota) nota >= 5`. Escribe un `test_that()` con cuatro comprobaciones que vigilen bien la frontera y los extremos. ¿Qué valores eliges, y con qué `expect_`?

:::{div}
:class: afondo
7. **Errores de dos clases.** Con `comprueba()` y `arregla()` del apartado 6, ¿qué devuelve `arregla(-3)`? ¿Y `arregla("siete")`? Para el segundo, piensa cómo compara R un texto con un número (capítulo 10) antes de ejecutarlo.

8. **Cortar o mirar.** ¿Qué devuelve `tryCatch(nota_final(c(6, 11), c(0.4, 0.6)), warning = function(w) NA)`? ¿Y la misma llamada con `withCallingHandlers()` y un manejador que hace `invokeRestart("muffleWarning")`? ¿Por qué son distintos?
:::

## Solucionario

1. `Error in nota_final(c(6, 8, 10), c(0.5, 0.5)) : hay 3 notas y 2 pesos`. La comprobación de las notas no llega a ejecutarse: `stop()` abandona la función en la primera comprobación.
2. El mensaje pasa a ser `length(notas) == length(pesos) is not TRUE`. Es peor para quien usa la función, porque no dice cuántas notas y pesos había. `stopifnot()` va bien para comprobaciones rápidas; para mensajes claros, se le puede poner nombre a la condición, `stopifnot("hay tantas notas como pesos" = length(notas) == length(pesos))`, o volver al `if` con `stop()`.
3. Por ejemplo: `if (abs(sum(pesos) - 1) > 1e-8) stop("los pesos suman ", sum(pesos), ", no 1")`. Comparar con `!=` es peligroso: `0.3 + 0.6 + 0.1` da `0.9999999999999999`, y `0.3 + 0.6 + 0.1 == 1` es `FALSE`. `sum()` suma con más precisión y aquí sí da 1 exacto, pero no conviene fiarse: con decimales se compara con una tolerancia, como hace `expect_equal()`. También vale `isTRUE(all.equal(sum(pesos), 1))`.
4. `"aviso"`: `log(-1)` no lanza un error, sino un aviso («Se han producido NaNs»), y devuelve `NaN`; lo atrapa el manejador `warning`. Con `log("a")` es un error («non-numeric argument to mathematical function»), y devuelve `"error"`.
5. `a`, `d`, `e`. La `c` no se escribe nunca: el `stop("b")` corta el bloque, R salta al manejador, que escribe `d`, y `finally` escribe `e` al final.
6. Por ejemplo:

   ```r
   test_that("aprobado respeta la frontera del 5", {
     expect_true(aprobado(5))
     expect_false(aprobado(4.99))
     expect_true(aprobado(10))
     expect_false(aprobado(0))
   })
   ```

   El 5 y el 4.99 vigilan la frontera por los dos lados; el 0 y el 10, los extremos. Con la versión con `>`, la primera comprobación habría fallado.

:::{div}
:class: afondo
7. `arregla(-3)` escribe «La nota -3 no es posible: la recorto» y devuelve 0: es un error de clase `nota_invalida`, y el manejador recorta la nota entre 0 y 10. `arregla("siete")` también va al manejador `nota_invalida`: al comparar un texto con un número, R convierte el número en texto y compara por orden alfabético. `"siete" < "0"` es `FALSE`, pero `"siete" > "10"` es `TRUE`, porque la `s` va después del `1`. Así que `comprueba()` lanza su error y el manejador intenta `max("siete", 0)`, que da `"siete"`, y `min("siete", 10)`, que da `"10"`: devuelve el texto `"10"`. La lección: `comprueba()` debería empezar por `if (!is.numeric(nota)) stop("la nota tiene que ser un número")`.
8. Con `tryCatch()`, `NA`: el aviso corta el cálculo y el valor es el del manejador. Con `withCallingHandlers()`, 9: el manejador mira el aviso, lo calla con `invokeRestart("muffleWarning")`, y el cálculo sigue hasta el final. `tryCatch()` abandona la expresión para ejecutar el manejador; `withCallingHandlers()` ejecuta el manejador en el mismo punto en que salta el aviso y después deja que la expresión continúe.
:::
