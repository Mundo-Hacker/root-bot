import crypto from 'node:crypto';

import {
  obtenerResultados,
  obtenerTotalVotos,
  limpiarEncuesta
} from './encuesta.service.js';
import { loadState, updateState } from '../repositories/state.repository.js';

export async function registerPoll({
  pregunta = null,
  durationMinutes = null,
  channelId = null,
  pollId = null,
  messageId = null
}) {
  const id = pollId ?? crypto.randomUUID();
  const existing = await getPoll(id);

  if (existing) {
    if (!messageId && !channelId && !pregunta && !durationMinutes) {
      return id;
    }

    await updateState((state) => ({
      ...state,
      polls: {
        ...state.polls,
        [id]: {
          ...existing,
          ...(messageId ? { messageId } : {}),
          ...(channelId ? { channelId } : {}),
          ...(pregunta ? { pregunta } : {}),
          ...(durationMinutes ? { durationMinutes } : {})
        }
      }
    }));

    return id;
  }

  const poll = {
    id,
    pregunta,
    durationMinutes,
    channelId,
    messageId,
    expiresAt: Date.now() + (durationMinutes * 60 * 1000),
    closed: false
  };

  await updateState((state) => ({
    ...state,
    polls: {
      ...state.polls,
      [id]: poll
    }
  }));

  return id;
}

export async function getPoll(pollId) {
  const state = await loadState();
  return state.polls[pollId] ?? null;
}

export async function getActivePolls() {
  const state = await loadState();
  return Object.values(state.polls).filter((poll) => !poll.closed);
}

export async function closePoll(pollId) {
  const poll = await getPoll(pollId);
  if (!poll || poll.closed) return null;

  await updateState((state) => ({
    ...state,
    polls: {
      ...state.polls,
      [pollId]: {
        ...poll,
        closed: true
      }
    }
  }));

  const resultados = await obtenerResultados(
    pollId,
    poll.pregunta.opciones.length
  );

  return {
    ...poll,
    closed: true,
    resultados,
    totalVotos: await obtenerTotalVotos(pollId)
  };
}

export async function removePoll(pollId) {
  await updateState((state) => {
    const polls = { ...state.polls };
    delete polls[pollId];

    return {
      ...state,
      polls
    };
  });

  await limpiarEncuesta(pollId);
}
