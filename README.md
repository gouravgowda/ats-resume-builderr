# ATS-Friendly Resume Builder

Generates ATS-parseable PDF resumes with real selectable text, verifies them with a parse-back loop, scores keyword overlap against a job description, and rewrites weak bullets with an LLM (Groq).

> **This score is a proxy for ATS parseability and keyword alignment. It does not predict your ranking in any specific employer's ATS (Workday, Greenhouse, Lever, etc.). No universal ATS score exists.**

---

## Core Technical Differentiator: Parse-Back Verification Loop

After generating a PDF via Playwright, the app immediately re-extracts its text using PyMuPDF and diffs it against the original structured input:

1. User fills in structured fields (education, experience, projects, skills).
2. The app renders a single-column ATS-safe HTML resume and converts it to PDF via Playwright headless browser — real selectable text, not an image.
3. The PDF is parsed by PyMuPDF to extract all text.
4. Extracted text is diffed against the original input, section by section and field by field.
5. If any section is missing, out of order, or garbled, export is blocked with a specific error message.
6. Once parse accuracy reaches 95% or above, PDF and DOCX export become available.

This loop is the reason the templates are intentionally simple: no tables, no text boxes, no multi-column layouts, no images, no icons, no headers/footers holding contact info.

---

## ATS Safety Rules (Baked into Every Template)

- Single column, no tables, no text boxes
- No icons, images, charts, or QR codes
- Standard section headings: Experience, Education, Projects, Skills, Achievements
- Standard font family: Arial (one font per resume)
- Consistent date format: `Mon YYYY` (e.g., `Aug 2024`)
- Simple disc bullet characters only
- Contact information in the main body, not in headers/footers
- One page for students with under 2 years of experience

---

## Scoring Engine

The score is deterministic and explainable — not a black box.

| Component | Weight | Method |
|---|---|---|
| Parse quality | 30% | Re-extract generated PDF, compare sections to input |
| JD keyword match | 30% | Extract skills from pasted JD, match against resume text |
| Bullet quality | 20% | Action-verb start, 12–25 words, metric present, no filler words |
| Completeness | 10% | Name, email, at least one experience/project, skills section |
| Formatting consistency | 10% | Consistent date format (checked in data layer) |

Each sub-score is shown individually in the UI with a plain-language explanation of what was checked and what was found.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, Tailwind CSS |
| Auth | Firebase Authentication (email/password, ID tokens) |
| Backend | FastAPI (Python 3.12) |
| Database | Cloud Firestore (via firebase-admin) |
| PDF rendering | Playwright (headless Chromium) |
| Parse-back | PyMuPDF |
| DOCX export | python-docx |
| LLM | Groq API (bullet rewriting only) |
| Container | Docker + Docker Compose |
| CI | GitHub Actions |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose (optional — local runs work too)
- A free Firebase project (console.firebase.google.com)
- A Groq API key (optional — bullet improvement only; all other features work without it)

### 1. Create the Firebase project

1. Create a project at https://console.firebase.google.com (name it, e.g. `ats-resume-builder`)
2. **Authentication** → Get started → Sign-in method → enable **Email/Password** → Save
3. **Firestore Database** → Create database → Start in **test mode** → pick a location
4. **Project settings → Your apps → `</>` (Web)** → register an app → copy the `firebaseConfig` values into `frontend/.env.local` (see `frontend/.env.local.example`)
5. **Project settings → Service accounts → Generate new private key** → save the JSON as `backend/firebase-service-account.json` (git-ignored)

### 2. Configure environment

```bash
cp .env.example .env
# Fill in GROQ_API_KEY (optional) and the Firebase paths

cp frontend/.env.local.example frontend/.env.local
# Paste your firebaseConfig values from step 4 above
```

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### 4. Run locally (development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
playwright install chromium
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

All endpoints except `/health` and `/auth/me` require a Firebase ID token:
`Authorization: Bearer <idToken>` (the frontend attaches it automatically).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/me` | Create/fetch the signed-in user's Firestore profile |
| POST | `/resumes` | Create resume |
| GET | `/resumes` | List resumes |
| GET | `/resumes/{id}` | Get full resume |
| PUT | `/resumes/{id}/sections` | Update resume sections |
| DELETE | `/resumes/{id}` | Delete resume |
| POST | `/resumes/{id}/bullets/improve` | Improve bullet with LLM |
| POST | `/resumes/{id}/render` | Generate PDF or DOCX |
| GET | `/resumes/{id}/preview-html` | Get raw HTML for preview |
| POST | `/resumes/{id}/parse-check` | Run parse-back verification |
| POST | `/resumes/{id}/score` | Run scoring engine |
| POST | `/resumes/{id}/tailor` | Create JD-tailored copy |

Register and login are handled entirely by Firebase Authentication on the
frontend (see `frontend/lib/firebase.ts`).

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## Design Constraints (PRD Section 7)

These are enforced throughout:
- No purple gradients
- No pill-shaped buttons
- No fake metrics, reviews, or counters
- No emoji used as icons
- No em dashes in UI copy or generated content
- No vague hero copy ("Unlock your potential", etc.)
- No cursor-follow or scroll-triggered gimmick animations
- No "Made with AI" badge
- Custom favicon in place
- Hero copy states a specific capability, not a vague promise

---

## License

MIT
