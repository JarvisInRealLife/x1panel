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
async function doLogin(username, password) {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
    return data;
}

/* ===== VIEWS ===== */
function showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');
}

function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + name);
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

/* ===== SCRAMBLE TEXT ===== */
function scrambleText(el, finalText, duration) {
    duration = duration || 400;
    return new Promise(resolve => {
        const len = finalText.length;
        const start = Date.now();
        function tick() {
            const progress = Math.min((Date.now() - start) / duration, 1);
            const revealed = Math.floor(progress * len);
            let out = '';
            for (let i = 0; i < len; i++) {
                if (i < revealed) {
                    out += finalText[i];
                } else {
                    out += '<span class="scramble-char">' +
                        SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] + '</span>';
                }
            }
            el.innerHTML = out;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = finalText;
                resolve();
            }
        }
        tick();
    });
}

/* ===== LOADING ===== */
function showLoading() {
    var ov = document.getElementById('loading-overlay');
    var body = document.getElementById('terminal-body');
    var bar = document.getElementById('progress-bar');
    var pt = document.getElementById('progress-text');
    body.innerHTML = '';
    bar.style.width = '0%';
    pt.textContent = '0%';
    ov.classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

async function runHackingAnimation(apiPromise) {
    showLoading();
    var body = document.getElementById('terminal-body');
    var bar = document.getElementById('progress-bar');
    var pt = document.getElementById('progress-text');
    var total = HACKING_MESSAGES.length;
    var apiDone = false, apiResult = null, apiError = null;

    apiPromise
        .then(function(r) { apiResult = r; apiDone = true; })
        .catch(function(e) { apiError = e; apiDone = true; });

    for (var i = 0; i < total; i++) {
        var msg = HACKING_MESSAGES[i];
        var line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = '<span class="prefix">[' + msg.prefix + ']</span> <span class="msg"></span>';
        body.appendChild(line);
        body.scrollTop = body.scrollHeight;

        await scrambleText(line.querySelector('.msg'), msg.text, 350);

        var ok = document.createElement('span');
        ok.className = 'ok';
        ok.textContent = '[OK]';
        line.appendChild(ok);

        var pct = Math.round(((i + 1) / (total + 1)) * 100);
        bar.style.width = pct + '%';
        pt.textContent = pct + '%';

        await sleep(100 + Math.random() * 150);
    }

    if (!apiDone) {
        var waitLine = document.createElement('div');
        waitLine.className = 'terminal-line';
        waitLine.innerHTML = '<span class="prefix">[...]</span> <span class="msg">Waiting for response</span><span class="ok blink-cursor">_</span>';
        body.appendChild(waitLine);
        body.scrollTop = body.scrollHeight;
        while (!apiDone) await sleep(200);
        waitLine.remove();
    }

    var finalLine = document.createElement('div');
    finalLine.className = 'terminal-line final';
    body.appendChild(finalLine);
    body.scrollTop = body.scrollHeight;

    if (apiError) {
        finalLine.innerHTML = '<span class="fail">[FAIL] ' + escapeHtml(apiError.message || 'Request failed') + '</span>';
        bar.style.width = '100%';
        bar.style.background = '#ff0040';
        pt.textContent = 'ERR';
        await sleep(2000);
        hideLoading();
        bar.style.background = '';
        return { error: apiError.message };
    }

    bar.style.width = '100%';
    pt.textContent = '100%';
    await scrambleText(finalLine, '[OK] TARGET DATA RETRIEVED SUCCESSFULLY', 500);
    finalLine.style.color = '#00ff41';

    await sleep(600);
    hideLoading();
    return apiResult;
}

/* ===== API ===== */
async function apiLookup(type, term) {
    var endpoint = type === 'mobile' ? '/api/lookup/mobile' : '/api/lookup/id';
    var res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: term })
    });

    if (res.status === 401) {
        showView('login');
        throw new Error('Session expired. Please log in again.');
    }

    var data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
}

/* ===== RENDER RESULTS ===== */
function renderResults(containerId, data, query, type) {
    var container = document.getElementById(containerId);
    if (!data || !data.length) {
        container.innerHTML =
            '<div class="no-results glass-card">' +
            '<i class="fas fa-exclamation-triangle"></i>' +
            '<p>NO RECORDS FOUND FOR "' + escapeHtml(query) + '"</p></div>';
        return;
    }

    currentResults = data;
    currentQuery = query;
    currentType = type;

    var html =
        '<div class="results-header">' +
        '<span class="results-count"><i class="fas fa-database"></i> ' + data.length + ' RECORD' + (data.length > 1 ? 'S' : '') + ' FOUND</span>' +
        '<div class="results-actions">' +
        '<button class="btn-action" onclick="copyReportToClipboard()" title="Copy details"><i class="fas fa-copy"></i> COPY</button>' +
        '<button class="btn-action" onclick="downloadReportAsText()" title="Download text file"><i class="fas fa-file-download"></i> DOWNLOAD</button>' +
        '</div></div>';

    data.forEach(function(record, idx) {
        var fields = [];
        if (record.father_name) fields.push(['FATHER\'S NAME', record.father_name]);
        if (record.mobile) fields.push(['MOBILE', record.mobile]);
        if (record.alt_mobile) fields.push(['ALT MOBILE', record.alt_mobile]);
        if (record.address) fields.push(['ADDRESS', record.address]);
        if (record.email) fields.push(['EMAIL', record.email]);
        if (record.circle) fields.push(['CIRCLE', record.circle]);
        if (record.id_number) fields.push(['ID NUMBER', record.id_number]);

        var fieldsHtml = fields.map(function(f) {
            return '<div class="result-field"><div class="result-field-label">' + f[0] +
                '</div><div class="result-field-value">' + escapeHtml(f[1]) + '</div></div>';
        }).join('');

        html +=
            '<div class="result-card" style="animation-delay:' + (idx * 0.06) + 's">' +
            '<div class="result-card-header">' +
            '<div class="result-avatar"><i class="fas fa-user"></i></div>' +
            '<span class="result-name">' + escapeHtml(record.name || 'Unknown') + '</span>' +
            '<span class="result-badge">#' + (idx + 1) + '</span></div>' +
            '<div class="result-grid">' + fieldsHtml + '</div></div>';
    });

    container.innerHTML = html;
}

/* ===== COPY / DOWNLOAD ===== */
var REPORT_FIELDS = [
    ['Name', 'name'], ['Father\'s Name', 'father_name'], ['Mobile', 'mobile'],
    ['Alt Mobile', 'alt_mobile'], ['Address', 'address'], ['Email', 'email'],
    ['Circle', 'circle'], ['ID Number', 'id_number']
];

function getReportText() {
    if (!currentResults || !currentResults.length) return '';
    var now = new Date();
    var dateStr = now.toLocaleString('en-IN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
    var rid = 'X1-' + now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '-' + Math.random().toString(36).substr(2,6).toUpperCase();
    var typeLabel = currentType === 'mobile' ? 'Mobile Number Trace' : 'ID Number Trace';

    var out = ['X1 INTELLIGENCE REPORT', '======================', '',
        'Report ID: ' + rid, 'Date: ' + dateStr, 'Type: ' + typeLabel, 'Query: ' + currentQuery,
        '', '--------------------------------------------------------------------------------', ''];

    currentResults.forEach(function(r, i) {
        out.push('--- RECORD ' + (i+1) + ' OF ' + currentResults.length + ' ---');
        out.push('');
        REPORT_FIELDS.forEach(function(f) {
            if (r[f[1]]) out.push(f[0] + ': ' + String(r[f[1]]).trim());
        });
        out.push('');
    });

    out.push('--------------------------------------------------------------------------------');
    out.push('END OF REPORT — X1 INTELLIGENCE SYSTEM — CONFIDENTIAL');
    return out.join('\r\n');
}

function copyReportToClipboard() {
    if (!currentResults || !currentResults.length) return;
    var text = getReportText();
    navigator.clipboard.writeText(text).then(function() {
        var btn = document.querySelector('.btn-action');
        if (btn) {
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> COPIED';
            btn.classList.add('copied');
            setTimeout(function() { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
        }
    }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    });
}

function downloadReportAsText() {
    if (!currentResults || !currentResults.length) return;
    var text = getReportText();
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'X1_Report_' + currentQuery + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
}

/* ===== HELPERS ===== */
function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

function escapeHtml(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', function() {
    showView('login');

    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        var errEl = document.getElementById('login-error');
        var btn = e.target.querySelector('button');
        var uname = document.getElementById('login-username').value.trim();
        var pass = document.getElementById('login-password').value;

        if (!uname || !pass) {
            errEl.textContent = '> All fields are required';
            return;
        }

        btn.disabled = true;
        btn.querySelector('span').textContent = 'AUTHENTICATING...';
        errEl.textContent = '';

        try {
            await doLogin(uname, pass);
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
            showView('app');
            showPage('dashboard');
        } catch (err) {
            errEl.textContent = '> ' + err.message;
        } finally {
            btn.disabled = false;
            btn.querySelector('span').textContent = 'ACCESS SYSTEM';
        }
    });

    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });

    document.getElementById('nav-brand').addEventListener('click', function() { showPage('dashboard'); });

    document.getElementById('hamburger').addEventListener('click', function() {
        document.getElementById('hamburger').classList.toggle('open');
        document.getElementById('nav-links').classList.toggle('open');
    });

    document.querySelectorAll('.dash-card').forEach(function(card) {
        card.addEventListener('click', function() { showPage(card.dataset.goto); });
    });

    document.querySelectorAll('.btn-back').forEach(function(btn) {
        btn.addEventListener('click', function() { showPage(btn.dataset.goto); });
    });

    document.getElementById('mobile-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        var val = document.getElementById('mobile-input').value.trim();
        if (!val || val.length < 10) { document.getElementById('mobile-input').focus(); return; }

        var promise = apiLookup('mobile', val);
        var result = await runHackingAnimation(promise);

        if (result && !result.error && result.data) {
            renderResults('mobile-results', result.data, val, 'mobile');
        } else {
            renderResults('mobile-results', null, val, 'mobile');
        }
    });

    document.getElementById('id-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        var val = document.getElementById('id-input').value.trim();
        if (!val) { document.getElementById('id-input').focus(); return; }

        var promise = apiLookup('id', val);
        var result = await runHackingAnimation(promise);

        if (result && !result.error && result.data) {
            renderResults('id-results', result.data, val, 'id');
        } else {
            renderResults('id-results', null, val, 'id');
        }
    });
});
