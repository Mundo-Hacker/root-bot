import { GatewayIntentBits } from 'discord.js';

import encuestasConfig from './encuestas-ciberseguridad.config.js';

const encuestasCiberseguridad = {
  name: 'encuestas-ciberseguridad',
  version: '1.1.0',
  description: 'Genera encuestas interactivas y automáticas sobre ciberseguridad.',
  enabled: encuestasConfig.enabled,
  intents: [
    GatewayIntentBits.Guilds
  ],
  events: [
    './events/encuesta-ready.event.js',
    './events/encuesta-interaction.event.js'
  ],
  commands: []
};

export default encuestasCiberseguridad;
