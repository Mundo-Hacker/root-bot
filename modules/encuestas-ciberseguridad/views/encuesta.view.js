import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder
} from 'discord.js';

import encuestasConfig from '../encuestas-ciberseguridad.config.js';

const letras = ['A', 'B', 'C', 'D', 'E'];

function porcentaje(valor, total) {
  if (!total) return 0;
  return Math.round((valor / total) * 100);
}

export function createEncuestaView({
  pollId,
  pregunta,
  resultados = [],
  cerrada = false
}) {
  const total = resultados.reduce((sum, value) => sum + value, 0);

  const container = new ContainerBuilder()
    .setAccentColor(encuestasConfig.appearance.accentColor);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 🛡️ Encuesta de Ciberseguridad\n\n` +
      `**${pregunta.pregunta}**\n\n` +
      `🏷️ Categoría: **${pregunta.categoria}** · Dificultad: **${pregunta.dificultad}**`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
      .setDivider(true)
      .setSpacing(SeparatorSpacingSize.Small)
  );

  const row = new ActionRowBuilder();

  pregunta.opciones.forEach((opcion, indice) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`ciberencuesta:v1:${pollId}:${indice}`)
        .setLabel(`${letras[indice]}. ${opcion.slice(0, 70)}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(cerrada)
    );
  });

  container.addActionRowComponents(row);

  if (cerrada) {
    const resultadosTexto = pregunta.opciones
      .map((opcion, indice) => {
        const votos = resultados[indice] ?? 0;
        return `${letras[indice]}. ${opcion} — **${votos}** (${porcentaje(votos, total)}%)`;
      })
      .join('\n');

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### 📊 Resultados\n${resultadosTexto}\n\n` +
        `👥 Votos totales: **${total}**\n\n` +
        `### ✅ Respuesta correcta\n` +
        `${letras[pregunta.correcta]}. ${pregunta.opciones[pregunta.correcta]}\n\n` +
        `💡 ${pregunta.explicacion}`
      )
    );
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        'Elegí una opción. Podés cambiar tu voto mientras la encuesta esté abierta.'
      )
    );
  }

  return container;
}
