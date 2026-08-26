const fs = require('fs');
const path = require('path');

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

const COMMON_NOUNS_SINGULAR = new Set([
  "gizona", "gizonak", "emakumea", "emakumeak", "mutila", "mutilak", "neska", "neskak",
  "txakurra", "txakurrak", "katua", "katuak", "liburua", "liburuak", "ogia", "ardoa",
  "sagardoa", "esnea", "ura", "kafea", "gazta", "etxea", "etxeak", "ikaslea", "ikasleak",
  "irakaslea", "irakasleak", "kotxea", "kotxeak", "autobusa", "autobusak", "hotela", "hotelak",
  "ostatu", "ostatua", "denda", "dendak", "eskola", "eskolak", "gidaria", "gidariak",
  "sukaldaria", "sukaldariak", "camareroa", "camareroak", "medikua", "medikuak", "erizaina", "erizainak",
  "behia", "behiak", "txoria", "txoriak", "zaldia", "zaldiak", "ardia", "ardiak", "otsoa", "otsoak",
  "ahuntza", "ahuntzak", "dortoka", "dortokak", "sugea", "sugeak", "hontza", "hontzak", "arraina", "arrainak",
  "sagarra", "sagarrak", "banana", "bananak", "limoia", "limoiak", "melokotoia", "melokotoiak", "sandia",
  "azenarioa", "azenarioak", "tipula", "tipulak", "patata", "patatak", "oilaskoa", "oilaskoak", "txistorra",
  "arrotza", "arrotz", "arrotzak", "mahaia", "leihoa", "atea", "kalea"
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
  for (const w of words) {
    const cw = cleanWord(w);
    if (PROPER_NOUNS.has(cw) || COMMON_NOUNS_SINGULAR.has(cw)) {
      return true;
    }
  }
  return false;
}

function generateBasqueVariations(originalTarget, prompt = "") {
  const variations = new Set();
  if (!originalTarget || !originalTarget.trim()) return [];

  const baseClean = originalTarget.trim();
  variations.add(baseClean);

  // Check greeting/intro prefix: "Kaixo ...", "Epa ...", "Barkatu ...", "Bai ...", "Ez, ..."
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

  // Compile final array with original target strictly first
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

  // Split multiple sentences if present
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
    // If it starts with a capital letter and is a pronoun or greeting or not a proper noun in middle
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

  const hasNounSubject = hasOvertNounSubject(words);

  // 1. Polar Question with 'al'
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

  // 2. Pro-Drop: Pronoun presence and position
  const pronounIdx = cleanWords.findIndex(w => ALL_PRONOUNS.has(w));
  if (pronounIdx !== -1) {
    const pronoun = cleanWords[pronounIdx];
    const withoutPronounWords = words.filter((_, idx) => idx !== pronounIdx);
    const withoutPronoun = withoutPronounWords.join(" ");
    if (withoutPronoun.trim().length > 0) {
      variations.add(withoutPronoun);
      // Postposed pronoun
      const postposed = [...withoutPronounWords, pronoun].join(" ");
      variations.add(postposed);
    }
  } else if (!hasNounSubject) {
    // If no overt subject noun and no pronoun, add compatible pronoun
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
    
    // Check if 'ere' is present: e.g. "Miren ere irakaslea da"
    const ereIdx = cleanWords.indexOf("ere");
    if (ereIdx !== -1) {
      // e.g. "Miren ere irakaslea da" -> "Miren irakaslea ere bada", "Irakaslea ere bada Miren"
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
      // Standard copula [Subj] [Pred] [Copula]
      const subj = beforeCopula[0];
      const pred = beforeCopula.slice(1).join(" ");

      // [Pred] [Copula] [Subj] -> "Mutil bat naiz ni", "Irakaslea da Miren"
      variations.add(`${pred} ${copula} ${subj.toLowerCase()}`);

      // [Subj] [Copula] [Pred] -> "Ni naiz mutil bat", "Miren da irakaslea"
      variations.add(`${subj} ${copula} ${pred}`);

      // [Pred] [Copula] (pro-drop)
      if (ALL_PRONOUNS.has(cleanWord(subj))) {
        variations.add(`${pred} ${copula}`);
      }
    }
  }

  // 4. Negative Syntax (ez + finite auxiliary/verb)
  const ezIdx = cleanWords.indexOf("ez");
  if (ezIdx !== -1 && ezIdx + 1 < cleanWords.length) {
    const nextWord = cleanWords[ezIdx + 1];
    const isAux = ERGATIVE_PRONOUNS[nextWord] || SUBJECT_PRONOUNS[nextWord] || copulas.includes(nextWord);
    
    if (isAux) {
      const aux = words[ezIdx + 1];
      const subjBefore = words.slice(0, ezIdx).join(" ");
      const rest = words.slice(ezIdx + 2);

      // Participle and object inversion in negative periphrastic
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

      // Partitive vs Definite under negation
      // e.g. "ardorik" <-> "ardoa", "ogirik" <-> "ogia"
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
  // Eduki <-> Ukan
  for (const [eduki, ukan] of Object.entries(EDUKI_TO_UKAN)) {
    const idx = cleanWords.indexOf(eduki);
    if (idx !== -1) {
      const withUkan = [...words.slice(0, idx), ukan, ...words.slice(idx + 1)].join(" ");
      variations.add(withUkan);
    }
  }

  // Jakin synthetic variants
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

      // OSVA: "Sagarra nik jaten dut"
      variations.add(`${arg2} ${arg1.toLowerCase()} ${mainVerb} ${aux}`);
      // OVAS: "Sagarra jaten dut nik"
      variations.add(`${arg2} ${mainVerb} ${aux} ${arg1.toLowerCase()}`);
      // SAVO: "Nik jaten dut sagarra"
      variations.add(`${arg1} ${mainVerb} ${aux} ${arg2}`);
      // AVO (pro-drop): "Jaten dut sagarra"
      if (ALL_PRONOUNS.has(cleanWord(arg1))) {
        variations.add(`${mainVerb} ${aux} ${arg2}`);
      }
    }
  }

  return Array.from(variations);
}

// Test on sample unique sentences
console.log("=== TESTING REFINED VARIATION GENERATOR ===");
const testSamples = [
  "Kaixo ni mutil bat naiz",
  "Zu gizon bat zara",
  "Miren irakaslea da",
  "Gu emakumeak gara",
  "Zu Aitor zara Zu ikasle bat zara",
  "Nik sagarra jaten dut",
  "Ez dut liburua irakurri",
  "Ni Donostian bizi naiz",
  "Guk bi sagar ditugu",
  "Liburu bat daukat",
  "Badakit euskara",
  "Zu Mikel al zara",
  "Mutil hauek hemen daude",
  "Ez dugu ardorik edaten",
  "Miren ere irakaslea da"
];

testSamples.forEach(sample => {
  const vars = generateBasqueVariations(sample);
  console.log(`\nOriginal: "${sample}"`);
  console.log(`Variations (${vars.length}):`);
  vars.forEach(v => console.log(`  - "${v}"`));
});
