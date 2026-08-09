import challenges from '../data/challenges.js';

export function getChallenge(id) {
  return challenges.find((challenge) => challenge.id === id) ?? null;
}

export function getRandomChallenge() {
  return challenges[Math.floor(Math.random() * challenges.length)];
}

export function evaluateAnswer(id, option) {
  const challenge = getChallenge(id);

  if (!challenge || !Number.isInteger(option) || option < 0 || option >= challenge.options.length) {
    return null;
  }

  return {
    correct: option === challenge.answer,
    correctOption: challenge.options[challenge.answer],
    explanation: challenge.explanation,
    remediation: challenge.remediation
  };
}
