const fileInput = document.getElementById('fileInput');
const detectBtn = document.getElementById('detectBtn');

const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const detectBox = document.getElementById("detectBox");
const coinSelection = document.getElementById('coinSelection');

const billImage = document.getElementById('billImage');
const billValueText = document.getElementById('billValue');

const loading = document.getElementById('loading');
const results = document.getElementById('results');
const coinButtons = document.querySelectorAll('.coin');
const resetBtn = document.getElementById("resetBtn");

let selectedFile = null;
let selectedCoins = new Set();

/* -----------------------------
   IMAGE UPLOAD + PREVIEW
-------------------------------- */
fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
        billImage.src = reader.result;

        uploadSection.classList.add('hidden');
        previewSection.classList.remove('hidden');

        // ✅ ENABLE BUTTON HERE (THIS WAS MISSING)
        detectBtn.disabled = false;

    };

    reader.readAsDataURL(selectedFile);
});

/* -----------------------------
   COIN SELECTION (TOGGLE)
-------------------------------- */
coinButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.value;

        if (selectedCoins.has(value)) {
            selectedCoins.delete(value);
            btn.classList.remove('active');
        } else {
            selectedCoins.add(value);
            btn.classList.add('active');
        }
    });
});

/* -----------------------------
   DETECT & DISPENSE
-------------------------------- */
detectBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    detectBox.style.display = "block";
    detectBox.textContent = "SCANNING...";

    loading.style.display = 'block';
    detectBtn.disabled = true;
    coinButtons.forEach(btn => btn.disabled = true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    if (selectedCoins.size > 0) {
        formData.append('coins', Array.from(selectedCoins).join(','));
    }

    try {
        const response = await fetch('/detect', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.data ? data.data[0] : data;

        loading.style.display = 'none';
        detectBtn.disabled = false;
        coinButtons.forEach(btn => btn.disabled = false);

        if (result.message) {
            detectBox.textContent = result.message;
            return;
        }

        detectBox.textContent = `Detected: ₱${result.total_amount}`;

        let coinsArray = [];
        for (const coin in result.coin_change) {
            coinsArray.push(`₱${coin} x ${result.coin_change[coin]}`);
        }

        results.innerHTML = `<h4>Exact Coin Change: ${coinsArray.join(', ')}</h4>`;
        results.style.display = "block";

        resetBtn.classList.remove('hidden');
        resetBtn.style.display = "block";

    } catch (err) {
        loading.style.display = 'none';
        detectBtn.disabled = false;
        coinButtons.forEach(btn => btn.disabled = false);

        detectBox.textContent = "Error processing image";
        resetBtn.classList.remove('hidden');
        resetBtn.style.display = "block";
    }
});

// Reset the application
resetBtn.addEventListener("click", () => location.reload());