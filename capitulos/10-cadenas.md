---
title: "Cadenas: trabajar con texto"
subtitle: Medir, cortar, juntar, buscar y cambiar
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Un formulario de inscripción recoge los nombres tal como los escribe cada alumno: uno en minúsculas, otro todo en mayúsculas, otro con un espacio delante sin querer. Antes de hacer las listas de clase, alguien tiene que repasarlos uno a uno: quitar los espacios que sobran, poner la mayúscula inicial y comprobar que no hay nadie apuntado dos veces.

## La pregunta

Para R, `"marta"`, `"MARTA "` y `"Marta"` son tres textos distintos, y `==` lo confirma. ¿Cómo se trabaja con el texto por dentro: medirlo, cortarlo, juntarlo, buscar en él y cambiarlo, para que las tres versiones queden iguales?

## La idea

Un texto en R se llama **cadena** (*string*), porque es una cadena de caracteres, y un vector de tipo `character` guarda una cadena en cada casilla. Las funciones de texto de R están **vectorizadas**: igual que `notas + 0.5` trabaja con todas las notas, `toupper(nombres)` pone en mayúsculas todos los nombres a la vez.

Las herramientas básicas son pocas:

- **medir**: `nchar()` cuenta los caracteres;
- **cambiar mayúsculas y minúsculas**: `toupper()` y `tolower()`;
- **limpiar**: `trimws()` quita los espacios del principio y del final;
- **cortar**: `substr(x, inicio, fin)` saca un trozo, contando los caracteres desde 1;
- **juntar**: `paste()` une textos con un espacio en medio, y `paste0()`, sin nada en medio;
- **buscar y cambiar**: `grepl()` dice si un texto contiene un patrón, y `sub()` y `gsub()` lo cambian por otro.

:::{important} Un espacio también es un carácter
`"Marta "` tiene seis caracteres: el sexto es un espacio. No se ve al imprimir, pero `==` lo tiene en cuenta. Muchos errores al cruzar datos vienen de espacios invisibles, y `trimws()` es la primera limpieza.
:::

## Construcción

### 1 · Medir, cortar y juntar

```{code-cell} r
x <- "Marta García"
nchar(x)
toupper(x)
substr(x, 1, 5)
paste("Hola,", x)
paste0("alumno_", 1:3)
paste(c("a", "b", "c"), collapse = "-")
```

`nchar(x)` da `12`: once letras y un espacio. `toupper(x)` da `"MARTA GARCÍA"`, con la tilde y todo. `substr(x, 1, 5)` saca los caracteres del 1 al 5: `"Marta"`.

`paste()` junta con un espacio: `"Hola, Marta García"`. `paste0()` junta sin nada en medio y se recicla como cualquier operación vectorizada: `paste0("alumno_", 1:3)` da `"alumno_1" "alumno_2" "alumno_3"`. Con `collapse`, `paste()` hace lo contrario: junta todas las casillas de un vector en un solo texto, `"a-b-c"`.

Para escribir números dentro de un texto con un formato concreto se usa `sprintf()`: `sprintf("%s ha sacado un %.2f", "Marta", 7.166667)` da `"Marta ha sacado un 7.17"`. `%s` es el sitio de un texto y `%.2f`, el de un número con dos decimales.

### 2 · Limpiar una lista de nombres

Este es el programa estrella del capítulo. Recorre los nombres del formulario y deja cada uno limpio: sin espacios a los lados, con la primera letra en mayúscula y el resto en minúscula.

:::{tip} Predice
¿Cuántos nombres distintos quedarán al final? ¿Qué le pasa a `" Pau"`?
:::

```{code-cell} r
nombres <- c("marta", "MARTA ", " Pau", "sara")
limpios <- character(length(nombres))
for (i in seq_along(nombres)) {
  x <- trimws(nombres[i])
  limpios[i] <- paste0(toupper(substr(x, 1, 1)), tolower(substr(x, 2, nchar(x))))
}
limpios
unique(limpios)
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Nombres limpios","etiqueta":"cadenas","idea":"Mira las comillas de cada nombre: ahí se ven los espacios que sobran. En cada vuelta, x es el nombre sin espacios; después se junta su primera letra en mayúscula con el resto en minúscula.","foco":"limpios","puntero":"i","columnas":["i","nombres[i]","x","limpios[i]"],"fila_en":"fin_iteracion"},"archivo":"datos/trazas/10-cadenas-1.json"}
```

En cada vuelta pasan tres cosas. `trimws()` quita los espacios de los lados: `"MARTA "` se queda en `"MARTA"` y `" Pau"`, en `"Pau"`. `substr(x, 1, 1)` es la primera letra, que pasa a mayúscula, y `substr(x, 2, nchar(x))` es el resto, que pasa a minúscula. `paste0()` los junta.

Al final, `limpios` vale `"Marta" "Marta" "Pau" "Sara"`, y `unique()` deja **tres** nombres distintos: las dos Martas eran la misma persona.

El bucle ayuda a ver los pasos, pero no hace falta: como las funciones están vectorizadas, la misma limpieza se hace en una línea con el vector entero. `x <- trimws(nombres)` y después `paste0(toupper(substr(x, 1, 1)), tolower(substr(x, 2, nchar(x))))` dan el mismo resultado.

### 3 · Partir un texto

`strsplit(x, separador)` corta cada texto por donde aparece el separador. Como cada texto puede dar un número distinto de trozos, el resultado es una **lista**, con un vector de trozos por cada texto:

```{code-cell} r
alumnos <- c("García, Marta", "Puig, Pau")
partes <- strsplit(alumnos, ", ")
apellidos <- sapply(partes, function(p) p[1])
nombres <- sapply(partes, function(p) p[2])
```

```{anywidget} ../widgets/traza-r.mjs
{"config":{"titulo":"Apellido, nombre","etiqueta":"strsplit","idea":"strsplit() devuelve una lista: una caja por alumno, con sus trozos dentro. sapply() saca de cada caja el trozo que se le pide."},"archivo":"datos/trazas/10-cadenas-2.json"}
```

`partes` es una lista de dos elementos, y cada uno es un vector con dos trozos: `"García" "Marta"` y `"Puig" "Pau"`. `sapply()` aplica una función pequeña a cada elemento de la lista (capítulo 7): la primera se queda con el trozo 1 y la segunda, con el 2. Así salen `apellidos`, `"García" "Puig"`, y `nombres`, `"Marta" "Pau"`.

### 4 · Buscar y cambiar con patrones

`grepl(patrón, x)` dice, para cada texto, si contiene el patrón: devuelve un vector lógico, listo para usar como filtro. `sub()` cambia la primera aparición del patrón y `gsub()`, todas.

```{code-cell} r
nombres <- c("Marta", "Pau", "Sara", "Mireia")
grepl("^M", nombres)
nombres[grepl("a$", nombres)]
sub("a", "o", "banana")
gsub("a", "o", "banana")
gsub("[0-9]", "", "R2D2")
```

El patrón es una **expresión regular**, un pequeño lenguaje para describir textos. Unas pocas piezas dan mucho juego:

| Pieza | Significa | Ejemplo |
|---|---|---|
| `^` | el principio del texto | `"^M"`: empieza por M |
| `$` | el final del texto | `"a$"`: acaba en a |
| `.` | cualquier carácter | `"M.r"`: Mar, Mir, Mor… |
| `[ ]` | uno de estos caracteres | `"[0-9]"`: una cifra |
| `+` | lo anterior, una o más veces | `"[0-9]+"`: un número entero |

Con ellas, `grepl("^M", nombres)` da `TRUE FALSE FALSE TRUE`, porque Marta y Mireia empiezan por M, y `nombres[grepl("a$", nombres)]` da los que acaban en «a»: `"Marta" "Sara" "Mireia"`. `sub("a", "o", "banana")` da `"bonana"`, y `gsub()`, `"bonono"`. `gsub("[0-9]", "", "R2D2")` borra las cifras: `"RD"`.

::::{div}
:class: afondo
### 5 · Expresiones regulares y caracteres

**El punto que no es un punto.** En una expresión regular, `.` significa «cualquier carácter». Por eso `gsub(".", "", "3.5")` no quita el punto: lo borra todo y da `""`. Si quieres buscar el texto tal cual, sin expresión regular, se añade `fixed = TRUE`: `gsub(".", "", "3.5", fixed = TRUE)` da `"35"`.

**Clases y grupos.** `\\d` es cualquier cifra y `\\w`, cualquier letra, cifra o guion bajo. Se escriben con dos barras porque, dentro de las comillas de R, la barra también es especial. Los paréntesis forman **grupos**, y en el reemplazo `\\1` y `\\2` son lo que encontró cada grupo:

```r
sub("(\\w+), (\\w+)", "\\2 \\1", "García, Marta")    # "Marta García": se intercambian los grupos
gsub("\\d+", "#", "aula 12, planta 3")               # "aula #, planta #"
```

Para sacar lo que encaja con un patrón, en lugar de cambiarlo, se usa `regmatches()` con `gregexpr()`: con el patrón `"[0-9]+"`, de `"aula 12, planta 3"` salen `"12"` y `"3"`.

**Caracteres y bytes.** R guarda el texto en UTF-8, la codificación que usa casi todo hoy, y en UTF-8 una letra como la «ñ» ocupa dos bytes. `nchar("año")` cuenta caracteres y da `3`; `nchar("año", type = "bytes")` cuenta bytes y da `4`. Gracias a eso, `toupper("ñandú")` da `"ÑANDÚ"`. Si alguna vez ves letras raras, como `Ã±` en lugar de `ñ`, es un archivo leído con la codificación equivocada.

:::{tip} Para saber más
En la parte III aparecerá **stringr**, el paquete del tidyverse para cadenas. Todas sus funciones empiezan por `str_` (`str_detect()`, `str_replace_all()`, `str_split()`…) y reciben siempre el texto como primer argumento, lo que las hace más fáciles de recordar. Por dentro usan las mismas expresiones regulares.
:::
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
| | R | Python | Julia |
|---|---|---|---|
| Juntar | `paste0(a, b)` | `a + b` | `a * b` |
| Mayúsculas | `toupper(x)` | `x.upper()` | `uppercase(x)` |
| Cambiar todas | `gsub("a", "o", x)` | `x.replace("a", "o")` | `replace(x, "a" => "o")` |
| Longitud | `nchar(x)` | `len(x)` | `length(x)` |

En Python y en Julia, una cadena es un solo valor, y para trabajar con muchas hay que recorrerlas. En R, las funciones de texto trabajan con vectores enteros. Una curiosidad: Julia junta textos con `*`, porque en matemáticas la suma se reserva para operaciones conmutativas, y juntar textos no lo es.
:::

## Conexiones

- En la parte III, limpiar columnas de texto es lo primero que se hace con unos datos reales: nombres, códigos postales, categorías mal escritas. **stringr** y las expresiones regulares serán el día a día.
- `sprintf()` y `paste()` son la base de los informes automáticos: frases que se escriben solas con los números de cada alumno.
- Las expresiones regulares no son de R: las mismas piezas funcionan en Python, en Julia, en los editores de texto y en la línea de órdenes.

## La grieta

En el formulario también había una fecha de nacimiento, guardada como texto: `"10/1/2024"`, `"9/12/2023"`. Prueba a compararlas: `"10/1/2024" < "9/12/2023"` da `TRUE`, porque compara carácter a carácter y el «1» va antes que el «9». Con fechas en texto no se puede ordenar, ni restar para saber cuántos días han pasado, ni saber qué día de la semana era. Hace falta un tipo de dato que entienda el calendario: las [**fechas**](11-fechas.md).

## Ejercicios

1. **¿Qué imprime?** Primero en papel y después en R.

   ```r
   nchar("Hola mundo")
   toupper("r")
   ```

2. **Juntar.** ¿Qué dan `paste("Hola", "Marta")`, `paste0("Hola", "Marta")` y `paste(c("x", "y", "z"), collapse = "")`?

3. **Iniciales.** Con `nombres <- c("Marta", "Pau", "Sara")`, escribe una línea que dé sus iniciales.

4. **Empiezan por A.** Con `x <- c("Ana", "Berta", "Alba")`, ¿qué da `grepl("^A", x)`? Escribe la línea que cuenta cuántos empiezan por A.

5. **Códigos sin guiones.** Escribe una línea que convierta `"AB-12-34"` en `"AB1234"`.

6. **Una frase con números.** Con `sprintf()`, escribe la frase `"Marta: 7.17"` a partir de `"Marta"` y de `7.166667`.

:::{div}
:class: afondo
7. **El punto.** ¿Qué dan `gsub(".", "", "3.5")` y `gsub(".", "", "3.5", fixed = TRUE)`? ¿Por qué son distintos?

8. **La eñe.** ¿Qué dan `nchar("año")` y `nchar("año", type = "bytes")`?
:::

## Solucionario

1. `10`, porque el espacio también cuenta. Y `"R"`.
2. `"Hola Marta"`, `"HolaMarta"` y `"xyz"`.
3. `substr(nombres, 1, 1)`, que da `"M" "P" "S"`. Como `substr()` está vectorizada, no hace falta bucle.
4. `TRUE FALSE TRUE`. Para contar, `sum(grepl("^A", x))`, que da `2`.
5. `gsub("-", "", "AB-12-34")`. Con `sub()` solo se quitaría el primer guion.
6. `sprintf("%s: %.2f", "Marta", 7.166667)`, que da `"Marta: 7.17"`.

:::{div}
:class: afondo
7. La primera da `""`: el punto es una expresión regular que significa «cualquier carácter», y lo borra todo. La segunda da `"35"`: con `fixed = TRUE`, el punto es un punto.
8. `3` caracteres y `4` bytes: en UTF-8, la «ñ» ocupa dos bytes.
:::
