"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const API_DOCS_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`;

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* ── Navigation ── */}
      <nav
        style={{
          borderBottom: "1px solid var(--bg-border)",
          background: "#ffffff",
          boxShadow: "0 0 2px 0 rgb(121 121 121 / 50%)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <LogoMark />
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              ATS Builder
            </span>
          </Link>
          <div className="landing-nav-links">
            <NavAnchor href="#features">Features</NavAnchor>
            <NavAnchor href="#how-it-works">How it works</NavAnchor>
            <NavAnchor href="#sample">Sample output</NavAnchor>
            <NavAnchor href="#faq">FAQ</NavAnchor>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section style={{ padding: "4rem 0 3.5rem", background: "var(--bg-elevated)" }}>
          <div className="container landing-hero">
            <div>
              <h1
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3rem)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1.12,
                  marginBottom: "1.125rem",
                }}
              >
                A resume that passes the parser{" "}
                <span style={{ color: "var(--accent)" }}>before</span> it
                reaches a human.
              </h1>
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "0.75rem",
                  maxWidth: "540px",
                }}
              >
                Write your experience once. ATS Builder renders a clean
                single-column PDF, re-reads the file to prove every section
                survived, and scores it against the job you are applying for.
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "1.75rem",
                }}
              >
                No account needed to look around. Export requires a free sign-in.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link
                  href={user ? "/dashboard" : "/auth/register"}
                  className="btn btn-primary btn-lg"
                >
                  {user ? "Open dashboard" : "Build my resume"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="#sample" className="btn btn-secondary btn-lg">
                  See a sample score
                </Link>
              </div>
            </div>

            {/* Product visual: rendered resume + verification card */}
            <div style={{ position: "relative" }} aria-label="Preview of a generated resume and its verification result">
              <div
                className="card"
                style={{
                  background: "#f8fafc",
                  borderColor: "var(--bg-border)",
                  borderRadius: 10,
                  padding: "1.5rem 1.5rem 1.75rem",
                  maxWidth: 420,
                  marginLeft: "auto",
                }}
              >
                <p style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.05rem", textAlign: "center", letterSpacing: "-0.01em" }}>
                  Prabhakar
                </p>
                <p style={{ color: "#475569", fontSize: "0.68rem", textAlign: "center", marginTop: "0.15rem" }}>
                  prabhakar@example.com · Bengaluru · linkedin.com/in/prabhakar
                </p>
                <div style={{ borderTop: "2px solid #0f172a", margin: "0.75rem 0 0.5rem" }} />
                <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em" }}>EXPERIENCE</p>
                <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.75rem", marginTop: "0.3rem" }}>
                  Backend Intern, Northwind Labs <span style={{ fontWeight: 400, color: "#475569" }}>· Jun 2024 to Aug 2024</span>
                </p>
                <ul style={{ color: "#334155", fontSize: "0.72rem", lineHeight: 1.55, marginTop: "0.25rem", paddingLeft: "1rem" }}>
                  <li>Built a FastAPI endpoint serving 12,000 daily requests, cutting response time by 34%.</li>
                  <li>Added pytest coverage for 40 endpoints, reducing regressions from 9 to 2 per release.</li>
                </ul>
                <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", marginTop: "0.6rem" }}>SKILLS</p>
                <p style={{ color: "#334155", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                  Python, FastAPI, PostgreSQL, Docker, pytest
                </p>
              </div>
              <div
                className="card"
                style={{
                  position: "absolute",
                  right: -6,
                  bottom: -24,
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  border: "1px solid rgba(0,120,212,0.35)",
                  background: "var(--bg-elevated)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                }}
              >
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent)" }}>87</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Overall score<br />
                  <span style={{ color: "var(--success)" }}>Parse check passed · 98%</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust strip ── */}
        <section style={{ padding: "0 0 1rem" }}>
          <div className="container">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem 1.75rem",
                justifyContent: "center",
                padding: "1rem 0",
                borderTop: "1px solid var(--bg-border)",
                borderBottom: "1px solid var(--bg-border)",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>Open source, self-hostable with Docker</span>
              <span>Your data stays in your own Firebase project</span>
              <span>Deterministic scoring, no black box</span>
              <span>PDF and DOCX export</span>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" style={{ padding: "3.5rem 0 1rem", scrollMarginTop: "70px" }}>
          <div className="container">
            <SectionHeading
              eyebrow="What it does"
              title="Everything between blank page and submitted application"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1rem",
              }}
            >
              {FEATURES.map((f) => (
                <div key={f.title} className="card">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "var(--accent-glow)",
                      border: "1px solid rgba(0,120,212,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "0.875rem",
                    }}
                  >
                    <f.Icon size={18} color="var(--accent)" />
                  </div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--text-primary)" }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" style={{ padding: "3.5rem 0 1rem", scrollMarginTop: "70px" }}>
          <div className="container" style={{ maxWidth: "860px" }}>
            <SectionHeading
              eyebrow="How it works"
              title="Three steps, about fifteen minutes"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              {STEPS.map((s, i) => (
                <div key={s.title} className="card">
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em" }}>
                    STEP {i + 1}
                  </span>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0.4rem 0", color: "var(--text-primary)" }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sample output ── */}
        <section id="sample" style={{ padding: "3.5rem 0 1rem", scrollMarginTop: "70px" }}>
          <div className="container" style={{ maxWidth: "860px" }}>
            <SectionHeading
              eyebrow="Sample output"
              title="What the checker actually tells you"
            />
            <div className="card" style={{ marginBottom: "1rem" }}>
              <span className="badge badge-accent" style={{ marginBottom: "0.75rem", display: "inline-flex" }}>
                Bullet rewrite
              </span>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Before</p>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem", textDecoration: "line-through", textDecorationColor: "var(--error)" }}>
                Responsible for working on backend APIs and helping reduce slow responses.
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>After</p>
              <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.65 }}>
                Built a FastAPI endpoint serving 12,000 daily requests, cutting response time by 34%.
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                The rewriter starts every bullet with an action verb and asks you for the number when one is missing. It never invents metrics.
              </p>
            </div>
            <div className="card">
              <span className="badge badge-accent" style={{ marginBottom: "0.75rem", display: "inline-flex" }}>
                Score breakdown
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {SAMPLE_SCORES.map((s) => (
                  <div key={s.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{s.label} <span style={{ color: "var(--text-muted)" }}>· {s.weight}</span></span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{s.value}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill progress-fill-accent" style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.875rem", lineHeight: 1.6 }}>
                Every run is saved, so you can watch the total climb as you fix issues. The score measures parseability and keyword overlap, not your odds with any specific employer system.
              </p>
            </div>
          </div>
        </section>

        {/* ── Who it is for ── */}
        <section style={{ padding: "3.5rem 0 1rem" }}>
          <div className="container" style={{ maxWidth: "860px" }}>
            <SectionHeading
              eyebrow="Who it is for"
              title="Built for people applying right now"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              {AUDIENCES.map((a) => (
                <div key={a.title} className="card">
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--text-primary)" }}>
                    {a.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ padding: "3.5rem 0 1rem", scrollMarginTop: "70px" }}>
          <div className="container" style={{ maxWidth: "700px" }}>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions worth answering honestly"
            />
            {FAQS.map((f) => (
              <details key={f.q} className="faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{ padding: "3.5rem 0 4rem" }}>
          <div className="container" style={{ maxWidth: "700px" }}>
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: "2.5rem 1.5rem",
                border: "1px solid rgba(0,120,212,0.3)",
              }}
            >
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Check whether your resume survives a parser.
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Import your current PDF or start from scratch. First parse check takes about a minute.
              </p>
              <Link href={user ? "/dashboard" : "/auth/register"} className="btn btn-primary btn-lg">
                {user ? "Open dashboard" : "Start free"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--bg-border)",
          padding: "2.5rem 0 1.5rem",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
        }}
      >
        <div className="container">
          <div className="landing-footer-grid" style={{ marginBottom: "1.75rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <LogoMark />
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>ATS Builder</span>
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.6, maxWidth: "260px" }}>
                Real selectable-text PDF resumes with parse-back verification.
              </p>
            </div>
            <nav aria-label="Product">
              <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>PRODUCT</p>
              <Link href="#features">Features</Link>
              <Link href="#how-it-works">How it works</Link>
              <Link href="#faq">FAQ</Link>
            </nav>
            <nav aria-label="Account">
              <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>ACCOUNT</p>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/auth/login">Sign in</Link>
              <Link href="/auth/register">Get started</Link>
            </nav>
            <nav aria-label="Resources">
              <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>RESOURCES</p>
              <a href={API_DOCS_URL} target="_blank" rel="noopener noreferrer">API docs</a>
              <Link href="/builder/new">New resume</Link>
            </nav>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--bg-border)",
            }}
          >
            <span>ATS Builder · Demo project. Data is stored in your own Firebase project.</span>
            <span>Scores measure parseability and keyword overlap, not hiring outcomes.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── JSON-LD (SEO) ─────────────────────────────────────────────────────────────
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ATS Resume Builder",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Build ATS-parseable PDF resumes with parse-back verification, JD keyword scoring, and bullet rewriting.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

// ── Bits ──────────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="6" fill="#0078D4" />
      <rect x="7" y="5" width="18" height="22" rx="2" fill="#ffffff" />
      <line x1="10" y1="10" x2="22" y2="10" stroke="#eca20a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="13.5" x2="22" y2="13.5" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="17" x2="18" y2="17" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="20.5" x2="20" y2="20.5" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function NavAnchor({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}
    >
      {children}
    </Link>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <span className="badge badge-accent" style={{ marginBottom: "0.75rem", display: "inline-flex" }}>
        {eyebrow}
      </span>
      <h2 style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>{title}</h2>
    </div>
  );
}

// ── Content data (all claims specific and true) ───────────────────────────────
function FileTextIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function CheckCircleIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function SearchIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function ZapIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function DownloadIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function UploadIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

const FEATURES = [
  {
    Icon: FileTextIcon,
    title: "ATS-safe PDF export",
    description:
      "Single-column layout. No tables, images, icons, or text boxes. Selectable text, not a flattened image. Rendered with a headless browser.",
  },
  {
    Icon: CheckCircleIcon,
    title: "Parse-back verification",
    description:
      "The generated PDF is re-read immediately and diffed against your input. Export stays blocked until parse accuracy reaches 95%.",
  },
  {
    Icon: SearchIcon,
    title: "JD keyword scoring",
    description:
      "Paste a job description. The app extracts required skills, shows what is present or missing, and keeps a history of every run.",
  },
  {
    Icon: ZapIcon,
    title: "Bullet rewriting",
    description:
      "An LLM rewrites weak bullets into action-verb statements with measurable results. It never invents a number and asks you when a metric is missing.",
  },
  {
    Icon: UploadIcon,
    title: "PDF import",
    description:
      "Upload an existing resume. The text is extracted and structured into editable sections so you do not start from a blank page.",
  },
  {
    Icon: DownloadIcon,
    title: "Cover letters and DOCX",
    description:
      "Generate a tailored cover letter from your resume and the job post. Export the resume itself as PDF or DOCX from the same data.",
  },
];

const STEPS = [
  {
    title: "Enter or import your history",
    description:
      "Fill in structured fields for education, experience, projects, and skills, or upload your current PDF and edit what it finds.",
  },
  {
    title: "Verify and score",
    description:
      "Generate the PDF, run the parse-back check, then paste a job description to see keyword overlap and bullet-level issues.",
  },
  {
    title: "Fix, tailor, export",
    description:
      "Rewrite weak bullets, save a tailored copy per application, generate a cover letter, and download PDF or DOCX.",
  },
];

const SAMPLE_SCORES = [
  { label: "Parse quality", weight: "30%", value: 98 },
  { label: "Keyword match", weight: "30%", value: 80 },
  { label: "Bullet quality", weight: "20%", value: 74 },
  { label: "Completeness", weight: "10%", value: 100 },
  { label: "Formatting", weight: "10%", value: 100 },
];

const AUDIENCES = [
  {
    title: "Students and freshers",
    description:
      "One page, standard headings, consistent dates. The completeness check tells you exactly which required field is missing.",
  },
  {
    title: "Experienced hires",
    description:
      "Duplicate a base resume per application, tailor keyword coverage per job post, and keep a score history for each version.",
  },
  {
    title: "Career switchers",
    description:
      "Project entries count alongside experience. The keyword gap list shows which target-role skills your bullets never mention.",
  },
];

const FAQS = [
  {
    q: "Will this resume work with Workday, Greenhouse, or Lever?",
    a: "Those systems parse standard single-column documents reliably, which is what this tool produces and verifies. No tool can guarantee a ranking inside any specific employer system, because those ranking rules are proprietary. What you get here is proof the file itself parses cleanly.",
  },
  {
    q: "What does the score actually mean?",
    a: "It is a weighted check of five things: parse accuracy (30%), keyword overlap with your pasted job description (30%), bullet quality (20%), completeness (10%), and formatting consistency (10%). It measures the document, not your chances.",
  },
  {
    q: "Is my data private?",
    a: "Resumes live in your own Firebase project under your account. Nobody else can read your documents, and deleting a resume removes it and its scores. This demo project has no analytics or tracking beyond what Firebase itself provides.",
  },
  {
    q: "Is it free?",
    a: "Yes while in development. Signing in is free, and PDF, DOCX, scoring, and cover letters cost nothing. The AI bullet rewriting uses a Groq key supplied by whoever hosts the backend.",
  },
  {
    q: "Can I import my existing resume?",
    a: "Yes. Upload your current PDF from the dashboard and the app extracts the text into editable sections. Review everything it finds, since PDF extraction is never perfect, then run the parse check on the regenerated file.",
  },
  {
    q: "PDF or DOCX, which should I submit?",
    a: "Submit whichever the job posting asks for. Both are generated from the same structured data, so they always agree. When the posting does not specify, PDF preserves your layout exactly.",
  },
];
