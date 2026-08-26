const fs = require('fs');
const path = require('path');

// Pronoun and verb mappings for Basque
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

const DATIVE_PRONOUNS = {
  "zait": "niri", "zitzaidan": "niri", "diot": "niri", "dizkiot": "niri",
  "zaizu": "zuri", "zitzaizun": "zuri", "diozu": "zuri", "dizkiozu": "zuri",
  "zaio": "hari", "zitzaion": "hari", "dio": "hari", "dizkio": "hari",
  "zaigu": "guri", "zitzaigun": "guri", "diogu": "guri", "dizkiogu": "guri",
  "zaizue": "zuei", "zitzaizuen": "zuei", "diozue": "zuei", "dizkiozue": "zuei",
  "zaie": "haiei", "zitzaien": "haiei", "diote": "haiei", "dizkiote": "haiei"
};

const ALL_PRONOUNS = new Set([
  "ni", "zu", "hura", "gu", "zuek", "haiek",
  "nik", "zuk", "hark", "guk", "zuek", "haiek",
  "niri", "zuri", "hari", "guri", "zuei", "haiei"
]);

// Synthetic eduki to ukan equivalents
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

const UKAN_TO_EDUKI = {
  "dut": "daukat", "ditut": "dauzkat",
  "duzu": "daukazu", "dituzu": "dauzkazu",
  "du": "dauka", "ditu": "dauzka",
  "dugu": "daukagu", "ditugu": "dauzkagu",
  "duzue": "daukazue", "dituzue": "dauzkazue",
  "dute": "daukate", "dituzte": "dauzkate"
};

// Synthetic jakin variants
const JAKIN_VARIANTS = {
  "dakit": ["badakit", "jakin badakit", "dakit"],
  "badakit": ["dakit", "jakin badakit", "badakit"],
  "dakizu": ["badakizu", "dakizu"],
  "daki": ["badaki", "daki"],
  "dakigu": ["badakigu", "dakigu"],
  "dakizue": ["badakizue", "dakizue"],
  "dakite": ["badakite", "dakite"]
};

// Synthetic egon variants (affirmative ba-)
const EGON_BA_VARIANTS = {
  "dago": ["badago", "dago"],
  "daude": ["badaude", "daude"],
  "nago": ["banago", "nago"],
  "zaude": ["bazaude", "zaude"],
  "gaude": ["bagaude", "gaude"],
  "zaudete": ["bazaudete", "zaudete"],
  "zegoen": ["bazegoen", "zegoen"],
  "zeuden": ["bazeuden", "zeuden"]
};

function cleanWord(w) {
  return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
}

function formatSentence(str) {
  if (!str || !str.trim()) return "";
  const cleaned = str.replace(/\s+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Generate valid Basque variations for a sentence
function generateBasqueVariations(originalTarget, prompt = "") {
  const variations = new Set();
  if (!originalTarget || !originalTarget.trim()) return [];

  // Always include original formatted
  variations.add(originalTarget.trim());

  // Check if originalTarget is composed of multiple sentences / introductory greeting phrases
  // e.g. "Kaixo ni mutil bat naiz", "Epa Ni Aitor naiz Ni mutila naiz", "Barkatu Nor zara zu", "Bai Hura Miren da"
  const greetingPrefixMatch = originalTarget.match(/^(Kaixo|Epa|Egun on|Arratsalde on|Gabon|Barkatu|Bai|Ez|Mesedez|Ongi etorri|Eskerrik asko)(?:,|\.|\s)\s*(.+)$/i);
  
  if (greetingPrefixMatch) {
    const greeting = greetingPrefixMatch[1];
    const rest = greetingPrefixMatch[2];
    const subVariations = generateClauseVariations(rest, prompt);
    for (const sub of subVariations) {
      variations.add(`${greeting} ${sub}`);
      variations.add(`${greeting}, ${sub}`);
    }
  }

  // Also process whole as single/compound clause
  const directVariations = generateClauseVariations(originalTarget, prompt);
  for (const v of directVariations) {
    variations.add(v);
  }

  // Clean and filter variations
  const results = [];
  // Ensure the primary answer is first
  results.push(originalTarget.trim());

  for (const v of variations) {
    const trimmed = v.trim();
    if (trimmed && !results.includes(trimmed)) {
      results.push(trimmed);
    }
  }

  return results;
}

// Generate variations for a single sentence / clause
function generateClauseVariations(clause, prompt = "") {
  const clauseVariations = new Set();
  clauseVariations.add(clause.trim());

  // Check for multi-clause separated by capital letters or periods:
  // e.g. "Zu Aitor zara Zu ikasle bat zara", "Hura Miren da Miren emakumea da"
  // Split into independent sentences if multiple verbs present
  const sentences = splitIntoSentences(clause);
  if (sentences.length > 1) {
    const perSentenceVariations = sentences.map(s => generateSingleClauseVariations(s, prompt));
    // Cartesian product of variations across sentences
    const cartesian = cartesianProduct(perSentenceVariations);
    for (const prod of cartesian) {
      clauseVariations.add(prod.join(" "));
      clauseVariations.add(prod.map(p => formatSentence(p) + ".").join(" "));
    }
    return Array.from(clauseVariations);
  }

  const singleVars = generateSingleClauseVariations(clause, prompt);
  for (const v of singleVars) {
    clauseVariations.add(v);
  }

  return Array.from(clauseVariations);
}

function splitIntoSentences(clause) {
  // If there are multiple capital letters after words, or periods:
  const words = clause.trim().split(/\s+/);
  const sentenceStarts = [];
  
  for (let i = 0; i < words.length; i++) {
    if (i === 0) {
      sentenceStarts.push(0);
    } else if (/^[A-Z]/.test(words[i]) && !isProperNoun(words[i])) {
      // It starts with a capital and is not a proper noun (e.g. "Zu", "Ni", "Hura", "Gu", "Haiek", "Epa", "Kaixo")
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

function isProperNoun(word) {
  const clean = cleanWord(word);
  const properNouns = [
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
  ];
  return properNouns.includes(clean);
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

  // 1. Check for Question particle 'al' (Polar questions)
  // e.g. "Zu Mikel al zara" <-> "Zu Mikel zara", "Mikel al zara", "Mikel zara", "Mikel al zara zu", "Mikel zara zu"
  const alIndex = cleanWords.indexOf("al");
  if (alIndex !== -1) {
    const withoutAl = words.filter((_, idx) => idx !== alIndex).join(" ");
    variations.add(withoutAl);
    // Recursively get variations for withoutAl
    const sub = generateSingleClauseVariations(withoutAl, prompt);
    sub.forEach(s => {
      variations.add(s);
      // Reinsert 'al' immediately before the finite verb
      const sWords = s.split(/\s+/);
      const verbIdx = sWords.findIndex(w => SUBJECT_PRONOUNS[cleanWord(w)] || ERGATIVE_PRONOUNS[cleanWord(w)]);
      if (verbIdx !== -1) {
        const withAl = [...sWords.slice(0, verbIdx), "al", ...sWords.slice(verbIdx)].join(" ");
        variations.add(withAl);
      }
    });
  } else {
    // If it is a question, maybe add 'al' before the verb if it's a polar question
    const isPolarQuestion = prompt.includes("?") && !cleanWords.some(w => ["zer", "zein", "nor", "nork", "non", "nora", "nondik", "nola", "zenbat", "zergatik"].includes(w));
    if (isPolarQuestion) {
      const verbIdx = words.findIndex(w => SUBJECT_PRONOUNS[cleanWord(w)] || ERGATIVE_PRONOUNS[cleanWord(w)]);
      if (verbIdx > 0 && !cleanWords.includes("al")) {
        const withAl = [...words.slice(0, verbIdx), "al", ...words.slice(verbIdx)].join(" ");
        variations.add(withAl);
      }
    }
  }

  // 2. Pro-Drop Pronoun Variations (Subject / Ergative / Dative)
  const pronounIdx = cleanWords.findIndex(w => ALL_PRONOUNS.has(w));
  if (pronounIdx !== -1) {
    const pronoun = cleanWords[pronounIdx];
    const withoutPronounWords = words.filter((_, idx) => idx !== pronounIdx);
    const withoutPronoun = withoutPronounWords.join(" ");
    if (withoutPronoun.trim().length > 0) {
      variations.add(formatSentence(withoutPronoun));
      variations.add(withoutPronoun);

      // Also generate postposed pronoun: [Rest] [Pronoun]
      const postposedPronoun = [...withoutPronounWords, words[pronounIdx].toLowerCase()].join(" ");
      variations.add(formatSentence(postposedPronoun));
      variations.add(postposedPronoun);
    }
  } else {
    // If no pronoun is present, check if we can add the compatible pronoun
    // Find verbs
    const subjVerbs = cleanWords.filter(w => SUBJECT_PRONOUNS[w]);
    const ergVerbs = cleanWords.filter(w => ERGATIVE_PRONOUNS[w]);

    if (subjVerbs.length === 1 && ergVerbs.length === 0) {
      const p = SUBJECT_PRONOUNS[subjVerbs[0]];
      if (p) {
        // Preposed pronoun: [Pronoun] [Sentence]
        variations.add(formatSentence(`${p} ${clause}`));
        // Postposed pronoun: [Sentence] [Pronoun]
        variations.add(`${clause} ${p}`);
      }
    } else if (ergVerbs.length === 1) {
      const p = ERGATIVE_PRONOUNS[ergVerbs[0]];
      if (p) {
        variations.add(formatSentence(`${p} ${clause}`));
        variations.add(`${clause} ${p}`);
      }
    }
  }

  // 3. Copular Sentences: [Subj] [Pred] [Copula] (e.g. "Ni mutil bat naiz", "Miren irakaslea da", "Gu mutilak gara")
  const copulaIdx = cleanWords.findIndex(w => ["naiz", "zara", "da", "gara", "zarete", "dira", "nintzen", "zinen", "zen", "ginen", "zineten", "ziren"].includes(w));
  if (copulaIdx !== -1 && copulaIdx === cleanWords.length - 1) {
    // Structure: ... [Pred] [Copula]
    const copula = words[copulaIdx];
    const beforeCopula = words.slice(0, copulaIdx);
    
    if (beforeCopula.length >= 2) {
      // e.g. "Ni" "mutil bat" "naiz" -> subj = "Ni", pred = "mutil bat"
      // or "Miren" "irakaslea" "da" -> subj = "Miren", pred = "irakaslea"
      const subj = beforeCopula[0];
      const pred = beforeCopula.slice(1).join(" ");

      // Variation 1: [Pred] [Copula] [Subj] -> "Mutil bat naiz ni", "Irakaslea da Miren"
      variations.add(formatSentence(`${pred} ${copula} ${subj.toLowerCase()}`));

      // Variation 2: [Subj] [Copula] [Pred] -> "Ni naiz mutil bat", "Miren da irakaslea" (cleft/focus)
      variations.add(formatSentence(`${subj} ${copula} ${pred}`));

      // Variation 3: [Pred] [Copula] (pro-drop if subj is pronoun)
      if (ALL_PRONOUNS.has(cleanWord(subj))) {
        variations.add(formatSentence(`${pred} ${copula}`));
      }
    }
  }

  // 4. Negative Syntax Variations (ez + aux / finite verb)
  // e.g. "Ez dut liburua irakurri" <-> "Ez dut irakurri liburua" <-> "Nik ez dut liburua irakurri"
  const ezIdx = cleanWords.indexOf("ez");
  if (ezIdx !== -1) {
    // Check if followed by auxiliary or finite verb
    if (ezIdx + 1 < cleanWords.length) {
      const nextWord = cleanWords[ezIdx + 1];
      // e.g. "ez dut", "ez da", "ez dugu", "ez zen", "ez nuen"
      if (ERGATIVE_PRONOUNS[nextWord] || SUBJECT_PRONOUNS[nextWord]) {
        const aux = words[ezIdx + 1];
        const rest = words.slice(ezIdx + 2);
        
        // If rest has [Obj] [Verb] or [Verb] [Obj]
        if (rest.length >= 2) {
          const part1 = rest.slice(0, rest.length - 1).join(" ");
          const part2 = rest[rest.length - 1];
          // Inverted: "ez dut irakurri liburua" <-> "ez dut liburua irakurri"
          variations.add(formatSentence(`ez ${aux} ${part2} ${part1}`));
          variations.add(formatSentence(`ez ${aux} ${part1} ${part2}`));
        }

        // Check partitive -ik under negation: "ez dut ardorik edaten" <-> "ez dut ardoa edaten"
        const partitiveIdx = words.findIndex(w => /[a-z]+(ik|rik)$/i.test(cleanWord(w)) && !["poliki", "oraindik", "seguru aski", "berrik"].includes(cleanWord(w)));
        if (partitiveIdx !== -1) {
          const partWord = words[partitiveIdx];
          // e.g. "ardorik" -> "ardoa", "ogirik" -> "ogia", "freskagarririk" -> "freskagarria"
          const defWord = partWord.replace(/rik$/i, "a").replace(/ik$/i, "a");
          const withDef = [...words.slice(0, partitiveIdx), defWord, ...words.slice(partitiveIdx + 1)].join(" ");
          variations.add(withDef);
        }
      }
    }
  }

  // 5. Synthetic vs. Periphrastic Verbs
  // Eduki <-> Ukan
  for (const [eduki, ukan] of Object.entries(EDUKI_TO_UKAN)) {
    const idx = cleanWords.indexOf(eduki);
    if (idx !== -1) {
      const withUkan = [...words.slice(0, idx), ukan, ...words.slice(idx + 1)].join(" ");
      variations.add(withUkan);
      // Also generate pro-drop and subject variants
      const sub = generateSingleClauseVariations(withUkan, prompt);
      sub.forEach(s => variations.add(s));
    }
  }

  for (const [ukan, eduki] of Object.entries(UKAN_TO_EDUKI)) {
    // Only if context is possession (e.g. prompt has "have" / "has")
    if (prompt.toLowerCase().includes("have") || prompt.toLowerCase().includes("has")) {
      const idx = cleanWords.indexOf(ukan);
      if (idx !== -1) {
        const withEduki = [...words.slice(0, idx), eduki, ...words.slice(idx + 1)].join(" ");
        variations.add(withEduki);
      }
    }
  }

  // Jakin variants
  for (const [jakin, alts] of Object.entries(JAKIN_VARIANTS)) {
    const idx = cleanWords.indexOf(jakin);
    if (idx !== -1) {
      alts.forEach(alt => {
        const withAlt = [...words.slice(0, idx), alt, ...words.slice(idx + 1)].join(" ");
        variations.add(withAlt);
      });
    }
  }

  // Egon ba- variants
  for (const [egon, alts] of Object.entries(EGON_BA_VARIANTS)) {
    const idx = cleanWords.indexOf(egon);
    if (idx !== -1 && !cleanWords.includes("ez")) {
      alts.forEach(alt => {
        const withAlt = [...words.slice(0, idx), alt, ...words.slice(idx + 1)].join(" ");
        variations.add(withAlt);
      });
    }
  }

  // 6. Number permutations (e.g. "bi gizon" <-> "gizon bi", "bi sagar" <-> "sagar bi")
  const biIdx = cleanWords.indexOf("bi");
  if (biIdx !== -1) {
    if (biIdx + 1 < words.length && !ALL_PRONOUNS.has(cleanWords[biIdx + 1])) {
      // "bi [noun]" -> "[noun] bi"
      const noun = words[biIdx + 1];
      const swapped = [...words.slice(0, biIdx), noun, "bi", ...words.slice(biIdx + 2)].join(" ");
      variations.add(formatSentence(swapped));
    } else if (biIdx > 0 && !ALL_PRONOUNS.has(cleanWords[biIdx - 1])) {
      // "[noun] bi" -> "bi [noun]"
      const noun = words[biIdx - 1];
      const swapped = [...words.slice(0, biIdx - 1), "bi", noun, ...words.slice(biIdx + 1)].join(" ");
      variations.add(formatSentence(swapped));
    }
  }

  // 7. Transitive Word Order Variations (SOV, OSV, OVS, SVO)
  // e.g. "Nik sagarra jaten dut", "Sagarra nik jaten dut", "Sagarra jaten dut nik", "Nik jaten dut sagarra"
  const ergAuxIdx = cleanWords.findIndex(w => ["dut", "duzu", "du", "dugu", "duzue", "dute", "ditut", "dituzu", "ditu", "ditugu", "dituzue", "dituzte", "nuen", "zenuen", "zuen", "genuen", "zenuten", "zuten"].includes(w));
  if (ergAuxIdx !== -1 && ergAuxIdx === cleanWords.length - 1 && cleanWords.length >= 3 && !cleanWords.includes("ez")) {
    const aux = words[ergAuxIdx];
    const mainVerb = words[ergAuxIdx - 1];
    const argumentsBefore = words.slice(0, ergAuxIdx - 1);

    if (argumentsBefore.length === 2) {
      // e.g. "Nik" "sagarra" "jaten" "dut"
      const arg1 = argumentsBefore[0];
      const arg2 = argumentsBefore[1];

      // OSVA: "Sagarra nik jaten dut"
      variations.add(formatSentence(`${arg2} ${arg1.toLowerCase()} ${mainVerb} ${aux}`));
      // OVAS: "Sagarra jaten dut nik"
      variations.add(formatSentence(`${arg2} ${mainVerb} ${aux} ${arg1.toLowerCase()}`));
      // SAVO: "Nik jaten dut sagarra"
      variations.add(formatSentence(`${arg1} ${mainVerb} ${aux} ${arg2}`));
      // AVO (pro-drop): "Jaten dut sagarra"
      if (ALL_PRONOUNS.has(cleanWord(arg1))) {
        variations.add(formatSentence(`${mainVerb} ${aux} ${arg2}`));
      }
    }
  }

  return Array.from(variations);
}

// Test on sample unique sentences
console.log("=== TESTING VARIATION GENERATOR ON SAMPLE SENTENCES ===");
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
