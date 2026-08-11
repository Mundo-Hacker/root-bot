import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '..', 'data', 'config.json');

const defaults = {
  channelId: null,
  automatic: false,
  intervalMinutes: 1440,
  durationMinutes: 60,
  category: 'todas',
  difficulty: 'todas'
};

export async function loadRuntimeConfig() {
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export async function saveRuntimeConfig(changes) {
  const current = await loadRuntimeConfig();
  const next = { ...current, ...changes };

  await fs.writeFile(
    configPath,
    `${JSON.stringify(next, null, 2)}\n`,
    'utf8'
  );

  return next;
}
