---
title: R como calculadora
subtitle: Expresiones, nombres y los tipos de datos básicos
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Las calculadoras de bolsillo tienen una tecla discreta, **M+**, que guarda el resultado en la memoria para recuperarlo después con **MR**. Sirve para no copiar números a mano entre una cuenta y la siguiente. Pero solo hay una memoria, y nada dice qué guarda.

## La pregunta

¿Cómo se guarda un resultado con un **nombre** que diga qué es, para usarlo más tarde? ¿Y qué clase de cosas se pueden guardar, además de números?

## La idea

R lee **expresiones** y las evalúa: escribes `3 * 4`, R contesta `12`. Para guardar un resultado se le da un nombre con la flecha de asignación, `<-`: `total <- 3 * 4` se lee «total recibe 3 por 4». A partir de ahí, `total` vale 12 en cualquier expresión. Cada valor tiene además un **tipo**: número, número entero, texto o valor lógico (verdadero o falso).

:::{important} El nombre guarda el valor, no la cuenta
`total <- 3 * 4` guarda el **resultado**, 12, no la fórmula. Si después cambias algo de lo que se usó para calcularlo, `total` no se entera. En esto R no se parece a una hoja de cálculo.
:::

## Construcción

### 1 · Las operaciones

Los operadores son los de siempre, con dos añadidos para la división entera: `%/%` da el cociente y `%%` el resto.

```{code-cell} r
7 + 2
7 / 2
7 ^ 2
7 %/% 2
7 %% 2
2 + 3 * 4 ^ 2
```

Las respuestas son `9`, `3.5`, `49`, `3`, `1` y `50`. La última sigue el orden de siempre: primero la potencia (`4 ^ 2` = 16), después el producto (`3 * 16` = 48) y al final la suma. Si quieres otro orden, usa paréntesis: `(2 + 3) * 4` da `20`.

R trae las funciones matemáticas habituales. Se escriben con su nombre y el valor entre paréntesis: `sqrt(16)` da `4`, `round(3.14159, 2)` da `3.14`, `abs(-4)` da `4` y `exp(1)` da `2.718282`. `log()` es el logaritmo neperiano; para otra base, se añade: `log(100, 10)` da `2`.

### 2 · Dar nombre a un resultado

:::{tip} Predice
En el programa de abajo el precio cambia de 40 a 50 en la línea 5. ¿Cuánto vale `final` en la última línea: 34 o 42.5?
:::

```{code-cell} r
precio <- 40
descuento <- 0.15
final <- precio * (1 - descuento)
final
precio <- 50
final
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"El nombre guarda el valor","etiqueta":"asignación · <-","idea":"final se calcula una vez, en la línea 3, con el precio de entonces. Cambiar precio después no recalcula final: R guardó el número, no la fórmula.","columnas":["precio","descuento","final"],"fila_en":"cada_linea"},"archivo":"datos/trazas/01-calculadora-1.json"}
```

`final` sigue valiendo 34. Para que use el precio nuevo hay que volver a ejecutar la línea 3. Fíjate también en la línea 4: escribir solo un nombre hace que R muestre su valor en la consola. Así se consulta una variable.

Los nombres pueden llevar letras, números, puntos y guiones bajos, y no pueden empezar por número. R distingue mayúsculas de minúsculas: `Precio` y `precio` son dos variables distintas. También se puede asignar con `=`, pero la costumbre en R es la flecha, que deja claro hacia dónde va el valor.

### 3 · Los tipos básicos

Todo valor tiene un tipo, y `class()` lo dice. Los cuatro básicos son:

| Tipo | Ejemplos | Para qué |
|---|---|---|
| `numeric` | `1.74`, `3`, `-0.5` | cualquier número, con o sin decimales |
| `integer` | `17L`, `3L` | números enteros; la `L` lo pide de forma explícita |
| `character` | `"Lucía"`, `"3"` | texto, siempre entre comillas |
| `logical` | `TRUE`, `FALSE` | el resultado de una comparación |

:::{tip} Predice
¿Qué dará `as.numeric("hola")`? ¿Un error, un cero o algo distinto?
:::

```{code-cell} r
edad <- 17L
altura <- 1.74
nombre <- "Lucía"
mayor <- edad >= 18
as.numeric("3.5")
as.numeric("hola")
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Cada valor, con su tipo","etiqueta":"tipos · conversión","idea":"Mira la etiqueta de cada variable: integer, numeric, character, logical. Las funciones as.* convierten de un tipo a otro, y cuando no pueden, R da NA y un aviso."},"archivo":"datos/trazas/01-calculadora-2.json"}
```

`as.numeric("3.5")` convierte el texto en número sin problema. Con `"hola"` no puede: devuelve `NA`, que en R significa «valor que falta», y da un aviso, «NAs introducidos por coerción». No es un error. El programa sigue, pero con un hueco donde esperabas un número. Ese hueco se propagará a todas las cuentas que lo usen.

También se puede convertir en la otra dirección: `as.integer(3.9)` da `3`, porque corta los decimales (no redondea), y `as.character(42)` da el texto `"42"`.

:::{div}
:class: afondo
### 4 · Cómo guarda R un número

R guarda los números `numeric` en **coma flotante de doble precisión**: 64 bits por número, el estándar IEEE 754 que usan casi todos los lenguajes. Con 64 bits caben unos 15 o 16 dígitos significativos, y muchos decimales que parecen sencillos, como 0,1, no tienen representación exacta en binario. Por eso pasa esto:

```{code-cell} r
a <- 0.1 + 0.2
a == 0.3
print(a, digits = 17)
isTRUE(all.equal(a, 0.3))
1 / 0
0 / 0
NA + 1
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"0.1 + 0.2 no es 0.3","etiqueta":"a fondo · coma flotante","idea":"La casilla de a muestra 0.3, porque R redondea al mostrar. Pero la comparación con 0.3 da FALSE: con 17 dígitos se ve que a es 0.30000000000000004."},"archivo":"datos/trazas/01-calculadora-3.json"}
```

R muestra 7 dígitos por defecto, y por eso `a` parece valer 0.3. Con 17 dígitos aparece la diferencia: `0.30000000000000004`. La lección práctica es **no comparar decimales con `==`**. Para comparar con una tolerancia se usa `all.equal()`, dentro de `isTRUE()` para que el resultado sea siempre `TRUE` o `FALSE`.

Hay además tres valores especiales que conviene distinguir:

- `Inf` y `-Inf`, el infinito: `1 / 0` da `Inf`. R no se detiene con un error.
- `NaN` (*not a number*), un resultado indefinido: `0 / 0` da `NaN`.
- `NA`, un dato que falta. Contagia todo lo que toca: `NA + 1` es `NA`, e incluso `NA > 3` es `NA`, porque no se sabe.

Los `integer` tienen un límite: el mayor es `.Machine$integer.max`, 2 147 483 647. Si lo sobrepasas, R no da la vuelta como otros lenguajes. Devuelve `NA` con el aviso «NAs producidos por enteros excedidos».
:::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Guardar un resultado y comparar decimales:

| | R | Python | Julia |
|---|---|---|---|
| Asignar | `x <- 0.1 + 0.2` | `x = 0.1 + 0.2` | `x = 0.1 + 0.2` |
| ¿Es igual a 0.3? | `x == 0.3` da `FALSE` | `x == 0.3` da `False` | `x == 0.3` da `false` |
| Comparar con tolerancia | `isTRUE(all.equal(x, 0.3))` | `math.isclose(x, 0.3)` | `isapprox(x, 0.3)` |

Los tres lenguajes guardan los decimales con el mismo estándar, así que fallan exactamente igual en la comparación directa. Cambia la forma de escribirlo, no el fondo.
:::

## Conexiones

- Un número suelto es, en realidad, un **vector** de longitud 1: lo verás en el capítulo siguiente, donde las operaciones de este capítulo se aplican a muchos valores a la vez.
- Los valores **lógicos** de las comparaciones serán la base de los filtros y de las decisiones con `if`.
- El `NA` que aparece al convertir mal un texto volverá en el análisis de datos: los datos reales están llenos de huecos.

## La grieta

Hasta ahora cada nombre guarda un único valor. Pero las notas de una clase, las temperaturas de un mes o los precios de una tienda son muchos valores del mismo tipo. ¿Hay que inventar un nombre para cada uno?

## Ejercicios

1. **El cociente y el resto.** ¿Qué dan `7 %/% 2` y `7 %% 2`? ¿Para qué sirve `%%` si quieres saber si un número es par?

2. **El orden de las operaciones.** Predice y después comprueba: `2 + 3 * 4 ^ 2` y `(2 + 3) * 4`.

3. **Traza a mano.** ¿Qué muestra la última línea?

   ```r
   x <- 5
   y <- x * 2
   x <- 1
   y
   ```

4. **Los tipos.** ¿Qué devuelve `class()` con cada uno de estos valores: `3`, `3L`, `"3"` y `3 > 2`?

5. **De km/h a m/s.** Guarda una velocidad de 72 km/h en una variable y calcula, en otra, su valor en metros por segundo.

:::{div}
:class: afondo
6. **La raíz que no vuelve.** ¿Qué da `sqrt(2)^2 == 2`? Escribe una comparación que sí diga que son iguales.

7. **Lo que no se sabe.** ¿Qué da `NA == NA`? ¿Por qué tiene sentido?
:::

## Solucionario

1. `3` y `1`. Un número es par cuando el resto al dividirlo entre 2 es 0: `n %% 2 == 0`.
2. `50` (primero la potencia, después el producto, al final la suma) y `20`.
3. `10`. `y` se calculó con el valor que tenía `x` en la segunda línea. Cambiar `x` después no la recalcula.
4. `"numeric"`, `"integer"`, `"character"` y `"logical"`.
5. Por ejemplo, `v_kmh <- 72` y `v_ms <- v_kmh * 1000 / 3600`, que da `20`.

:::{div}
:class: afondo
6. `FALSE`, porque `sqrt(2)` no se guarda exacto y al elevarlo al cuadrado sale un número un poco distinto de 2. La comparación con tolerancia es `isTRUE(all.equal(sqrt(2)^2, 2))`, que da `TRUE`.
7. `NA`. Si faltan los dos datos, no se puede saber si son iguales. Para preguntar si un valor falta se usa `is.na()`.
:::
