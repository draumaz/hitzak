const {
  VOCAB_MORPHOLOGY,
  PRED_SG_DEF_TO_INDEF,
  PRED_SG_INDEF_TO_DEF,
  PRED_PL_DEF_TO_INDEF,
  PRED_PL_INDEF_TO_DEF
} = require('./test_linguistic_generator_v6.js');

function cleanWord(w) {
  return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
}

function getPredicateNominalVariants(phrase) {
  const p = phrase.trim().toLowerCase();
  const variants = new Set([phrase.trim()]);

  // 1. Direct table lookup
  if (PRED_SG_DEF_TO_INDEF.has(p)) {
    variants.add(PRED_SG_DEF_TO_INDEF.get(p));
  }
  if (PRED_SG_INDEF_TO_DEF.has(p)) {
    variants.add(PRED_SG_INDEF_TO_DEF.get(p));
  }
  if (PRED_PL_DEF_TO_INDEF.has(p)) {
    variants.add(PRED_PL_DEF_TO_INDEF.get(p));
  }
  if (PRED_PL_INDEF_TO_DEF.has(p)) {
    variants.add(PRED_PL_INDEF_TO_DEF.get(p));
  }

  // 2. Multi-word phrase ending in "bat" (indefinite singular -> definite singular)
  const batMatch = p.match(/^(.+)\s+bat$/);
  if (batMatch) {
    const head = batMatch[1].trim();
    const words = head.split(/\s+/);
    const lastWord = words[words.length - 1];
    const beforeLast = words.slice(0, -1).join(" ");

    let defLast = "";
    if (PRED_SG_INDEF_TO_DEF.has(lastWord + " bat")) {
      defLast = PRED_SG_INDEF_TO_DEF.get(lastWord + " bat");
    } else if (PRED_SG_DEF_TO_INDEF.has(lastWord) && PRED_SG_DEF_TO_INDEF.get(lastWord) === lastWord + " bat") {
      defLast = lastWord;
    } else if (lastWord.endsWith("a")) {
      defLast = lastWord;
    } else if (lastWord.endsWith("r") && !lastWord.endsWith("rr")) {
      defLast = lastWord + "ra";
    } else {
      defLast = lastWord + "a";
    }
    const defFull = beforeLast ? `${beforeLast} ${defLast}` : defLast;
    variants.add(defFull);
    variants.add(head); // also bare stem without bat (e.g. "ikasle", "emakume", "neska")
  }

  // 3. Multi-word phrase ending in "batzuk" (indefinite plural -> definite plural)
  const batzukMatch = p.match(/^(.+)\s+batzuk$/);
  if (batzukMatch) {
    const head = batzukMatch[1].trim();
    const words = head.split(/\s+/);
    const lastWord = words[words.length - 1];
    const beforeLast = words.slice(0, -1).join(" ");

    let plDefLast = "";
    if (PRED_PL_INDEF_TO_DEF.has(lastWord + " batzuk")) {
      plDefLast = PRED_PL_INDEF_TO_DEF.get(lastWord + " batzuk");
    } else if (lastWord.endsWith("a")) {
      plDefLast = lastWord + "k";
    } else if (lastWord.endsWith("r") && !lastWord.endsWith("rr")) {
      plDefLast = lastWord + "rak";
    } else {
      plDefLast = lastWord + "ak";
    }
    const plDefFull = beforeLast ? `${beforeLast} ${plDefLast}` : plDefLast;
    variants.add(plDefFull);
  }

  // 4. Definite noun / adjective phrase (singular or plural -> indefinite)
  if (!batMatch && !batzukMatch) {
    const words = p.split(/\s+/);
    const lastWord = words[words.length - 1];
    const beforeLast = words.slice(0, -1).join(" ");

    // Check direct match on lastWord in maps
    if (PRED_SG_DEF_TO_INDEF.has(lastWord)) {
      const indefLast = PRED_SG_DEF_TO_INDEF.get(lastWord);
      variants.add(beforeLast ? `${beforeLast} ${indefLast}` : indefLast);
    } else {
      // Dynamic fallback for any singular definite word ending in -a
      let indefLast = "";
      if (lastWord.endsWith("rra")) {
        indefLast = lastWord.slice(0, -2) + " bat";
      } else if (lastWord.endsWith("a") && lastWord.length > 2) {
        indefLast = lastWord.slice(0, -1) + " bat";
      }
      if (indefLast) {
        variants.add(beforeLast ? `${beforeLast} ${indefLast}` : indefLast);
      }
    }

    if (PRED_PL_DEF_TO_INDEF.has(lastWord)) {
      const indefPlLast = PRED_PL_DEF_TO_INDEF.get(lastWord);
      variants.add(beforeLast ? `${beforeLast} ${indefPlLast}` : indefPlLast);
    } else if (lastWord.endsWith("ak") && lastWord.length > 3) {
      let indefPlLast = "";
      if (lastWord.endsWith("rrak")) {
        indefPlLast = lastWord.slice(0, -3) + " batzuk";
      } else {
        indefPlLast = lastWord.slice(0, -2) + " batzuk";
      }
      if (indefPlLast) {
        variants.add(beforeLast ? `${beforeLast} ${indefPlLast}` : indefPlLast);
      }
    }
  }

  return Array.from(variants);
}

// Test cases
const testPhrases = [
  "ikaslea", "ikasle bat", "ikasle",
  "gizona", "gizon bat", "gizon",
  "emakumea", "emakume bat", "emakume",
  "mutila", "mutil bat", "mutil",
  "neska", "neska bat",
  "txakurra", "txakur bat",
  "txakur argala", "txakur argal bat",
  "kotxe beltza", "kotxe beltz bat",
  "denda gorria", "denda gorri bat",
  "autobus txiki berdea", "autobus txiki berde bat",
  "suge horia", "suge hori bat",
  "etxe berria", "etxe berri bat",
  "polizia", "polizia bat",
  "turista", "turista bat",
  "gida", "gida bat",
  "tour gida", "tour gida bat",
  "ikasleak", "ikasle batzuk",
  "gizonak", "gizon batzuk",
  "neskak", "neska batzuk"
];

console.log("=== Testing Predicate Nominal Variants ===");
testPhrases.forEach(tp => {
  const vars = getPredicateNominalVariants(tp);
  console.log(`"${tp}" =>`, vars);
});

module.exports = {
  getPredicateNominalVariants
};
