const fs = require('fs');
const path = require('path');

const challenges = JSON.parse(fs.readFileSync('data/courses/1/challenges.json', 'utf8'));

console.log(`Deep checking all ${challenges.length} challenges...`);

const results = [];

function record(c, location, text, category, issue, correction) {
  results.push({
    challengeId: c.id,
    lessonId: c.lessonId,
    type: c.type,
    location,
    text,
    category,
    issue,
    correction
  });
}

// Common transitive verb stems in the course
const TRANSITIVE_ROOTS = [
  'jan', 'jaten', 'jango',
  'edan', 'edaten', 'edango',
  'ikusi', 'ikusten', 'ikusiko',
  'irakurri', 'irakurtzen', 'irakurriko',
  'idatzi', 'idazten', 'idatziko',
  'entzun', 'entzuten', 'entzungo',
  'erosi', 'erosten', 'erosiko',
  'saldu', 'saltzen', 'salduko',
  'garbitu', 'garbitzen', 'garbituko',
  'egosi', 'egosten', 'egosiko',
  'hartu', 'hartzen', 'hartuko',
  'utzi', 'uzten', 'utziko',
  'behar', 'behar izan',
  'nahi', 'nahi izan',
  'eskatu', 'eskatzen', 'eskatuko',
  'ireki', 'irekitzen', 'irekiko',
  'itxi', 'ixten', 'itxiko'
];

// Common intransitive verb stems in the course
const INTRANSITIVE_ROOTS = [
  'joan', 'joaten', 'joango',
  'etorri', 'etortzen', 'etorriko',
  'ibili', 'ibiltzen', 'ibiliko',
  'egon', 'egoten', 'egongo',
  'izan', 'izaten', 'izango',
  'iritsi', 'iristen', 'iritsiko',
  'heldu', 'heltzen', 'helduko',
  'erori', 'erortzen', 'eroriko',
  'sartu', 'sartzen', 'sartuko',
  'irten', 'irteten', 'irtengo',
  'atera', 'ateratzen', 'aterako',
  'bizi', 'bizitzen', 'biziko',
  'jaiki', 'jaikitzen', 'jaikiko',
  'esnatu', 'esnatzen', 'esnatuko',
  'gelditu', 'gelditzen', 'geldituko',
  'geratu', 'geratzen', 'geratuko',
  'baloi batekin jolasten ari', 'jolasten ari'
];

challenges.forEach(c => {
  const items = [];
  if (c.question && c.question.includes('"')) {
    const m = c.question.match(/"([^"]+)"/);
    if (m) items.push({ loc: 'question_quote', text: m[1] });
  }
  if (c.prompt && c.prompt !== 'Audio playback' && c.prompt !== 'Audio review') {
    items.push({ loc: 'prompt', text: c.prompt });
  }
  if (c.options) {
    c.options.forEach((opt, idx) => {
      items.push({ loc: `option[${idx}]`, text: opt.text, correct: opt.correct });
    });
  }
  if (c.acceptedAnswers) {
    c.acceptedAnswers.forEach((ans, idx) => {
      items.push({ loc: `acceptedAnswer[${idx}]`, text: ans });
    });
  }

  items.forEach(it => {
    const text = it.text.trim();
    if (!text) return;

    // Check: Transitive verb with intransitive auxiliary (e.g. "egostiko dago txuleta", "jan da sagarra")
    TRANSITIVE_ROOTS.forEach(v => {
      const regex = new RegExp(`\\b${v}\\s+(?:dago|da|dira|daude|naiz|zara|gara|zarete|nintzen|zen|ziren|nago|zaude|gaude|zaudete)\\b`, 'i');
      if (regex.test(text) && !text.includes('ahal') && !text.includes('behar')) {
        record(c, it.loc, text, '1. Auxiliary Valency Mismatch', `Transitive verb stem '${v}' paired with intransitive auxiliary`, 'Use transitive auxiliary (du/dute/dut/...)');
      }
    });

    // Check: Intransitive verb with transitive auxiliary (e.g. "etorri du", "joan dut", "egon du")
    INTRANSITIVE_ROOTS.forEach(v => {
      const regex = new RegExp(`\\b${v}\\s+(?:dut|duzu|du|dugu|duzue|dute|ditut|dituzu|ditu|ditugu|dituzue|dituzte|nuen|zenuen|zuen|genuen|zenuten|zuten)\\b`, 'i');
      if (regex.test(text)) {
        record(c, it.loc, text, '1. Auxiliary Valency Mismatch', `Intransitive verb stem '${v}' paired with transitive auxiliary`, 'Use intransitive auxiliary (da/dira/naiz/...)');
      }
    });

    // Check: Future participle hallucination (*egostiko)
    if (/\begostiko\b/i.test(text)) {
      record(c, it.loc, text, '2. Participle Hallucination', "Hallucinated participle 'egostiko'", "egosiko");
    }

    // Check: Misspelled words (itxaote, gatzi, arraultz)
    if (/\bitxaote\b/i.test(text)) {
      record(c, it.loc, text, '3. Lexical Error / Typo', "Misspelled lemma 'itxaote'", "itxarotea");
    }
    if (/\bgatzi\b/i.test(text)) {
      record(c, it.loc, text, '3. Lexical Error / Typo', "Misspelled lemma 'gatzi'", "gazi");
    }
    if (/\barraultz\b/i.test(text)) {
      record(c, it.loc, text, '3. Lexical Error / Typo', "Misspelled lemma 'arraultz'", "arrautza");
    }

    // Check: Vowel attachment violations (*-aek, *-aen, *-aetan, *-aari)
    if (/\b\w+aek\b/i.test(text)) {
      const m = text.match(/\b(\w+)aek\b/i);
      record(c, it.loc, text, '4. Vowel Attachment Error', `Invalid vowel concatenation '${m[0]}'`, `${m[1]}ek`);
    }
    if (/\b\w+aen\b/i.test(text)) {
      const m = text.match(/\b(\w+)aen\b/i);
      record(c, it.loc, text, '4. Vowel Attachment Error', `Invalid vowel concatenation '${m[0]}'`, `${m[1]}en`);
    }
    if (/\b\w+aetan\b/i.test(text)) {
      const m = text.match(/\b(\w+)aetan\b/i);
      record(c, it.loc, text, '4. Vowel Attachment Error', `Invalid vowel concatenation '${m[0]}'`, `${m[1]}etan`);
    }

    // Check: Absolutive pronoun with transitive verb
    if (/\b(ni|zu|gu)\s+(?:(?:\w+\s+){0,4})(dut|duzu|dugu|ditut|dituzu|ditugu|nuen|zenuen|genuen|nituen|zenituen|genituen|daukat|dauzkat|daukazu|dauzkazu|daukagu|dauzkagu|dakit|dakizu|dakigu)\b/i.test(text)) {
      const m = text.match(/\b(ni|zu|gu)\s+(?:(?:\w+\s+){0,4})(dut|duzu|dugu|ditut|dituzu|ditugu|nuen|zenuen|genuen|nituen|zenituen|genituen|daukat|dauzkat|daukazu|dauzkazu|daukagu|dauzkagu|dakit|dakizu|dakigu)\b/i);
      const subj = m[1].toLowerCase();
      const aux = m[2].toLowerCase();
      if ((subj === 'ni' && (aux.startsWith('du') || aux.startsWith('di') || aux.startsWith('nu') || aux.startsWith('ni') || aux.startsWith('dauk') || aux.startsWith('dak'))) ||
          (subj === 'zu' && (aux.endsWith('zu') || aux.endsWith('zu') || aux.endsWith('zenuen') || aux.endsWith('zenituen'))) ||
          (subj === 'gu' && (aux.endsWith('gu') || aux.endsWith('gu') || aux.endsWith('genuen') || aux.endsWith('genituen')))) {
        // Double check matching
        if (subj === 'ni' && (aux === 'dut' || aux === 'ditut' || aux === 'nuen' || aux === 'nituen' || aux === 'daukat' || aux === 'dauzkat' || aux === 'dakit')) {
          record(c, it.loc, text, '5. Ergative Dropped on Subject', `Absolutive '${subj}' used as transitive subject`, 'Nik');
        }
        if (subj === 'zu' && (aux === 'duzu' || aux === 'dituzu' || aux === 'zenuen' || aux === 'zenituen' || aux === 'daukazu' || aux === 'dauzkazu' || aux === 'dakizu')) {
          record(c, it.loc, text, '5. Ergative Dropped on Subject', `Absolutive '${subj}' used as transitive subject`, 'Zuk');
        }
        if (subj === 'gu' && (aux === 'dugu' || aux === 'ditugu' || aux === 'genuen' || aux === 'genituen' || aux === 'daukagu' || aux === 'dauzkagu' || aux === 'dakigu')) {
          record(c, it.loc, text, '5. Ergative Dropped on Subject', `Absolutive '${subj}' used as transitive subject`, 'Guk');
        }
      }
    }

    // Check: Jolastu transitive vs intransitive
    if (/\bjolasten\s+(dut|duzu|du|dugu|duzue|dute|nuen|zenuen|zuen|genuen|zenuten|zuten)\b/i.test(text)) {
      record(c, it.loc, text, '6. Jolastu Transitivity Violation', "Transitive auxiliary on 'jolastu' (should be intransitive da/dira/naiz/zara)", "jolasten da / jolasten naiz");
    }

    // Check: Dative with gustatu
    if (/\b(dortokak|katuak|oilaskoak)\s+(?:(?:\w+\s+){0,3})gustatzen\s+(zaio|zitzaion)\b/i.test(text)) {
      const m = text.match(/\b(dortokak|katuak|oilaskoak)\s+(?:(?:\w+\s+){0,3})gustatzen\s+(zaio|zitzaion)\b/i);
      record(c, it.loc, text, '7. Dative Experiencer Violation', `Experiencer '${m[1]}' in ergative/absolutive instead of dative`, `${m[1].replace(/ak$/, 'ari')}`);
    }
  });
});

console.log(`Total issues flagged: ${results.length}`);

// Unique issues by sentence
const uniqueIssues = new Map();
results.forEach(r => {
  const key = `${r.challengeId}|${r.location}|${r.issue}`;
  if (!uniqueIssues.has(key)) {
    uniqueIssues.set(key, r);
  }
});
console.log(`Unique issues: ${uniqueIssues.size}`);

// Group by category
const catMap = {};
uniqueIssues.forEach(r => {
  if (!catMap[r.category]) catMap[r.category] = [];
  catMap[r.category].push(r);
});

Object.keys(catMap).forEach(cat => {
  console.log(`\n======================================================`);
  console.log(`${cat} (${catMap[cat].length} instances)`);
  console.log(`======================================================`);
  catMap[cat].slice(0, 10).forEach(iss => {
    console.log(`- Challenge #${iss.challengeId} (Lesson ${iss.lessonId}, ${iss.type}) [${iss.location}]:`);
    console.log(`    Text:       "${iss.text}"`);
    console.log(`    Issue:      ${iss.issue}`);
    console.log(`    Correction: ${iss.correction}`);
  });
});
