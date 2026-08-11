import {
  MessageFlags,
  SlashCommandBuilder
} from 'discord.js';

import {
  obtenerCategorias,
  obtenerDificultades,
  obtenerPreguntaAleatoria,
  obtenerResultados
} from '../services/encuesta.service.js';
import { createEncuestaView } from '../views/encuesta.view.js';
import { registerPoll } from '../services/poll.service.js';

const categorias = obtenerCategorias();
const dificultades = obtenerDificultades();

const command = new SlashCommandBuilder()
  .setName('encuesta')
  .setDescription('Genera una encuesta aleatoria de ciberseguridad.')
  .addStringOption((option) =>
    option
      .setName('categoria')
      .setDescription('Filtra la encuesta por categoría.')
      .setRequired(false)
      .addChoices(
        { name: 'Todas', value: 'todas' },
        ...categorias.slice(0, 24).map((categoria) => ({
          name: categoria,
          value: categoria
        }))
      )
  )
  .addStringOption((option) =>
    option
      .setName('dificultad')
      .setDescription('Filtra la encuesta por dificultad.')
      .setRequired(false)
      .addChoices(
        { name: 'Todas', value: 'todas' },
        ...dificultades.slice(0, 24).map((dificultad) => ({
          name: dificultad,
          value: dificultad
        }))
      )
  )
  .addIntegerOption((option) =>
    option
      .setName('duracion')
      .setDescription('Duración en minutos (1 a 1440).')
      .setMinValue(1)
      .setMaxValue(1440)
      .setRequired(false)
  );

export default {
  data: command,

  async execute({ interaction }) {
    const categoria = interaction.options.getString('categoria') ?? 'todas';
    const dificultad = interaction.options.getString('dificultad') ?? 'todas';
    const duracion = interaction.options.getInteger('duracion') ?? 60;

    const pregunta = await obtenerPreguntaAleatoria({ categoria, dificultad });

    if (!pregunta) {
      await interaction.reply({
        content: '❌ No encontré preguntas para esos filtros.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const pollId = await registerPoll({
      pregunta,
      durationMinutes: duracion,
      channelId: interaction.channelId
    });

    const container = createEncuestaView({
      pollId,
      pregunta,
      resultados: await obtenerResultados(pollId, pregunta.opciones.length)
    });

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    const message = await interaction.fetchReply();
    await registerPoll({
      pollId,
      messageId: message.id
    });
  }
};
