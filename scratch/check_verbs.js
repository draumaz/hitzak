const fs = require('fs');
const tokens = JSON.parse(fs.readFileSync('scratch/all_vocab_tokens.json', 'utf8'));

console.log("Checking all verbal forms...");

// Future participles:
// In Basque, standard future participle rules:
// - Verbs ending in -tu / -du -> replace -tu/-du with -tuko / -duko (or add -ko): e.g. lagundu -> lagunduko, bukatu -> bukatuko
// - Verbs ending in -i preceded by consonant:
//   * if stem ends in -s / -z / -x / -ts / -tz: egosi -> egosiko (NOT *egostiko!), erosi -> erosiko, ikusi -> ikusiko, jaitsi -> jaitsiko, idatzi -> idatziko, ireki -> irekiko, ibili -> ibiliko, etorri -> etorriko, ekarri -> ekarriko, erori -> eroriko, erabili -> erabiliko, jarri -> jarriko, bidali -> bidaliko, utzi -> utziko, ebaki -> ebakiko, ikasi -> ikasiko, irabazi -> irabaziko
// - Verbs ending in -n: joan -> joango, jan -> jango, edan -> edango, esan -> esango, eman -> emango, entzun -> entzungo, irten -> irtengo
// - Irregular: izan -> izango, ukan -> (izango), egon -> egongo

const futureForms = tokens.filter(t => t.endsWith('ko') || t.endsWith('go'));
console.log("Future forms found:", futureForms.length);
console.log("Future forms:", futureForms);

// Check for any -stiko, -ztiko, -ituko where unexpected
const badFutures = futureForms.filter(t => {
  if (t.endsWith('stiko') || t.endsWith('ztiko') || t.endsWith('tsitiko') || t.endsWith('tzitiko')) return true;
  return false;
});
console.log("Potentially bad future participles:", badFutures);
