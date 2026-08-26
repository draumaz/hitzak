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
    
    const words = expectedText.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ""));
    const foundPronouns = words.filter(w => pronouns.includes(w));
    const uniqueFound = Array.from(new Set(foundPronouns));
    
    if (uniqueFound.length > 1) {
      results.push({
        id: c.id,
        expectedText,
        uniqueFound
      });
    }
  }
}

console.log(`Found ${results.length} challenges with multiple different pronouns.`);
results.forEach(r => {
  console.log(`- ID ${r.id}: "${r.expectedText}" (Pronouns: ${r.uniqueFound.join(', ')})`);
});
