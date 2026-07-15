export function PageContainer({ children, style }) {
  return (
    <main style={{
      maxWidth: 500,
      margin:"0 auto",
      paddingBottom:"calc(70px + env(safe-area-inset-bottom, 0px))",
      ...style
    }}>
      {children}
    </main>
);
}
