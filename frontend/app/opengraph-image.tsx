import { ImageResponse } from "next/og";

// Image metadata (per Next.js file-convention docs)
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Static social preview: light brand background, product name,
// one-line capability statement, and a score badge.
// Flexbox + inline styles only (supported subset).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          background: "#eff2f9",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: "#0078d4",
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: 800,
              marginRight: "18px",
            }}
          >
            A
          </div>
          <div style={{ fontSize: "30px", fontWeight: 700, color: "#181f27" }}>
            ATS Builder
          </div>
        </div>
        <div
          style={{
            fontSize: "62px",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#181f27",
            marginBottom: "24px",
          }}
        >
          A resume that passes the parser before it reaches a human.
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#ffffff",
              background: "#eca20a",
              borderRadius: "8px",
              padding: "10px 22px",
              marginRight: "20px",
            }}
          >
            87 / 100
          </div>
          <div style={{ fontSize: "24px", color: "#4b5563" }}>
            Parse check passed · JD keyword scoring · PDF + DOCX
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
