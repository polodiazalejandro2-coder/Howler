const { Howl, Howler } = require('howler');

const shuffleButton = document.getElementById('shuffle-btn');
const previousButton = document.getElementById('prev-btn');
const playPauseButton = document.getElementById('play-pause-btn');
const nextButton = document.getElementById('next-btn');
const repeatButton = document.getElementById('repeat-btn');
const cardPlayButtons = document.querySelectorAll('.play-btn-card');

async function cargarCanciones() {
    try {
        const response = await fetch('/data/musica.json');

        if (!response.ok) {
            throw new Error('No se pudo crackear nada pe causa');
        }

        const songs = await response.json();

        songsContainer.innerHTML = '';

        songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-card');

            songElement.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            `;

            songsContainer.appendChild(songElement);
        });
    } catch (error) {
        console.error('No se pudo crackear nada pe causa', error);
    }
}

var sound = new Howl({
    src: ['assets/audio/sound1.mp3', 'assets/audio/sound2.mp3'],
    sprite: {
        track01: [0, 20000],
        track02: [21000, 41000]
    }
});

getElementById('play-pause-btn').addEventListener('click', function () {
    if (sound.playing()) {
        sound.pause();
    } else {
        sound.play('track01');
        sound.play('track02');
    }
});

sound.volume(0.5);