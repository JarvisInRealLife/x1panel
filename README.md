# X1 Panel

Intelligence lookup panel: trace by mobile number or ID number (login-protected).

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your X1_USERNAME, X1_PASSWORD, SECRET_KEY, API_KEY, API_BASE_URL
python app.py
```

Open http://localhost:5000

## Deploy on Render

1. Push this repo to GitHub.
2. [Render](https://render.com) → **New** → **Web Service**.
3. Connect the repo `KaushikShresth07/x1panel`.
4. **Environment**: Docker.
5. Add environment variables in the Render dashboard:
   - `X1_USERNAME` – login username
   - `X1_PASSWORD` – login password
   - `SECRET_KEY` – long random string (or use Render’s “Generate” for SECRET_KEY)
   - `API_KEY` – e.g. `SHIVAM`
   - `API_BASE_URL` – e.g. `https://aetherosint.site/cutieee/api.php`
6. Deploy. Render sets `PORT` automatically.

## Docker (local)

```bash
docker build -t x1panel .
docker run -p 5000:5000 -e X1_USERNAME=admin -e X1_PASSWORD=secret -e SECRET_KEY=your-secret -e API_KEY=SHIVAM -e API_BASE_URL=https://aetherosint.site/cutieee/api.php x1panel
```
