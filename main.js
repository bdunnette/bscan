import { Html5QrcodeSupportedFormats, Html5Qrcode } from 'html5-qrcode';

// Storage Key
const STORAGE_KEY = 'omniscan_data';

// DOM Elements
const scannedList = document.getElementById('scanned-list');
const downloadBtn = document.getElementById('download-csv');
const clearBtn = document.getElementById('clear-db');
const cameraSelect = document.getElementById('camera-select');
const scannerStatus = document.getElementById('scanner-status');

// Supported formats for 1D and 2D
const formatsToSupport = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF,
];

// Initialize Scanner Object
const html5QrCode = new Html5Qrcode("reader");
let isScanning = false;

function updateStatus(state, message) {
    scannerStatus.className = `status-indicator status-${state}`;
    scannerStatus.innerHTML = `<span class="pulse"></span> ${message}`;
}

async function startScanner(cameraId) {
    if (isScanning) {
        await html5QrCode.stop();
        isScanning = false;
    }

    const config = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.7);
            return { width: size, height: size };
        },
        aspectRatio: 1.0,
        formatsToSupport: formatsToSupport
    };

    try {
        updateStatus('initializing', 'Starting camera...');
        await html5QrCode.start(
            cameraId,
            config,
            onScanSuccess,
            onScanFailure
        );
        isScanning = true;
        updateStatus('active', 'Scanner Live');

        // Save last used camera
        localStorage.setItem('lastCameraId', cameraId);
    } catch (err) {
        console.error("Failed to start scanner:", err);
        updateStatus('error', 'Camera failed to start');
    }
}

async function initCamera() {
    try {
        updateStatus('initializing', 'Requesting permissions...');

        const devices = await Html5Qrcode.getCameras();

        if (devices && devices.length > 0) {
            cameraSelect.innerHTML = '';
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.id;
                option.text = device.label || `Camera ${cameraSelect.length + 1}`;
                cameraSelect.appendChild(option);
            });

            const lastId = localStorage.getItem('lastCameraId');
            const selectedId = devices.some(d => d.id === lastId) ? lastId : devices[0].id;
            cameraSelect.value = selectedId;

            await startScanner(selectedId);
        } else {
            updateStatus('error', 'No cameras found');
            cameraSelect.innerHTML = '<option value="">No cameras detected</option>';
        }
    } catch (err) {
        console.error("Camera initialization failed:", err);
        updateStatus('error', 'Permissions denied or error');
        cameraSelect.innerHTML = '<option value="">Permission Error</option>';

        if (err.toString().includes("NotAllowedError")) {
            alert("Camera access was denied. Please allow camera permissions in your browser settings and refresh.");
        }
    }
}

cameraSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        startScanner(e.target.value);
    }
});

let audioCtx = null;

function playSuccessBeep() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        console.warn("Audio feedback failed", e);
    }
}

// Scan throttle/feedback state
let lastScanTime = 0;
let alertTimeout = null;

async function onScanSuccess(decodedText, decodedResult) {
    const now = Date.now();
    if (now - lastScanTime < 1500) return;
    lastScanTime = now;

    console.log(`Code matched = ${decodedText}`, decodedResult);

    // 1. Audio Feedback
    playSuccessBeep();

    // 2. Haptic Feedback (Vibration)
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }

    // 3. Visual Feedback (Scanner Flash)
    const scannerSection = document.querySelector('.scanner-section');
    scannerSection.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.6)';
    setTimeout(() => {
        scannerSection.style.boxShadow = 'var(--glass-shadow)';
    }, 400);

    // 4. UI Feedback (Toast Alert)
    const alertEl = document.getElementById('scan-alert');
    const alertVal = document.getElementById('alert-value');
    alertVal.textContent = decodedText;
    alertEl.classList.remove('hidden');

    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
        alertEl.classList.add('hidden');
    }, 2000);

    const entry = {
        id: Date.now(),
        value: decodedText,
        format: decodedResult.result.format.formatName,
        timestamp: new Date().toLocaleString()
    };

    saveEntry(entry);
    renderLatestItems();
}

function onScanFailure(error) {
    // Safe to ignore most failures
}

// Data Handling with LocalStorage
function getEntries() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveEntry(entry) {
    const entries = getEntries();
    entries.unshift(entry); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function renderLatestItems() {
    const entries = getEntries();
    scannedList.innerHTML = '';

    entries.forEach(item => {
        const li = document.createElement('li');
        li.className = 'scanned-item';
        li.innerHTML = `
            <div class="item-info">
                <span class="item-value">${escapeHtml(item.value)}</span>
                <span class="item-meta">${item.timestamp} <span class="status-badge">${item.format}</span></span>
            </div>
        `;
        scannedList.appendChild(li);
    });
}

downloadBtn.addEventListener('click', () => {
    const entries = getEntries();
    if (entries.length === 0) {
        alert('No data to export!');
        return;
    }

    const csvRows = [['ID', 'Value', 'Format', 'Timestamp']];
    entries.forEach(doc => {
        csvRows.push([
            `"${doc.id}"`,
            `"${doc.value.replace(/"/g, '""')}"`,
            `"${doc.format}"`,
            `"${doc.timestamp}"`
        ]);
    });

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scanned_barcodes_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all scanned data?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderLatestItems();
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start initialization
initCamera();
renderLatestItems();
