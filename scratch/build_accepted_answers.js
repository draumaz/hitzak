const fs = require('fs');
const path = require('path');

const challengesPath = path.join(__dirname, '../data/courses/1/challenges.json');
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

console.log(`Auditing and expanding accepted answers for ${challenges.length} challenges...`);

// Basque grammatical reference data
const SUBJECT_PRONOUNS = {
  "naiz": "ni", "nintzen": "ni", "nago": "ni", "noa": "ni", "nator": "ni", "nabil": "ni", "nengoen": "ni", "nindoan": "ni", "nentorren": "ni",
  "zara": "zu", "zinen": "zu", "zaude": "zu", "zoaz": "zu", "zator": "zu", "zabiltza": "zu", "zeunden": "zu", "zindoazen": "zu", "zentorren": "zu",
  "da": "hura", "zen": "hura", "dago": "hura", "doa": "hura", "dator": "hura", "dabil": "hura", "zegoen": "hura", "zihoan": "hura", "zetorren": "hura",
  "gara": "gu", "ginen": "gu", "gaude": "gu", "goaz": "gu", "gatoz": "gu", "gabiltza": "gu", "geunden": "gu", "gindoazen": "gu", "gentozen": "gu",
  "zarete": "zuek", "zineten": "zuek", "zaudete": "zuek", "zoazte": "zuek", "zatozte": "zuek", "zabiltzate": "zuek", "zeundeten": "zuek", "zindoazten": "zuek", "zentozten": "zuek",
  "dira": "haiek", "ziren": "haiek", "daude": "haiek", "doaz": "haiek", "datoz": "haiek", "dabiltza": "haiek", "zeuden": "haiek", "zihoazen": "haiek", "zetozten": "haiek"
};

const ERGATIVE_PRONOUNS = {
  "dut": "nik", "nuen": "nik", "ditut": "nik", "nituen": "nik", "daukat": "nik", "dauzkat": "nik", "neukan": "nik", "dakit": "nik", "nekien": "nik",
  "duzu": "zuk", "zenuen": "zuk", "dituzu": "zuk", "zenituen": "zuk", "daukazu": "zuk", "dauzkazu": "zuk", "zeneukan": "zuk", "dakizu": "zuk", "zenekien": "zuk",
  "du": "hark", "zuen": "hark", "ditu": "hark", "zituen": "hark", "dauka": "hark", "dauzka": "hark", "zeukan": "hark", "daki": "hark", "zekien": "hark",
  "dugu": "guk", "genuen": "guk", "ditugu": "guk", "genituen": "guk", "daukagu": "guk", "dauzkagu": "guk", "geneukan": "guk", "dakigu": "guk", "genekien": "guk",
  "duzue": "zuek", "zenuten": "zuek", "dituzue": "zuek", "zenituzten": "zuek", "daukazue": "zuek", "dauzkazue": "zuek", "zeneukaten": "zuek", "dakizue": "zuek", "zenekiten": "zuek",
  "dute": "haiek", "zuten": "haiek", "dituzte": "haiek", "zituzten": "haiek", "daukate": "haiek", "dauzkate": "haiek", "zeukaten": "haiek", "dakite": "haiek", "zekiten": "haiek"
};

const ALL_PRONOUNS = new Set([
  "ni", "zu", "hura", "gu", "zuek", "haiek",
  "nik", "zuk", "hark", "guk", "zuek", "haiek",
  "niri", "zuri", "hari", "guri", "zuei", "haiei"
]);

const DEMONSTRATIVES = new Set([
  "hau", "hori", "hura", "hauek", "horiek", "haiek",
  "honek", "horrek", "hark",
  "honi", "horri", "hari", "hauei", "horiei", "haiei",
  "honetan", "horretan", "hartan", "hauetan", "horietan", "haietan",
  "honen", "horren", "haren", "hauen", "horien", "haien",
  "honekin", "horrekin", "harekin", "hauekin", "horiekin", "haiekin"
]);

const PROPER_NOUNS = new Set([
  "mikel", "mikelek", "mikeli", "mikelen",
  "miren", "mirenek", "mireni", "mirenen",
  "aitor", "aitorrek", "aitorri", "aitorren",
  "terese", "teresek", "teresi", "tereseren",
  "jon", "jonek", "joni", "jonen",
  "joseba", "josebak", "josebari", "josebaren",
  "aintza", "aintzak", "aintzari", "aintzaren",
  "karmele", "karmelek", "karmeleri", "karmeleren",
  "donostia", "donostian", "donostiara", "donostiatik", "donostiakoa",
  "bilbo", "bilbon", "bilbora", "bilbotik", "bilbokoa",
  "gasteiz", "gasteizen", "gasteizera", "gasteiztik", "gasteizkoa",
  "irun", "irunen", "irunera", "irundik", "irungoa",
  "espainia", "espainian", "espainiara",
  "frantzia", "frantzian", "frantziara",
  "italia", "italian", "italiara"
]);

const COMMON_NOUNS = new Set([
  "gizon", "gizona", "gizonak", "gizonei", "gizonari", "gizonen", "gizonaren", "gizonez", "gizonarekin",
  "emakume", "emakumea", "emakumeak", "emakumeei", "emakumeari", "emakumeen", "emakumearen", "emakumearekin",
  "mutil", "mutila", "mutilak", "mutilei", "mutilari", "mutilen", "mutilaren", "mutilarekin",
  "neska", "neska", "neskak", "neskei", "neskari", "nesken", "neskaren", "neskarekin",
  "ume", "umea", "umeak", "umeei", "umeari", "umeen", "umearen",
  "ikasle", "ikaslea", "ikasleak", "ikasleei", "ikasleari", "ikasleen", "ikaslearen",
  "irakasle", "irakaslea", "irakasleak", "irakasleei", "irakasleari", "irakasleen", "irakaslearen",
  "mediku", "medikua", "medikuak", "erizain", "erizaina", "erizainak",
  "sukaldari", "sukaldaria", "sukaldariak", "camarero", "camareroa", "camareroak",
  "gidari", "gidaria", "gidariak", "arrotz", "arrotza", "arrotzak",
  "txakur", "txakurra", "txakurrak", "katu", "katua", "katuak",
  "zaldi", "zaldia", "zaldiak", "behi", "behia", "behiak",
  "arrain", "arraina", "arrainak", "txori", "txoria", "txoriak",
  "otso", "otsoa", "otsoak", "ardi", "ardia", "ardiak",
  "ahuntz", "ahuntza", "ahuntzak", "dortoka", "dortokak",
  "suge", "sugea", "sugeak", "hontz", "hontza", "hontzak",
  "txerri", "txerria", "txerriak", "oilo", "oiloa", "oiloak",
  "liburu", "liburua", "liburuak", "etxe", "etxea", "etxeak",
  "auto", "autobus", "autobusa", "autobusak", "kotxe", "kotxea", "kotxeak",
  "eskola", "eskolak", "denda", "dendak", "hotel", "hotela", "hotelak",
  "ostatu", "ostatua", "poltsa", "poltsak", "mahaia", "leihoa", "atea", "kalea",
  "ogi", "ogia", "ardo", "ardoa", "esne", "esnea", "ur", "ura", "kafe", "kafea",
  "gazta", "sagardo", "sagardoa", "zuku", "zuku", "te", "tea", "azukre", "azukrea",
  "gatzi", "piper", "piperra", "ozpin", "ozpina", "haragi", "haragia", "txuleta",
  "barazki", "barazkiak", "arroza", "arraultz", "arrautza", "arrautzak",
  "sagar", "sagarra", "sagarrak", "banana", "banana", "bananak", "limoi", "limoia", "limoiak",
  "melokotoi", "melokotoia", "melokotoiak", "sandia", "sandia", "sandia",
  "azenario", "azenarioa", "azenarioak", "tipula", "tipula", "tipulak",
  "patata", "patata", "patatak", "oilasko", "oilaskoa", "oilaskoak", "txistorra"
]);

const EDUKI_TO_UKAN = {
  "daukat": "dut", "badaukat": "dut", "dauzkat": "ditut",
  "daukazu": "duzu", "badaukazu": "duzu", "dauzkazu": "dituzu",
  "dauka": "du", "badauka": "du", "dauzka": "ditu",
  "daukagu": "dugu", "badaukagu": "dugu", "dauzkagu": "ditugu",
  "daukazue": "duzue", "badaukazue": "duzue", "dauzkazue": "dituzue",
  "daukate": "dute", "badaukate": "dute", "dauzkate": "dituzte",
  "neukan": "nuen", "zeneukan": "zenuen", "zeukan": "zuen",
  "geneukan": "genuen", "zeneukaten": "zenuten", "zeukaten": "zuten"
};

const JAKIN_SYNTHETIC = {
  "dakit": ["badakit", "jakin badakit", "dakit"],
  "badakit": ["dakit", "jakin badakit", "badakit"],
  "dakizu": ["badakizu", "dakizu"],
  "daki": ["badaki", "daki"],
  "dakigu": ["badakigu", "dakigu"],
  "dakizue": ["badakizue", "dakizue"],
  "dakite": ["badakite", "dakite"]
};

function cleanWord(w) {
  return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
}

function formatSentence(str) {
  if (!str || !str.trim()) return "";
  const cleaned = str.replace(/\s+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function hasOvertNounSubject(words) {
  for (let i = 0; i < words.length; i++) {
    const cw = cleanWord(words[i]);
    if (PROPER_NOUNS.has(cw) || COMMON_NOUNS.has(cw)) {
      return true;
    }
    if (DEMONSTRATIVES.has(cw) && i > 0 && COMMON_NOUNS.has(cleanWord(words[i - 1]))) {
      return true;
    }
  }
  return false;
}

// Generate Basque variations
function generateBasqueVariations(originalTarget, prompt = "") {
  const variations = new Set();
  if (!originalTarget || !originalTarget.trim()) return [];

  const baseClean = originalTarget.trim();
  variations.add(baseClean);

  const introMatch = baseClean.match(/^(Kaixo|Epa|Egun on|Arratsalde on|Gabon|Barkatu|Bai|Ez|Mesedez|Ongi etorri|Eskerrik asko)(?:,|\.|\s)\s*(.+)$/i);
  if (introMatch) {
    const intro = introMatch[1];
    const rest = introMatch[2];
    const restVars = generateClauseVariations(rest, prompt);
    for (const rv of restVars) {
      variations.add(`${intro} ${rv}`);
      variations.add(`${intro}, ${rv}`);
    }
  }

  const directVars = generateClauseVariations(baseClean, prompt);
  for (const dv of directVars) {
    variations.add(dv);
  }

  const results = [];
  results.push(baseClean);

  for (const v of variations) {
    const formatted = formatSentence(v);
    const uncapitalized = v.trim();
    if (formatted && !results.includes(formatted)) {
      results.push(formatted);
    }
    if (uncapitalized && !results.includes(uncapitalized)) {
      results.push(uncapitalized);
    }
  }

  return results;
}

function generateClauseVariations(clause, prompt = "") {
  const variations = new Set();
  variations.add(clause.trim());

  const sentences = splitIntoSentences(clause);
  if (sentences.length > 1) {
    const perSentenceVars = sentences.map(s => generateSingleClauseVariations(s, prompt));
    const cartesian = cartesianProduct(perSentenceVars);
    for (const combo of cartesian) {
      variations.add(combo.join(" "));
      variations.add(combo.map(c => formatSentence(c) + ".").join(" "));
    }
    return Array.from(variations);
  }

  const singleVars = generateSingleClauseVariations(clause, prompt);
  for (const sv of singleVars) {
    variations.add(sv);
  }

  return Array.from(variations);
}

function splitIntoSentences(clause) {
  const words = clause.trim().split(/\s+/);
  const sentenceStarts = [0];
  
  for (let i = 1; i < words.length; i++) {
    const w = words[i];
    const clean = cleanWord(w);
    if (/^[A-Z]/.test(w) && ALL_PRONOUNS.has(clean)) {
      sentenceStarts.push(i);
    }
  }

  if (sentenceStarts.length <= 1) return [clause];

  const parts = [];
  for (let s = 0; s < sentenceStarts.length; s++) {
    const start = sentenceStarts[s];
    const end = s + 1 < sentenceStarts.length ? sentenceStarts[s + 1] : words.length;
    parts.push(words.slice(start, end).join(" "));
  }
  return parts;
}

function cartesianProduct(arrs) {
  return arrs.reduce((acc, curr) => {
    const res = [];
    for (const a of acc) {
      for (const c of curr) {
        res.push([...a, c]);
      }
    }
    return res;
  }, [[]]);
}

function generateSingleClauseVariations(clause, prompt = "") {
  const variations = new Set();
  variations.add(clause.trim());

  const words = clause.trim().split(/\s+/);
  const cleanWords = words.map(cleanWord);
  const hasNounSubj = hasOvertNounSubject(words);

  // 1. Polar questions with/without 'al'
  const alIdx = cleanWords.indexOf("al");
  if (alIdx !== -1) {
    const withoutAlWords = words.filter((_, idx) => idx !== alIdx);
    const withoutAl = withoutAlWords.join(" ");
    variations.add(withoutAl);
    const sub = generateSingleClauseVariations(withoutAl, prompt);
    sub.forEach(s => {
      variations.add(s);
      const sWords = s.split(/\s+/);
      const verbIdx = sWords.findIndex(w => SUBJECT_PRONOUNS[cleanWord(w)] || ERGATIVE_PRONOUNS[cleanWord(w)]);
      if (verbIdx > 0 && !sWords.map(cleanWord).includes("al")) {
        const withAl = [...sWords.slice(0, verbIdx), "al", ...sWords.slice(verbIdx)].join(" ");
        variations.add(withAl);
      }
    });
  } else {
    const isPolarQuestion = prompt.includes("?") && !cleanWords.some(w => ["zer", "zein", "nor", "nork", "non", "nora", "nondik", "nola", "zenbat", "zergatik"].includes(w));
    if (isPolarQuestion) {
      const verbIdx = words.findIndex(w => SUBJECT_PRONOUNS[cleanWord(w)] || ERGATIVE_PRONOUNS[cleanWord(w)]);
      if (verbIdx > 0) {
        const withAl = [...words.slice(0, verbIdx), "al", ...words.slice(verbIdx)].join(" ");
        variations.add(withAl);
      }
    }
  }

  // 2. Pro-Drop
  const pronounIdx = cleanWords.findIndex(w => ALL_PRONOUNS.has(w));
  if (pronounIdx !== -1) {
    const pronoun = cleanWords[pronounIdx];
    const withoutPronounWords = words.filter((_, idx) => idx !== pronounIdx);
    const withoutPronoun = withoutPronounWords.join(" ");
    if (withoutPronoun.trim().length > 0) {
      variations.add(withoutPronoun);
      const postposed = [...withoutPronounWords, pronoun].join(" ");
      variations.add(postposed);
    }
  } else if (!hasNounSubj) {
    const subjVerbs = cleanWords.filter(w => SUBJECT_PRONOUNS[w]);
    const ergVerbs = cleanWords.filter(w => ERGATIVE_PRONOUNS[w]);

    if (subjVerbs.length === 1 && ergVerbs.length === 0) {
      const p = SUBJECT_PRONOUNS[subjVerbs[0]];
      if (p) {
        variations.add(`${p} ${clause}`);
        variations.add(`${clause} ${p}`);
      }
    } else if (ergVerbs.length === 1) {
      const p = ERGATIVE_PRONOUNS[ergVerbs[0]];
      if (p) {
        variations.add(`${p} ${clause}`);
        variations.add(`${clause} ${p}`);
      }
    }
  }

  // 3. Copular Sentences: [Subj] [Pred] [Copula]
  const copulas = ["naiz", "zara", "da", "gara", "zarete", "dira", "nintzen", "zinen", "zen", "ginen", "zineten", "ziren"];
  const copulaIdx = cleanWords.findIndex(w => copulas.includes(w));
  
  if (copulaIdx !== -1 && copulaIdx === cleanWords.length - 1 && cleanWords.length >= 3 && !cleanWords.includes("ez")) {
    const copula = words[copulaIdx];
    const beforeCopula = words.slice(0, copulaIdx);
    
    const ereIdx = cleanWords.indexOf("ere");
    if (ereIdx !== -1) {
      const noun = beforeCopula.slice(0, ereIdx).join(" ");
      const pred = beforeCopula.slice(ereIdx + 1).join(" ");
      if (noun && pred) {
        const baCopula = "ba" + copula;
        variations.add(`${noun} ${pred} ere ${baCopula}`);
        variations.add(`${pred} ere ${baCopula} ${noun.toLowerCase()}`);
        if (ALL_PRONOUNS.has(cleanWord(noun))) {
          variations.add(`${pred} ere ${baCopula}`);
        }
      }
    } else {
      const subj = beforeCopula[0];
      const pred = beforeCopula.slice(1).join(" ");

      variations.add(`${pred} ${copula} ${subj.toLowerCase()}`);
      variations.add(`${subj} ${copula} ${pred}`);

      if (ALL_PRONOUNS.has(cleanWord(subj))) {
        variations.add(`${pred} ${copula}`);
      }
    }
  }

  // 4. Negative Syntax
  const ezIdx = cleanWords.indexOf("ez");
  if (ezIdx !== -1 && ezIdx + 1 < cleanWords.length) {
    const nextWord = cleanWords[ezIdx + 1];
    const isAux = ERGATIVE_PRONOUNS[nextWord] || SUBJECT_PRONOUNS[nextWord] || copulas.includes(nextWord);
    
    if (isAux) {
      const aux = words[ezIdx + 1];
      const subjBefore = words.slice(0, ezIdx).join(" ");
      const rest = words.slice(ezIdx + 2);

      if (rest.length >= 2) {
        const part1 = rest.slice(0, rest.length - 1).join(" ");
        const part2 = rest[rest.length - 1];
        
        if (subjBefore) {
          variations.add(`${subjBefore} ez ${aux} ${part2} ${part1}`);
          variations.add(`${subjBefore} ez ${aux} ${part1} ${part2}`);
        } else {
          variations.add(`ez ${aux} ${part2} ${part1}`);
          variations.add(`ez ${aux} ${part1} ${part2}`);
        }
      }

      const partitiveIdx = words.findIndex(w => /[a-z]+(ik|rik)$/i.test(cleanWord(w)) && !["poliki", "oraindik", "seguru aski", "berrik"].includes(cleanWord(w)));
      if (partitiveIdx !== -1) {
        const partWord = words[partitiveIdx];
        const defWord = partWord.replace(/rik$/i, "a").replace(/ik$/i, "a");
        const withDef = [...words.slice(0, partitiveIdx), defWord, ...words.slice(partitiveIdx + 1)].join(" ");
        variations.add(withDef);
      }
    }
  }

  // 5. Number permutations: "bi [noun]" <-> "[noun] bi"
  const biIdx = cleanWords.indexOf("bi");
  if (biIdx !== -1) {
    if (biIdx + 1 < words.length && !ALL_PRONOUNS.has(cleanWords[biIdx + 1])) {
      const noun = words[biIdx + 1];
      const swapped = [...words.slice(0, biIdx), noun, "bi", ...words.slice(biIdx + 2)].join(" ");
      variations.add(swapped);
    } else if (biIdx > 0 && !ALL_PRONOUNS.has(cleanWords[biIdx - 1])) {
      const noun = words[biIdx - 1];
      const swapped = [...words.slice(0, biIdx - 1), "bi", noun, ...words.slice(biIdx + 1)].join(" ");
      variations.add(swapped);
    }
  }

  // 6. Synthetic vs. Periphrastic Verbs
  for (const [eduki, ukan] of Object.entries(EDUKI_TO_UKAN)) {
    const idx = cleanWords.indexOf(eduki);
    if (idx !== -1) {
      const withUkan = [...words.slice(0, idx), ukan, ...words.slice(idx + 1)].join(" ");
      variations.add(withUkan);
    }
  }

  for (const [jakin, alts] of Object.entries(JAKIN_SYNTHETIC)) {
    const idx = cleanWords.indexOf(jakin);
    if (idx !== -1) {
      alts.forEach(alt => {
        const withAlt = [...words.slice(0, idx), alt, ...words.slice(idx + 1)].join(" ");
        variations.add(withAlt);
      });
    }
  }

  // 7. Transitive Word Order Variations (SOV, OSV, OVS, SVO)
  const ergAuxIdx = cleanWords.findIndex(w => ["dut", "duzu", "du", "dugu", "duzue", "dute", "ditut", "dituzu", "ditu", "ditugu", "dituzue", "dituzte", "nuen", "zenuen", "zuen", "genuen", "zenuten", "zuten"].includes(w));
  if (ergAuxIdx !== -1 && ergAuxIdx === cleanWords.length - 1 && cleanWords.length >= 4 && !cleanWords.includes("ez")) {
    const aux = words[ergAuxIdx];
    const mainVerb = words[ergAuxIdx - 1];
    const argumentsBefore = words.slice(0, ergAuxIdx - 1);

    if (argumentsBefore.length === 2) {
      const arg1 = argumentsBefore[0];
      const arg2 = argumentsBefore[1];

      variations.add(`${arg2} ${arg1.toLowerCase()} ${mainVerb} ${aux}`);
      variations.add(`${arg2} ${mainVerb} ${aux} ${arg1.toLowerCase()}`);
      variations.add(`${arg1} ${mainVerb} ${aux} ${arg2}`);
      if (ALL_PRONOUNS.has(cleanWord(arg1))) {
        variations.add(`${mainVerb} ${aux} ${arg2}`);
      }
    }
  }

  return Array.from(variations);
}

// Generate English variations
function generateEnglishVariations(target, prompt = "") {
  const variations = new Set();
  if (!target || !target.trim()) return [];

  const base = target.trim();
  variations.add(base);
  variations.add(base.replace(/[.,!?]/g, "").trim());

  // English contractions mapping
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

  const results = [];
  results.push(base);

  for (const v of variations) {
    if (v && !results.includes(v)) {
      results.push(v);
    }
  }

  return results;
}

// Process all challenges
let updatedCount = 0;
const processedChallenges = challenges.map(c => {
  const updated = { ...c };
  
  if (c.type === 'TRANSLATE') {
    const correctOptions = (c.options || [])
      .filter(o => o.correct)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetText = correctOptions.map(o => o.text).join(' ').trim();
    
    if (c.question.toLowerCase().includes('basque')) {
      // Basque translation
      const answers = generateBasqueVariations(targetText, c.prompt || '');
      updated.acceptedAnswers = answers;
    } else {
      // English translation
      const answers = generateEnglishVariations(targetText, c.prompt || '');
      updated.acceptedAnswers = answers;
    }
    updatedCount++;
  } else if (c.type === 'SELECT' || c.type === 'LISTEN') {
    const correctOpt = (c.options || []).find(o => o.correct);
    if (correctOpt && correctOpt.text) {
      updated.acceptedAnswers = [correctOpt.text.trim()];
    } else if (c.audioText) {
      updated.acceptedAnswers = [c.audioText.trim()];
    }
    updatedCount++;
  } else if (c.type === 'MATCH') {
    const correctOpts = (c.options || []).filter(o => o.correct);
    updated.acceptedAnswers = correctOpts.map(o => o.text.trim());
    updatedCount++;
  }

  return updated;
});

console.log(`Processed ${updatedCount} challenges with acceptedAnswers.`);

// Stats on acceptedAnswers
let totalAnswers = 0;
let maxAnswers = 0;
let minAnswers = Infinity;
for (const c of processedChallenges) {
  const len = (c.acceptedAnswers || []).length;
  totalAnswers += len;
  if (len > maxAnswers) maxAnswers = len;
  if (len < minAnswers) minAnswers = len;
}
console.log(`Avg acceptedAnswers per challenge: ${(totalAnswers / processedChallenges.length).toFixed(2)}`);
console.log(`Min: ${minAnswers}, Max: ${maxAnswers}`);

// Inspect sample challenges
console.log("\n--- Sample Basque TRANSLATE Challenge with acceptedAnswers: ---");
const sampleBasque = processedChallenges.find(c => c.type === 'TRANSLATE' && c.question.toLowerCase().includes('basque'));
console.log(JSON.stringify(sampleBasque, null, 2));

console.log("\n--- Sample English TRANSLATE Challenge with acceptedAnswers: ---");
const sampleEng = processedChallenges.find(c => c.type === 'TRANSLATE' && !c.question.toLowerCase().includes('basque'));
console.log(JSON.stringify(sampleEng, null, 2));
