const fs = require('fs');
const path = require('path');

const sentences = JSON.parse(fs.readFileSync('scratch/all_unique_basque_sentences.json', 'utf8'));
const challenges = JSON.parse(fs.readFileSync('data/courses/1/challenges.json', 'utf8'));

console.log(`Auditing ${sentences.length} unique sentences and ${challenges.length} challenges...`);

const auditFindings = [];

function addFinding(ruleId, ruleName, example, reason, correction, affectedChallenges) {
  auditFindings.push({
    ruleId,
    ruleName,
    example,
    reason,
    correction,
    affectedChallenges
  });
}

// 1. Audit each unique sentence
sentences.forEach(item => {
  const sent = item.prompt.trim();
  const eng = item.english;

  // RULE 1: Ergative Suffix (-k) Mismatches
  // 1a. Intransitive with Ergative pronoun (Nik/Zuk/Guk/Hark with naiz/zara/gara/da/nago/noa/dator/nabil/ari nintzen/ari gara...)
  if (/\bnik\s+(?:(?:\w+\s+){0,4})(naiz|gara|nago|gaude|noa|goaz|nator|gatoz|nabil|gabiltza|nintzen|ginen)\b/i.test(sent)) {
    addFinding(
      "1. Ergative Suffix (-k) Mismatches",
      "Ergative Subject with Intransitive Verb / Progressive 'ari'",
      sent,
      "Ergative pronoun 'Nik' used with intransitive auxiliary / progressive 'ari nintzen'",
      sent.replace(/\bNik\b/g, "Ni").replace(/\bnik\b/g, "ni"),
      item.lessons
    );
  }
  if (/\bguk\s+(?:(?:\w+\s+){0,4})(gara|gaude|goaz|gatoz|gabiltza|ginen)\b/i.test(sent)) {
    // Check if progressive "ari gara"
    if (sent.includes("ari gara")) {
      addFinding(
        "1. Ergative Suffix (-k) Mismatches",
        "Ergative Subject with Intransitive Progressive 'ari gara'",
        sent,
        "Ergative pronoun 'Guk' used with intransitive progressive 'ari gara' (requires absolutive 'Gu')",
        sent.replace(/\bGuk\b/g, "Gu").replace(/\bguk\b/g, "gu"),
        item.lessons
      );
    }
  }

  // 1b. Transitive with Absolutive pronoun (Ni/Zu/Gu as subject of dut/duzu/dugu/ditut/dituzu/ditugu...)
  if (/\bzu\s+(?:(?:\w+\s+){0,4})(duzu|dituzu|zenuen|zenituen|daukazu|dauzkazu|dakizu)\b/i.test(sent)) {
    addFinding(
      "1. Ergative Suffix (-k) Mismatches",
      "Absolutive Subject with Transitive Verb (Ergative Dropped)",
      sent,
      "Absolutive pronoun 'Zu' used as overt subject of transitive verb (requires ergative 'Zuk')",
      sent.replace(/\bZu\b/g, "Zuk").replace(/\bzu\b/g, "zuk"),
      item.lessons
    );
  }
  if (/\bgu\s+(?:(?:\w+\s+){0,4})(dugu|ditugu|genuen|genituen|daukagu|dauzkagu|dakigu)\b/i.test(sent)) {
    // Exclude if gu is object: e.g. "Hark gu ikusi gaitu"
    if (!sent.includes("gaitu") && !sent.includes("gaituzte")) {
      addFinding(
        "1. Ergative Suffix (-k) Mismatches",
        "Absolutive Subject with Transitive Verb (Ergative Dropped)",
        sent,
        "Absolutive pronoun 'Gu' used as overt subject of transitive verb (requires ergative 'Guk')",
        sent.replace(/\bGu\b/g, "Guk").replace(/\bgu\b/g, "guk"),
        item.lessons
      );
    }
  }

  // RULE 2: Phantom Synthetic Verbs / Mangled Participles
  if (/\begostiko\b/i.test(sent)) {
    addFinding(
      "2. Phantom Synthetic Verbs & Mangled Participles",
      "Hallucinated Future Participle *egostiko",
      sent,
      "Base verb 'egosi' forms future participle 'egosiko' (not '*egostiko')",
      sent.replace(/\begostiko\b/g, "egosiko"),
      item.lessons
    );
  }

  // RULE 3: Auxiliary Argument Number Mismatches & Transitivity Errors
  // Check "Mikelen arrebak egostiko dago txuleta"
  if (/\bdago\s+txuleta\b/i.test(sent) || (sent.includes("arrebak") && sent.includes("dago txuleta"))) {
    addFinding(
      "3. Auxiliary Argument Mismatch & Valency Error",
      "Intransitive Auxiliary 'dago' with Transitive Subject & Object",
      sent,
      "Transitive clause with ergative 'arrebak' and direct object 'txuleta' paired with copula 'dago'",
      "Mikelen arrebak txuleta egosiko du.",
      item.lessons
    );
  }

  // RULE 4: Article Doubling & Vowel Attachment Rules
  if (/\b\w+aek\b/i.test(sent)) {
    const m = sent.match(/\b(\w+)aek\b/i);
    addFinding(
      "4. Article Doubling & Vowel Attachment Rules",
      `Invalid Plural Ergative Suffix Concatenation (*-aek)`,
      sent,
      `Vowel-stem noun root '${m[1]}' incorrectly concatenated with *-aek instead of *-ek (${m[1]} + -ek -> ${m[1]}ek)`,
      sent.replace(/\barrebaek\b/gi, "arrebek"),
      item.lessons
    );
  }
  if (/\b\w+aen\b/i.test(sent)) {
    const m = sent.match(/\b(\w+)aen\b/i);
    addFinding(
      "4. Article Doubling & Vowel Attachment Rules",
      `Invalid Plural Genitive Suffix Concatenation (*-aen)`,
      sent,
      `Noun root '${m[1]}' incorrectly formed with *-aen (should be -en / -aren)`,
      sent.replace(/\bgonaen\b/gi, "gonen").replace(/\bAnitzaen\b/gi, "Anitzaren").replace(/\bplazaen\b/gi, "plazan"),
      item.lessons
    );
  }
  if (/\b\w+aetan\b/i.test(sent)) {
    const m = sent.match(/\b(\w+)aetan\b/i);
    addFinding(
      "4. Article Doubling & Vowel Attachment Rules",
      `Invalid Inessive Plural Suffix Concatenation (*-aetan)`,
      sent,
      `Noun root '${m[1]}' incorrectly formed with *-aetan instead of *-etan (mendi + -etan -> mendietan)`,
      sent.replace(/\bmendiaetan\b/gi, "mendietan"),
      item.lessons
    );
  }

  // RULE 5: Romance / English Syntactic Calques & Valency Errors
  // 5a. Jolastu with transitive du/dut instead of intransitive da/naiz
  if (/\bjolasten\s+(dut|duzu|du|dugu|duzue|dute)\b/i.test(sent)) {
    addFinding(
      "5. Romance / Syntactic Calques & Valency Errors",
      "Transitive Auxiliary on Intransitive 'jolastu'",
      sent,
      "Calque of Romance 'jugar': in standard Basque (Euskara Batua), 'jolastu' is intransitive (NOR: jolasten naiz/da/gara/dira), not transitive (NOR-NORK: *jolasten dut/du)",
      sent.replace(/\bNik\s+baloiarekin\s+jolasten\s+dut\b/i, "Ni baloiarekin jolasten naiz")
          .replace(/\bNire\s+alabak\s+bere\s+ahizparekin\s+jolasten\s+du\b/i, "Nire alaba bere ahizparekin jolasten da")
          .replace(/\bNire\s+semea\s+bere\s+arrebarekin\s+jolasten\s+du\b/i, "Nire semea bere arrebarekin jolasten da")
          .replace(/\bZuk\s+irakurri\s+duzu\s+zure\s+irakaslearekin\b/i, "Zuk zure irakaslearekin irakurri duzu"),
      item.lessons
    );
  }
  // 5b. Dative case drop on gustatu experiencer (Katuak / Dortokak / Oilaskoak gustatzen zaio)
  if (/\b(katuak|dortokak|oilaskoak)\s+(?:(?:\w+\s+){0,3})gustatzen\s+zaio\b/i.test(sent)) {
    const m = sent.match(/\b(katuak|dortokak|oilaskoak)\s+(?:(?:\w+\s+){0,3})gustatzen\s+zaio\b/i);
    const noun = m[1].toLowerCase();
    const dative = noun === 'katuak' ? 'Katuari' : (noun === 'dortokak' ? 'Dortokari' : 'Oilaskoari');
    addFinding(
      "5. Romance / Syntactic Calques & Valency Errors",
      "Ergative/Absolutive Subject on Dative Experiencer Verb 'gustatu'",
      sent,
      `In standard Basque, 'gustatu' takes a Dative experiencer (NOR-NORI: -ari/-ei), not an ergative/absolutive noun '${m[1]}'`,
      sent.replace(new RegExp(`\\b${noun}\\b`, 'gi'), dative),
      item.lessons
    );
  }
  // 5c. Bare verbal noun before gustatu (erortze gustatu, iriste gustatzen, itxaote gustatu)
  if (/\b(erortze|iriste|itxaote)\s+gustat/i.test(sent)) {
    const m = sent.match(/\b(erortze|iriste|itxaote)\s+gustat/i);
    const correctedVn = m[1] === 'itxaote' ? 'itxarotea' : `${m[1]}a`;
    addFinding(
      "5. Romance / Syntactic Calques & Valency Errors",
      "Bare Verbal Noun without Definite Article '-a' as Subject of 'gustatu'",
      sent,
      `Verbal nouns functioning as subjects of 'gustatu' require the absolutive definite article '-a' (${correctedVn})`,
      sent.replace(/\berortze\b/gi, "erortzea").replace(/\biriste\b/gi, "iristea").replace(/\bitxaote\b/gi, "itxarotea"),
      item.lessons
    );
  }

  // RULE 7: Quantifiers with Indefinite Base Stems & Word Order
  if (sent.includes("hogeita hamar zuek oilasko egostiko")) {
    addFinding(
      "7. Quantifier Stem & Word Order Calque",
      "Scrambled Word Order & Quantifier Placement",
      sent,
      "Word order calque with scrambled quantifier and subject (*'hogeita hamar zuek oilasko')",
      "Bihar zuek hogeita hamar oilasko egosiko dituzue.",
      item.lessons
    );
  }

  // Typo: Lexical errors (itxaote, gatzi, arraultz)
  if (/\b(itxaote|gatzi|arraultz)\b/i.test(sent)) {
    const m = sent.match(/\b(itxaote|gatzi|arraultz)\b/i);
    const fix = m[1].toLowerCase() === 'itxaote' ? 'itxarotea' : (m[1].toLowerCase() === 'gatzi' ? 'gazi' : 'arrautza');
    addFinding(
      "8. Lexical Orthography & Spelling Errors",
      `Corrupted Lexical Lemma '*${m[1]}'`,
      sent,
      `Hallucinated or misspelled lemma '*${m[1]}'`,
      sent.replace(new RegExp(`\\b${m[1]}\\b`, 'gi'), fix),
      item.lessons
    );
  }
});

console.log(`\n================ AUDIT SUMMARY ================`);
console.log(`Total categorized audit findings: ${auditFindings.length}`);

// Group by ruleId
const grouped = {};
auditFindings.forEach(f => {
  if (!grouped[f.ruleId]) grouped[f.ruleId] = [];
  grouped[f.ruleId].push(f);
});

Object.keys(grouped).forEach(k => {
  console.log(`\n### ${k} (${grouped[k].length} unique occurrences)`);
  grouped[k].forEach((f, i) => {
    console.log(`\n${i+1}. [${f.ruleName}]`);
    console.log(`   - Original:    "${f.example}"`);
    console.log(`   - Linguistic Reason: ${f.reason}`);
    console.log(`   - Standard Euskara Batua: "${f.correction}"`);
    console.log(`   - Lessons: ${f.affectedChallenges.join(', ')}`);
  });
});
