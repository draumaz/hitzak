const fs = require('fs');
const path = require('path');

const challenges = JSON.parse(fs.readFileSync('data/courses/1/challenges.json', 'utf8'));

const cleanPunct = (str) => {
  if (!str) return "";
  return str
    .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]+|[.,\/#!$%\^&\*;:{}=\-_`~()?\"'\u201c\u201d\u2018\u2019\u00ab\u00bb\u2022\u2013\u2014()\[\]{}]+$/g, "")
    .trim()
    .toLowerCase();
};

const translateFilePath = 'components/lesson/TranslateChallenge.tsx';
let code = fs.readFileSync(translateFilePath, 'utf8');

const startMarker = 'export const BASQUE_TO_ENGLISH: Record<string, string> = {';
const startIdx = code.indexOf(startMarker);
let braceCount = 1;
let endIdx = -1;
for (let i = startIdx + startMarker.length; i < code.length; i++) {
  if (code[i] === '{') braceCount++;
  else if (code[i] === '}') {
    braceCount--;
    if (braceCount === 0) {
      endIdx = i;
      break;
    }
  }
}

const dictText = code.substring(startIdx + startMarker.length, endIdx);
const basqueToEnglish = eval('({' + dictText + '})');

const fullDict = {};

// 1. Existing Basque -> English dictionary
for (const [k, v] of Object.entries(basqueToEnglish)) {
  const kClean = cleanPunct(k);
  if (kClean) fullDict[kClean] = v;
}

// 2. Add explicit additions
const explicitAdditions = {
  "excuse": "barkatu",
  "me": "niri / nire",
  "thank": "eskerrik",
  "thanks": "eskerrik asko",
  "rather": "baino / nahiago",
  "handsome": "ederra / apain",
  "over": "gainean / -ra",
  "watch": "erloju / erlojua",
  "watches": "erlojuak",
  "plural": "(pluralez)",
  "woods": "oihan / baso",
  "san": "Donostia",
  "sebastian": "Donostia",
  "no": "ez",
  "much": "asko",
  "male": "gizonezko",
  "brother": "anaia / neba",
  "brothers": "anaiak / nebak",
  "sister": "arreba / ahizpa",
  "sisters": "arrebak / ahizpak",
  "farm": "baserri",
  "farmhouse": "baserri",
  "days": "egunak / egun",
  "rejoiced": "poztu da",
  "from": "-tik / -etatik",
  "lies": "dago / datza",
  "lay": "egon / egon zen",
  "goes": "doa / joaten da",
  "mini-hotels": "ostalgaiak",
  "cinema": "zinema",
  "mountains": "mendiak / mendietara",
  "front": "aurrean",
  "beside": "ondoan",
  "because": "-lako / zeren",
  "itziar's": "Itziarrekin / Itziaren",
  "itziar’s": "Itziaren",
  "calm": "lasai",
  "son's": "semearen",
  "son’s": "semearen",
  "high": "altua / altuak",
  "degrees": "gradu / graduak",
  "so": "beraz / hain",
  "hundred": "ehun",
  "persons": "pertsonak",
  "weeks": "asteak / aste",
  "by": "bidez / -z",
  "made": "egina / egin da",
  "english": "ingelesez / ingelesa",
  "minutes": "minutu / minutuak",
  "hours": "ordu / orduak",
  "lot": "asko",
  "o'clock": "orai / -etan",
  "o’clock": "-etan",
  "comes": "dator",
  "don't": "ez",
  "don’t": "ez",
  "ahead": "zuzen / aurretik",
  "meters": "metro / metroak",
  "past": "pasa / igaro",
  "able": "gai / ahal",
  "have": "izan / eduki",
  "has": "dauka / du",
  "had": "zuen / zeukan",
  "us": "guri / guretzat",
  "for": "evit / -tzat",
  "them": "haiei / haientzat",
  "officers": "poliziak",
  "officer": "polizia",
  "officer's": "poliziaren",
  "officer’s": "poliziaren",
  "people": "jendea / pertsonak",
  "pleasing": "gustagarria",
  "interested": "interesatuta",
  "movie": "zinema / filma",
  "theaters": "zinemak",
  "seem": "iruditu",
  "him": "hari / hura",
  "few": "batzuk",
  "any": "edozein / batere",
  "uses": "erabiltzen du",
  "brings": "ekartzen du",
  "visited": "bisitatu zuen",
  "coughed": "eztul egin zuen",
  "bit": "kosk egin zuen",
  "slept": "lo egin zuen",
  "spoke": "hitz egin zuen",
  "spoken": "hitz egina",
  "shouted": "oihu egin zuen",
  "ferries": "ferryak",
  "drive": "gidatu",
  "knows": "badaki",
  "know": "jakin",
  "knew": "bazekien",
  "speaking": "hitz egiten",
  "sleeping": "lo egiten",
  "working": "lan egiten",
  "play": "jolastu",
  "plays": "jolasten du",
  "speaks": "hitz egiten du",
  "likes": "gustatzen zaio",
  "depart": "irten",
  "buy": "erosi",
  "learn": "ikasi",
  "wants": "nahi du",
  "order": "orden / helburu",
  "ice": "izozki",
  "cream": "izozkia",
  "eats": "jaten du",
  "cooking": "sukaldatzen / egosten",
  "yet": "oraindik",
  "lives": "bizi da",
  "does": "egiten du",
  "will": "-ko / izanen da",
  "lived": "bizi zen",
  "years": "urteak / urte",
  "up": "gora",
  "at": "-etan / -an",
  "home": "etxean / etxea",
  "all": "dena / guztiak",
  "every": "bakoitz / oro",
  "wake": "iratzarri / jaiki",
  "be": "izan / egon",
  "mikel's": "Mikelen",
  "mikel’s": "Mikelen",
  "miren's": "Mirenen",
  "miren’s": "Mirenen",
  "turtle's": "dortokaren",
  "turtle’s": "dortokaren",
  "yours(plural": "zuenak",
  "your(plural": "zuen",
  "you(plural": "zuek",
  "anitza's": "Anitzarena",
  "anitza’s": "Anitzarena",
  "father's": "aitaren",
  "father’s": "aitaren",
  "mother's": "amaren",
  "mother’s": "amaren",
  "uncle's": "osabaren",
  "uncle’s": "osabaren",
  "sister's": "arrebaren / ahizparen",
  "sister’s": "arrebaren / ahizparen",
  "brother's": "anaiaren / nebaren",
  "brother’s": "anaiaren / nebaren",
  "cousin": "lehengusu",
  "nieces": "ilobak",
  "housewife's": "etxekoandrearen",
  "housewife’s": "etxekoandrearen",
  "student's": "ikaslearen",
  "student’s": "ikaslearen",
  "teacher's": "irakaslearen",
  "teacher’s": "irakaslearen",
  "woman's": "emakumearen",
  "woman’s": "emakumearen",
  "nurse's": "erizainaren",
  "nurse’s": "erizainaren",
  "he": "hura / hark",
  "she": "hura / hark",
  "they": "haiek",
  "fine": "ondo",
  "night": "gau / gabon",
  "it": "hura",
  "the": "-(a) / -(ak)",
  "police": "polizia",
  "were": "ziren / zineten",
  "an": "bat",
  "those": "haiek",
  "while": "bitartean",
  "in": "-n / -an",
  "many": "asko",
  "her": "bere / hari",
  "of": "-ren / -ko",
  "down": "behera",
  "to": "-ra / -era",
  "with": "-rekin",
  "danced": "dantzatu zuen",
  "being": "egotea / izatea",
  "eating": "jaten / jaten ari",
};

for (const [k, v] of Object.entries(explicitAdditions)) {
  const kClean = cleanPunct(k);
  if (kClean) fullDict[kClean] = v;
}

// 3. Match challenges & select challenges mappings
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
        const c1 = cleanPunct(w1);
        const c2 = cleanPunct(w2);
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
        const cSrc = cleanPunct(srcWord);
        const cTarget = cleanPunct(correctOpt.text);
        if (cSrc && !fullDict[cSrc]) fullDict[cSrc] = correctOpt.text;
        if (cTarget && !fullDict[cTarget]) fullDict[cTarget] = srcWord;
      }
    }
  }
}

// 4. Invert Basque -> English to fill English -> Basque
for (const [bWord, eWord] of Object.entries(basqueToEnglish)) {
  const cE = cleanPunct(eWord);
  if (cE && !fullDict[cE]) fullDict[cE] = bWord;
  const baseE = cleanPunct(eWord.replace(/\s*\([^)]*\)/g, ""));
  if (baseE && !fullDict[baseE]) fullDict[baseE] = bWord;
}

const dictEntries = Object.entries(fullDict)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  .join('\n');

const newDictDecl = `export const BASQUE_TO_ENGLISH: Record<string, string> = {\n${dictEntries}\n};`;

code = code.slice(0, startIdx) + newDictDecl + code.slice(endIdx + 1);

fs.writeFileSync(translateFilePath, code, 'utf8');
console.log("Successfully updated BASQUE_TO_ENGLISH dictionary in TranslateChallenge.tsx with", Object.keys(fullDict).length, "entries.");
