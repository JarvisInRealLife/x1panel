from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv
from functools import wraps
import os
import requests as http_requests

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', os.urandom(24).hex())
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_PERMANENT'] = False

if os.getenv('RENDER') or os.getenv('PRODUCTION'):
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['PREFERRED_URL_SCHEME'] = 'https'

API_BASE_URL = os.getenv('API_BASE_URL')
API_KEY = os.getenv('API_KEY')


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request'}), 400

    username = data.get('username', '')
    password = data.get('password', '')

    env_username = os.getenv('X1_USERNAME')
    env_password = os.getenv('X1_PASSWORD')

    if not env_username or not env_password:
        return jsonify({'error': 'System credentials not configured.'}), 500

    if username == env_username and password == env_password:
        session.clear()
        session['logged_in'] = True
        session.permanent = False
        return jsonify({'success': True})

    return jsonify({'error': 'ACCESS DENIED — Invalid credentials'}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})


@app.route('/api/check-auth')
def check_auth():
    if session.get('logged_in'):
        return jsonify({'authenticated': True})
    return jsonify({'authenticated': False}), 401


@app.route('/api/lookup/mobile', methods=['POST'])
@login_required
def lookup_mobile():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request'}), 400
    term = data.get('term', '').strip()

    if not term:
        return jsonify({'error': 'Mobile number is required'}), 400

    try:
        resp = http_requests.get(API_BASE_URL, params={
            'key': API_KEY,
            'type': 'mobile',
            'term': term
        }, timeout=60)

        result = resp.json()

        if result.get('success') and result.get('data', {}).get('status') == 'success':
            raw = result['data'].get('data', [])
            if not raw:
                return jsonify({'success': False, 'error': 'No records found for this number'})

            normalized = []
            for r in raw:
                normalized.append({
                    'name': r.get('name', ''),
                    'father_name': r.get('father_name', ''),
                    'mobile': r.get('mobile', ''),
                    'alt_mobile': r.get('alt_mobile', ''),
                    'address': r.get('address', ''),
                    'email': r.get('email', ''),
                    'circle': r.get('circle', ''),
                    'id_number': str(r.get('id_number', ''))
                })
            return jsonify({'success': True, 'data': normalized, 'query': term, 'type': 'mobile'})
        else:
            return jsonify({'success': False, 'error': 'No records found or API error'})

    except http_requests.Timeout:
        return jsonify({'success': False, 'error': 'Request timed out. Try again.'})
    except http_requests.ConnectionError:
        return jsonify({'success': False, 'error': 'Could not connect to the lookup service.'})
    except Exception as e:
        return jsonify({'success': False, 'error': f'Unexpected error: {str(e)}'})


@app.route('/api/lookup/id', methods=['POST'])
@login_required
def lookup_id():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request'}), 400
    term = data.get('term', '').strip()

    if not term:
        return jsonify({'error': 'ID number is required'}), 400

    try:
        resp = http_requests.get(API_BASE_URL, params={
            'key': API_KEY,
            'type': 'id_number',
            'term': term
        }, timeout=60)

        result = resp.json()

        if result.get('success') and result.get('data', {}).get('status') == 'success':
            raw = result['data'].get('data', [])
            if not raw:
                return jsonify({'success': False, 'error': 'No records found for this ID'})

            normalized = []
            seen = set()
            for r in raw:
                key = (r.get('name', ''), r.get('mobile', ''))
                if key in seen:
                    continue
                seen.add(key)
                normalized.append({
                    'name': r.get('name', ''),
                    'father_name': r.get('fname', ''),
                    'mobile': r.get('mobile', ''),
                    'alt_mobile': r.get('alt', ''),
                    'address': r.get('address', ''),
                    'email': r.get('email', ''),
                    'circle': '',
                    'id_number': str(r.get('id', ''))
                })
            return jsonify({'success': True, 'data': normalized, 'query': term, 'type': 'id'})
        else:
            return jsonify({'success': False, 'error': 'No records found or API error'})

    except http_requests.Timeout:
        return jsonify({'success': False, 'error': 'Request timed out. Try again.'})
    except http_requests.ConnectionError:
        return jsonify({'success': False, 'error': 'Could not connect to the lookup service.'})
    except Exception as e:
        return jsonify({'success': False, 'error': f'Unexpected error: {str(e)}'})


@app.errorhandler(404)
def not_found(e):
    return render_template('index.html'), 200


@app.errorhandler(500)
def server_error(e):
    return render_template('index.html'), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true', port=port)
