// Dati fissi e funzioni pure (niente rete, niente pagina): testabili da sole.

export const MENUS = [
  { id: 'antipasto-secondo', country: 'Messico e Italia', course: 'Antipasto e secondo', dish: 'Nachos con fagioli, guacamole e cheddar; polenta con funghi trifolati e fontina' },
  { id: 'primo-dolce',       country: 'Giappone e Francia', course: 'Primo e dolce',     dish: 'Yakisoba con verdure, uovo e soia; crêpes con crema spalmabile o zucchero e limone' }
];

export const CATEGORIES = [
  { id: 'chef',            label: 'Migliori chef del giro del mondo', kind: 'team', note: 'Premio di squadra' },
  { id: 'detective',       label: 'Miglior detective del giallo', kind: 'person' },
  { id: 'interpretazione', label: 'Miglior interpretazione del giallo', kind: 'person' },
  { id: 'assurdo',         label: 'Protagonista del momento più assurdo', kind: 'person' },
  { id: 'sveglia',         label: 'Il più lento a svegliarsi', kind: 'person' },
  { id: 'rivelazione',     label: 'Rivelazione dell’anno', kind: 'person' }
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
    ['Pomeriggio', 'Ragù vegetale e tiramisù tutti insieme, poi ognuno si mette il cartellino del suo personaggio'],
    ['19:30', 'Aperitivo in piedi, con i cartellini a tracolla: Ottavio Ferraris accoglie gli ospiti e brinda'],
    ['20:00', 'Ottavio viene trovato morto: comincia il giallo'],
    ['20:15', 'Giro 1 e primo sopralluogo; 20:45 a tavola con la pasta al ragù vegetale'],
    ['21:30', 'Giro 2 e secondo sopralluogo; 21:55 a tavola con cotechino e lenticchie'],
    ['22:35', 'Giro 3 e caccia alla Stella; 23:00 tiramisù e ragionamenti a tavola'],
    ['23:20', 'Accuse dall’app, poi la soluzione'],
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
  if (cat.kind === 'team') {
    const mine = teamOf(state.teams, voter);
    return (state.teams || []).filter(t => t !== mine).map(t => ({ value: teamLabel(t), label: teamLabel(t), sub: t.members.join(', ') }));
  }
  return (state.people || []).filter(p => p !== voter).map(p => ({ value: p, label: p }));
}

// Categorie votabili: quella di squadra solo se ci sono almeno 2 squadre.
export const activeCategories = state => CATEGORIES.filter(c => c.kind !== 'team' || (state.teams || []).length >= 2);

export function tally(ballots, catId) {
  const t = {};
  for (const b of ballots) { const v = b.votes && b.votes[catId]; if (v) t[v] = (t[v] || 0) + 1; }
  const rows = Object.entries(t).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = rows.length ? rows[0][1] : 0;
  return { rows, top, winners: rows.filter(r => r[1] === top).map(r => r[0]) };
}

// Personaggi del giallo: si assegnano nell'ordine di importanza per la trama,
// così con meno di 13 persone restano comunque tutti gli indizi decisivi.
export function assignCharacters(people, order, narrator, rnd = Math.random) {
  const ppl = shuffle(people.filter(p => p !== narrator), rnd).slice(0, order.length);
  return ppl.map((p, i) => ({ p, c: order[i] }));
}
