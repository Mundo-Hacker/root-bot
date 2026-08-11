import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const statePath = path.join(__dirname, '..', 'data', 'state.json');

const defaultState = {
  polls: {},
  votes: {},
  usedQuestionIds: [],
  schedule: {
    lastPublishedAt: null,
    nextPublicationAt: null
  }
};

let writeQueue = Promise.resolve();

function normalizeState(state = {}) {
  return {
    ...defaultState,
    ...state,
    polls: state.polls ?? {},
    votes: state.votes ?? {},
    usedQuestionIds: Array.isArray(state.usedQuestionIds)
      ? state.usedQuestionIds
      : [],
    schedule: {
      ...defaultState.schedule,
      ...(state.schedule ?? {})
    }
  };
}

async function readState() {
  try {
    const raw = await fs.readFile(statePath, 'utf8');
    return normalizeState(JSON.parse(raw));
  } catch {
    return normalizeState();
  }
}

async function writeStateDirect(state) {
  await fs.writeFile(
    statePath,
    `${JSON.stringify(normalizeState(state), null, 2)}\n`,
    'utf8'
  );
}

export async function loadState() {
  const state = await readState();

  return state;
}

export async function saveState(state) {
  writeQueue = writeQueue.then(() => writeStateDirect(state));
  return writeQueue;
}

export function updateState(updater) {
  let result;

  writeQueue = writeQueue.then(async () => {
    const current = await readState();
    const next = normalizeState(await updater(current));
    result = next;
    await writeStateDirect(next);
  });

  return writeQueue.then(() => result);
}
