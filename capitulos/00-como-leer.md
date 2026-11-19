---
title: Cómo leer este libro
---

Cada capítulo sigue el mismo recorrido, el del método genético-constructivo:

1. Un **punto de partida** cotidiano.
2. La **pregunta** que lo generaliza.
3. La **idea** mínima que lo sostiene.
4. La **construcción** con código.
5. Las **conexiones** con otros temas.
6. Una **grieta**: algo que el capítulo deja abierto y que lleva al siguiente.

## Las dos rutas

Lo que no es imprescindible va en apartados marcados **A fondo**, con su cápsula negra y un filete a la izquierda. Si sigues la ruta base, puedes ocultarlos con el interruptor que hay al principio de cada capítulo. Así lo que lees nunca da un salto.

```{anywidget} ../widgets/rutas.mjs
{}
```

:::{div}
:class: afondo
Esto es un apartado «A fondo». Si eliges la ruta base, desaparece de la página.
:::

## Los visualizadores

Debajo de los programas clave hay un visualizador. Así se usa:

- **Paso ▶** ejecuta la siguiente línea; **◀** vuelve atrás; **Reproducir** avanza solo.
- La línea marcada con **▶** es la que se acaba de ejecutar.
- En **Memoria** cada variable aparece como una fila de casillas numeradas **desde 1**, porque en R todo es un vector. Un número suelto es un vector de longitud 1. Las casillas que acaban de cambiar se resaltan en vino.
- Cuando el programa evalúa una condición, la ves en tres tiempos: la expresión, la expresión con los valores de ese momento y el resultado (`TRUE` o `FALSE`).
- Si R da un **aviso**, aparece en un recuadro ámbar: el cálculo se hace, pero algo no encaja.
- La **tabla de traza** se rellena sola, una fila por vuelta del bucle.

## La misma idea en tres lenguajes

En algunos capítulos hay un recuadro con el mismo problema resuelto en R, en Python y en Julia. Sirve para ver qué es propio de R y qué es común a todos los lenguajes.
