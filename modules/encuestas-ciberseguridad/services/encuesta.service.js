import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { updateState } from '../repositories/state.repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const preguntasPath = path.join(__dirname, '..', 'data', 'preguntas.json');

async function cargarPreguntas() {
  const raw = await fs.readFile(preguntasPath, 'utf8');
  return JSON.parse(raw);
}

function cargarPreguntasSync() {
  return JSON.parse(fsSync.readFileSync(preguntasPath, 'utf8'));
}

function normalizarFiltro(valor) {
  return typeof valor === 'string' ? valor.trim().toLowerCase() : 'todas';
}

export function obtenerCategorias() {
  const preguntas = cargarPreguntasSync();
  return [...new Set(preguntas.map((pregunta) => pregunta.categoria))].sort();
}

export function obtenerDificultades() {
  const preguntas = cargarPreguntasSync();
  return [...new Set(preguntas.map((pregunta) => pregunta.dificultad))].sort();
}

export async function obtenerPreguntaAleatoria({
  categoria = 'todas',
  dificultad = 'todas'
} = {}) {
  const preguntas = await cargarPreguntas();

  const categoriaFiltro = normalizarFiltro(categoria);
  const dificultadFiltro = normalizarFiltro(dificultad);

  const disponibles = preguntas.filter((pregunta) => {
    const coincideCategoria =
      categoriaFiltro === 'todas' || pregunta.categoria === categoriaFiltro;

    const coincideDificultad =
      dificultadFiltro === 'todas' || pregunta.dificultad === dificultadFiltro;

    return coincideCategoria && coincideDificultad;
  });

  if (disponibles.length === 0) return null;

  let seleccionada = null;

  await updateState((state) => {
    const noUsadas = disponibles.filter(
      (pregunta) => !state.usedQuestionIds.includes(pregunta.id)
    );

    const pool = noUsadas.length > 0 ? noUsadas : disponibles;
    seleccionada = pool[Math.floor(Math.random() * pool.length)];

    return {
      ...state,
      usedQuestionIds:
        noUsadas.length > 0
          ? [...new Set([...state.usedQuestionIds, seleccionada.id])]
          : [seleccionada.id]
    };
  });

  return seleccionada;
}

export async function registrarVoto(pollId, userId, opcion) {
  await updateState((state) => ({
    ...state,
    votes: {
      ...state.votes,
      [pollId]: {
        ...(state.votes[pollId] ?? {}),
        [userId]: opcion
      }
    }
  }));
}

export async function obtenerVotos(pollId) {
  const state = await loadState();
  return state.votes[pollId] ?? {};
}

export async function obtenerResultados(pollId, cantidadOpciones) {
  const votos = await obtenerVotos(pollId);
  const resultados = Array.from({ length: cantidadOpciones }, () => 0);

  for (const opcion of Object.values(votos)) {
    if (Number.isInteger(opcion) && opcion >= 0 && opcion < cantidadOpciones) {
      resultados[opcion] += 1;
    }
  }

  return resultados;
}

export async function obtenerTotalVotos(pollId) {
  const votos = await obtenerVotos(pollId);
  return Object.keys(votos).length;
}

export async function limpiarEncuesta(pollId) {
  await updateState((state) => {
    const votes = { ...state.votes };
    delete votes[pollId];

    return {
      ...state,
      votes
    };
  });
}
