// ─── PAGE CONTAINER ─────────────────────────────────────────────────────────
// Conteneur central de contenu : largeur max mobile + espace pour la BottomNav.
// Remplace le <main> inline d'App.jsx.
//
// Usage:
//   <PageContainer>
//     <div key={tab} className="page-enter">...</div>
//   </PageContainer>

export function PageContainer({ children, style }) {
  return (
    <main style={{ maxWidth: 500, margin: "0 auto", paddingBottom: 72, ...style }}>
      {children}
    </main>
  );
}
