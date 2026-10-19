// Dati fissi e funzioni pure (niente rete, niente pagina): testabili da sole.

export const MENUS = [
  { id: 'messico',  country: 'Messico',  course: 'Antipasto',   dish: 'Nachos con guacamole e pico de gallo' },
  { id: 'giappone', country: 'Giappone', course: 'Street food', dish: 'Gyoza alla piastra con salsa di soia e zenzero' },
  { id: 'spagna',   country: 'Spagna',   course: 'Primo',       dish: 'Paella mista in un’unica grande padella' },
  { id: 'italia',   country: 'Italia',   course: 'Mezzanotte',  dish: 'Cotechino e lenticchie, di buon augurio' },
  { id: 'francia',  country: 'Francia',  course: 'Dolce',       dish: 'Crêpes Suzette all’arancia, flambé davanti a tutti' }
];

export const CATEGORIES = [
  { id: 'chef',        label: 'Migliori chef del giro del mondo', kind: 'team', note: 'Premio di squadra' },
  { id: 'assurdo',     label: 'Protagonista del momento più assurdo', kind: 'person' },
  { id: 'look',        label: 'Miglior look del 31', kind: 'person' },
  { id: 'sveglia',     label: 'Il più lento a svegliarsi', kind: 'person' },
  { id: 'rivelazione', label: 'Rivelazione dell’anno', kind: 'person' }
];

export const PROGRAM = [
  { day: 'Mercoledì 30 dicembre', title: 'Si arriva e si parte subito', rows: [
    ['Mattina', 'Arrivo a Isola, si sistemano letti e bagagli'],
    ['Pranzo', 'Primo pranzo tutti insieme'],
    ['Pomeriggio', 'Party game e sorteggio di squadre e menu'],
    ['Sera', 'Prima cena insieme, poi giochi alcolici per chi vuole']
  ]},
  { day: 'Giovedì 31 dicembre', title: 'La giornata più lunga dell’anno', rows: [
    ['Mattina', 'Gita a Valenza: centro, Duomo e vetrina della bottega orafa del MOD in via IX Febbraio'],
    ['Pomeriggio', 'Rientro, ogni squadra prepara il suo menu'],
    ['Sera', 'Cena giro del mondo, cinque Paesi in cinque portate'],
    ['Mezzanotte', 'Countdown, brindisi, cotechino e lenticchie'],
    ['Dopo', 'Party game e giochi alcolici']
  ]},
  { day: 'Venerdì 1° gennaio', title: 'Nessuna sveglia, gran finale', rows: [
    ['Tarda mattina', 'Brunch con gli avanzi del giro del mondo'],
    ['Pomeriggio', 'Gli Oscar del Capodanno: spoglio e premiazione'],
    ['Dopo', 'Pulizie a squadre'],
    ['Sera', 'Rientro; chi guida resta leggero dal pranzo']
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
