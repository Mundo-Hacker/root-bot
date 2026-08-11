import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import encuestasConfig from '../encuestas-ciberseguridad.config.js';
import { loadRuntimeConfig } from '../services/config.service.js';

export default {
  data: new SlashCommandBuilder()
    .setName('encuesta-status')
    .setDescription('Muestra el estado del módulo de encuestas.'),

  async execute({ interaction }) {
    const config = await loadRuntimeConfig();

    await interaction.reply({
      content:
        `🛡️ **Encuestas de Ciberseguridad**\n\n` +
        `Módulo: **${encuestasConfig.enabled ? 'activo' : 'inactivo'}**\n` +
        `Automáticas: **${config.automatic ? 'activadas' : 'desactivadas'}**\n` +
        `Canal: ${config.channelId ? `<#${config.channelId}>` : 'No configurado'}\n` +
        `Intervalo: **${config.intervalMinutes} min**\n` +
        `Duración: **${config.durationMinutes} min**`,
      flags: MessageFlags.Ephemeral
    });
  }
};
