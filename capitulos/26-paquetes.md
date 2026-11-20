---
title: "Paquetes: tu código, listo para instalar"
subtitle: Funciones, documentación y pruebas juntas, para usarlas en cualquier proyecto
kernelspec:
  name: ir
  display_name: R
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En un taller hay herramientas sueltas por la mesa y herramientas en una caja. Las sueltas sirven igual, pero cada vez que cambias de obra hay que buscarlas, y siempre falta alguna. La caja tiene un sitio para cada herramienta, una etiqueta en la tapa con lo que lleva y unas instrucciones dentro. Te la llevas entera, y si alguien te la pide, se la prestas tal cual.

Nuestras funciones están todavía sueltas por la mesa. `nota_final()` vive en el informe del capítulo 25; si la queremos en otro informe, la copiamos y la pegamos. Y si un día la corregimos, hay que acordarse de corregir todas las copias.

## La pregunta

¿Cómo se juntan las funciones, su documentación y sus pruebas en una sola pieza que se instale con una orden, como dplyr o ggplot2? ¿Qué archivos hay dentro, y quién los escribe? ¿Y cómo se comprueba que todo está bien antes de dárselo a otra persona?

## La idea

Un **paquete** de R es una carpeta con una forma fija. Lo mínimo es esto:

- `DESCRIPTION`: la ficha del paquete, con su nombre, título, versión, autoría, licencia y los paquetes que necesita;
- `R/`: el código, en archivos `.R` que definen funciones;
- `NAMESPACE`: la lista de funciones que ve quien carga el paquete, las **exportadas**;
- `man/`: las páginas de ayuda, las que abre `?nota_final`;
- `tests/testthat/`: las pruebas del capítulo 24.

No hace falta escribir esa estructura a mano. Dos paquetes la mantienen por nosotros: **usethis** crea los archivos (`create_package()`, `use_r()`, `use_test()`…) y **devtools** hace el trabajo diario: `load_all()` para probar, `document()` para escribir la ayuda, `test()` para pasar las pruebas, `check()` para la revisión completa e `install()` para instalar. La documentación se escribe en comentarios especiales encima de cada función, que empiezan por `#'`; el paquete **roxygen2** los convierte en las páginas de ayuda y en el `NAMESPACE`.

:::{important} El ciclo de trabajo
Escribir el código en `R/`, `load_all()` para probarlo, `document()` si han cambiado los comentarios `#'`, y `test()`. Otra vez. Y antes de compartirlo, `check()`. Con eso, el paquete no depende de lo que tengas en tu sesión: todo lo que necesita está escrito en sus archivos, como un informe de Quarto.
:::

## Construcción

### 1 · Un paquete de principio a fin

Este es el programa estrella del capítulo: once pasos que convierten `nota_final()`, la función del capítulo 24, en un paquete instalado, documentado y probado. Casi todos son órdenes que se escriben en la consola de R; en dos de ellos, además, se escribe en un archivo. El visualizador enseña lo que pasó al ejecutarlas de verdad, en una carpeta de prueba.

:::{tip} Predice
Después de `create_package("notas")`, ¿qué archivos crees que hay en la carpeta? ¿Y cuál de las órdenes escribe la página de ayuda de `nota_final()`? Míralo en el árbol de archivos, paso a paso.
:::

```{anywidget} ../widgets/paquete.mjs
{"config":{"titulo":"Un paquete de principio a fin","etiqueta":"usethis · devtools","idea":"Cada orden crea o cambia archivos en la carpeta notas/. Mira el árbol: lo nuevo lleva la marca «nuevo»; lo que cambia, «cambia». A la derecha, el archivo que importa en cada paso y lo que escribe la consola.","guion":"26-paquetes-1"},"archivo":"datos/paquetes/26-paquetes-1.json"}
```

Los once pasos, en cuatro etapas:

- **El esqueleto.** `create_package("notas")` crea la carpeta con `DESCRIPTION`, `NAMESPACE` y `R/`, vacía. `use_mit_license()` añade la licencia, que es obligatoria: sin ella, nadie sabe qué puede hacer con tu código.
- **El código y su ayuda.** `use_r("nota_final")` crea `R/nota_final.R`, y en él escribimos la función con su documentación encima:

  ```r
  #' Nota final ponderada
  #'
  #' Multiplica cada nota por su peso y suma los resultados.
  #'
  #' @param notas Un vector de notas, de 0 a 10.
  #' @param pesos Un vector de pesos, tan largo como `notas`.
  #' @return Un número: la nota final.
  #' @export
  #' @examples
  #' nota_final(c(6, 8), c(0.4, 0.6))
  ```

  La primera línea es el título; la siguiente, la descripción. Cada `@` es una etiqueta de roxygen2: `@param` describe un argumento, `@return` dice qué devuelve, `@examples` pone un ejemplo y `@export` hace la función visible para quien use el paquete.
- **Probar mientras se escribe.** `load_all()` carga el paquete sin instalarlo, y `nota_final(c(6, 8), c(0.4, 0.6))` ya da 7.2. `document()` lee los comentarios y escribe dos archivos: la ayuda, `man/nota_final.Rd`, y el `NAMESPACE`, que pasa a decir `export(nota_final)`. Después, `use_testthat(3)` y `use_test("nota_final")` preparan las pruebas, y en `tests/testthat/test-nota_final.R` ponemos las del capítulo 24. `test()` las pasa: `[ FAIL 0 | WARN 0 | SKIP 0 | PASS 4 ]`.
- **Revisar e instalar.** `check()` hace la revisión completa, la que se le pide a cualquier paquete antes de publicarlo: construye el paquete, ejecuta los ejemplos y las pruebas, y comprueba que el `DESCRIPTION` está bien y que todo lo exportado tiene ayuda. El resultado es `0 errors ✔ | 0 warnings ✔ | 0 notes ✔`. Por último, `install()` lo instala en la biblioteca de R.

Desde ese momento, en cualquier proyecto, `library(notas)` y `nota_final()` funcionan, como los de cualquier otro paquete. Y `?nota_final` abre la página de ayuda que escribió roxygen2, con su descripción, sus argumentos y su ejemplo. No hemos escrito a mano ni el `NAMESPACE` ni la ayuda: los dos salen de los comentarios `#'`, y por eso nunca se quedan desactualizados respecto al código.

### 2 · Dentro del DESCRIPTION

El `DESCRIPTION` del paquete terminado dice esto:

```text
Package: notas
Title: Notas Ponderadas
Version: 0.0.0.9000
Authors@R: 
    person("Ana", "García", , "ana@example.com", role = c("aut", "cre"))
Description: Calcula notas finales a partir de notas y pesos.
License: MIT + file LICENSE
Encoding: UTF-8
Roxygen: list(markdown = TRUE)
RoxygenNote: 7.3.1
Suggests: 
    testthat (>= 3.0.0)
Config/testthat/edition: 3
```

- `Package`, `Title` y `Description` dicen qué es. El título va con mayúscula en cada palabra importante, como el título de un libro en inglés: es una norma de los paquetes de R.
- `Version`: `0.0.0.9000` quiere decir «en desarrollo, todavía sin publicar».
- `Authors@R` dice quién lo hizo, con su papel: `aut`, autora; `cre`, la persona que lo mantiene y a la que se escribe si algo falla.
- `License`, la licencia.
- `Suggests` lista los paquetes que hacen falta para algo opcional, como pasar las pruebas. Los que hacen falta para que el paquete funcione van en otro campo, `Imports`, y se añaden con `usethis::use_package()`: con `use_package("dplyr")`, dplyr pasa a `Imports`, y usethis recuerda que en el código hay que llamar a sus funciones con `dplyr::`, como `dplyr::filter()`.

### 3 · Compartirlo

Instalado en tu ordenador, el paquete ya te sirve en todos tus proyectos. Para dárselo a otra gente hay tres caminos, de menos a más exigente:

- **Un archivo.** `devtools::build()` lo empaqueta en un solo archivo, `notas_0.0.0.9000.tar.gz`, que se puede enviar e instalar con `install.packages("notas_0.0.0.9000.tar.gz", repos = NULL)`.
- **GitHub.** Si la carpeta del paquete está en un repositorio de GitHub, cualquiera lo instala con `pak::pak("usuario/notas")` o con `remotes::install_github("usuario/notas")`. Es lo más habitual mientras un paquete está creciendo.
- **CRAN**, el almacén oficial de paquetes de R, del que sale `install.packages("dplyr")`. A finales de 2025 tenía unos 23 000 paquetes activos. Para entrar hay que pasar `check()` sin errores ni avisos, y unas cuantas normas más, y un equipo de voluntarios revisa cada paquete nuevo.

::::{div}
:class: afondo
### 4 · Funciones internas, versiones y cobertura

**Lo que se exporta y lo que no.** No todas las funciones de un paquete son para quien lo usa. Las que ayudan por dentro, sin `@export`, son **internas**: el paquete las usa, pero `library()` no las enseña. Así se pueden cambiar sin romper los programas de nadie. Es la idea de los entornos del capítulo 19: cada paquete tiene su propio espacio de nombres, y la función interna vive en él, a la vista de las funciones del paquete y fuera del alcance del programa principal. `notas::nota_final()` llama a una función exportada sin necesidad de `library()`; con tres puntos, `notas:::`, se llega también a las internas.

**Versiones.** Las versiones de un paquete tienen tres números, como `1.4.2`. Si se arregla un fallo, sube el tercero (`1.4.3`); si se añade algo nuevo, el segundo (`1.5.0`); si algo deja de funcionar como antes, el primero (`2.0.0`). Así, quien usa el paquete sabe qué esperar al actualizar. `use_version()` cambia el número del `DESCRIPTION`, y el archivo `NEWS.md` cuenta qué ha cambiado en cada versión.

**¿Qué parte del código prueban las pruebas?** El paquete covr pasa las pruebas y apunta qué líneas del código se han ejecutado: es la **cobertura**. Las líneas que ninguna prueba ejecuta son las que pueden esconder errores que nadie ha buscado.

```{anywidget} ../widgets/paquete.mjs
{"config":{"titulo":"Una función interna y la cobertura","etiqueta":"a fondo · covr","idea":"comprueba_pesos() trabaja dentro del paquete, pero no se exporta: library(notas) no la enseña. covr descubre que ninguna prueba llega a su stop(): la cobertura no llega al 100 %.","guion":"26-paquetes-2"},"archivo":"datos/paquetes/26-paquetes-2.json"}
```

Partimos del paquete del apartado 1 y le añadimos `comprueba_pesos()`, en `R/utils.R`, sin `@export` y con `@noRd`, para que no tenga página de ayuda. `nota_final()` la llama para comprobar que los pesos suman 1. Después de instalarlo:

- `nota_final(c(6, 8), c(0.5, 0.6))` se para con el error de `comprueba_pesos(pesos)`: «los pesos suman 1.1, no 1»;
- `comprueba_pesos()`, a secas, da «no se pudo encontrar la función»: no está exportada;
- `notas:::comprueba_pesos()` sí llega a ella. Sirve para investigar, pero no para usarla en un programa, porque una función interna puede cambiar o desaparecer en la versión siguiente.

`covr::package_coverage()` dice que `nota_final.R` está cubierto al 100 %, pero `utils.R` solo al 66.67 %, y el paquete en total, al 88.89 %. La línea que falta es la del `stop()`: las pruebas del capítulo 24 siempre usan pesos que suman 1. Es un buen recordatorio de que las pruebas también hay que probarlas.

**La documentación larga.** La ayuda de cada función explica esa función. Para contar cómo se usa el paquete entero, con un ejemplo de principio a fin, están las **viñetas**: documentos largos, como los informes del capítulo 25, que se instalan con el paquete y se leen con `vignette()`. `usethis::use_vignette()` crea una en R Markdown, el antecesor de Quarto; las versiones recientes del paquete quarto permiten escribirlas también en Quarto. Y `usethis::use_pkgdown()` prepara una web con toda la documentación del paquete: la ayuda de cada función, las viñetas y las novedades.

**Para seguir.** Todo esto, y mucho más, está en *R Packages*, de Hadley Wickham y Jennifer Bryan, libre en la web (r-pkgs.org). Es la referencia de quien escribe paquetes de R.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Los tres lenguajes tienen paquetes, con la misma forma: una ficha, el código, las pruebas.

```text
R                          Python                        Julia
notas/                     notas/                        Notas/
├─ DESCRIPTION             ├─ pyproject.toml             ├─ Project.toml
├─ NAMESPACE               ├─ src/notas/__init__.py      ├─ src/Notas.jl
├─ R/nota_final.R          └─ tests/test_notas.py        └─ test/runtests.jl
└─ tests/testthat/…
```

| | R | Python | Julia |
|---|---|---|---|
| Crear el esqueleto | `usethis::create_package("notas")` | a mano, o con herramientas como uv | `Pkg.generate("Notas")` |
| Qué se exporta | `@export` → `NAMESPACE` | todo lo que no empieza por `_` | `export nota_final` en el módulo |
| Pasar las pruebas | `devtools::test()` | `pytest` | `Pkg.test("Notas")` |
| Instalar mientras se desarrolla | `devtools::install()` | `pip install -e .` | `Pkg.develop(path = "Notas")` |
| Almacén oficial | CRAN | PyPI | el registro General |

La ficha cambia de nombre (`DESCRIPTION`, `pyproject.toml`, `Project.toml`), pero dice lo mismo: nombre, versión, autoría y de qué otros paquetes depende. Una diferencia: en Python un paquete es una carpeta con `__init__.py`, y en Julia, un **módulo**, `module Notas … end`, dentro de `src/Notas.jl`.
:::

## Conexiones

- Un paquete es la forma definitiva de una **función** (capítulo 5): escrita una vez, documentada y lista para usar en cualquier sitio.
- Cada paquete tiene su propio **espacio de nombres**, un entorno como los del capítulo 19: por eso puede tener funciones internas, y por eso `dplyr::filter()` y `stats::filter()` no se confunden.
- Las **pruebas** del capítulo 24 encuentran aquí su sitio: `tests/testthat/`, y se pasan con `devtools::test()` y dentro de `check()`.
- Las **viñetas** son informes como los del capítulo 25, que viajan con el paquete.
- `check()` es, como `quarto render` en el capítulo 25, una manera de comprobar que **todo lo necesario está escrito**, y no en tu sesión.

## La grieta

Ya tenemos funciones que avisan cuando algo va mal, probadas, documentadas y empaquetadas, e informes que se escriben solos. Pero quien los usa tiene que saber R: escribir `nota_final(c(6, 8), c(0.4, 0.6))` en una consola, o generar el informe cambiando un parámetro. La profesora del capítulo 25 querría que sus alumnos movieran un deslizador con su nota de cada examen y vieran al momento su nota final, sin escribir una línea de código. ¿Se puede convertir un análisis de R en una **página web interactiva**, con botones, deslizadores y gráficos que cambian solos? Es lo que hace **Shiny**, el siguiente capítulo.

## Ejercicios

1. **Cada cosa en su sitio.** ¿En qué archivo o carpeta del paquete va cada una de estas cosas: una función nueva, sus pruebas, el número de versión, la página de ayuda? ¿Cuál de ellas no se escribe a mano?

2. **Una función más.** Quieres añadir al paquete la función `aprobado()` del capítulo 24, ya arreglada. Escribe, en orden, las órdenes y los archivos que tocarías hasta tenerla probada.

3. **El `@export` olvidado.** Añades `aprobado()` al paquete, pero sin `@export`. Lo documentas, lo instalas y escribes `library(notas)` y `aprobado(5)`. ¿Qué pasa? ¿Cómo se arregla?

4. **No toques el NAMESPACE.** El `NAMESPACE` empieza con la línea «Generated by roxygen2: do not edit by hand». ¿Por qué no conviene editarlo a mano?

5. **Imports o Suggests.** Tu paquete usa `dplyr::filter()` dentro de una función, y ggplot2 solo en una viñeta. ¿En qué campo del `DESCRIPTION` va cada uno, y por qué?

6. **Números de versión.** Tu paquete va por la versión `0.1.0`. ¿Qué versión le pondrías después de cada uno de estos cambios, uno detrás de otro? Arreglas un fallo; añades `aprobado()`; cambias el nombre de `nota_final()` a `media_ponderada()`.

:::{div}
:class: afondo
7. **Hasta el 100 %.** Escribe la prueba que le falta al paquete del apartado 4 para que covr dé un 100 % de cobertura.

8. **Dos puntos o tres.** ¿Qué diferencia hay entre `notas::nota_final(...)`, `notas:::comprueba_pesos(...)` y escribir `library(notas)` y después `nota_final(...)`? ¿Por qué no conviene usar `:::` en un programa?
:::

## Solucionario

1. La función, en un archivo de `R/`; sus pruebas, en `tests/testthat/`, en un archivo con el mismo nombre que empiece por `test-`; la versión, en el `DESCRIPTION`; la ayuda, en `man/`. La ayuda no se escribe a mano: la escribe `devtools::document()` a partir de los comentarios `#'` de la función.
2. `usethis::use_r("aprobado")` y, en `R/aprobado.R`, la función con su documentación y `@export`; `devtools::load_all()` para probarla; `devtools::document()` para la ayuda y el `NAMESPACE`; `usethis::use_test("aprobado")` y, en `tests/testthat/test-aprobado.R`, las pruebas de la frontera del capítulo 24; y `devtools::test()`. Antes de compartirlo, `devtools::check()`.
3. R dice «no se pudo encontrar la función "aprobado"»: la función está en el paquete, pero no se exporta, así que `library()` no la enseña. Se arregla añadiendo `#' @export` encima de la función, volviendo a ejecutar `devtools::document()`, que añade `export(aprobado)` al `NAMESPACE`, e instalando otra vez.
4. Porque `devtools::document()` lo vuelve a escribir entero a partir de los comentarios `#'`: cualquier cambio a mano se pierde la próxima vez. Lo que hay que cambiar son los comentarios, por ejemplo añadiendo o quitando `@export`.
5. dplyr va en `Imports`: el paquete lo necesita para funcionar, y al instalar el paquete se instala también dplyr. ggplot2 va en `Suggests`: solo hace falta para generar la viñeta, no para usar las funciones. Con `usethis::use_package("dplyr")` y `usethis::use_package("ggplot2", "Suggests")` se añaden en su sitio.
6. `0.1.1` (un arreglo), `0.2.0` (algo nuevo) y `1.0.0`: cambiar el nombre de una función rompe los programas que usaban el nombre antiguo, y eso pide subir el primer número. Para que el cambio sea más suave, se puede dejar unas versiones `nota_final()` como alias, con un aviso de que va a desaparecer.

:::{div}
:class: afondo
7. Una prueba que use pesos que no suman 1:

   ```r
   test_that("nota_final se para si los pesos no suman 1", {
     expect_error(nota_final(c(6, 8), c(0.5, 0.6)), "no 1")
   })
   ```

   Con ella, `covr::package_coverage()` da un 100 % en los dos archivos.
8. `notas::nota_final()` llama a una función exportada sin cargar el paquete con `library()`: R carga su espacio de nombres, pero no pone sus funciones a la vista del programa. `library(notas)` sí las pone a la vista, y desde entonces basta con escribir `nota_final()`. `notas:::comprueba_pesos()` llega a una función interna, que el paquete no ofrece a nadie: su autora puede cambiarla o quitarla en la versión siguiente sin avisar, y entonces el programa que la usaba se rompe.
:::
