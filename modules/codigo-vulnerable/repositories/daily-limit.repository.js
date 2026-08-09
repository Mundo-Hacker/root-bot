import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dailyLimit = 2;
const dataDirectory = fileURLToPath(new URL('../data/daily-usage/', import.meta.url));
const reservationPattern = /^\d+-\d{4}-\d{2}-\d{2}-[12]$/;

export function consumeDailyChallenge(guildId, now = new Date()) {
  if (!/^\d+$/.test(guildId)) throw new TypeError('guildId must be numeric');

  const date = now.toISOString().slice(0, 10);
  const guildPrefix = `${guildId}-`;
  const currentPrefix = `${guildPrefix}${date}-`;
  fs.mkdirSync(dataDirectory, { recursive: true });

  for (const entry of fs.readdirSync(dataDirectory)) {
    const entryDate = entry.slice(guildPrefix.length, guildPrefix.length + 10);

    if (entry.startsWith(guildPrefix) && entryDate < date) {
      fs.rmSync(path.join(dataDirectory, entry), { force: true });
    }
  }

  for (let slot = 1; slot <= dailyLimit; slot += 1) {
    const reservation = `${currentPrefix}${slot}`;

    try {
      fs.closeSync(fs.openSync(path.join(dataDirectory, reservation), 'wx'));
      return { allowed: true, reservation };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }

  return { allowed: false, reservation: null };
}

export function releaseDailyChallenge(reservation) {
  if (reservationPattern.test(reservation)) {
    fs.rmSync(path.join(dataDirectory, reservation), { force: true });
  }
}
