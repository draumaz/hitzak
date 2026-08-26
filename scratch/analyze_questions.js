const fs = require('fs');
const path = require('path');

const challengesPath = '/home/emma/remote-repos/hitzak/data/courses/1/challenges.json';
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

const questions = new Set();
const translateBasquePrompts = [];
const translateEnglishPrompts = [];

for (const c of challenges) {
  questions.add(c.question);
  if (c.type === 'TRANSLATE') {
    if (c.question.toLowerCase().includes('basque')) {
      translateBasquePrompts.push(c);
    } else {
      translateEnglishPrompts.push(c);
    }
  }
}

console.log("Unique Questions:");
console.log(Array.from(questions));
console.log(`\nTotal TRANSLATE into Basque: ${translateBasquePrompts.length}`);
console.log(`Total TRANSLATE into English: ${translateEnglishPrompts.length}`);

console.log("\nSample TRANSLATE into Basque challenges:");
for (let i = 0; i < Math.min(5, translateBasquePrompts.length); i++) {
  console.log(JSON.stringify(translateBasquePrompts[i], null, 2));
}
