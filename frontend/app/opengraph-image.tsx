import { ImageResponse } from "next/og";
import { CLINIC_NAME } from "@/lib/types";

export const alt = "Bright Smile Dental Clinic — Patient Intake";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F2",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
            fontSize: 24,
            color: "#4B5A55",
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#0E7C66" }} />
          Patient intake, triaged in minutes
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 100,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            color: "#16231F",
            textAlign: "center",
            lineHeight: 1.02,
            fontFamily: "sans-serif",
          }}
        >
          {CLINIC_NAME}
        </div>
      </div>
    ),
    { ...size }
  );
}
