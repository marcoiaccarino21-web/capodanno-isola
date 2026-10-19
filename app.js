import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, doc, collection, onSnapshot, setDoc, deleteDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig, ADMIN_PIN } from './config.js';
import { MENUS, CATEGORIES, PROGRAM, slug, draw, menuById, teamOf, teamLabel, nominees, activeCategories, tally } from './logic.js';

/* ---------- stato ---------- */
let state = { people: [], teams: [], votingOpen: false, opened: false, revealed: [] };
let ballots = [];           // [{id, voter, votes, at}]
let loaded = false;
let me = load('me');
let admin = load('admin', sessionStorage) === '1';
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
    state = { people: v.people || [], teams: v.teams || [], votingOpen: !!v.votingOpen, opened: !!v.opened, revealed: v.revealed || [] };
    loaded = true;
    if (me && !state.people.includes(me)) { me = null; save('me', null); if (tab !== 'regia') tab = 'chi'; }
    render();
  }, e => { error = 'Non riesco a leggere i dati: controlla le regole di Firestore. (' + e.code + ')'; render(); });
  onSnapshot(collection(db, 'ballots'), snap => {
    ballots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
      h('p', { class: 'sub' }, 'Il sorteggio si fa il 30 pomeriggio. Appena estratte, qui vedrai la tua squadra e cosa cucinare.')));
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

function screenRegia() {
  if (!admin) {
    const pin = h('input', { type: 'password', id: 'pin', inputmode: 'numeric', placeholder: 'Codice regia', autocomplete: 'off' });
    const tryPin = () => { if (pin.value === ADMIN_PIN) { admin = true; save('admin', '1', sessionStorage); render(); } else { pin.value = ''; error = 'Codice sbagliato.'; render(); } };
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
    h('p', { class: 'sub' }, 'Cancella schede, sorteggio e stato delle urne. I partecipanti restano.'),
    confirm === 'reset'
      ? h('div', { class: 'row' }, h('button', { class: 'btn danger', onclick: resetAll }, 'Sì, azzera'), h('button', { class: 'btn ghost', onclick: () => { confirm = null; render(); } }, 'Annulla'))
      : h('button', { class: 'btn ghost', onclick: () => { confirm = 'reset'; render(); } }, 'Azzera')));
  out.push(h('button', { class: 'btn ghost', onclick: () => { admin = false; save('admin', null, sessionStorage); render(); } }, 'Esci dalla regia'));
  return out;
}
async function resetAll() {
  confirm = null;
  try {
    const snap = await getDocs(collection(db, 'ballots'));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    await patch({ teams: [], votingOpen: false, opened: false, revealed: [] });
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
  else body = { programma: screenProgramma, squadra: screenSquadra, oscar: screenOscar, regia: screenRegia }[tab]();
  app.replaceChildren(...[head, error ? h('p', { class: 'warn', role: 'alert' }, error) : null, ...body].filter(Boolean));
  // barra in basso
  const tabs = [['programma', 'Programma'], ['squadra', 'Squadra'], ['oscar', 'Oscar']];
  if (admin) tabs.push(['regia', 'Regia']);
  nav.style.setProperty('--n', tabs.length);
  nav.replaceChildren(...tabs.map(([id, label]) => h('button', { 'aria-current': tab === id ? 'page' : null, onclick: () => go(me || id === 'programma' || id === 'regia' ? id : 'chi') }, label)));
  nav.hidden = !configured;
}
// la regia si apre aggiungendo #regia all'indirizzo
if (location.hash === '#regia') tab = 'regia';
window.addEventListener('hashchange', () => { if (location.hash === '#regia') go('regia'); });
render();
