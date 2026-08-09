import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import { getRandomChallenge } from '../services/challenge.service.js';
import { createChallengeView } from '../views/challenge.view.js';

export default {
  data: new SlashCommandBuilder()
    .setName('codigo-vulnerable')
    .setDescription('Encuentra la vulnerabilidad en un fragmento de código.'),

  async execute({ interaction }) {
    await interaction.reply({
      components: [createChallengeView(getRandomChallenge())],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
