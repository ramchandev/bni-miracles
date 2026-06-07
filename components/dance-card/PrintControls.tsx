"use client";

export default function PrintControls() {
  return (
    <div
      className="no-print"
      style={{
        background: "#1A1A2E",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <span style={{ color: "white", fontFamily: "Arial", fontSize: 14, fontWeight: 600 }}>
        🎴 BNI Miracles Dance Card — Print Preview
      </span>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#C8102E",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "Arial",
          }}
        >
          🖨️ Save as PDF / Print
        </button>
        <button
          onClick={() => window.close()}
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "Arial",
          }}
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
