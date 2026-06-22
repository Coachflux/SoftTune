/* ============================================
   SoftTune - Premium Neumorphism Music Player
   JavaScript Application
   ============================================ */

// ============================================
// DATA & CONFIGURATION
// ============================================

const defaultPlaylist = [
    { id: 1, title: "Dreaming", artist: "Benjamin Tissot", category: "Electronic", duration: "2:58", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-dreaming.mp3", source: "local" },
    { id: 2, title: "Sunny", artist: "Benjamin Tissot", category: "Pop", duration: "2:20", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-sunny.mp3", source: "local" },
    { id: 3, title: "Ukulele", artist: "Benjamin Tissot", category: "Folk", duration: "2:26", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3", source: "local" },
    { id: 4, title: "Creative Minds", artist: "Benjamin Tissot", category: "Electronic", duration: "2:27", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3", source: "local" },
    { id: 5, title: "Happy Rock", artist: "Benjamin Tissot", category: "Rock", duration: "1:58", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-happyrock.mp3", source: "local" },
    { id: 6, title: "Jazz Comedy", artist: "Benjamin Tissot", category: "Jazz", duration: "3:09", cover: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-jazzcomedy.mp3", source: "local" },
    { id: 7, title: "Little Idea", artist: "Benjamin Tissot", category: "Pop", duration: "2:51", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-littleidea.mp3", source: "local" },
    { id: 8, title: "Memories", artist: "Benjamin Tissot", category: "Electronic", duration: "3:50", cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop", src: "https://www.bensound.com/bensound-music/bensound-memories.mp3", source: "local" }
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
    repeatMode: 0, // 0: off, 1: repeat all, 2: repeat one
    volume: 0.8,
    isMuted: false,
    playlist: [...defaultPlaylist],
    favorites: [],
    recentlyPlayed: [],
    currentFilter: 'all',
    searchResults: [],
    searchType: 'all',
    currentPage: 'home',
    theme: 'light'
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
    volumeFill: document.getElementById('volumeFill'),
    volumeIcon: document.getElementById('volumeIcon'),
    muteBtn: document.getElementById('muteBtn'),
    volumePercentage: document.getElementById('volumePercentage'),
    likeBtn: document.getElementById('likeBtn'),
    shareBtn: document.getElementById('shareBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    playlistContainer: document.getElementById('playlistContainer'),
    miniCover: document.getElementById('miniCover'),
    miniTitle: document.getElementById('miniTitle'),
    miniArtist: document.getElementById('miniArtist'),
    miniPlayerPreview: document.getElementById('miniPlayerPreview'),
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
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
    downloadStandardBtn: document.getElementById('downloadStandardBtn')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
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
    elements.themeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
    elements.headerThemeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
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
    elements.audio.src = song.src;
    elements.audio.load();
    elements.albumCover.src = song.cover;
    elements.trackTitle.textContent = song.title;
    elements.trackArtist.textContent = song.artist;
    elements.trackCategory.textContent = song.category;
    elements.miniCover.src = song.cover;
    elements.miniTitle.textContent = song.title;
    elements.miniArtist.textContent = song.artist;
    updateLikeButton();
    renderPlaylist();
    addToRecentlyPlayed(song);
}

function playSong() {
    state.isPlaying = true;
    elements.playIcon.classList.remove('fa-play');
    elements.playIcon.classList.add('fa-pause');
    elements.albumArtwork.classList.add('playing');
    elements.audio.play().catch(() => {
        showToast('Unable to play this track', 'error');
        pauseSong();
    });
}

function pauseSong() {
    state.isPlaying = false;
    elements.playIcon.classList.remove('fa-pause');
    elements.playIcon.classList.add('fa-play');
    elements.albumArtwork.classList.remove('playing');
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
    showToast(state.isShuffled ? 'Shuffle enabled' : 'Shuffle disabled');
}

function toggleRepeat() {
    state.repeatMode = (state.repeatMode + 1) % 3;
    elements.repeatBtn.classList.remove('active');
    elements.repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
    if (state.repeatMode === 1) {
        elements.repeatBtn.classList.add('active');
        showToast('Repeat all enabled');
    } else if (state.repeatMode === 2) {
        elements.repeatBtn.classList.add('active');
        elements.repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';
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
    if (duration) {
        const percent = (current / duration) * 100;
        elements.progressFill.style.width = `${percent}%`;
        elements.currentTime.textContent = formatTime(current);
        elements.totalTime.textContent = formatTime(duration);
    }
}

function seek(e) {
    const rect = elements.progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    elements.audio.currentTime = percent * elements.audio.duration;
}

function setVolume(percent) {
    state.volume = Math.max(0, Math.min(1, percent));
    elements.audio.volume = state.volume;
    elements.volumeFill.style.width = `${state.volume * 100}%`;
    elements.volumePercentage.textContent = `${Math.round(state.volume * 100)}%`;
    updateVolumeIcon();
    if (state.volume > 0 && state.isMuted) state.isMuted = false;
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
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(percent);
}

// ============================================
// FAVORITES SYSTEM
// ============================================

function initFavorites() {
    state.favorites = getStorage('softtune-favorites', []);
}

function isFavorite(songId) {
    return state.favorites.some(fav => fav.id === songId);
}

function toggleFavorite(song) {
    const targetSong = song || state.playlist[state.currentSongIndex];
    const index = state.favorites.findIndex(fav => fav.id === targetSong.id);
    if (index === -1) {
        state.favorites.push(targetSong);
        showToast('Added to favorites');
    } else {
        state.favorites.splice(index, 1);
        showToast('Removed from favorites');
    }
    setStorage('softtune-favorites', state.favorites);
    updateLikeButton();
    renderFavorites();
    renderPlaylist();
}

function updateLikeButton() {
    const currentSong = state.playlist[state.currentSongIndex];
    if (!currentSong) return;
    const isLiked = isFavorite(currentSong.id);
    elements.likeBtn.classList.toggle('liked', isLiked);
    elements.likeBtn.innerHTML = isLiked ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
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
// PLAYLIST RENDERING
// ============================================

function renderPlaylist() {
    const filtered = state.currentFilter === 'all'
        ? state.playlist
        : state.playlist.filter(song => song.category.toLowerCase() === state.currentFilter);

    elements.playlistContainer.innerHTML = filtered.map((song, idx) => {
        const realIndex = state.playlist.indexOf(song);
        const isActive = state.currentSongIndex === realIndex;
        const liked = isFavorite(song.id);
        return `
            <div class="playlist-item ${isActive ? 'active' : ''}" data-index="${realIndex}">
                <div class="song-image"><img src="${song.cover}" alt="${song.title}" loading="lazy"></div>
                <div class="song-details">
                    <p class="song-title">${song.title}</p>
                    <p class="song-artist">${song.artist}</p>
                </div>
                <span class="song-duration">${song.duration}</span>
                <div class="song-actions">
                    <button class="song-action-btn ${liked ? 'liked' : ''}" data-action="like" data-id="${song.id}">
                        <i class="${liked ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="song-action-btn" data-action="share" data-id="${song.id}">
                        <i class="fas fa-share-nodes"></i>
                    </button>
                </div>
            </div>`;
    }).join('');

    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', e => {
            if (e.target.closest('.song-action-btn')) return;
            loadSong(parseInt(item.dataset.index));
            playSong();
        });
    });

    document.querySelectorAll('.song-action-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const songId = parseInt(btn.dataset.id);
            const song = state.playlist.find(s => s.id === songId);
            if (action === 'like') toggleFavorite(song);
            else if (action === 'share') openShareModal(song);
        });
    });
}

function renderFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesContainer.innerHTML = `
            <div class="empty-state"><i class="fas fa-heart"></i><p>No favorites yet</p><span>Like songs to add them here</span></div>`;
        return;
    }
    elements.favoritesContainer.innerHTML = `<div class="playlist-container">${state.favorites.map(song => `
        <div class="playlist-item" data-fav-id="${song.id}">
            <div class="song-image"><img src="${song.cover}" alt="${song.title}" loading="lazy"></div>
            <div class="song-details"><p class="song-title">${song.title}</p><p class="song-artist">${song.artist}</p></div>
            <span class="song-duration">${song.duration || '--:--'}</span>
            <div class="song-actions">
                <button class="song-action-btn liked" data-action="unlike" data-id="${song.id}"><i class="fas fa-heart"></i></button>
                <button class="song-action-btn" data-action="play-fav" data-id="${song.id}"><i class="fas fa-play"></i></button>
            </div>
        </div>`).join('')}</div>`;

    document.querySelectorAll('[data-fav-id]').forEach(item => {
        item.addEventListener('click', e => {
            if (e.target.closest('.song-action-btn')) return;
            const songId = parseInt(item.dataset.favId);
            const song = state.favorites.find(s => s.id === songId);
            if (song) { addToPlaylistIfNeeded(song); loadSong(state.playlist.findIndex(s => s.id === songId)); playSong(); navigateToPage('home'); }
        });
    });

    document.querySelectorAll('[data-action="unlike"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); const song = state.favorites.find(s => s.id === parseInt(btn.dataset.id)); if (song) toggleFavorite(song); });
    });

    document.querySelectorAll('[data-action="play-fav"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); const song = state.favorites.find(s => s.id === parseInt(btn.dataset.id)); if (song) { addToPlaylistIfNeeded(song); loadSong(state.playlist.findIndex(s => s.id === song.id)); playSong(); navigateToPage('home'); } });
    });
}

function renderRecentlyPlayed() {
    if (state.recentlyPlayed.length === 0) {
        elements.recentContainer.innerHTML = `
            <div class="empty-state"><i class="fas fa-clock-rotate-left"></i><p>No recently played songs</p><span>Start listening to build your history</span></div>`;
        return;
    }
    elements.recentContainer.innerHTML = `<div class="playlist-container">${state.recentlyPlayed.map(song => `
        <div class="playlist-item" data-recent-id="${song.id}">
            <div class="song-image"><img src="${song.cover}" alt="${song.title}" loading="lazy"></div>
            <div class="song-details"><p class="song-title">${song.title}</p><p class="song-artist">${song.artist}</p></div>
            <span class="song-duration">${song.duration || '--:--'}</span>
            <div class="song-actions">
                <button class="song-action-btn ${isFavorite(song.id) ? 'liked' : ''}" data-action="like-recent" data-id="${song.id}"><i class="${isFavorite(song.id) ? 'fas' : 'far'} fa-heart"></i></button>
                <button class="song-action-btn" data-action="play-recent" data-id="${song.id}"><i class="fas fa-play"></i></button>
            </div>
        </div>`).join('')}</div>`;

    document.querySelectorAll('[data-recent-id]').forEach(item => {
        item.addEventListener('click', e => {
            if (e.target.closest('.song-action-btn')) return;
            const song = state.recentlyPlayed.find(s => s.id === parseInt(item.dataset.recentId));
            if (song) { addToPlaylistIfNeeded(song); loadSong(state.playlist.findIndex(s => s.id === song.id)); playSong(); navigateToPage('home'); }
        });
    });

    document.querySelectorAll('[data-action="like-recent"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); const song = state.recentlyPlayed.find(s => s.id === parseInt(btn.dataset.id)); if (song) toggleFavorite(song); });
    });

    document.querySelectorAll('[data-action="play-recent"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); const song = state.recentlyPlayed.find(s => s.id === parseInt(btn.dataset.id)); if (song) { addToPlaylistIfNeeded(song); loadSong(state.playlist.findIndex(s => s.id === song.id)); playSong(); navigateToPage('home'); } });
    });
}

function addToPlaylistIfNeeded(song) {
    if (!state.playlist.find(s => s.id === song.id)) state.playlist.push(song);
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
                category: track.musicinfo?.tags?.[0] || 'Unknown',
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
            elements.searchResults.innerHTML = `<div class="search-placeholder"><i class="fas fa-search"></i><p>No results found</p><span>Try a different search term</span></div>`;
        }
    } catch (error) {
        console.error('Search error:', error);
        elements.searchResults.innerHTML = `<div class="search-placeholder"><i class="fas fa-triangle-exclamation"></i><p>Search unavailable</p><span>Please check your internet connection</span></div>`;
        showToast('Search service temporarily unavailable', 'error');
    }
}

function renderSearchResults() {
    if (state.searchResults.length === 0) return;
    elements.searchResults.innerHTML = `<div class="search-results-grid">${state.searchResults.map(song => `
        <div class="search-result-card" data-search-id="${song.id}">
            <div class="result-image"><img src="${song.cover}" alt="${song.title}" loading="lazy"></div>
            <p class="result-title">${song.title}</p>
            <p class="result-artist">${song.artist}</p>
            <div class="result-actions">
                <button class="result-action-btn primary" data-action="play-search" data-id="${song.id}"><i class="fas fa-play"></i> Play</button>
                <button class="result-action-btn" data-action="preview-search" data-id="${song.id}"><i class="fas fa-headphones"></i> Preview</button>
                <button class="result-action-btn" data-action="download-search" data-id="${song.id}"><i class="fas fa-download"></i></button>
                <button class="result-action-btn" data-action="share-search" data-id="${song.id}"><i class="fas fa-share-nodes"></i></button>
            </div>
        </div>`).join('')}</div>`;

    document.querySelectorAll('[data-action="play-search"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); const song = state.searchResults.find(s => s.id === btn.dataset.id); if (song) playSearchResult(song); });
    });
    document.querySelectorAll('[data-action="preview-search"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); const song = state.searchResults.find(s => s.id === btn.dataset.id); if (song) previewSearchResult(song); });
    });
    document.querySelectorAll('[data-action="download-search"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); const song = state.searchResults.find(s => s.id === btn.dataset.id); if (song) downloadSong(song); });
    });
    document.querySelectorAll('[data-action="share-search"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); const song = state.searchResults.find(s => s.id === btn.dataset.id); if (song) openShareModal(song); });
    });
    document.querySelectorAll('[data-search-id]').forEach(card => {
        card.addEventListener('click', e => { if (e.target.closest('.result-action-btn')) return; const song = state.searchResults.find(s => s.id === card.dataset.searchId); if (song) playSearchResult(song); });
    });
}

function playSearchResult(song) {
    const existingIndex = state.playlist.findIndex(s => s.id === song.id);
    if (existingIndex === -1) { state.playlist.push(song); loadSong(state.playlist.length - 1); }
    else { loadSong(existingIndex); }
    playSong();
    navigateToPage('home');
    showToast(`Now playing: ${song.title}`);
}

function previewSearchResult(song) {
    const wasPlaying = state.isPlaying;
    const prevIndex = state.currentSongIndex;
    elements.audio.src = song.src;
    elements.audio.play().then(() => {
        showToast(`Previewing: ${song.title}`);
        setTimeout(() => {
            if (elements.audio.src === song.src) {
                elements.audio.pause();
                if (wasPlaying) { loadSong(prevIndex); playSong(); }
            }
        }, 30000);
    }).catch(() => { showToast('Preview unavailable', 'error'); });
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
// NAVIGATION
// ============================================

function navigateToPage(pageName) {
    state.currentPage = pageName;
    elements.navItems.forEach(item => item.classList.toggle('active', item.dataset.page === pageName));
    elements.pages.forEach(page => page.classList.toggle('active', page.id === `${pageName}Page`));
    if (window.innerWidth <= 1024) elements.sidebar.classList.remove('open');
    if (pageName === 'favorites') renderFavorites();
    if (pageName === 'recent') renderRecentlyPlayed();
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
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Audio events
    elements.audio.addEventListener('timeupdate', updateProgress);
    elements.audio.addEventListener('ended', () => {
        if (state.repeatMode === 2) { elements.audio.currentTime = 0; playSong(); }
        else if (state.repeatMode === 1 || state.isShuffled) nextSong();
        else if (state.currentSongIndex < state.playlist.length - 1) nextSong();
        else { pauseSong(); elements.audio.currentTime = 0; elements.progressFill.style.width = '0%'; }
    });
    elements.audio.addEventListener('loadedmetadata', updateProgress);

    // Playback controls
    elements.playBtn.addEventListener('click', togglePlay);
    elements.prevBtn.addEventListener('click', prevSong);
    elements.nextBtn.addEventListener('click', nextSong);
    elements.shuffleBtn.addEventListener('click', toggleShuffle);
    elements.repeatBtn.addEventListener('click', toggleRepeat);

    // Progress bar
    let isSeeking = false;
    elements.progressContainer.addEventListener('click', seek);
    elements.progressContainer.addEventListener('mousedown', () => isSeeking = true);
    document.addEventListener('mouseup', () => isSeeking = false);
    document.addEventListener('mousemove', e => { if (isSeeking) seek(e); });

    // Volume
    let isVolumeDragging = false;
    elements.volumeSlider.addEventListener('click', handleVolumeChange);
    elements.volumeSlider.addEventListener('mousedown', () => isVolumeDragging = true);
    document.addEventListener('mouseup', () => isVolumeDragging = false);
    document.addEventListener('mousemove', e => { if (isVolumeDragging) handleVolumeChange(e); });
    elements.muteBtn.addEventListener('click', toggleMute);

    // Actions
    elements.likeBtn.addEventListener('click', () => toggleFavorite());
    elements.shareBtn.addEventListener('click', () => openShareModal());
    elements.downloadBtn.addEventListener('click', openDownloadModal);

    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', e => { e.preventDefault(); navigateToPage(item.dataset.page); });
    });
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    elements.miniPlayerPreview.addEventListener('click', () => navigateToPage('home'));

    // Search
    elements.searchBtn.addEventListener('click', () => searchMusic(elements.searchInput.value));
    elements.searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchMusic(elements.searchInput.value); });
    elements.headerSearch.addEventListener('keypress', e => {
        if (e.key === 'Enter') { elements.searchInput.value = elements.headerSearch.value; navigateToPage('search'); searchMusic(elements.headerSearch.value); }
    });

    // Filters
    elements.filterBtns.forEach(btn => btn.addEventListener('click', () => setPlaylistFilter(btn.dataset.filter)));
    elements.searchFilters.forEach(btn => btn.addEventListener('click', () => setSearchType(btn.dataset.type)));

    // Theme
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.headerThemeBtn.addEventListener('click', toggleTheme);

    // Modals
    elements.closeShareModal.addEventListener('click', closeShareModalFn);
    elements.copyLinkBtn.addEventListener('click', copyShareLink);
    elements.closeDownloadModal.addEventListener('click', closeDownloadModalFn);
    elements.downloadHighBtn.addEventListener('click', downloadHighQuality);
    elements.downloadStandardBtn.addEventListener('click', downloadStandardQuality);

    // Social sharing
    document.querySelectorAll('.share-social-btn').forEach(btn => {
        btn.addEventListener('click', () => shareOnSocial(btn.dataset.platform));
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active')));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', e => {
        if (window.innerWidth <= 1024 && !elements.sidebar.contains(e.target) && !elements.sidebarToggle.contains(e.target) && elements.sidebar.classList.contains('open')) {
            elements.sidebar.classList.remove('open');
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initTheme();
    initFavorites();
    initRecentlyPlayed();
    setVolume(0.8);
    elements.audio.volume = 0.8;
    loadSong(0);
    renderPlaylist();
    renderFavorites();
    renderRecentlyPlayed();
    initEventListeners();
    checkUrlParams();
    setTimeout(() => showToast('Welcome to SoftTune! Press Space to play'), 1000);
    console.log('SoftTune initialized!');
    console.log('Shortcuts: Space=Play/Pause, Arrows=Prev/Next/Volume, M=Mute, L=Like, S=Shuffle, R=Repeat');
}

document.addEventListener('DOMContentLoaded', init);
