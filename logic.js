// Dati fissi e funzioni pure (niente rete, niente pagina): testabili da sole.

export const MENUS = [
  { id: 'antipasto-primo', country: 'Spagna e Grecia', course: 'Antipasto e primo', dish: 'Pan con tomate e jamón; pastitsio (pasta al forno greca con ragù e besciamella)' },
  { id: 'secondo-dolce',   country: 'India e Francia', course: 'Secondo e dolce',   dish: 'Pollo al curry con latte di cocco e riso basmati; crêpes con crema spalmabile o zucchero e limone' }
];

export const DISHES = [
  { id: 'pancontomate', menu: 'antipasto-primo', country: 'Spagna', label: 'Pan con tomate e jamón' },
  { id: 'pastitsio',    menu: 'antipasto-primo', country: 'Grecia', label: 'Pastitsio' },
  { id: 'curry',        menu: 'secondo-dolce',   country: 'India',  label: 'Pollo al curry con riso basmati' },
  { id: 'crepes',       menu: 'secondo-dolce',   country: 'Francia', label: 'Crêpes' }
];
export const dishById = id => DISHES.find(d => d.id === id);

// Spesa di squadra alla Metro: tutto quello che serve al menu della squadra, dosi per 8 (cena di 4 portate).
export const SPESA = {
  'antipasto-primo': [
    ['Pane casereccio (o 2 baguette)', '1 kg'], ['Pomodori ramati ben maturi', '6'], ['Prosciutto crudo (serrano se c’è)', '250 g'],
    ['Pasta lunga e grossa: bucatini, ziti o penne', '600 g'], ['Carne macinata mista', '700 g'], ['Cipolle', '2'], ['Aglio', '1 testa'],
    ['Passata di pomodoro', '500 g'], ['Concentrato di pomodoro', '1 tubetto'], ['Cannella in polvere', '1 barattolino'], ['Noce moscata', '1 barattolino'],
    ['Latte intero', '1 l'], ['Burro', '150 g'], ['Farina 00', '500 g'], ['Uova', '3'], ['Grana o pecorino grattugiato', '200 g'],
    ['Olio extravergine', '1 bottiglia da 0,5 l'], ['Sale grosso e fino, pepe', 'se mancano in casa']
  ],
  'secondo-dolce': [
    ['Pollo: sovracoscia o petto a pezzi', '1,2 kg'], ['Riso basmati', '500 g'], ['Latte di cocco', '2 lattine da 400 ml'],
    ['Pomodori pelati', '1 lattina da 400 g'], ['Curry in polvere (o pasta di curry)', '1 barattolino'], ['Curcuma', '1 barattolino, facoltativa'],
    ['Cipolle', '2'], ['Aglio', '1 testa'], ['Zenzero fresco', '1 radice'], ['Coriandolo', '1 mazzo'], ['Yogurt bianco', '250 g'],
    ['Olio di semi', '1 l'], ['Uova', '4'], ['Farina 00', '500 g'], ['Latte intero', '1 l'], ['Burro', '125 g'], ['Zucchero', '500 g'],
    ['Crema spalmabile', '1 barattolo da 400 g'], ['Limoni', '3']
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

// Ricette per 8 persone: ogni piatto è una delle 4 portate della cena. Un solo forno: lo usa solo il pastitsio.
export const RICETTE = {
  pancontomate: { portata: 'Antipasto', tempo: '20 minuti', passi: [
    'Taglia il pane a fette di un dito e tostale: sulla piastra, nel tostapane o nella friggitrice ad aria (200 °C, 4-5 minuti). Non usare il forno, serve al pastitsio.',
    'Strofina ogni fetta ancora calda con mezzo spicchio d’aglio crudo.',
    'Taglia i pomodori a metà e strofinali sul pane schiacciandoli, finché resta solo la buccia in mano. In alternativa grattugiali e spalma la polpa col cucchiaio.',
    'Sale grosso, un bel giro d’olio extravergine e sopra una fetta di crudo. Prepararli quando gli altri si siedono, se no il pane si ammolla.'] },
  pastitsio: { portata: 'Primo', tempo: '2 ore, di cui 45 minuti in forno a 180 °C', passi: [
    'Ragù: in una pentola larga soffriggi 2 cipolle tritate e 2 spicchi d’aglio nell’olio. Aggiungi i 700 g di carne e rosola a fuoco alto finché perde l’acqua.',
    'Unisci la passata, 1 cucchiaio di concentrato, 1 cucchiaino scarso di cannella, un bicchiere d’acqua, sale e pepe. Cuoci 40 minuti a fuoco basso, deve restare denso.',
    'Besciamella: sciogli 100 g di burro, aggiungi 100 g di farina e mescola 1 minuto. Versa 1 litro di latte caldo a filo con la frusta e cuoci finché si addensa. Fuori dal fuoco: noce moscata, sale, metà del formaggio e, quando è tiepida, 2 uova sbattute.',
    'Pasta: cuocila molto al dente (metà del tempo della confezione), scolala e condiscila con 1 uovo sbattuto, una noce di burro e un pugno di formaggio.',
    'In una teglia grande imburrata (circa 30x40, o due più piccole): metà pasta, tutto il ragù, l’altra metà della pasta, sopra la besciamella e il formaggio rimasto.',
    'Forno a 180 °C per 40-45 minuti, finché la crosta è dorata. Fallo riposare 15 minuti prima di tagliarlo a quadrati: si può infornare mentre si mangia l’antipasto.'] },
  curry: { portata: 'Secondo', tempo: '1 ora', passi: [
    'Marinata, se avete tempo anche al mattino: pollo a pezzi con 4 cucchiai di yogurt, 1 cucchiaio di curry e sale. Almeno 20 minuti in frigo.',
    'In una pentola larga con olio di semi rosola 2 cipolle tritate per 8-10 minuti, finché sono dorate. Aggiungi 3 spicchi d’aglio e 3 cm di zenzero grattugiati e 2 cucchiai di curry (più un cucchiaino di curcuma): 1 minuto, mescolando.',
    'Unisci il pollo e fallo colorare 5 minuti. Poi i pelati schiacciati e le 2 lattine di latte di cocco. Sale e 20-25 minuti a fuoco basso col coperchio socchiuso.',
    'Riso: sciacqua 500 g di basmati finché l’acqua è chiara, cuocilo con 750 ml d’acqua e sale a fuoco minimo col coperchio, 12 minuti, poi 5 di riposo senza aprire.',
    'Assaggia il curry, aggiusta di sale e succo di limone e servi sul riso con coriandolo tritato e un cucchiaio di yogurt.'] },
  crepes: { portata: 'Dolce', tempo: '1 ora, più 30 minuti di riposo dell’impasto', passi: [
    'Impasto, almeno mezz’ora prima: sbatti 4 uova con 350 g di farina, poi aggiungi 700 ml di latte a filo sbattendo finché è liscio. Unisci 2 cucchiai di zucchero, un pizzico di sale e 35 g di burro fuso. In frigo per 30 minuti.',
    'Scalda bene una padella antiaderente da 24 cm e ungila con un velo di burro, passato con la carta da cucina.',
    'Versa un mestolino d’impasto e ruota subito la padella per coprire il fondo.',
    'Dopo circa un minuto, quando i bordi si staccano, girala e cuoci 30 secondi dall’altra parte. Impilale su un piatto coperto: ne vengono circa 17.',
    'Farcisci al momento: crema spalmabile, oppure zucchero e succo di limone. Piega in quattro e servi.'] }
};
