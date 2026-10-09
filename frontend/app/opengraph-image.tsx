import { ImageResponse } from "next/og";

// Image metadata (per Next.js file-convention docs)
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Static social preview: warm paper background, ink wordmark,
// one-line capability statement, and a bordered score stamp.
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
          background: "#F6F3EC",
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
              borderRadius: "10px",
              border: "3px solid #1C1B17",
              background: "#FBF9F3",
              color: "#1C1B17",
              fontSize: "28px",
              fontWeight: 800,
              fontFamily: "Georgia, serif",
              marginRight: "18px",
            }}
          >
            A
          </div>
          <div style={{ fontSize: "30px", fontWeight: 700, color: "#1C1B17", fontFamily: "Georgia, serif" }}>
            ATS Builder
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "62px",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#1C1B17",
            marginBottom: "24px",
            fontFamily: "Georgia, serif",
          }}
        >
          A resume that passes the <span style={{ color: "#1E5B3E" }}>parser</span> before it reaches a human.
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#B3402A",
              border: "3px solid #B3402A",
              borderRadius: "8px",
              padding: "8px 20px",
              marginRight: "20px",
            }}
          >
            88 / 100
          </div>
          <div style={{ fontSize: "24px", color: "#6B675C" }}>
            Parse check passed · JD keyword scoring · PDF + DOCX
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
