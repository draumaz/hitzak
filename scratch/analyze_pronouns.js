const fs = require('fs');
const path = require('path');

const challengesPath = '/home/emma/remote-repos/hitzak/data/courses/1/challenges.json';
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

const pronouns = ['ni', 'zu', 'hura', 'gu', 'zuek', 'haiek', 'nik', 'guk', 'zuk', 'hark'];
const results = [];

for (const c of challenges) {
  if (c.type === 'TRANSLATE' && c.question.toLowerCase().includes('basque')) {
    const correctOptions = c.options
      .filter((o) => o.correct)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const expectedText = correctOptions.map((t) => t.text).join(' ').trim();
    
    // Check if the expected text starts with a pronoun
    const firstWord = expectedText.split(/[^a-zA-Z]/)[0].toLowerCase();
    if (pronouns.includes(firstWord)) {
      results.push({
        id: c.id,
        expectedText,
        pronoun: firstWord,
        options: c.options.map(o => ({ text: o.text, correct: o.correct, order: o.order }))
      });
    }
  }
}

console.log(`Found ${results.length} challenges where the expected Basque sentence starts with a pronoun.`);
console.log("\nFirst 10 examples:");
results.slice(0, 10).forEach(r => {
  console.log(`- ID ${r.id}: "${r.expectedText}" (Pronoun: ${r.pronoun})`);
});
