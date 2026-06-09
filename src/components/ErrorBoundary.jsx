import { Component } from "react";
import { C } from "../data/constants.js";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Délai pour laisser React commit le state avant le reload
    setTimeout(() => window.location.reload(), 0);
  };

  render() {
    if (this.state.hasError) {
      // ── Fallback colors si C n'est pas dispo (très rare mais robuste) ──
      const bg     = C?.bg     || "#0B1220";
      const accent = C?.accent || "#3B82F6";
      const s1     = C?.s1     || "#111827";
      const text   = C?.text   || "#F2F4F7";
      const mid    = C?.mid    || "rgba(242,244,247,0.50)";

      return (
        <div style={{
          minHeight: "100vh", background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, flexDirection: "column", textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <div style={{
            fontFamily: "'Outfit','DM Sans',system-ui,sans-serif",
            fontSize: 18, fontWeight: 600, color: text, marginBottom: 8,
          }}>
            Une erreur est survenue
          </div>
          <div style={{
            fontSize: 12, color: mid, marginBottom: 24,
            maxWidth: 320, lineHeight: 1.6,
            fontFamily: "'Outfit','DM Sans',system-ui,sans-serif",
          }}>
            {this.state.error?.message || "Erreur inattendue"}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              padding: "12px 24px", background: accent, border: "none",
              borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit','DM Sans',system-ui,sans-serif",
              boxShadow: `0 4px 12px ${accent}40`,
            }}
          >
            Recharger l'application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
