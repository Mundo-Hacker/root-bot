import { loadRuntimeConfig } from './config.service.js';
import {
  obtenerPreguntaAleatoria,
  obtenerResultados
} from './encuesta.service.js';
import {
  closePoll,
  getActivePolls,
  registerPoll
} from './poll.service.js';
import { loadState, updateState } from '../repositories/state.repository.js';
import { createEncuestaView } from '../views/encuesta.view.js';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

let clientRef = null;
let timer = null;
let running = false;

export async function iniciarProgramacion(client) {
  clientRef = client;

  await revisarEstado();
  iniciarIntervalo();
}

export function reiniciarProgramacion() {
  if (!clientRef) return;

  if (timer) {
    clearInterval(timer);
  }

  iniciarIntervalo();

  void updateState((state) => ({
    ...state,
    schedule: {
      ...state.schedule,
      nextPublicationAt: null
    }
  })).then(() => revisarEstado());
}

function iniciarIntervalo() {
  timer = setInterval(() => {
    void revisarEstado();
  }, CHECK_INTERVAL_MS);
}

async function revisarEstado() {
  if (running) return;
  running = true;

  try {
    await cerrarEncuestasVencidas();

    const config = await loadRuntimeConfig();
    if (!config.automatic || !config.channelId) {
      await actualizarProximaPublicacion(null);
      return;
    }

    const state = await loadState();
    const ahora = Date.now();

    if (!state.schedule.nextPublicationAt) {
      await actualizarProximaPublicacion(ahora + (config.intervalMinutes * 60 * 1000));
      return;
    }

    if (ahora < state.schedule.nextPublicationAt) return;

    const publicada = await publicarEncuestaAutomatica(config);

    if (publicada) {
      const siguiente = Date.now() + (config.intervalMinutes * 60 * 1000);

      await updateState((current) => ({
        ...current,
        schedule: {
          lastPublishedAt: Date.now(),
          nextPublicationAt: siguiente
        }
      }));
    }
  } catch (error) {
    console.error('[encuestas-ciberseguridad] Error en scheduler:', error);
  } finally {
    running = false;
  }
}

async function actualizarProximaPublicacion(nextPublicationAt) {
  await updateState((state) => ({
    ...state,
    schedule: {
      ...state.schedule,
      nextPublicationAt
    }
  }));
}

async function cerrarEncuestasVencidas() {
  const encuestas = await getActivePolls();
  const ahora = Date.now();

  for (const poll of encuestas) {
    if (ahora < poll.expiresAt) continue;

    const resultado = await closePoll(poll.id);
    if (!resultado) continue;

    const channel = await clientRef.channels.fetch(poll.channelId).catch(() => null);
    if (!channel?.isTextBased()) continue;

    const message = poll.messageId
      ? await channel.messages.fetch(poll.messageId).catch(() => null)
      : null;
    if (!message) continue;

    await message.edit({
      components: [
        createEncuestaView({
          pollId: poll.id,
          pregunta: poll.pregunta,
          resultados: resultado.resultados,
          cerrada: true
        })
      ]
    }).catch(() => null);
  }
}

async function publicarEncuestaAutomatica(config) {
  const channel = await clientRef.channels.fetch(config.channelId).catch(() => null);

  if (!channel?.isTextBased()) {
    console.error('[encuestas-ciberseguridad] No se pudo acceder al canal configurado.');
    return false;
  }

  const pregunta = await obtenerPreguntaAleatoria({
    categoria: config.category,
    dificultad: config.difficulty
  });

  if (!pregunta) {
    console.error('[encuestas-ciberseguridad] No hay preguntas disponibles para los filtros configurados.');
    return false;
  }

  const pollId = await registerPoll({
    pregunta,
    durationMinutes: config.durationMinutes,
    channelId: config.channelId
  });

  const container = createEncuestaView({
    pollId,
    pregunta,
    resultados: await obtenerResultados(pollId, pregunta.opciones.length)
  });

  const message = await channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });

  await registerPoll({
    pollId,
    messageId: message.id
  });

  return true;
}
