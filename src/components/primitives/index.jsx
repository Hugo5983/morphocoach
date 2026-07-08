// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT PRIMITIVES — MorphoCoach
// Composants de mise en page purs. Zéro logique métier, zéro état.
// Module séparé de ui/index.jsx pour éviter toute collision (Row y existe déjà
// avec une API différente). Le code migré importe depuis "primitives".
//
// Usage :
//   import { Stack, Row, Container, Section, Txt } from "../../components/primitives/index.jsx";
// ═══════════════════════════════════════════════════════════════════════════

import { SPACE, TYPE, C } from "../../styles/tokens.js";

// Résout un gap : accepte une clé de l'échelle ("md") ou un nombre (déconseillé)
const gapOf = (g) => (typeof g === "string" ? (SPACE[g] ?? SPACE.md) : (g ?? SPACE.md));

// ─── STACK — pile verticale avec gap automatique ─────────────────────────────
// Remplace les marginBottom en cascade : le parent gère l'espacement.
// <Stack gap="md"> <Card/> <Card/> </Stack>
export const Stack = ({ children, gap = "md", align, style, className, onClick }) => (
  <div onClick={onClick} className={className} style={{
    display: "flex", flexDirection: "column",
    gap: gapOf(gap),
    alignItems: align,
    ...style,
  }}>{children}</div>
);

// ─── ROW — ligne horizontale : alignement + gap + justify ────────────────────
// <Row gap="sm" justify="space-between"> ... </Row>
export const Row = ({ children, gap = "sm", align = "center", justify, wrap = false, style, className, onClick }) => (
  <div onClick={onClick} className={className} style={{
    display: "flex", flexDirection: "row",
    gap: gapOf(gap),
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? "wrap" : undefined,
    ...style,
  }}>{children}</div>
);

// ─── COLUMN — alias sémantique de Stack (colonne dans une Row) ───────────────
export const Column = ({ children, gap = "xs", align, flex, style, className }) => (
  <div className={className} style={{
    display: "flex", flexDirection: "column",
    gap: gapOf(gap),
    alignItems: align,
    flex,
    ...style,
  }}>{children}</div>
);

// ─── GRID — grille N colonnes (généralise G2) ────────────────────────────────
export const Grid = ({ children, cols = 2, gap = "sm", style, className }) => (
  <div className={className} style={{
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: gapOf(gap),
    ...style,
  }}>{children}</div>
);

// ─── CONTAINER — padding horizontal global + max-width + safe areas ──────────
// À utiliser DANS PageContainer pour le contenu des pages.
// Supprime les "padding: 0 16px" répétés partout.
export const Container = ({ children, style, className }) => (
  <div className={className} style={{
    paddingLeft:  `calc(${SPACE.lg}px + env(safe-area-inset-left, 0px))`,
    paddingRight: `calc(${SPACE.lg}px + env(safe-area-inset-right, 0px))`,
    maxWidth: 500,
    margin: "0 auto",
    width: "100%",
    ...style,
  }}>{children}</div>
);

// ─── SECTION — séparation visuelle standardisée entre blocs de page ──────────
// Remplace les marginTop/marginBottom aléatoires entre sections.
// <Section title="Records" action={<button…/>}> ... </Section>
export const Section = ({ children, title, eyebrow, action, gap = "md", style, className }) => (
  <section className={className} style={{ marginBottom: SPACE.xxl, ...style }}>
    {(title || eyebrow || action) && (
      <Row justify="space-between" style={{ marginBottom: SPACE.md }}>
        <Column gap={2}>
          {eyebrow && <span style={{ ...TYPE.micro, color: C.dim }}>{eyebrow}</span>}
          {title && <span style={{ ...TYPE.h3, color: C.text }}>{title}</span>}
        </Column>
        {action}
      </Row>
    )}
    <Stack gap={gap}>{children}</Stack>
  </section>
);

// ─── SPACER — respiration explicite quand un gap parent ne suffit pas ────────
export const Spacer = ({ size = "md" }) => (
  <div aria-hidden style={{ height: gapOf(size), flexShrink: 0 }} />
);

// ─── TXT — texte typé : impose la hiérarchie TYPE ────────────────────────────
// <Txt v="h2">Titre</Txt> · <Txt v="caption" color={C.dim}>méta</Txt>
export const Txt = ({ v = "body", color = C.text, children, style, className, as: Tag = "div", ...rest }) => (
  <Tag className={className} style={{ ...(TYPE[v] || TYPE.body), color, ...style }} {...rest}>
    {children}
  </Tag>
);
