/* ============================================
   SoftTune - Premium Neumorphism Music Player
   Complete JavaScript Application
   ============================================ */

// ============================================
// CONSTANTS & CONFIG
// ============================================
const JAMENDO_CLIENT_ID = '8b1f2e5a';
const JAMENDO_API = 'https://api.jamendo.com/v3.0';
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop';
const MUSIC_EXTENSIONS = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus', 'webm'];

const DEFAULT_PLAYLIST = [
  { id: 'default_1', title: 'Dreaming', artist: 'Benjamin Tissot', album: 'Electronic', duration: '2:58', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', src: 'https://www.bensound.com/bensound-music/bensound-dreaming.mp3', source: 'online' },
  { id: 'default_2', title: 'Sunny', artist: 'Benjamin Tissot', album: 'Pop', duration: '2:20', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', src: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3', source: 'online' },
  { id: 'default_3', title: 'Ukulele', artist: 'Benjamin Tissot', album: 'Folk', duration: '2:26', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop', src: 'https://www.bensound.com/bensound-music/bensound-ukulele.mp3', source: 'online' },
  { id: 'default_4', title: 'Creative Minds', artist: 'Benjamin Tissot', album: 'Electronic', duration: '2:27', cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop', src: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3', source: 'online' },
  { id: 'default_5', title: 'Happy Rock', artist: 'Benjamin Tissot', album: 'Rock', duration: '1:58', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', src: 'https://www.bensound.com/bensound-music/bensound-happyrock.mp3', source: 'online' },
  { id: 'default_6', title: 'Jazz Comedy', artist: 'Benjamin Tissot', album: 'Jazz', duration: '3:09', cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop', src: 'https://www.bensound.com/bensound-music/bensound-jazzcomedy.mp3', source: 'online' },
  { id: 'default_7', title: 'Little Idea', artist: 'Benjamin Tissot', album: 'Pop', duration: '2:51', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', src: 'https://www.bensound.com/bensound-music/bensound-littleidea.mp3', source: 'online' },
  { id: 'default_8', title: 'Memories', artist: 'Benjamin Tissot', album: 'Electronic', duration: '3:50', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop', src: 'https://www.bensound.com/bensound-music/bensound-memories.mp3', source: 'online' }
];

// ============================================
// APP STATE
// ============================================
const state = {
  currentPage: 'home',
  currentSongIndex: 0,
  isPlaying: false,
  isShuffled: false,
  repeatMode: 0, // 0=off, 1=all, 2=one
  volume: 0.8,
  isMuted: false,
  playlist: [...DEFAULT_PLAYLIST],
  favorites: [],
  recentlyPlayed: [],
  localFiles: [],
  downloadedSongs: [],
  queue: [],
  searchResults: [],
  currentPlaylistTab: 'myplaylists',
  audioContext: null,
  analyser: null,
  sourceNode: null,
  eqValues: { 60: 0, 230: 0, 910: 0, 3600: 0, 14000: 0 },
  isDarkMode: false,
  isSplashDone: false
};

// ============================================
// DOM ELEMENTS CACHE
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  // Pages
  pages: $$('.page'),
  splash: $('#splashScreen'),
  splashBtn: $('#splashBtn'),

  // Audio
  audio: $('#audioPlayer'),

  // Navigation
  bottomNav: $('#bottomNav'),
  navItems: $$('.nav-item-bottom'),
  backBtns: $$('.back-btn'),

  // Player
  playingCover: $('#playingCover'),
  playingAlbumArt: $('#playingAlbumArt'),
  playingTitle: $('#playingTitle'),
  playingArtist: $('#playingArtist'),
  progressBar: $('#progressBar'),
  progressFill: $('#progressFill'),
  currentTime: $('#currentTime'),
  totalTime: $('#totalTime'),
  playPauseBtn: $('#playPauseBtn'),
  playPauseIcon: $('#playPauseIcon'),
  prevBtn: $('#prevBtn'),
  nextBtn: $('#nextBtn'),
  shuffleBtn: $('#shuffleBtn'),
  repeatBtn: $('#repeatBtn'),
  likeBtn: $('#likeBtn'),
  shareBtn: $('#shareBtn'),
  downloadBtn: $('#downloadBtn'),
  eqBtn: $('#eqBtn'),

  // Mini Player
  miniPlayer: $('#miniPlayer'),
  miniCover: $('#miniCover'),
  miniTitle: $('#miniTitle'),
  miniArtist: $('#miniArtist'),
  miniPlayBtn: $('#miniPlayBtn'),
  miniPlayIcon: $('#miniPlayIcon'),
  miniNextBtn: $('#miniNextBtn'),

  // Home
  homePlaylist: $('#homePlaylist'),
  recentlyPlayed: $('#recentlyPlayed'),
  favMixCount: $('#favMixCount'),

  // Search
  searchInput: $('#searchInput'),
  searchActionBtn: $('#searchActionBtn'),
  searchResults: $('#searchResults'),
  searchEmpty: $('#searchEmpty'),
  trendTags: $$('.trend-tag'),

  // Playlists
  playlistsContent: $('#playlistsContent'),
  playlistTabs: $$('.playlist-tab'),

  // Library
  likedCount: $('#likedCount'),
  artistsCount: $('#artistsCount'),
  albumsCount: $('#albumsCount'),
  downloadsCount: $('#downloadsCount'),

  // Favorites
  favoritesList: $('#favoritesList'),
  favEmpty: $('#favEmpty'),

  // Local
  localList: $('#localList'),
  localEmpty: $('#localEmpty'),
  scanLocalBtn: $('#scanLocalBtn'),
  pickFilesBtn: $('#pickFilesBtn'),

  // Downloads
  downloadsList: $('#downloadsList'),
  downloadsEmpty: $('#downloadsEmpty'),

  // Artists
  artistsList: $('#artistsList'),

  // Albums
  albumsGrid: $('#albumsGrid'),

  // Equalizer
  eqVisualizer: $('#eqVisualizer'),
  eqBars: $$('.eq-bar'),
  eqSliders: $$('.eq-slider-group'),
  eqPresets: $$('.eq-preset'),
  eqResetBtn: $('#eqResetBtn'),

  // Settings
  darkModeToggle: $('#darkModeToggle'),
  toggleSwitches: $$('.toggle-switch'),

  // Modal
  shareModal: $('#shareModal'),
  shareCover: $('#shareCover'),
  shareTitle: $('#shareTitle'),
  shareArtist: $('#shareArtist'),
  shareLink: $('#shareLink'),
  copyLinkBtn: $('#copyLinkBtn'),

  // Toast
  toast: $('#toast'),
  toastMessage: $('#toastMessage'),

  // Misc
  menuBtn: $('#menuBtn'),
  scanBtn: $('#scanBtn')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function generateId() {
  return 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showToast(message, type = 'success') {
  els.toastMessage.textContent = message;
  els.toast.className = 'toast ' + type;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), 3000);
}

function getStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch { return fallback; }
}

function setStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function isMusicFile(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  return MUSIC_EXTENSIONS.includes(ext);
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(pageName) {
  state.currentPage = pageName;

  // Hide all pages
  els.pages.forEach(p => p.classList.remove('active'));

  // Show target page
  const target = $(`#${pageName}Page`);
  if (target) target.classList.add('active');

  // Update nav
  els.navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  // Update page-specific content
  if (pageName === 'home') renderHome();
  if (pageName === 'favorites') renderFavorites();
  if (pageName === 'local') renderLocalFiles();
  if (pageName === 'downloads') renderDownloads();
  if (pageName === 'artists') renderArtists();
  if (pageName === 'albums') renderAlbums();
  if (pageName === 'playlists') renderPlaylists();

  window.scrollTo(0, 0);
}

// ============================================
// SPLASH SCREEN
// ============================================
function initSplash() {
  const splashDone = getStorage('softtune-splash-done', false);

  if (splashDone) {
    els.splash.classList.add('hidden');
    state.isSplashDone = true;
    initApp();
  } else {
    els.splashBtn.addEventListener('click', () => {
      setStorage('softtune-splash-done', true);
      els.splash.classList.add('hidden');
      state.isSplashDone = true;
      initApp();
    });
  }

  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (!state.isSplashDone) {
      setStorage('softtune-splash-done', true);
      els.splash.classList.add('hidden');
      state.isSplashDone = true;
      initApp();
    }
  }, 3000);
}

// ============================================
// AUDIO PLAYER CORE
// ============================================
function loadSong(index) {
  const song = state.playlist[index];
  if (!song) return;

  state.currentSongIndex = index;

  // Handle local file
  if (song.source === 'local' && song.fileHandle) {
    loadLocalFile(song).then(() => updatePlayerUI(song));
    return;
  }

  // Handle blob URL
  if (song.src) {
    els.audio.src = song.src;
    els.audio.load();
  }

  updatePlayerUI(song);
}

async function loadLocalFile(song) {
  if (!song.fileHandle) return;
  try {
    const file = await song.fileHandle.getFile();
    const url = URL.createObjectURL(file);
    els.audio.src = url;
    els.audio.load();
  } catch (e) {
    console.error('Error loading local file:', e);
    showToast('Error loading file', 'error');
  }
}

function updatePlayerUI(song) {
  // Update Playing Now page
  els.playingCover.src = song.cover || DEFAULT_COVER;
  els.playingTitle.textContent = song.title;
  els.playingArtist.textContent = song.artist;

  // Update Mini Player
  els.miniCover.src = song.cover || DEFAULT_COVER;
  els.miniTitle.textContent = song.title;
  els.miniArtist.textContent = song.artist;

  // Update Media Session
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album || 'Unknown Album',
      artwork: [{ src: song.cover || DEFAULT_COVER, sizes: '512x512', type: 'image/jpeg' }]
    });
  }

  // Update like button
  updateLikeButton();

  // Add to recently played
  addToRecentlyPlayed(song);

  // Show mini player
  els.miniPlayer.classList.remove('hidden');

  // Update playlist highlighting
  renderHome();
}

function playAudio() {
  state.isPlaying = true;
  els.playPauseIcon.className = 'fas fa-pause';
  els.miniPlayIcon.className = 'fas fa-pause';
  els.playingAlbumArt.classList.add('playing');

  els.audio.play().catch(err => {
    console.error('Play error:', err);
    showToast('Unable to play this track', 'error');
    pauseAudio();
  });

  updateMediaSession('play');
  startVisualizer();
}

function pauseAudio() {
  state.isPlaying = false;
  els.playPauseIcon.className = 'fas fa-play';
  els.miniPlayIcon.className = 'fas fa-play';
  els.playingAlbumArt.classList.remove('playing');
  els.audio.pause();
  updateMediaSession('pause');
  stopVisualizer();
}

function togglePlay() {
  state.isPlaying ? pauseAudio() : playAudio();
}

function nextSong() {
  let next;
  if (state.isShuffled) {
    do { next = Math.floor(Math.random() * state.playlist.length); }
    while (next === state.currentSongIndex && state.playlist.length > 1);
  } else {
    next = (state.currentSongIndex + 1) % state.playlist.length;
  }
  loadSong(next);
  playAudio();
}

function prevSong() {
  let prev;
  if (state.isShuffled) {
    do { prev = Math.floor(Math.random() * state.playlist.length); }
    while (prev === state.currentSongIndex && state.playlist.length > 1);
  } else {
    prev = (state.currentSongIndex - 1 + state.playlist.length) % state.playlist.length;
  }
  loadSong(prev);
  playAudio();
}

function toggleShuffle() {
  state.isShuffled = !state.isShuffled;
  els.shuffleBtn.classList.toggle('active', state.isShuffled);
  showToast(state.isShuffled ? 'Shuffle enabled' : 'Shuffle disabled');
}

function toggleRepeat() {
  state.repeatMode = (state.repeatMode + 1) % 3;
  els.repeatBtn.classList.remove('active');
  els.repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';

  if (state.repeatMode === 1) {
    els.repeatBtn.classList.add('active');
    showToast('Repeat all enabled');
  } else if (state.repeatMode === 2) {
    els.repeatBtn.classList.add('active');
    els.repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';
    showToast('Repeat one enabled');
  } else {
    showToast('Repeat disabled');
  }
}

// ============================================
// PROGRESS & SEEKING
// ============================================
function updateProgress() {
  const { currentTime, duration } = els.audio;
  if (duration && isFinite(duration)) {
    const percent = (currentTime / duration) * 100;
    els.progressFill.style.width = percent + '%';
    els.currentTime.textContent = formatTime(currentTime);
    els.totalTime.textContent = formatTime(duration);
  }
}

function seek(e) {
  const rect = els.progressBar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (els.audio.duration && isFinite(els.audio.duration)) {
    els.audio.currentTime = percent * els.audio.duration;
  }
}

// ============================================
// FAVORITES SYSTEM
// ============================================
function isFavorite(songId) {
  return state.favorites.some(f => f.id === songId);
}

function toggleFavorite(song) {
  const target = song || state.playlist[state.currentSongIndex];
  if (!target) return;

  const idx = state.favorites.findIndex(f => f.id === target.id);
  if (idx === -1) {
    state.favorites.push({ ...target });
    showToast('Added to favorites');
  } else {
    state.favorites.splice(idx, 1);
    showToast('Removed from favorites');
  }

  setStorage('softtune-favorites', state.favorites);
  updateLikeButton();
  updateLibraryCounts();
  renderFavorites();
  renderHome();
}

function updateLikeButton() {
  const current = state.playlist[state.currentSongIndex];
  if (!current) return;
  const liked = isFavorite(current.id);
  els.likeBtn.innerHTML = liked ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
  els.likeBtn.classList.toggle('liked', liked);
}

function updateLibraryCounts() {
  els.likedCount.textContent = state.favorites.length + ' songs';
  const uniqueArtists = new Set(state.playlist.map(s => s.artist));
  els.artistsCount.textContent = uniqueArtists.size + ' artists';
  const uniqueAlbums = new Set(state.playlist.map(s => s.album || s.title));
  els.albumsCount.textContent = uniqueAlbums.size + ' albums';
  els.downloadsCount.textContent = state.downloadedSongs.length + ' songs';
  els.favMixCount.textContent = state.favorites.length + ' songs';
}

// ============================================
// RECENTLY PLAYED
// ============================================
function addToRecentlyPlayed(song) {
  state.recentlyPlayed = state.recentlyPlayed.filter(r => r.id !== song.id);
  state.recentlyPlayed.unshift({ ...song, playedAt: Date.now() });
  if (state.recentlyPlayed.length > 50) state.recentlyPlayed = state.recentlyPlayed.slice(0, 50);
  setStorage('softtune-recent', state.recentlyPlayed);
  renderRecentlyPlayed();
}

function renderRecentlyPlayed() {
  if (!state.recentlyPlayed.length) {
    els.recentlyPlayed.innerHTML = '';
    return;
  }

  els.recentlyPlayed.innerHTML = state.recentlyPlayed.slice(0, 10).map(song => `
    <div class="scroll-item song-card" data-song-id="${song.id}">
      <div class="card-image">
        <img src="${song.cover || DEFAULT_COVER}" alt="${song.title}" loading="lazy">
        <div class="play-overlay"><i class="fas fa-play"></i></div>
      </div>
      <div class="card-title">${song.title}</div>
      <div class="card-artist">${song.artist}</div>
    </div>
  `).join('');

  els.recentlyPlayed.querySelectorAll('.song-card').forEach(card => {
    card.addEventListener('click', () => {
      const songId = card.dataset.songId;
      const idx = state.playlist.findIndex(s => s.id === songId);
      if (idx !== -1) {
        loadSong(idx);
        playAudio();
        navigateTo('playing');
      }
    });
  });
}

// ============================================
// RENDERING FUNCTIONS
// ============================================
function createSongItemHTML(song, index, showActions = true) {
  const isPlaying = state.isPlaying && state.currentSongIndex === index;
  const liked = isFavorite(song.id);

  return `
    <div class="playlist-item ${isPlaying ? 'playing' : ''}" data-index="${index}" data-song-id="${song.id}">
      <div class="item-image">
        <img src="${song.cover || DEFAULT_COVER}" alt="${song.title}" loading="lazy">
        <div class="playing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="item-info">
        <h4>${song.title}</h4>
        <p>${song.artist}</p>
      </div>
      <span class="item-duration">${song.duration || '--:--'}</span>
      ${showActions ? `
      <div class="item-actions">
        <button class="item-action-btn ${liked ? 'liked' : ''}" data-action="like" data-id="${song.id}">
          <i class="${liked ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <button class="item-action-btn" data-action="play" data-id="${song.id}">
          <i class="fas fa-play"></i>
        </button>
      </div>` : ''}
    </div>
  `;
}

function renderHome() {
  // Render playlist
  els.homePlaylist.innerHTML = state.playlist.map((song, i) => createSongItemHTML(song, i)).join('');

  // Add click handlers
  els.homePlaylist.querySelectorAll('.playlist-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.item-action-btn')) return;
      const idx = parseInt(item.dataset.index);
      loadSong(idx);
      playAudio();
    });
  });

  els.homePlaylist.querySelectorAll('.item-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const songId = btn.dataset.id;
      const song = state.playlist.find(s => s.id === songId);
      if (action === 'like') toggleFavorite(song);
      if (action === 'play') {
        const idx = state.playlist.findIndex(s => s.id === songId);
        if (idx !== -1) { loadSong(idx); playAudio(); }
      }
    });
  });

  renderRecentlyPlayed();
}

function renderFavorites() {
  if (!state.favorites.length) {
    els.favoritesList.innerHTML = '';
    els.favEmpty.style.display = 'flex';
    return;
  }
  els.favEmpty.style.display = 'none';
  els.favoritesList.innerHTML = state.favorites.map((song, i) => createSongItemHTML(song, i)).join('');

  els.favoritesList.querySelectorAll('.playlist-item').forEach(item => {
    item.addEventListener('click', () => {
      const songId = item.dataset.songId;
      const song = state.favorites.find(s => s.id === songId);
      if (song) {
        addToPlaylistIfNeeded(song);
        const idx = state.playlist.findIndex(s => s.id === songId);
        if (idx !== -1) { loadSong(idx); playAudio(); navigateTo('playing'); }
      }
    });
  });
}

function renderPlaylists() {
  const tab = state.currentPlaylistTab;
  let content = '';

  if (tab === 'myplaylists') {
    content = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-list-music"></i></div>
        <h3>No playlists yet</h3>
        <p>Create your first playlist</p>
      </div>
    `;
  } else if (tab === 'liked') {
    if (!state.favorites.length) {
      content = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-heart"></i></div>
          <h3>No liked songs</h3>
          <p>Like songs to add them here</p>
        </div>
      `;
    } else {
      content = state.favorites.map((song, i) => createSongItemHTML(song, i)).join('');
    }
  } else if (tab === 'albums') {
    const albums = {};
    state.playlist.forEach(s => {
      if (!albums[s.album]) albums[s.album] = [];
      albums[s.album].push(s);
    });
    content = Object.entries(albums).map(([album, songs]) => `
      <div class="playlist-item" style="cursor:pointer;">
        <div class="item-image"><img src="${songs[0].cover || DEFAULT_COVER}" alt="${album}"></div>
        <div class="item-info"><h4>${album}</h4><p>${songs.length} songs</p></div>
        <i class="fas fa-chevron-right" style="color:var(--text-muted);"></i>
      </div>
    `).join('');
  }

  els.playlistsContent.innerHTML = content;
}

function renderLocalFiles() {
  if (!state.localFiles.length) {
    els.localList.innerHTML = '';
    els.localEmpty.style.display = 'flex';
    return;
  }
  els.localEmpty.style.display = 'none';
  els.localList.innerHTML = state.localFiles.map((song, i) => createSongItemHTML(song, i)).join('');

  els.localList.querySelectorAll('.playlist-item').forEach(item => {
    item.addEventListener('click', () => {
      const songId = item.dataset.songId;
      const idx = state.playlist.findIndex(s => s.id === songId);
      if (idx !== -1) { loadSong(idx); playAudio(); }
    });
  });
}

function renderDownloads() {
  if (!state.downloadedSongs.length) {
    els.downloadsList.innerHTML = '';
    els.downloadsEmpty.style.display = 'flex';
    return;
  }
  els.downloadsEmpty.style.display = 'none';
  els.downloadsList.innerHTML = state.downloadedSongs.map((song, i) => createSongItemHTML(song, i)).join('');
}

function renderArtists() {
  const artists = {};
  state.playlist.forEach(s => {
    if (!artists[s.artist]) artists[s.artist] = [];
    artists[s.artist].push(s);
  });

  els.artistsList.innerHTML = Object.entries(artists).map(([artist, songs]) => `
    <div class="playlist-item" style="cursor:pointer;">
      <div class="item-image"><img src="${songs[0].cover || DEFAULT_COVER}" alt="${artist}"></div>
      <div class="item-info"><h4>${artist}</h4><p>${songs.length} songs</p></div>
      <i class="fas fa-chevron-right" style="color:var(--text-muted);"></i>
    </div>
  `).join('');
}

function renderAlbums() {
  const albums = {};
  state.playlist.forEach(s => {
    if (!albums[s.album]) albums[s.album] = [];
    albums[s.album].push(s);
  });

  els.albumsGrid.innerHTML = Object.entries(albums).map(([album, songs]) => `
    <div class="result-card" style="cursor:pointer;">
      <div class="result-image"><img src="${songs[0].cover || DEFAULT_COVER}" alt="${album}"></div>
      <div class="result-info"><h4>${album}</h4><p>${songs[0].artist} &bull; ${songs.length} songs</p></div>
    </div>
  `).join('');
}

function addToPlaylistIfNeeded(song) {
  if (!state.playlist.find(s => s.id === song.id)) {
    state.playlist.push(song);
  }
}

// ============================================
// LOCAL FILES (File System Access API)
// ============================================
async function scanLocalMusicFolder() {
  if (!('showDirectoryPicker' in window)) {
    showToast('File System Access not supported. Use "Select Files" instead.', 'error');
    return;
  }

  try {
    const dirHandle = await window.showDirectoryPicker();
    const newFiles = [];
    await scanDirectory(dirHandle, newFiles);

    if (newFiles.length > 0) {
      state.localFiles = [...state.localFiles, ...newFiles];
      setStorage('softtune-local-files', state.localFiles);
      newFiles.forEach(f => { if (!state.playlist.find(s => s.id === f.id)) state.playlist.push(f); });
      showToast(`Found ${newFiles.length} music files`);
      renderLocalFiles();
      renderHome();
    } else {
      showToast('No music files found');
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Scan error:', e);
      showToast('Error scanning folder', 'error');
    }
  }
}

async function scanDirectory(dirHandle, files, path = '') {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'directory') {
      await scanDirectory(entry, files, path + entry.name + '/');
    } else if (entry.kind === 'file' && isMusicFile(entry.name)) {
      files.push({
        id: generateId(),
        title: entry.name.replace(/\.[^.]+$/, ''),
        artist: 'Local File',
        album: 'Local',
        duration: '--:--',
        cover: DEFAULT_COVER,
        src: null,
        source: 'local',
        fileHandle: entry,
        fileName: entry.name
      });
    }
  }
}

async function pickLocalFiles() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.multiple = true;
  input.onchange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = files.map(file => {
      const url = URL.createObjectURL(file);
      return {
        id: generateId(),
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Local File',
        album: 'Local',
        duration: '--:--',
        cover: DEFAULT_COVER,
        src: url,
        source: 'local',
        fileName: file.name,
        blob: file
      };
    });

    state.localFiles = [...state.localFiles, ...newFiles];
    setStorage('softtune-local-files', state.localFiles);
    newFiles.forEach(f => { if (!state.playlist.find(s => s.id === f.id)) state.playlist.push(f); });

    showToast(`Added ${newFiles.length} files`);
    renderLocalFiles();
    renderHome();
  };
  input.click();
}

// ============================================
// SEARCH (Jamendo API)
// ============================================
async function searchMusic(query) {
  if (!query.trim()) { showToast('Enter a search term', 'error'); return; }

  els.searchEmpty.style.display = 'none';
  els.searchResults.style.display = 'grid';
  els.searchResults.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><div class="loading-spinner" style="margin:0 auto 16px;"></div><p style="color:var(--text-muted);">Searching...</p></div>';

  try {
    const res = await fetch(`${JAMENDO_API}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&search=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();

    if (data.results && data.results.length) {
      state.searchResults = data.results.map(track => ({
        id: 'jamendo_' + track.id,
        title: track.name,
        artist: track.artist_name,
        album: track.album_name || 'Unknown',
        duration: formatTime(track.duration),
        cover: track.image || DEFAULT_COVER,
        src: track.audio,
        downloadUrl: track.audiodownload,
        source: 'jamendo'
      }));
      renderSearchResults();
    } else {
      els.searchResults.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><p style="color:var(--text-muted);">No results found</p></div>';
    }
  } catch (err) {
    console.error('Search error:', err);
    els.searchResults.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><p style="color:var(--text-muted);">Search unavailable. Check connection.</p></div>';
    showToast('Search service unavailable', 'error');
  }
}

function renderSearchResults() {
  els.searchResults.innerHTML = state.searchResults.map(song => `
    <div class="result-card" data-song-id="${song.id}">
      <div class="result-image">
        <img src="${song.cover}" alt="${song.title}" loading="lazy">
        <div class="play-btn"><i class="fas fa-play"></i></div>
      </div>
      <div class="result-info">
        <h4>${song.title}</h4>
        <p>${song.artist}</p>
      </div>
    </div>
  `).join('');

  els.searchResults.querySelectorAll('.result-card').forEach(card => {
    card.addEventListener('click', () => {
      const songId = card.dataset.songId;
      const song = state.searchResults.find(s => s.id === songId);
      if (song) {
        addToPlaylistIfNeeded(song);
        const idx = state.playlist.findIndex(s => s.id === songId);
        if (idx !== -1) { loadSong(idx); playAudio(); navigateTo('playing'); }
        showToast(`Playing: ${song.title}`);
      }
    });
  });
}

// ============================================
// DOWNLOAD
// ============================================
function downloadSong(song) {
  const url = song.downloadUrl || song.src;
  if (!url) { showToast('Download not available', 'error'); return; }

  const link = document.createElement('a');
  link.href = url;
  link.download = `${song.title} - ${song.artist}.mp3`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (!state.downloadedSongs.find(s => s.id === song.id)) {
    state.downloadedSongs.push(song);
    setStorage('softtune-downloads', state.downloadedSongs);
    updateLibraryCounts();
  }
  showToast(`Downloading: ${song.title}`);
}

// ============================================
// EQUALIZER & VISUALIZER
// ============================================
function initAudioContext() {
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    state.analyser = state.audioContext.createAnalyser();
    state.analyser.fftSize = 64;
    state.analyser.smoothingTimeConstant = 0.8;

    try {
      state.sourceNode = state.audioContext.createMediaElementSource(els.audio);
      state.sourceNode.connect(state.analyser);
      state.analyser.connect(state.audioContext.destination);
    } catch (e) {
      console.log('Audio context already connected');
    }
  }
}

function startVisualizer() {
  if (!state.analyser) initAudioContext();
  if (state.audioContext && state.audioContext.state === 'suspended') {
    state.audioContext.resume();
  }
  animateVisualizer();
}

function stopVisualizer() {
  if (state.visualizerId) {
    cancelAnimationFrame(state.visualizerId);
    state.visualizerId = null;
  }
  // Reset bars
  els.eqBars.forEach(bar => bar.style.height = '10%');
}

function animateVisualizer() {
  if (!state.analyser || !state.isPlaying) return;

  const dataArray = new Uint8Array(state.analyser.frequencyBinCount);
  state.analyser.getByteFrequencyData(dataArray);

  els.eqBars.forEach((bar, i) => {
    const value = dataArray[i % dataArray.length] || 0;
    const height = Math.max(4, (value / 255) * 100);
    bar.style.height = height + '%';
  });

  state.visualizerId = requestAnimationFrame(animateVisualizer);
}

function updateEQ(freq, value) {
  state.eqValues[freq] = value;
  // Apply EQ using BiquadFilterNode (simplified)
  showToast(`EQ ${freq}Hz: ${value > 0 ? '+' : ''}${value}dB`);
}

// ============================================
// MEDIA SESSION API
// ============================================
function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.setActionHandler('play', playAudio);
  navigator.mediaSession.setActionHandler('pause', pauseAudio);
  navigator.mediaSession.setActionHandler('previoustrack', prevSong);
  navigator.mediaSession.setActionHandler('nexttrack', nextSong);
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    els.audio.currentTime = Math.max(0, els.audio.currentTime - 10);
  });
  navigator.mediaSession.setActionHandler('seekforward', () => {
    els.audio.currentTime = Math.min(els.audio.duration, els.audio.currentTime + 10);
  });
}

function updateMediaSession(state) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = state;
  }
}

// ============================================
// THEME
// ============================================
function toggleDarkMode() {
  state.isDarkMode = !state.isDarkMode;
  document.documentElement.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', state.isDarkMode ? '#1A202C' : '#F0F4F8');
  setStorage('softtune-darkmode', state.isDarkMode);
  showToast(state.isDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
}

function initTheme() {
  const saved = getStorage('softtune-darkmode', false);
  if (saved) {
    state.isDarkMode = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#1A202C');
    els.darkModeToggle.classList.add('active');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
  // Audio events
  els.audio.addEventListener('timeupdate', updateProgress);
  els.audio.addEventListener('loadedmetadata', updateProgress);
  els.audio.addEventListener('ended', () => {
    if (state.repeatMode === 2) { els.audio.currentTime = 0; playAudio(); }
    else if (state.repeatMode === 1 || state.isShuffled) nextSong();
    else if (state.currentSongIndex < state.playlist.length - 1) nextSong();
    else { pauseAudio(); els.audio.currentTime = 0; els.progressFill.style.width = '0%'; }
  });
  els.audio.addEventListener('error', () => {
    showToast('Error loading audio', 'error');
    pauseAudio();
  });

  // Player controls
  els.playPauseBtn.addEventListener('click', togglePlay);
  els.prevBtn.addEventListener('click', prevSong);
  els.nextBtn.addEventListener('click', nextSong);
  els.shuffleBtn.addEventListener('click', toggleShuffle);
  els.repeatBtn.addEventListener('click', toggleRepeat);
  els.likeBtn.addEventListener('click', () => toggleFavorite());
  els.shareBtn.addEventListener('click', () => openShareModal());
  els.downloadBtn.addEventListener('click', () => {
    const song = state.playlist[state.currentSongIndex];
    if (song) downloadSong(song);
  });
  els.eqBtn.addEventListener('click', () => navigateTo('equalizer'));

  // Progress bar
  let isSeeking = false;
  els.progressBar.addEventListener('click', seek);
  els.progressBar.addEventListener('touchstart', () => isSeeking = true);
  els.progressBar.addEventListener('touchend', () => isSeeking = false);

  // Mini player
  els.miniPlayer.addEventListener('click', (e) => {
    if (!e.target.closest('button')) navigateTo('playing');
  });
  els.miniPlayBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
  els.miniNextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextSong(); });

  // Bottom navigation
  els.navItems.forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // Back buttons
  els.backBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo('home'));
  });

  // Search
  els.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMusic(els.searchInput.value);
  });
  els.searchActionBtn.addEventListener('click', () => searchMusic(els.searchInput.value));
  els.trendTags.forEach(tag => {
    tag.addEventListener('click', () => {
      els.searchInput.value = tag.textContent;
      searchMusic(tag.textContent);
    });
  });

  // Playlist tabs
  els.playlistTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      els.playlistTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentPlaylistTab = tab.dataset.tab;
      renderPlaylists();
    });
  });

  // Library items
  $$('.library-item').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      if (nav) navigateTo(nav);
    });
  });

  // Mix cards
  $$('.mix-card').forEach(card => {
    card.addEventListener('click', () => {
      const mix = card.dataset.mix;
      if (mix === 'favorites' && state.favorites.length) {
        state.favorites.forEach(s => addToPlaylistIfNeeded(s));
        const idx = state.playlist.findIndex(s => s.id === state.favorites[0].id);
        if (idx !== -1) { loadSong(idx); playAudio(); navigateTo('playing'); }
      } else if (mix === 'chill') {
        const chill = state.playlist.filter(s => s.album?.toLowerCase().includes('jazz') || s.album?.toLowerCase().includes('folk'));
        if (chill.length) { loadSong(state.playlist.indexOf(chill[0])); playAudio(); navigateTo('playing'); }
      } else if (mix === 'pop') {
        const pop = state.playlist.filter(s => s.album?.toLowerCase() === 'pop');
        if (pop.length) { loadSong(state.playlist.indexOf(pop[0])); playAudio(); navigateTo('playing'); }
      } else if (mix === 'workout') {
        const rock = state.playlist.filter(s => s.album?.toLowerCase() === 'rock');
        if (rock.length) { loadSong(state.playlist.indexOf(rock[0])); playAudio(); navigateTo('playing'); }
      }
    });
  });

  // Settings toggles
  els.toggleSwitches.forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const type = toggle.dataset.toggle;
      if (type === 'darkmode') toggleDarkMode();
    });
  });

  // Local files
  els.scanLocalBtn.addEventListener('click', scanLocalMusicFolder);
  els.pickFilesBtn.addEventListener('click', pickLocalFiles);
  els.scanBtn.addEventListener('click', scanLocalMusicFolder);

  // Equalizer
  els.eqPresets.forEach(preset => {
    preset.addEventListener('click', () => {
      els.eqPresets.forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
      applyEQPreset(preset.dataset.preset);
    });
  });

  els.eqResetBtn.addEventListener('click', () => {
    els.eqPresets.forEach(p => p.classList.remove('active'));
    els.eqPresets[0].classList.add('active');
    applyEQPreset('custom');
    showToast('Equalizer reset');
  });

  // Share modal
  els.copyLinkBtn.addEventListener('click', () => {
    els.shareLink.select();
    navigator.clipboard.writeText(els.shareLink.value).then(() => showToast('Link copied!'));
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch(e.code) {
      case 'Space': e.preventDefault(); togglePlay(); break;
      case 'ArrowLeft': e.preventDefault(); prevSong(); break;
      case 'ArrowRight': e.preventDefault(); nextSong(); break;
      case 'KeyM': e.preventDefault(); toggleFavorite(); break;
      case 'KeyS': e.preventDefault(); toggleShuffle(); break;
      case 'KeyR': e.preventDefault(); toggleRepeat(); break;
    }
  });

  // Service Worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
}

function applyEQPreset(preset) {
  const presets = {
    custom: [0, 0, 0, 0, 0],
    pop: [2, 1, 3, 2, 1],
    rock: [3, 1, 0, 2, 3],
    jazz: [0, 2, 1, 3, 2],
    classical: [0, 0, 0, 1, 2],
    bass: [5, 3, 0, -1, -2]
  };

  const values = presets[preset] || presets.custom;
  const freqs = [60, 230, 910, 3600, 14000];

  els.eqSliders.forEach((slider, i) => {
    const val = values[i];
    state.eqValues[freqs[i]] = val;
    const fill = slider.querySelector('.eq-slider-fill');
    const valueLabel = slider.querySelector('.eq-slider-value');
    fill.style.height = (50 + val * 5) + '%';
    valueLabel.textContent = (val > 0 ? '+' : '') + val;
  });
}

function openShareModal() {
  const song = state.playlist[state.currentSongIndex];
  if (!song) return;

  els.shareCover.src = song.cover || DEFAULT_COVER;
  els.shareTitle.textContent = song.title;
  els.shareArtist.textContent = song.artist;
  els.shareLink.value = `${window.location.origin}?song=${song.id}`;
  els.shareModal.classList.add('active');
}

// ============================================
// PERSISTENCE
// ============================================
function loadPersistedData() {
  state.favorites = getStorage('softtune-favorites', []);
  state.recentlyPlayed = getStorage('softtune-recent', []);
  state.localFiles = getStorage('softtune-local-files', []);
  state.downloadedSongs = getStorage('softtune-downloads', []);

  // Add local files to playlist
  state.localFiles.forEach(f => {
    if (!state.playlist.find(s => s.id === f.id)) state.playlist.push(f);
  });

  // Add downloaded songs to playlist
  state.downloadedSongs.forEach(f => {
    if (!state.playlist.find(s => s.id === f.id)) state.playlist.push(f);
  });
}

// ============================================
// INITIALIZATION
// ============================================
function initApp() {
  loadPersistedData();
  initTheme();
  setupMediaSession();
  initEventListeners();

  // Load first song
  loadSong(0);

  // Initial renders
  renderHome();
  renderRecentlyPlayed();
  updateLibraryCounts();

  // Check URL params for shared songs
  const params = new URLSearchParams(window.location.search);
  const songId = params.get('song');
  if (songId) {
    const idx = state.playlist.findIndex(s => s.id === songId);
    if (idx !== -1) { loadSong(idx); showToast('Shared song loaded'); }
  }

  // Auto-scan for local files on mobile
  if ('showDirectoryPicker' in window && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
    setTimeout(() => {
      showToast('Tip: Tap the folder icon to scan your music!', 'info');
    }, 2000);
  }

  console.log('SoftTune initialized!');
  console.log('Keyboard shortcuts: Space=Play/Pause, Arrows=Prev/Next, M=Like, S=Shuffle, R=Repeat');
}

// Start with splash
initSplash();
