const fs = require('fs');
const path = require('path');

const challengesPath = path.join(__dirname, '../data/courses/1/challenges.json');
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

console.log("=== COMPREHENSIVE LINGUISTIC VERIFICATION AUDIT ===");
console.log(`Total challenges loaded: ${challenges.length}`);

let testPassed = 0;
let testFailed = 0;

function assert(condition, message) {
  if (condition) {
    testPassed++;
  } else {
    testFailed++;
    console.error(`❌ FAILED: ${message}`);
  }
}

function checkAccepts(challengeId, expectedSentences) {
  const c = challenges.find(x => x.id === challengeId);
  if (!c) {
    assert(false, `Challenge #${challengeId} not found`);
    return;
  }
  const normAccepted = (c.acceptedAnswers || []).map(a => 
    a.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").toLowerCase().trim()
  );

  expectedSentences.forEach(exp => {
    const normExp = exp.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").toLowerCase().trim();
    const found = normAccepted.includes(normExp);
    assert(found, `Challenge #${challengeId} ("${c.prompt}") should accept "${exp}"`);
  });
}

// 1. Verify English Prompt Normalization
console.log("\n--- Verification 1: English Prompt Normalization ---");
const c71 = challenges.find(x => x.id === 71);
const c79 = challenges.find(x => x.id === 79);
const c713 = challenges.find(x => x.id === 713);

assert(c71 && c71.prompt === "You are Aitor. You are a student.", "Challenge #71 prompt should be 'You are Aitor. You are a student.'");
assert(c79 && c79.prompt === "You are Aitor. You are a student.", "Challenge #79 prompt should be 'You are Aitor. You are a student.'");
assert(c713 && c713.prompt === "You were a thin dog.", "Challenge #713 prompt should be 'You were a thin dog.'");

// 2. Verify Canonical Display ("a/an") vs Literal Fallback ("one") in English translations
console.log("\n--- Verification 2: Canonical Display ('a/an') & Literal 'one' Fallbacks ---");

// Challenge #56 & #89: "Epa. Ni ere irakasle bat naiz."
[56, 89].forEach(id => {
  const c = challenges.find(x => x.id === id);
  assert(c && c.acceptedAnswers[0].includes("a teacher"), `Challenge #${id} primary canonical answer should use 'a teacher'`);
  checkAccepts(id, [
    "Hi. I am also one teacher.",
    "Hi. I'm also one teacher.",
    "Hi. I am one teacher too.",
    "Hi. I'm one teacher too.",
    "Hello. I am also one teacher.",
    "Hey. I'm one teacher too.",
    "Hi. I am also a teacher.",
    "Hi. I'm also a teacher.",
    "Hi. I am a teacher too.",
    "Hi. I'm a teacher too."
  ]);
});

// Challenge #3 & #9: "Kaixo, ni mutil bat naiz."
[3, 9].forEach(id => {
  const c = challenges.find(x => x.id === id);
  assert(c && c.acceptedAnswers[0].includes("a boy"), `Challenge #${id} primary canonical answer should use 'a boy'`);
  checkAccepts(id, [
    "Hello. I am a boy.",
    "Hello. I'm a boy.",
    "Hello. I am one boy.",
    "Hello. I'm one boy.",
    "Hi. I am a boy.",
    "Hi. I'm a boy.",
    "Hi. I am one boy.",
    "Hi. I'm one boy."
  ]);
});

// Challenge #1503: "Boligrafo bat bi euro da."
const c1503 = challenges.find(x => x.id === 1503);
assert(c1503 && c1503.acceptedAnswers[0].startsWith("A pen"), `Challenge #1503 primary canonical answer should start with 'A pen'`);
checkAccepts(1503, [
  "A pen is two euros",
  "A pen is two euros.",
  "One pen is two euros",
  "One pen is two euros."
]);

// Challenge #693: "Ni katu gizen bat nintzen."
const c693 = challenges.find(x => x.id === 693);
assert(c693 && c693.acceptedAnswers[0].includes("a fat cat"), `Challenge #693 primary canonical answer should use 'a fat cat'`);
checkAccepts(693, [
  "I was a fat cat",
  "I was one fat cat",
  "I was a fat cat.",
  "I was one fat cat."
]);

// 3. Verify Basque Bidirectional Acceptance (-a vs bat)
console.log("\n--- Verification 3: Basque Bidirectional Acceptance (-a vs bat) ---");

// Challenge #21: "Hello, I am a boy."
checkAccepts(21, [
  "Kaixo ni mutil bat naiz",
  "Kaixo ni mutila naiz",
  "Kaixo mutil bat naiz",
  "Kaixo mutila naiz",
  "Kaixo ni naiz mutil bat",
  "Kaixo ni naiz mutila",
  "Kaixo mutil bat naiz ni",
  "Kaixo mutila naiz ni"
]);

// Challenge #30: "You are a man."
checkAccepts(30, [
  "Zu gizon bat zara",
  "Zu gizona zara",
  "Gizon bat zara",
  "Gizona zara",
  "Zu zara gizon bat",
  "Zu zara gizona",
  "Gizon bat zara zu",
  "Gizona zara zu"
]);

// Challenge #31: "You are a woman."
checkAccepts(31, [
  "Zu emakume bat zara",
  "Zu emakumea zara",
  "Emakume bat zara",
  "Emakumea zara",
  "Zu zara emakume bat",
  "Zu zara emakumea",
  "Emakume bat zara zu",
  "Emakumea zara zu"
]);

// Challenge #34: "I am a man."
checkAccepts(34, [
  "Ni gizon bat naiz",
  "Ni gizona naiz",
  "Gizon bat naiz",
  "Gizona naiz",
  "Ni naiz gizon bat",
  "Ni naiz gizona",
  "Gizon bat naiz ni",
  "Gizona naiz ni"
]);

// Challenge #71: "You are Aitor. You are a student."
checkAccepts(71, [
  "Zu Aitor zara. Zu ikasle bat zara.",
  "Zu Aitor zara. Zu ikaslea zara.",
  "Aitor zara. Ikaslea zara.",
  "Aitor zara. Ikasle bat zara.",
  "Zu Aitor zara. Ikasle bat zara.",
  "Zu Aitor zara. Ikaslea zara.",
  "Aitor zara. Zu ikasle bat zara.",
  "Aitor zara. Zu ikaslea zara.",
  "Zu zara Aitor. Zu zara ikasle bat.",
  "Zu zara Aitor. Zu zara ikaslea."
]);

// Challenge #74: "She is Miren. Miren is a woman."
checkAccepts(74, [
  "Hura Miren da. Miren emakumea da.",
  "Hura Miren da. Miren emakume bat da.",
  "Miren da. Miren emakumea da.",
  "Miren da. Miren emakume bat da.",
  "Miren da. Emakumea da.",
  "Miren da. Emakume bat da."
]);

// Challenge #76: "Hello. I am Miren. I am a teacher."
checkAccepts(76, [
  "Kaixo. Ni Miren naiz. Ni irakaslea naiz.",
  "Kaixo. Ni Miren naiz. Ni irakasle bat naiz.",
  "Kaixo. Miren naiz. Irakaslea naiz.",
  "Kaixo. Miren naiz. Irakasle bat naiz."
]);

// Challenge #77: "You are Miren. You are a woman."
checkAccepts(77, [
  "Zu Miren zara. Zu emakumea zara.",
  "Zu Miren zara. Zu emakume bat zara.",
  "Miren zara. Emakumea zara.",
  "Miren zara. Emakume bat zara.",
  "Zu Miren zara. Emakume bat zara.",
  "Zu Miren zara. Emakumea zara."
]);

// Challenge #91: "Miren is also a teacher."
checkAccepts(91, [
  "Miren ere irakaslea da",
  "Miren ere irakasle bat da",
  "Miren irakaslea ere bada",
  "Miren irakasle bat ere bada",
  "Irakaslea ere bada Miren",
  "Irakasle bat ere bada Miren"
]);

// Challenge #404: "You were a girl, but now you are a woman."
checkAccepts(404, [
  "Zu neska zinen baina orain emakume zara",
  "Zu neska zinen baina orain emakumea zara",
  "Zu neska zinen baina orain emakume bat zara",
  "Neska zinen baina orain emakumea zara",
  "Neska zinen baina orain emakume bat zara",
  "Neska bat zinen baina orain emakume bat zara"
]);

// Challenge #420: "He was a teacher, but now he is a nurse."
checkAccepts(420, [
  "Hura irakaslea zen baina orain erizaina da",
  "Hura irakasle bat zen baina orain erizain bat da",
  "Irakaslea zen baina orain erizaina da",
  "Irakasle bat zen baina orain erizain bat da",
  "Irakaslea zen baina orain erizain bat da",
  "Irakasle bat zen baina orain erizaina da"
]);

// Challenge #443: "I was a student, but now I am a priest."
checkAccepts(443, [
  "Ni ikaslea nintzen baina orain apaiza naiz",
  "Ni ikasle bat nintzen baina orain apaiz bat naiz",
  "Ikaslea nintzen baina orain apaiza naiz",
  "Ikasle bat nintzen baina orain apaiz bat naiz"
]);

// Challenge #447: "You were a waiter, but now you are a teacher."
checkAccepts(447, [
  "Zu camareroa zinen baina orain irakaslea zara",
  "Zu camarero bat zinen baina orain irakasle bat zara",
  "Zu zerbitzaria zinen baina orain irakaslea zara",
  "Zu zerbitzari bat zinen baina orain irakasle bat zara",
  "Camareroa zinen baina orain irakaslea zara",
  "Camarero bat zinen baina orain irakasle bat zara"
]);

// Challenge #507: "It was a black car, but now it is red."
checkAccepts(507, [
  "Kotxe beltza zen baina orain gorria da",
  "Kotxe beltz bat zen baina orain gorria da",
  "Kotxe beltza zen baina gorria da orain",
  "Kotxe beltz bat zen baina gorria da orain"
]);

// Challenge #713: "You were a thin dog."
checkAccepts(713, [
  "Zu txakur argal bat zinen",
  "Zu txakur argala zinen",
  "Txakur argal bat zinen",
  "Txakur argala zinen",
  "Zu zinen txakur argal bat",
  "Zu zinen txakur argala"
]);

// Challenge #724: "The boy is not a cat."
checkAccepts(724, [
  "Mutila ez da katua",
  "Mutila ez da katu bat",
  "Ez da katua mutila",
  "Ez da katu bat mutila",
  "Mutila katua ez da",
  "Mutila katu bat ez da"
]);

// Challenge #780: "The guide was a yellow snake."
checkAccepts(780, [
  "Gida suge horia zen",
  "Gida suge hori bat zen",
  "Suge horia zen gida",
  "Suge hori bat zen gida"
]);

// Challenge #1721: "My cousin (male) is also a waiter."
checkAccepts(1721, [
  "Nire lehengusua ere camareroa da",
  "Nire lehengusua ere camarero bat da",
  "Nire lehengusua ere zerbitzaria da",
  "Nire lehengusua ere zerbitzari bat da"
]);

// 4. Verify General Challenge Integrity
console.log("\n--- Verification 4: General Data Integrity ---");
let emptyAnswersCount = 0;
let mismatchCanonicalCount = 0;

challenges.forEach(c => {
  if (!c.acceptedAnswers || !Array.isArray(c.acceptedAnswers) || c.acceptedAnswers.length === 0) {
    emptyAnswersCount++;
    console.error(`Challenge #${c.id} has empty acceptedAnswers`);
  }

  if (c.type === "TRANSLATE") {
    const correctOptions = (c.options || []).filter(o => o.correct).sort((a,b) => (a.order||0) - (b.order||0));
    const target = correctOptions.map(o => o.text).join(" ").trim();
    if (target && !c.acceptedAnswers.includes(target)) {
      mismatchCanonicalCount++;
      console.error(`Challenge #${c.id} missing canonical target "${target}"`);
    }
  }
});

assert(emptyAnswersCount === 0, `All challenges must have non-empty acceptedAnswers (found ${emptyAnswersCount} empty)`);
assert(mismatchCanonicalCount === 0, `All TRANSLATE challenges must include canonical target in acceptedAnswers (found ${mismatchCanonicalCount} missing)`);

console.log(`\n=== TEST SUMMARY ===`);
console.log(`Passed: ${testPassed}`);
console.log(`Failed: ${testFailed}`);

if (testFailed === 0) {
  console.log("✅ ALL COMPREHENSIVE VERIFICATION TESTS PASSED SUCCESSFULLY!");
} else {
  process.exit(1);
}
