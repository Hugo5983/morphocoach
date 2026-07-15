import { C, FONT } from"../../data/constants.js";

export function Screen({ children, style }) {
  return (
    <div style={{
      minHeight:"100vh", background: C.bg,
      fontFamily: FONT, color: C.text,
      ...style,
    }}>{children}</div>
);
}
