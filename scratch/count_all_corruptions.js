const fs = require('fs');

const challenges = JSON.parse(fs.readFileSync('data/courses/1/challenges.json', 'utf8'));

console.log("Auditing all options and accepted answers in challenges.json...");

const corruptedItems = [];

challenges.forEach(c => {
  const checkString = (str, role) => {
    if (!str) return;

    // Check for bad tokens
    const badRegexes = [
      { pattern: /\barrebaek\b/i, name: 'arrebaek (vowel attachment)', fix: 'arrebek' },
      { pattern: /\bgonaen\b/i, name: 'gonaen (vowel attachment)', fix: 'gonen' },
      { pattern: /\banitzaen\b/i, name: 'anitzaen (vowel attachment)', fix: 'Anitzaren' },
      { pattern: /\bmendiaetan\b/i, name: 'mendiaetan (vowel attachment)', fix: 'mendietan' },
      { pattern: /\bplazaen\b/i, name: 'plazaen (vowel attachment)', fix: 'plazan' },
      { pattern: /\begostiko\b/i, name: 'egostiko (participle hallucination)', fix: 'egosiko' },
      { pattern: /\bitxaote\b/i, name: 'itxaote (typo)', fix: 'itxarotea' },
      { pattern: /\bgatzi\b/i, name: 'gatzi (typo)', fix: 'gazi' },
      { pattern: /\barraultz\b/i, name: 'arraultz (typo)', fix: 'arrautza' },
      { pattern: /\bdago txuleta\b/i, name: 'dago txuleta (valency mismatch)', fix: 'txuleta egosiko du' },
      { pattern: /\bZu bederatzi hotz berde egosi dituzu gaur\b/i, name: 'Zu bederatzi hotz berde... (ergative drop & owl typo)', fix: 'Zuk bederatzi hontz berde egosi dituzu gaur' },
      { pattern: /\bBihar hogeita hamar zuek oilasko egostiko dituzue\b/i, name: 'Bihar hogeita hamar zuek... (word order & participle)', fix: 'Bihar zuek hogeita hamar oilasko egosiko dituzue' },
      { pattern: /\bEgunero zu leihoa irekitzen duzu\b/i, name: 'Egunero zu leihoa... (ergative drop)', fix: 'Egunero zuk leihoa irekitzen duzu' },
      { pattern: /\bDatorren astean zu kotxea jasoko duzu\b/i, name: 'Datorren astean zu kotxea... (ergative drop)', fix: 'Datorren astean zuk kotxea jasoko duzu' },
      { pattern: /\bGu ez dugu tomaterik edo artorik\b/i, name: 'Gu ez dugu... (ergative drop)', fix: 'Guk ez dugu tomaterik edo artorik' },
      { pattern: /\bBazkaltzeko guk pintxoak jaten ari gara\b/i, name: 'Bazkaltzeko guk pintxoak... (ergative with ari gara)', fix: 'Bazkaltzeko gu pintxoak jaten ari gara' },
      { pattern: /\bNik baloi batekin jolasten ari nintzen\b/i, name: 'Nik baloi batekin... (ergative with ari nintzen)', fix: 'Ni baloi batekin jolasten ari nintzen' },
      { pattern: /\bKatuak hemen esertzea gustatzen zaio\b/i, name: 'Katuak hemen esertzea... (dative drop)', fix: 'Katuari hemen esertzea gustatzen zaio' },
      { pattern: /\bDortokak mahaia garbitzea gustatzen zaio\b/i, name: 'Dortokak mahaia garbitzea... (dative drop)', fix: 'Dortokari mahaia garbitzea gustatzen zaio' },
      { pattern: /\bOilaskoak gelditu eta abestea gustatzen zaio\b/i, name: 'Oilaskoak gelditu eta... (dative drop)', fix: 'Oilaskoari gelditu eta abestea gustatzen zaio' },
      { pattern: /\bHari ez zitzaion gustatu itxaote\b/i, name: 'Hari ez zitzaion gustatu itxaote (typo & article)', fix: 'Hari ez zitzaion gustatu itxarotea' },
      { pattern: /\bHari ez zaio gustatuko itxaote\b/i, name: 'Hari ez zaio gustatuko itxaote (typo & article)', fix: 'Hari ez zaio gustatuko itxarotea' },
      { pattern: /\bHari ez zaio gustatuko erortze\b/i, name: 'Hari ez zaio gustatuko erortze (bare verbal noun)', fix: 'Hari ez zaio gustatuko erortzea' },
      { pattern: /\bNiri ez zait gustatzen hemen iriste\b/i, name: 'Niri ez zait gustatzen hemen iriste (bare verbal noun)', fix: 'Niri ez zait gustatzen hona iristea' },
      { pattern: /\bNik baloiarekin jolasten dut\b/i, name: 'Nik baloiarekin jolasten dut (jolastu valency)', fix: 'Ni baloiarekin jolasten naiz' },
      { pattern: /\bNire alabak bere ahizparekin jolasten du\b/i, name: 'Nire alabak bere ahizparekin jolasten du (jolastu valency)', fix: 'Nire alaba bere ahizparekin jolasten da' },
      { pattern: /\bNire semea bere arrebarekin jolasten du\b/i, name: 'Nire semea bere arrebarekin jolasten du (jolastu valency)', fix: 'Nire semea bere arrebarekin jolasten da' }
    ];

    badRegexes.forEach(b => {
      if (b.pattern.test(str)) {
        corruptedItems.push({
          challengeId: c.id,
          lessonId: c.lessonId,
          type: c.type,
          role,
          str,
          issueName: b.name,
          fix: b.fix
        });
      }
    });
  };

  checkString(c.prompt, 'prompt');
  if (c.question && c.question.includes('"')) {
    const m = c.question.match(/"([^"]+)"/);
    if (m) checkString(m[1], 'question_quote');
  }
  if (c.options) {
    c.options.forEach((opt, idx) => checkString(opt.text, `option[${idx}]`));
  }
  if (c.acceptedAnswers) {
    c.acceptedAnswers.forEach((ans, idx) => checkString(ans, `acceptedAnswer[${idx}]`));
  }
});

console.log(`Total corrupted occurrences in challenges.json: ${corruptedItems.length}`);

// Breakdown by issueName
const byIssue = {};
corruptedItems.forEach(item => {
  byIssue[item.issueName] = (byIssue[item.issueName] || 0) + 1;
});
console.log("\nBreakdown by issue:", byIssue);
