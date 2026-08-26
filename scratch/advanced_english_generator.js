const fs = require('fs');
const path = require('path');

const challengesPath = path.join(__dirname, '../data/courses/1/challenges.json');
const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

console.log(`Checking English translation challenges across ${challenges.length} challenges...`);

// Advanced Natural English Linguistic Generator
function generateNaturalEnglishVariations(target, prompt = "") {
  const variations = new Set();
  if (!target || !target.trim()) return [];

  const base = target.trim();
  variations.add(base);

  // 0. Clean artifacts like "male", "female", "Youplural"
  function cleanArtifacts(text) {
    const res = new Set([text]);
    if (/\b(cousin\s+male|cousin\s+female)\b/i.test(text)) {
      res.add(text.replace(/\bcousin\s+male\b/gi, "cousin").replace(/\bcousin\s+female\b/gi, "cousin"));
    }
    if (/\bYouplural\b/i.test(text)) {
      res.add(text.replace(/\bYouplural\b/g, "You"));
      res.add(text.replace(/\bYouplural\b/g, "You all"));
    }
    return Array.from(res);
  }

  // 1. Indefinite article: "one [noun]" <-> "a/an [noun]"
  function expandIndefiniteArticle(text) {
    const res = new Set([text]);
    
    // Replace "one [noun]" with "a/an [noun]"
    const oneMatches = text.match(/\b(one)\s+([a-z]+)\b/gi);
    if (oneMatches) {
      let replaced = text;
      replaced = replaced.replace(/\b(one)\s+(teacher|student|boy|girl|woman|man|fat cat|thin dog|cat|dog|owl|chicken|bird|purse|bag|car|house|pen|bottle of water|bottle|season|doctor|nurse|cook|chef|driver|waiter|stranger|friend|police officer|tourist|animal|person|snake|turtle|pig|horse|cow|sheep|goat|wolf|fish|book|hotel|inn|shop|store|school|restaurant|bar|street|table|door|window|shirt|dress|skirt|coat|sweater|jacket|apple|banana|lemon|pear|strawberry|peach)\b/gi, (match, oneWord, noun) => {
        const startsWithVowel = /^[aeiou]/i.test(noun);
        const art = startsWithVowel ? (oneWord[0] === 'O' ? 'An' : 'an') : (oneWord[0] === 'O' ? 'A' : 'a');
        return `${art} ${noun}`;
      });
      res.add(replaced);
    }

    // Also if target had "a/an [noun]", allow "one [noun]" as literal fallback
    const artMatches = text.match(/\b(a|an)\s+([a-z]+)\b/gi);
    if (artMatches) {
      let replaced = text;
      replaced = replaced.replace(/\b(a|an)\s+(teacher|student|boy|girl|woman|man|fat cat|thin dog|cat|dog|owl|chicken|bird|purse|bag|car|house|pen|bottle of water|bottle|season|doctor|nurse|cook|chef|driver|waiter|stranger|friend|police officer|tourist|animal|person|snake|turtle|pig|horse|cow|sheep|goat|wolf|fish|book|hotel|inn|shop|store|school|restaurant|bar|street|table|door|window|shirt|dress|skirt|coat|sweater|jacket|apple|banana|lemon|pear|strawberry|peach)\b/gi, (match, art, noun) => {
        const one = art[0] === 'A' ? 'One' : 'one';
        return `${one} ${noun}`;
      });
      res.add(replaced);
    }

    return Array.from(res);
  }

  // 2. Greetings and salutations: "Hi" <-> "Hello" <-> "Hey", "Sorry" <-> "Excuse me"
  function expandGreetings(text) {
    const res = new Set([text]);

    const greetingPatterns = [
      [/^Hi\b/i, ["Hi", "Hello", "Hey"]],
      [/^Hello\b/i, ["Hello", "Hi", "Hey"]],
      [/^Hey\b/i, ["Hey", "Hi", "Hello"]],
      [/^Excuse me\b/i, ["Excuse me", "Sorry", "Pardon"]],
      [/^Sorry\b/i, ["Sorry", "Excuse me", "Pardon"]],
      [/^Good morning\b/i, ["Good morning", "Good day"]],
      [/^Good afternoon\b/i, ["Good afternoon", "Good day"]],
      [/^Good night\b/i, ["Good night", "Good evening"]],
      [/^Thank you\b/i, ["Thank you", "Thanks"]],
      [/^Thanks\b/i, ["Thanks", "Thank you"]],
      [/^Welcome\b/i, ["Welcome", "You are welcome", "You're welcome"]]
    ];

    for (const [regex, alts] of greetingPatterns) {
      if (regex.test(text)) {
        for (const alt of alts) {
          res.add(text.replace(regex, alt));
        }
      }
    }

    return Array.from(res);
  }

  // 3. Additive Adverbials: "also" <-> "too" <-> "as well"
  function expandAlsoToo(text) {
    const res = new Set([text]);

    const alsoMatch = text.match(/^(.+?)\s+(am|is|are|was|were)\s+also\s+(.+)$/i);
    if (alsoMatch) {
      const subj = alsoMatch[1];
      const be = alsoMatch[2];
      const pred = alsoMatch[3].replace(/[.,!?]$/, "");
      const endPunct = text.match(/[.,!?]$/) ? text.match(/[.,!?]$/)[0] : "";

      res.add(`${subj} ${be} ${pred} too${endPunct}`);
      res.add(`${subj} ${be} ${pred} as well${endPunct}`);
      res.add(`${subj} also ${be} ${pred}${endPunct}`);
      res.add(`${subj} too ${be} ${pred}${endPunct}`);
    }

    const tooMatch = text.match(/^(.+?)\s+(am|is|are|was|were)\s+(.+?)\s+too([.,!?]?)$/i);
    if (tooMatch) {
      const subj = tooMatch[1];
      const be = tooMatch[2];
      const pred = tooMatch[3];
      const endPunct = tooMatch[4] || "";

      res.add(`${subj} ${be} also ${pred}${endPunct}`);
      res.add(`${subj} ${be} ${pred} as well${endPunct}`);
      res.add(`${subj} also ${be} ${pred}${endPunct}`);
    }

    const alsoVerbMatch = text.match(/^(.+?)\s+also\s+([a-z]+)\s+(.+)$/i);
    if (alsoVerbMatch && !["am", "is", "are", "was", "were"].includes(alsoVerbMatch[2].toLowerCase())) {
      const subj = alsoVerbMatch[1];
      const verb = alsoVerbMatch[2];
      const rest = alsoVerbMatch[3].replace(/[.,!?]$/, "");
      const endPunct = text.match(/[.,!?]$/) ? text.match(/[.,!?]$/)[0] : "";

      res.add(`${subj} ${verb} ${rest} too${endPunct}`);
      res.add(`${subj} ${verb} ${rest} as well${endPunct}`);
    }

    return Array.from(res);
  }

  // 4. Contraction pairs
  const contractionPairs = [
    [/\bI am\b/g, "I'm"],
    [/\bYou are\b/g, "You're"],
    [/\byou are\b/g, "you're"],
    [/\bHe is\b/g, "He's"],
    [/\bhe is\b/g, "he's"],
    [/\bShe is\b/g, "She's"],
    [/\bshe is\b/g, "she's"],
    [/\bIt is\b/g, "It's"],
    [/\bit is\b/g, "it's"],
    [/\bWe are\b/g, "We're"],
    [/\bwe are\b/g, "we're"],
    [/\bThey are\b/g, "They're"],
    [/\bthey are\b/g, "they're"],
    [/\bThere is\b/g, "There's"],
    [/\bthere is\b/g, "there's"],
    [/\bThat is\b/g, "That's"],
    [/\bthat is\b/g, "that's"],
    [/\bWhat is\b/g, "What's"],
    [/\bwhat is\b/g, "what's"],
    [/\bWhere is\b/g, "Where's"],
    [/\bwhere is\b/g, "where's"],
    [/\bWho is\b/g, "Who's"],
    [/\bwho is\b/g, "who's"],
    [/\bHow is\b/g, "How's"],
    [/\bhow is\b/g, "how's"],
    [/\bWhen is\b/g, "When's"],
    [/\bwhen is\b/g, "when's"],
    [/\bWhy is\b/g, "Why's"],
    [/\bwhy is\b/g, "why's"],
    [/\bI have\b/g, "I've"],
    [/\bYou have\b/g, "You've"],
    [/\byou have\b/g, "you've"],
    [/\bWe have\b/g, "We've"],
    [/\bwe have\b/g, "we've"],
    [/\bThey have\b/g, "They've"],
    [/\bthey have\b/g, "they've"],
    [/\bI will\b/g, "I'll"],
    [/\bYou will\b/g, "You'll"],
    [/\byou will\b/g, "you'll"],
    [/\bHe will\b/g, "He'll"],
    [/\bhe will\b/g, "he'll"],
    [/\bShe will\b/g, "She'll"],
    [/\bshe will\b/g, "she'll"],
    [/\bIt will\b/g, "It'll"],
    [/\bit will\b/g, "it'll"],
    [/\bWe will\b/g, "We'll"],
    [/\bwe will\b/g, "we'll"],
    [/\bThey will\b/g, "They'll"],
    [/\bthey will\b/g, "they'll"],
    [/\bdo not\b/g, "don't"],
    [/\bDo not\b/g, "Don't"],
    [/\bdoes not\b/g, "doesn't"],
    [/\bDoes not\b/g, "Doesn't"],
    [/\bdid not\b/g, "didn't"],
    [/\bDid not\b/g, "Didn't"],
    [/\bcannot\b/g, "can't"],
    [/\bCannot\b/g, "Can't"],
    [/\bcan not\b/g, "can't"],
    [/\bCan not\b/g, "Can't"],
    [/\bwill not\b/g, "won't"],
    [/\bWill not\b/g, "Won't"],
    [/\bis not\b/g, "isn't"],
    [/\bIs not\b/g, "Isn't"],
    [/\bare not\b/g, "aren't"],
    [/\bAre not\b/g, "Aren't"],
    [/\bwas not\b/g, "wasn't"],
    [/\bWas not\b/g, "Wasn't"],
    [/\bwere not\b/g, "weren't"],
    [/\bWere not\b/g, "Weren't"]
  ];

  const expansionPairs = [
    [/\bI'm\b/g, "I am"],
    [/\bYou're\b/g, "You are"],
    [/\byou're\b/g, "you are"],
    [/\bHe's\b/g, "He is"],
    [/\bhe's\b/g, "he is"],
    [/\bShe's\b/g, "She is"],
    [/\bshe's\b/g, "she is"],
    [/\bIt's\b/g, "It is"],
    [/\bit's\b/g, "it is"],
    [/\bWe're\b/g, "We are"],
    [/\bwe're\b/g, "we are"],
    [/\bThey're\b/g, "They are"],
    [/\bthey're\b/g, "they are"],
    [/\bThere's\b/g, "There is"],
    [/\bthere's\b/g, "there is"],
    [/\bThat's\b/g, "That is"],
    [/\bthat's\b/g, "that is"],
    [/\bWhat's\b/g, "What is"],
    [/\bwhat's\b/g, "what is"],
    [/\bWhere's\b/g, "Where is"],
    [/\bwhere's\b/g, "where is"],
    [/\bWho's\b/g, "Who is"],
    [/\bwho's\b/g, "who is"],
    [/\bHow's\b/g, "How is"],
    [/\bhow's\b/g, "how is"],
    [/\bWhen's\b/g, "When is"],
    [/\bwhen's\b/g, "when is"],
    [/\bWhy's\b/g, "Why is"],
    [/\bwhy's\b/g, "why is"],
    [/\bI've\b/g, "I have"],
    [/\bYou've\b/g, "You have"],
    [/\byou've\b/g, "you have"],
    [/\bWe've\b/g, "We have"],
    [/\bwe've\b/g, "we have"],
    [/\bThey've\b/g, "They have"],
    [/\bthey've\b/g, "they have"],
    [/\bI'll\b/g, "I will"],
    [/\bYou'll\b/g, "You will"],
    [/\byou'll\b/g, "you will"],
    [/\bHe'll\b/g, "He will"],
    [/\bhe'll\b/g, "he will"],
    [/\bShe'll\b/g, "She will"],
    [/\bshe'll\b/g, "she will"],
    [/\bIt'll\b/g, "It will"],
    [/\bit'll\b/g, "it will"],
    [/\bWe'll\b/g, "We will"],
    [/\bwe'll\b/g, "we will"],
    [/\bThey'll\b/g, "They will"],
    [/\bthey'll\b/g, "they will"],
    [/\bdon't\b/g, "do not"],
    [/\bDon't\b/g, "Do not"],
    [/\bdoesn't\b/g, "does not"],
    [/\bDoesn't\b/g, "Does not"],
    [/\bdidn't\b/g, "did not"],
    [/\bDidn't\b/g, "Did not"],
    [/\bcan't\b/g, "cannot"],
    [/\bCan't\b/g, "Cannot"],
    [/\bwon't\b/g, "will not"],
    [/\bWon't\b/g, "Will not"],
    [/\bisn't\b/g, "is not"],
    [/\bIsn't\b/g, "Is not"],
    [/\baren't\b/g, "are not"],
    [/\bAren't\b/g, "Are not"],
    [/\bwasn't\b/g, "was not"],
    [/\bWasn't\b/g, "Was not"],
    [/\bweren't\b/g, "were not"],
    [/\bWeren't\b/g, "Were not"]
  ];

  function applyContractions(text) {
    const res = new Set([text]);
    for (const [regex, rep] of contractionPairs) {
      if (regex.test(text)) {
        res.add(text.replace(regex, rep));
      }
    }
    for (const [regex, rep] of expansionPairs) {
      if (regex.test(text)) {
        res.add(text.replace(regex, rep));
      }
    }
    return Array.from(res);
  }

  // 5. Punctuation and multi-clause phrasing
  function expandPunctuation(text) {
    const res = new Set([text]);
    
    // Stripped punctuation
    res.add(text.replace(/[.,!?]/g, "").trim());
    
    // Greeting at start
    const words = text.trim().split(/\s+/);
    if (words.length >= 2 && /^(Hi|Hello|Hey|Sorry|Excuse\s+me|Welcome|Good\s+morning|Good\s+afternoon|Good\s+night|Good\s+evening|Thank\s+you|Thanks|Yes|No)$/i.test(words[0])) {
      const g = words[0];
      const rest = words.slice(1).join(" ");
      const restCap = rest.charAt(0).toUpperCase() + rest.slice(1);
      
      res.add(`${g}. ${restCap}`);
      res.add(`${g}, ${rest}`);
      res.add(`${g}! ${restCap}`);
      res.add(`${g} ${rest}`);
      res.add(`${g}. ${restCap}.`);
      res.add(`${g}, ${rest}.`);
      res.add(`${g}! ${restCap}.`);
    }

    // Check multi-sentence with pronouns: e.g. "You are Aitor You are a student"
    const sentenceBreakRegex = /([a-z0-9])\s+(I|You|He|She|It|We|They|There)\b/g;
    if (sentenceBreakRegex.test(text)) {
      res.add(text.replace(sentenceBreakRegex, "$1. $2"));
      res.add(text.replace(sentenceBreakRegex, "$1. $2") + ".");
      res.add(text.replace(sentenceBreakRegex, "$1, $2"));
      res.add(text.replace(sentenceBreakRegex, "$1, $2") + ".");
    }

    // Trailing period variants for statements
    if (!text.endsWith("?")) {
      res.add(text.replace(/[.,!?]$/, "") + ".");
      res.add(text.replace(/[.,!?]$/, ""));
    }

    return Array.from(res);
  }

  // Transformation pipeline
  let currentSet = new Set([base]);

  // Step 0: Artifacts
  const afterArtifacts = new Set();
  currentSet.forEach(s => cleanArtifacts(s).forEach(x => afterArtifacts.add(x)));
  currentSet = afterArtifacts;

  // Step 1: Indefinite article expansion
  const afterIndef = new Set();
  currentSet.forEach(s => expandIndefiniteArticle(s).forEach(x => afterIndef.add(x)));
  currentSet = afterIndef;

  // Step 2: Also/too expansion
  const afterAlso = new Set();
  currentSet.forEach(s => expandAlsoToo(s).forEach(x => afterAlso.add(x)));
  currentSet = afterAlso;

  // Step 3: Greetings expansion
  const afterGreetings = new Set();
  currentSet.forEach(s => expandGreetings(s).forEach(x => afterGreetings.add(x)));
  currentSet = afterGreetings;

  // Step 4: Contractions
  const afterContractions = new Set();
  currentSet.forEach(s => applyContractions(s).forEach(x => afterContractions.add(x)));
  currentSet = afterContractions;

  // Step 5: Punctuation and phrasing
  const finalSet = new Set();
  currentSet.forEach(s => expandPunctuation(s).forEach(x => finalSet.add(x)));

  const results = [];
  results.push(base);

  for (const item of finalSet) {
    const trimmed = item.replace(/\s+/g, " ").trim();
    if (trimmed && !results.includes(trimmed)) {
      results.push(trimmed);
    }
  }

  return results;
}

module.exports = {
  generateNaturalEnglishVariations
};
