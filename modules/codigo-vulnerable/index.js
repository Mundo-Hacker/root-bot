import { GatewayIntentBits } from 'discord.js';

import config from './codigo-vulnerable.config.js';

export default {
  name: 'codigo-vulnerable',
  version: '1.0.0',
  description: 'Publica fragmentos vulnerables para identificar el fallo y su corrección.',
  enabled: config.enabled,
  intents: [GatewayIntentBits.Guilds],
  events: ['./events/answer.event.js'],
  commands: []
};
