"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogoMark } from "@/components/LogoMark";

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

      {/* ── Masthead ── */}
      <nav
        style={{
          borderBottom: "1px solid var(--bg-border)",
          background: "var(--bg-base)",
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
            height: "60px",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <LogoMark />
            <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "1.05rem", color: "var(--text-primary)" }}>
              ATS Builder
            </span>
          </Link>
          <div className="landing-nav-links">
            <NavAnchor href="#parse">Parse check</NavAnchor>
            <NavAnchor href="#score">Score</NavAnchor>
            <NavAnchor href="#features">Toolkit</NavAnchor>
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
        <section style={{ padding: "4.5rem 0 3.5rem" }}>
          <div className="container landing-hero">
            <div>
              <span className="kicker" style={{ marginBottom: "1.25rem" }}>
                A tool that shows its work
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2.1rem, 4.5vw, 3.1rem)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.015em",
                  marginBottom: "1.25rem",
                }}
              >
                A resume that passes the{" "}
                <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--accent)" }}>
                  parser
                </em>{" "}
                before it reaches a human.
              </h1>
              <p
                style={{
                  fontSize: "1.02rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "1.75rem",
                  maxWidth: "520px",
                }}
              >
                Write your experience once. ATS Builder renders a clean
                single-column PDF, reads the finished file back to prove every
                section survived, and scores it against the job description you
                are targeting.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <Link
                  href={user ? "/dashboard" : "/auth/register"}
                  className="btn btn-primary btn-lg"
                >
                  {user ? "Open dashboard" : "Build my resume"}
                  <span className="btn-arrow">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
                <Link href="#score" className="btn btn-secondary btn-lg">
                  See the score breakdown
                </Link>
              </div>
              <p className="mono-label" style={{ letterSpacing: "0.12em" }}>
                Free while in development · PDF + DOCX export · Data in your own Firebase project
              </p>
            </div>

            {/* Artifact: the parse ledger */}
            <div
              style={{ maxWidth: 440, marginLeft: "auto", width: "100%" }}
              aria-label="Sample parse ledger: five sections passed, 98 percent parse accuracy"
            >
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderTop: "2px solid var(--ink)",
                  borderRadius: 4,
                  padding: "1.25rem 1.25rem 1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    paddingBottom: "0.625rem",
                    borderBottom: "1px solid var(--ink)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.18em", color: "var(--ink)" }}>
                    PARSE LEDGER
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                    NO. 1042-A
                  </span>
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  <LedgerRow label="Contact block" value={<Stamp>Pass</Stamp>} />
                  <LedgerRow label="Education" value={<Stamp>Pass</Stamp>} />
                  <LedgerRow label="Experience" value={<Stamp>Pass</Stamp>} />
                  <LedgerRow label="Skills" value={<Stamp>Pass</Stamp>} />
                  <LedgerRow label="Section order" value={<Stamp>Pass</Stamp>} />
                  <LedgerRow label="Tables, images, icons" value={<Stamp tone="none">None</Stamp>} />
                </div>

                <div style={{ borderTop: "1px solid var(--bg-border)", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
                  <LedgerRow
                    label="Parse accuracy"
                    value={<span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)" }}>98%</span>}
                  />
                  <LedgerRow
                    label="Keyword coverage"
                    value={<span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)" }}>24 / 31</span>}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quiet strip ── */}
        <section style={{ padding: "0 0 0.5rem" }}>
          <div className="container">
            <div
              className="mono-label"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem 1.75rem",
                justifyContent: "center",
                padding: "0.875rem 0",
                borderTop: "1px solid var(--bg-border)",
                borderBottom: "1px solid var(--bg-border)",
                letterSpacing: "0.1em",
              }}
            >
              <span>Open source, self-hostable with Docker</span>
              <span>Deterministic scoring, no black box</span>
              <span>Every run saved to score history</span>
              <span>Import your existing PDF</span>
            </div>
          </div>
        </section>

        {/* ── 01 · Parse check ── */}
        <section id="parse" style={{ padding: "3.5rem 0", borderTop: "1px solid var(--bg-border)", scrollMarginTop: "80px" }}>
          <div className="container" style={{ maxWidth: "820px" }}>
            <IndexHeading number="01" title="The PDF is read back before anyone else reads it" />
            <div style={{ display: "grid", gap: "1.75rem", gridTemplateColumns: "1fr" }}>
              <div>
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "1rem" }}>
                  Export runs a headless browser, so the PDF carries real
                  selectable text — single column, no tables, no icons, no
                  flattened images. The finished file is then fed through a text
                  extractor, the same class of tool an ATS uses, and the
                  extracted text is compared section by section against what you
                  typed.
                </p>
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>
                  If accuracy comes back under 95%, export stays blocked and the
                  report names the section that broke. Fix it, re-run, export
                  when it passes. Nothing about the check is hidden — the
                  accuracy number and the diff are shown every time.
                </p>
              </div>
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 4,
                  padding: "1rem 1.25rem",
                }}
              >
                <p className="mono-label" style={{ letterSpacing: "0.14em", marginBottom: "0.625rem" }}>
                  Checked on every export
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Stamp>Contact</Stamp>
                  <Stamp>Education</Stamp>
                  <Stamp>Experience</Stamp>
                  <Stamp>Skills</Stamp>
                  <Stamp>Order</Stamp>
                  <Stamp>Dates</Stamp>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 · Score ── */}
        <section id="score" style={{ padding: "3.5rem 0", borderTop: "1px solid var(--bg-border)", scrollMarginTop: "80px" }}>
          <div className="container" style={{ maxWidth: "820px" }}>
            <IndexHeading number="02" title="A score you can check line by line" />
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "1.75rem" }}>
              Paste a job description and the total becomes a weighted check of
              five things. Every number traces back to a rule you can read, and
              every run is saved so you can watch the total move as you fix
              issues.
            </p>
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                borderRadius: 4,
                padding: "1.25rem 1.25rem 1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  paddingBottom: "0.625rem",
                  borderBottom: "1px solid var(--ink)",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.18em", color: "var(--ink)" }}>
                  SAMPLE RUN
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 600, color: "var(--ink)" }}>
                  TOTAL 88 / 100
                </span>
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                {SAMPLE_SCORES.map((s) => (
                  <LedgerRow
                    key={s.label}
                    label={
                      <>
                        {s.label}{" "}
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                          ({s.weight})
                        </span>
                      </>
                    }
                    value={
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)" }}>
                        {s.value}%
                      </span>
                    }
                  />
                ))}
              </div>
            </div>
            <p className="mono-label" style={{ marginTop: "1rem", lineHeight: 1.7 }}>
              The score measures the document — parseability and keyword overlap — not your odds with any employer.
            </p>
          </div>
        </section>

        {/* ── 03 · Toolkit ── */}
        <section id="features" style={{ padding: "3.5rem 0", borderTop: "1px solid var(--bg-border)", scrollMarginTop: "80px" }}>
          <div className="container" style={{ maxWidth: "820px" }}>
            <IndexHeading number="03" title="The rest of the toolkit" />
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
              One example first. A weak bullet goes in, an honest one comes out —
              the rewriter starts with an action verb and asks you for the
              number when a metric is missing. It never invents one.
            </p>
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                borderLeft: "2px solid var(--ink)",
                borderRadius: 4,
                padding: "1.25rem",
                marginBottom: "2rem",
              }}
            >
              <p className="mono-label" style={{ letterSpacing: "0.14em", marginBottom: "0.375rem" }}>Before</p>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem", textDecoration: "line-through", textDecorationColor: "var(--seal)" }}>
                Responsible for working on backend APIs and helping reduce slow responses.
              </p>
              <p className="mono-label" style={{ letterSpacing: "0.14em", marginBottom: "0.375rem" }}>After</p>
              <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.65 }}>
                Built a FastAPI endpoint serving 12,000 daily requests, cutting response time by 34%.
              </p>
            </div>
            <div>
              {TOOLKIT.map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(150px, 220px) 1fr",
                    gap: "0.25rem 1.75rem",
                    padding: "0.875rem 0",
                    borderTop: "1px solid var(--bg-border)",
                  }}
                >
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ padding: "3.5rem 0", borderTop: "1px solid var(--bg-border)", scrollMarginTop: "80px" }}>
          <div className="container" style={{ maxWidth: "700px" }}>
            <span className="kicker" style={{ marginBottom: "1rem" }}>FAQ</span>
            <h2 style={{ fontSize: "clamp(1.35rem, 2.6vw, 1.75rem)", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
              Questions worth answering honestly
            </h2>
            {FAQS.map((f) => (
              <details key={f.q} className="faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final note ── */}
        <section style={{ padding: "3.5rem 0 4.5rem", borderTop: "1px solid var(--bg-border)" }}>
          <div className="container" style={{ maxWidth: "700px" }}>
            <div
              className="card"
              style={{
                borderTop: "2px solid var(--ink)",
                padding: "2rem",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.625rem", color: "var(--text-primary)" }}>
                Check whether your resume survives a parser.
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", marginBottom: "1.5rem", lineHeight: 1.7 }}>
                Import your current PDF or start from scratch. The first parse
                check takes about a minute.
              </p>
              <p className="mono-label" style={{ letterSpacing: "0.1em", marginBottom: "1.5rem" }}>
                01 Enter or import · 02 Verify and score · 03 Fix, tailor, export — about fifteen minutes
              </p>
              <Link href={user ? "/dashboard" : "/auth/register"} className="btn btn-primary">
                {user ? "Open dashboard" : "Start free"}
                <span className="btn-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Colophon footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--bg-border)",
          padding: "2.75rem 0 1.75rem",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
        }}
      >
        <div className="container">
          <div className="landing-footer-grid" style={{ marginBottom: "1.75rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <LogoMark />
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: "var(--text-primary)" }}>ATS Builder</span>
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.6, maxWidth: "260px" }}>
                Real selectable-text PDF resumes with parse-back verification.
              </p>
            </div>
            <nav aria-label="Product">
              <p className="mono-label" style={{ letterSpacing: "0.14em", marginBottom: "0.75rem" }}>PRODUCT</p>
              <Link href="#parse">Parse check</Link>
              <Link href="#score">Score</Link>
              <Link href="#features">Toolkit</Link>
              <Link href="#faq">FAQ</Link>
            </nav>
            <nav aria-label="Account">
              <p className="mono-label" style={{ letterSpacing: "0.14em", marginBottom: "0.75rem" }}>ACCOUNT</p>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/auth/login">Sign in</Link>
              <Link href="/auth/register">Get started</Link>
            </nav>
            <nav aria-label="Resources">
              <p className="mono-label" style={{ letterSpacing: "0.14em", marginBottom: "0.75rem" }}>RESOURCES</p>
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
            <span>ATS Builder · Set in Fraunces and Inter.</span>
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

function IndexHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="index-heading" style={{ marginBottom: "1.5rem" }}>
      <span className="index-number">{number}</span>
      <h2 style={{ fontSize: "clamp(1.35rem, 2.6vw, 1.75rem)", color: "var(--text-primary)" }}>{title}</h2>
    </div>
  );
}

function Stamp({ children, tone = "pass" }: { children: React.ReactNode; tone?: "pass" | "none" }) {
  if (tone === "none") {
    return (
      <span className="badge" style={{ color: "var(--text-muted)" }}>{children}</span>
    );
  }
  return <span className="badge badge-success">{children}</span>;
}

function LedgerRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="leader-row" style={{ padding: "0.4rem 0", borderBottom: "1px solid var(--bg-border)" }}>
      <span style={{ fontSize: "0.82rem", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{label}</span>
      <span className="leader-fill" />
      {value}
    </div>
  );
}

// ── Content data (all claims specific and true) ───────────────────────────────
const SAMPLE_SCORES = [
  { label: "Parse quality", weight: "30%", value: 98 },
  { label: "Keyword match", weight: "30%", value: 80 },
  { label: "Bullet quality", weight: "20%", value: 74 },
  { label: "Completeness", weight: "10%", value: 100 },
  { label: "Formatting", weight: "10%", value: 100 },
];

const TOOLKIT = [
  {
    title: "ATS-safe PDF export",
    description:
      "Single-column layout with selectable text, rendered by a headless browser. Two templates: Clean and Minimal.",
  },
  {
    title: "PDF import",
    description:
      "Upload an existing resume and the extracted text lands in editable sections, so you never start from a blank page.",
  },
  {
    title: "Bullet rewriting",
    description:
      "An LLM turns weak bullets into action-verb statements with measurable results, and asks you when a metric is missing.",
  },
  {
    title: "Tailored copies",
    description:
      "Duplicate a base resume per application, with its own keyword coverage and score history for each version.",
  },
  {
    title: "Cover letters",
    description:
      "Generated from your resume and the job post, referencing only the information your resume actually contains.",
  },
  {
    title: "DOCX export",
    description:
      "Built from the same structured data as the PDF, so the two files always agree.",
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
