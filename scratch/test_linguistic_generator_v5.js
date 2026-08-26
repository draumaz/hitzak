const fs = require('fs');
const path = require('path');

const NOUN_FORMS = [
  // root, sgDef, sgIndef, plDef, plIndef
  ["gizon", "gizona", "gizon bat", "gizonak", "gizon batzuk"],
  ["emakume", "emakumea", "emakume bat", "emakumeak", "emakume batzuk"],
  ["mutil", "mutila", "mutil bat", "mutilak", "mutil batzuk"],
  ["neska", "neska", "neska bat", "neskak", "neska batzuk"],
  ["ume", "umea", "ume bat", "umeak", "ume batzuk"],
  ["haur", "haurra", "haur bat", "haurrak", "haur batzuk"],
  ["ikasle", "ikaslea", "ikasle bat", "ikasleak", "ikasle batzuk"],
  ["irakasle", "irakaslea", "irakasle bat", "irakasleak", "irakasle batzuk"],
  ["mediku", "medikua", "mediku bat", "medikuak", "mediku batzuk"],
  ["erizain", "erizaina", "erizain bat", "erizainak", "erizain batzuk"],
  ["sukaldari", "sukaldaria", "sukaldari bat", "sukaldariak", "sukaldari batzuk"],
  ["gidari", "gidaria", "gidari bat", "gidariak", "gidari batzuk"],
  ["camarero", "camareroa", "camarero bat", "camareroak", "camarero batzuk"],
  ["zerbitzari", "zerbitzaria", "zerbitzari bat", "zerbitzariak", "zerbitzari batzuk"],
  ["apaiz", "apaiza", "apaiz bat", "apaizak", "apaiz batzuk"],
  ["etxekoandre", "etxekoandrea", "etxekoandre bat", "etxekoandreak", "etxekoandre batzuk"],
  ["arrotz", "arrotza", "arrotz bat", "arrotzak", "arrotz batzuk"],
  ["lagun", "laguna", "lagun bat", "lagunak", "lagun batzuk"],
  ["polizia", "polizia", "polizia bat", "poliziak", "polizia batzuk"],
  ["turista", "turista", "turista bat", "turistak", "turista batzuk"],
  ["txakur", "txakurra", "txakur bat", "txakurrak", "txakur batzuk"],
  ["katu", "katua", "katu bat", "katuak", "katu batzuk"],
  ["zaldi", "zaldia", "zaldi bat", "zaldiak", "zaldi batzuk"],
  ["behi", "behia", "behi bat", "behiak", "behi batzuk"],
  ["txori", "txoria", "txori bat", "txoriak", "txori batzuk"],
  ["arrain", "arraina", "arrain bat", "arrainak", "arrain batzuk"],
  ["otso", "otsoa", "otso bat", "otsoak", "otso batzuk"],
  ["ardi", "ardia", "ardi bat", "ardiak", "ardi batzuk"],
  ["ahuntz", "ahuntza", "ahuntz bat", "ahuntzak", "ahuntz batzuk"],
  ["suge", "sugea", "suge bat", "sugeak", "suge batzuk"],
  ["hontz", "hontza", "hontz bat", "hontzak", "hontz batzuk"],
  ["dortoka", "dortoka", "dortoka bat", "dortokak", "dortoka batzuk"],
  ["txerri", "txerria", "txerri bat", "txerriak", "txerri batzuk"],
  ["oilo", "oiloa", "oilo bat", "oiloak", "oilo batzuk"],
  ["sagu", "sagua", "sagu bat", "saguak", "sagu batzuk"],
  ["animalia", "animalia", "animalia bat", "animaliak", "animalia batzuk"],
  ["pertsona", "pertsona", "pertsona bat", "pertsonak", "pertsona batzuk"],
  ["seme", "semea", "seme bat", "semeak", "seme batzuk"],
  ["alaba", "alaba", "alaba bat", "alabak", "alaba batzuk"],
  ["semealaba", "semealaba", "semealaba bat", "semealabak", "semealaba batzuk"],
  ["semealba", "semealba", "semealba bat", "semealbak", "semealba batzuk"],
  ["aita", "aita", "aita bat", "aitak", "aita batzuk"],
  ["ama", "ama", "ama bat", "amak", "ama batzuk"],
  ["anaia", "anaia", "anaia bat", "anaiak", "anaia batzuk"],
  ["arreba", "arreba", "arreba bat", "arrebak", "arreba batzuk"],
  ["ahizpa", "ahizpa", "ahizpa bat", "ahizpak", "ahizpa batzuk"],
  ["neba", "neba", "neba bat", "nebak", "neba batzuk"],
  ["izeba", "izeba", "izeba bat", "izebak", "izeba batzuk"],
  ["osaba", "osaba", "osaba bat", "osabak", "osaba batzuk"],
  ["aitona", "aitona", "aitona bat", "aitonak", "aitona batzuk"],
  ["amona", "amona", "amona bat", "amonak", "amona batzuk"],
  ["senar", "senarra", "senar bat", "senarrak", "senar batzuk"],
  ["emazte", "emaztea", "emazte bat", "emazteak", "emazte batzuk"],
  ["lehengusu", "lehengusua", "lehengusu bat", "lehengusuak", "lehengusu batzuk"],
  ["mutillagun", "mutillaguna", "mutillagun bat", "mutillagunak", "mutillagun batzuk"],
  ["neskalagun", "neskalaguna", "neskalagun bat", "neskalagunak", "neskalagun batzuk"],
  ["guraso", "gurasoa", "guraso bat", "gurasoak", "guraso batzuk"],
  ["urtaro", "urtaroa", "urtaro bat", "urtaroak", "urtaro batzuk"],
  ["egun", "eguna", "egun bat", "egunak", "egun batzuk"],
  ["hilabete", "hilabetea", "hilabete bat", "hilabeteak", "hilabete batzuk"],
  ["urte", "urtea", "urte bat", "urteak", "urte batzuk"],
  ["kotxe", "kotxea", "kotxe bat", "kotxeak", "kotxe batzuk"],
  ["auto", "autoa", "auto bat", "autoak", "auto batzuk"],
  ["autobus", "autobusa", "autobus bat", "autobusak", "autobus batzuk"],
  ["tren", "trena", "tren bat", "trenak", "tren batzuk"],
  ["hegazkin", "hegazkina", "hegazkin bat", "hegazkinak", "hegazkin batzuk"],
  ["kamioi", "kamioia", "kamioi bat", "kamioiak", "kamioi batzuk"],
  ["liburu", "liburua", "liburu bat", "liburuak", "liburu batzuk"],
  ["etxe", "etxea", "etxe bat", "etxeak", "etxe batzuk"],
  ["hotel", "hotela", "hotel bat", "hotelak", "hotel batzuk"],
  ["ostatu", "ostatua", "ostatu bat", "ostatuak", "ostatu batzuk"],
  ["denda", "denda", "denda bat", "dendak", "denda batzuk"],
  ["eskola", "eskola", "eskola bat", "eskolak", "eskola batzuk"],
  ["jatetxe", "jatetxea", "jatetxe bat", "jatetxeak", "jatetxe batzuk"],
  ["taberna", "taberna", "taberna bat", "tabernak", "taberna batzuk"],
  ["plaza", "plaza", "plaza bat", "plazak", "plaza batzuk"],
  ["hizkuntza", "hizkuntza", "hizkuntza bat", "hizkuntzak", "hizkuntza batzuk"],
  ["ate", "atea", "ate bat", "ateak", "ate batzuk"],
  ["leiho", "leihoa", "leiho bat", "leihoak", "leiho batzuk"],
  ["mahai", "mahaia", "mahai bat", "mahaiak", "mahai batzuk"],
  ["poltsa", "poltsa", "poltsa bat", "poltsak", "poltsa batzuk"],
  ["zorro", "zorroa", "zorro bat", "zorroak", "zorro batzuk"],
  ["motxila", "motxila", "motxila bat", "motxilak", "motxila batzuk"],
  ["soineko", "soinekoa", "soineko bat", "soinekoak", "soineko batzuk"],
  ["txano", "txanoa", "txano bat", "txanoak", "txano batzuk"],
  ["jertse", "jertsea", "jertse bat", "jertseak", "jertse batzuk"],
  ["alkandora", "alkandora", "alkandora bat", "alkandorak", "alkandora batzuk"],
  ["gona", "gona", "gona bat", "gonak", "gona batzuk"],
  ["beroki", "berokia", "beroki bat", "berokiak", "beroki batzuk"],
  ["sagar", "sagarra", "sagar bat", "sagarrak", "sagar batzuk"],
  ["banana", "banana", "banana bat", "bananak", "banana batzuk"],
  ["limoi", "limoia", "limoi bat", "limoiak", "limoi batzuk"],
  ["madari", "madaria", "madari bat", "madariak", "madari batzuk"],
  ["marrubi", "marrubia", "marrubi bat", "marrubiak", "marrubi batzuk"],
  ["melokotoi", "melokotoia", "melokotoi bat", "melokotoiak", "melokotoi batzuk"],
  ["idazle", "idazlea", "idazle bat", "idazleak", "idazle batzuk"],
  ["aktore", "aktorea", "aktore bat", "aktoreak", "aktore batzuk"],
  ["abokatu", "abokatua", "abokatu bat", "abokatuak", "abokatu batzuk"],
  ["arkitekto", "arkitektoa", "arkitekto bat", "arkitektoak", "arkitekto batzuk"],
  ["pilotari", "pilotaria", "pilotari bat", "pilotariak", "pilotari batzuk"],
  ["kantari", "kantaria", "kantari bat", "kantariak", "kantari batzuk"],
  ["dantzari", "dantzaria", "dantzari bat", "dantzariak", "dantzari batzuk"],
  ["txirrindulari", "txirrindularia", "txirrindulari bat", "txirrindulariak", "txirrindulari batzuk"],
  ["futbolari", "futbolaria", "futbolari bat", "futbolariak", "futbolari batzuk"],
  ["arotz", "arotza", "arotz bat", "arotzak", "arotz batzuk"]
];

// Build fast lookup maps
const PRED_SG_DEF_TO_INDEF = new Map(); // e.g. "gizona" -> "gizon bat"
const PRED_SG_INDEF_TO_DEF = new Map(); // e.g. "gizon bat" -> "gizona"
const PRED_PL_DEF_TO_INDEF = new Map(); // e.g. "gizonak" -> "gizon batzuk"
const PRED_PL_INDEF_TO_DEF = new Map(); // e.g. "gizon batzuk" -> "gizonak"

NOUN_FORMS.forEach(([root, sgDef, sgIndef, plDef, plIndef]) => {
  PRED_SG_DEF_TO_INDEF.set(sgDef.toLowerCase(), sgIndef.toLowerCase());
  PRED_SG_INDEF_TO_DEF.set(sgIndef.toLowerCase(), sgDef.toLowerCase());
  PRED_PL_DEF_TO_INDEF.set(plDef.toLowerCase(), plIndef.toLowerCase());
  PRED_PL_INDEF_TO_DEF.set(plIndef.toLowerCase(), plDef.toLowerCase());
  
  // also handle when root without -a was used loosely (e.g., "emakume", "neska")
  if (root.toLowerCase() !== sgDef.toLowerCase()) {
    PRED_SG_DEF_TO_INDEF.set(root.toLowerCase(), sgIndef.toLowerCase());
  }
});

console.log(`Loaded ${NOUN_FORMS.length} noun mappings.`);

module.exports = {
  NOUN_FORMS,
  PRED_SG_DEF_TO_INDEF,
  PRED_SG_INDEF_TO_DEF,
  PRED_PL_DEF_TO_INDEF,
  PRED_PL_INDEF_TO_DEF
};
