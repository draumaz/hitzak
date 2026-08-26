const fs = require('fs');
const path = require('path');

const challengesPath = path.join(__dirname, '../data/courses/1/challenges.json');
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

console.log(`Loaded ${challenges.length} challenges.`);

const translateBasque = challenges.filter(c => c.type === 'TRANSLATE' && c.question.toLowerCase().includes('basque'));
const translateEng = challenges.filter(c => c.type === 'TRANSLATE' && !c.question.toLowerCase().includes('basque'));
const selects = challenges.filter(c => c.type === 'SELECT');
const matches = challenges.filter(c => c.type === 'MATCH');
const listens = challenges.filter(c => c.type === 'LISTEN');

console.log(`Breakdown:`);
console.log(`- TRANSLATE into Basque: ${translateBasque.length}`);
console.log(`- TRANSLATE into English: ${translateEng.length}`);
console.log(`- SELECT: ${selects.length}`);
console.log(`- MATCH: ${matches.length}`);
console.log(`- LISTEN: ${listens.length}`);
