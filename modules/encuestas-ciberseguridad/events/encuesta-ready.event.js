import { Events } from 'discord.js';

import { iniciarProgramacion } from '../services/scheduler.service.js';

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    await iniciarProgramacion(client);
    console.log('[encuestas-ciberseguridad] Módulo listo.');
  }
};
