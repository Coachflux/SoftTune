/* ============================================
   SoftTune - Premium Neumorphism Music Player
   JavaScript Application
   ============================================ */

// ============================================
// DATA & CONFIGURATION
// ============================================

const defaultPlaylist = [
    { id: 1, title: "Dreaming", artist: "Benjamin Tissot", category: "Electronic", duration: "2:58", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-dreaming.mp3", source: "online" },
    { id: 2, title: "Sunny", artist: "Benjamin Tissot", category: "Pop", duration: "2:20", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-sunny.mp3", source: "online" },
    { id: 3, title: "Ukulele", artist: "Benjamin Tissot", category: "Folk", duration: "2:26", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3", source: "online" },
    { id: 4, title: "Creative Minds", artist: "Benjamin Tissot", category: "Electronic", duration: "2:27", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3", source: "online" },
    { id: 5, title: "Happy Rock", artist: "Benjamin Tissot", category: "Rock", duration: "1:58", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-happyrock.mp3", source: "online" },
    { id: 6, title: "Jazz Comedy", artist: "Benjamin Tissot", category: "Jazz", duration: "3:09", cover: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-jazzcomedy.mp3", source: "online" },
    { id: 7, title: "Little Idea", artist: "Benjamin Tissot", category: "Pop", duration: "2:51", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-littleidea.mp3", source: "online" },
    { id: 8, title: "Memories", artist: "Benjamin Tissot", category: "Electronic", duration: "3:50", cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-memories.mp3", source: "online" }
];

const JAMENDO_CLIENT_ID = '8b1f2e5a';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';

// ============================================
// APP STATE
// ============================================

const state = {
    currentSongIndex: 0,
    isPlaying: false,
    isShuffled: false,
    repeatMode: 0,
    volume: 0.8,
    isMuted: false,
    playlist: [...defaultPlaylist],
    favorites: [],
    recentlyPlayed: [],
    localFiles: [],
    downloadedSongs: [],
    queue: [],
    currentFilter: 'all',
    searchResults: [],
    searchType: 'all',
    currentPage: 'home',
    theme: 'light',
    isFullscreenPlayer: false
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    audio: document.getElementById('audioPlayer'),
    albumArtwork: document.getElementById('albumArtwork'),
    albumCover: document.getElementById('albumCover'),
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    trackCategory: document.getElementById('trackCategory'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    playBtn: document.getElementById('playBtn'),
    playIcon: document.getElementById('playIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeSliderContainer: document.getElementById('volumeSliderContainer'),
    volumeFill: document.getElementById('volumeFill'),
    volumeIcon: document.getElementById('volumeIcon'),
    muteBtn: document.getElementById('muteBtn'),
    volumePercentage: document.getElementById('volumePercentage'),
    likeBtn: document.getElementById('likeBtn'),
    shareBtn: document.getElementById('shareBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    queueBtn: document.getElementById('queueBtn'),
    playlistContainer: document.getElementById('playlistContainer'),
    miniCover: document.getElementById('miniCover'),
    miniTitle: document.getElementById('miniTitle'),
    miniArtist: document.getElementById('miniArtist'),
    miniPlayerPreview: document.getElementById('miniPlayerPreview'),
    miniPlayBtn: document.getElementById('miniPlayBtn'),
    miniPlayIcon: document.getElementById('miniPlayIcon'),
    miniPlayIndicator: document.getElementById('miniPlayIndicator'),
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchResults: document.getElementById('searchResults'),
    headerSearch: document.getElementById('headerSearch'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    searchFilters: document.querySelectorAll('.search-filter'),
    themeToggle: document.getElementById('themeToggle'),
    headerThemeBtn: document.getElementById('headerThemeBtn'),
    favoritesContainer: document.getElementById('favoritesContainer'),
    recentContainer: document.getElementById('recentContainer'),
    localContainer: document.getElementById('localContainer'),
    downloadsContainer: document.getElementById('downloadsContainer'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    shareModal: document.getElementById('shareModal'),
    closeShareModal: document.getElementById('closeShareModal'),
    shareCover: document.getElementById('shareCover'),
    shareTitle: document.getElementById('shareTitle'),
    shareArtist: document.getElementById('shareArtist'),
    shareLinkInput: document.getElementById('shareLinkInput'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),
    downloadModal: document.getElementById('downloadModal'),
    closeDownloadModal: document.getElementById('closeDownloadModal'),
    downloadCover: document.getElementById('downloadCover'),
    downloadTitle: document.getElementById('downloadTitle'),
    downloadArtist: document.getElementById('downloadArtist'),
    downloadHighBtn: document.getElementById('downloadHighBtn'),
    downloadStandardBtn: document.getElementById('downloadStandardBtn'),
    queueModal: document.getElementById('queueModal'),
    closeQueueModal: document.getElementById('closeQueueModal'),
    queueList: document.getElementById('queueList'),
    nowPlayingBar: document.getElementById('nowPlayingBar'),
    nowPlayingBarCover: document.getElementById('nowPlayingBarCover'),
    nowPlayingBarTitle: document.getElementById('nowPlayingBarTitle'),
    nowPlayingBarArtist: document.getElementById('nowPlayingBarArtist'),
    barPlayBtn: document.getElementById('barPlayBtn'),
    barPlayIcon: document.getElementById('barPlayIcon'),
    barPrevBtn: document.getElementById('barPrevBtn'),
    barNextBtn: document.getElementById('barNextBtn'),
    fullscreenPlayer: document.getElementById('fullscreenPlayer'),
    fullscreenClose: document.getElementById('fullscreenClose'),
    fullscreenCover: document.getElementById('fullscreenCover'),
    fullscreenBg: document.getElementById('fullscreenBg'),
    fullscreenTitle: document.getElementById('fullscreenTitle'),
    fullscreenArtist: document.getElementById('fullscreenArtist'),
    fullscreenProgressContainer: document.getElementById('fullscreenProgressContainer'),
    fullscreenProgressFill: document.getElementById('fullscreenProgressFill'),
    fullscreenCurrentTime: document.getElementById('fullscreenCurrentTime'),
    fullscreenTotalTime: document.getElementById('fullscreenTotalTime'),
    fsPlayBtn: document.getElementById('fsPlayBtn'),
    fsPlayIcon: document.getElementById('fsPlayIcon'),
    fsPrevBtn: document.getElementById('fsPrevBtn'),
    fsNextBtn: document.getElementById('fsNextBtn'),
    fsShuffleBtn: document.getElementById('fsShuffleBtn'),
    fsRepeatBtn: document.getElementById('fsRepeatBtn'),
    fsLikeBtn: document.getElementById('fsLikeBtn'),
    fsShareBtn: document.getElementById('fsShareBtn'),
    fsDownloadBtn: document.getElementById('fsDownloadBtn'),
    scanLocalBtn: document.getElementById('scanLocalBtn'),
    scanLocalFilesBtn: document.getElementById('scanLocalFilesBtn'),
    pickFilesBtn: document.getElementById('pickFilesBtn'),
    localBadge: document.getElementById('localBadge'),
    downloadsBadge: document.getElementById('downloadsBadge'),
    favoritesMixCount: document.getElementById('favoritesMixCount'),
    likedCount: document.getElementById('likedCount'),
    artistsCount: document.getElementById('artistsCount'),
    albumsCount: document.getElementById('albumsCount')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast show ${type}`;
    setTimeout(() => { elements.toast.classList.remove('show'); }, 3000);
}

function getStorage(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
}

function setStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.warn('localStorage not available'); }
}

function generateShareLink(song) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({ song: song.id, title: song.title, artist: song.artist });
    return `${baseUrl}?${params.toString()}`;
}

function generateId() {
    return 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    const savedTheme = getStorage('softtune-theme', 'light');
    state.theme = savedTheme;
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
    const headerIcon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
    elements.themeToggle.querySelector('.toggle-thumb i').className = `fas ${icon}`;
    elements.headerThemeBtn.innerHTML = `<i class="fas ${headerIcon}"></i>`;
    document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#e0e5ec');
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    setStorage('softtune-theme', state.theme);
    showToast(`Switched to ${state.theme} mode`);
}

// ============================================
// AUDIO PLAYER FUNCTIONS
// ============================================

function loadSong(index) {
    const song = state.playlist[index];
    if (!song) return;
    state.currentSongIndex = index;

    if (song.source === 'local' && song.fileHandle) {
        loadLocalFile(song).then(() => {
            updateUIForSong(song);
        }).catch(() => {
            showToast('Unable to load local file', 'error');
        });
        return;
    }

    elements.audio.src = song.src;
    elements.audio.load();
    updateUIForSong(song);
}

function updateUIForSong(song) {
    elements.albumCover.src = song.cover;
    elements.trackTitle.textContent = song.title;
    elements.trackArtist.textContent = song.artist;
    elements.trackCategory.textContent = song.category || 'Unknown';
    elements.miniCover.src = song.cover;
    elements.miniTitle.textContent = song.title;
    elements.miniArtist.textContent = song.artist;
    elements.nowPlayingBarCover.src = song.cover;
    elements.nowPlayingBarTitle.textContent = song.title;
    elements.nowPlayingBarArtist.textContent = song.artist;
    elements.fullscreenCover.src = song.cover;
    elements.fullscreenBg.style.backgroundImage = `url(${song.cover})`;
    elements.fullscreenTitle.textContent = song.title;
    elements.fullscreenArtist.textContent = song.artist;
    updateLikeButton();
    renderPlaylist();
    addToRecentlyPlayed(song);
    updateQueue();
}

async function loadLocalFile(song) {
    if (!song.fileHandle) return;
    try {
        const file = await song.fileHandle.getFile();
        const url = URL.createObjectURL(file);
        elements.audio.src = url;
        elements.audio.load();
    } catch (e) {
        console.error('Error loading local file:', e);
        throw e;
    }
}

function playSong() {
    state.isPlaying = true;
    elements.playIcon.classList.remove('fa-play');
    elements.playIcon.classList.add('fa-pause');
    elements.albumArtwork.classList.add('playing');
    elements.miniPlayIcon.classList.remove('fa-play');
    elements.miniPlayIcon.classList.add('fa-pause');
    elements.miniPlayIndicator.classList.add('active');
    elements.barPlayIcon.classList.remove('fa-play');
    elements.barPlayIcon.classList.add('fa-pause');
    elements.fsPlayIcon.classList.remove('fa-play');
    elements.fsPlayIcon.classList.add('fa-pause');
    elements.nowPlayingBar.classList.add('active');
    elements.audio.play().catch(err => {
        console.error('Play error:', err);
        showToast('Unable to play this track', 'error');
        pauseSong();
    });
}

function pauseSong() {
    state.isPlaying = false;
    elements.playIcon.classList.remove('fa-pause');
    elements.playIcon.classList.add('fa-play');
    elements.albumArtwork.classList.remove('playing');
    elements.miniPlayIcon.classList.remove('fa-pause');
    elements.miniPlayIcon.classList.add('fa-play');
    elements.miniPlayIndicator.classList.remove('active');
    elements.barPlayIcon.classList.remove('fa-pause');
    elements.barPlayIcon.classList.add('fa-play');
    elements.fsPlayIcon.classList.remove('fa-pause');
    elements.fsPlayIcon.classList.add('fa-play');
    elements.audio.pause();
}

function togglePlay() {
    state.isPlaying ? pauseSong() : playSong();
}

function nextSong() {
    let nextIndex;
    if (state.isShuffled) {
        do { nextIndex = Math.floor(Math.random() * state.playlist.length); }
        while (nextIndex === state.currentSongIndex && state.playlist.length > 1);
    } else {
        nextIndex = (state.currentSongIndex + 1) % state.playlist.length;
    }
    loadSong(nextIndex);
    playSong();
}

function prevSong() {
    let prevIndex;
    if (state.isShuffled) {
        do { prevIndex = Math.floor(Math.random() * state.playlist.length); }
        while (prevIndex === state.currentSongIndex && state.playlist.length > 1);
    } else {
        prevIndex = (state.currentSongIndex - 1 + state.playlist.length) % state.playlist.length;
    }
    loadSong(prevIndex);
    playSong();
}

function toggleShuffle() {
    state.isShuffled = !state.isShuffled;
    elements.shuffleBtn.classList.toggle('active', state.isShuffled);
    elements.fsShuffleBtn.classList.toggle('active', state.isShuffled);
    showToast(state.isShuffled ? 'Shuffle enabled' : 'Shuffle disabled');
}

function toggleRepeat() {
    state.repeatMode = (state.repeatMode + 1) % 3;
    elements.repeatBtn.classList.remove('active');
    elements.fsRepeatBtn.classList.remove('active');
    elements.repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
    elements.fsRepeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
    if (state.repeatMode === 1) {
        elements.repeatBtn.classList.add('active');
        elements.fsRepeatBtn.classList.add('active');
        showToast('Repeat all enabled');
    } else if (state.repeatMode === 2) {
        elements.repeatBtn.classList.add('active');
        elements.fsRepeatBtn.classList.add('active');
        elements.repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';
        elements.fsRepeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';
        showToast('Repeat one enabled');
    } else {
        showToast('Repeat disabled');
    }
}

// ============================================
// PROGRESS & VOLUME
// ============================================

function updateProgress() {
    const { currentTime: current, duration } = elements.audio;
    if (duration && isFinite(duration)) {
        const percent = (current / duration) * 100;
        elements.progressFill.style.width = `${percent}%`;
        elements.fullscreenProgressFill.style.width = `${percent}%`;
        elements.currentTime.textContent = formatTime(current);
        elements.totalTime.textContent = formatTime(duration);
        elements.fullscreenCurrentTime.textContent = formatTime(current);
        elements.fullscreenTotalTime.textContent = formatTime(duration);
    }
}

function seek(e, container) {
    container = container || elements.progressContainer;
    const rect = container.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (elements.audio.duration && isFinite(elements.audio.duration)) {
        elements.audio.currentTime = percent * elements.audio.duration;
    }
}

function setVolume(percent) {
    state.volume = Math.max(0, Math.min(1, percent));
    elements.audio.volume = state.volume;
    elements.volumeFill.style.width = `${state.volume * 100}%`;
    elements.volumePercentage.textContent = `${Math.round(state.volume * 100)}%`;
    updateVolumeIcon();
    if (state.volume > 0 && state.isMuted) {
        state.isMuted = false;
        elements.audio.muted = false;
    }
}

function updateVolumeIcon() {
    const vol = state.isMuted ? 0 : state.volume;
    let iconClass = 'fa-volume-high';
    if (vol === 0) iconClass = 'fa-volume-xmark';
    else if (vol < 0.5) iconClass = 'fa-volume-low';
    elements.volumeIcon.className = `fas ${iconClass}`;
}

function toggleMute() {
    state.isMuted = !state.isMuted;
    elements.audio.muted = state.isMuted;
    updateVolumeIcon();
    showToast(state.isMuted ? 'Muted' : 'Unmuted');
}

function handleVolumeChange(e) {
    const rect = elements.volumeSlider.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(percent);
}

// ============================================
// FAVORITES SYSTEM
// ============================================

function initFavorites() {
    state.favorites = getStorage('softtune-favorites', []);
    updateLibraryCounts();
}

function isFavorite(songId) {
    return state.favorites.some(fav => fav.id === songId);
}

function toggleFavorite(song) {
    const targetSong = song || state.playlist[state.currentSongIndex];
    if (!targetSong) return;
    const index = state.favorites.findIndex(fav => fav.id === targetSong.id);
    if (index === -1) {
        state.favorites.push({ ...targetSong });
        showToast('Added to favorites');
    } else {
        state.favorites.splice(index, 1);
        showToast('Removed from favorites');
    }
    setStorage('softtune-favorites', state.favorites);
    updateLikeButton();
    renderFavorites();
    renderPlaylist();
    updateLibraryCounts();
    updateMixCounts();
}

function updateLikeButton() {
    const currentSong = state.playlist[state.currentSongIndex];
    if (!currentSong) return;
    const isLiked = isFavorite(currentSong.id);
    elements.likeBtn.classList.toggle('liked', isLiked);
    elements.likeBtn.innerHTML = isLiked ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    elements.fsLikeBtn.classList.toggle('liked', isLiked);
    elements.fsLikeBtn.innerHTML = isLiked ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
}

function updateLibraryCounts() {
    elements.likedCount.textContent = `${state.favorites.length} songs`;
    const uniqueArtists = new Set(state.playlist.map(s => s.artist));
    elements.artistsCount.textContent = `${uniqueArtists.size} artists`;
    const uniqueAlbums = new Set(state.playlist.map(s => s.album || s.title));
    elements.albumsCount.textContent = `${uniqueAlbums.size} albums`;
}

function updateMixCounts() {
    elements.favoritesMixCount.textContent = `${state.favorites.length} songs`;
}

// ============================================
// RECENTLY PLAYED
// ============================================

function initRecentlyPlayed() {
    state.recentlyPlayed = getStorage('softtune-recent', []);
}

function addToRecentlyPlayed(song) {
    state.recentlyPlayed = state.recentlyPlayed.filter(item => item.id !== song.id);
    state.recentlyPlayed.unshift({ ...song, playedAt: new Date().toISOString() });
    if (state.recentlyPlayed.length > 50) state.recentlyPlayed = state.recentlyPlayed.slice(0, 50);
    setStorage('softtune-recent', state.recentlyPlayed);
    renderRecentlyPlayed();
}

// ============================================
// LOCAL FILES (File System Access API)
// ============================================

function initLocalFiles() {
    state.localFiles = getStorage('softtune-local-files', []);
    updateLocalBadge();
}

async function scanLocalMusicFolder() {
    if (!('showDirectoryPicker' in window)) {
        showToast('File System Access API not supported. Use "Select Files" instead.', 'error');
        return;
    }
    try {
        const dirHandle = await window.showDirectoryPicker({ startIn: 'music' });
        const newFiles = [];
        await scanDirectory(dirHandle, newFiles);

        if (newFiles.length > 0) {
            state.localFiles = [...state.localFiles, ...newFiles];
            setStorage('softtune-local-files', state.localFiles);
            newFiles.forEach(file => {
                if (!state.playlist.find(s => s.id === file.id)) {
                    state.playlist.push(file);
                }
            });
            updateLocalBadge();
            renderLocalFiles();
            renderPlaylist();
            showToast(`Found ${newFiles.length} music files`);
        } else {
            showToast('No music files found in folder');
        }
    } catch (e) {
        if (e.name !== 'AbortError') {
            console.error('Scan error:', e);
            showToast('Error scanning folder', 'error');
        }
    }
}

async function scanDirectory(dirHandle, files, path) {
    path = path || '';
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'directory') {
            await scanDirectory(entry, files, path + entry.name + '/');
        } else if (entry.kind === 'file' && isMusicFile(entry.name)) {
            const song = {
                id: generateId(),
                title: entry.name.replace(/\.[^.]+$/, ''),
                artist: 'Local File',
                category: 'Local',
                duration: '--:--',
                cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
                src: null,
                source: 'local',
                fileHandle: entry,
                fileName: entry.name,
                path: path + entry.name
            };
            files.push(song);
        }
    }
}

function isMusicFile(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext);
}

async function pickLocalFiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = async function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newFiles = [];
        for (const file of files) {
            const url = URL.createObjectURL(file);
            const song = {
                id: generateId(),
                title: file.name.replace(/\.[^.]+$/, ''),
                artist: 'Local File',
                category: 'Local',
                duration: '--:--',
                cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
                src: url,
                source: 'local',
                fileName: file.name,
                blob: file
            };
            newFiles.push(song);
        }

        state.localFiles = [...state.localFiles, ...newFiles];
        setStorage('softtune-local-files', state.localFiles);
        newFiles.forEach(file => {
            if (!state.playlist.find(s => s.id === file.id)) {
                state.playlist.push(file);
            }
        });
        updateLocalBadge();
        renderLocalFiles();
        renderPlaylist();
        showToast(`Added ${newFiles.length} files`);
    };
    input.click();
}

function updateLocalBadge() {
    elements.localBadge.textContent = state.localFiles.length;
    elements.localBadge.style.display = state.localFiles.length > 0 ? 'block' : 'none';
}

function renderLocalFiles() {
    if (state.localFiles.length === 0) {
        elements.localContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-folder-music"></i></div>
                <p>No local music found</p>
                <span>Scan your device or select files to add music</span>
            </div>`;
        return;
    }

    elements.localContainer.innerHTML = state.localFiles.map(song => `
        <div class="playlist-item" data-local-id="${song.id}">
            <div class="song-image">
                <img src="${song.cover}" alt="${song.title}" loading="lazy">
                <div class="song-playing-indicator"><i class="fas fa-music"></i></div>
            </div>
            <div class="song-details">
                <p class="song-title">${song.title}</p>
                <p class="song-artist">${song.artist}</p>
            </div>
            <span class="song-duration">${song.duration}</span>
            <div class="song-actions">
                <button class="song-action-btn ${isFavorite(song.id) ? 'liked' : ''}" data-action="like-local" data-id="${song.id}">
                    <i class="${isFavorite(song.id) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="song-action-btn" data-action="play-local" data-id="${song.id}"><i class="fas fa-play"></i></button>
                <button class="song-action-btn" data-action="remove-local" data-id="${song.id}"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('[data-local-id]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.song-action-btn')) return;
            const songId = item.dataset.localId;
            const song = state.localFiles.find(s => s.id === songId);
            if (song) {
                const idx = state.playlist.findIndex(s => s.id === songId);
                if (idx !== -1) {
                    loadSong(idx);
                    playSong();
                    navigateToPage('home');
                }
            }
        });
    });

    document.querySelectorAll('[data-action="like-local"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const song = state.localFiles.find(s => s.id === btn.dataset.id);
            if (song) toggleFavorite(song);
        });
    });

    document.querySelectorAll('[data-action="play-local"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const song = state.localFiles.find(s => s.id === btn.dataset.id);
            if (song) {
                const idx = state.playlist.findIndex(s => s.id === song.id);
                if (idx !== -1) {
                    loadSong(idx);
                    playSong();
                    navigateToPage('home');
                }
            }
        });
    });

    document.querySelectorAll('[data-action="remove-local"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const songId = btn.dataset.id;
            state.localFiles = state.localFiles.filter(s => s.id !== songId);
            state.playlist = state.playlist.filter(s => s.id !== songId);
            setStorage('softtune-local-files', state.localFiles);
            updateLocalBadge();
            renderLocalFiles();
            renderPlaylist();
            showToast('File removed');
        });
    });
}

// ============================================
// DOWNLOADS
// ============================================

function initDownloads() {
    state.downloadedSongs = getStorage('softtune-downloads', []);
    updateDownloadsBadge();
}

function updateDownloadsBadge() {
    elements.downloadsBadge.textContent = state.downloadedSongs.length;
    elements.downloadsBadge.style.display = state.downloadedSongs.length > 0 ? 'block' : 'none';
}

function renderDownloads() {
    if (state.downloadedSongs.length === 0) {
        elements.downloadsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-download"></i></div>
                <p>No downloads yet</p>
                <span>Search and download music to listen offline</span>
            </div>`;
        return;
    }

    elements.downloadsContainer.innerHTML = state.downloadedSongs.map(song => `
        <div class="playlist-item" data-download-id="${song.id}">
            <div class="song-image">
                <img src="${song.cover}" alt="${song.title}" loading="lazy">
                <div class="song-playing-indicator"><i class="fas fa-music"></i></div>
            </div>
            <div class="song-details">
                <p class="song-title">${song.title}</p>
                <p class="song-artist">${song.artist}</p>
            </div>
            <span class="song-duration">${song.duration || '--:--'}</span>
            <div class="song-actions">
                <button class="song-action-btn ${isFavorite(song.id) ? 'liked' : ''}" data-action="like-download" data-id="${song.id}">
                    <i class="${isFavorite(song.id) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="song-action-btn" data-action="play-download" data-id="${song.id}"><i class="fas fa-play"></i></button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('[data-download-id]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.song-action-btn')) return;
            const song = state.downloadedSongs.find(s => s.id === item.dataset.downloadId);
            if (song) {
                addToPlaylistIfNeeded(song);
                const idx = state.playlist.findIndex(s => s.id === song.id);
                if (idx !== -1) {
                    loadSong(idx);
                    playSong();
                    navigateToPage('home');
                }
            }
        });
    });

    document.querySelectorAll('[data-action="like-download"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const song = state.downloadedSongs.find(s => s.id === btn.dataset.id);
            if (song) toggleFavorite(song);
        });
    });

    document.querySelectorAll('[data-action="play-download"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const song = state.downloadedSongs.find(s => s.id === btn.dataset.id);
            if (song) {
                addToPlaylistIfNeeded(song);
                const idx = state.playlist.findIndex(s => s.id === song.id);
                if (idx !== -1) {
                    loadSong(idx);
                    playSong();
                    navigateToPage('home');
                }
            }
        });
    });
}

// ============================================
// PLAYLIST RENDERING
// ============================================

function renderPlaylist() {
    let filtered = state.playlist;
    if (state.currentFilter !== 'all') {
        if (state.currentFilter === 'local') {
            filtered = state.playlist.filter(song => song.source === 'local');
        } else {
            filtered = state.playlist.filter(song => song.category.toLowerCase() === state.currentFilter);
        }
    }

    if (filtered.length === 0) {
        elements.playlistContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 60px 20px;">
                <div class="empty-state-icon"><i class="fas fa-music"></i></div>
                <p>No songs found</p>
                <span>Try a different filter or add some music</span>
            </div>`;
        return;
    }

    elements.playlistContainer.innerHTML = filtered.map((song) => {
        const realIndex = state.playlist.indexOf(song);
        const isActive = state.currentSongIndex === realIndex;
        const liked = isFavorite(song.id);
        return `
            <div class="playlist-item ${isActive ? 'active' : ''}" data-index="${realIndex}">
                <div class="song-image">
                    <img src="${song.cover}" alt="${song.title}" loading="lazy">
                    <div class="song-playing-indicator"><i class="fas fa-music"></i></div>
                </div>
                <div class="song-details">
                    <p class="song-title">${song.title}</p>
                    <p class="song-artist">${song.artist}</p>
                </div>
                <span class="song-duration">${song.duration || '--:--'}</span>
                <div class="song-actions">
                    <button class="song-action-btn ${liked ? 'liked' : ''}" data-action="like" data-id="${song.id}">
                        <i class="${liked ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="song-action-btn" data-action="share" data-id="${song.id}">
                        <i class="fas fa-share-nodes"></i>
                    </button>
                    <button class="song-action-btn" data-action="add-queue" data-id="${song.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>`;
    }).join('');

    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.song-action-btn')) return;
            const idx = parseInt(item.dataset.index);
            if (!isNaN(idx) && idx >= 0 && idx < state.playlist.length) {
                loadSong(idx);
                playSong();
            }
        });
    });

    document.querySelectorAll('.song-action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = btn.dataset.action;
            const songId = btn.dataset.id;
            const song = state.playlist.find(s => s.id == songId) || 
                         state.searchResults.find(s => s.id == songId) ||
                         state.localFiles.find(s => s.id == songId);
            if (!song) return;
            if (action === 'like') toggleFavorite(song);
            else if (action === 'share') openShareModal(song);
            else if (action === 'add-queue') addToQueue(song);
        });
    });
}

function renderFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesContainer.innerHTML = `
            <div class="empty-state"><div class="empty-state-icon"><i class="fas fa-heart"></i></div><p>No favorites yet</p><span>Like songs to add them here</span></div>`;
        return;
    }
    elements.favoritesContainer.innerHTML = `<div class="playlist-container">${state.favorites.map(song => `
        <div class="playlist-item" data-fav-id="${song.id}">
            <div class="song-image"><img src="${song.cover}" alt="${song.title}" loading="lazy"><div class="song-playing-indicator"><i class="fas fa-music"></i></div></div>
            <div class="song-details"><p class="song-title">${song.title}</p><p class="song-artist">${song.artist}</p></div>
            <span class="song-duration">${song.duration || '--:--'}</span>
            <div class="song-actions">
                <button class="song-action-btn liked" data-action="unlike" data-id="${song.id}"><i class="fas fa-heart"></i></button>
                <button class="song-action-btn" data-action="play-fav" data-id="${song.id}"><i class="fas fa-play"></i></button>
            </div>
        </div>`).join('')}</div>`;

    document.querySelectorAll('[data-fav-id]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.song-action-btn')) return;
            const songId = item.dataset.favId;
            const song = state.favorites.find(s => s.id === songId);
            if (song) { addToPlaylistIfNeeded(song); const idx = state.playlist.findIndex(s => s.id === songId); if (idx !== -1) { loadSong(idx); playSong(); navigateToPage('home'); } }
        });
    });

    document.querySelectorAll('[data-action="unlike"]').forEach(btn => {
        btn.addEventListener('click', function(e) { e.stopPropagation(); const song = state.favorites.find(s => s.id === btn.dataset.id); if (song) toggleFavorite(song); });
    });

    document.querySelectorAll('[data-action="play-fav"]').forEach(btn => {
        btn.addEventListener('click', function(e) { e.stopPropagation(); const song = state.favorites.find(s => s.id === btn.dataset.id); if (song) { addToPlaylistIfNeeded(song); const idx = state.playlist.findIndex(s => s.id === song.id); if (idx !== -1) { loadSong(idx); playSong(); navigateToPage('home'); } } });
    });
}

function renderRecentlyPlayed() {
    if (state.recentlyPlayed.length === 0) {
        elements.recentContainer.innerHTML = `
            <div class="empty-state"><div class="empty-state-icon"><i class="fas fa-clock-rotate-left"></i></div><p>No recently played songs</p><span>Start listening to build your history</span></div>`;
        return;
    }
    elements.recentContainer.innerHTML = `<div class="playlist-container">${state.recentlyPlayed.map(song => `
        <div class="playlist-item" data-recent-id="${song.id}">
            <div class="song-image"><img src="${song.cover}" alt="${song.title}" loading="lazy"><div class="song-playing-indicator"><i class="fas fa-music"></i></div></div>
            <div class="song-details"><p class="song-title">${song.title}</p><p class="song-artist">${song.artist}</p></div>
            <span class="song-duration">${song.duration || '--:--'}</span>
            <div class="song-actions">
                <button class="song-action-btn ${isFavorite(song.id) ? 'liked' : ''}" data-action="like-recent" data-id="${song.id}"><i class="${isFavorite(song.id) ? 'fas' : 'far'} fa-heart"></i></button>
                <button class="song-action-btn" data-action="play-recent" data-id="${song.id}"><i class="fas fa-play"></i></button>
            </div>
        </div>`).join('')}</div>`;

    document.querySelectorAll('[data-recent-id]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.song-action-btn')) return;
            const song = state.recentlyPlayed.find(s => s.id === item.dataset.recentId);
            if (song) { addToPlaylistIfNeeded(song); const idx = state.playlist.findIndex(s => s.id === song.id); if (idx !== -1) { loadSong(idx); playSong(); navigateToPage('home'); } }
        });
    });

    document.querySelectorAll('[data-action="like-recent"]').forEach(btn => {
        btn.addEventListener('click', function(e) { e.stopPropagation(); const song = state.recentlyPlayed.find(s => s.id === btn.dataset.id); if (song) toggleFavorite(song); });
    });

    document.querySelectorAll('[data-action="play-recent"]').forEach(btn => {
        btn.addEventListener('click', function(e) { e.stopPropagation(); const song = state.recentlyPlayed.find(s => s.id === btn.dataset.id); if (song) { addToPlaylistIfNeeded(song); const idx = state.playlist.findIndex(s => s.id === song.id); if (idx !== -1) { loadSong(idx); playSong(); navigateToPage('home'); } } });
    });
}

function addToPlaylistIfNeeded(song) {
    if (!state.playlist.find(s => s.id === song.id)) state.playlist.push(song);
}

// ============================================
// QUEUE SYSTEM
// ============================================

function addToQueue(song) {
    state.queue.push(song);
    showToast(`Added "${song.title}" to queue`);
    updateQueue();
}

function removeFromQueue(index) {
    state.queue.splice(index, 1);
    updateQueue();
}

function updateQueue() {
    if (state.queue.length === 0) {
        elements.queueList.innerHTML = '<div class="empty-state" style="padding: 40px 20px;"><p>Queue is empty</p></div>';
        return;
    }
    elements.queueList.innerHTML = state.queue.map((song, idx) => `
        <div class="queue-item ${song.id === state.playlist[state.currentSongIndex]?.id ? 'active' : ''}">
            <img src="${song.cover}" alt="${song.title}">
            <div class="queue-item-info">
                <p class="queue-item-title">${song.title}</p>
                <p class="queue-item-artist">${song.artist}</p>
            </div>
            <button class="queue-item-remove" data-queue-index="${idx}"><i class="fas fa-xmark"></i></button>
        </div>
    `).join('');

    document.querySelectorAll('.queue-item-remove').forEach(btn => {
        btn.addEventListener('click', function() { removeFromQueue(parseInt(btn.dataset.queueIndex)); });
    });
}

function openQueueModal() {
    updateQueue();
    elements.queueModal.classList.add('active');
}

// ============================================
// SEARCH & DISCOVERY (Jamendo API)
// ============================================

async function searchMusic(query) {
    if (!query.trim()) { showToast('Please enter a search term', 'error'); return; }
    elements.searchResults.innerHTML = `<div class="search-loading"><div class="spinner"></div><p>Searching for music...</p></div>`;
    try {
        const response = await fetch(`${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&search=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            state.searchResults = data.results.map(track => ({
                id: `jamendo_${track.id}`,
                title: track.name,
                artist: track.artist_name,
                album: track.album_name,
                category: track.musicinfo?.tags?.genres?.[0] || 'Unknown',
                duration: formatTime(track.duration),
                durationSeconds: track.duration,
                cover: track.image || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop`,
                src: track.audio,
                downloadUrl: track.audiodownload,
                source: 'jamendo',
                shareUrl: track.shareurl
            }));
            renderSearchResults();
        } else {
            elements.searchResults.innerHTML = `<div class="search-placeholder"><div class="search-placeholder-icon"><i class="fas fa-search"></i></div><p>No results found</p><span>Try a different search term</span></div>`;
        }
    } catch (error) {
        console.error('Search error:', error);
        elements.searchResults.innerHTML = `<div class="search-placeholder"><div class="search-placeholder-icon"><i class="fas fa-triangle-exclamation"></i></div><p>Search unavailable</p><span>Please check your internet connection</span></div>`;
        showToast('Search service temporarily unavailable', 'error');
    }
}

function renderSearchResults() {
    if (state.searchResults.length === 0) return;
    elements.searchResults.innerHTML = `<div class="search-results-grid">${state.searchResults.map(song => `
        <div class="search-result-card" data-search-id="${song.id}">
            <div class="result-image">
                <img src="${song.cover}" alt="${song.title}" loading="lazy">
                <div class="result-play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <p class="result-title">${song.title}</p>
            <p class="result-artist">${song.artist}</p>
            <div class="result-actions">
                <button class="result-action-btn primary" data-action="play-search" data-id="${song.id}"><i class="fas fa-play"></i> Play</button>
                <button class="result-action-btn" data-action="download-search" data-id="${song.id}"><i class="fas fa-download"></i></button>
                <button class="result-action-btn" data-action="share-search" data-id="${song.id}"><i class="fas fa-share-nodes"></i></button>
            </div>
        </div>`).join('')}</div>`;

    document.querySelectorAll('[data-action="play-search"]').forEach(btn => {
        btn.addEventListener('click', function(e) { e.stopPropagation(); const song = state.searchResults.find(s => s.id === btn.dataset.id); if (song) playSearchResult(song); });
    });
    document.querySelectorAll('[data-action="download-search"]').forEach(btn => {
        btn.addEventListener('click', function(e) { e.stopPropagation(); const song = state.searchResults.find(s => s.id === btn.dataset.id); if (song) downloadSong(song); });
    });
    document.querySelectorAll('[data-action="share-search"]').forEach(btn => {
        btn.addEventListener('click', function(e) { e.stopPropagation(); const song = state.searchResults.find(s => s.id === btn.dataset.id); if (song) openShareModal(song); });
    });
    document.querySelectorAll('[data-search-id]').forEach(card => {
        card.addEventListener('click', function(e) { if (e.target.closest('.result-action-btn')) return; const song = state.searchResults.find(s => s.id === card.dataset.searchId); if (song) playSearchResult(song); });
    });
}

function playSearchResult(song) {
    const existingIndex = state.playlist.findIndex(s => s.id === song.id);
    if (existingIndex === -1) { 
        state.playlist.push(song); 
        loadSong(state.playlist.length - 1); 
    } else { 
        loadSong(existingIndex); 
    }
    playSong();
    navigateToPage('home');
    showToast(`Now playing: ${song.title}`);
}

function downloadSong(song) {
    const url = song.downloadUrl || song.src;
    if (url) {
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
            updateDownloadsBadge();
        }
        showToast(`Downloading: ${song.title}`);
    } else {
        showToast('Download link not available', 'error');
    }
}

// ============================================
// SHARE MODAL
// ============================================

function openShareModal(song) {
    const targetSong = song || state.playlist[state.currentSongIndex];
    if (!targetSong) return;
    elements.shareCover.src = targetSong.cover;
    elements.shareTitle.textContent = targetSong.title;
    elements.shareArtist.textContent = targetSong.artist;
    elements.shareLinkInput.value = generateShareLink(targetSong);
    elements.shareModal.classList.add('active');
}

function closeShareModalFn() {
    elements.shareModal.classList.remove('active');
}

function copyShareLink() {
    elements.shareLinkInput.select();
    navigator.clipboard.writeText(elements.shareLinkInput.value).then(() => showToast('Link copied to clipboard!')).catch(() => { document.execCommand('copy'); showToast('Link copied to clipboard!'); });
}

function shareOnSocial(platform) {
    const song = state.playlist[state.currentSongIndex];
    if (!song) return;
    const url = encodeURIComponent(generateShareLink(song));
    const text = encodeURIComponent(`Check out "${song.title}" by ${song.artist} on SoftTune!`);
    let shareUrl = '';
    switch (platform) {
        case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`; break;
        case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
        case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
        case 'telegram': shareUrl = `https://t.me/share/url?url=${url}&text=${text}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
}

// ============================================
// DOWNLOAD MODAL
// ============================================

function openDownloadModal() {
    const song = state.playlist[state.currentSongIndex];
    if (!song) return;
    elements.downloadCover.src = song.cover;
    elements.downloadTitle.textContent = song.title;
    elements.downloadArtist.textContent = song.artist;
    elements.downloadModal.classList.add('active');
}

function closeDownloadModalFn() {
    elements.downloadModal.classList.remove('active');
}

function downloadHighQuality() {
    const song = state.playlist[state.currentSongIndex];
    if (song) { downloadSong(song); closeDownloadModalFn(); }
}

function downloadStandardQuality() {
    const song = state.playlist[state.currentSongIndex];
    if (song) { downloadSong(song); closeDownloadModalFn(); }
}

// ============================================
// FULLSCREEN PLAYER
// ============================================

function openFullscreenPlayer() {
    const currentSong = state.playlist[state.currentSongIndex];
    if (!currentSong) return;
    state.isFullscreenPlayer = true;
    elements.fullscreenPlayer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullscreenPlayer() {
    state.isFullscreenPlayer = false;
    elements.fullscreenPlayer.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// NAVIGATION
// ============================================

function navigateToPage(pageName) {
    state.currentPage = pageName;
    elements.navItems.forEach(item => item.classList.toggle('active', item.dataset.page === pageName));
    elements.pages.forEach(page => page.classList.toggle('active', page.id === pageName + 'Page'));
    if (window.innerWidth <= 1024) elements.sidebar.classList.remove('open');
    if (pageName === 'favorites') renderFavorites();
    if (pageName === 'recent') renderRecentlyPlayed();
    if (pageName === 'local') renderLocalFiles();
    if (pageName === 'downloads') renderDownloads();
    if (pageName === 'library') updateLibraryCounts();
}

function toggleSidebar() {
    elements.sidebar.classList.toggle('open');
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); prevSong(); break;
        case 'ArrowRight': e.preventDefault(); nextSong(); break;
        case 'ArrowUp': e.preventDefault(); setVolume(state.volume + 0.05); break;
        case 'ArrowDown': e.preventDefault(); setVolume(state.volume - 0.05); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
        case 'KeyL': e.preventDefault(); toggleFavorite(); break;
        case 'KeyS': e.preventDefault(); toggleShuffle(); break;
        case 'KeyR': e.preventDefault(); toggleRepeat(); break;
        case 'KeyF': e.preventDefault(); openFullscreenPlayer(); break;
        case 'Escape': if (state.isFullscreenPlayer) closeFullscreenPlayer(); break;
    }
}

// ============================================
// FILTER FUNCTIONS
// ============================================

function setPlaylistFilter(filter) {
    state.currentFilter = filter;
    elements.filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
    renderPlaylist();
}

function setSearchType(type) {
    state.searchType = type;
    elements.searchFilters.forEach(btn => btn.classList.toggle('active', btn.dataset.type === type));
}

// ============================================
// URL PARAMETERS (SHARED LINKS)
// ============================================

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const songId = params.get('song');
    if (songId) {
        const song = state.playlist.find(s => s.id == songId);
        if (song) { loadSong(state.playlist.indexOf(song)); showToast(`Shared song: ${song.title}`); }
    }
}

// ============================================
// MIX CARDS
// ============================================

function initMixCards() {
    document.querySelectorAll('.mix-card').forEach(card => {
        card.addEventListener('click', function() {
            const mix = card.dataset.mix;
            if (mix === 'favorites') {
                if (state.favorites.length > 0) {
                    state.favorites.forEach(song => addToPlaylistIfNeeded(song));
                    const idx = state.playlist.findIndex(s => s.id === state.favorites[0].id);
                    if (idx !== -1) { loadSong(idx); playSong(); }
                } else {
                    showToast('No favorites yet', 'error');
                }
            } else if (mix === 'chill') {
                const chillSongs = state.playlist.filter(s => s.category.toLowerCase().includes('chill') || s.category.toLowerCase().includes('jazz') || s.category.toLowerCase().includes('folk'));
                if (chillSongs.length > 0) {
                    const idx = state.playlist.indexOf(chillSongs[0]);
                    if (idx !== -1) { loadSong(idx); playSong(); }
                }
            } else if (mix === 'pop') {
                const popSongs = state.playlist.filter(s => s.category.toLowerCase() === 'pop');
                if (popSongs.length > 0) {
                    const idx = state.playlist.indexOf(popSongs[0]);
                    if (idx !== -1) { loadSong(idx); playSong(); }
                }
            }
        });
    });
}

// ============================================
// LIBRARY CATEGORIES
// ============================================

function initLibraryCategories() {
    document.querySelectorAll('.library-category').forEach(cat => {
        cat.addEventListener('click', function() {
            const category = cat.dataset.category;
            if (category === 'liked') navigateToPage('favorites');
            else if (category === 'artists') showToast('Artists view coming soon!');
            else if (category === 'albums') showToast('Albums view coming soon!');
            else if (category === 'playlists') showToast('Custom playlists coming soon!');
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Audio events
    elements.audio.addEventListener('timeupdate', updateProgress);
    elements.audio.addEventListener('ended', function() {
        if (state.repeatMode === 2) { elements.audio.currentTime = 0; playSong(); }
        else if (state.repeatMode === 1 || state.isShuffled) nextSong();
        else if (state.currentSongIndex < state.playlist.length - 1) nextSong();
        else { pauseSong(); elements.audio.currentTime = 0; elements.progressFill.style.width = '0%'; }
    });
    elements.audio.addEventListener('loadedmetadata', updateProgress);
    elements.audio.addEventListener('error', function(e) {
        console.error('Audio error:', e);
        showToast('Error loading audio. Try another song.', 'error');
        pauseSong();
    });

    // Playback controls
    elements.playBtn.addEventListener('click', togglePlay);
    elements.prevBtn.addEventListener('click', prevSong);
    elements.nextBtn.addEventListener('click', nextSong);
    elements.shuffleBtn.addEventListener('click', toggleShuffle);
    elements.repeatBtn.addEventListener('click', toggleRepeat);

    // Fullscreen player controls
    elements.fsPlayBtn.addEventListener('click', togglePlay);
    elements.fsPrevBtn.addEventListener('click', prevSong);
    elements.fsNextBtn.addEventListener('click', nextSong);
    elements.fsShuffleBtn.addEventListener('click', toggleShuffle);
    elements.fsRepeatBtn.addEventListener('click', toggleRepeat);
    elements.fsLikeBtn.addEventListener('click', function() { toggleFavorite(); });
    elements.fsShareBtn.addEventListener('click', function() { openShareModal(); });
    elements.fsDownloadBtn.addEventListener('click', openDownloadModal);
    elements.fullscreenClose.addEventListener('click', closeFullscreenPlayer);

    // Progress bar
    let isSeeking = false;
    elements.progressContainer.addEventListener('click', function(e) { seek(e); });
    elements.progressContainer.addEventListener('mousedown', function() { isSeeking = true; });
    document.addEventListener('mouseup', function() { isSeeking = false; });
    document.addEventListener('mousemove', function(e) { if (isSeeking) seek(e); });

    // Fullscreen progress
    elements.fullscreenProgressContainer.addEventListener('click', function(e) { seek(e, elements.fullscreenProgressContainer); });

    // Volume
    let isVolumeDragging = false;
    elements.volumeSlider.addEventListener('click', handleVolumeChange);
    elements.volumeSlider.addEventListener('mousedown', function() { isVolumeDragging = true; });
    document.addEventListener('mouseup', function() { isVolumeDragging = false; });
    document.addEventListener('mousemove', function(e) { if (isVolumeDragging) handleVolumeChange(e); });
    elements.muteBtn.addEventListener('click', toggleMute);

    // Actions
    elements.likeBtn.addEventListener('click', function() { toggleFavorite(); });
    elements.shareBtn.addEventListener('click', function() { openShareModal(); });
    elements.downloadBtn.addEventListener('click', openDownloadModal);
    elements.queueBtn.addEventListener('click', openQueueModal);

    // Navigation
    elements.navItems.forEach(function(item) {
        item.addEventListener('click', function(e) { e.preventDefault(); navigateToPage(item.dataset.page); });
    });
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    elements.mobileMenuBtn.addEventListener('click', toggleSidebar);
    elements.miniPlayerPreview.addEventListener('click', function() { navigateToPage('home'); });
    elements.miniPlayBtn.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });

    // Now Playing Bar
    elements.barPlayBtn.addEventListener('click', togglePlay);
    elements.barPrevBtn.addEventListener('click', prevSong);
    elements.barNextBtn.addEventListener('click', nextSong);
    elements.nowPlayingBar.addEventListener('click', function(e) {
        if (!e.target.closest('.now-playing-btn')) openFullscreenPlayer();
    });

    // Search
    elements.searchBtn.addEventListener('click', function() { searchMusic(elements.searchInput.value); });
    elements.searchInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') searchMusic(elements.searchInput.value); });
    elements.headerSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { 
            elements.searchInput.value = elements.headerSearch.value; 
            navigateToPage('search'); 
            searchMusic(elements.headerSearch.value); 
        }
    });

    // Filters
    elements.filterBtns.forEach(function(btn) { 
        btn.addEventListener('click', function() { setPlaylistFilter(btn.dataset.filter); }); 
    });
    elements.searchFilters.forEach(function(btn) { 
        btn.addEventListener('click', function() { setSearchType(btn.dataset.type); }); 
    });

    // Theme
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.headerThemeBtn.addEventListener('click', toggleTheme);

    // Modals
    elements.closeShareModal.addEventListener('click', closeShareModalFn);
    elements.copyLinkBtn.addEventListener('click', copyShareLink);
    elements.closeDownloadModal.addEventListener('click', closeDownloadModalFn);
    elements.closeQueueModal.addEventListener('click', function() { elements.queueModal.classList.remove('active'); });
    elements.downloadHighBtn.addEventListener('click', downloadHighQuality);
    elements.downloadStandardBtn.addEventListener('click', downloadStandardQuality);

    // Social sharing
    document.querySelectorAll('.share-social-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { shareOnSocial(btn.dataset.platform); });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function() { 
            document.querySelectorAll('.modal').forEach(function(modal) { modal.classList.remove('active'); }); 
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024 && !elements.sidebar.contains(e.target) && !elements.sidebarToggle.contains(e.target) && !elements.mobileMenuBtn.contains(e.target) && elements.sidebar.classList.contains('open')) {
            elements.sidebar.classList.remove('open');
        }
    });

    // Local files
    elements.scanLocalBtn.addEventListener('click', scanLocalMusicFolder);
    elements.scanLocalFilesBtn.addEventListener('click', scanLocalMusicFolder);
    elements.pickFilesBtn.addEventListener('click', pickLocalFiles);

    // Mix cards
    initMixCards();

    // Library
    initLibraryCategories();
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initTheme();
    initFavorites();
    initRecentlyPlayed();
    initLocalFiles();
    initDownloads();
    setVolume(0.8);
    elements.audio.volume = 0.8;
    loadSong(0);
    renderPlaylist();
    renderFavorites();
    renderRecentlyPlayed();
    renderLocalFiles();
    renderDownloads();
    updateLibraryCounts();
    updateMixCounts();
    initEventListeners();
    checkUrlParams();
    setTimeout(function() { showToast('Welcome to SoftTune! Press Space to play'); }, 1000);
    console.log('SoftTune initialized!');
    console.log('Shortcuts: Space=Play/Pause, Arrows=Prev/Next/Volume, M=Mute, L=Like, S=Shuffle, R=Repeat, F=Fullscreen');
}

document.addEventListener('DOMContentLoaded', init);
