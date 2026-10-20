import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, doc, collection, onSnapshot, setDoc, deleteDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig, ADMIN_PIN } from './config.js';
import { MENUS, CATEGORIES, PROGRAM, slug, draw, menuById, teamOf, teamLabel, nominees, activeCategories, tally, assignCharacters } from './logic.js';
import { GIALLO } from './giallo.js';

/* ---------- stato ---------- */
const NO_GIALLO = { assign: [], narrator: null, round: 0, accuse: false, solved: false, call: null };
let state = { people: [], teams: [], votingOpen: false, opened: false, revealed: [], giallo: NO_GIALLO };
let accuse = [];            // [{id, voter, suspect}]
let ballots = [];           // [{id, voter, votes, at}]
let loaded = false;
let me = load('me');
let admin = load('admin') === '1';
let tab = me ? 'squadra' : 'chi';
let flow = null;            // voto in corso: {i, votes}
let confirm = null;         // conferme in pagina: 'draw' | 'open' | 'reset'
let error = '';

function load(k, store = localStorage) { try { return store.getItem('capo:' + k); } catch { return null; } }
function save(k, v, store = localStorage) { try { v == null ? store.removeItem('capo:' + k) : store.setItem('capo:' + k, v); } catch {} }

/* ---------- firebase ---------- */
const configured = !Object.values(firebaseConfig).some(v => String(v).includes('INCOLLA'));
let db = null, stateRef = null;
if (configured) {
  db = getFirestore(initializeApp(firebaseConfig));
  stateRef = doc(db, 'capodanno', 'stato');
  onSnapshot(stateRef, snap => {
    const v = snap.exists() ? snap.data() : {};
    state = { people: v.people || [], teams: v.teams || [], votingOpen: !!v.votingOpen, opened: !!v.opened, revealed: v.revealed || [], giallo: { ...NO_GIALLO, ...(v.giallo || {}) } };
    loaded = true;
    if (me && !state.people.includes(me)) { me = null; save('me', null); if (tab !== 'regia') tab = 'chi'; }
    render();
  }, e => { error = 'Non riesco a leggere i dati: controlla le regole di Firestore. (' + e.code + ')'; render(); });
  onSnapshot(collection(db, 'ballots'), snap => {
    ballots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
  }, () => {});
  onSnapshot(collection(db, 'accuse'), snap => {
    accuse = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
  }, () => {});
}
async function patch(p) {
  try { await setDoc(stateRef, p, { merge: true }); error = ''; }
  catch (e) { error = 'Salvataggio non riuscito (' + e.code + '). Controlla la connessione e riprova.'; render(); }
}

/* ---------- helper DOM ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) { if (kid == null || kid === false) continue; el.append(kid.nodeType ? kid : document.createTextNode(String(kid))); }
  return el;
}
const go = t => { tab = t; confirm = null; flow = null; error = ''; render(); window.scrollTo(0, 0); };
const myBallot = () => me && ballots.find(b => b.id === slug(me));

/* ---------- schermate ---------- */
function screenChi() {
  if (!state.people.length) return [h('div', { class: 'box' }, h('h2', {}, 'Quasi pronti'),
    h('p', { class: 'sub' }, 'L’organizzatore sta preparando la lista dei partecipanti. Riapri tra poco.'))];
  return [h('div', { class: 'box' },
    h('h3', {}, 'Benvenuto'), h('h2', {}, 'Chi sei?'),
    h('p', { class: 'sub' }, 'Tocca il tuo nome: il telefono se lo ricorda.'),
    h('div', { class: 'names' }, state.people.map(p => h('button', { class: 'name', onclick: () => { me = p; save('me', p); go('squadra'); } }, p))))];
}

function screenProgramma() {
  return [
    ...PROGRAM.map(d => h('div', { class: 'box' }, h('h3', {}, d.day), h('h2', {}, d.title),
      h('div', { class: 'list' }, d.rows.map(([k, v]) => h('div', { class: 'item' }, h('b', {}, k), h('span', {}, v)))))),
    h('div', { class: 'box' }, h('h3', {}, 'I cinque menu'),
      h('div', { class: 'list' }, MENUS.map(m => h('div', { class: 'item' }, h('b', {}, m.course), h('span', {}, h('strong', {}, m.country + ' · '), m.dish)))))
  ];
}

function screenSquadra() {
  const out = [];
  if (!state.teams.length) {
    out.push(h('div', { class: 'box' }, h('h3', {}, 'Cena giro del mondo'), h('h2', {}, 'Squadre ancora da sorteggiare'),
      h('p', { class: 'sub' }, 'Il sorteggio si fa una settimana prima, così ognuno sa cosa comprare. Appena estratte, qui vedrai la tua squadra e cosa cucinare.')));
    return out;
  }
  const t = teamOf(state.teams, me);
  if (t) {
    const m = menuById(t.menu); const mates = t.members.filter(x => x !== me);
    out.push(h('div', { class: 'box gold reveal' },
      h('h3', {}, 'La tua squadra · ' + m.course),
      h('p', { class: 'big-dish' }, m.country),
      h('p', { style: 'font-size:18px;font-weight:600' }, m.dish),
      h('p', { class: 'sub' }, mates.length ? 'Cucini con ' + mates.join(', ') : 'Cucini da solo: tutta la gloria è tua')));
  } else if (me) {
    out.push(h('div', { class: 'box' }, h('p', { class: 'sub' }, 'Non sei in nessuna squadra: chiedi all’organizzatore di rifare il sorteggio.')));
  }
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Tutte le squadre'),
    state.teams.map(x => { const m = menuById(x.menu); return h('div', { class: 'team' + (x === t ? ' mine' : '') },
      h('strong', {}, m.country + ' · ' + m.course), h('span', { class: 'sub' }, x.members.join(', '))); })));
  return out;
}

function screenOscar() {
  const cats = activeCategories(state);
  if (state.opened) return screenSpoglio(cats);
  if (!state.votingOpen) return [h('div', { class: 'box' }, h('h3', {}, 'Gli Oscar del Capodanno'), h('h2', {}, 'Le urne sono chiuse'),
    h('p', { class: 'sub' }, 'Si vota il 1° gennaio. Le categorie:'),
    h('div', { class: 'list' }, CATEGORIES.map(c => h('div', { class: 'item' }, h('b', {}, c.kind === 'team' ? 'Squadra' : 'Persona'), h('span', {}, c.label)))))];
  if (myBallot()) return [h('div', { class: 'box reveal' }, h('h3', {}, 'Scheda nell’urna'), h('h2', {}, 'Hai votato'),
    h('p', { class: 'sub' }, `Hanno votato ${ballots.length} su ${state.people.length}. Le buste si aprono tutti insieme.`))];
  if (!flow) return [h('div', { class: 'box' }, h('h3', {}, 'Urne aperte'), h('h2', {}, 'Tocca a te, ' + me),
    h('p', { class: 'sub' }, `${cats.length} categorie, voto segreto. Non puoi votare te stesso né la tua squadra, e dopo aver imbucato non si cambia.`),
    h('button', { class: 'btn big', onclick: () => { flow = { i: 0, votes: {} }; render(); } }, 'Inizia a votare'))];
  if (flow.i < cats.length) {
    const c = cats[flow.i]; const pick = flow.votes[c.id];
    return [h('p', { class: 'step' }, `Categoria ${flow.i + 1} di ${cats.length}`),
      h('h2', { style: 'text-align:center' }, c.label), c.note ? h('p', { class: 'sub', style: 'text-align:center' }, c.note) : null,
      h('div', { class: 'nominees' }, nominees(c, me, state).map(n => h('button', { class: 'nominee', 'aria-pressed': pick === n.value ? 'true' : 'false',
        onclick: () => { flow.votes[c.id] = n.value; render(); } }, n.label, n.sub ? h('small', {}, n.sub) : null))),
      h('div', { class: 'row' },
        h('button', { class: 'btn ghost', style: 'flex:1', onclick: () => { if (flow.i === 0) flow = null; else flow.i--; render(); } }, 'Indietro'),
        h('button', { class: 'btn', style: 'flex:2', disabled: !pick, onclick: () => { flow.i++; render(); window.scrollTo(0, 0); } }, flow.i === cats.length - 1 ? 'Rivedi la scheda' : 'Avanti'))];
  }
  return [h('div', { class: 'box' }, h('h3', {}, 'La tua scheda'), h('h2', {}, 'Tutto giusto?'),
    h('div', { class: 'summary' }, cats.map(c => h('div', {}, h('span', { class: 'sub' }, c.label), h('span', {}, flow.votes[c.id])))),
    h('button', { class: 'btn big', onclick: castVote }, 'Imbuca la scheda'),
    h('button', { class: 'btn ghost big', onclick: () => { flow.i = 0; render(); } }, 'Correggi'))];
}
async function castVote() {
  const body = { voter: me, votes: flow.votes, at: new Date().toISOString() };
  try { await setDoc(doc(db, 'ballots', slug(me)), body); flow = null; render(); }
  catch (e) { error = 'La scheda non è stata salvata (' + e.code + '). Se avevi già votato non puoi rivotare.'; render(); }
}

function screenSpoglio(cats) {
  const out = [h('div', { class: 'box' }, h('h3', {}, 'Spoglio'), h('h2', {}, 'Le buste sono aperte'),
    h('p', { class: 'sub' }, admin ? 'Apri una busta alla volta, con la statuetta in mano.' : 'L’organizzatore apre le buste una alla volta: guarda qui.'))];
  for (const c of cats) {
    const open = state.revealed.includes(c.id); const t = tally(ballots, c.id);
    out.push(h('div', { class: 'envelope' + (open ? ' reveal' : '') }, h('h3', {}, c.label),
      open ? [h('p', { class: 'winner' }, t.winners.length ? t.winners.join(' e ') : 'Nessun voto'),
        t.winners.length > 1 ? h('p', { class: 'sub' }, 'Ex aequo: due statuette.') : null,
        h('div', { class: 'tally' }, t.rows.map(([n, k]) => h('div', {}, h('span', {}, n), h('span', { class: 'count' }, `${k} ${k === 1 ? 'voto' : 'voti'}`),
          h('span', { class: 'bar' }, h('i', { style: `width:${t.top ? k / t.top * 100 : 0}%` })))))]
        : admin ? h('button', { class: 'btn', onclick: () => patch({ revealed: [...state.revealed, c.id] }) }, 'Apri la busta')
        : h('p', { class: 'sub' }, 'Busta ancora sigillata')));
  }
  return out;
}

/* ---------- giallo ---------- */
const charById = id => GIALLO.characters.find(c => c.id === id);
const myChar = () => { const a = state.giallo.assign.find(x => x.p === me); return a && charById(a.c); };
const myAccusa = () => me && accuse.find(a => a.id === slug(me));

function screenGiallo() {
  const g = state.giallo; const out = [];
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Cena con delitto · 31 sera'), h('h2', {}, GIALLO.title), h('p', { class: 'sub' }, GIALLO.setting)));
  if (!g.assign.length) {
    out.push(h('div', { class: 'box' }, h('h3', {}, 'Come funziona'), h('ul', { class: 'sub', style: 'margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px' }, GIALLO.rules.map(r => h('li', {}, r))),
      h('p', { class: 'small' }, 'I personaggi si assegnano una settimana prima: qui vedrai chi sei e cosa indossare.')));
    return out;
  }
  if (me && me === g.narrator) return [...out, ...screenNarratore()];
  const c = myChar();
  if (c) {
    out.push(h('div', { class: 'box gold reveal' }, h('h3', {}, 'Il tuo personaggio · ' + c.role), h('p', { class: 'big-dish' }, c.name),
      h('p', { style: 'font-size:16px;font-weight:600' }, 'Travestimento: ' + c.costume), h('p', {}, c.intro)));
    out.push(h('div', { class: 'box' }, h('h3', {}, 'Il tuo segreto · non mostrarlo'), h('p', {}, c.secret),
      c.where ? h('h3', {}, 'Dove eri davvero · 19:55–20:05') : null, c.where ? h('p', {}, c.where) : null,
      h('h3', {}, 'Il tuo obiettivo'), h('p', {}, c.goal)));
    out.push(h('div', { class: 'box' }, h('h3', {}, 'I tuoi indizi'),
      h('div', { class: 'list' }, c.clues.map((t, i) => h('div', { class: 'item' }, h('b', {}, 'Giro ' + (i + 1)),
        g.round > i ? h('span', {}, t) : h('span', { class: 'small' }, 'Si sblocca durante la cena'))))));
  } else if (me) {
    out.push(h('div', { class: 'box' }, h('p', { class: 'sub' }, 'Non hai un personaggio: chiedi all’organizzatore di rifare l’assegnazione.')));
  }
  out.push(boxStanze());
  if (g.accuse && !g.solved) out.push(...boxAccusa());
  if (g.solved) out.push(...boxSoluzione());
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Gli ospiti della villa'),
    g.narrator ? h('div', { class: 'team' }, h('strong', {}, GIALLO.ottavio.name), h('span', { class: 'sub' }, GIALLO.ottavio.role + ' · ' + g.narrator + ', narratore')) : null,
    g.assign.map(a => { const x = charById(a.c); return h('div', { class: 'team' + (a.p === me ? ' mine' : '') }, h('strong', {}, x.name), h('span', { class: 'sub' }, x.role + ' · ' + a.p)); })));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Le regole'), h('ul', { class: 'sub', style: 'margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px' }, GIALLO.rules.map(r => h('li', {}, r)))));
  return out;
}
function boxStanze(all) {
  const r = state.giallo.round;
  return h('div', { class: 'box' }, h('h3', {}, 'Sopralluogo · le stanze della villa'),
    h('div', { class: 'list' }, GIALLO.rooms.map(x => h('div', { class: 'item' }, h('b', {}, x.name),
      all || r >= x.round ? h('span', {}, x.text) : h('span', { class: 'small' }, 'Ancora sigillata: si apre al giro ' + x.round)))));
}
function screenNarratore() {
  const g = state.giallo; const out = [];
  const O = GIALLO.ottavio;
  out.push(h('div', { class: 'box gold' }, h('h3', {}, 'Il tuo ruolo · narratore'), h('p', { class: 'big-dish' }, O.name),
    h('p', { style: 'font-size:16px;font-weight:600' }, 'Travestimento: ' + O.costume),
    h('p', {}, 'Nel prologo sei vivo: accogli gli ospiti, brindi e muori. Poi torni come fantasma e guidi la serata. Giri, accuse e soluzione si comandano dalla Regia.'),
    admin ? h('button', { class: 'btn', onclick: () => go('regia') }, 'Vai alla Regia') : null));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Il brindisi di Ottavio · verso le 19:45'), h('p', { style: 'font-style:italic;line-height:1.6' }, '«' + O.speech + '»')));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Una battuta per ogni ospite'), h('p', { class: 'small' }, 'Dille durante l’aperitivo, a ciascuno: lì per lì non significano niente, si capiscono dopo.'),
    h('div', { class: 'list' }, g.assign.map(a => { const x = charById(a.c); return h('div', { class: 'item' }, h('b', {}, a.p), h('span', {}, h('strong', {}, x.role + ': '), O.lines[a.c] || '')); }))));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Il copione della serata'),
    h('div', { class: 'list' }, GIALLO.script.map(x => h('div', { class: 'item' }, h('b', {}, x.time), h('span', {}, h('strong', {}, x.title + '. '), x.text))))));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Da preparare prima di cena'), h('ul', { class: 'sub', style: 'margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px' }, GIALLO.prep.map(t => h('li', {}, t)))));
  out.push(boxStanze(true));
  const who = g.assign.find(a => a.c === GIALLO.culprit)?.p;
  out.push(h('div', { class: 'envelope' }, h('h3', {}, 'Solo per te · la soluzione'),
    h('p', { class: 'winner' }, charById(GIALLO.culprit).name + (who ? ' (' + who + ')' : '')), h('p', {}, GIALLO.solution)));
  if (g.accuse || g.solved) out.push(...boxSoluzioneConteggio());
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Gli ospiti della villa'),
    g.assign.map(a => { const x = charById(a.c); return h('div', { class: 'team' }, h('strong', {}, x.name), h('span', { class: 'sub' }, x.role + ' · ' + a.p + ' · ' + x.costume)); })));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Solo per te · chi era dove tra le 19:55 e le 20:05'),
    h('div', { class: 'list' }, g.assign.map(a => { const x = charById(a.c); return h('div', { class: 'item' }, h('b', {}, a.p), h('span', {}, h('strong', {}, x.role + ': '), x.where || '')); }))));
  return out;
}
function boxSoluzioneConteggio() {
  const t = {}; for (const a of accuse) t[a.suspect] = (t[a.suspect] || 0) + 1;
  const rows = Object.entries(t).sort((a, b) => b[1] - a[1]); const top = rows.length ? rows[0][1] : 0;
  return [h('div', { class: 'box' }, h('h3', {}, `Accuse · ${accuse.length} su ${state.giallo.assign.length}`),
    rows.length ? h('div', { class: 'tally' }, rows.map(([id, k]) => h('div', {}, h('span', {}, charById(id).name), h('span', { class: 'count' }, `${k} ${k === 1 ? 'accusa' : 'accuse'}`),
      h('span', { class: 'bar' }, h('i', { style: `width:${top ? k / top * 100 : 0}%` }))))) : h('p', { class: 'sub' }, 'Ancora nessuna accusa.'))];
}
let suspect = null;
function boxAccusa() {
  const mine = myAccusa();
  if (mine) return [h('div', { class: 'box reveal' }, h('h3', {}, 'Accusa registrata'), h('h2', {}, 'Hai accusato ' + charById(mine.suspect).name),
    h('p', { class: 'sub' }, `Hanno accusato ${accuse.length} su ${state.giallo.assign.length}. La soluzione arriva tra poco.`))];
  const myId = state.giallo.assign.find(x => x.p === me)?.c;
  return [h('div', { class: 'box' }, h('h3', {}, 'Le accuse'), h('h2', {}, 'Chi ha ucciso Ottavio?'),
    h('p', { class: 'sub' }, 'Una sola accusa, segreta e definitiva.'),
    h('div', { class: 'nominees' }, state.giallo.assign.filter(a => a.c !== myId).map(a => { const x = charById(a.c);
      return h('button', { class: 'nominee', 'aria-pressed': suspect === x.id ? 'true' : 'false', onclick: () => { suspect = x.id; render(); } }, x.name, h('small', {}, x.role + ' · ' + a.p)); })),
    h('button', { class: 'btn big', disabled: !suspect, onclick: castAccusa }, 'Accusa'))];
}
async function castAccusa() {
  try { await setDoc(doc(db, 'accuse', slug(me)), { voter: me, suspect, at: new Date().toISOString() }); suspect = null; render(); }
  catch (e) { error = 'L’accusa non è stata salvata (' + e.code + '). Se avevi già accusato non puoi cambiarla.'; render(); }
}
function boxSoluzione() {
  const culprit = charById(GIALLO.culprit); const who = state.giallo.assign.find(a => a.c === GIALLO.culprit)?.p;
  const t = {}; for (const a of accuse) t[a.suspect] = (t[a.suspect] || 0) + 1;
  const rows = Object.entries(t).sort((a, b) => b[1] - a[1]); const top = rows.length ? rows[0][1] : 0;
  const right = accuse.filter(a => a.suspect === GIALLO.culprit).map(a => a.voter);
  return [h('div', { class: 'envelope reveal' }, h('h3', {}, 'La soluzione'), h('p', { class: 'winner' }, culprit.name + (who ? ' (' + who + ')' : '')), h('p', {}, GIALLO.solution),
    h('h3', {}, 'Le accuse'), h('div', { class: 'tally' }, rows.map(([id, k]) => h('div', {}, h('span', {}, charById(id).name), h('span', { class: 'count' }, `${k} ${k === 1 ? 'accusa' : 'accuse'}`),
      h('span', { class: 'bar' }, h('i', { style: `width:${top ? k / top * 100 : 0}%` }))))),
    h('p', { class: 'sub' }, right.length ? 'Hanno indovinato: ' + right.join(', ') : 'Nessuno ha indovinato: il colpevole l’ha fatta franca.'))];
}

function screenRegia() {
  if (!admin) {
    const pin = h('input', { type: 'password', id: 'pin', inputmode: 'numeric', placeholder: 'Codice regia', autocomplete: 'off' });
    const tryPin = () => { if (pin.value === ADMIN_PIN) { admin = true; save('admin', '1'); render(); } else { pin.value = ''; error = 'Codice sbagliato.'; render(); } };
    pin.addEventListener('keydown', e => { if (e.key === 'Enter') tryPin(); });
    return [h('div', { class: 'box' }, h('h3', {}, 'Regia'), h('h2', {}, 'Solo per l’organizzatore'),
      h('div', { class: 'row' }, pin, h('button', { class: 'btn', onclick: tryPin }, 'Entra')))];
  }
  const out = [];
  // partecipanti
  const inp = h('input', { type: 'text', id: 'nuovo', placeholder: 'Nome (es. Giulia)', maxlength: '30', autocomplete: 'off' });
  const add = async () => { const n = inp.value.trim(); if (!n || state.people.some(p => slug(p) === slug(n))) { inp.value = ''; return; }
    await patch({ people: [...state.people, n] }); document.getElementById('nuovo')?.focus(); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  const locked = state.teams.length > 0;
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Partecipanti · ' + state.people.length),
    locked ? h('p', { class: 'small' }, 'Sorteggio fatto: per cambiare i nomi rifai il sorteggio.') : h('div', { class: 'row' }, inp, h('button', { class: 'btn', onclick: add }, 'Aggiungi')),
    state.people.length ? h('div', { class: 'row' }, state.people.map(p => h('span', { class: 'chip' }, p,
      locked ? null : h('button', { 'aria-label': 'Togli ' + p, onclick: () => patch({ people: state.people.filter(x => x !== p) }) }, '×'))))
      : h('p', { class: 'sub' }, 'Aggiungi i nomi: compariranno a tutti nella schermata “Chi sei?”.')));
  // sorteggio
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Sorteggio squadre e menu'),
    h('p', { class: 'sub' }, locked ? 'Squadre estratte: le vede già chiunque apra l’app.' : `Con ${state.people.length} persone escono ${Math.min(5, state.people.length)} squadre, ognuna con un menu.`),
    confirm === 'draw'
      ? h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => { confirm = null; patch({ teams: draw(state.people) }); } }, locked ? 'Sì, rifai il sorteggio' : 'Sì, sorteggia'),
          h('button', { class: 'btn ghost', onclick: () => { confirm = null; render(); } }, 'Annulla'))
      : h('div', { class: 'row' },
          h('button', { class: 'btn', disabled: state.people.length < 2 || state.votingOpen, onclick: () => { confirm = 'draw'; render(); } }, locked ? 'Rifai il sorteggio' : 'Sorteggia adesso'),
          locked && !state.votingOpen ? h('button', { class: 'btn ghost', onclick: () => patch({ teams: [] }) }, 'Annulla sorteggio') : null)));
  // giallo
  const g = state.giallo;
  const gBtns = [];
  if (confirm === 'gassign') gBtns.push(h('button', { class: 'btn', onclick: () => { confirm = null; patch({ giallo: { ...g, narrator: me, assign: assignCharacters(state.people, GIALLO.order, me) } }); } }, g.assign.length ? 'Sì, riassegna' : 'Sì, assegna'),
    h('button', { class: 'btn ghost', onclick: () => { confirm = null; render(); } }, 'Annulla'));
  else if (g.round === 0) gBtns.push(h('button', { class: 'btn', disabled: state.people.length < 3 || !me, onclick: () => { confirm = 'gassign'; render(); } }, g.assign.length ? 'Riassegna i personaggi' : 'Assegna i personaggi'));
  const callee = GIALLO.callOrder.map(id => g.assign.find(a => a.c === id)).find(Boolean);
  if (g.assign.length && g.round === 0 && callee) gBtns.push(h('button', { class: g.call ? 'btn ghost' : 'btn', onclick: () => patch({ giallo: { ...g, call: { to: callee.p, at: Date.now() } } }) },
    g.call ? 'Rimanda l’avviso a ' + callee.p : 'Manda ' + callee.p + ' nello studio'));
  if (g.assign.length && g.round < 3) gBtns.push(h('button', { class: g.round === 0 ? 'btn ghost' : 'btn', onclick: () => patch({ giallo: { ...g, round: g.round + 1 } }) }, 'Sblocca il giro ' + (g.round + 1)));
  if (g.round === 3 && !g.accuse) gBtns.push(h('button', { class: 'btn', onclick: () => patch({ giallo: { ...g, accuse: true } }) }, 'Apri le accuse'));
  if (g.accuse && !g.solved) gBtns.push(confirm === 'gsolve'
    ? h('button', { class: 'btn', onclick: () => { confirm = null; patch({ giallo: { ...g, solved: true } }); go('giallo'); } }, 'Sì, rivela la soluzione')
    : h('button', { class: 'btn', disabled: !accuse.length, onclick: () => { confirm = 'gsolve'; render(); } }, 'Rivela la soluzione'));
  const accused = new Set(accuse.map(a => a.id));
  const mancanoG = g.assign.filter(a => !accused.has(slug(a.p))).map(a => a.p);
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Cena con delitto'),
    !me ? h('p', { class: 'small' }, 'Prima scegli il tuo nome in “Chi sei?”: sarai il narratore e non riceverai un personaggio.') : null,
    h('p', { class: 'sub' }, !g.assign.length ? `Assegna i personaggi una settimana prima. Tu sei il narratore; per gli altri ${Math.max(0, state.people.length - (me ? 1 : 0))} servono ${Math.min(Math.max(0, state.people.length - (me ? 1 : 0)), GIALLO.order.length)} personaggi su ${GIALLO.order.length}.`
      : g.solved ? 'Soluzione rivelata.' : g.accuse ? `Accuse: ${accuse.length} su ${g.assign.length}.` : g.round ? `Giro ${g.round} di 3 sbloccato.` : `${g.assign.length} personaggi assegnati: ognuno vede il suo nell’app.`),
    g.accuse && !g.solved && mancanoG.length ? h('p', { class: 'small' }, 'Mancano: ' + mancanoG.join(', ')) : null,
    g.assign.length ? h('p', { class: 'small' }, 'Narratore: ' + (g.narrator || '—') + '. La sera del 31 segui il copione nella scheda Giallo e sblocca un giro a ogni portata.') : null,
    h('div', { class: 'row' }, gBtns)));
  // urne
  const voted = new Set(ballots.map(b => b.id));
  const missing = state.people.filter(p => !voted.has(slug(p)));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Oscar'),
    h('div', { class: 'row', style: 'justify-content:space-between' }, h('span', {}, state.opened ? 'Buste aperte' : state.votingOpen ? 'Urne aperte' : 'Urne chiuse'),
      h('span', { class: 'count' }, `${ballots.length} su ${state.people.length} schede`)),
    h('div', { class: 'meter' }, h('i', { style: `width:${state.people.length ? ballots.length / state.people.length * 100 : 0}%` })),
    state.votingOpen && !state.opened && missing.length ? h('p', { class: 'small' }, 'Mancano: ' + missing.join(', ')) : null,
    !state.votingOpen && !state.opened ? h('button', { class: 'btn', disabled: state.people.length < 2, onclick: () => patch({ votingOpen: true }) }, 'Apri le urne') : null,
    state.votingOpen && !state.opened ? (confirm === 'open'
      ? h('div', { class: 'row' }, h('p', { class: 'sub' }, missing.length ? `Mancano ${missing.length} voti: chi non ha votato non potrà più farlo.` : 'Hanno votato tutti.'),
          h('button', { class: 'btn', onclick: () => { confirm = null; patch({ opened: true, votingOpen: false }); go('oscar'); } }, 'Apri le buste'),
          h('button', { class: 'btn ghost', onclick: () => { confirm = null; render(); } }, 'Aspetta'))
      : h('button', { class: 'btn', disabled: !ballots.length, onclick: () => { confirm = 'open'; render(); } }, 'Chiudi le urne e apri le buste')) : null,
    state.opened ? h('button', { class: 'btn', onclick: () => go('oscar') }, 'Vai allo spoglio') : null));
  // azzera
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Azzera tutto'),
    h('p', { class: 'sub' }, 'Cancella schede, accuse, sorteggio, personaggi e stato delle urne. I partecipanti restano.'),
    confirm === 'reset'
      ? h('div', { class: 'row' }, h('button', { class: 'btn danger', onclick: resetAll }, 'Sì, azzera'), h('button', { class: 'btn ghost', onclick: () => { confirm = null; render(); } }, 'Annulla'))
      : h('button', { class: 'btn ghost', onclick: () => { confirm = 'reset'; render(); } }, 'Azzera')));
  out.push(h('button', { class: 'btn ghost', onclick: () => { admin = false; save('admin', null); render(); } }, 'Esci dalla regia'));
  return out;
}
async function resetAll() {
  confirm = null;
  try {
    const snap = await getDocs(collection(db, 'ballots'));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    const snap2 = await getDocs(collection(db, 'accuse'));
    await Promise.all(snap2.docs.map(d => deleteDoc(d.ref)));
    await patch({ teams: [], votingOpen: false, opened: false, revealed: [], giallo: NO_GIALLO });
  } catch (e) { error = 'Non sono riuscito ad azzerare (' + e.code + ').'; render(); }
}

/* ---------- impaginazione ---------- */
function render() {
  const app = document.getElementById('app'); const nav = document.getElementById('tabs');
  const head = h('header', {}, h('p', { class: 'eyebrow' }, 'Isola Sant’Antonio · 30.12 – 1.1'),
    h('h1', {}, 'Capodanno ', h('em', {}, 'a Isola')),
    me && tab !== 'chi' ? h('p', { class: 'small' }, 'Sei ', h('strong', {}, me), ' · ',
      h('button', { class: 'btn ghost', style: 'padding:4px 10px;min-height:32px;font-size:13px', onclick: () => { me = null; save('me', null); go('chi'); } }, 'Non sono io')) : null);
  let body;
  if (!configured) body = [h('div', { class: 'warn' }, 'App non ancora collegata a Firebase: incolla la configurazione in config.js (vedi LEGGIMI).')];
  else if (!loaded) body = [h('p', { class: 'sub' }, 'Caricamento…')];
  else if (tab === 'chi' || (!me && tab !== 'regia' && tab !== 'programma')) body = screenChi();
  else body = { programma: screenProgramma, squadra: screenSquadra, giallo: screenGiallo, oscar: screenOscar, regia: screenRegia }[tab]();
  const foot = !admin && tab !== 'regia' && configured ? h('button', { class: 'btn ghost', style: 'align-self:center;font-size:13px;min-height:36px;padding:6px 14px;opacity:.7', onclick: () => go('regia') }, 'Area organizzatore') : null;
  app.replaceChildren(...[head, error ? h('p', { class: 'warn', role: 'alert' }, error) : null, ...body, foot].filter(Boolean));
  // barra in basso
  const tabs = [['programma', 'Programma'], ['squadra', 'Squadra'], ['giallo', 'Giallo'], ['oscar', 'Oscar']];
  if (admin) tabs.push(['regia', 'Regia']);
  nav.style.setProperty('--n', tabs.length);
  nav.replaceChildren(...tabs.map(([id, label]) => h('button', { 'aria-current': tab === id ? 'page' : null, onclick: () => go(me || id === 'programma' || id === 'regia' ? id : 'chi') }, label)));
  nav.hidden = !configured;
  showCall();
}
function showCall() {
  const g = state.giallo; const old = document.getElementById('chiamata');
  const due = g && g.call && g.call.to === me && load('call') !== String(g.call.at);
  if (!due) { old?.remove(); return; }
  if (old) return;
  const el = h('div', { id: 'chiamata', role: 'alertdialog', style: 'position:fixed;inset:0;z-index:50;background:#171C36;display:flex;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top,0px)) max(20px, env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) max(20px, env(safe-area-inset-left,0px))' },
    h('div', { class: 'wrap reveal', style: 'text-align:center;gap:20px' },
      h('p', { class: 'eyebrow' }, 'Solo per te · Villa Ferraris'),
      h('h1', {}, 'Ti chiamano ', h('em', {}, 'nello studio')),
      h('p', { style: 'font-size:19px;line-height:1.5' }, GIALLO.ottavio.call),
      h('button', { class: 'btn big', onclick: () => { save('call', String(g.call.at)); document.getElementById('chiamata')?.remove(); } }, 'Ci vado')));
  document.body.append(el);
  try { navigator.vibrate && navigator.vibrate([400, 150, 400, 150, 400]); } catch {}
}
// la regia si apre aggiungendo #regia all'indirizzo
if (location.hash === '#regia') tab = 'regia';
window.addEventListener('hashchange', () => { if (location.hash === '#regia') go('regia'); });
render();
