const fs = require('fs');

const challenges = JSON.parse(fs.readFileSync('data/courses/1/challenges.json', 'utf8'));

// Extract all unique prompts with their challenge types, lessonId, and English translations if any
const promptMap = new Map();

challenges.forEach(c => {
  let basquePrompt = null;
  let englishPrompt = null;
  let englishAnswers = [];
  let basqueAnswers = [];

  if (c.type === 'TRANSLATE') {
    if (c.question && c.question.includes('to Basque')) {
      englishPrompt = c.prompt;
      basqueAnswers = c.acceptedAnswers || [];
    } else {
      basquePrompt = c.prompt;
      englishAnswers = c.acceptedAnswers || [];
    }
  } else if (c.type === 'SELECT') {
    if (c.question && c.question.includes('"')) {
      const m = c.question.match(/"([^"]+)"/);
      if (m) basquePrompt = m[1];
    }
  } else if (c.type === 'LISTEN') {
    if (c.acceptedAnswers && c.acceptedAnswers[0]) {
      basquePrompt = c.acceptedAnswers[0];
    }
  }

  if (basquePrompt) {
    if (!promptMap.has(basquePrompt)) {
      promptMap.set(basquePrompt, {
        prompt: basquePrompt,
        lessons: new Set(),
        types: new Set(),
        english: englishAnswers[0] || ''
      });
    }
    promptMap.get(basquePrompt).lessons.add(c.lessonId);
    promptMap.get(basquePrompt).types.add(c.type);
    if (!promptMap.get(basquePrompt).english && englishAnswers[0]) {
      promptMap.get(basquePrompt).english = englishAnswers[0];
    }
  }
});

console.log(`Found ${promptMap.size} unique Basque source sentences across challenges.`);

// Convert to array
const allSentences = Array.from(promptMap.values()).map(v => ({
  prompt: v.prompt,
  lessons: Array.from(v.lessons),
  types: Array.from(v.types),
  english: v.english
}));

fs.writeFileSync('scratch/all_unique_basque_sentences.json', JSON.stringify(allSentences, null, 2));
console.log("Saved to scratch/all_unique_basque_sentences.json");
