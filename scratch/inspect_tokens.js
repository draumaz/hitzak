const fs = require('fs');

const tokens = JSON.parse(fs.readFileSync('scratch/all_vocab_tokens.json', 'utf8'));

console.log(`Checking ${tokens.length} unique tokens...`);

const suspicious = [];

tokens.forEach(tok => {
  // Check future participles ending in -tiko where base participle is -si / -zi / -tzi
  // E.g. egosi -> egosiko (not egostiko), ikusi -> ikusiko (not ikustiko), erosi -> erosiko (not erostiko), jaitsi -> jaitsiko (not jaitsitiko)
  if (/(?:si|zi|tzi)tiko$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Invalid future participle *-sitiko/*-zitiko instead of -siko/-ziko" });
  }

  // Check double vowels aa, ee, ii, oo, uu
  if (/aa/i.test(tok) && !['baa', 'baazter'].includes(tok)) {
    suspicious.push({ token: tok, reason: "Contains *aa" });
  }
  if (/aek$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Contains invalid *-aek ending" });
  }
  if (/aetan$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Contains invalid *-aetan ending" });
  }
  if (/aen$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Contains invalid *-aen ending" });
  }
  if (/aari$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Contains invalid *-aari ending" });
  }
  if (/aera$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Contains invalid *-aera ending" });
  }
  if (/aetik$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Contains invalid *-aetik ending" });
  }
  if (/aekin$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Contains invalid *-aekin ending" });
  }
  if (/aentzat$/i.test(tok)) {
    suspicious.push({ token: tok, reason: "Contains invalid *-aentzat ending" });
  }

  // Check phantom synthetic verbs starting with d- or n- or z- or g- that are not valid
  // (e.g. *djan, *djaten, *dirakurri, *dikus, *dikusi, *deder, *dgarbi, *djolasten, etc.)
  if (/^d[a-z]+/i.test(tok)) {
    const validD = new Set([
      'da', 'dago', 'daude', 'doa', 'doaz', 'dator', 'datoz', 'dabil', 'dabiltza',
      'dut', 'duzu', 'du', 'dugu', 'duzue', 'dute',
      'ditut', 'dituzu', 'ditu', 'ditugu', 'dituzue', 'dituzte',
      'daukat', 'daukazu', 'dauka', 'daukagu', 'daukazue', 'daukate',
      'dauzkat', 'dauzkazu', 'dauzka', 'dauzkagu', 'dauzkazue', 'dauzkate',
      'dakit', 'dakizu', 'daki', 'dakigu', 'dakizue', 'dakite',
      'diot', 'diozu', 'dio', 'diogu', 'diozue', 'diote',
      'diet', 'diezu', 'die', 'diegu', 'diezue', 'diete',
      'dit', 'dizu', 'digu', 'dizue',
      'daramat', 'daramazu', 'darama', 'daramagu', 'daramazue', 'daramate',
      'daramatzat', 'daramatzazu', 'daramatza', 'daramatzagu', 'daramatzazue', 'daramatzate',
      'dakart', 'dakarzu', 'dakar', 'dakargu', 'dakarzue', 'dakarte',
      'dakarzkit', 'dakarzkizu', 'dakarzki', 'dakarzkigu', 'dakarzkizue', 'dakarzkite',
      'dirudi', 'dirudite',
      'dantza', 'dantzatu', 'dantzatzen', 'dantzari', 'dantzan', 'dantzaria', 'dantzariak', 'dantzatzea', 'dantzatuko',
      'denda', 'dendan', 'dendara', 'dendari', 'dendaria', 'dendak', 'dendako', 'dendetatik', 'dendetara', 'dendetako', 'dendetan',
      'denbora', 'denboran', 'denborarik', 'denboraz', 'denborae',
      'dena', 'denak', 'denetan', 'denek', 'denei', 'denetik', 'denera',
      'dei', 'deitu', 'deitzen', 'deituko', 'deia', 'deiak',
      'dohainik', 'doan', 'donostia', 'donostiakoa', 'donostiakoak', 'donostian', 'donostiara', 'donostiatik',
      'dolu', 'dolura', 'dorre', 'dorrea', 'dorreak', 'dorrean', 'dortoka', 'dortokak', 'dortokari', 'dortokaren', 'dortokekin',
      'duda', 'dudarik', 'dutxa', 'dutxatu', 'dutxatzen', 'dutxatuko', 'dutxan',
      'deskribatu', 'deskribatzen', 'deskantsatu', 'deskantsatzen',
      'desberdin', 'desberdina', 'desberdinak',
      'diru', 'dirua', 'diruarekin', 'dirurik',
      'datorren', 'datorrenean', 'dagoen', 'dagoenean', 'dauden', 'daudenean', 'doan', 'doanean', 'doazen',
      'direla', 'dela', 'duten', 'duen', 'dutela', 'duela', 'dutelako', 'duelako', 'delako', 'direlako',
      'diren', 'dituena', 'dituen', 'dituztela', 'dituela',
      'dituzten', 'dituztenak',
      'dagokio', 'dagokie', 'daiteke', 'daitezke', 'dezaket', 'dezakezu', 'dezake', 'dezagun', 'dezakete'
    ]);
    if (!validD.has(tok.toLowerCase()) && !tok.startsWith("dend") && !tok.startsWith("dantz") && !tok.startsWith("donosti") && !tok.startsWith("dortok") && !tok.startsWith("des") && !tok.startsWith("denb") && !tok.startsWith("diru")) {
      suspicious.push({ token: tok, reason: "Possible unrecognized d- verb or irregular token" });
    }
  }
});

console.log(`Found ${suspicious.length} suspicious tokens:`);
suspicious.forEach(s => console.log(`- ${s.token}: ${s.reason}`));
