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
    
    // Check if the expected text does NOT start with a pronoun (or after "kaixo,")
    const words = expectedText.split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim()).filter(Boolean);
    
    let hasPronoun = false;
    for (const w of words) {
      if (pronouns.includes(w)) {
        hasPronoun = true;
        break;
      }
    }
    
    if (!hasPronoun) {
      results.push({
        id: c.id,
        expectedText,
        options: c.options.map(o => ({ text: o.text, correct: o.correct, order: o.order }))
      });
    }
  }
}

console.log(`Found ${results.length} challenges with no pronouns at all in correct options.`);
console.log("\nFirst 15 examples:");
results.slice(0, 15).forEach(r => {
  console.log(`- ID ${r.id}: "${r.expectedText}"`);
});
