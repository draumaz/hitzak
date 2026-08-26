const fs = require('fs');
const path = require('path');

const prompts = JSON.parse(fs.readFileSync('scratch/all_prompts_for_audit.json', 'utf8'));
console.log(`Analyzing ${prompts.length} unique prompts...`);

// Let us categorize and inspect prompts that match various syntactic patterns
const results = {
  vowel_errors: [],
  typos: [],
  ergative_intransitive: [],
  absolutive_transitive: [],
  negative_inversion: [],
  quantifiers_plural: [],
  dative_gustatu: [],
  verbal_noun_bare: [],
  jolastu_valency: [],
  preposed_adjectives: [],
  nor_nork_mismatch: [],
  postposition_errors: [],
  other_oddities: []
};

prompts.forEach(p => {
  const str = p.trim();

  // 1. Vowel errors: *aa, *aek, *aetan, *aen, *aari
  if (/\b\w+aa\w*\b/i.test(str)) {
    results.vowel_errors.push({ prompt: str, detail: "Contains *aa" });
  }
  if (/\b\w+aek\b/i.test(str)) {
    results.vowel_errors.push({ prompt: str, detail: "Contains *-aek (should be -ek)" });
  }
  if (/\b\w+aetan\b/i.test(str)) {
    results.vowel_errors.push({ prompt: str, detail: "Contains *-aetan (should be -etan)" });
  }
  if (/\b\w+aen\b/i.test(str)) {
    results.vowel_errors.push({ prompt: str, detail: "Contains *-aen (should be -en)" });
  }
  if (/\b\w+aari\b/i.test(str)) {
    results.vowel_errors.push({ prompt: str, detail: "Contains *-aari (should be -ari)" });
  }

  // 2. Typos
  if (/\bitxaote\b/i.test(str)) results.typos.push({ prompt: str, detail: "itxaote -> itxarote / itxaron" });
  if (/\bgatzi\b/i.test(str)) results.typos.push({ prompt: str, detail: "gatzi -> gazi" });
  if (/\barraultz\b/i.test(str)) results.typos.push({ prompt: str, detail: "arraultz -> arrautz" });

  // 3. Ergative with intransitive
  if (/\bnik\s+(?:(?:\w+\s+){0,3})(naiz|gara|nago|gaude|noa|goaz|nator|gatoz|nabil|gabiltza|nintzen|ginen)\b/i.test(str)) {
    results.ergative_intransitive.push({ prompt: str, detail: "Nik with intransitive verb" });
  }
  if (/\bzuk\s+(?:(?:\w+\s+){0,3})(zara|zarete|zaude|zaudete|zoaz|zoazte|zator|zatozte|zabiltza|zabiltzate|zinen|zineten)\b/i.test(str)) {
    results.ergative_intransitive.push({ prompt: str, detail: "Zuk with intransitive verb" });
  }
  if (/\bguk\s+(?:(?:\w+\s+){0,3})(gara|gaude|goaz|gatoz|gabiltza|ginen)\b/i.test(str)) {
    results.ergative_intransitive.push({ prompt: str, detail: "Guk with intransitive verb" });
  }
  if (/\bhark\s+(?:(?:\w+\s+){0,3})(da|dira|dago|daude|doa|doaz|dator|datoz|dabil|dabiltza|zen|ziren)\b/i.test(str)) {
    results.ergative_intransitive.push({ prompt: str, detail: "Hark with intransitive verb" });
  }
  if (/\b(honek|horrek)\s+(?:(?:\w+\s+){0,3})(da|dira|dago|daude|doa|doaz|dator|datoz|dabil|dabiltza)\b/i.test(str)) {
    results.ergative_intransitive.push({ prompt: str, detail: "Honek/horrek with intransitive verb" });
  }

  // 4. Absolutive with transitive (subject drop of -k)
  if (/\bni\s+(?:(?:\w+\s+){0,4})(dut|ditut|nuen|nituen|daukat|dauzkat|dakit)\b/i.test(str)) {
    results.absolutive_transitive.push({ prompt: str, detail: "Ni with 1sg transitive verb" });
  }
  if (/\bzu\s+(?:(?:\w+\s+){0,4})(duzu|dituzu|zenuen|zenituen|daukazu|dauzkazu|dakizu)\b/i.test(str)) {
    results.absolutive_transitive.push({ prompt: str, detail: "Zu with 2sg transitive verb" });
  }
  if (/\bgu\s+(?:(?:\w+\s+){0,4})(dugu|ditugu|genuen|genituen|daukagu|dauzkagu|dakigu)\b/i.test(str)) {
    results.absolutive_transitive.push({ prompt: str, detail: "Gu with 1pl transitive verb" });
  }

  // 5. Negative inversion
  if (/\b(\w+(?:ten|tzen|tu|i|du|n))\s+ez\s+(dut|duzu|du|dugu|duzue|dute|ditut|dituzu|ditu|ditugu|dituzue|dituzte|naiz|zara|da|gara|zarete|dira|nuen|zuen|zen)\b/i.test(str)) {
    const m = str.match(/\b(\w+(?:ten|tzen|tu|i|du|n))\s+ez\s+(dut|duzu|du|dugu|duzue|dute|ditut|dituzu|ditu|ditugu|dituzue|dituzte|naiz|zara|da|gara|zarete|dira|nuen|zuen|zen)\b/i);
    if (!['izan', 'ez'].includes(m[1].toLowerCase())) {
      results.negative_inversion.push({ prompt: str, detail: `Un-inverted negative: ${m[0]}` });
    }
  }

  // 6. Quantifiers with plural
  if (/\b(bi|hiru|lau|bost|sei|zazpi|zortzi|bederatzi|hamar|hamaika|hamabi|hamahiru|hamalau|hamabost|hamasei|hamazazpi|hemezortzi|hemeretzi|hogei|zenbat)\s+([a-z]+(?:ak|ek))\b/i.test(str)) {
    const m = str.match(/\b(bi|hiru|lau|bost|sei|zazpi|zortzi|bederatzi|hamar|hamaika|hamabi|hamahiru|hamalau|hamabost|hamasei|hamazazpi|hemezortzi|hemeretzi|hogei|zenbat)\s+([a-z]+(?:ak|ek))\b/i);
    const days = ["astearteak", "asteazkenak", "ostegunak", "ostiralak", "larunbatak", "igandeak"];
    if (m && !days.includes(m[2].toLowerCase()) && m[2].toLowerCase() !== "urteak") {
      results.quantifiers_plural.push({ prompt: str, detail: `Quantifier ${m[1]} with plural ${m[2]}` });
    }
  }

  // 7. Dative on gustatu
  if (/\b([a-z]+ak)\s+(?:(?:\w+\s+){0,3})gustatzen\s+(zaio|zait|zaizu|zaigu|zaizue|zaie|zitzaion|zitzaidan|zitzaigun|zitzaien)\b/i.test(str)) {
    const m = str.match(/\b([a-z]+ak)\s+(?:(?:\w+\s+){0,3})gustatzen\s+(zaio|zait|zaizu|zaigu|zaizue|zaie|zitzaion|zitzaidan|zitzaigun|zitzaien)\b/i);
    if (m && (m[2] === "zaio" || m[2] === "zitzaion")) {
      results.dative_gustatu.push({ prompt: str, detail: `Non-dative experiencer: ${m[1]} with ${m[2]}` });
    }
  }

  // 8. Bare verbal noun before gustatu
  if (/\b([a-z]+(?:tze|te))\s+gustat/i.test(str)) {
    const m = str.match(/\b([a-z]+(?:tze|te))\s+gustat/i);
    results.verbal_noun_bare.push({ prompt: str, detail: `Bare verbal noun without -a: ${m[1]}` });
  }

  // 9. Jolastu valency
  if (/\bjolasten\s+(dut|duzu|du|dugu|duzue|dute|nuen|zenuen|zuen|genuen|zenuten|zuten)\b/i.test(str)) {
    results.jolastu_valency.push({ prompt: str, detail: `Transitive jolastu auxiliary` });
  }

  // 10. Direct object number mismatch (bat + plural aux)
  if (/\bbat\s+(?:(?:\w+\s+){0,3})(ditut|dituzu|ditu|ditugu|dituzue|dituzte|nituen|zenituen|zituen|dauzkat|dauzkazu|dauzka)\b/i.test(str)) {
    results.nor_nork_mismatch.push({ prompt: str, detail: `Singular 'bat' with plural auxiliary` });
  }
});

console.log("Results summary:");
Object.keys(results).forEach(k => {
  console.log(`\n=== ${k.toUpperCase()} (${results[k].length}) ===`);
  results[k].forEach(item => {
    console.log(`- "${item.prompt}" (${item.detail})`);
  });
});
