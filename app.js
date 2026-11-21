'use strict';

/* ===== Configuration ===== */
// ⚠️ Ces mots de passe sont lisibles par n'importe qui dans le code source du site.
const PASSWORDS = { majesty2026: 'Leader', royal2026: 'Co-Leader' };
const CLAN_POINTS = 67105, MAX_POINTS = 300000;
const SPOKEN = ['Français','English','Español','Deutsch','Italiano','Português','Русский','日本語','中文','한국어','العربية','Türkçe','Nederlands','Polski'];
const STATUS = { 'Très actif':['st-very','statusVeryActive'], 'Activité moyenne':['st-medium','statusMedium'], 'Actif':['st-active','statusActive'], 'Inactif':['st-inactive','statusInactive'], 'Absent':['st-absent','statusAbsent'] };
const LEGACY = { 'Very Active':'Très actif', 'Medium Activity':'Activité moyenne', 'Active':'Actif', 'Inactive':'Inactif' };
const RANKS = { 'Leader':'rankLeader', 'Co-Leader':'rankCoLeader', 'Aîné':'rankElder', 'Membre':'rankMember' };
const TITLES = { accueil:'welcome', membres:'membersTitle', galerie:'galleryTitle', regles:'rulesTitle', evenements:'eventsTitle', contact:'contactTitle' };

/* ===== Utilitaires ===== */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stKey = s => LEGACY[s] || s;
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

let lang = (() => { try { return localStorage.getItem('zMajestyLanguage'); } catch { return null; } })();
if (!TRANSLATIONS[lang]) lang = 'fr';
let role = null, current = 'accueil', editId = null;
let members = store.get('zMajestyMembers', null) || [
  { id:1, pseudo:'KingMajesty', gameRank:'Grand Maître', clanRank:'Leader', social:'@kingmajesty', status:'Très actif', canBeCoLeader:false, languages:'Français, English' },
  { id:2, pseudo:'RoyalKnight', gameRank:'Maître', clanRank:'Co-Leader', social:'Discord: Royal#1234', status:'Actif', canBeCoLeader:false, languages:'Français' },
  { id:3, pseudo:'Ancien', gameRank:'Expert', clanRank:'Aîné', social:'@ancien', status:'Activité moyenne', canBeCoLeader:true, languages:'Español, Français' }
];
let gallery = store.get('zMajestyGallery', []);
const LOCALE = { br:'pt-BR', jp:'ja' };
const RTL = ['ar'];
const loc = () => LOCALE[lang] || lang;
const t = k => TRANSLATIONS[lang]?.[k] ?? TRANSLATIONS.fr[k] ?? k;

function toast(msg) {
  const el = $('toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toast.id); toast.id = setTimeout(() => el.classList.remove('show'), 2800);
}
function openModal(id) { $(id).classList.add('open'); document.body.classList.add('no-scroll'); }
function closeModals() { document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open')); document.body.classList.remove('no-scroll'); }
function setMenu(open) { document.body.classList.toggle('menu-open', open); $('menuBtn').setAttribute('aria-expanded', open); }

/* ===== Langue ===== */
function fillSelect(id, map, labelKey) {
  const sel = $(id), keep = sel.value;
  sel.innerHTML = Object.keys(map).map(k => `<option value="${esc(k)}">${esc(t(labelKey(k)))}</option>`).join('');
  if (keep && map[keep]) sel.value = keep;
}
function applyLanguage() {
  document.documentElement.lang = loc();
  document.documentElement.dir = RTL.includes(lang) ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = t(e.dataset.i18n));
  document.querySelectorAll('[data-ph]').forEach(e => e.placeholder = t(e.dataset.ph));
  fillSelect('memberStatus', STATUS, k => STATUS[k][1]);
  fillSelect('memberClanRank', RANKS, k => RANKS[k]);
  document.querySelectorAll('.flag').forEach(f => f.classList.toggle('on', f.dataset.lang === lang));
  if ($('memberModal').classList.contains('open')) $('memberModalTitle').textContent = t(editId === null ? 'addMemberTitle' : 'editMemberTitle');
  renderAll();
}

/* ===== Affichage ===== */
function renderAll() { renderTitle(); renderAdmin(); renderMembers(); renderGallery(); renderProgress(); }
function renderTitle() { $('pageTitle').textContent = t(TITLES[current]); }
function renderProgress() {
  const pct = Math.min(100, CLAN_POINTS / MAX_POINTS * 100);
  $('progressBar').style.width = pct + '%';
  $('progressInfo').textContent = `${CLAN_POINTS.toLocaleString(loc())} / ${MAX_POINTS.toLocaleString(loc())}`;
  $('progressText').textContent = pct.toFixed(2) + '%';
}
function renderAdmin() {
  const label = role ? `👑 ${role}` : t('visitor');
  $('statusText').textContent = label; $('galleryStatusText').textContent = label;
  $('loginBtn').hidden = !!role; $('logoutBtn').hidden = !role;
  $('addMemberBtn').disabled = !role; $('addItemBtn').disabled = !role;
}
function sortedMembers() {
  const rk = Object.keys(RANKS), st = Object.keys(STATUS);
  return [...members].sort((a, b) => (rk.indexOf(a.clanRank) + 1 || 9) - (rk.indexOf(b.clanRank) + 1 || 9)
    || (st.indexOf(stKey(a.status)) + 1 || 9) - (st.indexOf(stKey(b.status)) + 1 || 9));
}
function renderMembers() {
  const q = $('search').value.trim().toLowerCase();
  const list = sortedMembers().filter(m => !q || [m.pseudo, m.gameRank, m.clanRank, t(RANKS[m.clanRank] || ''), stKey(m.status),
    t(STATUS[stKey(m.status)]?.[1] || ''), m.social, m.languages].join(' ').toLowerCase().includes(q));
  $('membersGrid').innerHTML = list.map(m => {
    const [cls, key] = STATUS[stKey(m.status)] || STATUS['Actif'];
    const acts = role ? `<button class="icon-btn" data-edit="${m.id}" title="${esc(t('edit'))}" aria-label="${esc(t('edit'))}">✏️</button>
      <button class="icon-btn" data-del="${m.id}" title="${esc(t('del'))}" aria-label="${esc(t('del'))}">🗑️</button>` : '';
    return `<article class="card">
      <div class="card-head"><div class="name">${esc(m.pseudo)}</div><div>${acts}</div></div>
      <div class="info"><strong>${t('gameRank')}:</strong> ${esc(m.gameRank)}</div>
      <div class="info"><strong>${t('clanRank')}:</strong> ${esc(t(RANKS[m.clanRank] || 'rankMember'))}${m.clanRank === 'Aîné' && m.canBeCoLeader ? ` (✅ ${esc(t('canCo'))})` : ''}</div>
      <div class="info"><strong>${t('languages')}:</strong> ${esc(m.languages || t('notSpecified'))}</div>
      <div class="info"><strong>${t('social')}:</strong> ${esc(m.social || t('notSpecified'))}</div>
      <div class="info"><strong>${t('status')}:</strong> <span class="badge ${cls}">${esc(t(key))}</span></div></article>`;
  }).join('');
  $('noResults').hidden = list.length > 0;
  $('memberCount').textContent = `${members.length} / 100 ${t('membersWord')}`;
}
function embedUrl(url) {
  try {
    const u = new URL(url); let id = null;
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v') || (u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : null);
    if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0`;
    return /^https?:$/.test(u.protocol) ? u.href : null;
  } catch { return null; }
}
function renderGallery() {
  $('galleryGrid').innerHTML = gallery.map(it => {
    const media = it.type === 'video'
      ? `<iframe src="${esc(embedUrl(it.url) || '')}" loading="lazy" allowfullscreen title="${esc(it.description || 'video')}"></iframe>`
      : `<img src="${esc(it.url)}" alt="${esc(it.description || t('typeImage'))}" loading="lazy">`;
    const del = role ? `<div class="gal-actions"><button class="icon-btn" data-delitem="${it.id}" aria-label="${esc(t('del'))}">🗑️</button></div>` : '';
    return `<article class="card">${media}<p>${esc(it.description || t('noDescription'))}</p>${del}</article>`;
  }).join('');
  $('galleryGrid').querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
    const d = document.createElement('div'); d.className = 'img-fail'; d.textContent = t('imageNA'); img.replaceWith(d);
  }, { once: true }));
  $('noGallery').hidden = gallery.length > 0;
}

/* ===== Navigation ===== */
function showSection(id) {
  current = id;
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === id));
  document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('on', b.dataset.nav === id));
  renderTitle(); setMenu(false); window.scrollTo({ top: 0 });
}
document.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => showSection(b.dataset.nav)));
$('menuBtn').addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
$('overlay').addEventListener('click', () => setMenu(false));
document.querySelectorAll('.flag').forEach(f => f.addEventListener('click', () => {
  lang = f.dataset.lang; try { localStorage.setItem('zMajestyLanguage', lang); } catch {} applyLanguage();
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModals(); setMenu(false); } });
document.querySelectorAll('.modal').forEach(m => m.addEventListener('mousedown', e => { if (e.target === m) closeModals(); }));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModals));

/* ===== Connexion ===== */
$('loginBtn').addEventListener('click', () => { $('loginForm').reset(); openModal('loginModal'); $('loginPassword').focus(); });
$('logoutBtn').addEventListener('click', () => { role = null; renderAll(); });
$('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const r = Object.hasOwn(PASSWORDS, $('loginPassword').value) ? PASSWORDS[$('loginPassword').value] : null;
  if (!r) return toast(t('loginErr'));
  role = r; closeModals(); renderAll(); toast(t(r === 'Leader' ? 'loginOkLeader' : 'loginOkCo'));
});

/* ===== Membres ===== */
const langBox = $('memberLanguages');
langBox.innerHTML = SPOKEN.map(l => `<label><input type="checkbox" value="${l}">${l}</label>`).join('');
const toggleCo = () => { $('coLeaderGroup').hidden = $('memberClanRank').value !== 'Aîné'; };
$('memberClanRank').addEventListener('change', toggleCo);
$('search').addEventListener('input', renderMembers);

function openMember(id = null) {
  if (!role) return;
  editId = id; $('memberForm').reset();
  const m = members.find(x => x.id === id);
  $('memberModalTitle').textContent = t(m ? 'editMemberTitle' : 'addMemberTitle');
  const chosen = (m?.languages || '').split(', ');
  langBox.querySelectorAll('input').forEach(c => c.checked = chosen.includes(c.value));
  if (m) {
    $('memberPseudo').value = m.pseudo; $('memberGameRank').value = m.gameRank; $('memberClanRank').value = m.clanRank;
    $('memberSocial').value = m.social === t('notSpecified') ? '' : (m.social || ''); $('memberStatus').value = stKey(m.status);
    $('canBeCoLeader').checked = !!m.canBeCoLeader;
  }
  toggleCo(); openModal('memberModal');
}
$('addMemberBtn').addEventListener('click', () => openMember());
$('memberForm').addEventListener('submit', e => {
  e.preventDefault();
  const clanRank = $('memberClanRank').value;
  const data = {
    pseudo: $('memberPseudo').value.trim(), gameRank: $('memberGameRank').value, clanRank,
    languages: [...langBox.querySelectorAll('input:checked')].map(c => c.value).join(', '),
    social: $('memberSocial').value.trim(), status: $('memberStatus').value,
    canBeCoLeader: clanRank === 'Aîné' && $('canBeCoLeader').checked
  };
  if (editId === null) { members.push({ id: Math.max(0, ...members.map(m => m.id)) + 1, ...data }); toast(t('memberAdded')); }
  else { members = members.map(m => m.id === editId ? { ...m, ...data } : m); toast(t('memberEdited')); }
  store.set('zMajestyMembers', members); closeModals(); renderMembers();
});
$('membersGrid').addEventListener('click', e => {
  const ed = e.target.closest('[data-edit]'), dl = e.target.closest('[data-del]');
  if (ed) openMember(+ed.dataset.edit);
  if (dl && role && confirm(t('confirmDelMember'))) {
    members = members.filter(m => m.id !== +dl.dataset.del); store.set('zMajestyMembers', members); renderMembers(); toast(t('memberDeleted'));
  }
});

/* ===== Galerie ===== */
$('addItemBtn').addEventListener('click', () => { if (role) { $('galleryForm').reset(); openModal('galleryModal'); } });
$('galleryForm').addEventListener('submit', e => {
  e.preventDefault();
  const url = $('itemUrl').value.trim();
  if (!embedUrl(url)) return toast(t('invalidUrl'));
  gallery.push({ id: Math.max(0, ...gallery.map(i => i.id)) + 1, type: $('itemType').value, url, description: $('itemDesc').value.trim() });
  store.set('zMajestyGallery', gallery); closeModals(); renderGallery(); toast(t('itemAdded'));
});
$('galleryGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-delitem]');
  if (b && role && confirm(t('confirmDelItem'))) {
    gallery = gallery.filter(i => i.id !== +b.dataset.delitem); store.set('zMajestyGallery', gallery); renderGallery(); toast(t('itemDeleted'));
  }
});

/* ===== Particules ===== */
(function particles() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = $('particles'), n = innerWidth < 700 ? 15 : 40;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div'); p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 15 + 's';
    p.style.animationDuration = 10 + Math.random() * 15 + 's';
    box.appendChild(p);
  }
})();

/* ===== Démarrage ===== */
showSection('accueil');
applyLanguage();

/* ===== Application installable (PWA) ===== */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
