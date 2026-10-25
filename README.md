# Bittu Kumar Singh — Portfolio

Responsive portfolio built with HTML, CSS, JavaScript and FastAPI.

## 1. Install

Create and activate a virtual environment (recommended), then run:

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Ubuntu/Linux/macOS:
source .venv/bin/activate

python -m pip install -r requirements.txt
```

## 2. Run the site

From the project root (the folder containing `main.py`):

```bash
uvicorn main:app --reload
```

Open http://127.0.0.1:8000

API docs: http://127.0.0.1:8000/docs  
Health check: http://127.0.0.1:8000/api/health

You can also run `python main.py`.

## 3. Add your photos

- Add your own portrait as `static/images/profile.jpg`.
- Optional: add a workspace photo as `static/images/workspace.jpg`.
- The portrait section shows initials if `profile.jpg` is missing.

Use photos you own or have permission to use.

## 4. Personalize it

- Edit name, intro, stats, skills and project data in `main.py` (`/api/portfolio`).
- Update GitHub, LinkedIn, Instagram and email links in `static/index.html`.
- Add a resume PDF at `static/images/resume.pdf`, then change the `resumeLink` in `static/index.html` to `/static/images/resume.pdf` and add the `download` attribute.
- Replace project `#` links with real repository/demo links.

## Contact form note

The form sends data to `POST /api/contact`. This starter endpoint validates the fields and returns a demo response. It **does not send an email or store messages**. Connect an email provider or database before publishing the portfolio.

Before production deployment, restrict CORS origins in `main.py` to your actual domain.
