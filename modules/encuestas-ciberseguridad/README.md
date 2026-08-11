# 🛡️ Encuestas de Ciberseguridad para ROOT

Módulo comunitario para ROOT que genera encuestas interactivas sobre ciberseguridad.

## Funciones

- `/encuesta` genera una pregunta aleatoria.
- Filtros por categoría y dificultad.
- Votación mediante botones.
- Un voto por usuario, permitiendo cambiarlo mientras la encuesta está abierta.
- Persistencia de encuestas, IDs de mensajes, votos y preguntas usadas en `data/state.json`.
- Cierre automático de encuestas vencidas.
- Scheduler resistente a reinicios mediante fechas persistidas.
- `/encuesta-config` configura las encuestas automáticas.
- `/encuesta-status` muestra la configuración actual.
- Banco de preguntas en `data/preguntas.json`.
- Sin API externas ni credenciales.

## Persistencia

`repositories/state.repository.js` centraliza la lectura y escritura de `data/state.json`.

La configuración dinámica se mantiene separada en `data/config.json` y se lee mediante `services/config.service.js`.

La configuración estática del módulo (como el color de acento) vive en `encuestas-ciberseguridad.config.js`.

## Seguridad

Este módulo no requiere tokens, API keys ni servicios externos.
