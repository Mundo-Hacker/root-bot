import assert from 'node:assert/strict';
import { GatewayIntentBits, MessageFlags } from 'discord.js';

import challenges from './data/challenges.js';
import answerEvent from './events/answer.event.js';
import manifest from './index.js';
import { evaluateAnswer, getChallenge, getRandomChallenge } from './services/challenge.service.js';
import slashCommand from './slash-commands/challenge.slash.js';
import { createChallengeView, createResultView } from './views/challenge.view.js';

const challenge = getChallenge('sql-login');
assert.equal(manifest.name, 'codigo-vulnerable');
assert.deepEqual(manifest.intents, [GatewayIntentBits.Guilds]);
assert.deepEqual(manifest.events, ['./events/answer.event.js']);
assert.deepEqual(manifest.commands, []);
assert.equal(challenges.length, 30);
assert.equal(new Set(challenges.map(({ id }) => id)).size, 30);
for (const item of challenges) {
  assert.match(item.id, /^[a-z0-9-]+$/);
  for (const field of ['language', 'scenario', 'code', 'question', 'explanation', 'remediation']) {
    assert.equal(typeof item[field], 'string');
    assert.ok(item[field].trim());
  }
  assert.equal(item.options.length, 4);
  assert.equal(new Set(item.options).size, 4);
  assert.ok(item.options.every((option) => typeof option === 'string' && option.trim()));
  assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 4);
  assert.ok(['Fácil', 'Media', 'Difícil'].includes(item.difficulty));

  for (let index = 0; index < item.options.length; index += 1) {
    assert.equal(evaluateAnswer(item.id, index).correct, index === item.answer);
  }

  const challengeJson = createChallengeView(item).toJSON();
  assert.ok(challengeJson.components[0].content.length <= 4000);
  assert.ok(challengeJson.components[1].components.every(({ custom_id }) => custom_id.length <= 100));

  const resultJson = createResultView(evaluateAnswer(item.id, (item.answer + 1) % 4)).toJSON();
  assert.ok(resultJson.components[0].content.length <= 4000);
}
assert.equal(challenge.options.length, 4);
assert.equal(evaluateAnswer('sql-login', 1).correct, true);
assert.equal(evaluateAnswer('sql-login', 0).correct, false);
assert.equal(evaluateAnswer('missing', 0), null);
assert.equal(evaluateAnswer('sql-login', 99), null);
assert.ok(getChallenge(getRandomChallenge().id));

const view = createChallengeView(challenge).toJSON();
assert.equal(view.components[1].components.length, 4);
assert.equal(view.components[1].components[1].custom_id, 'codigo-vulnerable:respuesta:sql-login:1');
assert.equal(slashCommand.data.toJSON().name, 'codigo-vulnerable');

let slashReply;
await slashCommand.execute({
  interaction: {
    reply: async (payload) => { slashReply = payload; }
  }
});
assert.ok(slashReply.flags & MessageFlags.IsComponentsV2);
assert.equal(slashReply.components[0].toJSON().components[1].components.length, 4);

let reply;
await answerEvent.execute({
  isButton: () => true,
  customId: 'codigo-vulnerable:respuesta:sql-login:1',
  reply: async (payload) => { reply = payload; }
});
assert.ok(reply.flags & MessageFlags.Ephemeral);
assert.ok(reply.flags & MessageFlags.IsComponentsV2);
assert.match(reply.components[0].toJSON().components[0].content, /Respuesta correcta/);

let invalidReply;
await answerEvent.execute({
  isButton: () => true,
  customId: 'codigo-vulnerable:respuesta:no-existe:0',
  reply: async (payload) => { invalidReply = payload; }
});
assert.match(invalidReply.content, /no válido/);

let ignoredReply;
await answerEvent.execute({
  isButton: () => true,
  customId: 'codigo-vulnerable:respuesta:sql-login:99',
  reply: async (payload) => { ignoredReply = payload; }
});
assert.equal(ignoredReply, undefined);

console.log('codigo-vulnerable: OK');
