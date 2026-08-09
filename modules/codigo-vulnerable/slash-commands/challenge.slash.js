import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import { consumeDailyChallenge, releaseDailyChallenge } from '../repositories/daily-limit.repository.js';
import { getRandomChallenge } from '../services/challenge.service.js';
import { createChallengeView } from '../views/challenge.view.js';

export default {
  data: new SlashCommandBuilder()
    .setName('codigo-vulnerable')
    .setDescription('Encuentra la vulnerabilidad en un fragmento de código.')
    .setDMPermission(false),

  async execute({ interaction }) {
    const usage = consumeDailyChallenge(interaction.guildId);

    if (!usage.allowed) {
      await interaction.reply({
        content: 'Este servidor ya publicó sus 2 retos de hoy. Vuelve mañana (UTC).',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    try {
      await interaction.reply({
        components: [createChallengeView(getRandomChallenge())],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      releaseDailyChallenge(usage.reservation);
      throw error;
    }
  }
};
