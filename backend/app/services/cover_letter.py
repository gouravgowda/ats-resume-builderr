"""
Cover letter generation service — uses Groq API.
Takes resume data + job description and generates a tailored cover letter.
Never invents information — only uses data from the resume.
"""
from fastapi import HTTPException
from groq import AsyncGroq

from app.config import settings
from app.schemas import ResumeOut

SYSTEM_PROMPT = """You are a professional cover letter writer. Your task is to write a concise, professional cover letter (3-4 paragraphs) tailored to a specific job description, using ONLY the information present in the candidate's resume.

Rules you MUST follow:
1. NEVER invent, fabricate, or assume any information not present in the resume data provided.
2. Reference specific experience, skills, and accomplishments from the resume that align with the job description.
3. Use a professional, confident tone — no filler phrases like "I believe I would be a great fit" or "I am passionate about".
4. Keep it concise: 3-4 paragraphs total.
5. First paragraph: brief introduction and the role being applied for.
6. Middle paragraph(s): connect specific resume experience/skills to the JD requirements.
7. Final paragraph: confident closing with a call to action.
8. Do not use em dashes (—). Use commas or semicolons instead.
9. Output ONLY the cover letter text. No subject lines, no "Dear Hiring Manager" prefix explanations, no markdown formatting.
10. Address the letter to the Hiring Manager (or the company name if provided)."""


def _build_resume_context(resume: ResumeOut) -> str:
    """Extract structured text from the resume for the prompt."""
    parts: list[str] = []

    if resume.contact:
        parts.append(f"Candidate name: {resume.contact.full_name}")
        parts.append(f"Email: {resume.contact.email}")

    for section in resume.sections:
        section_type = section.type.value.capitalize()
        parts.append(f"\n--- {section_type} ---")
        for entry in section.entries:
            payload = entry.payload
            details = ", ".join(f"{k}: {v}" for k, v in payload.items() if v)
            if details:
                parts.append(details)
            for bullet in entry.bullets:
                text = bullet.improved_text or bullet.raw_text
                parts.append(f"  - {text}")

    return "\n".join(parts)


async def generate_cover_letter(
    resume: ResumeOut,
    jd_text: str,
    company_name: str | None = None,
) -> str:
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Cover letter generation is unavailable — GROQ_API_KEY is not configured.",
        )

    resume_context = _build_resume_context(resume)

    addressee = f"the hiring manager at {company_name}" if company_name else "the hiring manager"

    user_message = (
        f"Write a cover letter addressed to {addressee} for the following job description, "
        f"using ONLY the candidate's resume data below.\n\n"
        f"=== RESUME DATA ===\n{resume_context}\n\n"
        f"=== JOB DESCRIPTION ===\n{jd_text}"
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
        max_tokens=2000,
    )

    text = (response.choices[0].message.content or "").strip()
    return text
