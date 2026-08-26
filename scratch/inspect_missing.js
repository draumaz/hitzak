const fs = require('fs');

const challenges = JSON.parse(fs.readFileSync('data/courses/1/challenges.json', 'utf8'));

const cleanWordForDisplay = (str) => {
  if (!str) return "";
  return str
    .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]+|[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]+$/g, "")
    .trim()
    .toLowerCase();
};

const code = fs.readFileSync('components/lesson/TranslateChallenge.tsx', 'utf8');
const startMarker = 'export const BASQUE_TO_ENGLISH: Record<string, string> = {';
const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf('};', startIdx);
const dictText = code.substring(startIdx + startMarker.length, endIdx);
const basqueToEnglish = eval('({' + dictText + '})');

// We run our building logic from before...
const fullDict = {};
for (const [k, v] of Object.entries(basqueToEnglish)) {
  const kClean = cleanWordForDisplay(k);
  if (kClean) fullDict[kClean] = v;
}

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

for (const [bWord, eWord] of Object.entries(basqueToEnglish)) {
  const cE = cleanWordForDisplay(eWord);
  if (cE && !fullDict[cE]) fullDict[cE] = bWord;
  const baseE = cleanWordForDisplay(eWord.replace(/\s*\([^)]*\)/g, ""));
  if (baseE && !fullDict[baseE]) fullDict[baseE] = bWord;
}

// Find sample prompts for missing words
const missingSamples = {};

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

  const words = c.prompt.split(/\s+/).map(cleanWordForDisplay).filter(Boolean);
  for (const w of words) {
    if (w === "audio" || w === "playback" || w === "review") continue;
    if (!fullDict[w]) {
      if (!missingSamples[w]) {
        missingSamples[w] = { prompt: c.prompt, target: target };
      }
    }
  }
}

console.log("Missing words with sample contexts:");
for (const [w, ctx] of Object.entries(missingSamples)) {
  console.log(`- '${w}': prompt="${ctx.prompt}" => target="${ctx.target}"`);
}
