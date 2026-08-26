const fs = require('fs');

const prompts = JSON.parse(fs.readFileSync('scratch/all_prompts_for_audit.json', 'utf8'));

const wordFreq = {};
prompts.forEach(p => {
  const clean = p.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡"'"]/g, " ");
  const words = clean.split(/\s+/).map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
  words.forEach(w => {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
});

const sortedWords = Object.keys(wordFreq).sort();
console.log("Total unique word forms across all prompts:", sortedWords.length);
fs.writeFileSync('scratch/all_vocab_tokens.json', JSON.stringify(sortedWords, null, 2));
