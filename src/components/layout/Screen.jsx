import { C } from "../../data/constants.js";

export function Screen({ children, style }) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Inter',system-ui,sans-serif", color: C.text,
      ...style,
    }}>{children}</div>
  );
}
