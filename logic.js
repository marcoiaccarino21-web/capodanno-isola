// Dati fissi e funzioni pure (niente rete, niente pagina): testabili da sole.

export const MENUS = [
  { id: 'antipasto-secondo', country: 'Messico e Italia', course: 'Antipasto e secondo', dish: 'Nachos con fagioli, guacamole e cheddar; polenta con funghi trifolati e fontina' },
  { id: 'primo-dolce',       country: 'Giappone e Francia', course: 'Primo e dolce',     dish: 'Yakisoba con verdure, uovo e soia; crêpes con crema spalmabile o zucchero e limone' }
];

export const DISHES = [
  { id: 'nachos',   menu: 'antipasto-secondo', country: 'Messico',  label: 'Nachos con fagioli, guacamole e cheddar' },
  { id: 'polenta',  menu: 'antipasto-secondo', country: 'Italia',   label: 'Polenta con funghi trifolati e fontina' },
  { id: 'yakisoba', menu: 'primo-dolce',       country: 'Giappone', label: 'Yakisoba con verdure, uovo e soia' },
  { id: 'crepes',   menu: 'primo-dolce',       country: 'Francia',  label: 'Crêpes' }
];
export const dishById = id => DISHES.find(d => d.id === id);

// Spesa di squadra alla Metro: tutto quello che serve al menu della squadra, dosi per 8 (cena di 4 portate).
export const SPESA = {
  'antipasto-secondo': [
    ['Tortilla chips', '2 buste da 200 g'], ['Fagioli neri o rossi', '1 lattina grande (o 2 piccole)'], ['Jalapeños', '1 vasetto'],
    ['Avocado maturi', '5'], ['Pomodori', '3'], ['Lime', '4'], ['Cipolla rossa', '1'], ['Coriandolo', '1 mazzo'],
    ['Panna acida (o yogurt greco)', '200 g'], ['Cheddar grattugiato (o emmental)', '250 g'],
    ['Funghi champignon (o misti)', '1,3 kg'], ['Aglio', '1 testa'], ['Prezzemolo', '1 mazzo'],
    ['Fontina (o toma)', '500 g'], ['Farina per polenta, bramata o istantanea', '700 g'], ['Burro', '250 g'],
    ['Olio extravergine', '1 bottiglia da 0,5 l'], ['Sale grosso e fino, pepe', 'se mancano in casa']
  ],
  'primo-dolce': [
    ['Noodles: udon o ramen secchi (o spaghetti)', '700 g'], ['Cavolo cinese (o verza)', '500 g'], ['Carote', '3'],
    ['Cipolla', '1'], ['Cipollotti', '1 mazzo'], ['Zenzero fresco', '1 radice'], ['Aglio', '1 testa'],
    ['Uova', '8 (4 per lo yakisoba, 4 per le crêpes)'], ['Salsa di soia', '1 bottiglia'], ['Olio di sesamo', '1 bottiglia'],
    ['Olio di semi', '1 l'], ['Farina 00', '1 kg'], ['Latte intero', '1 l'], ['Burro', '125 g'], ['Zucchero', '500 g'],
    ['Crema spalmabile', '1 barattolo da 400 g'], ['Limoni', '2']
  ]
};

export const CATEGORIES = [
  { id: 'piatto',          label: 'Piatto più buono della cena dei mondi', kind: 'dish', note: 'Il piatto che ti è piaciuto di più, quello di cui avresti fatto il bis. Puoi votare anche quello della tua squadra: vince la squadra che l’ha cucinato.' },
  { id: 'detective',       label: 'Miglior detective del giallo', kind: 'auto', note: 'Non si vota: vince chi ha accusato per primo il colpevole' },
  { id: 'interpretazione', label: 'Miglior interpretazione del giallo', kind: 'person', noNarrator: true, note: 'Chi è entrato di più nel personaggio durante il giallo: voce, battute, bugie credibili, colpi di scena. Conta come ha recitato, non se ha indovinato il colpevole.' },
  { id: 'assurdo',         label: 'Protagonista del momento più assurdo', kind: 'person', note: 'Chi è stato al centro della scena più surreale di questi tre giorni: una frase, una figuraccia, un’idea folle. Quella che racconterete ancora l’anno prossimo.' },
  { id: 'sveglia',         label: 'Il più lento a svegliarsi', kind: 'person', note: 'Chi ha fatto più fatica a ingranare dopo le nottate: ultimo ad alzarsi, a colazione con gli occhi chiusi, ancora in pigiama a pranzo.' },
  { id: 'rivelazione',     label: 'Rivelazione dell’anno', kind: 'person', note: 'Chi ti ha sorpreso di più: un talento nascosto in cucina o nel giallo, un lato che non conoscevi, la persona che non ti aspettavi.' },
  { id: 'campione',        label: 'Campione di Isola', kind: 'torneo', note: 'Non si vota: vince chi ha fatto più punti nel torneo dei tre giorni (giochi dell’app, giallo, beer pong e il resto).' }
];

export const PROGRAM = [
  { day: 'Prima di partire', title: 'Sorteggi e personaggi', rows: [
    ['Una settimana prima', 'Sorteggio di squadre e menu, assegnazione dei personaggi del giallo'],
    ['30 mattina', 'Ritrovo alle 9 alla Metro di Bolzaneto: spesa tutti insieme per i tre giorni']
  ]},
  { day: 'Mercoledì 30 dicembre', title: 'Giro del mondo', rows: [
    ['9:00', 'Spesa alla Metro di Bolzaneto, poi partenza per Isola'],
    ['12:00', 'Arrivo a Isola, si sistemano letti e bagagli'],
    ['13:00', 'Pranzo al ristorante'],
    ['Pomeriggio', 'Libero fino alle 17:30, poi ogni squadra cucina il suo menu'],
    ['20:00', 'Cena giro del mondo: due squadre, quattro Paesi in quattro portate'],
    ['Dopo', 'Giochi alcolici per chi vuole']
  ]},
  { day: 'Giovedì 31 dicembre', title: 'Delitto a Villa Ferraris', rows: [
    ['Mattina', 'Gita a Valenza (24 km, mezz’ora di macchina): centro, Duomo e vetrina della bottega orafa del MOD'],
    ['Pranzo', 'Da decidere'],
    ['Pomeriggio', 'Ragù di carne e tiramisù tutti insieme, poi ognuno si mette il cartellino del suo personaggio'],
    ['19:00', 'Aperitivo in piedi, con i cartellini a tracolla: Ottavio Ferraris accoglie gli ospiti e brinda'],
    ['19:30', 'Ottavio viene trovato morto: comincia il giallo'],
    ['19:45', 'Giro 1 e primo sopralluogo; 20:15 a tavola con la pasta al ragù'],
    ['21:00', 'Giro 2 e secondo sopralluogo; 21:25 a tavola con cotechino e lenticchie'],
    ['22:05', 'Giro 3 e caccia alla Stella; 22:30 tiramisù e ragionamenti a tavola'],
    ['22:50', 'Accuse dall’app, poi la soluzione'],
    ['Mezzanotte', 'Countdown e brindisi'],
    ['Dopo', 'Party game e giochi alcolici']
  ]},
  { day: 'Venerdì 1° gennaio', title: 'Nessuna sveglia, gran finale', rows: [
    ['Mattina', 'Sveglia libera, colazione'],
    ['13:00', 'Pranzo: trofie al pesto'],
    ['14:00', 'Gli Oscar del Capodanno: spoglio e premiazione'],
    ['14:45', 'Pulizie a squadre'],
    ['16:00', 'Partenza per il rientro']
  ]}
];

export function slug(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'x';
}

export function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Squadre a caso: tante quante i menu (5), o meno se i partecipanti sono meno di 5.
// I membri sono distribuiti a giro, così le squadre differiscono al massimo di una persona.
export function draw(people, rnd = Math.random) {
  const n = Math.min(MENUS.length, people.length);
  if (n === 0) return [];
  const menus = shuffle(MENUS, rnd).slice(0, n);
  const ppl = shuffle(people, rnd);
  const teams = menus.map(m => ({ menu: m.id, members: [] }));
  ppl.forEach((p, i) => teams[i % n].members.push(p));
  return teams;
}

export const menuById = id => MENUS.find(m => m.id === id);
export const teamOf = (teams, name) => (teams || []).find(t => t.members.includes(name));
export const teamLabel = t => 'Squadra ' + (menuById(t.menu)?.country ?? t.menu);

// Candidati per una categoria: mai se stessi, mai la propria squadra.
export function nominees(cat, voter, state) {
  if (cat.kind === 'dish') return DISHES.map(d => ({ value: d.id, label: d.label, sub: d.country }));
  if (cat.kind === 'team') {
    const mine = teamOf(state.teams, voter);
    return (state.teams || []).filter(t => t !== mine).map(t => ({ value: teamLabel(t), label: teamLabel(t), sub: t.members.join(', ') }));
  }
  const narr = cat.noNarrator && state.giallo ? state.giallo.narrator : null; // il narratore non è in gara per l'interpretazione
  return (state.people || []).filter(p => p !== voter && p !== narr).map(p => ({ value: p, label: p }));
}

// Categorie votabili: il piatto solo se le squadre sono state sorteggiate; il detective non si vota.
export const spoglioCategories = state => CATEGORIES.filter(c => c.kind !== 'dish' || (state.teams || []).length >= 1);
export const activeCategories = state => spoglioCategories(state).filter(c => c.kind !== 'auto' && c.kind !== 'torneo');

// Miglior detective: chi ha accusato per primo il colpevole (in ordine di orario dell'accusa).
export function detectives(accuse, culprit) {
  return (accuse || []).filter(a => a.suspect === culprit).sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

// Nomination: i primi tre per voti, più chi è a pari merito con il terzo.
export function nominations(rows) {
  const soglia = rows.length > 3 ? rows[2][1] : 0;
  return rows.filter(r => r[1] >= soglia);
}

export function tally(ballots, catId) {
  const t = {};
  for (const b of ballots) { const v = b.votes && b.votes[catId]; if (v) t[v] = (t[v] || 0) + 1; }
  const rows = Object.entries(t).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = rows.length ? rows[0][1] : 0;
  return { rows, top, winners: rows.filter(r => r[1] === top).map(r => r[0]) };
}

// Personaggi del giallo: si assegnano nell'ordine di importanza per la trama,
// così con meno di 13 persone restano comunque tutti gli indizi decisivi.
// Cast deciso da Marco (23/11): chi è in questa lista riceve sempre quel personaggio; gli altri a caso.
export const CAST = { Ugi: 'moretti', Marco: 'cantu', Isa: 'bellini', Lollot: 'cugino', Saolo: 'erede', Melvin: 'dellavalle', Clelia: 'bassi' };
export function assignCharacters(people, order, narrator, rnd = Math.random) {
  const ppl = people.filter(p => p !== narrator);
  const fissi = ppl.filter(p => CAST[p] && order.includes(CAST[p])).map(p => ({ p, c: CAST[p] }));
  const liberi = order.filter(c => !fissi.some(a => a.c === c));
  const altri = shuffle(ppl.filter(p => !fissi.some(a => a.p === p)), rnd).slice(0, liberi.length);
  return [...fissi, ...altri.map((p, i) => ({ p, c: liberi[i] }))];
}

// Ricette per 8 persone: ogni piatto è una delle 4 portate della cena. Un solo forno: lo usano solo i nachos.
export const RICETTE = {
  nachos: { portata: 'Antipasto', tempo: '30 minuti, forno a 200 °C', passi: [
    'Guacamole: schiaccia 5 avocado con il succo di 2 lime, mezza cipolla rossa tritata finissima, 2 pomodori a dadini senza semi, coriandolo tritato e sale. Jalapeños tritati a piacere. Copri con la pellicola a contatto, se no annerisce.',
    'Fagioli: scola e sciacqua i fagioli, scaldale in padella con un filo d’olio, uno spicchio d’aglio e sale. Schiacciane metà con la forchetta.',
    'Accendi il forno a 200 °C. Su 2 teglie con carta forno fai uno strato di chips, fagioli a cucchiaiate, cheddar e qualche rondella di jalapeño, poi un secondo strato uguale.',
    'Inforna 6-8 minuti, finché il formaggio fonde e non oltre: le chips bruciano in fretta. Infornale appena vi sedete a tavola.',
    'Servi subito con sopra il guacamole, la panna acida, l’altro pomodoro a dadini e spicchi di lime.'] },
  polenta: { portata: 'Secondo', tempo: '1 ora (20 minuti con l’istantanea)', passi: [
    'Funghi: puliscili con un panno umido, senza metterli in acqua, e affettali. In 2 padelle larghe scalda olio con 2 spicchi d’aglio ciascuna.',
    'Butta i funghi a fuoco vivo e girali poco: 10-12 minuti, finché l’acqua è evaporata e prendono colore. Sale, pepe e prezzemolo tritato alla fine. Togli l’aglio.',
    'Polenta: in una pentola grande porta a bollore 2,8 litri d’acqua con 1 cucchiaio e mezzo di sale grosso (con l’istantanea segui le dosi della confezione). Versa la farina a pioggia sbattendo con la frusta, così non fa grumi.',
    'Bramata: 40-50 minuti a fuoco basso, girando spesso col cucchiaio di legno. Istantanea: 8-10 minuti.',
    'Spegni e manteca con 70 g di burro e metà della fontina a dadini.',
    'Nel piatto: polenta, funghi sopra e l’altra fontina a dadini, che fonde col calore.'] },
  yakisoba: { portata: 'Primo', tempo: '40 minuti', passi: [
    'Prepara tutto prima: cavolo a striscioline, 3 carote a fiammifero, la cipolla a fette, i cipollotti a rondelle (la parte verde a parte), 2 cm di zenzero grattugiato, 2 spicchi d’aglio tritati.',
    'Salsa: 7 cucchiai di soia, 1 e mezzo di zucchero, 1 e mezzo di olio di sesamo e 3 d’acqua.',
    'Noodles: cuocili in acqua senza sale per il tempo della confezione meno un minuto, scolali, passali sotto l’acqua fredda e condiscili con un filo d’olio di semi, così non si attaccano.',
    'Uova: sbatti 4 uova con un pizzico di sale, strapazzale in padella con un po’ d’olio di semi e tienile da parte.',
    'In 2 padelle grandi (o wok) a fuoco alto con olio di semi: aglio, zenzero e cipolla per 1 minuto, poi le carote per 3, poi il cavolo per 3-4. Le verdure devono restare croccanti.',
    'Aggiungi i noodles e la salsa e salta 2-3 minuti. Unisci le uova, il verde dei cipollotti e un giro d’olio di sesamo. Servi subito.'] },
  crepes: { portata: 'Dolce', tempo: '1 ora, più 30 minuti di riposo dell’impasto', passi: [
    'Impasto, almeno mezz’ora prima: sbatti 4 uova con 350 g di farina, poi aggiungi 700 ml di latte a filo sbattendo finché è liscio. Unisci 2 cucchiai di zucchero, un pizzico di sale e 35 g di burro fuso. In frigo per 30 minuti.',
    'Scalda bene una padella antiaderente da 24 cm e ungila con un velo di burro, passato con la carta da cucina.',
    'Versa un mestolino d’impasto e ruota subito la padella per coprire il fondo.',
    'Dopo circa un minuto, quando i bordi si staccano, girala e cuoci 30 secondi dall’altra parte. Impilale su un piatto coperto: ne vengono circa 17.',
    'Farcisci al momento: crema spalmabile, oppure zucchero e succo di limone. Piega in quattro e servi.'] }
};
