const addBtn = document.getElementById('addCountdownBtn');
const listEl = document.getElementById('countdownList');
const targetInput = document.getElementById('targetInput');
const alarmSound = document.getElementById('alarmSound');
const celebrationSound1 = document.getElementById('celebrationSound1');
const celebrationSound2 = document.getElementById('celebrationSound2');
const partySound = document.getElementById('partySound');
const clickSound = document.getElementById('clickSound');
const tickSound = document.getElementById('tickSound');
const successSound = document.getElementById('successSound');
const deleteSound = document.getElementById('deleteSound');
const pauseSound = document.getElementById('pauseSound');
const resumeSound = document.getElementById('resumeSound');
const themeToggle = document.getElementById('themeToggle');
const soundToggle = document.getElementById('soundToggle');
const confettiContainer = document.getElementById('confetti-container');

let countdowns = [];
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default to enabled

// Update sound toggle button icon
if (soundToggle) {
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
}

// Sound toggle functionality
if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('soundEnabled', soundEnabled);
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
        // Don't play sound when toggling (to avoid feedback loop)
    });
}

// Helper function to play sounds
function playSound(soundElement, volume = 0.3) {
    if (!soundEnabled || !soundElement) return;
    try {
        soundElement.volume = volume;
        soundElement.currentTime = 0;
        soundElement.play().catch(e => {
            // Silently fail if sound can't play (user interaction required, etc.)
        });
    } catch (e) {
        // Silently fail
    }
}

// Theme toggle
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '☀️';
} else {
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    playSound(clickSound, 0.2);
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
});

addBtn.addEventListener('click', () => {
    playSound(clickSound, 0.3);
    if (!targetInput.value) {
        playSound(deleteSound, 0.2);
        return alert("Pick a valid time");
    }

    let t = new Date(targetInput.value).getTime();
    if (t <= Date.now()) {
        playSound(deleteSound, 0.2);
        return alert("Choose a future time");
    }

    let name = prompt("Enter a name for this countdown (optional):") || `Countdown ${countdowns.length + 1}`;
    let id = Date.now() + Math.random();

    countdowns.push({
        id,
        name: name.trim() || `Countdown ${countdowns.length + 1}`,
        target: t,
        started: true,
        total: t - Date.now(),
        createdAt: Date.now(),
        celebrated: false
    });

    playSound(successSound, 0.4);
    render();
});

function render() {
    listEl.innerHTML = '';

    countdowns.forEach(c => {
        let item = document.createElement('div');
        item.className = 'countdown-item';
        item.id = 'cd-' + c.id;

        let status = 'finished';
        if (c.target > Date.now()) {
            status = c.started ? 'running' : 'paused';
        }

        item.innerHTML = `
<div class="countdown-header">
    <div class="countdown-title" id="title-${c.id}">${c.name || 'Countdown'}</div>
    <div class="countdown-status status-${status}" id="status-${c.id}">${status === 'running' ? '▶ Running' : status === 'paused' ? '⏸ Paused' : '✓ Finished'}</div>
</div>

<div class="time-display" id="time-${c.id}">--:--:--:--</div>
<div class="meta" id="meta-${c.id}"></div>

<div class="countdown-stats">
    <div class="stat-item">
        <div class="stat-label">Progress</div>
        <div class="stat-value" id="percent-${c.id}">0%</div>
    </div>
    <div class="stat-item">
        <div class="stat-label">Elapsed</div>
        <div class="stat-value" id="elapsed-${c.id}">0d 0h 0m</div>
    </div>
    <div class="stat-item">
        <div class="stat-label">Total Time</div>
        <div class="stat-value" id="total-${c.id}">--</div>
    </div>
</div>

<div class="progress" id="progress-wrapper-${c.id}"><div class="progress-inner" id="prog-${c.id}"></div></div>

<div class="actions">
    <button onclick="toggleStart(${c.id})">${c.started ? '⏸ Pause' : '▶ Resume'}</button>
    <button onclick="resetCountdown(${c.id})">🔄 Reset</button>
    <button onclick="editCountdown(${c.id})">✏️ Edit</button>
    <button onclick="removeCountdown(${c.id})">🗑️ Delete</button>
</div>
`;

        listEl.appendChild(item);
    });

    // Update display after rendering
    updateAll();
}

function toggleStart(id) {
    playSound(clickSound, 0.3);
    let c = countdowns.find(x => x.id === id);
    if (!c) return;
    if (c.target <= Date.now()) {
        playSound(deleteSound, 0.2);
        alert("Cannot start a finished countdown. Please reset it first.");
        return;
    }
    c.started = !c.started;
    if (c.started) {
        playSound(resumeSound, 0.3);
    } else {
        playSound(pauseSound, 0.3);
    }
    render();
}

function resetCountdown(id) {
    playSound(clickSound, 0.3);
    let c = countdowns.find(x => x.id === id);
    if (!c) return;
    if (!confirm(`Reset "${c.name}" countdown?`)) return;

    let newTarget = prompt("Enter new target date and time (YYYY-MM-DDTHH:mm):", new Date(c.target).toISOString().slice(0, 16));
    if (!newTarget) return;

    let t = new Date(newTarget).getTime();
    if (t <= Date.now()) {
        playSound(deleteSound, 0.2);
        alert("Choose a future time");
        return;
    }

    c.target = t;
    c.total = t - Date.now();
    c.started = true;
    c.createdAt = Date.now();
    c.celebrated = false; // Reset celebration flag
    playSound(successSound, 0.3);
    render();
}

function editCountdown(id) {
    playSound(clickSound, 0.3);
    let c = countdowns.find(x => x.id === id);
    if (!c) return;

    let newName = prompt("Enter new name:", c.name);
    if (newName === null) return;
    if (newName.trim()) c.name = newName.trim();

    let newTarget = prompt("Enter new target date and time (YYYY-MM-DDTHH:mm):", new Date(c.target).toISOString().slice(0, 16));
    if (!newTarget) return;

    let t = new Date(newTarget).getTime();
    if (t <= Date.now()) {
        playSound(deleteSound, 0.2);
        alert("Choose a future time");
        return;
    }

    c.target = t;
    c.total = t - Date.now();
    playSound(successSound, 0.3);
    render();
}

function removeCountdown(id) {
    playSound(clickSound, 0.3);
    playSound(deleteSound, 0.4);
    countdowns = countdowns.filter(x => x.id !== id);
    render();
}

function updateAll() {
    countdowns.forEach(c => {
        let now = Date.now();
        let remaining = c.target - now;

        let tEl = document.getElementById(`time-${c.id}`);
        let mEl = document.getElementById(`meta-${c.id}`);
        let pEl = document.getElementById(`prog-${c.id}`);
        let statusEl = document.getElementById(`status-${c.id}`);
        let percentEl = document.getElementById(`percent-${c.id}`);
        let elapsedEl = document.getElementById(`elapsed-${c.id}`);
        let totalEl = document.getElementById(`total-${c.id}`);
        let progressWrapper = document.getElementById(`progress-wrapper-${c.id}`);

        if (!tEl || !mEl || !pEl) return;

        // Calculate elapsed time
        let elapsed = now - (c.createdAt || c.target - c.total);
        let elapsedSecs = Math.floor(elapsed / 1000);
        let elapsedD = Math.floor(elapsedSecs / 86400);
        let elapsedH = Math.floor((elapsedSecs % 86400) / 3600);
        let elapsedM = Math.floor((elapsedSecs % 3600) / 60);

        // Calculate total duration
        let totalSecs = Math.floor(c.total / 1000);
        let totalD = Math.floor(totalSecs / 86400);
        let totalH = Math.floor((totalSecs % 86400) / 3600);
        let totalM = Math.floor((totalSecs % 3600) / 60);

        if (remaining <= 0) {
            tEl.textContent = "00:00:00:00";
            mEl.textContent = "🎉 Finished! 🎉";
            pEl.style.width = '100%';
            if (statusEl) {
                statusEl.textContent = '✓ Finished';
                statusEl.className = 'countdown-status status-finished';
            }
            if (percentEl) percentEl.textContent = '100%';
            if (progressWrapper) progressWrapper.setAttribute('data-percent', '100%');

            // Trigger celebration only once when countdown first finishes
            if (c.started && !c.celebrated) {
                c.celebrated = true;
                c.started = false;

                // Get the countdown item element for confetti positioning
                const countdownItem = document.getElementById(`cd-${c.id}`);
                if (countdownItem) {
                    // Add celebration pulse animation
                    countdownItem.classList.add('finished-celebrating');
                    setTimeout(() => {
                        countdownItem.classList.remove('finished-celebrating');
                    }, 1500);

                    celebrate(countdownItem);
                }

                // Also play alarm sound
                if (alarmSound) {
                    alarmSound.play().catch(e => console.log('Could not play alarm:', e));
                }
            }

            if (elapsedEl) elapsedEl.textContent = `${elapsedD}d ${elapsedH}h ${elapsedM}m`;
            if (totalEl) totalEl.textContent = `${totalD}d ${totalH}h ${totalM}m`;
            return;
        }

        if (!c.started) {
            if (statusEl) {
                statusEl.textContent = '⏸ Paused';
                statusEl.className = 'countdown-status status-paused';
            }
        } else {
            if (statusEl) {
                statusEl.textContent = '▶ Running';
                statusEl.className = 'countdown-status status-running';
            }
        }

        const secs = Math.floor(remaining / 1000);
        const d = Math.floor(secs / 86400);
        const h = Math.floor((secs % 86400) / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;

        // Play tick sound when seconds change (only for active countdowns)
        if (c.started && (!c.lastSecond || c.lastSecond !== s)) {
            // Only play tick for countdowns with less than 1 hour remaining (to avoid too many sounds)
            if (remaining < 3600000) {
                playSound(tickSound, 0.15);
            }
            c.lastSecond = s;
        }

        tEl.textContent = `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
        mEl.textContent = `Target: ${new Date(c.target).toLocaleString()}`;

        let percent = Math.max(0, Math.min(100, ((c.total - remaining) / c.total) * 100));
        pEl.style.width = percent + '%';

        if (percentEl) percentEl.textContent = Math.round(percent) + '%';
        if (progressWrapper) progressWrapper.setAttribute('data-percent', Math.round(percent) + '%');
        if (elapsedEl) elapsedEl.textContent = `${elapsedD}d ${elapsedH}h ${elapsedM}m`;
        if (totalEl) totalEl.textContent = `${totalD}d ${totalH}h ${totalM}m`;
    });
}

function pad(n) {
    return String(n).padStart(2, '0');
}

// Confetti/Party Popper Effect
function createConfetti(element) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    const confettiCount = 150;
    const duration = 3000;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = centerX + 'px';
        confetti.style.top = centerY + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.setProperty('--random-x', (Math.random() - 0.5) * 800 + 'px');
        confetti.style.setProperty('--random-y', (Math.random() - 0.5) * 800 + 'px');
        confetti.style.setProperty('--random-rotation', Math.random() * 720 + 'deg');
        confetti.style.setProperty('--delay', Math.random() * 0.5 + 's');

        confettiContainer.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, duration);
    }

    // Add sparkle effect
    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = centerX + (Math.random() - 0.5) * 200 + 'px';
        sparkle.style.top = centerY + (Math.random() - 0.5) * 200 + 'px';
        sparkle.style.setProperty('--delay', Math.random() * 0.3 + 's');
        confettiContainer.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 2000);
    }
}

// Celebration function - plays sounds and creates confetti
function celebrate(element) {
    // Play celebration sounds
    if (celebrationSound1) {
        celebrationSound1.currentTime = 0;
        celebrationSound1.play().catch(e => console.log('Could not play celebration sound:', e));
    }

    setTimeout(() => {
        if (celebrationSound2) {
            celebrationSound2.currentTime = 0;
            celebrationSound2.play().catch(e => console.log('Could not play celebration sound:', e));
        }
    }, 300);

    setTimeout(() => {
        if (partySound) {
            partySound.currentTime = 0;
            partySound.play().catch(e => console.log('Could not play party sound:', e));
        }
    }, 600);

    // Create confetti effect
    createConfetti(element);
}

// Update countdowns every second
setInterval(updateAll, 1000);

// Initial render
render();
