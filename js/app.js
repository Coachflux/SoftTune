/* ============================================
   SoftTune - Fixed Music Player
   ============================================ */

const JAMENDO_ID = '8b1f2e5a';
const JAMENDO_API = 'https://api.jamendo.com/v3.0';
const DEF_COVER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop';
const MUSIC_EXTS = ['mp3','wav','ogg','flac','aac','m4a','wma','opus','webm'];

const DEF_PLAYLIST = [
  { id:'d1', title:'Dreaming', artist:'Benjamin Tissot', album:'Electronic', duration:'2:58', cover:'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-dreaming.mp3', source:'online' },
  { id:'d2', title:'Sunny', artist:'Benjamin Tissot', album:'Pop', duration:'2:20', cover:'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-sunny.mp3', source:'online' },
  { id:'d3', title:'Ukulele', artist:'Benjamin Tissot', album:'Folk', duration:'2:26', cover:'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-ukulele.mp3', source:'online' },
  { id:'d4', title:'Creative Minds', artist:'Benjamin Tissot', album:'Electronic', duration:'2:27', cover:'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3', source:'online' },
  { id:'d5', title:'Happy Rock', artist:'Benjamin Tissot', album:'Rock', duration:'1:58', cover:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-happyrock.mp3', source:'online' },
  { id:'d6', title:'Jazz Comedy', artist:'Benjamin Tissot', album:'Jazz', duration:'3:09', cover:'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-jazzcomedy.mp3', source:'online' },
  { id:'d7', title:'Little Idea', artist:'Benjamin Tissot', album:'Pop', duration:'2:51', cover:'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-littleidea.mp3', source:'online' },
  { id:'d8', title:'Memories', artist:'Benjamin Tissot', album:'Electronic', duration:'3:50', cover:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-memories.mp3', source:'online' }
];

const state = {
  page: 'home', songIdx: 0, playing: false, shuffled: false, repeat: 0,
  volume: 0.8, muted: false, playlist: [...DEF_PLAYLIST], favs: [],
  recent: [], locals: [], dls: [], results: [], plTab: 'my', dark: false,
  audioCtx: null, analyser: null, source: null, visId: null, eq: {60:0,230:0,910:0,3600:0,14000:0}
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const E = {
  pages: $$('.page'), splash: $('#splash'), splashBtn: $('#splashBtn'),
  audio: $('#audio'), botNav: $('#botNav'), backBtns: $$('.back-btn'),
  pCover: $('#pCover'), albumArt: $('#albumArt'), pTitle: $('#pTitle'), pArtist: $('#pArtist'),
  progBar: $('#progBar'), progFill: $('#progFill'), curTime: $('#curTime'), totTime: $('#totTime'),
  playBtn: $('#playBtn'), playIcon: $('#playIcon'), prevBtn: $('#prevBtn'), nextBtn: $('#nextBtn'),
  shufBtn: $('#shufBtn'), repBtn: $('#repBtn'), likeBtn: $('#likeBtn'), shareBtn: $('#shareBtn'),
  dlBtn: $('#dlBtn'), eqPageBtn: $('#eqPageBtn'),
  mini: $('#miniPlayer'), mCover: $('#mCover'), mTitle: $('#mTitle'), mArtist: $('#mArtist'),
  mPlay: $('#mPlay'), mPlayIcon: $('#mPlayIcon'), mNext: $('#mNext'), miniClose: $('#miniClose'),
  homePl: $('#homePlaylist'), recent: $('#recentlyPlayed'), favMix: $('#favMixCount'),
  sInput: $('#searchInput'), sGo: $('#searchGo'), sResults: $('#searchResults'), sEmpty: $('#searchEmpty'),
  tTags: $$('.t-tag'), plContent: $('#plContent'), plTabs: $$('.pl-tab'),
  likedC: $('#likedCount'), artC: $('#artistsCount'), albC: $('#albumsCount'), dlC: $('#downloadsCount'),
  favList: $('#favList'), favEmpty: $('#favEmpty'), localList: $('#localList'), localEmpty: $('#localEmpty'),
  scanLocal: $('#scanLocal'), pickFiles: $('#pickFiles'), dlList: $('#dlList'), dlEmpty: $('#dlEmpty'),
  artList: $('#artistsList'), albGrid: $('#albumsGrid'), eqVis: $('#eqVis'), eqBars: $$('.eq-bar'),
  eqSliders: $$('.eq-group'), eqPresets: $$('.eq-pre'), eqReset: $('#eqReset'),
  darkToggle: $('#darkToggle'), toggles: $$('.toggle'), shareModal: $('#shareModal'),
  sCover: $('#sCover'), sTitle: $('#sTitle'), sArtist: $('#sArtist'), sLink: $('#sLink'),
  copyLink: $('#copyLink'), closeShare: $('#closeShare'), toast: $('#toast'), tMsg: $('#tMsg'),
  menuBtn: $('#menuBtn'), scanBtn: $('#scanBtn'), moreBtn: $('#moreBtn'), libItems: $$('.lib-item')
};

function fmtTime(s) {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s/60), sec = Math.floor(s%60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}
function genId() { return 's_'+Date.now()+'_'+Math.random().toString(36).substr(2,6); }
function toast(msg, type='ok') {
  E.tMsg.textContent = msg;
  E.toast.className = 'toast ' + (type==='err'?'err':'') + (type==='warn'?'err':'');
  E.toast.classList.add('show');
  setTimeout(() => E.toast.classList.remove('show'), 2800);
}
function getSt(k, d=null) { try { const i=localStorage.getItem(k); return i?JSON.parse(i):d; } catch { return d; } }
function setSt(k,v) { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} }
function isMusic(f) { const e=f.toLowerCase().split('.').pop(); return MUSIC_EXTS.includes(e); }
function isFav(id) { return state.favs.some(f=>f.id===id); }

// ===== NAVIGATION =====
function go(page) {
  state.page = page;
  E.pages.forEach(p => p.classList.remove('active'));
  const t = $(`#${page}Page`);
  if (t) t.classList.add('active');
  $$('.nav-btn').forEach(b => b.classList.toggle('on', b.dataset.p===page));
  if (page==='home') renderHome();
  if (page==='favorites') renderFavs();
  if (page==='local') renderLocal();
  if (page==='downloads') renderDls();
  if (page==='artists') renderArtists();
  if (page==='albums') renderAlbums();
  if (page==='playlists') renderPl();
  window.scrollTo(0,0);
}

// ===== SPLASH =====
function initSplash() {
  const done = getSt('st-splash', false);
  if (done) { E.splash.classList.add('done'); initApp(); }
  else {
    E.splashBtn.addEventListener('click', () => {
      setSt('st-splash', true); E.splash.classList.add('done'); initApp();
    });
    setTimeout(() => { if (!E.splash.classList.contains('done')) { setSt('st-splash',true); E.splash.classList.add('done'); initApp(); } }, 2500);
  }
}

// ===== AUDIO CORE - FIXED =====
function loadSong(idx) {
  const song = state.playlist[idx];
  if (!song) return;
  state.songIdx = idx;

  // CRITICAL FIX: Always set src and load before playing
  if (song.source === 'local' && song.fileHandle) {
    loadLocal(song).then(() => updateUI(song));
    return;
  }
  if (song.src) {
    E.audio.src = song.src;
    E.audio.load();
  }
  updateUI(song);
}

async function loadLocal(song) {
  if (!song.fileHandle) return;
  try {
    const file = await song.fileHandle.getFile();
    const url = URL.createObjectURL(file);
    E.audio.src = url;
    E.audio.load();
  } catch(e) { console.error(e); toast('Error loading file','err'); }
}

function updateUI(song) {
  // Playing Now
  E.pCover.src = song.cover || DEF_COVER;
  E.pTitle.textContent = song.title;
  E.pArtist.textContent = song.artist;

  // Mini
  E.mCover.src = song.cover || DEF_COVER;
  E.mTitle.textContent = song.title;
  E.mArtist.textContent = song.artist;

  // Media Session
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title, artist: song.artist, album: song.album || 'Album',
      artwork: [{ src: song.cover || DEF_COVER, sizes:'512x512', type:'image/jpeg' }]
    });
  }

  updateLike();
  addRecent(song);
  E.mini.classList.add('show');
  renderHome();
}

function play() {
  // CRITICAL FIX: Resume AudioContext on user gesture
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }

  state.playing = true;
  E.playIcon.className = 'fas fa-pause';
  E.mPlayIcon.className = 'fas fa-pause';
  E.albumArt.classList.add('playing');

  // CRITICAL FIX: Play with proper error handling
  const playPromise = E.audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      updateMedia('playing');
      startVis();
    }).catch(err => {
      console.error('Play error:', err);
      toast('Tap play again to start','warn');
      pause();
    });
  }
}

function pause() {
  state.playing = false;
  E.playIcon.className = 'fas fa-play';
  E.mPlayIcon.className = 'fas fa-play';
  E.albumArt.classList.remove('playing');
  E.audio.pause();
  updateMedia('paused');
  stopVis();
}

function togglePlay() {
  if (!E.audio.src && state.playlist.length) {
    loadSong(state.songIdx);
    setTimeout(play, 100);
    return;
  }
  state.playing ? pause() : play();
}

function next() {
  let n;
  if (state.shuffled) {
    do { n = Math.floor(Math.random()*state.playlist.length); }
    while (n===state.songIdx && state.playlist.length>1);
  } else {
    n = (state.songIdx+1) % state.playlist.length;
  }
  loadSong(n); play();
}

function prev() {
  let p;
  if (state.shuffled) {
    do { p = Math.floor(Math.random()*state.playlist.length); }
    while (p===state.songIdx && state.playlist.length>1);
  } else {
    p = (state.songIdx-1+state.playlist.length) % state.playlist.length;
  }
  loadSong(p); play();
}

function toggleShuf() {
  state.shuffled = !state.shuffled;
  E.shufBtn.classList.toggle('active', state.shuffled);
  toast(state.shuffled ? 'Shuffle on' : 'Shuffle off');
}

function toggleRep() {
  state.repeat = (state.repeat+1)%3;
  E.repBtn.classList.remove('active');
  E.repBtn.innerHTML = '<i class="fas fa-repeat"></i>';
  if (state.repeat===1) { E.repBtn.classList.add('active'); toast('Repeat all'); }
  else if (state.repeat===2) { E.repBtn.classList.add('active'); E.repBtn.innerHTML='<i class="fas fa-repeat-1"></i>'; toast('Repeat one'); }
  else { toast('Repeat off'); }
}

// ===== PROGRESS =====
function updProg() {
  const {currentTime, duration} = E.audio;
  if (duration && isFinite(duration)) {
    const pct = (currentTime/duration)*100;
    E.progFill.style.width = pct+'%';
    E.curTime.textContent = fmtTime(currentTime);
    E.totTime.textContent = fmtTime(duration);
  }
}
function seek(e) {
  const r = E.progBar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width));
  if (E.audio.duration && isFinite(E.audio.duration)) {
    E.audio.currentTime = pct * E.audio.duration;
  }
}

// ===== FAVORITES =====
function toggleFav(song) {
  const t = song || state.playlist[state.songIdx];
  if (!t) return;
  const i = state.favs.findIndex(f=>f.id===t.id);
  if (i===-1) { state.favs.push({...t}); toast('Added to favorites'); }
  else { state.favs.splice(i,1); toast('Removed from favorites'); }
  setSt('st-favs', state.favs); updateLike(); updateCounts(); renderFavs(); renderHome();
}
function updateLike() {
  const c = state.playlist[state.songIdx];
  if (!c) return;
  const liked = isFav(c.id);
  E.likeBtn.innerHTML = liked ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
  E.likeBtn.classList.toggle('liked', liked);
}
function updateCounts() {
  E.likedC.textContent = state.favs.length+' songs';
  E.artC.textContent = new Set(state.playlist.map(s=>s.artist)).size+' artists';
  E.albC.textContent = new Set(state.playlist.map(s=>s.album||s.title)).size+' albums';
  E.dlC.textContent = state.dls.length+' songs';
  E.favMix.textContent = state.favs.length+' songs';
}

// ===== RECENT =====
function addRecent(song) {
  state.recent = state.recent.filter(r=>r.id!==song.id);
  state.recent.unshift({...song, at:Date.now()});
  if (state.recent.length>50) state.recent = state.recent.slice(0,50);
  setSt('st-recent', state.recent); renderRecent();
}
function renderRecent() {
  if (!state.recent.length) { E.recent.innerHTML=''; return; }
  E.recent.innerHTML = state.recent.slice(0,10).map(s=>`
    <div class="song-card" data-sid="${s.id}">
      <div class="card-img"><img src="${s.cover||DEF_COVER}" alt="${s.title}" loading="lazy"><div class="play-ov"><i class="fas fa-play"></i></div></div>
      <div class="card-title">${s.title}</div><div class="card-artist">${s.artist}</div>
    </div>`).join('');
  E.recent.querySelectorAll('.song-card').forEach(c=>{
    c.addEventListener('click',()=>{
      const idx = state.playlist.findIndex(s=>s.id===c.dataset.sid);
      if (idx!==-1) { loadSong(idx); play(); go('playing'); }
    });
  });
}

// ===== RENDERING =====
function songHTML(song, idx, showAct=true) {
  const playing = state.playing && state.songIdx===idx;
  const liked = isFav(song.id);
  return `
    <div class="song-item ${playing?'playing':''}" data-idx="${idx}" data-sid="${song.id}">
      <div class="s-img"><img src="${song.cover||DEF_COVER}" alt="${song.title}" loading="lazy">
        <div class="s-ind"><span></span><span></span><span></span></div>
      </div>
      <div class="s-info"><h4>${song.title}</h4><p>${song.artist}</p></div>
      <span class="s-dur">${song.duration||'--:--'}</span>
      ${showAct?`<div class="s-actions">
        <button class="s-act-btn ${liked?'liked':''}" data-a="like" data-id="${song.id}"><i class="${liked?'fas':'far'} fa-heart"></i></button>
        <button class="s-act-btn" data-a="play" data-id="${song.id}"><i class="fas fa-play"></i></button>
      </div>`:''}
    </div>`;
}

function renderHome() {
  E.homePl.innerHTML = state.playlist.map((s,i)=>songHTML(s,i)).join('');
  E.homePl.querySelectorAll('.song-item').forEach(item=>{
    item.addEventListener('click', e=>{
      if (e.target.closest('.s-act-btn')) return;
      const idx = parseInt(item.dataset.idx);
      if (!isNaN(idx)) { loadSong(idx); play(); }
    });
  });
  E.homePl.querySelectorAll('.s-act-btn').forEach(b=>{
    b.addEventListener('click', e=>{
      e.stopPropagation();
      const a=b.dataset.a, id=b.dataset.id;
      const song = state.playlist.find(s=>s.id===id);
      if (a==='like') toggleFav(song);
      if (a==='play') { const idx=state.playlist.findIndex(s=>s.id===id); if(idx!==-1){loadSong(idx);play();} }
    });
  });
  renderRecent();
}

function renderFavs() {
  if (!state.favs.length) { E.favList.innerHTML=''; E.favEmpty.style.display='flex'; return; }
  E.favEmpty.style.display='none';
  E.favList.innerHTML = state.favs.map((s,i)=>songHTML(s,i)).join('');
  E.favList.querySelectorAll('.song-item').forEach(item=>{
    item.addEventListener('click',()=>{
      const song = state.favs.find(s=>s.id===item.dataset.sid);
      if (song) { addPl(song); const idx=state.playlist.findIndex(s=>s.id===song.id); if(idx!==-1){loadSong(idx);play();go('playing');} }
    });
  });
}

function renderPl() {
  const tab = state.plTab;
  let html = '';
  if (tab==='my') {
    html = `<div class="empty"><div class="e-ico"><i class="fas fa-list-music"></i></div><h3>No playlists yet</h3><p>Create your first playlist</p></div>`;
  } else if (tab==='liked') {
    if (!state.favs.length) html = `<div class="empty"><div class="e-ico"><i class="fas fa-heart"></i></div><h3>No liked songs</h3><p>Like songs to add them here</p></div>`;
    else html = state.favs.map((s,i)=>songHTML(s,i)).join('');
  } else if (tab==='albums') {
    const albs = {};
    state.playlist.forEach(s=>{ if(!albs[s.album])albs[s.album]=[]; albs[s.album].push(s); });
    html = Object.entries(albs).map(([a,songs])=>`
      <div class="song-item" style="cursor:pointer;"><div class="s-img"><img src="${songs[0].cover||DEF_COVER}" alt="${a}"></div>
      <div class="s-info"><h4>${a}</h4><p>${songs.length} songs</p></div><i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:12px;"></i></div>`).join('');
  }
  E.plContent.innerHTML = html;
}

function renderLocal() {
  if (!state.locals.length) { E.localList.innerHTML=''; E.localEmpty.style.display='flex'; return; }
  E.localEmpty.style.display='none';
  E.localList.innerHTML = state.locals.map((s,i)=>songHTML(s,i)).join('');
  E.localList.querySelectorAll('.song-item').forEach(item=>{
    item.addEventListener('click',()=>{
      const idx = state.playlist.findIndex(s=>s.id===item.dataset.sid);
      if (idx!==-1) { loadSong(idx); play(); }
    });
  });
}

function renderDls() {
  if (!state.dls.length) { E.dlList.innerHTML=''; E.dlEmpty.style.display='flex'; return; }
  E.dlEmpty.style.display='none';
  E.dlList.innerHTML = state.dls.map((s,i)=>songHTML(s,i)).join('');
}

function renderArtists() {
  const arts = {};
  state.playlist.forEach(s=>{ if(!arts[s.artist])arts[s.artist]=[]; arts[s.artist].push(s); });
  E.artList.innerHTML = Object.entries(arts).map(([a,songs])=>`
    <div class="song-item" style="cursor:pointer;"><div class="s-img"><img src="${songs[0].cover||DEF_COVER}" alt="${a}"></div>
    <div class="s-info"><h4>${a}</h4><p>${songs.length} songs</p></div><i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:12px;"></i></div>`).join('');
}

function renderAlbums() {
  const albs = {};
  state.playlist.forEach(s=>{ if(!albs[s.album])albs[s.album]=[]; albs[s.album].push(s); });
  E.albGrid.innerHTML = Object.entries(albs).map(([a,songs])=>`
    <div class="res-card" style="cursor:pointer;"><div class="res-img"><img src="${songs[0].cover||DEF_COVER}" alt="${a}"></div>
    <div class="res-info"><h4>${a}</h4><p>${songs[0].artist} &bull; ${songs.length} songs</p></div></div>`).join('');
}

function addPl(song) { if (!state.playlist.find(s=>s.id===song.id)) state.playlist.push(song); }

// ===== LOCAL FILES =====
async function scanLocal() {
  if (!('showDirectoryPicker' in window)) { toast('Use "Select Files" instead','err'); return; }
  try {
    const dir = await window.showDirectoryPicker();
    const files = []; await scanDir(dir, files);
    if (files.length) {
      state.locals = [...state.locals, ...files]; setSt('st-locals', state.locals);
      files.forEach(f=>{ if(!state.playlist.find(s=>s.id===f.id)) state.playlist.push(f); });
      toast(`Found ${files.length} music files`); renderLocal(); renderHome();
    } else { toast('No music files found'); }
  } catch(e) { if (e.name!=='AbortError') { toast('Error scanning','err'); } }
}

async function scanDir(dir, files, path='') {
  for await (const entry of dir.values()) {
    if (entry.kind==='directory') await scanDir(entry, files, path+entry.name+'/');
    else if (entry.kind==='file' && isMusic(entry.name)) {
      files.push({ id:genId(), title:entry.name.replace(/\.[^.]+$/,''), artist:'Local File', album:'Local', duration:'--:--', cover:DEF_COVER, src:null, source:'local', fileHandle:entry, fileName:entry.name });
    }
  }
}

function pickFiles() {
  const inp = document.createElement('input');
  inp.type='file'; inp.accept='audio/*'; inp.multiple=true;
  inp.onchange = e=>{
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = files.map(file=>{
      const url = URL.createObjectURL(file);
      return { id:genId(), title:file.name.replace(/\.[^.]+$/,''), artist:'Local File', album:'Local', duration:'--:--', cover:DEF_COVER, src:url, source:'local', fileName:file.name, blob:file };
    });
    state.locals = [...state.locals, ...newFiles]; setSt('st-locals', state.locals);
    newFiles.forEach(f=>{ if(!state.playlist.find(s=>s.id===f.id)) state.playlist.push(f); });
    toast(`Added ${newFiles.length} files`); renderLocal(); renderHome();
  };
  inp.click();
}

// ===== SEARCH =====
async function search(q) {
  if (!q.trim()) { toast('Enter a search term','err'); return; }
  E.sEmpty.style.display='none'; E.sResults.style.display='grid';
  E.sResults.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><div class="spinner" style="margin:0 auto 12px;"></div><p style="color:var(--text-muted);font-size:13px;">Searching...</p></div>';
  try {
    const res = await fetch(`${JAMENDO_API}/tracks/?client_id=${JAMENDO_ID}&format=json&limit=20&search=${encodeURIComponent(q)}&include=musicinfo&audioformat=mp32`);
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    if (data.results && data.results.length) {
      state.results = data.results.map(t=>({
        id:'j_'+t.id, title:t.name, artist:t.artist_name, album:t.album_name||'Unknown',
        duration:fmtTime(t.duration), cover:t.image||DEF_COVER, src:t.audio, dlUrl:t.audiodownload, source:'jamendo'
      }));
      renderResults();
    } else { E.sResults.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><p style="color:var(--text-muted);">No results found</p></div>'; }
  } catch(err) { E.sResults.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><p style="color:var(--text-muted);">Search unavailable</p></div>'; toast('Search unavailable','err'); }
}

function renderResults() {
  E.sResults.innerHTML = state.results.map(s=>`
    <div class="res-card" data-sid="${s.id}">
      <div class="res-img"><img src="${s.cover}" alt="${s.title}" loading="lazy"><div class="res-play"><i class="fas fa-play"></i></div></div>
      <div class="res-info"><h4>${s.title}</h4><p>${s.artist}</p></div>
    </div>`).join('');
  E.sResults.querySelectorAll('.res-card').forEach(c=>{
    c.addEventListener('click',()=>{
      const song = state.results.find(s=>s.id===c.dataset.sid);
      if (song) { addPl(song); const idx=state.playlist.findIndex(s=>s.id===song.id); if(idx!==-1){loadSong(idx);play();go('playing');} toast(`Playing: ${song.title}`); }
    });
  });
}

// ===== DOWNLOAD =====
function dlSong(song) {
  const url = song.dlUrl || song.src;
  if (!url) { toast('Download not available','err'); return; }
  const a = document.createElement('a'); a.href=url; a.download=`${song.title} - ${song.artist}.mp3`; a.target='_blank';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  if (!state.dls.find(s=>s.id===song.id)) { state.dls.push(song); setSt('st-dls', state.dls); updateCounts(); }
  toast(`Downloading: ${song.title}`);
}

// ===== EQUALIZER & VISUALIZER =====
function initAudioCtx() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    state.analyser = state.audioCtx.createAnalyser();
    state.analyser.fftSize = 64;
    state.analyser.smoothingTimeConstant = 0.8;
    try {
      state.source = state.audioCtx.createMediaElementSource(E.audio);
      state.source.connect(state.analyser);
      state.analyser.connect(state.audioCtx.destination);
    } catch(e) { console.log('AudioCtx already connected'); }
  }
}

function startVis() {
  if (!state.analyser) initAudioCtx();
  if (state.audioCtx && state.audioCtx.state==='suspended') state.audioCtx.resume();
  animateVis();
}

function stopVis() {
  if (state.visId) { cancelAnimationFrame(state.visId); state.visId = null; }
  E.eqBars.forEach(b=>b.style.height='10%');
}

function animateVis() {
  if (!state.analyser || !state.playing) return;
  const data = new Uint8Array(state.analyser.frequencyBinCount);
  state.analyser.getByteFrequencyData(data);
  E.eqBars.forEach((b,i)=>{
    const v = data[i % data.length] || 0;
    b.style.height = Math.max(3, (v/255)*100)+'%';
  });
  state.visId = requestAnimationFrame(animateVis);
}

function applyEQ(preset) {
  const presets = { custom:[0,0,0,0,0], pop:[2,1,3,2,1], rock:[3,1,0,2,3], jazz:[0,2,1,3,2], classical:[0,0,0,1,2], bass:[5,3,0,-1,-2] };
  const vals = presets[preset] || presets.custom;
  const freqs = [60,230,910,3600,14000];
  E.eqSliders.forEach((sl,i)=>{
    const v = vals[i]; state.eq[freqs[i]] = v;
    const fill = sl.querySelector('.eq-fill');
    const valLabel = sl.querySelector('.eq-val');
    fill.style.height = (50 + v*5)+'%';
    valLabel.textContent = (v>0?'+':'')+v;
  });
}

// ===== MEDIA SESSION =====
function setupMedia() {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.setActionHandler('play', play);
  navigator.mediaSession.setActionHandler('pause', pause);
  navigator.mediaSession.setActionHandler('previoustrack', prev);
  navigator.mediaSession.setActionHandler('nexttrack', next);
  navigator.mediaSession.setActionHandler('seekbackward', ()=>{ E.audio.currentTime=Math.max(0,E.audio.currentTime-10); });
  navigator.mediaSession.setActionHandler('seekforward', ()=>{ E.audio.currentTime=Math.min(E.audio.duration,E.audio.currentTime+10); });
}
function updateMedia(st) { if ('mediaSession' in navigator) navigator.mediaSession.playbackState = st; }

// ===== THEME =====
function toggleDark() {
  state.dark = !state.dark;
  document.documentElement.setAttribute('data-theme', state.dark?'dark':'light');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', state.dark?'#1A202C':'#E8ECF1');
  setSt('st-dark', state.dark);
  toast(state.dark ? 'Dark mode on' : 'Light mode on');
}
function initTheme() {
  const saved = getSt('st-dark', false);
  if (saved) { state.dark = true; document.documentElement.setAttribute('data-theme','dark'); document.querySelector('meta[name="theme-color"]').setAttribute('content','#1A202C'); E.darkToggle.classList.add('on'); }
}

// ===== EVENT LISTENERS =====
function bindEvents() {
  // Audio
  E.audio.addEventListener('timeupdate', updProg);
  E.audio.addEventListener('loadedmetadata', updProg);
  E.audio.addEventListener('ended', ()=>{
    if (state.repeat===2) { E.audio.currentTime=0; play(); }
    else if (state.repeat===1 || state.shuffled) next();
    else if (state.songIdx < state.playlist.length-1) next();
    else { pause(); E.audio.currentTime=0; E.progFill.style.width='0%'; }
  });
  E.audio.addEventListener('error', ()=>{ toast('Error loading audio','err'); pause(); });

  // Player controls
  E.playBtn.addEventListener('click', togglePlay);
  E.prevBtn.addEventListener('click', prev);
  E.nextBtn.addEventListener('click', next);
  E.shufBtn.addEventListener('click', toggleShuf);
  E.repBtn.addEventListener('click', toggleRep);
  E.likeBtn.addEventListener('click', ()=>toggleFav());
  E.shareBtn.addEventListener('click', openShare);
  E.dlBtn.addEventListener('click', ()=>{ const s=state.playlist[state.songIdx]; if(s)dlSong(s); });
  E.eqPageBtn.addEventListener('click', ()=>go('equalizer'));

  // Progress
  E.progBar.addEventListener('click', seek);

  // Mini player
  E.mini.addEventListener('click', e=>{ if(!e.target.closest('button') || e.target.closest('.mini-close')) return; go('playing'); });
  E.mPlay.addEventListener('click', e=>{ e.stopPropagation(); togglePlay(); });
  E.mNext.addEventListener('click', e=>{ e.stopPropagation(); next(); });
  E.miniClose.addEventListener('click', e=>{ e.stopPropagation(); E.mini.classList.remove('show'); pause(); });

  // Bottom nav
  $$('.nav-btn').forEach(b=>{ b.addEventListener('click',()=>go(b.dataset.p)); });

  // Back buttons
  E.backBtns.forEach(b=>{ b.addEventListener('click',()=>go('home')); });

  // Search
  E.sInput.addEventListener('keypress', e=>{ if(e.key==='Enter') search(E.sInput.value); });
  E.sGo.addEventListener('click', ()=>search(E.sInput.value));
  E.tTags.forEach(t=>{ t.addEventListener('click',()=>{ E.sInput.value=t.textContent; search(t.textContent); }); });

  // Playlist tabs
  E.plTabs.forEach(t=>{ t.addEventListener('click',()=>{ E.plTabs.forEach(x=>x.classList.remove('on')); t.classList.add('on'); state.plTab=t.dataset.tab; renderPl(); }); });

  // Library items
  E.libItems.forEach(item=>{ item.addEventListener('click',()=>{ const nav=item.dataset.nav; if(nav)go(nav); }); });

  // Mix cards
  $$('.mix-card').forEach(c=>{ c.addEventListener('click',()=>{
    const m=c.dataset.mix;
    if (m==='favorites' && state.favs.length) { state.favs.forEach(s=>addPl(s)); const idx=state.playlist.findIndex(s=>s.id===state.favs[0].id); if(idx!==-1){loadSong(idx);play();go('playing');} }
    else if (m==='chill') { const chill=state.playlist.filter(s=>s.album?.toLowerCase().includes('jazz')||s.album?.toLowerCase().includes('folk')); if(chill.length){loadSong(state.playlist.indexOf(chill[0]));play();go('playing');} }
    else if (m==='pop') { const pop=state.playlist.filter(s=>s.album?.toLowerCase()==='pop'); if(pop.length){loadSong(state.playlist.indexOf(pop[0]));play();go('playing');} }
    else if (m==='workout') { const rock=state.playlist.filter(s=>s.album?.toLowerCase()==='rock'); if(rock.length){loadSong(state.playlist.indexOf(rock[0]));play();go('playing');} }
  }); });

  // Settings toggles
  E.toggles.forEach(t=>{ t.addEventListener('click',()=>{ t.classList.toggle('on'); if(t.dataset.t==='dark')toggleDark(); }); });

  // Local files
  E.scanLocal.addEventListener('click', scanLocal);
  E.pickFiles.addEventListener('click', pickFiles);
  E.scanBtn.addEventListener('click', scanLocal);

  // Equalizer
  E.eqPresets.forEach(p=>{ p.addEventListener('click',()=>{ E.eqPresets.forEach(x=>x.classList.remove('on')); p.classList.add('on'); applyEQ(p.dataset.p); }); });
  E.eqReset.addEventListener('click', ()=>{ E.eqPresets.forEach(x=>x.classList.remove('on')); E.eqPresets[0].classList.add('on'); applyEQ('custom'); toast('EQ reset'); });

  // Share modal
  E.copyLink.addEventListener('click', ()=>{ E.sLink.select(); navigator.clipboard.writeText(E.sLink.value).then(()=>toast('Link copied!')); });
  E.closeShare.addEventListener('click', ()=>E.shareModal.classList.remove('on'));
  E.shareModal.addEventListener('click', e=>{ if(e.target===E.shareModal) E.shareModal.classList.remove('on'); });

  // More button
  E.moreBtn.addEventListener('click', ()=>{ E.shareModal.classList.add('on'); });

  // Keyboard
  document.addEventListener('keydown', e=>{
    if (e.target.tagName==='INPUT') return;
    switch(e.code) {
      case 'Space': e.preventDefault(); togglePlay(); break;
      case 'ArrowLeft': e.preventDefault(); prev(); break;
      case 'ArrowRight': e.preventDefault(); next(); break;
      case 'KeyM': e.preventDefault(); toggleFav(); break;
      case 'KeyS': e.preventDefault(); toggleShuf(); break;
      case 'KeyR': e.preventDefault(); toggleRep(); break;
    }
  });

  // Service Worker
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(console.error);
}

function openShare() {
  const song = state.playlist[state.songIdx];
  if (!song) return;
  E.sCover.src = song.cover || DEF_COVER;
  E.sTitle.textContent = song.title;
  E.sArtist.textContent = song.artist;
  E.sLink.value = `${window.location.origin}?song=${song.id}`;
  E.shareModal.classList.add('on');
}

// ===== PERSISTENCE =====
function loadData() {
  state.favs = getSt('st-favs', []);
  state.recent = getSt('st-recent', []);
  state.locals = getSt('st-locals', []);
  state.dls = getSt('st-dls', []);
  state.locals.forEach(f=>{ if(!state.playlist.find(s=>s.id===f.id)) state.playlist.push(f); });
  state.dls.forEach(f=>{ if(!state.playlist.find(s=>s.id===f.id)) state.playlist.push(f); });
}

// ===== INIT =====
function initApp() {
  loadData();
  initTheme();
  setupMedia();
  bindEvents();
  loadSong(0);
  renderHome();
  renderRecent();
  updateCounts();

  const params = new URLSearchParams(window.location.search);
  const sid = params.get('song');
  if (sid) { const idx=state.playlist.findIndex(s=>s.id===sid); if(idx!==-1){loadSong(idx);toast('Shared song loaded');} }

  console.log('SoftTune ready! Shortcuts: Space=Play, Arrows=Prev/Next, M=Like, S=Shuffle, R=Repeat');
}

initSplash();
