const fs = require("fs");
const path = require("path");

const challengesPath = path.join(__dirname, "../data/courses/1/challenges.json");
const standalonePath = path.join(__dirname, "../.next/standalone/data/courses/1/challenges.json");

const challenges = JSON.parse(fs.readFileSync(challengesPath, "utf8"));

const auditLog = [];

function recordChange(id, type, prompt, field, before, after, description) {
  auditLog.push({
    id,
    type,
    prompt,
    field,
    before,
    after,
    description
  });
}

function generateCopularPermutations({
  subjectTypes = ["pronoun_3sg"], // "pronoun_3sg" (hura), "pronoun_3pl" (haiek), "demonstrative_prox" (hau), "demonstrative_med" (hori)
  predicate, // e.g. "a bus driver" or "bus driver" or "the bus driver"
  past = false,
  isQuestion = false
}) {
  // Generate combinations
  const results = new Set();
  
  // Subjects
  let subjects = [];
  if (subjectTypes.includes("pronoun_3sg")) {
    subjects.push(
      { long: past ? "He was" : "He is", short: past ? "He was" : "He's" },
      { long: past ? "She was" : "She is", short: past ? "She was" : "She's" },
      { long: past ? "That person was" : "That person is", short: past ? "That person was" : "That person's" },
      { long: past ? "That one was" : "That one is", short: past ? "That one was" : "That one's" },
      { long: past ? "That was" : "That is", short: past ? "That was" : "That's" },
      { long: past ? "It was" : "It is", short: past ? "It was" : "It's" }
    );
  }
  if (subjectTypes.includes("demonstrative_prox")) {
    subjects.push(
      { long: past ? "This was" : "This is", short: past ? "This was" : "This's" },
      { long: past ? "This person was" : "This person is", short: past ? "This person was" : "This person's" },
      { long: past ? "This one was" : "This one is", short: past ? "This one was" : "This one's" }
    );
  }
  if (subjectTypes.includes("demonstrative_med")) {
    subjects.push(
      { long: past ? "That was" : "That is", short: past ? "That was" : "That's" },
      { long: past ? "That person was" : "That person is", short: past ? "That person was" : "That person's" },
      { long: past ? "That one was" : "That one is", short: past ? "That one was" : "That one's" }
    );
  }

  // Generate predicate forms
  let predForms = [];
  if (Array.isArray(predicate)) {
    predForms = predicate;
  } else {
    predForms = [predicate];
  }

  for (const s of subjects) {
    for (const p of predForms) {
      const sentenceLong = `${s.long} ${p}`.trim();
      const sentenceShort = `${s.short} ${p}`.trim();
      
      [sentenceLong, sentenceShort].forEach(sent => {
        results.add(sent);
        results.add(sent + ".");
        if (isQuestion) {
          results.add(sent + "?");
        }
      });
    }
  }

  return Array.from(results);
}

// 1. ID 852 (MATCH, Lesson 86)
const c852 = challenges.find(c => c.id === 852);
if (c852) {
  const opt = c852.options.find(o => o.text === "those over there, plural of hura");
  if (opt) {
    recordChange(852, c852.type, c852.prompt, "options", opt.text, "those", "Corrected demonstrative gloss from spatial adverbial description to demonstrative pronoun");
    opt.text = "those";
  }
  const oldAns = [...c852.acceptedAnswers];
  c852.acceptedAnswers = ["this", "haiek", "these", "hau", "that", "those", "hauek", "hori"];
  recordChange(852, c852.type, c852.prompt, "acceptedAnswers", oldAns, c852.acceptedAnswers, "Updated accepted answers to match 'those'");
}

// 2. ID 855 (MATCH, Lesson 86)
const c855 = challenges.find(c => c.id === 855);
if (c855) {
  const opt = c855.options.find(o => o.text === "that over there");
  if (opt) {
    recordChange(855, c855.type, c855.prompt, "options", opt.text, "that one", "Corrected demonstrative hura gloss from spatial adverb to demonstrative pronoun");
    opt.text = "that one";
  }
  const oldAns = [...c855.acceptedAnswers];
  c855.acceptedAnswers = ["hori", "these", "book", "hura", "liburu", "hauek", "that", "that one"];
  recordChange(855, c855.type, c855.prompt, "acceptedAnswers", oldAns, c855.acceptedAnswers, "Updated accepted answers to match 'that one'");
}

// 3. ID 861 (SELECT, Lesson 87)
const c861 = challenges.find(c => c.id === 861);
if (c861) {
  const opt = c861.options.find(o => o.correct);
  if (opt) {
    recordChange(861, c861.type, c861.prompt, "options", opt.text, "Those girls are students.", "Removed spatial 'over there' hallucination from copular identification sentence");
    opt.text = "Those girls are students.";
  }
  const oldAns = [...c861.acceptedAnswers];
  c861.acceptedAnswers = [
    "Those girls are students.",
    "Those girls are students?",
    "Those girls are students",
    "Those girls're students",
    "Those girls're students."
  ];
  recordChange(861, c861.type, c861.prompt, "acceptedAnswers", oldAns, c861.acceptedAnswers, "Updated accepted answers for copular sentence");
}

// 4. ID 862 (MATCH, Lesson 87)
const c862 = challenges.find(c => c.id === 862);
if (c862) {
  const opt = c862.options.find(o => o.text === "that over there");
  if (opt) {
    recordChange(862, c862.type, c862.prompt, "options", opt.text, "that one", "Corrected demonstrative hura gloss from spatial adverb to demonstrative pronoun");
    opt.text = "that one";
  }
  const oldAns = [...c862.acceptedAnswers];
  c862.acceptedAnswers = ["liburu", "that one", "hura", "hau", "these", "hauek", "book", "this"];
  recordChange(862, c862.type, c862.prompt, "acceptedAnswers", oldAns, c862.acceptedAnswers, "Updated accepted answers to match 'that one'");
}

// 5. ID 864 (SELECT, Lesson 87)
const c864 = challenges.find(c => c.id === 864);
if (c864) {
  const opt = c864.options.find(o => o.correct);
  if (opt) {
    recordChange(864, c864.type, c864.prompt, "options", opt.text, "Those girls are students.", "Removed spatial 'over there' hallucination from copular identification sentence");
    opt.text = "Those girls are students.";
  }
  const oldAns = [...c864.acceptedAnswers];
  c864.acceptedAnswers = [
    "Those girls are students.",
    "Those girls are students?",
    "Those girls are students",
    "Those girls're students",
    "Those girls're students."
  ];
  recordChange(864, c864.type, c864.prompt, "acceptedAnswers", oldAns, c864.acceptedAnswers, "Updated accepted answers for copular sentence");
}

// 6. ID 865 (MATCH, Lesson 87)
const c865 = challenges.find(c => c.id === 865);
if (c865) {
  const opt = c865.options.find(o => o.text === "that over there");
  if (opt) {
    recordChange(865, c865.type, c865.prompt, "options", opt.text, "that one", "Corrected demonstrative hura gloss from spatial adverb to demonstrative pronoun");
    opt.text = "that one";
  }
  const oldAns = [...c865.acceptedAnswers];
  c865.acceptedAnswers = ["eskola", "that one", "hori", "hura", "book", "school", "liburu", "that"];
  recordChange(865, c865.type, c865.prompt, "acceptedAnswers", oldAns, c865.acceptedAnswers, "Updated accepted answers to match 'that one'");
}

// 7. ID 868 (MATCH, Lesson 87)
const c868 = challenges.find(c => c.id === 868);
if (c868) {
  const opt = c868.options.find(o => o.text === "those over there, plural of hura");
  if (opt) {
    recordChange(868, c868.type, c868.prompt, "options", opt.text, "those", "Corrected demonstrative haiek gloss from spatial adverbial description to demonstrative pronoun");
    opt.text = "those";
  }
  const oldAns = [...c868.acceptedAnswers];
  c868.acceptedAnswers = ["these", "hori", "that", "liburu", "book", "haiek", "those", "hauek"];
  recordChange(868, c868.type, c868.prompt, "acceptedAnswers", oldAns, c868.acceptedAnswers, "Updated accepted answers to match 'those'");
}

// 8. ID 870 (SELECT, Lesson 87)
const c870 = challenges.find(c => c.id === 870);
if (c870) {
  const opt = c870.options.find(o => o.correct);
  if (opt) {
    recordChange(870, c870.type, c870.prompt, "options", opt.text, "Those hotels are green.", "Removed spatial 'over there' hallucination from copular identification sentence");
    opt.text = "Those hotels are green.";
  }
  const oldAns = [...c870.acceptedAnswers];
  c870.acceptedAnswers = [
    "Those hotels are green.",
    "Those hotels are green?",
    "Those hotels are green",
    "Those hotels're green",
    "Those hotels're green."
  ];
  recordChange(870, c870.type, c870.prompt, "acceptedAnswers", oldAns, c870.acceptedAnswers, "Updated accepted answers for copular sentence");
}

// 9. ID 877 (TRANSLATE, Lesson 88)
const c877 = challenges.find(c => c.id === 877);
if (c877) {
  const oldPrompt = c877.prompt;
  c877.prompt = "Those hotels were green, but now they are orange.";
  recordChange(877, c877.type, oldPrompt, "prompt", oldPrompt, c877.prompt, "Removed spatial 'over there' hallucination from English prompt");
}

// 10. ID 884 (TRANSLATE, Lesson 89)
const c884 = challenges.find(c => c.id === 884);
if (c884) {
  const oldPrompt = c884.prompt;
  c884.prompt = "Hura katu beltza da.";
  c884.audioText = "Hura katu beltza da.";
  recordChange(884, c884.type, oldPrompt, "prompt", oldPrompt, c884.prompt, "Fixed duplicated pronoun and removed 'over there' hallucination from copular sentence");

  const oldOptions = [...c884.options];
  c884.options = [
    { id: 5910, text: "That", correct: true, order: 1 },
    { id: 5913, text: "is", correct: true, order: 2 },
    { id: 5914, text: "a", correct: true, order: 3 },
    { id: 5915, text: "black", correct: true, order: 4 },
    { id: 5916, text: "cat", correct: true, order: 5 },
    { id: 5918, text: "dog", correct: false, order: 0 },
    { id: 5917, text: "house", correct: false, order: 0 },
    { id: 5911, text: "white", correct: false, order: 0 },
    { id: 5912, text: "one", correct: false, order: 0 }
  ];
  recordChange(884, c884.type, c884.prompt, "options", oldOptions, c884.options, "Updated word bank tokens to support 'That is a black cat' instead of existential 'over there'");

  const oldAns = [...c884.acceptedAnswers];
  const newPerms = generateCopularPermutations({
    subjectTypes: ["pronoun_3sg"],
    predicate: ["a black cat", "one black cat", "the black cat"]
  });
  newPerms.push(
    "That cat is black",
    "That cat is black.",
    "That cat is black?",
    "That cat's black",
    "That cat's black."
  );
  c884.acceptedAnswers = Array.from(new Set(newPerms));
  recordChange(884, c884.type, c884.prompt, "acceptedAnswers", oldAns, c884.acceptedAnswers, "Replaced existential accepted answers with copular permutations");
}

// 11. ID 893 (TRANSLATE, Lesson 90)
const c893 = challenges.find(c => c.id === 893);
if (c893) {
  const oldPrompt = c893.prompt;
  c893.prompt = "Those hotels were green, but now they are orange.";
  recordChange(893, c893.type, oldPrompt, "prompt", oldPrompt, c893.prompt, "Removed spatial 'over there' hallucination from English prompt");
}

// 12. ID 899 (TRANSLATE, Lesson 90)
const c899 = challenges.find(c => c.id === 899);
if (c899) {
  const oldPrompt = c899.prompt;
  c899.prompt = "Those hotels are green.";
  recordChange(899, c899.type, oldPrompt, "prompt", oldPrompt, c899.prompt, "Removed spatial 'over there' hallucination from English prompt");
}

// 13. ID 900 (TRANSLATE, Lesson 90)
const c900 = challenges.find(c => c.id === 900);
if (c900) {
  const oldPrompt = c900.prompt;
  c900.prompt = "Those hotels are green.";
  recordChange(900, c900.type, oldPrompt, "prompt", oldPrompt, c900.prompt, "Removed spatial 'over there' hallucination from English prompt");
}

// 14. ID 954 (SELECT, Lesson 96)
const c954 = challenges.find(c => c.id === 954);
if (c954) {
  const oldOptions = [...c954.options];
  c954.options = [
    { id: 6345, text: "those", correct: false },
    { id: 6344, text: "that", correct: false },
    { id: 6343, text: "book", correct: true }
  ];
  recordChange(954, c954.type, c954.prompt, "options", oldOptions, c954.options, "Cleaned distractor options from spatial over-there descriptions to demonstratives");
}

// 15. ID 955 (MATCH, Lesson 96)
const c955 = challenges.find(c => c.id === 955);
if (c955) {
  const opt = c955.options.find(o => o.text === "that over there");
  if (opt) {
    recordChange(955, c955.type, c955.prompt, "options", opt.text, "that", "Corrected demonstrative hura gloss from spatial adverb to demonstrative pronoun");
    opt.text = "that";
  }
  const oldAns = [...c955.acceptedAnswers];
  c955.acceptedAnswers = ["zure", "that", "eskola", "your", "hura", "school", "book", "liburu"];
  recordChange(955, c955.type, c955.prompt, "acceptedAnswers", oldAns, c955.acceptedAnswers, "Updated accepted answers to match 'that'");
}

// 16. ID 1196 (TRANSLATE, Lesson 120)
const c1196 = challenges.find(c => c.id === 1196);
if (c1196) {
  const oldOptions = [...c1196.options];
  c1196.options = [
    { id: 7804, text: "That", correct: true, order: 1 },
    { id: 7805, text: "book", correct: true, order: 2 },
    { id: 7808, text: "is", correct: true, order: 3 },
    { id: 7809, text: "theirs", correct: true, order: 4 },
    { id: 7806, text: "our", correct: false, order: 0 },
    { id: 7807, text: "mine", correct: false, order: 0 },
    { id: 7810, text: "house", correct: false, order: 0 },
    { id: 7811, text: "cat", correct: false, order: 0 },
    { id: 7812, text: "dog", correct: false, order: 0 }
  ];
  recordChange(1196, c1196.type, c1196.prompt, "options", oldOptions, c1196.options, "Removed spatial 'over' and 'there' word bank tokens and ordered words for 'That book is theirs'");

  const oldAns = [...c1196.acceptedAnswers];
  c1196.acceptedAnswers = [
    "That book is theirs",
    "That book is theirs.",
    "That book is theirs?",
    "That book's theirs",
    "That book's theirs.",
    "That is their book",
    "That is their book.",
    "That's their book",
    "That's their book.",
    "That one is their book",
    "That one is their book."
  ];
  recordChange(1196, c1196.type, c1196.prompt, "acceptedAnswers", oldAns, c1196.acceptedAnswers, "Replaced 'over there' translations with demonstrative copular translations");
}

// 17. ID 2934 (SELECT, Lesson 294)
const c2934 = challenges.find(c => c.id === 2934);
if (c2934) {
  const opt = c2934.options.find(o => o.correct);
  if (opt) {
    recordChange(2934, c2934.type, c2934.prompt, "options", opt.text, "Was somebody there?", "Corrected translation of 'hor' from 'over there' to 'there'");
    opt.text = "Was somebody there?";
  }
  const oldAns = [...c2934.acceptedAnswers];
  c2934.acceptedAnswers = ["Was somebody there?", "Was somebody there", "Was somebody there."];
  recordChange(2934, c2934.type, c2934.prompt, "acceptedAnswers", oldAns, c2934.acceptedAnswers, "Updated accepted answers for 'hor'");
}

// 18. Permutation expansions for copular identification sentences:
// ID 344 & ID 370 ("Hura autobus gidaria da.")
[344, 370].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    const oldAns = [...c.acceptedAnswers];
    const perms = generateCopularPermutations({
      subjectTypes: ["pronoun_3sg"],
      predicate: [
        "a bus driver",
        "the bus driver",
        "one bus driver"
      ]
    });
    // Ensure all existing valid answers are retained
    const merged = Array.from(new Set([...oldAns, ...perms]));
    c.acceptedAnswers = merged;
    recordChange(id, c.type, c.prompt, "acceptedAnswers", oldAns.slice(0, 4), c.acceptedAnswers.slice(0, 8), "Expanded copular identification permutations (a bus driver / the bus driver / one bus driver / that person / that one / he / she)");
  }
});

// ID 361 ("Hura polizia bat al da?")
const c361 = challenges.find(c => c.id === 361);
if (c361) {
  const oldAns = [...c361.acceptedAnswers];
  const perms = [
    "Is he a police officer",
    "Is he a police officer?",
    "Is he a police officer.",
    "Is she a police officer",
    "Is she a police officer?",
    "Is she a police officer.",
    "Is that person a police officer",
    "Is that person a police officer?",
    "Is that person a police officer.",
    "Is that one a police officer",
    "Is that one a police officer?",
    "Is that one a police officer.",
    "Is he one police officer",
    "Is he one police officer?",
    "Is she one police officer",
    "Is she one police officer?"
  ];
  c361.acceptedAnswers = Array.from(new Set([...oldAns, ...perms]));
  recordChange(361, c361.type, c361.prompt, "acceptedAnswers", oldAns.slice(0, 4), c361.acceptedAnswers.slice(0, 8), "Expanded copular question permutations");
}

// ID 919 ("Hura nire irakaslea da.")
const c919 = challenges.find(c => c.id === 919);
if (c919) {
  const oldAns = [...c919.acceptedAnswers];
  const perms = generateCopularPermutations({
    subjectTypes: ["pronoun_3sg"],
    predicate: ["my teacher"]
  });
  c919.acceptedAnswers = Array.from(new Set([...oldAns, ...perms]));
  recordChange(919, c919.type, c919.prompt, "acceptedAnswers", oldAns.slice(0, 4), c919.acceptedAnswers.slice(0, 8), "Expanded copular identity permutations for 'my teacher'");
}

// ID 927 ("Hura gure autobus gidaria da.")
const c927 = challenges.find(c => c.id === 927);
if (c927) {
  const oldAns = [...c927.acceptedAnswers];
  const perms = generateCopularPermutations({
    subjectTypes: ["pronoun_3sg"],
    predicate: ["our bus driver"]
  });
  c927.acceptedAnswers = Array.from(new Set([...oldAns, ...perms]));
  recordChange(927, c927.type, c927.prompt, "acceptedAnswers", oldAns.slice(0, 4), c927.acceptedAnswers.slice(0, 8), "Expanded copular identity permutations for 'our bus driver'");
}

// Write back to data/courses/1/challenges.json
fs.writeFileSync(challengesPath, JSON.stringify(challenges, null, 2), "utf8");
console.log(`Successfully updated ${challengesPath}`);

if (fs.existsSync(standalonePath)) {
  fs.writeFileSync(standalonePath, JSON.stringify(challenges, null, 2), "utf8");
  console.log(`Successfully updated ${standalonePath}`);
}

console.log(`Audit complete: ${auditLog.length} modifications logged.`);
fs.writeFileSync("scratch/audit_log.json", JSON.stringify(auditLog, null, 2), "utf8");
