# Create private repo and push

GitHub CLI (`gh`) is installed. Use either option below.

**If your terminal says "gh is not recognized"**, run this first (adds gh to PATH for this session):

```powershell
$env:Path += ";C:\Program Files\GitHub CLI"
```

---

## Option A: GitHub CLI (one-time login, then one command)

**1. Log in to GitHub (do this once):**

```powershell
gh auth login
```

- Choose **GitHub.com** → **HTTPS** → **Login with a web browser**
- Complete the login in your browser

**2. Create the private repo and push:**

```powershell
cd c:\Users\Shreshth\Desktop\HackingPanel
gh repo create x1panel --private --source=. --remote=origin --push
```

This creates a **private** repo named `x1panel` under your account and pushes your code.

---

## Option B: Create repo on GitHub, then push

**1. Create the repo:**  
Go to **https://github.com/new** → name: `x1panel` → set **Private** → Create (do not add README).

**2. Push from Cursor terminal:**

```powershell
cd c:\Users\Shreshth\Desktop\HackingPanel
git remote remove origin
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/x1panel.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username. Sign in when prompted.
