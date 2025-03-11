const video = document.getElementById('camera-feed');
const countdown = document.getElementById('countdown');
const captureBtn = document.getElementById('capture-btn');
const photoFrame = document.getElementById('photo-frame');
const capturedPhoto = document.getElementById('captured-photo');
const downloadBtn = document.getElementById('download-btn');
const retryBtn = document.getElementById('retry-btn');

// Ensure Capture Button is Enabled Only After Camera Starts
captureBtn.addEventListener('click', startCamera);

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            captureBtn.disabled = false;
        })
        .catch(err => {
            console.error("Error accessing camera:", err);
            alert("Camera access failed. Please allow camera permissions.");
        });

    captureBtn.addEventListener('click', captureSequence);
}

// Capture logic for 3-photo strip with countdown
function captureSequence() {
    let photoQueue = [];

    const captureWithCountdown = (photoIndex) => {
        if (photoIndex >= 3) {
            createPhotoboothStrip(photoQueue);
            video.srcObject.getTracks().forEach(track => track.stop()); // Turn off camera after capturing
            return;
        }

        countdown.innerText = '3'; 
        countdown.classList.remove('hidden');

        let count = 3;
        const timer = setInterval(() => {
            count--;
            countdown.innerText = count;

            if (count === 0) {
                clearInterval(timer);
                countdown.classList.add('hidden');
                captureSinglePhoto(photoQueue, () => captureWithCountdown(photoIndex + 1));
            }
        }, 1000);
    };

    captureWithCountdown(0);
}

// Capture a single photo with vintage effect
function captureSinglePhoto(photoQueue, nextStep) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/png');
    photoQueue.push(photoData);
    capturedPhoto.src = photoData;
    photoFrame.classList.remove('hidden');

    if (nextStep) nextStep();
}

// Combine 3 photos into a vertical photobooth strip
function createPhotoboothStrip(photoQueue) {
    const stripCanvas = document.createElement('canvas');
    const photoWidth = video.videoWidth;
    const photoHeight = video.videoHeight;

    stripCanvas.width = photoWidth;
    stripCanvas.height = photoHeight * 3;

    const stripContext = stripCanvas.getContext('2d');

    photoQueue.forEach((photoData, index) => {
        const img = new Image();
        img.src = photoData;
        img.onload = () => {
            stripContext.drawImage(img, 0, index * photoHeight, photoWidth, photoHeight);

            if (index === 2) {
                const finalPhotoData = stripCanvas.toDataURL('image/png');
                capturedPhoto.src = finalPhotoData;
                downloadBtn.href = finalPhotoData;
                photoFrame.classList.remove('hidden');
            }
        };
    });
}

// Retry logic
retryBtn.addEventListener('click', () => {
    capturedPhoto.src = '';
    photoFrame.classList.add('hidden');
    downloadBtn.classList.add('hidden');
});
