// Giochi di gruppo: l'impostore e lupus in fabula. Solo logica, niente DOM.
// Una partita alla volta, salvata nel campo `gioco` del documento capodanno/stato.
// Le scelte casuali "condivise" (pareggi, risoluzione) usano un generatore con seme,
// così ogni telefono che chiude una fase calcola lo stesso risultato.

export const slugG = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';

export function rng(seed) {
  let a = 0; for (const c of String(seed)) a = (Math.imul(a ^ c.charCodeAt(0), 2654435761) + 1) >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffle(arr, rnd = Math.random) {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

/* ================= L'IMPOSTORE ================= */
// [categoria, parola, parola simile per la variante "infiltrato"]
export const PAROLE = [
  ['Cibo', 'Pizza', 'Focaccia'], ['Cibo', 'Lasagne', 'Cannelloni'], ['Cibo', 'Tiramisù', 'Zuppa inglese'], ['Cibo', 'Cotechino', 'Zampone'],
  ['Cibo', 'Panettone', 'Pandoro'], ['Cibo', 'Sushi', 'Poke'], ['Cibo', 'Gelato', 'Granita'], ['Cibo', 'Pesto', 'Salsa verde'],
  ['Cibo', 'Farinata', 'Panissa'], ['Cibo', 'Kebab', 'Piadina'], ['Cibo', 'Nutella', 'Marmellata'], ['Cibo', 'Popcorn', 'Patatine'],
  ['Bevande', 'Spritz', 'Negroni'], ['Bevande', 'Spumante', 'Champagne'], ['Bevande', 'Birra', 'Sidro'], ['Bevande', 'Caffè', 'Tè'],
  ['Bevande', 'Vin brulé', 'Cioccolata calda'], ['Bevande', 'Grappa', 'Limoncello'],
  ['Luoghi', 'Spiaggia', 'Piscina'], ['Luoghi', 'Ospedale', 'Farmacia'], ['Luoghi', 'Aeroporto', 'Stazione'], ['Luoghi', 'Cimitero', 'Chiesa'],
  ['Luoghi', 'Discoteca', 'Pub'], ['Luoghi', 'Biblioteca', 'Libreria'], ['Luoghi', 'Supermercato', 'Mercato'], ['Luoghi', 'Palestra', 'Piscina'],
  ['Luoghi', 'Zoo', 'Acquario'], ['Luoghi', 'Carcere', 'Caserma'], ['Luoghi', 'Montagna', 'Collina'], ['Luoghi', 'Cinema', 'Teatro'],
  ['Luoghi', 'Ikea', 'Leroy Merlin'], ['Luoghi', 'Autogrill', 'Benzinaio'],
  ['Oggetti', 'Ombrello', 'Impermeabile'], ['Oggetti', 'Forchetta', 'Cucchiaio'], ['Oggetti', 'Candela', 'Torcia'], ['Oggetti', 'Specchio', 'Finestra'],
  ['Oggetti', 'Cuscino', 'Coperta'], ['Oggetti', 'Chitarra', 'Violino'], ['Oggetti', 'Telecomando', 'Joystick'], ['Oggetti', 'Lucchetto', 'Chiave'],
  ['Oggetti', 'Valigia', 'Zaino'], ['Oggetti', 'Occhiali', 'Lenti a contatto'], ['Oggetti', 'Spazzolino', 'Pettine'], ['Oggetti', 'Tappo', 'Cavatappi'],
  ['Oggetti', 'Albero di Natale', 'Presepe'], ['Oggetti', 'Fuochi d’artificio', 'Petardi'],
  ['Animali', 'Gatto', 'Tigre'], ['Animali', 'Pinguino', 'Foca'], ['Animali', 'Squalo', 'Delfino'], ['Animali', 'Ape', 'Vespa'],
  ['Animali', 'Cavallo', 'Asino'], ['Animali', 'Gallina', 'Tacchino'], ['Animali', 'Serpente', 'Lucertola'], ['Animali', 'Fagiano', 'Pavone'],
  ['Mestieri', 'Medico', 'Infermiere'], ['Mestieri', 'Cuoco', 'Pizzaiolo'], ['Mestieri', 'Pompiere', 'Poliziotto'], ['Mestieri', 'Avvocato', 'Giudice'],
  ['Mestieri', 'Parrucchiere', 'Barbiere'], ['Mestieri', 'Idraulico', 'Elettricista'], ['Mestieri', 'Maestro', 'Professore'], ['Mestieri', 'Sindaco', 'Prete'],
  ['Attività', 'Sciare', 'Pattinare'], ['Attività', 'Campeggio', 'Picnic'], ['Attività', 'Karaoke', 'Concerto'], ['Attività', 'Matrimonio', 'Battesimo'],
  ['Attività', 'Trasloco', 'Ristrutturazione'], ['Attività', 'Esame', 'Colloquio di lavoro'], ['Attività', 'Primo appuntamento', 'Speed date'],
  ['Attività', 'Capodanno', 'Ferragosto'], ['Attività', 'Tombola', 'Bingo'], ['Attività', 'Escape room', 'Caccia al tesoro'],
  ['Mezzi', 'Treno', 'Metropolitana'], ['Mezzi', 'Bicicletta', 'Monopattino'], ['Mezzi', 'Nave', 'Traghetto'], ['Mezzi', 'Camper', 'Roulotte'],
  ['Mezzi', 'Elicottero', 'Aereo'], ['Mezzi', 'Trattore', 'Ruspa'],
  ['Personaggi', 'Babbo Natale', 'Befana'], ['Personaggi', 'Dracula', 'Frankenstein'], ['Personaggi', 'Pinocchio', 'Geppetto'], ['Personaggi', 'Sherlock Holmes', 'Poirot'],
  ['Personaggi', 'Superman', 'Batman'], ['Personaggi', 'Harry Potter', 'Gandalf'], ['Personaggi', 'Cenerentola', 'Biancaneve'], ['Personaggi', 'Topolino', 'Paperino'],
];

// opzioni: { impostori: 1|2, modo: 'sa' (sa di essere l'impostore) | 'infiltrato' (ha una parola simile e non lo sa), indizio: bool }
export function nuovoImpostore(players, by, opz = {}, usate = [], rnd = Math.random) {
  const libere = PAROLE.map((_, i) => i).filter(i => !usate.includes(i));
  const pool = libere.length ? libere : PAROLE.map((_, i) => i);
  const idx = pool[Math.floor(rnd() * pool.length)];
  const n = Math.max(1, Math.min(opz.impostori || 1, Math.floor((players.length - 1) / 2)));
  const imp = shuffle(players, rnd).slice(0, n);
  const ordine = shuffle(players, rnd);
  return { tipo: 'impostore', id: String(Date.now()) + Math.floor(rnd() * 1000), by, players, fase: 'gioco',
    opz: { impostori: n, modo: opz.modo === 'infiltrato' ? 'infiltrato' : 'sa', indizio: opz.indizio !== false },
    parola: idx, impostori: imp, ordine, voti: {}, usate: [...(libere.length ? usate : []), idx] };
}

// cosa vede il giocatore sulla sua carta
export function cartaImpostore(g, me) {
  const [cat, parola, simile] = PAROLE[g.parola];
  if (!g.impostori.includes(me)) return { impostore: false, parola, categoria: cat };
  if (g.opz.modo === 'infiltrato') return { impostore: false, parola: simile, categoria: cat }; // non sa di esserlo
  return { impostore: true, parola: null, categoria: g.opz.indizio ? cat : null };
}

export function contaVoti(voti, candidati) {
  const c = Object.fromEntries(candidati.map(p => [p, 0]));
  for (const v of Object.values(voti || {})) if (v in c) c[v]++;
  return Object.entries(c).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
}
// chi ha preso più voti; pareggio = tutti i primi a pari merito
export function piuVotati(voti, candidati) {
  const t = contaVoti(voti, candidati); if (!t.length) return [];
  return t.filter(([, n]) => n === t[0][1]).map(([p]) => p);
}

/* ================= LUPUS IN FABULA ================= */
export const RUOLI = {
  lupo:     { nome: 'Lupo mannaro', squadra: 'lupi', desc: 'Di notte, insieme agli altri lupi, scegli chi sbranare. Di giorno fingi di essere un innocente contadino.' },
  veggente: { nome: 'Veggente', squadra: 'villaggio', desc: 'Ogni notte scegli una persona e scopri se è un lupo. Usa l’informazione con astuzia: se ti scoprono, i lupi ti mangiano.' },
  guardia:  { nome: 'Guardia del corpo', squadra: 'villaggio', desc: 'Ogni notte proteggi una persona (non te stesso, e non la stessa due notti di fila): se i lupi la attaccano, sopravvive.' },
  medium:   { nome: 'Medium', squadra: 'villaggio', desc: 'Ogni notte scopri se la persona giustiziata il giorno prima era un lupo.' },
  contadino:{ nome: 'Contadino', squadra: 'villaggio', desc: 'Non hai poteri: ragiona, accusa e vota bene di giorno. Di notte tocca un nome a caso, così nessuno capisce chi sei.' },
};
export const lupiConsigliati = n => Math.max(1, Math.floor(n / 4));

// opz: { lupi, veggente, guardia, medium }
export function nuovoLupus(players, by, opz = {}, rnd = Math.random) {
  const n = players.length;
  const lupi = Math.max(1, Math.min(opz.lupi || lupiConsigliati(n), Math.floor((n - 1) / 2)));
  const speciali = ['veggente', 'guardia', 'medium'].filter(r => opz[r] !== false);
  const mazzo = [...Array(lupi).fill('lupo'), ...speciali].slice(0, n);
  while (mazzo.length < n) mazzo.push('contadino');
  const carte = shuffle(mazzo, rnd);
  const ruoli = Object.fromEntries(players.map((p, i) => [slugG(p), carte[i]]));
  return { tipo: 'lupus', id: String(Date.now()) + Math.floor(rnd() * 1000), by, players, ruoli, opz: { lupi, ...Object.fromEntries(['veggente', 'guardia', 'medium'].map(r => [r, speciali.includes(r)])) },
    fase: 'notte', turno: 1, morti: [], notti: {}, giorni: {}, log: [], vince: null };
}

export const ruoloDi = (g, p) => g.ruoli[slugG(p)];
export const vivi = g => g.players.filter(p => !g.morti.includes(p));
export const lupiVivi = g => vivi(g).filter(p => ruoloDi(g, p) === 'lupo');

export function vincitore(g) {
  const l = lupiVivi(g).length, v = vivi(g).length - l;
  if (l === 0) return 'villaggio';
  if (l >= v) return 'lupi';
  return null;
}

// bersagli possibili di notte per un giocatore
export function bersagliNotte(g, me) {
  const r = ruoloDi(g, me); const alive = vivi(g);
  if (r === 'lupo') return alive.filter(p => ruoloDi(g, p) !== 'lupo');
  if (r === 'guardia') { const prima = g.notti['n' + (g.turno - 1)]?.esito?.protetto; return alive.filter(p => p !== me && p !== prima); }
  return alive.filter(p => p !== me);
}

// la notte finisce quando ogni vivo ha toccato un nome (anche i contadini, per non farsi riconoscere)
export function notteCompleta(g) {
  const az = g.notti['n' + g.turno]?.az || {};
  return vivi(g).every(p => az[slugG(p)]);
}
export function risolviNotte(g) {
  const az = g.notti['n' + g.turno]?.az || {}; const rnd = rng(g.id + ':n' + g.turno);
  const lupi = lupiVivi(g); const votiLupi = Object.fromEntries(lupi.map(p => [p, az[slugG(p)]]).filter(([, v]) => v));
  const top = piuVotati(votiLupi, vivi(g));
  const attaccato = top.length ? top[Math.floor(rnd() * top.length)] : null;
  const guardia = vivi(g).find(p => ruoloDi(g, p) === 'guardia');
  const protetto = guardia ? az[slugG(guardia)] || null : null;
  const morto = attaccato && attaccato !== protetto ? attaccato : null;
  const morti = morto ? [...g.morti, morto] : g.morti;
  const ng = { ...g, morti, notti: { ...g.notti, ['n' + g.turno]: { az, esito: { attaccato, protetto, morto } } } };
  const vince = vincitore(ng);
  return { ...ng, fase: vince ? 'fine' : 'giorno', vince, log: [...g.log, morto ? `Notte ${g.turno}: i lupi hanno sbranato ${morto}.` : `Notte ${g.turno}: nessuno è morto.`] };
}

export function giornoCompleto(g) {
  const v = g.giorni['g' + g.turno]?.voti || {};
  return vivi(g).every(p => v[slugG(p)]);
}
// pareggio: nessuno viene giustiziato
export function risolviGiorno(g) {
  const voti = g.giorni['g' + g.turno]?.voti || {};
  const top = piuVotati(voti, vivi(g));
  const giustiziato = top.length === 1 ? top[0] : null;
  const morti = giustiziato ? [...g.morti, giustiziato] : g.morti;
  const ng = { ...g, morti, giorni: { ...g.giorni, ['g' + g.turno]: { voti, esito: { giustiziato, pari: top.length > 1 ? top : [] } } } };
  const vince = vincitore(ng);
  return { ...ng, fase: vince ? 'fine' : 'esito', vince, log: [...g.log, giustiziato ? `Giorno ${g.turno}: il villaggio ha giustiziato ${giustiziato}.` : `Giorno ${g.turno}: pareggio, nessuno giustiziato.`] };
}
export const nuovaNotte = g => ({ ...g, fase: 'notte', turno: g.turno + 1 });

/* ================= TORNEO «CAMPIONE DI ISOLA» ================= */
// torneo = { auto: { <chiave partita>: { gioco, punti: {nome: n} } }, man: { <ts>: { gioco, chi: [nomi], pt, da } } }
// I punti automatici sono scritti con la chiave della partita: riscriverli dà sempre lo stesso risultato.
export function puntiImpostore(g) {
  const voti = g.voti || {}; if (!Object.keys(voti).length) return null;
  const top = piuVotati(voti, g.players); const preso = top.length === 1 && g.impostori.includes(top[0]);
  const p = {};
  if (preso) { for (const n of g.players) if (g.impostori.includes(voti[slugG(n)])) p[n] = 1; }
  else for (const n of g.impostori) p[n] = 3;
  return p;
}
export function puntiLupus(g) {
  if (!g.vince) return null; const p = {};
  for (const n of g.players) { const lupo = ruoloDi(g, n) === 'lupo';
    if ((g.vince === 'lupi') === lupo) p[n] = 2 + (g.morti.includes(n) ? 0 : 1); }
  return p;
}
// giallo: 2 punti a chi accusa il colpevole (3 al primo); 4 al colpevole se meno di metà lo accusa
export function puntiGiallo(accuse, colpevole, narratore) {
  const ok = accuse.filter(a => a.voter !== narratore && a.suspect === colpevole).sort((a, b) => String(a.at).localeCompare(String(b.at)));
  const p = {}; ok.forEach((a, i) => { p[a.voter] = i === 0 ? 3 : 2; });
  const tot = accuse.filter(a => a.voter !== narratore && a.voter !== colpevole).length;
  if (colpevole && ok.length * 2 < tot) p[colpevole] = 4;
  return p;
}
export function classifica(torneo, people) {
  const t = Object.fromEntries((people || []).map(n => [n, 0]));
  for (const a of Object.values(torneo?.auto || {})) for (const [n, k] of Object.entries(a.punti || {})) t[n] = (t[n] || 0) + k;
  for (const m of Object.values(torneo?.man || {})) for (const n of m.chi || []) t[n] = (t[n] || 0) + (m.pt || 0);
  return Object.entries(t).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/* ================= NON HO MAI ================= */
export const NONHOMAI = {
  soft: [
    'Non ho mai dormito in macchina', 'Non ho mai perso un aereo o un treno', 'Non ho mai finto di essere malato per non andare a scuola o al lavoro',
    'Non ho mai mangiato un’intera pizza famiglia da solo', 'Non ho mai cantato al karaoke', 'Non ho mai pianto guardando un cartone animato',
    'Non ho mai rotto qualcosa a casa d’altri senza dirlo', 'Non ho mai dimenticato il compleanno di un amico', 'Non ho mai fatto un tatuaggio',
    'Non ho mai sbagliato strada per più di un’ora', 'Non ho mai bruciato una pentola', 'Non ho mai mandato un messaggio alla persona sbagliata',
    'Non ho mai dormito più di 14 ore di fila', 'Non ho mai fatto il bagno al mare a dicembre', 'Non ho mai preso una multa',
    'Non ho mai visto l’alba senza essere andato a dormire', 'Non ho mai riciclato un regalo', 'Non ho mai mentito sulla mia età',
    'Non ho mai mangiato qualcosa caduto per terra', 'Non ho mai litigato con un controllore', 'Non ho mai chiamato la maestra «mamma»',
    'Non ho mai fatto finta di conoscere una canzone', 'Non ho mai spoilerato un film apposta', 'Non ho mai perso le chiavi di casa',
    'Non ho mai fatto la doccia vestito', 'Non ho mai guardato una serie intera in un giorno', 'Non ho mai scritto una poesia',
    'Non ho mai preso un 2 a scuola', 'Non ho mai copiato un compito in classe', 'Non ho mai fatto campeggio',
    'Non ho mai ballato su un tavolo', 'Non ho mai fatto una figuraccia davanti a un professore', 'Non ho mai mangiato lumache',
    'Non ho mai parlato da solo ad alta voce in pubblico', 'Non ho mai lasciato un ristorante senza pagare per sbaglio', 'Non ho mai vinto qualcosa a un concorso',
    'Non ho mai incontrato una persona famosa', 'Non ho mai fatto uno scherzo telefonico', 'Non ho mai buttato il telefono nel water',
    'Non ho mai preso il treno senza biglietto', 'Non ho mai fatto il pieno della macchina sbagliando carburante', 'Non ho mai fatto un selfie con uno sconosciuto',
    'Non ho mai pianto a un matrimonio', 'Non ho mai detto «ti amo» per primo', 'Non ho mai fatto un viaggio da solo',
    'Non ho mai cucinato per più di dieci persone', 'Non ho mai sognato di essere in mutande a scuola', 'Non ho mai finto di essere al telefono per evitare qualcuno',
    'Non ho mai mangiato a colazione gli avanzi della cena', 'Non ho mai perso a un gioco da tavolo e tenuto il muso', 'Non ho mai vomitato in macchina',
    'Non ho mai fatto la spesa in pigiama', 'Non ho mai ascoltato la stessa canzone dieci volte di fila', 'Non ho mai preso un pesce'
  ],
  piccante: [
    'Non ho mai baciato qualcuno conosciuto la sera stessa', 'Non ho mai scritto a un ex dopo mezzanotte', 'Non ho mai bevuto così tanto da non ricordare la serata',
    'Non ho mai baciato qualcuno in questa stanza', 'Non ho mai avuto una cotta per un amico di questa stanza', 'Non ho mai stalkerato un ex sui social',
    'Non ho mai mentito per uscire con qualcuno', 'Non ho mai dato un numero di telefono falso', 'Non ho mai fatto un appuntamento al buio',
    'Non ho mai usato un’app di incontri', 'Non ho mai lasciato qualcuno per messaggio', 'Non ho mai baciato due persone nella stessa sera',
    'Non ho mai fatto il bagno nudo', 'Non ho mai dormito sul pavimento dopo una festa', 'Non ho mai detto il nome sbagliato in un momento romantico',
    'Non ho mai letto i messaggi del telefono di qualcun altro', 'Non ho mai finto di essermi addormentato per non parlare', 'Non ho mai avuto una storia segreta',
    'Non ho mai bevuto direttamente dalla bottiglia a una festa', 'Non ho mai flirtato per avere uno sconto', 'Non ho mai vomitato a una festa',
    'Non ho mai baciato qualcuno per una scommessa', 'Non ho mai mandato una foto di cui mi sono pentito', 'Non ho mai detto una bugia in questa vacanza',
    'Non ho mai parlato male di qualcuno in questa stanza', 'Non ho mai dimenticato il nome della persona con cui stavo uscendo', 'Non ho mai fatto una dichiarazione da ubriaco',
    'Non ho mai saltato il lavoro per i postumi', 'Non ho mai ballato un lento con uno sconosciuto', 'Non ho mai fatto pace con qualcuno solo per convenienza'
  ]
};
export function nuovoNonHoMai(players, by, mazzo = 'soft', rnd = Math.random) {
  const frasi = mazzo === 'tutte' ? [...NONHOMAI.soft, ...NONHOMAI.piccante] : NONHOMAI[mazzo] || NONHOMAI.soft;
  return { tipo: 'nonhomai', id: String(Date.now()) + Math.floor(rnd() * 1000), by, players, mazzo, ordine: shuffle(frasi.map((_, i) => i), rnd), i: 0, si: {} };
}
export const fraseNonHoMai = g => (g.mazzo === 'tutte' ? [...NONHOMAI.soft, ...NONHOMAI.piccante] : NONHOMAI[g.mazzo] || NONHOMAI.soft)[g.ordine[g.i]];

/* ================= PAROLE VIETATE (a squadre, a tempo) ================= */
export const CARTE = [
  ['Capodanno', ['anno', 'mezzanotte', 'brindisi', 'gennaio', 'festa']], ['Spumante', ['bollicine', 'brindisi', 'vino', 'bottiglia', 'tappo']],
  ['Cotechino', ['lenticchie', 'maiale', 'salume', 'Modena', 'zampone']], ['Panettone', ['Natale', 'dolce', 'canditi', 'Milano', 'pandoro']],
  ['Tombola', ['numeri', 'cartella', 'cinquina', 'Natale', 'gioco']], ['Fuochi d’artificio', ['botti', 'cielo', 'colori', 'scoppio', 'mezzanotte']],
  ['Befana', ['strega', 'scopa', 'calza', 'carbone', 'gennaio']], ['Presepe', ['Gesù', 'grotta', 'statuine', 'Natale', 'bue']],
  ['Pinguino', ['ghiaccio', 'uccello', 'bianco', 'nero', 'Antartide']], ['Giraffa', ['collo', 'lungo', 'Africa', 'macchie', 'animale']],
  ['Zanzara', ['puntura', 'estate', 'insetto', 'prurito', 'sangue']], ['Gatto', ['miao', 'felino', 'baffi', 'topo', 'animale']],
  ['Ombrello', ['pioggia', 'aprire', 'bagnato', 'riparo', 'manico']], ['Valigia', ['viaggio', 'vestiti', 'ruote', 'aeroporto', 'bagaglio']],
  ['Specchio', ['riflesso', 'vetro', 'guardare', 'bagno', 'immagine']], ['Forchetta', ['coltello', 'cucchiaio', 'mangiare', 'posata', 'punte']],
  ['Lavatrice', ['panni', 'lavare', 'bucato', 'detersivo', 'centrifuga']], ['Telecomando', ['televisione', 'canale', 'tasti', 'divano', 'pile']],
  ['Candela', ['cera', 'fiamma', 'luce', 'stoppino', 'accendere']], ['Cuscino', ['letto', 'dormire', 'testa', 'morbido', 'federa']],
  ['Pizza', ['mozzarella', 'pomodoro', 'Napoli', 'forno', 'margherita']], ['Tiramisù', ['mascarpone', 'caffè', 'savoiardi', 'dolce', 'cacao']],
  ['Lasagna', ['besciamella', 'ragù', 'forno', 'pasta', 'strati']], ['Gelato', ['cono', 'freddo', 'gusto', 'estate', 'coppetta']],
  ['Pesto', ['basilico', 'Genova', 'pinoli', 'trofie', 'verde']], ['Focaccia', ['Genova', 'olio', 'pane', 'forno', 'sale']],
  ['Caffè', ['tazzina', 'moka', 'espresso', 'bar', 'zucchero']], ['Birra', ['bionda', 'luppolo', 'boccale', 'schiuma', 'pinta']],
  ['Spritz', ['Aperol', 'arancione', 'prosecco', 'aperitivo', 'Veneto']], ['Nutella', ['nocciole', 'cioccolato', 'spalmabile', 'barattolo', 'pane']],
  ['Ospedale', ['medico', 'malato', 'infermiere', 'pronto soccorso', 'letto']], ['Aeroporto', ['aereo', 'volo', 'valigia', 'imbarco', 'pista']],
  ['Spiaggia', ['mare', 'sabbia', 'ombrellone', 'sole', 'estate']], ['Biblioteca', ['libri', 'leggere', 'silenzio', 'prestito', 'scaffali']],
  ['Cimitero', ['morti', 'tombe', 'fiori', 'lapide', 'funerale']], ['Discoteca', ['ballare', 'musica', 'dj', 'notte', 'luci']],
  ['Palestra', ['pesi', 'allenamento', 'muscoli', 'sudore', 'abbonamento']], ['Supermercato', ['spesa', 'carrello', 'cassa', 'scaffali', 'prodotti']],
  ['Zoo', ['animali', 'gabbie', 'leone', 'visitare', 'scimmie']], ['Montagna', ['neve', 'vetta', 'sciare', 'alta', 'rifugio']],
  ['Medico', ['ospedale', 'malattia', 'ricetta', 'dottore', 'curare']], ['Pompiere', ['fuoco', 'incendio', 'idrante', 'scala', 'spegnere']],
  ['Idraulico', ['tubo', 'acqua', 'perdita', 'lavandino', 'riparare']], ['Parrucchiere', ['capelli', 'tagliare', 'forbici', 'piega', 'shampoo']],
  ['Cuoco', ['cucina', 'ricetta', 'chef', 'pentola', 'cucinare']], ['Poliziotto', ['legge', 'arresto', 'divisa', 'multa', 'ladro']],
  ['Giornalista', ['notizia', 'giornale', 'articolo', 'scrivere', 'intervista']], ['Sindaco', ['comune', 'città', 'elezioni', 'fascia', 'paese']],
  ['Detective', ['indagine', 'giallo', 'colpevole', 'indizio', 'Sherlock']], ['Veleno', ['morire', 'avvelenare', 'tossico', 'serpente', 'boccetta']],
  ['Testamento', ['eredità', 'morte', 'notaio', 'soldi', 'parenti']], ['Cassaforte', ['codice', 'soldi', 'chiusa', 'combinazione', 'ladro']],
  ['Alibi', ['dove', 'eri', 'prova', 'colpevole', 'innocente']], ['Impronta', ['dito', 'piede', 'traccia', 'polizia', 'lasciare']],
  ['Calcio', ['pallone', 'gol', 'squadra', 'partita', 'stadio']], ['Sciare', ['neve', 'montagna', 'pista', 'sci', 'scendere']],
  ['Karaoke', ['cantare', 'canzone', 'microfono', 'testo', 'stonato']], ['Selfie', ['foto', 'telefono', 'faccia', 'Instagram', 'scattare']],
  ['WhatsApp', ['messaggio', 'chat', 'gruppo', 'telefono', 'vocale']], ['Netflix', ['serie', 'film', 'abbonamento', 'guardare', 'divano']],
  ['Babbo Natale', ['regali', 'barba', 'renne', 'slitta', 'rosso']], ['Dracula', ['vampiro', 'sangue', 'conte', 'denti', 'Transilvania']],
  ['Sherlock Holmes', ['detective', 'Watson', 'Londra', 'pipa', 'indagine']], ['Pinocchio', ['naso', 'bugie', 'legno', 'Geppetto', 'burattino']],
  ['Harry Potter', ['mago', 'Hogwarts', 'bacchetta', 'occhiali', 'cicatrice']], ['Cenerentola', ['scarpetta', 'principe', 'mezzanotte', 'zucca', 'matrigna']],
  ['Treno', ['binari', 'stazione', 'vagone', 'biglietto', 'ritardo']], ['Bicicletta', ['pedali', 'ruote', 'sellino', 'pedalare', 'catena']],
  ['Monopattino', ['elettrico', 'ruote', 'città', 'manubrio', 'spingere']], ['Nave', ['mare', 'barca', 'porto', 'crociera', 'capitano']],
  ['Ascensore', ['piano', 'salire', 'scendere', 'bottone', 'palazzo']], ['Semaforo', ['rosso', 'verde', 'giallo', 'strada', 'incrocio']],
  ['Sveglia', ['mattina', 'suonare', 'dormire', 'orario', 'alzarsi']], ['Diamante', ['pietra', 'prezioso', 'anello', 'brillante', 'gioiello']],
  ['Oro', ['metallo', 'giallo', 'prezioso', 'gioiello', 'orefice']], ['Fagiano', ['uccello', 'caccia', 'impagliato', 'coda', 'piume']],
  ['Po', ['fiume', 'Torino', 'lungo', 'acqua', 'pianura']], ['Nebbia', ['grigio', 'vedere', 'pianura', 'autunno', 'fitta']],
  ['Genova', ['Liguria', 'porto', 'pesto', 'mare', 'Lanterna']], ['Valenza', ['oro', 'gioielli', 'orafi', 'Alessandria', 'Piemonte']],
  ['Postumi', ['bere', 'testa', 'mattina', 'dopo', 'sbornia']], ['Pigiama', ['dormire', 'letto', 'notte', 'vestito', 'comodo']],
  ['Russare', ['dormire', 'rumore', 'naso', 'notte', 'letto']], ['Barbecue', ['griglia', 'carne', 'brace', 'fuoco', 'estate']],
  ['Beer pong', ['birra', 'pallina', 'bicchieri', 'tavolo', 'lanciare']], ['Oscar', ['premio', 'statuetta', 'cinema', 'attore', 'Hollywood']]
];
export function nuovoTaboo(players, by, opz = {}, rnd = Math.random) {
  const m = shuffle(players, rnd); const met = Math.ceil(m.length / 2);
  return { tipo: 'taboo', id: String(Date.now()) + Math.floor(rnd() * 1000), by, players, squadre: [m.slice(0, met), m.slice(met)],
    punti: [0, 0], durata: opz.durata || 60, obiettivo: opz.obiettivo || 20, mazzo: shuffle(CARTE.map((_, i) => i), rnd), pos: 0,
    sq: 0, giro: [0, 0], fase: 'pronti', turno: null, vince: null };
}
// chi spiega adesso: a rotazione dentro la squadra di turno
export const spiega = g => { const s = g.squadre[g.sq]; return s[g.giro[g.sq] % s.length]; };
export const cartaTaboo = g => CARTE[g.mazzo[g.pos % g.mazzo.length]];
export function puntiTaboo(g) {
  if (!g.vince && g.vince !== 0) return null; const p = {};
  for (const n of g.squadre[g.vince]) p[n] = 2; return p;
}

/* ================= IL BARCELLONA (gioco alcolico con le carte) ================= */
const SEMI = ['♥', '♦', '♣', '♠'];
const VALORI = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const mazzoCarte = rnd => shuffle([...SEMI.flatMap(s => VALORI.map(v => v + s)), 'JOKER', 'JOKER'], rnd);
export const valoreCarta = c => c === 'JOKER' ? 'JOKER' : c.slice(0, -1);
export function nuovoBarcellona(players, by, opz = {}, rnd = Math.random) {
  return { tipo: 'barcellona', id: String(Date.now()) + Math.floor(rnd() * 1000), by, players,
    regole: opz.regole || '', mazzo: mazzoCarte(rnd), pos: 0, turno: 0, fase: 'numero', mossa: null, ultimo: [], sorsi: {}, mani: 0 };
}
// chi beve con la carta pescata dal giocatore di turno che ha detto il numero n
export function esitoBarcellona(g, n, carta) {
  const P = g.players, i = g.turno % P.length, io = P[i];
  const v = valoreCarta(carta);
  if (v === 'JOKER') return { chi: [], scegli: true, testo: `Jolly: ${io} sceglie chi beve` };
  if (v === 'A') return { chi: [...P], testo: 'Asso: bevono tutti' };
  if (v === 'K') return { chi: P.filter(p => p !== io), testo: `Re: bevono tutti tranne ${io}` };
  if (v === 'Q') return { chi: [...(g.ultimo || [])], testo: g.ultimo?.length ? `Donna: beve chi ha bevuto per ultimo` : 'Donna: nessuno ha ancora bevuto, si salvano tutti' };
  if (v === 'J') return { chi: [io], doppio: true, testo: `Fante: ${io} beve doppio` };
  const k = +v;
  if (k === n) return { chi: [io], testo: `Indovinata! Beve ${io}` };
  if (k === n + 1) return { chi: [P[(i + 1) % P.length]], testo: `Una sopra: beve ${P[(i + 1) % P.length]}, il successivo` };
  if (k === n - 1) return { chi: [P[(i - 1 + P.length) % P.length]], testo: `Una sotto: beve ${P[(i - 1 + P.length) % P.length]}, il precedente` };
  return { chi: [], testo: 'Niente: non beve nessuno' };
}
// applica la mossa e restituisce il nuovo stato (rimescola quando il mazzo finisce)
export function giocaBarcellona(g, n, rnd = Math.random) {
  let mazzo = g.mazzo, pos = g.pos;
  if (pos >= mazzo.length) { mazzo = mazzoCarte(rnd); pos = 0; }
  const carta = mazzo[pos]; const e = esitoBarcellona(g, n, carta);
  const sorsi = { ...g.sorsi };
  for (const p of e.chi) sorsi[slugG(p)] = (sorsi[slugG(p)] || 0) + (e.doppio ? 2 : 1);
  return { ...g, mazzo, pos: pos + 1, fase: e.scegli ? 'jolly' : 'carta', mossa: { n, carta, ...e, chi: e.chi }, ultimo: e.chi.length ? e.chi : g.ultimo, sorsi };
}
export function jollyBarcellona(g, chi) {
  const sorsi = { ...g.sorsi }; sorsi[slugG(chi)] = (sorsi[slugG(chi)] || 0) + 1;
  return { ...g, fase: 'carta', mossa: { ...g.mossa, chi: [chi], testo: `Jolly: ${g.players[g.turno % g.players.length]} fa bere ${chi}` }, ultimo: [chi], sorsi };
}
export const prossimoBarcellona = g => ({ ...g, turno: g.turno + 1, fase: 'numero', mossa: null, mani: (g.mani || 0) + 1 });
