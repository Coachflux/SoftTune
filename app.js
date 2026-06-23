/* Melody — vanilla HTML/CSS/JS local music player
 * - File System Access API (with file-input fallback) for picking a music folder
 * - IndexedDB caches folder handle + extracted covers
 * - jsmediatags reads ID3 / metadata + embedded cover art
 * - Single global <audio> element keeps playback alive across views
 * - MediaSession metadata for lock-screen artwork + hardware buttons
 * - Favorites, Playlists (with reorder + remove), Recently Played in localStorage
 */

(() => {
'use strict';

// -------------------- Tiny helpers --------------------
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const fmt = (s) => {
  if (!isFinite(s)) return '0:00';
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s/60), x = s%60;
  return m + ':' + String(x).padStart(2,'0');
};
const toast = (msg) => {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.add('hidden'), 2200);
};
const AUDIO_EXT = /\.(mp3|m4a|aac|flac|ogg|oga|opus|wav|wma|webm)$/i;

// -------------------- State (persisted in localStorage) --------------------
const LS = {
  tracks: 'melody.tracks',         // index of tracks (no blobs)
  favs: 'melody.favorites',        // array of track ids
  recent: 'melody.recent',         // array of track ids (most recent first)
  playlists: 'melody.playlists',   // [{id,name,trackIds:[]}]
  lastPlay: 'melody.lastPlay',     // {id, position}
  volume: 'melody.volume',
};
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

let state = {
  tracks: load(LS.tracks, []),         // {id,name,title,artist,album,folder,duration,cover?}
  favs: load(LS.favs, []),
  recent: load(LS.recent, []),
  playlists: load(LS.playlists, []),
  currentTab: 'songs',
  query: '',
  view: null,                          // currently rendered view {type, value}
  queue: [],
  current: null,                       // track object
  isPlaying: false,
  shuffle: false,
  repeat: false,
};

// Runtime-only file handles & object URLs (NOT persisted)
const fileMap = new Map();    // id -> File or FileSystemFileHandle
const blobUrls = new Map();   // id -> objectURL for current playback
const coverUrls = new Map();  // id -> objectURL for cover art

// -------------------- IndexedDB (folder handle + cover blobs) --------------------
const DB = (() => {
  let _db;
  const open = () => new Promise((res, rej) => {
    if (_db) return res(_db);
    const r = indexedDB.open('melody', 2);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('covers')) db.createObjectStore('covers');
    };
    r.onsuccess = () => { _db = r.result; res(_db); };
    r.onerror = () => rej(r.error);
  });
  const tx = async (store, mode='readonly') => (await open()).transaction(store, mode).objectStore(store);
  return {
    async get(store, key) { const s = await tx(store); return new Promise((res,rej)=>{const r=s.get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}); },
    async set(store, key, val) { const s = await tx(store,'readwrite'); return new Promise((res,rej)=>{const r=s.put(val,key);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);}); },
    async del(store, key) { const s = await tx(store,'readwrite'); return new Promise((res,rej)=>{const r=s.delete(key);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);}); },
  };
})();

// -------------------- Folder scanning --------------------
async function pickFolder() {
  if ('showDirectoryPicker' in window) {
    try {
      const handle = await window.showDirectoryPicker();
      await DB.set('kv','folder',handle);
      toast('Scanning library…');
      await scanFromHandle(handle);
    } catch (e) { if (e && e.name !== 'AbortError') console.error(e); }
  } else {
    // Fallback: webkitdirectory folder picker
    const input = $('#filePicker');
    input.value = '';
    input.onchange = async () => {
      if (!input.files || !input.files.length) return;
      toast('Scanning…');
      await scanFromFiles(Array.from(input.files));
    };
    input.click();
  }
}

async function tryRestoreFolder() {
  const handle = await DB.get('kv','folder');
  if (!handle) return;
  try {
    const perm = await handle.queryPermission({ mode:'read' });
    if (perm === 'granted') await scanFromHandle(handle);
    // If 'prompt', we wait for the user to tap Folder so the request happens in a user gesture
  } catch (e) { console.warn('restore folder failed', e); }
}

async function scanFromHandle(rootHandle) {
  const tracks = [];
  fileMap.clear();
  async function walk(dirHandle, path='') {
    for await (const [name, h] of dirHandle.entries()) {
      if (h.kind === 'directory') await walk(h, path ? path + '/' + name : name);
      else if (h.kind === 'file' && AUDIO_EXT.test(name)) {
        const id = 'f_' + (path + '/' + name).replace(/\W+/g,'_');
        const folder = path || rootHandle.name || 'Music';
        tracks.push({ id, name, title: name.replace(AUDIO_EXT,''), artist:'Unknown Artist', album:'Unknown Album', folder });
        fileMap.set(id, h);
      }
    }
  }
  await walk(rootHandle);
  await mergeAndIndex(tracks);
}

async function scanFromFiles(files) {
  const tracks = [];
  fileMap.clear();
  for (const f of files) {
    if (!AUDIO_EXT.test(f.name)) continue;
    const rel = f.webkitRelativePath || f.name;
    const id = 'l_' + rel.replace(/\W+/g,'_');
    const folder = rel.includes('/') ? rel.split('/').slice(0,-1).join('/') : 'Music';
    tracks.push({ id, name: f.name, title: f.name.replace(AUDIO_EXT,''), artist:'Unknown Artist', album:'Unknown Album', folder });
    fileMap.set(id, f);
  }
  await mergeAndIndex(tracks);
}

async function mergeAndIndex(found) {
  // Replace library with newly-scanned set; sync favorites/recent/playlists
  state.tracks = found.sort((a,b)=>a.title.localeCompare(b.title));
  save(LS.tracks, state.tracks);
  const ids = new Set(found.map(t=>t.id));
  state.favs = state.favs.filter(id=>ids.has(id)); save(LS.favs, state.favs);
  state.recent = state.recent.filter(id=>ids.has(id)); save(LS.recent, state.recent);
  state.playlists = state.playlists.map(p=>({ ...p, trackIds: p.trackIds.filter(id=>ids.has(id)) }));
  save(LS.playlists, state.playlists);
  render();
  toast(`Loaded ${found.length} track${found.length===1?'':'s'}`);
  // Read metadata in the background for first ~200 tracks
  enrichMetadata(found.slice(0, 200));
}

async function getFile(id) {
  const h = fileMap.get(id);
  if (!h) return null;
  if (h instanceof File) return h;
  if (h && typeof h.getFile === 'function') {
    try {
      const perm = await h.queryPermission?.({ mode:'read' });
      if (perm === 'prompt') await h.requestPermission?.({ mode:'read' });
    } catch {}
    return await h.getFile();
  }
  return null;
}

// -------------------- Metadata + cover art --------------------
function readTags(file) {
  return new Promise((resolve) => {
    if (!window.jsmediatags) return resolve(null);
    window.jsmediatags.read(file, {
      onSuccess: r => resolve(r.tags || null),
      onError: () => resolve(null),
    });
  });
}

async function enrichMetadata(list) {
  for (const t of list) {
    try {
      const file = await getFile(t.id);
      if (!file) continue;
      const tags = await readTags(file);
      if (tags) {
        if (tags.title) t.title = tags.title;
        if (tags.artist) t.artist = tags.artist;
        if (tags.album) t.album = tags.album;
        if (tags.picture) {
          const { data, format } = tags.picture;
          const bytes = new Uint8Array(data);
          const blob = new Blob([bytes], { type: format || 'image/jpeg' });
          await DB.set('covers', t.id, blob);
          coverUrls.set(t.id, URL.createObjectURL(blob));
          t.hasCover = true;
        }
      }
    } catch {}
  }
  save(LS.tracks, state.tracks);
  render();
}

async function getCoverUrl(id) {
  if (coverUrls.has(id)) return coverUrls.get(id);
  try {
    const blob = await DB.get('covers', id);
    if (blob) { const u = URL.createObjectURL(blob); coverUrls.set(id, u); return u; }
  } catch {}
  return null;
}

// -------------------- Library queries --------------------
const byTitle = (a,b) => a.title.localeCompare(b.title, undefined, {sensitivity:'base'});
function searchFilter(list) {
  const q = state.query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.artist.toLowerCase().includes(q) ||
    t.album.toLowerCase().includes(q) ||
    t.folder.toLowerCase().includes(q));
}
function groupBy(list, key) {
  const m = new Map();
  for (const t of list) {
    const k = t[key] || 'Unknown';
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(t);
  }
  return Array.from(m.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
}

// -------------------- Rendering --------------------
function render() {
  const view = $('#view');
  view.innerHTML = '';
  $$('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab === state.currentTab));
  $$('.navbtn').forEach(t=>t.classList.toggle('active', t.dataset.tab === state.currentTab));

  if (state.tracks.length === 0) {
    view.innerHTML = `
      <div class="empty">
        <h2>No music yet</h2>
        <p>Tap <b>Folder</b> to pick the music folder on your device. Songs you have downloaded or received will show up here automatically.</p>
        <button class="btn" id="emptyPick">📁 Pick music folder</button>
      </div>`;
    $('#emptyPick').onclick = pickFolder;
    return;
  }

  if (state.view && state.view.type === 'collection') {
    renderCollection(view, state.view);
    return;
  }

  switch (state.currentTab) {
    case 'songs':     return renderSongs(view, searchFilter(state.tracks).sort(byTitle));
    case 'artists':   return renderGroups(view, 'artist');
    case 'albums':    return renderGroups(view, 'album');
    case 'folders':   return renderGroups(view, 'folder');
    case 'favorites': return renderSongs(view, searchFilter(state.tracks.filter(t=>state.favs.includes(t.id))).sort(byTitle));
    case 'recent':    return renderSongs(view, state.recent.map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean));
    case 'playlists': return renderPlaylists(view);
  }
}

function renderSongs(root, list, opts={}) {
  if (!list.length) { root.innerHTML = `<div class="empty"><p>Nothing here yet.</p></div>`; return; }
  const ul = document.createElement('div'); ul.className = 'list';
  list.forEach((t, idx) => ul.appendChild(trackRow(t, list, opts, idx)));
  root.appendChild(ul);
}

function trackRow(t, queue, opts={}, idx=0) {
  const row = document.createElement('div');
  row.className = 'row' + (state.current?.id === t.id ? ' playing' : '');
  row.innerHTML = `
    <div class="cover"><span>♪</span></div>
    <div class="meta">
      <div class="title"></div>
      <div class="sub"></div>
    </div>
    <div class="actions">
      <button class="iconbtn" title="Favorite">${state.favs.includes(t.id)?'❤':'♡'}</button>
      <button class="iconbtn" title="Add to playlist">＋</button>
    </div>`;
  row.querySelector('.title').textContent = t.title;
  row.querySelector('.sub').textContent = `${t.artist} • ${t.album}`;
  const coverEl = row.querySelector('.cover');
  getCoverUrl(t.id).then(u => { if (u) coverEl.innerHTML = `<img class="cover" src="${u}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px"/>`; });

  row.addEventListener('click', e => {
    if (e.target.closest('.actions')) return;
    playTrack(t, queue);
  });
  const [favBtn, addBtn] = row.querySelectorAll('.actions .iconbtn');
  favBtn.onclick = (e) => { e.stopPropagation(); toggleFav(t.id); render(); };
  addBtn.onclick = (e) => { e.stopPropagation(); openPlaylistDialog(t.id); };
  if (opts.playlistId) {
    // Add reorder + remove for playlist views
    const up = document.createElement('button'); up.className='iconbtn'; up.textContent='↑';
    const dn = document.createElement('button'); dn.className='iconbtn'; dn.textContent='↓';
    const rm = document.createElement('button'); rm.className='iconbtn'; rm.textContent='✕';
    up.onclick = (e)=>{e.stopPropagation();movePlaylist(opts.playlistId,idx,-1);};
    dn.onclick = (e)=>{e.stopPropagation();movePlaylist(opts.playlistId,idx,1);};
    rm.onclick = (e)=>{e.stopPropagation();removeFromPlaylist(opts.playlistId,t.id);};
    row.querySelector('.actions').append(up,dn,rm);
  }
  return row;
}

function renderGroups(root, key) {
  const groups = groupBy(searchFilter(state.tracks), key);
  if (!groups.length) { root.innerHTML = `<div class="empty"><p>Nothing here yet.</p></div>`; return; }
  const grid = document.createElement('div'); grid.className='grid';
  for (const [name, list] of groups) {
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<div class="cover">♪</div><div class="title"></div><div class="sub"></div>`;
    card.querySelector('.title').textContent = name;
    card.querySelector('.sub').textContent = `${list.length} track${list.length===1?'':'s'}`;
    getCoverUrl(list[0].id).then(u=>{ if (u) card.querySelector('.cover').outerHTML = `<img class="cover" src="${u}" alt=""/>`; });
    card.onclick = () => { state.view = { type:'collection', key, value:name, list }; render(); };
    grid.appendChild(card);
  }
  root.appendChild(grid);
}

function renderPlaylists(root) {
  const wrap = document.createElement('div');
  const head = document.createElement('div'); head.style.cssText='display:flex;gap:8px;padding:6px 4px 12px';
  head.innerHTML = `<input id="newPl" placeholder="New playlist name" style="flex:1;padding:10px;border-radius:10px;background:var(--surface);border:1px solid #25252f;outline:none"/><button class="btn" id="newPlBtn">Create</button>`;
  wrap.appendChild(head);

  if (!state.playlists.length) {
    const e = document.createElement('div'); e.className='empty'; e.innerHTML='<p>Create your first playlist above.</p>';
    wrap.appendChild(e);
  } else {
    const grid = document.createElement('div'); grid.className='grid';
    state.playlists.forEach(p => {
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<div class="cover">📃</div><div class="title"></div><div class="sub"></div>`;
      card.querySelector('.title').textContent = p.name;
      card.querySelector('.sub').textContent = `${p.trackIds.length} track${p.trackIds.length===1?'':'s'}`;
      card.onclick = () => {
        const list = p.trackIds.map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean);
        state.view = { type:'collection', key:'playlist', value:p.name, list, playlistId:p.id };
        render();
      };
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  }
  root.appendChild(wrap);
  $('#newPlBtn').onclick = () => {
    const name = $('#newPl').value.trim(); if (!name) return;
    state.playlists.push({ id:'p_'+Date.now(), name, trackIds:[] });
    save(LS.playlists, state.playlists); render();
  };
}

function renderCollection(root, view) {
  const back = document.createElement('button'); back.className='btn ghost'; back.textContent='← Back';
  back.style.margin='6px 4px 10px'; back.onclick = () => { state.view = null; render(); };
  root.appendChild(back);
  const h = document.createElement('h2'); h.textContent = view.value; h.style.cssText='margin:6px 8px 4px;font-size:22px';
  root.appendChild(h);
  const opts = view.playlistId ? { playlistId: view.playlistId } : {};
  const list = view.playlistId ? view.list : view.list.slice().sort(byTitle);
  if (view.list.length) {
    const playAll = document.createElement('button'); playAll.className='btn'; playAll.textContent='▶ Play all';
    playAll.style.margin='4px 8px 10px';
    playAll.onclick = () => playTrack(list[0], list);
    root.appendChild(playAll);
  }
  renderSongs(root, list, opts);
}

// -------------------- Favorites / Playlists / Recent --------------------
function toggleFav(id) {
  const i = state.favs.indexOf(id);
  if (i >= 0) state.favs.splice(i,1); else state.favs.unshift(id);
  save(LS.favs, state.favs);
}
function pushRecent(id) {
  state.recent = [id, ...state.recent.filter(x=>x!==id)].slice(0, 50);
  save(LS.recent, state.recent);
}
function openPlaylistDialog(trackId) {
  const dlg = $('#playlistDialog');
  const list = $('#playlistList'); list.innerHTML = '';
  if (!state.playlists.length) list.innerHTML = '<div class="empty" style="padding:14px"><p>No playlists yet.</p></div>';
  state.playlists.forEach(p => {
    const row = document.createElement('div'); row.className='pl';
    row.innerHTML = `<span>${p.name}</span><span style="color:var(--muted);font-size:12px">${p.trackIds.length}</span>`;
    row.onclick = () => {
      if (!p.trackIds.includes(trackId)) p.trackIds.push(trackId);
      save(LS.playlists, state.playlists); toast(`Added to ${p.name}`); dlg.close();
    };
    list.appendChild(row);
  });
  $('#createPlaylistBtn').onclick = () => {
    const name = $('#newPlaylistName').value.trim(); if (!name) return;
    state.playlists.push({ id:'p_'+Date.now(), name, trackIds:[trackId] });
    save(LS.playlists, state.playlists);
    $('#newPlaylistName').value=''; toast(`Created ${name}`); dlg.close();
  };
  dlg.showModal();
}
function movePlaylist(plId, idx, dir) {
  const p = state.playlists.find(x=>x.id===plId); if (!p) return;
  const j = idx + dir; if (j < 0 || j >= p.trackIds.length) return;
  const a = p.trackIds.slice(); [a[idx],a[j]] = [a[j],a[idx]]; p.trackIds = a;
  save(LS.playlists, state.playlists); render();
}
function removeFromPlaylist(plId, trackId) {
  const p = state.playlists.find(x=>x.id===plId); if (!p) return;
  p.trackIds = p.trackIds.filter(id=>id!==trackId);
  save(LS.playlists, state.playlists);
  if (state.view?.playlistId === plId) {
    state.view.list = p.trackIds.map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean);
  }
  render();
}

// -------------------- Playback --------------------
const audio = $('#audio');
audio.volume = load(LS.volume, 0.9);

async function playTrack(t, queue) {
  if (queue && queue.length) state.queue = queue.slice();
  else if (!state.queue.find(x=>x.id===t.id)) state.queue = [t];
  state.current = t;
  pushRecent(t.id);

  // Cover (instant from cache if present)
  const cover = await getCoverUrl(t.id);

  // Build playable URL from file
  const file = await getFile(t.id);
  if (!file) { toast('File not found'); return; }
  const old = blobUrls.get('__current'); if (old) { URL.revokeObjectURL(old); }
  const url = URL.createObjectURL(file);
  blobUrls.set('__current', url);
  audio.src = url;
  audio.play().catch(()=>toast('Tap play to start'));

  // Extract cover lazily if missing
  if (!cover && window.jsmediatags) {
    readTags(file).then(async tags => {
      if (tags?.picture) {
        const blob = new Blob([new Uint8Array(tags.picture.data)], { type: tags.picture.format || 'image/jpeg' });
        await DB.set('covers', t.id, blob);
        coverUrls.set(t.id, URL.createObjectURL(blob));
        updateNowPlayingUI();
        setMediaSession();
      }
    });
  }
  updateNowPlayingUI();
  setMediaSession();
  render();
}

function nextTrack() {
  if (!state.current || !state.queue.length) return;
  const i = state.queue.findIndex(t=>t.id===state.current.id);
  let n = state.shuffle ? Math.floor(Math.random()*state.queue.length) : (i+1) % state.queue.length;
  if (state.queue.length > 1 && n === i) n = (i+1) % state.queue.length;
  playTrack(state.queue[n], state.queue);
}
function prevTrack() {
  if (!state.current || !state.queue.length) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const i = state.queue.findIndex(t=>t.id===state.current.id);
  const p = (i - 1 + state.queue.length) % state.queue.length;
  playTrack(state.queue[p], state.queue);
}
function toggle() { if (!state.current) return; if (audio.paused) audio.play(); else audio.pause(); }

audio.addEventListener('play', () => { state.isPlaying = true; updatePlayButtons(); setMediaSessionState(); });
audio.addEventListener('pause', () => { state.isPlaying = false; updatePlayButtons(); setMediaSessionState(); });
audio.addEventListener('ended', () => { state.repeat ? (audio.currentTime=0,audio.play()) : nextTrack(); });
audio.addEventListener('timeupdate', () => {
  const dur = audio.duration || 0;
  $('#npElapsed').textContent = fmt(audio.currentTime);
  $('#npDuration').textContent = fmt(dur);
  const sk = $('#npSeek');
  if (!sk._seeking) sk.value = dur ? Math.floor((audio.currentTime/dur)*1000) : 0;
  if (state.current) save(LS.lastPlay, { id: state.current.id, position: audio.currentTime });
});
audio.addEventListener('error', () => toast("Couldn't play this track"));

// -------------------- UI wiring --------------------
function updatePlayButtons() {
  const sym = state.isPlaying ? '⏸' : '▶';
  $('#miniPlay').textContent = sym;
  $('#npPlay').textContent = sym;
}
function updateNowPlayingUI() {
  const t = state.current;
  $('#miniPlayer').classList.toggle('hidden', !t);
  if (!t) return;
  $('#miniTitle').textContent = t.title;
  $('#miniArtist').textContent = t.artist;
  $('#npTitle').textContent = t.title;
  $('#npArtist').textContent = `${t.artist} • ${t.album}`;
  getCoverUrl(t.id).then(u => {
    const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%231d1d27'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' font-size='28' fill='%239a9aa8'%3E%E2%99%AA%3C/text%3E%3C/svg%3E";
    $('#miniCover').src = u || fallback;
    $('#npCover').src = u || fallback;
  });
  $('#npFav').textContent = (state.favs.includes(t.id)?'❤ Favorited':'♡ Favorite');
}

function setMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const t = state.current; if (!t) { navigator.mediaSession.metadata = null; return; }
  getCoverUrl(t.id).then(u => {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title, artist: t.artist, album: t.album,
      artwork: u ? [
        { src:u, sizes:'96x96', type:'image/jpeg' },
        { src:u, sizes:'192x192', type:'image/jpeg' },
        { src:u, sizes:'512x512', type:'image/jpeg' },
      ] : [],
    });
  });
  navigator.mediaSession.setActionHandler('play', toggle);
  navigator.mediaSession.setActionHandler('pause', toggle);
  navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
  navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
}
function setMediaSessionState() {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : state.current ? 'paused' : 'none';
}

// Tabs / nav
$$('.tab').forEach(b => b.addEventListener('click', () => {
  state.currentTab = b.dataset.tab; state.view = null; render();
}));
$$('.navbtn').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.nav === 'now') { if (state.current) openNP(); return; }
  state.currentTab = b.dataset.tab; state.view = null; render();
}));

// Search
$('#searchInput').addEventListener('input', e => { state.query = e.target.value; render(); });

// Folder pick
$('#pickFolderBtn').addEventListener('click', pickFolder);

// Mini player
$('#miniPlayer').addEventListener('click', e => { if (e.target.closest('.iconbtn')) return; openNP(); });
$('#miniPlay').addEventListener('click', e => { e.stopPropagation(); toggle(); });
$('#miniNext').addEventListener('click', e => { e.stopPropagation(); nextTrack(); });
$('#miniPrev').addEventListener('click', e => { e.stopPropagation(); prevTrack(); });

// Now playing
function openNP() { $('#nowPlaying').classList.remove('hidden'); }
function closeNP() { $('#nowPlaying').classList.add('hidden'); }
$('#npClose').addEventListener('click', closeNP);
$('#npPlay').addEventListener('click', toggle);
$('#npNext').addEventListener('click', nextTrack);
$('#npPrev').addEventListener('click', prevTrack);
$('#npShuffle').addEventListener('click', () => { state.shuffle=!state.shuffle; $('#npShuffle').style.color = state.shuffle?'var(--accent)':''; });
$('#npRepeat').addEventListener('click', () => { state.repeat=!state.repeat; $('#npRepeat').style.color = state.repeat?'var(--accent)':''; });
$('#npFav').addEventListener('click', () => { if (state.current) { toggleFav(state.current.id); updateNowPlayingUI(); render(); }});
$('#npAdd').addEventListener('click', () => { if (state.current) openPlaylistDialog(state.current.id); });
const seek = $('#npSeek');
seek.addEventListener('input', () => { seek._seeking = true; });
seek.addEventListener('change', () => { seek._seeking = false; if (audio.duration) audio.currentTime = (seek.value/1000)*audio.duration; });

// Volume persist
audio.addEventListener('volumechange', () => save(LS.volume, audio.volume));

// Keep audio alive across visibility changes (no extra work — single <audio> element
// already keeps playing; this just refreshes UI when the tab is foregrounded)
document.addEventListener('visibilitychange', () => { if (!document.hidden) updatePlayButtons(); });

// -------------------- Bootstrap --------------------
window.addEventListener('DOMContentLoaded', async () => {
  render();
  await tryRestoreFolder();
});
})();
