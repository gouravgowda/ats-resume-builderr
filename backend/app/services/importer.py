"""
PDF resume import service — extracts text from a PDF, sends it to Groq LLM
to parse structured resume data, and builds a Firestore-ready document.
"""
import json
import re

import fitz  # PyMuPDF
from groq import AsyncGroq

from app.config import settings
from app.firebase import new_id, now_iso

SYSTEM_PROMPT = """\
You are a resume parser. Given the raw text extracted from a PDF resume, \
extract structured data and return ONLY valid JSON — no explanation, no \
markdown fences, no extra text.

Return a JSON object with these keys:

{
  "name": "full name",
  "email": "email address or null",
  "phone": "phone number or null",
  "city": "city / location or null",
  "linkedin": "LinkedIn URL or null",
  "github": "GitHub URL or null",
  "portfolio": "portfolio/website URL or null",
  "sections": [
    {
      "type": "education | experience | project | skill | achievement",
      "entries": [
        {
          "payload": { ... },
          "bullets": ["bullet text 1", "bullet text 2"]
        }
      ]
    }
  ]
}

Section type rules:
- "education": payload = {"institution":"","degree":"","field":"","start_date":"","end_date":"","gpa":""}
- "experience": payload = {"company":"","title":"","start_date":"","end_date":"","location":""}
- "project": payload = {"name":"","technologies":"","start_date":"","end_date":"","url":""}
- "skill": payload = {"category":"category name","items":"comma,separated,skills"} — bullets should be empty for skills
- "achievement": payload = {"title":"","date":"","description":""}

Rules:
1. Categorize every section into one of the five types above.
2. Fill as many payload fields as possible from the text; use "" for missing fields.
3. Bullets are the descriptive lines under each entry. For skills, leave bullets empty.
4. Dates should keep their original format from the resume.
5. Return ONLY the JSON object, nothing else."""


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from PDF bytes using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def _strip_code_fences(text: str) -> str:
    """Remove markdown code fences (```json ... ```) if present."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text


async def parse_resume_text(text: str) -> dict:
    """Send extracted text to Groq LLM and return parsed JSON dict."""
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        max_tokens=4096,
        temperature=0.1,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Parse this resume text:\n\n{text}"},
        ],
    )

    raw = (response.choices[0].message.content or "").strip()
    raw = _strip_code_fences(raw)
    return json.loads(raw)


def build_resume_doc(parsed: dict, user_id: str) -> dict:
    """Convert parsed LLM JSON into the Firestore resume document format."""
    resume_id = new_id()
    ts = now_iso()

    contact = {
        "id": new_id(),
        "resume_id": resume_id,
        "full_name": parsed.get("name", ""),
        "email": parsed.get("email") or "",
        "phone": parsed.get("phone") or None,
        "city": parsed.get("city") or None,
        "linkedin": parsed.get("linkedin") or None,
        "github": parsed.get("github") or None,
        "portfolio": parsed.get("portfolio") or None,
    }

    sections = []
    for idx, sec in enumerate(parsed.get("sections", [])):
        entries = []
        for e_idx, entry in enumerate(sec.get("entries", [])):
            bullets = []
            for b_idx, bullet_text in enumerate(entry.get("bullets", [])):
                if not bullet_text:
                    continue
                bullets.append({
                    "id": new_id(),
                    "raw_text": bullet_text,
                    "improved_text": None,
                    "has_metric": False,
                    "order_index": b_idx,
                    "needs_metric_prompt": False,
                    "metric_question": None,
                })
            entries.append({
                "id": new_id(),
                "order_index": e_idx,
                "payload": entry.get("payload", {}),
                "bullets": bullets,
            })
        sections.append({
            "id": new_id(),
            "type": sec.get("type", "experience"),
            "order_index": idx,
            "entries": entries,
        })

    title = parsed.get("name", "Imported Resume")
    if title:
        title = f"{title}'s Resume"
    else:
        title = "Imported Resume"

    return {
        "id": resume_id,
        "user_id": user_id,
        "title": title,
        "created_at": ts,
        "updated_at": ts,
        "is_tailored_copy_of": None,
        "contact": contact,
        "sections": sections,
    }
