const fs = require('fs');

const challenges = JSON.parse(fs.readFileSync('data/courses/1/challenges.json', 'utf8'));

const cleanPunct = (str) => {
  if (!str) return "";
  return str
    .replace(/[\u2018\u2019']/g, "") // strip apostrophes for base key matching
    .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]+|[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]+$/g, "")
    .trim()
    .toLowerCase();
};

const cleanWordForDisplay = (str) => {
  if (!str) return "";
  return str
    .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]+|[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]+$/g, "")
    .trim()
    .toLowerCase();
};

// Existing BASQUE_TO_ENGLISH dictionary
const code = fs.readFileSync('components/lesson/TranslateChallenge.tsx', 'utf8');
const startMarker = 'export const BASQUE_TO_ENGLISH: Record<string, string> = {';
const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf('};', startIdx);
const dictText = code.substring(startIdx + startMarker.length, endIdx);
const basqueToEnglish = eval('({' + dictText + '})');

const fullDict = {};

// Add existing basqueToEnglish
for (const [k, v] of Object.entries(basqueToEnglish)) {
  const kClean = cleanWordForDisplay(k);
  if (kClean) fullDict[kClean] = v;
}

// Build inverse mappings and helper mappings from MATCH challenges and SELECT challenges
for (const c of challenges) {
  if (c.type === "MATCH" && c.options) {
    const pairs = {};
    for (const opt of c.options) {
      if (opt.pairMatchingKey) {
        if (!pairs[opt.pairMatchingKey]) pairs[opt.pairMatchingKey] = [];
        pairs[opt.pairMatchingKey].push(opt.text);
      }
    }
    for (const group of Object.values(pairs)) {
      if (group.length === 2) {
        const [w1, w2] = group;
        const c1 = cleanWordForDisplay(w1);
        const c2 = cleanWordForDisplay(w2);
        if (c1 && c2) {
          if (!fullDict[c1]) fullDict[c1] = w2;
          if (!fullDict[c2]) fullDict[c2] = w1;
        }
      }
    }
  }

  if (c.type === "SELECT" && c.question.includes('Select the correct translation for "')) {
    const match = c.question.match(/Select the correct translation for "([^"]+)":/);
    if (match) {
      const srcWord = match[1];
      const correctOpt = c.options ? c.options.find(o => o.correct) : null;
      if (correctOpt) {
        const cSrc = cleanWordForDisplay(srcWord);
        const cTarget = cleanWordForDisplay(correctOpt.text);
        if (cSrc && !fullDict[cSrc]) fullDict[cSrc] = correctOpt.text;
        if (cTarget && !fullDict[cTarget]) fullDict[cTarget] = srcWord;
      }
    }
  }
}

// Invert Basque -> English to fill English -> Basque
for (const [bWord, eWord] of Object.entries(basqueToEnglish)) {
  const cE = cleanWordForDisplay(eWord);
  if (cE && !fullDict[cE]) {
    fullDict[cE] = bWord;
  }
  // Strip parenthetical notes like "Aitor (male name)" -> "aitor"
  const baseE = cleanWordForDisplay(eWord.replace(/\s*\([^)]*\)/g, ""));
  if (baseE && !fullDict[baseE]) {
    fullDict[baseE] = bWord;
  }
}

// Sentence alignment pass: For every challenge with prompt and accepted answer, align words
for (const c of challenges) {
  if (!c.prompt) continue;
  let target = "";
  if (c.acceptedAnswers && c.acceptedAnswers.length > 0) {
    target = c.acceptedAnswers[0];
  } else if (c.options) {
    const corrects = c.options.filter(o => o.correct);
    if (corrects.length > 0) {
      target = corrects.map(o => o.text).join(" ");
    }
  }
  if (!target) continue;

  const isEnglishPrompt =
    c.question.toLowerCase().includes("into basque") ||
    c.question.toLowerCase().includes("write this in basque");

  const promptWords = c.prompt.split(/\s+/).map(cleanWordForDisplay).filter(Boolean);
  const targetWords = target.split(/\s+/).map(cleanWordForDisplay).filter(Boolean);

  if (isEnglishPrompt) {
    // Prompt is English, Target is Basque
    // For any prompt word that is unmapped, if length of prompt and target match or if we can align known words:
    for (let i = 0; i < promptWords.length; i++) {
      const pWord = promptWords[i];
      if (!fullDict[pWord]) {
        // Try finding matching target word or target phrase
        if (promptWords.length === targetWords.length) {
          fullDict[pWord] = targetWords[i];
        }
      }
    }
  } else {
    // Prompt is Basque, Target is English
    for (let i = 0; i < promptWords.length; i++) {
      const pWord = promptWords[i];
      if (!fullDict[pWord]) {
        if (promptWords.length === targetWords.length) {
          fullDict[pWord] = targetWords[i];
        }
      }
    }
  }
}

// Fallback handling for possessives (e.g. mikel's -> mikel, father's -> father)
// and plurals (e.g. books -> book)
for (const c of challenges) {
  if (!c.prompt) continue;
  const words = c.prompt.split(/\s+/).map(cleanWordForDisplay).filter(Boolean);
  for (const w of words) {
    if (!fullDict[w]) {
      // Check if it ends in 's or ’s or s
      const sansPossessive = w.replace(/['’]s$/, "");
      if (fullDict[sansPossessive]) {
        fullDict[w] = fullDict[sansPossessive] + "'s / of " + fullDict[sansPossessive];
      } else {
        const sansApostrophe = w.replace(/['’]/g, "");
        if (fullDict[sansApostrophe]) {
          fullDict[w] = fullDict[sansApostrophe];
        }
      }
    }
  }
}

// Collect remaining unmapped prompt words
const allPromptWords = new Set();
for (const c of challenges) {
  if (!c.prompt) continue;
  const words = c.prompt.split(/\s+/).map(cleanWordForDisplay).filter(Boolean);
  words.forEach(w => {
    if (w !== "audio" && w !== "playback" && w !== "review") {
      allPromptWords.add(w);
    }
  });
}

const missingPromptWords = Array.from(allPromptWords).filter(w => !fullDict[w]);
console.log("Total unique prompt words:", allPromptWords.size);
console.log("Total dictionary entries in fullDict:", Object.keys(fullDict).length);
console.log("Missing prompt words count:", missingPromptWords.length);
console.log("Missing prompt words list:", missingPromptWords);
