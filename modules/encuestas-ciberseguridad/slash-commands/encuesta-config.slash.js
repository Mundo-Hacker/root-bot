import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

import {
  loadRuntimeConfig,
  saveRuntimeConfig
} from '../services/config.service.js';
import { reiniciarProgramacion } from '../services/scheduler.service.js';

export default {
  data: new SlashCommandBuilder()
    .setName('encuesta-config')
    .setDescription('Configura las encuestas automáticas de ciberseguridad.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName('canal')
        .setDescription('Canal donde se publicarán las encuestas automáticas.')
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('automatica')
        .setDescription('Activa o desactiva la publicación automática.')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('intervalo')
        .setDescription('Intervalo entre encuestas automáticas, en minutos.')
        .setMinValue(5)
        .setMaxValue(10080)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('duracion')
        .setDescription('Duración de cada encuesta, en minutos.')
        .setMinValue(1)
        .setMaxValue(1440)
        .setRequired(false)
    ),

  async execute({ interaction }) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        content: '❌ Necesitás el permiso Administrar servidor.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const canal = interaction.options.getChannel('canal');
    const automatica = interaction.options.getBoolean('automatica');
    const intervalo = interaction.options.getInteger('intervalo');
    const duracion = interaction.options.getInteger('duracion');

    const changes = {};

    if (canal) changes.channelId = canal.id;
    if (automatica !== null) changes.automatic = automatica;
    if (intervalo !== null) changes.intervalMinutes = intervalo;
    if (duracion !== null) changes.durationMinutes = duracion;

    const config = Object.keys(changes).length
      ? await saveRuntimeConfig(changes)
      : await loadRuntimeConfig();

    if (Object.keys(changes).length) {
      reiniciarProgramacion();
    }

    const canalTexto = config.channelId
      ? `<#${config.channelId}>`
      : 'No configurado';

    await interaction.reply({
      content:
        `⚙️ **Configuración de encuestas**\n\n` +
        `Canal: ${canalTexto}\n` +
        `Automáticas: **${config.automatic ? 'activadas' : 'desactivadas'}**\n` +
        `Intervalo: **${config.intervalMinutes} min**\n` +
        `Duración: **${config.durationMinutes} min**`,
      flags: MessageFlags.Ephemeral
    });
  }
};
