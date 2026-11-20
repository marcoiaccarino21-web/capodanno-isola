// Rigenera i PDF dei cartellini: node tools/accessori-pdf.mjs  (serve Playwright con Chromium)
// Crea accessori/<id>-M.pdf, accessori/<id>-F.pdf, accessori/ottavio.pdf e accessori/accessori-villa-ferraris.pdf (A4, 4 per pagina).
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { ACCESSORI, cartellino, pdfDi, PDF_TUTTI } from '../accessori.js';
import { NOMI } from '../ritratti.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = new URL('../', import.meta.url).pathname;
mkdirSync(root + 'accessori', { recursive: true });

const FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..800;1,400..700&family=DM+Sans:wght@400..700&display=swap">';
const NOTA = 'Stampa al 100% (dimensione reale, senza “adatta alla pagina”), meglio su cartoncino. Ritaglia lungo il bordo, fai un foro nel cerchio tratteggiato e passaci uno spago o un nastro.';
const css = `@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:'DM Sans',Arial,sans-serif;color:#3A3220}
.pg{width:210mm;height:297mm;position:relative;page-break-after:always;overflow:hidden}
.nota{position:absolute;left:12mm;right:12mm;top:5mm;font-size:8.5pt;line-height:1.3;text-align:center;color:#6A5A3A}
.g{position:absolute;left:10mm;top:18.5mm;display:grid;grid-template-columns:95mm 95mm;grid-auto-rows:130mm}
.g>div,.uno>div{width:95mm;height:130mm;outline:.2mm dashed #B8A880;outline-offset:0}
.uno{position:absolute;left:57.5mm;top:40mm}.t{position:absolute;left:20mm;right:20mm;top:16mm;text-align:center}
.t b{font-family:Fraunces,Georgia,serif;font-size:20pt;display:block}.t span{font-size:10pt;color:#6A5A3A}
svg{display:block;width:95mm;height:130mm}`;

const carte = [];
for (const id of Object.keys(NOMI)) for (const s of ['M', 'F']) carte.push({ id, s, name: NOMI[id][s][0], role: NOMI[id][s][1] });
carte.push({ id: 'ottavio', s: '', name: 'Ottavio Ferraris', role: 'Maestro orafo' });

const browser = await chromium.launch();
const page = await browser.newPage();
async function pdf(html, file) {
  await page.setContent(`<!doctype html><html lang="it"><head><meta charset="utf-8">${FONT}<style>${css}</style></head><body>${html}</body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: root + file, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log(file);
}
for (const c of carte) {
  const uid = c.id + c.s;
  await pdf(`<div class="pg"><div class="t"><b>${c.name}</b><span>${ACCESSORI[c.id].cosa} · ${NOTA}</span></div><div class="uno"><div>${cartellino(c.id, c.name, c.role, uid)}</div></div></div>`, pdfDi(c.id, c.s));
}
let html = '';
for (let i = 0; i < carte.length; i += 4) {
  html += `<div class="pg"><div class="nota">${NOTA} Ogni personaggio ha la versione al maschile e al femminile: stampa quella di chi lo interpreta.</div><div class="g">` +
    carte.slice(i, i + 4).map(c => `<div>${cartellino(c.id, c.name, c.role, c.id + c.s)}</div>`).join('') + '</div></div>';
}
await pdf(html, PDF_TUTTI);
// anteprima per controllo
await page.setViewportSize({ width: 1400, height: 800 });
await page.setContent(`<!doctype html><html><head>${FONT}<style>body{margin:0;background:#171C36;display:grid;grid-template-columns:repeat(7,190px);gap:10px;padding:10px}svg{width:190px;height:260px}</style></head><body>${carte.map(c => cartellino(c.id, c.name, c.role, c.id + c.s)).join('')}</body></html>`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
if (process.env.ANTEPRIMA) await page.screenshot({ path: process.env.ANTEPRIMA, fullPage: true });
await browser.close();
