// Accessori di carta del giallo: al posto del travestimento ogni personaggio stampa e ritaglia
// il suo cartellino da tenere a tracolla. Stesso stile dei ritratti: fondo del ritratto, cornice d'oro.
// La scheda nell'app mostra il cartellino; i PDF in accessori/ si rigenerano con tools/accessori-pdf.mjs.

const lg = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const rg = (id, a, b, cx = .4, cy = .35) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r=".75"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
const GOLD = p => lg(p + 'au', '#F6D88A', '#B8862A', 1, 1);
const SH = p => `<filter id="${p}sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>`;
// ombra morbida sotto l'oggetto, come nei ritratti
const ombra = (p, cx = 200, cy = 340, rx = 130, ry = 18) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".35" filter="url(#${p}sh)"/>`;

// Ogni oggetto si disegna in un riquadro 400 x 400.
const OGGETTI = {
  // Orologio da taschino con catena (come nel ritratto)
  moretti: p => `<defs>${GOLD(p)}${SH(p)}${rg(p + 'qd', '#FFFDF6', '#E9DFC6')}</defs>${ombra(p, 200, 345, 120)}
    <path d="M200 92 C120 40 60 70 40 130" stroke="url(#${p}au)" stroke-width="7" fill="none" stroke-dasharray="11 5" stroke-linecap="round"/>
    <rect x="186" y="70" width="28" height="30" rx="6" fill="url(#${p}au)"/><circle cx="200" cy="64" r="15" fill="none" stroke="url(#${p}au)" stroke-width="7"/>
    <circle cx="200" cy="210" r="118" fill="url(#${p}au)"/><circle cx="200" cy="210" r="118" fill="none" stroke="#8A6118" stroke-width="3" opacity=".6"/>
    <circle cx="200" cy="210" r="98" fill="url(#${p}qd)"/><circle cx="200" cy="210" r="98" fill="none" stroke="#9C7A3A" stroke-width="2"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, r1 = i % 3 ? 84 : 76; return `<line x1="${(200 + Math.sin(a) * r1).toFixed(1)}" y1="${(210 - Math.cos(a) * r1).toFixed(1)}" x2="${(200 + Math.sin(a) * 92).toFixed(1)}" y2="${(210 - Math.cos(a) * 92).toFixed(1)}" stroke="#2A2418" stroke-width="${i % 3 ? 3 : 6}" stroke-linecap="round"/>`; }).join('')}
    <line x1="200" y1="210" x2="200" y2="148" stroke="#2A2418" stroke-width="7" stroke-linecap="round"/>
    <line x1="200" y1="210" x2="248" y2="232" stroke="#2A2418" stroke-width="5" stroke-linecap="round"/>
    <line x1="200" y1="210" x2="176" y2="280" stroke="#B5402F" stroke-width="2.5" stroke-linecap="round"/><circle cx="200" cy="210" r="8" fill="#2A2418"/>
    <path d="M128 150 A98 98 0 0 1 200 112" stroke="#fff" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/>`,

  // Cappello da cuoco e mestolo
  cantu: p => `<defs>${SH(p)}${lg(p + 'tq', '#FFFFFF', '#DCD8CE')}${lg(p + 'me', '#E3E6EA', '#8E959E', 1, 1)}</defs>${ombra(p, 200, 352, 140)}
    <path d="M118 262 L118 330 Q200 350 282 330 L282 262Z" fill="url(#${p}tq)"/><path d="M118 300 Q200 318 282 300" stroke="#C9C3B5" stroke-width="3" fill="none"/>
    <circle cx="140" cy="200" r="64" fill="url(#${p}tq)"/><circle cx="260" cy="200" r="64" fill="url(#${p}tq)"/><circle cx="200" cy="150" r="78" fill="url(#${p}tq)"/>
    <circle cx="200" cy="232" r="70" fill="url(#${p}tq)"/>
    <path d="M150 168 Q160 220 152 262 M200 150 Q206 210 200 266 M250 168 Q240 220 248 262" stroke="#CFC9BB" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M150 110 Q190 82 236 98" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M368 96 L300 292" stroke="url(#${p}me)" stroke-width="14" stroke-linecap="round"/><circle cx="368" cy="96" r="9" fill="none" stroke="#8E959E" stroke-width="5"/><path d="M262 292 a40 40 0 0 0 78 4 Z" fill="url(#${p}me)"/><path d="M262 292 L340 296" stroke="#6E747C" stroke-width="4"/>`,

  // Agenda di pelle con occhiali tondi appoggiati
  bellini: p => `<defs>${SH(p)}${lg(p + 'cu', '#8E3F2A', '#5A2216', 1, 1)}${GOLD(p)}</defs>${ombra(p, 200, 350, 140)}
    <rect x="96" y="56" width="214" height="284" rx="16" fill="#F2EADA"/><rect x="88" y="50" width="214" height="284" rx="16" fill="url(#${p}cu)"/>
    <rect x="100" y="50" width="14" height="284" fill="#000" opacity=".18"/><rect x="262" y="50" width="16" height="284" fill="#2C140C" opacity=".75"/>
    <rect x="140" y="100" width="110" height="64" rx="6" fill="none" stroke="url(#${p}au)" stroke-width="3"/>
    <text x="195" y="143" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="30" fill="url(#${p}au)">1990</text>
    <path d="M176 334 L176 376 L190 364 L204 376 L204 334" fill="#C9462F"/>
    <g transform="rotate(-12 200 260)"><circle cx="152" cy="262" r="38" fill="#CFE3EA" opacity=".35" stroke="#1E1A16" stroke-width="9"/><circle cx="248" cy="262" r="38" fill="#CFE3EA" opacity=".35" stroke="#1E1A16" stroke-width="9"/>
    <path d="M188 258 Q200 246 212 258" stroke="#1E1A16" stroke-width="8" fill="none"/><path d="M134 246 Q146 236 160 242" stroke="#fff" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/></g>`,

  // Mazzo di chiavi dell'auto con targhetta di cuoio
  pozzi: p => `<defs>${SH(p)}${GOLD(p)}${lg(p + 'ar', '#E9ECEF', '#8B939C', 1, 1)}${lg(p + 'pe', '#B07A45', '#6D4421', 1, 1)}</defs>${ombra(p, 210, 352, 130)}
    <circle cx="170" cy="120" r="52" fill="none" stroke="url(#${p}ar)" stroke-width="10"/>
    <g transform="rotate(28 170 172)"><rect x="150" y="160" width="40" height="44" rx="10" fill="#2B2B30"/><circle cx="170" cy="182" r="9" fill="#55555E"/>
    <path d="M160 204 L180 204 L180 330 L172 342 L164 330 L164 312 L156 306 L164 298 L164 286 L156 280 L164 272 Z" fill="url(#${p}ar)"/></g>
    <g transform="rotate(-18 150 172)"><circle cx="150" cy="190" r="26" fill="url(#${p}au)"/><circle cx="150" cy="190" r="8" fill="#5B4314"/>
    <path d="M142 214 L158 214 L158 320 L150 330 L144 322 L144 306 L136 300 L144 292 L144 280 L136 274 L144 268 Z" fill="url(#${p}au)"/></g>
    <path d="M214 140 L290 176 Q302 182 298 196 L276 262 Q272 274 258 270 L178 240 Z" fill="url(#${p}pe)"/><circle cx="214" cy="152" r="7" fill="#3A2412"/>
    <path d="M224 160 L282 186 L262 252 L196 228" stroke="#E7C79A" stroke-width="2.5" stroke-dasharray="7 5" fill="none"/>
    <text transform="translate(238 212) rotate(22)" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-weight="700" font-size="20" letter-spacing="1" fill="#F3DEB8">VILLA F.</text>`,

  // Cappello da cowboy
  cugino: p => `<defs>${SH(p)}${lg(p + 'fe', '#C08A55', '#7A4E26')}${lg(p + 'fa', '#A87443', '#5E3A1A')}</defs>${ombra(p, 200, 318, 170, 20)}
    <path d="M24 236 Q60 300 200 300 Q340 300 376 236 Q330 268 200 268 Q70 268 24 236Z" fill="url(#${p}fa)"/>
    <path d="M104 250 Q96 160 128 112 Q160 92 200 116 Q240 92 272 112 Q304 160 296 250 Q200 272 104 250Z" fill="url(#${p}fe)"/>
    <path d="M200 116 Q192 150 200 196" stroke="#6D4520" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M102 222 Q200 246 298 222 L298 252 Q200 274 102 252Z" fill="#2E1E14"/><circle cx="140" cy="242" r="7" fill="#D8C08A"/>
    <path d="M128 132 Q140 116 160 118" stroke="#E2B57E" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`,

  // Occhiali da sole e sciarpa bianca
  erede: p => `<defs>${SH(p)}${lg(p + 'le', '#3A3F4E', '#0A0B10', 1, 1)}${lg(p + 'sc', '#FFFFFF', '#D9D4C8')}</defs>${ombra(p, 200, 350, 150)}
    <path d="M70 236 Q200 330 330 236" stroke="url(#${p}sc)" stroke-width="30" fill="none" stroke-linecap="round"/>
    <path d="M196 290 Q170 320 150 372 L184 378 Q196 330 214 298Z" fill="url(#${p}sc)"/><path d="M204 290 Q234 322 252 368 L222 378 Q210 330 190 300Z" fill="#E6E1D5"/>
    <circle cx="200" cy="288" r="18" fill="#F4F1EA"/><path d="M156 368 l-4 14 M168 372 l-2 12 M232 372 l2 12 M244 368 l4 12" stroke="#D9D4C8" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 150 L58 140 M370 150 L342 140" stroke="#111" stroke-width="10" stroke-linecap="round"/>
    <path d="M52 140 Q60 128 112 126 L176 128 Q186 130 186 144 Q180 214 120 218 Q64 216 54 168Z" fill="url(#${p}le)" stroke="#111" stroke-width="8"/>
    <path d="M348 140 Q340 128 288 126 L224 128 Q214 130 214 144 Q220 214 280 218 Q336 216 346 168Z" fill="url(#${p}le)" stroke="#111" stroke-width="8"/>
    <path d="M186 146 Q200 134 214 146" stroke="#111" stroke-width="9" fill="none"/>
    <path d="M78 150 L120 150 M78 166 L98 166" stroke="#fff" stroke-width="7" opacity=".55" stroke-linecap="round"/><path d="M240 150 L282 150" stroke="#fff" stroke-width="7" opacity=".55" stroke-linecap="round"/>`,

  // Taccuino da cronista e penna, cartellino STAMPA
  sardi: p => `<defs>${SH(p)}${lg(p + 'pg', '#FFFDF5', '#E8E0CB')}${lg(p + 'pn', '#2F5EA8', '#173466', 1, 0)}${GOLD(p)}</defs>${ombra(p, 200, 352, 130)}
    <g transform="rotate(-6 200 210)"><rect x="104" y="64" width="190" height="276" rx="10" fill="url(#${p}pg)"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${124 + i * 22}" cy="64" r="9" fill="none" stroke="#6C6F78" stroke-width="5"/>`).join('')}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="122" y1="${112 + i * 28}" x2="276" y2="${112 + i * 28}" stroke="#9FB4CF" stroke-width="2"/>`).join('')}
    <path d="M128 106 q14 -14 26 0 t26 0 t30 -2 M128 134 q18 -12 34 0 t30 0 M128 162 q12 -10 24 0 t28 2 t36 -4 M128 190 q20 -12 36 0" stroke="#2A2A40" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <rect x="132" y="232" width="134" height="52" rx="6" fill="#B5402F"/><text x="199" y="268" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-weight="700" font-size="22" letter-spacing="3" fill="#fff">STAMPA</text></g>
    <g transform="rotate(38 270 250)"><rect x="256" y="96" width="24" height="230" rx="10" fill="url(#${p}pn)"/><path d="M256 326 L280 326 L268 366Z" fill="url(#${p}au)"/>
    <rect x="276" y="110" width="7" height="70" rx="3" fill="url(#${p}au)"/><rect x="256" y="184" width="24" height="10" fill="url(#${p}au)"/></g>`,

  // Stetoscopio
  rinaldi: p => `<defs>${SH(p)}${lg(p + 'tb', '#4A4F5A', '#16181E', 1, 1)}${lg(p + 'ac', '#F4F6F8', '#8D96A0', 1, 1)}</defs>${ombra(p, 200, 352, 140)}
    <path d="M140 60 Q118 130 150 176 Q182 214 200 214 Q218 214 250 176 Q282 130 260 60" stroke="url(#${p}tb)" stroke-width="13" fill="none" stroke-linecap="round"/>
    <path d="M200 214 Q200 270 150 290 Q96 312 130 330" stroke="url(#${p}tb)" stroke-width="15" fill="none" stroke-linecap="round"/>
    <rect x="128" y="44" width="24" height="24" rx="10" fill="url(#${p}ac)"/><rect x="248" y="44" width="24" height="24" rx="10" fill="url(#${p}ac)"/>
    <circle cx="190" cy="318" r="48" fill="url(#${p}ac)"/><circle cx="190" cy="318" r="34" fill="#C3CAD2" stroke="#7D8590" stroke-width="3"/>
    <path d="M168 300 Q180 290 196 292" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M138 322 L130 330" stroke="url(#${p}tb)" stroke-width="15" stroke-linecap="round"/>`,

  // Anello con un grosso diamante, su un cuscinetto di velluto
  dellavalle: p => `<defs>${SH(p)}${GOLD(p)}${lg(p + 've', '#8E2A44', '#4A0F22')}${lg(p + 'di', '#FFFFFF', '#A9D3E6', 1, 1)}</defs>${ombra(p, 200, 352, 150)}
    <path d="M60 300 Q60 260 110 256 L290 256 Q340 260 340 300 Q340 340 290 342 L110 342 Q60 340 60 300Z" fill="url(#${p}ve)"/>
    <path d="M90 276 Q200 262 310 276" stroke="#B4506A" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
    <ellipse cx="200" cy="232" rx="92" ry="68" fill="none" stroke="url(#${p}au)" stroke-width="22"/>
    <ellipse cx="200" cy="232" rx="92" ry="68" fill="none" stroke="#8A6118" stroke-width="2" opacity=".5"/>
    <path d="M168 168 L232 168 L218 150 L182 150Z" fill="url(#${p}au)"/>
    <path d="M150 112 L250 112 L200 172Z" fill="url(#${p}di)"/><path d="M168 82 L232 82 L250 112 L150 112Z" fill="#E6F4FA"/>
    <path d="M168 82 L184 112 L200 82 L216 112 L232 82 M150 112 L200 172 L250 112 M184 112 L200 172 L216 112" stroke="#7FB3CC" stroke-width="2.5" fill="none"/>
    <path d="M118 70 l8 -18 l8 18 l18 8 l-18 8 l-8 18 l-8 -18 l-18 -8z M286 120 l5 -11 l5 11 l11 5 l-11 5 l-5 11 l-5 -11 l-11 -5z" fill="#fff"/>`,

  // Microfono d'epoca con asta e note
  bonetti: p => `<defs>${SH(p)}${lg(p + 'cr', '#F7F8FA', '#7E8792', 1, 0)}${GOLD(p)}</defs>${ombra(p, 200, 356, 110)}
    <rect x="192" y="232" width="16" height="100" fill="url(#${p}cr)"/><ellipse cx="200" cy="344" rx="78" ry="16" fill="url(#${p}cr)"/>
    <path d="M150 220 Q200 252 250 220" stroke="url(#${p}cr)" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M138 140 Q138 64 200 60 Q262 64 262 140 Q262 214 200 220 Q138 214 138 140Z" fill="url(#${p}cr)"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${158 + i * 14}" y1="${i === 0 || i === 6 ? 96 : 76}" x2="${158 + i * 14}" y2="${i === 0 || i === 6 ? 186 : 206}" stroke="#4E555E" stroke-width="5"/>`).join('')}
    <path d="M140 140 L260 140" stroke="#4E555E" stroke-width="6"/><circle cx="200" cy="140" r="12" fill="url(#${p}au)"/>
    <path d="M300 60 L300 120 M300 60 L336 50 L336 108" stroke="url(#${p}au)" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="290" cy="122" rx="14" ry="11" fill="url(#${p}au)"/><ellipse cx="326" cy="110" rx="14" ry="11" fill="url(#${p}au)"/>
    <path d="M86 100 L86 160" stroke="url(#${p}au)" stroke-width="8" stroke-linecap="round"/><path d="M86 100 Q110 112 104 136" stroke="url(#${p}au)" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="76" cy="162" rx="14" ry="11" fill="url(#${p}au)"/>`,

  // Pergamena arrotolata con sigillo di ceralacca e penna stilografica
  ferrero: p => `<defs>${SH(p)}${lg(p + 'pa', '#F6E9C8', '#D9C292')}${rg(p + 'ce', '#E0503A', '#8A1C12')}${GOLD(p)}</defs>${ombra(p, 200, 350, 150)}
    <rect x="86" y="70" width="228" height="256" fill="url(#${p}pa)"/>
    <rect x="70" y="52" width="260" height="34" rx="17" fill="#E3CFA2"/><rect x="70" y="310" width="260" height="34" rx="17" fill="#E3CFA2"/>
    <ellipse cx="70" cy="69" rx="10" ry="17" fill="#B79C66"/><ellipse cx="330" cy="327" rx="10" ry="17" fill="#B79C66"/>
    ${[0, 1, 2, 3, 4].map(i => `<line x1="116" y1="${116 + i * 26}" x2="${i === 4 ? 230 : 284}" y2="${116 + i * 26}" stroke="#8C7A55" stroke-width="4" stroke-linecap="round"/>`).join('')}
    <path d="M200 262 L176 330 L194 318 L204 340Z M222 262 L246 330 L228 318 L218 340Z" fill="#B5402F"/>
    <path d="M211 220 q22 -2 30 18 q10 22 -4 38 q-14 16 -34 10 q-24 4 -30 -18 q-8 -22 6 -36 q14 -14 32 -12z" fill="url(#${p}ce)"/>
    <circle cx="211" cy="254" r="20" fill="none" stroke="#6E140C" stroke-width="3"/><text x="211" y="263" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="24" fill="#6E140C">F</text>
    <g transform="rotate(-40 290 180)"><rect x="280" y="100" width="22" height="150" rx="8" fill="#1C1C22"/><path d="M280 250 L302 250 L291 292Z" fill="url(#${p}au)"/><rect x="280" y="150" width="22" height="8" fill="url(#${p}au)"/></g>`,

  // Macchina fotografica con flash
  gatti: p => `<defs>${SH(p)}${lg(p + 'co', '#3B3D44', '#15161A')}${lg(p + 'cr', '#F1F3F5', '#8E969F')}${rg(p + 'ob', '#5C7A9E', '#0B0F18', .35, .3)}</defs>${ombra(p, 200, 330, 160)}
    <path d="M70 112 Q40 60 46 20 M330 112 Q360 60 354 20" stroke="#1B1B20" stroke-width="7" fill="none"/>
    <rect x="236" y="54" width="76" height="52" rx="6" fill="url(#${p}cr)"/><rect x="246" y="62" width="56" height="36" rx="4" fill="#FFF9DC" stroke="#9AA2AB" stroke-width="2"/>
    <rect x="248" y="104" width="52" height="16" fill="#1B1B20"/>
    <rect x="44" y="110" width="312" height="196" rx="22" fill="url(#${p}cr)"/><rect x="44" y="150" width="312" height="132" fill="url(#${p}co)"/>
    <rect x="80" y="92" width="60" height="22" rx="5" fill="#2B2C31"/><rect x="290" y="120" width="40" height="22" rx="5" fill="#1B1B20" opacity=".7"/>
    <circle cx="200" cy="210" r="88" fill="url(#${p}cr)"/><circle cx="200" cy="210" r="72" fill="#1B1B20"/><circle cx="200" cy="210" r="54" fill="url(#${p}ob)"/>
    <circle cx="200" cy="210" r="30" fill="#0B0F18" opacity=".6"/><path d="M168 186 Q180 172 198 170" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75"/><circle cx="222" cy="232" r="6" fill="#fff" opacity=".4"/>
    <circle cx="96" cy="132" r="9" fill="#B5402F"/>`,

  // Coccarda tricolore con nastri
  bassi: p => `<defs>${SH(p)}${GOLD(p)}</defs>${ombra(p, 200, 356, 120)}
    <path d="M168 212 L120 350 L146 334 L160 362 L194 226Z" fill="#B5302A"/><path d="M232 212 L280 350 L254 334 L240 362 L206 226Z" fill="#1F8A4C"/>
    <path d="M182 220 L170 340 L200 320 L230 340 L218 220Z" fill="#F7F4EC"/>
    ${Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12, x = 200 + Math.cos(a) * 118, y = 170 + Math.sin(a) * 118; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="22" fill="#1F8A4C"/>`; }).join('')}
    <circle cx="200" cy="170" r="118" fill="#1F8A4C"/><circle cx="200" cy="170" r="92" fill="#F7F4EC"/>
    ${Array.from({ length: 20 }, (_, i) => { const a = i * Math.PI / 10; return `<line x1="${(200 + Math.cos(a) * 70).toFixed(1)}" y1="${(170 + Math.sin(a) * 70).toFixed(1)}" x2="${(200 + Math.cos(a) * 90).toFixed(1)}" y2="${(170 + Math.sin(a) * 90).toFixed(1)}" stroke="#DDD7C8" stroke-width="3"/>`; }).join('')}
    <circle cx="200" cy="170" r="64" fill="#C0352E"/><circle cx="200" cy="170" r="30" fill="url(#${p}au)"/>
    <path d="M200 150 l6 13 l14 2 l-10 10 l2 14 l-12 -7 l-12 7 l2 -14 l-10 -10 l14 -2z" fill="#8A6118"/>`,

  // Ottavio: monocolo d'oro con catenella
  ottavio: p => `<defs>${SH(p)}${GOLD(p)}${rg(p + 've', '#E6F2F6', '#9FC0CC', .35, .3)}</defs>${ombra(p, 200, 352, 120)}
    <path d="M262 236 C330 300 300 360 220 340 C150 322 120 360 90 380" stroke="url(#${p}au)" stroke-width="7" fill="none" stroke-dasharray="12 6" stroke-linecap="round"/>
    <circle cx="190" cy="170" r="112" fill="url(#${p}au)"/><circle cx="190" cy="170" r="92" fill="url(#${p}ve)"/>
    <circle cx="190" cy="170" r="92" fill="none" stroke="#8A6118" stroke-width="3"/>
    <path d="M128 120 Q152 88 194 84" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity=".85"/><path d="M118 152 Q120 140 124 132" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".6"/>
    <circle cx="268" cy="248" r="16" fill="none" stroke="url(#${p}au)" stroke-width="7"/>`
};

// Oggetto, dicitura del pass e colori di fondo (gli stessi dei ritratti)
export const ACCESSORI = {
  moretti:    { cosa: 'Orologio da taschino', pass: 'Laboratorio Ferraris', bg: ['#86937B', '#3D4834'] },
  cantu:      { cosa: 'Cappello da cuoco e mestolo', pass: 'Personale della villa', bg: ['#B77D61', '#68351D'] },
  bellini:    { cosa: 'Agenda e occhiali', pass: 'Personale della villa', bg: ['#838F9E', '#3A4451'] },
  pozzi:      { cosa: 'Chiavi dell’auto', pass: 'Personale della villa', bg: ['#9B8F72', '#4F442C'] },
  cugino:     { cosa: 'Cappello da cowboy', pass: 'Famiglia Ferraris', bg: ['#638592', '#1E3C47'] },
  erede:      { cosa: 'Occhiali da sole e sciarpa bianca', pass: 'Famiglia Ferraris', bg: ['#925F6B', '#471B25'] },
  sardi:      { cosa: 'Taccuino e penna', pass: 'Stampa', bg: ['#737F8F', '#2C3744'] },
  rinaldi:    { cosa: 'Stetoscopio', pass: 'Ospite', bg: ['#6E908F', '#284544'] },
  dellavalle: { cosa: 'Anello con diamante', pass: 'Ospite', bg: ['#775F7A', '#301B32'] },
  bonetti:    { cosa: 'Microfono', pass: 'Orchestrina', bg: ['#9B6B8F', '#4F2544'] },
  ferrero:    { cosa: 'Pergamena con sigillo', pass: 'Ospite', bg: ['#83776B', '#3A3025'] },
  gatti:      { cosa: 'Macchina fotografica', pass: 'Stampa · Foto', bg: ['#8F8362', '#443A1D'] },
  bassi:      { cosa: 'Coccarda tricolore', pass: 'Autorità', bg: ['#836B5A', '#3A2517'] },
  ottavio:    { cosa: 'Monocolo d’oro', pass: 'Padrone di casa', bg: ['#6B5F56', '#251B13'] }
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Cartellino 95 x 130 mm (unità: decimi di millimetro). name/role già al maschile o al femminile.
export function cartellino(id, name, role, uid = id) {
  const a = ACCESSORI[id], p = 'k' + String(uid).replace(/[^a-z0-9]/gi, '');
  const W = 950, H = 1300, cx = 475, cy = 590, rx = 300, ry = 345;
  const pw = Math.max(240, a.pass.length * 22 + 90);
  const fs = Math.min(66, Math.floor(820 / (name.length * 0.5)));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="95mm" height="130mm">
<defs>${rg(p + 'bg', a.bg[0], a.bg[1], .5, .3)}<radialGradient id="${p}vg" cx=".5" cy=".42" r=".62"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient>
<clipPath id="${p}ov"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath></defs>
<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="44" fill="#FBF6EA" stroke="#C9962E" stroke-width="8"/>
<rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="30" fill="none" stroke="#C9962E" stroke-width="2"/>
<circle cx="${cx}" cy="78" r="26" fill="#fff" stroke="#9A8A6A" stroke-width="3" stroke-dasharray="8 6"/>
<text x="${cx}" y="160" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="9" fill="#8A6A1E">VILLA FERRARIS</text>
<text x="${cx}" y="204" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="30" fill="#5A4A2A">Veglione del 31 dicembre 1989</text>
<g clip-path="url(#${p}ov)"><rect x="${cx - rx}" y="${cy - ry}" width="${rx * 2}" height="${ry * 2}" fill="url(#${p}bg)"/>
<g transform="translate(${cx - 270} ${cy - 236}) scale(1.35)">${OGGETTI[id](p)}</g>
<rect x="${cx - rx}" y="${cy - ry}" width="${rx * 2}" height="${ry * 2}" fill="url(#${p}vg)"/></g>
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#E2B04A" stroke-width="16"/>
<ellipse cx="${cx}" cy="${cy}" rx="${rx - 18}" ry="${ry - 18}" fill="none" stroke="#E2B04A" stroke-width="2.5" opacity=".7"/>
<rect x="${cx - pw / 2}" y="${cy + ry - 30}" width="${pw}" height="60" rx="30" fill="#171C36" stroke="#E2B04A" stroke-width="4"/>
<text x="${cx}" y="${cy + ry + 11}" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-weight="700" font-size="27" letter-spacing="6" fill="#F0CF7A">${esc(a.pass.toUpperCase())}</text>
<text x="${cx}" y="1078" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="${fs}" fill="#171C36">${esc(name)}</text>
<text x="${cx}" y="1138" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-weight="700" font-size="28" letter-spacing="5" fill="#8A6A1E">${esc(role.toUpperCase())}</text>
<text x="${cx}" y="1226" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="24" fill="#9A8A6A">Delitto a Villa Ferraris</text>
</svg>`;
}

// File da stampare (stessa cartella dell'app)
export const pdfDi = (id, sesso) => `accessori/${id === 'ottavio' ? 'ottavio' : id + '-' + (sesso || 'M')}.pdf`;
export const PDF_TUTTI = 'accessori/accessori-villa-ferraris.pdf';
