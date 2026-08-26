const fs = require('fs');
const path = require('path');

const challenges = JSON.parse(fs.readFileSync('data/courses/1/challenges.json', 'utf8'));

const cleanPunct = (str) => {
  return str
    .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014]+|[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014]+$/g, "")
    .trim()
    .toLowerCase();
};

// Read current dictionary from TranslateChallenge.tsx
const code = fs.readFileSync('components/lesson/TranslateChallenge.tsx', 'utf8');
const startMarker = 'export const BASQUE_TO_ENGLISH: Record<string, string> = {';
const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf('};', startIdx);
const dictText = code.substring(startIdx + startMarker.length, endIdx);
const currentDict = eval('({' + dictText + '})');

const basqueWords = new Set();
const englishWords = new Set();
const promptPairs = [];

for (const c of challenges) {
  if (!c.prompt) continue;

  const isEnglishPrompt =
    c.question.toLowerCase().includes("into basque") ||
    c.question.toLowerCase().includes("write this in basque");

  const words = c.prompt.split(/\s+/).map(cleanPunct).filter(Boolean);

  for (const w of words) {
    if (isEnglishPrompt) {
      englishWords.add(w);
    } else {
      basqueWords.add(w);
    }
  }

  // Find target translation if available
  let target = "";
  if (c.acceptedAnswers && c.acceptedAnswers.length > 0) {
    target = c.acceptedAnswers[0];
  } else if (c.options) {
    target = c.options.filter(o => o.correct).map(o => o.text).join(" ");
  }

  promptPairs.push({
    id: c.id,
    type: c.type,
    question: c.question,
    prompt: c.prompt,
    target: target,
    isEnglishPrompt
  });
}

console.log("Total prompt pairs:", promptPairs.length);
console.log("Unique Basque prompt words:", basqueWords.size);
console.log("Unique English prompt words:", englishWords.size);

const unmappedBasque = Array.from(basqueWords).filter(w => !currentDict[w]);
const unmappedEnglish = Array.from(englishWords).filter(w => !currentDict[w]);

console.log("Unmapped Basque words in current dictionary:", unmappedBasque.length);
console.log("Unmapped Basque words list:", unmappedBasque);
console.log("Unmapped English words count:", unmappedEnglish.length);
