const { Howl, Howler } = window;
const songsContainer = document.getElementById('songs-container');
const shuffleButton = document.getElementById('shuffle-btn');
const previousButton = document.getElementById('prev-btn');
const playPauseButton = document.getElementById('play-pause-btn');
const nextButton = document.getElementById('next-btn');
const repeatButton = document.getElementById('repeat-btn');
const volumeBar = document.getElementById('volume-bar');
const currentCover = document.getElementById('current-cover');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');

let songs = [];
let currentSound = null;
let currentSongIndex = -1;
let shuffleEnabled = false;
let repeatEnabled = false;

function setPlayButton(isPlaying) {
    playPauseButton.textContent = isPlaying ? '❚❚' : '▶';
    playPauseButton.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
}

function getAdjacentSongIndex(direction) {
    if (shuffleEnabled && songs.length > 1) {
        let nextIndex = currentSongIndex;
        while (nextIndex === currentSongIndex) {
            nextIndex = Math.floor(Math.random() * songs.length);
        }
        return nextIndex;
    }

    return (currentSongIndex + direction + songs.length) % songs.length;
}

function playSong(index) {
    const song = songs[index];
    if (!song) return;

    if (currentSound) {
        currentSound.stop();
        currentSound.unload();
    }

    currentSongIndex = index;
    currentCover.src = song.cover;
    currentCover.alt = `Portada de ${song.title}`;
    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;

    currentSound = new Howl({
        src: [song.src],
        html5: true,
        loop: repeatEnabled,
        onplay: () => setPlayButton(true),
        onpause: () => setPlayButton(false),
        onstop: () => setPlayButton(false),
        onend: () => {
            if (!repeatEnabled && songs.length > 1) {
                playSong(getAdjacentSongIndex(1));
            } else {
                setPlayButton(false);
            }
        },
        onloaderror: (_id, error) => console.error(`No se pudo cargar "${song.title}"`, error)
    });

    currentSound.play();
}

async function cargarCanciones() {
    try {
        const response = await fetch('/data/musica.json');

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status} al cargar musica.json`);
        }

        songs = await response.json();
        if (!Array.isArray(songs)) {
            throw new Error('musica.json debe contener una lista de canciones');
        }
        songsContainer.innerHTML = '';

        songs.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-card');
            songElement.dataset.id = song.id;

            const imageContainer = document.createElement('div');
            imageContainer.classList.add('card-image');

            const cover = document.createElement('img');
            cover.src = song.cover;
            cover.alt = `Portada de ${song.title}`;

            const playButton = document.createElement('button');
            playButton.classList.add('play-btn-card');
            playButton.type = 'button';
            playButton.textContent = '▶';
            playButton.setAttribute('aria-label', `Reproducir ${song.title}`);
            playButton.addEventListener('click', () => playSong(index));

            const title = document.createElement('h3');
            title.textContent = song.title;

            const artist = document.createElement('p');
            artist.textContent = song.artist;

            imageContainer.append(cover, playButton);
            songElement.append(imageContainer, title, artist);
            songsContainer.appendChild(songElement);
        });

        if (songs.length === 0) {
            songsContainer.textContent = 'No hay canciones en la lista.';
        }
    } catch (error) {
        console.error('No se pudieron cargar las canciones:', error);
        songsContainer.textContent = 'No se pudieron cargar las canciones.';
    }
}

playPauseButton.addEventListener('click', () => {
    if (!currentSound) {
        playSong(0);
    } else if (currentSound.playing()) {
        currentSound.pause();
    } else {
        currentSound.play();
    }
});

previousButton.addEventListener('click', () => {
    if (songs.length) playSong(getAdjacentSongIndex(-1));
});

nextButton.addEventListener('click', () => {
    if (songs.length) playSong(getAdjacentSongIndex(1));
});

shuffleButton.addEventListener('click', () => {
    shuffleEnabled = !shuffleEnabled;
    shuffleButton.setAttribute('aria-pressed', String(shuffleEnabled));
});

repeatButton.addEventListener('click', () => {
    repeatEnabled = !repeatEnabled;
    repeatButton.setAttribute('aria-pressed', String(repeatEnabled));
    if (currentSound) currentSound.loop(repeatEnabled);
});

volumeBar.addEventListener('input', () => {
    Howler.volume(Number(volumeBar.value) / 100);
});

Howler.volume(Number(volumeBar.value) / 100);
setPlayButton(false);
cargarCanciones();