const fs = require('fs');

const sentences = JSON.parse(fs.readFileSync('scratch/all_unique_basque_sentences.json', 'utf8'));

// Check for common words that might be misspelled:
// hontz / hotz (owl vs cold)
// hontza / hotza
// txakur / txakurrak
// katu / katuak
// zaldi / zaldiak
// behi / behiak
// arrain / arrainak
// hegazti / txori

const checks = [];

sentences.forEach(s => {
  const p = s.prompt;
  const eng = s.english || '';

  // Check if English mentions 'owl' or 'owls' but Basque has 'hotz' instead of 'hontz'
  if (/\bowl(s)?\b/i.test(eng) && /\bhotz\b/i.test(p)) {
    checks.push({
      prompt: p,
      english: eng,
      issue: "'hotz' (cold) used instead of 'hontz' (owl)",
      fix: p.replace(/\bhotz\b/g, 'hontz')
    });
  }

  // Check if English mentions 'cook' or 'cooked' but Basque has 'egostiko'
  if (/\begostiko\b/i.test(p)) {
    checks.push({
      prompt: p,
      english: eng,
      issue: "'egostiko' is a hallucinated future participle",
      fix: p.replace(/\begostiko\b/g, 'egosiko')
    });
  }

  // Check other possible misspellings
  if (/\bhotzak\b/i.test(p) && /\bowl(s)?\b/i.test(eng)) {
    checks.push({
      prompt: p,
      english: eng,
      issue: "'hotzak' (cold) used instead of 'hontzak' (owls)",
      fix: p.replace(/\bhotzak\b/g, 'hontzak')
    });
  }
});

console.log("Found targeted checks:", checks.length);
checks.forEach(c => console.log(c));
