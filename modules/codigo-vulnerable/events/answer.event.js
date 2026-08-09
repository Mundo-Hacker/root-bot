import { Events, MessageFlags } from 'discord.js';

import { evaluateAnswer } from '../services/challenge.service.js';
import { createResultView } from '../views/challenge.view.js';

const customIdPattern = /^codigo-vulnerable:respuesta:([a-z0-9-]+):(\d)$/;

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction) {
    if (!interaction.isButton()) return;

    const match = interaction.customId.match(customIdPattern);
    if (!match) return;

    const result = evaluateAnswer(match[1], Number(match[2]));

    if (!result) {
      await interaction.reply({
        content: 'Reto no válido o desactualizado.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    await interaction.reply({
      components: [createResultView(result)],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
};
