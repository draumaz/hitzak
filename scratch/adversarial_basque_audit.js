const fs = require('fs');
const path = require('path');

const challengesPath = path.join(__dirname, '../data/courses/1/challenges.json');
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

console.log(`Auditing ${challenges.length} challenges for ungrammatical, hallucinated, or non-standard Basque...`);

const issues = [];

function flagIssue(c, field, text, rule, reason, suggestion) {
  issues.push({
    challengeId: c.id,
    lessonId: c.lessonId,
    type: c.type,
    field: field,
    text: text,
    rule: rule,
    reason: reason,
    suggestion: suggestion
  });
}

// Known valid synthetic verb forms (Present, Past, Potential/Subjunctive)
const VALID_SYNTHETIC_STEMS = new Set([
  // izan
  'naiz', 'zara', 'da', 'gara', 'zarete', 'dira',
  'nintzen', 'zinen', 'zen', 'ginen', 'zineten', 'ziren',
  'nintzateke', 'zintzateke', 'litzateke', 'ginzateke', 'zinatekete', 'lirateke',
  // ukan
  'dut', 'duzu', 'du', 'dugu', 'duzue', 'dute',
  'ditut', 'dituzu', 'ditu', 'ditugu', 'dituzue', 'dituzte',
  'nuen', 'zenuen', 'zuen', 'genuen', 'zenuten', 'zuten',
  'nituen', 'zenituen', 'zituen', 'genituen', 'zenituzten', 'zituzten',
  // egon
  'nago', 'zaude', 'dago', 'gaude', 'zaudete', 'daude',
  'nengoen', 'zeunden', 'zegoen', 'geunden', 'zeundeten', 'zeuden',
  // joan
  'noa', 'zoaz', 'doa', 'goaz', 'zoazte', 'doaz',
  'nindoan', 'zindoazen', 'zihoan', 'gindoazen', 'zindoazten', 'zihoazen',
  // etorri
  'nator', 'zator', 'dator', 'gatoz', 'zatozte', 'datoz',
  'nentorren', 'zentorren', 'zetorren', 'gentozen', 'zentozten', 'zetozten',
  // ibili
  'nabil', 'zabiltza', 'dabil', 'gabiltza', 'zabiltzate', 'dabiltza',
  'nenbilen', 'zenbiltzan', 'zebilen', 'genbiltzan', 'zenbiltzaten', 'zebiltzan',
  // eduki
  'daukat', 'daukazu', 'dauka', 'daukagu', 'daukazue', 'daukate',
  'dauzkat', 'dauzkazu', 'dauzka', 'dauzkagu', 'dauzkazue', 'dauzkate',
  'neukan', 'zeneukan', 'zeukan', 'geneukan', 'zeneukaten', 'zeukaten',
  'neuzkan', 'zeneuzkan', 'zeuzkan', 'geneuzkan', 'zeneuzkaten', 'zeuzkaten',
  // jakin
  'dakit', 'dakizu', 'daki', 'dakigu', 'dakizue', 'dakite',
  'nekien', 'zenekien', 'zekien', 'genekien', 'zenekiten', 'zekiten',
  // esan (nor-nori-nork / nor-nork)
  'diot', 'diozu', 'dio', 'diogu', 'diozue', 'diote',
  'nion', 'zenion', 'zion', 'genion', 'zenioten', 'zioten',
  'diodat', 'diodazu',
  // eraman
  'daramat', 'daramazu', 'darama', 'daramagu', 'daramazue', 'daramate',
  'daramatzat', 'daramatzazu', 'daramatza', 'daramatzagu', 'daramatzazue', 'daramatzate',
  'neraman', 'zeneraman', 'zeraman', 'generaman', 'zeneramaten', 'zeramaten',
  'neramatzan', 'zeneramatzan', 'zeramatzan', 'generamatzan', 'zeneramatzaten', 'zeramatzaten',
  // ekarri
  'dakart', 'dakarzu', 'dakar', 'dakargu', 'dakarzue', 'dakarte',
  'dakarzkit', 'dakarzkizu', 'dakarzki', 'dakarzkigu', 'dakarzkizue', 'dakarzkite',
  'nekarren', 'zenekarren', 'zekarren', 'genekarren', 'zenekarten', 'zekarten',
  'nekarzkien', 'zenekarzkien', 'zekarzkien',
  // iruditu
  'dirudi', 'dirudite', 'zirudien', 'ziruditen'
]);

// Negative auxiliary set
const AUX_VERBS = new Set([
  'dut', 'duzu', 'du', 'dugu', 'duzue', 'dute',
  'ditut', 'dituzu', 'ditu', 'ditugu', 'dituzue', 'dituzte',
  'nuen', 'zenuen', 'zuen', 'genuen', 'zenuten', 'zuten',
  'nituen', 'zenituen', 'zituen', 'genituen', 'zenituzten', 'zituzten',
  'naiz', 'zara', 'da', 'gara', 'zarete', 'dira',
  'nintzen', 'zinen', 'zen', 'ginen', 'zineten', 'ziren',
  'zait', 'zaizu', 'zaio', 'zaigu', 'zaizue', 'zaie',
  'zaizkit', 'zaizkizu', 'zaizkio', 'zaizkigu', 'zaizkizue', 'zaizkie',
  'zitzaidan', 'zitzaizun', 'zitzaion', 'zitzaigun', 'zitzaizuen', 'zitzaien',
  'zitzaizkidan', 'zitzaizkizun', 'zitzaizkion', 'zitzaizkigun', 'zitzaizkizuen', 'zitzaizkien',
  'dit', 'dizu', 'dio', 'digu', 'dizue', 'die',
  'didazu', 'didate', 'didazu',
  'dizkio', 'dizkie',
  'nago', 'zaude', 'dago', 'gaude', 'zaudete', 'daude',
  'noa', 'zoaz', 'doa', 'goaz', 'zoazte', 'doaz',
  'nator', 'zator', 'dator', 'gatoz', 'zatozte', 'datoz',
  'nabil', 'zabiltza', 'dabil', 'gabiltza', 'zabiltzate', 'dabiltza',
  'daukat', 'daukazu', 'dauka', 'daukagu', 'daukazue', 'daukate',
  'dauzkat', 'dauzkazu', 'dauzka', 'dauzkagu', 'dauzkazue', 'dauzkate',
  'dakit', 'dakizu', 'daki', 'dakigu', 'dakizue', 'dakite'
]);

// Iterate all challenges
challenges.forEach(c => {
  const textsToCheck = [];

  if (c.question && c.question.includes('"')) {
    const m = c.question.match(/"([^"]+)"/);
    if (m) textsToCheck.push({ field: "question_quote", text: m[1] });
  }
  if (c.prompt && c.prompt !== "Audio playback") {
    textsToCheck.push({ field: "prompt", text: c.prompt });
  }
  if (c.options) {
    c.options.forEach((opt, idx) => {
      textsToCheck.push({ field: `option[${idx}]`, text: opt.text, isOption: true, correct: opt.correct });
    });
  }
  if (c.acceptedAnswers) {
    c.acceptedAnswers.forEach((ans, idx) => {
      textsToCheck.push({ field: `acceptedAnswer[${idx}]`, text: ans, isAcceptedAnswer: true });
    });
  }

  textsToCheck.forEach(item => {
    const text = item.text.trim();
    if (!text) return;

    // Filter out pure English strings (for English accepted answers or prompts)
    // Quick heuristic: If question is "Translate this sentence to Basque:" prompt is English, acceptedAnswers are Basque.
    // If question is "Translate this sentence:", prompt is Basque, acceptedAnswers are English.
    // Let us verify if text contains Basque markers or if field indicates Basque.
    const isTranslateToBasque = c.question && c.question.includes("to Basque");
    const isTranslateToEnglish = c.question && (c.question === "Translate this sentence:" || c.question.includes("to English"));
    
    let isBasqueText = false;
    if (c.type === "LISTEN") {
      isBasqueText = true;
    } else if (c.type === "MATCH") {
      // In MATCH, half are Basque, half English
      // If contains typical Basque endings/words, check it
      isBasqueText = true;
    } else if (c.type === "SELECT") {
      if (item.field === "question_quote") isBasqueText = true;
      // If question quote is Basque, options are English. If question quote is English, options are Basque.
      if (item.isOption) {
        // Check if option is Basque or English
      }
    } else if (c.type === "TRANSLATE") {
      if (isTranslateToBasque) {
        if (item.field === "prompt") isBasqueText = false;
        if (item.isAcceptedAnswer) isBasqueText = true;
      } else {
        if (item.field === "prompt") isBasqueText = true;
        if (item.isAcceptedAnswer) isBasqueText = false;
      }
    }

    // 1. Lexical Typos & Hallucinations
    if (/\bitxaote\b/i.test(text)) {
      flagIssue(c, item.field, text, "1. Lexical Error", "Spelling error 'itxaote'", "itxarotea");
    }
    if (/\bgatzi\b/i.test(text)) {
      flagIssue(c, item.field, text, "1. Lexical Error", "Spelling error 'gatzi'", "gazi");
    }
    if (/\barraultz\b/i.test(text)) {
      flagIssue(c, item.field, text, "1. Lexical Error", "Spelling error 'arraultz'", "arrautza");
    }

    // 2. Vowel Attachment & Article Doubling (*aa, *aek, *aetan, *aen)
    if (/\b\w+aa\w*\b/i.test(text) && !/\b(ba|ha)\b/i.test(text)) {
      flagIssue(c, item.field, text, "2. Article Doubling / Vowel Error", "Contains double-a (*aa)", "Fix stem assimilation");
    }
    if (/\b([a-z]+)aek\b/i.test(text)) {
      const match = text.match(/\b([a-z]+)aek\b/i);
      flagIssue(c, item.field, text, "2. Article Doubling / Vowel Error", `Invalid -aek in '${match[0]}'`, `${match[1]}ek`);
    }
    if (/\b([a-z]+)aetan\b/i.test(text)) {
      const match = text.match(/\b([a-z]+)aetan\b/i);
      flagIssue(c, item.field, text, "2. Article Doubling / Vowel Error", `Invalid -aetan in '${match[0]}'`, `${match[1]}etan`);
    }
    if (/\b([a-z]+)aen\b/i.test(text)) {
      const match = text.match(/\b([a-z]+)aen\b/i);
      flagIssue(c, item.field, text, "2. Article Doubling / Vowel Error", `Invalid -aen in '${match[0]}'`, `${match[1]}en`);
    }

    // 3. Ergative Pronoun with Intransitive Verb
    // E.g. "Nik ... naiz/gara/da/dago/noa/dator/nabil"
    if (/\bnik\s+(?:(?:\w+\s+){0,4})(naiz|gara|nago|gaude|noa|goaz|nator|gatoz|nabil|gabiltza|nintzen|ginen)\b/i.test(text)) {
      flagIssue(c, item.field, text, "3. Ergative Mismatch", "Ergative pronoun 'Nik' used with intransitive verb", "Ni");
    }
    if (/\bzuk\s+(?:(?:\w+\s+){0,4})(zara|zarete|zaude|zaudete|zoaz|zoazte|zator|zatozte|zabiltza|zabiltzate|zinen|zineten)\b/i.test(text)) {
      flagIssue(c, item.field, text, "3. Ergative Mismatch", "Ergative pronoun 'Zuk' used with intransitive verb", "Zu");
    }
    if (/\bhark\s+(?:(?:\w+\s+){0,4})(da|dira|dago|daude|doa|doaz|dator|datoz|dabil|dabiltza|zen|ziren)\b/i.test(text)) {
      flagIssue(c, item.field, text, "3. Ergative Mismatch", "Ergative pronoun 'Hark' used with intransitive verb", "Hura");
    }
    if (/\bguk\s+(?:(?:\w+\s+){0,4})(gara|gaude|goaz|gatoz|gabiltza|ginen)\b/i.test(text)) {
      flagIssue(c, item.field, text, "3. Ergative Mismatch", "Ergative pronoun 'Guk' used with intransitive verb", "Gu");
    }

    // 4. Absolutive Pronoun with Transitive Verb (Subject position)
    if (/\bni\s+(?:(?:\w+\s+){0,4})(dut|ditut|nuen|nituen|daukat|dauzkat|dakit)\b/i.test(text)) {
      flagIssue(c, item.field, text, "4. Ergative Drop / Mismatch", "Absolutive 'Ni' used as subject of transitive verb", "Nik");
    }
    if (/\bzu\s+(?:(?:\w+\s+){0,4})(duzu|dituzu|zenuen|zenituen|daukazu|dauzkazu|dakizu)\b/i.test(text)) {
      flagIssue(c, item.field, text, "4. Ergative Drop / Mismatch", "Absolutive 'Zu' used as subject of transitive verb", "Zuk");
    }
    if (/\bgu\s+(?:(?:\w+\s+){0,4})(dugu|ditugu|genuen|genituen|daukagu|dauzkagu|dakigu)\b/i.test(text)) {
      flagIssue(c, item.field, text, "4. Ergative Drop / Mismatch", "Absolutive 'Gu' used as subject of transitive verb", "Guk");
    }

    // 5. Negative Movement Violations
    // Check if main verb precedes 'ez' + aux: e.g. "jaten ez dut", "ikusi ez du"
    if (/\b(\w+(?:ten|tzen|tu|i|du|n))\s+ez\s+(dut|duzu|du|dugu|duzue|dute|ditut|dituzu|ditu|ditugu|dituzue|dituzte|naiz|zara|da|gara|zarete|dira|nuen|zuen|zen)\b/i.test(text)) {
      const match = text.match(/\b(\w+(?:ten|tzen|tu|i|du|n))\s+ez\s+(dut|duzu|du|dugu|duzue|dute|ditut|dituzu|ditu|ditugu|dituzue|dituzte|naiz|zara|da|gara|zarete|dira|nuen|zuen|zen)\b/i);
      if (match && !['izan', 'ez'].includes(match[1].toLowerCase())) {
        flagIssue(c, item.field, text, "5. Negative Movement Violation", `Main verb '${match[1]}' precedes 'ez ${match[2]}'`, `Ez ${match[2]} ... ${match[1]}`);
      }
    }
    // Check if 'ez' is separated from aux by an object/adverb: e.g. "Ez sagarra jaten dut", "Ez hemen dago" (should be "Ez dago hemen")
    if (/\bez\s+([a-z]+)\s+([a-z]+)\s+(dut|duzu|du|dugu|duzue|dute|naiz|zara|da|gara|zarete|dira)\b/i.test(text)) {
      const match = text.match(/\bez\s+([a-z]+)\s+([a-z]+)\s+(dut|duzu|du|dugu|duzue|dute|naiz|zara|da|gara|zarete|dira)\b/i);
      if (match && !AUX_VERBS.has(match[1])) {
        flagIssue(c, item.field, text, "5. Negative Movement Violation", `'ez' separated from auxiliary '${match[3]}' by '${match[1]} ${match[2]}'`, `Ez ${match[3]} ${match[1]} ${match[2]}`);
      }
    }

    // 6. Quantifiers with Indefinite Base Stem
    if (/\b(bi|hiru|lau|bost|sei|zazpi|zortzi|bederatzi|hamar|hamaika|hamabi|hamahiru|hamalau|hamabost|hamasei|hamazazpi|hemezortzi|hemeretzi|hogei|zenbat)\s+([a-z]+(?:ak|ek))\b/i.test(text)) {
      const match = text.match(/\b(bi|hiru|lau|bost|sei|zazpi|zortzi|bederatzi|hamar|hamaika|hamabi|hamahiru|hamalau|hamabost|hamasei|hamazazpi|hemezortzi|hemeretzi|hogei|zenbat)\s+([a-z]+(?:ak|ek))\b/i);
      const days = ["astearteak", "asteazkenak", "ostegunak", "ostiralak", "larunbatak", "igandeak"];
      if (match && !days.includes(match[2].toLowerCase()) && match[2].toLowerCase() !== "urteak") {
        flagIssue(c, item.field, text, "6. Quantifier Stem Violation", `Quantifier '${match[1]}' followed by definite plural '${match[2]}'`, `Use indefinite root: ${match[1]} ${match[2].replace(/ak$|ek$/, '')}`);
      }
    }

    // 7. Dative Experiencer with gustatu
    if (/\b([a-z]+ak)\s+(?:(?:\w+\s+){0,3})gustatzen\s+(zaio|zait|zaizu|zaigu|zaizue|zaie|zitzaion|zitzaidan|zitzaigun|zitzaien)\b/i.test(text)) {
      const match = text.match(/\b([a-z]+ak)\s+(?:(?:\w+\s+){0,3})gustatzen\s+(zaio|zait|zaizu|zaigu|zaizue|zaie|zitzaion|zitzaidan|zitzaigun|zitzaien)\b/i);
      // e.g. "Katuak hemen esertzea gustatzen zaio" -> Katuari
      // But if the word is the theme: "Sagarrrak gustatzen zaizkit" (theme Sagarrrak)
      if (match && (match[2] === "zaio" || match[2] === "zitzaion") && !match[1].endsWith("tsua")) {
        flagIssue(c, item.field, text, "7. Dative Case Violation", `Experiencer '${match[1]}' appears in absolutive/ergative before gustatzen ${match[2]}`, `Use dative case (e.g. ${match[1].replace(/ak$/, 'ari')})`);
      }
    }

    // 8. Bare infinitive before gustatu (e.g. "erortze gustatu", "iriste gustatzen", "itxaote gustatu")
    if (/\b([a-z]+(?:tze|te))\s+gustat/i.test(text)) {
      const match = text.match(/\b([a-z]+(?:tze|te))\s+gustat/i);
      flagIssue(c, item.field, text, "8. Verbal Noun Article Missing", `Bare verbal noun '${match[1]}' without -a suffix before gustatu`, `${match[1]}a`);
    }

    // 9. Jolasten du vs Jolasten da (Jolastu argument structure in Batua)
    if (/\bjolasten\s+(dut|duzu|du|dugu|duzue|dute|nuen|zenuen|zuen|genuen|zenuten|zuten)\b/i.test(text)) {
      flagIssue(c, item.field, text, "9. Verb Transitivity / Valency Error", "'jolastu' with transitive auxiliary (du/dute) instead of intransitive (da/dira)", "jolasten da / jolasten dira");
    }

    // 10. Preposed Descriptive Adjectives
    if (/\b(handi|txiki|on|txar|eder|polit|berri|zahar|gorri|urdin|zuri|beltz|bero|hotz|gazi|gozo)\s+([a-z]+(?:a|ak|ari|en|ean|era|etik|ekin|entzat))\b/i.test(text)) {
      const match = text.match(/\b(handi|txiki|on|txar|eder|polit|berri|zahar|gorri|urdin|zuri|beltz|bero|hotz|gazi|gozo)\s+([a-z]+(?:a|ak|ari|en|ean|era|etik|ekin|entzat))\b/i);
      const allowed = ["egun", "arratsalde", "urte", "on", "ona", "berri", "txar", "ongi", "ondo"];
      if (match && !allowed.includes(match[1].toLowerCase()) && !["on", "ona"].includes(match[2].toLowerCase())) {
        // e.g. "freskagarri bi botila" -> not adj, but "freskagarri" is noun
      }
    }

    // 11. Nor-Nork Agreement Mismatch (Singular direct object with plural auxiliary or vice versa)
    // E.g. "lau limoi nahi izan ditu" -> 4 lemons = ditu (correct). "melokotoi bat nahi izan dute" -> 1 peach = dute (correct).
    // Let us check: "bat ... ditut/dituzu/ditu/ditugu/dituzue/dituzte"
    if (/\bbat\s+(?:(?:\w+\s+){0,3})(ditut|dituzu|ditu|ditugu|dituzue|dituzte|nituen|zenituen|zituen|dauzkat|dauzkazu|dauzka)\b/i.test(text)) {
      flagIssue(c, item.field, text, "11. NOR Agreement Mismatch", "Singular direct object 'bat' paired with plural-object auxiliary", "Use singular-object auxiliary (dut/duzu/du...)");
    }
  });
});

console.log(`\nTotal flagged issues: ${issues.length}`);

// Group by rule
const ruleMap = {};
issues.forEach(iss => {
  if (!ruleMap[iss.rule]) ruleMap[iss.rule] = [];
  ruleMap[iss.rule].push(iss);
});

Object.keys(ruleMap).forEach(rule => {
  console.log(`\n======================================================`);
  console.log(`RULE: ${rule} (${ruleMap[rule].length} instances)`);
  console.log(`======================================================`);
  ruleMap[rule].slice(0, 10).forEach(iss => {
    console.log(`Challenge #${iss.challengeId} (Lesson ${iss.lessonId}, ${iss.type}) [${iss.field}]:`);
    console.log(`  Current:  "${iss.text}"`);
    console.log(`  Reason:   ${iss.reason}`);
    console.log(`  Fix:      ${iss.suggestion}`);
  });
});
