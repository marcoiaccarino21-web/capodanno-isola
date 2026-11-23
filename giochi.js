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
