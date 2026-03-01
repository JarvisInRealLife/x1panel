/* ============================================
   X1 INTELLIGENCE SYSTEM — APP LOGIC
   ============================================ */

const HACKING_MESSAGES = [
    { prefix: 'SYS', text: 'Initializing X1 Protocol v3.7.2...' },
    { prefix: 'NET', text: 'Establishing encrypted tunnel...' },
    { prefix: 'NET', text: 'Routing through secure proxy nodes...' },
    { prefix: 'SEC', text: 'Bypassing firewall layer 1/3...' },
    { prefix: 'SEC', text: 'Bypassing firewall layer 2/3...' },
    { prefix: 'SEC', text: 'Bypassing firewall layer 3/3...' },
    { prefix: 'DB\u00A0', text: 'Connecting to remote database...' },
    { prefix: 'DB\u00A0', text: 'Querying target records...' },
    { prefix: 'DEC', text: 'Decrypting data packets...' },
    { prefix: 'EXT', text: 'Extracting intelligence data...' },
    { prefix: 'RPT', text: 'Compiling report...' },
];

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>{}[]|/\\~';

let currentResults = null;
let currentQuery = '';
let currentType = '';

/* ===== AUTH ===== */
async function checkAuth() {
    try {
        const res = await fetch('/api/check-auth');
        return res.ok;
    } catch { return false; }
}

async function login(username, password) {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    showView('login');
}

/* ===== VIEWS & NAVIGATION ===== */
function showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(`view-${name}`);
    if (view) view.classList.add('active');
}

function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page-${name}`);
    if (page) {
        page.classList.remove('active');
        void page.offsetWidth;
        page.classList.add('active');
    }
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === name);
    });
    const links = document.getElementById('nav-links');
    if (links) links.classList.remove('open');
    const ham = document.getElementById('hamburger');
    if (ham) ham.classList.remove('open');
}

/* ===== SCRAMBLE TEXT EFFECT ===== */
function scrambleText(element, finalText, duration = 600) {
    return new Promise(resolve => {
        const len = finalText.length;
        const startTime = Date.now();
        let frame;

        function tick() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const revealed = Math.floor(progress * len);
            let output = '';

            for (let i = 0; i < len; i++) {
                if (i < revealed) {
                    output += finalText[i];
                } else {
                    output += '<span class="scramble-char">' +
                        SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] +
                        '</span>';
                }
            }
            element.innerHTML = output;

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            } else {
                element.textContent = finalText;
                resolve();
            }
        }
        tick();
    });
}

/* ===== LOADING ANIMATION ===== */
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    const body = document.getElementById('terminal-body');
    const bar = document.getElementById('progress-bar');
    const pText = document.getElementById('progress-text');
    body.innerHTML = '';
    bar.style.width = '0%';
    pText.textContent = '0%';
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('active');
}

async function runHackingAnimation(apiPromise) {
    showLoading();
    const body = document.getElementById('terminal-body');
    const bar = document.getElementById('progress-bar');
    const pText = document.getElementById('progress-text');
    const total = HACKING_MESSAGES.length;
    let apiDone = false;
    let apiResult = null;
    let apiError = null;

    apiPromise
        .then(r => { apiResult = r; apiDone = true; })
        .catch(e => { apiError = e; apiDone = true; });

    for (let i = 0; i < total; i++) {
        const msg = HACKING_MESSAGES[i];
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="prefix">[${msg.prefix}]</span> <span class="msg" data-final="${msg.text}"></span>`;
        body.appendChild(line);
        body.scrollTop = body.scrollHeight;

        const msgSpan = line.querySelector('.msg');
        await scrambleText(msgSpan, msg.text, 400);

        const ok = document.createElement('span');
        ok.className = 'ok';
        ok.textContent = '[OK]';
        line.appendChild(ok);

        const pct = Math.round(((i + 1) / (total + 1)) * 100);
        bar.style.width = pct + '%';
        pText.textContent = pct + '%';

        await sleep(120 + Math.random() * 200);
    }

    if (!apiDone) {
        const waitLine = document.createElement('div');
        waitLine.className = 'terminal-line';
        waitLine.innerHTML = '<span class="prefix">[...]</span> <span class="msg">Waiting for response</span><span class="ok blink-cursor">_</span>';
        body.appendChild(waitLine);
        body.scrollTop = body.scrollHeight;

        while (!apiDone) {
            await sleep(200);
        }
        waitLine.remove();
    }

    const finalLine = document.createElement('div');
    finalLine.className = 'terminal-line final';
    body.appendChild(finalLine);
    body.scrollTop = body.scrollHeight;

    if (apiError) {
        finalLine.innerHTML = '<span class="fail">[FAIL] ' + escapeHtml(apiError.message || 'Request failed') + '</span>';
        bar.style.width = '100%';
        bar.style.background = '#ff0040';
        pText.textContent = 'ERR';
        await sleep(2000);
        hideLoading();
        bar.style.background = '';
        return { error: apiError.message || 'Request failed' };
    }

    bar.style.width = '100%';
    pText.textContent = '100%';
    await scrambleText(finalLine, '[OK] TARGET DATA RETRIEVED SUCCESSFULLY', 500);
    finalLine.style.color = '#00ff41';
    finalLine.style.textShadow = '0 0 8px rgba(0,255,65,0.4)';

    await sleep(800);
    hideLoading();
    return apiResult;
}

/* ===== API CALLS ===== */
async function apiLookup(type, term) {
    const endpoint = type === 'mobile' ? '/api/lookup/mobile' : '/api/lookup/id';
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lookup failed');
    return data;
}

/* ===== RENDER RESULTS ===== */
function renderResults(containerId, data, query, type) {
    const container = document.getElementById(containerId);
    if (!data || !data.length) {
        container.innerHTML = `
            <div class="no-results glass-card">
                <i class="fas fa-exclamation-triangle"></i>
                <p>NO RECORDS FOUND FOR "${escapeHtml(query)}"</p>
            </div>`;
        return;
    }

    currentResults = data;
    currentQuery = query;
    currentType = type;

    let html = `
        <div class="results-header">
            <span class="results-count"><i class="fas fa-database"></i> ${data.length} RECORD${data.length > 1 ? 'S' : ''} FOUND</span>
            <div class="results-actions">
                <button class="btn-copy" onclick="copyReportToClipboard()" title="Copy all details to clipboard">
                    <i class="fas fa-copy"></i> COPY
                </button>
                <button class="btn-download" onclick="downloadReportAsText()" title="Download as text file">
                    <i class="fas fa-file-download"></i> DOWNLOAD
                </button>
            </div>
        </div>`;

    data.forEach((record, idx) => {
        const fields = [];
        if (record.father_name) fields.push({ label: 'FATHER\'S NAME', value: record.father_name });
        if (record.mobile) fields.push({ label: 'MOBILE', value: record.mobile, icon: 'fa-phone' });
        if (record.alt_mobile) fields.push({ label: 'ALT MOBILE', value: record.alt_mobile, icon: 'fa-phone-flip' });
        if (record.address) fields.push({ label: 'ADDRESS', value: record.address, icon: 'fa-location-dot' });
        if (record.email) fields.push({ label: 'EMAIL', value: record.email, icon: 'fa-envelope' });
        if (record.circle) fields.push({ label: 'CIRCLE', value: record.circle, icon: 'fa-tower-cell' });
        if (record.id_number) fields.push({ label: 'ID NUMBER', value: record.id_number, icon: 'fa-fingerprint' });

        html += `
            <div class="result-card glass-card" style="animation-delay: ${idx * 0.08}s">
                <div class="result-card-header">
                    <div class="result-avatar"><i class="fas fa-user"></i></div>
                    <span class="result-name">${escapeHtml(record.name || 'Unknown')}</span>
                    <span class="result-badge">#${idx + 1}</span>
                </div>
                <div class="result-grid">
                    ${fields.map(f => `
                        <div class="result-field">
                            <div class="result-field-label">${f.label}</div>
                            <div class="result-field-value ${f.value ? '' : 'empty'}">
                                ${escapeHtml(f.value) || 'N/A'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    });

    container.innerHTML = html;
}

/* ===== REPORT AS TEXT (copy + download .txt) ===== */
const REPORT_FIELD_LABELS = [
    ['Name', 'name'],
    ['Father\'s Name', 'father_name'],
    ['Mobile', 'mobile'],
    ['Alt Mobile', 'alt_mobile'],
    ['Address', 'address'],
    ['Email', 'email'],
    ['Circle', 'circle'],
    ['ID Number', 'id_number']
];

function getReportAsText() {
    if (!currentResults || !currentResults.length) return '';

    const now = new Date();
    const dateStr = now.toLocaleString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const reportId = 'X1-' + now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '-' +
        Math.random().toString(36).substr(2, 6).toUpperCase();

    const typeLabel = currentType === 'mobile' ? 'Mobile Number Trace' : 'ID Number Trace';

    let out = [];
    out.push('X1 INTELLIGENCE REPORT');
    out.push('======================');
    out.push('');
    out.push('Report ID: ' + reportId);
    out.push('Date: ' + dateStr);
    out.push('Type: ' + typeLabel);
    out.push('Query: ' + currentQuery);
    out.push('');
    out.push('--------------------------------------------------------------------------------');
    out.push('');

    currentResults.forEach((r, i) => {
        out.push('--- RECORD ' + (i + 1) + ' OF ' + currentResults.length + ' ---');
        out.push('');
        REPORT_FIELD_LABELS.forEach(([label, key]) => {
            if (r[key]) {
                out.push(label + ': ' + String(r[key]).trim());
            }
        });
        out.push('');
    });

    out.push('--------------------------------------------------------------------------------');
    out.push('END OF REPORT — X1 INTELLIGENCE SYSTEM — CONFIDENTIAL');

    return out.join('\r\n');
}

function copyReportToClipboard() {
    if (!currentResults || !currentResults.length) return;

    const text = getReportAsText();
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.btn-copy');
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> COPIED';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.classList.remove('copied');
            }, 2000);
        }
    }).catch(() => {
        alert('Could not copy. Please use the Download button to save as a file.');
    });
}

function downloadReportAsText() {
    if (!currentResults || !currentResults.length) return;

    const text = getReportAsText();
    const now = new Date();
    const reportId = 'X1-' + now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '-' +
        Math.random().toString(36).substr(2, 6).toUpperCase();
    const filename = 'X1_Report_' + currentQuery + '_' + reportId + '.txt';

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

/* ===== HELPERS ===== */
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', async () => {
    const isAuth = await checkAuth();
    showView(isAuth ? 'app' : 'login');
    if (isAuth) showPage('dashboard');

    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('login-error');
        const btn = e.target.querySelector('button');
        const uname = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value;

        if (!uname || !pass) {
            errEl.textContent = '> All fields are required';
            return;
        }

        btn.disabled = true;
        btn.querySelector('span').textContent = 'AUTHENTICATING...';
        errEl.textContent = '';

        try {
            await login(uname, pass);
            showView('app');
            showPage('dashboard');
        } catch (err) {
            errEl.textContent = '> ' + err.message;
        } finally {
            btn.disabled = false;
            btn.querySelector('span').textContent = 'ACCESS SYSTEM';
        }
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', logout);

    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });

    // Nav brand -> dashboard
    document.getElementById('nav-brand').addEventListener('click', () => showPage('dashboard'));

    // Hamburger
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('hamburger').classList.toggle('open');
        document.getElementById('nav-links').classList.toggle('open');
    });

    // Dashboard cards
    document.querySelectorAll('.dash-card').forEach(card => {
        card.addEventListener('click', () => showPage(card.dataset.goto));
    });

    // Back buttons
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => showPage(btn.dataset.goto));
    });

    // Mobile form
    document.getElementById('mobile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('mobile-input');
        const val = input.value.trim();
        if (!val || val.length < 10) {
            input.focus();
            return;
        }

        const promise = apiLookup('mobile', val);
        const result = await runHackingAnimation(promise);

        if (result && !result.error && result.data) {
            renderResults('mobile-results', result.data, val, 'mobile');
        } else {
            renderResults('mobile-results', null, val, 'mobile');
        }
    });

    // ID form
    document.getElementById('id-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('id-input');
        const val = input.value.trim();
        if (!val) {
            input.focus();
            return;
        }

        const promise = apiLookup('id', val);
        const result = await runHackingAnimation(promise);

        if (result && !result.error && result.data) {
            renderResults('id-results', result.data, val, 'id');
        } else {
            renderResults('id-results', null, val, 'id');
        }
    });
});
