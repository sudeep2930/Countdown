// Initialize DOM elements
const addBtn = document.getElementById('addCountdownBtn');
const targetInput = document.getElementById('targetInput');
const listEl = document.getElementById('countdownList');
const alarmSound = document.getElementById('alarmSound');
const themeToggle = document.getElementById('themeToggle');

// Initialize countdowns array
let countdowns = [];

// Add countdown event listener
addBtn.addEventListener('click', () => {
    let t = new Date(targetInput.value).getTime();
    if (t <= Date.now()) return alert("Choose a future time");

    let name = prompt("Enter a name for this countdown (optional):") || `Countdown ${countdowns.length + 1}`;
    let id = Date.now() + Math.random();

    countdowns.push({
        id,
        name: name,
        target: t,
        started: true,
        total: t - Date.now(),
        createdAt: Date.now()
    });

    render();
});

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
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
    <div class="countdown-status status-${status}" id="status-${c.id}">${status === 'running' ? 'Running' : status === 'paused' ? 'Paused' : 'Finished'}</div>
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
    let c = countdowns.find(x => x.id === id);
    if (!c) return;
    if (c.target <= Date.now()) {
        alert("Cannot start a finished countdown. Please reset it first.");
        return;
    }
    c.started = !c.started;
    render();
}

function resetCountdown(id) {
    let c = countdowns.find(x => x.id === id);
    if (!c) return;
    if (!confirm(`Reset "${c.name}" countdown?`)) return;

    let newTarget = prompt("Enter new target date and time (YYYY-MM-DDTHH:mm):", new Date(c.target).toISOString().slice(0, 16));
    if (!newTarget) return;

    let t = new Date(newTarget).getTime();
    if (t <= Date.now()) {
        alert("Choose a future time");
        return;
    }

    c.target = t;
    c.total = t - Date.now();
    c.started = true;
    c.createdAt = Date.now();
    render();
}

function editCountdown(id) {
    let c = countdowns.find(x => x.id === id);
    if (!c) return;

    let newName = prompt("Enter new name:", c.name);
    if (newName === null) return;
    if (newName.trim()) c.name = newName.trim();

    let newTarget = prompt("Enter new target date and time (YYYY-MM-DDTHH:mm):", new Date(c.target).toISOString().slice(0, 16));
    if (!newTarget) return;

    let t = new Date(newTarget).getTime();
    if (t <= Date.now()) {
        alert("Choose a future time");
        return;
    }

    c.target = t;
    c.total = t - Date.now();
    render();
}

function removeCountdown(id) {
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
            mEl.textContent = "Finished!";
            pEl.style.width = '100%';
            if (statusEl) {
                statusEl.textContent = 'Finished';
                statusEl.className = 'countdown-status status-finished';
            }
            if (percentEl) percentEl.textContent = '100%';
            if (progressWrapper) progressWrapper.setAttribute('data-percent', '100%');
            if (alarmSound && c.started) {
                alarmSound.play().catch(e => console.log('Could not play alarm:', e));
                c.started = false; // Stop playing alarm repeatedly
            }
            if (elapsedEl) elapsedEl.textContent = `${elapsedD}d ${elapsedH}h ${elapsedM}m`;
            if (totalEl) totalEl.textContent = `${totalD}d ${totalH}h ${totalM}m`;
            return;
        }

        if (!c.started) {
            if (statusEl) {
                statusEl.textContent = 'Paused';
                statusEl.className = 'countdown-status status-paused';
            }
        } else {
            if (statusEl) {
                statusEl.textContent = 'Running';
                statusEl.className = 'countdown-status status-running';
            }
        }

        const secs = Math.floor(remaining / 1000);
        const d = Math.floor(secs / 86400);
        const h = Math.floor((secs % 86400) / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;

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

// Update countdowns every second
setInterval(updateAll, 1000);

// Initial render
render();