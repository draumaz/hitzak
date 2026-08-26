const fs = require('fs');
const path = require('path');
const {
  NOUN_FORMS,
  PRED_SG_DEF_TO_INDEF,
  PRED_SG_INDEF_TO_DEF,
  PRED_PL_DEF_TO_INDEF,
  PRED_PL_INDEF_TO_DEF
} = require('./test_linguistic_generator_v5.js');
const {
  generateNaturalEnglishVariations
} = require('./advanced_english_generator.js');

const challengesPath = path.join(__dirname, '../data/courses/1/challenges.json');
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

console.log(`Auditing and expanding accepted answers for ${challenges.length} challenges...`);

// Basque Grammatical Reference Data
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
  "mikel", "mikelek", "mikeli", "mikelen", "mikelenak",
  "miren", "mirenek", "mireni", "mirenen",
  "aitor", "aitorrek", "aitorri", "aitorren",
  "terese", "teresek", "teresi", "tereseren",
  "jon", "jonek", "joni", "jonen",
  "joseba", "josebak", "josebari", "josebaren",
  "aintza", "aintzak", "aintzari", "aintzaren",
  "karmele", "karmelek", "karmeleri", "karmeleren",
  "arotz", "arantxa", "arantxaren",
  "ainhoa", "ainhoak", "ainhoari", "ainhoaren",
  "donostia", "donostian", "donostiara", "donostiatik", "donostiakoa",
  "bilbo", "bilbon", "bilbora", "bilbotik", "bilbokoa",
  "gasteiz", "gasteizen", "gasteizera", "gasteiztik", "gasteizkoa", "gasteizekoak",
  "irun", "irunen", "irunera", "irundik", "irungoa",
  "espainia", "espainian", "espainiara", "espainiatik", "espainiakoa",
  "frantzia", "frantzian", "frantziara", "francian",
  "italia", "italian", "italiara",
  "alemania", "alemanian", "alemaniara", "alemaniakoak",
  "madrid", "madril", "madrilen", "madrilera",
  "paris", "parisen", "parisetik"
]);

const COPULAS = ["naiz", "zara", "da", "gara", "zarete", "dira", "nintzen", "zinen", "zen", "ginen", "zineten", "ziren"];

const COPULA_PRONOUNS = {
  "naiz": "ni", "nintzen": "ni",
  "zara": "zu", "zinen": "zu",
  "da": "hura", "zen": "hura",
  "gara": "gu", "ginen": "gu",
  "zarete": "zuek", "zineten": "zuek",
  "dira": "haiek", "ziren": "haiek"
};

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

function isFiniteVerb(w) {
  const cw = cleanWord(w);
  return !!(SUBJECT_PRONOUNS[cw] || ERGATIVE_PRONOUNS[cw] || COPULAS.includes(cw));
}

// Generate predicate nominal alternatives
function getPredicateNominalVariants(phrase) {
  const p = phrase.trim().toLowerCase();
  const variants = new Set([phrase.trim()]);

  // Direct table lookup
  if (PRED_SG_DEF_TO_INDEF.has(p)) {
    variants.add(PRED_SG_DEF_TO_INDEF.get(p));
  }
  if (PRED_SG_INDEF_TO_DEF.has(p)) {
    variants.add(PRED_SG_INDEF_TO_DEF.get(p));
  }
  if (PRED_PL_DEF_TO_INDEF.has(p)) {
    variants.add(PRED_PL_DEF_TO_INDEF.get(p));
  }
  if (PRED_PL_INDEF_TO_DEF.has(p)) {
    variants.add(PRED_PL_INDEF_TO_DEF.get(p));
  }

  // Multi-word phrase ending in "bat"
  const batMatch = p.match(/^(.+)\s+bat$/);
  if (batMatch) {
    const head = batMatch[1].trim();
    const words = head.split(/\s+/);
    const lastWord = words[words.length - 1];
    const beforeLast = words.slice(0, -1).join(" ");
    
    let defLast = "";
    if (PRED_SG_INDEF_TO_DEF.has(lastWord + " bat")) {
      defLast = PRED_SG_INDEF_TO_DEF.get(lastWord + " bat");
    } else if (lastWord.endsWith("a")) {
      defLast = lastWord;
    } else if (lastWord.endsWith("r") && !lastWord.endsWith("rr")) {
      defLast = lastWord + "ra";
    } else {
      defLast = lastWord + "a";
    }
    const defFull = beforeLast ? `${beforeLast} ${defLast}` : defLast;
    variants.add(defFull);
  }

  // Multi-word phrase ending in "batzuk"
  const batzukMatch = p.match(/^(.+)\s+batzuk$/);
  if (batzukMatch) {
    const head = batzukMatch[1].trim();
    const words = head.split(/\s+/);
    const lastWord = words[words.length - 1];
    const beforeLast = words.slice(0, -1).join(" ");
    
    let plDefLast = "";
    if (PRED_PL_INDEF_TO_DEF.has(lastWord + " batzuk")) {
      plDefLast = PRED_PL_INDEF_TO_DEF.get(lastWord + " batzuk");
    } else if (lastWord.endsWith("a")) {
      plDefLast = lastWord + "k";
    } else if (lastWord.endsWith("r") && !lastWord.endsWith("rr")) {
      plDefLast = lastWord + "rak";
    } else {
      plDefLast = lastWord + "ak";
    }
    const plDefFull = beforeLast ? `${beforeLast} ${plDefLast}` : plDefLast;
    variants.add(plDefFull);
  }

  // Multi-word phrase with definite noun/adjective
  if (!batMatch && !batzukMatch) {
    const words = p.split(/\s+/);
    if (words.length >= 2) {
      const lastWord = words[words.length - 1];
      const beforeLast = words.slice(0, -1).join(" ");
      if (PRED_SG_DEF_TO_INDEF.has(lastWord)) {
        const indefLast = PRED_SG_DEF_TO_INDEF.get(lastWord);
        variants.add(`${beforeLast} ${indefLast}`);
      }
      if (PRED_PL_DEF_TO_INDEF.has(lastWord)) {
        const indefPlLast = PRED_PL_DEF_TO_INDEF.get(lastWord);
        variants.add(`${beforeLast} ${indefPlLast}`);
      }
    }
  }

  return Array.from(variants);
}

// Generate Basque Variations
function generateBasqueVariations(originalTarget, prompt = "") {
  const variations = new Set();
  if (!originalTarget || !originalTarget.trim()) return [];

  const baseClean = originalTarget.trim();
  variations.add(baseClean);

  let isIntro = false;
  let introWord = "";
  let restText = "";

  const introMatch = baseClean.match(/^(Kaixo|Epa|Egun on|Arratsalde on|Gabon|Barkatu|Bai|Ez|Mesedez|Ongi etorri|Eskerrik asko)(?:,|\.|\s)\s*(.+)$/i);
  if (introMatch) {
    const candidateIntro = introMatch[1];
    const candidateRest = introMatch[2].trim();
    const firstRestWord = cleanWord(candidateRest.split(/\s+/)[0]);

    if (candidateIntro.toLowerCase() === "ez") {
      if (!isFiniteVerb(firstRestWord) || prompt.toLowerCase().startsWith("no,")) {
        isIntro = true;
        introWord = candidateIntro;
        restText = candidateRest;
      }
    } else {
      isIntro = true;
      introWord = candidateIntro;
      restText = candidateRest;
    }
  }

  if (isIntro) {
    const restVars = generateClauseVariations(restText, prompt);
    for (const rv of restVars) {
      variations.add(`${introWord} ${rv}`);
      variations.add(`${introWord}, ${rv}`);
    }
  } else {
    const directVars = generateClauseVariations(baseClean, prompt);
    for (const dv of directVars) {
      variations.add(dv);
    }
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
      variations.add(combo.map(c => formatSentence(c)).join(". "));
    }
    return Array.from(variations);
  }

  const conjMatch = clause.match(/^(.+?)\s+(baina|baizik|eta|edo)\s+(.+)$/i);
  if (conjMatch) {
    const part1 = conjMatch[1].trim();
    const conj = conjMatch[2].trim();
    const part2 = conjMatch[3].trim();

    const p1Vars = generateSingleClauseVariations(part1, prompt);
    const p2Vars = generateSingleClauseVariations(part2, prompt);

    for (const v1 of p1Vars) {
      for (const v2 of p2Vars) {
        variations.add(`${v1} ${conj} ${v2}`);
        variations.add(`${v1}, ${conj} ${v2}`);
      }
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
  if (/[.!?]\s+/.test(clause)) {
    return clause.split(/[.!?]\s+/).map(s => s.trim()).filter(Boolean);
  }

  const words = clause.trim().split(/\s+/);
  const sentenceStarts = [0];
  let lastStart = 0;

  for (let i = 1; i < words.length; i++) {
    const w = words[i];
    const clean = cleanWord(w);
    if (/^[A-Z]/.test(w) && (ALL_PRONOUNS.has(clean) || PROPER_NOUNS.has(clean))) {
      const prevSegment = words.slice(lastStart, i);
      if (prevSegment.some(isFiniteVerb)) {
        sentenceStarts.push(i);
        lastStart = i;
      }
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
      const verbIdx = sWords.findIndex(w => isFiniteVerb(w));
      if (verbIdx > 0 && !sWords.map(cleanWord).includes("al")) {
        const withAl = [...sWords.slice(0, verbIdx), "al", ...sWords.slice(verbIdx)].join(" ");
        variations.add(withAl);
      }
    });
  } else {
    const isPolarQuestion = prompt.includes("?") && !cleanWords.some(w => ["zer", "zein", "nor", "nork", "non", "nora", "nondik", "nola", "zenbat", "zergatik"].includes(w));
    if (isPolarQuestion) {
      const verbIdx = words.findIndex(w => isFiniteVerb(w));
      if (verbIdx > 0) {
        const withAl = [...words.slice(0, verbIdx), "al", ...words.slice(verbIdx)].join(" ");
        variations.add(withAl);
      }
    }
  }

  // 2. Comprehensive Copular Sentence & Predicate Nominal Handler
  const copulaIdx = cleanWords.findIndex(w => COPULAS.includes(w));
  if (copulaIdx !== -1) {
    const copula = cleanWords[copulaIdx];
    const impliedPronoun = COPULA_PRONOUNS[copula];
    const isNegative = cleanWords.includes("ez");

    if (!isNegative) {
      const ereIdx = cleanWords.indexOf("ere");

      if (copulaIdx === cleanWords.length - 1 && cleanWords.length >= 2) {
        const beforeCopula = words.slice(0, copulaIdx);

        if (ereIdx !== -1 && ereIdx < copulaIdx) {
          const subjWords = beforeCopula.slice(0, ereIdx);
          const predWords = beforeCopula.slice(ereIdx + 1);
          const subjStr = subjWords.join(" ");
          const predStr = predWords.join(" ");

          if (subjStr && predStr) {
            const predVariants = getPredicateNominalVariants(predStr);
            predVariants.forEach(pv => {
              const baCopula = "ba" + copula;
              variations.add(`${subjStr} ere ${pv} ${copula}`);
              variations.add(`${subjStr} ${pv} ere ${baCopula}`);
              variations.add(`${pv} ere ${baCopula} ${subjStr.toLowerCase()}`);
              variations.add(`${pv} ere ${copula} ${subjStr.toLowerCase()}`);
              if (ALL_PRONOUNS.has(cleanWord(subjStr))) {
                variations.add(`${pv} ere ${baCopula}`);
                variations.add(`${pv} ere ${copula}`);
                variations.add(`${pv} ${copula} ere`);
              }
            });
          }
        } else {
          let candidateSubj = "";
          let candidatePredWords = [];

          const firstWordClean = cleanWord(beforeCopula[0]);
          if (ALL_PRONOUNS.has(firstWordClean)) {
            candidateSubj = beforeCopula[0];
            candidatePredWords = beforeCopula.slice(1);
          } else if (PROPER_NOUNS.has(firstWordClean) && beforeCopula.length > 1) {
            if (beforeCopula.length >= 3 && cleanWord(beforeCopula[1]) === "eta" && PROPER_NOUNS.has(cleanWord(beforeCopula[2]))) {
              candidateSubj = beforeCopula.slice(0, 3).join(" ");
              candidatePredWords = beforeCopula.slice(3);
            } else {
              candidateSubj = beforeCopula[0];
              candidatePredWords = beforeCopula.slice(1);
            }
          } else if (beforeCopula.length === 1) {
            candidateSubj = "";
            candidatePredWords = beforeCopula;
          } else if (beforeCopula.length >= 2) {
            if (firstWordClean === "gure" || firstWordClean === "zure" || firstWordClean === "nire" || firstWordClean === "haien") {
              candidateSubj = beforeCopula.slice(0, 2).join(" ");
              candidatePredWords = beforeCopula.slice(2);
            } else {
              candidateSubj = beforeCopula[0];
              candidatePredWords = beforeCopula.slice(1);
            }
          }

          const predStr = candidatePredWords.filter(w => cleanWord(w) !== "al").join(" ");

          if (predStr) {
            const predVariants = getPredicateNominalVariants(predStr);
            predVariants.forEach(pv => {
              if (candidateSubj) {
                const isPronoun = ALL_PRONOUNS.has(cleanWord(candidateSubj));
                variations.add(`${candidateSubj} ${pv} ${copula}`);
                variations.add(`${pv} ${copula} ${candidateSubj.toLowerCase()}`);
                variations.add(`${candidateSubj} ${copula} ${pv}`);

                if (isPronoun) {
                  variations.add(`${pv} ${copula}`);
                }
              } else {
                variations.add(`${pv} ${copula}`);
                if (impliedPronoun) {
                  variations.add(`${impliedPronoun} ${pv} ${copula}`);
                  variations.add(`${pv} ${copula} ${impliedPronoun}`);
                  variations.add(`${impliedPronoun} ${copula} ${pv}`);
                }
              }
            });
          }
        }
      }
    } else {
      const ezIdx = cleanWords.indexOf("ez");
      if (ezIdx !== -1 && ezIdx + 1 < cleanWords.length && COPULAS.includes(cleanWords[ezIdx + 1])) {
        const aux = words[ezIdx + 1];
        const subjBefore = words.slice(0, ezIdx).join(" ");
        const predAfter = words.slice(ezIdx + 2).join(" ");

        if (predAfter) {
          const predVariants = getPredicateNominalVariants(predAfter);
          predVariants.forEach(pv => {
            if (subjBefore) {
              const isPronoun = ALL_PRONOUNS.has(cleanWord(subjBefore));
              variations.add(`${subjBefore} ez ${aux} ${pv}`);
              variations.add(`ez ${aux} ${pv} ${subjBefore.toLowerCase()}`);
              variations.add(`${subjBefore} ${pv} ez ${aux}`);
              if (isPronoun) {
                variations.add(`ez ${aux} ${pv}`);
              }
            } else {
              variations.add(`ez ${aux} ${pv}`);
              if (impliedPronoun) {
                variations.add(`${impliedPronoun} ez ${aux} ${pv}`);
                variations.add(`ez ${aux} ${pv} ${impliedPronoun}`);
              }
            }
          });
        }
      }
    }
  }

  // 3. Pro-Drop for Non-Copular Clauses
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
  } else if (copulaIdx === -1) {
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

  // 4. Periphrastic vs Synthetic Verbs (eduki <-> ukan, jakin)
  for (const [eduki, ukan] of Object.entries(EDUKI_TO_UKAN)) {
    const idx = cleanWords.indexOf(eduki);
    if (idx !== -1) {
      const withUkan = [...words.slice(0, idx), ukan, ...words.slice(idx + 1)].join(" ");
      variations.add(withUkan);
      const sub = generateSingleClauseVariations(withUkan, prompt);
      sub.forEach(s => variations.add(s));
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

  return Array.from(variations);
}

// Challenges where option token 'one' should be upgraded to 'a' / 'an' for natural UI word-bank display
const UPGRADE_ONE_TO_A_CHALLENGE_IDS = new Set([
  56, 73, 89, 693, 696, 699, 703, 710, 727, 731, 736, 1501, 1507, 1599, 7343, 7376
]);

let expandedChallengesCount = 0;
let totalOldAnswers = 0;
let totalNewAnswers = 0;

const processedChallenges = challenges.map(c => {
  const updated = { ...c };
  const existingAnswers = Array.isArray(c.acceptedAnswers) ? [...c.acceptedAnswers] : [];
  totalOldAnswers += existingAnswers.length;

  let newAnswers = new Set(existingAnswers);

  let canonicalTarget = "";

  if (c.type === 'TRANSLATE') {
    // Check if options have hyper-literal "one" token that should be "a" / "an"
    if (UPGRADE_ONE_TO_A_CHALLENGE_IDS.has(c.id) && Array.isArray(c.options)) {
      updated.options = c.options.map(opt => {
        if (opt.text.toLowerCase() === 'one') {
          // If followed by vowel word like "owl", use "an", else "a"
          const nextOpt = c.options.find(o => o.correct && o.order === opt.order + 1);
          const isVowelNext = nextOpt && /^[aeiou]/i.test(nextOpt.text);
          return { ...opt, text: isVowelNext ? 'an' : 'a' };
        }
        return opt;
      });
    }

    const correctOptions = (updated.options || [])
      .filter(o => o.correct)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetText = correctOptions.map(o => o.text).join(' ').trim();
    canonicalTarget = targetText;

    if (targetText) {
      newAnswers.add(targetText);
    }

    const isBasque = c.question.toLowerCase().includes('basque');
    if (isBasque) {
      const generated = generateBasqueVariations(targetText, c.prompt || '');
      generated.forEach(a => newAnswers.add(a));
    } else {
      const generated = generateNaturalEnglishVariations(targetText, c.prompt || '');
      generated.forEach(a => newAnswers.add(a));
      
      // Also generate variations on previous acceptedAnswers
      existingAnswers.forEach(ea => {
        const fromExisting = generateNaturalEnglishVariations(ea, c.prompt || '');
        fromExisting.forEach(a => newAnswers.add(a));
      });
    }
  } else if (c.type === 'SELECT' || c.type === 'LISTEN') {
    if (Array.isArray(c.options)) {
      updated.options = c.options.map(opt => {
        if (opt.text && /\bone\s+(boy|girl|teacher|student|cat|dog|fat cat|thin dog|woman|man|owl|bottle of water)\b/i.test(opt.text)) {
          let updatedText = opt.text;
          updatedText = updatedText.replace(/\bone\s+(boy|girl|teacher|student|cat|dog|fat cat|thin dog|woman|man|bottle of water)\b/gi, (m, noun) => {
            const startsWithVowel = /^[aeiou]/i.test(noun);
            const art = startsWithVowel ? (m[0] === 'O' ? 'An' : 'an') : (m[0] === 'O' ? 'A' : 'a');
            return `${art} ${noun}`;
          });
          return { ...opt, text: updatedText };
        }
        return opt;
      });
    }

    const correctOpt = (updated.options || []).find(o => o.correct);
    if (correctOpt && correctOpt.text) {
      canonicalTarget = correctOpt.text.trim();
      newAnswers.add(correctOpt.text.trim());
      if (!c.question.toLowerCase().includes('basque')) {
        const enVars = generateNaturalEnglishVariations(correctOpt.text.trim(), c.prompt || '');
        enVars.forEach(a => newAnswers.add(a));
      }
    } else if (c.audioText) {
      canonicalTarget = c.audioText.trim();
      newAnswers.add(c.audioText.trim());
    }
  } else if (c.type === 'MATCH') {
    const correctOpts = (c.options || []).filter(o => o.correct);
    correctOpts.forEach(o => {
      if (o.text) newAnswers.add(o.text.trim());
    });
  }

  // Put canonical targetText first, then other new/existing answers
  const finalAnswersList = [];
  if (canonicalTarget && canonicalTarget.trim()) {
    finalAnswersList.push(canonicalTarget.trim());
  }

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

// Inspect specific sample challenges
const sampleIds = [56, 73, 89, 93, 103, 129, 693, 699, 1501, 1506, 1599, 1713, 7343];
console.log(`\n=== SAMPLE EXPANDED CHALLENGES ===`);
sampleIds.forEach(id => {
  const c = processedChallenges.find(x => x.id === id);
  if (c) {
    console.log(`\nChallenge #${c.id} [${c.type}]: "${c.prompt}"`);
    console.log(`Target: "${c.options.filter(o=>o.correct).sort((a,b)=>(a.order||0)-(b.order||0)).map(o=>o.text).join(' ')}"`);
    console.log(`Accepted answers (${c.acceptedAnswers.length}):`);
    c.acceptedAnswers.slice(0, 10).forEach(ans => console.log(`  - "${ans}"`));
    if (c.acceptedAnswers.length > 10) {
      console.log(`  ... and ${c.acceptedAnswers.length - 10} more`);
    }
  }
});

// Save to data/courses/1/challenges.json
fs.writeFileSync(challengesPath, JSON.stringify(processedChallenges, null, 2) + '\n', 'utf8');
console.log(`\nSuccessfully written updated challenges to ${challengesPath}!`);
