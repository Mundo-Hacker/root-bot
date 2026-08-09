import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder
} from 'discord.js';

import config from '../codigo-vulnerable.config.js';

const letters = ['A', 'B', 'C', 'D'];

export function createChallengeView(challenge) {
  const options = challenge.options
    .map((option, index) => `**${letters[index]}.** ${option}`)
    .join('\n');

  const buttons = challenge.options.map((_, index) =>
    new ButtonBuilder()
      .setCustomId(`codigo-vulnerable:respuesta:${challenge.id}:${index}`)
      .setLabel(letters[index])
      .setStyle(ButtonStyle.Secondary)
  );

  return new ContainerBuilder()
    .setAccentColor(config.accentColor)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## Código vulnerable · ${challenge.difficulty}\n` +
        `${challenge.scenario}\n\n` +
        `\`\`\`${challenge.language.toLowerCase()}\n${challenge.code}\n\`\`\`\n\n` +
        `**${challenge.question}**\n${options}`
      )
    )
    .addActionRowComponents(new ActionRowBuilder().addComponents(buttons));
}

export function createResultView(result) {
  const title = result.correct ? '✅ Respuesta correcta' : '❌ Respuesta incorrecta';
  const answer = result.correct ? '' : `\n\n**Respuesta correcta:** ${result.correctOption}`;

  return new ContainerBuilder()
    .setAccentColor(result.correct ? 0x57F287 : 0xED4245)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${title}${answer}\n\n` +
        `**Por qué:** ${result.explanation}\n\n` +
        `**Corrección:** ${result.remediation}`
      )
    );
}
