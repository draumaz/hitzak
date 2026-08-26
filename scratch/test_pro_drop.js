const fs = require('fs');
const path = require('path');

const VERB_TO_PRONOUN = {
  // naiz/nintzen verbs -> ni
  "naiz": ["ni"],
  "nintzen": ["ni"],
  "nago": ["ni"],
  "noa": ["ni"],
  "nator": ["ni"],
  
  // zara/zinen verbs -> zu
  "zara": ["zu"],
  "zinen": ["zu"],
  "zaude": ["zu"],
  "zoaz": ["zu"],
  "zator": ["zu"],
  
  // da/zen verbs -> hura
  "da": ["hura"],
  "zen": ["hura"],
  "dago": ["hura"],
  "doa": ["hura"],
  "dator": ["hura"],
  
  // gara/ginen verbs -> gu
  "gara": ["gu"],
  "ginen": ["gu"],
  "gaude": ["gu"],
  "goaz": ["gu"],
  "gatoz": ["gu"],
  
  // zarete/zineten verbs -> zuek
  "zarete": ["zuek"],
  "zineten": ["zuek"],
  "zaudete": ["zuek"],
  "zoazte": ["zuek"],
  "zatozte": ["zuek"],
  
  // dira/ziren verbs -> haiek
  "dira": ["haiek"],
  "ziren": ["haiek"],
  "daude": ["haiek"],
  "doaz": ["haiek"],
  "datoz": ["haiek"],

  // transitive (ukan/edun) verbs:
  // dut/nuen -> nik
  "dut": ["nik"],
  "nuen": ["nik"],
  "ditut": ["nik"],
  "nituen": ["nik"],
  // duzu/zenuen -> zuk
  "duzu": ["zuk"],
  "zenuen": ["zuk"],
  "dituzu": ["zuk"],
  "zenituen": ["zuk"],
  // du/zuen -> hark
  "du": ["hark"],
  "zuen": ["hark"],
  "ditu": ["hark"],
  "zituen": ["hark"],
  // dugu/genuen -> guk
  "dugu": ["guk"],
  "genuen": ["guk"],
  "ditugu": ["guk"],
  "genituen": ["guk"],
  // duzue/zenuten -> zuek
  "duzue": ["zuek"],
  "zenuten": ["zuek"],
  "dituzue": ["zuek"],
  "zenituzten": ["zuek"],
  // dute/zuten -> haiek
  "dute": ["haiek"],
  "zuten": ["haiek"],
  "dituzte": ["haiek"],
  "zituzten": ["haiek"]
};

const BASQUE_PRONOUNS = new Set([
  "ni", "zu", "hura", "gu", "zuek", "haiek",
  "nik", "guk", "zuk", "hark"
]);

function cleanWord(w) {
  return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
}

function getProDropAlternativeText(expected, pronounToDrop) {
  const words = expected.split(/\s+/);
  const index = words.findIndex(w => cleanWord(w) === pronounToDrop.toLowerCase());
  if (index === -1) return expected;

  const before = words.slice(0, index);
  const after = words.slice(index + 1);

  if (index === 0 && after.length > 0) {
    after[0] = after[0].charAt(0).toUpperCase() + after[0].slice(1);
  }

  return [...before, ...after].join(" ");
}

function areBasqueSentencesEquivalent(expected, user) {
  const normExpected = expected.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const normUser = user.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

  const expectedWords = expected.split(/\s+/).map(cleanWord).filter(Boolean);
  const userWords = user.split(/\s+/).map(cleanWord).filter(Boolean);

  // Find verbs in expected
  const expectedVerbs = expectedWords.filter(w => VERB_TO_PRONOUN[w]);
  
  // Find which pronouns are grammatically compatible with the verbs in expected
  const compatiblePronouns = new Set();
  for (const v of expectedVerbs) {
    const prs = VERB_TO_PRONOUN[v];
    if (prs) {
      prs.forEach(p => compatiblePronouns.add(p));
    }
  }

  // Also check if any pronoun is explicitly present in expected
  const pronounsInExpected = expectedWords.filter(w => BASQUE_PRONOUNS.has(w));
  pronounsInExpected.forEach(p => compatiblePronouns.add(p));

  // If there are no compatible/present pronouns, they can only be equivalent if they match exactly
  if (compatiblePronouns.size === 0) {
    return { isEquivalent: normExpected === normUser };
  }

  // Filter word lists: remove only pronouns that are compatible
  const filteredExpected = expectedWords.filter(w => !compatiblePronouns.has(w));
  const filteredUser = userWords.filter(w => !compatiblePronouns.has(w));

  // If the filtered versions are identical, they are equivalent under pro-drop!
  if (filteredExpected.join(" ") === filteredUser.join(" ")) {
    // Let's check which pronouns from compatiblePronouns were actually used in expected vs user
    const usedInExpected = expectedWords.filter(w => compatiblePronouns.has(w));
    const usedInUser = userWords.filter(w => compatiblePronouns.has(w));

    if (normExpected === normUser) {
      // User matched expected exactly.
      // If expected had a pronoun, also accept the pronoun-less version.
      if (usedInExpected.length > 0) {
        // We drop the pronoun(s) from expected
        let alt = expected;
        for (const p of usedInExpected) {
          alt = getProDropAlternativeText(alt, p);
        }
        return { isEquivalent: true, alsoAccepted: alt };
      }
      // If expected had no pronoun, we don't show alsoAccepted because we don't know where to insert it safely,
      // or we could construct it if we want, but it's not strictly necessary. Let's see:
      return { isEquivalent: true };
    }

    if (usedInUser.length === 0 && usedInExpected.length > 0) {
      // User dropped the pronoun, expected had it.
      // So the "Also accepted" is the expected sentence.
      return { isEquivalent: true, alsoAccepted: expected };
    } else if (usedInUser.length > 0 && usedInExpected.length === 0) {
      // User added the pronoun, expected didn't have it.
      // So "Also accepted" is the expected sentence.
      return { isEquivalent: true, alsoAccepted: expected };
    }
  }

  return { isEquivalent: normExpected === normUser };
}

// Test some examples
const tests = [
  { expected: "Zu gizon bat zara.", user: "gizon bat zara", shouldBe: true, alsoAccepted: "Zu gizon bat zara." },
  { expected: "Zu gizon bat zara.", user: "Zu gizon bat zara", shouldBe: true, alsoAccepted: "Gizon bat zara." },
  { expected: "gizon bat zara.", user: "Zu gizon bat zara", shouldBe: true, alsoAccepted: "gizon bat zara." },
  { expected: "Mirenen neba naiz.", user: "Ni Mirenen neba naiz.", shouldBe: true, alsoAccepted: "Mirenen neba naiz." },
  { expected: "Mirenen neba naiz.", user: "Zu Mirenen neba naiz.", shouldBe: false },
  { expected: "Kaixo, ni mutil bat naiz.", user: "Kaixo, mutil bat naiz.", shouldBe: true, alsoAccepted: "Kaixo, ni mutil bat naiz." },
  { expected: "Kaixo, ni mutil bat naiz.", user: "Kaixo, ni mutil bat naiz.", shouldBe: true, alsoAccepted: "Kaixo, mutil bat naiz." }
];

tests.forEach((t, i) => {
  const res = areBasqueSentencesEquivalent(t.expected, t.user);
  const ok = res.isEquivalent === t.shouldBe && (t.shouldBe ? res.alsoAccepted === t.alsoAccepted : true);
  console.log(`Test ${i}: ${ok ? "PASS" : "FAIL"}`);
  if (!ok) {
    console.log(`  Expected equivalent: ${t.shouldBe}, Got: ${res.isEquivalent}`);
    console.log(`  Expected alsoAccepted: ${t.alsoAccepted}, Got: ${res.alsoAccepted}`);
  }
});
