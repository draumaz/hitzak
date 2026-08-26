const fs = require('fs');

const sentences = JSON.parse(fs.readFileSync('scratch/all_unique_basque_sentences.json', 'utf8'));

console.log("Auditing for relative clauses, prepositions, negative movement, and quantifiers...");

const findings = [];

sentences.forEach(s => {
  const p = s.prompt;

  // 1. Romance relative pronouns (zein / zeina / zeintzuk as relative pronoun before finite verb)
  if (/\b(zein|zeina|zeintzuk)\s+(?:da|dira|dago|daude|dut|dute|du)\b/i.test(p) && !p.endsWith('?')) {
    findings.push({ type: 'Relative Clause Calque', prompt: p, detail: 'Romance relative pronoun' });
  }

  // 2. Prepositions (en, de, con, sin, para, por) inside Basque sentences
  // Note: 'de' could be in 'deitu', 'dei', but standalone 'en', 'de', 'con', 'sin', 'para', 'por'
  if (/\b(en|con|sin|para|por)\s+[a-z]+/i.test(p)) {
    // Check if not English prompt
    if (/[a-z]+(ak|ek|an|era|tik|ko|ren|rekin)\b/i.test(p)) {
      findings.push({ type: 'Romance Preposition Calque', prompt: p, detail: 'Preposition used instead of postposition' });
    }
  }

  // 3. Negative movement violations
  // Standard negative periphrastic: Ez + AUX + ... + Verb
  // Flag: Verb + Ez + AUX, or Ez + Object + Verb + AUX
  if (/\b([a-z]+(?:ten|tzen|tu|i|du|n))\s+ez\s+(dut|duzu|du|dugu|duzue|dute|ditut|dituzu|ditu|ditugu|dituzue|dituzte|naiz|zara|da|gara|zarete|dira|nuen|zuen|zen)\b/i.test(p)) {
    const m = p.match(/\b([a-z]+(?:ten|tzen|tu|i|du|n))\s+ez\s+(dut|duzu|du|dugu|duzue|dute|ditut|dituzu|ditu|ditugu|dituzue|dituzte|naiz|zara|da|gara|zarete|dira|nuen|zuen|zen)\b/i);
    if (!['izan', 'ez', 'ere'].includes(m[1].toLowerCase())) {
      findings.push({ type: 'Negative Movement Violation', prompt: p, detail: `${m[1]} precedes ez ${m[2]}` });
    }
  }

  // 4. Quantifiers with definite plural (*bi liburuak, *hiru gizonak, *lau neskak, *bost sagarrak)
  if (/\b(bi|hiru|lau|bost|sei|zazpi|zortzi|bederatzi|hamar|hamaika|hamabi|hamahiru|hamalau|hamabost|hamasei|hamazazpi|hemezortzi|hemeretzi|hogei|zenbat)\s+([a-z]+(?:ak|ek))\b/i.test(p)) {
    const m = p.match(/\b(bi|hiru|lau|bost|sei|zazpi|zortzi|bederatzi|hamar|hamaika|hamabi|hamahiru|hamalau|hamabost|hamasei|hamazazpi|hemezortzi|hemeretzi|hogei|zenbat)\s+([a-z]+(?:ak|ek))\b/i);
    const ignored = ['astearteak', 'asteazkenak', 'ostegunak', 'ostiralak', 'larunbatak', 'igandeak', 'urteak', 'zuek'];
    if (!ignored.includes(m[2].toLowerCase())) {
      findings.push({ type: 'Quantifier Indefinite Stem Violation', prompt: p, detail: `${m[1]} with plural ${m[2]}` });
    }
  }

  // 5. Postpositions on animate nouns (-rengan, -rengana, -rengandik, -rengatik) vs inanimate (-an, -ra, -tik)
  // E.g. *lagunean vs lagunarengan / lagunarekin
});

console.log(`Found ${findings.length} findings:`);
findings.forEach(f => console.log(`[${f.type}] "${f.prompt}" -> ${f.detail}`));
