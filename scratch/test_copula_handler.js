const {
  VOCAB_MORPHOLOGY,
  PRED_SG_DEF_TO_INDEF,
  PRED_SG_INDEF_TO_DEF,
  PRED_PL_DEF_TO_INDEF,
  PRED_PL_INDEF_TO_DEF
} = require('./test_linguistic_generator_v6.js');
const { getPredicateNominalVariants } = require('./test_phrase_transformer.js');

const COPULAS = ["naiz", "zara", "da", "gara", "zarete", "dira", "nintzen", "zinen", "zen", "ginen", "zineten", "ziren"];
const COPULA_PRONOUNS = {
  "naiz": "ni", "nintzen": "ni",
  "zara": "zu", "zinen": "zu",
  "da": "hura", "zen": "hura",
  "gara": "gu", "ginen": "gu",
  "zarete": "zuek", "zineten": "zuek",
  "dira": "haiek", "ziren": "haiek"
};
const ALL_PRONOUNS = new Set(["ni", "zu", "hura", "gu", "zuek", "haiek"]);
const PROPER_NOUNS = new Set(["mikel", "miren", "aitor", "terese", "jon", "joseba", "aintza", "karmele", "arantxa", "ainhoa"]);

function cleanWord(w) {
  return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
}

function generateCopulaVariations(clause, prompt = "") {
  const variations = new Set();
  variations.add(clause.trim());

  const words = clause.trim().split(/\s+/);
  const cleanWords = words.map(cleanWord);
  const copulaIdx = cleanWords.findIndex(w => COPULAS.includes(w));

  if (copulaIdx === -1) return [clause];

  const copula = cleanWords[copulaIdx];
  const impliedPronoun = COPULA_PRONOUNS[copula];
  const isNegative = cleanWords.includes("ez");

  if (!isNegative) {
    const ereIdx = cleanWords.indexOf("ere");

    // Case A: Copula at the end (e.g. "Zu ikasle bat zara", "Miren ere irakaslea da", "Ni mutila naiz")
    if (copulaIdx === cleanWords.length - 1 && cleanWords.length >= 2) {
      const beforeCopula = words.slice(0, copulaIdx);

      if (ereIdx !== -1 && ereIdx < copulaIdx) {
        const subjWords = beforeCopula.slice(0, ereIdx);
        const predWords = beforeCopula.slice(ereIdx + 1);
        const subjStr = subjWords.join(" ");
        const predStr = predWords.join(" ");

        if (subjStr && predStr) {
          const predVariants = getPredicateNominalVariants(predStr);
          predVariants.forEach(pv => {
            const baCopula = "ba" + copula;
            variations.add(`${subjStr} ere ${pv} ${copula}`);
            variations.add(`${subjStr} ${pv} ere ${baCopula}`);
            variations.add(`${pv} ere ${baCopula} ${subjStr.toLowerCase()}`);
            variations.add(`${pv} ere ${copula} ${subjStr.toLowerCase()}`);
            variations.add(`${subjStr} ${copula} ere ${pv}`);
            if (ALL_PRONOUNS.has(cleanWord(subjStr))) {
              variations.add(`${pv} ere ${baCopula}`);
              variations.add(`${pv} ere ${copula}`);
              variations.add(`${pv} ${copula} ere`);
            }
          });
        }
      } else {
        let candidateSubj = "";
        let candidatePredWords = [];

        const firstWordClean = cleanWord(beforeCopula[0]);
        if (ALL_PRONOUNS.has(firstWordClean)) {
          candidateSubj = beforeCopula[0];
          candidatePredWords = beforeCopula.slice(1);
        } else if (PROPER_NOUNS.has(firstWordClean) && beforeCopula.length > 1) {
          if (beforeCopula.length >= 3 && cleanWord(beforeCopula[1]) === "eta" && PROPER_NOUNS.has(cleanWord(beforeCopula[2]))) {
            candidateSubj = beforeCopula.slice(0, 3).join(" ");
            candidatePredWords = beforeCopula.slice(3);
          } else {
            candidateSubj = beforeCopula[0];
            candidatePredWords = beforeCopula.slice(1);
          }
        } else if (beforeCopula.length === 1) {
          candidateSubj = "";
          candidatePredWords = beforeCopula;
        } else if (beforeCopula.length >= 2) {
          if (firstWordClean === "gure" || firstWordClean === "zure" || firstWordClean === "nire" || firstWordClean === "haien" || firstWordClean === "bere") {
            candidateSubj = beforeCopula.slice(0, 2).join(" ");
            candidatePredWords = beforeCopula.slice(2);
          } else if (firstWordClean.endsWith("ren") || firstWordClean.endsWith("aren")) {
            candidateSubj = beforeCopula.slice(0, 2).join(" ");
            candidatePredWords = beforeCopula.slice(2);
          } else {
            candidateSubj = beforeCopula[0];
            candidatePredWords = beforeCopula.slice(1);
          }
        }

        const predStr = candidatePredWords.filter(w => cleanWord(w) !== "al").join(" ");

        if (predStr) {
          const predVariants = getPredicateNominalVariants(predStr);
          predVariants.forEach(pv => {
            if (candidateSubj) {
              const isPronoun = ALL_PRONOUNS.has(cleanWord(candidateSubj));
              variations.add(`${candidateSubj} ${pv} ${copula}`);
              variations.add(`${pv} ${copula} ${candidateSubj.toLowerCase()}`);
              variations.add(`${candidateSubj} ${copula} ${pv}`);

              if (isPronoun) {
                variations.add(`${pv} ${copula}`);
              }
            } else {
              variations.add(`${pv} ${copula}`);
              if (impliedPronoun) {
                variations.add(`${impliedPronoun} ${pv} ${copula}`);
                variations.add(`${pv} ${copula} ${impliedPronoun}`);
                variations.add(`${impliedPronoun} ${copula} ${pv}`);
              }
            }
          });
        }
      }
    } else if (copulaIdx > 0 && copulaIdx < cleanWords.length - 1) {
      // Case B: Copula in the middle (e.g. "Nire lehengusua da ere camareroa", "Hau da Irungo bidea", "Euskara da Euskal Herriko hizkuntza")
      const beforeCopula = words.slice(0, copulaIdx);
      const afterCopula = words.slice(copulaIdx + 1);

      const subjStr = beforeCopula.join(" ");
      let predStr = "";
      const hasEre = afterCopula.some(w => cleanWord(w) === "ere");

      if (hasEre) {
        predStr = afterCopula.filter(w => cleanWord(w) !== "ere").join(" ");
      } else {
        predStr = afterCopula.join(" ");
      }

      if (subjStr && predStr) {
        const predVariants = getPredicateNominalVariants(predStr);
        predVariants.forEach(pv => {
          if (hasEre) {
            const baCopula = "ba" + copula;
            variations.add(`${subjStr} ere ${pv} ${copula}`);
            variations.add(`${subjStr} ${pv} ere ${baCopula}`);
            variations.add(`${pv} ere ${baCopula} ${subjStr.toLowerCase()}`);
            variations.add(`${pv} ere ${copula} ${subjStr.toLowerCase()}`);
            variations.add(`${subjStr} ${copula} ere ${pv}`);
            if (ALL_PRONOUNS.has(cleanWord(subjStr))) {
              variations.add(`${pv} ere ${baCopula}`);
              variations.add(`${pv} ere ${copula}`);
              variations.add(`${pv} ${copula} ere`);
            }
          } else {
            variations.add(`${subjStr} ${pv} ${copula}`);
            variations.add(`${subjStr} ${copula} ${pv}`);
            variations.add(`${pv} ${copula} ${subjStr.toLowerCase()}`);
            if (ALL_PRONOUNS.has(cleanWord(subjStr))) {
              variations.add(`${pv} ${copula}`);
            }
          }
        });
      }
    }
  }

  return Array.from(variations);
}

// Test #1721
console.log("=== #1721 ===");
console.log(generateCopulaVariations("Nire lehengusua da ere camareroa"));

// Test #4350
console.log("\n=== #4350 ===");
console.log(generateCopulaVariations("Euskara da Euskal Herriko hizkuntza"));

// Test "Zu ikasle bat zara"
console.log("\n=== Zu ikasle bat zara ===");
console.log(generateCopulaVariations("Zu ikasle bat zara"));
