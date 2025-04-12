const beepPath = './resources/sounds/beep.mp3';
const beep2x3Path = './resources/sounds/beep2x3.mp3';

var beepPlayer = false;
var beep2x3Player = false;

function constructPlayer(url, interval, volume = false) {
    volume = muted ? 0 : (!volume && !audio_lv ? 0.5 : audio_lv);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioCtx.destination);

    let times = 1;
    let audioBuffer = null;
    let isBufferLoaded = false;

    // Préchargement
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        audioCtx.decodeAudioData(request.response, function (buffer) {
            audioBuffer = buffer;
            isBufferLoaded = true;
        }, function (error) {
            console.error('decodeAudioData error', error);
        });
    };

    request.onerror = function () {
        console.error('Error loading sound file');
    };

    request.send();

    function playSound(buffer) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNode);
        source.start();
    }

    return {
        setVolume(newVolume) {
            gainNode.gain.value = newVolume;
        },
        setTimes(newTimes) {
            times = newTimes;
        },
        suspendAudioContext() {
            if (audioCtx.state === 'running') {
                audioCtx.suspend().catch((e) => console.warn('suspend error', e));
            }
        },
        async resumeAudioContext() {
            if (audioCtx.state === 'suspended') {
                try {
                    await audioCtx.resume();
                } catch (e) {
                    console.warn('resume error', e);
                }
            }
        },
        isContextValid() {
            return audioCtx && audioCtx.state !== 'closed';
        },
        close() {
            try {
                audioCtx.close();
            } catch (e) {
                console.warn('close error', e);
            }
        },
        play() {
            if (!isBufferLoaded) {
                console.warn('Audio buffer not ready yet');
                return;
            }

            playSound(audioBuffer);
            let count = 0;
            const intervalId = setInterval(() => {
                if (count >= times - 1) {
                    clearInterval(intervalId);
                } else {
                    count++;
                    playSound(audioBuffer);
                }
            }, interval);
        }
    };
};

function playBeep(player, times){
    player.setTimes(times);
    player.play();
};