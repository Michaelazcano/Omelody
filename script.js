// Get video elements
const video1 = document.getElementById('user1-video');
const video2 = document.getElementById('user2-video');

// Get elements for user 2 visual feedback
const user2Container = document.querySelector('.user2');
let user2Label = null;
let user2Record = null;
if (user2Container) {
    user2Label = user2Container.querySelector('.label');
    user2Record = user2Container.querySelector('.vinyl-record');
} else {
    console.error("User 2 container not found for audio feedback setup.");
}

// Audio analysis variables
let audioContext;
let analyser;
let dataArray;
let source;
let rafId; // requestAnimationFrame ID

const AUDIO_THRESHOLD = 20; // Adjust this value based on mic sensitivity and environment

// --- Audio Analysis Setup ---
function setupAudioAnalysis(stream) {
    if (!user2Label || !user2Record) {
        console.error("Cannot setup audio analysis: User 2 elements not found.");
        return;
    }
    if (!stream.getAudioTracks().length) {
        console.warn("No audio track found in the stream. Cannot setup audio analysis.");
        return;
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Smaller FFT size for faster analysis
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    // We don't connect analyser to destination, so you don't hear your own voice echo

    console.log("Audio analysis setup complete for User 2.");
    checkAudioLevel(); // Start the analysis loop
}

// --- Audio Level Check Loop ---
function checkAudioLevel() {
    if (!analyser || !user2Label || !user2Record) {
        console.warn("Audio analysis stopped: elements or analyser missing.");
        return; // Stop if elements are missing
    }

    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    let average = sum / dataArray.length;

    // Apply/remove classes based on threshold
    if (average > AUDIO_THRESHOLD) {
        user2Label.classList.add('talking');
        user2Record.classList.add('spinning');
    } else {
        user2Label.classList.remove('talking');
        user2Record.classList.remove('spinning');
    }

    rafId = requestAnimationFrame(checkAudioLevel); // Continue the loop
}

// --- Stop Audio Analysis ---
function stopAudioAnalysis() {
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    if (source) {
        source.disconnect();
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
    console.log("Audio analysis stopped.");
}

// --- Webcam Access Logic ---
async function startWebcams() {
    try {
        // Request access to the user's local webcam AND microphone
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Request audio

        // Assign the local stream to the smaller video element (user 2)
        if (video2) {
            video2.srcObject = localStream;
            // Mute local video playback to prevent feedback loop if audio was connected to destination
            video2.muted = true;
            console.log("Local webcam assigned to User 2 video.");

            // Setup audio analysis for the local stream
            setupAudioAnalysis(localStream);

        } else {
            console.error("User 2 video element not found.");
        }

        // Placeholder for the remote user's stream (user 1)
        if (video1) {
            // In a full WebRTC implementation, the remote stream would be assigned here:
            // video1.srcObject = remoteStream;
            // You would also need a separate audio analysis setup for the remote stream
            console.log("User 1 video element is ready for remote stream connection.");
        } else {
            console.error("User 1 video element not found.");
        }

    } catch (err) {
        console.error("Error accessing media devices:", err);
        // Display an error message to the user
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
             alert("Microphone and Webcam permission denied. Please allow access in your browser settings.");
        } else {
             alert("Could not access webcam or microphone. Please ensure permission is granted and no other application is using them.");
        }
    }
}

// --- Song Fetching Logic --- (Placeholder)
function loadSongInfo() {
    const songInfo1 = document.querySelector('.user1 .song-info');
    const songInfo2 = document.querySelector('.user2 .song-info');

    if (songInfo1) {
        songInfo1.textContent = "Fetching User 1's Song...";
    }
    if (songInfo2) {
        songInfo2.textContent = "Fetching User 2's Song...";
    }
}


// --- Initialization ---
window.addEventListener('load', () => {
    startWebcams();
    loadSongInfo();
});

// Optional: Clean up audio context when the window is closed/unloaded
window.addEventListener('beforeunload', stopAudioAnalysis);