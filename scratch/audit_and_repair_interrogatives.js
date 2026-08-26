const fs = require("fs");
const path = require("path");

const challengesPath = path.join(__dirname, "../data/courses/1/challenges.json");
const standalonePath = path.join(__dirname, "../.next/standalone/data/courses/1/challenges.json");
const unitsPath = path.join(__dirname, "../data/courses/1/units.json");
const standaloneUnitsPath = path.join(__dirname, "../.next/standalone/data/courses/1/units.json");
const translateChallengePath = path.join(__dirname, "../components/lesson/TranslateChallenge.tsx");

const challenges = JSON.parse(fs.readFileSync(challengesPath, "utf8"));
const units = JSON.parse(fs.readFileSync(unitsPath, "utf8"));

const auditLog = [];

function recordChange(id, lessonId, type, prompt, field, before, after, description) {
  auditLog.push({
    id,
    lessonId,
    type,
    prompt,
    field,
    before,
    after,
    description
  });
}

// Helper to generate accepted answer permutations for politeness + question
function generatePolitenessQuestionVariants({
  politenessPrefixes = ["Barkatu", "barkatu"],
  questionVariants, // array of strings, e.g. ["Nor da gidaria", "nor da gidaria"]
  isQuestion = true
}) {
  const results = new Set();
  const endPuncts = isQuestion ? ["?", "", "."] : [".", "", "?"];

  politenessPrefixes.forEach(prefix => {
    questionVariants.forEach(q => {
      // 1. Comma separated
      endPuncts.forEach(ep => {
        results.add(`${prefix}, ${q}${ep}`.trim());
      });
      // 2. Period separated
      const capitalizedQ = q.charAt(0).toUpperCase() + q.slice(1);
      const lowerQ = q.charAt(0).toLowerCase() + q.slice(1);
      endPuncts.forEach(ep => {
        results.add(`${prefix}. ${capitalizedQ}${ep}`.trim());
        results.add(`${prefix}. ${lowerQ}${ep}`.trim());
      });
      // 3. Space / no punctuation separated
      endPuncts.forEach(ep => {
        results.add(`${prefix} ${capitalizedQ}${ep}`.trim());
        results.add(`${prefix} ${lowerQ}${ep}`.trim());
      });
    });
  });

  return Array.from(results);
}

// -------------------------------------------------------------
// 1. PURGE OF tour gida IN CHALLENGES
// -------------------------------------------------------------

// ID 350 (TRANSLATE, Lesson 35)
const c350 = challenges.find(c => c.id === 350);
if (c350) {
  const oldAudio = c350.audioText;
  c350.audioText = "Arratsalde on. Ni turismo-gidaria naiz.";
  recordChange(350, c350.lessonId, c350.type, c350.prompt, "audioText", oldAudio, c350.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// ID 353 (TRANSLATE, Lesson 36) - "Excuse me. Who is the tour guide?"
const c353 = challenges.find(c => c.id === 353);
if (c353) {
  const oldAudio = c353.audioText;
  c353.audioText = "Barkatu. Nor da turismo-gidaria?";
  recordChange(353, c353.lessonId, c353.type, c353.prompt, "audioText", oldAudio, c353.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
  
  // Replace tiles: remove tour and gida, add turismo-gidaria
  const oldOptions = JSON.parse(JSON.stringify(c353.options));
  c353.options = [
    { id: 2131, text: "Barkatu", correct: true, order: 1 },
    { id: 2132, text: "Nor", correct: true, order: 2 },
    { id: 2133, text: "da", correct: true, order: 3 },
    { id: 2135, text: "turismo-gidaria", correct: true, order: 4 },
    { id: 2136, text: "erizain", correct: false, order: 0 },
    { id: 2137, text: "gidari", correct: false, order: 0 },
    { id: 2138, text: "mediku", correct: false, order: 0 }
  ];
  recordChange(353, c353.lessonId, c353.type, c353.prompt, "options", oldOptions, c353.options, "Updated word bank options with 'turismo-gidaria' and removed 'tour' / 'gida'");

  const oldAccepted = [...c353.acceptedAnswers];
  c353.acceptedAnswers = generatePolitenessQuestionVariants({
    politenessPrefixes: ["Barkatu", "barkatu"],
    questionVariants: [
      "Nor da turismo-gidaria",
      "nor da turismo-gidaria",
      "Nor da turismo gidaria",
      "nor da turismo gidaria",
      "Nor da gidari turistikoa",
      "nor da gidari turistikoa"
    ],
    isQuestion: true
  });
  recordChange(353, c353.lessonId, c353.type, c353.prompt, "acceptedAnswers", oldAccepted, c353.acceptedAnswers, "Updated accepted answers with Galdegaia verb adjacency, definite article -a, and politeness permutations");
}

// ID 358 (LISTEN, Lesson 36)
const c358 = challenges.find(c => c.id === 358);
if (c358) {
  const oldAudio = c358.audioText;
  c358.audioText = "Arratsalde on. Ni turismo-gidaria naiz.";
  recordChange(358, c358.lessonId, c358.type, c358.prompt, "audioText", oldAudio, c358.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// ID 363 (TRANSLATE, Lesson 37) - "Excuse me. Who is the tour guide?"
const c363 = challenges.find(c => c.id === 363);
if (c363) {
  const oldAudio = c363.audioText;
  c363.audioText = "Barkatu. Nor da turismo-gidaria?";
  recordChange(363, c363.lessonId, c363.type, c363.prompt, "audioText", oldAudio, c363.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
  
  const oldOptions = JSON.parse(JSON.stringify(c363.options));
  c363.options = [
    { id: 2189, text: "Barkatu", correct: true, order: 1 },
    { id: 2190, text: "Nor", correct: true, order: 2 },
    { id: 2191, text: "da", correct: true, order: 3 },
    { id: 2193, text: "turismo-gidaria", correct: true, order: 4 },
    { id: 2194, text: "erizain", correct: false, order: 0 },
    { id: 2195, text: "gidari", correct: false, order: 0 },
    { id: 2196, text: "mediku", correct: false, order: 0 }
  ];
  recordChange(363, c363.lessonId, c363.type, c363.prompt, "options", oldOptions, c363.options, "Updated word bank options with 'turismo-gidaria'");

  const oldAccepted = [...c363.acceptedAnswers];
  c363.acceptedAnswers = generatePolitenessQuestionVariants({
    politenessPrefixes: ["Barkatu", "barkatu"],
    questionVariants: [
      "Nor da turismo-gidaria",
      "nor da turismo-gidaria",
      "Nor da turismo gidaria",
      "nor da turismo gidaria",
      "Nor da gidari turistikoa",
      "nor da gidari turistikoa"
    ],
    isQuestion: true
  });
  recordChange(363, c363.lessonId, c363.type, c363.prompt, "acceptedAnswers", oldAccepted, c363.acceptedAnswers, "Updated accepted answers with Galdegaia verb adjacency, definite article -a, and politeness permutations");
}

// ID 369 (TRANSLATE, Lesson 37) - "Excuse me. Who is the tour guide?"
const c369 = challenges.find(c => c.id === 369);
if (c369) {
  const oldAudio = c369.audioText;
  c369.audioText = "Barkatu. Nor da turismo-gidaria?";
  recordChange(369, c369.lessonId, c369.type, c369.prompt, "audioText", oldAudio, c369.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");

  const oldOptions = JSON.parse(JSON.stringify(c369.options));
  c369.options = [
    { id: 2224, text: "Barkatu", correct: true, order: 1 },
    { id: 2225, text: "Nor", correct: true, order: 2 },
    { id: 2226, text: "da", correct: true, order: 3 },
    { id: 2228, text: "turismo-gidaria", correct: true, order: 4 },
    { id: 2229, text: "erizain", correct: false, order: 0 },
    { id: 2230, text: "gidari", correct: false, order: 0 },
    { id: 2231, text: "mediku", correct: false, order: 0 }
  ];
  recordChange(369, c369.lessonId, c369.type, c369.prompt, "options", oldOptions, c369.options, "Updated word bank options with 'turismo-gidaria'");

  const oldAccepted = [...c369.acceptedAnswers];
  c369.acceptedAnswers = generatePolitenessQuestionVariants({
    politenessPrefixes: ["Barkatu", "barkatu"],
    questionVariants: [
      "Nor da turismo-gidaria",
      "nor da turismo-gidaria",
      "Nor da turismo gidaria",
      "nor da turismo gidaria",
      "Nor da gidari turistikoa",
      "nor da gidari turistikoa"
    ],
    isQuestion: true
  });
  recordChange(369, c369.lessonId, c369.type, c369.prompt, "acceptedAnswers", oldAccepted, c369.acceptedAnswers, "Updated accepted answers with Galdegaia verb adjacency, definite article -a, and politeness permutations");
}

// ID 376 (TRANSLATE, Lesson 38)
const c376 = challenges.find(c => c.id === 376);
if (c376) {
  const oldAudio = c376.audioText;
  c376.audioText = "Hura polizia zen, baina orain turismo-gidaria da.";
  recordChange(376, c376.lessonId, c376.type, c376.prompt, "audioText", oldAudio, c376.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// ID 411 (TRANSLATE, Lesson 42)
const c411 = challenges.find(c => c.id === 411);
if (c411) {
  const oldAudio = c411.audioText;
  c411.audioText = "Hura polizia zen, baina orain turismo-gidaria da.";
  recordChange(411, c411.lessonId, c411.type, c411.prompt, "audioText", oldAudio, c411.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// ID 412 (LISTEN, Lesson 42)
const c412 = challenges.find(c => c.id === 412);
if (c412) {
  const oldAudio = c412.audioText;
  c412.audioText = "Ni turista nintzen, baina orain turismo-gidaria naiz.";
  recordChange(412, c412.lessonId, c412.type, c412.prompt, "audioText", oldAudio, c412.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// ID 413 (TRANSLATE, Lesson 42)
const c413 = challenges.find(c => c.id === 413);
if (c413) {
  const oldAudio = c413.audioText;
  c413.audioText = "Ni turista nintzen, baina orain turismo-gidaria naiz.";
  recordChange(413, c413.lessonId, c413.type, c413.prompt, "audioText", oldAudio, c413.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// ID 480 (TRANSLATE, Lesson 48)
const c480 = challenges.find(c => c.id === 480);
if (c480) {
  const oldAudio = c480.audioText;
  c480.audioText = "Ni turista nintzen, baina orain turismo-gidaria naiz.";
  recordChange(480, c480.lessonId, c480.type, c480.prompt, "audioText", oldAudio, c480.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// ID 641 (SELECT, Lesson 65)
const c641 = challenges.find(c => c.id === 641);
if (c641) {
  const oldAudio = c641.audioText;
  c641.audioText = "Turismo-gidaria polita da, baina turista ederra da.";
  recordChange(641, c641.lessonId, c641.type, c641.prompt, "audioText", oldAudio, c641.audioText, "Purged 'tour gida' from audioText to 'Turismo-gidaria'");
}

// ID 643 (TRANSLATE, Lesson 65)
const c643 = challenges.find(c => c.id === 643);
if (c643) {
  const oldAudio = c643.audioText;
  c643.audioText = "Turismo-gidaria polita da, baina turista ederra da.";
  recordChange(643, c643.lessonId, c643.type, c643.prompt, "audioText", oldAudio, c643.audioText, "Purged 'tour gida' from audioText to 'Turismo-gidaria'");
}

// ID 656 (TRANSLATE, Lesson 66)
const c656 = challenges.find(c => c.id === 656);
if (c656) {
  const oldAudio = c656.audioText;
  c656.audioText = "Turismo-gidaria polita da, baina turista ederra da.";
  recordChange(656, c656.lessonId, c656.type, c656.prompt, "audioText", oldAudio, c656.audioText, "Purged 'tour gida' from audioText to 'Turismo-gidaria'");

  // Fix options: disable "gida" as correct, ensure proper options
  const optGida = c656.options.find(o => o.text === "gida");
  if (optGida) {
    optGida.correct = false;
    optGida.order = 0;
  }
  const oldAccepted = [...c656.acceptedAnswers];
  c656.acceptedAnswers = [
    "Turismo-gidaria polita da, baina turista ederra da.",
    "Turismo-gidaria polita da, baina turista ederra da",
    "Turismo-gidaria polita da baina turista ederra da.",
    "Turismo-gidaria polita da baina turista ederra da",
    "Turismo-gidaria polita da. Baina turista ederra da.",
    "Turismo-gidaria polita da. Baina turista ederra da",
    "Turismo gidaria polita da, baina turista ederra da.",
    "Turismo gidaria polita da, baina turista ederra da",
    "Turismo gidaria polita da baina turista ederra da.",
    "Turismo gidaria polita da baina turista ederra da",
    "Gidari turistikoa polita da, baina turista ederra da.",
    "Gidari turistikoa polita da, baina turista ederra da",
    "Gidari turistikoa polita da baina turista ederra da.",
    "Gidari turistikoa polita da baina turista ederra da",
    "turismo-gidaria polita da, baina turista ederra da.",
    "turismo-gidaria polita da, baina turista ederra da",
    "turismo-gidaria polita da baina turista ederra da.",
    "turismo-gidaria polita da baina turista ederra da"
  ];
  recordChange(656, c656.lessonId, c656.type, c656.prompt, "acceptedAnswers", oldAccepted.slice(0, 5), c656.acceptedAnswers, "Purged all 'tour da gida' / calque permutations from accepted answers");
}

// ID 675 (LISTEN, Lesson 68)
const c675 = challenges.find(c => c.id === 675);
if (c675) {
  const oldAudio = c675.audioText;
  c675.audioText = "Turismo-gidaria polita da, baina turista ederra da.";
  recordChange(675, c675.lessonId, c675.type, c675.prompt, "audioText", oldAudio, c675.audioText, "Purged 'tour gida' from audioText to 'Turismo-gidaria'");
}

// ID 1692 (LISTEN, Lesson 170)
const c1692 = challenges.find(c => c.id === 1692);
if (c1692) {
  const oldAudio = c1692.audioText;
  c1692.audioText = "Haien ama turismo-gidaria da.";
  recordChange(1692, c1692.lessonId, c1692.type, c1692.prompt, "audioText", oldAudio, c1692.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// ID 1740 (TRANSLATE, Lesson 174)
const c1740 = challenges.find(c => c.id === 1740);
if (c1740) {
  const oldAudio = c1740.audioText;
  c1740.audioText = "Bere senarra turismo-gidaria da.";
  recordChange(1740, c1740.lessonId, c1740.type, c1740.prompt, "audioText", oldAudio, c1740.audioText, "Purged 'tour gida' from audioText to 'turismo-gidaria'");
}

// -------------------------------------------------------------
// 2. IDENTIFICATION QUESTIONS: "Excuse me. Who is the driver?" (IDs 343, 357, 368, 340)
// -------------------------------------------------------------
const driverChallenges = [343, 357];
driverChallenges.forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    const oldAccepted = [...c.acceptedAnswers];
    c.acceptedAnswers = generatePolitenessQuestionVariants({
      politenessPrefixes: ["Barkatu", "barkatu"],
      questionVariants: [
        "Nor da gidaria",
        "nor da gidaria"
      ],
      isQuestion: true
    });
    recordChange(id, c.lessonId, c.type, c.prompt, "acceptedAnswers", oldAccepted, c.acceptedAnswers, "Enforced Galdegaia adjacency (Nor da gidaria), definite article -a, and purged 'Nor gidaria da'");
  }
});

// ID 368 (LISTEN, Lesson 37)
const c368 = challenges.find(c => c.id === 368);
if (c368) {
  const oldAccepted = [...c368.acceptedAnswers];
  c368.acceptedAnswers = [
    "Barkatu. Nor da gidaria?",
    "Barkatu. Nor da gidaria",
    "Barkatu, nor da gidaria?",
    "Barkatu, nor da gidaria",
    "Barkatu nor da gidaria?",
    "Barkatu nor da gidaria",
    "Barkatu. Nor da gidaria."
  ];
  recordChange(368, c368.lessonId, c368.type, c368.prompt, "acceptedAnswers", oldAccepted, c368.acceptedAnswers, "Updated accepted answers with politeness variations for LISTEN challenge");
}

// -------------------------------------------------------------
// 3. ID 181, 201: "Excuse me. Who are you?" -> "Barkatu. Nor zara zu?"
// -------------------------------------------------------------
[181, 201].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    const oldAccepted = [...c.acceptedAnswers];
    c.acceptedAnswers = generatePolitenessQuestionVariants({
      politenessPrefixes: ["Barkatu", "barkatu"],
      questionVariants: [
        "Nor zara zu",
        "nor zara zu",
        "Nor zara",
        "nor zara"
      ],
      isQuestion: true
    });
    recordChange(id, c.lessonId, c.type, c.prompt, "acceptedAnswers", oldAccepted, c.acceptedAnswers, "Enforced Galdegaia adjacency (Nor zara zu) and politeness variants");
  }
});

// -------------------------------------------------------------
// 4. ID 1352, 1367: "Excuse me. Where am I?" -> "Barkatu. Non nago ni?" / "Barkatu, non nago?"
// -------------------------------------------------------------
const c1352 = challenges.find(c => c.id === 1352);
if (c1352) {
  const opt = c1352.options.find(o => o.text.includes("Ni on nago"));
  if (opt) {
    recordChange(1352, c1352.lessonId, c1352.type, c1352.prompt, "options", opt.text, "Barkatu. Non nago ni?", "Fixed typo 'Ni on nago' to 'Non nago ni' in options");
    opt.text = "Barkatu. Non nago ni?";
  }
}

const c1367 = challenges.find(c => c.id === 1367);
if (c1367) {
  const oldAudio = c1367.audioText;
  c1367.audioText = "Barkatu. Non nago ni?";
  recordChange(1367, c1367.lessonId, c1367.type, c1367.prompt, "audioText", oldAudio, c1367.audioText, "Fixed typo 'Ni on nago' to 'Non nago ni'");

  // Fix options
  const optOn = c1367.options.find(o => o.text === "on");
  if (optOn) {
    optOn.text = "Non";
    optOn.order = 2;
  }
  const optNi = c1367.options.find(o => o.text === "Ni");
  if (optNi) {
    optNi.order = 4;
  }
  const optNago = c1367.options.find(o => o.text === "nago");
  if (optNago) {
    optNago.order = 3;
  }
  const optBarkatu = c1367.options.find(o => o.text === "Barkatu");
  if (optBarkatu) {
    optBarkatu.order = 1;
  }

  const oldAccepted = [...c1367.acceptedAnswers];
  c1367.acceptedAnswers = generatePolitenessQuestionVariants({
    politenessPrefixes: ["Barkatu", "barkatu"],
    questionVariants: [
      "Non nago ni",
      "non nago ni",
      "Non nago",
      "non nago"
    ],
    isQuestion: true
  });
  recordChange(1367, c1367.lessonId, c1367.type, c1367.prompt, "acceptedAnswers", oldAccepted, c1367.acceptedAnswers, "Updated accepted answers with 'Non nago' and politeness permutations");
}

// -------------------------------------------------------------
// 5. PLURAL IDENTIFICATION QUESTIONS (Lessons 28-31)
// -------------------------------------------------------------

// ID 277 (SELECT, Lesson 28)
const c277 = challenges.find(c => c.id === 277);
if (c277) {
  c277.prompt = "Nortzuk dira emakumeak?";
  c277.audioText = "Nortzuk dira emakumeak?";
  c277.question = 'Select the correct translation for "Nortzuk dira emakumeak?":';
  recordChange(277, c277.lessonId, c277.type, c277.prompt, "prompt/audioText", "Nortzuk emakumeak dira?", "Nortzuk dira emakumeak?", "Enforced Galdegaia verb adjacency (Nortzuk dira emakumeak)");
}

// ID 279 (SELECT, Lesson 28)
const c279 = challenges.find(c => c.id === 279);
if (c279) {
  c279.prompt = "Nortzuk dira gizonak?";
  c279.audioText = "Nortzuk dira gizonak?";
  c279.question = 'Select the correct translation for "Nortzuk dira gizonak?":';
  recordChange(279, c279.lessonId, c279.type, c279.prompt, "prompt/audioText", "Nortzuk gizonak dira?", "Nortzuk dira gizonak?", "Enforced Galdegaia verb adjacency (Nortzuk dira gizonak)");
}

// ID 282 (LISTEN, Lesson 29)
const c282 = challenges.find(c => c.id === 282);
if (c282) {
  c282.audioText = "Nortzuk dira emakumeak?";
  c282.acceptedAnswers = ["Nortzuk dira emakumeak?", "Nortzuk dira emakumeak", "Nortzuk dira emakumeak."];
  recordChange(282, c282.lessonId, c282.type, c282.prompt, "audioText/accepted", "Nortzuk emakumeak dira?", "Nortzuk dira emakumeak?", "Enforced Galdegaia verb adjacency");
}

// ID 283 (TRANSLATE, Lesson 29)
const c283 = challenges.find(c => c.id === 283);
if (c283) {
  c283.prompt = "Nortzuk dira irakasleak?";
  c283.audioText = "Nortzuk dira irakasleak?";
  recordChange(283, c283.lessonId, c283.type, c283.prompt, "prompt/audioText", "Nortzuk irakasleak dira?", "Nortzuk dira irakasleak?", "Enforced Galdegaia verb adjacency");
}

// ID 284 (TRANSLATE, Lesson 29)
const c284 = challenges.find(c => c.id === 284);
if (c284) {
  c284.prompt = "Nortzuk dira irakasleak?";
  c284.audioText = "Nortzuk dira irakasleak?";
  recordChange(284, c284.lessonId, c284.type, c284.prompt, "prompt/audioText", "Nortzuk irakasleak dira?", "Nortzuk dira irakasleak?", "Enforced Galdegaia verb adjacency");
}

// ID 288 (LISTEN, Lesson 29)
const c288 = challenges.find(c => c.id === 288);
if (c288) {
  c288.audioText = "Hura autobusa al da?";
  c288.acceptedAnswers = ["Hura autobusa al da?", "Hura autobusa al da", "Hura autobusa al da."];
  recordChange(288, c288.lessonId, c288.type, c288.prompt, "audioText/accepted", "Hura al autobusa da?", "Hura autobusa al da?", "Enforced polar particle 'al' adjacency before finite verb");
}

// ID 296 (TRANSLATE, Lesson 30)
const c296 = challenges.find(c => c.id === 296);
if (c296) {
  c296.prompt = "Nortzuk dira emakumeak?";
  c296.audioText = "Nortzuk dira emakumeak?";
  recordChange(296, c296.lessonId, c296.type, c296.prompt, "prompt/audioText", "Nortzuk emakumeak dira?", "Nortzuk dira emakumeak?", "Enforced Galdegaia verb adjacency");
}

// ID 297 (TRANSLATE, Lesson 30)
const c297 = challenges.find(c => c.id === 297);
if (c297) {
  c297.prompt = "Nortzuk dira irakasleak?";
  c297.audioText = "Nortzuk dira irakasleak?";
  recordChange(297, c297.lessonId, c297.type, c297.prompt, "prompt/audioText", "Nortzuk irakasleak dira?", "Nortzuk dira irakasleak?", "Enforced Galdegaia verb adjacency");
}

// ID 305 (LISTEN, Lesson 31)
const c305 = challenges.find(c => c.id === 305);
if (c305) {
  c305.audioText = "Hura autobusa al da?";
  c305.acceptedAnswers = ["Hura autobusa al da?", "Hura autobusa al da", "Hura autobusa al da."];
  recordChange(305, c305.lessonId, c305.type, c305.prompt, "audioText/accepted", "Hura al autobusa da?", "Hura autobusa al da?", "Enforced polar particle 'al' adjacency before finite verb");
}

// -------------------------------------------------------------
// 6. WH QUESTIONS IN LESSONS 220-228 (Noiz / Non)
// -------------------------------------------------------------

// ID 2191 (SELECT, Lesson 220)
const c2191 = challenges.find(c => c.id === 2191);
if (c2191) {
  c2191.prompt = "Noiz etorri zinen elizatik atzo?";
  c2191.audioText = "Noiz etorri zinen elizatik atzo?";
  c2191.question = 'Select the correct translation for "Noiz etorri zinen elizatik atzo?":';
  recordChange(2191, c2191.lessonId, c2191.type, c2191.prompt, "prompt/audioText", "Noiz zu etorri zinen...", "Noiz etorri zinen elizatik atzo?", "Enforced Galdegaia verb adjacency");
}

// ID 2201 (TRANSLATE, Lesson 221)
const c2201 = challenges.find(c => c.id === 2201);
if (c2201) {
  c2201.prompt = "Noiz poztu zineten zuek?";
  c2201.audioText = "Noiz poztu zineten zuek?";
  recordChange(2201, c2201.lessonId, c2201.type, c2201.prompt, "prompt/audioText", "Noiz zuek poztu zineten.", "Noiz poztu zineten zuek?", "Enforced Galdegaia verb adjacency");
}

// ID 2218 (LISTEN, Lesson 222)
const c2218 = challenges.find(c => c.id === 2218);
if (c2218) {
  c2218.audioText = "Noiz etorri zinen elizatik atzo?";
  c2218.acceptedAnswers = ["Noiz etorri zinen elizatik atzo?", "Noiz etorri zinen elizatik atzo", "Noiz etorri zinen elizatik atzo."];
  recordChange(2218, c2218.lessonId, c2218.type, c2218.prompt, "audioText/accepted", "Noiz zu etorri zinen...", "Noiz etorri zinen elizatik atzo?", "Enforced Galdegaia verb adjacency");
}

// ID 2227 (TRANSLATE, Lesson 223)
const c2227 = challenges.find(c => c.id === 2227);
if (c2227) {
  c2227.prompt = "When did you all rejoice?";
  c2227.audioText = "Noiz poztu zineten zuek?";
  const optNoiz = c2227.options.find(o => o.text === "Noiz"); if (optNoiz) optNoiz.order = 1;
  const optPoztu = c2227.options.find(o => o.text === "poztu"); if (optPoztu) optPoztu.order = 2;
  const optZineten = c2227.options.find(o => o.text === "zineten"); if (optZineten) optZineten.order = 3;
  const optZuek = c2227.options.find(o => o.text === "zuek"); if (optZuek) optZuek.order = 4;
  c2227.acceptedAnswers = [
    "Noiz poztu zineten zuek",
    "Noiz poztu zineten zuek?",
    "Noiz poztu zineten",
    "Noiz poztu zineten?",
    "noiz poztu zineten zuek",
    "noiz poztu zineten zuek?",
    "noiz poztu zineten",
    "noiz poztu zineten?"
  ];
  recordChange(2227, c2227.lessonId, c2227.type, c2227.prompt, "audioText/accepted", "Noiz zuek poztu zineten", "Noiz poztu zineten zuek", "Enforced Galdegaia verb adjacency");
}

// ID 2228 (LISTEN, Lesson 223)
const c2228 = challenges.find(c => c.id === 2228);
if (c2228) {
  c2228.audioText = "Noiz poztu zineten zuek?";
  c2228.acceptedAnswers = ["Noiz poztu zineten zuek?", "Noiz poztu zineten zuek", "Noiz poztu zineten zuek."];
  recordChange(2228, c2228.lessonId, c2228.type, c2228.prompt, "audioText/accepted", "Noiz zuek poztu zineten.", "Noiz poztu zineten zuek?", "Enforced Galdegaia verb adjacency");
}

// ID 2239, 2250, 2256, 2261, 2263: "Noiz etzaten da ohi?"
[2239, 2250, 2256, 2261, 2263].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Noiz hura etzaten da ohi")) {
      c.prompt = "Noiz etzaten da ohi?";
      if (c.question && c.question.includes("Noiz hura etzaten da ohi")) {
        c.question = 'Select the correct translation for "Noiz etzaten da ohi?":';
      }
    }
    c.audioText = "Noiz etzaten da ohi?";
    if (c.options && c.type === "TRANSLATE" && c.question.includes("into Basque")) {
      const optNoiz = c.options.find(o => o.text === "Noiz"); if (optNoiz) optNoiz.order = 1;
      const optEtzaten = c.options.find(o => o.text === "etzaten"); if (optEtzaten) optEtzaten.order = 2;
      const optDa = c.options.find(o => o.text === "da"); if (optDa) optDa.order = 3;
      const optOhi = c.options.find(o => o.text === "ohi"); if (optOhi) optOhi.order = 4;
      const optHura = c.options.find(o => o.text === "hura"); if (optHura) optHura.correct = false;
      c.acceptedAnswers = [
        "Noiz etzaten da ohi",
        "Noiz etzaten da ohi?",
        "Noiz etzaten da ohi hura",
        "Noiz etzaten da ohi hura?",
        "Noiz ohi da etzaten",
        "Noiz ohi da etzaten?",
        "noiz etzaten da ohi",
        "noiz etzaten da ohi?"
      ];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText/accepted", "Noiz hura etzaten da ohi?", "Noiz etzaten da ohi?", "Enforced Galdegaia verb adjacency");
  }
});

// ID 2251, 2262, 2264, 2266, 2275: "Non geratzen dira ohi?" / "Non geratu dira ohi?"
[2251, 2262, 2264, 2266, 2275].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Non haiek ohi geratu dira")) {
      c.prompt = "Non geratu dira ohi?";
    }
    c.audioText = "Non geratu dira ohi?";
    if (c.type === "LISTEN") {
      c.acceptedAnswers = ["Non geratu dira ohi?", "Non geratu dira ohi", "Non geratu dira ohi."];
    }
    if (c.options && c.type === "TRANSLATE" && c.question.includes("into Basque")) {
      const optNon = c.options.find(o => o.text === "Non"); if (optNon) optNon.order = 1;
      const optGeratu = c.options.find(o => o.text === "geratu"); if (optGeratu) optGeratu.order = 2;
      const optDira = c.options.find(o => o.text === "dira"); if (optDira) optDira.order = 3;
      const optOhi = c.options.find(o => o.text === "ohi"); if (optOhi) optOhi.order = 4;
      const optHaiek = c.options.find(o => o.text === "haiek"); if (optHaiek) optHaiek.correct = false;
      c.acceptedAnswers = [
        "Non geratu dira ohi",
        "Non geratu dira ohi?",
        "Non geratu dira ohi haiek",
        "Non geratu dira ohi haiek?",
        "Non geratzen dira ohi",
        "Non geratzen dira ohi?",
        "non geratu dira ohi",
        "non geratu dira ohi?"
      ];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText/accepted", "Non haiek ohi geratu dira?", "Non geratu dira ohi?", "Enforced Galdegaia verb adjacency");
  }
});

// -------------------------------------------------------------
// 7. ADVERBIAL WH QUESTIONS (Lessons 323, 332, 333, 353-355)
// -------------------------------------------------------------

// ID 3226 (TRANSLATE, Lesson 323)
const c3226 = challenges.find(c => c.id === 3226);
if (c3226) {
  c3226.audioText = "Nola dago txerria? Txerria nekatuta dago.";
  const optNola = c3226.options.find(o => o.text === "Nola"); if (optNola) optNola.order = 1;
  const optDago1 = c3226.options.find(o => o.text === "dago" && o.correct); if (optDago1) optDago1.order = 2;
  const optTxerria1 = c3226.options.find(o => o.text === "txerria" && o.correct); if (optTxerria1) optTxerria1.order = 3;
  const optTxerria2 = c3226.options.find(o => o.text === "Txerria"); if (optTxerria2) optTxerria2.order = 4;
  const optNekatu = c3226.options.find(o => o.text === "nekatu"); if (optNekatu) optNekatu.order = 5;
  c3226.acceptedAnswers = [
    "Nola dago txerria Txerria nekatu dago",
    "Nola dago txerria. Txerria nekatu dago.",
    "Nola dago txerria? Txerria nekatu dago.",
    "Nola dago txerria? Txerria nekatuta dago.",
    "Nola dago txerria Txerria nekatuta dago",
    "Nola dago txerria? Txerria nekatuta dago",
    "Nola dago txerria. Txerria nekatuta dago.",
    "Nola dago txerria. Txerria nekatuta dago",
    "nola dago txerria? Txerria nekatuta dago."
  ];
  recordChange(3226, c3226.lessonId, c3226.type, c3226.prompt, "audioText/accepted", "Nola txerria dago...", "Nola dago txerria? Txerria nekatuta dago.", "Enforced Galdegaia verb adjacency (Nola dago txerria)");
}

// ID 3314, 3322: "Zergatik dago hura triste?"
[3314, 3322].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Zergatik hura dago triste")) {
      c.prompt = "Zergatik dago hura triste?";
    }
    c.audioText = "Zergatik dago hura triste?";
    if (c.type === "LISTEN") {
      c.acceptedAnswers = ["Zergatik dago hura triste?", "Zergatik dago hura triste", "Zergatik dago hura triste."];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText", "Zergatik hura dago triste?", "Zergatik dago hura triste?", "Enforced Galdegaia verb adjacency (Zergatik dago hura triste)");
  }
});

// ID 3521, 3550: "Nola dago eguraldia gaur?"
[3521, 3550].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    c.prompt = "Nola dago eguraldia gaur?";
    c.audioText = "Nola dago eguraldia gaur?";
    if (c.question && c.question.includes("Select the correct translation")) {
      c.question = 'Select the correct translation for "Nola dago eguraldia gaur?":';
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText", "Nola eguraldia dago gaur?", "Nola dago eguraldia gaur?", "Enforced Galdegaia verb adjacency");
  }
});

// ID 3540: "Nola zegoen eguraldia atzo?"
const c3540 = challenges.find(c => c.id === 3540);
if (c3540) {
  c3540.prompt = "Nola zegoen eguraldia atzo?";
  c3540.audioText = "Nola zegoen eguraldia atzo?";
  recordChange(3540, c3540.lessonId, c3540.type, c3540.prompt, "prompt/audioText", "Nola eguraldia zegoen atzo?", "Nola zegoen eguraldia atzo?", "Enforced Galdegaia verb adjacency");
}

// -------------------------------------------------------------
// 8. CONTINUOUS & COMITATIVE / INSTRUMENTAL WH QUESTIONS (Lessons 663-681, 746, 748)
// -------------------------------------------------------------

// IDs 6630, 6632, 6633, 6638: "Zergatik ari dira gidariak ibiltzen?" / "Zergatik ibiltzen ari dira gidariak?"
[6630, 6632, 6633, 6638].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Zergatik gidariak ibiltzen ari dira")) {
      c.prompt = "Zergatik ibiltzen ari dira gidariak?";
    }
    c.audioText = "Zergatik ibiltzen ari dira gidariak?";
    if (c.type === "LISTEN") {
      c.acceptedAnswers = ["Zergatik ibiltzen ari dira gidariak?", "Zergatik ibiltzen ari dira gidariak", "Zergatik ibiltzen ari dira gidariak."];
    }
    if (c.type === "TRANSLATE" && c.question.includes("into Basque")) {
      const optZerg = c.options.find(o => o.text === "Zergatik"); if (optZerg) optZerg.order = 1;
      const optIb = c.options.find(o => o.text === "ibiltzen"); if (optIb) optIb.order = 2;
      const optAri = c.options.find(o => o.text === "ari"); if (optAri) optAri.order = 3;
      const optDira = c.options.find(o => o.text === "dira"); if (optDira) optDira.order = 4;
      const optGid = c.options.find(o => o.text === "gidariak"); if (optGid) optGid.order = 5;
      c.acceptedAnswers = [
        "Zergatik ibiltzen ari dira gidariak",
        "Zergatik ibiltzen ari dira gidariak?",
        "Zergatik ari dira gidariak ibiltzen",
        "Zergatik ari dira gidariak ibiltzen?",
        "Zergatik ari dira ibiltzen gidariak",
        "Zergatik ari dira ibiltzen gidariak?",
        "zergatik ibiltzen ari dira gidariak",
        "zergatik ari dira gidariak ibiltzen"
      ];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText/accepted", "Zergatik gidariak ibiltzen ari dira?", "Zergatik ibiltzen ari dira gidariak?", "Enforced Galdegaia verb adjacency");
  }
});

// IDs 6670, 6678, 6681: "Zer ari zarete egiten?" / "Zer egiten ari zarete?"
[6670, 6678, 6681].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Zer zuek egiten ari zarete")) {
      c.prompt = "Zer egiten ari zarete?";
      if (c.question && c.question.includes("Select the correct translation")) {
        c.question = 'Select the correct translation for "Zer egiten ari zarete?":';
      }
    }
    c.audioText = "Zer egiten ari zarete?";
    if (c.type === "LISTEN") {
      c.acceptedAnswers = ["Zer egiten ari zarete?", "Zer egiten ari zarete", "Zer egiten ari zarete."];
    }
    if (c.type === "TRANSLATE" && c.question.includes("into Basque")) {
      const optZer = c.options.find(o => o.text === "Zer"); if (optZer) optZer.order = 1;
      const optEg = c.options.find(o => o.text === "egiten"); if (optEg) optEg.order = 2;
      const optAri = c.options.find(o => o.text === "ari"); if (optAri) optAri.order = 3;
      const optZar = c.options.find(o => o.text === "zarete"); if (optZar) optZar.order = 4;
      const optZuek = c.options.find(o => o.text === "zuek"); if (optZuek) optZuek.correct = false;
      c.acceptedAnswers = [
        "Zer egiten ari zarete",
        "Zer egiten ari zarete?",
        "Zer ari zarete egiten",
        "Zer ari zarete egiten?",
        "Zer egiten ari zarete zuek",
        "Zer egiten ari zarete zuek?",
        "Zer ari zarete egiten zuek",
        "Zer ari zarete egiten zuek?",
        "zer egiten ari zarete",
        "zer ari zarete egiten"
      ];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText/accepted", "Zer zuek egiten ari zarete?", "Zer egiten ari zarete?", "Enforced Galdegaia verb adjacency");
  }
});

// IDs 6671, 6689: "Zer ari zara idazten?" / "Zer idazten ari zara?"
[6671, 6689].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    c.prompt = "Zer idazten ari zara?";
    c.audioText = "Zer idazten ari zara?";
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText", "Zer zu ari zara idazten?", "Zer idazten ari zara?", "Enforced Galdegaia verb adjacency");
  }
});

// IDs 6672, 6691: "Zer ari zara jolasten?" / "Zer jolasten ari zara?"
[6672, 6691].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    c.audioText = "Zer jolasten ari zara?";
    if (c.type === "LISTEN") {
      c.acceptedAnswers = ["Zer jolasten ari zara?", "Zer jolasten ari zara", "Zer jolasten ari zara."];
    }
    if (c.type === "TRANSLATE" && c.question.includes("into Basque")) {
      const optZer = c.options.find(o => o.text === "Zer"); if (optZer) optZer.order = 1;
      const optJol = c.options.find(o => o.text === "jolasten"); if (optJol) optJol.order = 2;
      const optAri = c.options.find(o => o.text === "ari"); if (optAri) optAri.order = 3;
      const optZara = c.options.find(o => o.text === "zara"); if (optZara) optZara.order = 4;
      const optZu = c.options.find(o => o.text === "zu"); if (optZu) optZu.correct = false;
      c.acceptedAnswers = [
        "Zer jolasten ari zara",
        "Zer jolasten ari zara?",
        "Zer ari zara jolasten",
        "Zer ari zara jolasten?",
        "Zer jolasten ari zara zu",
        "Zer jolasten ari zara zu?",
        "Zer ari zara jolasten zu",
        "Zer ari zara jolasten zu?",
        "zer jolasten ari zara",
        "zer ari zara jolasten"
      ];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "audioText/accepted", "Zer zu jolasten ari zara?", "Zer jolasten ari zara?", "Enforced Galdegaia verb adjacency");
  }
});

// ID 6732 (LISTEN, Lesson 674)
const c6732 = challenges.find(c => c.id === 6732);
if (c6732) {
  c6732.audioText = "Zergatik ari zara irribarre egiten?";
  c6732.acceptedAnswers = [
    "Zergatik ari zara irribarre egiten?",
    "Zergatik ari zara irribarre egiten",
    "Zergatik ari zara irribarre egiten.",
    "Zergatik irribarre egiten ari zara?",
    "Zergatik irribarre egiten ari zara"
  ];
  recordChange(6732, c6732.lessonId, c6732.type, c6732.prompt, "audioText/accepted", "Zergatik zu ari zara irribarre egiten?", "Zergatik ari zara irribarre egiten?", "Enforced Galdegaia verb adjacency");
}

// IDs 6763, 6769, 6781, 6785, 6799, 6808, 6809: "Zerekin idatziko duzu?"
[6763, 6769, 6781, 6785, 6799, 6808, 6809].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Zerekin zuk idatziko duzu")) {
      c.prompt = "Zerekin idatziko duzu?";
    }
    c.audioText = "Zerekin idatziko duzu?";
    if (c.type === "LISTEN") {
      c.acceptedAnswers = ["Zerekin idatziko duzu?", "Zerekin idatziko duzu", "Zerekin idatziko duzu."];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText", "Zerekin zuk idatziko duzu?", "Zerekin idatziko duzu?", "Enforced Galdegaia verb adjacency");
  }
});

// IDs 6777, 6803: "Norekin joango gara?"
[6777, 6803].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    c.prompt = "Norekin joango gara?";
    c.audioText = "Norekin joango gara?";
    if (c.question && c.question.includes("Select the correct translation")) {
      c.question = 'Select the correct translation for "Norekin joango gara?":';
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText", "Norekin gu joango gara?", "Norekin joango gara?", "Enforced Galdegaia verb adjacency");
  }
});

// IDs 6782, 6784, 6787, 6797: "Zerekin ari zinen jolasten?"
[6782, 6784, 6787, 6797].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Zerekin zu ari zinen jolasten")) {
      c.prompt = "Zerekin ari zinen jolasten?";
    }
    c.audioText = "Zerekin ari zinen jolasten?";
    if (c.type === "LISTEN") {
      c.acceptedAnswers = ["Zerekin ari zinen jolasten?", "Zerekin ari zinen jolasten", "Zerekin ari zinen jolasten."];
    }
    if (c.type === "TRANSLATE" && c.question.includes("into Basque")) {
      const optZer = c.options.find(o => o.text === "Zerekin"); if (optZer) optZer.order = 1;
      const optAri = c.options.find(o => o.text === "ari"); if (optAri) optAri.order = 2;
      const optZin = c.options.find(o => o.text === "zinen"); if (optZin) optZin.order = 3;
      const optJol = c.options.find(o => o.text === "jolasten"); if (optJol) optJol.order = 4;
      const optZu = c.options.find(o => o.text === "zu"); if (optZu) optZu.correct = false;
      c.acceptedAnswers = [
        "Zerekin ari zinen jolasten",
        "Zerekin ari zinen jolasten?",
        "Zerekin jolasten ari zinen",
        "Zerekin jolasten ari zinen?",
        "Zerekin ari zinen jolasten zu",
        "Zerekin ari zinen jolasten zu?",
        "zerekin ari zinen jolasten",
        "zerekin jolasten ari zinen"
      ];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText/accepted", "Zerekin zu ari zinen jolasten?", "Zerekin ari zinen jolasten?", "Enforced Galdegaia verb adjacency");
  }
});

// ID 6790: "Who did you go with?" -> "Norekin joan zinen?"
const c6790 = challenges.find(c => c.id === 6790);
if (c6790) {
  c6790.audioText = "Norekin joan zinen?";
  const optNorekin = c6790.options.find(o => o.text === "Norekin"); if (optNorekin) optNorekin.order = 1;
  const optJoan = c6790.options.find(o => o.text === "joan"); if (optJoan) optJoan.order = 2;
  const optZinen = c6790.options.find(o => o.text === "zinen"); if (optZinen) optZinen.order = 3;
  const optZu = c6790.options.find(o => o.text === "zu"); if (optZu) optZu.correct = false;
  c6790.acceptedAnswers = [
    "Norekin joan zinen",
    "Norekin joan zinen?",
    "Norekin joan zinen zu",
    "Norekin joan zinen zu?",
    "norekin joan zinen",
    "norekin joan zinen?"
  ];
  recordChange(6790, c6790.lessonId, c6790.type, c6790.prompt, "audioText/accepted", "Norekin zu joan zinen?", "Norekin joan zinen?", "Enforced Galdegaia verb adjacency");
}

// IDs 6806, 6810: "Zerekin jolasten duzu?"
[6806, 6810].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Zerekin zuk jolasten duzu")) {
      c.prompt = "Zerekin jolasten duzu?";
    }
    c.audioText = "Zerekin jolasten duzu?";
    if (c.type === "TRANSLATE" && c.question.includes("into Basque")) {
      const optZer = c.options.find(o => o.text === "Zerekin"); if (optZer) optZer.order = 1;
      const optJol = c.options.find(o => o.text === "jolasten"); if (optJol) optJol.order = 2;
      const optDu = c.options.find(o => o.text === "duzu"); if (optDu) optDu.order = 3;
      const optZuk = c.options.find(o => o.text === "zuk"); if (optZuk) optZuk.correct = false;
      c.acceptedAnswers = [
        "Zerekin jolasten duzu",
        "Zerekin jolasten duzu?",
        "Zerekin jolasten duzu zuk",
        "Zerekin jolasten duzu zuk?",
        "zerekin jolasten duzu",
        "zerekin jolasten duzu?"
      ];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText/accepted", "Zerekin zuk jolasten duzu?", "Zerekin jolasten duzu?", "Enforced Galdegaia verb adjacency");
  }
});

// IDs 7456, 7477: "Zergatik egosten duzu txerria?"
[7456, 7477].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c) {
    if (c.prompt.includes("Zergatik zuk egosten duzu txerria")) {
      c.prompt = "Zergatik egosten duzu txerria?";
    }
    c.audioText = "Zergatik egosten duzu txerria?";
    if (c.type === "TRANSLATE" && c.question.includes("into Basque")) {
      const optZerg = c.options.find(o => o.text === "Zergatik"); if (optZerg) optZerg.order = 1;
      const optEg = c.options.find(o => o.text === "egosten"); if (optEg) optEg.order = 2;
      const optDu = c.options.find(o => o.text === "duzu"); if (optDu) optDu.order = 3;
      const optTx = c.options.find(o => o.text === "txerria"); if (optTx) optTx.order = 4;
      const optZuk = c.options.find(o => o.text === "zuk"); if (optZuk) optZuk.correct = false;
      c.acceptedAnswers = [
        "Zergatik egosten duzu txerria",
        "Zergatik egosten duzu txerria?",
        "Zergatik egosten duzu txerria zuk",
        "Zergatik egosten duzu txerria zuk?",
        "zergatik egosten duzu txerria",
        "zergatik egosten duzu txerria?"
      ];
    }
    recordChange(id, c.lessonId, c.type, c.prompt, "prompt/audioText/accepted", "Zergatik zuk egosten duzu txerria?", "Zergatik egosten duzu txerria?", "Enforced Galdegaia verb adjacency");
  }
});

// -------------------------------------------------------------
// 9. CLEANUP OF UNGRAMMATICAL PERMUTATIONS IN ACCEPTED ANSWERS & OPTIONS
// -------------------------------------------------------------

// IDs 506, 523, 530 ("Zein koloretakoa da/zen kotxea/autobusa")
[506, 523, 530].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c && c.acceptedAnswers) {
    const old = [...c.acceptedAnswers];
    const isPast = id === 506;
    const item = id === 506 ? "kotxea" : "autobusa";
    const verb = isPast ? "zen" : "da";
    c.acceptedAnswers = [
      `Zein koloretakoa ${verb} ${item}`,
      `Zein koloretakoa ${verb} ${item}?`,
      `Zein koloretakoa ${verb} ${item}.`,
      `zein koloretakoa ${verb} ${item}`,
      `zein koloretakoa ${verb} ${item}?`
    ];
    recordChange(id, c.lessonId, c.type, c.prompt, "acceptedAnswers", old, c.acceptedAnswers, "Purged non-adjacent word orders from accepted answers");
  }
});

// ID 294, 300, 303, 307, 880 ("Zer da hura", "Zer zara zu", "Zer da hau", etc.)
[294, 300, 303, 307, 880].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c && c.acceptedAnswers) {
    const old = [...c.acceptedAnswers];
    const filtered = old.filter(a => {
      // Eliminate "Zer hura da", "Zer zu zara", "Zer hau da", "Hau da zer", "Hura da zer"
      if (/^zer\s+(hura|zu|gu|hau)\s+(da|zara|gara)/i.test(a)) return false;
      if (/^(hau|hura|zu|gu)\s+(da|zara|gara)\s+zer/i.test(a)) return false;
      return true;
    });
    c.acceptedAnswers = filtered;
    recordChange(id, c.lessonId, c.type, c.prompt, "acceptedAnswers", old, c.acceptedAnswers, "Purged non-adjacent interrogative word order from accepted answers");
  }
});

// IDs 7543, 7547 ("I am hungry. When is breakfast?" -> "Ni gose naiz. Noiz da gosaria?")
[7543, 7547].forEach(id => {
  const c = challenges.find(x => x.id === id);
  if (c && c.acceptedAnswers) {
    const old = [...c.acceptedAnswers];
    const filtered = old.filter(a => {
      // Must not contain "Noiz gosaria da", "Noiz gosari bat da", "Noiz al da"
      if (/noiz\s+gosari/i.test(a)) return false;
      if (/noiz\s+al\s+da/i.test(a)) return false;
      if (/gose\s+al\s+naiz/i.test(a)) return false; // "I am hungry" is statement, not polar question
      if (/naiz\s+gose/i.test(a)) return false;
      return true;
    });
    c.acceptedAnswers = filtered;
    recordChange(id, c.lessonId, c.type, c.prompt, "acceptedAnswers", `Truncated ${old.length} -> ${filtered.length}`, filtered.slice(0, 10), "Purged ungrammatical 'Noiz gosaria da' and 'Noiz al da' from accepted answers");
  }
});

// -------------------------------------------------------------
// 10. GLOBAL PHRASE REPLACEMENTS IN ALL OPTIONS AND ACCEPTED ANSWERS
// -------------------------------------------------------------
const phraseReplacements = [
  { from: /\bNortzuk emakumeak dira\?/g, to: "Nortzuk dira emakumeak?" },
  { from: /\bNortzuk emakumeak dira\b/g, to: "Nortzuk dira emakumeak" },
  { from: /\bNortzuk gizonak dira\?/g, to: "Nortzuk dira gizonak?" },
  { from: /\bNortzuk gizonak dira\b/g, to: "Nortzuk dira gizonak" },
  { from: /\bNortzuk irakasleak dira\?/g, to: "Nortzuk dira irakasleak?" },
  { from: /\bNortzuk irakasleak dira\b/g, to: "Nortzuk dira irakasleak" },
  { from: /\bHura al autobusa da\?/g, to: "Hura autobusa al da?" },
  { from: /\bHura al autobusa da\b/g, to: "Hura autobusa al da" },
  { from: /\bNoiz zu etorri zinen elizatik atzo\./g, to: "Noiz etorri zinen elizatik atzo?" },
  { from: /\bNoiz zu etorri zinen elizatik atzo\b/g, to: "Noiz etorri zinen elizatik atzo" },
  { from: /\bNoiz zuek poztu zineten\./g, to: "Noiz poztu zineten?" },
  { from: /\bNoiz zuek poztu zineten\b/g, to: "Noiz poztu zineten" },
  { from: /\bNoiz hura etzaten da ohi\?/g, to: "Noiz etzaten da ohi?" },
  { from: /\bNoiz hura etzaten da ohi\b/g, to: "Noiz etzaten da ohi" },
  { from: /\bNon haiek ohi geratu dira\?/g, to: "Non geratu dira ohi?" },
  { from: /\bNon haiek ohi geratu dira\b/g, to: "Non geratu dira ohi" },
  { from: /\bNola txerria dago\?(\s*)Txerria nekatu dago\./g, to: "Nola dago txerria? Txerria nekatuta dago." },
  { from: /\bNola txerria dago\b/g, to: "Nola dago txerria" },
  { from: /\bZergatik hura dago triste\?/g, to: "Zergatik dago hura triste?" },
  { from: /\bZergatik hura dago triste\b/g, to: "Zergatik dago hura triste" },
  { from: /\bNola eguraldia dago gaur\?/g, to: "Nola dago eguraldia gaur?" },
  { from: /\bNola eguraldia dago gaur\b/g, to: "Nola dago eguraldia gaur" },
  { from: /\bNola eguraldia zegoen atzo\?/g, to: "Nola zegoen eguraldia atzo?" },
  { from: /\bNola eguraldia zegoen atzo\b/g, to: "Nola zegoen eguraldia atzo" },
  { from: /\bZergatik gidariak ibiltzen ari dira\?/g, to: "Zergatik ibiltzen ari dira gidariak?" },
  { from: /\bZergatik gidariak ibiltzen ari dira\b/g, to: "Zergatik ibiltzen ari dira gidariak" },
  { from: /\bZer zuek egiten ari zarete\?/g, to: "Zer egiten ari zarete?" },
  { from: /\bZer zuek egiten ari zarete\b/g, to: "Zer egiten ari zarete" },
  { from: /\bZer zu ari zara idazten\?/g, to: "Zer idazten ari zara?" },
  { from: /\bZer zu ari zara idazten\b/g, to: "Zer idazten ari zara" },
  { from: /\bZer zu jolasten ari zara\?/g, to: "Zer jolasten ari zara?" },
  { from: /\bZer zu jolasten ari zara\b/g, to: "Zer jolasten ari zara" },
  { from: /\bZergatik zu ari zara irribarre egiten\?/g, to: "Zergatik ari zara irribarre egiten?" },
  { from: /\bZergatik zu ari zara irribarre egiten\b/g, to: "Zergatik ari zara irribarre egiten" },
  { from: /\bZerekin zuk idatziko duzu\?/g, to: "Zerekin idatziko duzu?" },
  { from: /\bZerekin zuk idatziko duzu\b/g, to: "Zerekin idatziko duzu" },
  { from: /\bNorekin gu joango gara\?/g, to: "Norekin joango gara?" },
  { from: /\bNorekin gu joango gara\b/g, to: "Norekin joango gara" },
  { from: /\bZerekin zu ari zinen jolasten\?/g, to: "Zerekin ari zinen jolasten?" },
  { from: /\bZerekin zu ari zinen jolasten\b/g, to: "Zerekin ari zinen jolasten" },
  { from: /\bNorekin zu joan zinen\?/g, to: "Norekin joan zinen?" },
  { from: /\bNorekin zu joan zinen\b/g, to: "Norekin joan zinen" },
  { from: /\bZerekin zuk jolasten duzu\?/g, to: "Zerekin jolasten duzu?" },
  { from: /\bZerekin zuk jolasten duzu\b/g, to: "Zerekin jolasten duzu" },
  { from: /\bZergatik zuk egosten duzu txerria\?/g, to: "Zergatik egosten duzu txerria?" },
  { from: /\bZergatik zuk egosten duzu txerria\b/g, to: "Zergatik egosten duzu txerria" },
  { from: /tour[\s\-_]?gida/gi, to: "turismo-gidari" }
];

challenges.forEach(c => {
  if (c.options) {
    c.options.forEach(o => {
      if (typeof o.text === "string") {
        phraseReplacements.forEach(({ from, to }) => {
          if (from.test(o.text)) {
            const before = o.text;
            o.text = o.text.replace(from, to);
            recordChange(c.id, c.lessonId, c.type, c.prompt, `options.${o.id}`, before, o.text, "Option text phrase normalization");
          }
        });
      }
    });
  }
  if (c.acceptedAnswers) {
    let modified = false;
    const newAccepted = c.acceptedAnswers.map(a => {
      let cur = a;
      phraseReplacements.forEach(({ from, to }) => {
        if (from.test(cur)) {
          cur = cur.replace(from, to);
          modified = true;
        }
      });
      return cur;
    });
    if (modified) {
      c.acceptedAnswers = Array.from(new Set(newAccepted));
    }
  }
});

// -------------------------------------------------------------
// 11. UPDATE UNITS.JSON AND TRANSLATECHALLENGE.TSX
// -------------------------------------------------------------

// units.json
let unitsModified = false;
units.forEach(u => {
  if (u.description && u.description.includes("tour gida")) {
    u.description = u.description.replace(/tour gida/g, "turismo-gidari");
    unitsModified = true;
  }
  if (u.guidebook && u.guidebook.includes("Tour gida: Tour guide")) {
    u.guidebook = u.guidebook.replace(/Tour gida: Tour guide/g, "Turismo-gidari: Tour guide");
    unitsModified = true;
  }
});

// Write challenges back
fs.writeFileSync(challengesPath, JSON.stringify(challenges, null, 2), "utf8");
console.log(`Updated ${challengesPath}`);

if (fs.existsSync(standalonePath)) {
  fs.writeFileSync(standalonePath, JSON.stringify(challenges, null, 2), "utf8");
  console.log(`Updated ${standalonePath}`);
}

if (unitsModified) {
  fs.writeFileSync(unitsPath, JSON.stringify(units, null, 2), "utf8");
  console.log(`Updated ${unitsPath}`);
  if (fs.existsSync(standaloneUnitsPath)) {
    fs.writeFileSync(standaloneUnitsPath, JSON.stringify(units, null, 2), "utf8");
    console.log(`Updated ${standaloneUnitsPath}`);
  }
}

// Update TranslateChallenge.tsx
if (fs.existsSync(translateChallengePath)) {
  let tcContent = fs.readFileSync(translateChallengePath, "utf8");
  const oldTc = tcContent;
  tcContent = tcContent.replace(
    /"the tour guide is pretty, but the tourist is beautiful": "Tour gida polita da, baina turista ederra da.",/g,
    '"the tour guide is pretty, but the tourist is beautiful": "Turismo-gidaria polita da, baina turista ederra da.",'
  );
  tcContent = tcContent.replace(
    /"tour gida": "tour guide",\s*"tour gida polita da, baina turista ederra da": "The tour guide is pretty, but the tourist is beautiful.",\s*"tour guide": "tour gida",/g,
    '"turismo-gidari": "tour guide",\n  "turismo-gidaria": "the tour guide",\n  "turismo-gidaria polita da, baina turista ederra da": "The tour guide is pretty, but the tourist is beautiful.",\n  "tour guide": "turismo-gidaria",'
  );
  if (tcContent !== oldTc) {
    fs.writeFileSync(translateChallengePath, tcContent, "utf8");
    console.log(`Updated ${translateChallengePath}`);
  }
}

console.log(`Audit & Repair Complete: ${auditLog.length} modifications logged.`);
fs.writeFileSync("scratch/audit_log.json", JSON.stringify(auditLog, null, 2), "utf8");
