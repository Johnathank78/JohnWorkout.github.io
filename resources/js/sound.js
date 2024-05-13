const beepPath = './resources/sounds/beep.mp3';
const beep2x3Path = './resources/sounds/beep2x3.mp3';

var beepPlayer = false;
var beep2x3Player = false;

function constructPlayer(url, interval, volume = false){
    volume = muted ? 0 : !volume && !audio_lv ? 0.5 : audio_lv;
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioCtx.createGain();
    
    let times = 1;
    gainNode.gain.value = volume;

    function setTimes(newTimes) {
        times = newTimes;
    };

    function setVolume(newVolume) {
        gainNode.gain.value = newVolume;
    };

    function suspendAudioContext() {
        if (audioCtx.state === 'running') {
            audioCtx.suspend();
        };
    };

    function resumeAudioContext() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        };
    };

    function loadSound(url, callback) {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            audioCtx.decodeAudioData(request.response, function(buffer) {
                callback(buffer);
            }, function(error) {
                console.error('decodeAudioData error', error);
            });
        };

        request.onerror = function() {
            console.error('Error loading sound file');
        };

        request.send();
    };

    function playSound(buffer) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        source.start();
    };

    return {
        setVolume,
        setTimes,
        play: function() {
            loadSound(url, function(buffer) {
                playSound(buffer);
                let count = 0;
                const intervalId = setInterval(function() {
                    if (count >= times - 1) {
                        clearInterval(intervalId);
                    }else{
                        count++;
                        playSound(buffer);
                    }
                }, interval);
            });
        },
        suspendAudioContext,
        resumeAudioContext
    };
};

function playBeep(player, times){
    player.setTimes(times);
    player.play();
};