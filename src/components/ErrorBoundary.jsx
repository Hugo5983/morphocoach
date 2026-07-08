import { Component } from "react";
import { C, DARK, FONT } from "../data/constants.js";

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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: DARK.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, flexDirection: "column", textAlign: "center",
        }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
          <div style={{
            fontFamily: FONT,
            fontSize: 20, fontWeight: 500, color: "#F5F1E8", marginBottom: 8,
          }}>
            Une erreur est survenue
          </div>
          <div style={{ fontSize: 13, color: "rgba(245,241,232,0.5)", marginBottom: 24, maxWidth: 320, lineHeight: 1.6 }}>
            {this.state.error?.message || "Erreur inattendue"}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: "12px 24px", background: C.accent, border: "none",
              borderRadius: 12, color: C.s1, fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: FONT,
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
