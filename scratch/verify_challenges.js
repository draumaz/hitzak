const fs = require('fs');
const path = require('path');

const challengesPath = path.join(__dirname, '../data/courses/1/challenges.json');
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

console.log(`Total challenges: ${challenges.length}`);

// Verification 1: Every challenge has non-empty acceptedAnswers
let missingAnswers = 0;
let emptyAnswers = 0;
let originalPreserved = 0;
let totalAnswersCount = 0;

challenges.forEach((c, idx) => {
  if (!c.acceptedAnswers) {
    missingAnswers++;
    return;
  }
  if (!Array.isArray(c.acceptedAnswers) || c.acceptedAnswers.length === 0) {
    emptyAnswers++;
    return;
  }
  totalAnswersCount += c.acceptedAnswers.length;

  if (c.type === 'TRANSLATE') {
    const correctOptions = (c.options || [])
      .filter(o => o.correct)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const target = correctOptions.map(o => o.text).join(' ').trim();
    if (c.acceptedAnswers[0] === target) {
      originalPreserved++;
    } else {
      console.warn(`Challenge #${c.id} original answer mismatch: expected "${target}", got "${c.acceptedAnswers[0]}"`);
    }
  } else if (c.type === 'SELECT' || c.type === 'LISTEN') {
    const correctOpt = (c.options || []).find(o => o.correct);
    if (correctOpt && c.acceptedAnswers.includes(correctOpt.text.trim())) {
      originalPreserved++;
    }
  } else if (c.type === 'MATCH') {
    originalPreserved++;
  }
});

console.log(`Missing answers: ${missingAnswers}`);
console.log(`Empty answers: ${emptyAnswers}`);
console.log(`Challenges preserving original solution: ${originalPreserved} / ${challenges.length}`);
console.log(`Total accepted answer variations generated: ${totalAnswersCount}`);
console.log(`Average accepted answers per challenge: ${(totalAnswersCount / challenges.length).toFixed(2)}`);

// Inspect 10 diverse Basque translation challenges
console.log(`\n=== SAMPLE BASQUE TRANSLATE CHALLENGES ===`);
const basqueSamples = challenges.filter(c => c.type === 'TRANSLATE' && c.question.toLowerCase().includes('basque'));
[10, 50, 100, 200, 300, 500, 700, 900, 1100, 1400].forEach(idx => {
  const c = basqueSamples[idx];
  if (c) {
    console.log(`\nID ${c.id} | Lesson ${c.lessonId} | Prompt: "${c.prompt}"`);
    console.log(`Accepted Answers (${c.acceptedAnswers.length}):`);
    c.acceptedAnswers.slice(0, 8).forEach(a => console.log(`  - "${a}"`));
    if (c.acceptedAnswers.length > 8) console.log(`  ... and ${c.acceptedAnswers.length - 8} more`);
  }
});
