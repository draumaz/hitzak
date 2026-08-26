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
    
    // Check if prompt has English pronouns (I, you, we, they, he, she)
    const promptWords = c.prompt.toLowerCase().split(/\s+/);
    const hasEnglishPronoun = promptWords.some(w => ['i', 'you', 'we', 'they', 'he', 'she'].includes(w.replace(/[^a-z]/g, "")));
    
    // Check if expected text has no Basque pronouns
    const basqueWords = expectedText.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ""));
    const hasBasquePronoun = basqueWords.some(w => pronouns.includes(w));
    
    if (hasEnglishPronoun && !hasBasquePronoun) {
      results.push({
        id: c.id,
        prompt: c.prompt,
        expectedText
      });
    }
  }
}

console.log(`Found ${results.length} challenges where English prompt has a pronoun but Basque expected text does not.`);
console.log("\nFirst 20 examples:");
results.slice(0, 20).forEach(r => {
  console.log(`- ID ${r.id}: Prompt: "${r.prompt}" -> Basque: "${r.expectedText}"`);
});
