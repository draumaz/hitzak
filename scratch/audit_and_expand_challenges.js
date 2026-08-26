const fs = require('fs');
const path = require('path');
const {
  generateBasqueVariations
} = require('./test_linguistic_generator_v6.js');

const challengesPath = path.join(__dirname, '../data/courses/1/challenges.json');
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

console.log(`Auditing and expanding accepted answers for ${challenges.length} challenges...`);

// English variation generator
function generateEnglishVariations(target, prompt = "") {
  const variations = new Set();
  if (!target || !target.trim()) return [];

  const base = target.trim();
  variations.add(base);
  variations.add(base.replace(/[.,!?]/g, "").trim());

  const contractionPairs = [
    [/\bI am\b/g, "I'm"],
    [/\bYou are\b/g, "You're"],
    [/\byou are\b/g, "you're"],
    [/\bHe is\b/g, "He's"],
    [/\bhe is\b/g, "he's"],
    [/\bShe is\b/g, "She's"],
    [/\bshe is\b/g, "she's"],
    [/\bIt is\b/g, "It's"],
    [/\bit is\b/g, "it's"],
    [/\bWe are\b/g, "We're"],
    [/\bwe are\b/g, "we're"],
    [/\bThey are\b/g, "They're"],
    [/\bthey are\b/g, "they're"],
    [/\bdo not\b/g, "don't"],
    [/\bDo not\b/g, "Don't"],
    [/\bdoes not\b/g, "doesn't"],
    [/\bDoes not\b/g, "Doesn't"],
    [/\bdid not\b/g, "didn't"],
    [/\bDid not\b/g, "Didn't"],
    [/\bcannot\b/g, "can't"],
    [/\bCannot\b/g, "Can't"],
    [/\bwill not\b/g, "won't"],
    [/\bWill not\b/g, "Won't"],
    [/\bis not\b/g, "isn't"],
    [/\bare not\b/g, "aren't"],
    [/\bwas not\b/g, "wasn't"],
    [/\bwere not\b/g, "weren't"]
  ];

  for (const [regex, replacement] of contractionPairs) {
    if (regex.test(base)) {
      const contracted = base.replace(regex, replacement);
      variations.add(contracted);
      variations.add(contracted.replace(/[.,!?]/g, "").trim());
    }
  }

  // Also support expanded from contractions if base had contraction
  const expansionPairs = [
    [/\bI'm\b/g, "I am"],
    [/\bYou're\b/g, "You are"],
    [/\byou're\b/g, "you are"],
    [/\bHe's\b/g, "He is"],
    [/\bhe's\b/g, "he is"],
    [/\bShe's\b/g, "She is"],
    [/\bshe's\b/g, "she is"],
    [/\bIt's\b/g, "It is"],
    [/\bit's\b/g, "it is"],
    [/\bWe're\b/g, "We are"],
    [/\bwe're\b/g, "we are"],
    [/\bThey're\b/g, "They are"],
    [/\bthey're\b/g, "they are"]
  ];

  for (const [regex, replacement] of expansionPairs) {
    if (regex.test(base)) {
      const expanded = base.replace(regex, replacement);
      variations.add(expanded);
      variations.add(expanded.replace(/[.,!?]/g, "").trim());
    }
  }

  const results = [];
  results.push(base);

  for (const v of variations) {
    if (v && !results.includes(v)) {
      results.push(v);
    }
  }

  return results;
}

let expandedChallengesCount = 0;
let totalOldAnswers = 0;
let totalNewAnswers = 0;

const processedChallenges = challenges.map(c => {
  const updated = { ...c };
  const existingAnswers = Array.isArray(c.acceptedAnswers) ? [...c.acceptedAnswers] : [];
  totalOldAnswers += existingAnswers.length;

  let newAnswers = new Set(existingAnswers);

  if (c.type === 'TRANSLATE') {
    const correctOptions = (c.options || [])
      .filter(o => o.correct)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetText = correctOptions.map(o => o.text).join(' ').trim();

    if (targetText) {
      newAnswers.add(targetText);
    }

    const isBasque = c.question.toLowerCase().includes('basque');
    if (isBasque) {
      const generated = generateBasqueVariations(targetText, c.prompt || '');
      generated.forEach(a => newAnswers.add(a));
      
      // Also run variations on any existing answers that might have differed slightly
      existingAnswers.forEach(ea => {
        const fromExisting = generateBasqueVariations(ea, c.prompt || '');
        fromExisting.forEach(a => newAnswers.add(a));
      });
    } else {
      const generated = generateEnglishVariations(targetText, c.prompt || '');
      generated.forEach(a => newAnswers.add(a));
      
      existingAnswers.forEach(ea => {
        const fromExisting = generateEnglishVariations(ea, c.prompt || '');
        fromExisting.forEach(a => newAnswers.add(a));
      });
    }
  } else if (c.type === 'SELECT' || c.type === 'LISTEN') {
    const correctOpt = (c.options || []).find(o => o.correct);
    if (correctOpt && correctOpt.text) {
      newAnswers.add(correctOpt.text.trim());
    } else if (c.audioText) {
      newAnswers.add(c.audioText.trim());
    }
  } else if (c.type === 'MATCH') {
    const correctOpts = (c.options || []).filter(o => o.correct);
    correctOpts.forEach(o => {
      if (o.text) newAnswers.add(o.text.trim());
    });
  }

  // Preserve existing order first, then append new unique answers
  const finalAnswersList = [];
  existingAnswers.forEach(ans => {
    const trimmed = ans.trim();
    if (trimmed && !finalAnswersList.includes(trimmed)) {
      finalAnswersList.push(trimmed);
    }
  });

  newAnswers.forEach(ans => {
    const trimmed = ans.trim();
    if (trimmed && !finalAnswersList.includes(trimmed)) {
      finalAnswersList.push(trimmed);
    }
  });

  if (finalAnswersList.length > existingAnswers.length) {
    expandedChallengesCount++;
  }

  updated.acceptedAnswers = finalAnswersList;
  totalNewAnswers += finalAnswersList.length;

  return updated;
});

console.log(`\n=== AUDIT RESULTS ===`);
console.log(`Total challenges: ${challenges.length}`);
console.log(`Challenges with expanded answers: ${expandedChallengesCount}`);
console.log(`Total accepted answers before: ${totalOldAnswers}`);
console.log(`Total accepted answers after: ${totalNewAnswers}`);
console.log(`Net new accepted answers added: ${totalNewAnswers - totalOldAnswers}`);
console.log(`Average answers per challenge: ${(totalNewAnswers / challenges.length).toFixed(2)}`);

// Inspect some specific copular challenges
const sampleIds = [21, 30, 31, 34, 37, 39, 41, 43, 60, 80, 100];
console.log(`\n=== SAMPLE EXPANDED CHALLENGES ===`);
sampleIds.forEach(id => {
  const c = processedChallenges.find(x => x.id === id);
  if (c) {
    console.log(`\nChallenge #${c.id} [${c.type}]: "${c.prompt}"`);
    console.log(`Accepted answers (${c.acceptedAnswers.length}):`);
    c.acceptedAnswers.slice(0, 12).forEach(ans => console.log(`  - "${ans}"`));
    if (c.acceptedAnswers.length > 12) {
      console.log(`  ... and ${c.acceptedAnswers.length - 12} more`);
    }
  }
});

// Save to data/courses/1/challenges.json
fs.writeFileSync(challengesPath, JSON.stringify(processedChallenges, null, 2) + '\n', 'utf8');
console.log(`\nSuccessfully written updated challenges to ${challengesPath}!`);
