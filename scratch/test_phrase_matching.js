const fs = require("fs");
const code = fs.readFileSync("components/lesson/TranslateChallenge.tsx", "utf8");
const startMarker = "export const BASQUE_TO_ENGLISH: Record<string, string> = {";
const startIdx = code.indexOf(startMarker);
let braceCount = 1, endIdx = -1;
for (let i = startIdx + startMarker.length; i < code.length; i++) {
  if (code[i] === "{") braceCount++;
  else if (code[i] === "}") { braceCount--; if (braceCount === 0) { endIdx = i; break; } }
}
const dictText = code.substring(startIdx + startMarker.length, endIdx);
const dict = eval("({" + dictText + "})");

dict["excuse me"] = "barkatu";
dict["barkatu"] = "Excuse me";
dict["bihar arte"] = "See you tomorrow";
dict["see you tomorrow"] = "bihar arte";
dict["you're welcome"] = "ez da ezer";
dict["you are welcome"] = "ez da ezer";

function renderPromptWords(sentence) {
  const parts = sentence.split(/(\s+)/);
  const items = [];

  parts.forEach((p) => {
    if (!p) return;
    if (p.trim() === "") {
      items.push({ type: "space", raw: p, leadingPunc: "", cleanWord: "", trailingPunc: "" });
    } else {
      const match = p.match(/^([.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]*)(.*?)([.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]*)$/);
      let leadingPunc = "";
      let cleanWord = p;
      let trailingPunc = "";
      if (match) {
        leadingPunc = match[1];
        cleanWord = match[2];
        trailingPunc = match[3];
      }
      items.push({ type: "word", raw: p, leadingPunc, cleanWord, trailingPunc });
    }
  });

  const wordIndices = [];
  items.forEach((it, idx) => {
    if (it.type === "word" && it.cleanWord) wordIndices.push(idx);
  });

  const elements = [];
  let i = 0;
  let keyCounter = 0;

  while (i < items.length) {
    const item = items[i];
    if (item.type === "space") {
      elements.push({ type: "space", text: item.raw });
      i++;
      continue;
    }

    const wordIdxPos = wordIndices.indexOf(i);
    if (wordIdxPos === -1) {
      elements.push({ type: "text", text: item.raw });
      i++;
      continue;
    }

    let matched = false;
    const maxK = Math.min(4, wordIndices.length - wordIdxPos);

    for (let K = maxK; K >= 1; K--) {
      let hasBoundary = false;
      for (let j = 0; j < K - 1; j++) {
        const wIdx = wordIndices[wordIdxPos + j];
        const wItem = items[wIdx];
        if (/[.!?]/.test(wItem.trailingPunc)) {
          hasBoundary = true;
          break;
        }
      }
      if (hasBoundary && K > 1) continue;

      const matchedWordItems = [];
      for (let j = 0; j < K; j++) {
        matchedWordItems.push(items[wordIndices[wordIdxPos + j]]);
      }

      const lookupKey = matchedWordItems.map((w) => w.cleanWord.toLowerCase()).join(" ");
      let translation = dict[lookupKey];

      if (!translation && K === 1 && (lookupKey.endsWith("'s") || lookupKey.endsWith("’s"))) {
        const base = lookupKey.slice(0, -2);
        if (dict[base]) {
          translation = dict[base] + "'s";
        }
      }

      if (translation) {
        const firstWord = matchedWordItems[0];
        const lastWord = matchedWordItems[matchedWordItems.length - 1];
        const lastWordIdx = wordIndices[wordIdxPos + K - 1];

        let phraseText = "";
        for (let idx = i; idx <= lastWordIdx; idx++) {
          const curr = items[idx];
          if (idx === i) {
            phraseText += curr.cleanWord;
          } else if (idx === lastWordIdx) {
            phraseText += curr.leadingPunc + curr.cleanWord;
          } else if (curr.type === "space") {
            phraseText += curr.raw;
          } else {
            phraseText += curr.leadingPunc + curr.cleanWord + curr.trailingPunc;
          }
        }

        elements.push({
          type: "tooltip_span",
          leadingPunc: firstWord.leadingPunc,
          phraseText,
          translation,
          trailingPunc: lastWord.trailingPunc,
        });

        i = lastWordIdx + 1;
        matched = true;
        break;
      }
    }

    if (!matched) {
      elements.push({ type: "text", text: item.raw });
      i++;
    }
  }

  return elements;
}

const testSentences = [
  "Excuse me. Who is the driver?",
  "Barkatu, nor zara zu?",
  "Egun on! Zer moduz?",
  "Eskerrik asko, Jon."
];

testSentences.forEach(s => {
  console.log("\nINPUT:", s);
  console.log("RESULT:", JSON.stringify(renderPromptWords(s), null, 2));
});
