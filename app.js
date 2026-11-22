import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, doc, collection, onSnapshot, setDoc, deleteDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig, ADMIN_PIN } from './config.js';
import { MENUS, CATEGORIES, DISHES, SPESA, dishById, slug, draw, menuById, teamOf, teamLabel, nominees, activeCategories, spoglioCategories, detectives, tally, nominations, assignCharacters } from './logic.js';
import { GIALLO, femminile } from './giallo.js';
// ?giallo nel link: app solo per la cena con delitto (niente programma, squadre e Oscar)
const SOLO = new URLSearchParams(location.search).has('giallo');
const HOME = SOLO ? 'giallo' : 'squadra';
if (SOLO) document.title = 'Delitto a Villa Ferraris';
import { NOMI, caricaRitratti } from './ritratti.js';

/* ---------- stato ---------- */
const NO_GIALLO = { assign: [], narrator: null, round: 0, accuse: false, solved: false, call: null, task: null, allarme: null };
let state = { people: [], teams: [], sesso: {}, votingOpen: false, opened: false, revealed: [], nominated: [], revealedAt: {}, presenter: null, presenterMode: 'staffetta', giallo: NO_GIALLO, tavola: null };
let RITRATTI = {};
caricaRitratti().then(r => { RITRATTI = r; render(); }).catch(() => {});
let accuse = [];            // [{id, voter, suspect}]
let ballots = [];           // [{id, voter, votes, at}]
let loaded = false;
let me = load('me');
let admin = load('admin') === '1';
let tab = me ? HOME : 'chi';
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
    state = { people: v.people || [], teams: v.teams || [], sesso: v.sesso || {}, votingOpen: !!v.votingOpen, opened: !!v.opened, revealed: v.revealed || [], nominated: v.nominated || [], revealedAt: v.revealedAt || {}, presenter: v.presenter || null, presenterMode: v.presenterMode || 'staffetta', giallo: { ...NO_GIALLO, ...(v.giallo || {}) }, tavola: v.tavola || null };
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
    h('div', { class: 'names' }, state.people.map(p => h('button', { class: 'name', onclick: () => { me = p; save('me', p); go(HOME); } }, p))))];
}

// lista della spesa della squadra: le spunte restano solo su questo telefono
function boxSpesa(menu) {
  const lista = SPESA[menu] || []; const key = 'spesa:' + menu;
  let fatti = []; try { fatti = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
  const toggle = i => { fatti = fatti.includes(i) ? fatti.filter(x => x !== i) : [...fatti, i]; try { localStorage.setItem(key, JSON.stringify(fatti)); } catch (e) {} render(); };
  return h('div', { class: 'box' }, h('h3', {}, 'La spesa della tua squadra'),
    h('p', { class: 'small' }, `Tutto quello che serve al vostro menu. ${fatti.length} su ${lista.length} nel carrello. Poi tutti alla cassa insieme.`),
    h('div', { class: 'spesa' }, lista.map(([cosa, qt], i) => h('button', { class: 'nominee', 'aria-pressed': fatti.includes(i) ? 'true' : 'false', onclick: () => toggle(i) },
      h('span', {}, (fatti.includes(i) ? '✓ ' : '') + cosa), h('small', {}, qt)))));
}

function screenSquadra() {
  const out = [];
  if (!state.teams.length) {
    out.push(h('div', { class: 'box' }, h('h3', {}, 'Cena giro del mondo'), h('h2', {}, 'Squadre ancora da sorteggiare'),
      h('p', { class: 'sub' }, 'Il sorteggio si fa alla Metro il 30 mattina, dopo la spesa comune. Appena estratte, qui vedrai la tua squadra, cosa cucinare e la lista della spesa.')));
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
    out.push(h('div', { class: 'box' }, h('h3', {}, 'Quando si cucina'),
      h('div', { class: 'list' },
        h('div', { class: 'item' }, h('b', {}, 'Mercoledì 30'), h('span', {}, 'Dalle 17:30 ai fornelli, con la tua squadra')),
        h('div', { class: 'item' }, h('b', {}, '20:00'), h('span', {}, 'A tavola: si servono le portate')))));
    out.push(boxSpesa(t.menu));
  } else if (me) {
    out.push(h('div', { class: 'box' }, h('p', { class: 'sub' }, 'Non sei in nessuna squadra: chiedi all’organizzatore di rifare il sorteggio.')));
  }
  return out;
}

function screenOscar() {
  const cats = activeCategories(state);
  if (state.opened) return screenSpoglio(spoglioCategories(state));
  if (!state.votingOpen) return [h('div', { class: 'box' }, h('h3', {}, 'Gli Oscar del Capodanno'), h('h2', {}, 'Le urne sono chiuse'),
    h('p', { class: 'sub' }, 'Si vota il 1° gennaio. Le categorie:'),
    h('div', { class: 'list' }, CATEGORIES.map(c => h('div', { class: 'item' }, h('b', {}, c.kind === 'dish' ? 'Piatto' : c.kind === 'auto' ? 'Dalle accuse' : 'Persona'), h('span', {}, c.label)))))];
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
    h('div', { class: 'summary' }, cats.map(c => h('div', {}, h('span', { class: 'sub' }, c.label), h('span', {}, c.kind === 'dish' && dishById(flow.votes[c.id]) ? dishById(flow.votes[c.id]).label : flow.votes[c.id])))),
    h('button', { class: 'btn big', onclick: castVote }, 'Imbuca la scheda'),
    h('button', { class: 'btn ghost big', onclick: () => { flow.i = 0; render(); } }, 'Correggi'))];
}
async function castVote() {
  const body = { voter: me, votes: flow.votes, at: new Date().toISOString() };
  try { await setDoc(doc(db, 'ballots', slug(me)), body); flow = null; render(); }
  catch (e) { error = 'La scheda non è stata salvata (' + e.code + '). Se avevi già votato non puoi rivotare.'; render(); }
}

// Cerimonia: per ogni busta il presentatore legge le nomination, poi «E l'Oscar va a…»
// (3 secondi di attesa su tutti i telefoni), poi il vincitore ha 30 secondi di discorso.
const DISCORSO = 30000;
let sbircia = null; // busta di cui il presentatore ha già visto il vincitore (solo su questo telefono)
function esito(c) {
  if (c.kind === 'auto') {
    const d = detectives(accuse.filter(a => a.voter !== state.giallo.narrator), GIALLO.culprit);
    return { nomi: d.slice(0, 3).map(x => x.voter), vincitori: d.length ? [d[0].voter] : [], dopo: d.slice(1), persone: d.length ? [d[0].voter] : [], d };
  }
  const t = tally(ballots, c.id);
  const nome = v => c.kind === 'dish' && dishById(v) ? dishById(v).label + ' (' + dishById(v).country + ')' : v;
  const squadre = c.kind === 'dish' ? [...new Set(t.winners.map(v => dishById(v)?.menu))].map(m => (state.teams || []).find(x => x.menu === m)).filter(Boolean) : [];
  return { t, nome, squadre, nomi: nominations(t.rows).map(r => nome(r[0])).sort((x, y) => x.localeCompare(y)),
    vincitori: t.winners.map(nome), persone: c.kind === 'dish' ? squadre.flatMap(x => x.members) : t.winners };
}
// la busta la vede solo chi presenta (in modalità «Tutti» chiunque la apra)
const presenta = () => state.presenterMode === 'app' || (!!state.presenter && state.presenter === me);
function prossimoPresentatore(e) {
  const m = state.presenterMode, ppl = state.people;
  const caso = l => l.length ? l[Math.floor(Math.random() * l.length)] : state.presenter;
  if (m === 'staffetta') { const l = e.persone.filter(p => p !== state.giallo.narrator); return l.length ? caso(l) : state.presenter; }
  if (m === 'sorteggio') return caso(ppl.filter(p => p !== state.presenter && p !== state.giallo.narrator));
  return state.presenter;
}
function apriBusta(c) {
  const e = esito(c);
  patch({ revealed: [...state.revealed, c.id], revealedAt: { ...state.revealedAt, [c.id]: new Date().toISOString() }, presenter: prossimoPresentatore(e) });
}
// conti alla rovescia: aggiorna solo i numeri, e ridisegna quando una fase finisce
let ticker = null;
function tick(on) {
  if (on && !ticker) ticker = setInterval(() => {
    const els = document.querySelectorAll('[data-end]');
    if (!els.length || tab !== 'oscar') return tick(false);
    for (const el of els) {
      const left = +el.dataset.end - Date.now();
      if (left <= 0) return render();
      if (el.dataset.dur) el.style.width = left / +el.dataset.dur * 100 + '%';
      else el.textContent = Math.ceil(left / 1000) + (el.dataset.s ? ' s' : '');
    }
  }, 250);
  if (!on && ticker) { clearInterval(ticker); ticker = null; }
}

function screenSpoglio(cats) {
  const ora = x => new Date(x.at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const corrente = cats.find(c => !state.revealed.includes(c.id));
  const chi = state.presenterMode === 'app' ? 'L’app: tocca chi vuoi' : state.presenter || 'da scegliere in Regia';
  const out = [h('div', { class: 'box' }, h('h3', {}, 'Gli Oscar del Capodanno'),
    h('h2', {}, corrente ? (state.presenter === me && state.presenterMode !== 'app' ? 'Presenti tu' : 'Presenta: ' + chi) : 'Cerimonia finita'),
    h('p', { class: 'sub' }, corrente
      ? (presenta() ? 'Le buste le vedi solo tu. Leggi ad alta voce categoria e nomination, poi guarda il vincitore e annuncialo. Poi ha 30 secondi per il discorso.' : 'Ascolta il presentatore: qui compare il vincitore appena lo annuncia.')
      : 'Tutte le statuette sono state consegnate.'))];
  let attivo = false;
  for (const c of cats) {
    const open = state.revealed.includes(c.id), nom = state.nominated.includes(c.id), cur = c === corrente;
    const e = esito(c);
    const kids = [h('h3', {}, c.label)];
    if (open) {
      const t0 = Date.parse(state.revealedAt[c.id] || 0) || 0, dt = Date.now() - t0;
      {
        kids.push(h('p', { class: 'winner' }, e.vincitori.length ? e.vincitori.join(' e ') : c.kind === 'auto' ? 'Nessuno' : 'Nessun voto'));
        if (c.kind === 'auto') {
          kids.push(h('p', { class: 'sub' }, e.d.length ? 'Il primo ad accusare il colpevole, alle ' + ora(e.d[0]) + '.' : 'Nessuno ha accusato il colpevole.'));
          if (e.dopo.length) kids.push(h('p', { class: 'small' }, 'Dopo: ' + e.dopo.map(x => x.voter + ' (' + ora(x) + ')').join(', ')));
        } else {
          if (e.squadre.length) kids.push(h('p', { class: 'sub' }, 'Vince la squadra ' + e.squadre.map(x => (menuById(x.menu)?.country ?? '') + ' (' + x.members.join(', ') + ')').join(' e la squadra ')));
          else if (e.t.winners.length > 1) kids.push(h('p', { class: 'sub' }, 'Ex aequo: due statuette.'));
        }
        const left = DISCORSO - dt;
        if (left > 0 && e.vincitori.length) { attivo = true; kids.push(h('div', { class: 'speech' }, h('b', {}, 'Discorso di ringraziamento'), h('span', { class: 'count', 'data-end': t0 + DISCORSO, 'data-s': 1 }, Math.ceil(left / 1000) + ' s'), h('span', { class: 'bar' }, h('i', { 'data-end': t0 + DISCORSO, 'data-dur': DISCORSO, style: `width:${left / DISCORSO * 100}%` })))); }
        else if (e.t) kids.push(h('div', { class: 'tally' }, e.t.rows.map(([n, k]) => h('div', {}, h('span', {}, e.nome(n)), h('span', { class: 'count' }, `${k} ${k === 1 ? 'voto' : 'voti'}`),
          h('span', { class: 'bar' }, h('i', { style: `width:${e.t.top ? k / e.t.top * 100 : 0}%` }))))));
      }
    } else if (nom && cur && presenta()) {
      kids.push(h('p', { class: 'step', style: 'text-align:left' }, 'Solo per te · leggi le nomination'),
        e.nomi.length ? h('ul', { class: 'nomi' }, e.nomi.map(n => h('li', {}, n))) : h('p', { class: 'sub' }, c.kind === 'auto' ? 'Nessuno ha indovinato il colpevole.' : 'Nessun voto.'));
      if (sbircia !== c.id) kids.push(h('button', { class: 'btn', onclick: () => { sbircia = c.id; render(); } }, 'E l’Oscar va a… (guarda il vincitore)'));
      else kids.push(h('p', { class: 'step', style: 'text-align:left' }, 'Annuncia ad alta voce'),
        h('p', { class: 'winner' }, e.vincitori.length ? e.vincitori.join(' e ') : c.kind === 'auto' ? 'Nessuno' : 'Nessun voto'),
        h('button', { class: 'btn', onclick: () => { sbircia = null; apriBusta(c); } }, 'Annunciato: parte il discorso'));
    } else if (nom && cur) {
      kids.push(h('p', { class: 'sub' }, 'Il presentatore ha aperto la busta: ascolta le nomination…'));
    } else if (cur && presenta()) {
      kids.push(c.note ? h('p', { class: 'small' }, c.note) : null, h('button', { class: 'btn', onclick: () => patch({ nominated: [...state.nominated, c.id] }) }, 'Apri la busta'));
    } else kids.push(h('p', { class: 'sub' }, cur ? 'Busta ancora sigillata' : 'Dopo'));
    out.push(h('div', { class: 'envelope' + (open ? ' reveal' : '') + (cur ? ' current' : '') }, kids));
  }
  tick(attivo);
  return out;
}

/* ---------- giallo ---------- */
const charById = id => GIALLO.characters.find(c => c.id === id);
// nome, ruolo e ritratto del personaggio secondo il sesso di chi lo interpreta
function pers(a) {
  const c = charById(a.c), s = state.sesso[a.p], n = NOMI[a.c];
  return { name: s && n ? n[s][0] : c.name, role: s && n ? n[s][1] : c.role, key: s ? a.c + '-' + s : null, sesso: s };
}
function ritratto(key, cls) {
  const svg = key && RITRATTI[key];
  return svg ? h('img', { class: cls || 'ritratto', alt: '', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) }) : null;
}
const genere = (t, s, id) => !s ? t : s === 'F' ? femminile(id, t.replace(/un figlio o una figlia/g, 'una figlia')) : t.replace(/un figlio o una figlia/g, 'un figlio');
(() => { const st = document.createElement('style'); st.textContent =
  '.ritratto{display:block;width:min(240px,70%);margin:0 auto 4px;aspect-ratio:540/620;filter:drop-shadow(0 6px 16px rgba(0,0,0,.35))}' +
  '.galleria{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 10px}' +
  '.galleria figure{margin:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px}' +
  '.galleria img,.galleria .vuoto{width:100%;aspect-ratio:540/620}.galleria .vuoto{border:2px solid var(--line);border-radius:50%/44%}' +
  '.galleria b{font-family:var(--display);font-size:14px;line-height:1.15}.galleria small{color:var(--faint);font-size:12px;line-height:1.2}.galleria .mine b{color:var(--gold)}' +
  '.sx{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden}.sx button{background:none;border:0;color:var(--faint);font:700 12px var(--body);padding:4px 9px;min-height:30px;cursor:pointer}' +
  '.sx button[aria-pressed="true"]{background:var(--gold);color:var(--night)}';
  document.head.append(st); })();
function galleria(list, withNarrator) {
  const g = state.giallo;
  const figs = list.map(a => { const x = pers(a); return h('figure', { class: a.p === me ? 'mine' : null }, ritratto(x.key, ' ') || h('div', { class: 'vuoto' }), h('b', {}, x.name), h('small', {}, x.role + ' · ' + a.p)); });
  if (withNarrator && g.narrator) figs.unshift(h('figure', {}, ritratto('ottavio', ' '), h('b', {}, GIALLO.ottavio.name), h('small', {}, 'La vittima · ' + g.narrator)));
  return h('div', { class: 'galleria' }, figs);
}
const myChar = () => { const a = state.giallo.assign.find(x => x.p === me); return a && charById(a.c); };
const myAccusa = () => me && accuse.find(a => a.id === slug(me));

function screenGiallo() {
  const g = state.giallo; const out = [];
  // prima del ritrovamento i giocatori non sanno ancora che Ottavio morirà
  const morto = !!g.call || g.round > 0;
  const prologo = GIALLO.setting.split(' Alle 19:30')[0];
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Cena con delitto · 31 sera'), h('h2', {}, GIALLO.title), h('p', { class: 'sub' }, morto ? GIALLO.setting : prologo)));
  if (!g.assign.length) {
    out.push(h('div', { class: 'box' }, h('p', { class: 'sub' }, 'I personaggi si assegnano una settimana prima: qui vedrai chi sei. Il resto lo scoprirai durante la serata.')));
    return out;
  }
  if (me && me === g.narrator) return [...out, ...screenNarratore()];
  const c = myChar();
  if (c) {
    const x = pers(state.giallo.assign.find(a => a.p === me));
    out.push(h('div', { class: 'box gold reveal' }, h('h3', {}, 'Il tuo personaggio · ' + x.role), h('p', { class: 'big-dish' }, x.name),
      h('p', {}, genere(c.intro, x.sesso, c.id)),
      h('p', { style: 'font-size:15px;font-weight:600' }, 'Porta a tracolla il tuo cartellino. Il personaggio è solo sul tuo telefono: non farlo vedere a nessuno.')));
    if (g.call && g.call.to === me && !g.allarme && g.round === 0) out.push(h('div', { class: 'box gold' }, h('h3', {}, 'Nello studio'),
      h('p', {}, 'Quando trovi il maestro, premi qui e grida: «Il maestro è morto!»'),
      h('button', { class: 'btn big', onclick: () => patch({ giallo: { ...state.giallo, allarme: { at: Date.now() } } }) }, 'Allarme!')));
    if (!morto) out.push(h('div', { class: 'box' }, h('p', { class: 'sub' }, 'Goditi l’aperitivo nei panni del tuo personaggio. Il resto arriva sul telefono durante la serata.')));
    if (!morto && g.task && g.task.to === me) out.push(h('div', { class: 'box' }, h('h3', {}, 'La tua missione · non mostrarla'), h('div', { class: 'sub' }, passiMissione())));
    else {
      out.push(h('div', { class: 'box reveal' }, h('h3', {}, 'Il tuo segreto · non mostrarlo'), h('p', {}, genere(c.secret, x.sesso, c.id)),
        c.where ? h('h3', {}, 'Dove eri davvero · 19:25–19:35') : null, c.where ? h('p', {}, c.where) : null,
        h('h3', {}, 'Il tuo obiettivo'), h('p', {}, genere(c.goal, x.sesso, c.id))));
      const sbloccati = c.clues.slice(0, g.round);
      if (sbloccati.length) out.push(h('div', { class: 'box' }, h('h3', {}, sbloccati.length === 1 ? 'Il tuo indizio' : 'I tuoi indizi'),
        h('div', { class: 'list' }, sbloccati.map((t, i) => h('div', { class: 'item' + (i === sbloccati.length - 1 ? ' reveal' : '') }, h('b', {}, 'Giro ' + (i + 1)), h('span', {}, genere(t, x.sesso, c.id)))))));
    }
  } else if (me) {
    out.push(h('div', { class: 'box' }, h('p', { class: 'sub' }, 'Non hai un personaggio: chiedi all’organizzatore di rifare l’assegnazione.')));
  }
  if (c || (me && me === g.narrator)) out.push(boxCartina());
  if (g.accuse && !g.solved && me !== g.narrator) out.push(...boxAccusa()); // il narratore sa già chi è stato
  if (g.solved) out.push(...boxSoluzione());
  return out;
}
function boxCartina() {
  // piantina schematica della casa vera (non in scala): nome nella storia in grande, posto vero sotto
  const R = (x, y, w, hh, nome, vero, gioco = true, fs = 12) => `<g><rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="4" class="${gioco ? 'mp-in' : 'mp-out'}"/>` +
    `<text x="${x + w / 2}" y="${y + hh / 2 - (vero ? 3 : -4)}" class="mp-t" style="font-size:${fs}px">${nome}</text>` +
    (vero ? `<text x="${x + w / 2}" y="${y + hh / 2 + 11}" class="mp-s">${vero}</text>` : '') + '</g>';
  const door = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="mp-door"/>`;
  const terra = `<svg viewBox="0 0 384 432" class="mp-svg" role="img" aria-label="Piantina del piano terra"><g transform="translate(24,0)">
    ${R(10, 40, 160, 146, 'Camera', '', false)}
    ${R(170, 40, 70, 110, 'Bagno', '', false, 11)}
    ${R(240, 40, 110, 110, 'Camera', '', false)}
    ${R(170, 150, 120, 36, 'Corridoio notte', '', false, 10)}
    ${R(290, 150, 60, 36, 'Sgabuzzino', '', true, 10)}
    ${R(240, 186, 110, 94, 'Camera', '', false)}
    ${R(105, 186, 70, 80, 'Scale', 'allo studio', true, 12)}
    ${R(10, 186, 95, 80, 'Cucina', '', true, 12)}
    ${R(10, 266, 165, 114, 'Salone', 'salotto', true, 15)}
    ${R(175, 186, 65, 194, 'Ingresso', '', true, 12)}
    <path d="M-14 266 H10 V380 H240 V414 H-14 Z" class="mp-in"/><text x="125" y="401" class="mp-t" style="font-size:13px">Porticato</text>
    ${door(186, 186, 229, 186)}${door(175, 205, 175, 245)}${door(175, 272, 175, 304)}${door(190, 380, 225, 380)}${door(130, 380, 165, 380)}${door(290, 156, 290, 180)}${door(170, 156, 170, 180)}
    <text x="207" y="372" class="mp-s">porta di casa</text><text x="128" y="370" class="mp-s">porta-finestra</text>
    <text x="-14" y="24" class="mp-h">PIANO TERRA</text></g></svg>`;
  const sotto = `<svg viewBox="0 0 360 150" class="mp-svg" role="img" aria-label="Piantina del seminterrato">
    <text x="10" y="18" class="mp-h">SEMINTERRATO</text>
    ${R(10, 30, 240, 110, 'Studio di Ottavio', 'seminterrato', true, 15)}
    ${R(250, 30, 50, 60, 'Scale', '', true, 10)}
    ${R(250, 90, 100, 50, 'Bagno', 'in fondo alle scale', true, 11)}
    ${door(250, 50, 250, 80)}${door(265, 90, 290, 90)}</svg>`;
  const fuori = `<svg viewBox="0 0 360 236" class="mp-svg" role="img" aria-label="Il terreno visto dall’alto">
    <text x="10" y="18" class="mp-h">FUORI</text>
    <rect x="10" y="28" width="340" height="200" rx="8" class="mp-garden"/>
    ${R(80, 36, 200, 52, 'Cantina', 'capannone', true, 14)}
    <rect x="128" y="98" width="26" height="26" rx="5" class="mp-in"/><text x="141" y="117" class="mp-t" style="font-size:16px">P</text>
    ${R(40, 136, 120, 62, 'Villa', '', false, 13)}
    <path d="M24 168 H40 V198 H160 V214 H24 Z" class="mp-in"/><text x="100" y="210" class="mp-s" style="fill:var(--cream);font-weight:700">Porticato</text>
    ${R(232, 146, 96, 46, 'Gazebo', 'angolo del giardino', true, 12)}
    <text x="290" y="114" class="mp-s">giardino</text></svg>`;
  const box = h('div', { class: 'mp' });
  box.innerHTML = terra + sotto + fuori;
  return h('div', { class: 'box' }, h('h3', {}, 'La villa · cartina'),
    h('p', { class: 'small' }, 'In grassetto il nome nella storia, sotto il posto vero. In grigio le stanze fuori gioco: porte chiuse.'), box);
}
function boxStanze() {
  // solo per il narratore: i giocatori scoprono le stanze dal vivo, con la cartina e gli oggetti
  return h('div', { class: 'box' }, h('h3', {}, 'Le stanze della villa'),
    h('div', { class: 'list' }, GIALLO.rooms.map(x => h('div', { class: 'item' }, h('b', {}, x.name + ' · giro ' + x.round), h('span', {}, x.text)))));
}
function screenNarratore() {
  const g = state.giallo; const out = [];
  const O = GIALLO.ottavio;
  out.push(h('div', { class: 'box gold' }, ritratto('ottavio'), h('h3', {}, 'Il tuo ruolo · narratore'), h('p', { class: 'big-dish' }, O.name),
    h('p', { style: 'font-size:16px;font-weight:600' }, 'Travestimento: ' + O.costume),
    h('p', {}, 'Nel prologo sei vivo: accogli gli ospiti, brindi e muori. Poi torni come fantasma e guidi la serata. Giri, accuse e soluzione si comandano dalla Regia.'),
    admin ? h('button', { class: 'btn', onclick: () => go('regia') }, 'Vai alla Regia') : null));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Il brindisi di Ottavio · verso le 19:10'), h('p', { style: 'font-style:italic;line-height:1.6' }, '«' + O.speech + '»')));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Una battuta per ogni ospite'), h('p', { class: 'small' }, 'Dille durante l’aperitivo, a ciascuno: lì per lì non significano niente, si capiscono dopo.'),
    h('div', { class: 'list' }, g.assign.map(a => { const x = pers(a); return h('div', { class: 'item' }, h('b', {}, a.p), h('span', {}, h('strong', {}, x.role + ': '), genere(O.lines[a.c] || '', x.sesso, a.c))); }))));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Il copione della serata'),
    h('div', { class: 'list' }, GIALLO.script.map(x => h('div', { class: 'item' }, h('b', {}, x.time), h('span', {}, h('strong', {}, x.title + '. '), x.text))))));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Da preparare prima di cena'), h('ul', { class: 'sub', style: 'margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px' }, GIALLO.prep.map(t => h('li', {}, t)))));
  out.push(boxCartina());
  out.push(boxStanze());
  const ca = g.assign.find(a => a.c === GIALLO.culprit); const who = ca?.p;
  out.push(h('div', { class: 'envelope' }, h('h3', {}, 'Solo per te · la soluzione'),
    h('p', { class: 'winner' }, (ca ? pers(ca).name : charById(GIALLO.culprit).name) + (who ? ' (' + who + ')' : '')), h('p', {}, GIALLO.solution)));
  if (g.accuse || g.solved) out.push(...boxSoluzioneConteggio());
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Gli ospiti della villa'), galleria(g.assign, false),
    h('div', { class: 'list' }, g.assign.map(a => { const x = pers(a); return h('div', { class: 'item' }, h('b', {}, a.p), h('span', {}, h('strong', {}, x.name + ': '), charById(a.c).costume)); }))));
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Solo per te · chi era dove tra le 19:25 e le 19:35'),
    h('div', { class: 'list' }, g.assign.map(a => { const x = pers(a); return h('div', { class: 'item' }, h('b', {}, a.p), h('span', {}, h('strong', {}, x.role + ': '), charById(a.c).where || '')); }))));
  return out;
}
const nomeDi = id => { const a = state.giallo.assign.find(x => x.c === id); return a ? pers(a).name : charById(id).name; };
function boxSoluzioneConteggio() {
  const t = {}; for (const a of accuse) t[a.suspect] = (t[a.suspect] || 0) + 1;
  const rows = Object.entries(t).sort((a, b) => b[1] - a[1]); const top = rows.length ? rows[0][1] : 0;
  return [h('div', { class: 'box' }, h('h3', {}, `Accuse · ${accuse.length} su ${state.giallo.assign.length}`),
    rows.length ? h('div', { class: 'tally' }, rows.map(([id, k]) => h('div', {}, h('span', {}, nomeDi(id)), h('span', { class: 'count' }, `${k} ${k === 1 ? 'accusa' : 'accuse'}`),
      h('span', { class: 'bar' }, h('i', { style: `width:${top ? k / top * 100 : 0}%` }))))) : h('p', { class: 'sub' }, 'Ancora nessuna accusa.'))];
}
let suspect = null;
function boxAccusa() {
  const mine = myAccusa();
  if (mine) return [h('div', { class: 'box reveal' }, h('h3', {}, 'Accusa registrata'), h('h2', {}, 'Hai accusato ' + nomeDi(mine.suspect)),
    h('p', { class: 'sub' }, `Hanno accusato ${accuse.length} su ${state.giallo.assign.length}. La soluzione arriva tra poco.`))];
  const myId = state.giallo.assign.find(x => x.p === me)?.c;
  return [h('div', { class: 'box' }, h('h3', {}, 'Le accuse'), h('h2', {}, 'Chi ha ucciso Ottavio?'),
    h('p', { class: 'sub' }, 'Una sola accusa, segreta e definitiva.'),
    h('div', { class: 'nominees' }, state.giallo.assign.filter(a => a.c !== myId).map(a => { const x = pers(a);
      return h('button', { class: 'nominee', 'aria-pressed': suspect === a.c ? 'true' : 'false', onclick: () => { suspect = a.c; render(); } }, x.name, h('small', {}, x.role + ' · ' + a.p)); })),
    h('button', { class: 'btn big', disabled: !suspect, onclick: castAccusa }, 'Accusa'))];
}
async function castAccusa() {
  try { await setDoc(doc(db, 'accuse', slug(me)), { voter: me, suspect, at: new Date().toISOString() }); suspect = null; render(); }
  catch (e) { error = 'L’accusa non è stata salvata (' + e.code + '). Se avevi già accusato non puoi cambiarla.'; render(); }
}
function boxSoluzione() {
  const culprit = { name: nomeDi(GIALLO.culprit) }; const who = state.giallo.assign.find(a => a.c === GIALLO.culprit)?.p;
  const t = {}; for (const a of accuse) t[a.suspect] = (t[a.suspect] || 0) + 1;
  const rows = Object.entries(t).sort((a, b) => b[1] - a[1]); const top = rows.length ? rows[0][1] : 0;
  const right = accuse.filter(a => a.suspect === GIALLO.culprit).map(a => a.voter);
  return [h('div', { class: 'envelope reveal' }, h('h3', {}, 'La soluzione'), h('p', { class: 'winner' }, culprit.name + (who ? ' (' + who + ')' : '')), h('p', {}, GIALLO.solution),
    h('h3', {}, 'Le accuse'), h('div', { class: 'tally' }, rows.map(([id, k]) => h('div', {}, h('span', {}, nomeDi(id)), h('span', { class: 'count' }, `${k} ${k === 1 ? 'accusa' : 'accuse'}`),
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
  // a tavola: avviso a tutti i telefoni con l'app aperta
  const ultimo = state.tavola && Date.now() - state.tavola.at < 30 * 60000;
  out.push(h('div', { class: 'box' }, h('h3', {}, 'A tavola'),
    h('p', { class: 'sub' }, 'Fa comparire a tutti un avviso a schermo intero e fa vibrare il telefono. Arriva a chi ha l’app aperta.'),
    ultimo ? h('p', { class: 'small' }, 'Ultimo avviso alle ' + new Date(state.tavola.at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) + '.') : null,
    h('button', { class: 'btn', onclick: () => patch({ tavola: { at: Date.now() } }) }, 'A tavola!')));
  // partecipanti
  const inp = h('input', { type: 'text', id: 'nuovo', placeholder: 'Nome (es. Giulia)', maxlength: '30', autocomplete: 'off' });
  const add = async () => { const n = inp.value.trim(); if (!n || state.people.some(p => slug(p) === slug(n))) { inp.value = ''; return; }
    await patch({ people: [...state.people, n] }); document.getElementById('nuovo')?.focus(); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  const locked = state.teams.length > 0;
  out.push(h('div', { class: 'box' }, h('h3', {}, 'Partecipanti · ' + state.people.length),
    locked ? h('p', { class: 'small' }, 'Sorteggio fatto: per cambiare i nomi rifai il sorteggio.') : h('div', { class: 'row' }, inp, h('button', { class: 'btn', onclick: add }, 'Aggiungi')),
    state.people.length ? h('div', { class: 'row' }, state.people.map(p => h('span', { class: 'chip' }, p,
      h('span', { class: 'sx' }, ['M', 'F'].map(s => h('button', { 'aria-pressed': state.sesso[p] === s ? 'true' : 'false', 'aria-label': p + (s === 'M' ? ': maschio' : ': femmina'),
        onclick: () => patch({ sesso: { ...state.sesso, [p]: s } }) }, s))),
      locked ? null : h('button', { 'aria-label': 'Togli ' + p, onclick: () => patch({ people: state.people.filter(x => x !== p) }) }, '×'))))
      : h('p', { class: 'sub' }, 'Aggiungi i nomi: compariranno a tutti nella schermata “Chi sei?”.'),
    state.people.some(p => !state.sesso[p]) ? h('p', { class: 'small' }, 'Tocca M o F accanto a ogni nome: serve per il nome e il ritratto del personaggio nel giallo.') : null));
  // sorteggio
  if (!SOLO) out.push(h('div', { class: 'box' }, h('h3', {}, 'Sorteggio squadre e menu'),
    h('p', { class: 'sub' }, locked ? 'Squadre estratte: ognuno vede solo la sua squadra e il suo menu.' : `Con ${state.people.length} persone escono ${Math.min(MENUS.length, state.people.length)} squadre, ognuna con un menu.`),
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
  if (g.call && g.round === 0 && !g.allarme) gBtns.push(h('button', { class: 'btn ghost', onclick: () => patch({ giallo: { ...g, allarme: { at: Date.now() } } }) }, 'Dai tu l’allarme a tutti'));
  // durante l'aperitivo: il colpevole va a svuotare davvero la boccetta del medico
  const killer = g.assign.find(a => a.c === GIALLO.culprit);
  if (killer && g.round === 0 && !g.call) gBtns.push(h('button', { class: g.task ? 'btn ghost' : 'btn', onclick: () => patch({ giallo: { ...g, task: { to: killer.p, at: Date.now() } } }) },
    g.task ? 'Rimanda la missione a ' + killer.p : 'Manda ' + killer.p + ' a svuotare la boccetta'));
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
    g.assign.length ? h('p', { class: 'small' }, 'Narratore: ' + (g.narrator || '—') + '. La sera della cena segui il copione nella scheda Giallo e sblocca un giro a ogni portata.') : null,
    h('div', { class: 'row' }, gBtns)));
  // urne
  const voted = new Set(ballots.map(b => b.id));
  const missing = state.people.filter(p => !voted.has(slug(p)));
  if (!SOLO) out.push(h('div', { class: 'box' }, h('h3', {}, 'Oscar'),
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
    h('p', { class: 'small' }, 'Chi presenta la cerimonia'),
    h('div', { class: 'sx', style: 'align-self:flex-start;flex-wrap:wrap' }, [['staffetta', 'Staffetta'], ['fisso', 'Sempre lo stesso'], ['sorteggio', 'A sorte'], ['app', 'Tutti']].map(([v, l]) =>
      h('button', { 'aria-pressed': state.presenterMode === v ? 'true' : 'false', onclick: () => patch({ presenterMode: v }) }, l))),
    state.presenterMode !== 'app' ? h('label', { class: 'small' }, state.presenterMode === 'staffetta' ? 'Primo presentatore (poi presenta chi vince): ' : state.presenterMode === 'sorteggio' ? 'Primo presentatore (poi a sorte): ' : 'Presentatore: ',
      h('select', { onchange: ev => patch({ presenter: ev.target.value || null }) }, h('option', { value: '' }, '—'), state.people.map(p => h('option', { value: p, selected: state.presenter === p ? true : null }, p)))) : null,
    state.presenterMode !== 'app' ? h('button', { class: 'btn ghost', disabled: state.people.length < 2, onclick: () => { const l = state.people.filter(p => p !== state.giallo.narrator); patch({ presenter: l[Math.floor(Math.random() * l.length)] }); } }, 'Sorteggia il presentatore') : null,
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
    await patch({ teams: [], votingOpen: false, opened: false, revealed: [], nominated: [], revealedAt: {}, presenter: null, giallo: NO_GIALLO, tavola: null });
  } catch (e) { error = 'Non sono riuscito ad azzerare (' + e.code + ').'; render(); }
}

/* ---------- impaginazione ---------- */
function render() {
  const app = document.getElementById('app'); const nav = document.getElementById('tabs');
  const head = h('header', {}, h('p', { class: 'eyebrow' }, SOLO ? 'Cena con delitto' : 'Isola Sant’Antonio · 30.12 – 1.1'),
    SOLO ? h('h1', {}, 'Delitto ', h('em', {}, 'a Villa Ferraris')) : h('h1', {}, 'Capodanno ', h('em', {}, 'a Isola')),
    me && tab !== 'chi' ? h('p', { class: 'small' }, 'Sei ', h('strong', {}, me), ' · ',
      h('button', { class: 'btn ghost', style: 'padding:4px 10px;min-height:32px;font-size:13px', onclick: () => { me = null; save('me', null); go('chi'); } }, 'Non sono io')) : null);
  let body;
  if (!configured) body = [h('div', { class: 'warn' }, 'App non ancora collegata a Firebase: incolla la configurazione in config.js (vedi LEGGIMI).')];
  else if (!loaded) body = [h('p', { class: 'sub' }, 'Caricamento…')];
  else if (SOLO && !['chi', 'giallo', 'regia'].includes(tab)) { tab = me ? 'giallo' : 'chi'; body = me ? screenGiallo() : screenChi(); }
  else if (tab === 'chi' || (!me && tab !== 'regia')) body = screenChi();
  else body = { squadra: screenSquadra, giallo: screenGiallo, oscar: screenOscar, regia: screenRegia }[tab]();
  const foot = !admin && tab !== 'regia' && configured ? h('button', { class: 'btn ghost', style: 'align-self:center;font-size:13px;min-height:36px;padding:6px 14px;opacity:.7', onclick: () => go('regia') }, 'Area organizzatore') : null;
  app.replaceChildren(...[head, error ? h('p', { class: 'warn', role: 'alert' }, error) : null, ...body, foot].filter(Boolean));
  // barra in basso
  const tabs = SOLO ? [['giallo', 'Giallo']] : [['squadra', 'Cena dei mondi'], ['giallo', 'Giallo'], ['oscar', 'Oscar']];
  if (admin) tabs.push(['regia', 'Regia']);
  nav.style.setProperty('--n', tabs.length);
  nav.replaceChildren(...tabs.map(([id, label]) => h('button', { 'aria-current': tab === id ? 'page' : null, onclick: () => go(me || id === 'regia' ? id : 'chi') }, label)));
  nav.hidden = !configured;
  showCall();
  showMissione();
  showTavola();
  showAllarme();
}
// avviso privato al colpevole durante l'aperitivo: non gli dice ancora che è il colpevole
function passiMissione() {
  return h('ol', { style: 'text-align:left;margin:0;padding-left:22px;display:flex;flex-direction:column;gap:10px' },
        h('li', {}, 'Adesso: nell’ingresso, sulla poltrona, c’è la borsa del medico. Senza farti vedere, svuota la boccetta nella fialetta che hai in tasca e rimetti la boccetta, vuota, nella borsa. Poi torna in salotto.'),
        h('li', {}, '19:23: vai nel bagno della zona notte (oltre la porta scorrevole) e aspetta. Alle 19:25 suona il campanello: aspetta di sentir chiudere la porta di casa e poi quella del salotto.'),
        h('li', {}, '19:26: esci, versa la fialetta nel bicchierino sul vassoio in cima alle scale e torna subito nella zona notte.'),
        h('li', {}, '19:27: chiuditi nello sgabuzzino, nascondi la fialetta e aspetta al buio, senza farti sentire.'),
        h('li', {}, '19:34: scendi nello studio (il maestro sarà già «morto»), prendi la Stella, lascia la vetrina aperta e torna nello sgabuzzino.'),
        h('li', {}, 'All’allarme: lascia passare chi corre giù dal salotto, entra nel salotto vuoto e nascondi la Stella sotto il fagiano impagliato. Poi, appena senti rientrare dalla porta di casa quelli che erano fuori, unisciti a loro e scendi insieme. Se ti chiedono: eri in camera a incartare il regalo per il maestro.'));
}
function showMissione() {
  const g = state.giallo; const old = document.getElementById('missione');
  const due = g && g.task && g.task.to === me && !g.call && g.round === 0 && load('task') !== String(g.task.at) && !document.getElementById('chiamata');
  if (!due) { old?.remove(); return; }
  if (old) return;
  const el = h('div', { id: 'missione', role: 'alertdialog', style: 'position:fixed;inset:0;z-index:45;background:#171C36;display:flex;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top,0px)) max(20px, env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) max(20px, env(safe-area-inset-left,0px))' },
    h('div', { class: 'wrap reveal', style: 'text-align:center;gap:20px' },
      h('p', { class: 'eyebrow' }, 'Solo per te · non dirlo a nessuno'),
      h('h1', {}, 'Una ', h('em', {}, 'missione')),
      h('div', { style: 'font-size:18px;line-height:1.45' }, passiMissione()),
      h('button', { class: 'btn big', onclick: () => { save('task', String(g.task.at)); document.getElementById('missione')?.remove(); } }, 'Fatto, chiudi')));
  document.body.append(el);
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {}
}
function showTavola() {
  const t = state.tavola; const old = document.getElementById('tavola');
  const due = t && Date.now() - t.at < 15 * 60000 && load('tavola') !== String(t.at) && !document.getElementById('chiamata') && !document.getElementById('missione');
  if (!due) { old?.remove(); return; }
  if (old) return;
  const ok = () => { save('tavola', String(t.at)); document.getElementById('tavola')?.remove(); };
  const el = h('div', { id: 'tavola', role: 'alertdialog', style: 'position:fixed;inset:0;z-index:40;background:#171C36;display:flex;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top,0px)) max(20px, env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) max(20px, env(safe-area-inset-left,0px))' },
    h('div', { class: 'wrap reveal', style: 'text-align:center;gap:20px' },
      h('p', { class: 'eyebrow' }, 'Per tutti'),
      h('h1', {}, 'A ', h('em', {}, 'tavola!')),
      h('p', { style: 'font-size:19px;line-height:1.5' }, 'È pronto: tornate in salone e sedetevi.'),
      h('button', { class: 'btn big', onclick: ok }, 'Arrivo')));
  document.body.append(el);
  try { navigator.vibrate && navigator.vibrate([300, 120, 300]); } catch {}
}
function showAllarme() {
  const g = state.giallo; const old = document.getElementById('allarme');
  const killer = g && g.assign.find(a => a.c === GIALLO.culprit);
  const due = g && g.allarme && me && me !== g.narrator && !(g.call && g.call.to === me) && g.assign.some(a => a.p === me)
    && Date.now() - g.allarme.at < 10 * 60000 && load('allarme') !== String(g.allarme.at);
  if (!due) { old?.remove(); return; }
  if (old) return;
  const ugi = killer && killer.p === me;
  const ok = () => { save('allarme', String(g.allarme.at)); document.getElementById('allarme')?.remove(); };
  const el = h('div', { id: 'allarme', role: 'alertdialog', style: 'position:fixed;inset:0;z-index:48;background:#171C36;display:flex;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top,0px)) max(20px, env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) max(20px, env(safe-area-inset-left,0px))' },
    h('div', { class: 'wrap reveal', style: 'text-align:center;gap:20px' },
      h('p', { class: 'eyebrow' }, 'Villa Ferraris'),
      h('h1', {}, 'Il maestro ', h('em', {}, 'è morto!')),
      h('p', { style: 'font-size:19px;line-height:1.5' }, ugi ? 'Lascia passare chi corre giù dal salotto, entra nel salotto vuoto e nascondi la Stella sotto il fagiano. Poi scendi insieme a chi rientra da fuori.' : 'Correte tutti giù nello studio, adesso. Chi è fuori rientra dalla porta di casa.'),
      h('button', { class: 'btn big', onclick: ok }, ugi ? 'Ok' : 'Corro')));
  document.body.append(el);
  try { navigator.vibrate && navigator.vibrate([500, 150, 500, 150, 500]); } catch {}
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
