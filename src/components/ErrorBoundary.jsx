import { Component } from "react";

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
          minHeight: "100vh", background: "#0B0F1F",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, flexDirection: "column", textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <div style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 18, fontWeight: 500, color: "#F5F1E8", marginBottom: 8,
          }}>
            Une erreur est survenue
          </div>
          <div style={{ fontSize: 12, color: "rgba(245,241,232,0.50)", marginBottom: 24, maxWidth: 320, lineHeight: 1.6 }}>
            {this.state.error?.message || "Erreur inattendue"}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: "12px 24px", background: "#4D8BFF", border: "none",
              borderRadius: 12, color: "#141A2E", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
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
