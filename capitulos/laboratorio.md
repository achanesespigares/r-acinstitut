---
title: Laboratorio de R
subtitle: Escribe tu programa y míralo pensar
---

Escribe aquí cualquier programa de R y pulsa **Ejecutar paso a paso**. R funciona dentro de tu navegador, sin instalar nada, y el programa aparece en el mismo visualizador que el resto del libro: la línea que se ejecuta, los vectores con sus casillas, las condiciones con sus valores, la consola y los avisos.

```{anywidget} ../widgets/traza-r.mjs
{"config":{"tipo":"laboratorio","titulo":"Laboratorio de R"}}
```

## Cómo funciona

- **La primera vez** el navegador descarga R (webR, la versión de R para navegadores), y eso tarda unos segundos. Las siguientes veces queda en caché.
- **Tu código se guarda** en este navegador: si cierras la página y vuelves, sigue ahí.
- Si el programa recorre un vector con `for (i in seq_along(v))`, el laboratorio dibuja `v` en grande con el puntero `i`, y la tabla de traza muestra `i` y `v[i]` en cada vuelta.
- Un programa que no termina se detiene a los 2000 pasos o a los 15 segundos.
- Las funciones que escribas se ejecutan de una vez: el visualizador todavía no entra dentro de ellas.
- R escribe sus mensajes en el idioma de su instalación, y en el navegador suele ser el inglés. Cuando hay un error, el laboratorio añade una pista en español.
