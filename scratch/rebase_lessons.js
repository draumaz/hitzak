const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const COURSE_DIR = '/home/emma/Downloads/LibreLingo-EU-from-EN/course';
const TARGET_SEED_FILE = '/home/emma/remote-repos/euskarolingo/db/seed-data.ts';
const TARGET_TRANSLATE_FILE = '/home/emma/remote-repos/euskarolingo/components/lesson/TranslateChallenge.tsx';

function cleanWord(w) {
  if (!w) return '';
  return w.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?]+|[.,\/#!$%\^&\*;:{}=\-_`~()?]+$/g, "")
    .trim();
}

function runRebase() {
  console.log("Loading course.yaml...");
  const courseYamlPath = path.join(COURSE_DIR, 'course.yaml');
  const courseConfig = yaml.load(fs.readFileSync(courseYamlPath, 'utf8'));
  const moduleDirs = courseConfig.Modules.map(m => m.replace(/\/$/, ''));

  console.log(`Found ${moduleDirs.length} active modules in course.yaml`);

  const sections = [
    {
      id: 1,
      courseId: 1,
      title: "Section 1: Hasiberria (Rookie - A1 Foundations)",
      description: "Modules 1-15: Learn the absolute basics, greetings, simple pronouns, numbers, food & drinks, family, and basic verbs.",
      order: 1,
      color: "#58cc02",
      icon: "compass"
    },
    {
      id: 2,
      courseId: 1,
      title: "Section 2: Esploratzailea (Explorer - A2/B1 Intermediate)",
      description: "Modules 16-30: Build your skills with spatial postpositions, telling time, command forms, calendar terms, and basic movement verbs.",
      order: 2,
      color: "#1cb0f6",
      icon: "map"
    },
    {
      id: 3,
      courseId: 1,
      title: "Section 3: Txapelduna (Champion - B2/C1 Advanced Syntax & Mastery)",
      description: "Modules 31-46: Master advanced verbs (ukan, egin, eduki, jakin), transitive sentence structure, dative commands, past tense, and complex grammar.",
      order: 3,
      color: "#ff9600",
      icon: "trophy"
    }
  ];

  const units = [];
  const rings = [];
  const lessons = [];
  const challenges = [];
  const challengeOptions = [];

  let ringIdCounter = 1;
  let lessonIdCounter = 1;
  let challengeIdCounter = 1;
  let optionIdCounter = 1;

  // Dictionary for TranslateChallenge tooltips
  const fullDictionary = {};

  // For rotating standard ring icons
  const RING_ICONS = ["sparkles", "zap", "smile", "heart", "key", "star", "award", "shield"];

  moduleDirs.forEach((modDir, index) => {
    const unitId = index + 1;
    const modPath = path.join(COURSE_DIR, modDir);

    // Parse module.yaml
    const moduleYamlPath = path.join(modPath, 'module.yaml');
    if (!fs.existsSync(moduleYamlPath)) {
      console.warn(`Warning: module.yaml missing in ${modDir}, skipping.`);
      return;
    }
    const moduleInfo = yaml.load(fs.readFileSync(moduleYamlPath, 'utf8'));
    const rawTitle = moduleInfo.Module.Name || modDir;
    // Clean up title (remove leading number if present like "1. Basics")
    const cleanTitle = rawTitle.replace(/^\d+\.\s*/, '');

    // Determine Section
    let sectionId = 1;
    let color = "#58cc02";
    if (unitId > 15 && unitId <= 30) {
      sectionId = 2;
      color = "#1cb0f6";
    } else if (unitId > 30) {
      sectionId = 3;
      color = "#ff9600";
    }

    // Process Skills (steps)
    const skillsPath = path.join(modPath, 'skills');
    let skillFiles = [];
    if (fs.existsSync(skillsPath)) {
      skillFiles = fs.readdirSync(skillsPath)
        .filter(f => f.endsWith('.yaml'))
        .sort();
    }

    // Combine MD files for guidebook
    let guidebookText = `# Unit ${unitId}: ${cleanTitle}\n\n`;
    let guidebookContentFound = false;

    // Collect vocabulary and phrases for this unit
    const unitWords = [];
    const unitPhrases = [];

    const unitRings = [];

    skillFiles.forEach((sf, sfIdx) => {
      const yamlPath = path.join(skillsPath, sf);
      const mdPath = path.join(skillsPath, sf.replace('.yaml', '.md'));

      // Parse YAML
      console.log("Parsing YAML file:", yamlPath);
      const skillData = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
      const ringTitle = skillData.Skill.Name || sf.replace('.yaml', '');

      // Append Guidebook Text
      if (fs.existsSync(mdPath)) {
        let mdContent = fs.readFileSync(mdPath, 'utf8');
        // Clean up home links
        mdContent = mdContent.replace(/\[\s*Go Back to Home Page.*\]\(.*\)/gi, '');
        mdContent = mdContent.replace(/Go Back to Home Page/gi, '');
        guidebookText += mdContent.trim() + "\n\n---\n\n";
        guidebookContentFound = true;
      }

      // Collect vocab & phrases
      const stepWords = (skillData['New words'] || []).map(item => ({
        Word: item.Word,
        Translation: item.Translation,
        AlsoAccepted: item['Also accepted'] || [],
        Synonyms: item.Synonyms || []
      }));
      const stepPhrases = (skillData.Phrases || []).map(item => ({
        Phrase: item.Phrase,
        Translation: item.Translation,
        AlternativeVersions: item['Alternative versions'] || [],
        AlternativeTranslations: item['Alternative translations'] || []
      }));

      unitWords.push(...stepWords);
      unitPhrases.push(...stepPhrases);

      // Add to full dictionary for hover tips
      stepWords.forEach(w => {
        const lookup = cleanWord(w.Word);
        if (lookup && w.Translation) {
          fullDictionary[lookup] = w.Translation;
        }
      });
      // Parse mini-dictionary if present
      if (skillData['Mini-dictionary']) {
        const bDict = skillData['Mini-dictionary'].Basque || {};
        const eDict = skillData['Mini-dictionary'].English || {};

        if (Array.isArray(bDict)) {
          bDict.forEach(item => {
            if (typeof item === 'object' && item !== null) {
              for (const [k, v] of Object.entries(item)) {
                const lookup = cleanWord(k);
                const val = Array.isArray(v) ? v.join(' / ') : String(v);
                if (lookup && val) {
                  fullDictionary[lookup] = val;
                }
              }
            }
          });
        } else if (typeof bDict === 'object' && bDict !== null) {
          for (const [k, v] of Object.entries(bDict)) {
            const lookup = cleanWord(k);
            const val = Array.isArray(v) ? v.join(' / ') : String(v);
            if (lookup && val) {
              fullDictionary[lookup] = val;
            }
          }
        }
      }

      // Create Ring
      const ringId = ringIdCounter++;
      const ringIcon = RING_ICONS[ringId % RING_ICONS.length];
      const wordListStr = stepWords.slice(0, 4).map(w => w.Word).join(', ');
      const description = stepWords.length > 0 ? `Learn: ${wordListStr}` : `Vocabulary and phrases for ${ringTitle}`;

      const seedRing = {
        id: ringId,
        unitId,
        title: ringTitle,
        description,
        order: sfIdx + 1,
        totalLevels: 5,
        isUnitReview: false,
        icon: ringIcon
      };
      rings.push(seedRing);
      unitRings.push(seedRing);

      // Generate 5 Lessons for this Ring
      const ringLessons = [];
      for (let level = 1; level <= 5; level++) {
        const lessonId = lessonIdCounter++;
        const xpReward = level === 5 ? 25 : (level >= 3 ? 20 : 15);
        const seedLesson = {
          id: lessonId,
          unitId,
          ringId,
          level,
          title: `${ringTitle} - Level ${level}`,
          order: level,
          xpReward,
          isUnitReview: false
        };
        lessons.push(seedLesson);
        ringLessons.push(seedLesson);

        // Generate Challenges for this lesson
        // Let's generate 4 challenges per lesson
        const lessonChallenges = [];
        if (stepWords.length === 0 && stepPhrases.length === 0) {
          // Safe fallback if yaml is completely empty
          stepWords.push({ Word: "Euskara", Translation: "Basque" });
        }

        const getRandomWord = () => stepWords[Math.floor(Math.random() * stepWords.length)];
        const getRandomPhrase = () => stepPhrases[Math.floor(Math.random() * stepPhrases.length)] || { Phrase: stepWords[0].Word, Translation: stepWords[0].Translation };

        for (let chIdx = 1; chIdx <= 10; chIdx++) {
          const challengeId = challengeIdCounter++;
          let type = "SELECT";
          let question = "";
          let prompt = "";
          let audioText = "";
          let challengeOpts = [];

          if (level === 1) {
            // Level 1: Mostly SELECT and MATCH
            if (chIdx % 3 === 1) {
              type = "SELECT";
              const target = getRandomWord();
              question = `Select the correct translation for "${target.Word}":`;
              prompt = target.Word;
              audioText = target.Word;
              
              // Correct option
              challengeOpts.push({
                id: optionIdCounter++,
                challengeId,
                text: target.Translation,
                correct: true,
                order: 0
              });

              // Distractors
              const otherWords = stepWords.filter(w => w.Word !== target.Word);
              const dist1 = otherWords.length > 0 ? otherWords[Math.floor(Math.random() * otherWords.length)] : { Translation: "hello" };
              const filteredForDist2 = otherWords.filter(w => w.Word !== dist1.Word);
              const dist2 = filteredForDist2.length > 0 ? filteredForDist2[Math.floor(Math.random() * filteredForDist2.length)] : { Translation: "water" };

              challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist1.Translation, correct: false, order: 0 });
              challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist2.Translation, correct: false, order: 0 });
            } else if (chIdx % 3 === 2) {
              type = "MATCH";
              question = "Match the pairs:";
              const pairs = [];
              const shuffledWords = [...stepWords].sort(() => 0.5 - Math.random()).slice(0, 4);
              // If not enough words, pad
              while (shuffledWords.length < 4) {
                shuffledWords.push({ Word: `word_${shuffledWords.length}`, Translation: `translation_${shuffledWords.length}` });
              }
              shuffledWords.forEach((sw, pIdx) => {
                const pairKey = `match_${challengeId}_${pIdx}`;
                challengeOpts.push({
                  id: optionIdCounter++,
                  challengeId,
                  text: sw.Word,
                  correct: true,
                  pairMatchingKey: pairKey
                });
                challengeOpts.push({
                  id: optionIdCounter++,
                  challengeId,
                  text: sw.Translation,
                  correct: true,
                  pairMatchingKey: pairKey
                });
              });
            } else {
              type = "TRANSLATE";
              const target = getRandomPhrase();
              question = 'Translate this sentence:';
              prompt = target.Phrase;
              audioText = target.Phrase;

              // Correct options: split English translation into words
              const tokens = target.Translation.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(Boolean);
              tokens.forEach((tok, tokIdx) => {
                challengeOpts.push({
                  id: optionIdCounter++,
                  challengeId,
                  text: tok,
                  correct: true,
                  order: tokIdx + 1
                });
              });

              // Distractors
              const distWords = ["never", "water", "boy", "girl", "house", "friend", "please", "yes", "no"];
              distWords.slice(0, 3).forEach(d => {
                if (!tokens.map(t => t.toLowerCase()).includes(d)) {
                  challengeOpts.push({
                    id: optionIdCounter++,
                    challengeId,
                    text: d,
                    correct: false,
                    order: 0
                  });
                }
              });
            }
          } else if (level === 2) {
            // Level 2: Mix of SELECT, MATCH, TRANSLATE
            if (chIdx % 3 === 1) {
              type = "SELECT";
              const target = getRandomPhrase();
              question = `Select the correct translation for "${target.Phrase}":`;
              prompt = target.Phrase;
              audioText = target.Phrase;
              challengeOpts.push({ id: optionIdCounter++, challengeId, text: target.Translation, correct: true });

              const otherPhrases = stepPhrases.filter(p => p.Phrase !== target.Phrase);
              const dist1 = otherPhrases.length > 0 ? otherPhrases[Math.floor(Math.random() * otherPhrases.length)] : { Translation: "Excuse me, where are you from?" };
              const dist2 = otherPhrases.length > 1 ? otherPhrases.filter(p => p.Phrase !== dist1.Phrase)[Math.floor(Math.random() * (otherPhrases.length - 1))] : { Translation: "I want delicious cheese and bread." };

              challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist1.Translation, correct: false });
              challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist2.Translation, correct: false });
            } else if (chIdx % 3 === 2) {
              type = "MATCH";
              question = "Match the pairs:";
              const shuffledWords = [...stepWords].sort(() => 0.5 - Math.random()).slice(0, 4);
              while (shuffledWords.length < 4) {
                shuffledWords.push({ Word: `word_${shuffledWords.length}`, Translation: `translation_${shuffledWords.length}` });
              }
              shuffledWords.forEach((sw, pIdx) => {
                const pairKey = `match_${challengeId}_${pIdx}`;
                challengeOpts.push({ id: optionIdCounter++, challengeId, text: sw.Word, correct: true, pairMatchingKey: pairKey });
                challengeOpts.push({ id: optionIdCounter++, challengeId, text: sw.Translation, correct: true, pairMatchingKey: pairKey });
              });
            } else {
              type = "TRANSLATE";
              const target = getRandomPhrase();
              question = 'Translate this sentence:';
              prompt = target.Phrase;
              audioText = target.Phrase;

              const tokens = target.Translation.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(Boolean);
              tokens.forEach((tok, tokIdx) => {
                challengeOpts.push({ id: optionIdCounter++, challengeId, text: tok, correct: true, order: tokIdx + 1 });
              });

              const distWords = ["please", "thank", "good", "morning", "night", "you", "they"];
              distWords.slice(0, 3).forEach(d => {
                if (!tokens.map(t => t.toLowerCase()).includes(d)) {
                  challengeOpts.push({ id: optionIdCounter++, challengeId, text: d, correct: false, order: 0 });
                }
              });
            }
          } else {
            // Level 3, 4, 5: Mostly TRANSLATE and LISTEN
            if (chIdx % 3 === 1 || chIdx % 3 === 0) {
              type = "TRANSLATE";
              const target = getRandomPhrase();
              // 50% chance to translate English to Basque, 50% Basque to English
              const enToEu = Math.random() > 0.5;
              if (enToEu) {
                question = `Translate into Basque:`;
                prompt = target.Translation;
                audioText = target.Phrase;
                const tokens = target.Phrase.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(Boolean);
                tokens.forEach((tok, tokIdx) => {
                  challengeOpts.push({ id: optionIdCounter++, challengeId, text: tok, correct: true, order: tokIdx + 1 });
                });
                // Distractors (other Basque words)
                const dists = stepWords.filter(w => !tokens.includes(w.Word)).slice(0, 3);
                dists.forEach(d => {
                  challengeOpts.push({ id: optionIdCounter++, challengeId, text: d.Word, correct: false, order: 0 });
                });
                // Fill if not enough distractors
                while (challengeOpts.length < tokens.length + 3) {
                  challengeOpts.push({ id: optionIdCounter++, challengeId, text: "eta", correct: false, order: 0 });
                }
              } else {
                question = `Translate this sentence:`;
                prompt = target.Phrase;
                audioText = target.Phrase;
                const tokens = target.Translation.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(Boolean);
                tokens.forEach((tok, tokIdx) => {
                  challengeOpts.push({ id: optionIdCounter++, challengeId, text: tok, correct: true, order: tokIdx + 1 });
                });
                const distWords = ["house", "cat", "dog", "woman", "man", "teacher", "student"];
                distWords.slice(0, 3).forEach(d => {
                  if (!tokens.map(t => t.toLowerCase()).includes(d)) {
                    challengeOpts.push({ id: optionIdCounter++, challengeId, text: d, correct: false, order: 0 });
                  }
                });
              }
            } else if (chIdx % 3 === 2) {
              type = "LISTEN";
              const target = getRandomPhrase();
              question = "Listen and select what you hear:";
              prompt = "Audio playback";
              audioText = target.Phrase;

              challengeOpts.push({ id: optionIdCounter++, challengeId, text: target.Phrase, correct: true });

              const otherPhrases = stepPhrases.filter(p => p.Phrase !== target.Phrase);
              const dist1 = otherPhrases.length > 0 ? otherPhrases[Math.floor(Math.random() * otherPhrases.length)] : { Phrase: "Bai, mutila naiz." };
              const dist2 = otherPhrases.length > 1 ? otherPhrases.filter(p => p.Phrase !== dist1.Phrase)[Math.floor(Math.random() * (otherPhrases.length - 1))] : { Phrase: "Gabon, laguna." };

              challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist1.Phrase, correct: false });
              challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist2.Phrase, correct: false });
            } else {
              // Option 4 is Translate or SELECT
              type = "TRANSLATE";
              const target = getRandomPhrase();
              question = 'Translate this sentence:';
              prompt = target.Phrase;
              audioText = target.Phrase;

              const tokens = target.Translation.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(Boolean);
              tokens.forEach((tok, tokIdx) => {
                challengeOpts.push({ id: optionIdCounter++, challengeId, text: tok, correct: true, order: tokIdx + 1 });
              });

              const distWords = ["happy", "tired", "sad", "good", "bad", "today", "tomorrow"];
              distWords.slice(0, 3).forEach(d => {
                if (!tokens.map(t => t.toLowerCase()).includes(d)) {
                  challengeOpts.push({ id: optionIdCounter++, challengeId, text: d, correct: false, order: 0 });
                }
              });
            }
          }

          // Shuffle challenge options order for display (except translate which is ordered on the fly by order field)
          challengeOpts = challengeOpts.sort(() => Math.random() - 0.5);

          challenges.push({
            id: challengeId,
            lessonId,
            type,
            question,
            prompt,
            order: chIdx,
            audioText,
            grammarTip: skillData.Skill.Name ? `💡 Vocabulary from ${skillData.Skill.Name}` : `💡 Practice standard Basque morphology.`
          });

          challengeOpts.forEach(opt => {
            challengeOptions.push(opt);
          });
        }
      }
    });

    // Create a final Unit Review Ring at the end of the module
    const reviewRingId = ringIdCounter++;
    const seedReviewRing = {
      id: reviewRingId,
      unitId,
      title: `${cleanTitle} Review`,
      description: `Consolidate all concepts and earn the Unit ${unitId} Mastery Trophy`,
      order: skillFiles.length + 1,
      totalLevels: 1,
      isUnitReview: true,
      icon: "trophy"
    };
    rings.push(seedReviewRing);

    // Create 1 Lesson for this Review Ring
    const reviewLessonId = lessonIdCounter++;
    const seedReviewLesson = {
      id: reviewLessonId,
      unitId,
      ringId: reviewRingId,
      level: 1,
      title: `Unit ${unitId} Comprehensive Trophy Assessment`,
      order: 1,
      xpReward: 50,
      isUnitReview: true
    };
    lessons.push(seedReviewLesson);

    // Generate 6 challenges for the review lesson, drawing from all step vocabulary/phrases
    const getRandomUnitWord = () => unitWords[Math.floor(Math.random() * unitWords.length)] || { Word: "Euskara", Translation: "Basque" };
    const getRandomUnitPhrase = () => unitPhrases[Math.floor(Math.random() * unitPhrases.length)] || { Phrase: "Kaixo", Translation: "Hello" };

    for (let chIdx = 1; chIdx <= 10; chIdx++) {
      const challengeId = challengeIdCounter++;
      let type = "TRANSLATE";
      let question = "";
      let prompt = "";
      let audioText = "";
      let challengeOpts = [];

      if (chIdx % 4 === 1) {
        type = "MATCH";
        question = "Match the vocabulary pairs:";
        const shuffledWords = [...unitWords].sort(() => 0.5 - Math.random()).slice(0, 4);
        while (shuffledWords.length < 4) {
          shuffledWords.push({ Word: `word_${shuffledWords.length}`, Translation: `translation_${shuffledWords.length}` });
        }
        shuffledWords.forEach((sw, pIdx) => {
          const pairKey = `match_${challengeId}_${pIdx}`;
          challengeOpts.push({ id: optionIdCounter++, challengeId, text: sw.Word, correct: true, pairMatchingKey: pairKey });
          challengeOpts.push({ id: optionIdCounter++, challengeId, text: sw.Translation, correct: true, pairMatchingKey: pairKey });
        });
      } else if (chIdx % 4 === 2) {
        type = "TRANSLATE";
        const target = getRandomUnitPhrase();
        question = 'Translate this sentence:';
        prompt = target.Phrase;
        audioText = target.Phrase;

        const tokens = target.Translation.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(Boolean);
        tokens.forEach((tok, tokIdx) => {
          challengeOpts.push({ id: optionIdCounter++, challengeId, text: tok, correct: true, order: tokIdx + 1 });
        });

        const distWords = ["never", "always", "sometimes", "perhaps", "tomorrow", "now", "where"];
        distWords.slice(0, 3).forEach(d => {
          if (!tokens.map(t => t.toLowerCase()).includes(d)) {
            challengeOpts.push({ id: optionIdCounter++, challengeId, text: d, correct: false, order: 0 });
          }
        });
      } else if (chIdx % 4 === 3) {
        type = "LISTEN";
        const target = getRandomUnitPhrase();
        question = "Listen and select what you hear:";
        prompt = "Audio review";
        audioText = target.Phrase;

        challengeOpts.push({ id: optionIdCounter++, challengeId, text: target.Phrase, correct: true });

        const otherPhrases = unitPhrases.filter(p => p.Phrase !== target.Phrase);
        const dist1 = otherPhrases.length > 0 ? otherPhrases[Math.floor(Math.random() * otherPhrases.length)] : { Phrase: "Egun on." };
        const dist2 = otherPhrases.length > 1 ? otherPhrases.filter(p => p.Phrase !== dist1.Phrase)[Math.floor(Math.random() * (otherPhrases.length - 1))] : { Phrase: "Agur." };

        challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist1.Phrase, correct: false });
        challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist2.Phrase, correct: false });
      } else {
        type = "SELECT";
        const target = getRandomUnitWord();
        question = `Select the correct translation for "${target.Word}":`;
        prompt = target.Word;
        audioText = target.Word;

        challengeOpts.push({ id: optionIdCounter++, challengeId, text: target.Translation, correct: true });

        const otherWords = unitWords.filter(w => w.Word !== target.Word);
        const dist1 = otherWords.length > 0 ? otherWords[Math.floor(Math.random() * otherWords.length)] : { Translation: "friend" };
        const filteredForDist2 = otherWords.filter(w => w.Word !== dist1.Word);
        const dist2 = filteredForDist2.length > 0 ? filteredForDist2[Math.floor(Math.random() * filteredForDist2.length)] : { Translation: "house" };

        challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist1.Translation, correct: false });
        challengeOpts.push({ id: optionIdCounter++, challengeId, text: dist2.Translation, correct: false });
      }

      challengeOpts = challengeOpts.sort(() => Math.random() - 0.5);

      challenges.push({
        id: challengeId,
        lessonId: reviewLessonId,
        type,
        question,
        prompt,
        order: chIdx,
        audioText,
        grammarTip: `💡 Unit Review challenge for ${cleanTitle}`
      });

      challengeOpts.forEach(opt => {
        challengeOptions.push(opt);
      });
    }

    // Clean up guidebookText (remove trailing separator)
    if (guidebookText.endsWith("\n\n---\n\n")) {
      guidebookText = guidebookText.slice(0, -7);
    }
    if (!guidebookContentFound) {
      guidebookText += `*Welcome to Unit ${unitId}!* Use this guidebook to practice basic grammatical and structural notes on the topic: ${cleanTitle}.`;
    }

    // Create Unit
    units.push({
      id: unitId,
      sectionId,
      courseId: 1,
      title: `Unit ${unitId}: ${cleanTitle}`,
      description: unitWords.slice(0, 5).map(w => w.Word).join(', '),
      order: unitId,
      color,
      guidebook: guidebookText
    });
  });

  // Attach options directly to challenges inside SEED_DATA to avoid db:push sync issues
  // But wait, the SeedChallenge interface in seed-data.ts has `options: SeedChallengeOption[]`.
  // So we should group our challengeOptions by challengeId, and embed them inside challenges!
  const challengesWithEmbeddedOptions = challenges.map(ch => {
    const chOpts = challengeOptions.filter(o => o.challengeId === ch.id);
    // Remove challengeId key as it's not strictly required in the embedded option type
    const cleanedOpts = chOpts.map(o => {
      const copy = { ...o };
      delete copy.challengeId;
      return copy;
    });
    return {
      ...ch,
      options: cleanedOpts
    };
  });

  console.log(`Successfully generated in-memory structures:`);
  console.log(`- Units: ${units.length}`);
  console.log(`- Rings: ${rings.length}`);
  console.log(`- Lessons: ${lessons.length}`);
  console.log(`- Challenges (with embedded options): ${challengesWithEmbeddedOptions.length}`);
  console.log(`- Dictionary keys collected: ${Object.keys(fullDictionary).length}`);

  // Construct files
  console.log(`Writing seed-data file: ${TARGET_SEED_FILE}`);
  writeSeedDataFile(sections, units, rings, lessons, challengesWithEmbeddedOptions);

  console.log(`Updating TranslateChallenge file: ${TARGET_TRANSLATE_FILE}`);
  writeTranslateChallengeDictionary(fullDictionary);

  console.log("Rebase finished successfully!");
}

function writeSeedDataFile(sections, units, rings, lessons, challenges) {
  const content = `export interface SeedSection {
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  color: string;
  icon: string;
}

export interface SeedUnit {
  id: number;
  sectionId: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  color: string;
  guidebook: string;
}

export interface SeedRing {
  id: number;
  unitId: number;
  title: string;
  description: string;
  order: number;
  totalLevels: number;
  isUnitReview: boolean;
  icon: string;
}

export interface SeedLesson {
  id: number;
  unitId: number;
  ringId: number;
  level: number;
  title: string;
  order: number;
  xpReward: number;
  isUnitReview: boolean;
}

export interface SeedChallengeOption {
  id: number;
  text: string;
  correct: boolean;
  imageSrc?: string;
  audioSrc?: string;
  order?: number;
  pairMatchingKey?: string;
}

export interface SeedChallenge {
  id: number;
  lessonId: number;
  type: "SELECT" | "ASSIST" | "TRANSLATE" | "MATCH" | "LISTEN";
  question: string;
  prompt?: string;
  order: number;
  audioSrc?: string;
  audioText?: string;
  grammarTip?: string;
  options: SeedChallengeOption[];
}

export interface SeedData {
  languages: Array<{
    id: string;
    name: string;
    nativeName: string;
    flagEmoji: string;
    isSupported: boolean;
  }>;
  courses: Array<{
    id: number;
    title: string;
    sourceLanguageId: string;
    targetLanguageId: string;
    imageSrc: string;
    description: string;
  }>;
  sections: SeedSection[];
  units: SeedUnit[];
  rings: SeedRing[];
  lessons: SeedLesson[];
  challenges: SeedChallenge[];
  initialUser: {
    userId: string;
    userName: string;
    userImageSrc: string;
    activeCourseId: number;
    hearts: number;
    points: number;
    streak: number;
    gems: number;
    hasActiveSubscription: boolean;
  };
}

export const SEED_DATA: SeedData = {
  languages: [
    { id: "eu", name: "Basque", nativeName: "Euskara", flagEmoji: "🟢", isSupported: true },
    { id: "en", name: "English", nativeName: "English", flagEmoji: "🇬🇧", isSupported: true },
    { id: "es", name: "Spanish", nativeName: "Español", flagEmoji: "🇪🇸", isSupported: true },
  ],
  courses: [
    {
      id: 1,
      title: "Basque for English Speakers (Euskara Hasiberrientzat)",
      sourceLanguageId: "en",
      targetLanguageId: "eu",
      imageSrc: "/mascot.svg",
      description: "Master Euskara from A1 foundations to C1 fluency with 46 modules and 3-step crown mastery.",
    },
  ],
  sections: ${JSON.stringify(sections, null, 2)},
  units: ${JSON.stringify(units, null, 2)},
  rings: ${JSON.stringify(rings, null, 2)},
  lessons: ${JSON.stringify(lessons, null, 2)},
  challenges: ${JSON.stringify(challenges, null, 2)},
  initialUser: {
    userId: "user_euskaldun",
    userName: "Euskaldun Learner",
    userImageSrc: "/mascot.svg",
    activeCourseId: 1,
    hearts: 5,
    points: 0,
    streak: 0,
    gems: 100,
    hasActiveSubscription: false,
  },
};
`;

  fs.writeFileSync(TARGET_SEED_FILE, content, 'utf8');
}

function writeTranslateChallengeDictionary(dictionary) {
  // Read current TranslateChallenge file
  let code = fs.readFileSync(TARGET_TRANSLATE_FILE, 'utf8');

  // We find const BASQUE_TO_ENGLISH: Record<string, string> = { ... } and replace it
  const dictStartStr = 'export const BASQUE_TO_ENGLISH: Record<string, string> = {';
  const startIdx = code.indexOf(dictStartStr);
  if (startIdx === -1) {
    console.error("Could not find BASQUE_TO_ENGLISH dictionary start in TranslateChallenge.tsx");
    return;
  }

  // Find closing brace of the dictionary
  // Note: we can parse it by matching braces
  let braceCount = 1;
  let endIdx = -1;
  for (let i = startIdx + dictStartStr.length; i < code.length; i++) {
    if (code[i] === '{') {
      braceCount++;
    } else if (code[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) {
    console.error("Could not find closing brace for BASQUE_TO_ENGLISH in TranslateChallenge.tsx");
    return;
  }

  // Generate new dictionary body string
  const dictItems = Object.entries(dictionary).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
  const newDictDeclaration = `export const BASQUE_TO_ENGLISH: Record<string, string> = {\n${dictItems}\n}`;

  // Replace
  const before = code.slice(0, startIdx);
  const after = code.slice(endIdx + 1);
  const updatedCode = before + newDictDeclaration + after;

  fs.writeFileSync(TARGET_TRANSLATE_FILE, updatedCode, 'utf8');
}

runRebase();
