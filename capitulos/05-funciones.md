---
title: "Funciones: poner nombre a un trozo de código"
subtitle: Escribirlo una vez, usarlo siempre
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En una cocina, la receta del sofrito no se reescribe cada vez que hace falta. Está en una ficha con un nombre, y cada plato dice «haz un sofrito con esta cebolla y este tomate». Los ingredientes cambian; la receta es la misma. Y si un día se mejora, se cambia en la ficha y mejoran todos los platos.

## La pregunta

Al final del capítulo anterior teníamos un bloque que convierte una nota en una palabra. Si lo necesitamos en tres programas, copiarlo tres veces es pedir problemas: el día que el aprobado pase al 6, habrá que acordarse de los tres sitios. ¿Cómo se guarda un trozo de código con un nombre, como la ficha de la receta, para usarlo con datos distintos?

## La idea

Una **función** es un trozo de código con nombre. Se crea con `function` y se guarda con `<-`, como cualquier otro valor:

```r
nombre <- function(argumentos) {
  cuerpo
}
```

- Los **argumentos** son los ingredientes: nombres que, en cada uso, reciben un valor distinto.
- **Llamar** a la función es usarla: `nombre(valores)`.
- La función **devuelve** el valor de la última línea que ejecuta.

:::{important} Cada llamada tiene su propio espacio
Al llamar a una función, R le prepara un espacio propio en la memoria. Ahí viven sus argumentos y las variables que crea. Cuando la función termina, ese espacio desaparece: lo único que sale de ella es el valor que devuelve.
:::

## Construcción

### 1 · Tu primera función

`iva()` calcula el precio final de un producto. Su segundo argumento trae un valor **por defecto**, el 21 %, que se usa cuando no se dice otra cosa.

:::{tip} Predice
Cuando la línea 5 llama a `iva(100)`, ¿dónde se crea `impuesto`? ¿Seguirá existiendo cuando el programa llegue a la línea 7?
:::

```{code-cell} r
iva <- function(precio, tipo = 0.21) {
  impuesto <- precio * tipo
  precio + impuesto
}
p <- iva(100)
q <- iva(50, tipo = 0.10)
p + q
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Dentro de una función","etiqueta":"llamada · marco","idea":"En cada llamada aparece una caja nueva con los argumentos de la función. La línea que llama se queda esperando, marcada con una raya discontinua. Al devolver el resultado, la caja desaparece con todo lo que había dentro."},"traza":{"codigo":"iva <- function(precio, tipo = 0.21) {\n  impuesto <- precio * tipo\n  precio + impuesto\n}\np <- iva(100)\nq <- iva(50, tipo = 0.10)\np + q","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"iva":{"t":"function"}},"salida":"","nfilas":0},{"linea":1,"tipo":"llamada","funcion":"iva","estado":{"iva":{"t":"function"}},"marcos":[{"id":1,"nombre":"iva","llamada":"iva(precio = 100, tipo = 0.21)","desde":5,"vars":{"precio":{"t":"numeric","v":["100"]},"tipo":{"t":"numeric","v":["0.21"]}}}],"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"iva":{"t":"function"}},"marcos":[{"id":1,"nombre":"iva","llamada":"iva(precio = 100, tipo = 0.21)","desde":5,"vars":{"precio":{"t":"numeric","v":["100"]},"tipo":{"t":"numeric","v":["0.21"]},"impuesto":{"t":"numeric","v":["21"]}}}],"salida":"","nfilas":0},{"linea":3,"tipo":"devuelve","funcion":"iva","desde":5,"valor":"121","estado":{"iva":{"t":"function"}},"marcos":[{"id":1,"nombre":"iva","llamada":"iva(precio = 100, tipo = 0.21)","desde":5,"vars":{"precio":{"t":"numeric","v":["100"]},"tipo":{"t":"numeric","v":["0.21"]},"impuesto":{"t":"numeric","v":["21"]}}}],"salida":"","nfilas":0},{"linea":5,"tipo":"linea","estado":{"iva":{"t":"function"},"p":{"t":"numeric","v":["121"]}},"salida":"","nfilas":0},{"linea":1,"tipo":"llamada","funcion":"iva","estado":{"iva":{"t":"function"},"p":{"t":"numeric","v":["121"]}},"marcos":[{"id":2,"nombre":"iva","llamada":"iva(precio = 50, tipo = 0.1)","desde":6,"vars":{"precio":{"t":"numeric","v":["50"]},"tipo":{"t":"numeric","v":["0.1"]}}}],"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"iva":{"t":"function"},"p":{"t":"numeric","v":["121"]}},"marcos":[{"id":2,"nombre":"iva","llamada":"iva(precio = 50, tipo = 0.1)","desde":6,"vars":{"precio":{"t":"numeric","v":["50"]},"tipo":{"t":"numeric","v":["0.1"]},"impuesto":{"t":"numeric","v":["5"]}}}],"salida":"","nfilas":0},{"linea":3,"tipo":"devuelve","funcion":"iva","desde":6,"valor":"55","estado":{"iva":{"t":"function"},"p":{"t":"numeric","v":["121"]}},"marcos":[{"id":2,"nombre":"iva","llamada":"iva(precio = 50, tipo = 0.1)","desde":6,"vars":{"precio":{"t":"numeric","v":["50"]},"tipo":{"t":"numeric","v":["0.1"]},"impuesto":{"t":"numeric","v":["5"]}}}],"salida":"","nfilas":0},{"linea":6,"tipo":"linea","estado":{"iva":{"t":"function"},"p":{"t":"numeric","v":["121"]},"q":{"t":"numeric","v":["55"]}},"salida":"","nfilas":0},{"linea":7,"tipo":"linea","estado":{"iva":{"t":"function"},"p":{"t":"numeric","v":["121"]},"q":{"t":"numeric","v":["55"]}},"salida":"[1] 176\n","nfilas":0}],"filas":[]}}
```

Lo que pasa en cada llamada:

1. R crea el espacio de la función y pone en él los argumentos: `precio` vale 100 y `tipo` vale 0.21, el valor por defecto.
2. El cuerpo se ejecuta ahí dentro: `impuesto` se crea **en el espacio de la función**, no en el programa principal.
3. La última línea, `precio + impuesto`, da 121. Eso es lo que devuelve la función.
4. El espacio desaparece, y la línea 5 recibe el 121 y lo guarda en `p`.

La segunda llamada repite el proceso con otros valores y devuelve 55. Al final, `p + q` da `176`. Y `impuesto` ya no existe: si escribes `impuesto` después del programa, R contesta «objeto 'impuesto' no encontrado».

### 2 · Tres maneras de dar los argumentos

R reparte los valores entre los argumentos de tres maneras:

- **por posición**: en el orden en que están definidos, `iva(50, 0.10)`;
- **por nombre**: en cualquier orden, `iva(tipo = 0.10, precio = 50)`;
- **por defecto**: si no das un argumento que tiene valor por defecto, se usa ese valor, como en `iva(100)`.

```{code-cell} r
iva(50, 0.10)
iva(tipo = 0.10, precio = 50)
iva(c(10, 20, 30))
```

Las dos primeras llamadas dan `55`. La tercera da `12.1 24.2 36.3`: como el cuerpo de `iva()` solo usa operaciones vectorizadas, la función entera también trabaja con vectores, sin escribir ningún bucle (capítulo 2).

`precio` no tiene valor por defecto, así que es obligatorio: `iva()` da el error «el argumento "precio" está ausente, sin valor por omisión».

### 3 · Lo que pasa dentro se queda dentro

¿Qué pasa si dentro de una función se usa un nombre que ya existe fuera? Es otra variable. Vive en el espacio de la función, aunque se llame igual, y la de fuera no se toca. Esto se llama **ámbito**: cada nombre pertenece al espacio donde se crea.

```{code-cell} r
total <- 0
sumar_iva <- function(precio) {
  total <- precio * 1.21
  total
}
r <- sumar_iva(10)
total
r
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Dos variables que se llaman igual","etiqueta":"ámbito","idea":"Fíjate en las dos cajas: el total de la función nace dentro de su espacio y desaparece con ella. El total del programa principal vale 0 de principio a fin."},"traza":{"codigo":"total <- 0\nsumar_iva <- function(precio) {\n  total <- precio * 1.21\n  total\n}\nr <- sumar_iva(10)\ntotal\nr","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"total":{"t":"numeric","v":["0"]}},"salida":"","nfilas":0},{"linea":2,"tipo":"linea","estado":{"total":{"t":"numeric","v":["0"]},"sumar_iva":{"t":"function"}},"salida":"","nfilas":0},{"linea":2,"tipo":"llamada","funcion":"sumar_iva","estado":{"total":{"t":"numeric","v":["0"]},"sumar_iva":{"t":"function"}},"marcos":[{"id":1,"nombre":"sumar_iva","llamada":"sumar_iva(precio = 10)","desde":6,"vars":{"precio":{"t":"numeric","v":["10"]}}}],"salida":"","nfilas":0},{"linea":3,"tipo":"linea","estado":{"total":{"t":"numeric","v":["0"]},"sumar_iva":{"t":"function"}},"marcos":[{"id":1,"nombre":"sumar_iva","llamada":"sumar_iva(precio = 10)","desde":6,"vars":{"precio":{"t":"numeric","v":["10"]},"total":{"t":"numeric","v":["12.1"]}}}],"salida":"","nfilas":0},{"linea":4,"tipo":"devuelve","funcion":"sumar_iva","desde":6,"valor":"12.1","estado":{"total":{"t":"numeric","v":["0"]},"sumar_iva":{"t":"function"}},"marcos":[{"id":1,"nombre":"sumar_iva","llamada":"sumar_iva(precio = 10)","desde":6,"vars":{"precio":{"t":"numeric","v":["10"]},"total":{"t":"numeric","v":["12.1"]}}}],"salida":"","nfilas":0},{"linea":6,"tipo":"linea","estado":{"total":{"t":"numeric","v":["0"]},"sumar_iva":{"t":"function"},"r":{"t":"numeric","v":["12.1"]}},"salida":"","nfilas":0},{"linea":7,"tipo":"linea","estado":{"total":{"t":"numeric","v":["0"]},"sumar_iva":{"t":"function"},"r":{"t":"numeric","v":["12.1"]}},"salida":"[1] 0\n","nfilas":0},{"linea":8,"tipo":"linea","estado":{"total":{"t":"numeric","v":["0"]},"sumar_iva":{"t":"function"},"r":{"t":"numeric","v":["12.1"]}},"salida":"[1] 0\n[1] 12.1\n","nfilas":0}],"filas":[]}}
```

Dentro de `sumar_iva()`, `total` vale 12.1. Fuera, sigue valiendo `0`, y `r` vale `12.1`. La única puerta de salida de una función es el valor que devuelve. Gracias a eso, puedes usar una función sin preocuparte de qué nombres usa por dentro.

Al revés sí funciona: si la función usa un nombre que no tiene en su espacio, R lo busca fuera, en el programa principal. Funciona, pero es mejor que todo lo que una función necesita le llegue por sus argumentos. Así se entiende sin mirar el resto del programa.

### 4 · Devolver antes de tiempo: `return()`

Una función devuelve el valor de la última línea que ejecuta. Si quieres terminar antes, `return(valor)` sale de la función en ese momento y devuelve ese valor. Es útil para despachar los casos especiales al principio:

```{code-cell} r
calificar <- function(nota) {
  if (is.na(nota)) {
    return("sin nota")
  }
  if (nota >= 5) "aprobado" else "suspendido"
}
calificar(NA)
calificar(6)
```

`calificar(NA)` da `"sin nota"` y no llega a comparar nada: así se evita el error del `if` con `NA` del capítulo 4. `calificar(6)` da `"aprobado"`.

Esta versión pide una sola nota, porque usa `if`. La versión para vectores enteros es la del `ifelse()` anidado del capítulo anterior. Con ella dentro, la función queda así: `calificar <- function(nota) ifelse(nota >= 9, "sobresaliente", ifelse(nota >= 5, "aprobado", "suspendido"))`. `calificar(c(4.2, 7, 3.5, 9.1))` da `"suspendido" "aprobado" "suspendido" "sobresaliente"`. El día que el aprobado pase al 6, se cambia en un solo sitio.

::::{div}
:class: afondo
### 5 · Una función que se llama a sí misma

Una función puede llamarse a sí misma. Es la **recursión**. El factorial de 3 es 3 · 2 · 1, y se puede definir así: el factorial de 1 es 1, y el de cualquier otro número es ese número por el factorial del anterior.

:::{tip} Predice
Para calcular `factorial(3)`, ¿cuántas cajas de `factorial` llegan a estar abiertas a la vez?
:::

```{code-cell} r
factorial <- function(n) {
  if (n <= 1) {
    return(1)
  }
  n * factorial(n - 1)
}
factorial(3)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"La pila de llamadas","etiqueta":"a fondo · recursión","idea":"Cada llamada abre una caja encima de la anterior, y la de abajo espera. Al llegar a n = 1 se empieza a devolver: 1, después 2 · 1 y al final 3 · 2. Cada caja se cierra al devolver su resultado."},"traza":{"codigo":"factorial <- function(n) {\n  if (n <= 1) {\n    return(1)\n  }\n  n * factorial(n - 1)\n}\nfactorial(3)","pasos":[{"linea":null,"tipo":"inicio","estado":{},"salida":"","nfilas":0},{"linea":1,"tipo":"linea","estado":{"factorial":{"t":"function"}},"salida":"","nfilas":0},{"linea":1,"tipo":"llamada","funcion":"factorial","estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}}],"salida":"","nfilas":0},{"linea":2,"tipo":"condicion","cond":{"texto":"n <= 1","valores":"3 <= 1","valor":"FALSE"},"estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}}],"salida":"","nfilas":0},{"linea":1,"tipo":"llamada","funcion":"factorial","estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}},{"id":2,"nombre":"factorial","llamada":"factorial(n = 2)","desde":5,"vars":{"n":{"t":"numeric","v":["2"]}}}],"salida":"","nfilas":0},{"linea":2,"tipo":"condicion","cond":{"texto":"n <= 1","valores":"2 <= 1","valor":"FALSE"},"estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}},{"id":2,"nombre":"factorial","llamada":"factorial(n = 2)","desde":5,"vars":{"n":{"t":"numeric","v":["2"]}}}],"salida":"","nfilas":0},{"linea":1,"tipo":"llamada","funcion":"factorial","estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}},{"id":2,"nombre":"factorial","llamada":"factorial(n = 2)","desde":5,"vars":{"n":{"t":"numeric","v":["2"]}}},{"id":3,"nombre":"factorial","llamada":"factorial(n = 1)","desde":5,"vars":{"n":{"t":"numeric","v":["1"]}}}],"salida":"","nfilas":0},{"linea":2,"tipo":"condicion","cond":{"texto":"n <= 1","valores":"1 <= 1","valor":"TRUE"},"estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}},{"id":2,"nombre":"factorial","llamada":"factorial(n = 2)","desde":5,"vars":{"n":{"t":"numeric","v":["2"]}}},{"id":3,"nombre":"factorial","llamada":"factorial(n = 1)","desde":5,"vars":{"n":{"t":"numeric","v":["1"]}}}],"salida":"","nfilas":0},{"linea":3,"tipo":"devuelve","funcion":"factorial","desde":5,"valor":"1","estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}},{"id":2,"nombre":"factorial","llamada":"factorial(n = 2)","desde":5,"vars":{"n":{"t":"numeric","v":["2"]}}},{"id":3,"nombre":"factorial","llamada":"factorial(n = 1)","desde":5,"vars":{"n":{"t":"numeric","v":["1"]}}}],"salida":"","nfilas":0},{"linea":5,"tipo":"devuelve","funcion":"factorial","desde":5,"valor":"2","estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}},{"id":2,"nombre":"factorial","llamada":"factorial(n = 2)","desde":5,"vars":{"n":{"t":"numeric","v":["2"]}}}],"salida":"","nfilas":0},{"linea":5,"tipo":"devuelve","funcion":"factorial","desde":7,"valor":"6","estado":{"factorial":{"t":"function"}},"marcos":[{"id":1,"nombre":"factorial","llamada":"factorial(n = 3)","desde":7,"vars":{"n":{"t":"numeric","v":["3"]}}}],"salida":"","nfilas":0},{"linea":7,"tipo":"linea","estado":{"factorial":{"t":"function"}},"salida":"[1] 6\n","nfilas":0}],"filas":[]}}
```

Llegan a estar abiertas **tres** cajas a la vez: `factorial(3)` espera a `factorial(2)`, que espera a `factorial(1)`. Esa torre de llamadas pendientes se llama **pila de llamadas**. `factorial(1)` devuelve 1 sin llamar a nadie: es el **caso base**, el que detiene la recursión. Después cada caja recibe su resultado, multiplica y devuelve: 2 y, por último, `6`.

Sin caso base, la función se llamaría sin fin, y R se detendría al llenarse la pila. Para el factorial, un bucle o la función de R `factorial()` son más rápidos. La recursión brilla en problemas que se parten en trozos iguales al original pero más pequeños, como recorrer las carpetas de un disco.

Aquí el programa crea su propio `factorial`, que tapa al de R mientras exista: dentro de este programa, `factorial` es el nuestro. Es otro efecto del ámbito.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Una función que eleva al cuadrado:

| R | Python | Julia |
|---|---|---|
| `cuadrado <- function(x) x^2` | `def cuadrado(x): return x ** 2` | `cuadrado(x) = x^2` |

En R una función es un valor más, que se guarda con `<-` como un número. Python tiene una palabra propia para definirla, `def`, y Julia admite esta forma corta o la larga, con `function` y `end`. R y Julia devuelven solos el valor de la última línea. Python necesita `return`: sin él, la función devuelve `None`.
:::

## Conexiones

- `sapply(notas, calificar)` aplica una función a cada elemento de un vector: es el comienzo de la **programación funcional** de la parte IV.
- Un **paquete** de R, como dplyr o ggplot2, es una colección de funciones escritas por otros y bien documentadas. En la parte V escribirás el tuyo.
- Todo lo que has usado hasta ahora, `c()`, `sum()`, `ifelse()` o `which()`, son funciones. Ahora sabes cómo están hechas por dentro.

## La grieta

`calificar()` convierte las notas en palabras: `"suspendido"`, `"aprobado"` y `"sobresaliente"`. Pero prueba a ordenarlas con `sort()`. Sale `"aprobado" "sobresaliente" "suspendido"`, por orden alfabético, cuando lo natural es de peor a mejor. Para R son textos sueltos, sin orden ni lista cerrada de valores posibles. Hace falta un tipo de dato para las categorías: los **factores**, con los que empieza la parte II.

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   doble <- function(x) x * 2
   doble(doble(3))
   ```

2. **El área.** Escribe una función `area_circulo(r)` que devuelva el área de un círculo de radio `r` (en R, el número π es `pi`). ¿Cuánto da `area_circulo(2)`?

3. **Saludos.** Escribe `saludo(nombre, saludo = "Hola")` que devuelva el saludo y el nombre juntos con `paste()`. ¿Qué dan `saludo("Marta")` y `saludo("Pau", "Bon dia")`?

4. **¿Quién es `x`?** Predice qué dan las dos últimas líneas.

   ```r
   x <- 10
   f <- function() {
     x <- 1
     x + 1
   }
   f()
   x
   ```

5. **Grados.** Escribe `a_fahrenheit(c)`, que pase de grados Celsius a Fahrenheit con la fórmula F = C · 9/5 + 32, y pruébala con el vector `c(0, 100, 37)` sin escribir ningún bucle.

6. **El aprobado al 6.** Copia la versión de `calificar()` con `ifelse()` y cambia el aprobado al 6. ¿Qué da ahora `calificar(c(5.5, 6, 9.5))`?

:::{div}
:class: afondo
7. **Sumar hasta n.** Escribe una función recursiva `suma_hasta(n)` que devuelva 0 si `n` es 0 y, si no, `n + suma_hasta(n - 1)`. ¿Cuánto da `suma_hasta(4)`? ¿Cuántas llamadas llegan a estar abiertas a la vez?

8. **Fibonacci.** Con `fib <- function(k) if (k <= 2) 1 else fib(k - 1) + fib(k - 2)`, ¿cuánto da `fib(5)`? Cuenta en papel cuántas veces se llama a `fib` en total.
:::

## Solucionario

1. `12`. Primero `doble(3)` da 6, y después `doble(6)` da 12.
2. `area_circulo <- function(r) pi * r^2`. `area_circulo(2)` da `12.56637`.
3. `saludo <- function(nombre, saludo = "Hola") paste(saludo, nombre)`. Dan `"Hola Marta"` y `"Bon dia Pau"`.
4. `f()` da `2`, porque usa su propia `x`, que vale 1. Y `x` sigue valiendo `10`: la `x` de la función desaparece al terminar.
5. `a_fahrenheit <- function(c) c * 9/5 + 32`. Con el vector da `32.0 212.0 98.6`.
6. Con `nota >= 6` en el segundo `ifelse()` da `"suspendido" "aprobado" "sobresaliente"`. Solo cambia una línea, y todos los programas que usan `calificar()` se enteran.

:::{div}
:class: afondo
7. `suma_hasta <- function(n) if (n == 0) 0 else n + suma_hasta(n - 1)`. `suma_hasta(4)` da `10`. Llegan a estar abiertas cinco llamadas: con `n` igual a 4, 3, 2, 1 y 0.
8. `fib(5)` da `5`, y `fib` se llama **9 veces**: una para el 5, una para el 4, dos para el 3, tres para el 2 y dos para el 1. Algunas se repiten, como `fib(3)`, que se calcula dos veces. Por eso esta versión es tan lenta con números grandes.
:::
