export function PageContainer({ children, style }) {
  return (
    <main style={{ maxWidth: 500, margin: "0 auto", paddingBottom: 72, ...style }}>
      {children}
    </main>
  );
}
